const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const storageService = require('../services/storageService');
const ocrService = require('../services/ocrService');
const csvRegistryService = require('../services/csvRegistryService');
const store = require('../db/store');

// Memory storage for multer so we can directly pipe to Cloudinary and OCR
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// POST /api/kyc/upload - Upload file + Run OCR extraction
router.post('/upload', upload.single('document'), async (req, res) => {
  try {
    const file = req.file;
    const docType = req.body.docType || 'general'; // gst, udyam, address, signatory
    const leadId = req.body.leadId || '';

    if (!file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    console.log(`[KYC Upload] Received ${file.originalname} (${file.size} bytes) as ${docType}`);

    // 1. Upload to Cloudinary / Local
    const uploadResult = await storageService.uploadFile(file.buffer, file.originalname, file.mimetype);

    // 2. Run OCR Extraction
    const ocrResult = await ocrService.processDocumentOCR(file.buffer, docType, file.originalname);

    // 3. Save Record
    const kycRecord = await store.saveKYCRecord({
      leadId,
      docType,
      fileInfo: uploadResult,
      extractedData: ocrResult
    });

    res.json({
      success: true,
      fileInfo: uploadResult,
      extractedData: ocrResult,
      recordId: kycRecord._id
    });
  } catch (err) {
    console.error('[KYC Upload Error]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/kyc/verify - Compare extracted/edited data with CSV Registry
router.post('/verify', async (req, res) => {
  try {
    const {
      gstin,
      udyamNumber,
      businessName,
      address,
      signatoryName,
      corporateDocType,
      corporateDocName,
      gstAddress,
      leadId
    } = req.body;

    const verificationResult = csvRegistryService.verifyBusiness({
      gstin,
      udyamNumber,
      businessName,
      address,
      signatoryName,
      corporateDocType,
      corporateDocName,
      gstAddress
    });

    const savedRecord = await store.saveKYCRecord({
      leadId,
      submittedData: {
        gstin,
        udyamNumber,
        businessName,
        address,
        signatoryName,
        corporateDocType,
        corporateDocName
      },
      verificationResult
    });

    res.json({
      success: true,
      result: verificationResult,
      recordId: savedRecord._id
    });
  } catch (err) {
    console.error('[KYC Verify Error]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/kyc/specimens - list available specimen test documents (K01-K12)
router.get('/specimens', (req, res) => {
  try {
    const kycDir = path.resolve(__dirname, '..', '..', 'kyc_documents');
    if (!fs.existsSync(kycDir)) {
      return res.json({ success: true, specimens: [] });
    }

    const files = fs.readdirSync(kycDir).filter(f => f.endsWith('.png') || f.endsWith('.jpg'));
    const grouped = {};

    files.forEach(file => {
      const match = file.match(/^(K\d{2})_(.*)\.(png|jpg)$/i);
      if (match) {
        const id = match[1];
        const type = match[2];
        if (!grouped[id]) {
          grouped[id] = { id, files: {} };
        }
        grouped[id].files[type] = `/kyc_specimens/${file}`;
      }
    });

    res.json({
      success: true,
      specimens: Object.values(grouped),
      groundTruth: ocrService.SPECIMEN_METADATA
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/kyc/load-specimen - quickly auto-load a specimen (e.g. K01) for instant test
router.post('/load-specimen', async (req, res) => {
  try {
    const { specimenId } = req.body; // e.g. 'K01'
    const spec = ocrService.SPECIMEN_METADATA[specimenId];
    if (!spec) {
      return res.status(404).json({ success: false, error: 'Specimen not found' });
    }

    const kycDir = path.resolve(__dirname, '..', '..', 'kyc_documents');
    const gstFile = `${specimenId}_gst_certificate.png`;
    const udyamFile = `${specimenId}_udyam_certificate.png`;

    const fileInfos = {
      gst: { url: `/kyc_specimens/${gstFile}`, filename: gstFile, storageType: 'specimen' },
      udyam: { url: `/kyc_specimens/${udyamFile}`, filename: udyamFile, storageType: 'specimen' }
    };

    res.json({
      success: true,
      specimenId,
      extractedData: {
        gstin: spec.gstin,
        udyamNumber: spec.udyamNumber,
        businessName: spec.businessName,
        signatoryName: spec.signatoryName,
        address: spec.address,
        confidence: 96
      },
      fileInfos
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

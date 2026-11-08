const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');

// Clean extraneous characters from extracted field values
function cleanFieldVal(v) {
  if (!v) return '';
  return v
    .replace(/^[:\-\s,.]+/, '')
    .replace(/[,.]\s*$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Normalize common OCR character confusions in a 15-character GSTIN token
function normalizeGSTIN(token) {
  if (!token) return '';
  const clean = token.replace(/[^0-9A-Za-z]/g, '').toUpperCase();
  if (clean.length < 15) return '';

  const chars = clean.substring(0, 15).split('');

  // Positions 0-1: State Code (Digits)
  for (let i = 0; i <= 1; i++) {
    if (chars[i] === 'O' || chars[i] === 'Q') chars[i] = '0';
    else if (chars[i] === 'I' || chars[i] === 'L') chars[i] = '1';
    else if (chars[i] === 'Z') chars[i] = '2';
    else if (chars[i] === 'S') chars[i] = '5';
  }

  // Positions 2-6: PAN Alpha (5 Letters)
  for (let i = 2; i <= 6; i++) {
    if (chars[i] === '0') chars[i] = 'O';
    else if (chars[i] === '1') chars[i] = 'I';
    else if (chars[i] === '5') chars[i] = 'S';
    else if (chars[i] === '8') chars[i] = 'B';
  }

  // Positions 7-10: PAN Numeric (4 Digits)
  for (let i = 7; i <= 10; i++) {
    if (chars[i] === 'O' || chars[i] === 'Q') chars[i] = '0';
    else if (chars[i] === 'I' || chars[i] === 'L') chars[i] = '1';
    else if (chars[i] === 'Z') chars[i] = '2';
    else if (chars[i] === 'S') chars[i] = '5';
    else if (chars[i] === 'B') chars[i] = '8';
  }

  // Position 11: PAN Alpha (1 Letter)
  if (chars[11] === '0') chars[11] = 'O';
  else if (chars[11] === '1') chars[11] = 'I';

  // Position 13: Standard 'Z'
  if (chars[13] === '7' || chars[13] === '2') chars[13] = 'Z';

  const normalized = chars.join('');
  if (/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}[Z]{1}[A-Z0-9]{1}$/.test(normalized)) {
    return normalized;
  }
  return '';
}

// Strict GSTIN extraction from OCR text
function extractGSTIN(text) {
  if (!text) return '';

  // 1. Direct standard regex
  const strictM = text.match(/\b([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}[Z]{1}[A-Z0-9]{1})\b/i);
  if (strictM) return strictM[1].toUpperCase();

  // 2. Specific line starting with GSTIN
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  for (const line of lines) {
    const lineM = line.match(/^GSTIN\s*[:\-\s\t]+([0-9A-Za-z]{12,20})/i);
    if (lineM) {
      const norm = normalizeGSTIN(lineM[1]);
      if (norm) return norm;
    }
  }

  // 3. Scan 15-character words that match after OCR normalization
  const words = text.split(/\s+/);
  for (const w of words) {
    const clean = w.replace(/[^0-9A-Za-z]/g, '').toUpperCase();
    if (clean.length === 15) {
      const norm = normalizeGSTIN(clean);
      if (norm) return norm;
    }
  }

  return '';
}

// Strict Udyam registration number extraction
function extractUdyam(text) {
  if (!text) return '';
  const m = text.match(/UDYAM[\s\-_]*([A-Z]{2})[\s\-_]*([0-9O]{2})[\s\-_]*([0-9O]{7})/i);
  if (m) {
    const state = m[1].toUpperCase();
    const dist = m[2].replace(/O/gi, '0');
    const num = m[3].replace(/O/gi, '0');
    return `UDYAM-${state}-${dist}-${num}`;
  }
  return '';
}

// Extract physical address block from GST, Udyam, or Address Proof
function extractAddress(text) {
  if (!text) return '';
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  let addr = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('address proof for') || line.includes('Specimen:')) continue;

    // Line starting with Address header
    const m = line.match(/^(?:Supply\s*address|Address\s*(?:of\s*principal(?:\s*place\s*of\s*business)?)?|Principal\s*place\s*of\s*business|Premises|Registered\s*office)\s*[:\-]?\s*(.+)$/i);
    if (m && m[1]) {
      addr = m[1].replace(/^[:\-\s]+/, '').trim();
      // Concatenate wrapped continuation lines
      if (i + 1 < lines.length && !lines[i + 1].match(/^(?:Bill\s*date|Date|Units|Amount|Type|Consumer|Specimen|Accel|GSTIN|Legal|Trade|Constitution)/i)) {
        addr += ', ' + lines[i + 1].replace(/^place of business\s*/i, '').trim();
      }
      if (i + 2 < lines.length && !lines[i + 2].match(/^(?:Bill\s*date|Date|Units|Amount|Type|Consumer|Specimen|Accel|GSTIN|Legal|Trade|Constitution)/i)) {
        addr += ', ' + lines[i + 2].replace(/^place of business\s*/i, '').trim();
      }
      break;
    }
  }

  // Fallback: look for line containing Shop/Unit/Plot/Floor/Building
  if (!addr) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/^(?:Shop|Unit|Plot|Flat|Floor|Building)\b/i.test(line)) {
        addr = line;
        if (i + 1 < lines.length && !lines[i + 1].match(/^(?:Bill\s*date|Date|Units|Amount|Type|Consumer|Specimen|Accel|GSTIN|Legal|Trade|Constitution)/i)) {
          addr += ', ' + lines[i + 1].replace(/^place of business\s*/i, '').trim();
        }
        break;
      }
    }
  }

  return addr
    .replace(/\s+/g, ' ')
    .replace(/place of business\s*/gi, '')
    .replace(/\s*,\s*,/g, ',')
    .replace(/\s*-\s*/g, '-')
    .trim();
}

// Extract signatory details
function extractSignatory(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  let signatoryName = '';
  let signatoryRole = '';
  let businessName = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const mName = line.match(/^(?:Authorised\s*Signatory(?:\s*Name)?|Signatory\s*Name|Signatory|Name)\s*[:\-]\s*(.+)$/i);
    if (mName && mName[1] && !mName[1].includes('Authorised Signatory ID') && !mName[1].includes('Specimen')) {
      signatoryName = cleanFieldVal(mName[1]);
    } else if (/^Name$/i.test(line) && i + 1 < lines.length) {
      if (!lines[i + 1].includes('Specimen') && !lines[i + 1].includes('Authorised Signatory')) {
        signatoryName = cleanFieldVal(lines[i + 1]);
      }
    }

    const mRole = line.match(/^(?:Designation|Role|Capacity|Title)\s*[:\-]\s*(.+)$/i);
    if (mRole && mRole[1]) {
      signatoryRole = cleanFieldVal(mRole[1]);
    } else if (/^(?:Designation|Role)$/i.test(line) && i + 1 < lines.length) {
      signatoryRole = cleanFieldVal(lines[i + 1]);
    }

    const mBiz = line.match(/^(?:For\s*business|Business\s*Name|Enterprise\s*Name|Company\s*Name)\s*[:\-]?\s*(.+)$/i);
    if (mBiz && mBiz[1]) {
      businessName = cleanFieldVal(mBiz[1]);
    } else if (/^For\s*business$/i.test(line) && i + 1 < lines.length) {
      businessName = cleanFieldVal(lines[i + 1]);
    }
  }

  return { signatoryName, signatoryRole, businessName };
}

// Main OCR processing function without hardcoded fallbacks or simulated registry injection
async function processDocumentOCR(imageBufferOrPath, docType, filename = '') {
  let rawText = '';
  let confidence = 0;

  const isPdf = (filename && filename.toLowerCase().endsWith('.pdf')) ||
    (Buffer.isBuffer(imageBufferOrPath) && imageBufferOrPath.slice(0, 5).toString() === '%PDF-');

  if (isPdf) {
    try {
      const { PDFParse } = require('pdf-parse');
      const parser = new PDFParse(new Uint8Array(imageBufferOrPath));
      await parser.load();
      const res = await parser.getText();
      rawText = (res && res.text) ? res.text : '';
      confidence = rawText.trim().length > 10 ? 90 : 60;
    } catch (pdfErr) {
      console.warn(`[OCR] PDF parse error: ${pdfErr.message}`);
      confidence = 50;
    }
  } else {
    try {
      const result = await Tesseract.recognize(imageBufferOrPath, 'eng', {
        tessedit_pageseg_mode: 6,
        preserve_interword_spaces: '1'
      });
      rawText = result.data.text || '';
      confidence = result.data.confidence || 0;
    } catch (err) {
      console.warn(`[OCR] Tesseract error: ${err.message}`);
    }
  }

  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);

  const extracted = {
    docType,
    filename,
    rawText: rawText.trim(),
    confidence: Math.round(confidence),
    gstin: '',
    udyamNumber: '',
    legalName: '',
    tradeName: '',
    businessName: '',
    constitution: '',
    signatoryName: '',
    signatoryRole: '',
    address: '',
    date: '',
    isDocumentValid: false,
    missingFields: [],
    validationMessage: ''
  };

  const normalizedDocType = (docType || '').toLowerCase();

  // =========================================================================
  // DOCUMENT 1: GST REGISTRATION CERTIFICATE (PRIMARY)
  // =========================================================================
  if (normalizedDocType === 'gst') {
    extracted.gstin = extractGSTIN(rawText);

    // Extract Legal Name and Trade Name
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (!extracted.legalName) {
        const m = line.match(/^(?:Legal\s*name(?:\s*of\s*business)?)\s*[:\-]?\s*(.+)$/i);
        if (m && m[1]) extracted.legalName = cleanFieldVal(m[1]);
      }

      if (!extracted.tradeName) {
        const m = line.match(/^(?:Trade\s*name(?:\s*,\s*if\s*any)?)\s*[:\-]?\s*(.+)$/i);
        if (m && m[1]) extracted.tradeName = cleanFieldVal(m[1]);
      }

      if (!extracted.constitution) {
        const m = line.match(/^(?:Constitution(?:\s*of\s*business)?)\s*[:\-]?\s*(.+)$/i);
        if (m && m[1]) extracted.constitution = cleanFieldVal(m[1]);
      }
    }

    // Business Name: Trade Name takes precedence, then Legal Name
    extracted.businessName = extracted.tradeName || extracted.legalName;

    // Check if legal name contains sole proprietor name: e.g. "Joseph Singh (Prop. Ganesh Woodcraft)"
    if (extracted.legalName) {
      const propM = extracted.legalName.match(/^([^(]+)(?:\(Prop\.?\s*(.*)\))?/i);
      if (propM && propM[1]) {
        extracted.signatoryName = cleanFieldVal(propM[1]);
        if (propM[2] && !extracted.businessName) {
          extracted.businessName = cleanFieldVal(propM[2]);
        }
      }
    }

    // Extract address of principal place of business
    extracted.address = extractAddress(rawText);

    // Mandatory field check for GST Certificate
    const missing = [];
    if (!extracted.gstin) missing.push('GSTIN (15-character Tax ID)');
    if (!extracted.businessName) missing.push('Registered Business Name');
    if (!extracted.address) missing.push('Principal Place of Business Address');

    if (missing.length === 0) {
      extracted.isDocumentValid = true;
      extracted.validationMessage = `GST Certificate validated successfully. GSTIN: ${extracted.gstin}, Business: ${extracted.businessName}, Address: ${extracted.address}.`;
    } else {
      extracted.isDocumentValid = false;
      extracted.missingFields = missing;
      extracted.validationMessage = `This document is not a valid GST Certificate. Missing mandatory ${missing.join(', ')}. Please upload an official Form GST REG-06 Certificate.`;
    }

    return extracted;
  }

  // =========================================================================
  // DOCUMENT 2: MSME UDYAM CERTIFICATE
  // =========================================================================
  if (normalizedDocType === 'udyam') {
    extracted.udyamNumber = extractUdyam(rawText);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!extracted.businessName) {
        const m = line.match(/^(?:Enterprise\s*name|Name\s*of\s*enterprise)\s*[:\-]?\s*(.+)$/i);
        if (m && m[1]) extracted.businessName = cleanFieldVal(m[1]);
      }
    }

    extracted.address = extractAddress(rawText);

    const missing = [];
    if (!extracted.udyamNumber) missing.push('Udyam Registration Number (format: UDYAM-XX-00-0000000)');
    if (!extracted.businessName) missing.push('Enterprise Name');

    if (missing.length === 0) {
      extracted.isDocumentValid = true;
      extracted.validationMessage = `Udyam Certificate validated successfully. Udyam: ${extracted.udyamNumber}, Enterprise: ${extracted.businessName}.`;
    } else {
      extracted.isDocumentValid = false;
      extracted.missingFields = missing;
      extracted.validationMessage = `This document is not a valid Udyam Certificate. Missing mandatory ${missing.join(', ')}. Please upload your official Udyam Registration Certificate.`;
    }

    return extracted;
  }

  // =========================================================================
  // DOCUMENT 3: BUSINESS ADDRESS PROOF (UTILITY BILL / LEASE DEED)
  // =========================================================================
  if (normalizedDocType === 'address') {
    extracted.address = extractAddress(rawText);

    // Look for Billed To or Consumer Name
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const m = line.match(/^(?:Billed\s*to|Customer\s*name|Consumer\s*name)\s*[:\-]?\s*(.+)$/i);
      if (m && m[1]) {
        extracted.businessName = cleanFieldVal(m[1]);
        break;
      }
    }

    const hasRecognizableAddress = extracted.address && extracted.address.length >= 15 &&
      /(?:Shop|Unit|Plot|Floor|House|Flat|Building|Road|Street|Lines|Colony|Nagar|Area|Estate|[0-9]{6})/i.test(extracted.address);

    if (hasRecognizableAddress) {
      extracted.isDocumentValid = true;
      extracted.validationMessage = `Address proof validated successfully. Address: ${extracted.address}${extracted.businessName ? ` (Billed to: ${extracted.businessName})` : ''}.`;
    } else {
      extracted.isDocumentValid = false;
      extracted.missingFields = ['Readable Premise Address'];
      extracted.validationMessage = `This document is not a valid Address Proof. A clear premise or supply address could not be detected. Please upload an official utility bill or lease agreement.`;
    }

    return extracted;
  }

  // =========================================================================
  // DOCUMENT 4: SIGNATORY ID & CORPORATE LEGAL AUTHORITY
  // =========================================================================
  if (normalizedDocType === 'signatory') {
    const sig = extractSignatory(rawText);
    extracted.signatoryName = sig.signatoryName;
    extracted.signatoryRole = sig.signatoryRole || 'Authorized Signatory';
    if (sig.businessName) extracted.businessName = sig.businessName;

    if (extracted.signatoryName && extracted.signatoryName.length >= 3) {
      extracted.isDocumentValid = true;
      extracted.validationMessage = `Signatory identity validated successfully. Signatory: ${extracted.signatoryName}${extracted.signatoryRole ? ` (${extracted.signatoryRole})` : ''}.`;
    } else {
      extracted.isDocumentValid = false;
      extracted.missingFields = ['Authorized Signatory Name'];
      extracted.validationMessage = `This document is not a valid Signatory ID / Legal Authority document. Authorized signatory name could not be detected. Please upload a clear photo ID or corporate authorization document.`;
    }

    return extracted;
  }

  return extracted;
}

module.exports = {
  processDocumentOCR,
  extractGSTIN,
  extractUdyam,
  extractAddress,
  extractSignatory,
  cleanFieldVal
};

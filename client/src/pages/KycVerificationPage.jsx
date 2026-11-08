import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, Upload, FileCheck, AlertCircle, CheckCircle2,
  XCircle, ArrowRight, ArrowLeft, RefreshCw, FileText, PhoneCall,
  Edit3, Eye, Lock, Building2, ScanText, MapPin, Award, RotateCcw, Trash2
} from 'lucide-react';
import { kycAPI } from '../services/api';

export default function KycVerificationPage({
  businessProfile,
  setKycRecord,
  kycRecord
}) {
  const navigate = useNavigate();

  // Sub-step flow: 1 = User Consent, 2 = Upload Documents, 3 = Verify Business Details
  const [subStep, setSubStep] = useState(() => {
    if (kycRecord?.verificationResult?.overallStatus === 'VERIFIED') return 3;
    return 1;
  });

  // Document states
  const [consentChecked, setConsentChecked] = useState(() => {
    if (kycRecord?.verificationResult?.overallStatus === 'VERIFIED') return true;
    return false;
  });
  const [uploadingDoc, setUploadingDoc] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState({});

  // Document OCR validation states
  const [docErrors, setDocErrors] = useState({});
  const [docSuccess, setDocSuccess] = useState({});

  // Extracted Form Data
  const [extractedData, setFormData] = useState({
    gstin: '',
    udyamNumber: '',
    businessName: '',
    address: '',
    gstAddress: '',
    signatoryName: '',
    signatoryRole: '',
    corporateDocType: '',
    corporateDocName: '',
    confidence: 0
  });

  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(kycRecord?.verificationResult || null);
  const [manualVerified, setManualVerified] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);

  // Upload handler for custom file with immediate OCR and mandatory field check
  const handleFileUpload = async (e, docType) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input event value so re-uploading the same file triggers onChange
    e.target.value = '';

    // Enforce rule: GST Certificate must be uploaded first
    if (docType !== 'gst' && !uploadedFiles.gst) {
      alert('Please upload your official GST Registration Certificate first before attaching secondary documents.');
      return;
    }

    setUploadingDoc(docType);
    setVerificationResult(null);

    const form = new FormData();
    form.append('document', file);
    form.append('docType', docType);
    form.append('leadId', businessProfile?.leadId || '');

    try {
      const res = await kycAPI.uploadDocument(form);
      if (res.data?.success) {
        const fileInfo = res.data.fileInfo;
        const ocr = res.data.extractedData || {};

        if (ocr.isDocumentValid === false) {
          const errMsg = ocr.validationMessage || 
            `This document is not valid for ${docType.toUpperCase()}. Mandatory fields could not be detected.`;
          
          setDocErrors(prev => ({ ...prev, [docType]: errMsg }));
          setDocSuccess(prev => {
            const next = { ...prev };
            delete next[docType];
            return next;
          });
          // Do NOT mark as uploaded if validation failed
          setUploadedFiles(prev => {
            const next = { ...prev };
            delete next[docType];
            return next;
          });
        } else {
          // Document passed pre-check! Mark as uploaded
          setUploadedFiles(prev => ({
            ...prev,
            [docType]: fileInfo
          }));

          const successMsg = ocr.validationMessage || `Document details validated successfully.`;
          setDocSuccess(prev => ({ ...prev, [docType]: successMsg }));
          setDocErrors(prev => {
            const next = { ...prev };
            delete next[docType];
            return next;
          });

          setFormData(prev => ({
            ...prev,
            gstin: docType === 'gst' ? (ocr.gstin || prev.gstin) : prev.gstin,
            udyamNumber: docType === 'udyam' ? (ocr.udyamNumber || prev.udyamNumber) : prev.udyamNumber,
            businessName: docType === 'gst' ? (ocr.businessName || prev.businessName) : (prev.businessName || ocr.businessName),
            address: docType === 'address' ? (ocr.address || prev.address) : (prev.address || ocr.address),
            gstAddress: docType === 'gst' ? (ocr.address || prev.gstAddress) : prev.gstAddress,
            signatoryName: docType === 'signatory' ? (ocr.signatoryName || prev.signatoryName) : (docType === 'gst' ? (ocr.signatoryName || prev.signatoryName) : prev.signatoryName),
            signatoryRole: docType === 'signatory' ? (ocr.signatoryRole || prev.signatoryRole) : prev.signatoryRole,
            corporateDocType: prev.corporateDocType || (ocr.constitution === 'Proprietorship' ? 'Sole Proprietor Declaration' : ocr.constitution?.includes('Partnership') ? 'Partnership Deed' : 'Board Resolution'),
            confidence: ocr.confidence || prev.confidence
          }));
        }
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || err.message || 'Error uploading document';
      setDocErrors(prev => ({ ...prev, [docType]: errMsg }));
      setUploadedFiles(prev => {
        const next = { ...prev };
        delete next[docType];
        return next;
      });
    } finally {
      setUploadingDoc(null);
    }
  };

  // Remove uploaded document and reset relevant extracted values
  const handleRemoveDoc = (docType) => {
    setUploadedFiles(prev => {
      const next = { ...prev };
      delete next[docType];
      return next;
    });

    setDocErrors(prev => {
      const next = { ...prev };
      delete next[docType];
      return next;
    });

    setDocSuccess(prev => {
      const next = { ...prev };
      delete next[docType];
      return next;
    });

    setVerificationResult(null);

    setFormData(prev => {
      const next = { ...prev };
      if (docType === 'gst') {
        next.gstin = '';
        next.gstAddress = '';
        if (!uploadedFiles.udyam) next.businessName = '';
      } else if (docType === 'udyam') {
        next.udyamNumber = '';
        if (!uploadedFiles.gst) next.businessName = '';
      } else if (docType === 'address') {
        next.address = '';
      } else if (docType === 'signatory') {
        next.signatoryName = '';
        next.corporateDocName = '';
      }
      return next;
    });
  };

  // Run Matching against CSV Registry with verified data
  const handleVerify = async () => {
    if (!consentChecked) {
      alert('Please accept the customer consent and privacy declaration.');
      return;
    }

    const hasStatutoryId = !!(extractedData.gstin || extractedData.udyamNumber);
    const hasBusinessName = !!extractedData.businessName;

    if (!hasStatutoryId && Object.keys(uploadedFiles).length === 0) {
      alert('Please upload your official GST or Udyam Certificate first before verifying.');
      return;
    }

    if (!hasStatutoryId) {
      alert('Mandatory statutory identifier missing: Document must contain a valid GSTIN or Udyam Number.');
      return;
    }

    if (!hasBusinessName) {
      alert('Mandatory business name missing: Please ensure the certificate displays your registered business name.');
      return;
    }

    setIsVerifying(true);
    try {
      const res = await kycAPI.verify({
        gstin: extractedData.gstin,
        udyamNumber: extractedData.udyamNumber,
        businessName: extractedData.businessName,
        address: extractedData.address,
        gstAddress: extractedData.gstAddress || extractedData.address,
        signatoryName: extractedData.signatoryName,
        corporateDocType: extractedData.corporateDocType,
        corporateDocName: extractedData.corporateDocName,
        leadId: businessProfile?.leadId
      });

      if (res.data?.result) {
        setVerificationResult(res.data.result);
        if (setKycRecord) {
          setKycRecord({
            recordId: res.data.recordId,
            verificationResult: res.data.result,
            extractedData
          });
        }
      }
    } catch (err) {
      alert('Verification error: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsVerifying(false);
    }
  };

  const isVerified = verificationResult?.overallStatus === 'VERIFIED' || manualVerified;
  const hasUploadedDocs = Object.keys(uploadedFiles).length > 0;
  const uploadedCount = [uploadedFiles.gst, uploadedFiles.udyam, uploadedFiles.address, uploadedFiles.signatory].filter(Boolean).length;
  const hasValidExtractedData = !!((extractedData.gstin || extractedData.udyamNumber) && extractedData.businessName);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Top Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF2020] mb-1 font-mono">
          <ShieldCheck className="w-4 h-4 text-[#FF2020]" />
          STEP 4: BUSINESS KYC VERIFICATION
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Business KYC Verification
        </h1>
        <p className="text-xs sm:text-sm text-[#B5B5B5] mt-1 leading-relaxed">
          Complete the 3-step verification to validate your enterprise identity against official statutory registries.
        </p>
      </div>

      {/* Internal Sub-Step Progress Indicator (Clean 3-Step Flow) */}
      <div className="bg-[#111111] rounded-2xl border border-white/12 p-4 mb-8 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between text-xs">
          {/* Sub-step 1: User Consent */}
          <button
            type="button"
            onClick={() => setSubStep(1)}
            className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer"
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                subStep === 1
                  ? 'bg-[#E60000] text-white shadow-[0_0_8px_rgba(230,0,0,0.8)]'
                  : consentChecked
                  ? 'bg-emerald-600 text-white'
                  : 'bg-zinc-800 text-zinc-500'
              }`}
            >
              {consentChecked && subStep !== 1 ? '✓' : '1'}
            </span>
            <span className={`font-semibold hidden sm:inline transition-colors ${subStep === 1 ? 'text-white font-bold' : 'text-[#B5B5B5] group-hover:text-white'}`}>
              1. Consent & Declaration
            </span>
            <span className={`font-semibold sm:hidden ${subStep === 1 ? 'text-white font-bold' : 'text-[#B5B5B5]'}`}>
              1. Consent
            </span>
          </button>

          <div className="h-0.5 flex-1 mx-3 sm:mx-4 bg-white/10">
            <div
              className={`h-full bg-[#E60000] shadow-[0_0_8px_rgba(230,0,0,0.8)] transition-all duration-300 ${
                subStep >= 2 ? 'w-full' : 'w-0'
              }`}
            />
          </div>

          {/* Sub-step 2: Document Upload */}
          <button
            type="button"
            onClick={() => {
              if (consentChecked) setSubStep(2);
            }}
            disabled={!consentChecked}
            className={`flex items-center gap-2.5 text-left focus:outline-none group transition-all ${
              !consentChecked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                subStep === 2
                  ? 'bg-[#E60000] text-white shadow-[0_0_8px_rgba(230,0,0,0.8)]'
                  : hasUploadedDocs
                  ? 'bg-emerald-600 text-white'
                  : 'bg-zinc-800 text-zinc-500'
              }`}
            >
              {hasUploadedDocs && subStep > 2 ? '✓' : '2'}
            </span>
            <span className={`font-semibold hidden sm:inline transition-colors ${subStep === 2 ? 'text-white font-bold' : 'text-[#B5B5B5] group-hover:text-white'}`}>
              2. Upload Documents
            </span>
            <span className={`font-semibold sm:hidden ${subStep === 2 ? 'text-white font-bold' : 'text-[#B5B5B5]'}`}>
              2. Documents
            </span>
          </button>

          <div className="h-0.5 flex-1 mx-3 sm:mx-4 bg-white/10">
            <div
              className={`h-full bg-[#E60000] shadow-[0_0_8px_rgba(230,0,0,0.8)] transition-all duration-300 ${
                subStep === 3 ? 'w-full' : 'w-0'
              }`}
            />
          </div>

          {/* Sub-step 3: Verify Business Details */}
          <button
            type="button"
            onClick={() => {
              if (consentChecked && hasUploadedDocs) setSubStep(3);
            }}
            disabled={!consentChecked || !hasUploadedDocs}
            className={`flex items-center gap-2.5 text-left focus:outline-none group transition-all ${
              !consentChecked || !hasUploadedDocs ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                subStep === 3
                  ? 'bg-[#E60000] text-white shadow-[0_0_8px_rgba(230,0,0,0.8)]'
                  : isVerified
                  ? 'bg-emerald-600 text-white'
                  : 'bg-zinc-800 text-zinc-500'
              }`}
            >
              {isVerified ? '✓' : '3'}
            </span>
            <span className={`font-semibold hidden sm:inline transition-colors ${subStep === 3 ? 'text-white font-bold' : 'text-[#B5B5B5] group-hover:text-white'}`}>
              3. Verify Business Details
            </span>
            <span className={`font-semibold sm:hidden ${subStep === 3 ? 'text-white font-bold' : 'text-[#B5B5B5]'}`}>
              3. Verify
            </span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* SUB-STEP 1: USER CONSENT & PRIVACY DECLARATION                */}
      {/* ============================================================== */}
      {subStep === 1 && (
        <div className="bg-[#111111] rounded-3xl border border-white/12 p-6 sm:p-8 shadow-2xl space-y-6 animate-fade-in">
          <div className="border-b border-white/10 pb-5">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-[#FF2020] mb-1">
              <Lock className="w-4 h-4" />
              SUBPAGE 1 OF 3: STATUTORY CONSENT & DECLARATION
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Customer Consent & Identity Verification Agreement
            </h2>
            <p className="text-xs sm:text-sm text-[#B5B5B5] mt-1 leading-relaxed">
              In accordance with Indian Digital Personal Data Protection regulations and statutory business verification guidelines, please review and provide your authorization to proceed.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#161616] p-4 rounded-2xl border border-white/10 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-red-950/40 border border-red-500/20 flex items-center justify-center text-[#FF2020]">
                <Building2 className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Statutory Registry Check
              </h4>
              <p className="text-xs text-[#B5B5B5] leading-relaxed">
                Authorizes cross-referencing your GSTIN and MSME Udyam credentials with government registries to confirm active business standing.
              </p>
            </div>

            <div className="bg-[#161616] p-4 rounded-2xl border border-white/10 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-red-950/40 border border-red-500/20 flex items-center justify-center text-[#FF2020]">
                <MapPin className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Address Cross-Matching
              </h4>
              <p className="text-xs text-[#B5B5B5] leading-relaxed">
                Validates your uploaded utility bill or lease agreement against official city, state, and postal code records on file.
              </p>
            </div>

            <div className="bg-[#161616] p-4 rounded-2xl border border-white/10 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-red-950/40 border border-red-500/20 flex items-center justify-center text-[#FF2020]">
                <Award className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Signatory Legal Authority
              </h4>
              <p className="text-xs text-[#B5B5B5] leading-relaxed">
                Confirms that the designated signatory possesses verified corporate authority under a Board Resolution, Partnership Deed, or Sole Proprietor declaration.
              </p>
            </div>
          </div>

          {/* Consent Checkbox */}
          <div className="p-5 bg-[#161616] rounded-2xl border border-white/15 space-y-3">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="kyc-consent-step1"
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
                className="mt-1 w-5 h-5 rounded text-[#E60000] focus:ring-[#FF2020] bg-black border-white/20 cursor-pointer"
              />
              <label htmlFor="kyc-consent-step1" className="text-xs sm:text-sm text-zinc-300 leading-relaxed cursor-pointer select-none">
                <strong className="text-white block font-semibold mb-0.5">
                  Customer Consent & Statutory Privacy Declaration:
                </strong>
                I hereby declare that I am the authorized representative of this enterprise. I authorize Airtel Business to verify the submitted business certificates, address proof, and signatory authority documents against official statutory records (GST & MSME registries) in full compliance with applicable Indian data privacy regulations.
              </label>
            </div>
          </div>

          {/* Proceed Button */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-[11px] text-[#808080]">
              {consentChecked ? (
                <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Consent accepted. You can proceed to upload documents.
                </span>
              ) : (
                <span>Please select the checkbox above to grant consent.</span>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                if (consentChecked) {
                  setSubStep(2);
                }
              }}
              disabled={!consentChecked}
              className="px-6 py-3.5 bg-[#E60000] hover:bg-[#FF2020] text-white rounded-xl text-xs font-bold shadow-[0_0_20px_rgba(230,0,0,0.5)] flex items-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Agree & Proceed to Document Upload</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB-STEP 2: UPLOAD 4 DOCUMENTS & OCR CROSS-VERIFICATION       */}
      {/* ============================================================== */}
      {subStep === 2 && (
        <div className="space-y-6 animate-fade-in">
          {/* 4 DOCUMENT UPLOAD TILES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. GST Certificate (Primary) */}
            <div className="bg-[#111111] rounded-3xl border border-white/12 p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#FF2020] bg-red-950/60 border border-red-500/30 px-2 py-0.5 rounded">
                  Step 1 (Primary): GST Certificate *
                </span>
                {uploadedFiles.gst && (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Uploaded
                    </span>
                    {uploadedFiles.gst.url && (
                      <a
                        href={uploadedFiles.gst.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-bold text-zinc-300 hover:text-white bg-white/5 px-2 py-0.5 rounded border border-white/15 flex items-center gap-1 transition-colors font-mono"
                      >
                        <Eye className="w-3 h-3 text-zinc-400" />
                        <span>View Document</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
              <p className="text-xs text-[#B5B5B5]">
                Upload your GST Registration Certificate showing your 15-character GSTIN, legal business name, and registered premise address.
              </p>

              {uploadingDoc === 'gst' ? (
                <div className="border border-white/15 rounded-2xl p-4 text-center bg-[#161616]">
                  <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#FF2020] py-2 font-mono">
                    <RefreshCw className="w-4 h-4 animate-spin" /> Uploading & reading document details...
                  </div>
                </div>
              ) : uploadedFiles.gst ? (
                <div className="border border-emerald-500/40 bg-emerald-950/20 rounded-2xl p-4 text-center space-y-3 animate-fade-in">
                  <div className="flex items-center justify-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div className="text-left overflow-hidden">
                      <p className="text-xs font-bold text-white truncate max-w-[200px] sm:max-w-xs" title={uploadedFiles.gst.filename}>
                        {uploadedFiles.gst.filename}
                      </p>
                      <span className="text-[10px] text-emerald-400 font-mono">
                        ✓ Document Scanned & Details Read
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 pt-2 border-t border-white/10">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-zinc-200 hover:text-white border border-white/15 transition-all">
                      <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Re-upload</span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'gst')}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => handleRemoveDoc('gst')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/30 hover:bg-red-950/60 text-xs font-semibold text-rose-300 hover:text-rose-200 border border-red-500/30 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ) : (
                <label className="border-2 border-dashed border-white/15 hover:border-red-500/50 bg-[#161616] hover:bg-[#1a1a1a] rounded-2xl p-4 text-center cursor-pointer block transition-all">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'gst')}
                  />
                  <div className="flex flex-col items-center gap-1.5">
                    <Upload className="w-5 h-5 text-zinc-400" />
                    <span className="text-xs font-semibold text-white">
                      Upload GST Certificate (PDF / PNG / JPG)
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      Click to browse or drop file
                    </span>
                  </div>
                </label>
              )}

              {docErrors.gst && (
                <div className="p-3 bg-red-950/30 border border-red-500/40 rounded-xl flex items-start gap-2.5 text-xs text-rose-300 animate-fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Document Error</strong>
                    <span>{docErrors.gst}</span>
                  </div>
                </div>
              )}

              {docSuccess.gst && (
                <div className="p-3 bg-emerald-950/30 border border-emerald-500/40 rounded-xl flex items-start gap-2.5 text-xs text-emerald-300 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Details Verified</strong>
                    <span>{docSuccess.gst}</span>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Udyam Certificate */}
            <div className="bg-[#111111] rounded-3xl border border-white/12 p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                  Step 2: Udyam Certificate
                </span>
                {uploadedFiles.udyam && (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Uploaded
                    </span>
                    {uploadedFiles.udyam.url && (
                      <a
                        href={uploadedFiles.udyam.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-bold text-zinc-300 hover:text-white bg-white/5 px-2 py-0.5 rounded border border-white/15 flex items-center gap-1 transition-colors font-mono"
                      >
                        <Eye className="w-3 h-3 text-zinc-400" />
                        <span>View Document</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
              <p className="text-xs text-[#B5B5B5]">
                Upload your MSME Udyam Certificate showing your Udyam Registration Number and enterprise name.
              </p>

              {uploadingDoc === 'udyam' ? (
                <div className="border border-white/15 rounded-2xl p-4 text-center bg-[#161616]">
                  <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#FF2020] py-2 font-mono">
                    <RefreshCw className="w-4 h-4 animate-spin" /> Uploading & reading document details...
                  </div>
                </div>
              ) : uploadedFiles.udyam ? (
                <div className="border border-emerald-500/40 bg-emerald-950/20 rounded-2xl p-4 text-center space-y-3 animate-fade-in">
                  <div className="flex items-center justify-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div className="text-left overflow-hidden">
                      <p className="text-xs font-bold text-white truncate max-w-[200px] sm:max-w-xs" title={uploadedFiles.udyam.filename}>
                        {uploadedFiles.udyam.filename}
                      </p>
                      <span className="text-[10px] text-emerald-400 font-mono">
                        ✓ Document Scanned & Details Read
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 pt-2 border-t border-white/10">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-zinc-200 hover:text-white border border-white/15 transition-all">
                      <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Re-upload</span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'udyam')}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => handleRemoveDoc('udyam')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/30 hover:bg-red-950/60 text-xs font-semibold text-rose-300 hover:text-rose-200 border border-red-500/30 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ) : !uploadedFiles.gst ? (
                <div
                  onClick={() => alert('Please upload your official GST Certificate in Step 1 first.')}
                  className="border-2 border-dashed border-white/10 bg-[#141414] rounded-2xl p-4 text-center cursor-pointer opacity-70 hover:opacity-100 transition-all"
                >
                  <div className="flex flex-col items-center gap-1.5">
                    <Lock className="w-5 h-5 text-zinc-500" />
                    <span className="text-xs font-semibold text-zinc-400">
                      Upload GST Certificate First (Step 1)
                    </span>
                    <span className="text-[10px] text-zinc-600">
                      Requires primary GST verification before secondary certificates
                    </span>
                  </div>
                </div>
              ) : (
                <label className="border-2 border-dashed border-white/15 hover:border-red-500/50 bg-[#161616] hover:bg-[#1a1a1a] rounded-2xl p-4 text-center cursor-pointer block transition-all">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'udyam')}
                  />
                  <div className="flex flex-col items-center gap-1.5">
                    <Upload className="w-5 h-5 text-zinc-400" />
                    <span className="text-xs font-semibold text-white">
                      Upload Udyam Certificate (PDF / PNG / JPG)
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      Click to browse or drop file
                    </span>
                  </div>
                </label>
              )}

              {docErrors.udyam && (
                <div className="p-3 bg-red-950/30 border border-red-500/40 rounded-xl flex items-start gap-2.5 text-xs text-rose-300 animate-fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Document Error</strong>
                    <span>{docErrors.udyam}</span>
                  </div>
                </div>
              )}

              {docSuccess.udyam && (
                <div className="p-3 bg-emerald-950/30 border border-emerald-500/40 rounded-xl flex items-start gap-2.5 text-xs text-emerald-300 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Details Verified</strong>
                    <span>{docSuccess.udyam}</span>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Address Proof */}
            <div className="bg-[#111111] rounded-3xl border border-white/12 p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                  Step 3: Business Address Proof
                </span>
                {uploadedFiles.address && (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Attached
                    </span>
                    {uploadedFiles.address.url && (
                      <a
                        href={uploadedFiles.address.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-bold text-zinc-300 hover:text-white bg-white/5 px-2 py-0.5 rounded border border-white/15 flex items-center gap-1 transition-colors font-mono"
                      >
                        <Eye className="w-3 h-3 text-zinc-400" />
                        <span>View Document</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
              <p className="text-xs text-[#B5B5B5]">
                Utility bill or lease agreement. Location is cross-matched against your GST Certificate registered address.
              </p>

              {uploadingDoc === 'address' ? (
                <div className="border border-white/15 rounded-2xl p-4 text-center bg-[#161616]">
                  <div className="flex items-center justify-center gap-2 text-xs font-semibold text-zinc-300 py-2 font-mono">
                    <RefreshCw className="w-4 h-4 animate-spin" /> Uploading & reading address...
                  </div>
                </div>
              ) : uploadedFiles.address ? (
                <div className="border border-emerald-500/40 bg-emerald-950/20 rounded-2xl p-4 text-center space-y-3 animate-fade-in">
                  <div className="flex items-center justify-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div className="text-left overflow-hidden">
                      <p className="text-xs font-bold text-white truncate max-w-[200px] sm:max-w-xs" title={uploadedFiles.address.filename}>
                        {uploadedFiles.address.filename}
                      </p>
                      <span className="text-[10px] text-emerald-400 font-mono">
                        ✓ Address Proof Attached
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 pt-2 border-t border-white/10">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-zinc-200 hover:text-white border border-white/15 transition-all">
                      <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Re-upload</span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'address')}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => handleRemoveDoc('address')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/30 hover:bg-red-950/60 text-xs font-semibold text-rose-300 hover:text-rose-200 border border-red-500/30 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ) : !uploadedFiles.gst ? (
                <div
                  onClick={() => alert('Please upload your official GST Certificate in Step 1 first.')}
                  className="border-2 border-dashed border-white/10 bg-[#141414] rounded-2xl p-4 text-center cursor-pointer opacity-70 hover:opacity-100 transition-all"
                >
                  <div className="flex flex-col items-center gap-1.5">
                    <Lock className="w-5 h-5 text-zinc-500" />
                    <span className="text-xs font-semibold text-zinc-400">
                      Upload GST Certificate First (Step 1)
                    </span>
                    <span className="text-[10px] text-zinc-600">
                      Address proof is matched directly against the GST certificate
                    </span>
                  </div>
                </div>
              ) : (
                <label className="border-2 border-dashed border-white/15 hover:border-red-500/40 rounded-2xl p-4 text-center cursor-pointer block transition-all bg-[#161616] hover:bg-[#1a1a1a]">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'address')}
                  />
                  <div className="flex flex-col items-center gap-1.5">
                    <Upload className="w-5 h-5 text-zinc-400" />
                    <span className="text-xs font-semibold text-white">
                      Upload Address Proof (PDF / PNG / JPG)
                    </span>
                    <span className="text-[10px] text-zinc-500">Electricity / Telephone bill / Lease</span>
                  </div>
                </label>
              )}

              {docErrors.address && (
                <div className="p-3 bg-red-950/30 border border-red-500/40 rounded-xl flex items-start gap-2.5 text-xs text-rose-300 animate-fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Document Error</strong>
                    <span>{docErrors.address}</span>
                  </div>
                </div>
              )}

              {docSuccess.address && (
                <div className="p-3 bg-emerald-950/30 border border-emerald-500/40 rounded-xl flex items-start gap-2.5 text-xs text-emerald-300 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Details Verified</strong>
                    <span>{docSuccess.address}</span>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Signatory ID & Corporate Authority */}
            <div className="bg-[#111111] rounded-3xl border border-white/12 p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                  Step 4: Signatory ID & Authority
                </span>
                {uploadedFiles.signatory && (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Attached
                    </span>
                    {uploadedFiles.signatory.url && (
                      <a
                        href={uploadedFiles.signatory.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-bold text-zinc-300 hover:text-white bg-white/5 px-2 py-0.5 rounded border border-white/15 flex items-center gap-1 transition-colors font-mono"
                      >
                        <Eye className="w-3 h-3 text-zinc-400" />
                        <span>View Document</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
              <p className="text-xs text-[#B5B5B5]">
                Signatory ID (PAN/Passport) or corporate authority document (Board Resolution / Partnership Deed).
              </p>

              {uploadingDoc === 'signatory' ? (
                <div className="border border-white/15 rounded-2xl p-4 text-center bg-[#161616]">
                  <div className="flex items-center justify-center gap-2 text-xs font-semibold text-zinc-300 py-2 font-mono">
                    <RefreshCw className="w-4 h-4 animate-spin" /> Uploading & checking authority...
                  </div>
                </div>
              ) : uploadedFiles.signatory ? (
                <div className="border border-emerald-500/40 bg-emerald-950/20 rounded-2xl p-4 text-center space-y-3 animate-fade-in">
                  <div className="flex items-center justify-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div className="text-left overflow-hidden">
                      <p className="text-xs font-bold text-white truncate max-w-[200px] sm:max-w-xs" title={uploadedFiles.signatory.filename}>
                        {uploadedFiles.signatory.filename}
                      </p>
                      <span className="text-[10px] text-emerald-400 font-mono">
                        ✓ Authority Document Attached
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 pt-2 border-t border-white/10">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-zinc-200 hover:text-white border border-white/15 transition-all">
                      <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Re-upload</span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'signatory')}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => handleRemoveDoc('signatory')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/30 hover:bg-red-950/60 text-xs font-semibold text-rose-300 hover:text-rose-200 border border-red-500/30 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ) : !uploadedFiles.gst ? (
                <div
                  onClick={() => alert('Please upload your official GST Certificate in Step 1 first.')}
                  className="border-2 border-dashed border-white/10 bg-[#141414] rounded-2xl p-4 text-center cursor-pointer opacity-70 hover:opacity-100 transition-all"
                >
                  <div className="flex flex-col items-center gap-1.5">
                    <Lock className="w-5 h-5 text-zinc-500" />
                    <span className="text-xs font-semibold text-zinc-400">
                      Upload GST Certificate First (Step 1)
                    </span>
                    <span className="text-[10px] text-zinc-600">
                      Signatory authority is confirmed against the registered business constitution
                    </span>
                  </div>
                </div>
              ) : (
                <label className="border-2 border-dashed border-white/15 hover:border-red-500/40 rounded-2xl p-4 text-center cursor-pointer block transition-all bg-[#161616] hover:bg-[#1a1a1a]">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'signatory')}
                  />
                  <div className="flex flex-col items-center gap-1.5">
                    <Upload className="w-5 h-5 text-zinc-400" />
                    <span className="text-xs font-semibold text-white">
                      Upload Signatory ID / Authority Doc (PDF / PNG / JPG)
                    </span>
                    <span className="text-[10px] text-zinc-500">ID proof or Board Resolution / Partnership Deed</span>
                  </div>
                </label>
              )}

              {docErrors.signatory && (
                <div className="p-3 bg-red-950/30 border border-red-500/40 rounded-xl flex items-start gap-2.5 text-xs text-rose-300 animate-fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Document Error</strong>
                    <span>{docErrors.signatory}</span>
                  </div>
                </div>
              )}

              {docSuccess.signatory && (
                <div className="p-3 bg-emerald-950/30 border border-emerald-500/40 rounded-xl flex items-start gap-2.5 text-xs text-emerald-300 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Details Verified</strong>
                    <span>{docSuccess.signatory}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sub-step 2 Navigation */}
          <div className="bg-[#111111] rounded-2xl border border-white/12 p-4 sm:p-5 flex items-center justify-between shadow-xl">
            <button
              type="button"
              onClick={() => setSubStep(1)}
              className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-zinc-300 hover:text-white border border-white/10 flex items-center gap-2 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Consent</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (uploadedFiles.gst) {
                  setSubStep(3);
                } else {
                  alert('Please upload your official GST Certificate in Step 1 first before proceeding to verification.');
                }
              }}
              disabled={!uploadedFiles.gst}
              className="px-6 py-3.5 bg-[#E60000] hover:bg-[#FF2020] text-white rounded-xl text-xs font-bold shadow-[0_0_20px_rgba(230,0,0,0.5)] flex items-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>Continue to Verify Business Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SUB-STEP 3: VERIFY BUSINESS DETAILS AGAINST REGISTRY           */}
      {/* ============================================================== */}
      {subStep === 3 && (
        <div className="space-y-6 animate-fade-in">
          {/* Header */}
          <div className="bg-[#111111] rounded-2xl border border-white/12 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-[#FF2020]">
                <Edit3 className="w-4 h-4" />
                SUBPAGE 3 OF 3: VERIFY BUSINESS DETAILS AGAINST REGISTRY
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                Review & Confirm Business Information
              </h2>
              <p className="text-xs text-[#B5B5B5] mt-0.5">
                Review the details detected from your documents and verify them against official GST and MSME registries.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSubStep(2)}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-zinc-300 hover:text-white border border-white/10 flex items-center gap-1.5 transition-all self-start sm:self-center cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Modify Documents</span>
            </button>
          </div>

          {/* VERIFIED DETAILS REVIEW FORM */}
          <div className="bg-[#111111] rounded-3xl border border-white/12 p-6 sm:p-7 shadow-2xl space-y-6">
            <div className="pb-4 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2 font-mono">
                  <ShieldCheck className="w-4 h-4 text-[#FF2020]" />
                  BUSINESS REGISTRY FORM
                </h3>
                <p className="text-xs text-[#B5B5B5] mt-0.5">
                  Confirm the fields extracted from your documents prior to registry matching.
                </p>
              </div>
            </div>

            {!hasUploadedDocs && !extractedData.gstin && !extractedData.udyamNumber ? (
              <div className="p-8 text-center bg-[#141414] border border-white/10 rounded-2xl space-y-2">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-2">
                  <ScanText className="w-6 h-6 text-zinc-400" />
                </div>
                <h4 className="text-sm font-bold text-white">Awaiting Certificate Upload</h4>
                <p className="text-xs text-[#B5B5B5] max-w-sm mx-auto leading-relaxed">
                  Please upload your official GST Certificate or Udyam Certificate in Step 2. We will automatically detect your business name and registration numbers.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setSubStep(2)}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold"
                  >
                    Go to Step 2: Upload Documents
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center justify-between font-mono">
                    <span>GSTIN (GST Number) *</span>
                    {extractedData.gstin && <span className="text-[10px] font-normal text-emerald-400 font-mono">✓ Detected</span>}
                  </label>
                  <input
                    type="text"
                    value={extractedData.gstin}
                    onChange={(e) => setFormData(p => ({ ...p, gstin: e.target.value.toUpperCase() }))}
                    className="w-full px-3.5 py-2.5 bg-[#161616] border border-white/15 rounded-xl text-xs font-mono font-bold tracking-wider text-white focus:border-[#E60000] focus:ring-1 focus:ring-[#FF2020] outline-none"
                    placeholder="e.g. 32TTNXB7384T1ZW"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center justify-between font-mono">
                    <span>Udyam Registration Number</span>
                    {extractedData.udyamNumber && <span className="text-[10px] font-normal text-emerald-400 font-mono">✓ Detected</span>}
                  </label>
                  <input
                    type="text"
                    value={extractedData.udyamNumber}
                    onChange={(e) => setFormData(p => ({ ...p, udyamNumber: e.target.value.toUpperCase() }))}
                    className="w-full px-3.5 py-2.5 bg-[#161616] border border-white/15 rounded-xl text-xs font-mono font-bold tracking-wider text-white focus:border-[#E60000] focus:ring-1 focus:ring-[#FF2020] outline-none"
                    placeholder="e.g. UDYAM-KL-00-3078801"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5 flex items-center justify-between font-mono">
                    <span>Registered Business Name *</span>
                    {extractedData.businessName && <span className="text-[10px] font-normal text-emerald-400 font-mono">✓ Detected</span>}
                  </label>
                  <input
                    type="text"
                    value={extractedData.businessName}
                    onChange={(e) => setFormData(p => ({ ...p, businessName: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-[#161616] border border-white/15 rounded-xl text-xs font-bold text-white focus:border-[#E60000] focus:ring-1 focus:ring-[#FF2020] outline-none"
                    placeholder="e.g. Balaji Dental Care LLP"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5 font-mono">
                    <span>Authorised Signatory Name</span>
                    {extractedData.signatoryName && <span className="text-[10px] font-normal text-emerald-400 font-mono">✓ Detected</span>}
                  </label>
                  <input
                    type="text"
                    value={extractedData.signatoryName}
                    onChange={(e) => setFormData(p => ({ ...p, signatoryName: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-[#161616] border border-white/15 rounded-xl text-xs font-bold text-white focus:border-[#E60000] focus:ring-1 focus:ring-[#FF2020] outline-none"
                    placeholder="Authorised person name (e.g. Prakash Shah)"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5 font-mono">
                    Corporate Authority Document
                  </label>
                  <select
                    value={extractedData.corporateDocType}
                    onChange={(e) => setFormData(p => ({ ...p, corporateDocType: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-[#161616] border border-white/15 rounded-xl text-xs font-semibold text-white focus:border-[#E60000] focus:ring-1 focus:ring-[#FF2020] outline-none"
                  >
                    <option value="">Select Document Type...</option>
                    <option value="Partnership Deed">Partnership Deed / LLP Agreement (for LLPs)</option>
                    <option value="Board Resolution">Board Resolution (for Pvt Ltd / Companies)</option>
                    <option value="Sole Proprietor Declaration">Sole Proprietor Declaration (for Proprietorship)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1.5 font-mono flex items-center justify-between">
                    <span>Registered Business Address (from Address Proof)</span>
                    <span className="text-[10px] text-zinc-400 font-normal">Cross-matched against official registry location</span>
                  </label>
                  <input
                    type="text"
                    value={extractedData.address}
                    onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-[#161616] border border-white/15 rounded-xl text-xs font-medium text-white focus:border-[#E60000] focus:ring-1 focus:ring-[#FF2020] outline-none"
                    placeholder="Shop/Unit address from certificate or address proof"
                  />
                </div>
              </div>
            )}

            {/* Action button */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSubStep(2)}
                className="w-full sm:w-auto px-5 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-zinc-300 hover:text-white border border-white/10 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Document Upload</span>
              </button>

              <button
                type="button"
                onClick={handleVerify}
                disabled={isVerifying || !hasValidExtractedData}
                className="w-full sm:flex-1 py-4 bg-[#E60000] hover:bg-[#FF2020] text-white rounded-xl text-xs font-bold shadow-[0_0_20px_rgba(230,0,0,0.5)] flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Against Official Records...</span>
                  </>
                ) : !hasValidExtractedData ? (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Upload a Valid Business Certificate to Continue</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Confirm & Verify Business Details</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* VERIFICATION RESULT CARD */}
          {verificationResult && (
            <div
              className={`rounded-3xl border p-6 mb-8 transition-all shadow-2xl ${
                isVerified
                  ? 'bg-[#0b1610] border-emerald-500/40'
                  : 'bg-[#180a0a] border-red-500/40'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg ${
                      isVerified ? 'bg-emerald-600 shadow-emerald-500/30' : 'bg-[#E60000] shadow-red-500/30'
                    }`}
                  >
                    {isVerified ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">
                        {isVerified ? 'Business Verification Successful' : 'Details Mismatch Detected'}
                      </h3>
                      <span
                        className={`text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          isVerified
                            ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-400'
                            : 'bg-red-950/70 border border-red-500/40 text-red-400'
                        }`}
                      >
                        {isVerified ? 'VERIFIED' : 'FAILED'}
                      </span>
                    </div>
                    <p className="text-xs text-[#B5B5B5] mt-0.5">
                      Verification Match: <strong className="text-white">{verificationResult.nameMatchScore}%</strong>
                    </p>
                  </div>
                </div>

                <div className="text-[10px] text-zinc-500 font-mono hidden sm:block">
                  Official Records Check
                </div>
              </div>

              {/* Details / Failures */}
              <div className="mt-4 pt-4 border-t border-white/10 space-y-4 text-xs">
                {/* 1. Entity Registry Match */}
                <div className="bg-[#141414] rounded-2xl p-4 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="font-bold text-white flex items-center gap-1.5 font-mono text-[11px]">
                      <Building2 className="w-3.5 h-3.5 text-[#FF2020]" />
                      BUSINESS REGISTRATION & ENTITY STATUS
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                      ✓ Official Registry Active
                    </span>
                  </div>
                  {verificationResult.matchDetails?.gstin && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1">
                      <span className="text-[#B5B5B5]">Registered Legal Entity (GST Records):</span>
                      <span className="font-bold text-white font-mono">{verificationResult.matchDetails.gstin.legalName} ({verificationResult.matchDetails.gstin.status})</span>
                    </div>
                  )}
                  {verificationResult.matchDetails?.udyam && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1">
                      <span className="text-[#B5B5B5]">Registered Enterprise (MSME Records):</span>
                      <span className="font-bold text-white font-mono">{verificationResult.matchDetails.udyam.enterpriseName} ({verificationResult.matchDetails.udyam.enterpriseType})</span>
                    </div>
                  )}
                </div>

                {/* 2. Address Location Cross-Match */}
                {verificationResult.matchDetails?.addressVerification && (
                  <div className="bg-[#141414] rounded-2xl p-4 border border-white/10 space-y-2.5">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <span className="font-bold text-white flex items-center gap-1.5 font-mono text-[11px]">
                        <MapPin className="w-3.5 h-3.5 text-[#FF2020]" />
                        ADDRESS PROOF LOCATION CROSS-MATCH
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-zinc-400">
                          Score: {verificationResult.matchDetails.addressVerification.score}%
                        </span>
                        <span className={`text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded ${
                          verificationResult.matchDetails.addressVerification.status === 'MATCHED'
                            ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-400'
                            : verificationResult.matchDetails.addressVerification.status === 'PARTIAL_MATCH'
                            ? 'bg-amber-950/70 border border-amber-500/40 text-amber-400'
                            : 'bg-red-950/70 border border-red-500/40 text-red-400'
                        }`}>
                          {verificationResult.matchDetails.addressVerification.status === 'MATCHED' ? '✓ MATCHED' : verificationResult.matchDetails.addressVerification.status === 'PARTIAL_MATCH' ? 'PARTIAL MATCH' : 'MISMATCH'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="bg-[#1a1a1a] p-3 rounded-xl border border-white/5 space-y-1">
                        <span className="text-[10px] font-mono text-zinc-400 block uppercase">Submitted Address Proof:</span>
                        <p className="text-white font-medium leading-relaxed">
                          {verificationResult.matchDetails.addressVerification.submittedAddress || 'None provided'}
                        </p>
                      </div>
                      <div className="bg-[#1a1a1a] p-3 rounded-xl border border-white/5 space-y-1">
                        <span className="text-[10px] font-mono text-zinc-400 block uppercase">Official Registry Address ({verificationResult.matchDetails.addressVerification.source}):</span>
                        <p className="text-white font-medium leading-relaxed">
                          {verificationResult.matchDetails.addressVerification.officialAddress || 'Not recorded'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-zinc-400">
                      <span>{verificationResult.matchDetails.addressVerification.message}</span>
                      <div className="flex items-center gap-2">
                        {verificationResult.matchDetails.addressVerification.cityMatch && (
                          <span className="text-emerald-400 font-mono text-[10px] bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/20">✓ City</span>
                        )}
                        {verificationResult.matchDetails.addressVerification.stateMatch && (
                          <span className="text-emerald-400 font-mono text-[10px] bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/20">✓ State</span>
                        )}
                        {verificationResult.matchDetails.addressVerification.pincodeMatch === true && (
                          <span className="text-emerald-400 font-mono text-[10px] bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/20">✓ PIN Code</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Signatory Legal Authority Validation */}
                {verificationResult.matchDetails?.signatoryVerification && (
                  <div className="bg-[#141414] rounded-2xl p-4 border border-white/10 space-y-2.5">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <span className="font-bold text-white flex items-center gap-1.5 font-mono text-[11px]">
                        <Award className="w-3.5 h-3.5 text-[#FF2020]" />
                        SIGNATORY LEGAL AUTHORITY VALIDATION
                      </span>
                      <span className={`text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded ${
                        verificationResult.matchDetails.signatoryVerification.authorityConfirmed
                          ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-400'
                          : 'bg-red-950/70 border border-red-500/40 text-red-400'
                      }`}>
                        {verificationResult.matchDetails.signatoryVerification.authorityConfirmed ? '✓ AUTHORITY CONFIRMED' : 'AUTHORITY MISMATCH'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="bg-[#1a1a1a] p-3 rounded-xl border border-white/5 space-y-1">
                        <span className="text-[10px] font-mono text-zinc-400 block uppercase">Authorised Signatory:</span>
                        <p className="text-white font-bold">
                          {verificationResult.matchDetails.signatoryVerification.signatoryName || 'Not specified'}
                        </p>
                        <span className="text-[10px] text-zinc-400 font-mono block">
                          Capacity: {verificationResult.matchDetails.signatoryVerification.legalCapacity || 'Signatory'}
                        </span>
                      </div>

                      <div className="bg-[#1a1a1a] p-3 rounded-xl border border-white/5 space-y-1">
                        <span className="text-[10px] font-mono text-zinc-400 block uppercase">Corporate Constitution:</span>
                        <p className="text-white font-semibold">
                          {verificationResult.matchDetails.signatoryVerification.constitution || 'Registered Entity'}
                        </p>
                      </div>

                      <div className="bg-[#1a1a1a] p-3 rounded-xl border border-white/5 space-y-1">
                        <span className="text-[10px] font-mono text-zinc-400 block uppercase">Authorizing Document:</span>
                        <p className="text-emerald-400 font-semibold font-mono text-[11px]">
                          {verificationResult.matchDetails.signatoryVerification.requiredDocument}
                        </p>
                        <span className="text-[10px] text-zinc-500 block truncate">
                          File: {verificationResult.matchDetails.signatoryVerification.submittedDocument}
                        </span>
                      </div>
                    </div>

                    <div className="pt-1 text-[11px] text-zinc-300">
                      <span>{verificationResult.matchDetails.signatoryVerification.message}</span>
                    </div>
                  </div>
                )}

                {/* Mismatch Reasons */}
                {verificationResult.reasons?.length > 0 && (
                  <div className="p-3 bg-red-950/40 rounded-xl border border-red-500/30 space-y-1 mt-2">
                    <span className="font-bold text-rose-300 block">Reasons for review requirement:</span>
                    <ul className="list-disc list-inside text-rose-200 space-y-0.5 text-xs">
                      {verificationResult.reasons.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Failure fallback buttons */}
              {!isVerified && (
                <div className="mt-5 flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => setManualVerified(true)}
                    className="px-4 py-2.5 bg-zinc-800 text-white hover:bg-zinc-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Verify Manually</span>
                  </button>
                  <button
                    onClick={() => setShowSupportModal(true)}
                    className="px-4 py-2.5 bg-white/5 border border-white/15 text-zinc-300 hover:text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-[#FF2020]" />
                    <span>Call Enterprise Relationship Desk</span>
                  </button>
                </div>
              )}

              {/* Success Continue */}
              {isVerified && (
                <div className="mt-5 pt-2 flex justify-end">
                  <button
                    onClick={() => navigate('/checkout')}
                    className="px-7 py-3.5 bg-[#E60000] hover:bg-[#FF2020] text-white rounded-xl text-xs font-bold shadow-[0_0_20px_rgba(230,0,0,0.5)] flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <span>Continue to Order & Payment</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Support Modal dialog */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#111111] rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-white/15">
            <div className="w-12 h-12 bg-red-950/60 border border-red-500/30 rounded-2xl flex items-center justify-center text-[#FF2020] mx-auto">
              <PhoneCall className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Airtel Enterprise Desk</h3>
            <p className="text-xs text-[#B5B5B5]">
              Dedicated SMB Relationship Manager available Monday to Saturday (9 AM - 7 PM).
            </p>
            <div className="p-3 bg-[#161616] border border-white/10 rounded-xl font-mono font-bold text-[#FF2020] text-sm">
              Toll Free: 1800-103-6000 (Airtel Enterprise)
            </div>
            <button
              onClick={() => setShowSupportModal(false)}
              className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

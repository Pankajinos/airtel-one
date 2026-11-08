const mongoose = require('mongoose');

const BusinessProfileSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  businessName: { type: String, required: true },
  businessType: { type: String, required: true },
  scale: { type: String },
  customerMode: { type: String },
  digitalTools: [{ type: String }],
  teamDevices: { type: String },
  problemsFaced: { type: String },
  selectedProblems: [{ type: String }],
  customProblem: { type: String },
  selectedProducts: { type: Array, default: [] },
  monthlyTotal: { type: Number, default: 0 },
  setupTotal: { type: Number, default: 0 },
  gstin: { type: String },
  udyamNumber: { type: String },
  leadId: { type: String },
  city: { type: String },
  state: { type: String },
  selectionSavedAt: { type: String },
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() }
}, { _id: false, strict: false });

const OrderSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  orderId: { type: String, required: true, unique: true },
  orderDate: { type: String },
  orderStatus: { type: String, default: 'Confirmed' },
  paymentStatus: { type: String, default: 'PAID (DEMO)' },
  items: { type: Array, default: [] },
  monthlyTotal: { type: Number, default: 0 },
  setupTotal: { type: Number, default: 0 },
  businessProfile: { type: Object, default: {} },
  kycRecordId: { type: String },
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() }
}, { _id: false, strict: false });

const KycRecordSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  leadId: { type: String },
  docType: { type: String },
  fileInfo: { type: Object },
  extractedData: { type: Object },
  submittedData: { type: Object },
  verificationResult: { type: Object },
  createdAt: { type: String, default: () => new Date().toISOString() }
}, { _id: false, strict: false });

const BusinessProfile = mongoose.models.BusinessProfile || mongoose.model('BusinessProfile', BusinessProfileSchema);
const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);
const KycRecord = mongoose.models.KycRecord || mongoose.model('KycRecord', KycRecordSchema);

module.exports = {
  BusinessProfile,
  Order,
  KycRecord
};

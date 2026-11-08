const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { BusinessProfile, Order, KycRecord } = require('./models');

// In-memory / JSON fallback store for bulletproof reliability
const DATA_FILE = path.join(__dirname, '..', 'data_store.json');

const memoryStore = {
  businessProfiles: [],
  orders: [],
  kycRecords: [],
  products: []
};

// Load existing data if file exists
if (fs.existsSync(DATA_FILE)) {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    Object.assign(memoryStore, JSON.parse(raw));
  } catch (e) {
    console.warn('[Store] Could not read local data_store.json, using fresh store.');
  }
}

function persistToFile() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(memoryStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Store] Failed to write data_store.json:', err.message);
  }
}

let isMongoConnected = false;

async function initDB() {
  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI) {
    console.warn('[Store] MONGODB_URI not provided. Using local JSON store.');
    return;
  }

  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 15000
    });
    isMongoConnected = true;
    console.log(`[Store] 🟢 Connected successfully to MongoDB at ${mongoURI.split('@')[1] || mongoURI}`);
  } catch (err) {
    isMongoConnected = false;
    console.warn(`[Store] MongoDB connection failed (${err.message}). Using local JSON store.`);
  }
}

// Data Store Accessors
const Store = {
  initDB,
  isMongo: () => isMongoConnected,

  // Business Profiles
  async saveBusinessProfile(data) {
    const profileId = data._id || ('BP-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5));
    const profile = {
      _id: profileId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data
    };

    memoryStore.businessProfiles.push(profile);
    persistToFile();

    if (isMongoConnected) {
      try {
        await BusinessProfile.findByIdAndUpdate(profileId, profile, { upsert: true, new: true });
        console.log(`[MongoDB] Saved BusinessProfile: ${profileId}`);
      } catch (err) {
        console.warn('[MongoDB] Save BusinessProfile error:', err.message);
      }
    }

    return profile;
  },

  async getBusinessProfile(id) {
    if (isMongoConnected) {
      try {
        const found = await BusinessProfile.findOne({ $or: [{ _id: id }, { leadId: id }] }).lean();
        if (found) return found;
      } catch (err) {
        console.warn('[MongoDB] getBusinessProfile error:', err.message);
      }
    }
    return memoryStore.businessProfiles.find(p => p._id === id || p.id === id || p.leadId === id);
  },

  async updateBusinessProfile(id, updates) {
    let profile = memoryStore.businessProfiles.find(p => p._id === id || p.id === id || (p.leadId && p.leadId === id));
    if (!profile) {
      profile = {
        _id: id || ('BP-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5)),
        createdAt: new Date().toISOString(),
        ...updates
      };
      memoryStore.businessProfiles.push(profile);
    } else {
      Object.assign(profile, updates, { updatedAt: new Date().toISOString() });
    }
    persistToFile();

    if (isMongoConnected) {
      try {
        await BusinessProfile.findByIdAndUpdate(profile._id, profile, { upsert: true, new: true });
        console.log(`[MongoDB] Updated BusinessProfile: ${profile._id} with ${profile.selectedProducts?.length || 0} selected products`);
      } catch (err) {
        console.warn('[MongoDB] updateBusinessProfile error:', err.message);
      }
    }

    return profile;
  },

  async getAllBusinessProfiles() {
    if (isMongoConnected) {
      try {
        const all = await BusinessProfile.find().lean();
        if (all && all.length > 0) return all;
      } catch (err) {
        console.warn('[MongoDB] getAllBusinessProfiles error:', err.message);
      }
    }
    return memoryStore.businessProfiles;
  },

  // Products
  async setProducts(products) {
    memoryStore.products = products;
    persistToFile();
  },

  async getProducts() {
    return memoryStore.products;
  },

  async getProductById(id) {
    return memoryStore.products.find(p => p.product_id === id);
  },

  // KYC
  async saveKYCRecord(data) {
    const recordId = data._id || ('KYC-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5));
    const record = {
      _id: recordId,
      createdAt: new Date().toISOString(),
      ...data
    };
    memoryStore.kycRecords.push(record);
    persistToFile();

    if (isMongoConnected) {
      try {
        await KycRecord.findByIdAndUpdate(recordId, record, { upsert: true, new: true });
        console.log(`[MongoDB] Saved KYC Record: ${recordId}`);
      } catch (err) {
        console.warn('[MongoDB] Save KycRecord error:', err.message);
      }
    }

    return record;
  },

  async getKYCRecord(id) {
    if (isMongoConnected) {
      try {
        const found = await KycRecord.findOne({ $or: [{ _id: id }, { leadId: id }] }).lean();
        if (found) return found;
      } catch (err) {
        console.warn('[MongoDB] getKYCRecord error:', err.message);
      }
    }
    return memoryStore.kycRecords.find(k => k._id === id || k.lead_id === id);
  },

  // Orders
  async saveOrder(orderData) {
    const orderId = orderData.orderId || ('ORD-' + new Date().getFullYear() + '-' + Math.floor(100000 + Math.random() * 900000));
    const order = {
      _id: orderId,
      orderId: orderId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      orderStatus: 'Confirmed',
      paymentStatus: 'PAID (DEMO)',
      ...orderData
    };
    memoryStore.orders.push(order);
    persistToFile();

    if (isMongoConnected) {
      try {
        await Order.findByIdAndUpdate(orderId, order, { upsert: true, new: true });
        console.log(`[MongoDB] Saved Order: ${orderId}`);
      } catch (err) {
        console.warn('[MongoDB] Save Order error:', err.message);
      }
    }

    return order;
  },

  async getOrder(orderId) {
    if (isMongoConnected) {
      try {
        const found = await Order.findOne({ $or: [{ orderId }, { _id: orderId }] }).lean();
        if (found) return found;
      } catch (err) {
        console.warn('[MongoDB] getOrder error:', err.message);
      }
    }
    return memoryStore.orders.find(o => o.orderId === orderId || o._id === orderId);
  },

  async getAllOrders() {
    if (isMongoConnected) {
      try {
        const all = await Order.find().lean();
        if (all && all.length > 0) return all;
      } catch (err) {
        console.warn('[MongoDB] getAllOrders error:', err.message);
      }
    }
    return memoryStore.orders;
  },

  async updateProductStatus(orderId, productId, newStatus, newStageIndex) {
    const order = memoryStore.orders.find(o => o.orderId === orderId || o._id === orderId);
    if (!order) return null;

    if (order.items && Array.isArray(order.items)) {
      const item = order.items.find(i => i.product_id === productId || i.productId === productId);
      if (item) {
        item.status = newStatus;
        if (newStageIndex !== undefined) {
          item.currentStageIndex = newStageIndex;
        }
        item.updatedAt = new Date().toISOString();
      }
    }
    persistToFile();

    if (isMongoConnected) {
      try {
        await Order.findByIdAndUpdate(orderId, order, { new: true });
        console.log(`[MongoDB] Updated product ${productId} in Order ${orderId} -> ${newStatus}`);
      } catch (err) {
        console.warn('[MongoDB] updateProductStatus error:', err.message);
      }
    }

    return order;
  },

  async updateOrderStatus(orderId, newStatus) {
    const order = memoryStore.orders.find(o => o.orderId === orderId || o._id === orderId);
    if (!order) return null;
    order.orderStatus = newStatus;
    order.updatedAt = new Date().toISOString();
    persistToFile();

    if (isMongoConnected) {
      try {
        await Order.findByIdAndUpdate(orderId, { orderStatus: newStatus, updatedAt: order.updatedAt });
        console.log(`[MongoDB] Updated Order ${orderId} status -> ${newStatus}`);
      } catch (err) {
        console.warn('[MongoDB] updateOrderStatus error:', err.message);
      }
    }

    return order;
  }
};

module.exports = Store;

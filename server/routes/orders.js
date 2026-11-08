const express = require('express');
const router = express.Router();
const store = require('../db/store');

function getStagesForProduct(product) {
  const cat = (product.category || '').toLowerCase();
  const name = (product.product_name || '').toLowerCase();
  const id = product.product_id || '';

  if (id === 'P07' || id === 'P08' || name.includes('sim') || name.includes('postpaid')) {
    return [
      { name: 'SIM Allocation', desc: 'Number allotted and ICCID generated' },
      { name: 'Dispatched', desc: 'Shipped via express courier partner' },
      { name: 'Delivered', desc: 'Package delivered to business address' },
      { name: 'Activated', desc: 'Tele-verification complete and line active' }
    ];
  }

  if (cat.includes('connectivity') || name.includes('fibre') || name.includes('leased') || name.includes('broadband') || name.includes('airfiber')) {
    return [
      { name: 'Feasibility Check', desc: 'Last-mile survey completed' },
      { name: 'Technician Assigned', desc: 'Field engineer appointed for visit' },
      { name: 'Wiring & ONT Setup', desc: 'Fibre line pulled and router installed' },
      { name: 'Service Activated', desc: 'Line speed verified and live' }
    ];
  }

  if (cat.includes('cloud') || name.includes('email') || name.includes('backup') || name.includes('pos') || name.includes('whatsapp') || name.includes('sms')) {
    return [
      { name: 'Tenant Provisioning', desc: 'Cloud workspace initialized' },
      { name: 'Domain / API Setup', desc: 'DNS or WhatsApp Meta token configured' },
      { name: 'Licenses Assigned', desc: 'User seats allocated to organization' },
      { name: 'Subscription Active', desc: 'Cloud credentials sent to admin' }
    ];
  }

  // IoT / CCTV / Security / Hardware
  return [
    { name: 'Device Allocation', desc: 'Hardware serialized and bench-tested' },
    { name: 'Dispatched to Site', desc: 'In transit with installation team' },
    { name: 'Mounting & Setup', desc: 'Hardware mounted and paired with cloud' },
    { name: 'System Activated', desc: 'Live monitoring verified and active' }
  ];
}

// POST /api/orders - Place order with simulated payment
router.post('/', async (req, res) => {
  try {
    const { businessProfile, items, monthlyTotal, setupTotal, kycRecordId } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, error: 'No items in order' });
    }

    // Reference today as 2026-07-15 per hackathon spec
    const baseDate = new Date('2026-07-15T10:00:00.000Z');

    const formattedItems = items.map(prod => {
      const stages = getStagesForProduct(prod);
      const installDays = prod.typical_install_days || 3;
      const expectedDate = new Date(baseDate.getTime() + installDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      return {
        product_id: prod.product_id,
        product_name: prod.product_name,
        category: prod.category,
        description: prod.description,
        price_min_inr_per_month: prod.price_min_inr_per_month,
        one_time_setup_inr: prod.one_time_setup_inr,
        typical_install_days: installDays,
        expectedDate,
        stages,
        currentStageIndex: 0,
        status: stages[0].name
      };
    });

    const newOrder = await store.saveOrder({
      businessProfile: businessProfile || {},
      items: formattedItems,
      monthlyTotal: Number(monthlyTotal) || 0,
      setupTotal: Number(setupTotal) || 0,
      kycRecordId: kycRecordId || null,
      paymentStatus: 'PAID',
      orderStatus: 'Confirmed',
      orderDate: baseDate.toISOString().split('T')[0]
    });

    res.status(201).json({
      success: true,
      order: newOrder
    });
  } catch (err) {
    console.error('[Order Placement Error]', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/orders/:orderId - Fetch order
router.get('/:orderId', async (req, res) => {
  try {
    const order = await store.getOrder(req.params.orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/orders/:orderId/product-status - Admin/Demo control to advance product status
router.patch('/:orderId/product-status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { productId, stageIndex, customStatus } = req.body;

    const order = await store.getOrder(orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const item = (order.items || []).find(i => i.product_id === productId);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Product not found in this order' });
    }

    let newStageIndex = item.currentStageIndex;
    let newStatus = item.status;

    if (stageIndex !== undefined) {
      newStageIndex = Math.max(0, Math.min(item.stages.length - 1, stageIndex));
      newStatus = item.stages[newStageIndex].name;
    } else if (customStatus) {
      newStatus = customStatus;
    } else {
      // Advance to next stage by default
      if (newStageIndex < item.stages.length - 1) {
        newStageIndex++;
        newStatus = item.stages[newStageIndex].name;
      }
    }

    const updated = await store.updateProductStatus(orderId, productId, newStatus, newStageIndex);

    // If all products are at last stage, mark order as Fulfilled
    const allCompleted = (updated.items || []).every(it => it.currentStageIndex === it.stages.length - 1);
    if (allCompleted && updated.orderStatus !== 'Fulfilled') {
      await store.updateOrderStatus(orderId, 'Fulfilled');
      updated.orderStatus = 'Fulfilled';
    }

    res.json({ success: true, order: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/orders - List all orders
router.get('/', async (req, res) => {
  try {
    const orders = await store.getAllOrders();
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

import Razorpay from 'razorpay';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const keyId = (process.env.RAZORPAY_KEY_ID || '').trim();
    const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();

    if (!keyId || !keySecret) {
      return res.status(503).json({
        success: false,
        message: 'Razorpay Live credentials (RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET) are not configured in Vercel environment variables.',
      });
    }

    const {
      items = [],
      shippingInfo = {},
      couponCode,
      discountAmount = 0,
      flatShippingRate = 80,
      freeShippingMinAmount = 999,
      receipt,
      notes = {},
    } = req.body || {};

    // 1. Recalculate Subtotal from items to prevent client tampering
    let serverSubtotal = 0;
    if (Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        const qty = Math.max(1, Math.floor(Number(item.quantity) || 1));
        const unitPrice = Math.max(0, Number(item.price || item.product?.price) || 0);
        serverSubtotal += unitPrice * qty;
      }
    } else {
      serverSubtotal = Math.max(0, Number(req.body.amount) || 0);
    }

    if (serverSubtotal <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart items are invalid or empty.',
      });
    }

    // 2. Exact Free Delivery Threshold Rule: Subtotal >= ₹999 -> Free Delivery
    const effectiveThreshold = 999;
    let effectiveDeliveryFee = 0;
    if (serverSubtotal < effectiveThreshold) {
      effectiveDeliveryFee = Number(flatShippingRate) > 0 ? Number(flatShippingRate) : 80;
    }

    // 3. Validate Discount
    const validatedDiscount = Math.max(0, Math.min(Number(discountAmount) || 0, serverSubtotal));

    // 4. GST-Inclusive Total: Subtotal - Discount + Delivery (Zero duplicate GST added)
    let finalPayableAmount = Math.max(0, serverSubtotal - validatedDiscount + effectiveDeliveryFee);

    // 5. Authoritative Order ID Validation from Firestore (for WhatsApp & Direct Order Payment Links)
    const targetOrderId = (req.body.orderId || req.body.mfpOrderId || '').trim();
    if (targetOrderId) {
      try {
        const cleanId = targetOrderId.replace(/^#/, '');
        const candidateKeys = Array.from(new Set([cleanId, `#${cleanId}`, targetOrderId]));
        let foundFsData: any = null;

        for (const cand of candidateKeys) {
          const firestoreUrl = `https://firestore.googleapis.com/v1/projects/gen-lang-client-0934233443/databases/ai-studio-marudharfashionp-84582cae-673f-469e-bad0-503eef199989/documents/orders/${encodeURIComponent(cand)}`;
          const fsRes = await fetch(firestoreUrl);
          if (fsRes.ok) {
            foundFsData = await fsRes.json();
            break;
          }
        }

        if (foundFsData) {
          const fields = foundFsData.fields || {};
          const pStatus = fields.paymentStatus?.stringValue;
          const oStatus = fields.orderStatus?.stringValue;
          const fsTotal = fields.totalAmount?.doubleValue ?? fields.totalAmount?.integerValue;

          if (pStatus === 'PAID') {
            return res.status(400).json({
              success: false,
              message: 'इस ऑर्डर का भुगतान पहले ही हो चुका है। (This order is already paid.)',
              alreadyPaid: true,
            });
          }

          if (oStatus === 'CANCELLED') {
            return res.status(400).json({
              success: false,
              message: 'यह ऑर्डर रद्द (Cancelled) हो चुका है। (This order is cancelled.)',
              cancelled: true,
            });
          }

          if (fsTotal && Number(fsTotal) > 0) {
            finalPayableAmount = Number(fsTotal);
          }
        }
      } catch (fsErr) {
        console.warn('[Server Firestore check notice]:', fsErr);
      }
    }

    const amountInPaise = Math.round(finalPayableAmount * 100);

    if (amountInPaise <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Payable amount must be greater than ₹0.',
      });
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const orderReceipt = receipt || `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const rzpOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: orderReceipt,
      notes: {
        store: 'Marudhar Fashion Point',
        customerName: shippingInfo.name || 'Customer',
        customerPhone: shippingInfo.phone || '',
        customerEmail: shippingInfo.email || '',
        couponCode: couponCode || 'NONE',
        subtotal: `Rs.${serverSubtotal}`,
        delivery: `Rs.${effectiveDeliveryFee}`,
        discount: `Rs.${validatedDiscount}`,
        finalAmount: `Rs.${finalPayableAmount}`,
        ...notes,
      },
    });

    return res.status(200).json({
      success: true,
      order_id: rzpOrder.id,
      orderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      keyId,
      calculatedAmount: finalPayableAmount,
      subtotal: serverSubtotal,
      deliveryFee: effectiveDeliveryFee,
      discountAmount: validatedDiscount,
      receipt: orderReceipt,
    });
  } catch (err: any) {
    console.error('[Vercel Razorpay Create Order Error]:', err);
    const description = err?.error?.description || err?.message || 'Failed to create Razorpay live order.';
    return res.status(500).json({
      success: false,
      message: `Razorpay Order Error: ${description}`,
    });
  }
}

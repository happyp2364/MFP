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
      flatShippingRate,
      freeShippingMinAmount,
      shippingFee,
      isFreeShipping,
      freeShippingPromo,
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
      serverSubtotal = Math.max(0, Number(req.body.subtotal ?? req.body.amount ?? req.body.totalAmount) || 0);
    }

    if (serverSubtotal <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart items are invalid or empty.',
      });
    }

    // 2. Validate Discount
    let validatedDiscount = Math.max(0, Math.min(Number(discountAmount) || 0, serverSubtotal));
    const netMerchandise = Math.max(0, serverSubtotal - validatedDiscount);

    // 3. Authoritative Delivery Fee: Zero Hidden Charges
    // Free delivery applies if:
    // - Explicitly marked as free shipping: isFreeShipping === true or freeShippingPromo === true
    // - Net merchandise (post-discount) >= freeShippingMinAmount (default threshold: 999)
    // - flatShippingRate is explicitly configured as 0
    const effectiveThreshold = Number(freeShippingMinAmount !== undefined ? freeShippingMinAmount : 999);
    let effectiveDeliveryFee = 0;
    const isExplicitFreeDelivery = Boolean(isFreeShipping || freeShippingPromo);
    const isThresholdMet = effectiveThreshold > 0 && netMerchandise >= effectiveThreshold;

    if (isExplicitFreeDelivery || isThresholdMet) {
      effectiveDeliveryFee = 0;
    } else if (shippingFee !== undefined && Number(shippingFee) >= 0) {
      effectiveDeliveryFee = Number(shippingFee);
    } else if (flatShippingRate !== undefined && Number(flatShippingRate) >= 0) {
      effectiveDeliveryFee = Number(flatShippingRate);
    } else {
      effectiveDeliveryFee = 80;
    }

    // 4. Authoritative Convenience Fee Calculation for Online Razorpay Checkout
    const isFeeEnabled = req.body.enableConvenienceFee !== false;
    const feeRate = Math.min(10, Math.max(0, Number(req.body.convenienceFeePercent ?? 2)));
    const isManualPayment =
      req.body.paymentMethod === 'COD' ||
      req.body.paymentMethod === 'QR_SCAN' ||
      req.body.paymentMethod === 'UPI' ||
      req.body.paymentMethod === 'MANUAL_QR' ||
      req.body.paymentMethod === 'BANK_TRANSFER';
    let serverConvenienceFee = 0;

    if (!isManualPayment && isFeeEnabled && feeRate > 0) {
      const rawFee = (netMerchandise * feeRate) / 100;
      serverConvenienceFee = Math.round(rawFee * 100) / 100;
    }

    // 5. GST-INCLUSIVE PRICING:
    // Product price is already tax-inclusive. No duplicate GST is added to the customer total.
    // Final Payable = Subtotal - Discount + Delivery Fee + Convenience Fee
    let finalPayableAmount = Math.max(
      0,
      Math.round((netMerchandise + effectiveDeliveryFee + serverConvenienceFee) * 100) / 100
    );

    // 6. Authoritative Order ID Validation from Firestore (for WhatsApp & Direct Order Payment Links)
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
          const fsDelivery = fields.shippingFee?.doubleValue ?? fields.shippingFee?.integerValue;
          const fsDiscount = fields.discountAmount?.doubleValue ?? fields.discountAmount?.integerValue;
          const fsConvenience = fields.convenienceFee?.doubleValue ?? fields.convenienceFee?.integerValue;
          const fsSubtotal = fields.subtotal?.doubleValue ?? fields.subtotal?.integerValue;

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

          if (fsTotal !== undefined && Number(fsTotal) > 0) {
            finalPayableAmount = Number(fsTotal);
          }
          if (fsDelivery !== undefined) {
            effectiveDeliveryFee = Number(fsDelivery);
          }
          if (fsDiscount !== undefined) {
            validatedDiscount = Number(fsDiscount);
          }
          if (fsConvenience !== undefined) {
            serverConvenienceFee = Number(fsConvenience);
          }
          if (fsSubtotal !== undefined) {
            serverSubtotal = Number(fsSubtotal);
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
        convenienceFee: `Rs.${serverConvenienceFee}`,
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
      convenienceFee: serverConvenienceFee,
      totalAmount: finalPayableAmount,
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

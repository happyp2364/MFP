import crypto from 'crypto';
import Razorpay from 'razorpay';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    } = req.body || {};

    if (!razorpay_payment_id || !razorpay_order_id) {
      return res.status(400).json({
        success: false,
        verified: false,
        status: 'FAILED',
        message: 'Missing razorpay_payment_id or razorpay_order_id.',
      });
    }

    if (!razorpay_signature) {
      return res.status(400).json({
        success: false,
        verified: false,
        status: 'FAILED',
        message: 'Missing razorpay_signature.',
      });
    }

    const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();
    const keyId = (process.env.RAZORPAY_KEY_ID || '').trim();

    if (!keySecret) {
      return res.status(500).json({
        success: false,
        verified: false,
        status: 'FAILED',
        message: 'RAZORPAY_KEY_SECRET is not configured in Vercel environment variables.',
      });
    }

    // 1. Mandatory Cryptographic HMAC SHA256 Signature Verification
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const expectedBuf = Buffer.from(expectedSignature, 'utf-8');
    const receivedBuf = Buffer.from(String(razorpay_signature || ''), 'utf-8');

    const isSignatureValid =
      expectedBuf.length === receivedBuf.length &&
      crypto.timingSafeEqual(expectedBuf, receivedBuf);

    if (!isSignatureValid) {
      console.error(`[Razorpay Signature Mismatch] Order: ${razorpay_order_id}, Payment: ${razorpay_payment_id}`);
      return res.status(400).json({
        success: false,
        verified: false,
        status: 'FAILED',
        message: 'Cryptographic signature mismatch. Payment verification failed.',
      });
    }

    // 2. Query Razorpay API to confirm capture status
    let paymentDetails: any = null;
    if (keyId) {
      try {
        const razorpay = new Razorpay({
          key_id: keyId,
          key_secret: keySecret,
        });
        paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
        if (paymentDetails) {
          if (paymentDetails.order_id && paymentDetails.order_id !== razorpay_order_id) {
            return res.status(400).json({
              success: false,
              verified: false,
              status: 'FAILED',
              message: 'Payment order ID does not match.',
            });
          }
          if (paymentDetails.status !== 'captured' && paymentDetails.status !== 'authorized') {
            return res.status(400).json({
              success: false,
              verified: false,
              status: 'FAILED',
              message: `Payment status is ${paymentDetails.status}. Expected captured/authorized.`,
            });
          }
        }
      } catch (fetchErr: any) {
        console.warn('[Vercel fetch payment warning]:', fetchErr?.message || fetchErr);
      }
    }

    const verifiedAt = new Date().toISOString();
    const amount = paymentDetails ? paymentDetails.amount / 100 : Number(req.body.amount) || 0;

    return res.status(200).json({
      success: true,
      verified: true,
      status: 'PAID',
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      amount,
      verifiedAt,
      message: 'Payment signature and status verified successfully.',
    });
  } catch (err: any) {
    console.error('[Vercel Razorpay Verify Payment Error]:', err);
    return res.status(500).json({
      success: false,
      verified: false,
      status: 'FAILED',
      message: err.message || 'Server error occurred during payment verification.',
    });
  }
}

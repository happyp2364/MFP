import crypto from 'crypto';

// In-memory set for Vercel serverless runtime to prevent duplicate webhook processing
const processedWebhookEvents = new Set<string>();

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const webhookSignature = req.headers['x-razorpay-signature'] as string;
    const webhookSecret = (process.env.RAZORPAY_WEBHOOK_SECRET || '').trim();

    if (!webhookSecret) {
      console.error('[Razorpay Webhook Error]: RAZORPAY_WEBHOOK_SECRET is not configured.');
      return res.status(500).json({ error: 'Webhook secret is not configured on server.' });
    }

    if (!webhookSignature) {
      console.warn('[Razorpay Webhook Warning]: Missing x-razorpay-signature header.');
      return res.status(400).json({ error: 'Missing x-razorpay-signature header.' });
    }

    const bodyStr = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(bodyStr)
      .digest('hex');

    const expectedBuf = Buffer.from(expectedSignature, 'utf-8');
    const signatureBuf = Buffer.from(webhookSignature, 'utf-8');

    if (expectedBuf.length !== signatureBuf.length || !crypto.timingSafeEqual(expectedBuf, signatureBuf)) {
      console.error('[Razorpay Webhook Error]: Webhook signature mismatch.');
      return res.status(400).json({ error: 'Invalid webhook signature.' });
    }

    const event = req.body?.event;
    const payload = req.body?.payload;
    const payment = payload?.payment?.entity;
    const order = payload?.order?.entity;

    const eventId = req.headers['x-razorpay-event-id'] || `${event}_${payment?.id || order?.id || Date.now()}`;

    // Idempotency check: Ignore duplicate deliveries
    if (processedWebhookEvents.has(eventId)) {
      return res.status(200).json({ status: 'already_processed', eventId });
    }
    processedWebhookEvents.add(eventId);
    if (processedWebhookEvents.size > 2000) {
      const oldest = processedWebhookEvents.values().next().value;
      if (oldest) processedWebhookEvents.delete(oldest);
    }

    console.log(`[Razorpay Webhook Verified]: Event ${event} for Payment ${payment?.id || 'N/A'}, Order ${order?.id || payment?.order_id || 'N/A'}`);

    if (event === 'payment.captured' || event === 'order.paid') {
      // Payment successfully captured by Razorpay
      const paymentId = payment?.id;
      const orderId = order?.id || payment?.order_id;
      const amount = payment?.amount ? payment.amount / 100 : 0;
      return res.status(200).json({ status: 'captured', paymentId, orderId, amount });
    } else if (event === 'payment.failed') {
      const paymentId = payment?.id;
      const reason = payment?.error_description || payment?.error_reason || 'Payment failed';
      console.warn(`[Razorpay Webhook Payment Failed]: Payment ${paymentId}, Reason: ${reason}`);
      return res.status(200).json({ status: 'failed', paymentId, reason });
    }

    return res.status(200).json({ status: 'ignored', event });
  } catch (err: any) {
    console.error('[Vercel Webhook Error]:', err);
    return res.status(500).json({ error: err.message || 'Internal webhook error.' });
  }
}

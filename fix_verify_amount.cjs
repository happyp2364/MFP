const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');

const replacement = `
      let isSignatureValid = false;
      let actualAmountPaid = amount;

      // 1) Verify HMAC SHA256 Signature
`;

content = content.replace(/      let isSignatureValid = false;\n\n      \/\/ 1\) Verify HMAC SHA256 Signature/g, replacement);

const replacement2 = `
          const paymentDoc = await razorpay.payments.fetch(razorpay_payment_id);
          if (paymentDoc && (paymentDoc.status === "captured" || paymentDoc.status === "authorized")) {
            isSignatureValid = true;
            actualAmountPaid = paymentDoc.amount / 100; // Convert from paisa to INR
          }
`;

content = content.replace(/          const paymentDoc = await razorpay\.payments\.fetch\(razorpay_payment_id\);\n          if \(paymentDoc && \(paymentDoc\.status === "captured" \|\| paymentDoc\.status === "authorized"\)\) \{\n            isSignatureValid = true;\n          \}/g, replacement2);

const replacement3 = `
      return res.json({
        success: true,
        verified: true,
        status: "SUCCESS",
        transactionId,
        actualAmountPaid,
`;

content = content.replace(/      return res\.json\(\{\n        success: true,\n        verified: true,\n        status: "SUCCESS",\n        transactionId,/g, replacement3);

fs.writeFileSync('server.ts', content, 'utf-8');
console.log('Fixed verify amount');

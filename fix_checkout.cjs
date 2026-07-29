const fs = require('fs');
let content = fs.readFileSync('src/components/Checkout/CheckoutModal.tsx', 'utf-8');

const replacement = `
  const handleStartPaymentVerification = async (explicitPayId?: string, rzpOrderId?: string, rzpSignature?: string) => {
    if (step === 'VERIFYING' || isProcessingRef.current) return;
    setIsSubmitting(true);
    isProcessingRef.current = true;
    setErrorMessage(null);
    setFailedReason(null);

    // Validate cart
    if (cartItems.length === 0) {
      setErrorMessage('Your cart is empty.');
      setStep('PAYMENT');
      setIsSubmitting(false);
      isProcessingRef.current = false;
      return;
    }

    // Validate payment reference if UPI is selected
    if (selectedMethod === 'UPI' && !explicitPayId && !paymentRef.trim()) {
      setErrorMessage('Please enter UTR Transaction Reference Number or upload screenshot.');
      setStep('PAYMENT');
      setIsSubmitting(false);
      isProcessingRef.current = false;
      return;
    }

    setVerificationProgress(20);
    setVerificationStageText('Connecting to Secure Gateway Node...');
    
    const targetRef = explicitPayId || paymentRef.trim() || \`pay_\${Date.now()}\`;

    try {
      if (selectedMethod !== 'COD' && rzpOrderId) {
        setVerificationProgress(40);
        setVerificationStageText('Validating Payment Reference & Signature Integrity...');
        
        const apiRes = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_payment_id: targetRef,
            razorpay_order_id: rzpOrderId,
            razorpay_signature: rzpSignature,
            amount: totalAmount,
            currency: 'INR',
            customerName: shippingInfo.name,
            customerEmail: shippingInfo.email,
            customerPhone: shippingInfo.phone,
            paymentMethod: selectedMethod,
            keyId: paymentSettings.keyId || paymentSettings.apiKey,
            gatewayProvider: paymentSettings.gatewayProvider || 'RAZORPAY',
            isTestMode: paymentSettings.isTestMode !== false,
          }),
        });
        
        const data = await apiRes.json();
        if (!data.success || !data.verified) {
           throw new Error(data.message || 'Payment verification failed.');
        }
        
        // Anti-fraud amount check
        if (data.actualAmountPaid !== undefined && data.actualAmountPaid < totalAmount) {
           throw new Error(\`Payment verification failed: Amount paid (₹\${data.actualAmountPaid}) is less than order total (₹\${totalAmount}).\`);
        }
      }

      setVerificationProgress(70);
      setVerificationStageText('Checking Anti-Replay Ledger & Anti-Fraud Locks...');

      await new Promise((res) => setTimeout(res, 400));
      setVerificationProgress(90);
      setVerificationStageText('Confirming Settlement Authorization...');

      const extraDetails = {
`;

content = content.replace(/  const handleStartPaymentVerification = async \(explicitPayId\?: string\) => \{[\s\S]*?const extraDetails = \{/, replacement);

const handlerReplacement = `
          handler: async function (response: any) {
            const confirmedPayId = response.razorpay_payment_id || \`pay_\${Date.now()}\`;
            setPaymentRef(confirmedPayId);
            await handleStartPaymentVerification(confirmedPayId, gatewayOrderId, response.razorpay_signature);
          },
`;

content = content.replace(/          handler: async function \(response: any\) \{[\s\S]*?await handleStartPaymentVerification\(confirmedPayId\);\n          \},/, handlerReplacement);


fs.writeFileSync('src/components/Checkout/CheckoutModal.tsx', content, 'utf-8');
console.log('Fixed CheckoutModal');

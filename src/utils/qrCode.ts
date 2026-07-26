// Dynamic UPI Link & QR Code Utility

/**
 * Utility to clean and sanitize a UPI ID (VPA) by removing whitespace,
 * carriage returns, line breaks, zero-width characters, and non-printable bytes.
 */
export function cleanAndSanitizeUPIId(upiId: string | null | undefined): string {
  if (!upiId) return '';
  return String(upiId)
    .replace(/[\u200B-\u200D\uFEFF\u00A0]/g, '') // Remove zero-width spaces and non-breaking spaces
    .replace(/[\r\n\t]/g, '') // Remove carriage returns, line breaks, tabs
    .replace(/\s+/g, '') // Remove all internal/external spaces
    .trim();
}

/**
 * Validates whether a UPI ID meets standard VPA format rules.
 * Standard UPI format: username@handle (e.g. marudhar@oksbi, 9876543210@paytm)
 */
export function isValidUPIIdFormat(upiId: string | null | undefined): boolean {
  const sanitized = cleanAndSanitizeUPIId(upiId);
  if (!sanitized) return false;
  // Standard VPA pattern: 2-256 chars (alphanumeric, dots, hyphens, underscores) + @ + 2-64 chars bank handle
  const vpaRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z0-9]{2,64}$/;
  return vpaRegex.test(sanitized);
}

/**
 * Generates official UPI Payment URI according to UPI URI specification:
 * upi://pay?pa=<UPI_ID>&pn=<BUSINESS_NAME>&am=<AMOUNT>&cu=INR&tn=<ORDER_REFERENCE>
 */
export function generateUPILink(
  upiId: string,
  merchantName: string,
  amount: number,
  orderId: string,
  note: string = 'Order'
): string {
  const cleanUpi = cleanAndSanitizeUPIId(upiId);

  // Validate before generating
  if (!isValidUPIIdFormat(cleanUpi)) {
    if (typeof window !== 'undefined' && ((import.meta as any)?.env?.DEV || process.env.NODE_ENV !== 'production')) {
      console.warn('[UPI URI Generator] Invalid UPI ID provided:', { raw: upiId, sanitized: cleanUpi });
    }
    return '';
  }

  const cleanName = encodeURIComponent((merchantName || 'Marudhar Fashion Point').trim());
  const formattedAmount = (Math.max(0, amount) || 0).toFixed(2);
  const cleanNote = note && note !== 'Order' && note !== 'Marudhar Fashion Order' ? `${note} #${orderId}` : `Order #${orderId}`;
  const orderRef = encodeURIComponent(cleanNote.trim());

  // Official UPI specification URI
  // upi://pay?pa=<UPI_ID>&pn=<BUSINESS_NAME>&am=<AMOUNT>&cu=INR&tn=<ORDER_REFERENCE>
  const upiUri = `upi://pay?pa=${cleanUpi}&pn=${cleanName}&am=${formattedAmount}&cu=INR&tn=${orderRef}`;

  // Debug logging (development only)
  if (typeof window !== 'undefined' && ((import.meta as any)?.env?.DEV || process.env.NODE_ENV !== 'production')) {
    console.log('[UPI URI Debug]:', upiUri, {
      rawUpiId: upiId,
      sanitizedUpiId: cleanUpi,
      merchantName: merchantName?.trim(),
      amount: formattedAmount,
      orderId,
    });
  }

  return upiUri;
}

export function getQRCodeImageUrl(upiUrl: string, size: number = 300): string {
  if (!upiUrl) {
    const fallbackEncoded = encodeURIComponent('INVALID_UPI_ID');
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=10&data=${fallbackEncoded}`;
  }
  const encoded = encodeURIComponent(upiUrl);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=10&data=${encoded}`;
}


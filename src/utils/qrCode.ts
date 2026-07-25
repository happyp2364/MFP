// Dynamic UPI Link & QR Code Utility
export function generateUPILink(
  upiId: string,
  merchantName: string,
  amount: number,
  orderId: string,
  note: string = 'Marudhar Fashion Order'
): string {
  const cleanUpi = upiId.trim();
  const cleanName = encodeURIComponent(merchantName.trim() || 'Marudhar Fashion Point');
  const cleanNote = encodeURIComponent(`${note} #${orderId}`);
  const formattedAmount = amount.toFixed(2);

  return `upi://pay?pa=${cleanUpi}&pn=${cleanName}&am=${formattedAmount}&cu=INR&tn=${cleanNote}&tr=${orderId}`;
}

export function getQRCodeImageUrl(upiUrl: string, size: number = 300): string {
  const encoded = encodeURIComponent(upiUrl);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=10&data=${encoded}`;
}

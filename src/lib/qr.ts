const QR_BASE = 'https://api.qrserver.com/v1/create-qr-code/';

export function getQrCodeUrl(data: string, size: number = 200): string {
  const params = new URLSearchParams({
    size: `${size}x${size}`,
    data,
    bgcolor: 'ffffff',
    color: '000000',
    margin: '0',
    qzone: '1',
    format: 'png',
  });
  return `${QR_BASE}?${params.toString()}`;
}

/**
 * Build the public verification URL encoded into the QR.
 * Uses the qr_token, not personal info.
 */
export function getVerificationUrl(qrToken: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://astitva.app';
  return `${origin}/#/verify/${qrToken}`;
}

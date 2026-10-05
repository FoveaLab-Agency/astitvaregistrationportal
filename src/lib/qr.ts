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

export function getVerificationUrl(qrToken: string): string {
  const baseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  return `${baseUrl}/functions/v1/verify-registration?token=${qrToken}`;
}

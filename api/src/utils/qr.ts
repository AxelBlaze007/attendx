import QRCode from "qrcode";
import crypto from "crypto";

export function generateVoucherCode(): string {
  return crypto.randomBytes(16).toString("hex").toUpperCase();
}

export async function generateQrCodeData(data: string): Promise<string> {
  return QRCode.toDataURL(data);
}

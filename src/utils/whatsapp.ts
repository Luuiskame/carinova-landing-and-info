/**
 * WhatsApp click-to-chat link (https://wa.me/<number>?text=…).
 * `phone` must include the country code (505 for Nicaragua); any non-digit is stripped.
 */
export const whatsappLink = (phone: string, message?: string): string => {
  const digits = phone.replace(/\D/g, '');
  return `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
};

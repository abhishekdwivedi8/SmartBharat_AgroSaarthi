import { useMemo } from "react";

interface WhatsAppButtonProps {
  phoneNumber?: string; // in international format without + (e.g., 918123456789)
  prefill?: string;
}

// Small, attractive floating WhatsApp shortcut
export default function WhatsAppButton({
  phoneNumber,
  prefill = "Namaste! I want agri help from Smart Bharat.",
}: WhatsAppButtonProps) {
  const link = useMemo(() => {
    const text = encodeURIComponent(prefill);
    if (phoneNumber && /^\d{8,15}$/.test(phoneNumber)) {
      return `https://wa.me/${phoneNumber}?text=${text}`;
    }
    // Fallback: opens WhatsApp with prefilled message (user selects contact)
    return `https://wa.me/?text=${text}`;
  }, [phoneNumber, prefill]);

  return (
    <a
      href={link}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-50 group hover-scale"
    >
      <div className="rounded-full shadow-lg ring-1 ring-border bg-primary text-primary-foreground w-11 h-11 flex items-center justify-center transition-transform duration-200 group-hover:scale-110 shadow-glow">
        {/* WhatsApp glyph (SVG) */}
        <svg width="22" height="22" viewBox="0 0 32 32" fill="currentColor" aria-hidden>
          <path d="M19.11 17.64c-.27-.14-1.57-.77-1.81-.86-.24-.09-.42-.14-.6.14-.18.27-.69.86-.84 1.04-.15.18-.31.2-.58.07-.27-.14-1.13-.42-2.16-1.34-.8-.71-1.34-1.59-1.49-1.86-.16-.27-.02-.42.12-.55.12-.12.27-.31.4-.47.13-.16.18-.27.27-.45.09-.18.04-.34-.02-.48-.06-.14-.6-1.45-.82-1.99-.22-.53-.44-.46-.6-.46-.15 0-.33-.02-.51-.02-.18 0-.48.07-.73.34-.25.27-.96.94-.96 2.3 0 1.36.99 2.67 1.12 2.85.14.18 1.95 2.98 4.73 4.19.66.29 1.17.46 1.57.59.66.21 1.26.18 1.73.11.53-.08 1.57-.64 1.79-1.26.22-.62.22-1.15.15-1.26-.07-.11-.24-.18-.51-.32z"/>
          <path d="M26.77 5.23A13.88 13.88 0 0 0 16 1.33C8.24 1.33 1.97 7.6 1.97 15.36c0 2.49.65 4.95 1.88 7.11L1.33 30.67l8.39-2.47a14.17 14.17 0 0 0 6.28 1.49h.01c7.76 0 14.03-6.27 14.03-14.03 0-3.75-1.46-7.27-4.27-9.96zM16 27.2h-.01a11.86 11.86 0 0 1-6.05-1.66l-.43-.26-4.98 1.47 1.49-4.86-.28-.5a11.86 11.86 0 0 1-1.74-6.02c0-6.54 5.32-11.86 11.86-11.86 3.17 0 6.16 1.24 8.4 3.48a11.8 11.8 0 0 1 3.47 8.39C27.86 21.88 22.54 27.2 16 27.2z"/>
        </svg>
      </div>
    </a>
  );
}

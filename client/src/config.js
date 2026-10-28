// Brand config — centralised, not scattered in components.
// Override via VITE_ env vars if needed.

export const BRAND = {
  name: 'Grip On',
  whatsapp: import.meta.env.VITE_WHATSAPP || '27649531145',
  instagram: import.meta.env.VITE_INSTAGRAM || 'https://www.instagram.com/mlungisi_rs?igsh=dXE3YXhnMnFld2ll',
  email: 'hello@griponwear.co.za',
  location: 'Johannesburg, South Africa',
  designer: 'Mlungisi Mahlangu',
  designerPhone: '+27 64 953 1145',
};

// Brand config — centralised, not scattered in components.
// Override via VITE_ env vars if needed.

export const BRAND = {
  name: 'Grip On',
  instagram: import.meta.env.VITE_INSTAGRAM || 'https://www.instagram.com/mlungisi_rs?igsh=dXE3YXhnMnFld2ll',
  email: 'hello@griponwear.co.za',
  location: 'Johannesburg, South Africa',
};

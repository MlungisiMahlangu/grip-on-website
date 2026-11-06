export const WHATSAPP_DEFAULT_MESSAGE = "Hi Grip On, I have a question about your gear.";

export function phoneFromLocal(local: string) {
  let digits = local.replace(/\D/g, "");
  if (digits.startsWith("0027")) digits = digits.slice(2);
  if (digits.startsWith("27") && digits.length === 11) digits = `0${digits.slice(2)}`;
  const normalised = digits.startsWith("0") ? digits : `0${digits}`;
  const international = `+27${normalised.slice(1)}`;

  return {
    local: normalised,
    display: `${normalised.slice(0, 3)} ${normalised.slice(3, 6)} ${normalised.slice(6)}`,
    international,
    tel: `tel:${international}`,
    whatsapp: (message: string = WHATSAPP_DEFAULT_MESSAGE) =>
      `https://wa.me/${international.replace("+", "")}?text=${encodeURIComponent(message)}`,
  };
}

export const PHONE = phoneFromLocal("0660488468");

export const BUSINESS = {
  name: "Grip On",
  email: "grip.on.za@gmail.com",
  location: "Johannesburg, South Africa",
  phone: {
    local: PHONE.local,
    display: PHONE.display,
    international: PHONE.international,
    tel: PHONE.tel,
  },
  instagram: {
    handle: "@griponza",
    url: "https://instagram.com/griponza",
  },
} as const;

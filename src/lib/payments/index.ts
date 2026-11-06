export type PaymentMethodId = "cod";

export type PaymentMethod = {
  id: PaymentMethodId;
  label: string;
  summary: string;
  detail: string;
};

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "cod",
    label: "Cash on delivery",
    summary: "Pay when your order arrives.",
    detail:
      "No card needed. Have the exact amount ready for the courier. Every order is checked and packed by hand before it leaves us.",
  },
];

export function getPaymentMethod(id: PaymentMethodId) {
  return PAYMENT_METHODS.find((method) => method.id === id) ?? PAYMENT_METHODS[0];
}

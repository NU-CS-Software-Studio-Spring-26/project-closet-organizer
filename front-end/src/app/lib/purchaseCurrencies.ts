export const DEFAULT_PURCHASE_CURRENCY = "USD";

export const PURCHASE_CURRENCY_OPTIONS = [
  { code: "USD", label: "USD — US Dollar" },
  { code: "EUR", label: "EUR — Euro" },
  { code: "GBP", label: "GBP — British Pound" },
  { code: "CAD", label: "CAD — Canadian Dollar" },
  { code: "AUD", label: "AUD — Australian Dollar" },
  { code: "JPY", label: "JPY — Japanese Yen" },
  { code: "CHF", label: "CHF — Swiss Franc" },
  { code: "MXN", label: "MXN — Mexican Peso" },
  { code: "INR", label: "INR — Indian Rupee" },
  { code: "CNY", label: "CNY — Chinese Yuan" },
] as const;

export type PurchaseCurrencyCode = (typeof PURCHASE_CURRENCY_OPTIONS)[number]["code"];

const PURCHASE_CURRENCY_CODES = new Set<string>(
  PURCHASE_CURRENCY_OPTIONS.map((option) => option.code),
);

export function normalizePurchaseCurrency(value: unknown): PurchaseCurrencyCode {
  const code = typeof value === "string" ? value.trim().toUpperCase() : "";
  if (PURCHASE_CURRENCY_CODES.has(code)) {
    return code as PurchaseCurrencyCode;
  }

  return DEFAULT_PURCHASE_CURRENCY;
}

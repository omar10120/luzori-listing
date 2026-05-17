export const MYFATOORAH_BASE_URL =
  process.env.PAYMENT_PORTAL?.replace(/\/$/, "") ||
  "https://apitest.myfatoorah.com";

export interface MyFatoorahInvoiceItem {
  ItemName: string;
  Quantity: number;
  UnitPrice: number;
}

export interface SendPaymentRequest {
  CustomerName: string;
  InvoiceValue: number;
  NotificationOption: "LNK";
  DisplayCurrencyIso: "AED";
  MobileCountryCode: string;
  CustomerMobile: string;
  CustomerEmail: string;
  CustomerReference?: string;
  Language?: string;
  CallBackUrl?: string;
  ErrorUrl?: string;
  InvoiceItems: MyFatoorahInvoiceItem[];
}

export interface SendPaymentResponse {
  IsSuccess: boolean;
  Message: string;
  ValidationErrors: unknown;
  Data: {
    InvoiceId: number;
    InvoiceURL: string;
    CustomerReference: string | null;
    UserDefinedField: string | null;
  } | null;
}

export function buildSendPaymentPayload(input: {
  customerName: string;
  customerEmail: string;
  mobileCountryCode: string;
  customerMobile: string;
  invoiceValue: number;
  customerReference?: string;
  invoiceItems: MyFatoorahInvoiceItem[];
  callBackUrl?: string;
  errorUrl?: string;
  language?: "en" | "ar";
}): SendPaymentRequest {
  const countryCode = input.mobileCountryCode.replace(/\D/g, "") || "971";
  const mobile = input.customerMobile.replace(/\D/g, "");

  return {
    CustomerName: input.customerName,
    InvoiceValue: input.invoiceValue,
    NotificationOption: "LNK",
    DisplayCurrencyIso: "AED",
    MobileCountryCode: countryCode,
    CustomerMobile: mobile,
    CustomerEmail: input.customerEmail,
    CustomerReference: input.customerReference,
    Language: input.language === "ar" ? "ar" : "en",
    CallBackUrl: input.callBackUrl,
    ErrorUrl: input.errorUrl,
    InvoiceItems: input.invoiceItems,
  };
}

export async function sendMyFatoorahPayment(
  payload: SendPaymentRequest
): Promise<SendPaymentResponse> {
  const apiKey = process.env.MYFATOORAH_API_KEY;
  if (!apiKey) {
    throw new Error("MYFATOORAH_API_KEY is not configured");
  }

  const res = await fetch(`${MYFATOORAH_BASE_URL}/v2/SendPayment`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  const json = (await res.json()) as SendPaymentResponse;
  if (!res.ok && !json.Message) {
    throw new Error(`MyFatoorah HTTP ${res.status}`);
  }
  return json;
}

/** Client-side helper — calls the Next.js API route (keeps API key server-only). */
export async function initiateMyFatoorahPayment(input: {
  customerName: string;
  customerEmail: string;
  mobileCountryCode: string;
  customerMobile: string;
  invoiceValue: number;
  customerReference?: string;
  invoiceItems: MyFatoorahInvoiceItem[];
  callBackUrl?: string;
  errorUrl?: string;
  language?: "en" | "ar";
}): Promise<SendPaymentResponse> {
  const res = await fetch("/api/payment/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return (await res.json()) as SendPaymentResponse;
}

export function buildBookingInvoiceItems(
  centerName: string,
  services: Array<{ name: string; price: number | string }>
): MyFatoorahInvoiceItem[] {
  return services.map((s) => ({
    ItemName: `${s.name} — ${centerName}`,
    Quantity: 1,
    UnitPrice: Number(s.price) || 0,
  }));
}

export function buildPackageInvoiceItems(
  centerName: string,
  packages: Array<{ name: string; price: number | string }>
): MyFatoorahInvoiceItem[] {
  return packages.map((pkg) => ({
    ItemName: `${pkg.name} — ${centerName}`,
    Quantity: 1,
    UnitPrice: Number(pkg.price) || 0,
  }));
}

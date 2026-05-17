import { fetchUserProfile, storePackages } from "@/lib/api";
import type { CenterPackage } from "@/lib/apiEndpoints";
import {
  buildPackageInvoiceItems,
  initiateMyFatoorahPayment,
} from "@/lib/myfatoorah";

export type PackagePaymentType = "wallet" | "service_cash";

export const PACKAGE_PAYMENT_TYPES: PackagePaymentType[] = [
  "wallet",
  "service_cash",
];

export function isPackagePaymentType(value: string): value is PackagePaymentType {
  return PACKAGE_PAYMENT_TYPES.includes(value as PackagePaymentType);
}

/** Wallet pays immediately; service_cash stores package then opens MyFatoorah portal. */
export async function purchasePackagesWithPayment(input: {
  token: string;
  centerId: number;
  centerName: string;
  packageIds: number[];
  packages: Pick<CenterPackage, "id" | "name" | "price">[];
  paymentType: PackagePaymentType;
  locale?: string;
}): Promise<
  | { ok: true; redirected?: boolean; message?: string }
  | { ok: false; message: string; code?: "insufficient_balance" | "profile_incomplete" }
> {
  const { token, centerId, centerName, packageIds, packages, paymentType, locale } =
    input;

  const totalPrice = packages.reduce((sum, pkg) => sum + Number(pkg.price || 0), 0);

  if (paymentType === "wallet") {
    const profile = await fetchUserProfile(token);
    const wallet = Number(profile?.wallet ?? 0);
    if (wallet < totalPrice) {
      return { ok: false, message: "insufficient_balance", code: "insufficient_balance" };
    }
  }

  const result = await storePackages(token, centerId, packageIds, paymentType);
  if (!result.success) {
    return { ok: false, message: result.message || "package_purchase_failed" };
  }

  if (paymentType !== "service_cash") {
    return { ok: true, message: result.message };
  }

  const profile = await fetchUserProfile(token);
  const customerName =
    profile?.name ||
    profile?.full_name ||
    `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim() ||
    "Customer";
  const customerEmail = profile?.email?.trim();
  const customerMobile = String(profile?.phone ?? "").replace(/\D/g, "");
  const countryCode = String(profile?.country_code ?? "+971").replace(/\D/g, "");

  if (!customerEmail || customerMobile.length < 8) {
    return {
      ok: false,
      message: "payment_profile_incomplete",
      code: "profile_incomplete",
    };
  }

  const packageRef = String(
    result.data?.id ?? result.data?.sale?.id ?? packageIds.join("-")
  );
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const returnPath = typeof window !== "undefined" ? window.location.pathname : "";
  const callbackQuery = packageRef
    ? `?payment=success&package=${encodeURIComponent(packageRef)}`
    : "?payment=success";

  const payment = await initiateMyFatoorahPayment({
    customerName,
    customerEmail,
    mobileCountryCode: countryCode || "971",
    customerMobile,
    invoiceValue: totalPrice,
    customerReference: packageRef || undefined,
    invoiceItems: buildPackageInvoiceItems(centerName, packages),
    callBackUrl: `${origin}${returnPath}${callbackQuery}`,
    errorUrl: `${origin}${returnPath}?payment=error`,
    language: locale === "ar" ? "ar" : "en",
  });

  if (payment.IsSuccess && payment.Data?.InvoiceURL) {
    window.location.href = payment.Data.InvoiceURL;
    return { ok: true, redirected: true };
  }

  return { ok: false, message: payment.Message || "payment_failed" };
}

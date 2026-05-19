import { fetchUserProfile, storePackages } from "@/lib/api";
import type { CenterPackage } from "@/lib/apiEndpoints";

export type PackagePaymentType = "wallet" | "service_cash";

export const PACKAGE_PAYMENT_TYPES: PackagePaymentType[] = [
  "wallet",
  "service_cash",
];

export function isPackagePaymentType(value: string): value is PackagePaymentType {
  return PACKAGE_PAYMENT_TYPES.includes(value as PackagePaymentType);
}

export type PackagePurchaseResult =
  | { ok: true; message?: string }
  | {
      ok: true;
      needsEmbeddedPayment: true;
      amount: number;
      customerReference: string;
      message?: string;
    }
  | {
      ok: false;
      message: string;
      code?: "insufficient_balance" | "profile_incomplete";
    };

/**
 * Wallet: deduct via API immediately.
 * service_cash: store package on Laravel, then open embedded MyFatoorah (fresh session per attempt).
 */
export async function purchasePackagesWithPayment(input: {
  token: string;
  centerId: number;
  centerName: string;
  packageIds: number[];
  packages: Pick<CenterPackage, "id" | "name" | "price">[];
  paymentType: PackagePaymentType;
}): Promise<PackagePurchaseResult> {
  const { token, centerId, packageIds, packages, paymentType } = input;

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

  if (paymentType === "service_cash") {
    const packageRef = String(
      result.data?.id ?? result.data?.sale?.id ?? packageIds.join("-")
    );
    return {
      ok: true,
      needsEmbeddedPayment: true,
      amount: totalPrice,
      customerReference: packageRef,
      message: result.message,
    };
  }

  return { ok: true, message: result.message };
}

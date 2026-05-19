/**
 * MyFatoorah Embedded Payment V3 (Mode 1: COMPLETE_PAYMENT)
 *
 * Unlike legacy Send Payment (invoice URL redirect), embedded sessions:
 * - Create a short-lived SessionId on the backend
 * - Render the card form inside your page via session.js
 * - Complete payment in-place; callback receives the result
 *
 * SessionId is SINGLE-USE — always call create-session again before each init.
 * Frontend success is not final: verify payment on Laravel before fulfilling orders.
 */

/** Test: demo.myfatoorah.com — Production UAE: ae.myfatoorah.com */
export const MYFATOORAH_SESSION_SCRIPT_URL =
  process.env.NEXT_PUBLIC_MYFATOORAH_SESSION_SCRIPT_URL ||
  "https://demo.myfatoorah.com/sessions/v1/session.js";

export const MYFATOORAH_SESSION_SCRIPT_PRODUCTION =
  "https://ae.myfatoorah.com/sessions/v1/session.js";

export interface MyFatoorahSessionOrder {
  Amount: number;
  Currency: string;
}

export interface MyFatoorahSessionData {
  SessionId: string;
  SessionExpiry: string;
  EncryptionKey: string;
  OperationType: string;
  Order: MyFatoorahSessionOrder;
}

export interface CreatePaymentSessionApiResponse {
  message: string;
  data: {
    IsSuccess: boolean;
    Message?: string;
    Data: MyFatoorahSessionData;
  };
}

export interface CreatePaymentSessionInput {
  amount: number;
  currency?: string;
  customer_reference?: string;
  center_id?: number;
  /** Optional metadata for Laravel to attach to the session/order */
  metadata?: Record<string, string | number | boolean>;
}

export interface MyFatoorahPaymentCallbackPayload {
  isSuccess?: boolean;
  IsSuccess?: boolean;
  paymentCompleted?: boolean;
  PaymentCompleted?: boolean;
  redirectionUrl?: string;
  RedirectionUrl?: string;
  message?: string;
  Message?: string;
  invoiceId?: number;
  InvoiceId?: number;
  paymentId?: string;
  PaymentId?: string;
  sessionId?: string;
  [key: string]: unknown;
}

export interface MyFatoorahInitConfig {
  sessionId: string;
  containerId: string;
  shouldHandlePaymentUrl: boolean;
  callback: (response: MyFatoorahPaymentCallbackPayload) => void;
}

export function isMyFatoorahPaymentSuccess(
  response: MyFatoorahPaymentCallbackPayload
): boolean {
  const success = response.isSuccess ?? response.IsSuccess;
  const completed = response.paymentCompleted ?? response.PaymentCompleted;
  if (typeof completed === "boolean") return completed && (success !== false);
  if (typeof success === "boolean") return success;
  return false;
}

export function parsePaymentCallback(
  response: MyFatoorahPaymentCallbackPayload
): {
  success: boolean;
  paymentCompleted: boolean;
  redirectionUrl?: string;
  message?: string;
  raw: MyFatoorahPaymentCallbackPayload;
} {
  const success = isMyFatoorahPaymentSuccess(response);
  const paymentCompleted = Boolean(
    response.paymentCompleted ?? response.PaymentCompleted ?? success
  );
  return {
    success,
    paymentCompleted,
    redirectionUrl:
      (response.redirectionUrl as string) ||
      (response.RedirectionUrl as string) ||
      undefined,
    message:
      (response.message as string) || (response.Message as string) || undefined,
    raw: response,
  };
}

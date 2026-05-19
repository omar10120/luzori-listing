"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPaymentSession } from "@/lib/api";
import {
  MYFATOORAH_SESSION_SCRIPT_URL,
  parsePaymentCallback,
  type CreatePaymentSessionInput,
  type MyFatoorahInitConfig,
  type MyFatoorahPaymentCallbackPayload,
} from "@/lib/myfatoorah";

declare global {
  interface Window {
    myfatoorah?: {
      init: (config: MyFatoorahInitConfig) => void;
    };
  }
}

export type EmbeddedPaymentStatus =
  | "idle"
  | "loading_script"
  | "creating_session"
  | "ready"
  | "processing"
  | "success"
  | "failed"
  | "error";

export interface UseMyFatoorahEmbeddedPaymentOptions {
  /** When true, fetches a new session and initializes the widget */
  active: boolean;
  amount: number;
  currency?: string;
  customerReference?: string;
  centerId?: number;
  metadata?: CreatePaymentSessionInput["metadata"];
  scriptLoaded: boolean;
  onComplete?: (result: ReturnType<typeof parsePaymentCallback>) => void;
  onError?: (message: string) => void;
}

export function useMyFatoorahEmbeddedPayment({
  active,
  amount,
  currency = "AED",
  customerReference,
  centerId,
  metadata,
  scriptLoaded,
  onComplete,
  onError,
}: UseMyFatoorahEmbeddedPaymentOptions) {
  const reactId = useId();
  const containerId = `mf-embedded-${reactId.replace(/:/g, "")}`;
  const initializedSessionRef = useRef<string | null>(null);
  const initGenerationRef = useRef(0);

  const [status, setStatus] = useState<EmbeddedPaymentStatus>("idle");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastCallback, setLastCallback] =
    useState<MyFatoorahPaymentCallbackPayload | null>(null);

  const reset = useCallback(() => {
    initGenerationRef.current += 1;
    initializedSessionRef.current = null;
    setSessionId(null);
    setErrorMessage(null);
    setLastCallback(null);
    setStatus("idle");

    const el = document.getElementById(containerId);
    if (el) el.innerHTML = "";
  }, [containerId]);

  const createSession = useCallback(async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      const msg = "login_required";
      setErrorMessage(msg);
      setStatus("error");
      onError?.(msg);
      return null;
    }

    if (!amount || amount <= 0) {
      const msg = "Invalid payment amount";
      setErrorMessage(msg);
      setStatus("error");
      onError?.(msg);
      return null;
    }

    setStatus("creating_session");
    setErrorMessage(null);

    const result = await createPaymentSession(token, {
      amount,
      currency,
      customer_reference: customerReference,
      center_id: centerId,
      metadata,
    });

    if (!result.success || !result.sessionId) {
      const msg = result.message || "payment_session_failed";
      setErrorMessage(msg);
      setStatus("error");
      onError?.(msg);
      return null;
    }

    setSessionId(result.sessionId);
    return result.sessionId;
  }, [amount, currency, customerReference, centerId, metadata, onError]);

  const initWidget = useCallback(
    (sid: string) => {
      if (!window.myfatoorah?.init) {
        setErrorMessage("MyFatoorah script not loaded");
        setStatus("error");
        return;
      }

      if (initializedSessionRef.current === sid) return;

      const el = document.getElementById(containerId);
      if (el) el.innerHTML = "";

      const generation = initGenerationRef.current;

      window.myfatoorah.init({
        sessionId: sid,
        containerId,
        shouldHandlePaymentUrl: true,
        callback: (response: MyFatoorahPaymentCallbackPayload) => {
          if (generation !== initGenerationRef.current) return;

          console.info("[MyFatoorah] Payment callback:", response);
          setLastCallback(response);
          setStatus("processing");

          const parsed = parsePaymentCallback(response);
          setLastCallback(parsed.raw);

          if (parsed.success && parsed.paymentCompleted) {
            setStatus("success");
            onComplete?.(parsed);
            return;
          }

          if (parsed.redirectionUrl && !parsed.paymentCompleted) {
            setStatus("processing");
            return;
          }

          setStatus("failed");
          setErrorMessage(parsed.message || "payment_failed");
          onError?.(parsed.message || "payment_failed");
        },
      });

      initializedSessionRef.current = sid;
      setStatus("ready");
    },
    [containerId, onComplete, onError]
  );

  const startPayment = useCallback(async () => {
    reset();
    initGenerationRef.current += 1;
    initializedSessionRef.current = null;

    if (!scriptLoaded) {
      setStatus("loading_script");
      return;
    }

    const sid = await createSession();
    if (!sid) return;
    initWidget(sid);
  }, [createSession, initWidget, reset, scriptLoaded]);

  const retry = useCallback(() => {
    void startPayment();
  }, [startPayment]);

  useEffect(() => {
    if (!active) {
      reset();
      return;
    }

    if (!scriptLoaded) {
      setStatus("loading_script");
      return;
    }

    void startPayment();
    // Only re-run when payment panel opens or script finishes loading
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, scriptLoaded]);

  useEffect(() => {
    return () => {
      initGenerationRef.current += 1;
      initializedSessionRef.current = null;
    };
  }, []);

  return {
    containerId,
    status,
    sessionId,
    errorMessage,
    lastCallback,
    retry,
    reset,
    startPayment,
  };
}

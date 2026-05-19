"use client";

import React, { useEffect, useState } from "react";
import Script from "next/script";

const TEST_SESSION_ID =
  "KWT-01e782d0-b8ad-473f-b0aa-e78777f330d4";

declare global {
  interface Window {
    myfatoorah: any;
  }
}

const Payment = () => {

  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (!scriptLoaded) return;

    if (!window.myfatoorah) {
      console.log("MyFatoorah not found");
      return;
    }

    const config = {
      sessionId: TEST_SESSION_ID,
      containerId: "embedded-sessions",
      callback: (response: any) => {
        console.log("Payment Response:", response);
      },
      shouldHandlePaymentUrl: true,
    };

    window.myfatoorah.init(config);

    console.log("MyFatoorah initialized");
  }, [scriptLoaded]);


  return (
    <section className="py-20">
    <Script
      src="https://demo.myfatoorah.com/sessions/v1/session.js"
      strategy="afterInteractive"
      onLoad={() => {
        console.log("Script Loaded");
        setScriptLoaded(true);
      }}
    />

    <div
      id="embedded-sessions"
      className="max-w-md mx-auto"
    ></div>
  
  </section>
  )
}

export default Payment




import { NextRequest, NextResponse } from "next/server";
import {
  buildSendPaymentPayload,
  sendMyFatoorahPayment,
  type MyFatoorahInvoiceItem,
} from "@/lib/myfatoorah";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      customerName?: string;
      customerEmail?: string;
      mobileCountryCode?: string;
      customerMobile?: string;
      invoiceValue?: number;
      customerReference?: string;
      invoiceItems?: MyFatoorahInvoiceItem[];
      callBackUrl?: string;
      errorUrl?: string;
      language?: "en" | "ar";
    };

    const customerName = body.customerName?.trim();
    const customerEmail = body.customerEmail?.trim();
    const customerMobile = body.customerMobile?.trim();
    const invoiceValue = Number(body.invoiceValue);
    const invoiceItems = body.invoiceItems ?? [];

    if (!customerName || !customerEmail || !customerMobile) {
      return NextResponse.json(
        { IsSuccess: false, Message: "Customer name, email and mobile are required." },
        { status: 400 }
      );
    }

    if (!Number.isFinite(invoiceValue) || invoiceValue <= 0) {
      return NextResponse.json(
        { IsSuccess: false, Message: "Invalid invoice value." },
        { status: 400 }
      );
    }

    if (!invoiceItems.length) {
      return NextResponse.json(
        { IsSuccess: false, Message: "At least one invoice item is required." },
        { status: 400 }
      );
    }

    const payload = buildSendPaymentPayload({
      customerName,
      customerEmail,
      mobileCountryCode: body.mobileCountryCode || "971",
      customerMobile,
      invoiceValue,
      customerReference: body.customerReference,
      invoiceItems,
      callBackUrl: body.callBackUrl,
      errorUrl: body.errorUrl,
      language: body.language,
    });

    const result = await sendMyFatoorahPayment(payload);
    return NextResponse.json(result, { status: result.IsSuccess ? 200 : 422 });
  } catch (err) {
    console.error("[MyFatoorah SendPayment]", err);
    return NextResponse.json(
      {
        IsSuccess: false,
        Message:
          err instanceof Error ? err.message : "Payment gateway error",
      },
      { status: 500 }
    );
  }
}

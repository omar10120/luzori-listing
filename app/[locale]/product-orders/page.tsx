"use client";

import React, { useState } from "react";
import Container from "@/components/ui/Container";
import AccountSidebar from "@/components/account/AccountSidebar";
import ProductOrdersClient from "@/features/products/ProductOrdersClient";

export default function ProductOrdersPage() {
  const [userName, setUserName] = useState<string | undefined>();

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-20">
      <Container>
        <div className="flex flex-col gap-12 lg:flex-row">
          <AccountSidebar userName={userName} />
          <ProductOrdersClient onUserLoaded={setUserName} />
        </div>
      </Container>
    </div>
  );
}

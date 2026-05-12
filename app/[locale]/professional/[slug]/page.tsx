import React, { Suspense } from "react";
import ProfessionalPageClient from "./ProfessionalPageClient";

interface Props {
  params: Promise<{ slug: string; locale: string }>;
}

function Fallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-[#F7F7F7]">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#225D5C] border-t-transparent" />
    </div>
  );
}

export default async function ProfessionalPage({ params }: Props) {
  const { slug } = await params;
  return (
    <Suspense fallback={<Fallback />}>
      <ProfessionalPageClient slug={slug} />
    </Suspense>
  );
}

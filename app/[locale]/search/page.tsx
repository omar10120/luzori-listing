import React, { Suspense } from "react";
import SearchPageClient from "./SearchPageClient";

function SearchFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-[#F7F7F7]">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#225D5C] border-t-transparent" />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchFallback />}>
      <SearchPageClient />
    </Suspense>
  );
}

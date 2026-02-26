"use client";

import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import Card from "@/components/ui/Card";
import type { Business } from "@/lib/types";

interface BusinessCardScrollProps {
    heading: string;
    businesses: Business[];
}

const BusinessCardScroll: React.FC<BusinessCardScrollProps> = ({
    heading,
    businesses,
}) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: "left" | "right") => {
        if (!scrollRef.current) return;
        const amount = 300;
        scrollRef.current.scrollBy({
            left: direction === "left" ? -amount : amount,
            behavior: "smooth",
        });
    };

    return (
        <section className="py-10 sm:py-14">
            <Container>
                <div className="flex items-end justify-between">
                    <SectionHeader heading={heading} className="mb-0 sm:mb-0" />
                    <div className="hidden gap-2 sm:flex">
                        <button
                            type="button"
                            onClick={() => scroll("left")}
                            aria-label="Scroll left"
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            type="button"
                            onClick={() => scroll("right")}
                            aria-label="Scroll right"
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </Container>

            <div className="mt-5">
                <div
                    ref={scrollRef}
                    className="scrollbar-hide flex gap-4 overflow-x-auto px-4 pb-2 sm:px-6 lg:px-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))]"
                >
                    {businesses.map((biz) => (
                        <Card key={biz.id} business={biz} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default BusinessCardScroll;

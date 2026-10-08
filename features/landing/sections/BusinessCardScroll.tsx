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
        <section className="py-6 sm:py-4">
            <Container>
                <div className="flex items-end justify-between">
                    <SectionHeader heading={heading} className="mb-0 sm:mb-0 text-[#F5DBBA]" />
                    <div className="hidden gap-2 sm:flex">
                        <button
                            type="button"
                            onClick={() => scroll("left")}
                            aria-label="Scroll left"
                            className="flex h-9 w-9 items-center justify-center rounded-full border transition-colors hover:bg-[#1a4a49] bg-[#225D5C] text-[#F5DBBA]"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            type="button"
                            onClick={() => scroll("right")}
                            aria-label="Scroll right"
                            className="flex h-9 w-9 items-center justify-center rounded-full border transition-colors hover:bg-[#1a4a49] bg-[#225D5C] text-[#F5DBBA]"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </Container>

            <div className="mt-5">
                <div
                    ref={scrollRef}
                    className="scrollbar-hide flex gap-4 overflow-x-auto px-4 pb-4 scroll-px-4 sm:px-6 sm:scroll-px-6 lg:px-8 lg:scroll-px-8 snap-x snap-mandatory"
                >
                    {businesses.map((biz) => (
                        <div key={biz.id} className="snap-start shrink-0">
                            <Card business={biz} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default BusinessCardScroll;
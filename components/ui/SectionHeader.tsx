"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
    heading: string;
    subtitle?: string;
    className?: string;
    centered?: boolean;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
    heading,
    subtitle,
    className,
    centered = false,
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className={cn(
                "mb-6 sm:mb-8",
                centered && "text-center",
                className
            )}
        >
            <h2 className="text-2xl font-bold tracking-tight  sm:text-3xl  text-[#225D5C]">
                {heading}
            </h2>
            {subtitle && (
                <p className="mt-2 max-w-2xl text-base text-gray-500 sm:text-lg">
                    {subtitle}
                </p>
            )}
        </motion.div>
    );
};

export default SectionHeader;

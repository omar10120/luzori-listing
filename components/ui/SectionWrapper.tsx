"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionWrapperProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * SectionWrapper
 * A premium wrapper that handles section entrance animations 
 * and ensures content is centered with a refined container width.
 * "Enter" refers to the subtle entrance animation and standard containment.
 */
const SectionWrapper: React.FC<SectionWrapperProps> = ({
    children,
    className,
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{
                duration: 0.7,
                ease: [0.21, 0.47, 0.32, 0.98] // Premium cubic-bezier
            }}
            className={cn("w-full py-2 sm:py-4", className)}
        >
            <div className="mx-auto max-w-7xl">
                {children}
            </div>
        </motion.div>
    );
};

export default SectionWrapper;

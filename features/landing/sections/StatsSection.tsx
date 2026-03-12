"use client";

import React from "react";
import {
    motion,
    useInView,
    useMotionValue,
    useTransform,
    animate,
} from "framer-motion";
import Container from "@/components/ui/Container";
import { stats } from "@/data/mockData";
import { STATS_HEADING, STATS_SUBTITLE } from "@/lib/constants";
import type { Stat } from "@/lib/types";
import { useTranslations } from "next-intl";

/* ─── Animated counter ─── */
interface CounterProps {
    stat: Stat;
}

const Counter: React.FC<CounterProps> = ({ stat }) => {
    const ref = React.useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });
    const motionVal = useMotionValue(0);

    const rounded = useTransform(motionVal, (v) => {
        if (stat.numericValue >= 1_000_000) {
            return `${Math.floor(v)}`;
        }
        return Math.floor(v).toLocaleString();
    });

    React.useEffect(() => {
        if (!isInView) return;
        const controls = animate(motionVal, stat.numericValue, {
            duration: 2,
            ease: "easeOut",
        });
        return controls.stop;
    }, [isInView, motionVal, stat.numericValue]);

    /* Large numbers with billion suffix */
    const isLargeNum = stat.numericValue >= 1_000_000;

    return (

        <div className="flex flex-col items-center gap-1">
            <span className="flex items-baseline gap-1 text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
                <motion.span ref={ref}>{rounded}</motion.span>
                <span>{stat.suffix}</span>
            </span>
            <span className="text-sm text-gray-500">{stat.label}</span>
        </div>
    );
};

/* ─── Stats section ─── */
const StatsSection: React.FC = () => {
    const t = useTranslations();
    return (
        <section className="py-16 sm:py-24">
            <Container className="text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">
                        {t('top_rated_destination')}
                    </h2>
                    <p className="mx-auto mt-3 max-w-xl text-base text-gray-500 sm:text-lg">
                        {t('platform_subtitle')}
                    </p>
                </motion.div>

                {/* Featured stat */}
                <div className="mt-10">
                    <Counter stat={stats[0]} />
                </div>

                {/* Remaining stats row */}
                <div className="mt-10 flex flex-wrap items-start justify-center gap-10 sm:gap-16">
                    {stats.slice(1).map((s) => (
                        <Counter key={s.id} stat={s} />
                    ))}
                </div>
            </Container>
        </section>
    );
};

export default StatsSection;

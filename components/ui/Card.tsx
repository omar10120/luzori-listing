"use client";

import React from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import RatingStars from "./RatingStars";
import Badge from "./Badge";
import { cn } from "@/lib/utils";
import type { Business } from "@/lib/types";
import Link from "next/link";

interface CardProps {
    business: Business;
    className?: string;
}

const Card: React.FC<CardProps> = ({ business, className }) => {
    const { id, name, location, category, rating, reviewCount, image, isNew, isTrending } =
        business;

    return (
        <Link href={`/center/${id}`} className="contents">
            <motion.article
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className={cn(
                    "group flex w-64 shrink-0 cursor-pointer flex-col overflow-hidden rounded-2xl ring-gray-100 transition-shadow hover:shadow-md sm:w-72 ",
                    className
                )}
            >
                {/* Image */}
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <img
                        src={image}
                        alt={name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                    />
                    {/* Badges */}
                    <div className="absolute left-3 top-3 flex gap-1.5">
                        {isNew && <Badge variant="new">New</Badge>}
                        {isTrending && <Badge variant="trending">Trending</Badge>}
                    </div>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col gap-1.5 p-4  ">
                    <h3 className="text-sm font-bold line-clamp-1 text-[#225D5C]  ">
                        {name}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin size={12} className="shrink-0" />
                        <span className="line-clamp-1 text-black font-bold">{location}</span>
                    </div>
                    <span className="text-xs text-gray-400">{category}</span>
                    <div className="mt-auto flex items-center gap-2 pt-2">
                        <RatingStars rating={rating} size={12} />
                        <span className="text-xs font-medium text-black-700">
                            {rating}
                        </span>
                        <span className="text-xs text-gray-400">
                            ({reviewCount.toLocaleString()})
                        </span>
                    </div>
                </div>
            </motion.article>
        </Link>
    );
};

export default Card;

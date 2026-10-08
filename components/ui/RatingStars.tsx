import React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
    rating: string | null;
    maxStars?: number;
    size?: number;
    className?: string;
}

const RatingStars: React.FC<RatingStarsProps> = ({
    rating,
    maxStars = 5,
    size = 14,
    className,
}) => {
    return (
        <div
            className={cn("flex items-center gap-0.5", className)}
            aria-label={`Rating: ${rating} out of ${maxStars} stars`}
        >
            {Array.from({ length: maxStars }, (_, i) => {
                const filled = i < Number(rating ?? 0);
                const halfFilled = !filled && i < Number(rating ?? 0);

                return (
                    <Star
                        key={i}
                        size={size}
                        className={cn(
                            "shrink-0",
                            filled
                                ? "fill-amber-400 text-amber-400"
                                : halfFilled
                                    ? "fill-amber-200 text-amber-400"
                                    : "fill-gray-200 text-gray-200"
                        )}
                    />
                );
            })}
        </div>
    );
};

export default RatingStars;

import React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "new" | "trending";

interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
    className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
    default:
        "bg-gray-100 text-gray-700",
    new: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    trending: "bg-purple-50 text-purple-700 border border-purple-200",
};

const Badge: React.FC<BadgeProps> = ({
    children,
    variant = "default",
    className,
}) => {
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                variantStyles[variant],
                className
            )}
        >
            {children}
        </span>
    );
};

export default Badge;

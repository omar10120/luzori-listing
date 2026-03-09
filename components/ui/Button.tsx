import React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    children: React.ReactNode;
    className?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
    primary:
        "bg-gray-900 text-white hover:bg-gray-800 shadow-sm",
    secondary:
        "bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 shadow-sm",
    outline:
        "border border-gray-300 text-gray-700 hover:bg-gray-50",
    ghost:
        "text-gray-700 hover:bg-gray-100",
};

const sizeStyles: Record<ButtonSize, string> = {
    sm: "px-3 py-1.5 text-sm rounded-full",
    md: "px-5 py-2.5 text-sm rounded-xl",
    lg: "px-7 py-3 text-base rounded-xl",
};

const Button: React.FC<ButtonProps> = ({
    variant = "primary",
    size = "md",
    children,
    className,
    ...props
}) => {
    return (
        <button
            className={cn(
                "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                variantStyles[variant],
                sizeStyles[size],
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;

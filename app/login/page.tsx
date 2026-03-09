"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import Container from "@/components/ui/Container";
import { loginCenter } from "@/lib/api";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const LoginPage = () => {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatusMessage(null);

        try {
            console.log("Submitting login...");
            const result = await loginCenter(formData);

            if (result.success) {
                setStatusMessage({ type: 'success', text: result.message });
                // Redirect after success (e.g., to dashboard or home)
                setTimeout(() => router.push("/"), 2000);
            } else {
                console.error("Login failed:", result.message);
                setStatusMessage({ type: 'error', text: result.message });
            }
        } catch (error) {
            console.error("Submission error:", error);
            setStatusMessage({ type: 'error', text: "Connection error. Please try again." });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center py-20 px-4 overflow-hidden bg-[#0a192f]">
            {/* Dynamic Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/40 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/30 rounded-full blur-[120px]" />
                {/* Particle effect simulation overlay */}
                <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
            </div>

            <Container className="relative z-10 max-w-md w-full">
                {/* Logo Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center mb-10"
                >
                    <Link href="/" className="text-4xl font-light tracking-[0.2em] text-white flex flex-col items-center leading-none hover:opacity-80 transition-opacity">
                        <Image src="/logo.svg" alt="Logo" width={150} height={150} />
                    </Link>
                </motion.div>

                {/* Glassmorphism Form Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2rem] p-8 md:p-12 shadow-2xl overflow-hidden"
                >
                    <h1 className="text-2xl font-medium text-white text-center mb-2">Welcome Back</h1>
                    <p className="text-sm text-gray-400 text-center mb-10">Login to manage your business</p>

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Username / Email */}
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-300 ml-1">Username / Email</label>
                            <input
                                type="text"
                                placeholder="name@domain.com"
                                className="w-full bg-[#f3d3b0]/90 border-none rounded py-1 px-2 text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-[#d4af37] transition-all outline-none text-sm font-medium"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-300 ml-1">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="w-full bg-[#f3d3b0]/90 border-none rounded py-1 px-2 text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-[#d4af37] transition-all outline-none text-sm font-medium"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Status Message */}
                        <AnimatePresence>
                            {statusMessage && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10, height: 0 }}
                                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                                    exit={{ opacity: 0, y: -10, height: 0 }}
                                    className={cn(
                                        "p-4 rounded-xl text-center text-xs font-medium backdrop-blur-md border overflow-hidden",
                                        statusMessage.type === 'success'
                                            ? "bg-green-500/20 text-green-200 border-green-500/30"
                                            : "bg-red-500/20 text-red-200 border-red-500/30"
                                    )}
                                >
                                    {statusMessage.text}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Submit Button */}
                        <div className="flex flex-col items-center pt-4 gap-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={cn(
                                    "w-full bg-[#2a5a54] hover:bg-[#1f4540] text-white text-base py-1 px-2 rounded-full shadow-lg transition-all active:scale-24 disabled:opacity-70 disabled:cursor-not-allowed font-medium",
                                    !isSubmitting && "hover:scale-105"
                                )}
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Logging in...
                                    </div>
                                ) : "Login"}
                            </button>

                            <div className="text-sm text-gray-400">
                                Don't have an account?{' '}
                                <Link href="/register" className="text-[#d4af37] hover:underline font-medium transition-colors">
                                    Register here
                                </Link>
                            </div>
                        </div>
                    </form>
                </motion.div>
            </Container>
        </div>
    );
};

export default LoginPage;

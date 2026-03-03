"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Camera, Upload, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import Container from "@/components/ui/Container";
import { registerCenter } from "@/lib/api";
import { useRouter } from "next/navigation";
import Image from "next/image";
const RegisterPage = () => {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [logo, setLogo] = useState<File | null>(null);
    const [primaryImage, setPrimaryImage] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        domain: "",
        email: "",
        country_code: "971",
        phone: "",
        password: "",
        password_confirmation: "",
        currency: "AED",
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'primary') => {
        if (e.target.files && e.target.files[0]) {
            if (type === 'logo') setLogo(e.target.files[0]);
            else setPrimaryImage(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatusMessage(null);

        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            data.append(key, value);
        });

        if (logo) data.append("logo", logo);
        if (primaryImage) data.append("primary_image", primaryImage);

        try {
            const result = await registerCenter(data);
            if (result.success) {
                setStatusMessage({ type: 'success', text: result.message });
                // Redirect after success
                setTimeout(() => router.push("/"), 2000);
            } else {
                setStatusMessage({ type: 'error', text: result.message });
            }
        } catch (error) {
            setStatusMessage({ type: 'error', text: "An unexpected error occurred" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center py-20 px-4 overflow-hidden bg-[#0a192f]">
            {/* Dynamic Background (Reflecting the design image) */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/40 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/30 rounded-full blur-[120px]" />
                {/* Particle effect simulation overlay */}
                <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
            </div>

            <Container className="relative z-10 max-w-4xl">
                {/* Logo Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center mb-10"
                >
                    <div className="text-4xl font-light tracking-[0.2em] text-white flex flex-col items-center leading-none">

                        <Image src="logo.svg" alt="Logo" width={200} height={200} />

                    </div>
                </motion.div>

                {/* Glassmorphism Form Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2rem] p-8 md:p-12 shadow-2xl overflow-hidden"
                >
                    <h1 className="text-2xl font-medium text-white text-center mb-10">Register</h1>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-7">
                            {/* Name Center */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 ml-1">Name Center</label>
                                <input
                                    type="text"
                                    placeholder="name of center"
                                    className="w-full bg-[#f3d3b0]/90 border-none rounded-2xl py-2 px-4 text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-[#d4af37] transition-all outline-none"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            {/* Domain Center */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 ml-1">Domain Center</label>
                                <input
                                    type="text"
                                    placeholder="center-name"
                                    className="w-full bg-[#f3d3b0]/90 border-none rounded-2xl py-2 px-4 text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-[#d4af37] transition-all outline-none"
                                    value={formData.domain}
                                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                                />
                            </div>

                            {/* Email Center */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 ml-1">Email Center</label>
                                <input
                                    type="email"
                                    placeholder="[EMAIL_ADDRESS]"
                                    className="w-full bg-[#f3d3b0]/90 border-none rounded-2xl py-2 px-4 text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-[#d4af37] transition-all outline-none"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            {/* Phone Center */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 ml-1">Phone Center</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pr-3 border-r border-gray-400">
                                        <Image src="https://flagcdn.com/ae.svg" width={200} height={200} alt="UAE" className="w-5 h-3 object-cover rounded-sm" />
                                        <span className="text-sm font-semibold text-gray-700">+971</span>
                                        <ChevronDown size={14} className="text-gray-500" />
                                    </div>
                                    <input
                                        type="tel"
                                        placeholder="503140232"
                                        className="w-full bg-[#f3d3b0]/90 border-none rounded-2xl py-2 pl-32 pr-4 text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-[#d4af37] transition-all outline-none font-semibold"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="************"
                                        className="w-full bg-[#f3d3b0]/90 border-none rounded-2xl py-2 px-4 text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-[#d4af37] transition-all outline-none"
                                        value={formData.password}
                                        onChange={(e) => {
                                            setFormData({ ...formData, password: e.target.value, password_confirmation: e.target.value });
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            {/* Currency */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 ml-1">Currency</label>
                                <div className="relative">
                                    <select
                                        className="w-full bg-[#f3d3b0]/90 border-none rounded-2xl py-2 px-4 text-gray-900 appearance-none focus:ring-2 focus:ring-[#d4af37] transition-all outline-none font-medium"
                                        value={formData.currency}
                                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                    >
                                        <option value="AED">AED</option>
                                        <option value="USD">USD</option>
                                        <option value="EUR">EUR</option>
                                    </select>
                                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* Image Uploads */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                            {/* Logo Upload */}
                            <div className="space-y-3">
                                <span className="text-sm font-medium text-gray-300">Logo Center</span>
                                <label className="group relative flex flex-col items-center justify-center w-full h-32 bg-white/5 border-2 border-dashed border-white/20 rounded-2xl cursor-pointer hover:bg-white/10 hover:border-[#d4af37]/50 transition-all overflow-hidden">
                                    {logo ? (
                                        <img src={URL.createObjectURL(logo)} className="absolute inset-0 w-full h-full object-cover" alt="Logo preview" />
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <Camera className="text-gray-400 group-hover:text-[#d4af37] mb-2 transition-colors" />
                                            <span className="text-xs text-gray-400 uppercase tracking-wider">Select Logo</span>
                                        </div>
                                    )}
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'logo')} />
                                </label>
                            </div>

                            {/* Primary Image Upload */}
                            <div className="space-y-3">
                                <span className="text-sm font-medium text-gray-300">Primary Image</span>
                                <label className="group relative flex flex-col items-center justify-center w-full h-32 bg-white/5 border-2 border-dashed border-white/20 rounded-2xl cursor-pointer hover:bg-white/10 hover:border-[#d4af37]/50 transition-all overflow-hidden">
                                    {primaryImage ? (
                                        <img src={URL.createObjectURL(primaryImage)} className="absolute inset-0 w-full h-full object-cover" alt="Primary preview" />
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <Upload className="text-gray-400 group-hover:text-[#d4af37] mb-2 transition-colors" />
                                            <span className="text-xs text-gray-400 uppercase tracking-wider">Primary Image</span>
                                        </div>
                                    )}
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'primary')} />
                                </label>
                            </div>
                        </div>

                        {/* Status Message */}
                        {statusMessage && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={cn(
                                    "p-4 rounded-xl text-center text-sm font-medium backdrop-blur-md border",
                                    statusMessage.type === 'success'
                                        ? "bg-green-500/20 text-green-200 border-green-500/30"
                                        : "bg-red-500/20 text-red-200 border-red-500/30"
                                )}
                            >
                                {statusMessage.text}
                            </motion.div>
                        )}

                        {/* Submit Button */}
                        <div className="flex justify-center pt-6">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={cn(
                                    "bg-[#2a5a54] hover:bg-[#1f4540] text-white font-semibold text-lg py-4 px-20 rounded-full shadow-lg transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed",
                                    !isSubmitting && "hover:scale-105"
                                )}
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Connecting...
                                    </div>
                                ) : "Register"}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </Container>
        </div>
    );
};

export default RegisterPage;

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Camera, Upload, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import Container from "@/components/ui/Container";
import { registerUser } from "@/lib/api";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";
import GoogleLoginButton from "@/components/auth/GoogleLoginButton";

const COUNTRIES = [
    { name: "UAE", code: "971", flag: "https://flagcdn.com/ae.svg" },
    { name: "Saudi Arabia", code: "966", flag: "https://flagcdn.com/sa.svg" },
    { name: "Qatar", code: "974", flag: "https://flagcdn.com/qa.svg" },
    { name: "Kuwait", code: "965", flag: "https://flagcdn.com/kw.svg" },
    { name: "Oman", code: "968", flag: "https://flagcdn.com/om.svg" },
    { name: "Bahrain", code: "973", flag: "https://flagcdn.com/bh.svg" },
];

const RegisterPage = () => {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [logo, setLogo] = useState<File | null>(null);
    const [primaryImage, setPrimaryImage] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        country_code: "971",
        phone: "",
        password: "",
        password_confirmation: "",
        address: "",
        birth: "",
        gender: "",
    });

    const selectedCountry = COUNTRIES.find(c => c.code === formData.country_code) || COUNTRIES[0];

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
            if (key === "country_code") {
                data.append(key, `+${value}`);
            } else {
                data.append(key, value ?? "");
            }
        });

        if (logo) data.append("image", logo);

        try {
            const result = await registerUser(data);
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
                {/* <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" /> */}
                <div className="absolute inset-0 opacity-30 bg-[url('/background.jpg')] bg-cover bg-center bg-no-repeat" />
            </div>

            <Container className="relative z-10 max-w-4xl">
                {/* Logo Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center mb-10"
                >
                    <div className="text-4xl font-light tracking-[0.2em] text-white flex flex-col items-center leading-none">

                        <Image src="/logo.svg" alt="Logo" width={150} height={150} />


                    </div>
                </motion.div>

                {/* Glassmorphism Form Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2rem] p-8 md:p-12 shadow-2xl overflow-hidden"
                >
                    <h1 className="text-xl font-medium text-white text-center mb-10">Sign Up</h1>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-7">
                            {/* First Name */}
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-300 ml-1">First Name</label>
                                <input
                                    type="text"
                                    placeholder="first name"
                                    className="w-full bg-[#f3d3b0]/90 border-none rounded py-1 px-2 text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-[#d4af37] transition-all outline-none  text-sm"
                                    value={formData.first_name}
                                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                />
                            </div>

                            {/* Last Name */}
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-300 ml-1">Last Name</label>
                                <input
                                    type="text"
                                    placeholder="last name"
                                    className="w-full bg-[#f3d3b0]/90 border-none rounded py-1 px-2 text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-[#d4af37] transition-all outline-none  text-sm"
                                    value={formData.last_name}
                                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                />
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-300 ml-1">Email</label>
                                <input
                                    type="email"
                                    placeholder="email"
                                    className="w-full bg-[#f3d3b0]/90 border-none rounded py-1 px-2 text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-[#d4af37] transition-all outline-none  text-sm"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            {/* Phone Number */}
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-300 ml-1">Phone Number</label>
                                <div className="relative">
                                    <div className="absolute left-0 top-0 bottom-0 z-20">
                                        <button
                                            type="button"
                                            onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                                            className="flex h-full items-center gap-2 px-3 border-r border-gray-400 bg-transparent hover:bg-white/5 transition-colors rounded-l transition-all"
                                        >
                                            <div className="relative w-5 h-3">
                                                <Image
                                                    src={selectedCountry.flag}
                                                    alt={selectedCountry.name}
                                                    width={100}
                                                    height={100}
                                                    className="object-cover rounded-sm"
                                                />
                                            </div>
                                            <span className="text-xs font-semibold text-gray-700">+{selectedCountry.code}</span>
                                            <ChevronDown className={cn("text-gray-500 transition-transform duration-200", isCountryDropdownOpen && "rotate-180")} size={12} />
                                        </button>

                                        <AnimatePresence>
                                            {isCountryDropdownOpen && (
                                                <>
                                                    {/* Backdrop to close */}
                                                    <div
                                                        className="fixed inset-0 z-10"
                                                        onClick={() => setIsCountryDropdownOpen(false)}
                                                    />
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                        className="absolute left-0 top-full mt-2 w-56 bg-[#1a2c4e] border border-white/20 backdrop-blur-xl rounded-xl shadow-2xl py-2 z-20"
                                                    >
                                                        {COUNTRIES.map((c) => (
                                                            <button
                                                                key={c.code}
                                                                type="button"
                                                                onClick={() => {
                                                                    setFormData({ ...formData, country_code: c.code });
                                                                    setIsCountryDropdownOpen(false);
                                                                }}
                                                                className={cn(
                                                                    "flex w-full items-center gap-3 px-4 py-3 text-[13px] transition-colors hover:bg-white/10 text-white/90",
                                                                    formData.country_code === c.code && "bg-white/10 text-[#d4af37]"
                                                                )}
                                                            >
                                                                <div className="relative w-5 h-3 flex-shrink-0">
                                                                    <Image
                                                                        src={c.flag}
                                                                        alt={c.name}
                                                                        width={100}
                                                                        height={100}
                                                                        className="object-cover rounded-sm"
                                                                    />
                                                                </div>
                                                                <span className="flex-1 text-left font-medium">{c.name}</span>
                                                                <span className="text-xs opacity-60">+{c.code}</span>
                                                            </button>
                                                        ))}
                                                    </motion.div>
                                                </>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                    <input
                                        type="tel"
                                        placeholder="503140232"
                                        className="w-full bg-[#f3d3b0]/90 border-none rounded py-1 pl-28 pr-4 text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-[#d4af37] transition-all outline-none  text-sm font-semibold"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-xs font-medium text-gray-300 ml-1">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="************"
                                        className="w-full bg-[#f3d3b0]/90 border-none rounded py-1 px-2 text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-[#d4af37] transition-all outline-none  text-sm"
                                        value={formData.password}
                                        onChange={(e) => {
                                            const v = e.target.value;
                                            setFormData({ ...formData, password: v, password_confirmation: v });
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

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-xs font-medium text-gray-300 ml-1">Address</label>
                                <textarea
                                    placeholder="Street, city (optional)"
                                    rows={2}
                                    className="w-full bg-[#f3d3b0]/90 border-none rounded py-2 px-2 text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-[#d4af37] transition-all outline-none text-sm resize-y min-h-[64px]"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-300 ml-1">Date of birth</label>
                                <input
                                    type="date"
                                    className="w-full bg-[#f3d3b0]/90 border-none rounded py-1 px-2 text-gray-900 focus:ring-2 focus:ring-[#d4af37] transition-all outline-none text-sm"
                                    value={formData.birth}
                                    onChange={(e) => setFormData({ ...formData, birth: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-300 ml-1">Gender</label>
                                <select
                                    className="w-full bg-[#f3d3b0]/90 border-none rounded py-1 px-2 text-gray-900 focus:ring-2 focus:ring-[#d4af37] transition-all outline-none text-sm"
                                    value={formData.gender}
                                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                >
                                    <option value="">Prefer not to say</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                            </div>
                        </div>

                        {/* Image Upload */}
                        <div className="pt-4">
                            <div className="space-y-3">
                                <span className="text-xs font-medium text-gray-300">Profile Picture</span>
                                <label className="group relative flex flex-col items-center justify-center w-full h-40 bg-white/5 border-2 border-dashed border-white/20 rounded cursor-pointer hover:bg-white/10 hover:border-[#d4af37]/50 transition-all overflow-hidden  ">
                                    {logo ? (
                                        <Image src={URL.createObjectURL(logo)} className="absolute inset-0 w-full h-full object-contain " width={200} height={200} alt="Profile preview" />
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <Camera className="text-gray-400 group-hover:text-[#d4af37] mb-2 transition-colors" />
                                            <span className="text-xs text-gray-400 uppercase tracking-wider">Select Image</span>
                                        </div>
                                    )}
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'logo')} />
                                </label>
                            </div>
                        </div>

                        {/* Status Message */}
                        {statusMessage && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={cn(
                                    "p-4 rounded-xl text-center text-xs font-medium backdrop-blur-md border",
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
                                    "bg-[#2a5a54] hover:bg-[#1f4540] text-white  text-base py-1 px-3 rounded-full shadow-lg transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed",
                                    !isSubmitting && "hover:scale-105"
                                )}
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center gap-3">
                                        <div className="w-1 h-1 border-1 border-white/30 border-t-white rounded-full animate-spin" />
                                        Connecting...
                                    </div>
                                ) : "Register"}
                            </button>
                        </div>

                        <div className="flex w-full items-center gap-3 py-2 px-8">
                            <div className="h-px flex-1 bg-white/10"></div>
                            <span className="text-xs text-gray-400 uppercase tracking-widest">or</span>
                            <div className="h-px flex-1 bg-white/10"></div>
                        </div>

                        <div className="flex justify-center px-8">
                            <GoogleLoginButton text="Sign up with Google" className="bg-white/50 text-white border-white/20 hover:bg-white/20" />
                        </div>
                    </form>
                </motion.div>
            </Container>
        </div>
    );
};

export default RegisterPage;

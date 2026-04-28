"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ChevronDown, User, Mail, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { registerUser } from "@/lib/api";
import { useRouter } from "next/navigation";
import Image from "next/image";
import GoogleLoginButton from "@/components/auth/GoogleLoginButton";
import { useLocale, useTranslations } from "next-intl";

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
  const locale = useLocale();
  const [showPassword, setShowPassword] = useState(false);
  const [logo, setLogo] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const t = useTranslations();
  const isArabic = locale === "ar";

  const [formData, setFormData] = useState({
    first_name: "",
    email: "",
    country_code: "971",
    phone: "",
    password: "",
    password_confirmation: "",
  });

  const selectedCountry = COUNTRIES.find((c) => c.code === formData.country_code) || COUNTRIES[0];

  useEffect(() => {
    document.body.setAttribute("data-register-page", "true");
    return () => {
      document.body.removeAttribute("data-register-page");
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "country_code") data.append(key, `+${value}`);
      else data.append(key, value ?? "");
    });
    if (logo) data.append("image", logo);
    if (formData.phone.length === 10 && formData.phone.startsWith("05")) {
      data.append("phone", `+${formData.country_code}${formData.phone}`);
    }

    try {
      const result = await registerUser(data);
      if (result.success) {
        setStatusMessage({ type: "success", text: result.message });
        setTimeout(() => router.push("/"), 1500);
      } else {
        setStatusMessage({ type: "error", text: result.message });
      }
    } catch {
      setStatusMessage({ type: "error", text: "An unexpected error occurred" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-16 min-h-[calc(125dvh-4rem)] md:min-h-[calc(100dvh-4rem)] bg-[#F2E8DC] lg:h-[calc(100dvh-4rem)] lg:overflow-hidden ">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid min-h-[calc(80dvh-4rem)] grid-cols-1 lg:h-full lg:grid-cols-2"
      >
        <section className="relative overflow-hidden rounded-b-[34px] bg-[#225D5C] px-5 pb-2 pt-2 text-center text-[#FFD6A8] sm:px-8 lg:hidden ">
          <div className="mx-auto flex max-w-md flex-col items-center gap-2 py-2">
            <div className="mx-auto mb-1 flex h-16 w-16 items-center justify-center rounded-full bg-[#FFD6A8] shadow-lg shadow-black/20">
              <Image src="/logo.svg" alt="Luzori" width={52} height={52} />
            </div>
            <h2 className="text-xl font-bold tracking-tight">{t("welcome_to_luzori")}</h2>
            <p className="text-xs leading-5 text-[#F2E8DC]">{t("hero_subtitle_mobile")}</p>
          </div>
        </section>

        <section className={cn("relative hidden lg:flex lg:items-center lg:justify-center", isArabic && "lg:order-1")}>
          <Image
            src={isArabic ? "/fogright.png" : "/fogleft.png"}
            alt="Welcome background"
            fill
            priority
            className="object-cover object-right"
          />
          <div className="relative z-10 mx-auto max-w-xl px-12 md: px-20 text-center text-[#FFD6A8]">
            <h2 className="mb-8 text-5xl font-bold">{t("welcome_to_luzori")}</h2>
            <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-[#FFD6A8] shadow-lg">
              <Image src="/logo.svg" alt="Luzori" width={72} height={72} />
            </div>
            <p className="text-[14px] leading-8 text-[#FFEED9]">{t("hero_subtitle")}</p>
            <div className="mt-16 flex items-center justify-center gap-2 text-l font-bold">
              <span>{t("contact_us")}</span>
              <span>|</span>
              <span>{t("discover_more")}</span>
            </div>
          </div>
        </section>

        <section className={cn(" px-4 py-6 sm:px-6 lg:h-full lg:overflow-y-hidden lg:px-12 lg:py-2", isArabic && "lg:order-1")}>
          <div className="-mt-8 md:mt-0 mx-auto w-full max-w-2xl rounded-3xl md:rounded-none border md:border-none border-[#E9E2D8] bg-[#FFFBF7] md:bg-[#F2E8DC] p-5 shadow-xl md:shadow-none lg:min-h-full lg:p-8 relative z-10">
            <h1 className="mb-6 text-center text-3xl font-extrabold text-[#225D5C]">{t("create_your_account")}</h1>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#225D5C]">{t("full_name")} <span className="text-red-500">*</span></label>
                <div className="relative">
                  <User size={14} className={cn("absolute top-1/2 -translate-y-1/2 text-[#225D5C]/70", isArabic ? "right-3" : "left-3")} />
                  <input
                    type="text"
                    required
                    placeholder={t("full_name")}
                    className={cn("h-10 w-full rounded-xl border border-[#E9E2D8]  bg-[#F2E8DC] md:bg-[#FFD6A8]/50 text-sm text-[#22403F] placeholder:text-[#8B9A9A] focus:outline-none focus:ring-2 focus:ring-[#225D5C]/30", isArabic ? "pr-9 pl-3 text-right" : "pl-9 pr-3 text-left")}
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#225D5C]">{t("email")} <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Mail size={14} className={cn("absolute top-1/2 -translate-y-1/2 text-[#225D5C]/70", isArabic ? "right-3" : "left-3")} />
                  <input
                    type="email"
                    required
                    placeholder={t("email")}
                    className={cn("h-10 w-full rounded-xl border border-[#E9E2D8] bg-[#F2E8DC] md:bg-[#FFD6A8]/50 text-sm text-[#22403F] placeholder:text-[#8B9A9A] focus:outline-none focus:ring-2 focus:ring-[#225D5C]/30", isArabic ? "pr-9 pl-3 text-right" : "pl-9 pr-3 text-left")}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value.replace(/[^a-zA-Z0-9@._+-]/g, "") })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#225D5C]">{t("phone_number")} <span className="text-red-500">*</span></label>
                <div className="relative overflow-visible">
                  <div className={cn("absolute inset-y-0 z-30", isArabic ? "right-0" : "left-0")}>
                    <button
                      type="button"
                      onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                      className={cn("flex h-full items-center gap-2 px-3 hover:bg-[#D8A7A0]/15", isArabic ? "rounded-r-xl border-l border-[#D8A7A0]/50" : "rounded-l-xl border-r border-[#D8A7A0]/50")}
                    >
                      <Image src={selectedCountry.flag} alt={selectedCountry.name} width={20} height={14} />
                      <span className="text-xs font-semibold text-[#225D5C]">+{selectedCountry.code}</span>
                      <ChevronDown className={cn("text-[#225D5C]/70 transition-transform", isCountryDropdownOpen && "rotate-180")} size={12} />
                    </button>
                  </div>

                  <AnimatePresence>
                    {isCountryDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-20" onClick={() => setIsCountryDropdownOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.96 }}
                          className={cn("absolute top-full z-40 mt-2 w-56 rounded-xl border border-[#E9E2D8] bg-white py-2 shadow-2xl", isArabic ? "right-0" : "left-0")}
                        >
                          {COUNTRIES.map((c) => (
                            <button
                              key={c.code}
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, country_code: c.code });
                                setIsCountryDropdownOpen(false);
                              }}
                              className={cn("flex w-full items-center gap-3 px-4 py-3 text-[13px] text-[#24504F] hover:bg-[#F2E8DC]", formData.country_code === c.code && "bg-[#F2E8DC] text-[#225D5C]")}
                            >
                              <Image src={c.flag} alt={c.name} width={20} height={14} />
                              <span className={cn("flex-1 font-medium", isArabic ? "text-right" : "text-left")}>{c.name}</span>
                              <span className="text-xs opacity-60">+{c.code}</span>
                            </button>
                          ))}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>

                  <input
                    type="tel"
                    required
                    placeholder={t("phone_number")}
                    minLength={9}
                    maxLength={10}
                    className={cn("h-10 w-full rounded-xl border border-[#E9E2D8] bg-[#F2E8DC] md:bg-[#FFD6A8]/50 text-sm text-[#22403F] placeholder:text-[#8B9A9A] focus:outline-none focus:ring-2 focus:ring-[#225D5C]/30", isArabic ? "pr-28 pl-3 text-right" : "pl-28 pr-3 text-left")}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#225D5C]">{t("password")} <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Lock size={14} className={cn("absolute top-1/2 -translate-y-1/2 text-[#225D5C]/70", isArabic ? "right-3" : "left-3")} />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder={t("password")}
                   
                    className={cn("h-10 w-full rounded-xl border border-[#E9E2D8] bg-[#F2E8DC] md:bg-[#FFD6A8]/50 text-sm text-[#22403F] placeholder:text-[#8B9A9A] focus:outline-none focus:ring-2 focus:ring-[#225D5C]/30", isArabic ? "pr-9 pl-9 text-right" : "pl-9 pr-9 text-left")}
                    value={formData.password}
                    onChange={(e) => {
                      const v = e.target.value;
                      setFormData({ ...formData, password: v, password_confirmation: v });
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={cn("absolute top-1/2 -translate-y-1/2 text-[#225D5C]/70 hover:text-[#225D5C]", isArabic ? "left-3" : "right-3")}
                  >
                    {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <p className="text-xs font-semibold text-[#225D5C]">
                  {t("profile_picture")} <span className="text-[#225D5C]/70">({t("optional")})</span>
                </p>
                  <div className="flex justify-center items-center md:justify-start">
                  <label className="group relative flex h-16 w-16 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-[#E9E2D8] bg-[#F2E8DC] md:bg-[#FFD6A8]/50 shadow-md transition-all hover:border-[#225D5C]/50">
                      {logo ? (
                        <Image src={URL.createObjectURL(logo)} width={100} height={100} alt="Profile preview" className="absolute inset-0 h-full w-full object-cover" />
                      ) : (
                        <Image src="/camera.svg" alt="Camera" width={22} height={22} />
                      )}
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && setLogo(e.target.files[0])} />
                  </label>
                  </div>
              </div>

              <div className="flex items-start gap-2">
                <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#225D5C] focus:ring-[#225D5C]" />
                <p className="text-[11px] font-semibold text-[#225D5C]">
                  <span className="text-[#225D5C]/70">{t("i_agree_to_the")} </span>
                  <span>{t("terms_of_service")}</span>
                  <span className="text-[#225D5C]/70"> {t("and")} </span>
                  <span>{t("privacy_policy")}</span>
                </p>
              </div>

              {statusMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "rounded-xl border p-2 text-center text-xs font-medium",
                    statusMessage.type === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"
                  )}
                >
                  {statusMessage.text}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  "h-10 w-full rounded-full bg-[#225D5C] text-sm font-bold text-[#FFD6A8] shadow-lg transition-all disabled:cursor-not-allowed disabled:opacity-70",
                  !isSubmitting && "hover:bg-[#1D4E4D]"
                )}
              >
                {isSubmitting ? t("connecting") : t("register")}
              </button>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-[#E9E2D8]" />
                <span className="text-[11px] font-semibold uppercase tracking-widest text-[#8B9A9A]">{t("or")}</span>
                <div className="h-px flex-1 bg-[#E9E2D8]" />
              </div>

              <GoogleLoginButton text={t("sign_in_with_google")} className="h-10 rounded-full border-none shadow-none bg-[#F2E8DC] text-xs text-[#225D5C] hover:bg-[#F8FAFA]" />
            </form>
          </div>
        </section>
      </motion.div>
    </div>
  );
};

export default RegisterPage;


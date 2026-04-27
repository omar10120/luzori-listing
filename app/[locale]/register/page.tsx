"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Camera, ChevronDown, User, Mail, Phone, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import Container from "@/components/ui/Container";
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
    // last_name: "",
    email: "",
    country_code: "971",
    phone: "",
    password: "",
    password_confirmation: "",
    address: "",
    birth: "",
    gender: "",
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
    <div className=" h-[100dvh] md:h-[100dvh] overflow-y-auto bg-[#F2E8DC]">
      <Container className="h-auto min-h-[calc(100dvh-4rem)] px-0 pt-14 sm:px-3 md:pt-0">
        <motion.div
          initial={{ opacity: 0, y: 12 }} 
          animate={{ opacity: 1, y: 0 }}
          className="grid h-auto grid-cols-1 lg:h-full lg:grid-cols-2 lg:grid-rows-1"
        >
          <section
            className={cn(
              "relative overflow-hidden rounded-b-[34px] bg-[#225D5C] px-5 pb-9 pt-4   text-center text-[#FFD6A8] sm:px-8 lg:rounded-none lg:px-12 lg:py-6 lg:text-start lg:flex lg:items-center lg:justify-center",
              isArabic ? "lg:order-2" : "lg:order-1"
            )}
          >
            
            <Image
              src={isArabic ? "/fogright.png" : "/fogleft.png"}
              alt="Decorative side"
              width={130}
              height={900}
              className={cn(
                "pointer-events-none absolute top-0 hidden h-full w-[120px] object-cover lg:block z-10",
                isArabic ? "-left-10" : "-right-10"
              )}
              unoptimized
            />
            <div className="mx-auto flex max-w-md flex-col items-center gap-1 py-1 md:py-1 lg:gap-18 lg:py-10 ">
              <div className="mx-auto mb-1 flex h-16 w-16 items-center justify-center rounded-full bg-[#FFD6A8] shadow-lg shadow-black/20 lg:h-24 lg:w-24">
                <Image src="/logo.svg" alt="Luzori" width={60} height={60} />
              </div>
              <h2 className="text-[20px] font-bold tracking-tight lg:text-[28px] hidden md:block">{t("welcome_to_luzori")}</h2>
              <p className="max-w-[320px] text-xs leading-5 text-[#F2E8DC] sm:text-sm">
                <span className="hidden lg:inline">{t("hero_subtitle")}</span>
                <span className="inline lg:hidden">{t("hero_subtitle_mobile")}</span>
              </p>
              <div className="hidden items-center justify-center gap-2 font-bold lg:flex">
                <span>{t("contact_us")}</span>
                <span>|</span>
                <span>{t("discover_more")}</span>

              </div>
            </div>
          </section>

          <section
            className={cn(
              "mt-8 flex h-full flex-col bg-transparent px-4 pb-4 sm:px-6 lg:mt-0 lg:block lg:bg-white lg:px-10 lg:py-6",
              isArabic ? "lg:order-1" : "lg:order-2"
            )}
          >
            <div className="-mt-12 relative z-20 w-full rounded-[24px] border border-[#E9E2D8] bg-[#F4F4F4] p-3 shadow-xl shadow-black/10 sm:p-6 lg:bg-[#FFFBF7] lg:p-7">
              <h1 className="mb-3 mt-1 text-center text-[20px] font-extrabold tracking-tight text-[#225D5C] lg:mt-4 lg:text-2xl">
                {t("create_your_account")}
              </h1>

              <form onSubmit={handleSubmit} className="space-y-2.5">
                <div className="grid grid-cols-1 gap-2.5 md:grid-cols-1">
                  <div className="space-y-1">
                    <label className="ml-1 text-[11px] font-semibold text-[#225D5C]">{t("full_name")}</label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#225D5C]/70" />
                      <input
                        type="text"
                        placeholder={t("full_name")}
                        className="h-9 w-full rounded-xl border border-[#E9E2D8] bg-[#F2E8DC] pl-8 pr-2 text-[11px] text-[#22403F] placeholder:text-[#8B9A9A] focus:outline-none focus:ring-2 focus:ring-[#225D5C]/30"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      />
                    </div>
                  </div>

              

                  <div className="space-y-1 md:col-span-2">
                    <label className="ml-1 text-[11px] font-semibold text-[#225D5C]">{t("email")}</label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#225D5C]/70" />
                      <input
                        type="email"
                        placeholder={t("email")}
                        className="h-9 w-full rounded-xl border border-[#E9E2D8] bg-[#F2E8DC] pl-8 pr-2 text-[11px] text-[#22403F] placeholder:text-[#8B9A9A] focus:outline-none focus:ring-2 focus:ring-[#225D5C]/30"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="ml-1 text-[11px] font-semibold text-[#225D5C]">{t("phone_number")}</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 z-20">
                        <button
                          type="button"
                          onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                          className="flex h-full items-center gap-2 rounded-l-xl border-r border-[#D8A7A0]/50 px-3 hover:bg-[#D8A7A0]/15"
                        >
                          <Image src={selectedCountry.flag} alt={selectedCountry.name} width={20} height={14} className="rounded-sm object-cover" />
                          <span className="text-[11px] font-semibold text-[#225D5C]">+{selectedCountry.code}</span>
                          <ChevronDown className={cn("text-[#225D5C]/70 transition-transform", isCountryDropdownOpen && "rotate-180")} size={12} />
                        </button>
                        <AnimatePresence>
                          {isCountryDropdownOpen && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setIsCountryDropdownOpen(false)} />
                              <motion.div
                                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                className="absolute left-0 top-full z-20 mt-2 w-56 rounded-xl border border-[#E9E2D8] bg-white py-2 shadow-2xl"
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
                                      "flex w-full items-center gap-3 px-4 py-3 text-[13px] text-[#24504F] hover:bg-[#F2E8DC]",
                                      formData.country_code === c.code && "bg-[#F2E8DC] text-[#225D5C]"
                                    )}
                                  >
                                    <Image src={c.flag} alt={c.name} width={20} height={14} className="rounded-sm object-cover" />
                                    <span className="flex-1 text-left font-medium">{c.name}</span>
                                    <span className="text-xs opacity-60">+{c.code}</span>
                                  </button>
                                ))}
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                      <Phone size={14} className="absolute left-[5.8rem] top-1/2 -translate-y-1/2 text-[#225D5C]/70" />
                      <input
                        type="tel"
                        placeholder={t("phone_number")}
                        className="h-9 w-full rounded-xl border border-[#E9E2D8] bg-[#F2E8DC] pl-24 pr-2 text-[11px] font-semibold text-[#22403F] placeholder:text-[#8B9A9A] focus:outline-none focus:ring-2 focus:ring-[#225D5C]/30"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="ml-1 text-[11px] font-semibold text-[#225D5C]">{t("password")}</label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#225D5C]/70" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder={t("password")}
                        className="h-9 w-full rounded-xl border border-[#E9E2D8] bg-[#F2E8DC] pl-8 pr-8 text-[11px] text-[#22403F] placeholder:text-[#8B9A9A] focus:outline-none focus:ring-2 focus:ring-[#225D5C]/30"
                        value={formData.password}
                        onChange={(e) => {
                          const v = e.target.value;
                          setFormData({ ...formData, password: v, password_confirmation: v });
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#225D5C]/70 hover:text-[#225D5C]"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                <span className="text-[11px] font-semibold text-[#225D5C] md:ml-1">{t("profile_picture")} 
                  <span className="text-[#225D5C]/70"> ({t("optional")})</span>
                </span>
                <div className="flex flex-col space-y-1.5 md:items-start">
                  <div className="flex justify-center">
                    <label className="group relative flex h-16 w-16 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-[#E9E2D8] bg-[#F2E8DC] shadow-md transition-all hover:border-[#225D5C]/50 md:h-24 md:w-24">
                    {logo ? (
                        <Image src={URL.createObjectURL(logo)} width={100} height={100} alt="Profile preview" className="absolute inset-0 h-full w-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center">
                          <Camera className="mb-1 text-[#225D5C]/70 group-hover:text-[#225D5C]" size={14} />
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-[#225D5C]/80">{t("select")}</span>

                        </div>
                      )}
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && setLogo(e.target.files[0])} />
                    </label>
                  </div>
                  <div className="flex  gap-1.5">
                    <input type="checkbox" className="w-4 h-4 text-[#225D5C] bg-gray-100 rounded border-gray-300 focus:ring-[#225D5C] dark:focus:ring-[#225D5C] dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                    <div className="text-[10px] font-semibold text-[#225D5C]">
                      <span className=" text-[#225D5C]/70">{t("i_agree_to_the")} </span>
                      <span className="text-[#225D5C]">{t("terms_of_service")}</span> 
                      <span className="text-[#225D5C]/70"> {t("and")}</span>
                       <span className="text-[#225D5C]">{t("privacy_policy")}</span>   </div>
                  </div>
                </div>

                {statusMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "rounded-xl border p-2.5 text-center text-[11px] font-medium",
                      statusMessage.type === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"
                    )}
                  >
                    {statusMessage.text}
                  </motion.div>
                )}

               <div className="flex justify-center">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={cn(
                      "h-9 w-full  lg:w-1/2 rounded-full bg-[#225D5C] text-xs font-bold text-[#FFD6A8] shadow-lg transition-all disabled:cursor-not-allowed disabled:opacity-70",
                      !isSubmitting && "hover:bg-[#1D4E4D]"
                    )}
                  >
                    {isSubmitting ? t("connecting") : t("register")}
                  </button>
               </div>

                <div className="flex items-center gap-3 py-1">
                  <div className="h-px flex-1 bg-[#E9E2D8]" />
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-[#8B9A9A]">{t("or")}</span>
                  <div className="h-px flex-1 bg-[#E9E2D8]" />
                </div>

                <GoogleLoginButton text={t("sign_in_with_google")} className="h-10 rounded-full border-[#225D5C] bg-white text-sm text-[#225D5C] hover:bg-[#F8FAFA]" />
              </form>
            </div>
          </section>
        </motion.div>
      </Container>
    </div>
  );
};

export default RegisterPage;

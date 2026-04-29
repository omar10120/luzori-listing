"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { loginUser } from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import GoogleLoginButton from "@/components/auth/GoogleLoginButton";
import { useLocale, useTranslations } from "next-intl";

const LoginPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const t = useTranslations();
  const isArabic = locale === "ar";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    document.body.setAttribute("data-login-page", "true");
    return () => {
      document.body.removeAttribute("data-login-page");
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const result = await loginUser(formData);

      if (result.success) {
        if (result.data?.token) {
          localStorage.setItem("authToken", result.data.token);
        }
        setStatusMessage({ type: "success", text: result.message });
        const redirectTarget = searchParams.get("redirect") || "/";
        setTimeout(() => {
          window.location.href = redirectTarget;
        }, 1500);
      } else {
        setStatusMessage({ type: "error", text: result.message });
      }
    } catch {
      setStatusMessage({ type: "error", text: t("connection_error") || "An unexpected error occurred" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-16 min-h-[calc(125dvh-4rem)] md:min-h-[calc(100dvh-4rem)] bg-[#F2E8DC] md:bg-white lg:h-[calc(100dvh-4rem)] lg:overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid min-h-[calc(80dvh-4rem)] grid-cols-1 lg:h-full lg:grid-cols-2"
      >
        {/* Mobile Hero Section */}
        <section className="relative overflow-hidden rounded-b-[34px] bg-[#225D5C] px-5 pb-2 pt-2 text-center text-[#FFD6A8] sm:px-8 lg:hidden">
          <div className="mx-auto flex max-w-md flex-col items-center gap-2 py-2">
            <div className="mx-auto mb-1 flex h-16 w-16 items-center justify-center rounded-full bg-[#FFD6A8] shadow-lg shadow-black/20">
              <Image src="/logo.svg" alt="Luzori" width={52} height={52} />
            </div>
            <h2 className="text-xl font-bold tracking-tight">{t("welcome_back") || "Welcome Back"}</h2>
            <p className="text-xs leading-5 text-[#F2E8DC]">{t("login_subtitle_mobile") || "Sign in to your account"}</p>
          </div>
        </section>

        {/* Desktop Hero Section */}
        <section className={cn("relative hidden lg:flex lg:items-center lg:justify-center", isArabic && "lg:order-1")}>
          <Image
            src={isArabic ? "/fogright.png" : "/fogleft.png"}
            alt="Welcome background"
            fill
            priority
            className="object-cover object-right"
          />
          <div className="relative z-10 mx-auto max-w-xl px-12 text-center text-[#FFD6A8]">
            <h2 className="mb-8 text-5xl font-bold">{t("welcome_back") || "Welcome Back"}</h2>
            <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-[#FFD6A8] shadow-lg">
              <Image src="/logo.svg" alt="Luzori" width={72} height={72} />
            </div>
            <p className="text-[14px] leading-8 text-[#FFEED9]">{t("login_subtitle") || "Sign in to access your account"}</p>
            <div className="mt-16 flex items-center justify-center gap-2 text-lg font-bold">
              <span>{t("contact_us")}</span>
              <span>|</span>
              <span>{t("discover_more")}</span>
            </div>
          </div>
        </section>

        {/* Login Form Section */}
        <section className={cn("px-4 py-6 sm:px-6 lg:h-full lg:overflow-y-hidden lg:px-12 lg:py-2", isArabic && "lg:order-1")}>
          <div className="-mt-8 mx-auto w-full max-w-2xl rounded-3xl border border-[#E9E2D8] bg-[#FFFBF7] p-5 shadow-xl md:mt-0 md:rounded-none md:border-none md:bg-white md:shadow-none lg:min-h-full lg:p-8">
            <h1 className="mb-6 text-center text-3xl font-extrabold text-[#225D5C]">{t("login_to_your_account") || "Login to Your Account"}</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#225D5C]">
                  {t("email")} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail
                    size={14}
                    className={cn(
                      "absolute top-1/2 -translate-y-1/2 text-[#225D5C]/70",
                      isArabic ? "right-3" : "left-3"
                    )}
                  />
                  <input
                    type="email"
                    required
                    placeholder={t("email")}
                    className={cn(
                      "h-10 w-full rounded-xl border border-[#E9E2D8] bg-[#F2E8DC] text-[16px] text-[#22403F] placeholder:text-[#8B9A9A] focus:outline-none focus:ring-2 focus:ring-[#225D5C]/30 md:bg-[#FFD6A8]/30",
                      isArabic ? "pr-9 pl-3 text-right" : "pl-9 pr-3 text-left"
                    )}
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        email: e.target.value.replace(/[^a-zA-Z0-9@._+-]/g, ""),
                      })
                    }
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#225D5C]">
                  {t("password")} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock
                    size={14}
                    className={cn(
                      "absolute top-1/2 -translate-y-1/2 text-[#225D5C]/70",
                      isArabic ? "right-3" : "left-3"
                    )}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder={t("password")}
                    className={cn(
                      "h-10 w-full rounded-xl border border-[#E9E2D8] bg-[#F2E8DC] text-[16px] text-[#22403F] placeholder:text-[#8B9A9A] focus:outline-none focus:ring-2 focus:ring-[#225D5C]/30 md:bg-[#FFD6A8]/30",
                      isArabic ? "pr-9 pl-9 text-right" : "pl-9 pr-9 text-left"
                    )}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={cn(
                      "absolute top-1/2 -translate-y-1/2 text-[#225D5C]/70 hover:text-[#225D5C]",
                      isArabic ? "left-3" : "right-3"
                    )}
                  >
                    {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              {/* <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-[#225D5C]/70 transition-colors hover:text-[#225D5C]"
                >
                  {t("forgot_password") || "Forgot password?"}
                </Link>
              </div> */}

              {/* Status Message */}
              <AnimatePresence>
                {statusMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className={cn(
                      "rounded-xl border p-2 text-center text-xs font-medium",
                      statusMessage.type === "success"
                        ? "border-green-200 bg-green-50 text-green-700"
                        : "border-red-200 bg-red-50 text-red-700"
                    )}
                  >
                    {statusMessage.text}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    "h-10 w-full rounded-full bg-[#225D5C] text-sm font-bold text-[#FFD6A8] shadow-lg transition-all disabled:cursor-not-allowed disabled:opacity-70 md:w-1/2",
                    !isSubmitting && "hover:bg-[#1D4E4D]"
                  )}
                >
                  {isSubmitting ? t("connecting") || "Logging in..." : t("login") || "Login"}
                </button>
              </div>

              {/* OR Divider */}
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-[#E9E2D8]" />
                <span className="text-[11px] font-semibold uppercase tracking-widest text-[#8B9A9A]">
                  {t("or")}
                </span>
                <div className="h-px flex-1 bg-[#E9E2D8]" />
              </div>

              {/* Google Login Button */}
              <GoogleLoginButton
                text={t("sign_in_with_google")}
                className="h-10 w-full cursor-pointer rounded-full border-none bg-[#F2E8DC] text-xs text-[#225D5C] shadow-none hover:bg-[#F8FAFA] md:bg-white"
              />

              {/* Register Link */}
              <div className="text-center text-xs font-semibold text-[#225D5C]/70">
                {t("dont_have_account") || "Don't have an account?"}{" "}
                <Link href="/register" className="text-[#225D5C] transition-colors hover:underline">
                  {t("register_now") || "Register now"}
                </Link>
              </div>
            </form>
          </div>
        </section>
      </motion.div>
    </div>
  );
};

export default LoginPage;
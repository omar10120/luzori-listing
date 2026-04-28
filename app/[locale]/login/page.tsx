"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import Container from "@/components/ui/Container";
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
      setStatusMessage({ type: "error", text: t("connection_error") || "Connection error. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-h-[calc(120dvh-4rem)] md:min-h-[calc(100dvh-4rem)] overflow-y-auto bg-[#F2E8DC] lg:mt-16 lg:h-[calc(100dvh-4rem)] lg:overflow-hidden">
      <Container className="h-auto px-0 pt-14 sm:px-3 lg:h-full lg:pt-0">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative grid h-auto grid-cols-1 lg:h-full lg:grid-cols-2 lg:grid-rows-1"
        >
          {/* Left Section - Hero/Branding */}
          <section
            className={cn(
              "relative overflow-hidden rounded-b-[34px] bg-[#225D5C] px-5 pb-9 pt-4 text-center text-[#FFD6A8] sm:px-8 lg:rounded-none lg:px-12 lg:py-6 lg:text-start lg:flex lg:items-center lg:justify-center",
              isArabic ? "lg:order-2" : "lg:order-1"
            )}
          >
            <div className="mx-auto flex max-w-md flex-col items-center gap-1 py-1 md:py-1 lg:gap-18 lg:py-10">
              <div className="mx-auto mb-1 flex h-16 w-16 items-center justify-center rounded-full bg-[#FFD6A8] shadow-lg shadow-black/20 lg:h-24 lg:w-24">
                <Image src="/logo.svg" alt="Luzori" width={60} height={60} />
              </div>
              <h2 className="hidden text-[20px] font-bold tracking-tight md:block lg:text-[28px]">
                {t("welcome_to_luzori") || "Welcome Back to Luzori"}
              </h2>
              <p className="max-w-[320px] text-xs leading-5 text-[#F2E8DC] sm:text-sm">
                <span className="hidden lg:inline">{t("hero_subtitle") || "Sign in to access your account"}</span>
                <span className="inline lg:hidden">{t("hero_subtitle_mobile") || "Sign in to continue"}</span>
              </p>
              <div className="hidden items-center justify-center gap-2 font-bold lg:flex">
                <span>{t("contact_us")}</span>
                <span>|</span>
                <span>{t("discover_more")}</span>
              </div>
            </div>
          </section>

          {/* Right Section - Login Form */}
          <section
            className={cn(
              "-mt-8 md:mt-0 flex h-full flex-col bg-transparent sm:px-6 lg:mt-0 lg:block  ",
              isArabic ? "lg:order-1" : "lg:order-2"
            )}
          >
            <div
              className={cn(
                "relative z-20 w-full rounded-[24px] border border-[#E9E2D8] bg-[#F4F4F4] p-3 shadow-xl shadow-black/10 md:border-none md:bg-white sm:p-6 lg:bg-[#FFFBF7] lg:p-7 md:mt-32 ",
                isArabic ? "md:mr-1" : "md:ml-1"
              )}
            >
              <h1 className="mb-3 mt-1 text-center text-[20px] font-extrabold tracking-tight text-[#225D5C] lg:mt-4 lg:text-2xl">
                {t("login_to_your_account") || "Login to Your Account"}
              </h1>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div className="space-y-1">
                  <label className="ml-1 text-[11px] font-semibold text-[#225D5C]">
                    {t("email")}
                  </label>
                  <span className="text-[#FF0000]/70"> *</span>
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
                      inputMode="email"
                      className={cn(
                        "h-9 w-full rounded-xl border border-[#E9E2D8] bg-[#F2E8DC] text-[16px] text-[#22403F] placeholder:text-[#8B9A9A] focus:outline-none focus:ring-2 focus:ring-[#225D5C]/30",
                        isArabic ? "pr-8 pl-2 text-right" : "pl-8 pr-2 text-left"
                      )}
                      value={formData.email}
                      onChange={(e) => {
                        const value = e.target.value;
                        const filtered = value.replace(/[^a-zA-Z0-9@._+-]/g, "");
                        setFormData({ ...formData, email: filtered });
                      }}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1">
                  <label
                    className={cn(
                      "ml-1 text-[11px] font-semibold text-[#225D5C]",
                      isArabic ? "text-right" : "text-left"
                    )}
                  >
                    {t("password")}
                  </label>
                  <span className="text-[#FF0000]/70"> *</span>

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
                      placeholder={t("password")}
                      className={cn(
                        "h-9 w-full rounded-xl border border-[#E9E2D8] bg-[#F2E8DC] text-[16px] text-[#22403F] placeholder:text-[#8B9A9A] focus:outline-none focus:ring-2 focus:ring-[#225D5C]/30",
                        isArabic ? "pr-8 pl-8 text-right" : "pl-8 pr-8 text-left"
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
                    className="text-[11px] font-semibold text-[#225D5C]/70 hover:text-[#225D5C] transition-colors"
                  >
                    {t("forgot_password") || "Forgot password?"}
                  </Link>
                </div> */}

                {/* Status Message */}
                <AnimatePresence>
                  {statusMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: -10, height: 0 }}
                      className={cn(
                        "p-3 rounded-xl text-center text-xs font-medium",
                        statusMessage.type === "success"
                          ? "bg-green-100 text-green-800 border border-green-200"
                          : "bg-red-100 text-red-800 border border-red-200"
                      )}
                    >
                      {statusMessage.text}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <div className="flex justify-center pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={cn(
                      "h-9 w-full lg:w-1/2 rounded-full bg-[#225D5C] text-xs font-bold text-[#FFD6A8] shadow-lg transition-all disabled:cursor-not-allowed disabled:opacity-70",
                      !isSubmitting && "hover:bg-[#1D4E4D]"
                    )}
                  >
                    {isSubmitting ? t("connecting") || "Logging in..." : t("login") || "Login"}
                  </button>
                </div>

                {/* OR Divider */}
                <div className="flex items-center gap-3 py-1">
                  <div className="h-px flex-1 bg-[#E9E2D8]" />
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-[#8B9A9A]">
                    {t("or")}
                  </span>
                  <div className="h-px flex-1 bg-[#E9E2D8]" />
                </div>

                {/* Google Login Button */}
                <GoogleLoginButton
                  text={t("sign_in_with_google")}
                  className="h-10 w-full rounded-full border-[#225D5C] bg-white text-[#225D5C] hover:bg-[#F8FAFA] text-xs"
                />

                {/* Register Link */}
                <div className="text-center text-[11px] font-semibold text-[#225D5C]/70">
                  {t("dont_have_account") || "Don't have an account?"}{" "}
                  <Link
                    href="/register"
                    className="text-[#225D5C] hover:underline transition-colors"
                  >
                    {t("register_now") || "Register now"}
                  </Link>
                </div>
              </form>
            </div>
          </section>
        </motion.div>
      </Container>
    </div>
  );
};

export default LoginPage;
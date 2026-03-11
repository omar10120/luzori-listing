"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import Button from "@/components/ui/Button";
import { Globe } from "lucide-react";

export default function LocaleSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();

    function onLocaleChange() {
        const nextLocale = locale === "en" ? "ar" : "en";

        // Replace the current locale in the pathname
        const newPathname = pathname.replace(`/${locale}`, `/${nextLocale}`) || `/${nextLocale}`;

        startTransition(() => {
            router.push(newPathname);
        });
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={onLocaleChange}
            disabled={isPending}
            className="flex items-center gap-2 text-sm font-medium"
        >
            <Globe size={16} />
            <span>{locale === "en" ? "العربية" : "English"}</span>
        </Button>
    );
}

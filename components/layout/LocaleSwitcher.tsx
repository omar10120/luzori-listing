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
        console.log(locale);
        console.log(nextLocale);

        const segments = pathname.split("/");
        segments[1] = nextLocale; // replace locale

        const newPath = segments.join("/") || `/${nextLocale}`;

        startTransition(() => {
            router.replace(newPath);
        });
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={onLocaleChange}
            disabled={isPending}
            className="flex items-center gap-2 text-sm font-medium "
        >
            <Globe size={16} />
            <span>{locale === "en" ? "العربية" : "English"}</span>
        </Button>
    );
}
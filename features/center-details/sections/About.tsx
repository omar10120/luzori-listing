import React from 'react';
import { CheckCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface AboutProps {
    centerName: string;
}

export default function About({ centerName }: AboutProps) {
    const t = useTranslations();

    return (
        <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('about')}</h2>
            <div className="prose prose-sm max-w-none text-gray-600">
                <p className="leading-relaxed">
                    Welcome to <strong>{centerName}</strong> — your premier destination for self-care and beauty services.
                    We offer a wide range of professional treatments including hair styling, skincare, body treatments,
                    nail care, and exclusive bridal packages. Our team of certified professionals is dedicated to
                    providing you with an exceptional experience in a luxurious and relaxing environment.
                </p>
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                        "licensed_certified",
                        "premium_products",
                        "hygienic_environment",
                        "satisfaction_guaranteed",
                    ].map((perk) => (
                        <div key={perk} className="flex items-center gap-3 text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <CheckCircle size={18} className="text-green-500 shrink-0" />
                            <span className="font-medium">{t(perk)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

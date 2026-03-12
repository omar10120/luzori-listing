import React from 'react';
import { useTranslations } from 'next-intl';

interface TeamMember {
    id: number;
    name: string;
    role: string;
    avatar: string;
}

interface TeamProps {
    team: TeamMember[];
}

export default function Team({ team }: TeamProps) {
    const t = useTranslations();

    return (
        <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('team')}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {team.map((member) => (
                    <div key={member.id} className="flex flex-col items-center group cursor-pointer">
                        <div className="relative mb-3">
                            <img
                                src={member.avatar}
                                alt={member.name}
                                className="h-24 w-24 rounded-full object-cover ring-2 ring-white shadow-md group-hover:ring-gray-900 transition-all duration-300"
                            />
                        </div>
                        <span className="text-base font-bold text-gray-900">{member.name}</span>
                        <span className="text-sm text-gray-500">{member.role}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}

"use client";

import React, { useState, useEffect } from "react";
import Container from "@/components/ui/Container";
import AccountSidebar from "@/components/account/AccountSidebar";
import ComingSoon from "@/components/ui/ComingSoon";
import { fetchUserProfile } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function ActivityPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("authToken");
            if (!token) {
                router.push("/login");
                return;
            }

            const data = await fetchUserProfile(token);
            if (data) {
                setUser(data);
            } else {
                localStorage.removeItem("authToken");
                router.push("/login");
            }
            setLoading(false);
        };

        fetchUser();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#225D5C]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-20">
            <Container>
                <div className="flex flex-col lg:flex-row gap-12">
                    <AccountSidebar userName={user?.name} />
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900 mb-8">Activity</h1>
                        <ComingSoon 
                            title="Activity Tracking" 
                            subtitle="Coming soon! You'll be able to view all your appointment history and upcoming bookings right here." 
                        />
                    </div>
                </div>
            </Container>
        </div>
    );
}

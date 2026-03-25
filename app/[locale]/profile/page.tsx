"use client";

import React, { useState, useEffect } from "react";
import Container from "@/components/ui/Container";
import Image from "next/image";
import { fetchUserProfile } from "@/lib/api";
import { Camera, Home, Briefcase, Plus, Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

const ProfilePage = () => {
    const t = useTranslations();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            router.push("/login");
            return;
        }

        fetchUserProfile(token).then(data => {
            if (data) {
                setUser(data);
            } else {
                localStorage.removeItem("authToken");
                router.push("/login");
            }
            setLoading(false);
        });
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4af37]"></div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 pt-32 pb-20">
            <Container>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* User Details Card */}
                    <div className="lg:col-span-4 bg-white rounded-3xl shadow-sm border border-gray-100 p-8 overflow-hidden relative">
                        <button className="absolute top-6 right-8 text-sm font-medium text-blue-600 hover:underline">
                            Edit
                        </button>
                        
                        <div className="flex flex-col items-center mb-8">
                            <div className="relative w-32 h-32 rounded-full bg-[#5d4037] flex items-center justify-center text-white text-4xl font-bold overflow-hidden mb-4">
                                {user.image ? (
                                    <Image src={user.image} alt={user.name} fill className="object-cover" />
                                ) : (
                                    user.name?.charAt(0) || "U"
                                )}
                                <div className="absolute bottom-0 right-0 p-1 bg-white rounded-full border border-gray-200 shadow-sm cursor-pointer">
                                    <Pencil size={14} className="text-gray-600" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                        </div>

                        <div className="h-px bg-gray-100 w-full mb-8" />

                        <div className="space-y-6">
                            <div>
                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">First name</p>
                                <p className="text-sm font-medium text-gray-900">{user.first_name || "-"}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Last name</p>
                                <p className="text-sm font-medium text-gray-900">{user.last_name || "-"}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Mobile number</p>
                                <p className="text-sm font-medium text-gray-900">{user.full_phone || user.phone || "-"}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Email</p>
                                <p className="text-sm font-medium text-gray-900">{user.email || "-"}</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Date of birth</p>
                                <p className="text-sm font-medium text-gray-900">-</p>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Gender</p>
                                <p className="text-sm font-medium text-gray-900">-</p>
                            </div>
                        </div>
                    </div>

                    {/* Addresses & Other Info */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">My addresses</h3>
                            
                            <div className="space-y-4 mb-6">
                                <div className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 hover:border-gray-200 transition-all cursor-pointer">
                                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                                        <Home size={20} className="text-gray-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">Home</p>
                                        <p className="text-xs text-gray-400">Add a home address</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 hover:border-gray-200 transition-all cursor-pointer">
                                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                                        <Briefcase size={20} className="text-gray-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">Work</p>
                                        <p className="text-xs text-gray-400">Add a work address</p>
                                    </div>
                                </div>
                            </div>
                            
                            <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">
                                <Plus size={16} />
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default ProfilePage;

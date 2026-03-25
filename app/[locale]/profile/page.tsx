"use client";

import React, { useState, useEffect } from "react";
import Container from "@/components/ui/Container";
import Image from "next/image";
import { fetchUserProfile } from "@/lib/api";
import { Camera, Home, Briefcase, Plus, Pencil, ArrowLeft, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { updateUserProfile } from "@/lib/api";

const ProfilePage = () => {
    const t = useTranslations();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });

    // Form states
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        country_code: "+971",
        day: "",
        month: "",
        year: "",
        gender: ""
    });
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const fetchUser = async () => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            router.push("/login");
            return;
        }

        const data = await fetchUserProfile(token);
        if (data) {
            setUser(data);
            setFormData({
                first_name: data.first_name || "",
                last_name: data.last_name || "",
                email: data.email || "",
                phone: data.phone || "",
                country_code: data.country_code || "+971",
                day: "",
                month: "",
                year: "",
                gender: ""
            });
        } else {
            localStorage.removeItem("authToken");
            router.push("/login");
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUser();
    }, [router]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setStatusMsg({ type: "", text: "" });

        const token = localStorage.getItem("authToken");
        if (!token) return;

        const body = new FormData();
        body.append("first_name", formData.first_name);
        body.append("last_name", formData.last_name);
        body.append("email", formData.email);
        body.append("phone", formData.phone);
        body.append("country_code", formData.country_code);
        if (selectedImage) {
            body.append("image", selectedImage);
        }

        const result = await updateUserProfile(token, body);

        if (result.success) {
            setStatusMsg({ type: "success", text: result.message });
            await fetchUser();
            setTimeout(() => setIsEditing(false), 1500);
        } else {
            setStatusMsg({ type: "error", text: result.message });
        }
        setSubmitting(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#225D5C]"></div>
            </div>
        );
    }

    if (!user) return null;

    if (isEditing) {
        return (
            <div className="min-h-screen bg-white pt-24 pb-20">
                <Container className="max-w-2xl">
                    <button
                        onClick={() => setIsEditing(false)}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span>Back</span>
                    </button>

                    <h1 className="text-4xl font-bold text-gray-900 mb-10">Edit profile details</h1>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-900">First name</label>
                                <input
                                    type="text"
                                    value={formData.first_name}
                                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                    className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225D5C] transition-all"
                                    placeholder="Amr"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-900">Last name</label>
                                <input
                                    type="text"
                                    value={formData.last_name}
                                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                    className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225D5C] transition-all"
                                    placeholder="dawoodi"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-900">Mobile number</label>
                            <div className="flex gap-3">
                                <div className="relative w-24">
                                    <select
                                        value={formData.country_code}
                                        onChange={(e) => setFormData({ ...formData, country_code: e.target.value })}
                                        className="w-full h-12 pl-4 pr-10 appearance-none rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225D5C] bg-white transition-all text-sm"
                                    >
                                        <option value="+971">+971</option>
                                        <option value="+963">+963</option>
                                        <option value="+1">+1</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                </div>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="flex-1 h-12 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225D5C] transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-900">Email address</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225D5C] transition-all"
                                placeholder="amrooody7@gmail.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-900">Date of birth</label>
                            <div className="grid grid-cols-3 gap-4">
                                <input
                                    type="text"
                                    placeholder="Day"
                                    className="h-12 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225D5C] transition-all"
                                />
                                <div className="relative">
                                    <select className="w-full h-12 pl-4 pr-10 appearance-none rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225D5C] bg-white transition-all text-sm text-gray-400">
                                        <option>Month</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Year"
                                    className="h-12 px-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225D5C] transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-900">Gender</label>
                            <div className="relative">
                                <select className="w-full h-12 pl-4 pr-10 appearance-none rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#225D5C] bg-white transition-all text-sm text-gray-400">
                                    <option>Select Option</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                            </div>
                        </div>

                        <div className="space-y-4 pt-4">
                            <div className="flex items-center gap-4">
                                <div className="relative w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                                    {(imagePreview || user.image) ? (
                                        <Image src={imagePreview || user.image} alt="Preview" fill className="object-cover" />
                                    ) : (
                                        <Camera className="text-gray-400" size={24} />
                                    )}
                                </div>
                                <label className="cursor-pointer bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium transition-all">
                                    Change photo
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                </label>
                            </div>
                        </div>

                        {statusMsg.text && (
                            <div className={`p-4 rounded-xl text-sm ${statusMsg.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                                {statusMsg.text}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full h-14 bg-[#225D5C] text-[#FFD6A8] rounded-xl font-bold text-lg hover:opacity-90 transition-all disabled:opacity-50"
                        >
                            {submitting ? "Updating..." : "Save changes"}
                        </button>
                    </form>
                </Container>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-32 pb-20">
            <Container>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* User Details Card */}
                    <div className="lg:col-span-4 bg-white rounded-3xl shadow-sm border border-gray-100 p-8 overflow-hidden relative">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="absolute top-6 right-8 text-sm font-medium text-blue-600 hover:underline"
                        >
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

                            {/* <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">
                                <Plus size={16} />
                                Add
                            </button> */}
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default ProfilePage;

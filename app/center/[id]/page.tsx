import { fetchCenterById } from "@/lib/api";
import CenterDetailClient from "./CenterDetailClient";
import { notFound } from "next/navigation";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function CenterPage({ params }: Props) {
    const { id } = await params;
    const center = await fetchCenterById(id);

    if (!center) {
        notFound();
    }

    return <CenterDetailClient center={center} />;
}

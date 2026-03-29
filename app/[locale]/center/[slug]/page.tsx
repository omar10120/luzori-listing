import { fetchCenterById } from "@/lib/api";
import CenterDetailClient from "./CenterDetailClient";
import { notFound } from "next/navigation";
import { extractIdFromSlug } from "@/lib/slugify";

interface Props {
    params: Promise<{ slug: string }>;
}

export default async function CenterPage({ params }: Props) {
    const { slug } = await params;
    const id = extractIdFromSlug(slug);
    const center = await fetchCenterById(id);

    if (!center) {
        notFound();
    }

    return <CenterDetailClient center={center} />;
}

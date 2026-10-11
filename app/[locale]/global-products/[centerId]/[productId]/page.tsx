import { notFound } from "next/navigation";
import { fetchCenterProduct } from "@/lib/api";
import ProductDetailClient from "@/features/products/ProductDetailClient";

interface Props {
    params: Promise<{ centerId: string; productId: string }>;
}

export default async function GlobalProductDetailPage({ params }: Props) {
    const { centerId, productId } = await params;
    const product = await fetchCenterProduct(centerId, productId);

    if (!product) {
        notFound();
    }

    return <ProductDetailClient product={product} />;
}

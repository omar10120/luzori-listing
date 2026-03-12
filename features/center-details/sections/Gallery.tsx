
import { useTranslations } from 'next-intl';

interface GalleryProps {
    images: string[];
    centerName: string;
    fallbackImage: string;
}

export default function Gallery({ images, centerName, fallbackImage }: GalleryProps) {
    const t = useTranslations();

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 mb-8">
            {/* Primary Large Image */}
            <div className="md:col-span-2 aspect-[4/3] md:aspect-auto md:h-[500px] overflow-hidden rounded-xl bg-gray-100">
                <img
                    src={images[0]}
                    alt={centerName}
                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                />
            </div>

            {/* Secondary Smaller Images */}
            <div className="flex flex-col gap-2 md:gap-4 md:h-[500px]">
                <div className="flex-1 overflow-hidden rounded-xl bg-gray-100">
                    <img
                        src={images[1] || fallbackImage}
                        alt={centerName}
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                </div>
                <div className="relative flex-1 overflow-hidden rounded-xl bg-gray-100">
                    <img
                        src={images[2] || fallbackImage}
                        alt={centerName}
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    {images.length > 3 && (
                        <button className="absolute bottom-4 right-4 rtl:right-auto rtl:left-4 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-md transition-all hover:bg-gray-50">
                            {t('see_all_images')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

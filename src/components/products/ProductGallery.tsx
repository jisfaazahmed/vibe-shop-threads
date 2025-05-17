
import React, { useState } from "react";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface ProductGalleryProps {
  images: string[];
  name: string;
}

const ProductGallery: React.FC<ProductGalleryProps> = ({ images, name }) => {
  const [selectedImage, setSelectedImage] = useState(0);

  // Make sure we have an array of valid image URLs
  const safeImages = images && images.length > 0 
    ? images.map(img => img || "https://placehold.co/600x600/CCCCCC/333333?text=No+Image")
    : ["https://placehold.co/600x600/CCCCCC/333333?text=No+Image"];

  return (
    <div className="space-y-4">
      <div className="aspect-square relative overflow-hidden rounded-lg border">
        <img
          src={safeImages[selectedImage]}
          alt={`${name} - View ${selectedImage + 1}`}
          className="object-cover w-full h-full"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null; // Prevent infinite loop
            target.src = "https://placehold.co/600x600/CCCCCC/333333?text=Image+Error";
          }}
        />
      </div>
      
      {safeImages.length > 1 && (
        <div className="pt-2">
          <Carousel className="w-full">
            <CarouselContent className="-ml-2">
              {safeImages.map((image, index) => (
                <CarouselItem key={index} className="basis-1/4 pl-2">
                  <div 
                    className={`aspect-square rounded-md overflow-hidden cursor-pointer border-2 ${
                      selectedImage === index ? "border-brand-purple" : "border-transparent"
                    }`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img 
                      src={image} 
                      alt={`${name} thumbnail ${index + 1}`} 
                      className="object-cover w-full h-full hover:opacity-75 transition"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = "https://placehold.co/600x600/CCCCCC/333333?text=Thumb+Error";
                      }}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-0" />
            <CarouselNext className="right-0" />
          </Carousel>
        </div>
      )}
    </div>
  );
};

export default ProductGallery;

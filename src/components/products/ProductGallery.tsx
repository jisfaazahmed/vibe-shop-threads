
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

  return (
    <div className="space-y-4">
      <div className="aspect-square relative overflow-hidden rounded-lg border">
        <img
          src={images[selectedImage]}
          alt={`${name} - View ${selectedImage + 1}`}
          className="object-cover w-full h-full"
        />
      </div>
      
      <div className="pt-2">
        <Carousel className="w-full">
          <CarouselContent className="-ml-2">
            {images.map((image, index) => (
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
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-0" />
          <CarouselNext className="right-0" />
        </Carousel>
      </div>
    </div>
  );
};

export default ProductGallery;

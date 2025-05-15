
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import HeroSection from "@/components/home/HeroSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import FeaturesSection from "@/components/home/FeaturesSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import NewsletterSection from "@/components/home/NewsletterSection";
import { products } from "@/data/products";

const Index = () => {
  return (
    <MainLayout>
      <HeroSection />
      <FeaturedProducts products={products} />
      <FeaturesSection />
      <TestimonialsSection />
      <NewsletterSection />
    </MainLayout>
  );
};

export default Index;

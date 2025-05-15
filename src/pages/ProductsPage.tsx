
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import ProductGrid from "@/components/products/ProductGrid";
import { products } from "@/data/products";

const ProductsPage = () => {
  return (
    <MainLayout>
      <ProductGrid products={products} title="All Products" />
    </MainLayout>
  );
};

export default ProductsPage;


import React from "react";
import { useParams, Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import ProductDetail from "@/components/products/ProductDetail";
import { products, reviewsData } from "@/data/products";
import { Button } from "@/components/ui/button";

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const product = products.find((p) => p.id === id);
  const productReviews = reviewsData.filter((r) => r.productId === id);

  if (!product) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <p className="mb-8">The product you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/products">Back to Products</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <ProductDetail product={product} />
      
      {/* Reviews Section */}
      <section className="container mx-auto px-4 py-10 border-t">
        <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
        
        {productReviews.length > 0 ? (
          <div className="space-y-6">
            {productReviews.map((review) => (
              <div key={review.id} className="border-b pb-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{review.title}</h3>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg
                        key={i}
                        className={`h-5 w-5 ${
                          i < review.rating ? "text-yellow-400" : "text-gray-300"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 15.585l-5.992 3.15 1.144-6.666L.298 7.38l6.684-.973L10 .5l3.018 5.908 6.684.973-4.854 4.688 1.144 6.666z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-2">
                  By {review.author} on {new Date(review.date).toLocaleDateString()}
                </p>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
            <Button variant="outline" className="mt-4">
              Write a Review
            </Button>
          </div>
        )}
      </section>
      
      {/* Related Products would go here in a real application */}
    </MainLayout>
  );
};

export default ProductDetailPage;

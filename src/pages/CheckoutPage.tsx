
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import { useCart } from "@/context/CartContext";
import { Navigate } from "react-router-dom";

const CheckoutPage = () => {
  const { cartItems } = useCart();

  // Redirect to cart if cart is empty
  if (cartItems.length === 0) {
    return <Navigate to="/cart" />;
  }

  return (
    <MainLayout>
      <CheckoutForm />
    </MainLayout>
  );
};

export default CheckoutPage;

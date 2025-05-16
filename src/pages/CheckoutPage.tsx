
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import { useCart } from "@/context/CartContext";
import { Navigate } from "react-router-dom";
import { useCustomer } from "@/hooks/use-customer";

const CheckoutPage = () => {
  const { cartItems } = useCart();
  const { profile, isLoading } = useCustomer();

  // Redirect to cart if cart is empty
  if (cartItems.length === 0) {
    return <Navigate to="/cart" />;
  }

  return (
    <MainLayout>
      <CheckoutForm userProfile={profile} isProfileLoading={isLoading} />
    </MainLayout>
  );
};

export default CheckoutPage;


import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const CheckoutForm = () => {
  const { user } = useAuth();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  
  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("Sri Lanka");

  const subtotal = getCartTotal();
  const shipping = subtotal > 10000 ? 0 : 500; // Free shipping over LKR 10,000
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Create the order record
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: user?.id, // Will be null for guest checkout
          total_amount: total,
          shipping_address: address + (addressLine2 ? ", " + addressLine2 : ""),
          shipping_city: city,
          shipping_state: state,
          shipping_postal_code: postalCode,
          shipping_country: country,
          payment_method: paymentMethod,
          status: "pending"
        })
        .select()
        .single();
      
      if (orderError) throw orderError;
      
      // Add order items
      const orderItems = cartItems.map(item => ({
        order_id: orderData.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
        variant_id: item.variantId || null
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
        
      if (itemsError) throw itemsError;
      
      // Update customer information if logged in
      if (user) {
        await supabase
          .from('customers')
          .update({
            first_name: firstName,
            last_name: lastName,
            phone,
            address_line1: address,
            address_line2: addressLine2,
            city,
            state,
            postal_code: postalCode,
            country
          })
          .eq('id', user.id);
      }

      // Success!
      toast.success("Your order has been placed successfully!", {
        description: "Check your email for order confirmation.",
      });
      clearCart();
      navigate("/order-confirmation", { 
        state: { 
          orderId: orderData.id,
          orderNumber: Math.floor(100000 + Math.random() * 900000),
          email: email
        } 
      });
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("There was a problem processing your order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Checkout Form */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Checkout</h2>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  We'll use this information to send your order confirmation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="John" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Doe" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="your@email.com" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="(123) 456-7890" 
                    required 
                  />
                </div>
              </CardContent>
            </Card>

            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input 
                    id="address" 
                    placeholder="123 Main St" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addressLine2">Apt, Suite, etc. (optional)</Label>
                  <Input id="addressLine2" placeholder="Apt 4B" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" placeholder="Colombo" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">Province</Label>
                    <Input id="state" placeholder="Western" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="zip">Postal Code</Label>
                    <Input id="zip" placeholder="10300" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" placeholder="Sri Lanka" defaultValue="Sri Lanka" required />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <RadioGroup 
                  defaultValue="cod"
                  onValueChange={setPaymentMethod}
                >
                  <div className="flex items-center space-x-2 border p-4 rounded-md">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex-1 cursor-pointer">
                      Cash on Delivery (COD)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border p-4 rounded-md">
                    <RadioGroupItem value="credit_card" id="credit_card" />
                    <Label htmlFor="credit_card" className="flex-1 cursor-pointer">
                      Credit Card
                    </Label>
                  </div>
                </RadioGroup>

                {paymentMethod === "credit_card" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardName">Name on Card</Label>
                      <Input id="cardName" placeholder="John Doe" required={paymentMethod === "credit_card"} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input 
                        id="cardNumber" 
                        placeholder="1234 5678 9012 3456" 
                        required={paymentMethod === "credit_card"} 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiration">Expiration (MM/YY)</Label>
                        <Input id="expiration" placeholder="MM/YY" required={paymentMethod === "credit_card"} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvc">CVC</Label>
                        <Input id="cvc" placeholder="123" required={paymentMethod === "credit_card"} />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full bg-brand-purple hover:bg-brand-purple/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : `Pay LKR ${total.toFixed(2)}`}
              </Button>
            </div>
          </form>
        </div>

        {/* Order Summary */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
          <Card>
            <CardHeader>
              <CardTitle>Your Order</CardTitle>
              <CardDescription>
                Review your items before completing your purchase
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Item list would go here in a real app */}
              <div className="space-y-4 pt-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>LKR {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
                    {shipping === 0 ? "Free" : `LKR ${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>LKR {tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-4 font-bold flex justify-between">
                  <span>Total</span>
                  <span>LKR {total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="text-sm text-gray-500">
              <p>
                By placing your order, you agree to our Terms of Service and Privacy Policy.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;

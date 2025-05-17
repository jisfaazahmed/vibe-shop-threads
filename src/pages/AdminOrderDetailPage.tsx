
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";

// Define better types for the order and customer
type CustomerInfo = {
  first_name: string;
  last_name: string;
  email?: string | null;
  phone?: string | null;
};

type OrderItem = {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  product?: {
    name: string;
  };
};

type Order = {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  customer_id: string | null;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code: string;
  shipping_country: string;
  payment_method: string | null;
  items: OrderItem[];
  customer: CustomerInfo;
};

const AdminOrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: order, isLoading } = useQuery({
    queryKey: ["adminOrder", id],
    queryFn: async () => {
      try {
        // Get the order with its items
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .select(`
            *,
            items:order_items(
              *,
              product:products(name)
            )
          `)
          .eq("id", id)
          .single();

        if (orderError) {
          console.error("Error fetching order:", orderError);
          throw orderError;
        }

        // Get customer info if available
        let customerData: CustomerInfo = { 
          first_name: "Guest", 
          last_name: "User",
          email: null,
          phone: null
        };
        
        if (orderData.customer_id) {
          const { data: customer, error: customerError } = await supabase
            .from("customers")
            .select("first_name, last_name, phone, email")
            .eq("id", orderData.customer_id)
            .single();

          if (!customerError && customer) {
            customerData = customer;
          }
        }

        return {
          ...orderData,
          customer: customerData,
        } as Order;
      } catch (error) {
        console.error("Error in order detail query:", error);
        throw error;
      }
    },
    enabled: !!id,
  });

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-10 flex justify-center">
          <div className="w-8 h-8 border-4 border-t-brand-purple rounded-full animate-spin"></div>
        </div>
      </MainLayout>
    );
  }

  if (!order) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-10">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-10">
                <p className="text-xl font-medium mb-4">Order not found</p>
                <Button onClick={() => navigate("/admin")}>Back to Admin</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-10">
        <div className="mb-6 flex items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin")}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Button>
          <h1 className="text-3xl font-bold">Order Details</h1>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Order #{order.id.substring(0, 8)}</CardTitle>
                <CardDescription>
                  Placed on{" "}
                  {format(new Date(order.created_at), "MMMM d, yyyy 'at' h:mm a")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap justify-between items-center mb-6">
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <Badge
                      className={`font-medium ${getStatusColor(order.status)}`}
                      variant="outline"
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Payment Method</p>
                    <p className="font-medium">
                      {order.payment_method === "cod"
                        ? "Cash on Delivery"
                        : order.payment_method}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total Amount</p>
                    <p className="font-medium">LKR {order.total_amount.toFixed(2)}</p>
                  </div>
                </div>

                <div className="border-t pt-4 mb-6">
                  <h3 className="font-semibold mb-2">Order Items</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {order.items && order.items.length > 0 ? (
                      <table className="w-full text-sm">
                        <thead className="text-left border-b">
                          <tr>
                            <th className="pb-2">Item</th>
                            <th className="pb-2">Quantity</th>
                            <th className="pb-2 text-right">Price</th>
                            <th className="pb-2 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map((item) => (
                            <tr key={item.id} className="border-b last:border-b-0">
                              <td className="py-3">
                                {item.product?.name || "Unknown Product"}
                              </td>
                              <td className="py-3">{item.quantity}</td>
                              <td className="py-3 text-right">
                                LKR {item.price.toFixed(2)}
                              </td>
                              <td className="py-3 text-right">
                                LKR {(item.price * item.quantity).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p>No items found for this order</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <div className="w-72">
                    <div className="flex justify-between py-1">
                      <span>Subtotal</span>
                      <span>
                        LKR{" "}
                        {order.items
                          ?.reduce((sum, item) => sum + item.price * item.quantity, 0)
                          .toFixed(2) || "0.00"}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Shipping</span>
                      <span>
                        {order.total_amount > 10000 ? "Free" : "LKR 500.00"}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Tax</span>
                      <span>Included</span>
                    </div>
                    <div className="flex justify-between py-2 font-bold border-t mt-2">
                      <span>Total</span>
                      <span>LKR {order.total_amount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button variant="outline">Update Status</Button>
              </CardFooter>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <p className="font-semibold mb-1">Contact Information</p>
                  <p>
                    {order.customer.first_name} {order.customer.last_name}
                  </p>
                  <p>{order.customer.email || "Email not provided"}</p>
                  <p>{order.customer.phone || "Phone not provided"}</p>
                </div>
                <div>
                  <p className="font-semibold mb-1">Shipping Address</p>
                  <p>{order.shipping_address}</p>
                  <p>
                    {order.shipping_city}, {order.shipping_state}
                  </p>
                  <p>{order.shipping_postal_code}</p>
                  <p>{order.shipping_country}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminOrderDetailPage;

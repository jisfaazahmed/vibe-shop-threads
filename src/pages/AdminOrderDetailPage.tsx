
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layout/MainLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { format } from "date-fns";
import { ArrowLeft, Printer } from "lucide-react";

type CustomerInfo = {
  first_name: string;
  last_name: string;
  email?: string | null;
  phone?: string | null;
};

type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string;
  quantity: number;
  price: number;
  created_at: string;
  product: {
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
  updated_at: string;
  items: OrderItem[];
  customer: CustomerInfo;
};

const AdminOrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<string>("");
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ["adminOrder", id],
    queryFn: async (): Promise<Order | null> => {
      try {
        if (!id) return null;

        // Fetch order data
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

        // Default customer info
        let customerInfo: CustomerInfo = {
          first_name: "Guest",
          last_name: "User",
          email: null,
          phone: null,
        };

        // Fetch customer data if available
        if (orderData.customer_id) {
          const { data: customerData, error: customerError } = await supabase
            .from("customers")
            .select("first_name, last_name, email, phone")
            .eq("id", orderData.customer_id)
            .single();

          if (!customerError && customerData) {
            customerInfo = {
              first_name: customerData.first_name || "Guest",
              last_name: customerData.last_name || "User",
              email: customerData.email || null,
              phone: customerData.phone || null,
            };
          } else {
            console.error("Error fetching customer:", customerError);
          }
        }

        setStatus(orderData.status);

        return {
          ...orderData,
          customer: customerInfo,
        } as Order;
      } catch (error) {
        console.error("Error in adminOrder query:", error);
        throw error;
      }
    },
  });

  const updateOrderStatus = useMutation({
    mutationFn: async (newStatus: string) => {
      const { data, error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminOrder", id] });
      queryClient.invalidateQueries({ queryKey: ["adminOrders"] });
      toast.success("Order status updated successfully");
    },
    onError: (error) => {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    },
  });

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    updateOrderStatus.mutate(newStatus);
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
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
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-t-brand-purple rounded-full animate-spin"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!order) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <h2 className="text-2xl font-bold mb-2">Order not found</h2>
                <p className="text-gray-600 mb-4">
                  The order you're looking for doesn't exist or has been removed.
                </p>
                <Button onClick={() => navigate("/admin/orders")}>
                  Back to Orders
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Back button and print */}
        <div className="flex justify-between mb-6">
          <Button
            variant="outline"
            onClick={() => navigate("/admin/orders")}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} /> Back to Orders
          </Button>
          <Button
            variant="outline"
            onClick={handlePrint}
            className="flex items-center gap-2"
          >
            <Printer size={16} /> Print Order
          </Button>
        </div>

        {/* Order Details */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
            <div>
              <CardTitle>Order #{order.id.substring(0, 8)}</CardTitle>
              <CardDescription>
                Placed on {format(new Date(order.created_at), "PPP")}
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Status:</span>
              <Select value={status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Customer and Shipping */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-lg mb-2">Customer Information</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="font-medium">
                    {order.customer.first_name} {order.customer.last_name}
                  </p>
                  {order.customer.email && <p>{order.customer.email}</p>}
                  {order.customer.phone && <p>{order.customer.phone}</p>}
                </div>
              </div>
              <div>
                <h3 className="font-medium text-lg mb-2">Shipping Address</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p>{order.shipping_address}</p>
                  <p>
                    {order.shipping_city}, {order.shipping_state}{" "}
                    {order.shipping_postal_code}
                  </p>
                  <p>{order.shipping_country}</p>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Order Items */}
            <h3 className="font-medium text-lg mb-4">Order Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Product</th>
                    <th className="text-center py-2">Quantity</th>
                    <th className="text-right py-2">Price</th>
                    <th className="text-right py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="py-3">
                          {item.product?.name || "Unknown Product"}
                        </td>
                        <td className="text-center py-3">{item.quantity}</td>
                        <td className="text-right py-3">
                          LKR {item.price.toFixed(2)}
                        </td>
                        <td className="text-right py-3">
                          LKR {(item.price * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center py-4">
                        No items found for this order
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td colSpan={2} className="py-3"></td>
                    <td className="text-right py-3 font-medium">Order Total:</td>
                    <td className="text-right py-3 font-bold">
                      LKR {order.total_amount.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <Separator className="my-6" />

            {/* Payment Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-lg mb-2">Payment Method</h3>
                <p>{order.payment_method || "Not specified"}</p>
              </div>
              <div>
                <h3 className="font-medium text-lg mb-2">Order Status</h3>
                <Badge
                  className={`${getStatusColor(order.status)} px-3 py-1`}
                  variant="outline"
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AdminOrderDetailPage;

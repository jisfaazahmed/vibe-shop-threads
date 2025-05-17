import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
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
import { format } from "date-fns";
import { ArrowLeft, Printer } from "lucide-react";

// Define the type for customer info
type CustomerInfo = {
  first_name: string | null;
  last_name: string | null;
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

  const { data: order, isLoading } = useQuery({
    queryKey: ["orderDetail", id],
    queryFn: async () => {
      if (!id) return null;

      // Fetch order details
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
        return null;
      }

      // Default customer info
      let customerInfo: CustomerInfo = {
        first_name: "Guest",
        last_name: "User",
        email: null,
        phone: null
      };

      // Fetch customer details if customer_id exists
      if (orderData.customer_id) {
        const { data: customerData, error: customerError } = await supabase
          .from("customers")
          .select("first_name, last_name")
          .eq("id", orderData.customer_id)
          .single();

        if (!customerError && customerData) {
          customerInfo = {
            first_name: customerData.first_name || "Guest",
            last_name: customerData.last_name || "User",
            email: null,
            phone: null
          };
        } else {
          console.error("Error fetching customer:", customerError);
        }
      }

      return {
        ...orderData,
        customer: customerInfo,
      };
    },
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return "bg-green-100 text-green-800";
      case 'processing':
        return "bg-blue-100 text-blue-800";
      case 'shipped':
        return "bg-purple-100 text-purple-800";
      case 'cancelled':
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-t-brand-purple rounded-full animate-spin"></div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <Button variant="outline" className="mb-6" onClick={() => navigate("/admin")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
        </Button>

        {order ? (
          <div className="space-y-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Order #{order.id.substring(0, 8)}</CardTitle>
                  <CardDescription>
                    Placed on {format(new Date(order.created_at), "MMM d, yyyy")}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  <Badge
                    variant="outline"
                    className={getStatusColor(order.status)}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Printer className="mr-2 h-4 w-4" /> Print
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Customer Information */}
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">
                      Customer Information
                    </h3>
                    <div className="text-sm">
                      <p className="font-medium">{order.customer.first_name} {order.customer.last_name}</p>
                      {order.customer.email && <p>{order.customer.email}</p>}
                      {order.customer.phone && <p>{order.customer.phone}</p>}
                    </div>
                  </div>

                  {/* Shipping Information */}
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">
                      Shipping Information
                    </h3>
                    <div className="text-sm">
                      <p>{order.shipping_address}</p>
                      <p>
                        {order.shipping_city}, {order.shipping_state}{" "}
                        {order.shipping_postal_code}
                      </p>
                      <p>{order.shipping_country}</p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mt-6">
                  <h3 className="font-medium text-gray-700 mb-2">Order Items</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full leading-normal">
                      <thead>
                        <tr>
                          <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Product
                          </th>
                          <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th className="px-5 py-3 border-b-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Price
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map((item) => (
                          <tr key={item.id}>
                            <td className="px-5 py-5 border-b text-sm">
                              {item.product?.name}
                            </td>
                            <td className="px-5 py-5 border-b text-sm">
                              {item.quantity}
                            </td>
                            <td className="px-5 py-5 border-b text-sm">
                              LKR {item.price.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Total Amount */}
                <div className="mt-6 flex justify-end">
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Subtotal:</div>
                    <div className="text-lg font-bold">
                      LKR {order.total_amount.toFixed(2)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold mb-4">Order not found</h1>
            <p className="mb-8">The order you're looking for doesn't exist.</p>
            <Button asChild>
              <Link to="/admin">Back to Admin Dashboard</Link>
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

// Helper function to get the status color
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return "bg-green-100 text-green-800";
    case 'processing':
      return "bg-blue-100 text-blue-800";
    case 'shipped':
      return "bg-purple-100 text-purple-800";
    case 'cancelled':
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default AdminOrderDetailPage;


import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Pencil, Eye } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

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

const AdminOrders = () => {
  const navigate = useNavigate();
  
  const { data: orders, isLoading } = useQuery({
    queryKey: ["adminOrders"],
    queryFn: async (): Promise<Order[]> => {
      try {
        // First get orders with their items
        const { data: ordersData, error: ordersError } = await supabase
          .from("orders")
          .select(`
            *,
            items:order_items(
              *,
              product:products(name)
            )
          `)
          .order("created_at", { ascending: false });

        if (ordersError) {
          console.error("Error fetching orders:", ordersError);
          throw ordersError;
        }

        // Then fetch customer info for each order
        const ordersWithCustomers = await Promise.all(
          ordersData.map(async (order) => {
            let customerInfo: CustomerInfo = { 
              first_name: "Guest", 
              last_name: "User",
              email: null,
              phone: null
            };

            if (order.customer_id) {
              const { data: customerData, error: customerError } = await supabase
                .from("customers")
                .select("first_name, last_name, email, phone")
                .eq("id", order.customer_id)
                .single();

              if (!customerError && customerData) {
                customerInfo = customerData as CustomerInfo;
              }
            }

            return {
              ...order,
              customer: customerInfo,
            };
          })
        );

        return ordersWithCustomers as Order[];
      } catch (error) {
        console.error("Error in adminOrders query:", error);
        throw error;
      }
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

  const handleViewOrder = (orderId: string) => {
    navigate(`/admin/orders/${orderId}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <div className="w-8 h-8 border-4 border-t-brand-purple rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Orders</CardTitle>
        <CardDescription>
          Manage customer orders and their status
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {orders && orders.length > 0 ? (
            orders.map((order) => (
              <div
                key={order.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Order ID</p>
                    <p className="font-medium">{order.id.substring(0, 8)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium">
                      {format(new Date(order.created_at), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Customer</p>
                    <p className="font-medium">
                      {order.customer.first_name} {order.customer.last_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="font-medium">LKR {order.total_amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <Badge
                      className={`font-medium mt-1 ${getStatusColor(order.status)}`}
                      variant="outline"
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-2">Items:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {order.items && order.items.length > 0 ? (
                      order.items.map((item) => (
                        <li key={item.id}>
                          {item.product?.name || "Unknown Product"} x {item.quantity} - LKR{" "}
                          {item.price.toFixed(2)}
                        </li>
                      ))
                    ) : (
                      <li>No items found for this order</li>
                    )}
                  </ul>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => handleViewOrder(order.id)}>
                    <Eye className="mr-1 h-4 w-4" /> View
                  </Button>
                  <Button variant="outline" size="sm">
                    <Pencil className="mr-1 h-4 w-4" /> Edit
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">No orders found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminOrders;


import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

type OrderItem = {
  id: string;
  product_id: string | null;
  quantity: number;
  price: number;
  product: {
    name: string;
  } | null;
};

type Order = {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  customer_id: string | null;
  customer: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  };
  items: OrderItem[];
};

const AdminOrders = () => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { data: orders, isLoading } = useQuery({
    queryKey: ["adminOrders"],
    queryFn: async (): Promise<Order[]> => {
      // Fetch orders with customer details
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select(`
          *,
          customer:customer_id (
            first_name,
            last_name,
            email
          )
        `)
        .order("created_at", { ascending: false });
      
      if (ordersError) {
        console.error("Error fetching orders:", ordersError);
        throw ordersError;
      }

      // For each order, fetch order items
      const ordersWithItems = await Promise.all(
        (ordersData || []).map(async (order) => {
          // Create default customer object to handle potential null values
          const customer = order.customer || {
            first_name: null,
            last_name: null,
            email: null
          };

          const { data: itemsData, error: itemsError } = await supabase
            .from("order_items")
            .select(`
              *,
              product:product_id (
                name
              )
            `)
            .eq("order_id", order.id);
          
          if (itemsError) {
            console.error(`Error fetching order items for order ${order.id}:`, itemsError);
            return { 
              ...order, 
              customer,
              items: [] 
            };
          }
          
          return { 
            ...order, 
            customer,
            items: itemsData || [] 
          };
        })
      );
      
      return ordersWithItems;
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
      <div className="flex justify-center py-10">
        <div className="w-8 h-8 border-4 border-t-brand-purple rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders && orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left">Order ID</th>
                    <th className="p-2 text-left">Customer</th>
                    <th className="p-2 text-left">Date</th>
                    <th className="p-2 text-left">Total</th>
                    <th className="p-2 text-left">Status</th>
                    <th className="p-2 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-muted/50">
                      <td className="p-2">{order.id.substring(0, 8)}...</td>
                      <td className="p-2">
                        {order.customer?.first_name && order.customer?.last_name 
                          ? `${order.customer.first_name} ${order.customer.last_name}`
                          : "Guest User"}
                      </td>
                      <td className="p-2">
                        {format(new Date(order.created_at), "MMM d, yyyy")}
                      </td>
                      <td className="p-2">LKR {order.total_amount.toFixed(2)}</td>
                      <td className="p-2">
                        <Badge
                          className={`font-medium ${getStatusColor(order.status)}`}
                          variant="outline"
                        >
                          {order.status}
                        </Badge>
                      </td>
                      <td className="p-2 text-center">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              onClick={() => setSelectedOrder(order)}
                            >
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>Order Details</DialogTitle>
                            </DialogHeader>
                            {selectedOrder && (
                              <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <h3 className="font-semibold mb-2">Order Information</h3>
                                    <p><span className="font-medium">Order ID:</span> {selectedOrder.id}</p>
                                    <p><span className="font-medium">Date:</span> {format(new Date(selectedOrder.created_at), "MMM d, yyyy h:mm a")}</p>
                                    <p><span className="font-medium">Status:</span> {selectedOrder.status}</p>
                                    <p><span className="font-medium">Total:</span> LKR {selectedOrder.total_amount.toFixed(2)}</p>
                                  </div>
                                  <div>
                                    <h3 className="font-semibold mb-2">Customer Information</h3>
                                    <p><span className="font-medium">Name:</span> {selectedOrder.customer?.first_name && selectedOrder.customer?.last_name 
                                      ? `${selectedOrder.customer.first_name} ${selectedOrder.customer.last_name}`
                                      : "Guest User"}</p>
                                    <p><span className="font-medium">Email:</span> {selectedOrder.customer?.email || "—"}</p>
                                  </div>
                                </div>
                                
                                <div>
                                  <h3 className="font-semibold mb-2">Order Items</h3>
                                  <table className="w-full">
                                    <thead>
                                      <tr className="border-b">
                                        <th className="p-2 text-left">Product</th>
                                        <th className="p-2 text-center">Quantity</th>
                                        <th className="p-2 text-right">Price</th>
                                        <th className="p-2 text-right">Subtotal</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {selectedOrder.items.map((item) => (
                                        <tr key={item.id} className="border-b">
                                          <td className="p-2">{item.product?.name || `Product ID: ${item.product_id}`}</td>
                                          <td className="p-2 text-center">{item.quantity}</td>
                                          <td className="p-2 text-right">LKR {item.price.toFixed(2)}</td>
                                          <td className="p-2 text-right">LKR {(item.price * item.quantity).toFixed(2)}</td>
                                        </tr>
                                      ))}
                                      <tr className="font-medium">
                                        <td colSpan={3} className="p-2 text-right">Total:</td>
                                        <td className="p-2 text-right">LKR {selectedOrder.total_amount.toFixed(2)}</td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

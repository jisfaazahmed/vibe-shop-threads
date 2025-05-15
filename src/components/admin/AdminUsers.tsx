
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

type CustomerWithAuth = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  is_admin: boolean;
  created_at: string;
};

const AdminUsers = () => {
  const queryClient = useQueryClient();

  const { data: customers, isLoading } = useQuery({
    queryKey: ["adminCustomers"],
    queryFn: async (): Promise<CustomerWithAuth[]> => {
      // First, get all users from auth schema (this requires admin privileges)
      const { data: authUsers, error: authError } = await supabase
        .from("customers")
        .select("*");
      
      if (authError) {
        console.error("Error fetching customers:", authError);
        throw authError;
      }
      
      // Then get their emails from auth.users
      // In a real application, we would need a Supabase Edge Function with
      // service role to access auth.users table, but for this prototype
      // we'll just fetch the customer profiles
      
      return authUsers.map(customer => ({
        ...customer,
        email: customer.email || "No email available",
      })) || [];
    },
  });

  const toggleAdminStatus = useMutation({
    mutationFn: async ({ userId, isAdmin }: { userId: string; isAdmin: boolean }) => {
      const { error } = await supabase
        .from("customers")
        .update({ is_admin: isAdmin })
        .eq("id", userId);
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Update failed",
          description: error.message,
        });
        throw error;
      }
      
      toast({
        title: "User updated",
        description: `Admin status ${isAdmin ? 'granted' : 'revoked'} successfully.`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCustomers"] });
    },
  });

  const handleToggleAdmin = (userId: string, currentStatus: boolean) => {
    toggleAdminStatus.mutate({ userId, isAdmin: !currentStatus });
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
        <CardTitle>Manage Users</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {customers && customers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-left">Email</th>
                    <th className="p-2 text-left">Phone</th>
                    <th className="p-2 text-left">Joined</th>
                    <th className="p-2 text-center">Admin</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id} className="border-b hover:bg-muted/50">
                      <td className="p-2">
                        {customer.first_name && customer.last_name 
                          ? `${customer.first_name} ${customer.last_name}`
                          : "Not provided"}
                      </td>
                      <td className="p-2">{customer.email}</td>
                      <td className="p-2">{customer.phone || "—"}</td>
                      <td className="p-2">
                        {customer.created_at 
                          ? format(new Date(customer.created_at), "MMM d, yyyy")
                          : "—"}
                      </td>
                      <td className="p-2 text-center">
                        <Switch
                          checked={customer.is_admin || false}
                          onCheckedChange={() => handleToggleAdmin(customer.id, customer.is_admin || false)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">No users found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminUsers;

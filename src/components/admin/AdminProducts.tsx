
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import { Plus, Edit, Trash2 } from "lucide-react";
import ProductForm from "./ProductForm";

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  featured: boolean;
  category: string | null;
  created_at: string;
  updated_at: string;
};

const AdminProducts = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ["adminProducts"],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching products:", error);
        throw error;
      }
      
      return data || [];
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Deletion failed",
          description: error.message,
        });
        throw error;
      }
      
      toast.success("Product deleted successfully");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
    },
  });

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteProduct.mutate(productId);
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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Manage Products</CardTitle>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus size={16} />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <ProductForm 
              onSuccess={() => {
                setIsAddDialogOpen(false);
                queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
              }} 
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products && products.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left">Name</th>
                    <th className="p-2 text-left">Price</th>
                    <th className="p-2 text-left">Stock</th>
                    <th className="p-2 text-left">Category</th>
                    <th className="p-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-muted/50">
                      <td className="p-2">{product.name}</td>
                      <td className="p-2">LKR {product.price.toFixed(2)}</td>
                      <td className="p-2">{product.stock}</td>
                      <td className="p-2">{product.category || "—"}</td>
                      <td className="p-2 text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => setEditingProduct(product)}
                            >
                              <Edit size={16} />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-xl">
                            <DialogHeader>
                              <DialogTitle>Edit Product</DialogTitle>
                            </DialogHeader>
                            {editingProduct && (
                              <ProductForm 
                                productId={editingProduct.id}
                                product={editingProduct}
                                onSuccess={() => {
                                  setEditingProduct(null);
                                  queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
                                }} 
                              />
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500 mb-4">No products found</p>
              <Button 
                onClick={() => setIsAddDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus size={16} />
                Add Product
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminProducts;

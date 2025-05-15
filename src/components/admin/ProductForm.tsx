
import React from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

type ProductFormProps = {
  product?: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    stock: number;
    featured: boolean;
    category: string | null;
  };
  onSuccess: () => void;
};

const formSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional().nullable(),
  price: z.coerce.number().min(0.01, "Price must be greater than zero"),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
  featured: z.boolean().default(false),
  category: z.string().optional().nullable(),
});

const ProductForm: React.FC<ProductFormProps> = ({ product, onSuccess }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: product ? {
      name: product.name,
      description: product.description || "",
      price: product.price,
      stock: product.stock,
      featured: product.featured,
      category: product.category || "",
    } : {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      featured: false,
      category: "",
    },
  });

  const saveProduct = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      // Clean up empty strings to be null for the database
      const productData = {
        ...values,
        description: values.description || null,
        category: values.category || null,
      };
      
      if (product) {
        // Update existing product
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", product.id);
        
        if (error) {
          toast({
            variant: "destructive",
            title: "Update failed",
            description: error.message,
          });
          throw error;
        }
        
        toast({
          title: "Product updated",
          description: "Product has been updated successfully.",
        });
      } else {
        // Create new product
        const { error } = await supabase
          .from("products")
          .insert([productData]);
        
        if (error) {
          toast({
            variant: "destructive",
            title: "Creation failed",
            description: error.message,
          });
          throw error;
        }
        
        toast({
          title: "Product created",
          description: "New product has been added successfully.",
        });
      }
    },
    onSuccess: () => {
      form.reset();
      onSuccess();
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    saveProduct.mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter product name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter product description" 
                  {...field} 
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price ($)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter product category" 
                  {...field} 
                  value={field.value || ""} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="featured"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Featured Product</FormLabel>
                <p className="text-sm text-muted-foreground">
                  This product will be displayed on the home page.
                </p>
              </div>
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => form.reset()}
          >
            Reset
          </Button>
          <Button 
            type="submit" 
            disabled={saveProduct.isPending}
          >
            {saveProduct.isPending ? "Saving..." : product ? "Update Product" : "Create Product"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProductForm;


import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/sonner";

interface ProductFormProps {
  productId?: string;
  product?: Product;
  onSuccess?: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ productId, product, onSuccess }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [stock, setStock] = useState<number | "">("");
  const [featured, setFeatured] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (productId) {
      // Fetch product details for editing
      supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single()
        .then(({ data, error }) => {
          if (error) {
            console.error("Error fetching product:", error);
            toast.error("Failed to load product details");
          } else if (data) {
            setName(data.name);
            setDescription(data.description || "");
            setCategory(data.category || "");
            setPrice(data.price);
            setStock(data.stock);
            setFeatured(data.featured || false);
          }
        });
    } else if (product) {
      // Use the provided product object
      setName(product.name);
      setDescription(product.description || "");
      setCategory(product.category || "");
      setPrice(product.price);
      setStock(product.stock);
      setFeatured(product.featured || false);
    }
  }, [productId, product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validate product data
      if (!name || !price || !description || !category) {
        toast.error("Please fill in all required fields");
        setSubmitting(false);
        return;
      }

      // Parse price as a number
      const priceValue = typeof price === "string" ? parseFloat(price) : price;
      
      // Create or update product
      const productData = {
        name,
        description,
        category,
        price: priceValue,
        stock: typeof stock === "string" ? parseInt(stock) : stock,
        featured
      };

      let result;
      
      if (productId) {
        // Update existing product
        result = await supabase
          .from("products")
          .update(productData)
          .eq("id", productId);
      } else {
        // Create new product
        result = await supabase
          .from("products")
          .insert(productData);
      }

      if (result.error) throw result.error;

      toast.success(
        `Product ${productId ? "updated" : "created"} successfully`
      );
      
      // Reset form or navigate
      if (!productId) {
        // Reset form for new products
        setName("");
        setDescription("");
        setCategory("");
        setPrice(0);
        setStock(0);
        setFeatured(false);
      }

      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Failed to save product");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle string to number conversions for inputs
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPrice(value === "" ? "" : parseFloat(value));
  };

  const handleStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setStock(value === "" ? "" : parseInt(value));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="category">Category</Label>
        <Input
          type="text"
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="price">Price</Label>
        <Input
          type="number"
          id="price"
          value={price}
          onChange={handlePriceChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="stock">Stock</Label>
        <Input
          type="number"
          id="stock"
          value={stock}
          onChange={handleStockChange}
        />
      </div>
      <div>
        <Label htmlFor="featured">Featured</Label>
        <Switch
          id="featured"
          checked={featured}
          onCheckedChange={(checked) => setFeatured(checked)}
        />
      </div>
      <Button type="submit" disabled={submitting}>
        {submitting ? "Submitting..." : productId ? "Update Product" : "Create Product"}
      </Button>
    </form>
  );
};

export default ProductForm;

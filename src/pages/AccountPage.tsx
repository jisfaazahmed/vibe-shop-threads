
import React from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AccountProfile from "@/components/account/AccountProfile";
import AccountOrders from "@/components/account/AccountOrders";
import AccountAuth from "@/components/account/AccountAuth";
import { useAuth } from "@/context/AuthContext";

const AccountPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-10 flex justify-center">
          <div className="w-8 h-8 border-4 border-t-brand-purple rounded-full animate-spin"></div>
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-10">
          <AccountAuth />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-8">My Account</h1>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <AccountProfile />
          </TabsContent>
          
          <TabsContent value="orders">
            <AccountOrders />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default AccountPage;

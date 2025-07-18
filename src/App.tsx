
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";

// Public Website Pages
import Index from "./pages/Index";
import About from "./pages/About";
import Spaces from "./pages/Spaces";
import HowItWorks from "./pages/HowItWorks";
import Community from "./pages/Community";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";

// User Portal Pages
import UserDashboard from "./pages/user/Dashboard";
import UserProfile from "./pages/user/Profile";
import BrowseRooms from "./pages/user/BrowseRooms";
import MyBookings from "./pages/user/MyBookings";
import Payments from "./pages/user/Payments";
import Support from "./pages/user/Support";
import UserEvents from "./pages/user/Events";

// Admin Dashboard Pages
import AdminDashboard from "./pages/admin/Dashboard";
import UserManagement from "./pages/admin/UserManagement";
import RoomManagement from "./pages/admin/RoomManagement";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Website Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/spaces" element={<Spaces />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/community" element={<Community />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin-login" element={<AdminLogin />} />

            {/* User Portal Routes */}
            <Route path="/user/dashboard" element={<UserDashboard />} />
            <Route path="/user/profile" element={<UserProfile />} />
            <Route path="/user/rooms" element={<BrowseRooms />} />
            <Route path="/user/bookings" element={<MyBookings />} />
            <Route path="/user/payments" element={<Payments />} />
            <Route path="/user/support" element={<Support />} />
            <Route path="/user/events" element={<UserEvents />} />

            {/* Protected Admin Dashboard Routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedAdminRoute>
                <UserManagement />
              </ProtectedAdminRoute>
            } />
            <Route path="/admin/rooms" element={
              <ProtectedAdminRoute>
                <RoomManagement />
              </ProtectedAdminRoute>
            } />
            <Route path="/admin/bookings" element={
              <ProtectedAdminRoute>
                <div className="p-8"><h1 className="text-2xl">Booking Management - Coming Soon</h1></div>
              </ProtectedAdminRoute>
            } />
            <Route path="/admin/payments" element={
              <ProtectedAdminRoute>
                <div className="p-8"><h1 className="text-2xl">Payment Management - Coming Soon</h1></div>
              </ProtectedAdminRoute>
            } />
            <Route path="/admin/tickets" element={
              <ProtectedAdminRoute>
                <div className="p-8"><h1 className="text-2xl">Ticket Management - Coming Soon</h1></div>
              </ProtectedAdminRoute>
            } />
            <Route path="/admin/events" element={
              <ProtectedAdminRoute>
                <div className="p-8"><h1 className="text-2xl">Event Management - Coming Soon</h1></div>
              </ProtectedAdminRoute>
            } />
            <Route path="/admin/reports" element={
              <ProtectedAdminRoute>
                <div className="p-8"><h1 className="text-2xl">Reports - Coming Soon</h1></div>
              </ProtectedAdminRoute>
            } />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

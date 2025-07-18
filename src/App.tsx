
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import ProtectedUserRoute from "./components/ProtectedUserRoute";

// Public Website Pages
import Index from "./pages/Index";
import About from "./pages/About";
import Spaces from "./pages/Spaces";
import HowItWorks from "./pages/HowItWorks";
import Community from "./pages/Community";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
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
import BookingManagement from "./pages/admin/BookingManagement";
import PaymentManagement from "./pages/admin/PaymentManagement";
import TicketManagement from "./pages/admin/TicketManagement";
import EventManagement from "./pages/admin/EventManagement";
import Reports from "./pages/admin/Reports";

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
            <Route path="/register" element={<Register />} />
            <Route path="/admin-login" element={<AdminLogin />} />

            {/* User Portal Routes */}
            <Route path="/user/dashboard" element={
              <ProtectedUserRoute>
                <UserDashboard />
              </ProtectedUserRoute>
            } />
            <Route path="/user/profile" element={
              <ProtectedUserRoute>
                <UserProfile />
              </ProtectedUserRoute>
            } />
            <Route path="/user/rooms" element={
              <ProtectedUserRoute>
                <BrowseRooms />
              </ProtectedUserRoute>
            } />
            <Route path="/user/bookings" element={
              <ProtectedUserRoute>
                <MyBookings />
              </ProtectedUserRoute>
            } />
            <Route path="/user/payments" element={
              <ProtectedUserRoute>
                <Payments />
              </ProtectedUserRoute>
            } />
            <Route path="/user/support" element={
              <ProtectedUserRoute>
                <Support />
              </ProtectedUserRoute>
            } />
            <Route path="/user/events" element={
              <ProtectedUserRoute>
                <UserEvents />
              </ProtectedUserRoute>
            } />

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
                <BookingManagement />
              </ProtectedAdminRoute>
            } />
            <Route path="/admin/payments" element={
              <ProtectedAdminRoute>
                <PaymentManagement />
              </ProtectedAdminRoute>
            } />
            <Route path="/admin/tickets" element={
              <ProtectedAdminRoute>
                <TicketManagement />
              </ProtectedAdminRoute>
            } />
            <Route path="/admin/events" element={
              <ProtectedAdminRoute>
                <EventManagement />
              </ProtectedAdminRoute>
            } />
            <Route path="/admin/reports" element={
              <ProtectedAdminRoute>
                <Reports />
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


import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Building, 
  Calendar, 
  CreditCard, 
  AlertTriangle,
  CheckCircle 
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import axios from "axios";
import { useAuth } from '@/contexts/AuthContext';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"; 

const AdminDashboard = () => {
  const { user } = useAuth();
    const token = user?.token;
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRooms: 0,
    occupiedRooms: 0,
    availableRooms: 0,
    pendingBookings: 0,
    activeBookings: 0,
    // totalRevenue: 0,
    pendingTickets: 0,
    resolvedTickets: 0,
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch various statistics
      const [
        usersRes,
        roomsRes,
        bookingsRes,
        // paymentsRes,
        ticketsRes,
      ] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/user-by-admin/getAllUsers`,{headers: { Authorization: `Bearer ${token}` }}),
        axios.get(`${API_BASE_URL}/api/rooms/getall`),
        axios.get(`${API_BASE_URL}/api/book-room/getUserBookings`,{headers: { Authorization: `Bearer ${token}` }}),
        // axios.get(`${API_BASE_URL}/api/payments`),
        axios.get(`${API_BASE_URL}/api/tickets/get-all-tickets`,{headers: { Authorization: `Bearer ${token}` }}),
      ]);

      const users = usersRes.data || [];      
      const rooms = roomsRes.data.data || roomsRes.data || [];
      const bookings = bookingsRes.data || [];
      // const payments = paymentsRes.data || [];
      const tickets = ticketsRes.data || [];

      setStats({
        totalUsers: users.length,
        totalRooms: rooms.length,
        occupiedRooms: rooms.filter(r => r.current_occupancy > 0).length,
        availableRooms: rooms.filter(r => r.is_available).length,
        pendingBookings: bookings.filter(b => b.status === 'pending').length,
        activeBookings: bookings.filter(b => b.status === 'active').length,
        // totalRevenue: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
        pendingTickets: tickets.filter(t => t.status === 'open').length,
        resolvedTickets: tickets.filter(t => t.status === 'resolved').length,
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const occupancyRate = stats.totalRooms > 0 ? 
    Math.round((stats.occupiedRooms / stats.totalRooms) * 100) : 0;

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Badge variant="secondary">Real-time Overview</Badge>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Registered residents</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{occupancyRate}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.occupiedRooms}/{stats.totalRooms} rooms occupied
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingBookings}</div>
              <p className="text-xs text-muted-foreground">Requires approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            {/* <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total collected</p>
            </CardContent> */}
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Pending Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Booking Approvals</span>
                <Badge variant="destructive">{stats.pendingBookings}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Open Maintenance Tickets</span>
                <Badge variant="outline">{stats.pendingTickets}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Available Rooms</span>
                <Badge variant="secondary">{stats.availableRooms}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Active Bookings</span>
                <Badge variant="default">{stats.activeBookings}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Resolved Tickets</span>
                <Badge variant="secondary">{stats.resolvedTickets}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>System Health</span>
                <Badge variant="default">Operational</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm">New booking request from Room 201</p>
                  <p className="text-xs text-muted-foreground">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm">Payment received - ₹25,000</p>
                  <p className="text-xs text-muted-foreground">1 hour ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm">Maintenance ticket assigned</p>
                  <p className="text-xs text-muted-foreground">3 hours ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;

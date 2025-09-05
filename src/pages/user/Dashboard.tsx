
import { useState, useEffect } from 'react';
import UserLayout from '@/components/UserLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"; 
import axios from 'axios';
import { 
  Home, 
  Calendar, 
  CreditCard, 
  Bell, 
  MapPin, 
  Users, 
  Clock,
  CheckCircle,
  Loader2
} from 'lucide-react';

interface Booking {
  id: string;
  room_id: string;
  status: string;
  monthly_rent: number;
  check_in_date: string;
  check_out_date: string | null;
  rooms: {
    room_number: string;
    room_type: string;
    floor_number: number;
    price_per_month: number;
    amenities: string[];
  };
}

interface Payment {
  id: string;
  amount: number;
  payment_date: string;
  payment_type: string;
  status: string;
}

interface MaintenanceTicket {
  id: string;
  title: string;
  status: string;
  created_at: string;
}

interface Event {
  id: string;
  title: string;
  event_date: string;
  location: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [openTickets, setOpenTickets] = useState<MaintenanceTicket[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try { 
      setLoading(true);

      // Fetch current active booking
       const [
        bookingsRes,
        paymentsRes,
        ticketsRes,
        eventsRes
      ] = await Promise.all([
         axios.get(`${API_BASE_URL}/api/bookings?userId=${user.id}&status=active`),
        axios.get(`${API_BASE_URL}/api/payments?userId=${user.id}&limit=3`),
        axios.get(`${API_BASE_URL}/api/tickets?userId=${user.id}&status=open,in_progress&limit=3`),
        axios.get(`${API_BASE_URL}/api/events?isActive=true&from=${new Date().toISOString()}&limit=3`)
      ]);

      setCurrentBooking(bookingsRes.data?.[0] || null);
      setRecentPayments(paymentsRes.data || []);
      setOpenTickets(ticketsRes.data || []);
      setUpcomingEvents(eventsRes.data || []);


    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="p-6 max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </UserLayout>
    );
  }

  const stats = [
    { 
      title: 'Current Booking', 
      value: currentBooking?.rooms?.room_number ? `Room ${currentBooking.rooms.room_number }` : 'No active booking', 
      icon: Home, 
      color: 'text-green-600' 
    },
    { 
      title: 'Monthly Rent', 
      value: currentBooking ? formatCurrency(currentBooking.monthly_rent) : '-', 
      icon: CreditCard, 
      color: 'text-blue-600' 
    },
    { 
      title: 'Recent Payments', 
      value: recentPayments.length.toString(), 
      icon: Calendar, 
      color: 'text-orange-600' 
    },
    { 
      title: 'Open Tickets', 
      value: openTickets.length.toString(), 
      icon: Bell, 
      color: 'text-purple-600' 
    },
  ];

  return (
    <UserLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {user?.fullName || user?.name || "User"}! 👋
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening in your co-living space today.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="border-0 shadow-soft hover:shadow-medium transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Room Info */}
          <div className="lg:col-span-2">
            {currentBooking ? (
              <Card className="border-0 shadow-soft mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Home className="h-5 w-5 mr-2 text-secondary" />
                    Your Current Room
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">Room {currentBooking.rooms.room_number}</h3>
                    <div className="flex items-center text-muted-foreground mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">Floor {currentBooking.rooms.floor_number}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">
                      {currentBooking.rooms.room_type}
                    </Badge>
                    {currentBooking.rooms.amenities?.map((amenity, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">Since {formatDate(currentBooking.check_in_date)}</span>
                    </div>
                    <div className="flex items-center">
                      <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">{formatCurrency(currentBooking.monthly_rent)}/month</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-0 shadow-soft mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Home className="h-5 w-5 mr-2 text-secondary" />
                    No Active Booking
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">You don't have any active bookings.</p>
                  <Button variant="outline">Browse Available Rooms</Button>
                </CardContent>
              </Card>
            )}

            {/* Recent Activities */}
            <Card className="border-0 shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-secondary" />
                  Recent Activities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentPayments.length > 0 ? (
                    recentPayments.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-3 text-green-500" />
                          <div>
                            <p className="text-sm font-medium">{payment.payment_type} payment</p>
                            <p className="text-xs text-muted-foreground">{formatDate(payment.payment_date)}</p>
                          </div>
                        </div>
                        <Badge variant="default">
                          {formatCurrency(payment.amount)}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4">No recent activities</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Events */}
            <Card className="border-0 shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-secondary" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingEvents.length > 0 ? (
                    upcomingEvents.map((event) => (
                      <div key={event.id} className="p-3 bg-gradient-card rounded-lg">
                        <h4 className="font-medium text-sm">{event.title}</h4>
                        <p className="text-xs text-muted-foreground">{formatDate(event.event_date)}</p>
                        <p className="text-xs text-muted-foreground">{event.location}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4 text-sm">No upcoming events</p>
                  )}
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4">
                  View All Events
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-soft">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="outline">
                  <CreditCard className="h-4 w-4 mr-2" />
                  View Payments
                </Button>
                <Button className="w-full" variant="outline">
                  <Bell className="h-4 w-4 mr-2" />
                  Submit Ticket
                </Button>
                <Button className="w-full" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Browse Rooms
                </Button>
                <Button className="w-full" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  View Profile
                </Button>
              </CardContent>
            </Card>

            {/* Open Tickets */}
            {openTickets.length > 0 && (
              <Card className="border-0 shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="h-5 w-5 mr-2 text-secondary" />
                    Open Tickets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {openTickets.map((ticket) => (
                      <div key={ticket.id} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm font-medium">{ticket.title}</p>
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-xs text-muted-foreground">{formatDate(ticket.created_at)}</p>
                          <Badge variant="secondary" className="text-xs">
                            {ticket.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default Dashboard;

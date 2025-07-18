import UserLayout from '@/components/UserLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Home, 
  Calendar, 
  CreditCard, 
  Bell, 
  MapPin, 
  Users, 
  Wifi, 
  Car,
  Coffee,
  Shield,
  Clock,
  CheckCircle
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  const stats = [
    { title: 'Current Booking', value: 'Room A-201', icon: Home, color: 'text-green-600' },
    { title: 'Monthly Rent', value: '$850', icon: CreditCard, color: 'text-blue-600' },
    { title: 'Next Payment', value: 'Feb 1, 2024', icon: Calendar, color: 'text-orange-600' },
    { title: 'Support Tickets', value: '2 Open', icon: Bell, color: 'text-purple-600' },
  ];

  const recentActivities = [
    { activity: 'Rent payment processed', time: '2 hours ago', status: 'completed' },
    { activity: 'Maintenance request submitted', time: '1 day ago', status: 'pending' },
    { activity: 'Community event attended', time: '3 days ago', status: 'completed' },
    { activity: 'Profile updated', time: '1 week ago', status: 'completed' },
  ];

  const currentRoom = {
    name: 'Urban Nest Downtown - Room A-201',
    location: 'Downtown District',
    amenities: ['WiFi', 'Parking', 'Common Area', 'Security'],
    housemates: 3,
    moveInDate: '2023-12-01',
    leaseEnd: '2024-11-30'
  };

  const upcomingEvents = [
    { title: 'Community Game Night', date: 'Jan 15, 7:00 PM', location: 'Common Area' },
    { title: 'Professional Networking', date: 'Jan 18, 6:30 PM', location: 'Conference Room' },
    { title: 'Fitness Class', date: 'Jan 20, 9:00 AM', location: 'Gym' },
  ];

  return (
    <UserLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {user?.name}! 👋
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
            <Card className="border-0 shadow-soft mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Home className="h-5 w-5 mr-2 text-secondary" />
                  Your Current Room
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{currentRoom.name}</h3>
                  <div className="flex items-center text-muted-foreground mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">{currentRoom.location}</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {currentRoom.amenities.map((amenity, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {amenity}
                    </Badge>
                  ))}
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">{currentRoom.housemates} Housemates</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">Lease until {currentRoom.leaseEnd}</span>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button variant="outline" size="sm">View Details</Button>
                  <Button variant="outline" size="sm">Request Maintenance</Button>
                </div>
              </CardContent>
            </Card>

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
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className={`h-4 w-4 mr-3 ${
                          activity.status === 'completed' ? 'text-green-500' : 'text-orange-500'
                        }`} />
                        <div>
                          <p className="text-sm font-medium">{activity.activity}</p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                      <Badge variant={activity.status === 'completed' ? 'default' : 'secondary'}>
                        {activity.status}
                      </Badge>
                    </div>
                  ))}
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
                  {upcomingEvents.map((event, index) => (
                    <div key={index} className="p-3 bg-gradient-card rounded-lg">
                      <h4 className="font-medium text-sm">{event.title}</h4>
                      <p className="text-xs text-muted-foreground">{event.date}</p>
                      <p className="text-xs text-muted-foreground">{event.location}</p>
                    </div>
                  ))}
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
                  Pay Rent
                </Button>
                <Button className="w-full" variant="outline">
                  <Bell className="h-4 w-4 mr-2" />
                  Submit Ticket
                </Button>
                <Button className="w-full" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Common Area
                </Button>
                <Button className="w-full" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Message Housemates
                </Button>
              </CardContent>
            </Card>

            {/* Announcements */}
            <Card className="border-0 shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-secondary" />
                  Announcements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium">WiFi Upgrade Complete</p>
                    <p className="text-xs text-muted-foreground">High-speed internet is now available!</p>
                  </div>
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium">New Community Space</p>
                    <p className="text-xs text-muted-foreground">Check out our renovated lounge area.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default Dashboard;
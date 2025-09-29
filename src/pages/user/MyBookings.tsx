import { useEffect,useState } from 'react';
import axios from 'axios';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import UserLayout from '@/components/UserLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Clock, CreditCard } from 'lucide-react';

const MyBookings = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"; 
  const { user } = useAuth();  
  const token = user?.token;  
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

    useEffect(()=>{
        fetchBookings();
    }, [])

    const fetchBookings = async () => {
            try{
                const response = await axios.get(`${API_BASE_URL}/api/book-room/getUserBookings`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                })
                setBookings(response.data.bookings || []);
            }
            catch(error){
                console.error("Error fetching properties:", error);
                toast({
                    title: "Error",
                    description: "Failed to fetch properties",
                    variant: "destructive",
                });
            }
            finally {
                setLoading(false);
            }
    }

    const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    try {
      const response = await axios.put(`${API_BASE_URL}/api/book-room/bookings/${bookingId}/cancel`,{},
        {headers: { Authorization: `Bearer ${token}`,}});

      toast({title: "Success",description: "Booking cancelled successfully",});

      // refresh bookings after cancel
      fetchBookings();

    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast({
        title: "Error",description: error.response?.data?.message || "Failed to cancel booking",
        variant: "destructive",
      });
    }
  };

  return (
    <UserLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Bookings</h1>
        
        {bookings.length===0?(
            <p>No Bookings Found.</p>
        ):(
        <div className="space-y-6">
          {bookings.map((booking) => (
            <Card key={booking.id} className="border-0 shadow-soft">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{booking.room?.property?.name} - Room {booking.room?.roomNumber}</h3>
                    <div className="flex items-center text-muted-foreground mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{booking.room?.property?.address}</span>
                    </div>
                  </div>
                  <Badge variant={booking.displayStatus === 'active' ? 'default' : booking.displayStatus === 'upcoming'
      ? 'secondary'
      : 'outline'}>
                    {booking.displayStatus}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Start Date</p>
                      <p className="text-sm text-muted-foreground">{booking.checkInDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">End Date</p>
                      <p className="text-sm text-muted-foreground">{booking.checkOutDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Room Type</p>
                      <p className="text-sm text-muted-foreground">{booking.room?.roomType}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Monthly Rent</p>
                      <p className="text-sm text-muted-foreground">₹{booking.room?.monthlyRent}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button variant="outline">View Details</Button>
                  <Button variant="outline">Contact Support</Button>
                  {booking.displayStatus === 'upcoming' && (
                    <Button variant="destructive" onClick={() => handleCancelBooking(booking.id)}>Cancel Booking</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
       )}
      </div>
    </UserLayout>
  );
};

export default MyBookings;

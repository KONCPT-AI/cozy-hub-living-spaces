import UserLayout from '@/components/UserLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Clock,FileText } from 'lucide-react';
import { useEffect,useState } from 'react';
import axios from 'axios';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const Events = () => {
 const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"; 
  const { user } = useAuth();  
  const token = user?.token;  
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

    useEffect(()=>{
        fetchEvents();
        fetchAnnouncements();
    }, [])

    const fetchEvents = async () => {
            try{
                const response = await axios.get(`${API_BASE_URL}/api/events/allevents`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                })
                setEvents(response.data.events || response.data|| []);
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

    const handleJoinEvent=async(eventId)=>{
        try{
          const response=await axios.post(`${API_BASE_URL}/api/events/${eventId}/join`,{userId:user?.id},{
            headers: {
              Authorization: `Bearer ${token}`,
            }
          })
          toast({title:"Success", description:"You Have Joined the event!"})
          fetchEvents();
        }catch(error){
          console.log(error);
          toast({title:"Error", description:"Failed to join the event", variant:"destructive"})
          
        }
    }

    //Announcements
    const fetchAnnouncements = async () => {
         try{
                const response = await axios.get(`${API_BASE_URL}/api/announcement/user-announcements`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                })
                setAnnouncements(response.data.announcements || response.data || []);
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
    
  return (
    <UserLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Community Events</h1>
        
        <div className="space-y-6">
          {events.map((event) => (
            <Card key={event.id} className="border-0 shadow-soft">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{event.title}</h3>
                    <Badge className="mt-2">{event.category}</Badge>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Users className="h-4 w-4 mr-1" />
                    <span>{event.attendingCount || 0} attending</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{event.eventDate}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{event.eventTime ? event.eventTime.startsWith("00:00")?"00:00":new Date(`1970-01-01T${event.eventTime}`).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit',hour12:true }) : ''
                       }</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{event.location}</span>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button onClick={()=>handleJoinEvent(event.id)}>Join Event</Button>
                  <Button variant="outline">View Details</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        </div>
        {/* Announcements */}

       <div className="p-6 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Community Announcements</h2>
        
        <div className="space-y-6">
          {announcements.map((announcement) => (
            <Card key={announcement.id} className="border-0 shadow-soft">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{announcement.title}</h3>
                    <Badge className="mt-2">{announcement.priority}</Badge>
                  </div>
                  
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{announcement.created}</span>
                  </div>
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{announcement.content}</span>
                  </div>
                  
                </div>
                
                
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </UserLayout>
  );
};

export default Events;
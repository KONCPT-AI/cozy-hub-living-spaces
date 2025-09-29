import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Plus, Edit, Trash2, Bell, Users, MapPinX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/AdminLayout';
import axios from "axios";
import { Switch } from "@/components/ui/switch";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
import { useAuth } from "@/contexts/AuthContext";

interface Property {
  id: string;
  name: string;
}

interface Event {
  id: string;
  title: string;
  description?: string;
  eventDate: string;
  eventTime: string,
  location: string;
  maxParticipants: number;
  is_active: boolean;
  createdAt?: string;
  participants?: { name: string; status: string }[];
  property?: { id: string; name: string } | string;
}
interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: string;
  audience: string;
  is_active: boolean;
  created?: string;
  property?: { id: string; name: string } | string;
}

const EventManagement = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [usertypes, setUsertypes] = useState<string[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedEventProperties, setSelectedEventProperties] = useState<string>("");
  const [selectedAnnouncementProperties, setSelectedAnnouncementProperties] = useState<string>("");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isAnnouncementDialogOpen, setIsAnnouncementDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [eventFormData, setEventFormData] = useState({
    title: '',
    description: '',
    eventDate: '',
    eventTime: '',
    location: '',
    maxParticipants: ''
  });
  const [eventErrors, setEventErrors] = useState<any>({});
  const [announcementErrors, setAnnouncementErrors] = useState<any>({});
  const [announcementFormData, setAnnouncementFormData] = useState({
    title: '',
    content: '',
    priority: 'normal',
    audience: 'all'
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const token = user?.token;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [eventsRes, propertiesRes, announcementRes, usersRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/events/admin/getAllEvents`,
          { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/api/property/getAll`,
          { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/api/announcement/getAll`,
          { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_BASE_URL}/api/announcement/getAllUserTypes`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
      ]);
      setEvents(eventsRes.data || []);
      setProperties(propertiesRes.data || []);
      setUsertypes(usersRes.data)
      setAnnouncements(announcementRes.data.announcements || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch data',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };
  const validateEventField = (field: string, value: string) => {
    let message = "";

    if (field === "property") {
      if (!value) message = "Property selection is required";
    }

    if (field === "title") {
      if (!value.trim()) message = "Title is required";
      else if (value.trim().length < 3 || value.trim().length > 100)
        message = "Title must be 3 to 100 characters";
    }

    if (field === "eventDate") {
      if (!value) message = "Event date is required";
      else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedDate = new Date(value);
        selectedDate.setHours(0, 0, 0, 0);
        if (!selectedEvent && selectedDate < today) {
          message = "Event date cannot be in the past";
        }
      }
    }

    // if (field === "eventTime") {
    //   if (!value) message = "Event time is required";
    //   else
    //     if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(value)) // HH:mm format
    //       message = "Time must be in HH:mm format";
    // }

    if (field === "location") {
      if (!value.trim()) message = "location is required";
    }

    if (field === "maxParticipants") {
      if (!value) message = "Max participants is required";
      else if (parseInt(value) <= 0) message = "Must be greater than 0";
    }

    if (field === "description") {
      if (value && (value.trim().length < 10 || value.trim().length > 500))
        message = "Description must be 10 to 500 characters long";
    }

    return message;
  };
  const handleEventInputChange = (field: string, value: string) => {
    setEventFormData((prev) => ({ ...prev, [field]: value }));

    const message = validateEventField(field, value);
    setEventErrors((prev) => ({ ...prev, [field]: message }));
  };

  const validateEventForm = () => {
    const newErrors: any = {};
    Object.keys(eventFormData).forEach((field) => {
      const message = validateEventField(field, (eventFormData as any)[field]);
      if (message) newErrors[field] = message;
    });

    //validate property
    const propertyError = validateEventField("property", selectedEventProperties);
    if (propertyError) newErrors.property = propertyError;

    setEventErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEventSubmit = async (e: any) => {
    e.preventDefault();
    if (!validateEventForm()) return;

    try {
      const eventData = {
        ...eventFormData,
        maxParticipants: eventFormData.maxParticipants ? parseInt(eventFormData.maxParticipants) : null,
        eventDate: eventFormData.eventDate,
        eventTime: eventFormData.eventTime 
              ? eventFormData.eventTime.length === 5 
                ? `${eventFormData.eventTime}:00` // convert "HH:mm" to "HH:mm:ss"
                : eventFormData.eventTime // already "HH:mm:ss"
              : null,
        description: eventFormData.description.trim()
      };
      //define properties for creating events
      const propertyIds = selectedEventProperties === "all" ? properties.map((p) => p.id) : [selectedEventProperties];

      //create events for all selected properties
      const promises = propertyIds.map((id) => {

        if (selectedEvent) {
          return axios.put(`${API_BASE_URL}/api/events/edit/${selectedEvent.id}`, { ...eventData, propertyId: id }, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } else {
          return axios.post(`${API_BASE_URL}/api/events/add`, { ...eventData, propertyId: id }, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      })
      await Promise.all(promises);
      toast({
        title: "Success", description: selectedEvent
          ? "Event updated successfully" : selectedEventProperties === "all"
            ? "Event created for all properties" : "Event created successfully",
      });

      setIsEventDialogOpen(false);
      setSelectedEvent(null);
      setSelectedEventProperties("");
      resetEventForm();
      fetchData();
      setEventErrors({});
    } catch (error) {
      console.error('Error saving event:', error);
      const errorMessage = error.response?.data?.message || "Failed to save event";
      toast({ title: 'Error', description: errorMessage, variant: 'destructive', });
    }
  }

  const editEvent = (event: Event) => {

    setSelectedEvent(event);
    if (typeof event.property === "string") {
      setSelectedEventProperties(event.property === "all" ? "all" : event.property);
    } else if (event.property?.id) {
      setSelectedEventProperties(event.property.id.toString());
    } else {
      setSelectedEventProperties("");
    }
    // Normalize date and time
    let timeValue = "";
    if (event.eventTime) {
      const t = event.eventTime.split(":"); // ["HH","mm","ss"]
      timeValue = `${t[0].padStart(2, "0")}:${t[1].padStart(2, "0")}`;
    }

    setEventFormData({
      title: event.title || '',
      description: event.description || '',
      eventDate: new Date(event.eventDate).toISOString().split('T')[0],
      eventTime: timeValue,
      location: event.location || '',
      maxParticipants: event.maxParticipants?.toString() || ''
    });
    setIsEventDialogOpen(true);
  };

  const deleteEvent = async (eventId) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/events/delete/${eventId}`, { headers: { Authorization: `Bearer ${token}` } });
      toast({ title: 'Success', description: 'Event deleted successfully' });
      fetchData();
    } catch (error) {
      console.error('Error deleting event:', error);
      const errorMessage = error.response?.data?.message || "Failed to delete event";
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    }
  };

  //announcement handlers
  const validateAnnouncementField = (field: string, value: string) => {
    let message = "";

    if (field === "property") {
      if (!value) message = "Property selection is required";
    }

    if (field === "title") {
      if (!value.trim()) message = "Title is required";
      else if (value.trim().length < 3 || value.trim().length > 100)
        message = "Title must be 3 to 100 characters";
    }

    if (field === "content") {
      if (value && (value.trim().length < 10 || value.trim().length > 500))
        message = "Content must be 10 to 500 characters long";
    }

    return message;
  };
  const handleAnnouncementInputChange = (field: string, value: string) => {
    setAnnouncementFormData((prev) => ({ ...prev, [field]: value }));

    const message = validateAnnouncementField(field, value);
    setAnnouncementErrors((prev) => ({ ...prev, [field]: message }));
  };

  const validateAnnouncementForm = () => {
    const newErrors: any = {};
    Object.keys(announcementFormData).forEach((field) => {
      const message = validateAnnouncementField(field, (announcementFormData as any)[field]);
      if (message) newErrors[field] = message;
    });

    //validate property
    const propertyError = validateAnnouncementField("property", selectedAnnouncementProperties);
    if (propertyError) newErrors.property = propertyError;

    setAnnouncementErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault();
    if (!validateAnnouncementForm()) return;

    try {
      const eventData = {
        ...announcementFormData,
      };
      //define properties for creating events
      const propertyIds = selectedAnnouncementProperties === "all" ? properties.map((p) => p.id) : [selectedAnnouncementProperties];

      //create events for all selected properties
      const promises = propertyIds.map((id) => {

        if (selectedAnnouncement) {
          return axios.put(`${API_BASE_URL}/api/announcement/edit/${selectedAnnouncement.id}`, { ...eventData, propertyId: id }, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } else {
          return axios.post(`${API_BASE_URL}/api/announcement/add`, { ...eventData, propertyId: id }, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      })
      await Promise.all(promises);
      toast({
        title: "Success", description: selectedAnnouncement
          ? "Announcement updated successfully" : selectedAnnouncementProperties === "all"
            ? "Announcement created for all properties" : "Announcement created successfully",
      });

      setIsAnnouncementDialogOpen(false);
      setSelectedAnnouncement(null);
      setSelectedAnnouncementProperties("");
      resetAnnouncementForm();
      fetchData();
      setAnnouncementErrors({});
    } catch (error) {
      console.error('Error saving announcement:', error);
      const errorMessage = error.response?.data?.message || "Failed to save announcement";
      toast({ title: 'Error', description: errorMessage, variant: 'destructive', });
    }
  };

  const deleteAnnouncement = async (announcementId) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/announcement/delete/${announcementId}`, { headers: { Authorization: `Bearer ${token}` } });
      toast({ title: 'Success', description: 'Announcement deleted successfully' });
      fetchData();
    } catch (error) {
      console.error('Error deleting announcement:', error);
      const errorMessage = error.response?.data?.message || "Failed to delete announcement";
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
    }
  };

  const resetEventForm = () => {
    setEventFormData({
      title: '',
      description: '',
      eventDate: '',
      eventTime: '',
      location: '',
      maxParticipants: ''
    });

  };

  const resetAnnouncementForm = () => {
    setAnnouncementFormData({
      title: '',
      content: '',
      priority: 'normal',
      audience: 'all'
    });
  };


  const handleToggleStatus = async (id: string, type: "event" | "announcement") => {
    try {
      let updatedItem;

      if (type === "event") {
        const res = await axios.patch(`${API_BASE_URL}/api/events/${id}/toggle-status`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        updatedItem = res.data.event || res.data;
        setEvents((prev) =>
          prev.map((e) => e.id === updatedItem.id ? { ...e, is_active: updatedItem.is_active } : e)
        );
      }

      if (type === "announcement") {
        const res = await axios.patch(`${API_BASE_URL}/api/announcement/${id}/toggle-status`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        updatedItem = res.data.announcement || res.data;
        setAnnouncements((prev) =>
          prev.map((a) => a.id === updatedItem.id ? { ...a, is_active: updatedItem.is_active } : a)
        );
      }

      toast({ title: "Success", description: `${type === "event" ? "Event" : "Announcement"} status updated` });
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    }
  };

  const editAnnouncement = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    if (typeof announcement.property === "string") {
      setSelectedAnnouncementProperties(announcement.property === "all" ? "all" : announcement.property);
    } else if (announcement.property?.id) {
      setSelectedAnnouncementProperties(announcement.property.id.toString());
    } else {
      setSelectedAnnouncementProperties("");
    }
    setAnnouncementFormData({
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority || 'normal',
      audience: announcement.audience || 'all'
    });
    setIsAnnouncementDialogOpen(true);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="h-8 w-8" />
            Events & Announcements
          </h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm font-medium text-muted-foreground">Total Events</div>
              <div className="text-2xl font-bold">{events.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm font-medium text-muted-foreground">Active Events</div>
              <div className="text-2xl font-bold">{events.filter(e => e.is_active).length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm font-medium text-muted-foreground">Announcements</div>
              <div className="text-2xl font-bold">{announcements.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm font-medium text-muted-foreground">Active Announcements</div>
              <div className="text-2xl font-bold">{announcements.filter(a => a.is_active).length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Events Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Events</CardTitle>
              <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { resetEventForm(); setSelectedEvent(null); setSelectedEventProperties(""); setEventErrors({}); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{selectedEvent ? 'Edit Event' : 'Add New Event'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleEventSubmit} className="space-y-4 overflow-y-auto max-h-[90vh] scrollbar-hide">
                    <div>
                      <Label htmlFor="property">Property</Label>
                      <Select
                        value={selectedEventProperties} // stores selected property id
                        onValueChange={(val) => setSelectedEventProperties(val.toString())} // update selected property
                        disabled={!!selectedEvent}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a property" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Properties</SelectItem>
                          {properties.map((prop) => (
                            <SelectItem key={prop.id} value={prop.id.toString()}>
                              {prop.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {eventErrors.property && <p className="text-red-500 text-sm">{eventErrors.property}</p>}
                    </div>

                    <div>
                      <Label htmlFor="eventTitle">Title</Label>
                      <Input
                        id="eventTitle"
                        value={eventFormData.title}
                        onChange={(e) => handleEventInputChange("title", e.target.value)}
                      />
                      {eventErrors.title && <p className="text-red-500 text-sm">{eventErrors.title}</p>}
                    </div>

                    <div>
                      <Label htmlFor="eventDate">Event Date</Label>
                      <Input
                        id="eventDate"
                        type="date"
                        value={eventFormData.eventDate}
                        onChange={(e) => handleEventInputChange("eventDate", e.target.value)}
                      />
                      {eventErrors.eventDate && <p className="text-red-500 text-sm">{eventErrors.eventDate}</p>}
                    </div>
                    <div>
                      <Label htmlFor="eventTime">Event Time</Label>
                      <Input
                        id="eventTime"
                        type="time"
                        value={eventFormData.eventTime}
                        onChange={(e) => handleEventInputChange("eventTime", e.target.value)}
                      />
                      {eventErrors.eventTime && <p className="text-red-500 text-sm">{eventErrors.eventTime}</p>}
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={eventFormData.location}
                        onChange={(e) => handleEventInputChange("location", e.target.value)}
                      />
                      {eventErrors.location && <p className="text-red-500 text-sm">{eventErrors.location}</p>}
                    </div>
                    <div>
                      <Label htmlFor="maxparticipants">Max Participants</Label>
                      <Input
                        id="maxparticipants"
                        type="number"
                        value={eventFormData.maxParticipants}
                        onChange={(e) => handleEventInputChange("maxParticipants", e.target.value)}
                      />
                      {eventErrors.maxParticipants && <p className="text-red-500 text-sm">{eventErrors.maxParticipants}</p>}
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={eventFormData.description}
                        onChange={(e) => handleEventInputChange("description", e.target.value)}
                      />
                      {eventErrors.description && <p className="text-red-500 text-sm">{eventErrors.description}</p>}
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsEventDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        {selectedEvent ? 'Update Event' : 'Create Event'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell>{typeof event.property === "string" ? event.property : event.property?.name}</TableCell>
                    <TableCell>{new Date(event.eventDate).toLocaleDateString('en-IN')}</TableCell>
                    <TableCell>
                      {event.eventTime ? event.eventTime === "00:00:00" ? "00:00" : new Date(`1970-01-01T${event.eventTime}`).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true }) : 'TBD'
                      }
                    </TableCell>
                    <TableCell>{event.location || 'TBD'}</TableCell>
                    <TableCell>
                      {event.maxParticipants}
                    </TableCell>
                    <TableCell className="p-1">
                      <Switch
                        checked={event.is_active}
                        onClick={() => handleToggleStatus(event.id, "event")}
                      >
                      </Switch>
                    </TableCell>
                    <TableCell className="space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => editEvent(event)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteEvent(event.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Announcements Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Announcements</CardTitle>
              <Dialog open={isAnnouncementDialogOpen} onOpenChange={setIsAnnouncementDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { resetAnnouncementForm(); setSelectedAnnouncement(null); setSelectedAnnouncementProperties(""); setAnnouncementErrors({}); }}>
                    <Bell className="h-4 w-4 mr-2" />
                    Add Announcement
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{selectedAnnouncement ? 'Edit Announcement' : 'Add New Announcement'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAnnouncementSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="property">Property</Label>
                      <Select
                        value={selectedAnnouncementProperties} // stores selected property id
                        onValueChange={(val) => setSelectedAnnouncementProperties(val.toString())} // update selected property
                        disabled={!!selectedAnnouncement}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a property" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Properties</SelectItem>
                          {properties.map((prop) => (
                            <SelectItem key={prop.id} value={prop.id.toString()}>
                              {prop.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {announcementErrors.property && <p className="text-red-500 text-sm">{announcementErrors.property}</p>}
                    </div>
                    <div>
                      <Label htmlFor="announcement_title">Title</Label>
                      <Input
                        id="announcement_title"
                        value={announcementFormData.title}
                        onChange={(e) => handleAnnouncementInputChange("title", e.target.value)}
                      />
                      {announcementErrors.title && <p className="text-red-500 text-sm">{announcementErrors.title}</p>}
                    </div>
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={announcementFormData.priority} onValueChange={(value) => setAnnouncementFormData({ ...announcementFormData, priority: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="target_audience">Target Audience</Label>
                      <Select value={announcementFormData.audience} onValueChange={(value) => setAnnouncementFormData({ ...announcementFormData, audience: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Audience" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Users</SelectItem>
                          {usertypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {announcementErrors.audience && <p className="text-red-500 text-sm">{announcementErrors.audience}</p>}
                    </div>
                    <div>
                      <Label htmlFor="announcement_content">Content</Label>
                      <Textarea
                        id="announcement_content"
                        value={announcementFormData.content}
                        onChange={(e) => handleAnnouncementInputChange("content", e.target.value)}
                      />
                      {announcementErrors.content && <p className="text-red-500 text-sm">{announcementErrors.content}</p>}
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsAnnouncementDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        {selectedAnnouncement ? 'Update Announcement' : 'Create Announcement'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Audience</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {announcements.map((announcement) => (
                  <TableRow key={announcement.id}>
                    <TableCell className="font-medium">{announcement.title}</TableCell>
                    <TableCell>{typeof announcement.property === "string" ? announcement.property : announcement.property?.name}</TableCell>
                    <TableCell>
                      <Badge variant={announcement.priority === 'urgent' ? 'destructive' : 'secondary'}>
                        {announcement.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize">{announcement.audience}</TableCell>
                    <TableCell>{new Date(announcement.created).toLocaleDateString("en-IN")}</TableCell>
                    <TableCell className="p-1">
                      <Switch
                        checked={announcement.is_active}
                        onClick={() => handleToggleStatus(announcement.id, "announcement")}
                      >
                      </Switch>
                    </TableCell>
                    <TableCell className="space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => editAnnouncement(announcement)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteAnnouncement(announcement.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default EventManagement;





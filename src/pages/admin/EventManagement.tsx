// import { useState, useEffect } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Input } from '@/components/ui/input';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
// import { Calendar, Plus, Edit, Trash2, Bell, Users } from 'lucide-react';
// import { supabase } from '@/integrations/supabase/client';
// import { useToast } from '@/hooks/use-toast';
// import AdminLayout from '@/components/AdminLayout';

// const EventManagement = () => {
//   const [events, setEvents] = useState([]);
//   const [announcements, setAnnouncements] = useState([]);
//   const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
//   const [isAnnouncementDialogOpen, setIsAnnouncementDialogOpen] = useState(false);
//   const [selectedEvent, setSelectedEvent] = useState(null);
//   const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
//   const [eventFormData, setEventFormData] = useState({
//     title: '',
//     description: '',
//     event_date: '',
//     location: '',
//     max_participants: ''
//   });
//   const [announcementFormData, setAnnouncementFormData] = useState({
//     title: '',
//     content: '',
//     priority: 'normal',
//     target_audience: 'all'
//   });
//   const [loading, setLoading] = useState(true);
//   const { toast } = useToast();

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const fetchData = async () => {
//     try {
//       const [eventsRes, announcementsRes] = await Promise.all([
//         supabase.from('events').select('*').order('event_date', { ascending: true }),
//         supabase.from('announcements').select('*').order('created_at', { ascending: false })
//       ]);

//       if (eventsRes.error) throw eventsRes.error;
//       if (announcementsRes.error) throw announcementsRes.error;

//       setEvents(eventsRes.data || []);
//       setAnnouncements(announcementsRes.data || []);
//       setLoading(false);
//     } catch (error) {
//       console.error('Error fetching data:', error);
//       toast({
//         title: 'Error',
//         description: 'Failed to fetch data',
//         variant: 'destructive',
//       });
//       setLoading(false);
//     }
//   };

//   const handleEventSubmit = async (e) => {
//     e.preventDefault();
    
//     try {
//       const eventData = {
//         ...eventFormData,
//         max_participants: eventFormData.max_participants ? parseInt(eventFormData.max_participants) : null,
//         event_date: new Date(eventFormData.event_date).toISOString()
//       };

//       if (selectedEvent) {
//         const { error } = await supabase
//           .from('events')
//           .update(eventData)
//           .eq('id', selectedEvent.id);
//         if (error) throw error;
//         toast({ title: 'Success', description: 'Event updated successfully' });
//       } else {
//         const { error } = await supabase
//           .from('events')
//           .insert(eventData);
//         if (error) throw error;
//         toast({ title: 'Success', description: 'Event created successfully' });
//       }
      
//       setIsEventDialogOpen(false);
//       setSelectedEvent(null);
//       resetEventForm();
//       fetchData();
//     } catch (error) {
//       console.error('Error saving event:', error);
//       toast({
//         title: 'Error',
//         description: 'Failed to save event',
//         variant: 'destructive',
//       });
//     }
//   };

//   const handleAnnouncementSubmit = async (e) => {
//     e.preventDefault();
    
//     try {
//       if (selectedAnnouncement) {
//         const { error } = await supabase
//           .from('announcements')
//           .update(announcementFormData)
//           .eq('id', selectedAnnouncement.id);
//         if (error) throw error;
//         toast({ title: 'Success', description: 'Announcement updated successfully' });
//       } else {
//         const { error } = await supabase
//           .from('announcements')
//           .insert(announcementFormData);
//         if (error) throw error;
//         toast({ title: 'Success', description: 'Announcement created successfully' });
//       }
      
//       setIsAnnouncementDialogOpen(false);
//       setSelectedAnnouncement(null);
//       resetAnnouncementForm();
//       fetchData();
//     } catch (error) {
//       console.error('Error saving announcement:', error);
//       toast({
//         title: 'Error',
//         description: 'Failed to save announcement',
//         variant: 'destructive',
//       });
//     }
//   };

//   const deleteEvent = async (eventId) => {
//     if (!confirm('Are you sure you want to delete this event?')) return;
    
//     try {
//       const { error } = await supabase
//         .from('events')
//         .delete()
//         .eq('id', eventId);
      
//       if (error) throw error;
//       toast({ title: 'Success', description: 'Event deleted successfully' });
//       fetchData();
//     } catch (error) {
//       console.error('Error deleting event:', error);
//       toast({
//         title: 'Error',
//         description: 'Failed to delete event',
//         variant: 'destructive',
//       });
//     }
//   };

//   const deleteAnnouncement = async (announcementId) => {
//     if (!confirm('Are you sure you want to delete this announcement?')) return;
    
//     try {
//       const { error } = await supabase
//         .from('announcements')
//         .delete()
//         .eq('id', announcementId);
      
//       if (error) throw error;
//       toast({ title: 'Success', description: 'Announcement deleted successfully' });
//       fetchData();
//     } catch (error) {
//       console.error('Error deleting announcement:', error);
//       toast({
//         title: 'Error',
//         description: 'Failed to delete announcement',
//         variant: 'destructive',
//       });
//     }
//   };

//   const resetEventForm = () => {
//     setEventFormData({
//       title: '',
//       description: '',
//       event_date: '',
//       location: '',
//       max_participants: ''
//     });
//   };

//   const resetAnnouncementForm = () => {
//     setAnnouncementFormData({
//       title: '',
//       content: '',
//       priority: 'normal',
//       target_audience: 'all'
//     });
//   };

//   const editEvent = (event) => {
//     setSelectedEvent(event);
//     setEventFormData({
//       title: event.title,
//       description: event.description || '',
//       event_date: new Date(event.event_date).toISOString().split('T')[0],
//       location: event.location || '',
//       max_participants: event.max_participants?.toString() || ''
//     });
//     setIsEventDialogOpen(true);
//   };

//   const editAnnouncement = (announcement) => {
//     setSelectedAnnouncement(announcement);
//     setAnnouncementFormData({
//       title: announcement.title,
//       content: announcement.content,
//       priority: announcement.priority || 'normal',
//       target_audience: announcement.target_audience || 'all'
//     });
//     setIsAnnouncementDialogOpen(true);
//   };

//   if (loading) {
//     return (
//       <AdminLayout>
//         <div className="p-6">Loading...</div>
//       </AdminLayout>
//     );
//   }

//   return (
//     <AdminLayout>
//       <div className="p-6 space-y-6">
//         <div className="flex items-center justify-between">
//           <h1 className="text-3xl font-bold flex items-center gap-2">
//             <Calendar className="h-8 w-8" />
//             Events & Announcements
//           </h1>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//           <Card>
//             <CardContent className="p-4">
//               <div className="text-sm font-medium text-muted-foreground">Total Events</div>
//               <div className="text-2xl font-bold">{events.length}</div>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardContent className="p-4">
//               <div className="text-sm font-medium text-muted-foreground">Active Events</div>
//               <div className="text-2xl font-bold">{events.filter(e => e.is_active).length}</div>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardContent className="p-4">
//               <div className="text-sm font-medium text-muted-foreground">Announcements</div>
//               <div className="text-2xl font-bold">{announcements.length}</div>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardContent className="p-4">
//               <div className="text-sm font-medium text-muted-foreground">Active Announcements</div>
//               <div className="text-2xl font-bold">{announcements.filter(a => a.is_active).length}</div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Events Section */}
//         <Card>
//           <CardHeader>
//             <div className="flex items-center justify-between">
//               <CardTitle>Events</CardTitle>
//               <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
//                 <DialogTrigger asChild>
//                   <Button onClick={() => { resetEventForm(); setSelectedEvent(null); }}>
//                     <Plus className="h-4 w-4 mr-2" />
//                     Add Event
//                   </Button>
//                 </DialogTrigger>
//                 <DialogContent className="max-w-2xl">
//                   <DialogHeader>
//                     <DialogTitle>{selectedEvent ? 'Edit Event' : 'Add New Event'}</DialogTitle>
//                   </DialogHeader>
//                   <form onSubmit={handleEventSubmit} className="space-y-4">
//                     <div>
//                       <Label htmlFor="event_title">Title</Label>
//                       <Input
//                         id="event_title"
//                         value={eventFormData.title}
//                         onChange={(e) => setEventFormData({...eventFormData, title: e.target.value})}
//                         required
//                       />
//                     </div>
//                     <div>
//                       <Label htmlFor="event_date">Event Date</Label>
//                       <Input
//                         id="event_date"
//                         type="date"
//                         value={eventFormData.event_date}
//                         onChange={(e) => setEventFormData({...eventFormData, event_date: e.target.value})}
//                         required
//                       />
//                     </div>
//                     <div>
//                       <Label htmlFor="location">Location</Label>
//                       <Input
//                         id="location"
//                         value={eventFormData.location}
//                         onChange={(e) => setEventFormData({...eventFormData, location: e.target.value})}
//                       />
//                     </div>
//                     <div>
//                       <Label htmlFor="max_participants">Max Participants</Label>
//                       <Input
//                         id="max_participants"
//                         type="number"
//                         value={eventFormData.max_participants}
//                         onChange={(e) => setEventFormData({...eventFormData, max_participants: e.target.value})}
//                       />
//                     </div>
//                     <div>
//                       <Label htmlFor="event_description">Description</Label>
//                       <Textarea
//                         id="event_description"
//                         value={eventFormData.description}
//                         onChange={(e) => setEventFormData({...eventFormData, description: e.target.value})}
//                       />
//                     </div>
//                     <div className="flex justify-end space-x-2">
//                       <Button type="button" variant="outline" onClick={() => setIsEventDialogOpen(false)}>
//                         Cancel
//                       </Button>
//                       <Button type="submit">
//                         {selectedEvent ? 'Update Event' : 'Create Event'}
//                       </Button>
//                     </div>
//                   </form>
//                 </DialogContent>
//               </Dialog>
//             </div>
//           </CardHeader>
//           <CardContent>
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Title</TableHead>
//                   <TableHead>Date</TableHead>
//                   <TableHead>Location</TableHead>
//                   <TableHead>Participants</TableHead>
//                   <TableHead>Status</TableHead>
//                   <TableHead>Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {events.map((event) => (
//                   <TableRow key={event.id}>
//                     <TableCell className="font-medium">{event.title}</TableCell>
//                     <TableCell>{new Date(event.event_date).toLocaleDateString()}</TableCell>
//                     <TableCell>{event.location || 'TBD'}</TableCell>
//                     <TableCell>
//                       {event.current_participants || 0}
//                       {event.max_participants && `/${event.max_participants}`}
//                     </TableCell>
//                     <TableCell>
//                       <Badge variant={event.is_active ? 'default' : 'secondary'}>
//                         {event.is_active ? 'Active' : 'Inactive'}
//                       </Badge>
//                     </TableCell>
//                     <TableCell className="space-x-2">
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() => editEvent(event)}
//                       >
//                         <Edit className="h-4 w-4" />
//                       </Button>
//                       <Button
//                         variant="destructive"
//                         size="sm"
//                         onClick={() => deleteEvent(event.id)}
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </Button>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </CardContent>
//         </Card>

//         {/* Announcements Section */}
//         <Card>
//           <CardHeader>
//             <div className="flex items-center justify-between">
//               <CardTitle>Announcements</CardTitle>
//               <Dialog open={isAnnouncementDialogOpen} onOpenChange={setIsAnnouncementDialogOpen}>
//                 <DialogTrigger asChild>
//                   <Button onClick={() => { resetAnnouncementForm(); setSelectedAnnouncement(null); }}>
//                     <Bell className="h-4 w-4 mr-2" />
//                     Add Announcement
//                   </Button>
//                 </DialogTrigger>
//                 <DialogContent className="max-w-2xl">
//                   <DialogHeader>
//                     <DialogTitle>{selectedAnnouncement ? 'Edit Announcement' : 'Add New Announcement'}</DialogTitle>
//                   </DialogHeader>
//                   <form onSubmit={handleAnnouncementSubmit} className="space-y-4">
//                     <div>
//                       <Label htmlFor="announcement_title">Title</Label>
//                       <Input
//                         id="announcement_title"
//                         value={announcementFormData.title}
//                         onChange={(e) => setAnnouncementFormData({...announcementFormData, title: e.target.value})}
//                         required
//                       />
//                     </div>
//                     <div>
//                       <Label htmlFor="priority">Priority</Label>
//                       <Select value={announcementFormData.priority} onValueChange={(value) => setAnnouncementFormData({...announcementFormData, priority: value})}>
//                         <SelectTrigger>
//                           <SelectValue />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="low">Low</SelectItem>
//                           <SelectItem value="normal">Normal</SelectItem>
//                           <SelectItem value="high">High</SelectItem>
//                           <SelectItem value="urgent">Urgent</SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </div>
//                     <div>
//                       <Label htmlFor="target_audience">Target Audience</Label>
//                       <Select value={announcementFormData.target_audience} onValueChange={(value) => setAnnouncementFormData({...announcementFormData, target_audience: value})}>
//                         <SelectTrigger>
//                           <SelectValue />
//                         </SelectTrigger>
//                         <SelectContent>
//                           <SelectItem value="all">All Users</SelectItem>
//                           <SelectItem value="students">Students</SelectItem>
//                           <SelectItem value="professionals">Professionals</SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </div>
//                     <div>
//                       <Label htmlFor="announcement_content">Content</Label>
//                       <Textarea
//                         id="announcement_content"
//                         value={announcementFormData.content}
//                         onChange={(e) => setAnnouncementFormData({...announcementFormData, content: e.target.value})}
//                         required
//                       />
//                     </div>
//                     <div className="flex justify-end space-x-2">
//                       <Button type="button" variant="outline" onClick={() => setIsAnnouncementDialogOpen(false)}>
//                         Cancel
//                       </Button>
//                       <Button type="submit">
//                         {selectedAnnouncement ? 'Update Announcement' : 'Create Announcement'}
//                       </Button>
//                     </div>
//                   </form>
//                 </DialogContent>
//               </Dialog>
//             </div>
//           </CardHeader>
//           <CardContent>
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Title</TableHead>
//                   <TableHead>Priority</TableHead>
//                   <TableHead>Audience</TableHead>
//                   <TableHead>Created</TableHead>
//                   <TableHead>Status</TableHead>
//                   <TableHead>Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {announcements.map((announcement) => (
//                   <TableRow key={announcement.id}>
//                     <TableCell className="font-medium">{announcement.title}</TableCell>
//                     <TableCell>
//                       <Badge variant={announcement.priority === 'urgent' ? 'destructive' : 'secondary'}>
//                         {announcement.priority}
//                       </Badge>
//                     </TableCell>
//                     <TableCell className="capitalize">{announcement.target_audience}</TableCell>
//                     <TableCell>{new Date(announcement.created_at).toLocaleDateString()}</TableCell>
//                     <TableCell>
//                       <Badge variant={announcement.is_active ? 'default' : 'secondary'}>
//                         {announcement.is_active ? 'Active' : 'Inactive'}
//                       </Badge>
//                     </TableCell>
//                     <TableCell className="space-x-2">
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={() => editAnnouncement(announcement)}
//                       >
//                         <Edit className="h-4 w-4" />
//                       </Button>
//                       <Button
//                         variant="destructive"
//                         size="sm"
//                         onClick={() => deleteAnnouncement(announcement.id)}
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </Button>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </CardContent>
//         </Card>
//       </div>
//     </AdminLayout>
//   );
// };

// export default EventManagement;
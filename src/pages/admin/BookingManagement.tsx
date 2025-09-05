// import { useState, useEffect } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
// import { Calendar, Check, X, Eye, Users } from 'lucide-react';
// import { supabase } from '@/integrations/supabase/client';
// import { useToast } from '@/hooks/use-toast';
// import AdminLayout from '@/components/AdminLayout';

// const BookingManagement = () => {
//   const [bookings, setBookings] = useState([]);
//   const [rooms, setRooms] = useState([]);
//   const [profiles, setProfiles] = useState([]);
//   const [selectedBooking, setSelectedBooking] = useState(null);
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const { toast } = useToast();

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const fetchData = async () => {
//     try {
//       const [bookingsRes, roomsRes, profilesRes] = await Promise.all([
//         supabase.from('bookings').select('*').order('created_at', { ascending: false }),
//         supabase.from('rooms').select('*'),
//         supabase.from('profiles').select('*')
//       ]);

//       if (bookingsRes.error) throw bookingsRes.error;
//       if (roomsRes.error) throw roomsRes.error;
//       if (profilesRes.error) throw profilesRes.error;

//       setBookings(bookingsRes.data || []);
//       setRooms(roomsRes.data || []);
//       setProfiles(profilesRes.data || []);
//       setLoading(false);
//     } catch (error) {
//       console.error('Error fetching data:', error);
//       toast({
//         title: 'Error',
//         description: 'Failed to fetch booking data',
//         variant: 'destructive',
//       });
//       setLoading(false);
//     }
//   };

//   const updateBookingStatus = async (bookingId, status, notes = '') => {
//     try {
//       const updateData = {
//         status,
//         notes,
//         ...(status === 'approved' && { approved_at: new Date().toISOString() })
//       };

//       const { error } = await supabase
//         .from('bookings')
//         .update(updateData)
//         .eq('id', bookingId);

//       if (error) throw error;
      
//       toast({ 
//         title: 'Success', 
//         description: `Booking ${status} successfully` 
//       });
//       fetchData();
//       setIsDialogOpen(false);
//     } catch (error) {
//       console.error('Error updating booking:', error);
//       toast({
//         title: 'Error',
//         description: 'Failed to update booking',
//         variant: 'destructive',
//       });
//     }
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'pending': return 'secondary';
//       case 'approved': return 'default';
//       case 'rejected': return 'destructive';
//       case 'active': return 'default';
//       case 'completed': return 'outline';
//       default: return 'secondary';
//     }
//   };

//   const getUserName = (userId) => {
//     const profile = profiles.find(p => p.user_id === userId);
//     return profile?.full_name || profile?.email || 'Unknown User';
//   };

//   const getRoomNumber = (roomId) => {
//     const room = rooms.find(r => r.id === roomId);
//     return room?.room_number || 'Unknown Room';
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
//             Booking Management
//           </h1>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//           <Card>
//             <CardContent className="p-4">
//               <div className="text-sm font-medium text-muted-foreground">Total Bookings</div>
//               <div className="text-2xl font-bold">{bookings.length}</div>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardContent className="p-4">
//               <div className="text-sm font-medium text-muted-foreground">Pending</div>
//               <div className="text-2xl font-bold">{bookings.filter(b => b.status === 'pending').length}</div>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardContent className="p-4">
//               <div className="text-sm font-medium text-muted-foreground">Active</div>
//               <div className="text-2xl font-bold">{bookings.filter(b => b.status === 'active').length}</div>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardContent className="p-4">
//               <div className="text-sm font-medium text-muted-foreground">Completed</div>
//               <div className="text-2xl font-bold">{bookings.filter(b => b.status === 'completed').length}</div>
//             </CardContent>
//           </Card>
//         </div>

//         <Card>
//           <CardHeader>
//             <CardTitle>All Bookings</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>User</TableHead>
//                   <TableHead>Room</TableHead>
//                   <TableHead>Check-in Date</TableHead>
//                   <TableHead>Monthly Rent</TableHead>
//                   <TableHead>Status</TableHead>
//                   <TableHead>Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {bookings.map((booking) => (
//                   <TableRow key={booking.id}>
//                     <TableCell className="font-medium">{getUserName(booking.user_id)}</TableCell>
//                     <TableCell>{getRoomNumber(booking.room_id)}</TableCell>
//                     <TableCell>{new Date(booking.check_in_date).toLocaleDateString()}</TableCell>
//                     <TableCell>₹{booking.monthly_rent.toLocaleString()}</TableCell>
//                     <TableCell>
//                       <Badge variant={getStatusColor(booking.status)}>
//                         {booking.status}
//                       </Badge>
//                     </TableCell>
//                     <TableCell className="space-x-2">
//                       <Dialog open={isDialogOpen && selectedBooking?.id === booking.id} onOpenChange={(open) => {
//                         setIsDialogOpen(open);
//                         if (!open) setSelectedBooking(null);
//                       }}>
//                         <DialogTrigger asChild>
//                           <Button
//                             variant="outline"
//                             size="sm"
//                             onClick={() => setSelectedBooking(booking)}
//                           >
//                             <Eye className="h-4 w-4" />
//                           </Button>
//                         </DialogTrigger>
//                         <DialogContent>
//                           <DialogHeader>
//                             <DialogTitle>Booking Details</DialogTitle>
//                           </DialogHeader>
//                           <div className="space-y-4">
//                             <div>
//                               <Label>User</Label>
//                               <div className="text-sm text-muted-foreground">{getUserName(booking.user_id)}</div>
//                             </div>
//                             <div>
//                               <Label>Room</Label>
//                               <div className="text-sm text-muted-foreground">{getRoomNumber(booking.room_id)}</div>
//                             </div>
//                             <div>
//                               <Label>Check-in Date</Label>
//                               <div className="text-sm text-muted-foreground">{new Date(booking.check_in_date).toLocaleDateString()}</div>
//                             </div>
//                             <div>
//                               <Label>Monthly Rent</Label>
//                               <div className="text-sm text-muted-foreground">₹{booking.monthly_rent.toLocaleString()}</div>
//                             </div>
//                             <div>
//                               <Label>Current Status</Label>
//                               <div className="text-sm text-muted-foreground">{booking.status}</div>
//                             </div>
//                             {booking.notes && (
//                               <div>
//                                 <Label>Notes</Label>
//                                 <div className="text-sm text-muted-foreground">{booking.notes}</div>
//                               </div>
//                             )}
//                             {booking.status === 'pending' && (
//                               <div className="flex space-x-2">
//                                 <Button
//                                   onClick={() => updateBookingStatus(booking.id, 'approved')}
//                                   className="flex-1"
//                                 >
//                                   <Check className="h-4 w-4 mr-2" />
//                                   Approve
//                                 </Button>
//                                 <Button
//                                   variant="destructive"
//                                   onClick={() => updateBookingStatus(booking.id, 'rejected')}
//                                   className="flex-1"
//                                 >
//                                   <X className="h-4 w-4 mr-2" />
//                                   Reject
//                                 </Button>
//                               </div>
//                             )}
//                           </div>
//                         </DialogContent>
//                       </Dialog>
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

// export default BookingManagement;
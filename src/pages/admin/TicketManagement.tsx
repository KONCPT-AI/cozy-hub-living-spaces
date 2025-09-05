// import { useState, useEffect } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
// import { Wrench, User, Clock, CheckCircle } from 'lucide-react';
// import { supabase } from '@/integrations/supabase/client';
// import { useToast } from '@/hooks/use-toast';
// import AdminLayout from '@/components/AdminLayout';

// const TicketManagement = () => {
//   const [tickets, setTickets] = useState([]);
//   const [profiles, setProfiles] = useState([]);
//   const [adminUsers, setAdminUsers] = useState([]);
//   const [selectedTicket, setSelectedTicket] = useState(null);
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [assignTo, setAssignTo] = useState('');
//   const [newStatus, setNewStatus] = useState('');
//   const [resolutionNotes, setResolutionNotes] = useState('');
//   const [loading, setLoading] = useState(true);
//   const { toast } = useToast();

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const fetchData = async () => {
//     try {
//       const [ticketsRes, profilesRes, adminRes] = await Promise.all([
//         supabase.from('maintenance_tickets').select('*').order('created_at', { ascending: false }),
//         supabase.from('profiles').select('*'),
//         supabase.from('admin_users').select('*')
//       ]);

//       if (ticketsRes.error) throw ticketsRes.error;
//       if (profilesRes.error) throw profilesRes.error;
//       if (adminRes.error) throw adminRes.error;

//       setTickets(ticketsRes.data || []);
//       setProfiles(profilesRes.data || []);
//       setAdminUsers(adminRes.data || []);
//       setLoading(false);
//     } catch (error) {
//       console.error('Error fetching data:', error);
//       toast({
//         title: 'Error',
//         description: 'Failed to fetch ticket data',
//         variant: 'destructive',
//       });
//       setLoading(false);
//     }
//   };

//   const updateTicket = async () => {
//     if (!selectedTicket) return;

//     try {
//       const updateData: any = {};
//       if (assignTo && assignTo !== "unassigned") updateData.assigned_to = assignTo;
//       if (assignTo === "unassigned") updateData.assigned_to = null;
//       if (newStatus) updateData.status = newStatus;
//       if (resolutionNotes) updateData.resolution_notes = resolutionNotes;
//       if (newStatus === 'resolved') updateData.resolved_at = new Date().toISOString();

//       const { error } = await supabase
//         .from('maintenance_tickets')
//         .update(updateData)
//         .eq('id', selectedTicket.id);

//       if (error) throw error;
      
//       toast({ 
//         title: 'Success', 
//         description: 'Ticket updated successfully' 
//       });
//       fetchData();
//       setIsDialogOpen(false);
//       setAssignTo('');
//       setNewStatus('');
//       setResolutionNotes('');
//     } catch (error) {
//       console.error('Error updating ticket:', error);
//       toast({
//         title: 'Error',
//         description: 'Failed to update ticket',
//         variant: 'destructive',
//       });
//     }
//   };

//   const getUserName = (userId) => {
//     const profile = profiles.find(p => p.user_id === userId);
//     return profile?.full_name || profile?.email || 'Unknown User';
//   };

//   const getAdminName = (adminId) => {
//     const admin = adminUsers.find(a => a.user_id === adminId);
//     return admin?.full_name || admin?.email || 'Unassigned';
//   };

//   const getPriorityColor = (priority) => {
//     switch (priority) {
//       case 'low': return 'outline';
//       case 'medium': return 'secondary';
//       case 'high': return 'default';
//       case 'urgent': return 'destructive';
//       default: return 'secondary';
//     }
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'open': return 'destructive';
//       case 'in_progress': return 'secondary';
//       case 'resolved': return 'default';
//       case 'closed': return 'outline';
//       default: return 'secondary';
//     }
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
//             <Wrench className="h-8 w-8" />
//             Support Tickets
//           </h1>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//           <Card>
//             <CardContent className="p-4">
//               <div className="text-sm font-medium text-muted-foreground">Total Tickets</div>
//               <div className="text-2xl font-bold">{tickets.length}</div>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardContent className="p-4">
//               <div className="text-sm font-medium text-muted-foreground">Open</div>
//               <div className="text-2xl font-bold">{tickets.filter(t => t.status === 'open').length}</div>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardContent className="p-4">
//               <div className="text-sm font-medium text-muted-foreground">In Progress</div>
//               <div className="text-2xl font-bold">{tickets.filter(t => t.status === 'in_progress').length}</div>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardContent className="p-4">
//               <div className="text-sm font-medium text-muted-foreground">Resolved</div>
//               <div className="text-2xl font-bold">{tickets.filter(t => t.status === 'resolved').length}</div>
//             </CardContent>
//           </Card>
//         </div>

//         <Card>
//           <CardHeader>
//             <CardTitle>Support Tickets</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Title</TableHead>
//                   <TableHead>User</TableHead>
//                   <TableHead>Priority</TableHead>
//                   <TableHead>Status</TableHead>
//                   <TableHead>Assigned To</TableHead>
//                   <TableHead>Created</TableHead>
//                   <TableHead>Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {tickets.map((ticket) => (
//                   <TableRow key={ticket.id}>
//                     <TableCell className="font-medium">{ticket.title}</TableCell>
//                     <TableCell>{getUserName(ticket.user_id)}</TableCell>
//                     <TableCell>
//                       <Badge variant={getPriorityColor(ticket.priority)}>
//                         {ticket.priority}
//                       </Badge>
//                     </TableCell>
//                     <TableCell>
//                       <Badge variant={getStatusColor(ticket.status)}>
//                         {ticket.status?.replace('_', ' ')}
//                       </Badge>
//                     </TableCell>
//                     <TableCell>{ticket.assigned_to ? getAdminName(ticket.assigned_to) : 'Unassigned'}</TableCell>
//                     <TableCell>{new Date(ticket.created_at).toLocaleDateString()}</TableCell>
//                     <TableCell>
//                       <Dialog open={isDialogOpen && selectedTicket?.id === ticket.id} onOpenChange={(open) => {
//                         setIsDialogOpen(open);
//                         if (!open) {
//                           setSelectedTicket(null);
//                           setAssignTo('');
//                           setNewStatus('');
//                           setResolutionNotes('');
//                         }
//                       }}>
//                         <DialogTrigger asChild>
//                           <Button
//                             variant="outline"
//                             size="sm"
//                             onClick={() => {
//                               setSelectedTicket(ticket);
//                               setAssignTo(ticket.assigned_to || '');
//                               setNewStatus(ticket.status);
//                               setResolutionNotes(ticket.resolution_notes || '');
//                             }}
//                           >
//                             Manage
//                           </Button>
//                         </DialogTrigger>
//                         <DialogContent className="max-w-2xl">
//                           <DialogHeader>
//                             <DialogTitle>Manage Ticket: {ticket.title}</DialogTitle>
//                           </DialogHeader>
//                           <div className="space-y-4">
//                             <div className="grid grid-cols-2 gap-4">
//                               <div>
//                                 <Label>User</Label>
//                                 <div className="text-sm text-muted-foreground">{getUserName(ticket.user_id)}</div>
//                               </div>
//                               <div>
//                                 <Label>Priority</Label>
//                                 <div className="text-sm text-muted-foreground capitalize">{ticket.priority}</div>
//                               </div>
//                             </div>
//                             <div>
//                               <Label>Description</Label>
//                               <div className="text-sm text-muted-foreground">{ticket.description}</div>
//                             </div>
//                             <div>
//                               <Label htmlFor="assign_to">Assign To</Label>
//                               <Select value={assignTo} onValueChange={setAssignTo}>
//                                 <SelectTrigger>
//                                   <SelectValue placeholder="Select admin user" />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                   <SelectItem value="unassigned">Unassigned</SelectItem>
//                                   {adminUsers.map((admin) => (
//                                     <SelectItem key={admin.user_id} value={admin.user_id}>
//                                       {admin.full_name || admin.email}
//                                     </SelectItem>
//                                   ))}
//                                 </SelectContent>
//                               </Select>
//                             </div>
//                             <div>
//                               <Label htmlFor="status">Status</Label>
//                               <Select value={newStatus} onValueChange={setNewStatus}>
//                                 <SelectTrigger>
//                                   <SelectValue />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                   <SelectItem value="open">Open</SelectItem>
//                                   <SelectItem value="in_progress">In Progress</SelectItem>
//                                   <SelectItem value="resolved">Resolved</SelectItem>
//                                   <SelectItem value="closed">Closed</SelectItem>
//                                 </SelectContent>
//                               </Select>
//                             </div>
//                             <div>
//                               <Label htmlFor="resolution_notes">Resolution Notes</Label>
//                               <Textarea
//                                 id="resolution_notes"
//                                 value={resolutionNotes}
//                                 onChange={(e) => setResolutionNotes(e.target.value)}
//                                 placeholder="Add resolution notes..."
//                               />
//                             </div>
//                             <div className="flex justify-end space-x-2">
//                               <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
//                                 Cancel
//                               </Button>
//                               <Button onClick={updateTicket}>
//                                 Update Ticket
//                               </Button>
//                             </div>
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

// export default TicketManagement;
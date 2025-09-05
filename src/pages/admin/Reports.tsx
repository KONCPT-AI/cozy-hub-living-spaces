// import { useState, useEffect } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
// import { TrendingUp, DollarSign, Users, Home, Wrench } from 'lucide-react';
// import { supabase } from '@/integrations/supabase/client';
// import { useToast } from '@/hooks/use-toast';
// import AdminLayout from '@/components/AdminLayout';

// const Reports = () => {
//   const [dateRange, setDateRange] = useState('30');
//   const [revenueData, setRevenueData] = useState([]);
//   const [occupancyData, setOccupancyData] = useState([]);
//   const [ticketData, setTicketData] = useState([]);
//   const [stats, setStats] = useState({
//     totalRevenue: 0,
//     totalUsers: 0,
//     occupancyRate: 0,
//     totalTickets: 0
//   });
//   const [loading, setLoading] = useState(true);
//   const { toast } = useToast();

//   useEffect(() => {
//     fetchReportsData();
//   }, [dateRange]);

//   const fetchReportsData = async () => {
//     try {
//       const startDate = new Date();
//       startDate.setDate(startDate.getDate() - parseInt(dateRange));

//       const [paymentsRes, roomsRes, bookingsRes, ticketsRes, profilesRes] = await Promise.all([
//         supabase.from('payments').select('*').gte('payment_date', startDate.toISOString()),
//         supabase.from('rooms').select('*'),
//         supabase.from('bookings').select('*'),
//         supabase.from('maintenance_tickets').select('*').gte('created_at', startDate.toISOString()),
//         supabase.from('profiles').select('*')
//       ]);

//       if (paymentsRes.error) throw paymentsRes.error;
//       if (roomsRes.error) throw roomsRes.error;
//       if (bookingsRes.error) throw bookingsRes.error;
//       if (ticketsRes.error) throw ticketsRes.error;
//       if (profilesRes.error) throw profilesRes.error;

//       const payments = paymentsRes.data || [];
//       const rooms = roomsRes.data || [];
//       const bookings = bookingsRes.data || [];
//       const tickets = ticketsRes.data || [];
//       const profiles = profilesRes.data || [];

//       // Process revenue data by day
//       const revenueByDay = {};
//       payments.forEach(payment => {
//         if (payment.status === 'completed') {
//           const date = new Date(payment.payment_date).toLocaleDateString();
//           revenueByDay[date] = (revenueByDay[date] || 0) + payment.amount;
//         }
//       });

//       const revenueChartData = Object.entries(revenueByDay).map(([date, amount]) => ({
//         date,
//         revenue: amount
//       })).slice(-7); // Last 7 days

//       // Process occupancy data
//       const totalRooms = rooms.length;
//       const occupiedRooms = rooms.filter(room => room.current_occupancy > 0).length;
//       const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

//       const occupancyChartData = [
//         { name: 'Occupied', value: occupiedRooms, color: '#8884d8' },
//         { name: 'Available', value: totalRooms - occupiedRooms, color: '#82ca9d' }
//       ];

//       // Process ticket data by status
//       const ticketsByStatus = {};
//       tickets.forEach(ticket => {
//         ticketsByStatus[ticket.status] = (ticketsByStatus[ticket.status] || 0) + 1;
//       });

//       const ticketChartData = Object.entries(ticketsByStatus).map(([status, count]) => ({
//         status: status.replace('_', ' '),
//         count
//       }));

//       // Calculate stats
//       const totalRevenue = payments
//         .filter(p => p.status === 'completed')
//         .reduce((sum, p) => sum + p.amount, 0);

//       setRevenueData(revenueChartData);
//       setOccupancyData(occupancyChartData);
//       setTicketData(ticketChartData);
//       setStats({
//         totalRevenue,
//         totalUsers: profiles.length,
//         occupancyRate: Math.round(occupancyRate),
//         totalTickets: tickets.length
//       });
//       setLoading(false);
//     } catch (error) {
//       console.error('Error fetching reports data:', error);
//       toast({
//         title: 'Error',
//         description: 'Failed to fetch reports data',
//         variant: 'destructive',
//       });
//       setLoading(false);
//     }
//   };

//   const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

//   if (loading) {
//     return (
//       <AdminLayout>
//         <div className="p-6">Loading reports...</div>
//       </AdminLayout>
//     );
//   }

//   return (
//     <AdminLayout>
//       <div className="p-6 space-y-6">
//         <div className="flex items-center justify-between">
//           <h1 className="text-3xl font-bold flex items-center gap-2">
//             <TrendingUp className="h-8 w-8" />
//             Reports & Analytics
//           </h1>
//           <Select value={dateRange} onValueChange={setDateRange}>
//             <SelectTrigger className="w-48">
//               <SelectValue />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="7">Last 7 days</SelectItem>
//               <SelectItem value="30">Last 30 days</SelectItem>
//               <SelectItem value="90">Last 90 days</SelectItem>
//               <SelectItem value="365">Last year</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>

//         {/* Key Stats */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//           <Card>
//             <CardContent className="p-4">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <div className="text-sm font-medium text-muted-foreground">Total Revenue</div>
//                   <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
//                 </div>
//                 <DollarSign className="h-8 w-8 text-muted-foreground" />
//               </div>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardContent className="p-4">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <div className="text-sm font-medium text-muted-foreground">Total Users</div>
//                   <div className="text-2xl font-bold">{stats.totalUsers}</div>
//                 </div>
//                 <Users className="h-8 w-8 text-muted-foreground" />
//               </div>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardContent className="p-4">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <div className="text-sm font-medium text-muted-foreground">Occupancy Rate</div>
//                   <div className="text-2xl font-bold">{stats.occupancyRate}%</div>
//                 </div>
//                 <Home className="h-8 w-8 text-muted-foreground" />
//               </div>
//             </CardContent>
//           </Card>
//           <Card>
//             <CardContent className="p-4">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <div className="text-sm font-medium text-muted-foreground">Support Tickets</div>
//                   <div className="text-2xl font-bold">{stats.totalTickets}</div>
//                 </div>
//                 <Wrench className="h-8 w-8 text-muted-foreground" />
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Charts */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           {/* Revenue Chart */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Revenue Trend</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <ResponsiveContainer width="100%" height={300}>
//                 <LineChart data={revenueData}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="date" />
//                   <YAxis />
//                   <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']} />
//                   <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
//                 </LineChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>

//           {/* Occupancy Chart */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Room Occupancy</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <ResponsiveContainer width="100%" height={300}>
//                 <PieChart>
//                   <Pie
//                     data={occupancyData}
//                     cx="50%"
//                     cy="50%"
//                     labelLine={false}
//                     label={({ name, value }) => `${name}: ${value}`}
//                     outerRadius={80}
//                     fill="#8884d8"
//                     dataKey="value"
//                   >
//                     {occupancyData.map((entry, index) => (
//                       <Cell key={`cell-${index}`} fill={entry.color} />
//                     ))}
//                   </Pie>
//                   <Tooltip />
//                 </PieChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>

//           {/* Ticket Status Chart */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Support Ticket Status</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <ResponsiveContainer width="100%" height={300}>
//                 <BarChart data={ticketData}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="status" />
//                   <YAxis />
//                   <Tooltip />
//                   <Bar dataKey="count" fill="#82ca9d" />
//                 </BarChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>

//           {/* Performance Summary */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Performance Summary</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="flex justify-between items-center">
//                 <span className="text-sm font-medium">Average Revenue per Day</span>
//                 <span className="text-sm text-muted-foreground">
//                   ₹{Math.round(stats.totalRevenue / parseInt(dateRange)).toLocaleString()}
//                 </span>
//               </div>
//               <div className="flex justify-between items-center">
//                 <span className="text-sm font-medium">Users per Room</span>
//                 <span className="text-sm text-muted-foreground">
//                   {Math.round((stats.totalUsers / Math.max(1, occupancyData.reduce((sum, item) => sum + item.value, 0))) * 100) / 100}
//                 </span>
//               </div>
//               <div className="flex justify-between items-center">
//                 <span className="text-sm font-medium">Tickets per User</span>
//                 <span className="text-sm text-muted-foreground">
//                   {Math.round((stats.totalTickets / Math.max(1, stats.totalUsers)) * 100) / 100}
//                 </span>
//               </div>
//               <div className="flex justify-between items-center">
//                 <span className="text-sm font-medium">Revenue per User</span>
//                 <span className="text-sm text-muted-foreground">
//                   ₹{Math.round(stats.totalRevenue / Math.max(1, stats.totalUsers)).toLocaleString()}
//                 </span>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </AdminLayout>
//   );
// };

// export default Reports;
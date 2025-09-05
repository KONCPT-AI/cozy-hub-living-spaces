// import UserLayout from '@/components/UserLayout';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Calendar, MapPin, Users, Clock, CreditCard } from 'lucide-react';

// const MyBookings = () => {
//   const bookings = [
//     {
//       id: 1,
//       roomName: 'Urban Nest Downtown - Room A-201',
//       location: 'Downtown District',
//       startDate: '2023-12-01',
//       endDate: '2024-11-30',
//       status: 'active',
//       price: 850,
//       type: 'Private Room'
//     },
//     {
//       id: 2,
//       roomName: 'Community Towers - Room B-105',
//       location: 'University Area',
//       startDate: '2024-02-01',
//       endDate: '2024-07-31',
//       status: 'upcoming',
//       price: 650,
//       type: 'Shared Room'
//     }
//   ];

//   return (
//     <UserLayout>
//       <div className="p-6 max-w-4xl mx-auto">
//         <h1 className="text-3xl font-bold mb-8">My Bookings</h1>
        
//         <div className="space-y-6">
//           {bookings.map((booking) => (
//             <Card key={booking.id} className="border-0 shadow-soft">
//               <CardContent className="p-6">
//                 <div className="flex justify-between items-start mb-4">
//                   <div>
//                     <h3 className="text-xl font-semibold">{booking.roomName}</h3>
//                     <div className="flex items-center text-muted-foreground mt-1">
//                       <MapPin className="h-4 w-4 mr-1" />
//                       <span>{booking.location}</span>
//                     </div>
//                   </div>
//                   <Badge variant={booking.status === 'active' ? 'default' : 'secondary'}>
//                     {booking.status}
//                   </Badge>
//                 </div>
                
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
//                   <div className="flex items-center">
//                     <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
//                     <div>
//                       <p className="text-sm font-medium">Start Date</p>
//                       <p className="text-sm text-muted-foreground">{booking.startDate}</p>
//                     </div>
//                   </div>
//                   <div className="flex items-center">
//                     <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
//                     <div>
//                       <p className="text-sm font-medium">End Date</p>
//                       <p className="text-sm text-muted-foreground">{booking.endDate}</p>
//                     </div>
//                   </div>
//                   <div className="flex items-center">
//                     <Users className="h-4 w-4 mr-2 text-muted-foreground" />
//                     <div>
//                       <p className="text-sm font-medium">Room Type</p>
//                       <p className="text-sm text-muted-foreground">{booking.type}</p>
//                     </div>
//                   </div>
//                   <div className="flex items-center">
//                     <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
//                     <div>
//                       <p className="text-sm font-medium">Monthly Rent</p>
//                       <p className="text-sm text-muted-foreground">${booking.price}</p>
//                     </div>
//                   </div>
//                 </div>
                
//                 <div className="flex gap-3">
//                   <Button variant="outline">View Details</Button>
//                   <Button variant="outline">Contact Support</Button>
//                   {booking.status === 'upcoming' && (
//                     <Button variant="destructive">Cancel Booking</Button>
//                   )}
//                 </div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       </div>
//     </UserLayout>
//   );
// };

// export default MyBookings;
// import UserLayout from '@/components/UserLayout';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Calendar, MapPin, Users, Clock } from 'lucide-react';

// const Events = () => {
//   const events = [
//     {
//       id: 1,
//       title: 'Community Game Night',
//       date: '2024-01-15',
//       time: '7:00 PM',
//       location: 'Common Area',
//       attendees: 15,
//       category: 'Social'
//     },
//     {
//       id: 2,
//       title: 'Professional Networking',
//       date: '2024-01-18',
//       time: '6:30 PM',
//       location: 'Conference Room',
//       attendees: 25,
//       category: 'Networking'
//     }
//   ];

//   return (
//     <UserLayout>
//       <div className="p-6 max-w-4xl mx-auto">
//         <h1 className="text-3xl font-bold mb-8">Community Events</h1>
        
//         <div className="space-y-6">
//           {events.map((event) => (
//             <Card key={event.id} className="border-0 shadow-soft">
//               <CardContent className="p-6">
//                 <div className="flex justify-between items-start mb-4">
//                   <div>
//                     <h3 className="text-xl font-semibold">{event.title}</h3>
//                     <Badge className="mt-2">{event.category}</Badge>
//                   </div>
//                   <div className="flex items-center text-muted-foreground">
//                     <Users className="h-4 w-4 mr-1" />
//                     <span>{event.attendees} attending</span>
//                   </div>
//                 </div>
                
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
//                   <div className="flex items-center">
//                     <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
//                     <span>{event.date}</span>
//                   </div>
//                   <div className="flex items-center">
//                     <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
//                     <span>{event.time}</span>
//                   </div>
//                   <div className="flex items-center">
//                     <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
//                     <span>{event.location}</span>
//                   </div>
//                 </div>
                
//                 <div className="flex gap-3">
//                   <Button>Join Event</Button>
//                   <Button variant="outline">View Details</Button>
//                 </div>
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       </div>
//     </UserLayout>
//   );
// };

// export default Events;
// import { useState, useEffect } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { useToast } from "@/components/ui/use-toast";
// import { supabase } from "@/integrations/supabase/client";
// import { format } from "date-fns";
// import { Clock, UserCheck, Calendar, AlertTriangle } from "lucide-react";
// import { useAuth } from "@/contexts/AuthContext";

// interface AccessLog {
//   id: string;
//   property_id: string;
//   room_id?: string;
//   check_type: string;
//   authentication_method: string;
//   device_id?: string;
//   timestamp: string;
//   is_late_entry: boolean;
//   notes?: string;
//   properties?: {
//     name: string;
//   } | null;
//   rooms?: {
//     room_number: string;
//   } | null;
// }

// export default function AccessHistory() {
//   const [logs, setLogs] = useState<AccessLog[]>([]);
//   const [startDate, setStartDate] = useState<string>("");
//   const [endDate, setEndDate] = useState<string>("");
//   const [isLoading, setIsLoading] = useState(false);
//   const { user } = useAuth();
//   const { toast } = useToast();

//   useEffect(() => {
//     if (user) {
//       fetchAccessLogs();
//     }
//   }, [user, startDate, endDate]);

//   const fetchAccessLogs = async () => {
//     if (!user) return;
    
//     setIsLoading(true);
//     try {
//       let query = supabase
//         .from("check_in_out_logs")
//         .select(`
//           *,
//           properties(name),
//           rooms(room_number)
//         `)
//         .eq("user_id", user.id)
//         .order("timestamp", { ascending: false })
//         .limit(100);

//       if (startDate) {
//         query = query.gte("timestamp", new Date(startDate).toISOString());
//       }
//       if (endDate) {
//         const endDateTime = new Date(endDate);
//         endDateTime.setDate(endDateTime.getDate() + 1);
//         query = query.lt("timestamp", endDateTime.toISOString());
//       }

//       const { data, error } = await query;
//       if (error) throw error;
      
//       setLogs((data as any) || []);
//     } catch (error: any) {
//       toast({
//         title: "Error",
//         description: error.message,
//         variant: "destructive",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const getAuthMethodBadge = (method: string) => {
//     const variants = {
//       face_recognition: "bg-blue-100 text-blue-800",
//       fingerprint: "bg-green-100 text-green-800",
//       smart_card: "bg-purple-100 text-purple-800",
//       manual: "bg-gray-100 text-gray-800",
//     };
    
//     return (
//       <Badge className={variants[method as keyof typeof variants] || "bg-gray-100 text-gray-800"}>
//         {method.replace("_", " ").toUpperCase()}
//       </Badge>
//     );
//   };

//   const getCheckTypeBadge = (type: string, isLate: boolean) => {
//     const baseClass = type === "check_in" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
    
//     return (
//       <div className="flex gap-1 items-center">
//         <Badge className={baseClass}>
//           {type === "check_in" ? "CHECK IN" : "CHECK OUT"}
//         </Badge>
//         {isLate && (
//           <Badge className="bg-orange-100 text-orange-800">
//             <Clock className="w-3 h-3 mr-1" />
//             LATE
//           </Badge>
//         )}
//       </div>
//     );
//   };

//   const lateEntries = logs.filter(log => log.is_late_entry).length;
//   const totalEntries = logs.length;
//   const thisMonthEntries = logs.filter(log => {
//     const logDate = new Date(log.timestamp);
//     const now = new Date();
//     return logDate.getMonth() === now.getMonth() && logDate.getFullYear() === now.getFullYear();
//   }).length;

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-3xl font-bold text-foreground">Access History</h1>
//           <p className="text-muted-foreground">View your check-in and check-out records</p>
//         </div>
//       </div>

//       {/* Statistics Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <Card>
//           <CardContent className="p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-muted-foreground">Total Entries</p>
//                 <p className="text-2xl font-bold text-foreground">{totalEntries}</p>
//               </div>
//               <UserCheck className="w-8 h-8 text-primary" />
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardContent className="p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-muted-foreground">This Month</p>
//                 <p className="text-2xl font-bold text-foreground">{thisMonthEntries}</p>
//               </div>
//               <Calendar className="w-8 h-8 text-blue-500" />
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardContent className="p-6">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-muted-foreground">Late Entries</p>
//                 <p className="text-2xl font-bold text-foreground">{lateEntries}</p>
//               </div>
//               <AlertTriangle className="w-8 h-8 text-orange-500" />
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Date Filters */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Filter by Date Range</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
//             <div className="space-y-2">
//               <Label htmlFor="start-date">From Date</Label>
//               <Input
//                 id="start-date"
//                 type="date"
//                 value={startDate}
//                 onChange={(e) => setStartDate(e.target.value)}
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="end-date">To Date</Label>
//               <Input
//                 id="end-date"
//                 type="date"
//                 value={endDate}
//                 onChange={(e) => setEndDate(e.target.value)}
//               />
//             </div>
//             <div>
//               <button
//                 onClick={() => {
//                   setStartDate("");
//                   setEndDate("");
//                 }}
//                 className="px-4 py-2 text-sm border border-border rounded-md hover:bg-accent transition-colors"
//               >
//                 Clear Filters
//               </button>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Access Logs Table */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <UserCheck className="w-5 h-5" />
//             Your Access Records
//             {lateEntries > 0 && (
//               <Badge className="bg-orange-100 text-orange-800">
//                 <AlertTriangle className="w-3 h-3 mr-1" />
//                 {lateEntries} Late {lateEntries === 1 ? 'Entry' : 'Entries'}
//               </Badge>
//             )}
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           {isLoading ? (
//             <div className="text-center py-8">Loading...</div>
//           ) : (
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Date & Time</TableHead>
//                   <TableHead>Property</TableHead>
//                   <TableHead>Room</TableHead>
//                   <TableHead>Type</TableHead>
//                   <TableHead>Auth Method</TableHead>
//                   <TableHead>Device</TableHead>
//                   <TableHead>Notes</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {logs.map((log) => (
//                   <TableRow key={log.id} className={log.is_late_entry ? "bg-orange-50" : ""}>
//                     <TableCell>
//                       <div className="flex flex-col">
//                         <span className="font-medium">
//                           {format(new Date(log.timestamp), "MMM dd, yyyy")}
//                         </span>
//                         <span className="text-sm text-muted-foreground">
//                           {format(new Date(log.timestamp), "HH:mm:ss")}
//                         </span>
//                       </div>
//                     </TableCell>
//                     <TableCell className="font-medium">
//                       {log.properties?.name || "Unknown"}
//                     </TableCell>
//                     <TableCell>
//                       {log.rooms?.room_number || "-"}
//                     </TableCell>
//                     <TableCell>
//                       {getCheckTypeBadge(log.check_type, log.is_late_entry)}
//                     </TableCell>
//                     <TableCell>
//                       {getAuthMethodBadge(log.authentication_method)}
//                     </TableCell>
//                     <TableCell className="text-sm text-muted-foreground">
//                       {log.device_id || "-"}
//                     </TableCell>
//                     <TableCell className="text-sm text-muted-foreground">
//                       {log.notes || "-"}
//                     </TableCell>
//                   </TableRow>
//                 ))}
//                 {logs.length === 0 && (
//                   <TableRow>
//                     <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
//                       No access records found
//                     </TableCell>
//                   </TableRow>
//                 )}
//               </TableBody>
//             </Table>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
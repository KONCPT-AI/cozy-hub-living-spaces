import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Calendar, Check, X, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/AdminLayout';
import axios from "axios";

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin-booking/getallBookings`);
      setBookings(res.data.booking || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch booking data',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      const endpoint = status === 'approved'
        ? `${API_BASE_URL}/api/admin-booking/approveBooking/${bookingId}`
        : `${API_BASE_URL}/api/admin-booking/rejectBooking/${bookingId}`;

      await axios.patch(endpoint);

      toast({
        title: 'Success',
        description: `Booking ${status === 'approved' ? 'approved' : 'rejected'} successfully`
      });

      fetchData();
      setIsDialogOpen(false);
      setSelectedBooking(null);
    } catch (error) {
      console.error('Error updating booking:', error);
      toast({
        title: 'Error',
        description: 'Failed to update booking',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'approved':
      case 'active': return 'default';
      case 'rejected': return 'destructive';
      case 'completed': return 'outline';
      default: return 'secondary';
    }
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
            Booking Management
          </h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm font-medium text-muted-foreground">Total Bookings</div>
              <div className="text-2xl font-bold">{bookings.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm font-medium text-muted-foreground">Pending</div>
              <div className="text-2xl font-bold">{bookings.filter(b => b.status === 'pending').length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm font-medium text-muted-foreground">Active</div>
              <div className="text-2xl font-bold">{bookings.filter(b => b.status === 'active').length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm font-medium text-muted-foreground">Completed</div>
              <div className="text-2xl font-bold">{bookings.filter(b => b.status === 'completed').length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Bookings Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Check-in Date</TableHead>
                  <TableHead>Monthly Rent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.user?.fullName}</TableCell>
                    <TableCell>{booking.room?.roomNumber}</TableCell>
                    <TableCell>{booking.room?.property?.name}</TableCell>
                    <TableCell>{new Date(booking.checkInDate).toLocaleDateString('en-IN')}</TableCell>
                    <TableCell>₹{ booking.monthlyRent?.toLocaleString() || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedBooking(booking);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Dialog */}
            {selectedBooking && (
              <Dialog
                open={isDialogOpen}
                onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (!open) setSelectedBooking(null);
                }}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Booking Details</DialogTitle>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-2 gap-6">
                      <div>
                        <div><Label>User</Label></div>
                        <div className="text-sm text-muted-foreground">{selectedBooking.user?.fullName}</div>
                      </div>
                      <div>
                        <div><Label>Email </Label></div>
                        <div className="text-sm text-muted-foreground">{selectedBooking.user?.email}</div>
                      </div>
                      <div>
                        <div><Label>Phone </Label></div>
                        <div className="text-sm text-muted-foreground">{selectedBooking.user?.phone}</div>
                      </div>
                      <div>
                        <div><Label>Room</Label></div>
                        <div className="text-sm text-muted-foreground">{selectedBooking.room?.roomNumber}</div>
                      </div>
                      <div>
                        <div><Label>Check-in Date</Label></div>
                        <div className="text-sm text-muted-foreground">{new Date(selectedBooking.checkInDate).toLocaleDateString('en-IN')}</div>
                      </div>
                      <div>
                        <div><Label>Check-out Date</Label></div>
                        <div className="text-sm text-muted-foreground">{new Date(selectedBooking.checkOutDate).toLocaleDateString('en-IN')}</div>
                      </div>
                      <div>
                        <div><Label>Duration</Label></div>
                        <div className="text-sm text-muted-foreground">{selectedBooking.duration} Months</div>
                      </div>
                      <div>
                        <div><Label>Monthly Rent</Label></div>
                        <div className="text-sm text-muted-foreground">₹{selectedBooking.monthlyRent?.toLocaleString()}</div>
                      </div>
                      <div>
                        <div><Label>Status</Label></div>
                        <div className="text-sm text-muted-foreground">{selectedBooking.status}</div>
                      </div>
                    </div>

                      {selectedBooking.status === 'pending' && (
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => updateBookingStatus(selectedBooking.id, 'approved')}
                            className="flex-1"
                          >
                            <Check className="h-4 w-4 mr-2" /> Approve
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => updateBookingStatus(selectedBooking.id, 'rejected')}
                            className="flex-1"
                          >
                            <X className="h-4 w-4 mr-2" /> Reject
                          </Button>
                        </div>
                      )}
                  </div>

                </DialogContent>
              </Dialog>
            )}

          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default BookingManagement;

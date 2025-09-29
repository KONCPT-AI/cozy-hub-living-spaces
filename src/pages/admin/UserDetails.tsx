import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from '@/components/AdminLayout';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const UserDetails = () => {
  const { user } = useAuth();
  const { id } = useParams(); // get user id from URL
  const [userData, setUserData] = useState<any>(null);
  const [bookings, setBookings] = useState([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserandBookingDetails();
  }, [id]);

  const fetchUserandBookingDetails = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/user-and-booking/details/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setUserData(data.user);
      setBookings(data.user.bookings || []);
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to fetch user details", variant: "destructive" });
    }
  };

  if (!userData) return <AdminLayout>Loading...</AdminLayout>;

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <Button onClick={() => navigate(-1)}>Back</Button>

        {/* User Personal Details */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="font-medium">Full Name</p>{userData.fullName}</div>
              <div><p className="font-medium">Email</p>{userData.email}</div>
              <div><p className="font-medium">Phone</p>{userData.phone || 'NA'}</div>
              <div><p className="font-medium">Date of Birth</p>{userData.dateOfBirth || 'NA'}</div>
              <div><p className="font-medium">Occupation</p>{userData.occupation || 'NA'}</div>
              <div><p className="font-medium">Emergency Contact</p>{userData.emergencyContactName || 'NA'} - {userData.emergencyContactPhone }</div>
              <div><p className="font-medium">KYC Status</p>
                <Badge variant={userData.kyc_verified ? 'default' : 'destructive'}>
                  {userData.kyc_verified ? 'Verified' : 'Pending'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking History */}
        <Card>
          <CardHeader>
            <CardTitle>Booking History</CardTitle>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <p>No bookings found</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Room Number</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Check-out</TableHead>
                    <TableHead>Montly Rent</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((b: any) => (
                    <TableRow key={b.id}>
                      <TableCell>{b.room?.roomNumber}</TableCell>
                      <TableCell>{b.room?.property?.name}</TableCell>
                      <TableCell>{new Date(b.checkInDate).toLocaleDateString('IN-en')}</TableCell>
                      <TableCell>{new Date(b.checkOutDate).toLocaleDateString('IN-en')}</TableCell>
                      <TableCell>{b.monthlyRent}</TableCell>
                      <TableCell>
                        <Badge variant={b.status === 'confirmed' ? 'default' : 'destructive'}>
                          {b.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default UserDetails;

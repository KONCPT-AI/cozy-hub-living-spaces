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
import { Building, Plus, Edit, Trash2 } from 'lucide-react';
import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from "@/contexts/AuthContext";

interface RoomFormData {
  propertyId: number | null;
  roomNumber: number;
  roomType: string;
  capacity: number;
  monthlyRent: number;
  depositAmount: number;
  preferredUserType: string;
  amenities: string;
  description: string;
  availableForBooking: boolean;
  floorNumber?: number | null;
}

const RoomManagement = () => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [formData, setFormData] = useState<RoomFormData>({
    propertyId: null,
    roomNumber: null,
    roomType: 'single',
    capacity: 1,
    monthlyRent: 0,
    depositAmount: 0,
    floorNumber: null,
    description: '',
    amenities: '',
    availableForBooking: true,
    preferredUserType: 'student',
  });
  const [errors, setErrors] = useState<any>({});
  const [properties, setProperties] = useState<any[]>([]);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();  
  const token = user?.token;   

  useEffect(() => {
    fetchRooms();
    fetchProperties();
  }, []);


  const fetchProperties = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/property/getAll`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProperties(response.data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/rooms/getall`);
      setRooms(response.data.rooms || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const validateField = (field: string, value: any) => {
  let message = "";

  if(field === "propertyId") {
    if (!value) message = "Property is required";
  }

  if (field === "roomNumber") {
    if (!value) message = "Room number is required";
    else if (value <= 0) message = "Room number must be greater than 0";
  }

  if(field === "roomType") {
    if (!value) message = "Room type is required";
  }

  if (field === "capacity") {
    if (!value || value < 1) message = "Capacity must be at least 1";
  }

  if (field === "floorNumber") {
    if (!value) message = "Floor number is required";
    else if (!value || value < 1) message = "Floor number must be at least 1";
  }

  if (field === "monthlyRent") {
    if (value === null || isNaN(value)) {
    message = "Monthly rent is required";
  } else if (value < 0) {
    message = "Monthly rent cannot be negative";
  }
  }

  if (field === "depositAmount") {
    if (value === null || isNaN(value)) {
    message = "Deposit amount is required";
  } else if (value < 0) {
    message = "Deposit amount cannot be negative";
  }
  }

  if (field === "description") {
  if (value.trim() && !/^[a-zA-Z\s,.'-]{10,500}$/.test(value.trim())) {
    message = "Description must be 10 to 500 characters long";
  }
  }

  return message;
  };

  const handleInputChange = (field: string, value: any) => {
  const updatedData = { ...formData, [field]: value };
  setFormData(updatedData);

  const message = validateField(field, value);
  setErrors((prev: any) => ({
    ...prev,
    [field]: message
  }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    Object.keys(formData).forEach((field) => {
      const value = (formData as any)[field];
      const message = validateField(field, value);
      if (message) newErrors[field] = message;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!validateForm()){
       setIsLoading(false);
       return;
    }
    
    const roomData = {
      propertyId: formData.propertyId,
      roomNumber: formData.roomNumber,
      roomType: formData.roomType,
      capacity: formData.capacity,
      monthlyRent: formData.monthlyRent,
      depositAmount: formData.depositAmount,
      floorNumber: formData.floorNumber,
      description: formData.description || null,
      amenities: formData.amenities?.trim() || "",
      availableForBooking: formData.availableForBooking,
      preferredUserType: formData.preferredUserType,
    };

    try {
      if (selectedRoom) {
        await axios.put(`${API_BASE_URL}/api/rooms/${selectedRoom.id}`, roomData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast({ title: 'Success', description: 'Room updated successfully' });
      } else {
        await axios.post(`${API_BASE_URL}/api/rooms/add`, roomData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast({ title: 'Success', description: 'Room created successfully' });
      }
      
      setIsDialogOpen(false);
      setSelectedRoom(null);
      resetForm();
      fetchRooms();
    } catch (error:any) {
      console.error('Error saving room:', error);
      const backendMessage =     error.response?.data?.message ||      error.response?.data?.error ||
      (Array.isArray(error.response?.data?.errors) ? error.response.data.errors[0].msg : null);

      toast({
        title: 'Error',
        description: backendMessage || 'Failed to save room',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      propertyId: null,
      roomNumber: null,
      roomType: 'single',
      capacity: 1,
      monthlyRent: 0,
      depositAmount: 0,
      floorNumber: null,
      description: '',
      amenities: '',
      availableForBooking: true,
      preferredUserType: 'student',
    });
        setErrors({});
  };

  const editRoom = (room: any) => {
    setSelectedRoom(room);
    setFormData({
      propertyId: room.propertyId,
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      capacity: room.capacity,
      monthlyRent: room.monthlyRent,
      depositAmount: room.depositAmount,
      floorNumber: room.floorNumber || null,
      description: room.description || '',
      amenities:  room.amenities || '',
      availableForBooking: room.availableForBooking,
      preferredUserType: room.preferredUserType || 'student',
    });
    setIsDialogOpen(true);
        setErrors({});
  };

  const deleteRoom = async (roomId: number) => {
    if (!confirm('Are you sure you want to delete this room?')) return;
      
    try {
      await axios.delete(`${API_BASE_URL}/api/rooms/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({ title: 'Success', description: 'Room deleted successfully' });
      fetchRooms();
    } catch (error) {
      console.error('Error deleting room:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete room',
        variant: 'destructive',
      });
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building className="h-8 w-8" />
            Room Management
          </h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setSelectedRoom(null); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Room
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{selectedRoom ? 'Edit Room' : 'Add New Room'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Property Dropdown */}
                <div>
                  <Label htmlFor="property_id">Property</Label>
                  <Select
                    value={formData.propertyId ? String(formData.propertyId) : ""}
                    onValueChange={(value) => setFormData({...formData, propertyId: Number(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a property" />
                    </SelectTrigger>
                    <SelectContent>
                      {properties.map((property) => (
                        <SelectItem key={property.id} value={String(property.id)}>
                          {property.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.propertyId && <p className="text-red-500 text-sm">{errors.propertyId}</p>}
                </div>

                {/* Room fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="room_number">Room Number</Label>
                    <Input
                      id="room_number"
                      type='number'
                      value={formData.roomNumber ?? ""}
                      onChange={(e) => handleInputChange("roomNumber", Number(e.target.value) || null)}
                    />
                    {errors.roomNumber && <p className="text-red-500 text-sm">{errors.roomNumber}</p>}
                  </div>
                  <div>
                    <Label htmlFor="room_type">Room Type</Label>
                    <Select
                      value={formData.roomType}
                      onValueChange={(value) => setFormData({...formData, roomType: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="shared">Shared</SelectItem>
                        <SelectItem value="studio">Studio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input
                      id="capacity"
                      type="number"
                      min="1"
                      value={formData.capacity}
                      onChange={(e) => handleInputChange("capacity", Number(e.target.value) || 1)}
                    />
                    {errors.capacity && <p className="text-red-500 text-sm">{errors.capacity}</p>}
                  </div>
                  <div>
                    <Label htmlFor="floor_number">Floor Number</Label>
                    <Input
                      id="floor_number"
                      type="number"
                      value={formData.floorNumber ?? ""}
                      onChange={(e) => handleInputChange("floorNumber", e.target.value ? Number(e.target.value) : null)}
                    />{errors.floorNumber && <p className="text-red-500 text-sm">{errors.floorNumber}</p>}
                  </div>
                  <div>
                    <Label htmlFor="monthlyRent">Monthly Rent (₹)</Label>
                    <Input
                      id="monthlyRent"
                      type="number"
                      value={formData.monthlyRent === null ? "" : formData.monthlyRent}
                      onChange={(e) => handleInputChange("monthlyRent", e.target.value === "" ? null : Number(e.target.value))}
                    />
                    {errors.monthlyRent && <p className="text-red-500 text-sm">{errors.monthlyRent}</p>}
                  </div>
                  <div>
                    <Label htmlFor="depositAmount">Deposit Amount (₹)</Label>
                    <Input
                      id="depositAmount"
                      type="number"
                      value={formData.depositAmount === null ? "" : formData.depositAmount}
                      onChange={(e) => handleInputChange("depositAmount", e.target.value === "" ? null : Number(e.target.value))}
                    />
                    {errors.depositAmount && <p className="text-red-500 text-sm">{errors.depositAmount}</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="preferred_user_type">Preferred User Type</Label>
                  <Select
                    value={formData.preferredUserType}
                    onValueChange={(value) => setFormData({...formData, preferredUserType: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="amenities">Amenities (comma-separated)</Label>
                  <Input
                    id="amenities"
                    value={formData.amenities}
                    onChange={(e) => setFormData({...formData, amenities: e.target.value})}
                    placeholder="WiFi, AC, Attached Bathroom"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                  />{errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="availableForBooking"
                    checked={formData.availableForBooking}
                    onChange={(e) => setFormData({...formData, availableForBooking: e.target.checked})}
                  />
                  <Label htmlFor="availableForBooking">Available for booking</Label>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {selectedRoom ? 'Update Room' : 'Create Room'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Room Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Rooms ({rooms.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Room Number</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Monthly Rent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Occupancy</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rooms.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell>{room.property || 'No Property'}</TableCell>
                    <TableCell>{room.roomNumber}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{room.roomType}</Badge>
                    </TableCell>
                    <TableCell>{room.capacity}</TableCell>
                    <TableCell>₹{Number(room.monthlyRent || 0).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={room.status === 'available' ? 'default' : 'destructive'}>
                        {room.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{room.occupancy || `0/${room.capacity}`}</TableCell>
                    <TableCell className="space-x-2">
                      <Button variant="outline" size="sm" onClick={() => editRoom(room)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteRoom(room.id)}
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

export default RoomManagement;

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
  import { useToast } from '@/hooks/use-toast';
  import AdminLayout from '@/components/AdminLayout';
  import { useAuth } from "@/contexts/AuthContext";
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

  interface Property {
  id: string;
  name: string;
  address?: string;
  amenities?: string[];
  images?: string[];
  }

  interface RoomFormData {
    propertyId: number | null;
    roomNumber: number | null;
    roomType: string;
    capacity: number;
    monthlyRent: number | null;
    depositAmount: number | null;
    preferredUserType: string;
    amenities: string;
    description: string;
    availableForBooking: boolean;
    floorNumber?: number | null;
    images?: (File | string)[];
    removedImages?: string[];
  }

  const isAdminUser = (user: any): user is { properties: number[]; role: string } => {
    return user && (user.role === 'admin' || user.role === 'super-admin');
  };

  const RoomManagement = () => {
    const [rooms, setRooms] = useState<any[]>([]);
    const [properties, setProperties] = useState<any[]>([]);
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
      images: [],
      removedImages: [],
    });

    const [errors, setErrors] = useState<any>({});
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const { user,hasPermission } = useAuth();
    const token = user?.token;
    const [filteredRooms, setFilteredRooms] = useState([]);
      
    useEffect(() => {
      fetchRooms();
      fetchProperties();
    }, []);

    const fetchProperties = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/property/getAll`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const propData=response.data;
        let propertiesToShow = propData;
      if (user.role !== 'super-admin' && isAdminUser(user)) {
        const accessibleProps = user.properties || [];
          propertiesToShow = propData.filter((p) => accessibleProps.includes(Number(p.id)));
      } 
      setProperties(propertiesToShow);
      } catch (error) {
        console.error(error);
      }
    };

    const fetchRooms = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/rooms/getall`);
        const RoomData=response.data.rooms || [];
         // Filter based on role
      let roomsToShow = RoomData;
      if (user.role !== 'super-admin' && isAdminUser(user)) {
        const accessibleProps = user.properties || [];
        roomsToShow = RoomData.filter(
          (b) => accessibleProps.includes(b.propertyId)
        );
      }
        setRooms(roomsToShow);
        setFilteredRooms(roomsToShow);
      } catch (error) {
        console.error(error);
      }
    };

   const validateField = (field: string, value: any) => {
    let message = "";

    if (field === "propertyId") {
      if (!value) message = "Property is required";
    }

    if (field === "roomNumber") {
      if (!value) message = "Room number is required";
      else if (value <= 0) message = "Room number must be greater than 0";
    }

    if (field === "roomType") {
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
      const newErrors: any = {};
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
      if (!validateForm()) {
      setIsLoading(false);
      return;
    }

      const dataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'images') return; // handled separately
        dataToSend.append(key, value === null ? '' : value.toString());
      });

      // Append images
      formData.images?.forEach((img) => {
        if (img instanceof File) dataToSend.append("roomImages", img);
      });

      // Removed images (old URLs to delete)
      formData.removedImages?.forEach((imgUrl) => {
        dataToSend.append("removedImages", imgUrl);
      });

      try {
        if (selectedRoom) {
          await axios.put(`${API_BASE_URL}/api/rooms/edit/${selectedRoom.id}`, dataToSend, {
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
          });
          toast({ title: "Success", description: "Room updated successfully" });
        } else {
          await axios.post(`${API_BASE_URL}/api/rooms/add`, dataToSend, {
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
          });
          toast({ title: "Success", description: "Room created successfully" });
        }

        setIsDialogOpen(false);
        setSelectedRoom(null);
        resetForm();
        fetchRooms();
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to save room",
          variant: 'destructive'
        });
      }
    };

    const resetForm = () => {
      setFormData({
        propertyId: null,
        roomNumber: null,
        roomType: 'single',
        capacity: 1,
        monthlyRent: null,
        depositAmount: null,
        floorNumber: null,
        description: '',
        amenities: '',
        availableForBooking: true,
        preferredUserType: 'student',
        images: [],
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
        floorNumber: room.floorNumber,
        description: room.description || '',
        amenities: Array.isArray(room.amenities) ? room.amenities.join(', ') : room.amenities || '',
        availableForBooking: room.status === 'available',
        preferredUserType: room.preferredUserType || 'student',
        images: room.images || [],
      });
      setErrors({});
      setIsDialogOpen(true);
    };

    const deleteRoom = async (roomId: number) => {
      if (!confirm('Are you sure you want to delete this room?')) return;
      try {
        await axios.delete(`${API_BASE_URL}/api/rooms/delete/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast({ title: 'Success', description: 'Room deleted successfully' });
        fetchRooms();
      } catch (error:any) {
        const message =      error.response?.data?.message ||      "Failed to delete room";
        toast({ title: 'Error', description: message, variant: 'destructive' });
      }
    };

    return (
      <AdminLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Building className="h-8 w-8" /> Room Management
            </h1>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                {hasPermission('Room Management','write') && (
                <Button onClick={() => { resetForm(); setSelectedRoom(null); }}>
                  <Plus className="h-4 w-4 mr-2" /> Add Room
                </Button>)}
              </DialogTrigger>
              <DialogContent className="max-w-2xl ">
                <DialogHeader>
                  <DialogTitle>{selectedRoom ? 'Edit Room' : 'Add New Room'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto  max-h-[80vh] scrollbar-hide">
                  {/* Property */}
                  <div>
                    <Label htmlFor="property">Property</Label>
                    <Select
                      value={formData.propertyId ? String(formData.propertyId) : ""}
                      onValueChange={(value) => handleInputChange('propertyId', Number(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a property" />
                      </SelectTrigger>
                      <SelectContent>
                        {properties.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    {errors.propertyId && <p className="text-red-500 text-sm">{errors.propertyId}</p>}
                  </div>

                  {/* Room Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Room Number</Label>
                      <Input type="number" value={formData.roomNumber ?? ''} onChange={(e) => handleInputChange('roomNumber', Number(e.target.value) || null)} />
                      {errors.roomNumber && <p className="text-red-500 text-sm">{errors.roomNumber}</p>}
                    </div>
                    <div>
                      <Label>Room Type</Label>
                      <Select value={formData.roomType} onValueChange={(v) => setFormData({ ...formData, roomType: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">Single</SelectItem>
                          <SelectItem value="2 sharing">2 Sharing</SelectItem>
                          <SelectItem value="3 sharing">3 Sharing</SelectItem>
                          <SelectItem value="4 sharing">4 Sharing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Capacity</Label>
                      <Input type="number" value={formData.capacity} onChange={(e) => handleInputChange('capacity', Number(e.target.value) || 1)} />
                      {errors.capacity && <p className="text-red-500 text-sm">{errors.capacity}</p>}
                    </div>
                    <div>
                      <Label>Floor Number</Label>
                      <Input type="number" value={formData.floorNumber ?? ''} onChange={(e) => handleInputChange('floorNumber', e.target.value ? Number(e.target.value) : null)} />
                      {errors.floorNumber && <p className="text-red-500 text-sm">{errors.floorNumber}</p>}
                    </div>
                    <div>
                      <Label>Monthly Rent (₹)</Label>
                      <Input type="number" value={formData.monthlyRent ?? ''} onChange={(e) => handleInputChange('monthlyRent', e.target.value ? Number(e.target.value) : null)} />
                      {errors.monthlyRent && <p className="text-red-500 text-sm">{errors.monthlyRent}</p>}
                    </div>
                    <div>
                      <Label>Deposit Amount (₹)</Label>
                      <Input type="number" value={formData.depositAmount ?? ''} onChange={(e) => handleInputChange('depositAmount', e.target.value ? Number(e.target.value) : null)} />
                      {errors.depositAmount && <p className="text-red-500 text-sm">{errors.depositAmount}</p>}
                    </div>
                  </div>

                  {/* Preferred User */}
                  <div>
                    <Label>Preferred User Type</Label>
                    <Select value={formData.preferredUserType} onValueChange={(v) => setFormData({ ...formData, preferredUserType: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Images */}
                  <div>
                    <Label>Room Images</Label>
                    <Input type="file" multiple accept="image/*" onChange={(e) => {
                      if(e.target.files) {
                        setFormData({ ...formData, images: [...(formData.images || []), ...Array.from(e.target.files)] });
                      }
                    }} />
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {/* image preview */}
                      {formData.images?.map((img, idx) => {
                        const src = img instanceof File ? URL.createObjectURL(img) :  `${API_BASE_URL}/${img.replace(/^\//, "")}`;;
                        return (
                          <div key={idx} className="relative">
                            <img src={src} className="w-20 h-20 object-cover rounded" alt=""/>

                            <button type="button" className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                              onClick={() =>{
                                  const removed = formData.images![idx];
                                  setFormData({ 
                                    ...formData,
                                     images: formData.images!.filter((_, i) => i !== idx) ,
                                    removedImages: [
                                      ...(formData.removedImages || []),
                                      ...(removed instanceof File ? [] : [removed]) // sirf old string URLs ko bhejna hai
                                    ]
                                    })}
                              } 
                                
                            >✕</button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Amenities & Description */}
                  <div>
                    <Label>Amenities</Label>
                    <Input value={formData.amenities} onChange={(e) => setFormData({ ...formData, amenities: e.target.value })} placeholder="WiFi, AC" />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} />
                    {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
                  </div>

                  {/* Available Checkbox */}
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={formData.availableForBooking} onChange={(e) => setFormData({ ...formData, availableForBooking: e.target.checked })} />
                    <Label>Available for Booking</Label>
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button type="submit">{selectedRoom ? 'Update Room' : 'Create Room'}</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Room Table */}
          <Card>
            <CardHeader><CardTitle>All Rooms ({rooms.length})</CardTitle></CardHeader>
            <CardContent>
               {hasPermission('Room Management', 'read') ? (
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
                  {filteredRooms.map(room => (
                    <TableRow key={room.id}>
                      <TableCell>{room.property?.name || 'No Property'}</TableCell>
                      <TableCell>{room.roomNumber}</TableCell>
                      <TableCell><Badge variant="outline">{room.roomType}</Badge></TableCell>
                      <TableCell>{room.capacity}</TableCell>
                      <TableCell>₹{Number(room.monthlyRent || 0).toLocaleString()}</TableCell>
                      <TableCell><Badge variant={room.status === 'available' ? 'default' : 'destructive'}>{room.status}</Badge></TableCell>
                      <TableCell>{room.occupancy || `0/${room.capacity}`}</TableCell>
                        {hasPermission('Room Management','write') && (
                      <TableCell className="space-x-2">
                        <Button size="sm" variant="outline" onClick={() => editRoom(room)}><Edit className="h-4 w-4" /></Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteRoom(room.id)}><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                        )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              ) : (
              <div className="text-red-500 font-bold p-4">Access Denied: You cannot view bookings.</div>
            )}
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  };

  export default RoomManagement;

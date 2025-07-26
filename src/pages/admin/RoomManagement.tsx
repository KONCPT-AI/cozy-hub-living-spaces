
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
import { Building, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/AdminLayout';

const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [formData, setFormData] = useState({
    room_number: '',
    room_type: 'single',
    capacity: 1,
    price_per_month: '',
    deposit_amount: '',
    floor_number: '',
    description: '',
    amenities: '',
    is_available: true,
    preferred_user_type: 'student',
    property_id: ''
  });
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRooms();
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  const fetchRooms = async () => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select(`
          *,
          properties (
            id,
            name
          )
        `)
        .order('room_number');

      if (error) throw error;
      setRooms(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch rooms',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const roomData = {
      room_number: formData.room_number,
      room_type: formData.room_type as "single" | "shared" | "studio",
      capacity: parseInt(formData.capacity.toString()),
      price_per_month: parseFloat(formData.price_per_month),
      deposit_amount: parseFloat(formData.deposit_amount),
      floor_number: formData.floor_number ? parseInt(formData.floor_number.toString()) : null,
      description: formData.description || null,
      amenities: formData.amenities ? formData.amenities.split(',').map(a => a.trim()) : null,
      is_available: formData.is_available,
      preferred_user_type: formData.preferred_user_type as "student" | "professional",
      property_id: formData.property_id || null,
    };

    try {
      if (selectedRoom) {
        const { error } = await supabase
          .from('rooms')
          .update(roomData)
          .eq('id', selectedRoom.id);
        if (error) throw error;
        toast({ title: 'Success', description: 'Room updated successfully' });
      } else {
        const { error } = await supabase
          .from('rooms')
          .insert(roomData);
        if (error) throw error;
        toast({ title: 'Success', description: 'Room created successfully' });
      }
      
      setIsDialogOpen(false);
      setSelectedRoom(null);
      resetForm();
      fetchRooms();
    } catch (error) {
      console.error('Error saving room:', error);
      toast({
        title: 'Error',
        description: 'Failed to save room',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      room_number: '',
      room_type: 'single',
      capacity: 1,
      price_per_month: '',
      deposit_amount: '',
      floor_number: '',
      description: '',
      amenities: '',
      is_available: true,
      preferred_user_type: 'student',
      property_id: ''
    });
  };

  const editRoom = (room) => {
    setSelectedRoom(room);
    setFormData({
      room_number: room.room_number,
      room_type: room.room_type,
      capacity: room.capacity,
      price_per_month: room.price_per_month.toString(),
      deposit_amount: room.deposit_amount.toString(),
      floor_number: room.floor_number?.toString() || '',
      description: room.description || '',
      amenities: room.amenities?.join(', ') || '',
      is_available: room.is_available,
      preferred_user_type: room.preferred_user_type || 'student',
      property_id: room.property_id || ''
    });
    setIsDialogOpen(true);
  };

  const deleteRoom = async (roomId) => {
    if (!confirm('Are you sure you want to delete this room?')) return;
    
    try {
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', roomId);
      
      if (error) throw error;
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
                <div>
                  <Label htmlFor="property_id">Property</Label>
                  <Select value={formData.property_id} onValueChange={(value) => setFormData({...formData, property_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a property" />
                    </SelectTrigger>
                    <SelectContent>
                      {properties.map((property) => (
                        <SelectItem key={property.id} value={property.id}>
                          {property.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="room_number">Room Number</Label>
                    <Input
                      id="room_number"
                      value={formData.room_number}
                      onChange={(e) => setFormData({...formData, room_number: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="room_type">Room Type</Label>
                    <Select value={formData.room_type} onValueChange={(value) => setFormData({...formData, room_type: value})}>
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
                      onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value) || 1})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="floor_number">Floor Number</Label>
                    <Input
                      id="floor_number"
                      type="number"
                      value={formData.floor_number}
                      onChange={(e) => setFormData({...formData, floor_number: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="price_per_month">Monthly Rent (₹)</Label>
                    <Input
                      id="price_per_month"
                      type="number"
                      step="0.01"
                      value={formData.price_per_month}
                      onChange={(e) => setFormData({...formData, price_per_month: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="deposit_amount">Deposit Amount (₹)</Label>
                    <Input
                      id="deposit_amount"
                      type="number"
                      step="0.01"
                      value={formData.deposit_amount}
                      onChange={(e) => setFormData({...formData, deposit_amount: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="preferred_user_type">Preferred User Type</Label>
                  <Select value={formData.preferred_user_type} onValueChange={(value) => setFormData({...formData, preferred_user_type: value})}>
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
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_available"
                    checked={formData.is_available}
                    onChange={(e) => setFormData({...formData, is_available: e.target.checked})}
                  />
                  <Label htmlFor="is_available">Available for booking</Label>
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
                    <TableCell className="text-sm text-muted-foreground">
                      {room.properties?.name || 'No Property'}
                    </TableCell>
                    <TableCell className="font-medium">{room.room_number}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{room.room_type}</Badge>
                    </TableCell>
                    <TableCell>{room.capacity}</TableCell>
                    <TableCell>₹{room.price_per_month.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={room.is_available ? 'default' : 'destructive'}>
                        {room.is_available ? 'Available' : 'Unavailable'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {room.current_occupancy || 0}/{room.capacity}
                    </TableCell>
                    <TableCell className="space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => editRoom(room)}
                      >
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

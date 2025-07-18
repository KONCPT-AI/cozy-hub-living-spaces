import UserLayout from '@/components/UserLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Search, 
  Filter,
  MapPin, 
  Users, 
  Wifi, 
  Car, 
  Coffee, 
  Star,
  Heart,
  Eye,
  Calendar,
  DollarSign,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface Room {
  id: string;
  room_number: string;
  room_type: string;
  price_per_month: number;
  deposit_amount: number;
  capacity: number;
  current_occupancy: number;
  floor_number?: number;
  is_available: boolean;
  description?: string;
  amenities?: string[];
  images?: string[];
  preferred_user_type?: string;
}

const BrowseRooms = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showRoomDetails, setShowRoomDetails] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('is_available', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching rooms:', error);
        toast({
          title: "Error",
          description: "Failed to load rooms. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setRooms(data || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast({
        title: "Error",
        description: "Failed to load rooms. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const typeFilters = [
    { label: 'All Types', value: 'all' },
    { label: 'Single', value: 'single' },
    { label: 'Shared', value: 'shared' },
    { label: 'Studio', value: 'studio' },
  ];

  const priceFilters = [
    { label: 'All Prices', value: 'all' },
    { label: 'Under $700', value: 'under-700' },
    { label: '$700 - $900', value: '700-900' },
    { label: '$900 - $1200', value: '900-1200' },
    { label: 'Above $1200', value: 'above-1200' },
  ];

  const toggleFavorite = (roomId: string) => {
    setFavorites(prev => 
      prev.includes(roomId) 
        ? prev.filter(id => id !== roomId)
        : [...prev, roomId]
    );
  };

  const handleViewRoom = (room: Room) => {
    setSelectedRoom(room);
    setCurrentImageIndex(0);
    setShowRoomDetails(true);
  };

  const handleBookRoom = (room: Room) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to book a room.",
        variant: "destructive",
      });
      return;
    }
    setSelectedRoom(room);
    setShowBookingModal(true);
    setCheckInDate('');
    setCheckOutDate('');
    setBookingNotes('');
  };

  const submitBooking = async () => {
    if (!user || !selectedRoom || !checkInDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in the check-in date.",
        variant: "destructive",
      });
      return;
    }

    setIsBooking(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          room_id: selectedRoom.id,
          check_in_date: checkInDate,
          check_out_date: checkOutDate,
          monthly_rent: selectedRoom.price_per_month,
          status: 'pending',
          notes: bookingNotes || null
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating booking:', error);
        toast({
          title: "Booking Failed",
          description: "Failed to create booking. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Booking Submitted",
        description: "Your booking request has been submitted for approval.",
      });

      setShowBookingModal(false);
      setSelectedRoom(null);
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Booking Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };

  const nextImage = () => {
    if (selectedRoom?.images && selectedRoom.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === selectedRoom.images!.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedRoom?.images && selectedRoom.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedRoom.images!.length - 1 : prev - 1
      );
    }
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (room.description && room.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'all' || room.room_type === selectedType;
    const matchesPrice = priceRange === 'all' || 
      (priceRange === 'under-700' && room.price_per_month < 700) ||
      (priceRange === '700-900' && room.price_per_month >= 700 && room.price_per_month <= 900) ||
      (priceRange === '900-1200' && room.price_per_month > 900 && room.price_per_month <= 1200) ||
      (priceRange === 'above-1200' && room.price_per_month > 1200);
    
    return matchesSearch && matchesType && matchesPrice;
  });

  return (
    <UserLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Browse Rooms</h1>
          <p className="text-muted-foreground">
            Find your perfect co-living space from our curated selection.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-card p-6 rounded-xl shadow-soft mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search rooms or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {typeFilters.map(filter => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>

            {/* Price Filter */}
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {priceFilters.map(filter => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>

            {/* Advanced Filters */}
            <Button variant="outline" className="flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </div>

        {/* Results */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredRooms.length} of {rooms.length} available rooms
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="overflow-hidden border-0 shadow-soft">
                <div className="w-full h-48 bg-muted animate-pulse"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-muted animate-pulse mb-2"></div>
                  <div className="h-4 bg-muted animate-pulse mb-2 w-3/4"></div>
                  <div className="h-4 bg-muted animate-pulse mb-4 w-1/2"></div>
                  <div className="flex justify-between">
                    <div className="h-6 bg-muted animate-pulse w-20"></div>
                    <div className="h-8 bg-muted animate-pulse w-16"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Rooms Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <Card key={room.id} className="overflow-hidden border-0 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
                <div className="relative">
                  <img 
                    src={room.images && room.images.length > 0 
                      ? room.images[0] 
                      : `https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=250&fit=crop`}
                    alt={`Room ${room.room_number}`}
                    className="w-full h-48 object-cover"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`absolute top-2 right-2 h-8 w-8 p-0 bg-background/80 ${
                      favorites.includes(room.id) ? 'text-red-500' : 'text-muted-foreground'
                    }`}
                    onClick={() => toggleFavorite(room.id)}
                  >
                    <Heart className={`h-4 w-4 ${favorites.includes(room.id) ? 'fill-current' : ''}`} />
                  </Button>
                  <Badge className="absolute top-2 left-2 bg-secondary text-secondary-foreground">
                    {room.is_available ? 'Available' : 'Occupied'}
                  </Badge>
                  {room.preferred_user_type && (
                    <Badge className="absolute bottom-2 right-2 bg-background/90 text-foreground">
                      {room.preferred_user_type}
                    </Badge>
                  )}
                </div>
                
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg line-clamp-1">Room {room.room_number}</h3>
                    <Badge variant="outline" className="text-xs">
                      {room.room_type}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center text-muted-foreground mb-2">
                    <Users className="h-4 w-4 mr-1" />
                    <span className="text-sm">
                      {room.current_occupancy}/{room.capacity} occupied
                      {room.floor_number && ` • Floor ${room.floor_number}`}
                    </span>
                  </div>
                  
                  {room.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {room.description}
                    </p>
                  )}
                  
                  {room.amenities && room.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {room.amenities.slice(0, 3).map((amenity, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                      {room.amenities.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{room.amenities.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-2xl font-bold text-secondary">${room.price_per_month}</span>
                      <span className="text-sm text-muted-foreground">/month</span>
                      <div className="text-sm text-muted-foreground">
                        Deposit: ${room.deposit_amount}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewRoom(room)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleBookRoom(room)}
                        disabled={!room.is_available || room.current_occupancy >= room.capacity}
                      >
                        <Calendar className="h-4 w-4 mr-1" />
                        Book
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Load More */}
        {filteredRooms.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Rooms
            </Button>
          </div>
        )}

        {/* No Results */}
        {filteredRooms.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No rooms found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or filters.
            </p>
            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setSelectedType('all');
              setPriceRange('all');
            }}>
              Clear Filters
            </Button>
          </div>
        )}

        {/* Room Details Modal */}
        <Dialog open={showRoomDetails} onOpenChange={setShowRoomDetails}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Room {selectedRoom?.room_number} Details</span>
                <Badge variant="outline">
                  {selectedRoom?.room_type}
                </Badge>
              </DialogTitle>
            </DialogHeader>
            
            {selectedRoom && (
              <div className="space-y-6">
                {/* Image Gallery */}
                <div className="relative">
                  <div className="w-full h-80 rounded-lg overflow-hidden">
                    <img 
                      src={selectedRoom.images && selectedRoom.images.length > 0 
                        ? selectedRoom.images[currentImageIndex] 
                        : `https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=800&h=400&fit=crop`}
                      alt={`Room ${selectedRoom.room_number}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {selectedRoom.images && selectedRoom.images.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-background/80"
                        onClick={prevImage}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-background/80"
                        onClick={nextImage}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <div className="absolute bottom-2 right-2 bg-background/80 px-2 py-1 rounded text-sm">
                        {currentImageIndex + 1} / {selectedRoom.images.length}
                      </div>
                    </>
                  )}
                </div>

                {/* Room Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Room Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Room Number:</span>
                        <span className="font-medium">{selectedRoom.room_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Room Type:</span>
                        <Badge variant="outline">{selectedRoom.room_type}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Capacity:</span>
                        <span className="font-medium">{selectedRoom.capacity} person(s)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current Occupancy:</span>
                        <span className="font-medium">{selectedRoom.current_occupancy}/{selectedRoom.capacity}</span>
                      </div>
                      {selectedRoom.floor_number && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Floor:</span>
                          <span className="font-medium">{selectedRoom.floor_number}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Availability:</span>
                        <Badge className={selectedRoom.is_available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {selectedRoom.is_available ? 'Available' : 'Occupied'}
                        </Badge>
                      </div>
                      {selectedRoom.preferred_user_type && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Preferred For:</span>
                          <Badge variant="outline">{selectedRoom.preferred_user_type}</Badge>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-4">Pricing</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Monthly Rent:</span>
                        <span className="text-2xl font-bold text-secondary">${selectedRoom.price_per_month}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Security Deposit:</span>
                        <span className="font-medium">${selectedRoom.deposit_amount}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {selectedRoom.description && (
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Description</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {selectedRoom.description}
                    </p>
                  </div>
                )}

                {/* Amenities */}
                {selectedRoom.amenities && selectedRoom.amenities.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Amenities</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedRoom.amenities.map((amenity, index) => (
                        <Badge key={index} variant="outline" className="text-sm">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setShowRoomDetails(false)}>
                    Close
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowRoomDetails(false);
                      handleBookRoom(selectedRoom);
                    }}
                    disabled={!selectedRoom.is_available || selectedRoom.current_occupancy >= selectedRoom.capacity}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Book This Room
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Booking Modal */}
        <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Book Room {selectedRoom?.room_number}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {selectedRoom && (
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Room {selectedRoom.room_number}</span>
                    <Badge variant="outline">{selectedRoom.room_type}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Monthly Rent:</span>
                    <span className="text-lg font-bold text-secondary">${selectedRoom.price_per_month}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Security Deposit:</span>
                    <span className="font-medium">${selectedRoom.deposit_amount}</span>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <Label htmlFor="check-in-date">Check-in Date *</Label>
                  <Input
                    id="check-in-date"
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="check-out-date">Check-out Date</Label>
                  <Input
                    id="check-out-date"
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    min={checkInDate || new Date().toISOString().split('T')[0]}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Leave empty for open-ended booking
                  </p>
                </div>

                <div>
                  <Label htmlFor="booking-notes">Additional Notes</Label>
                  <Textarea
                    id="booking-notes"
                    placeholder="Any special requests or notes for your booking..."
                    value={bookingNotes}
                    onChange={(e) => setBookingNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setShowBookingModal(false)}
                  disabled={isBooking}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={submitBooking}
                  disabled={isBooking || !checkInDate}
                >
                  {isBooking ? 'Submitting...' : 'Submit Booking'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </UserLayout>
  );
};

export default BrowseRooms;
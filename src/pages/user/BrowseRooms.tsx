import UserLayout from '@/components/UserLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Search, 
  Filter,
  MapPin, 
  Users, 
  Heart,
  Eye,
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import axios from 'axios';

interface Property {
  id: string;
  name: string;
  address?: string;
  amenities?: string[];
  images?: string[];
}

interface Room {
  id: string;
  roomNumber: number;
  roomType: string;
  monthlyRent: number;
  depositAmount: number;
  capacity: number;
  occupancy: number;
  floorNumber?: number;
  is_available: boolean;
  status:string;
  description?: string;
  amenities?: string[];
  images?: string[];
  preferredUserType?: string;
  property?: Property;
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
  const [cardImageIndex, setCardImageIndex] = useState<Record<string, number>>({});
  const [checkInDate, setCheckInDate] = useState('');
  const [duration, setDuration] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const baseURL = import.meta.env.VITE_API_BASE_URL;
  const token = user?.token;

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
  try {
    setLoading(true);
    const res = await axios.get(`${baseURL}/api/rooms/getall?available=true`);
    setRooms(res.data.rooms);
    
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
    { label: 'single', value: 'single' },
    { label: '2 sharing', value: '2 sharing' },
    { label: '3 sharing', value: '3 sharing' },
    { label: '4 sharing', value: '4 sharing' },
  ];

  const priceFilters = [
    { label: 'All Prices', value: 'all' },
    { label: 'Under ₹700', value: 'under-700' },
    { label: '₹700 - ₹900', value: '700-900' },
    { label: '₹900 - ₹1200', value: '900-1200' },
    { label: 'Above ₹1200', value: 'above-1200' },
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
      const bookingData = {
      userId: Number(user.id),
      roomId: Number(selectedRoom.id),
      checkInDate: checkInDate,
      monthlyRent: selectedRoom.monthlyRent,
      duration: duration ? Number(duration) : null,
      depositAmount: selectedRoom.depositAmount,
      status: 'pending',
      notes: bookingNotes || null,
    };

      const res = await axios.post(`${baseURL}/api/book-room/add`, bookingData,
          { headers: { Authorization: `Bearer ${token}` } })


      toast({
        title: "Booking Submitted",
        description: "Your booking request has been submitted for approval.",
      });

      setShowBookingModal(false);
      setSelectedRoom(null);
      setCheckInDate('');
      setBookingNotes('');
    } catch (error:any) {
      const errorMessage = error?.response?.data?.message
      toast({
        title: "Booking Failed",
        description: errorMessage || "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    } 
  };

  // const nextImage = () => {
  //   if (selectedRoom?.images && selectedRoom.images.length > 0) {
  //     setCurrentImageIndex((prev) => 
  //       prev === selectedRoom.images!.length - 1 ? 0 : prev + 1
  //     );
  //   }
  // };

  // const prevImage = () => {
  //   if (selectedRoom?.images && selectedRoom.images.length > 0) {
  //     setCurrentImageIndex((prev) => 
  //       prev === 0 ? selectedRoom.images!.length - 1 : prev - 1
  //     );
  //   }
  // };

  const nextCardImage = (roomId: string, totalImages: number) => {
  setCardImageIndex(prev => ({
    ...prev,
    [roomId]: prev[roomId] === undefined
      ? 1
      : (prev[roomId] + 1) % totalImages
  }));
  };

  const prevCardImage = (roomId: string, totalImages: number) => {
    setCardImageIndex(prev => ({
      ...prev,
      [roomId]: prev[roomId] === undefined
        ? totalImages - 1
        : (prev[roomId] - 1 + totalImages) % totalImages
    }));
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.roomNumber.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (room.description && room.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (room.property.name && room.property.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (room.property.address && room.property.address.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'all' || room.roomType === selectedType;
    const matchesPrice = priceRange === 'all' || 
      (priceRange === 'under-700' && room.monthlyRent < 700) ||
      (priceRange === '700-900' && room.monthlyRent >= 700 && room.monthlyRent <= 900) ||
      (priceRange === '900-1200' && room.monthlyRent > 900 && room.monthlyRent <= 1200) ||
      (priceRange === 'above-1200' && room.monthlyRent > 1200);
    
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              aria-label='Room Type'
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
              aria-label='Price Range'
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
                  <img src={
                      room.images && room.images.length > 0
                        ? `${baseURL}${room.images[cardImageIndex[room.id] || 0]}`
                        : `https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=250&fit=crop`
                    }
                    alt={`Room ${room.roomNumber}`}
                    className="w-full h-full object-cover rounded-t-lg"
                  />

                    {room.images && room.images.length > 1 && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-background/80"
                          onClick={() => prevCardImage(room.id, room.images!.length)}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-background/80"
                          onClick={() => nextCardImage(room.id, room.images!.length)}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>

                        <div className="absolute bottom-2 right-2 bg-background/80 px-2 py-1 rounded text-xs">
                          {cardImageIndex[room.id] !== undefined ? cardImageIndex[room.id] + 1 : 1} / {room.images.length}
                        </div>
                      </>
                    )}
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
                    {room.status === "available" ? 'Available' : 'Occupied'}
                  </Badge>
                  {room.preferredUserType && (
                    <Badge className="absolute bottom-2 right-2 bg-background/90 text-foreground">
                      {room.preferredUserType}
                    </Badge>
                  )}
                </div>
                
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-lg line-clamp-1">Room {room.roomNumber}</h3>
                      {room.property && (
                        <div className="flex items-center text-muted-foreground text-sm mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span className="line-clamp-1">{room.property.name}</span>
                        </div>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {room.roomType}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center text-muted-foreground mb-2">
                    <Users className="h-4 w-4 mr-1" />
                    <span className="text-sm">
                      {room.occupancy} occupied
                      {room.floorNumber && ` • Floor ${room.floorNumber}`}
                    </span>
                  </div>
                  
                  {room.description &&  room.description.length>0?(
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {room.description || 'NA'}
                    </p>
                  ):(
                    <p className="text-gray-400 text-xs mb-4">No description</p>
                  )}
                  
                  {Array.isArray(room.amenities) && room.amenities.length > 0 ? (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {room.amenities.slice(0, 3).map((amenity: string, index: number) => (
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
                    ) : (
                    <p className="text-gray-400 text-xs mb-4">No amenities</p>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-2xl font-bold text-secondary">₹{room.monthlyRent}</span>
                      <span className="text-sm text-muted-foreground">/month</span>
                      <div className="text-sm text-muted-foreground">
                        Deposit: ₹{room.depositAmount}
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
                        disabled={room.status !== "available" || room.occupancy >= room.capacity}
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
                <span>Room {selectedRoom?.roomNumber} Details</span>
                <Badge variant="outline">
                  {selectedRoom?.roomType}
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
                        ? `${baseURL}${selectedRoom.images[cardImageIndex[selectedRoom.id] || 0]}`
                        : `https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=800&h=400&fit=crop`}
                      alt={`Room ${selectedRoom.roomNumber}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {selectedRoom.images && selectedRoom.images.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-background/80"
                         onClick={() => prevCardImage(selectedRoom?.id!, selectedRoom!.images!.length)}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-background/80"
                         onClick={() => nextCardImage(selectedRoom?.id!, selectedRoom!.images!.length)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <div className="absolute bottom-2 right-2 bg-background/80 px-2 py-1 rounded text-sm">
                        {currentImageIndex + 1} / {selectedRoom.images.length}
                      </div>
                    </>
                  )}
                </div>

                {/* Property & Room Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Room Information</h3>
                    <div className="space-y-3">
                      {selectedRoom.property && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Property:</span>
                            <span className="font-medium">{selectedRoom.property.name}</span>
                          </div>
                          {selectedRoom.property.address && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Address:</span>
                              <span className="font-medium text-sm">{selectedRoom.property.address}</span>
                            </div>
                          )}
                        </>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Room Number:</span>
                        <span className="font-medium">{selectedRoom.roomNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Room Type:</span>
                        <Badge variant="outline">{selectedRoom.roomType}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Capacity:</span>
                        <span className="font-medium">{selectedRoom.capacity} person(s)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current Occupancy:</span>
                        <span className="font-medium">{selectedRoom.occupancy}</span>
                      </div>
                      {selectedRoom.floorNumber && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Floor:</span>
                          <span className="font-medium">{selectedRoom.floorNumber}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Availability:</span>
                        <Badge className={selectedRoom.is_available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          {selectedRoom.is_available ? 'Available' : 'Occupied'}
                        </Badge>
                      </div>
                      {selectedRoom.preferredUserType && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Preferred For:</span>
                          <Badge variant="outline">{selectedRoom.preferredUserType}</Badge>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-4">Pricing</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Monthly Rent:</span>
                        <span className="text-2xl font-bold text-secondary">₹{selectedRoom.monthlyRent}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Security Deposit:</span>
                        <span className="font-medium">₹{selectedRoom.depositAmount}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Description</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {selectedRoom.description || 'No description available.'}
                    </p>
                  </div>
                

                {/* Amenities */}
                 {Array.isArray(selectedRoom.amenities) && selectedRoom.amenities.length > 0 && (
                      <><h3 className="text-xl font-semibold mb-3">Amenities</h3>
                      <div className="flex flex-wrap gap-1 mb-4">
                      {selectedRoom.amenities.slice(0, 3).map((amenity, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {amenity}
                        </Badge>
                      ))}
                      {selectedRoom.amenities.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{selectedRoom.amenities.length - 3} more
                        </Badge>
                      )}
                  
                  </div></>
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
                    disabled={!selectedRoom.is_available || selectedRoom.occupancy >= selectedRoom.capacity}
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
              <DialogTitle>Book Room {selectedRoom?.roomNumber}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {selectedRoom && (
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Room {selectedRoom.roomNumber}</span>
                    <Badge variant="outline">{selectedRoom.roomType}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Monthly Rent:</span>
                    <span className="text-lg font-bold text-secondary">₹{selectedRoom.monthlyRent}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Security Deposit:</span>
                    <span className="font-medium">₹{selectedRoom.depositAmount}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total Payable:</span>
                    <span className="text-secondary">
                        {checkInDate && duration
                           ? `₹${selectedRoom.monthlyRent * Number(duration) + selectedRoom.depositAmount}`
                          : 0}
                    </span>
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

                {/* Duration Dropdown */}
                <div>
                  <Label htmlFor="duration">Duration *</Label>
                  <Select value={duration} onValueChange={(value) => setDuration(value)}>
                    <SelectTrigger className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <SelectValue placeholder="Select Duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 Months</SelectItem>
                      <SelectItem value="6">6 Months</SelectItem>
                      <SelectItem value="12">12 Months</SelectItem>
                    </SelectContent>
                  </Select>
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



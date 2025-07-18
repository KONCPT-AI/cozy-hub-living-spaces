import UserLayout from '@/components/UserLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
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
  DollarSign
} from 'lucide-react';

const BrowseRooms = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [favorites, setFavorites] = useState<number[]>([]);

  const rooms = [
    {
      id: 1,
      name: 'Modern Studio in Downtown',
      location: 'Downtown District',
      price: 850,
      originalPrice: 900,
      rating: 4.8,
      reviews: 24,
      type: 'Private',
      occupancy: '1 person',
      amenities: ['WiFi', 'Parking', 'Common Area', 'Security'],
      image: 'photo-1721322800607-8c38375eef04',
      availability: 'Available Now',
      preferredFor: 'Professional',
      description: 'Spacious studio with modern amenities in the heart of downtown.'
    },
    {
      id: 2,
      name: 'Shared Room near University',
      location: 'University Area',
      price: 650,
      originalPrice: 700,
      rating: 4.6,
      reviews: 18,
      type: 'Shared',
      occupancy: '2 people',
      amenities: ['WiFi', 'Study Room', 'Events', 'Security'],
      image: 'photo-1649972904349-6e44c42644a7',
      availability: 'Available Feb 1',
      preferredFor: 'Student',
      description: 'Perfect for students with study areas and community events.'
    },
    {
      id: 3,
      name: 'Premium Suite with City View',
      location: 'Business District',
      price: 1200,
      originalPrice: 1300,
      rating: 4.9,
      reviews: 31,
      type: 'Private',
      occupancy: '1 person',
      amenities: ['WiFi', 'Parking', 'Gym', 'Coworking', 'Rooftop'],
      image: 'photo-1488590528505-98d2b5aba04b',
      availability: 'Available Now',
      preferredFor: 'Professional',
      description: 'Luxury suite with panoramic city views and premium amenities.'
    },
    {
      id: 4,
      name: 'Cozy Room in Student Hub',
      location: 'University Area',
      price: 550,
      originalPrice: 600,
      rating: 4.5,
      reviews: 15,
      type: 'Shared',
      occupancy: '3 people',
      amenities: ['WiFi', 'Study Room', 'Library', 'Events'],
      image: 'photo-1483058712412-4245e9b90334',
      availability: 'Available Jan 20',
      preferredFor: 'Student',
      description: 'Budget-friendly option with great community vibes.'
    },
    {
      id: 5,
      name: 'Executive Room with Office',
      location: 'Business District',
      price: 950,
      originalPrice: 1000,
      rating: 4.7,
      reviews: 22,
      type: 'Private',
      occupancy: '1 person',
      amenities: ['WiFi', 'Parking', 'Office Space', 'Concierge'],
      image: 'photo-1721322800607-8c38375eef04',
      availability: 'Available Now',
      preferredFor: 'Professional',
      description: 'Perfect for working professionals with dedicated office space.'
    },
    {
      id: 6,
      name: 'Shared Apartment with Balcony',
      location: 'Residential Area',
      price: 750,
      originalPrice: 800,
      rating: 4.4,
      reviews: 12,
      type: 'Shared',
      occupancy: '2 people',
      amenities: ['WiFi', 'Balcony', 'Garden', 'Pet Friendly'],
      image: 'photo-1649972904349-6e44c42644a7',
      availability: 'Available Feb 15',
      preferredFor: 'Both',
      description: 'Peaceful location with outdoor space and pet-friendly policy.'
    }
  ];

  const typeFilters = [
    { label: 'All Types', value: 'all' },
    { label: 'Private Room', value: 'Private' },
    { label: 'Shared Room', value: 'Shared' },
  ];

  const priceFilters = [
    { label: 'All Prices', value: 'all' },
    { label: 'Under $700', value: 'under-700' },
    { label: '$700 - $900', value: '700-900' },
    { label: '$900 - $1200', value: '900-1200' },
    { label: 'Above $1200', value: 'above-1200' },
  ];

  const toggleFavorite = (roomId: number) => {
    setFavorites(prev => 
      prev.includes(roomId) 
        ? prev.filter(id => id !== roomId)
        : [...prev, roomId]
    );
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || room.type === selectedType;
    const matchesPrice = priceRange === 'all' || 
      (priceRange === 'under-700' && room.price < 700) ||
      (priceRange === '700-900' && room.price >= 700 && room.price <= 900) ||
      (priceRange === '900-1200' && room.price > 900 && room.price <= 1200) ||
      (priceRange === 'above-1200' && room.price > 1200);
    
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

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <Card key={room.id} className="overflow-hidden border-0 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
              <div className="relative">
                <img 
                  src={`https://images.unsplash.com/${room.image}?w=400&h=250&fit=crop`}
                  alt={room.name}
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
                  {room.availability}
                </Badge>
                <Badge className="absolute bottom-2 right-2 bg-background/90 text-foreground">
                  {room.preferredFor}
                </Badge>
              </div>
              
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg line-clamp-1">{room.name}</h3>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-secondary fill-current" />
                    <span className="text-sm font-medium">{room.rating}</span>
                    <span className="text-sm text-muted-foreground">({room.reviews})</span>
                  </div>
                </div>
                
                <div className="flex items-center text-muted-foreground mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span className="text-sm">{room.location}</span>
                </div>
                
                <div className="flex items-center text-muted-foreground mb-3">
                  <Users className="h-4 w-4 mr-1" />
                  <span className="text-sm">{room.type} • {room.occupancy}</span>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {room.description}
                </p>
                
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
                
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-2xl font-bold text-secondary">${room.price}</span>
                    <span className="text-sm text-muted-foreground">/month</span>
                    {room.originalPrice > room.price && (
                      <div className="text-sm text-muted-foreground line-through">
                        ${room.originalPrice}
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button size="sm">
                      <Calendar className="h-4 w-4 mr-1" />
                      Book
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

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
      </div>
    </UserLayout>
  );
};

export default BrowseRooms;
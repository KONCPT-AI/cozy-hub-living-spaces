import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, Wifi, Car, Coffee, Star } from 'lucide-react';

const Spaces = () => {
  const spaces = [
    {
      id: 1,
      name: 'Urban Nest Downtown',
      location: 'Downtown District',
      price: '$800/month',
      rating: 4.8,
      amenities: ['WiFi', 'Parking', 'Common Area', 'Security'],
      image: 'photo-1721322800607-8c38375eef04',
      type: 'Student Preferred',
      occupancy: '2-4 people'
    },
    {
      id: 2,
      name: 'Professional Hub Central',
      location: 'Business District',
      price: '$1200/month',
      rating: 4.9,
      amenities: ['WiFi', 'Parking', 'Gym', 'Coworking'],
      image: 'photo-1649972904349-6e44c42644a7',
      type: 'Professional Preferred',
      occupancy: '1-2 people'
    },
    {
      id: 3,
      name: 'Community Towers',
      location: 'University Area',
      price: '$650/month',
      rating: 4.7,
      amenities: ['WiFi', 'Study Room', 'Events', 'Security'],
      image: 'photo-1488590528505-98d2b5aba04b',
      type: 'Student Preferred',
      occupancy: '3-4 people'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-hero text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl text-foreground font-bold mb-6">
            Explore Our Spaces
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl text-foreground mx-auto opacity-90">
            Find the perfect co-living space that matches your lifestyle and budget.
          </p>
        </div>
      </section>

      {/* Spaces Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {spaces.map((space) => (
              <Card key={space.id} className="overflow-hidden border-0 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
                <div className="relative h-48 bg-gradient-card">
                  <img 
                    src={`https://images.unsplash.com/${space.image}?w=400&h=300&fit=crop`}
                    alt={space.name}
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-4 left-4 bg-secondary text-secondary-foreground">
                    {space.type}
                  </Badge>
                </div>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-semibold">{space.name}</h3>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-secondary fill-current" />
                      <span className="text-sm font-medium">{space.rating}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-muted-foreground mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">{space.location}</span>
                  </div>
                  
                  <div className="flex items-center text-muted-foreground mb-4">
                    <Users className="h-4 w-4 mr-1" />
                    <span className="text-sm">{space.occupancy}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {space.amenities.map((amenity, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-secondary">{space.price}</span>
                    <Button>View Details</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-lg text-muted-foreground mb-6">
              Ready to find your perfect space?
            </p>
            <Button size="lg" className="bg-secondary hover:bg-secondary/90">
              Browse All Spaces
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Spaces;
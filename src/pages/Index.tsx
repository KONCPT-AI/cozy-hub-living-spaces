import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import heroImage from '@/assets/hero-coliving.jpg';
import { Users, Home, Shield, Wifi, Car, Coffee, Calendar, MessageCircle, Star, ArrowRight } from 'lucide-react';
const Index = () => {
  const features = [{
    icon: Home,
    title: 'Fully Furnished',
    description: 'Move in ready rooms with modern furniture and appliances'
  }, {
    icon: Wifi,
    title: 'High-Speed Internet',
    description: 'Reliable fiber internet perfect for work and study'
  }, {
    icon: Shield,
    title: 'Secure & Safe',
    description: '24/7 security with keycard access and CCTV monitoring'
  }, {
    icon: Car,
    title: 'Parking Available',
    description: 'Secure parking spaces for residents'
  }, {
    icon: Coffee,
    title: 'Common Areas',
    description: 'Shared kitchen, lounge, and workspace areas'
  }, {
    icon: Calendar,
    title: 'Community Events',
    description: 'Regular social events and networking opportunities'
  }];
  const testimonials = [{
    name: 'Alex Thompson',
    role: 'Software Engineer',
    content: 'CoLiving made my transition to the city so much easier. The community here is amazing!',
    rating: 5
  }, {
    name: 'Maria Garcia',
    role: 'Graduate Student',
    content: 'Affordable, safe, and great location. Perfect for students like me.',
    rating: 5
  }, {
    name: 'James Wilson',
    role: 'Marketing Manager',
    content: 'The amenities and community events make this place feel like home.',
    rating: 5
  }];
  return <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={heroImage} alt="Modern co-living space" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-primary-foreground">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Your Perfect
            <span className="block text-secondary">CoCo-Living Space</span>
            Awaits
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
            Discover affordable, comfortable, and community-focused living spaces designed for students and working professionals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/spaces">
              <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                Explore Spaces
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="border-primary-foreground hover:bg-primary-foreground text-red-950">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 [background-color:#f3e4c3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose CoCoLiving?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We provide everything you need for a comfortable and connected living experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => <Card key={index} 
            className="bg-[#f3e4c3] border border-border  text-card-foreground shadow-sm shadow-soft hover:shadow-medium transition-all duration-300  rounded-2xl hover:-translate-y-1"> 
                <CardContent className="p-6 text-center ">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-[#d89531]">
                    <feature.icon className="h-8 w-8 " />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Getting started with CoLiving is simple and straightforward.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[{
            step: '01',
            title: 'Sign Up',
            description: 'Create your account and tell us about yourself'
          }, {
            step: '02',
            title: 'Browse Spaces',
            description: 'Explore available rooms that match your preferences'
          }, {
            step: '03',
            title: 'Book & Pay',
            description: 'Reserve your space with a simple booking process'
          }, {
            step: '04',
            title: 'Move In',
            description: 'Welcome to your new community home!'
          }].map((item, index) => <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-primary-foreground">{item.step}</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>)}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-accent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              What Our Residents Say
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Don't just take our word for it - hear from our happy residents.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => <Card key={index} className="bg-background border-0 shadow-soft">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => <Star key={i} className="h-5 w-5 text-secondary fill-current" />)}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#ffffeb] text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Ready to Join Our Community?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-foreground opacity-90">
            Start your co-living journey today and discover a new way to live, work, and connect.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                Get Started Now
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="border-primary-foreground hover:bg-primary-foreground text-zinc-950">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>;
};
export default Index;
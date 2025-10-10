import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, MapPin, Star } from 'lucide-react';

const Community = () => {
  const events = [
    {
      id: 1,
      title: 'Community Game Night',
      date: '2024-01-15',
      time: '7:00 PM',
      location: 'Urban Nest Downtown',
      attendees: 15,
      category: 'Social',
      description: 'Join us for a fun evening of board games and socializing with fellow residents.'
    },
    {
      id: 2,
      title: 'Professional Networking Mixer',
      date: '2024-01-18',
      time: '6:30 PM',
      location: 'Professional Hub Central',
      attendees: 25,
      category: 'Networking',
      description: 'Connect with other professionals and expand your network over drinks and appetizers.'
    },
    {
      id: 3,
      title: 'Study Group Session',
      date: '2024-01-20',
      time: '2:00 PM',
      location: 'Community Towers',
      attendees: 12,
      category: 'Educational',
      description: 'Collaborative study session for students preparing for midterm exams.'
    }
  ];

  const testimonials = [
    {
      name: 'Emma Chen',
      role: 'Software Developer',
      content: 'The community events have helped me make amazing friends and professional connections. I love the networking mixers!',
      rating: 5,
      location: 'Professional Hub Central'
    },
    {
      name: 'Marcus Johnson',
      role: 'Graduate Student',
      content: 'Study groups and social events make this place feel like a real community. It\'s been an incredible experience.',
      rating: 5,
      location: 'Community Towers'
    },
    {
      name: 'Sofia Rodriguez',
      role: 'Marketing Coordinator',
      content: 'I was nervous about co-living, but the community here is so welcoming. Game nights are my favorite!',
      rating: 5,
      location: 'Urban Nest Downtown'
    }
  ];

  const communityFeatures = [
    {
      title: 'Social Events',
      description: 'Regular community gatherings, game nights, and social activities to help you connect with neighbors.',
      icon: Users
    },
    {
      title: 'Professional Networks',
      description: 'Networking events and professional development opportunities with fellow residents.',
      icon: Star
    },
    {
      title: 'Study Groups',
      description: 'Collaborative learning spaces and study sessions for students and learners.',
      icon: Calendar
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-hero text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl text-foreground font-bold mb-6">
            Community Life
          </h1>
          <p className="text-xl md:text-2xl text-foreground mb-8 max-w-3xl mx-auto opacity-90">
            More than just a place to live - join a vibrant community of like-minded individuals.
          </p>
        </div>
      </section>

      {/* Community Features */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              What Makes Our Community Special
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We believe in creating connections that last beyond your stay with us.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {communityFeatures.map((feature, index) => (
              <Card key={index} className="border-0 shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-8 w-8 text-secondary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-16 bg-accent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Upcoming Events
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join us for these exciting community events and activities.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
              <Card key={event.id} className="bg-background border-0 shadow-soft hover:shadow-medium transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <Badge className="bg-secondary text-secondary-foreground">
                      {event.category}
                    </Badge>
                    <div className="flex items-center text-muted-foreground">
                      <Users className="h-4 w-4 mr-1" />
                      <span className="text-sm">{event.attendees}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-3">{event.title}</h3>
                  <p className="text-muted-foreground mb-4">{event.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(event.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2" />
                      {event.time}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      {event.location}
                    </div>
                  </div>
                  
                  <Button className="w-full">Join Event</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Community Testimonials */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Community Stories
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Hear from our residents about their community experiences.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-soft">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-secondary fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    <p className="text-xs text-secondary mt-1">{testimonial.location}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Join Our Community?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Become part of a community that supports your personal and professional growth.
          </p>
          <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground">
            Get Started Today
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Community;
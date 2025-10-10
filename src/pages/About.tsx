import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Target, Heart, Award } from 'lucide-react';

const About = () => {
  const values = [
    {
      icon: Users,
      title: 'Community First',
      description: 'We believe in building meaningful connections and fostering a sense of belonging for everyone.'
    },
    {
      icon: Target,
      title: 'Quality Living',
      description: 'Our spaces are designed with comfort, functionality, and modern amenities in mind.'
    },
    {
      icon: Heart,
      title: 'Inclusive Environment',
      description: 'We welcome students and professionals from all backgrounds to create diverse communities.'
    },
    {
      icon: Award,
      title: 'Excellence in Service',
      description: 'We strive to provide exceptional support and maintenance services to all our residents.'
    }
  ];

  const team = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Founder',
      description: 'Former urban planner with 10+ years of experience in community development.'
    },
    {
      name: 'Michael Chen',
      role: 'Head of Operations',
      description: 'Expert in property management and resident services with a passion for community building.'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Community Manager',
      description: 'Dedicated to creating engaging experiences and fostering connections among residents.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-hero text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl text-foreground font-bold mb-6">
            About CoLiving
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl text-foreground mx-auto opacity-90">
            We're revolutionizing urban living by creating affordable, comfortable, and community-focused spaces for the next generation.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">Our Mission</h2>
              <p className="text-lg text-muted-foreground mb-6">
                At CoLiving, we understand the challenges faced by students and young professionals in finding quality, affordable housing in urban areas. Our mission is to bridge this gap by providing thoughtfully designed co-living spaces that foster community, collaboration, and personal growth.
              </p>
              <p className="text-lg text-muted-foreground mb-8">
                Since our founding in 2020, we've helped over 1,000 residents find their perfect living situation while building lasting friendships and professional networks.
              </p>
              <Button size="lg" className="bg-secondary hover:bg-secondary/90">
                Join Our Community
              </Button>
            </div>
            <div className="space-y-6">
              <div className="bg-gradient-card p-6 rounded-xl shadow-soft">
                <h3 className="text-xl font-semibold mb-2">1000+</h3>
                <p className="text-muted-foreground">Happy Residents</p>
              </div>
              <div className="bg-gradient-card p-6 rounded-xl shadow-soft">
                <h3 className="text-xl font-semibold mb-2">50+</h3>
                <p className="text-muted-foreground">Premium Locations</p>
              </div>
              <div className="bg-gradient-card p-6 rounded-xl shadow-soft">
                <h3 className="text-xl font-semibold mb-2">98%</h3>
                <p className="text-muted-foreground">Satisfaction Rate</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-accent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Our Values</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              These core values guide everything we do and shape the communities we create.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="bg-background border-0 shadow-soft hover:shadow-medium transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-6 w-6 text-secondary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-3">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Meet Our Team</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our passionate team is dedicated to creating the best co-living experience for our residents.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="border-0 shadow-soft hover:shadow-medium transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-20 h-20 bg-gradient-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
                  <p className="text-secondary font-medium mb-3">{member.role}</p>
                  <p className="text-muted-foreground">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
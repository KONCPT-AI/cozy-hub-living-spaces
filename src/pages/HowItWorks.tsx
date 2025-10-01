import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UserPlus, Search, CreditCard, Home, CheckCircle } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: UserPlus,
      title: 'Sign Up',
      description: 'Create your account and complete your profile. Tell us about yourself, your preferences, and what you\'re looking for in a co-living space.',
      details: ['Create account with email or phone', 'Complete KYC verification', 'Set your preferences']
    },
    {
      icon: Search,
      title: 'Browse Spaces',
      description: 'Explore our carefully curated co-living spaces. Filter by location, price, amenities, and community type to find your perfect match.',
      details: ['Filter by your criteria', 'View detailed space information', 'Check availability in real-time']
    },
    {
      icon: CreditCard,
      title: 'Book & Pay',
      description: 'Reserve your space with our secure booking system. Pay your deposit online and schedule your move-in date.',
      details: ['Secure online payment', 'Flexible deposit options', 'Schedule move-in date']
    },
    {
      icon: Home,
      title: 'Move In',
      description: 'Welcome to your new community! Get your keys, meet your housemates, and start enjoying your co-living experience.',
      details: ['Key handover process', 'Community orientation', 'Access to all amenities']
    }
  ];

  const benefits = [
    'No broker fees or hidden costs',
    'Fully furnished spaces ready to move in',
    'Flexible lease terms from 3 months',
    'All utilities and WiFi included',
    'Regular cleaning and maintenance',
    '24/7 community support'
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-hero text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl text-foreground font-bold mb-6">
            How It Works
          </h1>
          <p className="text-xl md:text-2xl text-foreground mb-8 max-w-3xl mx-auto opacity-90">
            Getting started with CoLiving is simple, transparent, and hassle-free.
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {steps.map((step, index) => (
              <div key={index} className={`flex flex-col lg:flex-row items-center gap-12 ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                <div className="flex-1">
                  <div className="flex items-center mb-6">
                    <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mr-4">
                      <step.icon className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-secondary">Step {index + 1}</span>
                      <h3 className="text-2xl font-bold">{step.title}</h3>
                    </div>
                  </div>
                  <p className="text-lg text-muted-foreground mb-6">{step.description}</p>
                  <ul className="space-y-2">
                    {step.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-secondary mr-2" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex-1">
                  <Card className="border-0 shadow-soft">
                    <CardContent className="p-8">
                      <div className="w-full h-64 bg-gradient-card rounded-lg flex items-center justify-center">
                        <step.icon className="h-24 w-24 text-secondary/20" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-accent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Why Choose Our Process?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We've streamlined the co-living experience to make it as smooth as possible.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center bg-background p-4 rounded-lg shadow-soft">
                <CheckCircle className="h-6 w-6 text-secondary mr-3 flex-shrink-0" />
                <span className="font-medium">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join hundreds of students and professionals who have found their perfect co-living space with us.
          </p>
          <Button size="lg" className="bg-secondary hover:bg-secondary/90">
            Start Your Journey
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HowItWorks;
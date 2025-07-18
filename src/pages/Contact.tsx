import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Phone, Mail, MapPin, Clock, MessageSquare, Send } from 'lucide-react';

const Contact = () => {
  const contactInfo = [
    {
      icon: Phone,
      title: 'Phone',
      details: '+1 (555) 123-4567',
      description: 'Call us Monday to Friday, 9AM-6PM'
    },
    {
      icon: Mail,
      title: 'Email',
      details: 'hello@coliving.com',
      description: 'We reply within 24 hours'
    },
    {
      icon: MapPin,
      title: 'Office',
      details: '123 Living Street, City, State 12345',
      description: 'Visit us for in-person consultations'
    },
    {
      icon: Clock,
      title: 'Hours',
      details: 'Mon-Fri: 9AM-6PM, Sat: 10AM-4PM',
      description: 'Available for support and tours'
    }
  ];

  const faqs = [
    {
      question: 'How long are the lease terms?',
      answer: 'We offer flexible lease terms starting from 3 months up to 12 months.'
    },
    {
      question: 'What is included in the rent?',
      answer: 'Rent includes utilities, WiFi, cleaning services, and access to all common areas.'
    },
    {
      question: 'Can I visit the space before booking?',
      answer: 'Yes! We encourage tours. Contact us to schedule a visit at your convenience.'
    },
    {
      question: 'What is the application process?',
      answer: 'Complete our online application, submit required documents, and schedule a quick interview.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-hero text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Contact Us
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
            Have questions? We're here to help you find your perfect co-living space.
          </p>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {contactInfo.map((info, index) => (
              <Card key={index} className="border-0 shadow-soft hover:shadow-medium transition-shadow text-center">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <info.icon className="h-8 w-8 text-secondary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{info.title}</h3>
                  <p className="font-medium mb-2">{info.details}</p>
                  <p className="text-sm text-muted-foreground">{info.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-16 bg-accent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="bg-background border-0 shadow-soft">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <MessageSquare className="h-6 w-6 text-secondary mr-2" />
                  <h2 className="text-2xl font-bold">Send us a Message</h2>
                </div>
                
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">First Name</label>
                      <Input placeholder="John" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Last Name</label>
                      <Input placeholder="Doe" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <Input type="email" placeholder="john@example.com" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone</label>
                    <Input type="tel" placeholder="+1 (555) 123-4567" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Subject</label>
                    <Input placeholder="Inquiry about co-living spaces" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Message</label>
                    <Textarea 
                      placeholder="Tell us about your requirements and any questions you have..."
                      rows={6}
                    />
                  </div>
                  
                  <Button className="w-full bg-secondary hover:bg-secondary/90">
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Map & Location Info */}
            <div className="space-y-8">
              <Card className="bg-background border-0 shadow-soft">
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold mb-4">Visit Our Office</h3>
                  <div className="aspect-video bg-gradient-card rounded-lg mb-4 flex items-center justify-center">
                    <MapPin className="h-12 w-12 text-secondary/50" />
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium">CoLiving Headquarters</p>
                    <p className="text-muted-foreground">123 Living Street</p>
                    <p className="text-muted-foreground">City, State 12345</p>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    Get Directions
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-background border-0 shadow-soft">
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold mb-4">Office Hours</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Monday - Friday</span>
                      <span className="font-medium">9:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saturday</span>
                      <span className="font-medium">10:00 AM - 4:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sunday</span>
                      <span className="font-medium">Closed</span>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-accent rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Note:</strong> We also offer virtual tours and consultations outside regular hours. Contact us to schedule.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Quick answers to common questions about our co-living spaces.
            </p>
          </div>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="border-0 shadow-soft">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-3">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              Don't see your question? We're here to help!
            </p>
            <Button className="bg-secondary hover:bg-secondary/90">
              Contact Support
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
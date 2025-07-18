import UserLayout from '@/components/UserLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Ticket, MessageSquare, Phone, Mail } from 'lucide-react';

const Support = () => {
  const tickets = [
    { id: 1, title: 'WiFi Connection Issues', status: 'open', date: '2024-01-10' },
    { id: 2, title: 'Heating not working', status: 'in-progress', date: '2024-01-08' },
    { id: 3, title: 'Key card replacement', status: 'resolved', date: '2024-01-05' }
  ];

  return (
    <UserLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Support Center</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <Card className="border-0 shadow-soft mb-6">
              <CardHeader>
                <CardTitle>My Support Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tickets.map((ticket) => (
                    <div key={ticket.id} className="flex justify-between items-center p-4 bg-accent rounded-lg">
                      <div>
                        <p className="font-medium">{ticket.title}</p>
                        <p className="text-sm text-muted-foreground">{ticket.date}</p>
                      </div>
                      <Badge variant={ticket.status === 'resolved' ? 'default' : 'secondary'}>
                        {ticket.status}
                      </Badge>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4">
                  <Ticket className="h-4 w-4 mr-2" />
                  Create New Ticket
                </Button>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="border-0 shadow-soft">
              <CardHeader>
                <CardTitle>Contact Support</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Live Chat
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Support
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default Support;
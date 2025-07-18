import UserLayout from '@/components/UserLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Calendar, Download, CheckCircle } from 'lucide-react';

const Payments = () => {
  const payments = [
    { id: 1, date: '2024-01-01', amount: 850, status: 'paid', type: 'Monthly Rent' },
    { id: 2, date: '2023-12-01', amount: 850, status: 'paid', type: 'Monthly Rent' },
    { id: 3, date: '2023-12-01', amount: 500, status: 'paid', type: 'Security Deposit' }
  ];

  return (
    <UserLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Payments & Invoices</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-soft">
            <CardContent className="p-6 text-center">
              <CreditCard className="h-8 w-8 text-secondary mx-auto mb-2" />
              <p className="text-2xl font-bold">$850</p>
              <p className="text-sm text-muted-foreground">Next Payment Due</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-soft">
            <CardContent className="p-6 text-center">
              <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">Feb 1</p>
              <p className="text-sm text-muted-foreground">Due Date</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-soft">
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">$2,200</p>
              <p className="text-sm text-muted-foreground">Total Paid</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-soft">
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {payments.map((payment) => (
                <div key={payment.id} className="flex justify-between items-center p-4 bg-accent rounded-lg">
                  <div>
                    <p className="font-medium">{payment.type}</p>
                    <p className="text-sm text-muted-foreground">{payment.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${payment.amount}</p>
                    <Badge variant="default" className="bg-green-500">Paid</Badge>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Invoice
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </UserLayout>
  );
};

export default Payments;
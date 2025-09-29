import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CreditCard, Download, Eye, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/AdminLayout';

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [paymentsRes, profilesRes] = await Promise.all([
        supabase.from('payments').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*')
      ]);

      if (paymentsRes.error) throw paymentsRes.error;
      if (profilesRes.error) throw profilesRes.error;

      setPayments(paymentsRes.data || []);
      setProfiles(profilesRes.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch payment data',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const getUserName = (userId) => {
    const profile = profiles.find(p => p.user_id === userId);
    return profile?.full_name || profile?.email || 'Unknown User';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'default';
      case 'pending': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'secondary';
    }
  };

  const getTotalRevenue = () => {
    return payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
  };

  const getMonthlyRevenue = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return payments
      .filter(p => {
        const paymentDate = new Date(p.payment_date);
        return paymentDate.getMonth() === currentMonth && 
               paymentDate.getFullYear() === currentYear &&
               p.status === 'completed';
      })
      .reduce((sum, p) => sum + p.amount, 0);
  };

  const generateInvoice = (payment) => {
    // This would typically generate a PDF invoice
    toast({
      title: 'Invoice Generated',
      description: `Invoice for payment ${payment.id} generated successfully`,
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <CreditCard className="h-8 w-8" />
            Payment Management
          </h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm font-medium text-muted-foreground">Total Revenue</div>
              <div className="text-2xl font-bold">₹{getTotalRevenue().toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm font-medium text-muted-foreground">This Month</div>
              <div className="text-2xl font-bold">₹{getMonthlyRevenue().toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm font-medium text-muted-foreground">Total Payments</div>
              <div className="text-2xl font-bold">{payments.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm font-medium text-muted-foreground">Pending</div>
              <div className="text-2xl font-bold">{payments.filter(p => p.status === 'pending').length}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{getUserName(payment.user_id)}</TableCell>
                    <TableCell>₹{payment.amount.toLocaleString()}</TableCell>
                    <TableCell className="capitalize">{payment.payment_type}</TableCell>
                    <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                    <TableCell className="capitalize">{payment.payment_method || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(payment.status)}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="space-x-2">
                      <Dialog open={isDialogOpen && selectedPayment?.id === payment.id} onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (!open) setSelectedPayment(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedPayment(payment)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Payment Details</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <div className="text-sm font-medium">User</div>
                                <div className="text-sm text-muted-foreground">{getUserName(payment.user_id)}</div>
                              </div>
                              <div>
                                <div className="text-sm font-medium">Amount</div>
                                <div className="text-sm text-muted-foreground">₹{payment.amount.toLocaleString()}</div>
                              </div>
                              <div>
                                <div className="text-sm font-medium">Type</div>
                                <div className="text-sm text-muted-foreground capitalize">{payment.payment_type}</div>
                              </div>
                              <div>
                                <div className="text-sm font-medium">Method</div>
                                <div className="text-sm text-muted-foreground capitalize">{payment.payment_method || 'N/A'}</div>
                              </div>
                              <div>
                                <div className="text-sm font-medium">Payment Date</div>
                                <div className="text-sm text-muted-foreground">{new Date(payment.payment_date).toLocaleDateString()}</div>
                              </div>
                              <div>
                                <div className="text-sm font-medium">Status</div>
                                <div className="text-sm text-muted-foreground capitalize">{payment.status}</div>
                              </div>
                            </div>
                            {payment.transaction_id && (
                              <div>
                                <div className="text-sm font-medium">Transaction ID</div>
                                <div className="text-sm text-muted-foreground">{payment.transaction_id}</div>
                              </div>
                            )}
                            {payment.notes && (
                              <div>
                                <div className="text-sm font-medium">Notes</div>
                                <div className="text-sm text-muted-foreground">{payment.notes}</div>
                              </div>
                            )}
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => generateInvoice(payment)}
                                className="flex-1"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Generate Invoice
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default PaymentManagement;
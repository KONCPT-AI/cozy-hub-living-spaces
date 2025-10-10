import UserLayout from '@/components/UserLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Ticket, MessageSquare, Phone, Mail } from 'lucide-react';
import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Ticket {
  id: number;
  roomNumber: string;
  date: string;
  issue: string;
  description?: string;
  priority?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}
const Support = () => {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const { user } = useAuth()
  const token = user?.token;
  const [errors, setErrors] = useState<any>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeRooms, setActiveRooms] = useState<{ id: number; roomNumber: string; propertyName: string }[]>([]);
  const [formData, setFormData] = useState({
    roomNumber: "",
    date: new Date().toISOString().split("T")[0],
    issue: "",
    description: "",
    priority: "low"
  });

  useEffect(() => {
    fetchTickets();
    fetchActiveRooms();
  }, [])

  const fetchActiveRooms = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/tickets/getroom`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setActiveRooms(res.data.rooms || []);
    } catch (error: any) {
      console.error("Error fetching active rooms:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch rooms",
        variant: "destructive",
      });
    }
  };

  const fetchTickets = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/tickets/get-user-tickets`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setTickets(res.data.tickets || [])
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch tickets",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  const validateField = (field: string, value: string, data: typeof formData) => {
    let message = "";

    if (field === "roomNumber") {
      if (!value) {
        message = "Room number is required";
      }
    }

    if (field === "issue") {
      if (!value.trim()) {
        message = "issue is required";
      } else if (!/^[a-zA-Z0-9\s,.'-]{2,100}$/.test(value.trim())) {
        message = "issue must be 2 to 100 characters long";
      }
    }

    if (field === "description") {
      const desc = value ? String(value).trim() : "";
      if (desc !== "" && (desc.length < 10 || desc.length > 500)) {
        message = "Description must be 10 to 500 characters long";
      }
    }

    return message;
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    Object.keys(formData).forEach((field) => {
      const message = validateField(field, (formData as any)[field], formData);
      if (message) newErrors[field] = message;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    const updatedData = { ...formData, [field]: value };
    setFormData(updatedData);

    const message = validateField(field, value, updatedData);
    setErrors((prev) => ({
      ...prev,
      [field]: message
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const ticketData = {
        roomNumber: formData.roomNumber,
        date: formData.date,
        issue: formData.issue,
        description: formData.description,
        priority: formData.priority,
      };

      const res = await axios.post(
        `${API_BASE_URL}/api/tickets/create`,
        ticketData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({ title: "Success", description: "Ticket created successfully" });
      setIsDialogOpen(false);
      resetForm();
      fetchTickets();
    } catch (error: any) {
      console.error("Error saving Ticket:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save Ticket",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  const resetForm = () => {
    setFormData({
      roomNumber: "",
      date: new Date().toISOString().split("T")[0],
      issue: "",
      description: "",
      priority: "low"
    });
    setErrors({});
  };


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
                        <p className="font-medium">{ticket.issue}</p>
                        <p className="text-sm text-muted-foreground">{ticket.date}</p>
                      </div>

                      <Badge variant={ticket.status === 'open' ? 'default' : 'secondary'}>
                        {ticket.status}
                      </Badge>
                    </div>
                  ))}
                  {tickets.length === 0 && !isLoading && <p>No tickets found.</p>}
                </div>

                {/* Create Ticket Button */}
                <Button className="w-full mt-4" onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                  <Ticket className="h-4 w-4 mr-2" />
                  Create New Ticket
                </Button>

                {/* create new ticket button + dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Create New Ticket</DialogTitle>
                      <DialogDescription>Fill in the details below to submit a support ticket</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className='space-y-4'>
                      <div>
                        <Select
                          value={formData.roomNumber}
                          onValueChange={(val) => handleInputChange("roomNumber", val)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Room Number" />
                          </SelectTrigger>
                          <SelectContent>
                            {activeRooms.map((room) => (
                              <SelectItem  key={`${room.id}-${room.roomNumber}`} value={String(room.roomNumber)}>
                                {room.roomNumber} - {room.propertyName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.roomNumber && <p className="text-red-500 text-sm">{errors.roomNumber}</p>}
                      </div>
                      <div>
                        <Label>Date</Label>
                        <Input
                          type="date"
                          value={formData.date}
                          onChange={(e) => handleInputChange("date", e.target.value)}
                          disabled
                        />
                      </div>
                      <div>
                        <Label>Issue</Label>
                        <Input
                          value={formData.issue}
                          onChange={(e) => handleInputChange("issue", e.target.value)}
                          placeholder="Enter the issue"
                        />
                        {errors.issue && <p className="text-red-500 text-sm">{errors.issue}</p>}
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={formData.description}
                          onChange={(e) => handleInputChange("description", e.target.value)}
                          placeholder="Provide more details"
                        />
                        {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
                      </div>

                      <div>
                        <Label>Priority</Label>
                        <Select
                          value={formData.priority}
                          onValueChange={(val) => handleInputChange("priority", val)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.priority && <p className="text-red-500 text-sm">{errors.priority}</p>}
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? "Saving..." : "Submit Ticket"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
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
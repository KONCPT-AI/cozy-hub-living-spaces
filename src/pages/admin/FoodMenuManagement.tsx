import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, Plus } from "lucide-react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";


interface FoodMenu {
  id: number;
  date: string;
  lunch_items: string[]; // Stored as a comma-separated string in the form,
  dinner_items: string[]; // or an array if the backend handles JSON/Array correctly.
  createdAt: string;
}

const isAdminUser = (user: any): user is { properties: number[]; role: string } => {
  return user && (user.role === 'admin' || user.role === 'super-admin');
};

const FoodMenuManagement = () => {
  const [menus, setMenus] = useState<FoodMenu[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<FoodMenu | null>(null);
  const [formData, setFormData] = useState({
    date: "",
    lunch_items: "",
    dinner_items: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();
  const { user, hasPermission } = useAuth();
  const token = user?.token;

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/food-menu/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMenus(response.data.menus || []);
    } catch (error) {
      console.error("Error fetching menus:", error);
      toast({
        title: "Error",
        description: "Failed to fetch food menus",
        variant: "destructive",
      });
    }
  };

  const validateField = (field: string, value: string, data: typeof formData) => {
    let message = "";

    if (field === "date") {
      if (!value) message = "Date is required";
      else {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // normalize to start of day
        const selected = new Date(value);
        selected.setHours(0, 0, 0, 0);

        if (selected < today) {
          message = "Date cannot be in the past";
        }
      }
    }

    if (field === "lunch_items") {
      const lunch = value.trim();
      const dinner = data.dinner_items?.trim();
      if (!lunch && !dinner) {
        message = "At least one (Lunch or Dinner) must be filled";
      } else if (lunch && lunch.split(",").filter(i => i.trim()).length === 0) {
        message = "Enter at least one valid lunch item";
      }
    }

    if (field === "dinner_items") {
      const dinner = value.trim();
      const lunch = data.lunch_items?.trim();
      if (!lunch && !dinner) {
        message = "At least one (Lunch or Dinner) must be filled";
      } else if (dinner && dinner.split(",").filter(i => i.trim()).length === 0) {
        message = "Enter at least one valid dinner item";
      }
    }

    return message;
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    Object.keys(formData).forEach((field) => {
      const msg = validateField(field, (formData as any)[field], formData);
      if (msg) newErrors[field] = msg;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    let newErrors = { ...errors };

    newErrors[field] = validateField(field, value, updated)

    if (field === "lunch_items" || field === "dinner_items") {
      newErrors["lunch_items"] = validateField("lunch_items", updated.lunch_items, updated);
      newErrors["dinner_items"] = validateField("dinner_items", updated.dinner_items, updated);
    }
    setErrors(newErrors);
  };

  const resetForm = () => {
    setFormData({ date: "", lunch_items: "", dinner_items: "" });
    setSelectedMenu(null);
    setErrors({});
  };

  //to convert comma sepated strings to array
  const formatItemsForPayload = (itemsString: string): string[] => {
    return itemsString.split(",").map((i) => i.trim()).filter((i) => i);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const { date, lunch_items, dinner_items } = formData;

    const payload = {
      date,
      lunch_items: formatItemsForPayload(lunch_items),
      dinner_items: formatItemsForPayload(dinner_items),
    };

    try {
      if (selectedMenu) {
        await axios.put(`${API_BASE_URL}/api/food-menu/edit/${selectedMenu.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast({ title: "Success", description: "Menu updated successfully" });
      } else {
        await axios.post(`${API_BASE_URL}/api/food-menu/add`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast({ title: "Success", description: "Menu added successfully" });
      }
      fetchMenus();
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save menu",
        variant: "destructive",
      });
    }
  };

  const editMenu = (menu: FoodMenu) => {
    setSelectedMenu(menu);

    setFormData({
      date: menu.date,
      lunch_items: menu.lunch_items.join(", "),
      dinner_items: menu.dinner_items.join(", "),
    });
    setIsDialogOpen(true);
  };

  const deleteMenu = async (menuId: number) => {
    if (!window.confirm("Are you sure you want to delete this menu?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/food-menu/delete/${menuId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({ title: "Deleted", description: "Menu deleted successfully" });
      fetchMenus();
    } catch (error) {
      console.error("Error deleting menu:", error);
      toast({
        title: "Error",
        description: "Failed to delete menu",
        variant: "destructive",
      });
    }
  };
  // Helper to safely display items from the backend
  const displayItems = (items: string[]): string => {
    // Handle the case where the array might be empty
    return items && items.length > 0 ? items.join(", ") : 'N/A';
  };


  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Food Menu Management</h1>
            <p className="text-muted-foreground">
              Manage the combined lunch and dinner menus for today and tomorrow.
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              {hasPermission("FoodMenu Management", "write") && (
                <Button onClick={() => resetForm()}>
                  <Plus className="mr-2 h-4 w-4" /> Add Daily Menu
                </Button>
              )}
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>
                  {selectedMenu ? "Edit Daily Menu" : "Add New Daily Menu"}
                </DialogTitle>
                <DialogDescription>
                  Enter lunch and dinner details for today or tomorrow’s date.
                </DialogDescription>
              </DialogHeader>

              {/* 7. UPDATED FORM UI */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="menu-date">Date</Label>
                  <Input
                    id="menu-date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    // Disable date field when editing, as the backend enforces one entry per date
                    disabled={!!selectedMenu}
                  />
                  {errors.date && (
                    <p className="text-red-500 text-sm mt-1">{errors.date}</p>
                  )}
                </div>

                {/* Replaced Select with a dedicated Lunch Textarea */}
                <div>
                  <Label htmlFor="lunch-items">Lunch Menu Items (comma-separated)</Label>
                  <Textarea
                    id="lunch-items"
                    placeholder="e.g., Rice, Dal, Paneer Curry, Salad"
                    value={formData.lunch_items}
                    onChange={(e) => handleInputChange("lunch_items", e.target.value)}
                    rows={3}
                  />
                  {errors.lunch_items && (
                    <p className="text-red-500 text-sm mt-1">{errors.lunch_items}</p>
                  )}
                </div>

                {/* Added a dedicated Dinner Textarea */}
                <div>
                  <Label htmlFor="dinner-items">Dinner Menu Items (comma-separated)</Label>
                  <Textarea
                    id="dinner-items"
                    placeholder="e.g., Roti, Veg Biryani, Curd, Sweet"
                    value={formData.dinner_items}
                    onChange={(e) => handleInputChange("dinner_items", e.target.value)}
                    rows={3}
                  />
                  {errors.dinner_items && (<p className="text-red-500 text-sm mt-1">
                    {errors.dinner_items} </p>)}
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {selectedMenu ? "Update Menu" : "Add Menu"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Menu Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Menus</CardTitle>
            <CardDescription>
              {menus.length} daily menu entries available
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasPermission("FoodMenu Management", "read") ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead >Date</TableHead>
                    <TableHead >Lunch Items</TableHead>
                    <TableHead >Dinner Items</TableHead>
                    <TableHead >Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {menus.map((menu) => (
                    <TableRow key={menu.id}>
                      <TableCell>
                        {new Date(menu.date).toLocaleDateString("en-IN")}
                      </TableCell>
                      <TableCell>{displayItems(menu.lunch_items)}</TableCell>
                      <TableCell>{displayItems(menu.dinner_items)}</TableCell>
                      <TableCell >
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => editMenu(menu)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteMenu(menu.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-red-500 font-bold p-4">
                Access Denied: You cannot view menus.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default FoodMenuManagement;

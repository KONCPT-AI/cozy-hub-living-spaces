import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"; 
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, MapPin, Home } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Property {
  createdAt: string;
  id: string;
  name: string;
  address: string;
  description: string;
  images?: (File | string)[];
  removedImages?: string[];
  amenities: string[];
  is_active: boolean;
}

const PropertyManagement = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    description: "",
    images: [],
    removedImages: [],
    amenities: "",
    is_active: true,
  }); 
  const { toast } = useToast();
  const [errors, setErrors] = useState<any>({});
  const { user } = useAuth();  
  const token = user?.token;   

  useEffect(() => {
    fetchProperties();
  }, []);

   const validateField = (field: string, value: string, data: typeof formData) => {
    let message = "";

    if (field === "name") {
      if (!value.trim()) {
        message = "Name is required";
      } else if (!/^[a-zA-Z ]{2,50}$/.test(value.trim())) {
        message = "Name must be 2 to 50 alphabetic characters";
      }
    }

    if (field === "address") {
      if (!value.trim()) {
        message = "Address is required";
      } else if (!/^[a-zA-Z0-9\s,.'-]{2,100}$/.test(value.trim())) {
        message = "Address must be 2 to 100 characters long";
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

  const fetchProperties = async () => {
     try {
      const response = await axios.get(`${API_BASE_URL}/api/property/getAll`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      //convert aminities to an array
      const data = response.data.map((p: any) => ({
        ...p,
        amenities: typeof p.amenities === "string"
          ? p.amenities.split(",").map((a: string) => a.trim())
          : p.amenities,
      }));
      setProperties(data);
    } catch (error) {
      console.error("Error fetching properties:", error);
      toast({
        title: "Error",
        description: "Failed to fetch properties",
        variant: "destructive",
      });
    }
   
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
     if (!validateForm()){
       setIsLoading(false);
       return;
    }

    try {
      const dataToSend = new FormData();
        dataToSend.append("name", formData.name.trim());
        dataToSend.append("address", formData.address);
        dataToSend.append("description", formData.description);
        dataToSend.append("amenities", formData.amenities);
        dataToSend.append("is_active", String(formData.is_active));
        
      //append images
      formData.images?.forEach((img)=>{
        if(img instanceof File) dataToSend.append("propertyImages",img);
      })

      //removed images (old URLs to delete)
      formData.removedImages?.forEach((imgUrl)=>{
        dataToSend.append("removedImages",imgUrl);
      })

      if (selectedProperty) {
        await axios.put(
          `${API_BASE_URL}/api/property/edit/${selectedProperty.id}`,
          dataToSend,
          { headers: { Authorization: `Bearer ${token}`,"Content-Type": "multipart/form-data" } }
        );
        toast({ title: "Success", description: "Property updated successfully" });
      } else {
        await axios.post(
          `${API_BASE_URL}/api/property/add`,
          dataToSend,
          { headers: { Authorization: `Bearer ${token}`,"Content-Type": "multipart/form-data" } }
        );
        toast({ title: "Success", description: "Property created successfully" });
      }

      resetForm();
      setIsDialogOpen(false);
      fetchProperties();
            
    } catch (error:any) {
      if (error.response?.data?.errors) {
        const backendErrors: any = {};
        error.response.data.errors.forEach((e: any) => {
          backendErrors[e.path] = e.msg;
        }); 
      setErrors(backendErrors);
      toast({
        title: "Error",
        description: error.response.data.errors[0].msg,
        variant: "destructive",
      });}else {
      toast({
        title: "Error",
        description: "Failed to save property",
        variant: "destructive",
      });}
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      description: "",
      images: [],
      removedImages: [],
      amenities: "",
      is_active: true,
    });
    setSelectedProperty(null);
    setErrors({});
  };

  const editProperty = (property: Property) => {
    setSelectedProperty(property);
    setFormData({
      name: property.name,
      address: property.address,
      description: property.description,
      images: property.images || [],
      amenities: property.amenities?.join(", ") || "",
      is_active: property.is_active,
      removedImages: []
    });
    
    setIsDialogOpen(true);
    setErrors({});
  };

  const deleteProperty = async (propertyId: string) => {
    if (!window.confirm("Are you sure you want to delete this property?")) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/api/property/delete/${propertyId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast({title: "Success",description: "Property deleted successfully",});

      fetchProperties();
    } catch (error) {
      console.error("Error deleting property:", error);
      const message =     error.response?.data?.message ||      "Failed to delete property";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Property Management</h1>
            <p className="text-muted-foreground">Manage all properties in the system</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Add Property
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {selectedProperty ? "Edit Property" : "Add New Property"}
                </DialogTitle>
                <DialogDescription>
                  {selectedProperty 
                    ? "Update the property details below" 
                    : "Fill in the details to create a new property"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Property Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Enter property name"
                    />
                    {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      placeholder="Enter property address"
                    />
                    {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Enter property description"
                    rows={3}
                  />
                  {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
                </div>
                {/* Images */}
                    <div>
                      <Label>Room Images</Label>
                      <Input type="file" multiple accept="image/*" onChange={(e) => {
                        if(e.target.files) {
                          setFormData({ ...formData, images: [...(formData.images || []), ...Array.from(e.target.files)] });
                        }
                      }} />
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {/* image preview */}
                        {formData.images?.map((img, idx) => {
                          const src = img instanceof File ? URL.createObjectURL(img) :  `${API_BASE_URL}/${img.replace(/^\//, "")}`;;
                          return (
                            <div key={idx} className="relative">
                              <img src={src} className="w-20 h-20 object-cover rounded" alt=""/>

                              <button type="button" className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                                onClick={() =>{
                                    const removed = formData.images![idx];
                                    setFormData({ 
                                      ...formData,
                                      images: formData.images!.filter((_, i) => i !== idx) ,
                                      removedImages: [
                                        ...(formData.removedImages || []),
                                        ...(removed instanceof File ? [] : [removed]) // sirf old string URLs ko bhejna hai
                                      ]
                                      })}
                                } 
                                  
                              >✕</button>
                            </div>
                          );
                        })}
                      </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amenities">Amenities</Label>
                  <Textarea
                    id="amenities"
                    value={formData.amenities}
                    onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                    placeholder="WiFi, Parking, Gym, etc."
                    rows={2}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Active Property</Label>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => {resetForm();setIsLoading(false);setIsDialogOpen(false)}}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : selectedProperty ? "Update Property" : "Create Property"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Properties</CardTitle>
            <CardDescription>
              {properties.length} properties in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Amenities</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {properties.map((property) => (
                  <TableRow key={property.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Home className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{property.name}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{property.address || "No address"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {property.amenities?.slice(0, 3).map((amenity, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                        {property.amenities?.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{property.amenities.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={property.is_active ? "default" : "secondary"}>
                        {property.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(property.createdAt).toLocaleDateString("en-IN")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => editProperty(property)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteProperty(property.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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

export default PropertyManagement;
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, MapPin, Home } from "lucide-react";

interface Property {
  id: string;
  name: string;
  address: string;
  description: string;
  images: string[];
  amenities: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
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
    images: "",
    amenities: "",
    is_active: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProperties(data || []);
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
    setIsLoading(true);

    try {
      const propertyData = {
        name: formData.name,
        address: formData.address,
        description: formData.description,
        images: formData.images ? formData.images.split(",").map(img => img.trim()) : [],
        amenities: formData.amenities ? formData.amenities.split(",").map(amenity => amenity.trim()) : [],
        is_active: formData.is_active,
      };

      if (selectedProperty) {
        const { error } = await supabase
          .from("properties")
          .update(propertyData)
          .eq("id", selectedProperty.id);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Property updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("properties")
          .insert([propertyData]);

        if (error) throw error;
        toast({
          title: "Success",
          description: "Property created successfully",
        });
      }

      resetForm();
      setIsDialogOpen(false);
      fetchProperties();
    } catch (error) {
      console.error("Error saving property:", error);
      toast({
        title: "Error",
        description: "Failed to save property",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      description: "",
      images: "",
      amenities: "",
      is_active: true,
    });
    setSelectedProperty(null);
  };

  const editProperty = (property: Property) => {
    setSelectedProperty(property);
    setFormData({
      name: property.name,
      address: property.address,
      description: property.description,
      images: property.images?.join(", ") || "",
      amenities: property.amenities?.join(", ") || "",
      is_active: property.is_active,
    });
    setIsDialogOpen(true);
  };

  const deleteProperty = async (propertyId: string) => {
    if (!window.confirm("Are you sure you want to delete this property?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("properties")
        .delete()
        .eq("id", propertyId);

      if (error) throw error;
      toast({
        title: "Success",
        description: "Property deleted successfully",
      });
      fetchProperties();
    } catch (error) {
      console.error("Error deleting property:", error);
      toast({
        title: "Error",
        description: "Failed to delete property",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
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
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter property name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Enter property address"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter property description"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="images">Images (comma-separated URLs)</Label>
                  <Textarea
                    id="images"
                    value={formData.images}
                    onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                    placeholder="Enter image URLs separated by commas"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amenities">Amenities (comma-separated)</Label>
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
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
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
                      {new Date(property.created_at).toLocaleDateString()}
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
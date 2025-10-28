import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Plus, Copy, Trash2, Upload, X } from 'lucide-react';
import { format } from 'date-fns';
import AdminLayout from '@/components/AdminLayout';

interface Property {
  id: string;
  name: string;
}

interface FoodMenu {
  id: string;
  property_id: string;
  menu_date: string;
  breakfast: string | null;
  lunch: string | null;
  dinner: string | null;
  breakfast_image: string | null;
  lunch_image: string | null;
  dinner_image: string | null;
  status: 'draft' | 'published';
  properties?: { name: string };
}

const FoodManagement = () => {
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [menus, setMenus] = useState<FoodMenu[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    property_id: '',
    menu_date: format(new Date(), 'yyyy-MM-dd'),
    breakfast: '',
    lunch: '',
    dinner: '',
    breakfast_image: null as File | null,
    lunch_image: null as File | null,
    dinner_image: null as File | null,
    status: 'draft' as 'draft' | 'published'
  });

  useEffect(() => {
    fetchProperties();
    fetchMenus();
  }, []);

  const fetchProperties = async () => {
    const { data, error } = await supabase
      .from('properties')
      .select('id, name')
      .eq('is_active', true);

    if (error) {
      toast({ title: 'Error fetching properties', variant: 'destructive' });
    } else {
      setProperties(data || []);
    }
  };

  const fetchMenus = async () => {
    const { data, error } = await supabase
      .from('food_menus')
      .select('*, properties(name)')
      .order('menu_date', { ascending: false });

    if (error) {
      toast({ title: 'Error fetching menus', variant: 'destructive' });
    } else {
      setMenus((data || []) as FoodMenu[]);
    }
  };

  const uploadImage = async (file: File, mealType: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${mealType}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('food-menu-images')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('food-menu-images')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.property_id || !formData.menu_date) {
      toast({ title: 'Please select property and date', variant: 'destructive' });
      return;
    }

    setIsLoading(true);

    try {
      let breakfastImageUrl = null;
      let lunchImageUrl = null;
      let dinnerImageUrl = null;

      if (formData.breakfast_image) {
        breakfastImageUrl = await uploadImage(formData.breakfast_image, 'breakfast');
      }
      if (formData.lunch_image) {
        lunchImageUrl = await uploadImage(formData.lunch_image, 'lunch');
      }
      if (formData.dinner_image) {
        dinnerImageUrl = await uploadImage(formData.dinner_image, 'dinner');
      }

      const menuData = {
        property_id: formData.property_id,
        menu_date: formData.menu_date,
        breakfast: formData.breakfast || null,
        lunch: formData.lunch || null,
        dinner: formData.dinner || null,
        breakfast_image: breakfastImageUrl,
        lunch_image: lunchImageUrl,
        dinner_image: dinnerImageUrl,
        status: formData.status
      };

      if (editingId) {
        const { error } = await supabase
          .from('food_menus')
          .update(menuData)
          .eq('id', editingId);

        if (error) throw error;
        toast({ title: 'Menu updated successfully' });
      } else {
        const { error } = await supabase
          .from('food_menus')
          .insert(menuData);

        if (error) throw error;
        toast({ title: 'Menu created successfully' });
      }

      resetForm();
      fetchMenus();
    } catch (error: any) {
      toast({ title: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (menu: FoodMenu) => {
    setFormData({
      property_id: menu.property_id,
      menu_date: menu.menu_date,
      breakfast: menu.breakfast || '',
      lunch: menu.lunch || '',
      dinner: menu.dinner || '',
      breakfast_image: null,
      lunch_image: null,
      dinner_image: null,
      status: menu.status
    });
    setEditingId(menu.id);
  };

  const handleDuplicate = (menu: FoodMenu) => {
    setFormData({
      property_id: menu.property_id,
      menu_date: format(new Date(), 'yyyy-MM-dd'),
      breakfast: menu.breakfast || '',
      lunch: menu.lunch || '',
      dinner: menu.dinner || '',
      breakfast_image: null,
      lunch_image: null,
      dinner_image: null,
      status: 'draft'
    });
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu?')) return;

    const { error } = await supabase
      .from('food_menus')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Error deleting menu', variant: 'destructive' });
    } else {
      toast({ title: 'Menu deleted successfully' });
      fetchMenus();
    }
  };

  const resetForm = () => {
    setFormData({
      property_id: '',
      menu_date: format(new Date(), 'yyyy-MM-dd'),
      breakfast: '',
      lunch: '',
      dinner: '',
      breakfast_image: null,
      lunch_image: null,
      dinner_image: null,
      status: 'draft'
    });
    setEditingId(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, mealType: 'breakfast' | 'lunch' | 'dinner') => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, [`${mealType}_image`]: file }));
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Food Menu Management</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Menu' : 'Add New Menu'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Property</label>
                  <Select value={formData.property_id} onValueChange={(value) => setFormData(prev => ({ ...prev, property_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select property" />
                    </SelectTrigger>
                    <SelectContent>
                      {properties.map(property => (
                        <SelectItem key={property.id} value={property.id}>
                          {property.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Date</label>
                  <Input
                    type="date"
                    value={formData.menu_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, menu_date: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Breakfast</label>
                  <Textarea
                    value={formData.breakfast}
                    onChange={(e) => setFormData(prev => ({ ...prev, breakfast: e.target.value }))}
                    placeholder="Enter breakfast menu items"
                    rows={3}
                  />
                  <div className="mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Upload className="h-4 w-4" />
                      <span className="text-sm">Upload Breakfast Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'breakfast')}
                        className="hidden"
                      />
                    </label>
                    {formData.breakfast_image && <span className="text-sm text-muted-foreground ml-6">{formData.breakfast_image.name}</span>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Lunch</label>
                  <Textarea
                    value={formData.lunch}
                    onChange={(e) => setFormData(prev => ({ ...prev, lunch: e.target.value }))}
                    placeholder="Enter lunch menu items"
                    rows={3}
                  />
                  <div className="mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Upload className="h-4 w-4" />
                      <span className="text-sm">Upload Lunch Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'lunch')}
                        className="hidden"
                      />
                    </label>
                    {formData.lunch_image && <span className="text-sm text-muted-foreground ml-6">{formData.lunch_image.name}</span>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Dinner</label>
                  <Textarea
                    value={formData.dinner}
                    onChange={(e) => setFormData(prev => ({ ...prev, dinner: e.target.value }))}
                    placeholder="Enter dinner menu items"
                    rows={3}
                  />
                  <div className="mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Upload className="h-4 w-4" />
                      <span className="text-sm">Upload Dinner Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'dinner')}
                        className="hidden"
                      />
                    </label>
                    {formData.dinner_image && <span className="text-sm text-muted-foreground ml-6">{formData.dinner_image.name}</span>}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <Select value={formData.status} onValueChange={(value: 'draft' | 'published') => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading}>
                  <Plus className="h-4 w-4 mr-2" />
                  {editingId ? 'Update Menu' : 'Create Menu'}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Existing Menus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {menus.map(menu => (
                <div key={menu.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{menu.properties?.name}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(menu.menu_date), 'PPP')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded ${menu.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {menu.status}
                      </span>
                      <Button size="sm" variant="outline" onClick={() => handleEdit(menu)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDuplicate(menu)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(menu.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <p className="font-medium text-sm">Breakfast</p>
                      <p className="text-sm text-muted-foreground">{menu.breakfast || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Lunch</p>
                      <p className="text-sm text-muted-foreground">{menu.lunch || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="font-medium text-sm">Dinner</p>
                      <p className="text-sm text-muted-foreground">{menu.dinner || 'Not set'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default FoodManagement;
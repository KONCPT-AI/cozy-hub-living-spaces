-- Create food_menus table
CREATE TABLE public.food_menus (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  menu_date DATE NOT NULL,
  breakfast TEXT,
  lunch TEXT,
  dinner TEXT,
  breakfast_image TEXT,
  lunch_image TEXT,
  dinner_image TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(property_id, menu_date)
);

-- Enable RLS
ALTER TABLE public.food_menus ENABLE ROW LEVEL SECURITY;

-- Admin users can manage all menus
CREATE POLICY "Admin users can insert food menus"
  ON public.food_menus
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admin users can update food menus"
  ON public.food_menus
  FOR UPDATE
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admin users can delete food menus"
  ON public.food_menus
  FOR DELETE
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admin users can view all food menus"
  ON public.food_menus
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Users can view published menus for their property
CREATE POLICY "Users can view published menus for their property"
  ON public.food_menus
  FOR SELECT
  TO authenticated
  USING (
    status = 'published' 
    AND property_id IN (
      SELECT p.id 
      FROM properties p
      JOIN rooms r ON r.property_id = p.id
      JOIN bookings b ON b.room_id = r.id
      WHERE b.user_id = auth.uid()
      AND b.status = 'active'
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_food_menus_updated_at
  BEFORE UPDATE ON public.food_menus
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for food menu images
INSERT INTO storage.buckets (id, name, public)
VALUES ('food-menu-images', 'food-menu-images', true);

-- Storage policies for food menu images
CREATE POLICY "Admin users can upload food menu images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'food-menu-images' 
    AND is_admin()
  );

CREATE POLICY "Admin users can update food menu images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'food-menu-images' 
    AND is_admin()
  );

CREATE POLICY "Admin users can delete food menu images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'food-menu-images' 
    AND is_admin()
  );

CREATE POLICY "Anyone can view food menu images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'food-menu-images');
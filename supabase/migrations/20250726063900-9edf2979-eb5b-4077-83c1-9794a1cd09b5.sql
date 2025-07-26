-- Create properties table
CREATE TABLE public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  description TEXT,
  images TEXT[],
  amenities TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on properties
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Create policies for properties
CREATE POLICY "Anyone can view active properties" 
ON public.properties 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admin users can view all properties" 
ON public.properties 
FOR SELECT 
USING (is_admin());

CREATE POLICY "Admin users can insert properties" 
ON public.properties 
FOR INSERT 
WITH CHECK (is_admin());

CREATE POLICY "Admin users can update properties" 
ON public.properties 
FOR UPDATE 
USING (is_admin());

CREATE POLICY "Admin users can delete properties" 
ON public.properties 
FOR DELETE 
USING (is_admin());

-- Add property_id to rooms table
ALTER TABLE public.rooms 
ADD COLUMN property_id UUID REFERENCES public.properties(id);

-- Create trigger for properties updated_at
CREATE TRIGGER update_properties_updated_at
BEFORE UPDATE ON public.properties
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_rooms_property_id ON public.rooms(property_id);
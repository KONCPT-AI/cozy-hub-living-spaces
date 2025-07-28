-- Create check-in/check-out logs table
CREATE TABLE public.check_in_out_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  property_id UUID NOT NULL,
  room_id UUID,
  check_type TEXT NOT NULL CHECK (check_type IN ('check_in', 'check_out')),
  authentication_method TEXT NOT NULL CHECK (authentication_method IN ('face_recognition', 'fingerprint', 'smart_card', 'manual')),
  device_id TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_late_entry BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create property settings table for curfew and notification settings
CREATE TABLE public.property_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL,
  curfew_start_time TIME NOT NULL DEFAULT '22:00:00',
  curfew_end_time TIME NOT NULL DEFAULT '06:00:00',
  late_entry_notifications_enabled BOOLEAN DEFAULT true,
  notification_recipients TEXT[], -- Array of admin emails
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(property_id)
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  property_id UUID,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('late_entry', 'security_alert', 'system', 'general')),
  is_read BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.check_in_out_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for check_in_out_logs
CREATE POLICY "Users can view their own check-in/out logs" 
ON public.check_in_out_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admin users can view all logs" 
ON public.check_in_out_logs 
FOR SELECT 
USING (is_admin() OR auth.uid() = user_id);

CREATE POLICY "System can insert check-in/out logs" 
ON public.check_in_out_logs 
FOR INSERT 
WITH CHECK (true); -- This will be restricted via edge functions

CREATE POLICY "Admin users can update logs" 
ON public.check_in_out_logs 
FOR UPDATE 
USING (is_admin());

-- RLS Policies for property_settings
CREATE POLICY "Admin users can view property settings" 
ON public.property_settings 
FOR SELECT 
USING (is_admin());

CREATE POLICY "Admin users can insert property settings" 
ON public.property_settings 
FOR INSERT 
WITH CHECK (is_admin());

CREATE POLICY "Admin users can update property settings" 
ON public.property_settings 
FOR UPDATE 
USING (is_admin());

CREATE POLICY "Admin users can delete property settings" 
ON public.property_settings 
FOR DELETE 
USING (is_admin());

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admin users can view all notifications" 
ON public.notifications 
FOR SELECT 
USING (is_admin() OR auth.uid() = user_id);

CREATE POLICY "System can insert notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admin users can update all notifications" 
ON public.notifications 
FOR UPDATE 
USING (is_admin() OR auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_property_settings_updated_at
BEFORE UPDATE ON public.property_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to check if entry is late based on curfew
CREATE OR REPLACE FUNCTION public.is_late_entry(
  property_id_param UUID,
  check_time TIMESTAMP WITH TIME ZONE DEFAULT now()
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  settings RECORD;
  check_time_only TIME;
BEGIN
  -- Get property settings
  SELECT curfew_start_time, curfew_end_time 
  INTO settings
  FROM public.property_settings 
  WHERE property_id = property_id_param;
  
  -- If no settings found, default to not late
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Extract time component
  check_time_only := check_time::TIME;
  
  -- Check if time is within curfew period
  -- Handle case where curfew spans midnight
  IF settings.curfew_start_time <= settings.curfew_end_time THEN
    -- Same day curfew (e.g., 22:00 to 23:59)
    RETURN check_time_only >= settings.curfew_start_time AND check_time_only <= settings.curfew_end_time;
  ELSE
    -- Overnight curfew (e.g., 22:00 to 06:00)
    RETURN check_time_only >= settings.curfew_start_time OR check_time_only <= settings.curfew_end_time;
  END IF;
END;
$$;

-- Add indexes for better performance
CREATE INDEX idx_check_in_out_logs_user_id ON public.check_in_out_logs(user_id);
CREATE INDEX idx_check_in_out_logs_property_id ON public.check_in_out_logs(property_id);
CREATE INDEX idx_check_in_out_logs_timestamp ON public.check_in_out_logs(timestamp);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at);
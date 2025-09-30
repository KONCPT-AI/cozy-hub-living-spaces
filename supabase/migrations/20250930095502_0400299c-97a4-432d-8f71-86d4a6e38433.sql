-- Fix security warnings: Add search_path to existing functions

-- Fix is_late_entry function
CREATE OR REPLACE FUNCTION public.is_late_entry(property_id_param uuid, check_time timestamp with time zone DEFAULT now())
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  settings RECORD;
  check_time_only TIME;
BEGIN
  -- Get property settings
  SELECT curfew_start_time, curfew_end_time 
  INTO settings
  FROM property_settings 
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
$function$;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO profiles (user_id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$function$;

-- Fix create_admin_user function
CREATE OR REPLACE FUNCTION public.create_admin_user(user_email text, user_name text DEFAULT NULL::text, admin_role admin_role DEFAULT 'staff'::admin_role)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  admin_id UUID;
BEGIN
  INSERT INTO admin_users (user_id, email, full_name, role, is_active)
  VALUES (
    gen_random_uuid(),
    user_email,
    user_name,
    admin_role,
    true
  )
  RETURNING id INTO admin_id;
  
  RETURN admin_id;
END;
$function$;
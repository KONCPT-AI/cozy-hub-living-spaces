import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CheckInOutRequest {
  user_id: string;
  property_id: string;
  room_id?: string;
  check_type: 'check_in' | 'check_out';
  authentication_method: 'face_recognition' | 'fingerprint' | 'smart_card' | 'manual';
  device_id?: string;
  biometric_data?: string; // Base64 encoded biometric data for verification
  notes?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const requestData: CheckInOutRequest = await req.json();
    
    // Validate required fields
    if (!requestData.user_id || !requestData.property_id || !requestData.check_type || !requestData.authentication_method) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: user_id, property_id, check_type, authentication_method' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const timestamp = new Date();
    
    // Check if entry is late based on property settings
    const { data: isLateResult, error: lateCheckError } = await supabaseClient
      .rpc('is_late_entry', {
        property_id_param: requestData.property_id,
        check_time: timestamp.toISOString()
      });

    if (lateCheckError) {
      console.error('Error checking late entry:', lateCheckError);
    }

    const isLate = isLateResult || false;

    // Insert check-in/out log
    const { data: logData, error: logError } = await supabaseClient
      .from('check_in_out_logs')
      .insert({
        user_id: requestData.user_id,
        property_id: requestData.property_id,
        room_id: requestData.room_id,
        check_type: requestData.check_type,
        authentication_method: requestData.authentication_method,
        device_id: requestData.device_id,
        timestamp: timestamp.toISOString(),
        is_late_entry: isLate,
        notes: requestData.notes,
      })
      .select('*')
      .single();

    if (logError) {
      console.error('Error inserting log:', logError);
      return new Response(JSON.stringify({ error: 'Failed to record entry' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // If it's a late entry, send notifications
    if (isLate && requestData.check_type === 'check_in') {
      // Get property settings for notifications
      const { data: propertySettings } = await supabaseClient
        .from('property_settings')
        .select('*')
        .eq('property_id', requestData.property_id)
        .eq('late_entry_notifications_enabled', true)
        .single();

      // Get user and property details for notification
      const { data: userProfile } = await supabaseClient
        .from('profiles')
        .select('full_name, email')
        .eq('user_id', requestData.user_id)
        .single();

      const { data: property } = await supabaseClient
        .from('properties')
        .select('name')
        .eq('id', requestData.property_id)
        .single();

      if (propertySettings && userProfile && property) {
        // Create notification for user
        await supabaseClient
          .from('notifications')
          .insert({
            user_id: requestData.user_id,
            property_id: requestData.property_id,
            title: 'Late Entry Recorded',
            message: `Your late check-in at ${property.name} has been recorded at ${timestamp.toLocaleTimeString()}.`,
            type: 'late_entry',
            metadata: {
              check_type: requestData.check_type,
              authentication_method: requestData.authentication_method,
              device_id: requestData.device_id,
              timestamp: timestamp.toISOString()
            }
          });

        // Create notifications for admin recipients if configured
        if (propertySettings.notification_recipients && propertySettings.notification_recipients.length > 0) {
          // Get admin users for the property
          const { data: adminUsers } = await supabaseClient
            .from('admin_users')
            .select('user_id')
            .eq('is_active', true);

          if (adminUsers && adminUsers.length > 0) {
            const adminNotifications = adminUsers.map(admin => ({
              user_id: admin.user_id,
              property_id: requestData.property_id,
              title: 'Late Entry Alert',
              message: `${userProfile.full_name || userProfile.email} had a late check-in at ${property.name} at ${timestamp.toLocaleTimeString()}.`,
              type: 'late_entry' as const,
              metadata: {
                late_user_id: requestData.user_id,
                late_user_name: userProfile.full_name,
                late_user_email: userProfile.email,
                check_type: requestData.check_type,
                authentication_method: requestData.authentication_method,
                device_id: requestData.device_id,
                timestamp: timestamp.toISOString()
              }
            }));

            await supabaseClient
              .from('notifications')
              .insert(adminNotifications);
          }
        }
      }
    }

    // Return success response
    return new Response(JSON.stringify({
      success: true,
      log_id: logData.id,
      is_late_entry: isLate,
      timestamp: timestamp.toISOString(),
      message: `${requestData.check_type.replace('_', ' ')} recorded successfully${isLate ? ' (late entry)' : ''}`
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in check-in-out function:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
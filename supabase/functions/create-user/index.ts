import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Admin key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    );

    // Get the request body
    const { email, password, userData } = await req.json();

    // Validate input
    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Email and password are required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        },
      );
    }

    // Create the user in Supabase Auth
    const { data: authUser, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm the email
        user_metadata: { name: userData.name },
      });

    if (authError) {
      throw authError;
    }

    // If user was created successfully, update the public.users table with additional data
    if (authUser?.user) {
      // First check if the user already exists in the public.users table
      const { data: existingUser } = await supabaseAdmin
        .from("users")
        .select("*")
        .eq("id", authUser.user.id)
        .single();

      if (existingUser) {
        // Update existing user
        const { error: profileError } = await supabaseAdmin
          .from("users")
          .update({
            full_name: userData.name,
            role: userData.role || "client",
            company_id: userData.company_id || null,
          })
          .eq("id", authUser.user.id);

        if (profileError) {
          throw profileError;
        }
      } else {
        // Insert new user
        const { error: profileError } = await supabaseAdmin
          .from("users")
          .insert({
            id: authUser.user.id,
            email: email,
            full_name: userData.name,
            role: userData.role || "client",
            company_id: userData.company_id || null,
          });

        if (profileError) {
          throw profileError;
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, user: authUser?.user }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});

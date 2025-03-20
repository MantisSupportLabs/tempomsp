-- Create sample users if they don't exist
DO $$
BEGIN
  -- Check if client user exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'client@example.com') THEN
    -- Insert client user
    INSERT INTO auth.users (id, email, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES (
      uuid_generate_v4(),
      'client@example.com',
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Client User"}',
      NOW(),
      NOW()
    );
  END IF;

  -- Check if technician user exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'technician@example.com') THEN
    -- Insert technician user
    INSERT INTO auth.users (id, email, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES (
      uuid_generate_v4(),
      'technician@example.com',
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Tech Support"}',
      NOW(),
      NOW()
    );
  END IF;

  -- Check if admin user exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@example.com') THEN
    -- Insert admin user
    INSERT INTO auth.users (id, email, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES (
      uuid_generate_v4(),
      'admin@example.com',
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Admin User"}',
      NOW(),
      NOW()
    );
  END IF;

  -- Create profiles for users if they don't exist
  INSERT INTO public.profiles (id, full_name, role, created_at, updated_at)
  SELECT id, user_metadata->>'full_name', 'client', NOW(), NOW()
  FROM auth.users
  WHERE email = 'client@example.com'
  AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.users.id);

  INSERT INTO public.profiles (id, full_name, role, created_at, updated_at)
  SELECT id, user_metadata->>'full_name', 'technician', NOW(), NOW()
  FROM auth.users
  WHERE email = 'technician@example.com'
  AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.users.id);

  INSERT INTO public.profiles (id, full_name, role, created_at, updated_at)
  SELECT id, user_metadata->>'full_name', 'admin', NOW(), NOW()
  FROM auth.users
  WHERE email = 'admin@example.com'
  AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.users.id);

END;
$$;
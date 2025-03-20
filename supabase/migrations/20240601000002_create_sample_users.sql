-- Create sample users
-- Note: In a real application, you would not store passwords in migrations
-- These are just for demo purposes

-- Create a technician user
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'tech@example.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Alex Technician"}'
);

-- Create a client user
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'client@example.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"John Smith"}'
);

-- Create user profiles
INSERT INTO users (id, email, full_name, role)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'tech@example.com', 'Alex Technician', 'technician'),
  ('00000000-0000-0000-0000-000000000002', 'client@example.com', 'John Smith', 'client');

-- Create technician record
INSERT INTO technicians (id, user_id, specialization, phone)
VALUES (
  'ffffffff-ffff-ffff-ffff-ffffffffffff',
  '00000000-0000-0000-0000-000000000001',
  'Network Support',
  '555-123-4567'
);

-- Create client record
INSERT INTO clients (id, user_id, company_id, location_id, job_title, phone)
VALUES (
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  '00000000-0000-0000-0000-000000000002',
  '11111111-1111-1111-1111-111111111111',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'IT Manager',
  '555-987-6543'
);

-- Create sample tickets
INSERT INTO tickets (id, client_id, technician_id, title, description, type, status, priority)
VALUES
  (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    'ffffffff-ffff-ffff-ffff-ffffffffffff',
    'Email not working',
    'Unable to send or receive emails since this morning.',
    'support',
    'in-progress',
    'high'
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    null,
    'New laptop',
    'Request for a new development laptop with 32GB RAM.',
    'hardware',
    'pending',
    'medium'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    'ffffffff-ffff-ffff-ffff-ffffffffffff',
    'Adobe Creative Suite',
    'License request for Adobe Creative Suite for the design team.',
    'software',
    'complete',
    'low'
  );

-- Create sample chats
INSERT INTO chats (id, ticket_id, subject, status, last_activity)
VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'Email Configuration Issue',
    'active',
    now() - interval '15 minutes'
  ),
  (
    '99999999-9999-9999-9999-999999999999',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'New Laptop Request',
    'waiting',
    now() - interval '2 hours'
  ),
  (
    '88888888-8888-8888-8888-888888888888',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Software License Request',
    'closed',
    now() - interval '2 days'
  );

-- Create sample messages
INSERT INTO messages (chat_id, sender_id, message, read, created_at)
VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '00000000-0000-0000-0000-000000000002',
    'I can''t access my company email on my new laptop.',
    true,
    now() - interval '60 minutes'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '00000000-0000-0000-0000-000000000001',
    'Have you tried resetting your password?',
    true,
    now() - interval '45 minutes'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '00000000-0000-0000-0000-000000000002',
    'Yes, but I''m still getting an authentication error.',
    true,
    now() - interval '30 minutes'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '00000000-0000-0000-0000-000000000002',
    'The error code is AUTH-5523 if that helps.',
    false,
    now() - interval '15 minutes'
  );

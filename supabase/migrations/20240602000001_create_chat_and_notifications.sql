-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chats table
CREATE TABLE IF NOT EXISTS chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_participants table
CREATE TABLE IF NOT EXISTS chat_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(chat_id, user_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample data for notifications
INSERT INTO notifications (user_id, title, message)
SELECT 
  id, 
  'Ticket Status Updated', 
  'Your support ticket #1234 has been updated to In Progress'
FROM auth.users
WHERE email = 'client@example.com';

INSERT INTO notifications (user_id, title, message)
SELECT 
  id, 
  'New Hardware Available', 
  'The requested laptop is now available for pickup'
FROM auth.users
WHERE email = 'client@example.com';

INSERT INTO notifications (user_id, title, message)
SELECT 
  id, 
  'Scheduled Maintenance', 
  'System maintenance scheduled for Saturday 10PM-2AM'
FROM auth.users
WHERE email = 'client@example.com';

-- Create sample chats and messages
-- Create a chat between client and technician
INSERT INTO chats DEFAULT VALUES;

-- Get the chat ID we just created
DO $$
DECLARE
  chat_id UUID;
  client_id UUID;
  tech_id UUID;
BEGIN
  SELECT id INTO chat_id FROM chats ORDER BY created_at DESC LIMIT 1;
  
  -- Get client and technician IDs
  SELECT id INTO client_id FROM auth.users WHERE email = 'client@example.com';
  SELECT id INTO tech_id FROM auth.users WHERE email = 'technician@example.com';
  
  -- Add participants
  INSERT INTO chat_participants (chat_id, user_id) VALUES (chat_id, client_id);
  INSERT INTO chat_participants (chat_id, user_id) VALUES (chat_id, tech_id);
  
  -- Add messages
  INSERT INTO messages (chat_id, user_id, content) 
  VALUES (chat_id, client_id, 'Hello, I''m having issues with my email client');
  
  INSERT INTO messages (chat_id, user_id, content) 
  VALUES (chat_id, tech_id, 'Hi there! I''d be happy to help. What specific issues are you experiencing?');
  
  INSERT INTO messages (chat_id, user_id, content) 
  VALUES (chat_id, client_id, 'It keeps freezing when I try to open attachments');
  
  INSERT INTO messages (chat_id, user_id, content) 
  VALUES (chat_id, tech_id, 'I understand. Let''s try clearing the cache first. Go to Settings > Advanced > Clear Cache');
  
  INSERT INTO messages (chat_id, user_id, content) 
  VALUES (chat_id, client_id, 'That worked! Thank you so much for your help.');
  
  INSERT INTO messages (chat_id, user_id, content) 
  VALUES (chat_id, tech_id, 'Great! If you have any other issues, feel free to reach out.');
END;
$$;

-- Create another chat for a different issue
INSERT INTO chats DEFAULT VALUES;

DO $$
DECLARE
  chat_id UUID;
  client_id UUID;
  tech_id UUID;
BEGIN
  SELECT id INTO chat_id FROM chats ORDER BY created_at DESC LIMIT 1;
  
  -- Get client and technician IDs
  SELECT id INTO client_id FROM auth.users WHERE email = 'client@example.com';
  SELECT id INTO tech_id FROM auth.users WHERE email = 'technician@example.com';
  
  -- Add participants
  INSERT INTO chat_participants (chat_id, user_id) VALUES (chat_id, client_id);
  INSERT INTO chat_participants (chat_id, user_id) VALUES (chat_id, tech_id);
  
  -- Add messages
  INSERT INTO messages (chat_id, user_id, content) 
  VALUES (chat_id, client_id, 'I need to request a new monitor for my workstation');
  
  INSERT INTO messages (chat_id, user_id, content) 
  VALUES (chat_id, tech_id, 'Sure, I can help with that. What specifications are you looking for?');
  
  INSERT INTO messages (chat_id, user_id, content) 
  VALUES (chat_id, client_id, 'I need a 27-inch monitor with 4K resolution for design work');
  
  INSERT INTO messages (chat_id, user_id, content) 
  VALUES (chat_id, tech_id, 'I''ve submitted the request. You should receive approval within 48 hours.');
END;
$$;

-- Enable realtime for these tables
alter publication supabase_realtime add table notifications;
alter publication supabase_realtime add table chats;
alter publication supabase_realtime add table chat_participants;
alter publication supabase_realtime add table messages;
import db from './db.js';

export const initSchema = async () => {
  console.log('Initializing database schema...');
  const schema = `
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    CREATE TABLE IF NOT EXISTS conversations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL DEFAULT 'Nova Conversa',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
    CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);

    -- Ensure title column exists
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='conversations' AND column_name='title') THEN
        ALTER TABLE conversations ADD COLUMN title TEXT NOT NULL DEFAULT 'Nova Conversa';
      END IF;
    END $$;

    -- Enable Realtime for messages
    DO $$
    BEGIN
      -- Create publication if it doesn't exist
      IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime;
      END IF;

      -- Add table to publication if not already added
      IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
      ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE messages;
      END IF;

      -- Ensure replica identity is set for DELETE events
      ALTER TABLE messages REPLICA IDENTITY FULL;

      -- Check RLS status and provide a policy if enabled
      -- This allows the anon/authenticated key to receive realtime events
      -- if they belong to the conversation.
      -- NOTE: In a production environment with Supabase, you should
      -- configure JWT secret in Supabase to match your backend's JWT_SECRET
      -- so that Auth.uid() works correctly.

      IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'messages' AND rowsecurity = true) THEN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND polname = 'Enable realtime for all') THEN
          CREATE POLICY "Enable realtime for all" ON messages FOR SELECT USING (true);
        END IF;
      END IF;

    EXCEPTION WHEN OTHERS THEN
      -- Log error but don't fail schema initialization
      RAISE NOTICE 'Could not enable Supabase Realtime via SQL: %', SQLERRM;
    END $$;
  `;

  try {
    await db.query(schema);
    console.log('Chat schema initialized successfully');
  } catch (error) {
    console.error('Error initializing chat schema:', error);
    throw error;
  }
};

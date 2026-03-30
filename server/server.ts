import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Auth routes
app.post('/api/auth/signup', async (req, res) => {
  const { email, password, name } = req.body;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name }
    }
  });

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

app.post('/api/auth/signin', async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

app.post('/api/auth/signout', async (req, res) => {
  const { error } = await supabase.auth.signOut();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true });
});
app.get('/api/user/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Create or update user
app.post('/api/user', async (req, res) => {
  const { name, email } = req.body;
  const { data, error } = await supabase
    .from('users')
    .upsert({ name, email })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Save translation history
app.post('/api/history', async (req, res) => {
  const { user_id, source_text, translated_text, source_lang, target_lang, timestamp } = req.body;
  const { data, error } = await supabase
    .from('translation_history')
    .insert({
      user_id,
      source_text,
      translated_text,
      source_lang,
      target_lang,
      timestamp: timestamp || new Date().toISOString()
    })
    .select();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Get user history
app.get('/api/history/:user_id', async (req, res) => {
  const { user_id } = req.params;
  const { data, error } = await supabase
    .from('translation_history')
    .select('*')
    .eq('user_id', user_id)
    .order('timestamp', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Delete history item
app.delete('/api/history/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase
    .from('translation_history')
    .delete()
    .eq('id', id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});</content>
<parameter name="filePath">a:/neon inter/server/server.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

type Body = {
  name?: string;
  email?: string;
  password?: string;
  user_id?: string;
  source_text?: string;
  translated_text?: string;
  source_lang?: string;
  target_lang?: string;
  id?: string;
};

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const path = req.url?.replace(/^\/api/, '') || '';
  const body = req.body as Body;

  try {
    if (req.method === 'GET' && path.startsWith('/user/')) {
      const userId = path.split('/').pop();
      const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }

    if (req.method === 'POST' && path === '/user') {
      const { name, email } = body;
      const { data, error } = await supabase.from('users').upsert({ name, email }).select().single();
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }

    if (req.method === 'POST' && path === '/history') {
      const { user_id, source_text, translated_text, source_lang, target_lang } = body;
      const { data, error } = await supabase.from('translation_history').insert({
        user_id,
        source_text,
        translated_text,
        source_lang,
        target_lang,
        timestamp: new Date().toISOString(),
      }).select();
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }

    if (req.method === 'GET' && path.startsWith('/history/')) {
      const userId = path.split('/').pop();
      const { data, error } = await supabase.from('translation_history').select('*').eq('user_id', userId).order('timestamp', { ascending: false });
      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    }

    if (req.method === 'DELETE' && path.startsWith('/history/')) {
      const recordId = path.split('/').pop();
      const { error } = await supabase.from('translation_history').delete().eq('id', recordId);
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true });
    }

    res.status(404).json({ message: 'Route not found' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Unknown error' });
  }
}

import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const { user_id } = req.query;
    if (!user_id || typeof user_id !== 'string') {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const { data, error } = await supabase
      .from('translation_history')
      .select('*')
      .eq('user_id', user_id)
      .order('timestamp', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  if (req.method === 'POST') {
    const { user_id, source_text, translated_text, source_lang, target_lang } = req.body as {
      user_id?: string;
      source_text?: string;
      translated_text?: string;
      source_lang?: string;
      target_lang?: string;
    };

    if (!user_id || !source_text || !translated_text) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const { data, error } = await supabase
      .from('translation_history')
      .insert({
        user_id,
        source_text,
        translated_text,
        source_lang,
        target_lang,
        timestamp: new Date().toISOString(),
      })
      .select();

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  res.status(405).json({ error: 'Method not allowed' });
}
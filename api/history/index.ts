import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { user_id } = req.query;

    try {
      const { data, error } = await supabase
        .from('translation_history')
        .select('*')
        .eq('user_id', user_id)
        .order('timestamp', { ascending: false });

      if (error) throw error;

      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'POST') {
    const { user_id, source_text, translated_text, source_lang, target_lang } = req.body;

    try {
      const { data, error } = await supabase
        .from('translation_history')
        .insert({
          user_id,
          source_text,
          translated_text,
          source_lang,
          target_lang
        })
        .select();

      if (error) throw error;

      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
export default function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({
      message: 'API root is active',
      routes: ['/api/user', '/api/history', '/api/user/:id', '/api/history/:id']
    });
  }

  res.status(405).json({ error: 'Method not allowed' });
}

export function verifyAIBearerToken(req) {
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.replace('Bearer ', '');
  if (token !== process.env.SYNC_SECRET_TOKEN) {
    throw new Error('Unauthorized: Invalid token');
  }
}
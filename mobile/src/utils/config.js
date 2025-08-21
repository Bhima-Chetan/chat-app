// Production configuration for Render deployment
// Force correct server URL (from Render logs)
const raw = process.env.EXPO_PUBLIC_SERVER_URL || 'https://chat-app-jb8r.onrender.com';
export const SERVER_URL = raw.endsWith('/') ? raw.slice(0, -1) : raw;

console.log('🔧 Using SERVER_URL:', SERVER_URL);

// Development fallback (for local testing):
// export const SERVER_URL = 'http://localhost:4002';

export const config = { runtime: 'edge' };

export default async function handler(request) {
  const ua = (request.headers.get('user-agent') || '').toLowerCase();
  const url = new URL(request.url);

  // Prioritize Instagram in-app users: if they hit the root, redirect to the static instagram-home
  if (/instagram/.test(ua)) {
    if (url.pathname === '/') {
      const dest = new URL('/instagram-home', request.url).toString();
      return Response.redirect(dest, 302);
    }
    // For /link-bio we let the static file serve normally (no special handling required)
  }

  // Default: proxy the request to origin (behave like a normal function)
  return fetch(request);
}

import { NextResponse } from 'next/server';

/**
 * Middleware para detectar user-agent do Instagram e servir páginas estáticas
 * - Reescreve `/` para `/instagram-home` quando o UA contém 'instagram'
 * - Mantém comportamento normal para outros UAs
 */
export function middleware(req) {
  const ua = (req.headers.get('user-agent') || '').toLowerCase();
  if (/instagram/.test(ua)) {
    const url = req.nextUrl.clone();
    // Priorizar home e link-bio
    if (url.pathname === '/') {
      url.pathname = '/instagram-home';
      return NextResponse.rewrite(url);
    }
    if (url.pathname === '/link-bio') {
      // já estático — apenas continue
      return NextResponse.next();
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/link-bio']
};

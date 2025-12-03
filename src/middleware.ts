import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Cek apakah mengakses route admin yang diproteksi
  const isProtectedAdminRoute = 
    pathname.startsWith('/admin/dashboard') || 
    pathname.startsWith('/admin/verifikasi');
  
  // Cek apakah di halaman login
  const isLoginPage = pathname === '/admin';
  
  // Ambil token admin dari cookies
  const adminToken = request.cookies.get('adminToken');
  const isAuthenticated = !!adminToken;

  console.log(`🔐 Middleware Check: ${pathname} | Authenticated: ${isAuthenticated}`);

  // Case 1: Akses route protected tapi belum login → redirect ke login
  if (isProtectedAdminRoute && !isAuthenticated) {
    console.log('⛔ Unauthorized access to protected route');
    const loginUrl = new URL('/admin', request.url);
    loginUrl.searchParams.set('redirect', pathname); // Simpan URL tujuan
    return NextResponse.redirect(loginUrl);
  }

  // Case 2: Sudah login tapi akses login page → redirect ke dashboard
  if (isLoginPage && isAuthenticated) {
    console.log('🔄 Already logged in, redirecting to dashboard');
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  // Case 3: Biarkan akses ke /admin jika belum login (untuk login)
  // Case 4: Biarkan akses ke protected routes jika sudah login
  
  return NextResponse.next();
}

// Konfigurasi matcher untuk middleware
export const config = {
  matcher: [
    /*
     * Match semua request paths yang dimulai dengan:
     * - /admin (semua subpath admin)
     */
    '/admin/:path*',
  ],
};
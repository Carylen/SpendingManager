import { NextResponse, type NextRequest } from 'next/server';
import { appConfig } from '@/config/app';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(appConfig.homePath, request.url));
  }
  return NextResponse.redirect(new URL(`${appConfig.signInPath}?status=gagal`, request.url));
}

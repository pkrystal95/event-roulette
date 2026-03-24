import { cookies } from 'next/headers';

export async function checkAdminAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get('admin_authenticated')?.value === 'true';
  return isAuthenticated;
}

import { User } from '@supabase/supabase-js';

// Default admin email whitelist (can be configured via ADMIN_EMAILS environment variable)
const DEFAULT_ADMIN_EMAILS = ['admin@apextools.app', 'muddasir@apextools.app'];

export function getAdminEmails(): string[] {
  const envEmails = process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS;
  if (!envEmails) return DEFAULT_ADMIN_EMAILS;
  return envEmails.split(',').map((email) => email.trim().toLowerCase());
}

export function isUserAdmin(user: User | null | undefined): boolean {
  if (!user) return false;

  // 1. Check metadata plan or role
  const userPlan = (user.user_metadata?.plan || user.app_metadata?.plan || '').toLowerCase();
  const userRole = (user.user_metadata?.role || user.app_metadata?.role || '').toLowerCase();
  if (userPlan === 'admin' || userRole === 'admin') {
    return true;
  }

  // 2. Check email whitelist
  if (user.email) {
    const adminEmails = getAdminEmails();
    if (adminEmails.includes(user.email.toLowerCase())) {
      return true;
    }
  }

  return false;
}

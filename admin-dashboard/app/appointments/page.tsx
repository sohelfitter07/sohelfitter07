import { redirect } from 'next/navigation';
import { requireAdminSession } from '@/lib/auth/require-admin';
import AppointmentsWorkspace from './appointments-workspace';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Appointments | CFR Admin',
};

export default async function AppointmentsPage() {
  const session = await requireAdminSession();

  if (!session) {
    redirect('/login');
  }

  return <AppointmentsWorkspace />;
}

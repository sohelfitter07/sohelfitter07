import { redirect } from 'next/navigation';
import { requireAdminSession } from '@/lib/auth/require-admin';
import AppointmentsTable from './appointments-table';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Appointments | CFR Admin',
};

export default async function AppointmentsPage() {
  const session = await requireAdminSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
            Scheduler
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
            Appointments
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            Read-only view of the latest bookings, loaded through the
            session-protected API. Creating and editing arrive in a later phase.
          </p>
        </div>

        <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
          Read-only preview
        </span>
      </header>

      <AppointmentsTable />
    </main>
  );
}

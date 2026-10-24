import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import LogoutButton from './logout-button';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Canadian Fitness Repair</p>
          <h1>Welcome, Admin</h1>
        </div>
        <LogoutButton />
      </header>

      <section className="card">
        <h2>Dashboard shell is ready</h2>
        <p className="muted">
          Signed in as {session.email ?? session.uid}.
        </p>
        <p>
          This is the secure starting point for the rewritten dashboard. The
          existing appointment, customer, calendar, and reporting features will
          be migrated here in later phases.
        </p>
      </section>
    </main>
  );
}

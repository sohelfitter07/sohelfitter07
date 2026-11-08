'use client';

import { useCallback, useEffect, useState } from 'react';
import type { AppointmentDTO } from '@/lib/types';
import { useApiList } from '@/lib/use-api-list';
import AppointmentModal from './appointment-modal';
import AppointmentsTable from './appointments-table';

interface Notice {
  tone: 'success' | 'error';
  message: string;
}

function extractErrorMessage(payload: unknown, status: number): string {
  if (
    typeof payload === 'object' &&
    payload !== null &&
    'error' in payload &&
    typeof (payload as { error?: unknown }).error === 'string'
  ) {
    return (payload as { error: string }).error;
  }

  return `Request failed with status ${status}.`;
}

export default function AppointmentsWorkspace() {
  const { data, loading, error, reload } = useApiList<AppointmentDTO>(
    '/api/appointments?limit=100',
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AppointmentDTO | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  const closeModal = useCallback(() => setModalOpen(false), []);

  const openCreateModal = useCallback(() => {
    setEditing(null);
    setModalOpen(true);
  }, []);

  const openEditModal = useCallback((appointment: AppointmentDTO) => {
    setEditing(appointment);
    setModalOpen(true);
  }, []);

  const handleSaved = useCallback(() => {
    setNotice({
      tone: 'success',
      message: editing
        ? 'Appointment updated successfully.'
        : 'Appointment created successfully.',
    });
    void reload();
  }, [editing, reload]);

  const handleDelete = useCallback(
    async (appointment: AppointmentDTO) => {
      const customer = appointment.customer?.trim() || 'this appointment';

      if (
        !window.confirm(
          `Are you sure you want to delete the appointment for ${customer}? This cannot be undone.`,
        )
      ) {
        return;
      }

      setDeletingId(appointment.id);

      try {
        const response = await fetch(
          `/api/appointments/delete?id=${encodeURIComponent(appointment.id)}`,
          {
            method: 'DELETE',
            headers: { Accept: 'application/json' },
          },
        );

        const payload: unknown = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(extractErrorMessage(payload, response.status));
        }

        setNotice({ tone: 'success', message: 'Appointment deleted.' });
        await reload();
      } catch (deleteError) {
        setNotice({
          tone: 'error',
          message:
            deleteError instanceof Error
              ? deleteError.message
              : 'Unable to delete the appointment.',
        });
      } finally {
        setDeletingId(null);
      }
    },
    [reload],
  );

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timer = window.setTimeout(() => setNotice(null), 6000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
            Scheduler
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
            Appointments
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            Create, edit, and remove bookings. Changes are saved through the
            session-protected API and appear in the table immediately.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-400"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="h-4 w-4"
          >
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          New Appointment
        </button>
      </header>

      {notice ? (
        <div
          role={notice.tone === 'error' ? 'alert' : 'status'}
          className={`mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${
            notice.tone === 'error'
              ? 'border-rose-500/25 bg-rose-500/10 text-rose-200'
              : 'border-emerald-500/25 bg-emerald-500/10 text-emerald-200'
          }`}
        >
          <span>{notice.message}</span>
          <button
            type="button"
            onClick={() => setNotice(null)}
            aria-label="Dismiss notification"
            className="rounded-md px-2 py-0.5 opacity-70 transition hover:bg-white/5 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      <AppointmentsTable
        appointments={data}
        loading={loading}
        error={error}
        deletingId={deletingId}
        onRefresh={() => void reload()}
        onEdit={openEditModal}
        onDelete={handleDelete}
      />

      {modalOpen ? (
        <AppointmentModal
          appointment={editing}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      ) : null}
    </main>
  );
}

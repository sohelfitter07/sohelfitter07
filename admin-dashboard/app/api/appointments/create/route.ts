import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { requireAdminSession } from '@/lib/auth/require-admin';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { serializeAppointment } from '@/lib/firestore/serialize';
import { validateAppointmentInput } from '@/lib/appointments/validate-appointment';
import { isSameOrigin } from '@/lib/http/same-origin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const HST_RATE = 0.13;

interface CustomerSyncInput {
  name: string;
  phone: string;
  email: string;
  lastAppointment: Timestamp;
}

/**
 * Keeps the `customers` collection in step with new bookings. A customer is
 * matched on phone first, then email; matches only refresh the last visit so
 * manually maintained contact details are never overwritten.
 */
async function syncCustomer({
  name,
  phone,
  email,
  lastAppointment,
}: CustomerSyncInput): Promise<void> {
  const customers = getAdminFirestore().collection('customers');
  const lookups = [];

  if (phone) {
    lookups.push(customers.where('phone', '==', phone).limit(1).get());
  }

  if (email) {
    lookups.push(customers.where('email', '==', email).limit(1).get());
  }

  if (lookups.length === 0) {
    return;
  }

  const snapshots = await Promise.all(lookups);
  const match = snapshots.find((snapshot) => !snapshot.empty)?.docs[0];

  if (match) {
    await match.ref.update({ lastAppointment });
    return;
  }

  await customers.add({
    name,
    phone,
    email,
    lastAppointment,
    createdAt: Timestamp.now(),
  });
}

/**
 * POST /api/appointments/create
 *
 * Creates an appointment after verifying the admin session and validating
 * every field. The client sends a pre-tax base price; the route stores the
 * base price, tax rate, and tax-inclusive total.
 */
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Invalid origin.' }, { status: 403 });
  }

  const session = await requireAdminSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body.' },
      { status: 400 },
    );
  }

  const validation = validateAppointmentInput(body);

  if (!validation.ok) {
    return NextResponse.json(
      {
        error: 'Please correct the highlighted fields.',
        fields: validation.errors,
      },
      { status: 400 },
    );
  }

  const {
    customer,
    phone,
    email,
    equipment,
    issue,
    status,
    basePrice,
    scheduledAt,
  } = validation.value;

  const totalPrice = Math.round(basePrice * (1 + HST_RATE) * 100) / 100;
  const now = Timestamp.now();

  const appointment = {
    customer,
    phone,
    email,
    carrier: '',
    equipment,
    houseAddress: '',
    distanceFromShopKm: 0,
    date: Timestamp.fromDate(scheduledAt),
    basePrice,
    price: totalPrice,
    taxRate: HST_RATE,
    issue,
    status,
    repair_notes: '',
    createdAt: now,
    createdBy: session.uid,
    confirmationSent: false,
    confirmationSentAt: null,
    lastStatusSent: '',
    lastAttemptStatus: '',
    reminderEnabled: false,
    needsResend: false,
  };

  try {
    const reference = await getAdminFirestore()
      .collection('appointments')
      .add(appointment);

    try {
      await syncCustomer({
        name: customer,
        phone,
        email,
        lastAppointment: appointment.date,
      });
    } catch (syncError) {
      // The booking already exists; a customer-sync failure must not report
      // the whole request as failed.
      console.error(
        'Failed to sync customer:',
        syncError instanceof Error ? syncError.message : 'unknown error',
      );
    }

    return NextResponse.json(
      { data: serializeAppointment(reference.id, appointment) },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      'Failed to create appointment:',
      error instanceof Error ? error.message : 'unknown error',
    );
    return NextResponse.json(
      { error: 'Unable to create the appointment.' },
      { status: 500 },
    );
  }
}

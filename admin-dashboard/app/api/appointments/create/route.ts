import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { requireAdminSession } from '@/lib/auth/require-admin';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { serializeAppointment } from '@/lib/firestore/serialize';
import { validateCreateAppointment } from '@/lib/appointments/validate-create-appointment';
import { isSameOrigin } from '@/lib/http/same-origin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const HST_RATE = 0.13;

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

  const validation = validateCreateAppointment(body);

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

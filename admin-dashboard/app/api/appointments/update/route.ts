import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { requireAdminSession } from '@/lib/auth/require-admin';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { serializeAppointment } from '@/lib/firestore/serialize';
import { validateAppointmentInput } from '@/lib/appointments/validate-appointment';
import { parseAppointmentId } from '@/lib/appointments/appointment-id';
import { isSameOrigin } from '@/lib/http/same-origin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const HST_RATE = 0.13;

/**
 * PUT /api/appointments/update
 *
 * Updates an existing appointment after verifying the admin session and
 * validating every editable field. Fields that are not part of the edit form
 * (creation metadata, confirmation flags, legacy details) are left untouched.
 */
export async function PUT(request: NextRequest) {
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

  const id =
    typeof body === 'object' && body !== null && !Array.isArray(body)
      ? parseAppointmentId((body as Record<string, unknown>).id)
      : null;

  if (!id) {
    return NextResponse.json(
      { error: 'A valid appointment id is required.' },
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

  const updates = {
    customer,
    phone,
    email,
    equipment,
    issue,
    status,
    date: Timestamp.fromDate(scheduledAt),
    basePrice,
    price: totalPrice,
    taxRate: HST_RATE,
    updatedAt: Timestamp.now(),
    updatedBy: session.uid,
  };

  try {
    const reference = getAdminFirestore()
      .collection('appointments')
      .doc(id);
    const existing = await reference.get();

    if (!existing.exists) {
      return NextResponse.json(
        { error: 'Appointment not found.' },
        { status: 404 },
      );
    }

    await reference.update(updates);

    return NextResponse.json({
      data: serializeAppointment(id, { ...existing.data(), ...updates }),
    });
  } catch (error) {
    console.error(
      'Failed to update appointment:',
      error instanceof Error ? error.message : 'unknown error',
    );
    return NextResponse.json(
      { error: 'Unable to update the appointment.' },
      { status: 500 },
    );
  }
}

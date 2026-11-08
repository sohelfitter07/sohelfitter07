import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireAdminSession } from '@/lib/auth/require-admin';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { parseAppointmentId } from '@/lib/appointments/appointment-id';
import { isSameOrigin } from '@/lib/http/same-origin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * DELETE /api/appointments/delete?id=<appointmentId>
 *
 * Permanently deletes an appointment. Requires a valid, server-verified admin
 * session; the Firebase Admin SDK bypasses client security rules, so this
 * check is the security boundary.
 */
export async function DELETE(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Invalid origin.' }, { status: 403 });
  }

  const session = await requireAdminSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const id = parseAppointmentId(request.nextUrl.searchParams.get('id'));

  if (!id) {
    return NextResponse.json(
      { error: 'A valid appointment id is required.' },
      { status: 400 },
    );
  }

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

    await reference.delete();

    return NextResponse.json({ data: { id } });
  } catch (error) {
    console.error(
      'Failed to delete appointment:',
      error instanceof Error ? error.message : 'unknown error',
    );
    return NextResponse.json(
      { error: 'Unable to delete the appointment.' },
      { status: 500 },
    );
  }
}

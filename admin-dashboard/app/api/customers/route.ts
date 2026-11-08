import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { requireAdminSession } from '@/lib/auth/require-admin';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { serializeCustomer } from '@/lib/firestore/serialize';
import type { ApiListResponse, CustomerDTO } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 500;

function parseLimit(value: string | null): number {
  const parsed = Number.parseInt(value ?? '', 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_LIMIT;
  }
  return Math.min(parsed, MAX_LIMIT);
}

/**
 * GET /api/customers
 *
 * Returns customers sorted by name. Requires a valid, server-verified admin
 * session; the Firebase Admin SDK bypasses client security rules, so this
 * check is the security boundary.
 */
export async function GET(request: NextRequest) {
  const session = await requireAdminSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const limit = parseLimit(request.nextUrl.searchParams.get('limit'));

  try {
    const snapshot = await getAdminFirestore()
      .collection('customers')
      .orderBy('name', 'asc')
      .limit(limit)
      .get();

    const data: CustomerDTO[] = snapshot.docs.map((doc) =>
      serializeCustomer(doc.id, doc.data()),
    );

    const payload: ApiListResponse<CustomerDTO> = {
      data,
      count: data.length,
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error(
      'Failed to load customers:',
      error instanceof Error ? error.message : 'unknown error',
    );
    return NextResponse.json(
      { error: 'Unable to load customers.' },
      { status: 500 },
    );
  }
}

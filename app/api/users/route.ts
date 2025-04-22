import { NextRequest, NextResponse } from 'next/server';
import users from '@/data/users.json';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const secret = process.env.USER_API_SECRET;
  if (authHeader !== `Bearer ${secret}`) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    });
  }

  return NextResponse.json(users);
}

// /app/api/bons/route.ts
import { NextResponse } from 'next/server';
import bons from '@/data/bons.json';

export async function GET() {
  return NextResponse.json(bons);
}

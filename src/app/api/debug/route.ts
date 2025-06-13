import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    hfToken: process.env.HF_TOKEN ? 'Token is set' : 'Token is not set',
    nodeEnv: process.env.NODE_ENV,
    envKeys: Object.keys(process.env).filter(key => key.startsWith('HF_')),
  });
} 
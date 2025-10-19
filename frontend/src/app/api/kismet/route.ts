import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const endpoint = searchParams.get('endpoint');
  const apiKey = searchParams.get('apiKey');

  if (!endpoint || !apiKey) {
    return NextResponse.json(
      { error: 'Missing endpoint or apiKey parameter' },
      { status: 400 }
    );
  }

  try {
    const kismetUrl = `http://192.168.0.128:2501${endpoint}?KISMET=${apiKey}`;

    const response = await fetch(kismetUrl, {
      headers: {
        'User-Agent': 'KismetCameraDetector/1.0',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Kismet API proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to Kismet server' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const endpoint = searchParams.get('endpoint');
  const apiKey = searchParams.get('apiKey');

  if (!endpoint || !apiKey) {
    return NextResponse.json(
      { error: 'Missing endpoint or apiKey parameter' },
      { status: 400 }
    );
  }

  try {
    const kismetUrl = `http://192.168.0.128:2501${endpoint}?KISMET=${apiKey}`;
    const body = await request.text();

    const response = await fetch(kismetUrl, {
      method: 'POST',
      headers: {
        'User-Agent': 'KismetCameraDetector/1.0',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: body,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Kismet API proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to Kismet server' },
      { status: 500 }
    );
  }
}
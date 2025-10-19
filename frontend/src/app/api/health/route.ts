import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check if the application is running properly
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'Kismet Camera Detector',
      version: '1.0.0',
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100,
      },
      environment: process.env.NODE_ENV || 'development',
    };

    return NextResponse.json(healthData);
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
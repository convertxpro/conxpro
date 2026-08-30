import { NextRequest, NextResponse } from 'next/server';
import { getJobProgress } from '@/lib/queue/media-queue';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface RouteContext {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const jobId = params.id;

  if (!jobId) {
    return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
  }

  const acceptHeader = request.headers.get('accept') || '';
  const isSse = acceptHeader.includes('text/event-stream');

  // 1. Server-Sent Events (SSE) streaming mode
  if (isSse) {
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        let isClosed = false;

        const sendEvent = (data: any) => {
          if (isClosed) return;
          try {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
          } catch (e) {
            isClosed = true;
          }
        };

        const checkInterval = 400; // 400ms interval
        const maxTime = 10 * 60 * 1000; // 10 minutes max timeout
        const startTime = Date.now();

        const timer = setInterval(async () => {
          if (isClosed) {
            clearInterval(timer);
            return;
          }

          if (Date.now() - startTime > maxTime) {
            sendEvent({
              jobId,
              status: 'failed',
              progress: 0,
              stage: 'Timeout',
              message: 'Conversion job timed out after 10 minutes.',
            });
            clearInterval(timer);
            controller.close();
            isClosed = true;
            return;
          }

          const progress = await getJobProgress(jobId);

          if (!progress) {
            sendEvent({
              jobId,
              status: 'pending',
              progress: 0,
              stage: 'Queued',
              message: 'Job registered, waiting for worker...',
            });
            return;
          }

          sendEvent(progress);

          if (progress.status === 'completed' || progress.status === 'failed') {
            clearInterval(timer);
            controller.close();
            isClosed = true;
          }
        }, checkInterval);

        request.signal.addEventListener('abort', () => {
          isClosed = true;
          clearInterval(timer);
        });
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  }

  // 2. Standard JSON Polling Mode
  const progress = await getJobProgress(jobId);

  if (!progress) {
    return NextResponse.json({
      success: true,
      jobId,
      status: 'pending',
      progress: 0,
      stage: 'Queued',
      message: 'Job in queue...',
    });
  }

  return NextResponse.json({
    success: true,
    ...progress,
  });
}

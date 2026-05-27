import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  prefix: 'cep-api',
});

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

async function trackAnalytics(request: NextRequest, ip: string) {
  const referer = request.headers.get('referer') || '';
  const origin = request.headers.get('origin') || '';
  const dominio = origin || (referer ? new URL(referer).origin : 'direto');
  const path = request.nextUrl.pathname;
  const dia = getToday();

  // Extrair CEP da URL: /ws/01001000/json
  const match = path.match(/^\/ws\/(\d{5,8})\//);
  const cep = match?.[1] || '';

  // Pipeline: 1 request HTTP com múltiplos comandos (economiza comandos)
  const pipeline = redis.pipeline();
  pipeline.hincrby(`analytics:${dia}`, 'total', 1);
  pipeline.hincrby(`analytics:dominios:${dia}`, dominio, 1);
  if (cep) pipeline.hincrby(`analytics:ceps:${dia}`, cep, 1);
  pipeline.hincrby(`analytics:ips:${dia}`, ip, 1);

  // Expirar em 90 dias
  const ttl = 90 * 24 * 60 * 60;
  pipeline.expire(`analytics:${dia}`, ttl);
  pipeline.expire(`analytics:dominios:${dia}`, ttl);
  if (cep) pipeline.expire(`analytics:ceps:${dia}`, ttl);
  pipeline.expire(`analytics:ips:${dia}`, ttl);

  await pipeline.exec();
}

export async function middleware(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')
    ?? '127.0.0.1';

  const { success, limit, remaining, reset } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json(
      { erro: true, mensagem: 'Limite de requisições excedido. Tente novamente em breve.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': reset.toString(),
          'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }

  // Tracking em background (não bloqueia a resposta)
  request.signal.addEventListener('abort', () => {});
  trackAnalytics(request, ip).catch(() => {});

  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', limit.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set('X-RateLimit-Reset', reset.toString());

  return response;
}

export const config = {
  matcher: ['/ws/:path*'],
};

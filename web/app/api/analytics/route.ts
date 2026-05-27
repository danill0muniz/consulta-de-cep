import { NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'cep-admin-2026';

function getLastDays(n: number): string[] {
  const days: string[] = [];
  for (let i = 0; i < n; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

async function getTopEntries(key: string, limit = 10): Promise<{ nome: string; total: number }[]> {
  const data = await redis.hgetall<Record<string, number>>(key);
  if (!data) return [];
  return Object.entries(data)
    .map(([nome, total]) => ({ nome, total: Number(total) }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  if (token !== ADMIN_TOKEN) {
    return new Response(JSON.stringify({ erro: true, mensagem: 'Token inválido.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const dias = request.nextUrl.searchParams.get('dias') || '7';
  const numDias = Math.min(parseInt(dias), 90);
  const periodos = getLastDays(numDias);

  const pipeline = redis.pipeline();
  for (const dia of periodos) {
    pipeline.hget(`analytics:${dia}`, 'total');
  }
  const totaisDiarios = await pipeline.exec<(number | null)[]>();

  const requestsPorDia = periodos.map((dia, i) => ({
    dia,
    total: Number(totaisDiarios[i]) || 0,
  }));

  const totalGeral = requestsPorDia.reduce((acc, d) => acc + d.total, 0);

  const hoje = periodos[0];
  const [topDominios, topCeps, topIps] = await Promise.all([
    getTopEntries(`analytics:dominios:${hoje}`, 20),
    getTopEntries(`analytics:ceps:${hoje}`, 20),
    getTopEntries(`analytics:ips:${hoje}`, 20),
  ]);

  const [topDominiosPeriodo, topCepsPeriodo] = await Promise.all([
    (async () => {
      const merged: Record<string, number> = {};
      for (const dia of periodos) {
        const data = await redis.hgetall<Record<string, number>>(`analytics:dominios:${dia}`);
        if (data) {
          for (const [k, v] of Object.entries(data)) {
            merged[k] = (merged[k] || 0) + Number(v);
          }
        }
      }
      return Object.entries(merged)
        .map(([nome, total]) => ({ nome, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 20);
    })(),
    (async () => {
      const merged: Record<string, number> = {};
      for (const dia of periodos) {
        const data = await redis.hgetall<Record<string, number>>(`analytics:ceps:${dia}`);
        if (data) {
          for (const [k, v] of Object.entries(data)) {
            merged[k] = (merged[k] || 0) + Number(v);
          }
        }
      }
      return Object.entries(merged)
        .map(([nome, total]) => ({ nome, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 20);
    })(),
  ]);

  return new Response(JSON.stringify({
    periodo: { dias: numDias, de: periodos[periodos.length - 1], ate: periodos[0] },
    total_requests: totalGeral,
    requests_por_dia: requestsPorDia,
    hoje: {
      total: requestsPorDia[0].total,
      top_dominios: topDominios,
      top_ceps: topCeps,
      top_ips: topIps,
    },
    periodo_completo: {
      top_dominios: topDominiosPeriodo,
      top_ceps: topCepsPeriodo,
    },
  }, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

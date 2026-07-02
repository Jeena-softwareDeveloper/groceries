/**
 * Simple load test for DistrictMart API health + home feed.
 * Usage: node scripts/load-test.mjs [baseUrl] [concurrency] [requests]
 * Example: node scripts/load-test.mjs http://127.0.0.1:3000 10 100
 */

const baseUrl = process.argv[2] ?? 'http://127.0.0.1:3000';
const concurrency = Number(process.argv[3] ?? 10);
const total = Number(process.argv[4] ?? 100);

const endpoints = [
  '/api/v1/health',
  '/api/v1/customer/categories',
];

async function hit(path) {
  const start = performance.now();
  const res = await fetch(`${baseUrl}${path}`);
  const ms = performance.now() - start;
  return { ok: res.ok, status: res.status, ms };
}

async function worker(results, getNext) {
  while (true) {
    const i = getNext();
    if (i >= total) break;
    const path = endpoints[i % endpoints.length];
    results.push(await hit(path));
  }
}

let next = 0;
const getNext = () => next++;

const results = [];
const started = performance.now();
await Promise.all(Array.from({ length: concurrency }, () => worker(results, getNext)));
const elapsed = performance.now() - started;

const ok = results.filter((r) => r.ok).length;
const avg = results.reduce((s, r) => s + r.ms, 0) / results.length;
const p95 = [...results].sort((a, b) => a.ms - b.ms)[Math.floor(results.length * 0.95)]?.ms ?? 0;

console.log(JSON.stringify({ baseUrl, total, ok, failed: total - ok, avgMs: Math.round(avg), p95Ms: Math.round(p95), elapsedMs: Math.round(elapsed) }, null, 2));

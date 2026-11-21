const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
function client(fetch) {
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../lib/api.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  vm.runInNewContext(source, { exports, fetch, process: { env: {} }, console, URLSearchParams }); return exports;
}
const payload = { lead_prospect_id: 'fixture-lead', name: 'Fixture', phone: '0412345678', site: 'BYD Fairfield', assigned_to: 'Fixture Consultant' };
test('a network failure or backend rejection cannot fabricate an allocation receipt', async () => {
  for (const fetch of [async () => { throw Error('Network unavailable'); }, async () => ({ ok: false, json: async () => ({ message: 'Staff unavailable' }) }), async () => ({ ok: true, json: async () => ({ success: false }) }), async () => ({ ok: true, json: async () => ({ success: true, quarantined: true }) })]) {
    await assert.rejects(client(fetch).allocateLeadToSalesCrm(payload));
  }
});
test('only server-issued allocation IDs are accepted and retry uses the same event identity', async () => {
  const calls = []; const api = client(async (url, options) => { calls.push(JSON.parse(options.body)); return { ok: true, json: async () => ({ success: true, allocation_id: 'real-allocation', customer_id: 'real-customer' }) }; });
  const receipt = await api.allocateLeadToSalesCrm(payload); await api.allocateLeadToSalesCrm(payload);
  assert.equal(receipt.allocation_id, 'real-allocation'); assert.equal(receipt.customer_id, 'real-customer');
  assert.equal(calls[0].event_id, calls[1].event_id);
  assert.equal(calls[0].payload.prospect_id, payload.lead_prospect_id);
});

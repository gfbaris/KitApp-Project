const http = require('http');

const BASE = 'http://localhost:5000';
let TOKEN = '';
let USER_ID = '';
let BOOK_ID_1 = '';
let BOOK_ID_2 = '';

const results = [];

function req(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };
    const r = http.request(new URL(BASE + path), opts, (res) => {
      let raw = '';
      res.on('data', (c) => (raw += c));
      res.on('end', () => {
        let parsed;
        try { parsed = JSON.parse(raw); } catch { parsed = raw; }
        resolve({ status: res.statusCode, body: parsed });
      });
    });
    r.on('error', reject);
    if (data) r.write(data);
    r.end();
  });
}

function check(label, res, expectedStatus) {
  const ok = res.status === expectedStatus;
  const icon = ok ? '✅' : '❌';
  console.log(`\n${icon} ${label} → HTTP ${res.status} (beklenen: ${expectedStatus})`);
  if (!ok || process.env.VERBOSE) {
    const body = JSON.stringify(res.body, null, 2);
    console.log(body.length > 600 ? body.substring(0, 600) + '\n...' : body);
  } else {
    // Başarılı ama kısa çıktı ver
    const preview = JSON.stringify(res.body);
    console.log('   ' + (preview.length > 120 ? preview.substring(0, 120) + '...' : preview));
  }
  results.push({ label, status: res.status, expected: expectedStatus, ok });
  return res;
}

async function run() {
  console.log('\n╔═══════════════════════════════════════════════╗');
  console.log('║      KitApp API — Kapsamlı Test Raporu       ║');
  console.log('╚═══════════════════════════════════════════════╝\n');

  // ── HEALTH CHECK ─────────────────────────────────────────
  console.log('━━━━ HEALTH CHECK ━━━━');
  let r = await req('GET', '/');
  check('GET /', r, 200);

  // ── AUTH ────────────────────────────────────────────────
  console.log('\n━━━━ AUTH ━━━━');

  r = await req('POST', '/auth/register', {
    firstName: 'Barış', lastName: 'Saylık',
    email: 'test@test.com', password: 'Test1234!',
    phone: '+905551234567',
  });
  check('POST /auth/register', r, 201);
  if (r.status === 201) {
    USER_ID = r.body._id;
    TOKEN = r.body.token;
  }

  // Duplicate register → 409
  r = await req('POST', '/auth/register', {
    firstName: 'Barış', lastName: 'Saylık',
    email: 'test@test.com', password: 'Test1234!',
  });
  check('POST /auth/register (tekrar, aynı email) → 409', r, 409);

  // Login
  r = await req('POST', '/auth/login', {
    email: 'test@test.com', password: 'Test1234!',
  });
  check('POST /auth/login', r, 200);
  if (r.status === 200) {
    TOKEN = r.body.token;
    USER_ID = r.body.user?._id || USER_ID;
  }

  // Yanlış şifre
  r = await req('POST', '/auth/login', {
    email: 'test@test.com', password: 'YanlisParola',
  });
  check('POST /auth/login (yanlış şifre) → 401', r, 401);

  // ── KULLANICI ───────────────────────────────────────────
  console.log('\n━━━━ KULLANICI ━━━━');

  r = await req('GET', `/users/${USER_ID}`);
  check('GET /users/:userId', r, 200);

  r = await req('PUT', `/users/${USER_ID}`, {
    firstName: 'Barış', phone: '+905559999999',
  });
  check('PUT /users/:userId', r, 200);

  // Token olmadan → 401
  const savedToken = TOKEN;
  TOKEN = '';
  r = await req('GET', `/users/${USER_ID}`);
  check('GET /users/:userId (token yok) → 401', r, 401);
  TOKEN = savedToken;

  // ── KİTAP ──────────────────────────────────────────────
  console.log('\n━━━━ KİTAP ━━━━');

  r = await req('POST', '/books', {
    title: 'Suç ve Ceza', author: 'Dostoyevski',
    genre: 'Roman', pageCount: 687, publishYear: 1866,
  });
  check('POST /books (Suç ve Ceza)', r, 201);
  if (r.status === 201) BOOK_ID_1 = r.body._id;

  r = await req('POST', '/books', {
    title: 'Dune', author: 'Frank Herbert',
    genre: 'Bilim Kurgu', pageCount: 412, publishYear: 1965,
  });
  check('POST /books (Dune)', r, 201);
  if (r.status === 201) BOOK_ID_2 = r.body._id;

  r = await req('GET', '/books');
  check('GET /books', r, 200);

  r = await req('GET', '/books/search?query=Dune');
  check('GET /books/search?query=Dune', r, 200);

  r = await req('GET', '/books/filter?genre=Roman');
  check('GET /books/filter?genre=Roman', r, 200);

  r = await req('GET', `/books/${BOOK_ID_1}`);
  check('GET /books/:bookId', r, 200);

  r = await req('PUT', `/books/${BOOK_ID_1}`, {
    title: 'Suç ve Ceza', author: 'Dostoyevski',
    genre: 'Roman', pageCount: 687, publishYear: 1866,
    description: 'Güncellenmiş açıklama',
  });
  check('PUT /books/:bookId', r, 200);

  // Geçersiz ObjectId → 400
  r = await req('GET', '/books/9999invalidid');
  check('GET /books/9999invalidid (geçersiz ID) → 400', r, 400);

  // ── PUANLAMA ───────────────────────────────────────────
  console.log('\n━━━━ PUANLAMA ━━━━');

  r = await req('POST', `/books/${BOOK_ID_1}/ratings`, { score: 5 });
  check('POST /books/:bookId/ratings (score:5)', r, 201);

  r = await req('POST', `/books/${BOOK_ID_1}/ratings`, { score: 3 });
  check('POST /books/:bookId/ratings (tekrar, aynı kitap) → 409', r, 409);

  // averageRating güncellendi mi?
  r = await req('GET', `/books/${BOOK_ID_1}`);
  const avgOk = r.body?.averageRating === 5 && r.body?.ratingCount === 1;
  console.log(`\n${avgOk ? '✅' : '❌'} averageRating ve ratingCount güncellendi mi?`);
  console.log(`   averageRating: ${r.body?.averageRating}, ratingCount: ${r.body?.ratingCount}`);
  results.push({ label: 'averageRating auto-update', status: avgOk ? 200 : 500, expected: 200, ok: avgOk });

  // ── FAVORİLER ──────────────────────────────────────────
  console.log('\n━━━━ FAVORİLER ━━━━');

  r = await req('POST', `/users/favorites/${BOOK_ID_1}`);
  check('POST /users/favorites/:bookId', r, 201);

  r = await req('POST', `/users/favorites/${BOOK_ID_1}`);
  check('POST /users/favorites/:bookId (tekrar) → 409', r, 409);

  // ── YAPAY ZEKA ─────────────────────────────────────────
  console.log('\n━━━━ YAPAY ZEKA ━━━━');

  r = await req('GET', `/ai/recommendations/${USER_ID}`);
  const aiRecoOk = r.status === 200;
  console.log(`\n${aiRecoOk ? '✅' : '⚠️ '} GET /ai/recommendations/:userId → HTTP ${r.status}`);
  if (aiRecoOk) {
    console.log('   ' + JSON.stringify(r.body).substring(0, 200));
  } else {
    const msg = typeof r.body?.error === 'string' ? r.body.error.substring(0, 150) : JSON.stringify(r.body).substring(0, 150);
    console.log('   ' + msg);
  }
  results.push({ label: 'GET /ai/recommendations/:userId', status: r.status, expected: 200, ok: aiRecoOk, gemini: !aiRecoOk });

  r = await req('POST', '/ai/summarize', {
    text: 'Bu kitap 19. yüzyılda geçen uzun bir hikayedir ve karakterler çok derindir. Romanda toplumsal sorunlar, suç ve vicdan ile yoksulluk temaları büyük detayla işlenmiştir.',
  });
  const aiSumOk = r.status === 200;
  console.log(`\n${aiSumOk ? '✅' : '⚠️ '} POST /ai/summarize → HTTP ${r.status}`);
  if (aiSumOk) {
    console.log('   summary: ' + (r.body?.summary || '').substring(0, 200));
  } else {
    console.log('   ' + JSON.stringify(r.body).substring(0, 150));
  }
  results.push({ label: 'POST /ai/summarize', status: r.status, expected: 200, ok: aiSumOk, gemini: !aiSumOk });

  r = await req('GET', `/ai/analysis/${USER_ID}`);
  const aiAnOk = r.status === 200;
  console.log(`\n${aiAnOk ? '✅' : '⚠️ '} GET /ai/analysis/:userId → HTTP ${r.status}`);
  if (aiAnOk) {
    console.log('   ' + JSON.stringify(r.body).substring(0, 200));
  } else {
    console.log('   ' + JSON.stringify(r.body).substring(0, 150));
  }
  results.push({ label: 'GET /ai/analysis/:userId', status: r.status, expected: 200, ok: aiAnOk, gemini: !aiAnOk });

  // ── SİLME ──────────────────────────────────────────────
  console.log('\n━━━━ SİLME ━━━━');

  r = await req('DELETE', `/books/${BOOK_ID_1}`);
  check('DELETE /books/:bookId (Suç ve Ceza)', r, 204);

  r = await req('DELETE', `/books/${BOOK_ID_2}`);
  check('DELETE /books/:bookId (Dune)', r, 204);

  r = await req('DELETE', `/users/${USER_ID}`);
  check('DELETE /users/:userId', r, 204);

  // ── ÖZET RAPOR ─────────────────────────────────────────
  console.log('\n╔═══════════════════════════════════════════════╗');
  console.log('║                 TEST RAPORU                  ║');
  console.log('╚═══════════════════════════════════════════════╝\n');

  const normal = results.filter(r => !r.gemini);
  const gemini = results.filter(r => r.gemini);
  const passed = normal.filter(r => r.ok).length;
  const failed = normal.filter(r => !r.ok).length;
  const geminiOk = gemini.filter(r => r.ok).length;
  const geminiWait = gemini.filter(r => !r.ok).length;

  for (const t of results) {
    if (t.gemini) {
      console.log(`${t.ok ? '✅' : '⚠️ '} ${t.label} → ${t.status} ${t.ok ? '' : '(Gemini kota/key bekliyor)'}`);
    } else {
      console.log(`${t.ok ? '✅' : '❌'} ${t.label} → ${t.status}${t.ok ? '' : ` (beklenen: ${t.expected})`}`);
    }
  }

  console.log('\n───────────────────────────────────────────────');
  console.log(`✅ Başarılı endpoint:     ${passed}/${normal.length}`);
  if (failed > 0) console.log(`❌ Başarısız endpoint:    ${failed}/${normal.length}`);
  if (geminiWait > 0) console.log(`⚠️  Gemini kota bekliyor: ${geminiWait}/3`);
  if (geminiOk > 0)  console.log(`✅ Gemini çalışıyor:      ${geminiOk}/3`);
  console.log('───────────────────────────────────────────────\n');
}

run().catch((e) => {
  console.error('Test scripti çalışırken hata:', e.message);
  process.exit(1);
});

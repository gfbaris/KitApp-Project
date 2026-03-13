const http = require('http');

const BASE = 'http://localhost:5000';
let TOKEN = '';
let USER_ID = '';
let BOOK_ID = '';

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };
    const url = new URL(BASE + path);
    const req = http.request(url, options, (res) => {
      let raw = '';
      res.on('data', (c) => (raw += c));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(raw) }); }
        catch { resolve({ status: res.statusCode, body: raw }); }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function log(label, res) {
  const ok = res.status >= 200 && res.status < 300;
  console.log(`\n${ok ? '✅' : '❌'} ${label} → HTTP ${res.status}`);
  console.log(JSON.stringify(res.body, null, 2));
}

async function run() {
  console.log('═══════════════════════════════════════');
  console.log('  KitApp AI Endpoint Testi');
  console.log('═══════════════════════════════════════');

  // Login
  let r = await request('POST', '/auth/login', {
    email: 'ai_test@kitapptest.com', password: 'Test1234!',
  });

  if (r.status !== 200) {
    // Kullanıcı yok, register et
    r = await request('POST', '/auth/register', {
      firstName: 'AI', lastName: 'Test',
      email: 'ai_test@kitapptest.com', password: 'Test1234!',
    });
  }
  TOKEN = r.body.token || r.body.token;
  USER_ID = r.body._id || r.body.user?._id;
  if (!TOKEN && r.body.token) TOKEN = r.body.token;
  if (!USER_ID && r.body._id) USER_ID = r.body._id;
  console.log(`\n🔑 Token alındı, UserID: ${USER_ID}`);

  // Kitap ekle ve puan ver
  r = await request('POST', '/books', {
    title: 'Sapiens', author: 'Yuval Noah Harari',
    genre: 'Tarih', pageCount: 512, publishYear: 2011,
  });
  BOOK_ID = r.body._id;
  await request('POST', `/books/${BOOK_ID}/ratings`, { score: 5 });
  await request('POST', `/users/favorites/${BOOK_ID}`, null);
  console.log(`\n📚 Test kitabı eklendi: ${BOOK_ID}`);

  // AI Recommendations
  r = await request('GET', `/ai/recommendations/${USER_ID}`);
  log('GET /ai/recommendations/:userId (Gemini-2.0-flash)', r);

  // AI Summarize
  r = await request('POST', '/ai/summarize', {
    text: 'Sapiens, insanlığın 70,000 yıllık tarihini anlatan çığır açıcı bir eserdir. Yazar Harari, Bilişsel Devrim, Tarım Devrimi ve Bilimsel Devrim gibi dönüm noktalarını mercek altına alarak Homo sapiens\'in nasıl dünyanın hâkim türü haline geldiğini sorgulamaktadır.',
  });
  log('POST /ai/summarize (Gemini-2.0-flash)', r);

  // AI Analysis
  r = await request('GET', `/ai/analysis/${USER_ID}`);
  log('GET /ai/analysis/:userId (Gemini-2.0-flash)', r);

  // Temizlik
  await request('DELETE', `/users/${USER_ID}`);
  console.log('\n🧹 Test kullanıcısı silindi');

  console.log('\n═══════════════════════════════════════');
  console.log('  AI Testi Tamamlandı!');
  console.log('═══════════════════════════════════════\n');
}

run().catch(console.error);

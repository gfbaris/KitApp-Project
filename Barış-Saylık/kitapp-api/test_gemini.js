const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = 'AIzaSyBL7uP-Pt3rMWhAzF0RiDO_nOWuQvWb_Es';
const models = [
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash-exp',
  'gemini-pro',
  'gemini-1.0-pro',
];

async function testModel(modelName) {
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent('Merhaba! 1+1 kaçtır? Sadece sayı ile cevapla.');
    const text = result.response.text();
    console.log(`✅ ${modelName} → "${text.trim()}"`);
    return true;
  } catch (e) {
    const msg = e.message.includes('429') ? '429 Kota aşıldı' :
                e.message.includes('404') ? '404 Model bulunamadı' :
                e.message.substring(0, 80);
    console.log(`❌ ${modelName} → ${msg}`);
    return false;
  }
}

async function run() {
  console.log('Gemini model listesi test ediliyor...\n');
  for (const m of models) {
    const ok = await testModel(m);
    if (ok) {
      console.log(`\n🎯 Çalışan model: ${m}`);
      break;
    }
  }
}

run().catch(console.error);

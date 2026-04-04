# Web Frontend Görev Dağılımı

**Web Frontend Adresi:** [kitapp-web.vercel.app](https://kitapp-web.vercel.app)

Bu dokümanda, web uygulamasının kullanıcı arayüzü (UI) ve kullanıcı deneyimi (UX) görevleri listelenmektedir. Her grup üyesi, kendisine atanan sayfaların tasarımı, implementasyonu ve kullanıcı etkileşimlerinden sorumludur.

---

## Grup Üyelerinin Web Frontend Görevleri

1. [Barış Saylık'ın Web Frontend Görevleri](Barış-Saylık/Barış-Saylık-Web-Frontend-Gorevleri.md)


---

## Genel Web Frontend Prensipleri

### 1. Responsive Tasarım
- **Mobile-First Approach:** Tailwind'in `sm:`, `md:`, `lg:` prefixleri ile önce mobil, sonra desktop tasarımı.
- **Breakpoints:** 
  - Mobile: < 640px
  - Tablet: 640px - 1024px
  - Desktop: > 1024px
- **Flexible Layouts:** Flexbox ve Grid sisteminin yoğun kullanımı.
- **Modern UI:** Glassmorphism ve modern kart tasarımları.

### 2. Tasarım Sistemi
- **CSS Framework:** Tailwind CSS (Utility-first CSS).
- **Renk Paleti:** Özel renk paleti ve tutarlı gradyan geçişleri.
- **Tipografi:** Google Fonts (Inter, Roboto gibi sans-serif fontlar).
- **Iconography:** Lucide-React ikon kütüphanesi.
- **Micro-interactions:** Hover efektleri ve yumuşak geçişler (transitions).

### 3. Performans Optimizasyonu
- **Build Tool:** Vite (Hızlı geliştirme ve optimize edilmiş build).
- **Lazy Loading:** `React.lazy` ve `Suspense` ile sayfa bazlı yükleme.
- **Asset Optimization:** SVG ve optimize edilmiş görseller.
- **Code Splitting:** Dinamik route importları.

### 4. SEO ve Semantic HTML
- **Semantic HTML:** `<header>`, `<main>`, `<section>`, `<article>`, `<footer>` kullanımı.
- **Meta Tags:** Her sayfa için dinamik title ve description (SEO dostu).
- **Accessibility:** Erişilebilir butonlar, input labellerı ve resim alt metinleri.

### 5. State Management
- **Hooks:** `useState`, `useEffect`, `useContext` ve `useMemo`.
- **Global State:** Verilere merkezi erişim için React Context API.
- **Persistence:** LocalStorage ile oturum ve tema yönetimi.

### 6. Client-Side Routing
- **Library:** React Router DOM.
- **Protected Routes:** Yetkisiz kullanıcıların profil sayfasına erişiminin engellenmesi.
- **Deep Linking:** Dinamik kitap detay sayfaları (`/books/:id`).

### 7. API Entegrasyonu
- **HTTP Client:** Axios (Interceptors ile merkezi hata yönetimi).
- **Async Handling:** async/await yapısı ve try/catch blokları.
- **Loading States:** Veri çekme sırasında istersen spinner veya skeleton ekranlar.

### 8. Yapay Zeka (AI) Entegrasyonu
- **Gemini AI:** Backend üzerinden sağlanan AI asistanı, kitap özetleme ve kişisel okuma analizleri.
- **Dynamic Content:** AI tarafından üretilen içeriklerin akıcı bir şekilde ekranda gösterilmesi.

### 9. Build ve Deployment
- **Deployment:** Vercel (CD - Continuous Deployment üzerinden GitHub entegrasyonu).
- **Env Management:** `.env` dosyaları ile API URL yönetimi (VITE_API_URL).
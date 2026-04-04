# Barış Saylık'ın Web Frontend Görevleri
**Front-end Canlı Adres:** [kitapp-web.vercel.app](https://kitapp-web.vercel.app)
**Front-end Test Videosu:** [YouTube Video Linki](https://youtu.be/j86ZRsYZXYE)

## 1. Ana Sayfa (Home Page) & Kütüphane Yönetimi
- **API Endpoints:** `GET /books`, `GET /ai/recommendations/{userId}`
- **Görev:** Kullanıcının tüm dijital kütüphanesini yönettiği, modern ve dinamik ana sayfanın tasarımı ve geliştirilmesi.
- **UI Bileşenleri:**
  - **Glassmorphism Kitap Kartları:** Kitap kapakları, başlık, yazar ve tür bilgilerini içeren modern kart yapısı.
  - **Dinamik Filtreleme Barı:** 'Hepsi', 'Roman', 'Bilim Kurgu' gibi kategorilere göre anlık içerik değişimi.
  - **Yapay Zeka Önerileri Modülü:** Sağ tarafta yer alan, Gemini AI tarafından üretilen kişiselleştirilmiş kitap önerileri paneli.
  - **Gelişmiş Arama Barı:** Kitap adı veya yazara göre anlık arama (Navbar entegrasyonu).
  - **Kitap Ekleme Modalı:** Yeni kitap girişi için temiz ve kullanıcı dostu bir form arayüzü.
- **Kullanıcı Deneyimi (UX):**
  - **Skeleton Loading:** Veriler yüklenirken içerik yerleşimini koruyan animasyonlu yükleme blokları.
  - **Boş Durum (Empty State):** Kütüphanede kitap olmadığında kullanıcıyı ilk adımına yönlendiren yaratıcı yönlendirme ekranı.
  - **Responsive Grid:** Mobil cihazlarda tek sütun, geniş ekranlarda 4+ sütunlu esnek yerleşim.
- **Teknik Detaylar:**
  - **Framework:** React (Vite)
  - **Styling:** Tailwind CSS (Utility-first)
  - **State Management:** React Context API & useCallback hooks
  - **AI Integration:** Backend'den gelen Gemini önerilerinin parse edilerek asenkron gösterimi.

## 2. Kitap Detay Sayfası & Etkileşimler
- **API Endpoints:** `GET /books/{bookId}`, `POST /books/rate/{bookId}`, `POST /users/favorites/{bookId}`, `POST /ai/summarize`
- **Görev:** Kitap detaylarının sergilendiği ve kullanıcı etkileşimlerinin (puanlama, favori, AI özet) yönetildiği merkezi sayfanın geliştirilmesi.
- **UI Bileşenleri:**
  - **Yıldızlı Puanlama Sistemi:** 1-5 arası interaktif (hover efektli) puanlama arayüzü.
  - **Favori Toggle:** Kalp ikonu ile favorilere anlık ekleme/çıkarma mekanizması.
  - **AI Özet Paneli:** Tek tuşla kitabın açıklamasından 3 cümlelik Türkçe özet üreten Gemini AI entegrasyonu.
  - **İstatistik Kartları:** Sayfa sayısı, yayın yılı ve topluluk ortalama puanının gösterildiği info-kartlar.
  - **Breadcrumb Navigasyon:** Kullanıcının kütüphane ve detay arasında kolayca geçiş yapmasını sağlayan yol gösterici.
- **Kullanıcı Deneyimi (UX):**
  - **Optimistic Updates:** Favori butonuna basıldığında sunucu yanıtı beklenmeden UI'ın anlık tepki vermesi.
  - **İşlem Bildirimleri:** Puanlama veya favori işlemleri sonrası Toast mesajları ile geri bildirim.
  - **Hata Yönetimi:** AI özeti oluşturulamadığında veya kitap bulunamadığında gösterilen kullanıcı dostu hata mesajları.
- **Teknik Detaylar:**
  - **Routing:** React Router DOM (Dynamic params usage)
  - **API Handling:** Axios ile merkezi CRUD işlemleri ve asenkron state güncellemeleri.
  - **AI Logic:** `summarizeBook` servisi üzerinden büyük metinlerin özete dönüştürülmesi.

## 3. Kullanıcı Profil Sayfası & Okuma Analizi
- **API Endpoints:** `GET /users/{userId}`, `GET /ai/analysis/{userId}`, `PUT /users/{userId}`
- **Görev:** Kullanıcı bilgilerinin yönetildiği ve tüm okuma geçmişinin yapay zeka ile analiz edildiği gelişmiş profil sayfasının tasarımı.
- **UI Bileşenleri:**
  - **Kullanıcı Bilgi Kartı:** Avatar, isim, soyisim ve e-posta bilgilerini içeren şık tasarım.
  - **Yapay Zeka Okuma İçgörüleri:** Gemini AI tarafından hazırlanan, kullanıcının okuma karakterini analiz eden (örn: "Analitik bir okursun") bölüm.
  - **Okuma İstatistikleri:** Toplam kitap, ortalama puan ve favori türlerin görselleştirildiği bölümler.
  - **Profil Düzenleme Formu:** Mevcut bilgilerin güncellendiği, validasyonlu form yapısı.
- **Kullanıcı Deneyimi (UX):**
  - **Skeleton Screen:** AI analizi karmaşık olduğu için yükleme sırasında kullanıcıya ilerleme hissi veren animasyonlar.
  - **Hızlı Erişim:** "Hesabı Sil" gibi kritik işlemler için modal onay sistemli güvenli akışlar.
- **Teknik Detaylar:**
  - **Global State:** AuthContext üzerinden kullanıcı verilerinin tüm uygulamada senkronizasyonu.
  - **Backend AI Logic:** Kullanıcı rating ve favori verilerinin backend'e gönderilerek NLP analizinden geçirilmesi.

## 4. Kimlik Doğrulama (Sign In / Sign Up)
- **API Endpoints:** `POST /auth/login`, `POST /auth/register`
- **Görev:** Güvenli ve şık giriş/kayıt ekranlarının implementasyonu.
- **UI Bileşenleri:**
  - **Modern Giriş Formu:** Email/şifre validasyonlu, interaktif input alanları.
  - **Kayıt Formu:** Şifre gücü kontrolü ve şifre tekrarı doğrulama mekanizması.
  - **Hata Bildirimleri:** Hatalı girişlerde (örn: "Şifre yanlış") anlık kırmızı uyarılar.
- **Teknik Detaylar:**
  - **JWT Management:** Login sonrası token'ın LocalStorage ve Context'te güvenli saklanması.
  - **Interceptor:** Her API isteğine yetkilendirme token'ının otomatik eklenmesi.

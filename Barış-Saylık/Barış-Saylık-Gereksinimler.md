1. **Üye Olma** (Barış Saylık)
   - **API Metodu:** `POST /auth/register`
   - **Açıklama:** Kullanıcıların yeni hesaplar oluşturarak sisteme kayıt olmasını sağlar. Kişisel bilgilerin toplanmasını ve hesap oluşturma işlemlerini içerir. Kullanıcılar email adresi ve şifre belirleyerek hesap oluşturur.

2. **Giriş Yapma** (Barış Saylık)
   - **API Metodu:** `POST /auth/login`
   - **Açıklama:** Kullanıcıların sisteme güvenli bir şekilde giriş yapmasını ve yetkilendirme (JWT token vb.) almasını sağlar. Kullanıcılar kayıtlı email adresi ve şifreleri ile kimlik doğrulaması gerçekleştirir. Güvenli oturum yönetimi için temel gereksinimdir.

3. **Profil Görüntüleme** (Barış Saylık)
   - **API Metodu:** `GET /users/{userId}`
   - **Açıklama:** Kullanıcının profil bilgilerini görüntülemesini sağlar. Kullanıcı adı, email, telefon gibi kişisel bilgiler ve hesap durumu gösterilir. Kullanıcılar kendi profil bilgilerini görüntüleyebilir veya yöneticiler diğer kullanıcıların bilgilerini inceleyebilir. Güvenlik için giriş yapmış olmak gerekir.

4. **Profil Güncelleme** (Barış Saylık)
   - **API Metodu:** `PUT /users/{userId}`
   - **Açıklama:** Kullanıcının profil bilgilerini güncellemesini sağlar. Kullanıcılar ad, soyad, email, telefon gibi kişisel bilgilerini değiştirebilir. Güvenlik için giriş yapmış olmak gerekir ve kullanıcılar yalnızca kendi bilgilerini güncelleyebilir.

5. **Hesap Silme** (Barış Saylık)
   - **API Metodu:** `DELETE /users/{userId}`
   - **Açıklama:** Kullanıcının hesabını sistemden kalıcı olarak silmesini sağlar. Kullanıcı hesabını kapatmak istediğinde veya yönetici tarafından hesap kapatılması gerektiğinde kullanılır. Bu işlem geri alınamaz ve kullanıcının tüm verileri silinir. Güvenlik için giriş yapmış olmak gerekir.

6. **Kitap Ekleme** (Barış Saylık)
   - **API Metodu:** `POST /books`
   - **Açıklama:** Sisteme (genel kütüphaneye) yeni bir kitap eklenmesini sağlar. Kitabın adı, yazarı, sayfa sayısı, yayın yılı, kapağı ve açıklaması gibi temel veriler kaydedilir.

7. **Kitapları Listeleme** (Barış Saylık)
   - **API Metodu:** `GET /books`
   - **Açıklama:** Sistemde kayıtlı olan tüm kitapların listelenmesini sağlar. Ana sayfada veya kütüphane keşfet bölümünde kitapların genel görünümünü sunar.

8. **Kitap Detaylarını Görüntüleme** (Barış Saylık)
   - **API Metodu:** `GET /books/{bookId}`
   - **Açıklama:** Seçilen belirli bir kitabın tüm detay bilgilerinin (özet, yazar bilgisi, sayfa sayısı, genel puan durumu vb.) tek bir sayfada görüntülenmesini sağlar. Kullanıcılar kitap hakkında kapsamlı bilgi almak istediklerinde tetiklenir.

9. **Kitap Güncelleme** (Barış Saylık)
   - **API Metodu:** `PUT /books/{bookId}`
   - **Açıklama:** Sistemde mevcut olan bir kitabın hatalı veya eksik bilgilerinin (örneğin kapağının değişmesi, özetinin güncellenmesi) değiştirilmesini sağlar.

10. **Kitap Silme** (Barış Saylık)
    - **API Metodu:** `DELETE /books/{bookId}`
    - **Açıklama:** Sistemde kayıtlı bir kitabın veritabanından kalıcı veya geçici (soft delete) olarak silinmesini sağlar. Hatalı eklenmiş veya kütüphaneden kaldırılması gereken kitaplar için kullanılır.

11. **Kitap Arama** (Barış Saylık)
    - **API Metodu:** `GET /books/search?query={keyword}`
    - **Açıklama:** Kullanıcıların kitap adı, yazar adı veya ISBN numarası gibi anahtar kelimeleri kullanarak kütüphanede spesifik aramalar yapmasını sağlar. Arama sonuçları listelenerek kullanıcıya ilgili kitaplar sunulur.

12. **Kitapları Filtreleme** (Barış Saylık)
    - **API Metodu:** `GET /books/filter?genre={genreId}`
    - **Açıklama:** Kitapların belirli kategorilere (Roman, Bilim Kurgu, Tarih, Polisiye vb.) göre filtrelenerek listelenmesini sağlar. Kullanıcıların ilgi alanlarına uygun türdeki kitapları daha kolay bulmasına olanak tanır.

13. **Favorilere Ekleme** (Barış Saylık)
    - **API Metodu:** `POST /users/favorites/{bookId}`
    - **Açıklama:** Kullanıcının ilgisini çeken veya daha sonra okumak istediği kitapları kişisel favori listesine kaydetmesini sağlar. Kullanıcıya özel bir alan yaratarak platform içindeki deneyimini kişiselleştirir. Güvenlik için giriş yapmış olmak gerekir.

14. **Puanlama** (Barış Saylık)
    - **API Metodu:** `POST /books/{bookId}/ratings`
    - **Açıklama:** Kullanıcının okuduğu bir kitabı 1 ile 5 yıldız arasında değerlendirmesini (puan vermesini) sağlar. Yapılan bu kişisel değerlendirmeler, kitabın sistemdeki genel puan ortalamasını etkiler. Güvenlik için giriş yapmış olmak gerekir.

### Yapay Zeka Gereksinimleri 

1. **Kişiselleştirilmiş Kitap Önerisi** (Barış Saylık)
   - **API Metodu:** `GET /ai/recommendations/{userId}`
   - **Açıklama:** Kullanıcının kütüphanesindeki kitapları, favorilerini ve verdiği puanları analiz ederek, yapay zeka destekli algoritma ile kullanıcının sevebileceği yeni kitap tavsiyeleri sunar. 

2. **Otomatik Kitap Özeti Oluşturma** (Barış Saylık)
   - **API Metodu:** `POST /ai/summarize`
   - **Açıklama:** Uzun kitap açıklamalarını veya kullanıcının kitaba dair girdiği karmaşık notları analiz eden yapay zeka modelinin, kısa, akıcı ve anlaşılır bir özet metni (summary) üretmesini sağlar.

3. **Okuma Alışkanlığı Analizi** (Barış Saylık)
   - **API Metodu:** `GET /ai/analysis/{userId}`
   - **Açıklama:** Kullanıcının okuma sıklığı, bitirdiği kitapların sayfa sayıları ve ağırlıklı olarak okuduğu türler üzerinden yapay zeka destekli bir okuma profili çıkarır. Kullanıcıya "Genelde hafta sonları bilim kurgu okumayı seviyorsun" gibi kişiselleştirilmiş içgörüler sunar.
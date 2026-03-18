# Barış Saylık'ın REST API Metotları

**API Test Videosu:** [API Test Videosunu İzle](https://youtu.be/IYP7XNy15lg)

---

## 🔐 1. Auth & Kullanıcı Metotları

### 1.1. Üye Olma
- **Endpoint:** `POST /auth/register`
- **Request Body:**
  ```json
  {
    "firstName": "Barış",
    "lastName": "Saylık",
    "email": "baris@example.com",
    "password": "Gizli1234!",
    "phone": "+90 555 123 4567"
  }
  ```
- **Response:** `201 Created` - Kullanıcı başarıyla oluşturuldu

### 1.2. Giriş Yapma
- **Endpoint:** `POST /auth/login`
- **Request Body:**
  ```json
  {
    "email": "baris@example.com",
    "password": "Gizli1234!"
  }
  ```
- **Response:** `200 OK` - Giriş başarılı, JWT token döndürüldü
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

### 1.3. Profil Görüntüleme
- **Endpoint:** `GET /users/{userId}`
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` - Kullanıcı profili başarıyla getirildi

### 1.4. Profil Güncelleme
- **Endpoint:** `PUT /users/{userId}`
- **Authentication:** Bearer Token gerekli
- **Request Body:**
  ```json
  {
    "firstName": "Barış",
    "lastName": "Saylık",
    "email": "yenibaris@example.com",
    "phone": "+90 555 765 4321"
  }
  ```
- **Response:** `200 OK` - Kullanıcı profili başarıyla güncellendi

### 1.5. Hesap Silme
- **Endpoint:** `DELETE /users/{userId}`
- **Authentication:** Bearer Token gerekli (Kendi hesabını silme)
- **Response:** `200 OK` - Kullanıcı hesabı başarıyla silindi.


---

## 📚 2. Kitap Metotları (Books)

### 2.1. Kitap Ekleme
- **Endpoint:** `POST /books`
- **Authentication:** Bearer Token gerekli
- **Request Body:**
  ```json
  {
    "title": "Suç ve Ceza",
    "author": "Fyodor Dostoyevski",
    "isbn": "978-975-10-3441-2",
    "pageCount": 687,
    "publishYear": 1866,
    "genre": "Roman",
    "coverImage": "https://cdn.example.com/covers/suc-ve-ceza.jpg",
    "description": "Klasik bir roman."
  }
  ```
- **Response:** `201 Created` - Kitap başarıyla eklendi

### 2.2. Kitapları Listeleme, Arama ve Filtreleme
- **Endpoint:** `GET /books`
- **Authentication:** Bearer Token gerekli
- **Açıklama:** Arama (`search`) ve filtreleme (`genre`) query parametreleri üzerinden aynı endpoint üzerinde yönetilir.
- **Örnek Query Parameters:** `?search=Suç&genre=Roman`
- **Response:** `200 OK` - Kitaplar başarıyla listelendi

### 2.3. Kitap Detaylarını Görüntüleme
- **Endpoint:** `GET /books/{bookId}`
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` - Kitap detayları başarıyla getirildi

### 2.4. Kitap Güncelleme
- **Endpoint:** `PUT /books/{bookId}`
- **Authentication:** Bearer Token gerekli
- **Request Body:** Sadece güncellenecek alanlar gönderilebilir.
- **Response:** `200 OK` - Kitap başarıyla güncellendi

### 2.5. Kitap Silme
- **Endpoint:** `DELETE /books/{bookId}`
- **Authentication:** Bearer Token gerekli 
- **Response:** `200 OK` - Kitap başarıyla silindi


---

## ❤️ ⭐ 3. Favoriler & Puanlama (Favorites & Ratings)

### 3.1. Favorilere Ekleme
- **Endpoint:** `POST /favorites`
- **Authentication:** Bearer Token gerekli
- **Request Body:**
  ```json
  {
      "bookId": "651a...9ab3"
  }
  ```
- **Response:** `201 Created` - Kitap favorilere başarıyla eklendi

### 3.2. Puanlama (Rating)
- **Endpoint:** `POST /ratings`
- **Authentication:** Bearer Token gerekli
- **Request Body:**
  ```json
  {
    "bookId": "651a...9ab3",
    "score": 5,
    "review": "Harika bir kitaptı!"
  }
  ```
- **Response:** `201 Created` - Puan başarıyla kaydedildi


---

## 🤖 4. Yapay Zeka Metotları (Gemini AI)

### 4.1. Kişiselleştirilmiş Kitap Önerisi
- **Endpoint:** `GET /ai/recommendations/{userId}`
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` - Mock özellikli, kullanıcının türlerine / puanlarına göre şekillenen yapay zeka tavsiyeleri alındı.

### 4.2. Otomatik Kitap Özeti Oluşturma
- **Endpoint:** `POST /ai/summarize`
- **Authentication:** Bearer Token gerekli
- **Request Body:**
  ```json
  {
    "text": "Uzay gemimiz bilinmeyen bir gezegene iniş yaptı. Kaptan, dışarıda nefes alınabilir bir atmosfer olduğunu söyledi ama mürettebat tedirgindi."
  }
  ```
- **Response:** `200 OK` - Metnin duygu ve anahtar kelime analizini barındıran zeki özet mock datası oluşturuldu.
  ```json
  {
    "summary": "Kısaca özetlemek gerekirse; Bu eserde insanlığın teknolojik sınırları veya uzayın derinlikleri ele alınıyor..."
  }
  ```

### 4.3. Okuma Alışkanlığı Analizi
- **Endpoint:** `GET /ai/analysis/{userId}`
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` - Kullanıcının kaç kitap okuduğu, puan ortalaması ve favorileri üzerinden bir edebi kimlik haritası üretildi.
  ```json
  {
    "stats": {
      "totalRatings": 1,
      "averageScore": 5,
      "totalFavorites": 2,
      "topGenres": { "Roman": 1 }
    },
    "insights": "Barış, oldukça aktif ve tutkulu bir okursun!..."
  }
  ```
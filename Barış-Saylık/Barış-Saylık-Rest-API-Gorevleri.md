# Barış Saylık'ın REST API Metotları

**API Test Videosu:** [Link buraya eklenecek](https://example.com)

---

## 1. Üye Olma

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

---

## 2. Giriş Yapma

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
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400
  }
  ```

---

## 3. Profil Görüntüleme

- **Endpoint:** `GET /users/{userId}`
- **Path Parameters:**
  - `userId` (string, required) - Kullanıcı ID'si
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` - Kullanıcı profili başarıyla getirildi

---

## 4. Profil Güncelleme

- **Endpoint:** `PUT /users/{userId}`
- **Path Parameters:**
  - `userId` (string, required) - Kullanıcı ID'si
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

---

## 5. Hesap Silme

- **Endpoint:** `DELETE /users/{userId}`
- **Path Parameters:**
  - `userId` (string, required) - Kullanıcı ID'si
- **Authentication:** Bearer Token gerekli (Yönetici yetkisi veya kendi hesabını silme yetkisi)
- **Response:** `204 No Content` - Kullanıcı hesabı başarıyla silindi

---

## 6. Kitap Ekleme

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
    "description": "Bir öğrencinin cinayet işlemesini ve psikolojik çöküşünü anlatan klasik bir roman."
  }
  ```
- **Response:** `201 Created` - Kitap başarıyla eklendi

---

## 7. Kitapları Listeleme

- **Endpoint:** `GET /books`
- **Authentication:** Bearer Token gerekli
- **Query Parameters:**
  - `page` (integer, optional) - Sayfa numarası (varsayılan: 1)
  - `limit` (integer, optional) - Sayfa başına sonuç sayısı (varsayılan: 10, maks: 50)
- **Response:** `200 OK` - Kitaplar başarıyla listelendi

---

## 8. Kitap Detaylarını Görüntüleme

- **Endpoint:** `GET /books/{bookId}`
- **Path Parameters:**
  - `bookId` (string, required) - Kitap ID'si
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` - Kitap detayları başarıyla getirildi

---

## 9. Kitap Güncelleme

- **Endpoint:** `PUT /books/{bookId}`
- **Path Parameters:**
  - `bookId` (string, required) - Kitap ID'si
- **Authentication:** Bearer Token gerekli
- **Request Body:**
  ```json
  {
    "title": "Suç ve Ceza",
    "author": "Fyodor Dostoyevski",
    "description": "Güncellenmiş açıklama metni."
  }
  ```
- **Response:** `200 OK` - Kitap başarıyla güncellendi

---

## 10. Kitap Silme

- **Endpoint:** `DELETE /books/{bookId}`
- **Path Parameters:**
  - `bookId` (string, required) - Kitap ID'si
- **Authentication:** Bearer Token gerekli (Yönetici yetkisi gerekli)
- **Response:** `204 No Content` - Kitap başarıyla silindi

---

## 11. Kitap Arama

- **Endpoint:** `GET /books/search`
- **Authentication:** Bearer Token gerekli
- **Query Parameters:**
  - `query` (string, required) - Aranacak anahtar kelime (kitap adı, yazar adı veya ISBN)
  - `page` (integer, optional) - Sayfa numarası (varsayılan: 1)
  - `limit` (integer, optional) - Sayfa başına sonuç sayısı (varsayılan: 10, maks: 50)
- **Örnek İstek:** `GET /books/search?query=Dostoyevski`
- **Response:** `200 OK` - Arama sonuçları başarıyla listelendi

---

## 12. Kitapları Filtreleme

- **Endpoint:** `GET /books/filter`
- **Authentication:** Bearer Token gerekli
- **Query Parameters:**
  - `genre` (string, required) - Filtrelenecek tür (Roman, Bilim Kurgu, Tarih, Polisiye vb.)
  - `page` (integer, optional) - Sayfa numarası (varsayılan: 1)
  - `limit` (integer, optional) - Sayfa başına sonuç sayısı (varsayılan: 10, maks: 50)
- **Örnek İstek:** `GET /books/filter?genre=Bilim Kurgu`
- **Response:** `200 OK` - Filtrelenmiş kitaplar başarıyla listelendi

---

## 13. Favorilere Ekleme

- **Endpoint:** `POST /users/favorites/{bookId}`
- **Path Parameters:**
  - `bookId` (string, required) - Favorilere eklenecek kitabın ID'si
- **Authentication:** Bearer Token gerekli
- **Response:** `201 Created` - Kitap favorilere başarıyla eklendi

---

## 14. Puanlama

- **Endpoint:** `POST /books/{bookId}/ratings`
- **Path Parameters:**
  - `bookId` (string, required) - Puanlanacak kitabın ID'si
- **Authentication:** Bearer Token gerekli
- **Request Body:**
  ```json
  {
    "score": 5
  }
  ```
- **Response:** `201 Created` - Puan başarıyla kaydedildi

---

## 15. Kişiselleştirilmiş Kitap Önerisi

- **Endpoint:** `GET /ai/recommendations/{userId}`
- **Path Parameters:**
  - `userId` (string, required) - Önerilerin üretileceği kullanıcının ID'si
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` - Kişiselleştirilmiş kitap önerileri başarıyla üretildi

---

## 16. Otomatik Kitap Özeti Oluşturma

- **Endpoint:** `POST /ai/summarize`
- **Authentication:** Bearer Token gerekli
- **Request Body:**
  ```json
  {
    "text": "Bu kitap, 19. yüzyıl Rusya'sında geçmekte olup ana karakter Raskolnikov...",
    "bookId": "book123"
  }
  ```
- **Response:** `200 OK` - Özet başarıyla oluşturuldu
  ```json
  {
    "summary": "Raskolnikov, ahlaki üstünlüğünü kanıtlamak için işlediği cinayetin vicdani yüküyle yüzleşir.",
    "bookId": "book123"
  }
  ```

---

## 17. Okuma Alışkanlığı Analizi

- **Endpoint:** `GET /ai/analysis/{userId}`
- **Path Parameters:**
  - `userId` (string, required) - Okuma analizi yapılacak kullanıcının ID'si
- **Authentication:** Bearer Token gerekli
- **Response:** `200 OK` - Okuma alışkanlığı analizi başarıyla üretildi
  ```json
  {
    "userId": "usr001",
    "totalBooksRead": 24,
    "totalPagesRead": 7840,
    "favoriteGenre": "Bilim Kurgu",
    "readingFrequency": "Haftada ortalama 2 kitap",
    "insights": [
      "Genelde hafta sonları bilim kurgu okumayı seviyorsun.",
      "Son üç ayda polisiye türünde belirgin bir artış var."
    ]
  }
  ```
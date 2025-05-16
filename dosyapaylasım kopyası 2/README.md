
##Dosya Paylaşım Sistemi

Bu proje, kullanıcıların dosya yükleyip hem kendi sisteminde saklayabildiği hem de başka kullanıcılara gönderebildiği basit ama fonksiyonel bir dosya paylaşım platformudur.

## Kullanılan Teknolojiler

### Backend (API)
- **Python 3**
- **FastAPI** – Hızlı ve modern API framework
- **Uvicorn** – ASGI sunucu
- **SQLAlchemy** – Veritabanı ORM aracı
- **SQLite** – Hafif veritabanı sistemi (`dosya.db`)
- **Passlib (bcrypt)** – Şifre güvenliği için
- **python-jose** – JWT token üretimi ve doğrulama
- **venv** – Sanal ortam yönetimi

### Frontend
- **HTML** – Sayfa yapısı
- **CSS** – Görsel tasarım
- **JavaScript (Fetch API)** – API ile iletişim

##  Kimlik Doğrulama
Kullanıcılar:
- `/register` ile kayıt olabilir
- `/login` ile giriş yaparak `JWT token` alır
- `/me` endpoint’i ile kendi bilgilerini görebilir

##  Dosya İşlemleri

- Dosya **yükleme**
- Dosya **kaydetme** (veritabanına)
- Başka kullanıcıya **dosya gönderme**
- Dosya **listeleme**
  - “Benim Yüklediklerim”
  - “Bana Paylaşılanlar”
- Dosya **güncelleme / silme**
- Dosyaya tıklayınca **görüntüleme / açma**

## Kurulum ve Çalıştırma

### 1. Sanal Ortam Oluştur
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
source venv/bin/activate 
pip install fastapi uvicorn sqlalchemy passlib[bcrypt] python-jose
#(hata verirse:  pip install fastapi uvicorn sqlalchemy "passlib[bcrypt]" python-jose)
pip install greenlet
uvicorn app.main:app --reload
http://localhost:8000/docs
Ad: yunus emre ekin



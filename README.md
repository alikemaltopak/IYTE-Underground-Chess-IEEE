<div align="center">
  <img src="public/hero-bg.jpg" alt="Cyberpunk Chess" width="100%" />

  # ⚡️ İYTE Yeraltı Satranç Turnuvası (V2) ⚡️

  *Gelecek hamleni yap, sistemi hackle! ♟️💾*

  **İYTE (İzmir Yüksek Teknoloji Enstitüsü)** IEEE Öğrenci Kolu için özel olarak tasarlanmış, **Cyberpunk/Underground** temalı, tamamen otonom ve yapay zeka destekli bir satranç turnuvası yönetim platformudur.
</div>

---

## 🚀 Proje Hakkında

Geleneksel satranç atmosferini modern, karanlık ve fütüristik bir "Underground" estetiğiyle birleştiriyoruz. Kullanıcıların gerçek isimlerini geride bırakıp kendi **"Kod Adları"** ve **"Oyun Karakteristikleri" (Archetype)** ile katıldıkları, Lichess entegrasyonu sayesinde tamamen otomatik ilerleyen bir turnuva ekosistemi.

### 🌟 Öne Çıkan Özellikler

- **🎭 Karakter ve Kod Adı Sistemi:** Her oyuncu kayıt olurken "Hacker, Nomad, Corporate" gibi cyberpunk temasına uygun bir Codename seçer ve bir oyun arketiği (Taktiksel, Merkezi Kontrol, Piyon Yapısı vb.) belirler.
- **🤖 Yapay Zeka Destekli Doğrulama (Neural Gateway):** Google Gemini AI kullanılarak, seçilen kod adlarının temaya uygunluğu gerçek zamanlı denetlenir. Gerçek isimler, konumlar veya argo kelimeler anında sistem tarafından reddedilir.
- **⚔️ Lichess Hayalet Maç Entegrasyonu:** Turnuva eşleşmeleri yapıldığında, sistem Lichess API'si üzerinden otonom olarak (Ghost Match) maç linkleri üretir. Oyuncular profillerindeki butona tıklayarak doğrudan kendi maçlarına intikal ederler. Sonuçlar (Kazanan/Kaybeden/Berabere) Lichess'ten anlık çekilip sisteme yansıtılır.
- **📡 Gerçek Zamanlı Dashboard:** Firebase Firestore ile turnuva durumunu, oyuncu kayıtlarını, maç ağacını ve operatör listesini milisaniye gecikmeyle canlı olarak takip edin.
- **🕰️ Akıllı Bildirim Sistemi:** Eşleşmesi belli olan oyuncuların profil sayfasına, maça tam 48 saat kala "SİSTEM MESAJI" olarak yaklaşan müsabaka detayları (rakip bilgileri, saat, tarih) düşer.
- **🛡️ Admin Kontrol Paneli:** Güvenli `.env` yetkilendirmesi sayesinde sadece sistem yöneticileri yeni turlar oluşturabilir, eşleşmeleri başlatabilir ve turnuva ağacını yönetebilir.
- **✨ Premium Cyberpunk Arayüz:** Neon ışıklar, glitch efektleri, scanline animasyonları, koyu mod tasarımı ve Framer Motion ile güçlendirilmiş akıcı mikro animasyonlar.

---

## 🛠️ Teknoloji Yığını (Tech Stack)

### Frontend
- **Framework:** React 19 (Vite) + TypeScript
- **Styling:** Tailwind CSS 4, Vanilla CSS (Custom Glitch & CRT Effects)
- **Animasyon:** Framer Motion
- **İkonlar:** Lucide React

### Backend & API
- **Sunucu / Serverless:** Node.js, Express (Lokal), Vercel Functions (Canlı)
- **Veritabanı & Kimlik Doğrulama:** Firebase (Firestore, Auth)
- **Yapay Zeka:** `@google/genai` (Gemini 3.1 Flash Lite - Hızlı ve hataya dirençli NLP motoru)
- **Satranç Motoru Entegrasyonu:** Lichess API (Challenge/Export endpoints)

---

## 📦 Kurulum ve Çalıştırma (Geliştiriciler İçin)

### Gereksinimler
- Node.js (v18 veya üzeri)
- npm veya yarn
- Firebase Projesi (Firestore ve Auth aktifleştirilmiş)
- Google Gemini API Anahtarı

### Adımlar

1. **Depoyu Klonlayın:**
   ```bash
   git clone https://github.com/kullaniciadi/iyte-yeralti-satranc-v2.git
   cd iyte-yeralti-satranc-v2
   ```

2. **Bağımlılıkları Yükleyin:**
   ```bash
   npm install
   ```

3. **Çevresel Değişkenleri Ayarlayın:**
   Proje ana dizininde `.env` (veya `.env.local`) dosyası oluşturun ve aşağıdaki değerleri kendi projenize göre doldurun:
   ```env
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

   # Gemini AI Configuration
   VITE_GEMINI_API_KEY=your_gemini_api_key
   GEMINI_API_KEY=your_gemini_api_key

   # Admin Authorization (Araya virgül koyarak birden fazla admin ekleyebilirsiniz)
   VITE_ADMIN_EMAILS=admin1@gmail.com,admin2@gmail.com

   # Local Server Port (Opsiyonel)
   PORT=3001
   ```

4. **Geliştirme Sunucusunu Başlatın:**
   ```bash
   npm run dev
   ```
   **Not:** Localde çalışırken AI doğrulama ve Lichess testleri arka planda Proxy aracılığıyla `server.js` (`localhost:3001`) üzerinden çalışacaktır.

---

## 🚀 Deployment (Vercel)

Proje Vercel üzerinde tek tıkla çalışacak şekilde (`vercel.json` rewrite ayarları dahil) konfigüre edilmiştir. 
Vercel'e yüklerken, `Settings > Environment Variables` kısmından tüm `.env` değişkenlerinizi eklemeyi unutmayın! Node.js Serverless fonksiyonları (`api/verify-codename.js` vb.) otomatik olarak derlenecektir.

---

## 📁 Proje Yapısı

```
├── api/                    # Vercel Serverless Functions (Yapay Zeka vb.)
├── public/                 # Statik Varlıklar (Görseller, Arka Planlar)
├── src/
│   ├── components/         # Tekrar Kullanılabilir UI (Navbar, Footer)
│   ├── context/            # React Context (AuthContext)
│   ├── pages/              # Ana Sayfalar (Dashboard, Profile, Rules vb.)
│   ├── services/           # Firebase DB Servisleri (playerService, vb.)
│   ├── App.tsx             # Ana Router / View Controller
│   ├── firebase.ts         # Firebase Başlatma Konfigürasyonu
│   └── index.css           # Global Cyberpunk Tasarım Tokenları
├── server.js               # Lokal Geliştirme İçin Express Backend
├── vercel.json             # Vercel Dağıtım Kuralları
└── vite.config.ts          # Vite ve Proxy Ayarları
```

---

## 🛡️ Lisans ve Haklar

Bu proje, **IEEE İYTE Öğrenci Kolu** kapsamında etkinlik yönetimi için tasarlanmış ve geliştirilmiştir.  
Tüm hakları saklıdır. Sisteme sızmaya çalışmayın. *Gözümüz üzerinizde.* 👁️

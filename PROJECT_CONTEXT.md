# Proje Bağlamı (PROJECT_CONTEXT)

**Yapay Zeka Asistanları İçin Not:** Lütfen bu projede çalışmaya başlamadan önce bu dosyayı referans alın. Bu dosya, projenin mevcut durumunu, mimarisini ve kurallarını hızlıca anlamanızı sağlayarak token tasarrufu yapmanızı amaçlamaktadır.

## 📌 1. Proje Özeti
**Adı:** İYTE Yeraltı Satranç Turnuvası (V2)
**Amacı:** Cyberpunk/Underground temalı, tamamen otonom ve yapay zeka destekli bir satranç turnuvası yönetim platformu. Kullanıcılar sisteme kendi kod adları (örn: "Hacker") ve oyun arketipleriyle kayıt olur. Sistem, Lichess üzerinden otonom maçlar oluşturur ve sonuçları Firestore üzerinden anlık takip eder.

## 🛠️ 2. Teknoloji Yığını (Tech Stack)
*   **Frontend:** React 19, TypeScript, Vite
*   **Stil & Animasyon:** Tailwind CSS 4, Vanilla CSS (Glitch/CRT efektleri için), Framer Motion
*   **İkonlar:** Lucide React
*   **Backend (API):** Node.js, Express (Lokal geliştirme), Vercel Serverless Functions (`/api` dizini)
*   **Veritabanı & Auth:** Firebase (Firestore, Authentication)
*   **Yapay Zeka:** `@google/genai` (Gemini 3.1 Flash / Lichess doğrulamaları ve Kod Adı denetimi için)
*   **Harici API:** Lichess API (Challenge oluşturma ve maç sonuçları çekme)

## 📁 3. Klasör Mimarisi
```text
├── api/                    # Vercel Serverless Fonksiyonları (Örn: Yapay zeka ve Lichess proxy)
├── src/
│   ├── components/         # Tekrar kullanılabilen UI bileşenleri (Navbar vb.)
│   ├── context/            # Global state (AuthContext vb.)
│   ├── pages/              # Sayfalar (HomePage, Profile, Dashboard, TournamentTree vb.)
│   ├── services/           # Firebase ve Lichess API isteklerinin yapıldığı servis katmanı
│   ├── App.tsx             # Ana Router / View Controller
│   ├── firebase.ts         # Firebase başlatma ve yapılandırma dosyası
│   └── index.css           # Global tasarım kuralları, Tailwind tokenları ve Cyberpunk CSS efektleri
├── server.js               # Lokal geliştirme sırasında `/api` isteklerini karşılayan Express sunucusu
├── vercel.json             # Canlı ortam (Vercel) yönlendirme kuralları
└── vite.config.ts          # Vite yapılandırması (Local proxy ayarları burada)
```

## 🗄️ 4. Temel Veritabanı Modeli (Firestore)
*   **`users` Koleksiyonu:** Kullanıcı profilleri. Lichess kullanıcı adı, belirlenen Kod Adı (Codename), seçilen oyun arketiği (Archetype), kazanma/kaybetme durumları ve `role` (user/admin) bilgilerini içerir.
*   **`matches` Koleksiyonu:** Turnuva ağacındaki eşleşmeler. Lichess maç linki, maç durumu (bekleniyor, oynanıyor, bitti), kazanan bilgisi ve maçın Lichess ID'sini tutar.
*   **`tournaments` Koleksiyonu:** Turnuva genel durumu, aktif tur (round) ve katılım aşamalarını yönetir.

## 🧠 5. Mimari Kurallar ve Geliştirme Notları (AI Yönergeleri)
1.  **Cyberpunk Teması:** Kullanıcı arayüzünde her zaman koyu renkler (dark mode), neon yeşil/mor vurgular (accent), monospace veya spesifik fontlar kullanılmalıdır. Bileşenler eklenirken `index.css`'teki mevcut CRT, scanline veya glitch efektlerine sadık kalınmalıdır.
2.  **API ve Proxy İstekleri:** Lichess ve Gemini istekleri, API anahtarı güvenliği nedeniyle direkt frontend üzerinden **yapılmamalıdır**. İstekler lokalde `server.js`'e, canlıda Vercel `api/` altındaki serverless fonksiyonlara yönlendirilir.
3.  **Çevresel Değişkenler:** `.env` değişkenleri `VITE_` ön eki ile kullanılmalı, Firebase ve API anahtarları asla koda gömülmemelidir. Yönetici erişimleri `VITE_ADMIN_EMAILS` ile kontrol edilir.
4.  **Lichess Entegrasyonu:** Maçlar sistemde *Ghost Match* olarak otonom açılır. Eşleşme başladığı an oyun linkleri üretilir ve sonuçlar anlık (polling veya webhook) çekilerek platformdaki `matches` belgesine işlenir.
5.  **Kod Değişiklikleri:** Sadece sorunun veya eklentinin olduğu yeri değiştirin, ilgisiz dosyaları (özellikle yapılandırma dosyalarını) ellemeyin.

---
**Sonraki Adımlar:** Bu dosyayı okuduktan sonra, mevcut geliştirmeyi veya çözülecek bug'ı anlamak için lütfen kullanıcının verdiği `TODO` veya hedef açıklamasına odaklanın.

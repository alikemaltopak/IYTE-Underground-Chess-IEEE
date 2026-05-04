# ⚡️ İYTE Yeraltı Satranç Turnuvası (V2) ⚡️

![Cyberpunk Chess](public/hero-bg.jpg)

Bu proje, İYTE (İzmir Yüksek Teknoloji Enstitüsü) öğrencileri için özel olarak tasarlanmış, **Cyberpunk** temalı bir satranç turnuvası yönetim platformudur. Geleneksel satranç atmosferini modern ve fütüristik bir "Underground" estetiğiyle birleştirir.

## 🚀 Öne Çıkan Özellikler

*   **Cyberpunk Arayüzü:** Neon ışıklar, glitch efektleri ve dinamik animasyonlarla zenginleştirilmiş premium kullanıcı deneyimi.
*   **Karakter ve Kod Adı Sistemi:** Her oyuncu kendine özgü bir "Codename" seçer ve bir karakter arketiği (Hacker, Nomad, Corporate vb.) belirler.
*   **Yapay Zeka Destekli Doğrulama:** Gemini AI entegrasyonu sayesinde seçilen kod adlarının temaya uygunluğu ve uygunsuz içerik barındırmadığı gerçek zamanlı olarak kontrol edilir.
*   **Gerçek Zamanlı Dashboard:** Firebase Firestore ile turnuva durumunu, oyuncu kayıtlarını ve operatör listesini canlı olarak takip edin.
*   **Esnek Kimlik Doğrulama:** Google OAuth ve e-posta/şifre seçenekleri ile güvenli giriş.
*   **Kişiselleştirilmiş Profil Sayfası:** İstatistiklerinizi, karakter detaylarınızı ve başarımlarınızı görüntüleyin.

## 🛠️ Teknoloji Yığını

*   **Frontend:** React 19, Vite, TypeScript
*   **Styling:** Tailwind CSS 4, Framer Motion (Animasyonlar)
*   **Backend & API:** Node.js, Express, Vercel Functions
*   **Database & Auth:** Firebase (Firestore, Authentication)
*   **AI:** Google Gemini API (`@google/genai`)
*   **Icons:** Lucide React

## 📦 Kurulum ve Çalıştırma

### Gereksinimler
*   Node.js (v18 veya üzeri)
*   npm veya yarn
*   Firebase Projesi
*   Google Gemini API Anahtarı

### Adımlar

1.  **Depoyu Klonlayın:**
    ```bash
    git clone https://github.com/kullaniciadi/iyte-yeralti-satranc.git
    cd iyte-yeralti-satranc
    ```

2.  **Bağımlılıkları Yükleyin:**
    ```bash
    npm install
    ```

3.  **Çevresel Değişkenleri Ayarlayın:**
    `.env.example` dosyasını `.env` olarak kopyalayın ve gerekli anahtarları doldurun:
    ```env
    VITE_FIREBASE_API_KEY=your_key
    VITE_FIREBASE_AUTH_DOMAIN=your_domain
    VITE_FIREBASE_PROJECT_ID=your_id
    GEMINI_API_KEY=your_gemini_key
    ```

4.  **Uygulamayı Başlatın:**
    ```bash
    npm run dev
    ```
    Uygulama varsayılan olarak `http://localhost:3000` adresinde çalışacaktır.

## 📁 Proje Yapısı

*   `src/components/`: Tekrar kullanılabilir UI bileşenleri (Navbar, Footer, SystemStatus).
*   `src/pages/`: Uygulama sayfaları (HomePage, CharacterCreation, TournamentDashboard vb.).
*   `src/firebase.ts`: Firebase yapılandırması ve servisleri.
*   `api/`: Sunucusuz fonksiyonlar ve AI doğrulama mantığı.
*   `public/`: Statik varlıklar (resimler, fontlar).

## 🛡️ Lisans

Bu proje IEEE İYTE öğrenci kolu kapsamında geliştirilmiştir. Tüm hakları saklıdır.

---

*Gelecek hamleni yap, sistemi hackle!* ♟️💾

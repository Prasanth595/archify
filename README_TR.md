<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/assets/archify-lockup-dark.svg" />
    <img src="docs/assets/archify-lockup-light.svg" alt="Archify" width="440" height="121" />
  </picture>
</p>

<h3 align="center">Anlamak, planlamak veya paylaşmak istediğiniz her şeyi etkileşimli bir görsel diyagrama dönüştürün.</h3>

<p align="center">
  <img src="docs/assets/archify-readme-hero.png" alt="Archify — etkileşimli diyagramlar" width="960" />
</p>

<p align="center">
  Bir fikir, bir soru veya bir planla başlayın. Yapay zekâ ajanınıza (Cursor, Claude Code, Codex, OpenCode) ne istediğinizi anlatın; Archify bunu keşfedebileceğiniz, özelleştirebileceğiniz ve doğrudan tarayıcıda paylaşabileceğiniz bağımsız ve etkileşimli bir HTML diyagramına dönüştürsün.
</p>

<p align="center">
  <a href="https://archify.si/gallery.html"><strong>Canlı Demolar</strong></a> &nbsp;·&nbsp;
  <a href="#hizli-baslangic"><strong>Hızlı Başlangıç</strong></a> &nbsp;·&nbsp;
  <a href="https://archify.si/guide.html"><strong>Senaryo Rehberi</strong></a> &nbsp;·&nbsp;
  <a href="#cli-komutlari"><strong>CLI Komutları</strong></a> &nbsp;·&nbsp;
  <a href="./README.md"><strong>English</strong></a> &nbsp;·&nbsp;
  <a href="./README_ZH.md"><strong>简体中文</strong></a> &nbsp;·&nbsp;
  <a href="./README_JA.md"><strong>日本語</strong></a>
</p>

<p align="center">
  <a href="https://github.com/tt-a1i/archify/stargazers"><img src="https://img.shields.io/github/stars/tt-a1i/archify?style=flat-square&color=E5B650&logo=github&label=Stars" alt="GitHub stars" /></a>
  <a href="https://skills.sh/tt-a1i/archify/archify"><img src="https://img.shields.io/badge/installs-130K%2B-0EA5E9?style=flat-square" alt="130K+ Kurulum" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-22c55e?style=flat-square" alt="MIT Lisansı" /></a>
  <a href="#desteklenen-ajanlar"><img src="https://img.shields.io/badge/uyumlu-Claude_Code_%7C_Codex_%7C_Cursor_%7C_OpenCode-7C3AED?style=flat-square" alt="Ajan Uyumluluğu" /></a>
  <a href="CHANGELOG.md"><img src="https://img.shields.io/badge/sürüm-3.0.1-0891b2?style=flat-square" alt="Güncel Sürüm 3.0.1" /></a>
</p>

---

## ⚡ Archify Nedir?

**Archify**, JSON tabanlı bir ara temsil (JSON-IR) kullanarak yüksek kaliteli, etkileşimli ve bağımsız **HTML mimari ve süreç diyagramları** üreten yeni nesil bir görselleştirme motorudur.

Geleneksel statik resimler (PNG, SVG) veya sınırlı Mermaid grafiklerinin aksine Archify:
- **Tamamen Bağımsız HTML Üretir**: Tek bir `.html` dosyası içinde tüm CSS, JS, ikonlar ve render motorunu barındırır. Çalışması için herhangi bir web sunucusuna veya internet bağlantısına ihtiyaç duymaz.
- **Zengin İnteraktivite**: Yakınlaştırma (zoom), serbest kaydırma (pan), odaklanma modu (focus lens), arama kutusu ve katman filtreleri sunar.
- **Karanlık & Aydınlık Tema**: Otomatik sistem teması algılama veya arayüzden tek tıkla geçiş imkanı.
- **Kaynak Koda Bağlantılıdır**: Kod tabanınızdaki dosyalara ve satır numaralarına doğrudan tıklanabilir bağlantılar sağlar.

---

## 🎬 Archify İş Başında

https://github.com/user-attachments/assets/78570807-ba1d-4737-953f-55504a378a87

> **Tek bir cümle yazın. Sisteminiz anında haritalansın.** 35 saniyelik demoda gezinmeyi, kaynak bağlantılarını izlemeyi ve akış rotalarını takip etmeyi inceleyebilirsiniz. [Canlı interaktif örnekleri deneyin ↗](https://archify.si/gallery.html)

---

<a id="hizli-baslangic"></a>
## 🚀 Hızlı Başlangıç

### 1. Kurulum

Archify'ı yapay zekâ ajanı skill'i olarak veya global CLI olarak kurabilirsiniz:

```bash
# Cursor, Claude Code, Codex veya OpenCode içine Skill olarak ekleme:
npx skills add tt-a1i/archify -g

# Veya NPM üzerinden global CLI olarak:
npm install -g archify
```

### 2. Yapay Zekâ Ajanınıza İstediğinizi Söyleyin

Herhangi bir kod tabanı zorunlu değildir. Sadece fikrinizi açıklayın:

```text
Archify kullanarak bir web isteği diyagramı oluştur:
Kullanıcı web tarayıcısından API'yi çağırır. API önce Redis önbelleğini kontrol eder.
Önbellekte yoksa (cache miss) PostgreSQL veritabanını sorgular ve veriyi Redis'e yazar.
```

Ardından ajan sohbetinde dilediğiniz gibi iyileştirin:
- *"Kimlik doğrulama (JWT/OAuth) servisini de araya ekle."*
- *"Önbellek ıskalama (cache-miss) yolunu kırmızı renkle vurgula."*
- *"Açık temaya geçir."*

---

## 📊 Desteklenen 5 Temel Diyagram Türü

| Tür | Kullanım Alanı | Açıklama |
| :--- | :--- | :--- |
| 🏗️ **Architecture** | Sistem & Altyapı | Servisler, mikroservisler, veritabanları, API ağ geçitleri, ağ katmanları ve güvenlik sınırları. |
| 🔄 **Workflow** | İş Akışları & Süreçler | Karar düğümleri, paralel kollar, onay mekanizmaları ve aşamalı iş adımları. |
| ⏱️ **Sequence** | Sekans & İletişim | Servisler ve aktörler arasındaki zaman sıralı mesajlaşma ve asenkron çağrı akışı. |
| 🔀 **Dataflow** | Veri Akışı & ETL | Veri kaynakları, akış boru hatları (pipeline), dönüşüm motorları ve ambarlar. |
| 🧬 **Lifecycle** | Yaşam Döngüsü | Varlıkların durumları, durum makineleri ve tetikleyici olay geçişleri. |

---

<a id="cli-komutlari"></a>
## 🛠️ CLI Komut Referansı

Archify doğrudan komut satırından da çalıştırılabilir:

```bash
# 1. JSON dosyasından etkileşimli HTML diyagramı üretme
archify render architecture input.json output.html

# 2. Canlı tarayıcı önizlemesi başlatma
archify preview workflow process.json

# 3. JSON şemasını ve geçerliliğini doğrulama
archify validate sequence api-flow.json

# 4. İki mimari sürümünü karşılaştırma (Diff)
archify compare architecture v1.json v2.json diff.html

# 5. Örnek bir demo diyagramı üretme
archify demo ./cikti-klasoru

# 6. Sistem ve çalışma ortamı kontrolü
archify doctor

# 7. Senaryo ve komut yardımcısı
archify guide "nasıl mikroservis mimarisi çizerim?"
```

---

<a id="desteklenen-ajanlar"></a>
## 🤖 Desteklenen AI Ajanları & Entegrasyonlar

- **Cursor IDE**: Composer veya Chat modunda doğrudan entegre çalışır.
- **Claude Code**: Terminal CLI ajanıyla kesintisiz uyumludur.
- **Codex CLI**: Terminal iş akışlarında spec-driven üretim sağlar.
- **OpenCode**: Açık kaynak kod ajanlarıyla tam uyumlu.
- **Kimi Work**: Kimi Work eklenti mağazasında *Interactive Architecture Diagram* olarak mevcuttur.

---

## 💻 Yerel Geliştirme ve Test

Projeyi yerel ortamınızda çalıştırmak ve test etmek için:

```bash
# Depoyu klonlayın
git clone https://github.com/tt-a1i/archify.git
cd archify/archify

# Bağımlılıkları yükleyin
npm install

# Sistem hazırlığını test edin
node bin/archify.mjs doctor

# Hızlı bir demo üretin
node bin/archify.mjs demo ../demo-test

# Testleri çalıştırın
npm test
```

---

## 📜 Lisans

Bu proje **[MIT Lisansı](LICENSE)** altında lisanslanmıştır. Açık kaynak kodlu olup özgürce kullanılabilir, geliştirilebilir ve dağıtılabilir.

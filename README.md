# 🗳️ TN Election Dashboard

**India's most comprehensive Tamil Nadu election analytics platform**

🔗 **Live:** [tn-election-dashboard.vercel.app](https://tn-election-dashboard.vercel.app)

[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://tn-election-dashboard.vercel.app)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📊 **Historical Trends** | Election results from 1952 to 2026 — 70+ years of data |
| 👤 **9,400+ Candidate Profiles** | Criminal records, assets, education from official affidavits |
| ⚖️ **Criminal Records** | Transparency data — see candidates with declared criminal cases |
| 🗺️ **234 Constituencies** | Deep-dive into every Tamil Nadu constituency |
| 📈 **Party Analytics** | DMK, AIADMK, TVK, NTK, BJP — vote share trends & seat counts |
| 🏗️ **Development Indicators** | District-level HDI, literacy, healthcare data |
| 📰 **Live News** | Curated election news from verified sources |
| 🤖 **Ask AI** | Ask questions about TN elections and get AI-powered answers |
| 🗳️ **Community Poll** | Interactive "Who will win?" prediction poll |
| 🧠 **Election Quiz** | Test your knowledge about Tamil Nadu elections |

## 📊 Data Sources

All data is sourced from **official and publicly available** records:

- **[Election Commission of India (ECI)](https://www.eci.gov.in)** — Official results & candidate affidavits
- **[Tamil Nadu State Election Commission](https://tnsec.tn.gov.in)** — State-level election data
- **[ADR / myneta.info](https://myneta.info)** — Candidate affidavit analysis
- **[ECI Affidavit Portal](https://affidavit.eci.gov.in)** — 2026 candidate self-declarations

## 🛠️ Tech Stack

- **Frontend:** React + Vite + Tailwind CSS
- **Charts:** Recharts
- **Data Pipeline:** Playwright + Tesseract OCR (scraping ECI affidavits)
- **Deployment:** Vercel (auto-deploy on push)
- **Analytics:** Vercel Analytics

## 🚀 Quick Start

```bash
git clone <repository-url>
cd tn_election_dashboard
npm install
npm run dev
```

## 🔄 Data Pipeline

```bash
# Sync with latest ECI affidavit data
REUSE_EXISTING_HISTORICAL=1 node scripts/generate-candidate-directory.mjs

# Full refresh (re-scrape ECI listing)
REUSE_EXISTING_HISTORICAL=1 REFRESH_ECI_2026=1 node scripts/generate-candidate-directory.mjs
```

## ⚖️ Disclaimer

This is an **independent, non-partisan** platform. We are **not affiliated** with any political party, government body, or election commission. Data is sourced from publicly available candidate affidavits and official election records.

## 📬 Contact

- **Email:** tnelectiondashboard@proton.me

---

**⭐ Star this repo if you find it useful!** Help spread electoral transparency in Tamil Nadu.

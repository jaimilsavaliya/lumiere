# 🎬 Lumiere — Fluid Media Experience

[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)

Lumiere is a high-performance, premium media browser designed for a seamless and cinematic streaming experience. Built with a focus on **Fluid Motion**, Lumiere transforms browsing into an interactive journey with staggered animations, rich hover states, and dynamic content discovery.

---

## ✨ Key Features

- **🚀 Cinematic Hero Spotlight**: A high-impact entry point featuring trending titles with animated typography and parallax poster effects.
- **🌀 Fluid Motion System**: Powered by Framer Motion, every interaction—from page transitions to grid entry—is smooth and responsive.
- **🔍 Intelligent Discovery**: A dedicated Discover page with a cinematic banner, floating poster collage, and quick-access genre filters.
- **✨ Premium Hover Interactions**: Rich movie/TV cards that expand on hover to reveal backdrops, ratings, and meta-data in a polished layout.
- **♾️ Infinite Discovery**: Seamlessly fetch more content as you scroll without manual "Load More" buttons.
- **📱 Ultra-Responsive UI**: Crafted with Tailwind CSS to ensure a beautiful experience across all device sizes.
- **🛠️ Robust Core**: A Fastify-powered backend integrating TMDB API and advanced stream scraping logic.

---

## 🛠️ Technology Stack

### Frontend (`/ui`)
- **Framework**: React 19 with Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Components**: Shadcn UI (Radix UI)
- **Icons**: Lucide React
- **Carousels**: Embla Carousel

### Backend (`/core`)
- **Server**: Fastify
- **Runtime**: Node.js (via tsx)
- **API Integration**: TMDB SDK
- **Data Fetching**: Custom scrapers and priority-based server selection

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/jaimil-creator/lumiere.git
   cd Lumiere
   ```

2. **Setup the Core (Backend):**
   ```bash
   cd core
   npm install
   npm run dev
   ```

3. **Setup the UI (Frontend):**
   ```bash
   cd ../ui
   npm install
   npm run dev
   ```

---

## 📁 Project Structure

```text
Lumiere/
├── core/                # Backend & Business Logic
│   ├── src/
│   │   ├── providers/   # Stream providers & scrapers
│   │   └── backend/     # Fastify server setup
├── ui/                  # Frontend Application
│   ├── src/
│   │   ├── components/  # Reusable UI & Media components
│   │   ├── pages/       # Page views (Home, Discover, Watch)
│   │   └── main/        # App entry & routing
```

---

## 🎨 Design Philosophy

Lumiere is built on the principle of **Visual Excellence**. We avoid generic defaults in favor of:
- **Curated Color Palettes**: Sleek dark modes with primary accents.
- **Modern Typography**: Using high-quality variable fonts for readability and style.
- **Interactive Depth**: Using shadows, blurs, and scale effects to make the interface feel "alive".

---

## 🤝 Acknowledgments

- Data provided by [TheMovieDB (TMDB)](https://www.themoviedb.org/).
- UI inspired by modern premium streaming platforms.

---

<p align="center">
  Made with ❤️ for a better streaming experience.
</p>

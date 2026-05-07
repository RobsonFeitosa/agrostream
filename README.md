# 🚜 AgroStream Operations — Live Farm Control

![AgroStream Dashboard Mockup](file:///C:/Users/robso/.gemini/antigravity/brain/75eb6d11-1c8b-4229-8c37-dc483e3519dc/agrostream_dashboard_mockup_1778126149955.png)

AgroStream is a premium, real-time agricultural monitoring platform designed to provide total control over large-scale farming operations. Featuring a sleek dark-mode interface and focused on high performance, AgroStream combines satellite imagery, soil sensors, and machinery tracking into a single command center.

---

## 🌟 Key Features

### 🛰️ Precision NDVI Monitoring
Visualize vegetation vigor in real-time through processed heatmaps. Identify water stress or nutrient deficiencies before they become critical issues.

### 🚜 Real-Time GPS Tracking
Monitor every tractor and implement in the field. AgroStream provides live telemetry, including speed, operational status (active/idle), and the assigned operator.

### 🌤️ Smart Weather Overlay
Dynamic layers displaying precipitation, temperature, and wind speed directly over the farm map, enabling rapid adjustments to spraying or harvesting schedules.

### 📊 Metrics & Critical Alerts
- **Soil Moisture**: Constant monitoring for irrigation optimization.
- **Machinery Efficiency**: Fleet progress and health dashboard.
- **Automated Alerts**: Instant notifications for NDVI drops or excessive machine idle time.

---

## 🛠️ Tech Stack

Built with the latest React ecosystem tools to ensure speed and scalability:

- **Framework**: [TanStack Start](https://tanstack.com/router/v1/docs/guide/start/overview) (Full-stack React)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State & Validation**: [TanStack Query](https://tanstack.com/query/latest) & [Zod](https://zod.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Runtime**: [Bun](https://bun.sh/) (Recommended) or Node.js

---

## 🚀 Installation & Setup

Follow these steps to run the project locally:

### Prerequisites
Ensure you have **Bun** (or NPM/Yarn) installed on your machine.

### 1. Clone the repository
```bash
git clone <repository-url>
cd agrostream
```

### 2. Install dependencies
```bash
bun install
# or
npm install
```

### 3. Start the development server
```bash
bun run dev
# or
npm run dev
```
The project will be available at `http://localhost:3000`.

---

## 📂 Project Structure

- `src/routes/`: Route definitions and pages (using TanStack Router).
- `src/components/`: UI components and visual logic blocks.
- `src/lib/`: Utilities, API configurations, and helpers.
- `src/styles.css`: Global styling and Tailwind v4 tokens.

---

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Developed with 💚 for the future of digital agriculture.
</p>

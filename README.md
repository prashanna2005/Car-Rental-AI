# FleetIQ AI — Autonomous Car Rental Business Platform 🚗⚡

**FleetIQ AI** is an enterprise-grade autonomous business management platform designed for car rental fleets. Powered by a multi-agent orchestration engine, FleetIQ seamlessly combines real-time database query capabilities with specialized AI agents to automate revenue investigations, fleet maintenance, booking operations, and customer pipeline management.

---

## 🌟 Key Features

### 🤖 Multi-Agent Orchestration Hub
- **Intelligent Router Agent**: Dynamically classifies business inquiries and builds multi-step execution plans.
- **AI Sales Agent**: Handles vehicle availability searches, automated pricing quotes, and reservation bookings.
- **AI Data Analyst Agent**: Runs SQL queries for period-over-period financial comparisons and detects revenue anomalies.
- **AI Operations Agent**: Monitors maintenance alerts, calculates fleet utilization, and dispatches service tasks.
- **Executive Synthesis & Approvals**: Generates executive reports with evidence metrics, recommendations, and one-click action approvals.

### 📊 Executive Overview Dashboard
- **Real-Time KPI Cards**: Total Fleet, 30-Day Revenue, Utilization Percentage, and Maintenance Downtime.
- **Interactive AI Banner**: One-click investigation launcher for sudden revenue drops or fleet bottlenecks.
- **Visual Analytics**: Interactive Recharts for revenue trends and vehicle category breakdowns.
- **Live Data Feeds**: Recent reservation tables and urgent maintenance alert feeds.

### 🚘 Fleet Inventory Management
- **Grid & Table Views**: Toggle between high-impact visual vehicle cards and detailed list tables.
- **Interactive Inspection Drawer**: View fuel levels, odometer readings, daily rates, and locations with live status update controls (`Mark Available`, `Send to Maintenance`).
- **Dynamic Category Filtering**: Filter by SUV, Sedan, Luxury, Electric, Compact, or Truck.

### 📋 Operations & Analytics Modules
- **Rental Reservations**: Create new bookings with live quote estimation breakdown (base rate, 12% tax, deposit).
- **Customers & Sales Pipeline**: Manage customer directories and AI-qualified high-intent leads with confidence scoring.
- **Business Intelligence Analytics**: Track period-over-period revenue deltas and algorithmic anomaly detections.
- **Maintenance & Tasks**: Monitor operational checklists and mechanic repair logs.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Backend Framework** | [FastAPI](https://fastapi.tiangolo.com/) (Python 3.10+) |
| **Frontend Framework** | [React 18](https://react.dev/) + [Vite](https://vitejs.dev/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) & [Python](https://www.python.org/) |
| **Styling & Design System** | [Tailwind CSS v4](https://tailwindcss.com/) + Glassmorphism Theme |
| **Database** | [SQLite](https://www.sqlite.org/) (`fleetiq.db` with SQL Alchemy ORM) |
| **Icons & Charts** | [Lucide React](https://lucide.dev/) & [Recharts](https://recharts.org/) |
| **AI LLM Integration** | OpenAI API (with built-in Deterministic Demo Mode) |

---

## 🏗️ Architecture Overview

```
                          ┌──────────────────────────┐
                          │   React + Vite Frontend  │
                          └─────────────┬────────────┘
                                        │ REST API
                                        ▼
                          ┌──────────────────────────┐
                          │     FastAPI Backend      │
                          └─────────────┬────────────┘
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           ▼                            ▼                            ▼
┌────────────────────┐       ┌────────────────────┐       ┌────────────────────┐
│   AI Sales Agent   │       │  Data Analyst Agent│       │ AI Operations Agent│
└──────────┬─────────┘       └──────────┬─────────┘       └──────────┬─────────┘
           │                            │                            │
           └────────────────────────────┼────────────────────────────┘
                                        │ SQL Queries
                                        ▼
                          ┌──────────────────────────┐
                          │    SQLite Persistence    │
                          └──────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **Python**: `3.10` or higher
- **Git**

---

### 1. Clone the Repository

```bash
git clone https://github.com/prashanna2005/Car-Rental-AI.git
cd Car-Rental-AI
```

---

### 2. Backend Setup (FastAPI)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment & install dependencies:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate

   pip install -r requirements.txt
   ```

3. Configure Environment Variables (Optional):
   Create a `.env` file in the `backend/` folder:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   DEMO_MODE=True
   ```
   *(Note: If `OPENAI_API_KEY` is omitted, the backend automatically runs in deterministic Demo Mode).*

4. Start the FastAPI server:
   ```bash
   python -m uvicorn app.main:app --reload --port 8000
   ```
   The backend will be running at `http://127.0.0.1:8000` with interactive API docs at `http://127.0.0.1:8000/docs`.

---

### 3. Frontend Setup (React + Vite)

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install npm dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173`.

---

## 🧪 Testing & Verification

### Run Production Build Verification
To verify the TypeScript types and build the production static assets:
```bash
cd frontend
npm run build
```

### Run Backend Endpoint Tests
To verify all REST API endpoints against the SQLite database:
```bash
cd backend
python tests/verify_endpoints.py
```

---

## 📁 Repository Structure

```
AI CarRental/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application initialization
│   │   ├── database.py          # SQLite database connection & seed logic
│   │   ├── models.py            # SQLAlchemy database models
│   │   ├── schemas.py           # Pydantic data validation schemas
│   │   ├── routes/              # REST API route handlers
│   │   └── agents/              # Multi-agent router & tool engines
│   ├── tests/                   # Endpoint verification scripts
│   └── requirements.txt         # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/          # Sidebar, Header, and shared UI controls
│   │   ├── pages/               # Dashboard, Agent Hub, Fleet, Bookings, etc.
│   │   ├── services/            # API integration client
│   │   ├── index.css            # Design tokens & glassmorphism theme
│   │   └── App.tsx              # Root flex layout & tab router
│   ├── package.json             # Frontend dependencies
│   └── vite.config.ts           # Vite configuration
└── README.md                    # Documentation
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

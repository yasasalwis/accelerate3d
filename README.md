# Accelerate3D

> [!WARNING]
> **Development Build**: This application is currently in active development and may contain bugs. If you encounter any
> issues, please report them to the repository maintainers.


<p align="center">
  <strong>🚀 Advanced 3D Printer Fleet Management System</strong>
</p>

<p align="center">
  Control, monitor, and optimize your 3D printing workflows with real-time status updates,<br>
  seamless protocol integration, and powerful analytics.
</p>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Technology Stack](#️-technology-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Core Modules](#-core-modules)
- [API Reference](#-api-reference)
- [Database Schema](#️-database-schema)
- [Printer Protocols](#-printer-protocols)
- [Slicing Integration](#-slicing-integration)
- [Configuration](#️-configuration)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**Accelerate3D** is a comprehensive 3D printer fleet management system designed for both hobbyists and print farms. It
provides a unified dashboard to manage multiple printers, queue print jobs, track material usage, and monitor printing
operations in real-time.

### Key Highlights

- **Multi-Printer Management**: Control an unlimited number of printers from a single interface
- **Protocol Agnostic**: Supports Moonraker (Klipper) and MQTT (Bambu Lab) protocols
- **Automated Job Queue**: Intelligent scheduling with auto-dispatch and work-stealing capabilities
- **Real-Time Monitoring**: Live telemetry including temperatures, progress, and webcam feeds
- **Integrated Slicing**: Direct integration with PrusaSlicer and OrcaSlicer

---

## ✨ Features

### 🖥️ Fleet Dashboard

- Real-time printer status visualization
- Temperature monitoring (bed & nozzle)
- Progress tracking with estimated completion times
- One-click printer controls (pause, resume, cancel)

### 🔌 Protocol Support

| Protocol      | Printers                                                 | Features                                |
|---------------|----------------------------------------------------------|-----------------------------------------|
| **Moonraker** | Klipper-based printers (Voron, Ender 3 w/ Klipper, etc.) | Full G-code upload, live status, webcam |
| **MQTT**      | Bambu Lab, custom MQTT printers                          | Status monitoring, telemetry            |

### 📦 Model Repository

- Upload and manage 3D models (STL/G-code)
- Automatic G-code analysis for:
    - Estimated print time
    - Filament usage (grams)
    - Print dimensions
    - Temperature settings
- Thumbnail generation support

### ⚡ Job Queue System

- **Smart Scheduling**: Automatically assigns jobs to idle printers
- **Work Stealing**: Idle printers can pick up jobs from busy queues
- **Priority Handling**: Set job priorities for urgent prints
- **Auto-Eject Support**: Trigger G-code injection for automated bed clearing

### 🔪 Slicing Integration

- PrusaSlicer and OrcaSlicer support
- Automatic profile detection from your system
- Direct slicing from the web interface
- Profile override support (infill, supports, brim)

### 📊 Analytics & Reporting

- Filament usage tracking by material type
- Cost analysis per print and overall
- Printer utilization statistics
- Success/failure rate monitoring

### 🔐 User Management

- Secure authentication with NextAuth.js
- Per-user printer ownership
- Data isolation between users
- Notification system with read/unread status

---

## 🛠️ Technology Stack

### Core Framework

| Technology                                    | Version | Purpose                                 |
|-----------------------------------------------|---------|-----------------------------------------|
| [Next.js](https://nextjs.org/)                | 16.x    | Full-stack React framework (App Router) |
| [React](https://react.dev/)                   | 19.x    | UI library                              |
| [TypeScript](https://www.typescriptlang.org/) | 5.x     | Type-safe JavaScript                    |

### Database & ORM

| Technology                                                   | Purpose                             |
|--------------------------------------------------------------|-------------------------------------|
| [SQLite](https://www.sqlite.org/)                            | Lightweight database                |
| [Prisma](https://www.prisma.io/)                             | Database ORM with type-safe queries |
| [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) | High-performance SQLite driver      |

### UI & Styling

| Technology                               | Purpose                         |
|------------------------------------------|---------------------------------|
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first CSS framework     |
| [Radix UI](https://www.radix-ui.com/)    | Accessible component primitives |
| [Lucide React](https://lucide.dev/)      | Beautiful icons                 |
| [Recharts](https://recharts.org/)        | Data visualization              |

### Authentication & State

| Technology                                     | Purpose                 |
|------------------------------------------------|-------------------------|
| [NextAuth.js](https://next-auth.js.org/)       | Authentication solution |
| [TanStack Query](https://tanstack.com/query)   | Server state management |
| [bcrypt](https://www.npmjs.com/package/bcrypt) | Password hashing        |

### Printer Communication

| Technology                                 | Purpose                              |
|--------------------------------------------|--------------------------------------|
| Native HTTP/REST                           | Moonraker API communication          |
| [mqtt](https://www.npmjs.com/package/mqtt) | MQTT protocol for Bambu Lab printers |

---

## 🏁 Getting Started

### Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) v20 or higher
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/accelerate3d.git
   cd accelerate3d
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="file:./dev.db"
   
   # Authentication
   NEXTAUTH_SECRET="your-super-secret-key-change-in-production"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Initialize the database:**
   ```bash
   npx prisma db push
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

### First-Time Setup

1. Register a new user account at `/register`
2. Log in with your credentials
3. Add your first printer:
    - Navigate to the printers page
    - Click "Add Printer"
    - Enter the printer's IP address or hostname
    - The system will auto-detect the protocol (Moonraker/MQTT)

---

## 📂 Project Structure

```
accelerate3d/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Authentication routes
│   │   ├── login/              # Login page
│   │   └── register/           # Registration page
│   ├── (dashboard)/            # Main dashboard (protected)
│   │   ├── admin/              # Admin panel
│   │   ├── models/             # 3D model management
│   │   ├── printers/           # Printer management
│   │   │   └── [id]/           # Individual printer details
│   │   ├── queue/              # Print job queue
│   │   ├── slice/              # Slicing interface
│   │   └── stats/              # Analytics & statistics
│   ├── api/                    # API routes
│   │   ├── auth/               # NextAuth endpoints
│   │   ├── cron/               # Scheduled tasks
│   │   ├── jobs/               # Print job operations
│   │   ├── models/             # Model CRUD operations
│   │   ├── notifications/      # User notifications
│   │   ├── printers/           # Printer operations
│   │   └── slicer/             # Slicing API
│   ├── globals.css             # Global styles
│   └── layout.tsx              # Root layout
│
├── components/                 # React components
│   ├── admin/                  # Admin panel components
│   ├── dashboard/              # Dashboard-specific components
│   ├── models/                 # Model management UI
│   ├── notifications/          # Notification center
│   ├── printers/               # Printer cards, modals
│   ├── queue/                  # Queue/Kanban components
│   ├── slicing/                # Slicing interface
│   ├── stats/                  # Analytics charts
│   └── ui/                     # Primitive UI components
│
├── lib/                        # Core business logic
│   ├── actions.ts              # Server actions
│   ├── admin-actions.ts        # Admin-specific actions
│   ├── auth.ts                 # Authentication config
│   ├── dashboard-data.ts       # Dashboard data fetching
│   ├── db.ts                   # Database client
│   ├── gcode-parser.ts         # G-code analysis utilities
│   ├── gcode-utils.ts          # G-code manipulation
│   ├── printer-client.ts       # Printer communication
│   ├── printer-network.ts      # Network discovery
│   ├── scheduler.ts            # Job queue scheduler
│   ├── slicer-actions.ts       # Slicing server actions
│   └── utils.ts                # General utilities
│
├── prisma/                     # Database
│   └── schema.prisma           # Database schema
│
├── public/                     # Static assets
├── scripts/                    # Utility scripts
└── types/                      # TypeScript type definitions
```

---

## 🔧 Core Modules

### Printer Client (`lib/printer-client.ts`)

Handles communication with different printer protocols:

```typescript
// Get a printer client based on protocol
const client = await getPrinterClient(printerIp, 'MOONRAKER');

// Check printer status
const status = await client.getStatus();
// Returns: { state, temps, filename, progress, printDuration, totalDuration }

// Upload and start a print
await client.uploadAndPrint(filePath, 'model.gcode');
```

**Supported Clients:**

- `MoonrakerClient` - For Klipper-based printers
- `MqttPrinterClient` - For MQTT-enabled printers (Bambu Lab)

### Job Scheduler (`lib/scheduler.ts`)

Manages the print job queue with intelligent dispatching:

- **Auto-assignment**: Pending jobs are automatically assigned to idle printers
- **Work stealing**: If a printer becomes idle, it can pick up jobs from another printer's queue
- **Status tracking**: Jobs move through states: `PENDING` → `PRINTING` → `COMPLETED`/`FAILED`
- **Auto-eject**: Supports automatic G-code injection for bed clearing after prints

### G-code Parser (`lib/gcode-parser.ts`)

Extracts metadata from G-code files:

- Estimated print time
- Filament usage (grams)
- Print dimensions (width, depth, height)
- Temperature settings (nozzle, bed)
- Material type
- Layer height

---

## 📡 API Reference

### Printers

| Method   | Endpoint                     | Description                  |
|----------|------------------------------|------------------------------|
| `GET`    | `/api/printers`              | List all user's printers     |
| `POST`   | `/api/printers`              | Add a new printer            |
| `PUT`    | `/api/printers`              | Update printer settings      |
| `DELETE` | `/api/printers?id={id}`      | Remove a printer             |
| `GET`    | `/api/printers/[id]/status`  | Get real-time printer status |
| `POST`   | `/api/printers/[id]/control` | Send control commands        |

### Models

| Method   | Endpoint                 | Description              |
|----------|--------------------------|--------------------------|
| `GET`    | `/api/models`            | List all models          |
| `POST`   | `/api/models`            | Upload a new model       |
| `DELETE` | `/api/models?id={id}`    | Delete a model           |
| `POST`   | `/api/models/[id]/queue` | Queue model for printing |

### Jobs

| Method   | Endpoint         | Description         |
|----------|------------------|---------------------|
| `GET`    | `/api/jobs`      | List all print jobs |
| `PATCH`  | `/api/jobs/[id]` | Update job status   |
| `DELETE` | `/api/jobs/[id]` | Cancel/remove a job |

### Slicing

| Method | Endpoint               | Description                   |
|--------|------------------------|-------------------------------|
| `GET`  | `/api/slicer/profiles` | Get available slicer profiles |
| `POST` | `/api/slicer/slice`    | Slice an STL file             |

### Notifications

| Method | Endpoint                       | Description            |
|--------|--------------------------------|------------------------|
| `GET`  | `/api/notifications`           | Get user notifications |
| `POST` | `/api/notifications/[id]/read` | Mark as read           |

---

## 🗄️ Database Schema

### Core Entities

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│    User     │──┐   │ UserPrinter │──────│   PrintJob  │
├─────────────┤  │   ├─────────────┤      ├─────────────┤
│ id          │  │   │ id          │      │ id          │
│ username    │  │   │ name        │      │ status      │
│ passwordHash│  └──>│ ipAddress   │      │ startTime   │
│ createdAt   │      │ apiKey      │      │ endTime     │
└─────────────┘      │ status      │      │ autoEject   │
       │             │ protocol    │<─────│ userPrinter │
       │             │ webcamUrl   │      │ model       │──>┌───────────┐
       v             │ ejectGcode  │      └─────────────┘   │   Model   │
┌─────────────┐      └─────────────┘                        ├───────────┤
│Notification │                                             │ name      │
├─────────────┤                                             │ filePath  │
│ title       │                                             │ gcodePath │
│ message     │                                             │ dimensions│
│ type        │                                             │ printTime │
│ read        │                                             │ filament  │
└─────────────┘                                             └───────────┘
```

### Additional Tables

- **Manufacturer** - Printer manufacturers catalog
- **PrinterTechnology** - Technology types (FDM, SLA, etc.)
- **PrinterFeature** - Printer capabilities (auto bed leveling, etc.)
- **Printer** - Master printer catalog (linked to UserPrinter)
- **MaterialStats** - Filament inventory and costs

---

## 🔌 Printer Protocols

### Moonraker (Klipper)

For Klipper-based printers running Moonraker:

1. Ensure Moonraker is running on your printer
2. Default port is `7125` (HTTP API)
3. Add printer using IP address (e.g., `192.168.1.100` or `voron.local`)
4. Full feature support: status, upload, print, webcam

**Supported Operations:**

- ✅ Real-time status polling
- ✅ G-code file upload
- ✅ Print start/pause/resume/cancel
- ✅ Temperature monitoring
- ✅ Webcam streaming (if configured)

### MQTT (Bambu Lab & Others)

For MQTT-enabled printers:

1. Printer must be accessible via MQTT broker
2. Add using broker IP/hostname
3. Limited feature support compared to Moonraker

**Supported Operations:**

- ✅ Status monitoring
- ✅ Temperature data (if published)
- ❌ G-code upload (not supported via MQTT)

---

## 🔪 Slicing Integration

Accelerate3D can slice STL files directly using locally installed slicers.

### Supported Slicers

| Slicer      | Profile Format | Auto-Detection Path     |
|-------------|----------------|-------------------------|
| PrusaSlicer | `.ini`         | `~/.PrusaSlicer/`       |
| OrcaSlicer  | `.json`        | `~/.config/OrcaSlicer/` |

### Setup

1. Install PrusaSlicer or OrcaSlicer on the server
2. Create slicing profiles using the slicer GUI
3. Navigate to the "Slice" tab in Accelerate3D
4. Select your slicer and profile
5. Upload STL and configure overrides if needed
6. Click "Slice Now" to generate G-code

### Profile Overrides

When slicing, you can override:

- Infill percentage
- Support material (on/off)
- Brim (on/off)
- Layer height

---

## ⚙️ Configuration

### Environment Variables

| Variable          | Required | Description                   |
|-------------------|----------|-------------------------------|
| `DATABASE_URL`    | Yes      | SQLite database path          |
| `NEXTAUTH_SECRET` | Yes      | Secret for session encryption |
| `NEXTAUTH_URL`    | Yes      | Application base URL          |

### Custom G-code Injection

You can configure per-printer G-code to be injected:

1. Open printer settings
2. Add custom "Eject G-code"
3. This code will be appended to prints for auto-eject functionality

Example eject G-code:

```gcode
; Auto-eject sequence
G28 X Y
G1 Y220 F3000
M400
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use Prisma for all database operations
- Add API routes in `app/api/`
- Create reusable components in `components/ui/`
- Keep business logic in `lib/`

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ for the 3D printing community
</p>

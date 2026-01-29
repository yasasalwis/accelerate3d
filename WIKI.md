# Accelerate3D Developer Wiki

> [!WARNING]
> **Development Build**: This application is currently in active development and may contain bugs. If you encounter any
> issues, please report them to the repository maintainers.

## 🚀 Project Status & Accomplishments

Accelerate3D has evolved into a robust, multi-protocol 3D printer fleet management system. Below is a summary of the
core capabilities currently implemented.

### Core Fleet Management

- **Universal Dashboard**: Unified view of all printers regardless of protocol.
- **Real-time Telemetry**: Monitoring of bed/nozzle temperatures, print progress, and remaining time.
- **Control Interface**: Pause, Resume, and Cancel functionality directly from the dashboard.
- **Protocol Agnostic**: Seamless support for **Moonraker (Klipper)** and **MQTT (Bambu Lab)**.

### Intelligent Job Queue

- **Automated Scheduling**: Jobs are automatically dispatched to the next available compatible printer.
- **Work Stealing**: Idle printers can "steal" jobs from the queue of busy printers to maximize throughput.
- **Priority System**: Urgent jobs can be prioritized in the queue.

### Integrated Slicing Engine

- **In-Browser Slicing**: Users can upload STL files and slice them directly within the app.
- **Multi-Slicer Support**: Integration with **PrusaSlicer** and **OrcaSlicer**.
- **Profile Auto-Detection**: The system automatically scans and loads existing slicer profiles from the host machine.
- **Advanced Configuration**: visual interface for overriding key settings (Infill, Supports, Brim, Layer Height).

### User Management & Security

- **Secure Authentication**: Built on NextAuth.js.
- **Data Isolation**: comprehensive data isolation ensures users only see their own printers and jobs.
- **Ownership Model**: "Owner" based permission system for printer management.

---

## 🛠️ Recent Improvements & Changelog

A log of significant refactors, optimizations, and feature additions.

### 🔍 Quality Assurance & Stability

- **Unit Testing**: Implemented an extensive unit testing suite covering critical paths (Scheduler, Printer Client).
- **Code Hygiene**: Resolved comprehensive ESLint and TypeScript build errors to ensure a strict, type-safe codebase.
- **Stability Fixes**:adddressed timeout issues with Moonraker clients and handled edge cases in network discovery.

### 🎨 UI/UX Refinements

- **Notification System**: Deployed a centralized, app-wide notification system utilizing toast messages for immediate
  feedback (Success, Error, Info).
- **Dashboard Polish**: Removed static placeholders (e.g., "System Online") in frequent of real functional data;
  improved server uptime display.
- **Authentication Flow**: Created a dedicated, standalone login/register experience separate from the main dashboard
  layout.

### 🔌 Connectivity & Hardware

- **Flexible Addressing**: Added support for both IP addresses and Hostnames (mDNS) for printer connections.
- **Protocol Selection**: Implemented explicit protocol selection (Moonraker vs. MQTT) during printer setup to avoid
  auto-detection errors.
- **G-code Injection**: Added ability to inject custom G-code (e.g., bed clearing sequences) automatically before print
  jobs.

---

## 🔮 Roadmap & Future Plans

Our vision for the future of Accelerate3D involves deeper meaningful intelligence and broader hardware support.

### 1. Immediate Term (v1.x)

- **Live Video Feeds**: Complete the integration of MJPEG and HLS video streams for real-time visual monitoring.
- **Mobile Responsiveness**: Further optimize the dashboard for mobile browsers (iOS/Android).
- **Slicing Feedback**: Improve error reporting during the slicing process to give users more detailed failure reasons.

### 2. Medium Term (v2.x)

- **Advanced Analytics**:
    - Cost per print calculation based on filament density and energy usage.
    - Failure rate tracking and printer reliability scoring.
- **Printer Groups**: Ability to organize printers into logical groups (e.g., "PLA Farm", "ABS Farm") for bulk
  management.
- **OctoPrint Support**: Add a third protocol adapter to support legacy OctoPrint instances.
- **Inventory Management**: Track filament spool usage and alert when stock is low.

### 3. Long Term (v3.x / Research)

- **AI Failure Detection**: Utilize webcam feeds and computer vision to automatically pause prints when failure (
  spaghetti) is detected.
- **Plugin Architecture**: Open up the system for community-contributed plugins (e.g., Telegram bots, discord
  notifications).
- **Cloud Sync**: Optional cloud backup for slicer profiles and printer configurations.

---

## 🏗️ Technical Architecture Overview

### Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: SQLite with Prisma ORM
- **Styling**: Tailwind CSS + Shadcn/ui
- **State Management**: TanStack Query

### Key Modules

- **`lib/printer-client.ts`**: The factory pattern implementation that normalizes communication across different printer
  protocols.
- **`lib/scheduler.ts`**: The brain of the operation; a background worker that matches pending jobs with available
  printers.
- **`lib/gcode-parser.ts`**: Utility to analyze raw G-code for metadata (dimensions, time, filament usage) without
  relying on the printer to report it.

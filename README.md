# Accelerate3D

**Accelerate3D** is an advanced 3D printer fleet management system design to control, monitor, and optimize 3D printing workflows. Built with modern web technologies, it offers real-time status updates, seamless protocol integration (Moonraker & MQTT), and powerful analytics for both hobbyists and print farms.

## 🚀 Features

- **Fleet Dashboard**: Visualize the status of all your printers in one place with real-time updates.
- **Protocol Agnostic**:
  - **Moonraker**: Native support for Klipper-based printers.
  - **MQTT**: Integration for Bambu Lab and other MQTT-enabled devices.
- **Model Repository**: 
  - Upload 3D models and G-code files.
  - Automatic G-code analysis for print time and filament usage.
  - Integration with Slicing software.
- **Job Queue**: Manage your print queue efficiently with drag-and-drop support (coming soon) and priority handling.
- **Analytics & Reporting**:
  - Track filament usage and costs.
  - Monitor printer success/failure rates.
  - Visualize utilization trends.
- **User Management**: Secure role-based access control for team environments.

## 🛠️ Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [SQLite](https://www.sqlite.org/) with [Prisma ORM](https://www.prisma.io/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Radix UI](https://www.radix-ui.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)

## 🏁 Getting Started

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v20 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/accelerate3d.git
    cd accelerate3d
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up the database:**
    This project uses SQLite by default. Run the following command to initialize the database and generate the Prisma client.
    ```bash
    npx prisma db push
    ```

4.  **Enviroment Variables:**
    Create a `.env` file in the root directory. You can use `.env.example` as a reference if available, or start with:
    ```env
    DATABASE_URL="file:./dev.db"
    NEXTAUTH_SECRET="your-super-secret-key"
    NEXTAUTH_URL="http://localhost:3000"
    ```

5.  **Run the development server:**
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📂 Project Structure

```
accelerate3d/
├── app/                  # Next.js App Router pages and API routes
│   ├── (auth)/           # Authentication routes (login, register)
│   ├── api/              # Backend API endpoints
│   ├── printers/         # Printer management pages
│   └── ...
├── components/           # Reusable UI components
│   ├── ui/               # Primitive UI elements (buttons, inputs)
│   ├── detailed-view/    # Specific view components
│   └── ...
├── lib/                  # Utility functions and shared logic
│   ├── actions.ts        # Server actions
│   ├── printer-client.ts # Printer communication logic
│   └── ...
├── prisma/               # Database schema and seeds
└── public/               # Static assets
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

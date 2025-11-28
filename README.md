# Pantavista CRM Dashboard

A modern React + TypeScript dashboard application built with Vite and Material-UI (MUI).

## 🚀 Features

- **Modern UI/UX**: Clean, professional design with smooth animations
- **Authentication**: Login page with protected routes
- **Dashboard Layout**: Fixed sidebar navigation with submenu support
- **Suppliers Management**: Full CRUD interface with search and pagination
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **TypeScript**: Full type safety throughout the application

## 📦 Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Material-UI (MUI)** - Component library
- **React Router DOM** - Client-side routing

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
src/
├── components/          # Reusable components
│   ├── DashboardLayout.tsx    # Main dashboard layout with sidebar
│   └── SupplierActions.tsx   # Supplier actions drawer
├── pages/              # Page components
│   ├── Login.tsx       # Login page
│   ├── Suppliers.tsx   # Suppliers table page
│   └── ...             # Other pages
├── types/              # TypeScript type definitions
├── App.tsx             # Main app component with routing
└── main.tsx            # Entry point
```

## 🔐 Authentication

Default credentials for testing:
- **Username**: `test`
- **Password**: `test`

## 📝 Available Pages

- **Suppliers** - Manage supplier data with table view
- **Regions** - Region management (in development)
- **Persons** - Person management with submenu
- **Products** - Product catalog
- **Documents** - Document management
- **Transactions** - Transaction history with submenu
- **Workspace** - Workspace management (in development)
- **Settings** - Application settings (in development)

## 🎨 Features

- **Supplier Actions**: Click any supplier row to view actions drawer
- **Search & Filter**: Search suppliers by name, city, phone, etc.
- **Pagination**: Navigate through large datasets efficiently
- **Submenu Navigation**: Hover over menu items with ">" to see submenus
- **Responsive Layout**: Adapts to different screen sizes

## 📄 License

This project is private and proprietary.

## 👥 Contributing

This is a private project. For questions or issues, please contact the development team.

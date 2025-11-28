# React Dashboard Project

A modern React + TypeScript dashboard application built with Vite.

## 🚀 Getting Started

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 📁 Project Structure

```
src/
├── components/          # Reusable components
│   ├── DashboardLayout.tsx    # Main dashboard layout with sidebar
│   └── DashboardLayout.css
├── pages/              # Page components
│   ├── Dashboard.tsx   # Dashboard page
│   └── Dashboard.css
├── types/              # TypeScript type definitions
│   └── index.ts
├── App.tsx             # Main app component with routing
├── App.css             # Global app styles
├── main.tsx            # Entry point
└── index.css           # Global styles
```

## 🎨 Converting Figma Designs

To convert your Figma design to React components, you can:

1. **Share Screenshots**: Take screenshots of your Figma designs and share them
2. **Export Assets**: Export images, icons, and other assets from Figma
3. **Share Design Specs**: Provide details about:
   - Colors (hex codes)
   - Typography (font families, sizes, weights)
   - Spacing and layout measurements
   - Component specifications

## 📦 Dependencies

- **React 19** - UI library
- **TypeScript** - Type safety
- **React Router DOM** - Client-side routing
- **Vite** - Build tool and dev server

## 🛠️ Adding New Pages

1. Create a new component in `src/pages/`
2. Add a route in `src/App.tsx`
3. Add a navigation item in `src/components/DashboardLayout.tsx`

Example:
```typescript
// In App.tsx
<Route path="/settings" element={<Settings />} />

// In DashboardLayout.tsx
{ path: '/settings', label: 'Settings', icon: '⚙️' }
```

## 📝 Notes

- The dashboard layout includes a sidebar navigation
- All components are TypeScript-typed
- Responsive design is included
- Modern CSS with flexbox/grid layouts

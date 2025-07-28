# Time Tracker MVP

A comprehensive time tracking solution with desktop Electron app, web dashboard, and backend API. Features automatic screenshot capture, shift management, and detailed analytics.

## 🏗️ Project Architecture

```
time-tracker-mvp/
├── backend/                 # Express.js API server
│   ├── controllers/         # API route handlers
│   ├── middleware/          # Authentication & validation
│   ├── prisma/             # Database schema & migrations
│   ├── repository/          # Data access layer
│   ├── routes/             # API endpoints
│   ├── services/           # Business logic
│   └── tests/              # API tests
├── electron-app/           # Desktop application
│   ├── src/               # Source code
│   │   ├── main/          # Main process
│   │   ├── renderer/      # Renderer process
│   │   ├── services/      # API & screenshot services
│   │   └── config/        # App configuration
│   ├── renderer/          # Static assets
│   ├── assets/            # App icons & resources
│   └── releases/          # Built applications
├── web-vite-ui/           # React web dashboard
│   ├── src/               # React components
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   └── repository/    # API client layer
│   └── public/            # Static assets
└── scripts/               # Build & deployment scripts
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** 14+ (for backend)
- **Git**

### 1. Clone & Setup

```bash
git clone <repository-url>
cd time-tracker-mvp
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Edit .env with your database settings
# DATABASE_URL="postgresql://username:password@localhost:5432/timetracker"

# Setup database
npx prisma migrate dev
npx prisma generate

# Start backend server
npm run dev
# Server runs on http://localhost:3000
```

### 3. Web Dashboard Setup

```bash
cd web-vite-ui

# Install dependencies
npm install

# Start development server
npm run dev
# Dashboard runs on http://localhost:5173
```

### 4. Desktop App Setup

```bash
cd electron-app

# Install dependencies
npm install

# Start in development mode
npm run dev

# Build for macOS
npm run build:mac
```

## 📱 Features

### Desktop App (Electron)
- ✅ **User Authentication** - Secure login system
- ✅ **Shift Management** - View and manage work shifts
- ✅ **Activity Timer** - Start/stop time tracking
- ✅ **Screenshot Capture** - Automatic screenshots every 20 seconds
- ✅ **Permission Handling** - macOS screen recording permissions
- ✅ **Offline Support** - Works without constant internet
- ✅ **Cross-platform** - macOS, Windows, Linux support

### Web Dashboard (React)
- ✅ **Admin Panel** - Employee and project management
- ✅ **Analytics** - Time tracking reports and insights
- ✅ **Screenshot Viewer** - View captured screenshots
- ✅ **Project Management** - Create and manage projects/tasks
- ✅ **Team Management** - Employee and shift management
- ✅ **Export Features** - Download reports and data

### Backend API (Express.js)
- ✅ **RESTful API** - Complete CRUD operations
- ✅ **Authentication** - JWT-based auth system
- ✅ **Database** - PostgreSQL with Prisma ORM
- ✅ **Screenshot Storage** - Base64 image storage
- ✅ **Analytics** - Time tracking statistics
- ✅ **File Upload** - Screenshot upload handling

## 🔧 Development

### Backend Development

```bash
cd backend

# Run in development mode
npm run dev

# Run tests
npm test

# Database operations
npx prisma studio          # Database GUI
npx prisma migrate dev     # Run migrations
npx prisma generate        # Generate client
```

### Web Dashboard Development

```bash
cd web-vite-ui

# Run in development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Desktop App Development

```bash
cd electron-app

# Run in development mode
npm run dev

# Build for different platforms
npm run build:mac          # macOS
npm run build:win          # Windows
npm run build              # All platforms

# Test the build
./test-build.sh
```

## 🗄️ Database Schema

### Core Models
- **Employee** - User accounts and profiles
- **Project** - Work projects and categories
- **Task** - Specific work tasks
- **Shift** - Scheduled work periods
- **Activity** - Time tracking sessions
- **Screenshot** - Captured screen images
- **TimeEntry** - Legacy time entries

### Key Relationships
- Employees belong to teams
- Shifts are linked to projects and tasks
- Activities are created during shifts
- Screenshots are linked to activities
- All data is properly indexed for performance

## 🔐 Authentication

### Desktop App
- Email/password login
- JWT token storage
- Automatic token refresh
- Offline capability

### Web Dashboard
- Admin authentication
- Role-based access
- Session management
- Secure API calls

## 📸 Screenshot System

### Features
- **Automatic Capture** - Every 20 seconds during work
- **Permission Handling** - macOS screen recording
- **Compression** - Optimized for storage
- **Upload** - Real-time to backend
- **Viewing** - Web dashboard viewer

### Configuration
```javascript
// src/config/app-config.js
screenshot: {
  intervalSeconds: 20,     // Development
  intervalSeconds: 300,    // Production (5 minutes)
  maxWidth: 800,
  maxHeight: 600,
  quality: 0.7,
}
```

## 🚀 Deployment

### Backend Deployment
```bash
cd backend
npm run build
npm start
```

### Web Dashboard Deployment
```bash
cd web-vite-ui
npm run build
# Deploy dist/ folder
```

### Desktop App Distribution
```bash
cd electron-app
npm run build:mac    # macOS
npm run build:win    # Windows
npm run build:linux  # Linux
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Desktop App Tests
```bash
cd electron-app
./test-build.sh
```

## 📊 API Documentation

### Interactive API Docs
Access the complete API documentation with Swagger UI:
```
http://localhost:3000/api-docs
```

### Core Endpoints
- `POST /api/v1/auth/login` - User authentication
- `GET /api/v1/employees` - Employee management
- `GET /api/v1/projects` - Project management
- `POST /api/v1/activities` - Time tracking
- `POST /api/v1/screenshots` - Screenshot upload
- `GET /api/v1/analytics` - Reports and statistics

### Authentication
All API calls require a valid JWT token in the Authorization header:
```
Authorization: Bearer <jwt-token>
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
PORT=3000
NODE_ENV=development
```

#### Desktop App
```javascript
// src/config/app-config.js
api: {
  baseUrl: process.env.API_BASE_URL || 'http://localhost:3000'
}
```

## 📁 File Structure Details

### Backend Structure
```
backend/
├── controllers/           # API route handlers
│   ├── analyticsController.js
│   ├── screenshotController.js
│   └── ...
├── middleware/           # Request processing
│   └── auth.js
├── prisma/              # Database layer
│   ├── schema.prisma    # Database schema
│   └── migrations/      # Database migrations
├── repository/          # Data access
│   ├── employeeRepository.js
│   ├── projectRepository.js
│   └── ...
├── routes/              # API routes
│   ├── auth.js
│   ├── employees.js
│   └── ...
├── services/            # Business logic
│   ├── analyticsService.js
│   └── screenshotService.js
└── tests/               # Test files
```

### Desktop App Structure
```
electron-app/
├── src/
│   ├── main/            # Main process
│   │   ├── app.js       # App initialization
│   │   ├── window.js    # Window management
│   │   └── ipc-handlers.js # IPC communication
│   ├── renderer/        # Renderer process
│   │   ├── app-controller.js # Main controller
│   │   ├── timer-manager.js  # Timer logic
│   │   └── ui-manager.js     # UI updates
│   ├── services/        # External services
│   │   ├── api-service.js    # Backend API
│   │   └── screenshot-service.js # Screenshot capture
│   └── config/          # Configuration
│       └── app-config.js
├── renderer/            # Static assets
│   ├── index.html       # Main HTML
│   ├── styles.css       # Styles
│   └── renderer.js      # Renderer script
├── assets/              # App resources
│   └── icon.png         # App icon
└── releases/            # Built applications
```

### Web Dashboard Structure
```
web-vite-ui/
├── src/
│   ├── components/      # Reusable components
│   │   ├── ui/          # Basic UI components
│   │   ├── analytics/   # Analytics components
│   │   └── screenshots/ # Screenshot components
│   ├── pages/           # Page components
│   │   ├── DashboardPage.jsx
│   │   ├── AnalyticsPage.jsx
│   │   └── ...
│   ├── repository/      # API client
│   │   ├── employeeRepository.js
│   │   ├── projectRepository.js
│   │   └── ...
│   └── lib/             # Utilities
└── public/              # Static assets
```

## 🛠️ Troubleshooting

### Common Issues

#### Backend Issues
```bash
# Database connection issues
npx prisma migrate reset
npx prisma generate

# Port already in use
lsof -ti:3000 | xargs kill -9
```

#### Desktop App Issues
```bash
# Build issues
rm -rf node_modules package-lock.json
npm install
npm run build:mac

# Permission issues (macOS)
sudo spctl --master-disable
```

#### Web Dashboard Issues
```bash
# Build issues
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Development Tips

1. **Hot Reloading**: All components support hot reloading
2. **Debug Mode**: Use `npm run dev` for development
3. **Build Testing**: Always test builds before distribution
4. **Database**: Use Prisma Studio for database inspection
5. **Logs**: Check console logs for debugging

## 📚 Additional Documentation

- [Screenshot Architecture](SCREENSHOT_ARCHITECTURE.md)
- [Download System](DOWNLOAD_SYSTEM.md)
- [Activation Integration](ACTIVATION_INTEGRATION.md)
- [Electron App Guide](electron-app/DEV_README.md)
- [Build Guide](electron-app/BUILD_GUIDE.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the documentation
3. Check existing issues
4. Create a new issue with details

---

**Built with ❤️ using Electron, React, Express.js, and PostgreSQL** 
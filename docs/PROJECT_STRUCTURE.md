# 📁 Project Structure

## 🏗️ **JanataReport - Civic Issue Reporting Platform**

```
JantaReport/
├── 📁 client/                          # Frontend React Application
│   ├── 📁 public/                      # Static assets
│   │   ├── favicon.ico
│   │   ├── index.html
│   │   └── manifest.json
│   ├── 📁 src/                         # Source code
│   │   ├── 📁 components/              # Reusable components
│   │   │   ├── 📁 auth/               # Authentication components
│   │   │   │   └── ProtectedRoute.js
│   │   │   ├── 📁 layout/             # Layout components
│   │   │   │   ├── Footer.js
│   │   │   │   └── Navbar.js
│   │   │   ├── FallbackMapPicker.js   # Fallback map component
│   │   │   ├── GoogleLogin.js         # Google OAuth component
│   │   │   ├── GoogleMapPicker.js     # Google Maps picker
│   │   │   ├── MapboxPicker.js        # Mapbox picker
│   │   │   ├── OpenStreetMapPicker.js # OpenStreetMap picker
│   │   │   └── SimpleMapTest.js       # Map testing component
│   │   ├── 📁 config/                 # Configuration files
│   │   │   └── googleAuth.js          # Google OAuth config
│   │   ├── 📁 contexts/               # React contexts
│   │   │   ├── AuthContext.js         # Authentication context
│   │   │   └── LanguageContext.js     # Internationalization context
│   │   ├── 📁 pages/                  # Page components
│   │   │   ├── 📁 admin/              # Admin pages
│   │   │   │   ├── AdminDashboard.js
│   │   │   │   ├── AdminPanel.js
│   │   │   │   ├── AuthorityManagement.js
│   │   │   │   ├── CategoriesManagement.js
│   │   │   │   ├── OfficialsManagement.js
│   │   │   │   └── UsersManagement.js
│   │   │   ├── 📁 auth/               # Authentication pages
│   │   │   │   ├── Login.js
│   │   │   │   └── Register.js
│   │   │   ├── Analytics.js           # Analytics dashboard
│   │   │   ├── Dashboard.js           # User dashboard
│   │   │   ├── EditIssue.js           # Edit issue page
│   │   │   ├── Home.js                # Home page
│   │   │   ├── IssueDetail.js         # Issue detail page
│   │   │   ├── IssuesList.js          # Issues listing page
│   │   │   ├── Profile.js             # User profile page
│   │   │   ├── ReportIssue.js         # Legacy report issue page
│   │   │   └── ReportIssueMultiStep.js # Multi-step report issue page
│   │   ├── 📁 services/               # API services
│   │   │   └── api.js                 # API client
│   │   ├── App.js                     # Main App component
│   │   ├── index.css                  # Global styles
│   │   └── index.js                   # Entry point
│   ├── package.json                   # Frontend dependencies
│   ├── package-lock.json              # Lock file
│   ├── postcss.config.js              # PostCSS config
│   └── tailwind.config.js             # Tailwind CSS config
│
├── 📁 server/                         # Backend Node.js Application
│   ├── 📁 config/                     # Server configuration
│   │   └── database.js                # Database configuration
│   ├── 📁 middleware/                 # Express middleware
│   │   ├── auth.js                    # Authentication middleware
│   │   └── validation.js              # Request validation middleware
│   ├── 📁 models/                     # Database models
│   │   ├── Authority.js               # Authority model
│   │   ├── Category.js                # Category model
│   │   ├── Comment.js                 # Comment model
│   │   ├── index.js                   # Models index
│   │   ├── Issue.js                   # Issue model
│   │   ├── Official.js                # Official model
│   │   ├── Subcategory.js             # Subcategory model
│   │   ├── Upvote.js                  # Upvote model
│   │   └── User.js                    # User model
│   ├── 📁 routes/                     # API routes
│   │   ├── analytics.js               # Analytics routes
│   │   ├── auth.js                    # Authentication routes
│   │   ├── authorities.js             # Authority management routes
│   │   ├── categories.js              # Category routes
│   │   ├── issues.js                  # Issue routes
│   │   └── officials.js               # Official routes
│   ├── 📁 scripts/                    # Database scripts
│   │   ├── cleanupDuplicates.js       # Cleanup script
│   │   ├── seed.js                    # Database seeding
│   │   └── seedAuthorities.js         # Authority seeding
│   ├── index.js                       # Server entry point
│   ├── package.json                   # Backend dependencies
│   ├── package-lock.json              # Lock file
│   └── env.example                    # Environment variables example
│
├── 📁 config/                         # Docker Configuration
│   ├── Dockerfile                     # Main Dockerfile
│   ├── Dockerfile.backend             # Backend Dockerfile
│   └── Dockerfile.frontend            # Frontend Dockerfile
│
├── 📁 scripts/                        # Project Scripts
│   ├── docker-setup.bat               # Windows Docker setup
│   ├── setup.bat                      # Windows setup script
│   ├── setup.ps1                      # PowerShell setup script
│   └── setup.py                       # Python setup script
│
├── 📁 docs/                           # Documentation
│   ├── cursor_build_a_civic_issue_reporting_pl.md
│   ├── DOCKER_SETUP.md                # Docker setup guide
│   ├── GOOGLE_MAPS_SETUP.md           # Google Maps setup
│   ├── PROJECT_STRUCTURE.md           # This file
│   ├── QUICK_START.md                 # Quick start guide
│   ├── README.md                      # Main README
│   ├── SETUP_GUIDE.md                 # Detailed setup guide
│   └── TROUBLESHOOTING.md             # Troubleshooting guide
│
├── docker-compose.yml                 # Docker Compose configuration
├── package.json                       # Root package.json
└── README.md                          # Main project README
```

## 🎯 **Key Directories Explained**

### **Frontend (`client/`)**
- **`src/components/`**: Reusable UI components
- **`src/pages/`**: Page-level components
- **`src/contexts/`**: React context providers
- **`src/services/`**: API communication layer
- **`src/config/`**: Frontend configuration

### **Backend (`server/`)**
- **`models/`**: Database models (Sequelize)
- **`routes/`**: API endpoint definitions
- **`middleware/`**: Express middleware functions
- **`scripts/`**: Database management scripts
- **`config/`**: Server configuration

### **Configuration (`config/`)**
- **Docker files**: Container configuration
- **Environment templates**: Configuration examples

### **Scripts (`scripts/`)**
- **Setup scripts**: Platform-specific setup
- **Utility scripts**: Development tools

### **Documentation (`docs/`)**
- **Setup guides**: Installation instructions
- **API documentation**: Endpoint documentation
- **Troubleshooting**: Common issues and solutions

## 🔧 **Development Workflow**

### **Frontend Development**
```bash
cd client/
npm install
npm start
```

### **Backend Development**
```bash
cd server/
npm install
npm run dev
```

### **Full Stack Development**
```bash
docker-compose up -d
```

## 📊 **Technology Stack**

### **Frontend**
- **React 18**: UI framework
- **React Router**: Client-side routing
- **Tailwind CSS**: Styling
- **React Hook Form**: Form management
- **React Query**: Data fetching
- **Leaflet**: Map integration
- **Lucide React**: Icons

### **Backend**
- **Node.js**: Runtime
- **Express.js**: Web framework
- **Sequelize**: ORM
- **PostgreSQL**: Database
- **PostGIS**: Geographic extensions
- **JWT**: Authentication
- **Multer**: File uploads

### **DevOps**
- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration
- **Nginx**: Reverse proxy (production)

## 🚀 **Getting Started**

1. **Clone the repository**
2. **Follow `docs/QUICK_START.md`**
3. **Run `docker-compose up -d`**
4. **Open http://localhost:3000**

## 📝 **Contributing**

1. **Follow the project structure**
2. **Add components to appropriate directories**
3. **Update documentation**
4. **Test thoroughly**

This structure ensures maintainability, scalability, and clear separation of concerns! 🎉

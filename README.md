# 🏛️ JanataReport - Civic Issue Reporting Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/docker-%3E%3D20.0.0-blue)](https://www.docker.com/)
[![React](https://img.shields.io/badge/react-18.2.0-blue)](https://reactjs.org/)

A comprehensive full-stack web application for India where citizens can report civic issues, track their resolution, and view analytics. Built with modern technologies including React, Node.js, Express, and PostgreSQL.

## 🚀 **Quick Start**

```bash
# Clone the repository
git clone https://github.com/your-username/janata-report.git
cd janata-report

# Start the application
npm start

# Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

## 📁 **Project Structure**

```
JantaReport/
├── 📁 client/          # React Frontend Application
├── 📁 server/          # Node.js Backend Application  
├── 📁 config/          # Docker Configuration Files
├── 📁 scripts/         # Setup and Utility Scripts
└── 📁 docs/            # Comprehensive Documentation
```

**📖 For detailed project structure, see [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md)**

## ✨ **Features**

### **Core Functionality**
- **🔐 Multi-Auth System**: Email/phone login, Google OAuth, anonymous reporting
- **📝 Issue Reporting**: Multi-step form with photos, location, and detailed descriptions
- **📍 Location Services**: Interactive maps with precise location selection
- **📊 Issue Tracking**: Status tracking from Open → In Progress → Resolved → Verified
- **📱 File Uploads**: Support for photos and videos
- **🌐 Multi-language**: English, Hindi, and Telugu support

### **Advanced Features**
- **👥 Authority Management**: Dynamic authority assignment based on issue categories
- **📈 Analytics Dashboard**: Comprehensive reporting and analytics
- **🔍 Search & Filtering**: Advanced search with multiple filters
- **💬 Comments System**: User engagement and updates
- **👍 Voting System**: Community-driven issue prioritization
- **📧 Notifications**: Real-time updates and alerts

### **Admin Features**
- **👨‍💼 Admin Panel**: Complete administrative control
- **📊 Analytics**: Detailed reporting and insights
- **👥 User Management**: User account management
- **📂 Category Management**: Issue categories and subcategories
- **🏛️ Authority Management**: Government authority management

## 🛠️ **Technology Stack**

### **Frontend**
- **React 18** - Modern UI framework
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **React Hook Form** - Form management
- **React Query** - Data fetching and caching
- **Leaflet** - Interactive maps
- **Lucide React** - Beautiful icons

### **Backend**
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Sequelize** - SQL ORM
- **PostgreSQL** - Relational database
- **PostGIS** - Geographic database extensions
- **JWT** - Authentication
- **Multer** - File upload handling

### **DevOps**
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy (production)

## 📋 **Prerequisites**

- **Node.js** 18+ and npm 8+
- **Docker** and Docker Compose
- **Git** for version control

## 🚀 **Installation & Setup**

### **Option 1: Docker (Recommended)**
```bash
# Clone repository
git clone https://github.com/your-username/janata-report.git
cd janata-report

# Start all services
docker-compose up -d

# Access application
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

### **Option 2: Local Development**
```bash
# Install dependencies
npm run install-all

# Start backend
npm run server

# Start frontend (in new terminal)
npm run client
```

**📖 For detailed setup instructions, see [docs/SETUP_GUIDE.md](docs/SETUP_GUIDE.md)**

## 🔧 **Available Scripts**

### **Root Level Commands**
```bash
npm start              # Start Docker containers
npm run dev            # Start both frontend and backend
npm run server         # Start backend only
npm run client         # Start frontend only
npm run build          # Build frontend for production
npm run docker:up      # Start Docker containers
npm run docker:down    # Stop Docker containers
npm run docker:restart # Restart containers
npm run docker:logs    # View container logs
npm run clean          # Clean Docker resources
```

### **Frontend Commands**
```bash
cd client/
npm start              # Start development server
npm run build          # Build for production
npm test               # Run tests
```

### **Backend Commands**
```bash
cd server/
npm start              # Start production server
npm run dev            # Start development server
npm run seed           # Seed database
```

## 📚 **Documentation**

- **[Project Structure](docs/PROJECT_STRUCTURE.md)** - Detailed project organization
- **[Development Guide](docs/DEVELOPMENT.md)** - Development workflow and best practices
- **[API Documentation](docs/API.md)** - Complete API reference
- **[Setup Guide](docs/SETUP_GUIDE.md)** - Detailed installation instructions
- **[Troubleshooting](docs/TROUBLESHOOTING.md)** - Common issues and solutions

## 🌟 **Key Features in Detail**

### **Multi-Step Issue Reporting**
- **Step 1**: Issue details (title, description, category, priority)
- **Step 2**: Media upload (photos, videos)
- **Step 3**: Location selection (interactive map)
- **Step 4**: Authority information (dynamic based on category)
- **Step 5**: Review and submit

### **Interactive Maps**
- **OpenStreetMap** integration with Leaflet
- **Click-to-select** location functionality
- **Address resolution** and display
- **Geographic search** capabilities

### **Authority Management**
- **Dynamic authority assignment** based on issue categories
- **Custom authority creation** for specific issues
- **Authority performance tracking** and analytics

### **Analytics Dashboard**
- **Issue statistics** and trends
- **Category-wise breakdown** of issues
- **Authority performance** metrics
- **Geographic distribution** of issues

## 🔒 **Security Features**

- **JWT Authentication** with secure token management
- **Password hashing** with bcrypt
- **CORS protection** with configurable origins
- **Rate limiting** to prevent abuse
- **Input validation** and sanitization
- **File upload security** with type validation

## 🌐 **Multi-language Support**

- **English** - Primary language
- **Hindi** - हिंदी support
- **Telugu** - తెలుగు support
- **Easy extensibility** for additional languages

## 📱 **Responsive Design**

- **Mobile-first** approach
- **Tablet and desktop** optimized
- **Touch-friendly** interface
- **Progressive Web App** ready

## 🚀 **Deployment**

### **Development**
```bash
npm start
```

### **Production**
```bash
# Build and deploy
npm run build
docker-compose -f docker-compose.prod.yml up -d
```

**📖 For deployment guides, see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)**

## 🤝 **Contributing**

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

**📖 For contribution guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md)**

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 **Team**

- **Development Team** - Core development and maintenance
- **Design Team** - UI/UX design and user experience
- **DevOps Team** - Infrastructure and deployment

## 📞 **Support**

- **GitHub Issues**: [Report bugs and request features](https://github.com/your-username/janata-report/issues)
- **Email**: support@janatareport.com
- **Documentation**: [docs.janatareport.com](https://docs.janatareport.com)

## 🙏 **Acknowledgments**

- **OpenStreetMap** for mapping services
- **React Community** for excellent documentation
- **Node.js Community** for robust backend tools
- **PostgreSQL Team** for reliable database
- **Docker Team** for containerization platform

## 📊 **Project Status**

- **Version**: 1.0.0
- **Status**: Active Development
- **Last Updated**: September 2025
- **Next Release**: v1.1.0 (Planned)

---

**Made with ❤️ for India's civic improvement**

**JanataReport** - Empowering citizens to make their communities better! 🏛️✨

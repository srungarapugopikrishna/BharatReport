# 🚀 Development Guide

## 📋 **Prerequisites**

- **Node.js** 18+ and npm 8+
- **Docker** and Docker Compose
- **Git** for version control
- **Code Editor** (VS Code recommended)

## 🏗️ **Project Structure**

```
JantaReport/
├── 📁 client/          # React Frontend
├── 📁 server/          # Node.js Backend
├── 📁 config/          # Docker Configuration
├── 📁 scripts/         # Setup Scripts
└── 📁 docs/            # Documentation
```

## 🚀 **Quick Start**

### **Option 1: Docker (Recommended)**
```bash
# Clone repository
git clone <your-repo-url>
cd JantaReport

# Start all services
npm start
# or
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

## 🔧 **Development Commands**

### **Root Level Commands**
```bash
# Development
npm run dev              # Start both frontend and backend
npm run server           # Start backend only
npm run client           # Start frontend only

# Docker
npm run docker:up        # Start Docker containers
npm run docker:down      # Stop Docker containers
npm run docker:restart   # Restart containers
npm run docker:logs      # View container logs
npm run docker:build     # Build Docker images

# Setup
npm run setup            # Full setup (install + build)
npm run install-all      # Install all dependencies
npm run clean            # Clean Docker resources
```

### **Frontend Commands**
```bash
cd client/
npm start                # Start development server
npm run build            # Build for production
npm test                 # Run tests
npm run eject            # Eject from Create React App
```

### **Backend Commands**
```bash
cd server/
npm start                # Start production server
npm run dev              # Start development server
npm run seed             # Seed database
npm test                 # Run tests
```

## 🗄️ **Database Management**

### **Access Database**
```bash
# Connect to PostgreSQL
docker exec -it janata-postgres psql -U postgres -d janata_report

# Run migrations
docker exec janata-backend npx sequelize-cli db:migrate

# Seed database
docker exec janata-backend npm run seed
```

### **Database Scripts**
```bash
# Seed initial data
cd server/
npm run seed

# Clean up duplicates
node scripts/cleanupDuplicates.js

# Seed authorities
node scripts/seedAuthorities.js
```

## 🎨 **Frontend Development**

### **Component Structure**
```
src/
├── components/          # Reusable components
│   ├── auth/           # Authentication components
│   ├── layout/         # Layout components
│   └── maps/           # Map components
├── pages/              # Page components
│   ├── admin/          # Admin pages
│   └── auth/           # Auth pages
├── contexts/           # React contexts
├── services/           # API services
└── config/             # Configuration
```

### **Adding New Components**
1. Create component in appropriate directory
2. Export from component
3. Import and use in pages
4. Add to storybook (if applicable)

### **Styling**
- **Tailwind CSS** for utility classes
- **Custom CSS** for complex styles
- **Responsive design** for mobile/desktop

## 🔧 **Backend Development**

### **API Structure**
```
server/
├── routes/             # API routes
├── models/             # Database models
├── middleware/         # Express middleware
└── scripts/            # Database scripts
```

### **Adding New Routes**
1. Create route file in `routes/`
2. Define endpoints with validation
3. Add to main server file
4. Test with API client

### **Database Models**
1. Create model in `models/`
2. Define associations in `models/index.js`
3. Run migrations
4. Update seed scripts

## 🧪 **Testing**

### **Frontend Testing**
```bash
cd client/
npm test                # Run tests
npm run test:coverage   # Run with coverage
```

### **Backend Testing**
```bash
cd server/
npm test                # Run tests
npm run test:watch      # Watch mode
```

## 🔍 **Debugging**

### **Frontend Debugging**
- **React DevTools** browser extension
- **Console logs** in browser
- **Network tab** for API calls
- **Redux DevTools** (if using Redux)

### **Backend Debugging**
- **Console logs** in terminal
- **Postman** for API testing
- **Database queries** in pgAdmin
- **Docker logs** for container issues

### **Common Issues**
1. **Port conflicts**: Change ports in docker-compose.yml
2. **Database connection**: Check environment variables
3. **CORS errors**: Update CORS configuration
4. **Build errors**: Check dependencies and Node version

## 📦 **Dependencies Management**

### **Adding Dependencies**
```bash
# Frontend
cd client/
npm install package-name

# Backend
cd server/
npm install package-name

# Root level
npm install package-name --save-dev
```

### **Updating Dependencies**
```bash
# Check outdated packages
npm outdated

# Update packages
npm update

# Update specific package
npm install package-name@latest
```

## 🚀 **Deployment**

### **Development Deployment**
```bash
# Build and start
npm run build
npm run docker:up
```

### **Production Deployment**
1. Set environment variables
2. Build production images
3. Deploy to cloud platform
4. Configure domain and SSL

## 📝 **Code Standards**

### **Frontend Standards**
- **ESLint** for code linting
- **Prettier** for code formatting
- **Component naming** in PascalCase
- **File naming** in camelCase
- **Props validation** with PropTypes

### **Backend Standards**
- **ESLint** for code linting
- **Prettier** for code formatting
- **Function naming** in camelCase
- **File naming** in camelCase
- **Error handling** with try-catch

## 🔄 **Git Workflow**

### **Branch Strategy**
- **main**: Production-ready code
- **develop**: Development branch
- **feature/**: Feature branches
- **hotfix/**: Hotfix branches

### **Commit Messages**
```
feat: add new feature
fix: fix bug
docs: update documentation
style: formatting changes
refactor: code refactoring
test: add tests
chore: maintenance tasks
```

## 📊 **Performance Optimization**

### **Frontend Optimization**
- **Code splitting** with React.lazy
- **Image optimization** with WebP
- **Bundle analysis** with webpack-bundle-analyzer
- **Caching** with service workers

### **Backend Optimization**
- **Database indexing** for queries
- **Caching** with Redis
- **Compression** with gzip
- **Rate limiting** for APIs

## 🛠️ **Tools & Extensions**

### **VS Code Extensions**
- **ES7+ React/Redux/React-Native snippets**
- **Prettier - Code formatter**
- **ESLint**
- **Auto Rename Tag**
- **Bracket Pair Colorizer**
- **GitLens**

### **Browser Extensions**
- **React Developer Tools**
- **Redux DevTools**
- **Postman** (for API testing)

## 📚 **Resources**

- **React Documentation**: https://reactjs.org/docs
- **Node.js Documentation**: https://nodejs.org/docs
- **Express Documentation**: https://expressjs.com
- **PostgreSQL Documentation**: https://www.postgresql.org/docs
- **Docker Documentation**: https://docs.docker.com

## 🆘 **Getting Help**

1. **Check documentation** in `docs/` folder
2. **Search issues** in GitHub repository
3. **Create new issue** with detailed description
4. **Ask questions** in team chat

Happy coding! 🎉

# 🏛️ JanataReport - Civic Issue Reporting Platform

A comprehensive full-stack web application for India where citizens can report civic issues, track their resolution, and view analytics. Built with modern technologies including React, Node.js, Express, and PostgreSQL.

## 📁 Project Structure

```
JantaReport/
├── 📁 client/          # Frontend React Application
├── 📁 server/          # Backend Node.js Application  
├── 📁 config/          # Docker Configuration
├── 📁 scripts/         # Project Scripts
└── 📁 docs/            # Documentation
```

**📖 For detailed project structure, see [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)**

## Features

### Core Functionality
- **User Authentication**: Sign up/login with email or phone number, anonymous reporting option
- **Issue Reporting**: Report civic issues with photos, location, and detailed descriptions
- **Issue Tracking**: Track status from Open → In Progress → Resolved → Verified
- **Location Services**: Google Maps integration for precise location selection
- **File Uploads**: Support for photos and videos
- **Multi-language Support**: English, Hindi, and Telugu

### Categories & Subcategories
- Roads & Transport (Potholes, Streetlights, etc.)
- Traffic & Safety (Traffic signals, Dangerous intersections, etc.)
- Water Supply & Drainage (No water, Leakage, etc.)
- Electricity & Power (Power cuts, Unsafe wires, etc.)
- Sanitation & Waste (Garbage collection, Overflowing bins, etc.)
- Environment (Tree cutting, Pollution, etc.)
- Health & Safety (Dengue spots, Hospital negligence, etc.)
- Law & Order (Eve-teasing hotspots, Illegal outlets, etc.)
- Education (School infrastructure, Teacher shortage, etc.)
- Public Transport (Bus frequency, Metro stations, etc.)
- Welfare & Governance (Pension delays, Corruption, etc.)
- Miscellaneous (Stray animals, Fire hazards, etc.)

### Analytics Dashboard
- Heatmap of issues by location
- Category-wise issue distribution
- Resolution rates and average resolution time
- Most responsive officials
- Trending issues

### Admin Panel
- Manage categories and subcategories
- Manage officials and their jurisdictions
- User management
- Issue moderation

## Technology Stack

### Frontend
- React 18
- React Router DOM
- React Query for data fetching
- React Hook Form for form handling
- Tailwind CSS for styling
- Lucide React for icons
- React Hot Toast for notifications
- Mapbox GL for maps

### Backend
- Node.js
- Express.js
- PostgreSQL with PostGIS extension
- Sequelize ORM
- JWT authentication
- Multer for file uploads
- AWS S3 for file storage
- Nodemailer for email notifications

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher) with PostGIS extension
- npm or yarn
- AWS S3 account (for file uploads)
- Google Maps API key

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd janata-report
```

### 2. Install dependencies
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Database Setup

#### Install PostgreSQL and PostGIS
- **Ubuntu/Debian**:
  ```bash
  sudo apt update
  sudo apt install postgresql postgresql-contrib postgis
  ```

- **macOS** (using Homebrew):
  ```bash
  brew install postgresql postgis
  ```

- **Windows**: Download from [PostgreSQL official website](https://www.postgresql.org/download/windows/)

#### Create Database
```sql
-- Connect to PostgreSQL as superuser
sudo -u postgres psql

-- Create database
CREATE DATABASE janata_report;

-- Create user (optional)
CREATE USER janata_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE janata_report TO janata_user;

-- Connect to the database
\c janata_report

-- Enable PostGIS extension
CREATE EXTENSION postgis;

-- Exit
\q
```

### 4. Environment Configuration

#### Server Environment
Create `server/.env` file:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=janata_report
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# Server Configuration
PORT=5000
NODE_ENV=development

# Client URL (for CORS)
CLIENT_URL=http://localhost:3000

# AWS S3 Configuration (for file uploads)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=janata-report-uploads

# Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Google Maps API Key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Client Environment
Create `client/.env` file:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### 5. Database Migration and Seeding

```bash
# Navigate to server directory
cd server

# Run database migration and seed data
npm run seed
```

This will:
- Create all database tables
- Enable PostGIS extension
- Insert sample categories and subcategories
- Insert sample officials
- Create an admin user (email: admin@janatareport.com, password: admin123)

### 6. Start the Application

#### Development Mode
```bash
# From the root directory
npm run dev
```

This will start both the backend server (port 5000) and frontend development server (port 3000).

#### Production Mode
```bash
# Build the frontend
cd client
npm run build

# Start the backend server
cd ../server
npm start
```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Issues Endpoints
- `GET /api/issues` - Get all issues (with filters)
- `GET /api/issues/:id` - Get single issue
- `POST /api/issues` - Create new issue
- `PATCH /api/issues/:id/status` - Update issue status
- `POST /api/issues/:id/comments` - Add comment
- `POST /api/issues/:id/upvote` - Upvote issue
- `GET /api/issues/user/my-issues` - Get user's issues

### Categories Endpoints
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get single category
- `POST /api/categories` - Create category (admin)
- `PUT /api/categories/:id` - Update category (admin)
- `DELETE /api/categories/:id` - Delete category (admin)

### Officials Endpoints
- `GET /api/officials` - Get all officials
- `GET /api/officials/:id` - Get single official
- `POST /api/officials` - Create official (admin)
- `PUT /api/officials/:id` - Update official (admin)
- `DELETE /api/officials/:id` - Delete official (admin)

### Analytics Endpoints
- `GET /api/analytics/dashboard` - Get dashboard analytics
- `GET /api/analytics/heatmap` - Get heatmap data
- `GET /api/analytics/categories` - Get category analytics
- `GET /api/analytics/officials` - Get official analytics

## Usage

### For Citizens
1. **Register/Login**: Create an account or login to start reporting issues
2. **Report Issues**: Click "Report Issue" to submit a new civic issue
3. **Track Issues**: View your reported issues in the dashboard
4. **Browse Issues**: Explore issues reported by other citizens
5. **Support Issues**: Upvote issues you care about

### For Officials
1. **Login**: Use your official credentials to access the platform
2. **View Assigned Issues**: See issues assigned to you
3. **Update Status**: Mark issues as in progress or resolved
4. **Add Comments**: Provide updates and resolution notes
5. **Upload Resolution Media**: Add photos of completed work

### For Administrators
1. **Admin Panel**: Access the admin panel to manage the platform
2. **Manage Categories**: Add, edit, or remove issue categories
3. **Manage Officials**: Add or update official information
4. **User Management**: Moderate users and content

## Deployment

### Using Docker (Recommended)

1. **Create Dockerfile**:
```dockerfile
# Dockerfile
FROM node:16-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install dependencies
RUN npm install
RUN cd server && npm install
RUN cd client && npm install

# Copy source code
COPY . .

# Build client
RUN cd client && npm run build

# Expose port
EXPOSE 5000

# Start server
CMD ["npm", "run", "server"]
```

2. **Create docker-compose.yml**:
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - DB_NAME=janata_report
      - DB_USER=postgres
      - DB_PASSWORD=your_password
    depends_on:
      - postgres
    volumes:
      - ./uploads:/app/uploads

  postgres:
    image: postgis/postgis:13-3.1
    environment:
      - POSTGRES_DB=janata_report
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=your_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

3. **Deploy**:
```bash
docker-compose up -d
```

### Manual Deployment

1. **Backend Deployment**:
   - Deploy to Heroku, AWS, or any Node.js hosting service
   - Set up PostgreSQL database with PostGIS
   - Configure environment variables
   - Set up file storage (AWS S3 recommended)

2. **Frontend Deployment**:
   - Build the React app: `npm run build`
   - Deploy to Vercel, Netlify, or any static hosting service
   - Configure environment variables

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Commit your changes: `git commit -m 'Add feature'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@janatareport.com or create an issue in the repository.

## Roadmap

- [ ] Mobile app (React Native)
- [ ] Push notifications
- [ ] WhatsApp integration
- [ ] SMS notifications
- [ ] Advanced analytics
- [ ] Machine learning for issue categorization
- [ ] Integration with government systems
- [ ] Multi-tenant support for different cities

## Acknowledgments

- Built for the citizens of India
- Inspired by civic engagement platforms worldwide
- Special thanks to the open-source community

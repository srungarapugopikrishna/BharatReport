# 🔌 API Documentation

## 📋 **Base URL**
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

## 🔐 **Authentication**

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 📊 **Response Format**

### **Success Response**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### **Error Response**
```json
{
  "success": false,
  "error": "Error message",
  "details": { ... }
}
```

## 👤 **Authentication Endpoints**

### **POST /auth/register**
Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+919876543210",
  "password": "securepassword",
  "isAnonymous": false
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt-token",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "citizen",
    "isAnonymous": false
  }
}
```

### **POST /auth/login**
Login with email/phone and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt-token",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "citizen"
  }
}
```

### **POST /auth/google**
Login with Google OAuth.

**Request Body:**
```json
{
  "token": "google-id-token"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt-token",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "citizen"
  }
}
```

### **GET /auth/me**
Get current user information.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "citizen",
    "isAnonymous": false
  }
}
```

## 📝 **Issues Endpoints**

### **GET /issues**
Get list of issues with pagination and filters.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `status` (string): Filter by status
- `category` (string): Filter by category
- `location` (string): Filter by location

**Response:**
```json
{
  "success": true,
  "data": {
    "issues": [
      {
        "id": "uuid",
        "title": "Pothole on Main Road",
        "description": "Large pothole causing traffic issues",
        "status": "open",
        "priority": "high",
        "location": {
          "type": "Point",
          "coordinates": [77.2090, 28.6139]
        },
        "address": "Main Road, New Delhi",
        "media": ["image1.jpg", "image2.jpg"],
        "authorityInfo": {
          "Corporator": "John Smith",
          "Engineer": "Jane Doe"
        },
        "createdAt": "2023-01-01T00:00:00.000Z",
        "updatedAt": "2023-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalItems": 100,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### **GET /issues/:id**
Get specific issue by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Pothole on Main Road",
    "description": "Large pothole causing traffic issues",
    "status": "open",
    "priority": "high",
    "location": {
      "type": "Point",
      "coordinates": [77.2090, 28.6139]
    },
    "address": "Main Road, New Delhi",
    "media": ["image1.jpg", "image2.jpg"],
    "authorityInfo": {
      "Corporator": "John Smith",
      "Engineer": "Jane Doe"
    },
    "comments": [
      {
        "id": "uuid",
        "text": "Issue has been reported to authorities",
        "author": "John Doe",
        "createdAt": "2023-01-01T00:00:00.000Z"
      }
    ],
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### **POST /issues**
Create a new issue.

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data
```

**Request Body:**
```json
{
  "title": "Pothole on Main Road",
  "description": "Large pothole causing traffic issues",
  "categoryId": "uuid",
  "subcategoryId": "uuid",
  "priority": "high",
  "location": {
    "type": "Point",
    "coordinates": [77.2090, 28.6139]
  },
  "address": "Main Road, New Delhi",
  "media": ["image1.jpg", "image2.jpg"],
  "authorityInfo": {
    "Corporator": "John Smith",
    "Engineer": "Jane Doe"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Pothole on Main Road",
    "status": "open",
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### **PUT /issues/:id**
Update an issue.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "status": "in_progress"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Updated Title",
    "status": "in_progress",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### **DELETE /issues/:id**
Delete an issue.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Issue deleted successfully"
}
```

## 📂 **Categories Endpoints**

### **GET /categories**
Get all categories and subcategories.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Roads & Transport",
      "subcategories": [
        {
          "id": "uuid",
          "name": "Potholes"
        },
        {
          "id": "uuid",
          "name": "Streetlights not working"
        }
      ]
    }
  ]
}
```

## 👥 **Authorities Endpoints**

### **GET /authorities**
Get all authorities.

**Query Parameters:**
- `isActive` (boolean): Filter by active status
- `category` (string): Filter by category

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "John Smith",
      "level": "Corporator",
      "designation": "Ward Corporator",
      "department": "Municipal Corporation",
      "email": "john@municipal.com",
      "phone": "+919876543210",
      "jurisdiction": "Ward 1",
      "isActive": true
    }
  ]
}
```

### **POST /authorities**
Create a new authority.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "name": "John Smith",
  "level": "Corporator",
  "designation": "Ward Corporator",
  "department": "Municipal Corporation",
  "email": "john@municipal.com",
  "phone": "+919876543210",
  "jurisdiction": "Ward 1"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Smith",
    "level": "Corporator",
    "isActive": true,
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

## 📊 **Analytics Endpoints**

### **GET /analytics/overview**
Get overview analytics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalIssues": 1000,
    "openIssues": 200,
    "inProgressIssues": 300,
    "resolvedIssues": 500,
    "recentIssues": 50,
    "topCategories": [
      {
        "name": "Roads & Transport",
        "count": 400
      }
    ]
  }
}
```

### **GET /analytics/most-responsive-officials**
Get most responsive officials.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "John Smith",
      "designation": "Ward Corporator",
      "responseTime": 2.5,
      "resolutionRate": 85.5,
      "totalIssues": 100
    }
  ]
}
```

## 🔍 **Search Endpoints**

### **GET /search/issues**
Search issues by query.

**Query Parameters:**
- `q` (string): Search query
- `page` (number): Page number
- `limit` (number): Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "issues": [...],
    "pagination": {...}
  }
}
```

## 📱 **File Upload Endpoints**

### **POST /upload/image**
Upload an image.

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data
```

**Request Body:**
```
file: <image-file>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://example.com/uploads/image.jpg",
    "filename": "image.jpg",
    "size": 1024000
  }
}
```

## 🚨 **Error Codes**

| Code | Description |
|------|-------------|
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Validation Error |
| 500 | Internal Server Error |

## 📝 **Rate Limiting**

- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 requests per minute
- **File Upload**: 10 requests per minute

## 🔒 **Security**

- **JWT Tokens**: 7-day expiration
- **Password Hashing**: bcrypt with salt rounds
- **CORS**: Configured for specific origins
- **Rate Limiting**: Prevents abuse
- **Input Validation**: All inputs validated

## 📚 **SDK Examples**

### **JavaScript/React**
```javascript
// API client
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Get issues
const issues = await api.get('/issues');

// Create issue
const newIssue = await api.post('/issues', issueData);
```

### **Python**
```python
import requests

# API client
headers = {'Authorization': f'Bearer {token}'}
base_url = 'http://localhost:5000/api'

# Get issues
response = requests.get(f'{base_url}/issues', headers=headers)
issues = response.json()
```

### **cURL**
```bash
# Get issues
curl -H "Authorization: Bearer <token>" \
     http://localhost:5000/api/issues

# Create issue
curl -X POST \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"title":"Test Issue"}' \
     http://localhost:5000/api/issues
```

## 📞 **Support**

For API support and questions:
- **GitHub Issues**: https://github.com/your-username/janata-report/issues
- **Email**: support@janatareport.com
- **Documentation**: https://docs.janatareport.com

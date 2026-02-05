# Job Listing Portal - Full Stack MERN Application

A production-ready Job Listing Portal built with the MERN stack (MongoDB, Express, React, Node.js).

## Overview

Complete job listing platform with:
- Job seeker profiles and applications
- Employer job posting and management
- Admin dashboard with analytics
- Real-time notifications with Socket.IO
- JWT authentication
- Responsive design with Tailwind CSS
- E2E tests with Playwright

## Technology Stack

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Socket.IO** - Real-time notifications
- **Multer** - File uploads

### Frontend
- **React 19** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **Axios** - HTTP client
- **Framer Motion** - Animations
- **React Hook Form** - Form handling
- **Recharts** - Analytics charts

### Testing
- **Playwright** - E2E testing
- **Jest** - Unit testing (backend)
- **Vitest** - Unit testing (frontend)

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account or local MongoDB
- Git

### Setup

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd Job_Listing_Portal
   ```

2. **Setup Backend**
   ```bash
   cd server
   npm install
   cp .env.example .env
   ```

   Update `.env` with:
   - MongoDB URI from MongoDB Atlas
   - JWT secrets
   - Email configuration (optional)

3. **Setup Frontend**
   ```bash
   cd ../client
   npm install
   cp .env.example .env
   ```

   Update `.env` with:
   - `VITE_API_URL=http://localhost:5000/api`
   - `VITE_SOCKET_URL=http://localhost:5000`

4. **Seed Database** (optional)
   ```bash
   cd server
   npm run seed
   ```

   Sample users:
   - Admin: `admin@jobportal.com` / `Admin@123`
   - Employer: `employer@techcompany.com` / `Employer@123`
   - Job Seeker: `john@example.com` / `JobSeeker@123`

### Development

**Terminal 1 - Backend**
```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 - Frontend**
```bash
cd client
npm run dev
# App runs on http://localhost:5173
```

## Project Structure

```
Job_Listing_Portal/
├── server/
│   ├── models/              # MongoDB schemas
│   ├── controllers/         # Route handlers
│   ├── routes/             # API routes
│   ├── middlewares/        # Auth, error handling, uploads
│   ├── services/           # Socket.IO notification service
│   ├── utils/              # Helpers, email, tokens
│   ├── config.js           # Database config
│   ├── index.js            # Express app setup
│   ├── package.json
│   └── .env.example
├── client/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── context/       # Auth & Toast contexts
│   │   ├── api/           # API utilities
│   │   ├── utils/         # Helpers
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── tests/e2e/         # Playwright tests
│   ├── tailwind.config.js
│   ├── vite.config.js
│   ├── package.json
│   └── .env.example
└── README.md
```

## Features

### Authentication
- Register (job seeker/employer)
- Login/Logout
- JWT with access + refresh tokens
- Password reset via email
- Protected routes

### Job Seeker
- Browse all jobs
- Advanced search and filters
- View job details
- Apply for jobs
- Track applications
- Save favorite jobs
- Profile management
- View application status

### Employer
- Post new jobs
- Edit/delete jobs
- View applicants for each job
- Update application status
- Analytics dashboard
- Manage company profile

### Admin
- View all users (seekers/employers)
- Platform analytics
- Job statistics
- Application trends
- User management

### Real-time Features
- Socket.IO notifications
- New application alerts
- Application status updates
- Real-time chat (stub for extension)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout

### Users
- `GET /api/users/me` - Get profile
- `PUT /api/users/me` - Update profile
- `POST /api/users/save-job` - Save job
- `GET /api/users/saved-jobs` - Get saved jobs

### Jobs
- `POST /api/jobs` - Create job (employer)
- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/:id` - Get job details
- `PUT /api/jobs/:id` - Update job (employer)
- `DELETE /api/jobs/:id` - Delete job (employer)
- `GET /api/jobs/employer/my-jobs` - Get employer's jobs

### Applications
- `POST /api/applications/:jobId/apply` - Apply for job
- `GET /api/applications` - Get user applications
- `GET /api/applications/:jobId/applicants` - Get applicants (employer)
- `PUT /api/applications/:appId/status` - Update status
- `GET /api/applications/stats` - Get statistics

## Testing

### Run E2E Tests
```bash
cd client
npm run e2e
```

Tests cover:
- Authentication flows (register, login, logout)
- Job browsing and search
- Job filtering and pagination
- Job applications
- Dashboard features

### View Test Report
```bash
npx playwright show-report
```

### Run Backend Tests
```bash
cd server
npm test
```

## Environment Variables

### Server (.env)
```
PORT=5000
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/job_listing_db
JWT_ACCESS_SECRET=your_secret_key
JWT_REFRESH_SECRET=your_refresh_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
CLIENT_URL=http://localhost:5173
STORAGE_PROVIDER=gridfs
```

### Client (.env)
```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## Deployment

### Backend - Railway
1. Connect GitHub repo
2. Set environment variables
3. Deploy

### Backend - Heroku
```bash
heroku create job-listing-portal-server
heroku addons:create mongolab:sandbox
git push heroku main
```

### Frontend - Vercel
```bash
npm run build
vercel deploy
```

Or connect GitHub and deploy automatically.

## Database Schema

### User
- name, email, password, phone
- role (jobSeeker/employer/admin)
- profile fields (skills, experience, company info)
- resume, savedJobs, socialLinks
- tokens for authentication

### Job
- title, description, company (reference to employer)
- jobType, location, salary range
- responsibilities, qualifications
- tags, remote flag
- applicants, views, applicantCount
- timestamps

### Application
- job (reference), applicant (reference)
- status (Applied/Reviewed/Interview/Offer/Rejected)
- coverLetter, resume reference
- rating, notes, interviews
- applicant info and timestamps

## Key Features Explained

### JWT Authentication
- Access tokens stored in memory
- Refresh tokens in httpOnly cookies
- Automatic token refresh on 401
- Logout clears cookies and memory

### File Uploads
- Resume uploads via Multer
- GridFS storage (configurable to S3)
- Secure file access with authentication

### Real-time Notifications
- Socket.IO server on Express
- User connection management
- Notification on new applications
- Status change notifications

### Search & Filters
- Full-text search on jobs
- Filter by job type, location, salary, tags
- Pagination support
- Sorting options

### Email Notifications
- Welcome emails on registration
- New application alerts
- Application status updates
- Password reset links

## Security

- Helmet for security headers
- Rate limiting on endpoints
- JWT verification on protected routes
- Password hashing with bcryptjs
- Input validation and sanitization
- CORS properly configured
- Secure cookie settings (httpOnly, sameSite)

## Performance

- Mongoose indexing on frequently searched fields
- Pagination to limit data transfer
- Caching with React Query
- Debounced search input
- Optimized images and assets

## Future Enhancements

- Resume parser with NLP
- Job recommendation engine
- Video interview support
- Advanced analytics
- Email templates system
- Payment integration for premium features
- Mobile app with React Native

## Troubleshooting

### MongoDB Connection Error
- Verify MongoDB URI in .env
- Check IP whitelist in MongoDB Atlas
- Ensure credentials are correct

### CORS Error
- Verify CLIENT_URL in server .env
- Ensure frontend URL matches CORS config

### Token Not Persisting
- Check if cookies are enabled
- Verify secure cookie settings in production

### Email Not Sending
- Verify email credentials
- Use app-specific passwords for Gmail
- Check spam folder

## Contributing

1. Fork the repo
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request
6. Wait for review and merge


## Support

For issues and questions:
- GitHub Issues
- Email: ragipalyamjaganmohanreddy@gmail.com

## Authors

Built as a full-stack MERN application

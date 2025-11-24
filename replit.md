# Invoice Management Application (Billio)

## Overview
A full-stack invoice management application built with Vue.js frontend and Node.js backend. The application features invoice processing, email integration, project management, and user authentication.

## Project Architecture
- **Frontend**: Vue.js 3 with Vuetify 3, Vite build system
- **Backend**: Node.js with Express, Socket.IO for real-time updates
- **Database**: Originally MySQL (currently needs setup for full functionality)
- **Email Service**: IMAP integration for email processing
- **Authentication**: JWT-based user authentication

## Current Setup Status
✅ **Working Components:**
- Frontend application running on port 5000
- Backend API server running on port 3000
- All routes and middleware loaded successfully
- Real-time Socket.IO connections established
- Static file serving for downloads

⚠️ **Needs Database Setup:**
- Database connection currently fails (no MySQL server)
- Email listeners depend on database connection
- User authentication requires database

## Project Structure
```
/
├── front/                    # Vue.js frontend
│   ├── src/
│   │   ├── components/       # Vue components
│   │   ├── pages/            # Application pages
│   │   ├── router/           # Vue Router setup
│   │   └── stores/           # State management
│   └── package.json
├── Server/                   # Node.js backend
│   ├── Controllers/          # API controllers
│   ├── Database/             # Database configuration
│   ├── email-service/        # Email processing
│   ├── Login_system/         # Authentication
│   └── Services/             # Business logic
└── README.md
```

## Key Features
- **Invoice Management**: Upload, process, and manage invoices
- **Email Integration**: Automatic invoice processing from emails
- **Project Management**: Organize invoices by projects
- **Financial Dashboard**: Overview of financial data
- **User Authentication**: Secure login system
- **Real-time Updates**: Socket.IO for live updates

## Environment Setup
- Node.js 20 installed
- All dependencies installed
- Vite configured for Replit proxy support
- Environment variables configured in Server/.env

## Recent Changes (2025-09-29)
- ✅ Configured Vite for host 0.0.0.0:5000 (Replit compatibility)
- ✅ Set up environment variables for database connection
- ✅ Updated backend port configuration (3000)
- ✅ Installed all frontend and backend dependencies
- ✅ Set up workflows for both frontend and backend
- ✅ Verified application is running and accessible
- ✅ Built comprehensive real-time synchronization system with Socket.IO
- ✅ Fixed download-file issue from MainDisplay (null margin error)
- ✅ Resolved realtime store reactivity issues with Vue Map handling

## Next Steps for Full Functionality
1. Set up MySQL database or migrate to PostgreSQL
2. Configure email service credentials
3. Set up OpenAI API key for invoice processing
4. Test authentication flow with database

## User Preferences
- Follow existing project structure and conventions
- Maintain Vue.js + Vuetify frontend design
- Keep Node.js + Express backend architecture
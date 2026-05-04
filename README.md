# IT Asset Tracking Tool

A modern, secure IT asset and ticket management system built for schools. Features comprehensive asset tracking, barcode scanning, loaner device management, and integrated ticket tracking with a beautiful dark glassmorphic UI.

## 🎯 Quick Start

### Using Docker (Recommended)

```bash
# Navigate to project directory
cd "IT Asset Tracking Tool"

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost
# API: http://localhost/api
# Default login: admin / admin123
```

### Without Docker

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python app.py
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

## ✨ Features

### Asset Management
- 📦 Complete inventory tracking
- 🏷️ Barcode scanning for quick lookup
- 👥 Asset assignment to users/departments
- 📊 Asset status tracking (Available, In Use, Repair, Retired)
- 🔧 Maintenance history and repair documentation

### Loaner Device Management
- 🎁 Assign temporary devices during repairs
- ⏰ Automatic overdue tracking
- 📧 Email reminders for return dates
- 📍 Track device location and user

### IT Ticket System
- 🎫 Create and track support tickets
- 📎 Attach images and documents
- 💬 Internal comments and updates
- 👤 Assign to technicians
- 🔗 Link devices to tickets

### Additional Features
- 🔐 Role-based access control (Admin, Technician, Viewer)
- 🌙 Modern dark glassy UI with glassmorphism effects
- 📱 Responsive design
- 🔌 Google Admin API integration (devices & OUs)
- 📧 Email notifications and reminders
- 🗄️ PostgreSQL database with full audit trail

## 🛠️ Technology Stack

- **Backend**: Python Flask, PostgreSQL
- **Frontend**: React 18, Tailwind CSS
- **Authentication**: JWT
- **Containerization**: Docker & Docker Compose
- **Reverse Proxy**: Nginx

## 📁 Project Structure

```
IT Asset Tracking Tool/
├── backend/              # Flask API
├── frontend/             # React application
├── database/             # Database scripts
├── docs/                 # Documentation
├── docker-compose.yml    # Docker configuration
├── nginx.conf           # Nginx configuration
└── SETUP_AND_USER_GUIDE.md  # Complete documentation
```

## 🚀 Deployment

### Development
```bash
# Backend runs on localhost:5000
# Frontend runs on localhost:3000
```

### Production
```bash
# All services run behind Nginx on localhost:80
# Docker Compose handles orchestration
# Database is isolated in container
```

## 📖 Documentation

See [SETUP_AND_USER_GUIDE.md](./SETUP_AND_USER_GUIDE.md) for:
- Detailed installation instructions
- Configuration guide
- User manual
- Administrator guide
- API documentation
- Troubleshooting

## 🔐 Security

- JWT token-based authentication
- Role-based access control
- Password hashing (Werkzeug)
- Input validation and sanitization
- CORS protection
- File upload restrictions (50MB limit)
- SQL injection protection via SQLAlchemy ORM

## 🔧 Configuration

Copy and edit `.env` file:
```bash
cp backend/.env.example backend/.env
```

Key variables:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET_KEY`: Secret key for JWT tokens
- `GOOGLE_CLIENT_ID/SECRET`: For Google Admin API
- `SMTP_*`: Email configuration for reminders

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Current user info

### Assets
- `GET /api/assets` - List assets
- `GET /api/assets/{id}` - Asset details
- `POST /api/assets` - Create asset
- `PUT /api/assets/{id}` - Update asset
- `GET /api/assets/scan/{barcode}` - Scan barcode

### Tickets
- `GET /api/tickets` - List tickets
- `GET /api/tickets/{id}` - Ticket details
- `POST /api/tickets` - Create ticket
- `PUT /api/tickets/{id}` - Update ticket
- `POST /api/tickets/{id}/comments` - Add comment

### Loaners
- `POST /api/assets/loaner/assign` - Assign loaner
- `POST /api/assets/loaner/{id}/return` - Return loaner
- `GET /api/assets/loaner/active` - Active loaners

Full API documentation in setup guide.

## 🎨 UI Themes

The application features a modern dark theme with glassmorphism effects:
- Dark gradient backgrounds
- Translucent glass panels
- Smooth transitions and animations
- Color-coded status badges
- Responsive grid layouts

Customize in `frontend/src/index.css` and `frontend/tailwind.config.js`.

## 📝 Default Credentials

⚠️ **CHANGE IMMEDIATELY AFTER FIRST LOGIN**

```
Username: admin
Password: admin123
```

## 🐳 Docker Commands

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild images
docker-compose build

# Execute command
docker-compose exec backend flask db upgrade

# Database backup
docker-compose exec postgres pg_dump -U admin asset_tracker > backup.sql
```

## 📦 System Requirements

### Docker Method (Recommended)
- Docker & Docker Compose
- 4GB RAM
- 2GB disk space

### Local Development
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- 2GB RAM
- 2GB disk space

## 🐛 Troubleshooting

### Cannot connect to database
1. Verify PostgreSQL is running
2. Check DATABASE_URL in .env
3. Verify credentials

### Frontend not loading
1. Verify backend is running
2. Check API URL configuration
3. Clear browser cache

### Loaner emails not sending
1. Verify SMTP configuration
2. For Gmail, use app-specific password
3. Check SENDER_EMAIL is valid

See full troubleshooting guide in [SETUP_AND_USER_GUIDE.md](./SETUP_AND_USER_GUIDE.md).

## 📧 Support

For issues or questions:
1. Check the troubleshooting guide
2. Review system logs
3. Contact your administrator

## 📄 License

School Use License - For educational institutions only

## 🤝 Contributing

Internal school IT team development

---

**Version**: 1.0.0  
**Last Updated**: 2026-05-03  
**Status**: Production Ready

**Quick Links**:
- [Setup & User Guide](./SETUP_AND_USER_GUIDE.md)
- [API Reference](./SETUP_AND_USER_GUIDE.md#api-documentation)
- [Troubleshooting](./SETUP_AND_USER_GUIDE.md#support--troubleshooting)

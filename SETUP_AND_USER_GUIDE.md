# IT Asset Tracking Tool - Complete Setup & User Guide

## Overview

The IT Asset Tracking Tool is a comprehensive, modern web-based system designed for schools to manage IT assets, track repairs, handle loaner devices, and manage IT support tickets. Built with a sleek dark glassy UI, it provides intuitive interfaces for asset inventory management, barcode scanning, ticket tracking, and administrative functions.

### Key Features

- **Asset Inventory Management**: Track all IT assets with detailed specifications
- **Barcode Scanning**: Quick asset lookup using barcode scanners or manual entry
- **Loaner Device Management**: Assign temporary devices during repairs with automatic overdue tracking
- **Maintenance Tracking**: Document all repairs and maintenance activities
- **IT Ticket System**: Create, assign, and track support tickets
- **Email Integration**: Automated reminders for loaner returns
- **Google Admin Sync**: Integration with Google Workspace for device and OU management
- **Multi-User Support**: Role-based access control (Admin, Technician, Viewer)
- **File Attachments**: Add images and documents to tickets
- **Dark Glassy UI**: Modern, accessible interface with real-time updates

---

## System Architecture

### Technology Stack

**Backend:**
- Python 3.11 with Flask
- PostgreSQL 15 database
- JWT authentication
- RESTful API

**Frontend:**
- React 18 with React Router
- Tailwind CSS with custom glassmorphism theme
- Axios for API communication

**Infrastructure:**
- Docker & Docker Compose for containerization
- Nginx as reverse proxy
- PostgreSQL database container

### Project Structure

```
IT Asset Tracking Tool/
├── backend/                 # Flask API
│   ├── app.py              # Main Flask application
│   ├── models.py           # SQLAlchemy models
│   ├── routes.py           # API endpoints
│   ├── requirements.txt     # Python dependencies
│   ├── Dockerfile          # Backend container
│   └── .env.example        # Environment variables template
├── frontend/               # React application
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── services/      # API service layer
│   │   ├── styles/        # CSS styles
│   │   ├── App.js         # Main app with routing
│   │   └── index.js       # React entry point
│   ├── public/            # Static files
│   ├── package.json       # Node dependencies
│   ├── Dockerfile         # Frontend container
│   └── tailwind.config.js # Tailwind configuration
├── database/              # Database schemas
├── docs/                  # Documentation
├── docker-compose.yml     # Docker composition file
├── nginx.conf            # Nginx configuration
└── README.md             # This file
```

---

## Installation & Deployment

### Prerequisites

- Docker & Docker Compose (recommended for production)
- OR Python 3.11+ and Node.js 18+ (for development)
- PostgreSQL 15 (if not using Docker)

### Option 1: Docker Deployment (Recommended)

This is the easiest way to deploy the application.

#### Step 1: Clone and Navigate

```bash
cd "C:\Users\Harma\source\repos\IT Asset Tracking Tool"
```

#### Step 2: Configure Environment Variables

Create `.env` file in the backend folder:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your settings:

```
DATABASE_URL=postgresql://admin:password@postgres:5432/asset_tracker
JWT_SECRET_KEY=your-super-secret-key-change-in-production
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_ADMIN_EMAIL=admin@school.com
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SENDER_EMAIL=noreply@school.com
```

#### Step 3: Build and Start Services

```bash
docker-compose up -d
```

This will:
- Start PostgreSQL database on port 5432
- Start Flask API on port 5000
- Start React frontend on port 3000
- Start Nginx reverse proxy on port 80

#### Step 4: Verify Installation

```bash
# Check containers are running
docker-compose ps

# Check API health
curl http://localhost:5000/api/health

# Access frontend
Open http://localhost in your browser
```

#### Step 5: Initialize Database

The database will initialize automatically on first run. Default admin account:
- **Username:** admin
- **Password:** admin123

#### Managing Docker Services

```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop services
docker-compose down

# Restart services
docker-compose restart

# Remove all data (WARNING: destructive)
docker-compose down -v
```

### Option 2: Local Development Setup

If you prefer to run without Docker:

#### Backend Setup

```bash
cd backend

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables (create .env file)
# Copy from .env.example and edit values

# Initialize database (assuming PostgreSQL is running locally)
flask db upgrade

# Run the application
python app.py
```

The API will be available at `http://localhost:5000`

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
# REACT_APP_API_URL=http://localhost:5000/api

# Start development server
npm start
```

The frontend will open at `http://localhost:3000`

---

## Configuration

### Database Configuration

Edit `backend/.env`:

```
DATABASE_URL=postgresql://user:password@host:port/database_name
```

### JWT Configuration

For production, change the JWT secret:

```
JWT_SECRET_KEY=your-very-secure-random-key-here
```

Generate a secure key:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Email Configuration (For Loaner Reminders)

Configure SMTP settings for automated email reminders:

```
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-specific-password
SENDER_EMAIL=noreply@school.com
```

**For Gmail:**
1. Enable 2-factor authentication
2. Generate app-specific password at: https://myaccount.google.com/apppasswords
3. Use that password in SMTP_PASSWORD

### Google Admin Integration

To sync devices and OUs from Google Workspace:

1. Create a Google Cloud Project
2. Enable Admin SDK API
3. Create a service account and download JSON key
4. Configure in `.env`:
   ```
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   GOOGLE_ADMIN_EMAIL=admin@school.com
   ```

---

## User Guide

### Dashboard

The Dashboard provides an overview of your IT infrastructure:
- Total assets count
- Assets in repair
- Active loaner assignments
- Open support tickets
- System alerts (overdue loaners, warranty expiry)
- Quick action buttons for common tasks

### Asset Management

#### Viewing Assets

1. Navigate to **Assets** from the sidebar
2. View all assets in a table format
3. Filter by status (Available, In Use, Repair, Retired) or type
4. Click the edit icon to view asset details

#### Creating Assets

1. Click **Add Asset** button
2. Fill in required fields:
   - Asset Tag (barcode)
   - Asset Name
   - Type (Laptop, Desktop, Phone, etc.)
   - Manufacturer, Model
3. Click **Create Asset**

#### Updating Assets

1. Open asset details
2. Click **Edit**
3. Modify fields as needed
4. Click **Save Changes**

#### Asset Details Page

Shows comprehensive information:
- Status and assignment details
- Maintenance history
- Serial number (copyable)
- Generated QR code
- Maintenance and loaner assignment options

### Barcode Scanning

#### Using the Scanner

1. Navigate to **Scan** from the sidebar
2. Position barcode in front of scanner or manually type the barcode
3. Asset details appear on the right panel
4. Click **View Details** to see full information

#### Manual Entry

1. Type the asset tag/barcode manually
2. Click **Manual Lookup**
3. Asset information will display

### Loaner Device Management

#### Assigning a Loaner

1. Navigate to **Loaners**
2. Click **Assign Loaner**
3. Select:
   - Device needing repair
   - Available loaner device
   - User receiving the loaner
   - Loan duration (days)
4. Click **Assign Loaner**

#### Tracking Loaners

The Loaners page shows:
- All active loaner assignments
- Days remaining until due date
- Overdue status (if past due date)
- Original device names
- Assigned user

#### Returning Loaners

1. Click **Mark as Returned** on an active loaner
2. Loaner device status changes to "Available"
3. System automatically checks if loaner was overdue

#### Loaner Reminders

Automatic email reminders are sent:
- 3 days before due date
- On due date
- Daily after overdue (up to 7 days)

### Maintenance Tracking

#### Recording Maintenance

1. Open asset details
2. Click **Record Maintenance**
3. Select maintenance type:
   - Repair
   - Maintenance
   - Upgrade
   - Inspection
4. Enter description, cost, and notes
5. Submit

#### Viewing Maintenance History

1. Open asset details
2. Scroll to "Maintenance History" section
3. View all past maintenance records
4. Click to see full details

### Ticket Management

#### Creating Tickets

**Method 1: Manual Creation**
1. Navigate to **Tickets**
2. Click **New Ticket**
3. Fill in:
   - Title
   - Description
   - Issue Type (Hardware, Software, Network, Other)
   - Priority (Low, Medium, High, Critical)
4. Click **Create Ticket**

**Method 2: Email Integration**
(Administrator setup required)
- Send email to system address with issue details
- System automatically creates ticket
- Ticket tracks original email sender

#### Managing Tickets

1. View ticket list with status and priority indicators
2. Filter by status or priority
3. Click on ticket to open details

#### Ticket Details Page

- **Description**: Full issue description
- **Comments**: Add comments and updates
- **Status**: Open, In Progress, Resolved, Closed
- **Priority**: Critical, High, Medium, Low
- **Assignment**: Assign to technician
- **Related Assets**: Link devices to the ticket
- **Attachments**: Add images and documents

#### Ticket Workflow

1. **Create**: Submit issue
2. **Assign**: Assign to available technician
3. **In Progress**: Technician updates status
4. **Add Comments**: Track progress
5. **Attach Files**: Upload images/documents as needed
6. **Resolve**: Mark as resolved with notes
7. **Close**: Archive the ticket

#### Adding Comments

1. Open ticket
2. Scroll to "Comments & Updates"
3. Type comment in text area
4. Click **+** to submit

#### Attaching Files

1. Open ticket
2. Look for attachment upload area
3. Select image, PDF, or document
4. File is added to ticket history

---

## Administrator Guide

### User Management

#### Viewing Users

1. Navigate to **Admin** from sidebar
2. View all users in the table
3. See name, email, role, and status

#### Modifying User Roles

1. Click edit icon on user row
2. Change role:
   - **Admin**: Full system access
   - **Technician**: Can manage assets and tickets
   - **Viewer**: Read-only access
3. Click **Save**

#### Enabling/Disabling Users

1. Click edit icon on user row
2. Toggle **Active** status
3. Click **Save**
4. Disabled users cannot log in

### System Status

Monitor:
- Database connection status
- API health
- Email service availability
- Google Admin API integration status

### Database Backups

#### With Docker

```bash
# Backup database
docker-compose exec postgres pg_dump -U admin asset_tracker > backup.sql

# Restore database
cat backup.sql | docker-compose exec -T postgres psql -U admin asset_tracker
```

#### Without Docker

```bash
# Backup
pg_dump -U admin -d asset_tracker > backup.sql

# Restore
psql -U admin -d asset_tracker < backup.sql
```

### Logs and Troubleshooting

#### View Logs

With Docker:
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

Without Docker:
Check console output or logs in Flask/React directories.

#### Common Issues

**Issue: Cannot connect to database**
- Verify DATABASE_URL in .env
- Ensure PostgreSQL is running
- Check credentials

**Issue: 401 Unauthorized errors**
- Verify JWT_SECRET_KEY is correct
- Token may be expired (clear browser cache)
- Re-login to get new token

**Issue: File upload not working**
- Check UPLOAD_FOLDER exists
- Verify permissions on uploads directory
- Check MAX_FILE_SIZE setting

**Issue: Email reminders not sending**
- Verify SMTP settings in .env
- For Gmail, use app-specific password
- Check SENDER_EMAIL is valid

---

## Security Considerations

### Authentication

- Passwords should be at least 12 characters
- Use strong JWT secret in production
- Change default admin password immediately

### Database

- Run on secure network (not exposed to internet)
- Use strong database password
- Regular backups recommended
- Enable PostgreSQL SSL for remote connections

### API

- All endpoints require JWT authentication
- CORS is configured for specified origins
- File uploads limited to 50MB
- Input validation on all endpoints

### Frontend

- No sensitive data stored in localStorage (only auth token)
- HTTPS recommended for production
- Content Security Policy headers set
- XSS protection enabled

### Production Deployment

1. Change all default passwords
2. Use HTTPS/SSL certificate
3. Configure firewall rules
4. Set up regular backups
5. Monitor logs for suspicious activity
6. Keep dependencies updated

---

## API Documentation

### Authentication

```bash
# Login
POST /api/auth/login
{
  "username": "admin",
  "password": "password"
}

Response:
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": "user-id",
    "username": "admin",
    "email": "admin@school.local",
    "full_name": "System Administrator",
    "role": "admin"
  }
}
```

### Assets

```bash
# Get all assets
GET /api/assets?page=1&per_page=50&status=available

# Get asset details
GET /api/assets/{asset_id}

# Create asset
POST /api/assets
{
  "asset_tag": "LAP-001",
  "asset_name": "Dell Laptop",
  "asset_type": "Laptop",
  "manufacturer": "Dell",
  "model": "XPS 13"
}

# Update asset
PUT /api/assets/{asset_id}
{
  "status": "in_use",
  "assigned_to_user": "john.smith@school.com"
}

# Scan barcode
GET /api/assets/scan/{barcode}
```

### Loaners

```bash
# Assign loaner
POST /api/assets/loaner/assign
{
  "device_id": "device-id",
  "loaner_device_id": "loaner-id",
  "assigned_to_user": "john.smith@school.com",
  "loan_duration_days": 7
}

# Return loaner
POST /api/assets/loaner/{assignment_id}/return

# Get active loaners
GET /api/assets/loaner/active
```

### Tickets

```bash
# Get all tickets
GET /api/tickets?page=1&status=open&priority=high

# Get ticket details
GET /api/tickets/{ticket_id}

# Create ticket
POST /api/tickets
{
  "title": "Laptop not turning on",
  "description": "User's laptop won't boot",
  "issue_type": "hardware",
  "priority": "high"
}

# Update ticket
PUT /api/tickets/{ticket_id}
{
  "status": "in_progress",
  "assigned_to": "technician_id"
}

# Add comment
POST /api/tickets/{ticket_id}/comments
{
  "content": "Checked hardware, found RAM issue"
}
```

---

## Maintenance & Updates

### Regular Tasks

**Daily:**
- Check loaner overdue status
- Review open tickets

**Weekly:**
- Backup database
- Review system logs
- Check for pending updates

**Monthly:**
- Review asset inventory
- Archive old tickets
- Update device warranties
- Verify Google Admin sync

### Updating the Application

```bash
# Pull latest code
git pull origin main

# Update dependencies
pip install -r backend/requirements.txt
npm install

# Rebuild Docker images
docker-compose build

# Restart services
docker-compose down
docker-compose up -d
```

### Database Maintenance

```bash
# Vacuum database (optimize)
docker-compose exec postgres vacuumdb -U admin asset_tracker

# Check database size
docker-compose exec postgres psql -U admin -c "SELECT pg_size_pretty(pg_database_size('asset_tracker'));"
```

---

## Support & Troubleshooting

### Getting Help

1. Check logs first
2. Review error messages
3. Check configuration files
4. Consult this documentation
5. Test with simple scenarios first

### Common Scenarios

**Scenario: System won't start**
1. Check Docker/PostgreSQL is running
2. Verify environment variables
3. Check port conflicts (3000, 5000, 80)
4. Review logs for specific errors

**Scenario: Assets not showing**
1. Verify database connection
2. Check assets were created
3. Ensure logged-in user has permissions
4. Check filters aren't hiding assets

**Scenario: Loaner reminders not working**
1. Verify SMTP configuration
2. Check email address is valid
3. Review logs for email errors
4. Test with manual email settings

**Scenario: Performance issues**
1. Check database size
2. Archive old tickets
3. Increase Docker resources
4. Check for slow queries in logs

---

## Advanced Configuration

### SSL/HTTPS for Production

1. Obtain SSL certificate (Let's Encrypt recommended)
2. Place certificate in `./ssl/` directory
3. Update `nginx.conf` with SSL configuration
4. Update docker-compose to expose port 443

### Custom Branding

Edit `frontend/public/index.html` to change:
- Title
- Logo
- favicon

Edit `frontend/src/components/Sidebar.js` to change:
- Application name
- Logo colors

### Database Optimization

For large deployments:
```sql
-- Create indexes on frequently searched fields
CREATE INDEX idx_asset_tag ON assets(asset_tag);
CREATE INDEX idx_ticket_status ON tickets(status);
CREATE INDEX idx_loaner_due_date ON loaner_assignments(due_date);
```

### High Availability

For production use:
1. Set up PostgreSQL replication
2. Use load balancer (Nginx upstream)
3. Run multiple API instances
4. Set up centralized logging
5. Configure monitoring and alerts

---

## Quick Reference

### Default Credentials
- **Username:** admin
- **Password:** admin123
- **Change immediately after first login**

### Port Assignments
- Frontend: 3000
- API: 5000
- Database: 5432
- Nginx: 80/443

### Key Files
- API: `backend/app.py`, `backend/routes.py`
- Database: `backend/models.py`
- Frontend: `frontend/src/App.js`
- Config: `docker-compose.yml`, `.env`

### Useful Commands

```bash
# See all running containers
docker-compose ps

# Execute command in container
docker-compose exec backend python app.py

# View real-time logs
docker-compose logs -f

# Reset everything (WARNING: deletes all data)
docker-compose down -v
docker-compose up -d
```

---

## Additional Resources

### Learning Resources
- Flask Documentation: https://flask.palletsprojects.com/
- React Documentation: https://react.dev/
- PostgreSQL Documentation: https://www.postgresql.org/docs/
- Docker Documentation: https://docs.docker.com/

### Community & Support
- Stack Overflow for code questions
- GitHub Issues for bugs
- Flask/React communities for general help

---

**Version:** 1.0.0  
**Last Updated:** 2026-05-03  
**Supported Platforms:** Windows, macOS, Linux  
**License:** School Use License

For support or questions, contact your IT administrator.

# Developer Guide - Extending the IT Asset Tracking Tool

## Project Overview for Developers

This is a modern, full-stack web application built with Flask (backend) and React (frontend), designed for schools to manage IT assets and support tickets.

### Technology Stack
- **Backend**: Python 3.11, Flask, SQLAlchemy ORM, PostgreSQL
- **Frontend**: React 18, React Router, Tailwind CSS, Axios
- **Infrastructure**: Docker, Docker Compose, Nginx
- **Testing**: pytest (backend), Jest (frontend)
- **Version Control**: Git

## Development Environment Setup

### Prerequisites
- Python 3.11 or higher
- Node.js 18 or higher  
- PostgreSQL 15 or higher
- Visual Studio Code (recommended) or any editor
- Git

### Backend Development Setup

```bash
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies with dev packages
pip install -r requirements.txt
pip install pytest pytest-cov black flake8

# Create .env file from example
cp .env.example .env

# Initialize database
python init_db.py

# Run development server
python app.py
```

### Frontend Development Setup

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development server
npm start
```

## Code Structure

### Backend (`backend/`)

```
backend/
├── app.py           # Flask app factory, configuration
├── models.py        # SQLAlchemy ORM models (9 tables)
├── routes.py        # API endpoints (6 blueprints)
├── utils.py         # Helper functions (email, scheduling)
├── init_db.py       # Database initialization script
├── requirements.txt # Python dependencies
└── Dockerfile       # Container configuration
```

### Frontend (`frontend/src/`)

```
src/
├── App.js           # Main app with routing & auth context
├── pages/           # Page components (7 pages)
│   ├── LoginPage.js
│   ├── Dashboard.js
│   ├── AssetInventory.js
│   ├── AssetDetails.js
│   ├── BarcodeScanner.js
│   ├── LoanerManagement.js
│   ├── TicketTracking.js
│   ├── TicketDetails.js
│   ├── AdminPanel.js
│   └── NotFound.js
├── components/      # Reusable components (2)
│   ├── Navbar.js
│   └── Sidebar.js
├── services/        # API client
│   └── api.js       # Axios instance with interceptors
├── styles/          # Global CSS
│   └── index.css    # Tailwind + custom classes
└── utils/           # Helper utilities
```

## API Architecture

### Blueprints Organization

1. **auth_bp** (`/api/auth/`)
   - Login, register, get current user
   - JWT token generation

2. **assets_bp** (`/api/assets/`)
   - Asset CRUD operations
   - Barcode scanning
   - Loaner management
   - Maintenance tracking
   - Asset groups

3. **tickets_bp** (`/api/tickets/`)
   - Ticket CRUD operations
   - Comments and attachments
   - Asset linking

4. **admin_bp** (`/api/admin/`)
   - User management
   - System configuration

5. **google_bp** (`/api/google/`)
   - Google Workspace integration (placeholder)

### Database Schema

**Users** - System users with roles
**Assets** - IT equipment inventory
**AssetGroups** - Organize assets
**LoanerAssignments** - Track temporary device loans
**MaintenanceRecords** - Repair and maintenance history
**Tickets** - Support requests
**TicketAssets** - Link devices to tickets
**TicketAttachments** - Files attached to tickets
**TicketComments** - Discussion history
**GoogleAdminSync** - Sync status tracking

## Frontend Architecture

### State Management
- **AuthContext**: User authentication state
- **localStorage**: Persist auth token
- API responses cached in component state

### Component Hierarchy
```
App (provides AuthContext)
├── ProtectedRoute (wraps authenticated pages)
├── AdminRoute (wraps admin-only pages)
└── MainLayout (provides Navbar + Sidebar)
    └── Page Components
```

### Styling Approach
- **Tailwind CSS** for utility-first styling
- **Custom CSS classes** for glass morphism effects
- **Dark theme** with gradient backgrounds
- **Responsive design** (mobile, tablet, desktop)

### Component Communication
- Props for parent-child communication
- Custom hooks (`useAuth`) for context
- API calls through centralized service

## Common Development Tasks

### Adding a New Asset Feature

1. **Add database field** in `models.py`:
```python
class Asset(db.Model):
    new_field = db.Column(db.String(255))
```

2. **Create API endpoint** in `routes.py`:
```python
@assets_bp.route('/feature', methods=['POST'])
@jwt_required()
def new_feature():
    # Implementation
```

3. **Add UI component** in `frontend/src/pages/`:
```jsx
<input value={asset.new_field} onChange={...} />
```

4. **Update API service** in `frontend/src/services/api.js`:
```js
newFeature: (assetId, data) => api.post(`/assets/${assetId}/feature`, data),
```

### Adding a New Page

1. Create new file in `frontend/src/pages/NewPage.js`
2. Add route in `frontend/src/App.js`
3. Add navigation link in `frontend/src/components/Sidebar.js`
4. Import and use API services from `frontend/src/services/api.js`

### Adding Authentication to an Endpoint

```python
from flask_jwt_extended import jwt_required, get_jwt_identity

@api_bp.route('/protected', methods=['GET'])
@jwt_required()
def protected_endpoint():
    user_id = get_jwt_identity()
    # Use user_id to check permissions
    return jsonify({'message': 'Success'})
```

### Database Migrations

```bash
# If you're using Flask-Migrate (not currently set up):
# flask db init
# flask db migrate -m "Description"
# flask db upgrade

# For now, use:
python init_db.py
```

## Testing

### Backend Testing

```bash
# Run tests
pytest

# With coverage
pytest --cov=.

# Run specific test file
pytest tests/test_auth.py

# Run specific test
pytest tests/test_auth.py::test_login
```

### Frontend Testing

```bash
# Run tests
npm test

# With coverage
npm test -- --coverage

# Run specific test file
npm test -- AssetInventory.test.js
```

### Create Test File

**Backend example** (`tests/test_assets.py`):
```python
import pytest
from app import create_app, db

@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            yield client
            db.session.remove()
            db.drop_all()

def test_get_assets(client):
    response = client.get('/api/assets')
    assert response.status_code == 401  # Requires auth
```

## Code Style & Quality

### Python (Backend)
- **Formatter**: black
```bash
black backend/
```
- **Linter**: flake8
```bash
flake8 backend/
```

### JavaScript (Frontend)
- **Formatter**: Prettier (install in VS Code)
- **Linter**: ESLint (runs on build)
- **Style Guide**: Airbnb JavaScript Style Guide

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push and create PR
git push origin feature/new-feature

# Merge after review
```

## Performance Optimization

### Backend
- Use database indexes on frequently queried fields
- Implement pagination for large result sets
- Use query caching for Google Admin API
- Compress API responses with gzip

### Frontend
- Code splitting with React.lazy
- Memoization with React.memo for expensive components
- Use useCallback for expensive functions
- Optimize images and assets

## Security Best Practices

### Input Validation
- Validate all API inputs
- Use email-validator for emails
- Check file types for uploads

### Authentication
- Never store passwords in plain text
- Use bcrypt or similar for password hashing
- JWT tokens with expiration
- Refresh token mechanism (future)

### Authorization
- Check user role for admin endpoints
- Verify user owns resource before modifying
- Use @jwt_required() decorator

### Data Protection
- Sanitize user input
- Use parameterized queries (SQLAlchemy ORM)
- HTTPS only in production
- Rate limiting (implement with Flask-Limiter)

## Debugging

### Backend
```bash
# Set debug mode
export FLASK_ENV=development
export FLASK_DEBUG=True

# Use debugger
import pdb; pdb.set_trace()

# Check logs
docker-compose logs backend
```

### Frontend
- Open browser DevTools (F12)
- Network tab for API calls
- Console for JavaScript errors
- React DevTools extension

### Database
```bash
# Connect to database
docker-compose exec postgres psql -U admin asset_tracker

# Useful queries
SELECT * FROM users;
SELECT COUNT(*) FROM assets;
SELECT * FROM loaner_assignments WHERE returned_date IS NULL;
```

## Deployment Checklist

Before going to production:

- [ ] Change all default passwords
- [ ] Set strong JWT secret
- [ ] Configure SMTP for emails
- [ ] Set up database backups
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall
- [ ] Test disaster recovery
- [ ] Set up monitoring
- [ ] Document procedures
- [ ] Train IT staff
- [ ] Create admin procedures
- [ ] Plan maintenance windows

## Future Enhancement Ideas

1. **Google Admin Integration**
   - Sync devices from Google Workspace
   - Auto-create assets from discovered devices
   - Sync user OUs

2. **Advanced Reporting**
   - Asset depreciation reports
   - Repair cost analysis
   - Ticket metrics dashboard
   - Warranty tracking

3. **Mobile App**
   - React Native app for asset scanning
   - Push notifications for overdue loaners
   - Offline support

4. **Integrations**
   - Slack bot for notifications
   - Microsoft Teams integration
   - Google Calendar for appointments

5. **Machine Learning**
   - Predict device failures
   - Recommend repairs vs. replacement
   - Optimize loaner assignments

6. **Advanced Features**
   - Asset movement tracking (locations)
   - Device lifecycle management
   - Automated compliance reporting
   - Custom workflows

## Git Repository Structure

```
main branch (production)
└── develop branch
    ├── feature/asset-scanning
    ├── feature/google-integration
    ├── bugfix/email-reminders
    └── hotfix/database-error
```

## CI/CD Setup (Recommended)

Using GitHub Actions:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Backend Tests
        run: cd backend && pytest
      - name: Run Frontend Tests
        run: cd frontend && npm test
```

## Documentation Standards

- Add docstrings to all functions
- Use type hints in Python
- Document API changes
- Update README for new features
- Comment complex logic

Example docstring:
```python
def sync_devices():
    """
    Sync devices from Google Admin API.
    
    Returns:
        bool: True if sync successful, False otherwise
        
    Raises:
        GoogleAPIError: If API call fails
    """
```

## Resources for Developers

- Flask: https://flask.palletsprojects.com/
- React: https://react.dev/
- SQLAlchemy: https://www.sqlalchemy.org/
- PostgreSQL: https://www.postgresql.org/docs/
- Tailwind CSS: https://tailwindcss.com/
- Docker: https://docs.docker.com/

---

**Version**: 1.0.0  
**Last Updated**: 2026-05-03

For questions or clarifications, refer to inline code comments or reach out to the development team.

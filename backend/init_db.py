"""
Database initialization and migration scripts
Run these to set up the database schema
"""

import os
from app import create_app, db
from models import User, Asset, AssetGroup, LoanerAssignment, MaintenanceRecord, Ticket, TicketAsset, TicketAttachment, TicketComment, GoogleAdminSync
from werkzeug.security import generate_password_hash

def init_db():
    """Initialize the database with tables"""
    app = create_app()
    with app.app_context():
        db.create_all()
        print("✓ Database tables created")
        create_default_data()

def create_default_data():
    """Create default admin user and sample data"""
    # Check if admin already exists
    admin = User.query.filter_by(username='admin').first()
    if admin:
        print("✓ Admin user already exists")
        return
    
    # Create admin user
    admin_user = User(
        username='admin',
        email='admin@school.local',
        password_hash=generate_password_hash('admin123'),
        first_name='System',
        last_name='Administrator',
        role='admin',
        is_active=True
    )
    db.session.add(admin_user)
    
    # Create sample technician
    tech_user = User(
        username='technician',
        email='technician@school.local',
        password_hash=generate_password_hash('tech123'),
        first_name='John',
        last_name='Smith',
        role='technician',
        is_active=True
    )
    db.session.add(tech_user)
    
    # Create sample viewer
    viewer_user = User(
        username='viewer',
        email='viewer@school.local',
        password_hash=generate_password_hash('viewer123'),
        first_name='Jane',
        last_name='Doe',
        role='viewer',
        is_active=True
    )
    db.session.add(viewer_user)
    
    db.session.commit()
    print("✓ Default users created (admin/technician/viewer)")
    print("  - admin: admin123")
    print("  - technician: tech123")
    print("  - viewer: viewer123")

def reset_db():
    """DANGEROUS: Drop all tables and recreate"""
    app = create_app()
    with app.app_context():
        print("⚠️  WARNING: This will delete all data!")
        confirm = input("Type 'yes' to confirm: ")
        if confirm.lower() == 'yes':
            db.drop_all()
            print("✓ All tables dropped")
            init_db()
        else:
            print("✗ Cancelled")

if __name__ == '__main__':
    import sys
    if len(sys.argv) > 1:
        if sys.argv[1] == 'reset':
            reset_db()
        elif sys.argv[1] == 'init':
            init_db()
    else:
        init_db()

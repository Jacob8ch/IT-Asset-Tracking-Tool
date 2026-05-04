from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from enum import Enum
import uuid

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = db.Column(db.String(255), unique=True, nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(255))
    last_name = db.Column(db.String(255))
    role = db.Column(db.String(50), default='technician')  # admin, technician, viewer
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<User {self.username}>'

class Asset(db.Model):
    __tablename__ = 'assets'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    asset_tag = db.Column(db.String(255), unique=True, nullable=False)  # Barcode
    asset_name = db.Column(db.String(255), nullable=False)
    asset_type = db.Column(db.String(100), nullable=False)  # Laptop, Desktop, Phone, Tablet, Monitor, etc
    manufacturer = db.Column(db.String(255))
    model = db.Column(db.String(255))
    serial_number = db.Column(db.String(255), unique=True)
    purchase_date = db.Column(db.Date)
    purchase_cost = db.Column(db.Float)
    warranty_expiry = db.Column(db.Date)
    status = db.Column(db.String(50), default='available')  # available, in_use, repair, retired
    assigned_to_user = db.Column(db.String(255))  # User ID or email
    assigned_to_ou = db.Column(db.String(255))  # Google Admin OU
    group_id = db.Column(db.String(36), db.ForeignKey('asset_groups.id'))
    location = db.Column(db.String(255))
    notes = db.Column(db.Text)
    is_loaner = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    group = db.relationship('AssetGroup', back_populates='assets')
    maintenance_records = db.relationship('MaintenanceRecord', back_populates='asset', cascade='all, delete-orphan')
    ticket_assets = db.relationship('TicketAsset', back_populates='asset', cascade='all, delete-orphan')
    loaner_assignments = db.relationship('LoanerAssignment', back_populates='device', foreign_keys='LoanerAssignment.device_id')
    loaner_device_assignments = db.relationship('LoanerAssignment', back_populates='loaner_device', foreign_keys='LoanerAssignment.loaner_device_id')
    
    def __repr__(self):
        return f'<Asset {self.asset_tag}>'

class AssetGroup(db.Model):
    __tablename__ = 'asset_groups'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    group_name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    created_by = db.Column(db.String(36), db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    assets = db.relationship('Asset', back_populates='group', cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<AssetGroup {self.group_name}>'

class LoanerAssignment(db.Model):
    __tablename__ = 'loaner_assignments'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    device_id = db.Column(db.String(36), db.ForeignKey('assets.id'), nullable=False)  # Device needing repair
    loaner_device_id = db.Column(db.String(36), db.ForeignKey('assets.id'), nullable=False)  # Loaner device
    assigned_to_user = db.Column(db.String(255), nullable=False)  # User receiving loaner
    assigned_date = db.Column(db.DateTime, default=datetime.utcnow)
    due_date = db.Column(db.DateTime, nullable=False)
    returned_date = db.Column(db.DateTime)
    is_overdue = db.Column(db.Boolean, default=False)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    device = db.relationship('Asset', foreign_keys=[device_id], back_populates='loaner_assignments')
    loaner_device = db.relationship('Asset', foreign_keys=[loaner_device_id], back_populates='loaner_device_assignments')
    
    def __repr__(self):
        return f'<LoanerAssignment {self.id}>'

class MaintenanceRecord(db.Model):
    __tablename__ = 'maintenance_records'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    asset_id = db.Column(db.String(36), db.ForeignKey('assets.id'), nullable=False)
    maintenance_type = db.Column(db.String(100), nullable=False)  # repair, maintenance, upgrade, inspection
    description = db.Column(db.Text, nullable=False)
    technician_id = db.Column(db.String(36), db.ForeignKey('users.id'))
    start_date = db.Column(db.DateTime, nullable=False)
    completion_date = db.Column(db.DateTime)
    cost = db.Column(db.Float)
    status = db.Column(db.String(50), default='in_progress')  # in_progress, completed, on_hold
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    asset = db.relationship('Asset', back_populates='maintenance_records')
    technician = db.relationship('User')
    
    def __repr__(self):
        return f'<MaintenanceRecord {self.id}>'

class Ticket(db.Model):
    __tablename__ = 'tickets'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ticket_number = db.Column(db.String(50), unique=True, nullable=False)
    title = db.Column(db.String(500), nullable=False)
    description = db.Column(db.Text, nullable=False)
    issue_type = db.Column(db.String(100), nullable=False)  # hardware, software, network, other
    priority = db.Column(db.String(50), default='medium')  # low, medium, high, critical
    status = db.Column(db.String(50), default='open')  # open, in_progress, resolved, closed
    created_by = db.Column(db.String(36), db.ForeignKey('users.id'))
    assigned_to = db.Column(db.String(36), db.ForeignKey('users.id'))
    created_date = db.Column(db.DateTime, default=datetime.utcnow)
    updated_date = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    resolved_date = db.Column(db.DateTime)
    resolution_notes = db.Column(db.Text)
    created_from_email = db.Column(db.Boolean, default=False)
    email_sender = db.Column(db.String(255))
    
    creator = db.relationship('User', foreign_keys=[created_by])
    assignee = db.relationship('User', foreign_keys=[assigned_to])
    ticket_assets = db.relationship('TicketAsset', back_populates='ticket', cascade='all, delete-orphan')
    attachments = db.relationship('TicketAttachment', back_populates='ticket', cascade='all, delete-orphan')
    comments = db.relationship('TicketComment', back_populates='ticket', cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Ticket {self.ticket_number}>'

class TicketAsset(db.Model):
    __tablename__ = 'ticket_assets'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ticket_id = db.Column(db.String(36), db.ForeignKey('tickets.id'), nullable=False)
    asset_id = db.Column(db.String(36), db.ForeignKey('assets.id'), nullable=False)
    
    ticket = db.relationship('Ticket', back_populates='ticket_assets')
    asset = db.relationship('Asset', back_populates='ticket_assets')
    
    def __repr__(self):
        return f'<TicketAsset {self.ticket_id}-{self.asset_id}>'

class TicketAttachment(db.Model):
    __tablename__ = 'ticket_attachments'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ticket_id = db.Column(db.String(36), db.ForeignKey('tickets.id'), nullable=False)
    file_name = db.Column(db.String(500), nullable=False)
    file_type = db.Column(db.String(100), nullable=False)
    file_size = db.Column(db.Integer)
    file_path = db.Column(db.String(1000), nullable=False)
    uploaded_by = db.Column(db.String(36), db.ForeignKey('users.id'))
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    ticket = db.relationship('Ticket', back_populates='attachments')
    uploader = db.relationship('User')
    
    def __repr__(self):
        return f'<TicketAttachment {self.file_name}>'

class TicketComment(db.Model):
    __tablename__ = 'ticket_comments'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    ticket_id = db.Column(db.String(36), db.ForeignKey('tickets.id'), nullable=False)
    author_id = db.Column(db.String(36), db.ForeignKey('users.id'))
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    ticket = db.relationship('Ticket', back_populates='comments')
    author = db.relationship('User')
    
    def __repr__(self):
        return f'<TicketComment {self.id}>'

class GoogleAdminSync(db.Model):
    __tablename__ = 'google_admin_sync'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    sync_type = db.Column(db.String(50), nullable=False)  # devices, ous, users
    last_synced = db.Column(db.DateTime)
    sync_status = db.Column(db.String(50), default='pending')  # pending, syncing, completed, failed
    error_message = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<GoogleAdminSync {self.sync_type}>'

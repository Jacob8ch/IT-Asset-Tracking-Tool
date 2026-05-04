from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User, Asset, AssetGroup, LoanerAssignment, MaintenanceRecord, Ticket, TicketAsset, TicketAttachment, TicketComment
from datetime import datetime, timedelta
import uuid
import os
from email_validator import validate_email, EmailNotValidError

# ==================== Authentication Routes ====================
auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Missing credentials'}), 400
    
    user = User.query.filter_by(username=data['username']).first()
    
    if not user or not check_password_hash(user.password_hash, data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    if not user.is_active:
        return jsonify({'error': 'User account is disabled'}), 403
    
    access_token = create_access_token(identity=user.id)
    return jsonify({
        'access_token': access_token,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'full_name': f'{user.first_name} {user.last_name}',
            'role': user.role
        }
    }), 200

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('password') or not data.get('email'):
        return jsonify({'error': 'Missing required fields'}), 400
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 409
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 409
    
    try:
        validate_email(data['email'])
    except EmailNotValidError:
        return jsonify({'error': 'Invalid email format'}), 400
    
    new_user = User(
        username=data['username'],
        email=data['email'],
        password_hash=generate_password_hash(data['password']),
        first_name=data.get('first_name', ''),
        last_name=data.get('last_name', '')
    )
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({'message': 'User created successfully', 'user_id': new_user.id}), 201

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'full_name': f'{user.first_name} {user.last_name}',
        'role': user.role,
        'created_at': user.created_at.isoformat()
    }), 200

# ==================== Asset Routes ====================
assets_bp = Blueprint('assets', __name__)

@assets_bp.route('/', methods=['GET'])
@jwt_required()
def get_assets():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    status = request.args.get('status')
    asset_type = request.args.get('type')
    group_id = request.args.get('group_id')
    
    query = Asset.query
    
    if status:
        query = query.filter_by(status=status)
    if asset_type:
        query = query.filter_by(asset_type=asset_type)
    if group_id:
        query = query.filter_by(group_id=group_id)
    
    paginated = query.paginate(page=page, per_page=per_page)
    
    assets = [{
        'id': asset.id,
        'asset_tag': asset.asset_tag,
        'asset_name': asset.asset_name,
        'asset_type': asset.asset_type,
        'manufacturer': asset.manufacturer,
        'model': asset.model,
        'serial_number': asset.serial_number,
        'status': asset.status,
        'assigned_to_user': asset.assigned_to_user,
        'assigned_to_ou': asset.assigned_to_ou,
        'location': asset.location,
        'is_loaner': asset.is_loaner,
        'created_at': asset.created_at.isoformat()
    } for asset in paginated.items]
    
    return jsonify({
        'items': assets,
        'total': paginated.total,
        'pages': paginated.pages,
        'current_page': page
    }), 200

@assets_bp.route('/<asset_id>', methods=['GET'])
@jwt_required()
def get_asset(asset_id):
    asset = Asset.query.get(asset_id)
    if not asset:
        return jsonify({'error': 'Asset not found'}), 404
    
    return jsonify({
        'id': asset.id,
        'asset_tag': asset.asset_tag,
        'asset_name': asset.asset_name,
        'asset_type': asset.asset_type,
        'manufacturer': asset.manufacturer,
        'model': asset.model,
        'serial_number': asset.serial_number,
        'purchase_date': asset.purchase_date.isoformat() if asset.purchase_date else None,
        'purchase_cost': asset.purchase_cost,
        'warranty_expiry': asset.warranty_expiry.isoformat() if asset.warranty_expiry else None,
        'status': asset.status,
        'assigned_to_user': asset.assigned_to_user,
        'assigned_to_ou': asset.assigned_to_ou,
        'location': asset.location,
        'notes': asset.notes,
        'is_loaner': asset.is_loaner,
        'group_id': asset.group_id,
        'maintenance_records': [{
            'id': m.id,
            'maintenance_type': m.maintenance_type,
            'description': m.description,
            'start_date': m.start_date.isoformat(),
            'completion_date': m.completion_date.isoformat() if m.completion_date else None,
            'status': m.status
        } for m in asset.maintenance_records],
        'created_at': asset.created_at.isoformat(),
        'updated_at': asset.updated_at.isoformat()
    }), 200

@assets_bp.route('/', methods=['POST'])
@jwt_required()
def create_asset():
    data = request.get_json()
    
    if not data or not data.get('asset_tag') or not data.get('asset_name'):
        return jsonify({'error': 'Missing required fields'}), 400
    
    if Asset.query.filter_by(asset_tag=data['asset_tag']).first():
        return jsonify({'error': 'Asset tag already exists'}), 409
    
    new_asset = Asset(
        asset_tag=data['asset_tag'],
        asset_name=data['asset_name'],
        asset_type=data.get('asset_type', 'Other'),
        manufacturer=data.get('manufacturer'),
        model=data.get('model'),
        serial_number=data.get('serial_number'),
        purchase_date=datetime.fromisoformat(data['purchase_date']) if data.get('purchase_date') else None,
        purchase_cost=data.get('purchase_cost'),
        warranty_expiry=datetime.fromisoformat(data['warranty_expiry']) if data.get('warranty_expiry') else None,
        status=data.get('status', 'available'),
        assigned_to_user=data.get('assigned_to_user'),
        assigned_to_ou=data.get('assigned_to_ou'),
        location=data.get('location'),
        notes=data.get('notes'),
        is_loaner=data.get('is_loaner', False),
        group_id=data.get('group_id')
    )
    
    db.session.add(new_asset)
    db.session.commit()
    
    return jsonify({
        'message': 'Asset created successfully',
        'asset_id': new_asset.id
    }), 201

@assets_bp.route('/<asset_id>', methods=['PUT'])
@jwt_required()
def update_asset(asset_id):
    asset = Asset.query.get(asset_id)
    if not asset:
        return jsonify({'error': 'Asset not found'}), 404
    
    data = request.get_json()
    
    asset.asset_name = data.get('asset_name', asset.asset_name)
    asset.asset_type = data.get('asset_type', asset.asset_type)
    asset.manufacturer = data.get('manufacturer', asset.manufacturer)
    asset.model = data.get('model', asset.model)
    asset.serial_number = data.get('serial_number', asset.serial_number)
    asset.status = data.get('status', asset.status)
    asset.assigned_to_user = data.get('assigned_to_user', asset.assigned_to_user)
    asset.assigned_to_ou = data.get('assigned_to_ou', asset.assigned_to_ou)
    asset.location = data.get('location', asset.location)
    asset.notes = data.get('notes', asset.notes)
    asset.is_loaner = data.get('is_loaner', asset.is_loaner)
    asset.group_id = data.get('group_id', asset.group_id)
    
    db.session.commit()
    
    return jsonify({'message': 'Asset updated successfully'}), 200

@assets_bp.route('/scan/<asset_tag>', methods=['GET'])
@jwt_required()
def scan_barcode(asset_tag):
    asset = Asset.query.filter_by(asset_tag=asset_tag).first()
    if not asset:
        return jsonify({'error': 'Asset not found'}), 404
    
    return jsonify({
        'id': asset.id,
        'asset_tag': asset.asset_tag,
        'asset_name': asset.asset_name,
        'status': asset.status,
        'assigned_to_user': asset.assigned_to_user
    }), 200

# ==================== Loaner Assignment Routes ====================
@assets_bp.route('/loaner/assign', methods=['POST'])
@jwt_required()
def assign_loaner():
    data = request.get_json()
    
    if not data or not data.get('device_id') or not data.get('loaner_device_id') or not data.get('assigned_to_user'):
        return jsonify({'error': 'Missing required fields'}), 400
    
    device = Asset.query.get(data['device_id'])
    loaner = Asset.query.get(data['loaner_device_id'])
    
    if not device or not loaner:
        return jsonify({'error': 'Device not found'}), 404
    
    if not device.status in ['repair', 'in_use']:
        device.status = 'repair'
    
    loaner.assigned_to_user = data['assigned_to_user']
    loaner.status = 'in_use'
    
    due_date = datetime.utcnow() + timedelta(days=data.get('loan_duration_days', 7))
    
    assignment = LoanerAssignment(
        device_id=data['device_id'],
        loaner_device_id=data['loaner_device_id'],
        assigned_to_user=data['assigned_to_user'],
        due_date=due_date,
        notes=data.get('notes')
    )
    
    db.session.add(assignment)
    db.session.commit()
    
    return jsonify({
        'message': 'Loaner assigned successfully',
        'assignment_id': assignment.id,
        'due_date': due_date.isoformat()
    }), 201

@assets_bp.route('/loaner/<assignment_id>/return', methods=['POST'])
@jwt_required()
def return_loaner(assignment_id):
    assignment = LoanerAssignment.query.get(assignment_id)
    if not assignment:
        return jsonify({'error': 'Assignment not found'}), 404
    
    assignment.returned_date = datetime.utcnow()
    assignment.is_overdue = assignment.returned_date > assignment.due_date
    
    loaner = Asset.query.get(assignment.loaner_device_id)
    loaner.status = 'available'
    loaner.assigned_to_user = None
    
    db.session.commit()
    
    return jsonify({'message': 'Loaner returned successfully'}), 200

@assets_bp.route('/loaner/active', methods=['GET'])
@jwt_required()
def get_active_loaners():
    active_loaners = LoanerAssignment.query.filter_by(returned_date=None).all()
    
    loaners = [{
        'id': assignment.id,
        'device_name': assignment.device.asset_name,
        'loaner_name': assignment.loaner_device.asset_name,
        'assigned_to': assignment.assigned_to_user,
        'assigned_date': assignment.assigned_date.isoformat(),
        'due_date': assignment.due_date.isoformat(),
        'is_overdue': assignment.is_overdue,
        'days_remaining': (assignment.due_date - datetime.utcnow()).days
    } for assignment in active_loaners]
    
    return jsonify(loaners), 200

# ==================== Asset Group Routes ====================
@assets_bp.route('/groups', methods=['GET'])
@jwt_required()
def get_groups():
    groups = AssetGroup.query.all()
    return jsonify([{
        'id': g.id,
        'group_name': g.group_name,
        'description': g.description,
        'asset_count': len(g.assets)
    } for g in groups]), 200

@assets_bp.route('/groups', methods=['POST'])
@jwt_required()
def create_group():
    data = request.get_json()
    
    if not data or not data.get('group_name'):
        return jsonify({'error': 'Missing group name'}), 400
    
    user_id = get_jwt_identity()
    group = AssetGroup(
        group_name=data['group_name'],
        description=data.get('description'),
        created_by=user_id
    )
    
    db.session.add(group)
    db.session.commit()
    
    return jsonify({'message': 'Group created successfully', 'group_id': group.id}), 201

# ==================== Maintenance Routes ====================
@assets_bp.route('/<asset_id>/maintenance', methods=['POST'])
@jwt_required()
def create_maintenance_record(asset_id):
    asset = Asset.query.get(asset_id)
    if not asset:
        return jsonify({'error': 'Asset not found'}), 404
    
    data = request.get_json()
    user_id = get_jwt_identity()
    
    record = MaintenanceRecord(
        asset_id=asset_id,
        maintenance_type=data.get('maintenance_type'),
        description=data.get('description'),
        technician_id=user_id,
        start_date=datetime.utcnow(),
        cost=data.get('cost'),
        notes=data.get('notes')
    )
    
    asset.status = 'repair'
    db.session.add(record)
    db.session.commit()
    
    return jsonify({'message': 'Maintenance record created', 'record_id': record.id}), 201

@assets_bp.route('/maintenance/<record_id>/complete', methods=['POST'])
@jwt_required()
def complete_maintenance(record_id):
    record = MaintenanceRecord.query.get(record_id)
    if not record:
        return jsonify({'error': 'Record not found'}), 404
    
    record.completion_date = datetime.utcnow()
    record.status = 'completed'
    record.asset.status = 'available'
    
    db.session.commit()
    
    return jsonify({'message': 'Maintenance marked as complete'}), 200

# ==================== Ticket Routes ====================
tickets_bp = Blueprint('tickets', __name__)

def generate_ticket_number():
    import time
    return f"TKT-{int(time.time())}"

@tickets_bp.route('/', methods=['GET'])
@jwt_required()
def get_tickets():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 25, type=int)
    status = request.args.get('status')
    priority = request.args.get('priority')
    assigned_to = request.args.get('assigned_to')
    
    query = Ticket.query
    
    if status:
        query = query.filter_by(status=status)
    if priority:
        query = query.filter_by(priority=priority)
    if assigned_to:
        query = query.filter_by(assigned_to=assigned_to)
    
    paginated = query.order_by(Ticket.created_date.desc()).paginate(page=page, per_page=per_page)
    
    tickets = [{
        'id': ticket.id,
        'ticket_number': ticket.ticket_number,
        'title': ticket.title,
        'status': ticket.status,
        'priority': ticket.priority,
        'created_date': ticket.created_date.isoformat(),
        'assigned_to_name': f'{ticket.assignee.first_name} {ticket.assignee.last_name}' if ticket.assignee else 'Unassigned'
    } for ticket in paginated.items]
    
    return jsonify({
        'items': tickets,
        'total': paginated.total,
        'pages': paginated.pages,
        'current_page': page
    }), 200

@tickets_bp.route('/<ticket_id>', methods=['GET'])
@jwt_required()
def get_ticket(ticket_id):
    ticket = Ticket.query.get(ticket_id)
    if not ticket:
        return jsonify({'error': 'Ticket not found'}), 404
    
    return jsonify({
        'id': ticket.id,
        'ticket_number': ticket.ticket_number,
        'title': ticket.title,
        'description': ticket.description,
        'issue_type': ticket.issue_type,
        'priority': ticket.priority,
        'status': ticket.status,
        'created_by_name': f'{ticket.creator.first_name} {ticket.creator.last_name}',
        'assigned_to_name': f'{ticket.assignee.first_name} {ticket.assignee.last_name}' if ticket.assignee else 'Unassigned',
        'assigned_to_id': ticket.assigned_to,
        'created_date': ticket.created_date.isoformat(),
        'updated_date': ticket.updated_date.isoformat(),
        'resolved_date': ticket.resolved_date.isoformat() if ticket.resolved_date else None,
        'resolution_notes': ticket.resolution_notes,
        'assets': [{'id': ta.asset.id, 'name': ta.asset.asset_name} for ta in ticket.ticket_assets],
        'comments': [{
            'id': c.id,
            'author': f'{c.author.first_name} {c.author.last_name}' if c.author else 'Unknown',
            'content': c.content,
            'created_at': c.created_at.isoformat()
        } for c in ticket.comments]
    }), 200

@tickets_bp.route('/', methods=['POST'])
@jwt_required()
def create_ticket():
    data = request.get_json()
    user_id = get_jwt_identity()
    
    if not data or not data.get('title') or not data.get('description'):
        return jsonify({'error': 'Missing required fields'}), 400
    
    ticket = Ticket(
        ticket_number=generate_ticket_number(),
        title=data['title'],
        description=data['description'],
        issue_type=data.get('issue_type', 'other'),
        priority=data.get('priority', 'medium'),
        created_by=user_id,
        assigned_to=data.get('assigned_to')
    )
    
    db.session.add(ticket)
    db.session.flush()
    
    # Add assets to ticket if provided
    if data.get('asset_ids'):
        for asset_id in data['asset_ids']:
            ticket_asset = TicketAsset(ticket_id=ticket.id, asset_id=asset_id)
            db.session.add(ticket_asset)
    
    db.session.commit()
    
    return jsonify({
        'message': 'Ticket created successfully',
        'ticket_id': ticket.id,
        'ticket_number': ticket.ticket_number
    }), 201

@tickets_bp.route('/<ticket_id>', methods=['PUT'])
@jwt_required()
def update_ticket(ticket_id):
    ticket = Ticket.query.get(ticket_id)
    if not ticket:
        return jsonify({'error': 'Ticket not found'}), 404
    
    data = request.get_json()
    
    ticket.title = data.get('title', ticket.title)
    ticket.description = data.get('description', ticket.description)
    ticket.issue_type = data.get('issue_type', ticket.issue_type)
    ticket.priority = data.get('priority', ticket.priority)
    ticket.status = data.get('status', ticket.status)
    ticket.assigned_to = data.get('assigned_to', ticket.assigned_to)
    
    if data.get('status') == 'resolved' and not ticket.resolved_date:
        ticket.resolved_date = datetime.utcnow()
        ticket.resolution_notes = data.get('resolution_notes')
    
    db.session.commit()
    
    return jsonify({'message': 'Ticket updated successfully'}), 200

@tickets_bp.route('/<ticket_id>/assets', methods=['POST'])
@jwt_required()
def add_ticket_asset(ticket_id):
    ticket = Ticket.query.get(ticket_id)
    if not ticket:
        return jsonify({'error': 'Ticket not found'}), 404
    
    data = request.get_json()
    asset_id = data.get('asset_id')
    
    if not asset_id:
        return jsonify({'error': 'Missing asset_id'}), 400
    
    asset = Asset.query.get(asset_id)
    if not asset:
        return jsonify({'error': 'Asset not found'}), 404
    
    existing = TicketAsset.query.filter_by(ticket_id=ticket_id, asset_id=asset_id).first()
    if existing:
        return jsonify({'error': 'Asset already attached to ticket'}), 409
    
    ticket_asset = TicketAsset(ticket_id=ticket_id, asset_id=asset_id)
    db.session.add(ticket_asset)
    db.session.commit()
    
    return jsonify({'message': 'Asset added to ticket'}), 201

@tickets_bp.route('/<ticket_id>/comments', methods=['POST'])
@jwt_required()
def add_ticket_comment(ticket_id):
    ticket = Ticket.query.get(ticket_id)
    if not ticket:
        return jsonify({'error': 'Ticket not found'}), 404
    
    data = request.get_json()
    user_id = get_jwt_identity()
    
    if not data or not data.get('content'):
        return jsonify({'error': 'Missing comment content'}), 400
    
    comment = TicketComment(
        ticket_id=ticket_id,
        author_id=user_id,
        content=data['content']
    )
    
    db.session.add(comment)
    db.session.commit()
    
    return jsonify({'message': 'Comment added successfully', 'comment_id': comment.id}), 201

# ==================== Admin Routes ====================
admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    user_id = get_jwt_identity()
    current_user = User.query.get(user_id)
    
    if current_user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    
    users = User.query.all()
    return jsonify([{
        'id': u.id,
        'username': u.username,
        'email': u.email,
        'full_name': f'{u.first_name} {u.last_name}',
        'role': u.role,
        'is_active': u.is_active,
        'created_at': u.created_at.isoformat()
    } for u in users]), 200

@admin_bp.route('/users/<user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    if current_user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    
    user.role = data.get('role', user.role)
    user.is_active = data.get('is_active', user.is_active)
    user.first_name = data.get('first_name', user.first_name)
    user.last_name = data.get('last_name', user.last_name)
    
    db.session.commit()
    
    return jsonify({'message': 'User updated successfully'}), 200

# ==================== Google Admin Routes ====================
google_bp = Blueprint('google', __name__)

@google_bp.route('/sync/devices', methods=['POST'])
@jwt_required()
def sync_google_devices():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if user.role != 'admin':
        return jsonify({'error': 'Admin access required'}), 403
    
    # This endpoint would integrate with Google Admin API
    # For now, returning placeholder
    return jsonify({'message': 'Device sync initiated', 'status': 'pending'}), 202

@google_bp.route('/ous', methods=['GET'])
@jwt_required()
def get_google_ous():
    # This would fetch OUs from Google Admin
    # For now, returning placeholder
    return jsonify({'ous': []}), 200

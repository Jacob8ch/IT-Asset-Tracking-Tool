from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_migrate import Migrate
from datetime import timedelta
from werkzeug.security import generate_password_hash
import os
from dotenv import load_dotenv

load_dotenv()

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
        'DATABASE_URL',
        'postgresql://localhost/asset_tracker'
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
    app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file upload
    
    # Initialize extensions
    from models import db
    db.init_app(app)
    
    migrate = Migrate(app, db)
    jwt = JWTManager(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Register blueprints
    from routes import auth_bp, assets_bp, tickets_bp, admin_bp, google_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(assets_bp, url_prefix='/api/assets')
    app.register_blueprint(tickets_bp, url_prefix='/api/tickets')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(google_bp, url_prefix='/api/google')
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Resource not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500
    
    # Health check
    @app.route('/api/health')
    def health_check():
        return jsonify({'status': 'healthy'}), 200
    
    # Create default admin user on startup
    with app.app_context():
        db.create_all()
        create_default_admin()
    
    return app

def create_default_admin():
    from models import db, User
    
    admin_exists = User.query.filter_by(username='admin').first()
    if not admin_exists:
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
        db.session.commit()
        print("Default admin user created: admin / admin123")

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)

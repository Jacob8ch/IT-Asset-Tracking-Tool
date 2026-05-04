"""
Utility functions for email notifications, scheduling, and helper tasks
"""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
import os
from models import LoanerAssignment, User, Asset
from dotenv import load_dotenv

load_dotenv()

class EmailService:
    """Handle email sending for notifications"""
    
    @staticmethod
    def send_loaner_reminder(assignment):
        """Send reminder about loaner device due date"""
        try:
            smtp_server = os.getenv('SMTP_SERVER')
            smtp_port = int(os.getenv('SMTP_PORT', 587))
            sender_email = os.getenv('SMTP_USERNAME')
            sender_password = os.getenv('SMTP_PASSWORD')
            from_email = os.getenv('SENDER_EMAIL')
            
            # Calculate days until due
            days_until_due = (assignment.due_date - datetime.utcnow()).days
            
            # Compose email
            subject = f"Loaner Device Return Reminder - Due in {max(0, days_until_due)} Days"
            
            if days_until_due < 0:
                subject = "URGENT: Loaner Device Overdue!"
            
            body = f"""
            <html>
            <body style="font-family: Arial, sans-serif;">
                <h2>Loaner Device Return Reminder</h2>
                <p>Dear {assignment.assigned_to_user},</p>
                
                <p>This is a reminder about your loaner device assignment:</p>
                
                <table style="border-collapse: collapse; margin: 20px 0;">
                    <tr style="background-color: #f0f0f0;">
                        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Original Device:</strong></td>
                        <td style="padding: 10px; border: 1px solid #ddd;">{assignment.device.asset_name}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Loaner Device:</strong></td>
                        <td style="padding: 10px; border: 1px solid #ddd;">{assignment.loaner_device.asset_name}</td>
                    </tr>
                    <tr style="background-color: #f0f0f0;">
                        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Assigned Date:</strong></td>
                        <td style="padding: 10px; border: 1px solid #ddd;">{assignment.assigned_date.strftime('%Y-%m-%d')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Due Date:</strong></td>
                        <td style="padding: 10px; border: 1px solid #ddd;">{assignment.due_date.strftime('%Y-%m-%d')}</td>
                    </tr>
                    <tr style="background-color: #fff3cd;">
                        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Days Remaining:</strong></td>
                        <td style="padding: 10px; border: 1px solid #ddd; color: red;"><strong>{max(0, days_until_due)} days</strong></td>
                    </tr>
                </table>
                
                <p>Please return the loaner device by the due date to IT Support.</p>
                
                <p>Best regards,<br>IT Asset Tracking System</p>
            </body>
            </html>
            """
            
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = from_email
            msg['To'] = assignment.assigned_to_user
            
            msg.attach(MIMEText(body, 'html'))
            
            # Send email
            with smtplib.SMTP(smtp_server, smtp_port) as server:
                server.starttls()
                server.login(sender_email, sender_password)
                server.send_message(msg)
            
            print(f"✓ Reminder email sent to {assignment.assigned_to_user}")
            return True
            
        except Exception as e:
            print(f"✗ Failed to send email: {str(e)}")
            return False
    
    @staticmethod
    def send_ticket_notification(ticket, action='created'):
        """Send notification about ticket status change"""
        try:
            smtp_server = os.getenv('SMTP_SERVER')
            smtp_port = int(os.getenv('SMTP_PORT', 587))
            sender_email = os.getenv('SMTP_USERNAME')
            sender_password = os.getenv('SMTP_PASSWORD')
            from_email = os.getenv('SENDER_EMAIL')
            
            recipient_email = ticket.assignee.email if ticket.assignee else 'admin@school.local'
            
            subject = f"Ticket {ticket.ticket_number} - {action.upper()}"
            
            body = f"""
            <html>
            <body style="font-family: Arial, sans-serif;">
                <h2>Ticket Notification</h2>
                <p>Ticket <strong>{ticket.ticket_number}</strong> has been {action}.</p>
                
                <table style="border-collapse: collapse; margin: 20px 0;">
                    <tr style="background-color: #f0f0f0;">
                        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Title:</strong></td>
                        <td style="padding: 10px; border: 1px solid #ddd;">{ticket.title}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Priority:</strong></td>
                        <td style="padding: 10px; border: 1px solid #ddd;">{ticket.priority.upper()}</td>
                    </tr>
                    <tr style="background-color: #f0f0f0;">
                        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Status:</strong></td>
                        <td style="padding: 10px; border: 1px solid #ddd;">{ticket.status.replace('_', ' ').upper()}</td>
                    </tr>
                </table>
                
                <p>Please log in to the system to view details and take action.</p>
                
                <p>Best regards,<br>IT Asset Tracking System</p>
            </body>
            </html>
            """
            
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = from_email
            msg['To'] = recipient_email
            
            msg.attach(MIMEText(body, 'html'))
            
            with smtplib.SMTP(smtp_server, smtp_port) as server:
                server.starttls()
                server.login(sender_email, sender_password)
                server.send_message(msg)
            
            print(f"✓ Notification email sent to {recipient_email}")
            return True
            
        except Exception as e:
            print(f"✗ Failed to send email: {str(e)}")
            return False


class RemainderScheduler:
    """Schedule and send reminders for loaner devices"""
    
    @staticmethod
    def check_and_send_reminders():
        """Check for loaners due soon and send reminders"""
        from models import db
        
        now = datetime.utcnow()
        
        # Get loaners due in next 3 days or overdue
        loaners = LoanerAssignment.query.filter(
            LoanerAssignment.returned_date.is_(None),
            LoanerAssignment.due_date <= now + timedelta(days=3)
        ).all()
        
        for loaner in loaners:
            # Check if overdue
            is_overdue = loaner.due_date < now
            
            if is_overdue:
                loaner.is_overdue = True
                db.session.commit()
            
            # Send reminder
            EmailService.send_loaner_reminder(loaner)
    
    @staticmethod
    def check_warranty_expiry():
        """Alert for assets with expiring warranties"""
        from models import Asset
        
        now = datetime.utcnow().date()
        future_date = now + timedelta(days=30)
        
        expiring_assets = Asset.query.filter(
            Asset.warranty_expiry.between(now, future_date)
        ).all()
        
        if expiring_assets:
            print(f"\n⚠️  {len(expiring_assets)} assets have warranties expiring soon")
            for asset in expiring_assets:
                print(f"  - {asset.asset_name} (expires: {asset.warranty_expiry})")


class GoogleAdminHelper:
    """Helper functions for Google Admin API integration"""
    
    @staticmethod
    def sync_devices():
        """Sync devices from Google Admin API"""
        # This would require Google Admin SDK setup
        # Placeholder for future implementation
        print("Google Admin sync not yet configured")
        return False
    
    @staticmethod
    def sync_ous():
        """Sync Organizational Units from Google Admin API"""
        # This would require Google Admin SDK setup
        # Placeholder for future implementation
        print("Google Admin sync not yet configured")
        return False


if __name__ == '__main__':
    # Test email sending
    RemainderScheduler.check_and_send_reminders()
    RemainderScheduler.check_warranty_expiry()

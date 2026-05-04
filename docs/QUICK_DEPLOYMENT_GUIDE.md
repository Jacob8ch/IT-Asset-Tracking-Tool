# Quick Deployment Guide for Schools

## Fastest Way to Get Started (5 Minutes)

### What You Need
- Computer with Docker installed (1 download, ~2 minutes)
- Any web browser
- Basic familiarity with command line

### Step 1: Install Docker
**Windows:** Download "Docker Desktop" from docker.com and run the installer
**Mac:** Download "Docker Desktop" for Mac from docker.com
**Linux:** `sudo apt-get install docker.io docker-compose` (or equivalent for your distro)

### Step 2: Download Project
Download the IT Asset Tracking Tool folder to your computer

### Step 3: Start Application
1. Open Command Prompt/Terminal
2. Navigate to the project folder:
   ```
   cd "C:\path\to\IT Asset Tracking Tool"
   ```
3. Type:
   ```
   docker-compose up -d
   ```
4. Wait 30 seconds for services to start

### Step 4: Log In
1. Open your web browser
2. Go to: `http://localhost`
3. Log in with:
   - **Username:** admin
   - **Password:** admin123

## Your First Steps After Login

### Create a Test Asset
1. Click "Assets" on the left menu
2. Click "Add Asset" button
3. Fill in details:
   - Asset Tag: `LAPTOP-001` (this is the barcode)
   - Asset Name: `Dell Laptop`
   - Type: `Laptop`
4. Click "Create Asset"

### Test Barcode Scanner
1. Click "Scan" on the left menu
2. Type the asset tag you just created: `LAPTOP-001`
3. Click "Manual Lookup"
4. Asset details appear immediately

### Create a Support Ticket
1. Click "Tickets" on the left menu
2. Click "New Ticket"
3. Fill in details:
   - Title: `Screen flickering`
   - Description: `Monitor display has interference`
   - Priority: `High`
4. Click "Create Ticket"

### Assign a Loaner Device
1. First, create another asset (with tag like LOANER-001)
2. Mark it as a loaner (in edit view)
3. Go to "Loaners" section
4. Click "Assign Loaner"
5. Select the broken device, loaner device, and user
6. Set loan duration to 7 days
7. Submit

## Essential Configuration

### Email Setup (For Reminders)
⚠️ **Optional but recommended**

Edit `backend/.env`:

**For Gmail:**
1. Enable 2-factor authentication on your Gmail account
2. Go to https://myaccount.google.com/apppasswords
3. Select "Mail" and "Windows Computer"
4. Copy the 16-character password
5. Paste in `.env`:
   ```
   SMTP_SERVER=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USERNAME=your-email@gmail.com
   SMTP_PASSWORD=your-16-char-password
   SENDER_EMAIL=your-email@gmail.com
   ```

**For Office 365:**
```
SMTP_SERVER=smtp.office365.com
SMTP_PORT=587
SMTP_USERNAME=your-email@school.com
SMTP_PASSWORD=your-password
SENDER_EMAIL=noreply@school.com
```

### Change Admin Password
1. Log in as admin
2. Go to Admin panel (bottom of sidebar)
3. Create new users
4. Change admin password immediately

## Troubleshooting

### "Cannot connect"
- Restart Docker: `docker-compose restart`
- Check Docker is running
- Wait 60 seconds for database to initialize

### "Port 80 already in use"
Edit `docker-compose.yml`, change `80:80` to `8080:80`, then access at `http://localhost:8080`

### "Cannot login"
- Clear browser cache (Ctrl+Shift+Delete in Chrome)
- Try different browser
- Check browser console for errors (F12)

### "Database error"
```bash
# Reset everything
docker-compose down -v
docker-compose up -d
```

## Daily Operations

### Backup Your Data
```bash
# Every week or before major changes
docker-compose exec postgres pg_dump -U admin asset_tracker > backup_$(date +%Y%m%d).sql
```

### View System Health
```bash
# Check all containers are running
docker-compose ps

# View any errors
docker-compose logs --tail=50
```

### Stop the System
```bash
docker-compose down
```

### Start the System
```bash
docker-compose up -d
```

## User Management

### Add New User
1. Go to Admin panel
2. (Admin user creation would be done via admin panel or API)
3. Share username/password with user
4. User logs in and changes password

### User Roles
- **Admin**: Full access, can manage users
- **Technician**: Can manage assets and tickets
- **Viewer**: Can only view information (read-only)

## Reports & Statistics

All data visible in Dashboard:
- Total assets
- Assets in repair
- Active loaners
- Open tickets
- System alerts

## Advanced Setup

### SSL/HTTPS (For Production)
If connecting from the internet, set up HTTPS:
1. Get SSL certificate (free from letsencrypt.org)
2. Place certificate in `ssl/` folder
3. Update `nginx.conf` with certificate paths
4. Restart: `docker-compose restart`

### Database Backups Automation
On Windows Task Scheduler:
```batch
cd "C:\path\to\IT Asset Tracking Tool"
docker-compose exec -T postgres pg_dump -U admin asset_tracker > backups\backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%.sql
```

### Google Admin Integration
Optional - syncs devices from your Google Workspace:
1. Create Google Cloud Project
2. Enable Admin SDK API
3. Configure in `backend/.env`
4. Admin can trigger sync from admin panel

## Getting Help

1. **Check logs for errors:**
   ```bash
   docker-compose logs backend
   docker-compose logs frontend
   ```

2. **Restart services:**
   ```bash
   docker-compose restart
   ```

3. **Reset everything (WARNING - deletes all data):**
   ```bash
   docker-compose down -v
   docker-compose up -d
   ```

4. **Check system status:**
   - Open http://localhost
   - Check Dashboard for alerts
   - Go to Admin panel to verify database connection

## Common Tasks

### Add 50 Laptops to Inventory
1. Create them manually through UI, OR
2. Use the API to bulk create (curl/Postman)

### Export Asset List
Use Dashboard → Assets → Export (not implemented yet, manual CSV export available)

### Print Asset Labels
Assets page has print functionality - select assets and print with QR codes

### Email Loaner Reminders to Users
Automatic - configured through SMTP settings
Users in "Loaners" get emails 3 days before due date

## Security Notes

⚠️ **IMPORTANT FOR SCHOOLS:**

1. **Change default password immediately**
   - Default: admin/admin123
   - This is only for initial setup

2. **Use strong passwords**
   - Minimum 12 characters
   - Mix of letters, numbers, symbols

3. **Run on school network only**
   - Don't expose to internet without HTTPS
   - Use network firewall

4. **Regular backups**
   - Weekly backups recommended
   - Store in safe location
   - Test restore procedures

5. **Limit admin access**
   - Give admin role only to IT staff
   - Most users should be "Technician" or "Viewer"

6. **Keep software updated**
   - Monthly: `docker pull` to get latest images
   - Read release notes before updating

## Support

For detailed documentation, see: `SETUP_AND_USER_GUIDE.md`

For API documentation, see: `README.md`

## Next Steps After Setup

1. ✅ Test basic functionality
2. ✅ Set up email reminders
3. ✅ Create sample users
4. ✅ Scan a device with barcode
5. ✅ Create sample ticket
6. ✅ Set up regular backups
7. ✅ Plan data migration (if you have legacy data)

---

**Total Setup Time:** 5-10 minutes  
**Technical Knowledge Required:** Minimal  
**Support Available:** Yes - see documentation

**Version:** 1.0.0  
**Updated:** 2026-05-03

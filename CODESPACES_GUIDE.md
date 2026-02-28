# 🚀 GitHub Codespaces Setup Guide

This guide explains how to run the **Alburhan Classroom** application in GitHub Codespaces.

## ✅ Prerequisites

- GitHub account with access to the repository
- GitHub Codespaces enabled (available on Pro/Team/Enterprise plans, or free with limited hours)

## 📖 Step 1: Open in Codespaces

### Option A: From GitHub Web UI
1. Go to the repository: [Call-Application](https://github.com/MudassirABBASSi/Call-Appilcation-.git)
2. Click the **Code** button (green button)
3. Click the **Codespaces** tab
4. Click **Create codespace on master**
5. Wait for the environment to load (2-3 minutes)

### Option B: Direct Links
```
https://github.com/codespaces/new?repo=MudassirABBASSi/Call-Application-
```

## 🛠️ Step 2: Install Dependencies

Once Codespaces loads, open a terminal and run:

### Install Backend Dependencies
```bash
cd backend
npm install
```

### Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

## 🗄️ Step 3: Set Up the Database

Codespaces comes with MySQL pre-installed. Start the MySQL service:

```bash
# Start MySQL service
sudo service mysql start

# Verify it's running
sudo service mysql status
```

Create the database:

```bash
cd ../backend
mysql -u root < database.sql
```

## ⚙️ Step 4: Configure Environment Variables

Create a `.env` file in the `backend` folder:

```bash
cd backend
cat > .env << EOF
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=alburhan_classroom
JWT_SECRET=your_jwt_secret_key_here
EOF
```

**Note:** Leave `DB_PASSWORD` empty (MySQL root user has no password in Codespaces by default).

## 🚀 Step 5: Start Both Servers

You'll need **two terminals** in Codespaces.

### Terminal 1: Start Backend

```bash
cd backend
npm start
```

You should see: `Server running on port 5000`

### Terminal 2: Start Frontend

```bash
cd frontend
npm start
```

You should see: `Compiled successfully! ... You can now view your-app in the browser`

## 🌐 Step 6: Access the Application

Once both servers are running, Codespaces will show a **notification** with port forwarding options:

1. For **Frontend** (React at port 3000):
   - Click the port 3000 notification
   - Or go to the **Ports** tab and click the forwarded URL
   - The app will open in your browser

2. For **Backend** (API at port 5000):
   - Available at the port 5000 forwarded URL
   - Used internally by the frontend

## 👤 Default Login Credentials

Once the app loads:

**Admin Account:**
- **Email:** admin@alburhan.com
- **Password:** admin123

**Then create Teachers and Students through the Admin panel.**

## 🎥 Using Jitsi Video

The application uses **Jitsi Meet** for video conferencing. Since you're in Codespaces (hosted remotely), video conferencing will work perfectly across the internet.

## 🛑 Stopping Services

To stop the servers:
- Press `Ctrl + C` in each terminal

To stop MySQL:
```bash
sudo service mysql stop
```

## 📱 Creating Test Data

1. Login as **Admin**
2. Go to **Manage Teachers** → Add a teacher
3. Go to **Manage Students** → Add a student
4. Edit the student → Assign to a teacher
5. Go to **Manage Classes** → Create a class
6. Login as the teacher and assign students to classes
7. Create assignments from the Teacher Dashboard

## ⚡ Performance Tips

- Codespaces runs on GitHub's servers, so performance is decent
- For heavy video conferencing, ensure your internet connection is stable
- Keep the Codespaces tab open while running classes

## 🐛 Troubleshooting

### MySQL Connection Failed
```bash
sudo service mysql restart
```

### Port Already in Use
Change the port in `backend/.env` and restart:
```
PORT=5001
```

### Node Modules Issue
```bash
rm -rf node_modules package-lock.json
npm install
```

### Database Issues
```bash
mysql -u root
DROP DATABASE alburhan_classroom;
exit

mysql -u root < database.sql
```

## 🔄 Restarting Codespaces

If you close and reopen Codespaces:

```bash
# Start MySQL
sudo service mysql start

# Start both servers in separate terminals
cd backend && npm start
# In another terminal
cd frontend && npm start
```

## 💡 Useful Codespaces Features

- **VS Code Extensions:** Install the same extensions you use locally
- **Sync Settings:** Your VS Code settings sync automatically
- **Port Forwarding:** Public URLs for testing
- **Terminal Multiplexing:** Open multiple terminals with `Ctrl + Shift + ` (backtick)

## 📚 Learn More

- [GitHub Codespaces Documentation](https://docs.github.com/en/codespaces)
- [VS Code in Codespaces](https://code.visualstudio.com/remote/remote-overview#_codespaces)

---

**Happy coding! 🎉**

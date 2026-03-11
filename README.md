# Email-based OTP Authentication System

A secure, production-ready email-based One-Time Password (OTP) authentication system built with Node.js/Express and deployed on Vercel.

## 📁 Project Structure

```
.
├── backend/                          # Backend API (Node.js + Express)
│   ├── server.js                    # Express server with OTP logic
│   ├── automation.js                # Testing automation script
│   ├── package.json                 # Backend dependencies
│   ├── .env.example                 # Environment variables template
│   └── README.md                    # Backend documentation
├── frontend/                         # Frontend UI (HTML + CSS + JS)
│   ├── public/
│   │   ├── login.html               # Email entry page
│   │   ├── verify.html              # OTP verification page
│   │   ├── success.html             # Success celebration page
│   │   └── style.css                # Styles with dark/light theme
│   └── README.md                    # Frontend documentation
├── package.json                     # Root package.json
├── vercel.json                      # Vercel deployment config
├── .gitignore                       # Git ignore rules
└── README.md                        # This file
```

## ✨ Features

- **Email-based Login**: Users enter their email to receive a 6-digit OTP
- **OTP Generation**: Securely generates random OTP codes
- **Email Delivery**: Sends OTP via Gmail's SMTP service
- **OTP Verification**: Validates OTP with instant feedback
- **Theme Toggle**: Dark/Light mode with persisted preference
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Glassmorphism UI**: Modern design with backdrop blur effects

## 🚀 Quick Start

### Local Development

1. **Clone and install**
```bash
git clone <your-repo>
cd Email-based-OTP-authentication-system
npm install
cd backend && npm install && cd ..
```

2. **Configure environment**
```bash
cd backend
cp .env.example .env
# Edit .env with your Gmail credentials
```

3. **Start the server**
```bash
npm start
```

Server runs on `http://localhost:3000`

### Deploy to Vercel

1. **Push to GitHub**
```bash
git add .
git commit -m "Separate frontend and backend structure"
git push origin main
```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Select your repository
   - Vercel auto-detects the setup
   - Add environment variables:
     - `EMAIL_USER`: Your Gmail address
     - `EMAIL_PASS`: Your Gmail App Password
   - Click Deploy

## 🔐 Gmail Setup (Required)

1. **Enable 2-Factor Authentication** on your Google Account
2. **Generate App Password**:
   - Visit [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and "Windows Computer" (or your OS)
   - Copy the generated 16-character password
3. **Set Environment Variables**:
   - `EMAIL_USER` = your Gmail address (e.g., yourname@gmail.com)
   - `EMAIL_PASS` = the 16-character App Password (without spaces)

## 📝 API Routes

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/` | Serves login page |
| POST | `/send-otp` | Generates and emails OTP |
| POST | `/verify-Otp` | Verifies the entered OTP |
| GET | `/test-email` | Tests email configuration |

## 🏗️ Architecture

**Frontend** → **Backend**
- Frontend serves static HTML/CSS/JS (no build needed)
- Backend handles OTP logic, email delivery, and verification
- Vercel runs both simultaneously
- Static files served with proper routing
- API endpoints handle form submissions

## 📦 Dependencies

**Backend Package:**
- `express@^5.2.1` - Web framework
- `nodemailer@^8.0.2` - Email service
- `dotenv@^17.3.1` - Environment variables
- `googleapis@^171.4.0` - Google Sheets API (optional)
- `playwright@^1.58.2` - Browser automation (testing)

## ⚠️ Important Notes

- **OTP Storage**: Currently stored in memory (resets on server restart)
  - For production: Use database (MongoDB, PostgreSQL, etc.)
- **Session Management**: No session tracking currently
  - For production: Add session persistence
- **.env Security**: Never commit `.env` to Git
  - Use `.env.example` as template for others
- **Deployment**: `vercel.json` configured for automatic builds

## 🧪 Testing

Run the automated test:
```bash
cd backend
node automation.js
```

Opens browser and completes the full OTP flow automatically.

## ✅ Checklist for Production

- [ ] Add database for persistent OTP storage
- [ ] Implement rate limiting on `/send-otp`
- [ ] Add email templates instead of plain text
- [ ] Set OTP expiration time (currently: no limit)
- [ ] Add CSRF protection
- [ ] Use HTTPS (automatic on Vercel)
- [ ] Monitor email delivery failures
- [ ] Set up error logging (e.g., Sentry)
- [ ] Add security headers
- [ ] Test with real Gmail accounts

## 🔧 Troubleshooting

**"Failed to send OTP"**
- Check `EMAIL_USER` and `EMAIL_PASS` in environment variables
- Verify Gmail App Password is correct (16 chars, no spaces)
- Test with `/test-email` endpoint

**UI Not Loading**
- Verify `vercel.json` routes are correct
- Check browser console for errors (F12)
- Review Vercel deployment logs

**OTP Not Received**
- Check spam folder
- Verify email address is typed correctly
- Test transporter configuration

## 📄 License

ISC

1. User enters their email address on the login page
2. System generates a 6-digit OTP
3. OTP is sent to the user's email via Gmail API
4. User enters the received OTP on the verification page
5. System validates the OTP and grants access

## Setup Instructions

### Prerequisites

- Node.js installed
- Gmail account
- Google Cloud Project with Gmail API enabled

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd emailAutomation
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Google OAuth2 credentials:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Gmail API
   - Create OAuth 2.0 credentials
   - Download credentials and save as `credentials.json` in the project root

4. Generate access token:
   ```bash
   node getToken.js
   ```
   - Follow the URL provided
   - Authorize the application
   - Paste the code back in terminal
   - `token.json` will be generated

5. Start the server:
   ```bash
   node server.js
   ```

6. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

## Project Structure

```
emailAutomation/
├── server.js           # Main server file
├── getToken.js         # OAuth token generation script
├── credentials.json    # Google OAuth2 credentials (not in repo)
├── token.json          # Generated access token (not in repo)
├── package.json        # Dependencies
└── public/
    ├── login.html      # Login page
    └── verify.html     # OTP verification page
```

## Security Notes

⚠️ **Important**: Never commit sensitive files to your repository:
- `credentials.json`
- `token.json`
- `.env`

Add these to your `.gitignore` file.

## License

MIT License

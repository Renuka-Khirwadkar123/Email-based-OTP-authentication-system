# Email OTP Authentication System

A simple and secure email-based OTP (One-Time Password) authentication system built with Node.js and Express.

## Features

- **Email-based Login**: Users enter their email address to receive an OTP
- **OTP Generation**: Automatically generates 6-digit random OTP codes
- **Email Delivery**: Sends OTP via email using Gmail API
- **OTP Verification**: Validates the OTP entered by users
- **Responsive UI**: Clean login and verification pages

## Tech Stack

- **Backend**: Node.js, Express.js
- **Email Service**: Gmail API with OAuth2 authentication
- **Frontend**: HTML, CSS, JavaScript

## How It Works

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

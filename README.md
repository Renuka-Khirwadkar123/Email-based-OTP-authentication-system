# Email-based OTP Authentication System

This project implements a simple email-based One-Time Password (OTP) authentication demo with end-to-end automation. The repo includes static frontend pages, serverless API endpoints (for sending and verifying OTPs), and Playwright automation that validates the full flow by reading OTP emails from Gmail.

Overview
- Frontend: static HTML/CSS/JS under `public/`.
- API: serverless endpoints in `api/` for `send-otp` and `verify-otp`.
- Automation: Playwright tests and Gmail helpers in `automation_scripts/`.

Tech stack
- Node.js for API and helper scripts
- Playwright (`@playwright/test`) for browser automation
- Google APIs (`googleapis`) for reading Gmail (automation only)

What is implemented
- A minimal OTP flow: user submits email → backend generates a 6-digit OTP → backend sends OTP by email → user enters OTP → backend verifies.
- Playwright-based automation that:
	1. Opens the login page and requests an OTP
	2. Polls the test Gmail inbox for the OTP email
	3. Extracts the OTP and completes verification
	4. Asserts that the success page is shown

Folder layout (what to find where)
- `api/` — serverless endpoints (send/verify OTP)
- `public/` — static frontend: `login.html`, `verify.html`, `success.html`, `style.css`
- `automation_scripts/` — Playwright tests and Gmail helper utilities (`gmailUtility.js`, `otp_automation.js`)
- `getToken.js` — interactive script to create `token.json` (OAuth token for Gmail reads)
- `playwright.config.js` — Playwright configuration
- `.gitignore` — ignores `node_modules`, `credentials.json`, `token.json`, `.env`, Playwright artifacts, etc.

Quick start (developer)
1. Install:
```bash
npm install
```

2. If you will run the Playwright automation, prepare Gmail access:
- Enable Gmail API in your Google Cloud project.
- Create OAuth credentials and download `credentials.json` to the project root (do not commit).
- Run the token helper and follow the URL to authorize the test Gmail account:
```bash
node getToken.js
```
This will create `token.json` that the automation uses to read OTP emails.

3. Run Playwright automation:
```bash
npx playwright test --config=playwright.config.js
```

Notes and tips
- `token.json` must be generated with the same OAuth client (`credentials.json`) and authorized using the same Gmail account the test expects.
- If you get Gmail API errors about project/API access or `invalid_grant`, verify:
	- Gmail API is enabled for the correct Cloud project
	- The OAuth client and refresh token belong to the same project and user
	- The test Gmail account is added to OAuth consent Test Users if required
- For simple email sending (not automation), you can use SMTP and an App Password instead of the Gmail API.
- Keep secrets out of the repository: `credentials.json`, `token.json`, and any `.env` should remain local and are listed in `.gitignore`.

Commands summary
```bash
npm install
node getToken.js   # interactive: open URL, authorize, paste code
npx playwright test --config=playwright.config.js
```

Troubleshooting
- OTP not received: check spam folder and API logs; ensure the test Gmail account matches `token.json`.
- Gmail API errors: enable API for the correct project and regenerate `token.json` using `node getToken.js`.

License
MIT
--

If you want, I can: update `automation_scripts/otp_automation.js` to print the authorization URL automatically, or run `node getToken.js` and help paste the code here (you must paste the code from your browser). Which do you prefer? 

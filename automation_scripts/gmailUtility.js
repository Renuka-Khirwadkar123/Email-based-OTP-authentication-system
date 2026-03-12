"use strict";

// ============================================================================
// Dependencies
// ============================================================================
const { google } = require("googleapis");

// ============================================================================
// Gmail API Configuration
// ============================================================================
/**
 * OAuth2 credentials for Gmail API access
 * To generate a new refresh token:
 * 1. Visit https://developers.google.com/oauthplayground
 * 2. Enable "Use your own OAuth credentials"
 * 3. Enter CLIENT_ID and CLIENT_SECRET
 * 4. Select Gmail API v1 scope: https://mail.google.com/
 * 5. Authorize with renuka.khirwadkarr@gmail.com
 * 6. Exchange authorization code for tokens
 * 7. Copy the new refresh_token value
 */
const fs = require('fs');
const path = require('path');

// Prefer environment variables or token.json over hard-coded values.
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

// Load refresh token from token.json if available (preferred)
let REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN || null;
const tokenPath = path.join(__dirname, '..', 'token.json');
let tokenData = null;
if (fs.existsSync(tokenPath)) {
    try {
        tokenData = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
        if (tokenData.refresh_token) REFRESH_TOKEN = tokenData.refresh_token;
    } catch (e) {
        // ignore parse errors
    }
}

// ============================================================================
// Initialize Gmail API Client
// ============================================================================
const auth = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
if (tokenData) {
    auth.setCredentials(tokenData);
} else if (REFRESH_TOKEN) {
    auth.setCredentials({ refresh_token: REFRESH_TOKEN });
}

const gmail = google.gmail({ version: 'v1', auth });

// ============================================================================
// Core Email Functions - Internal
// ============================================================================

/**
 * Polls Gmail inbox for an email matching the specified subject
 * Checks every 5 seconds until timeout or email is found
 * 
 * @param {string} subjectText - Text to match in email subject line
 * @param {number} timeout - Maximum wait time in milliseconds (default: 120000)
 * @param {number|null} cutoffTime - Only accept emails after this timestamp (default: null)
 * @returns {Promise<{body: string, messageId: string}>} Email body and message ID
 * @throws {Error} If email not received within timeout period
 */

async function waitForEmail(subjectText, timeout = 120000, cutoffTime = null) {

    const startTime = Date.now();
    let attemptCount = 0;

    // Poll until timeout is reached
    while (Date.now() - startTime < timeout) {

        attemptCount++;
        console.log(`[Attempt ${attemptCount}] Checking for email with subject: "${subjectText}"`);

        // Fetch most recent 20 emails from inbox
        const messages = await gmail.users.messages.list({
            userId: "me",
            maxResults: 20,
        });

        if (!messages.data.messages) {
            console.log("No messages found in inbox");
            await sleep(5000);
            continue;
        }

        console.log(`Found ${messages.data.messages.length} messages in inbox`);

        // Check each message for matching subject
        for (const msg of messages.data.messages) {

            // Get full message details including headers and body
            const fullMsg = await gmail.users.messages.get({
                userId: "me",
                id: msg.id,
                format: 'full'
            });

            // Extract subject from email headers
            const subject = fullMsg.data.payload.headers.find(
                h => h.name === "Subject"
            )?.value;

            // Get email timestamp
            const messageTime = parseInt(fullMsg.data.internalDate);

            console.log(`Checking email: "${subject}" from ${new Date(messageTime).toISOString()}`);

            // Skip emails older than cutoff time if provided
            if (cutoffTime && messageTime < cutoffTime) {
                console.log(`❌ Skipping old email: ${subject} (${new Date(messageTime).toISOString()} < ${new Date(cutoffTime).toISOString()})`);
                continue;
            }

            // Check if subject matches
            if (subject && subject.includes(subjectText)) {

                // Extract email body content
                const body = extractBody(fullMsg.data.payload);
                
                if (body) {
                    console.log(`✅ Found matching email: ${subject} from ${new Date(messageTime).toISOString()}`);
                    return {
                        body,
                        messageId: msg.id
                    };
                }
            }
        }

        console.log(`No matching email found. Waiting 5 seconds before retry...`);
        // Wait 5 seconds before checking again
        await sleep(5000);
    }

    throw new Error(`Email not received after ${timeout/1000}s: "${subjectText}"`);
}


// ============================
// Extract HTML body
// ============================
// Recursively extracts all text and HTML content from email payload
// Handles multipart emails with nested structures

function extractBody(payload) {

    if (!payload)
        return null;

    let allTextParts = [];

    // Case 1: Extract direct body content if available
    if (payload.body && payload.body.data) {

        try {
            const text = Buffer
                .from(payload.body.data, "base64")
                .toString("utf8");
            allTextParts.push(text);
        }
        catch (e) {
            // ignore decoding errors
        }
    }

    // Case 2: Process multipart email structures
    if (payload.parts && payload.parts.length) {

        for (const part of payload.parts) {

            // Extract HTML parts (preferred for rich content)
            if (part.mimeType === "text/html" && part.body?.data) {

                try {
                    const html = Buffer
                        .from(part.body.data, "base64")
                        .toString("utf8");
                    allTextParts.push(html);
                }
                catch (e) {}
            }

            // Extract plain text parts (fallback)
            if (part.mimeType === "text/plain" && part.body?.data) {

                try {
                    const text = Buffer
                        .from(part.body.data, "base64")
                        .toString("utf8");
                    allTextParts.push(text);
                }
                catch (e) {}
            }

            // Recursively search nested parts (important for complex SAP emails)
            const nested = extractBody(part);

            if (nested)
                allTextParts.push(nested);
        }
    }

    // Combine all text parts with separators
    return allTextParts.length > 0 ? allTextParts.join('\n\n') : null;
}

// ============================
// Decode Microsoft SafeLinks
// ============================
// Extracts the actual URL from Microsoft SafeLinks wrapper
// SafeLinks format: https://...safelinks.protection.outlook.com/?url=ENCODED_URL

function decodeSafeLink(link) {

    // Extract URL parameter from SafeLink
    const match = link.match(/url=([^&]+)/);

    if (!match)
        return link;

    // Decode the URL-encoded actual link
    return decodeURIComponent(match[1]);
}


// ============================
// Extract link from email
// ============================
// Finds and extracts the first URL from email body
// Handles both SafeLinks and direct URLs

function extractLink(body) {

    if (!body) {
        throw new Error("Email body is empty or null");
    }

    // First try to find Microsoft SafeLinks (they wrap the actual URL)
    const safeLinkMatch =
        body.match(/https:\/\/.*?safelinks\.protection\.outlook\.com[^\s"]+/);

    if (safeLinkMatch) {
        return decodeSafeLink(safeLinkMatch[0]);
    }

    // Fallback: find any regular URL
    const normalMatch =
        body.match(/https?:\/\/[^\s"]+/);

    return normalMatch ? normalMatch[0] : null;
}


// ============================
// Extract OTP
// ============================
// Extracts 6-digit OTP from SAP Business Network email
// Pattern: "Your One Time Password (OTP) is : 123456"
// Handles both plain text and HTML with <b> tags

function extractOTP(body) {

    if (!body)
        throw new Error("Email body empty");

    // Log email body for debugging
    console.log("=== EMAIL BODY START ===");
    console.log(body);
    console.log("=== EMAIL BODY END ===");

    // Try multiple OTP patterns to handle different email formats
    const patterns = [
        // Pattern 1: "Your One Time Password (OTP) is : 123456" or with <b> tags
        /Your One Time Password \(OTP\) is\s*:\s*(?:<b>)?(\d{6})(?:<\/b>)?/i,
        
        // Pattern 2: "OTP is: 123456" or "OTP: 123456"
        /OTP\s*(?:is)?\s*:\s*(?:<b>)?(\d{6})(?:<\/b>)?/i,
        
        // Pattern 3: "verification code is 123456"
        /verification code\s*(?:is)?\s*:\s*(?:<b>)?(\d{6})(?:<\/b>)?/i,
        
        // Pattern 4: Just find any 6 consecutive digits
        /\b(\d{6})\b/
    ];

    for (let i = 0; i < patterns.length; i++) {
        console.log(`Trying OTP pattern ${i + 1}...`);
        const match = body.match(patterns[i]);
        
        if (match) {
            console.log(`OTP found using pattern ${i + 1}:`, match[1]);
            return match[1];
        }
    }

    throw new Error("OTP not found in email body with any pattern");
}

// ============================
// Delete email
// ============================

async function deleteEmail(messageId) {

    await gmail.users.messages.delete({
        userId: "me",
        id: messageId,
    });
}


// // ============================
// // Public functions
// // ============================


// // ============================
// // Get Invitation Link
// // ============================
// // Retrieves supplier invitation link from "You're Invited" email
// // Used during supplier registration flow
// async function getInvitationLink() {

//     // Wait for invitation email
//     const result =
//         await waitForEmail("You're Invited");

//     // Extract the invitation URL
//     const link =
//         extractLink(result.body);

//     // Clean up - delete the email
//     await deleteEmail(result.messageId);

//     return link;
// }


// // ============================
// // Get Sign-in Link
// // ============================
// // Retrieves sign-in link from welcome email
// async function getSignInLink() {

//     // Wait for welcome email
//     const result =
//         await waitForEmail("Welcome to SAP Business Network");

//     // Extract the sign-in URL
//     const link =
//         extractLink(result.body);

//     // Clean up - delete the email
//     await deleteEmail(result.messageId);

//     return link;
// }


// // ============================
// // Clean Up Old OTP Emails
// // ============================
// // Deletes all existing OTP emails to prevent picking up stale OTPs
// // Returns timestamp to use as cutoff for new email acceptance
// // async function cleanupOldOTPEmails() {
    
// //     console.log("Cleanup is disabled - skipping OTP email deletion");
    
// //     // // Search for all OTP emails in inbox
// //     // const existingEmails = await gmail.users.messages.list({
// //     //     userId: "me",
// //     //     maxResults: 20,
// //     //     q: 'subject:"Action required: Your One Time Password"'
// //     // });

// //     // // Delete each old OTP email
// //     // if (existingEmails.data.messages) {
// //     //     console.log(`Deleting ${existingEmails.data.messages.length} old OTP email(s)...`);
// //     //     for (const msg of existingEmails.data.messages) {
// //     //         await deleteEmail(msg.id);
// //     //     }
// //     //     console.log("Waiting 5 seconds for deletions to complete...");
// //     //     await sleep(5000); // Allow Gmail to process deletions
// //     // }
    
// //     // Return current timestamp - only emails after this will be accepted
// //     return Date.now();
// // }

// ============================
// Get OTP
// ============================
// Retrieves 6-digit OTP from email
// Uses cutoff time to ensure only fresh OTPs are accepted
async function getOTP() {

    console.log("Waiting for new OTP email...");
    
    // Set cutoff time - only accept emails after cleanup or last 30 seconds
    const cutoffTime = Date.now() - 30000;
    console.log(`Only accepting emails after: ${new Date(cutoffTime).toISOString()}`);
    
    // Wait for OTP email (newer than cutoff time)
    const result = await waitForEmail("Your OTP Code", 120000, cutoffTime);

    // Extract the 6-digit OTP
    let otp = extractOTP(result.body);

    // Clean up - delete the email
    await deleteEmail(result.messageId);

    return otp;
}


// helper
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


module.exports = {

    // getInvitationLink,
    // getSignInLink,
    getOTP

};
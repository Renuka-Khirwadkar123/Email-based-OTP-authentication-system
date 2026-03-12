/**
 * Run this ONCE to generate token.json:
 *   node getToken.js
 */
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
require('dotenv').config();

const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');
const TOKEN_PATH = path.join(__dirname, 'token.json');
const SCOPES = ['https://mail.google.com/'];

function getClient() {
    const raw = fs.readFileSync(CREDENTIALS_PATH, 'utf8');
    const src = JSON.parse(raw);
    const creds = src.installed || src.web;
    const redirect = creds.redirect_uris?.find(u => u.includes('localhost'))
        || creds.redirect_uris?.[0]
        || 'urn:ietf:wg:oauth:2.0:oob';
    return new google.auth.OAuth2(creds.client_id, creds.client_secret, redirect);
}

async function run() {
    const client = getClient();
    const url = client.generateAuthUrl({ access_type: 'offline', scope: SCOPES, prompt: 'consent' });

    console.log('\n=== Open this URL in your browser ===\n');
    console.log(url);
    console.log('\n=====================================\n');

    const readline = require('readline');
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const code = await new Promise(res => rl.question('Paste the code here: ', ans => { rl.close(); res(ans.trim()); }));

    const { tokens } = await client.getToken(code);
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
    console.log('\n✅ token.json saved at', TOKEN_PATH);
    console.log('refresh_token:', tokens.refresh_token ? '(present)' : '⚠️  MISSING');
}

run().catch(e => { console.error(e.message); process.exit(1); });

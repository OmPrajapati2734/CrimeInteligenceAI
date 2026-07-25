/**
 * Zoho Catalyst OAuth Token Generator
 * Run this ONCE to generate your refresh token.
 * Usage: node generate-token.js
 */

require('dotenv').config({ path: '.env' });
const http = require('http');
const https = require('https');
const { exec } = require('child_process');
const querystring = require('querystring');
const fs = require('fs');
const path = require('path');

const CLIENT_ID     = process.env.CATALYST_CLIENT_ID;
const CLIENT_SECRET = process.env.CATALYST_CLIENT_SECRET;
const REDIRECT_URI  = 'http://localhost:9005';
const DC_DOMAIN     = 'accounts.zoho.in';

const SCOPES = [
    'ZohoCatalyst.tables.ALL',
    'ZohoCatalyst.tables.rows.ALL',
    'ZohoCatalyst.tables.columns.ALL',
    'ZohoCatalyst.tables.bulk.CREATE',
    'ZohoCatalyst.tables.bulk.READ',
    'ZohoCatalyst.functions.ALL',
    'ZohoCatalyst.functions.EXECUTE',
    'ZohoCatalyst.mlkit.READ',
    'QuickML.deployment.READ',
    'ZohoCatalyst.zcql.CREATE',
    'ZohoCatalyst.projects.ALL',
    'ZohoCatalyst.folders.ALL',
    'ZohoCatalyst.files.CREATE',
    'ZohoCatalyst.files.READ',
    'ZohoCatalyst.files.DELETE',
    'AaaServer.profile.READ',
    'profile.userphoto.READ',
].join(',');

const AUTH_URL = `https://${DC_DOMAIN}/oauth/v2/auth?` + querystring.stringify({
    response_type: 'code',
    client_id:     CLIENT_ID,
    scope:         SCOPES,
    redirect_uri:  REDIRECT_URI,
    access_type:   'offline',
    prompt:        'consent',
});

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  Zoho Catalyst OAuth Refresh Token Generator');
console.log('  CrimeInteligenceAI Project — KSP Datathon 2026');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('Step 1: Opening Zoho authorization page in your browser...');
console.log('        (Log in with: omprajapati2734@gmail.com)\n');

// Open the browser
const openCmd = process.platform === 'win32' ? `start "${AUTH_URL}"` : `open "${AUTH_URL}"`;
exec(openCmd);

// Start local callback server on port 9005
const server = http.createServer(async (req, res) => {
    const urlParams = new URL(req.url, 'http://localhost:9005');
    const code = urlParams.searchParams.get('code');
    const error = urlParams.searchParams.get('error');

    if (error) {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end(`<h2>Error: ${error}</h2><p>Close this window and try again.</p>`);
        console.error('\n❌ Authorization failed:', error);
        server.close();
        return;
    }

    if (!code) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<h2>Waiting for authorization...</h2>');
        return;
    }

    console.log('\nStep 2: Authorization code received. Exchanging for tokens...');

    // Exchange code for access + refresh tokens
    const postData = querystring.stringify({
        grant_type:    'authorization_code',
        client_id:     CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri:  REDIRECT_URI,
        code:          code,
    });

    const options = {
        hostname: DC_DOMAIN,
        path:     '/oauth/v2/token',
        method:   'POST',
        headers: {
            'Content-Type':   'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData),
        },
    };

    const tokenReq = https.request(options, (tokenRes) => {
        let data = '';
        tokenRes.on('data', (chunk) => { data += chunk; });
        tokenRes.on('end', () => {
            try {
                const tokens = JSON.parse(data);

                if (tokens.error) {
                    res.writeHead(400, { 'Content-Type': 'text/html' });
                    res.end(`<h2>Token Error: ${tokens.error}</h2><p>${tokens.error_description || ''}</p>`);
                    console.error('\n❌ Token exchange failed:', tokens);
                    server.close();
                    return;
                }

                const refreshToken = tokens.refresh_token;
                const accessToken  = tokens.access_token;

                console.log('\n✅ SUCCESS! Refresh Token Generated:\n');
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                console.log('REFRESH TOKEN:', refreshToken);
                console.log('ACCESS TOKEN :', accessToken);
                console.log('TOKEN TYPE   :', tokens.token_type);
                console.log('API DOMAIN   :', tokens.api_domain);
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

                // Auto-update .env file
                const envPath = path.resolve(__dirname, '.env');
                let envContent = fs.readFileSync(envPath, 'utf8');
                envContent = envContent.replace(
                    /CATALYST_REFRESH_TOKEN=.*/,
                    `CATALYST_REFRESH_TOKEN=${refreshToken}`
                );
                fs.writeFileSync(envPath, envContent, 'utf8');

                console.log('✅ .env file updated automatically with the refresh token!');
                console.log('\nStep 3: Verifying Catalyst connection...\n');

                // Show success page
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Zoho Catalyst Connected!</title>
                        <style>
                            body { font-family: Arial, sans-serif; max-width: 600px; margin: 80px auto; text-align: center; color: #143D73; }
                            .success { background: #e8f5e9; border: 2px solid #4caf50; border-radius: 12px; padding: 32px; }
                            .token { background: #f5f5f5; padding: 12px; border-radius: 8px; font-family: monospace; font-size: 12px; word-break: break-all; margin-top: 16px; }
                            h1 { color: #4caf50; }
                        </style>
                    </head>
                    <body>
                        <div class="success">
                            <h1>✅ Zoho Catalyst Connected!</h1>
                            <p><strong>CrimeInteligenceAI</strong> is now authorized.</p>
                            <p>The refresh token has been saved to your <code>.env</code> file automatically.</p>
                            <div class="token"><strong>Refresh Token:</strong><br>${refreshToken}</div>
                            <p style="margin-top:24px; color:#666;">You can close this browser tab now.</p>
                        </div>
                    </body>
                    </html>
                `);

                server.close();

            } catch (err) {
                console.error('❌ Failed to parse token response:', err.message, data);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal error: ' + err.message);
                server.close();
            }
        });
    });

    tokenReq.on('error', (e) => {
        console.error('❌ Request error:', e.message);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Request error: ' + e.message);
        server.close();
    });

    tokenReq.write(postData);
    tokenReq.end();
});

server.listen(9005, () => {
    console.log('Step 1: Waiting for browser authorization on http://localhost:9005...');
    console.log('        (The browser should have opened automatically)');
    console.log('\n        If it did not open, paste this URL in your browser:');
    console.log(`        ${AUTH_URL}\n`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error('❌ Port 9005 is already in use. Close any other running process and try again.');
    } else {
        console.error('❌ Server error:', err.message);
    }
    process.exit(1);
});

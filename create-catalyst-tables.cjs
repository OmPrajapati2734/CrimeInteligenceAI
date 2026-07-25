/**
 * Zoho Catalyst Table Creator Utility
 * Automatically creates all tables defined in schemas.json on your live Catalyst environment.
 * Usage: node create-catalyst-tables.cjs
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

// Load environment variables
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const CLIENT_ID = process.env.CATALYST_CLIENT_ID;
const CLIENT_SECRET = process.env.CATALYST_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.CATALYST_REFRESH_TOKEN;
const PROJECT_ID = process.env.CATALYST_PROJECT_ID;

if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN || !PROJECT_ID) {
    console.error('❌ Missing required Catalyst credentials in .env file.');
    process.exit(1);
}

const schemas = require('./functions/api/schemas.json');

// Get active access token
function getAccessToken() {
    return new Promise((resolve, reject) => {
        const postData = querystring.stringify({
            grant_type: 'refresh_token',
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            refresh_token: REFRESH_TOKEN
        });

        const options = {
            hostname: 'accounts.zoho.in',
            path: '/oauth/v2/token',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.access_token) {
                        resolve(parsed.access_token);
                    } else {
                        reject(new Error(parsed.error || 'Failed to exchange token'));
                    }
                } catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

// Call Catalyst API to create table
function createTable(accessToken, tableName) {
    return new Promise((resolve) => {
        const payload = JSON.stringify({
            table_name: tableName,
            description: `KSP official schema register for ${tableName}`
        });

        const options = {
            hostname: 'api.catalyst.zoho.in',
            path: `/baas/v1/project/${PROJECT_ID}/table`,
            method: 'POST',
            headers: {
                'Authorization': `Zoho-oauthtoken ${accessToken}`,
                'X-Catalyst-Environment': 'Development',
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({ status: res.statusCode, body: data });
            });
        });

        req.on('error', err => resolve({ error: err.message }));
        req.write(payload);
        req.end();
    });
}

// Create column in table
function createColumn(accessToken, tableName, columnName, config) {
    return new Promise((resolve) => {
        // Map types to Catalyst data store column types
        let dataType = 'text';
        if (config.type === 'number') dataType = 'bigint';
        if (config.type === 'boolean') dataType = 'boolean';

        const payload = JSON.stringify({
            column_name: columnName,
            data_type: dataType,
            is_nullable: !config.required,
            max_length: config.maxLength || 250
        });

        const options = {
            hostname: 'api.catalyst.zoho.in',
            path: `/baas/v1/project/${PROJECT_ID}/table/${tableName}/column`,
            method: 'POST',
            headers: {
                'Authorization': `Zoho-oauthtoken ${accessToken}`,
                'X-Catalyst-Environment': 'Development',
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({ status: res.statusCode, body: data });
            });
        });

        req.on('error', err => resolve({ error: err.message }));
        req.write(payload);
        req.end();
    });
}

async function run() {
    console.log('🚀 Authenticating with Zoho accounts...');
    let token;
    try {
        token = await getAccessToken();
        console.log('✅ Authentication successful!');
    } catch (e) {
        console.error('❌ OAuth token exchange failed:', e.message);
        process.exit(1);
    }

    const tableNames = Object.keys(schemas);
    console.log(`📋 Found ${tableNames.length} tables to create.`);

    for (const name of tableNames) {
        console.log(`\n🛠️  Creating Table: ${name}...`);
        const tableRes = await createTable(token, name);
        
        if (tableRes.status === 200 || tableRes.status === 201) {
            console.log(`✅ Table '${name}' created successfully.`);
        } else {
            console.log(`⚠️  Table creation response (${tableRes.status}):`, tableRes.body);
        }

        // Add standard fields and audit fields
        const tableFields = schemas[name].fields;
        
        // Add audit columns
        const allColumns = {
            ...tableFields,
            CreatedAt: { type: 'string', required: false },
            CreatedBy: { type: 'string', required: false },
            UpdatedAt: { type: 'string', required: false },
            UpdatedBy: { type: 'string', required: false },
            IsDeleted: { type: 'boolean', required: false, default: false },
            VersionNumber: { type: 'number', required: false, default: 1 }
        };

        for (const [colName, colConfig] of Object.entries(allColumns)) {
            // Skip PK if it is managed by the DB
            if (colName === schemas[name].primaryKey) continue;

            const colRes = await createColumn(token, name, colName, colConfig);
            if (colRes.status === 200 || colRes.status === 201) {
                console.log(`  └─ Column '${colName}' added.`);
            } else {
                console.log(`  └─ Column '${colName}' response (${colRes.status}):`, colRes.body);
            }
        }
    }

    console.log('\n🏁 Table creation routine complete!');
}

run();

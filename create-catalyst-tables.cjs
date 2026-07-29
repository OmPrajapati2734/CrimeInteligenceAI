/**
 * Zoho Catalyst DataStore Schema Guide — KSP Crime Intelligence AI
 * 
 * IMPORTANT: Zoho Catalyst does NOT expose REST APIs for table/column creation.
 * Schema management must be done via the Catalyst Console web interface.
 *
 * This script generates a complete schema specification document that you can
 * follow when creating tables in the Catalyst Console.
 *
 * It also verifies existing tables by attempting to read from them via ZCQL.
 *
 * Usage: node create-catalyst-tables.cjs
 */

const https = require('https');
const path = require('path');
const fs = require('fs');
const querystring = require('querystring');

// Manual .env loader (no dotenv dependency needed)
const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    for (const line of envContent.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx > 0) {
            const key = trimmed.substring(0, eqIdx).trim();
            const val = trimmed.substring(eqIdx + 1).trim();
            if (!process.env[key]) process.env[key] = val;
        }
    }
}

const CLIENT_ID = process.env.CATALYST_CLIENT_ID;
const CLIENT_SECRET = process.env.CATALYST_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.CATALYST_REFRESH_TOKEN;
const PROJECT_ID = process.env.CATALYST_PROJECT_ID;

const schemas = require('./functions/api/schemas.json');

// ─── Dependency-ordered table creation sequence ──────────────────────────────
const TABLE_CREATION_ORDER = [
    'State', 'UnitType', 'Rank', 'Designation', 'CasteMaster', 'ReligionMaster',
    'OccupationMaster', 'CaseStatusMaster', 'CaseCategory', 'GravityOffence',
    'CrimeHead', 'Act', 'District', 'CrimeSubHead', 'Section', 'Court', 'Unit',
    'Employee', 'CaseMaster', 'ComplainantDetails', 'Victim', 'Accused',
    'ChargesheetDetails', 'ArrestSurrender', 'ActSectionAssociation', 'CrimeHeadActSection'
];

// ─── Audit columns added to every table ──────────────────────────────────────
const AUDIT_COLUMNS = {
    created_at:  { type: 'text', maxLength: 30, description: 'ISO timestamp of creation' },
    updated_at:  { type: 'text', maxLength: 30, description: 'ISO timestamp of last update' },
    created_by:  { type: 'text', maxLength: 200, description: 'Officer who created this record' },
    updated_by:  { type: 'text', maxLength: 200, description: 'Officer who last updated this record' },
    is_active:   { type: 'boolean', description: 'Soft delete flag (true = active)' }
};

// ─── Map schema types to Catalyst Console column types ───────────────────────
function catalystDisplayType(schemaType, maxLen) {
    switch (schemaType) {
        case 'bigint':  return 'bigint';
        case 'double':  return 'double';
        case 'boolean': return 'boolean';
        case 'text':    return `text(${maxLen || 250})`;
        default:        return 'text(250)';
    }
}

// ─── OAuth Token Exchange ────────────────────────────────────────────────────
function getAccessToken() {
    return new Promise((resolve, reject) => {
        if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
            return reject(new Error('Missing OAuth credentials'));
        }
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
                    if (parsed.access_token) resolve(parsed.access_token);
                    else reject(new Error(parsed.error || 'Token exchange failed'));
                } catch (e) { reject(e); }
            });
        });

        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

// ─── ZCQL Query to verify table existence ────────────────────────────────────
function verifyTable(accessToken, tableName) {
    return new Promise((resolve) => {
        const payload = JSON.stringify({
            query: `SELECT ROWID FROM ${tableName} LIMIT 1`
        });

        const options = {
            hostname: 'api.catalyst.zoho.in',
            path: `/baas/v1/project/${PROJECT_ID}/query`,
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
                if (res.statusCode === 200) {
                    resolve({ exists: true, rows: data });
                } else {
                    resolve({ exists: false, error: data });
                }
            });
        });

        req.on('error', err => resolve({ exists: false, error: err.message }));
        req.write(payload);
        req.end();
    });
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function run() {
    console.log('╔══════════════════════════════════════════════════════════════════╗');
    console.log('║  KSP Crime Intelligence AI — Catalyst DataStore Schema Guide    ║');
    console.log('║  26 Tables from Official KSP FIR ER Diagram                     ║');
    console.log('╚══════════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log('ℹ️  NOTE: Zoho Catalyst requires table/column creation via the Console UI.');
    console.log('   This script generates the schema spec and verifies existing tables.');
    console.log('');
    console.log(`   Console URL: https://console.catalyst.zoho.in/baas/v1/project/${PROJECT_ID}`);
    console.log('   Navigate to: Data Store → Create Table');
    console.log('');

    // Verify existing tables
    let token = null;
    if (CLIENT_ID && CLIENT_SECRET && REFRESH_TOKEN) {
        try {
            console.log('🔐 Authenticating to verify existing tables...');
            token = await getAccessToken();
            console.log('✅ Authentication successful!\n');
        } catch (e) {
            console.log(`⚠️  Auth failed: ${e.message}. Skipping verification.\n`);
        }
    }

    let existingCount = 0;
    let missingCount = 0;

    // Output schema for each table
    for (let i = 0; i < TABLE_CREATION_ORDER.length; i++) {
        const tableName = TABLE_CREATION_ORDER[i];
        const schema = schemas[tableName];

        if (!schema) {
            console.log(`⚠️  [${i + 1}] Table '${tableName}' not in schemas.json — skipping.`);
            continue;
        }

        const tierLabel = (schema.tableType || 'unknown').toUpperCase();

        // Check if table exists
        let status = '❓';
        if (token) {
            const result = await verifyTable(token, tableName);
            if (result.exists) {
                status = '✅ EXISTS';
                existingCount++;
            } else {
                status = '❌ MISSING';
                missingCount++;
            }
            await delay(300);
        }

        console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`  [${String(i + 1).padStart(2)}/26] ${tableName}  (${tierLabel})  ${status}`);
        console.log(`  Display Name: ${schema.displayName}`);
        console.log(`  Primary Key:  ${schema.primaryKey}`);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

        // Print columns
        console.log('  Business Columns:');
        for (const [colName, colConfig] of Object.entries(schema.fields)) {
            const type = catalystDisplayType(colConfig.type, colConfig.maxLength);
            const nullable = colConfig.required ? 'NOT NULL' : 'NULLABLE';
            const fk = colConfig.references ? `  FK → ${colConfig.references}` : '';
            const idx = colConfig.indexed ? '  [INDEXED]' : '';
            console.log(`    ${colName.padEnd(30)} ${type.padEnd(15)} ${nullable.padEnd(10)}${fk}${idx}`);
        }

        console.log('  Audit Columns:');
        for (const [colName, colConfig] of Object.entries(AUDIT_COLUMNS)) {
            const type = catalystDisplayType(colConfig.type, colConfig.maxLength);
            console.log(`    ${colName.padEnd(30)} ${type.padEnd(15)} NULLABLE`);
        }
    }

    // Summary
    console.log('\n╔══════════════════════════════════════════════════════════════════╗');
    console.log('║                      VERIFICATION SUMMARY                       ║');
    console.log('╠══════════════════════════════════════════════════════════════════╣');
    console.log(`║  Total tables in schema:    ${String(TABLE_CREATION_ORDER.length).padStart(3)}                                ║`);
    console.log(`║  Tables verified existing:  ${String(existingCount).padStart(3)}                                ║`);
    console.log(`║  Tables missing:            ${String(missingCount).padStart(3)}                                ║`);
    console.log('╚══════════════════════════════════════════════════════════════════╝');

    if (missingCount > 0) {
        console.log('\n⚠️  Some tables need to be created in the Catalyst Console.');
        console.log(`   URL: https://console.catalyst.zoho.in/baas/v1/project/${PROJECT_ID}`);
        console.log('   Go to Data Store → Create Table for each missing table above.');
    } else if (existingCount === TABLE_CREATION_ORDER.length) {
        console.log('\n🎉 All 26 tables are verified and exist in Catalyst DataStore!');
    }

    // Generate markdown reference file
    const mdLines = ['# KSP Crime Intelligence AI — Catalyst DataStore Schema Reference\n'];
    mdLines.push(`> Generated: ${new Date().toISOString()}\n`);
    mdLines.push(`> Total Tables: ${TABLE_CREATION_ORDER.length}\n\n`);

    for (const tableName of TABLE_CREATION_ORDER) {
        const schema = schemas[tableName];
        if (!schema) continue;

        mdLines.push(`## ${tableName} (${schema.displayName})\n`);
        mdLines.push(`- **Type:** ${schema.tableType || 'unknown'}`);
        mdLines.push(`- **Primary Key:** ${schema.primaryKey}\n`);
        mdLines.push('| Column | Catalyst Type | Nullable | FK Reference | Indexed |');
        mdLines.push('|--------|--------------|----------|-------------|---------|');

        for (const [col, cfg] of Object.entries(schema.fields)) {
            const type = catalystDisplayType(cfg.type, cfg.maxLength);
            const nullable = cfg.required ? 'NO' : 'YES';
            const fk = cfg.references || '—';
            const idx = cfg.indexed ? '✓' : '—';
            mdLines.push(`| ${col} | ${type} | ${nullable} | ${fk} | ${idx} |`);
        }

        // Add audit columns
        for (const [col, cfg] of Object.entries(AUDIT_COLUMNS)) {
            const type = catalystDisplayType(cfg.type, cfg.maxLength);
            mdLines.push(`| ${col} | ${type} | YES | — | — |`);
        }

        mdLines.push('');
    }

    const mdPath = path.resolve(__dirname, 'DATASTORE_SCHEMA_REFERENCE.md');
    fs.writeFileSync(mdPath, mdLines.join('\n'), 'utf8');
    console.log(`\n📄 Schema reference saved to: ${mdPath}`);
}

run().catch(err => {
    console.error('💥 Unexpected error:', err);
    process.exit(1);
});

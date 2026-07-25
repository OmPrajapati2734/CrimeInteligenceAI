const app = require('./functions/api/index.js');
const http = require('http');

const PORT = 3002;
const BASE_URL = `http://localhost:${PORT}`;

// Dynamically generate tokens using current timestamp to avoid expiration (12-hour limit)
const now = Date.now();
const DGP_TOKEN = Buffer.from(`DGP:${now}:ksp_secure_salt_7721`).toString('base64');
const CONSTABLE_TOKEN = Buffer.from(`Constable:${now}:ksp_secure_salt_7721`).toString('base64');

function makeRequest(method, path, body = null, token = DGP_TOKEN) {
    return new Promise((resolve, reject) => {
        const payload = body ? JSON.stringify(body) : '';
        const options = {
            hostname: 'localhost',
            port: PORT,
            path: path,
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve({ status: res.statusCode, body: parsed });
                } catch {
                    resolve({ status: res.statusCode, rawBody: data });
                }
            });
        });

        req.on('error', reject);
        if (body) req.write(payload);
        req.end();
    });
}

async function runTests() {
    console.log('Starting KSP CRUD API Integration Tests...');

    let server;
    try {
        server = app.listen(PORT);
        // Wait a small moment for server binding
        await new Promise(r => setTimeout(r, 500));
    } catch (err) {
        console.error('Failed to start test server:', err);
        process.exit(1);
    }

    try {
        // Test 1: Get Schemas Metadata
        console.log('Test 1: Fetching database schemas...');
        const r1 = await makeRequest('GET', '/api/crud-metadata');
        if (r1.status === 200 && r1.body.District && r1.body.CaseMaster) {
            console.log('PASS: Schemas metadata retrieved successfully.');
        } else {
            console.log('FAIL: Metadata check failed. Status:', r1.status);
            process.exit(1);
        }

        // Test 2: Read Seeded Lookup Table
        console.log('Test 2: Reading seeded District items...');
        const r2 = await makeRequest('GET', '/api/crud/District');
        if (r2.status === 200 && r2.body.data && r2.body.data.length > 0) {
            console.log(`PASS: Found ${r2.body.data.length} seeded district(s).`);
        } else {
            console.log('FAIL: Seeded district read failed.', r2);
            process.exit(1);
        }

        // Test 3: Input Validation Check (missing required field NationalityID)
        console.log('Test 3: POST input validation testing...');
        const r3 = await makeRequest('POST', '/api/crud/State', {
            StateID: 10,
            StateName: "New State"
        });
        if (r3.status === 400 && r3.body.error && r3.body.error.includes('NationalityID')) {
            console.log('PASS: Input validation blocked missing NationalityID field.');
        } else {
            console.log('FAIL: Input validation failed to block bad request.', r3);
            process.exit(1);
        }

        // Test 4: Write Record with Mutation Permissions
        console.log('Test 4: Creating new District record...');
        const r4 = await makeRequest('POST', '/api/crud/District', {
            DistrictID: 99,
            StateID: 1,
            DistrictName: "Chamarajanagar",
            Active: true
        });
        if (r4.status === 201 && r4.body.DistrictName === 'Chamarajanagar') {
            console.log('PASS: District created successfully.');
        } else {
            console.log('FAIL: Write record failed.', r4);
            process.exit(1);
        }

        // Test 5: Soft-delete Record
        console.log('Test 5: Testing soft-deletion of District 99...');
        const r5 = await makeRequest('DELETE', '/api/crud/District/99');
        if (r5.status === 200 && r5.body.status === 'success') {
            console.log('PASS: Record soft-deleted.');
        } else {
            console.log('FAIL: Soft delete failed.', r5);
            process.exit(1);
        }

        // Test 6: Audit Log check
        console.log('Test 6: Checking Audit Logs...');
        const r6 = await makeRequest('GET', '/api/audit-logs');
        const logs = r6.body;
        const deleteLog = logs.find(l => l.action && l.action.includes('Soft deleted') && l.resource === 'District');
        if (deleteLog) {
            console.log('PASS: Audit Trail recorded soft-delete event in audit table.');
        } else {
            console.log('FAIL: Soft delete audit log entry not found in logs.', logs.slice(0, 3));
            process.exit(1);
        }

        console.log('ALL CRUD API INTEGRATION TESTS PASSED!');
        server.close();
    } catch (e) {
        console.error('Error during integration tests:', e);
        if (server) server.close();
        process.exit(1);
    }
}

runTests();

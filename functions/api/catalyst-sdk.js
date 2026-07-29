/**
 * Zoho Catalyst SDK Initialization
 * CrimeInteligenceAI - KSP Datathon 2026
 *
 * This module provides a unified Catalyst SDK initializer that works in two modes:
 *  1. Inside Catalyst Functions (production) - uses the request object to auto-initialize
 *  2. Outside Catalyst (local dev) - uses OAuth credentials from .env
 *
 * Project: CrimeInteligenceAI
 * Project ID: 43556000000021001
 * Environment ID (ZAID): 60075829466
 * Datacenter: IN (India)
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const catalyst = require('zcatalyst-sdk-node');

// ─── Catalyst Project Constants ───────────────────────────────────────────────
const CATALYST_PROJECT_ID = process.env.CATALYST_PROJECT_ID || '43556000000021001';
const CATALYST_ZAID = process.env.CATALYST_ZAID || '60075829466';
const CATALYST_DATACENTER = (process.env.CATALYST_DATACENTER || 'IN').toLowerCase();
const IS_INSIDE_CATALYST = process.env.CATALYST_AUTH_TOKEN !== undefined;

// ─── Table Name Registry (Official KSP ER Schema — 26 Tables) ────────────────
const TABLES = {
    // Tier 1: Independent master/lookup tables
    STATE:              'State',
    DISTRICT:           'District',
    UNIT_TYPE:          'UnitType',
    RANK:               'Rank',
    DESIGNATION:        'Designation',
    CASTE_MASTER:       'CasteMaster',
    RELIGION_MASTER:    'ReligionMaster',
    OCCUPATION_MASTER:  'OccupationMaster',
    CASE_STATUS_MASTER: 'CaseStatusMaster',
    CASE_CATEGORY:      'CaseCategory',
    GRAVITY_OFFENCE:    'GravityOffence',
    CRIME_HEAD:         'CrimeHead',

    // Tier 2: Dependent master tables
    CRIME_SUB_HEAD:     'CrimeSubHead',
    ACT:                'Act',
    SECTION:            'Section',
    COURT:              'Court',
    UNIT:               'Unit',

    // Tier 3: Employee master
    EMPLOYEE:           'Employee',

    // Tier 4: Core transaction tables
    CASE_MASTER:        'CaseMaster',
    COMPLAINANT:        'ComplainantDetails',
    VICTIM:             'Victim',
    ACCUSED:            'Accused',
    ARREST_SURRENDER:   'ArrestSurrender',
    CHARGESHEET:        'ChargesheetDetails',

    // Tier 5: Junction tables
    ACT_SECTION_ASSOC:  'ActSectionAssociation',
    CRIME_HEAD_ACT_SEC: 'CrimeHeadActSection',
};

/**
 * Initialize Catalyst SDK.
 *
 * @param {object|null} req - Express request object (available inside Catalyst Functions).
 *                            Pass null when initializing outside a request context.
 * @returns {object} Initialized Catalyst app instance
 */
function initializeCatalyst(req = null) {
    // Mode 1: Running inside Catalyst Functions (production/staging)
    if (IS_INSIDE_CATALYST && req) {
        return catalyst.initialize(req);
    }

    // Mode 2: Running locally with OAuth credentials
    const clientId     = process.env.CATALYST_CLIENT_ID;
    const clientSecret = process.env.CATALYST_CLIENT_SECRET;
    const refreshToken = process.env.CATALYST_REFRESH_TOKEN;

    if (!clientId || clientId === 'REPLACE_WITH_CLIENT_ID' || !refreshToken || refreshToken === 'REPLACE_WITH_REFRESH_TOKEN') {
        console.warn(
            '[Catalyst SDK] OAuth credentials not configured. ' +
            'Running in mock-fallback mode. ' +
            'Fill in .env with credentials from: ' +
            'https://catalyst.zoho.in/baas/v1/project/' + CATALYST_PROJECT_ID
        );
        return null; // Caller must handle null → fall back to mock data
    }

    // Configure India DC endpoints
    process.env.X_ZOHO_CATALYST_ACCOUNTS_URL = 'https://accounts.zoho.in';
    process.env.X_ZOHO_CATALYST_CONSOLE_URL = 'https://api.catalyst.zoho.in';

    try {
        return catalyst.initializeApp({
            project_id:    CATALYST_PROJECT_ID,
            project_key:   CATALYST_ZAID,
            environment:   'Development', // Case-sensitive environment name (must be Capital 'D')
            credential:    catalyst.credential.refreshToken({
                client_id:     clientId,
                client_secret: clientSecret,
                refresh_token: refreshToken
            })
        });
    } catch (err) {
        console.error('[Catalyst SDK] Failed to initializeApp:', err.message);
        return null;
    }
}


/**
 * Get a DataStore table instance.
 *
 * @param {object} app - Initialized Catalyst app instance from initializeCatalyst()
 * @param {string} tableName - One of the TABLES constants
 * @returns {object|null} Catalyst DataStore table instance, or null if SDK unavailable
 */
function getTable(app, tableName) {
    if (!app) return null;
    try {
        return app.datastore().table(tableName);
    } catch (err) {
        console.error(`[Catalyst SDK] Failed to get table "${tableName}":`, err.message);
        return null;
    }
}

/**
 * Safe DataStore query wrapper - falls back gracefully if SDK is not available.
 *
 * @param {object} app - Catalyst app instance
 * @param {Function} query - Async function that receives the app and runs the DB query
 * @param {*} fallback - Value to return if the SDK is unavailable or query fails
 * @returns {Promise<*>} Query result or fallback
 */
async function safeDataStoreQuery(app, query, fallback) {
    if (!app) return fallback;
    try {
        return await query(app);
    } catch (err) {
        console.error('[Catalyst DataStore] Query failed, using fallback:', err.message);
        return fallback;
    }
}

/**
 * Get Catalyst Zia instance for AI services (OCR, NLP, etc.)
 *
 * @param {object} app - Initialized Catalyst app instance
 * @returns {object|null} Zia service instance
 */
function getZia(app) {
    if (!app) return null;
    try {
        return app.zia();
    } catch (err) {
        console.error('[Catalyst Zia] Failed to initialize:', err.message);
        return null;
    }
}

module.exports = {
    initializeCatalyst,
    getTable,
    getZia,
    safeDataStoreQuery,
    TABLES,
    CATALYST_PROJECT_ID,
    CATALYST_ZAID,
    IS_INSIDE_CATALYST,
};

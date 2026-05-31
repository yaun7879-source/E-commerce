#!/usr/bin/env node

/**
 * DIAGNOSTIC TEST FOR CORS AND LOGIN ISSUES
 * Run this to understand what's happening with your API
 */

const https = require('https');

console.log('🔍 E-Commerce Backend Diagnostic Test\n');
console.log('='.repeat(60));

// Test 1: Backend Health
console.log('\n1️⃣  BACKEND HEALTH CHECK');
console.log('-'.repeat(60));

const testHealth = () => {
    return new Promise((resolve) => {
        https.get('https://e-commerce-production-1f1f.up.railway.app/api/health', (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                console.log(`✅ Status: ${res.statusCode}`);
                console.log(`📝 Response: ${data.substring(0, 200)}`);
                resolve(res.statusCode === 200);
            });
        }).on('error', (err) => {
            console.log(`❌ Error: ${err.message}`);
            console.log('⚠️  Backend is NOT responding or not deployed');
            resolve(false);
        });
    });
};

// Test 2: CORS Preflight
console.log('\n2️⃣  CORS PREFLIGHT TEST');
console.log('-'.repeat(60));

const testCorsPreFlight = () => {
    return new Promise((resolve) => {
        const options = {
            hostname: 'e-commerce-production-1f1f.up.railway.app',
            path: '/api/users/login',
            method: 'OPTIONS',
            headers: {
                'Origin': 'https://e-commerce-k5cv.vercel.app',
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type'
            }
        };

        https.request(options, (res) => {
            console.log(`✅ Status: ${res.statusCode}`);
            console.log('\nCORS Headers:');
            console.log(`- Allow-Origin: ${res.headers['access-control-allow-origin'] || '❌ MISSING'}`);
            console.log(`- Allow-Methods: ${res.headers['access-control-allow-methods'] || '❌ MISSING'}`);
            console.log(`- Allow-Headers: ${res.headers['access-control-allow-headers'] || '❌ MISSING'}`);
            console.log(`- Allow-Credentials: ${res.headers['access-control-allow-credentials'] || '❌ MISSING'}`);

            const corsOk = res.headers['access-control-allow-origin'] && res.statusCode === 200;
            resolve(corsOk);
        }).on('error', (err) => {
            console.log(`❌ Error: ${err.message}`);
            resolve(false);
        }).end();
    });
};

// Test 3: Login Endpoint
console.log('\n3️⃣  LOGIN ENDPOINT TEST');
console.log('-'.repeat(60));

const testLoginEndpoint = () => {
    return new Promise((resolve) => {
        const postData = JSON.stringify({
            email: 'test@test.com',
            password: 'test123'
        });

        const options = {
            hostname: 'e-commerce-production-1f1f.up.railway.app',
            path: '/api/users/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
                'Origin': 'https://e-commerce-k5cv.vercel.app'
            }
        };

        https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                console.log(`✅ Status: ${res.statusCode}`);
                console.log(`📝 Response: ${data.substring(0, 200)}`);

                if (res.statusCode === 401) {
                    console.log('⚠️  Got 401: This is CORRECT (invalid credentials)');
                } else if (res.statusCode === 404) {
                    console.log('❌ Got 404: Endpoint not found (BAD)');
                } else if (res.statusCode === 200) {
                    console.log('✅ Got 200: Success!');
                }

                resolve(res.statusCode);
            });
        }).on('error', (err) => {
            console.log(`❌ Error: ${err.message}`);
            resolve(null);
        }).write(postData);
    });
};

// Run all tests
(async () => {
    try {
        console.log('\n⏳ Running tests... (may take 10-15 seconds)\n');

        const healthOk = await testHealth();
        const corsOk = await testCorsPreFlight();
        const loginStatus = await testLoginEndpoint();

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('📊 SUMMARY\n');

        if (!healthOk) {
            console.log('❌ PROBLEM: Backend is not running or deployed');
            console.log('   Action: Check Railway dashboard if service is running');
            console.log('   Action: Check if latest code was deployed');
        } else if (!corsOk) {
            console.log('❌ PROBLEM: CORS preflight is failing');
            console.log('   Action: Ensure FRONTEND_URL is set in Railway env vars');
            console.log('   Action: Current FRONTEND_URL value: ' + (process.env.FRONTEND_URL || 'NOT SET'));
        } else if (loginStatus === 404) {
            console.log('❌ PROBLEM: Login endpoint returning 404');
            console.log('   Action: Check if /api/users route is properly registered');
        } else if (loginStatus === 401) {
            console.log('✅ GOOD: Backend is working! 401 is expected (bad credentials)');
            console.log('   Try logging in with valid credentials from your app');
        } else {
            console.log('🤔 Unexpected status. Check output above.');
        }

        console.log('\n' + '='.repeat(60) + '\n');
    } catch (error) {
        console.error('Test error:', error.message);
    }
})();

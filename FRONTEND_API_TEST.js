< !--PASTE THIS IN BROWSER CONSOLE TO TEST LOGIN-- >
< !--This will help diagnose the actual API calls being made-- >

    (async () => {
        console.log('🔍 Frontend API Diagnostic\n');

        const API_BASE_URL = 'https://e-commerce-production-1f1f.up.railway.app/api';

        console.log('1. Testing CORS Preflight...');
        try {
            const preflightResponse = await fetch(`${API_BASE_URL}/users/login`, {
                method: 'OPTIONS',
                headers: {
                    'Access-Control-Request-Method': 'POST',
                    'Access-Control-Request-Headers': 'Content-Type'
                }
            });

            console.log('✅ Preflight Status:', preflightResponse.status);
            console.log('✅ CORS Headers:', {
                'Allow-Origin': preflightResponse.headers.get('access-control-allow-origin'),
                'Allow-Methods': preflightResponse.headers.get('access-control-allow-methods'),
                'Allow-Headers': preflightResponse.headers.get('access-control-allow-headers'),
                'Allow-Credentials': preflightResponse.headers.get('access-control-allow-credentials')
            });
        } catch (error) {
            console.error('❌ Preflight failed:', error.message);
        }

        console.log('\n2. Testing Login Endpoint with Valid Credentials...');
        try {
            const loginResponse = await fetch(`${API_BASE_URL}/users/login`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'test@example.com',
                    password: 'Test@1234567'
                })
            });

            console.log('✅ Login Status:', loginResponse.status);
            const data = await loginResponse.json();
            console.log('📝 Response:', data);

            if (loginResponse.status === 200) {
                console.log('✅ SUCCESS! Token:', data.token?.substring(0, 20) + '...');
            } else if (loginResponse.status === 401) {
                console.log('⚠️  Credentials invalid. Error:', data.error);
            }
        } catch (error) {
            console.error('❌ Login failed:', error.message);
        }

        console.log('\n3. Checking localStorage...');
        console.log('- authToken:', localStorage.getItem('authToken') ? '✅ Present' : '❌ Missing');
        console.log('- authUser:', localStorage.getItem('authUser') ? '✅ Present' : '❌ Missing');

        console.log('\n4. API_BASE_URL:', API_BASE_URL);
        console.log('✅ Diagnostic complete!');
    })();

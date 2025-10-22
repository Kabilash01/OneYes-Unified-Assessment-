const BASE_URL = 'http://localhost:5000/api';

async function fetchAPI(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) {
    throw { response: { status: response.status, data } };
  }
  return { data };
}

async function testAdminEndpoints() {
  try {
    console.log('🧪 Testing Admin API Endpoints\n');

    // 1. Login as admin
    console.log('1️⃣ Testing admin login...');
    const loginResponse = await fetchAPI(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@oneyes.com', password: 'admin123' })
    });
    
    if (!loginResponse.data.success) {
      console.error('❌ Login failed:', loginResponse.data.message);
      return;
    }
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    console.log(`   User: ${loginResponse.data.user.name} (${loginResponse.data.user.role})`);

    const headers = { Authorization: `Bearer ${token}` };

    // 2. Test dashboard stats
    console.log('\n2️⃣ Testing /api/admin/dashboard/stats...');
    const statsResponse = await fetchAPI(`${BASE_URL}/admin/dashboard/stats`, { headers });
    console.log('✅ Dashboard stats retrieved');
    console.log(`   Total Users: ${statsResponse.data.stats?.totalUsers || 0}`);

    // 3. Test get users
    console.log('\n3️⃣ Testing /api/admin/users...');
    const usersResponse = await fetchAPI(`${BASE_URL}/admin/users?page=1&limit=5`, { headers });
    console.log('✅ Users list retrieved');
    console.log(`   Found ${usersResponse.data.users?.length || 0} users`);

    // 4. Test activity logs
    console.log('\n4️⃣ Testing /api/admin/logs...');
    const logsResponse = await fetchAPI(`${BASE_URL}/admin/logs?page=1&limit=5`, { headers });
    console.log('✅ Activity logs retrieved');
    console.log(`   Found ${logsResponse.data.logs?.length || 0} logs`);

    // 5. Test notifications unread count
    console.log('\n5️⃣ Testing /api/admin/notifications/unread-count...');
    const notifCountResponse = await fetchAPI(`${BASE_URL}/admin/notifications/unread-count`, { headers });
    console.log('✅ Notification count retrieved');
    console.log(`   Unread notifications: ${notifCountResponse.data.unreadCount || 0}`);

    // 6. Test analytics platform metrics
    console.log('\n6️⃣ Testing /api/analytics/admin/platform...');
    const analyticsResponse = await fetchAPI(`${BASE_URL}/analytics/admin/platform`, { headers });
    console.log('✅ Platform analytics retrieved');
    console.log(`   Metrics available: ${Object.keys(analyticsResponse.data.metrics || {}).length}`);

    console.log('\n✅ All admin endpoint tests passed!\n');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

testAdminEndpoints();

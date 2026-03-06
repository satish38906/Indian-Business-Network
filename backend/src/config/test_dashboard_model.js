const Dashboard = require('../models/dashboard.model');

async function testDashboardModel() {
  const userId = 6;
  console.log(`=== Testing Dashboard Model for userId: ${userId} ===\n`);

  try {
    const result = await Dashboard.getMemberDashboard(userId);
    console.log('Dashboard result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Dashboard model error:', error.message);
  } finally {
    process.exit(0);
  }
}

testDashboardModel();
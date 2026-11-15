// End-to-End Test Suite for SkillBridge Capstone
const BASE_URL = 'http://localhost:5050/api';

async function runTests() {
  console.log('🚀 Running SkillBridge E2E Integration Tests...');
  let passed = 0;
  let failed = 0;

  const assert = (condition, msg) => {
    if (condition) {
      console.log(`  ✅ PASS: ${msg}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${msg}`);
      failed++;
    }
  };

  try {
    // 1. Health Check
    const healthRes = await fetch(`${BASE_URL}/health`);
    const health = await healthRes.json();
    assert(health.status === 'ok', 'Health Check endpoint responds');

    // 2. Student Login
    const stuLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'akmalnsrllh@gmail.com', password: 'student123' })
    });
    const stuLogin = await stuLoginRes.json();
    if (!stuLogin.success) console.log('stuLogin response:', stuLogin);
    assert(stuLogin.success && stuLogin.token && stuLogin.user.role === 'student', 'Student Authentication & JWT generation');
    const studentToken = stuLogin.token;

    // 3. Client Login
    const clientLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'contact@hav-design.de', password: 'client123' })
    });
    const clientLogin = await clientLoginRes.json();
    assert(clientLogin.success && clientLogin.token && clientLogin.user.role === 'client', 'Client Authentication & JWT generation');
    const clientToken = clientLogin.token;

    // 4. Admin Login
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@skillbridge.edu', password: 'admin123' })
    });
    const adminLogin = await adminLoginRes.json();
    assert(adminLogin.success && adminLogin.token && adminLogin.user.role === 'admin', 'Admin Authentication & RBAC role');
    const adminToken = adminLogin.token;

    // 5. Browse Projects & Filtering
    const projectsRes = await fetch(`${BASE_URL}/projects?search=Landing&category=Web%20%26%20App%20Design`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    const projectsData = await projectsRes.json();
    assert(projectsData.success && projectsData.data.length > 0, 'Project Search & Multi-facet Filter');

    // 6. Skill-Based Project Recommendations (Advanced Feature 1)
    const recRes = await fetch(`${BASE_URL}/students/recommendations`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    const recData = await recRes.json();
    assert(recData.success && recData.data.length > 0 && recData.data[0].matchPercentage !== undefined, 'Skill-based Project Recommendation Engine');

    // 7. Student Portfolio CRUD (Advanced Feature 2)
    const addPortRes = await fetch(`${BASE_URL}/students/portfolio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${studentToken}` },
      body: JSON.stringify({
        title: 'Interactive WebGL 3D Portfolio',
        description: 'Creative 3D web experience built with Three.js and Vite.',
        technologies: 'Three.js, WebGL, TypeScript',
        project_url: 'https://demo.portfolio.io'
      })
    });
    const portData = await addPortRes.json();
    assert(portData.success, 'Student Portfolio Project Creation (CRUD)');

    // 8. Apply for a Project (Core Requirement 6)
    // Find an open project to apply to (e.g. project 2)
    const applyRes = await fetch(`${BASE_URL}/applications/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${studentToken}` },
      body: JSON.stringify({
        project_id: 2,
        cover_letter: 'I have extensive experience crafting high-conversion course landing pages.',
        proposed_rate: 22.00,
        delivery_time: '4 days',
        relevant_experience: 'Built 10+ landing pages'
      })
    });
    const applyData = await applyRes.json();
    assert(applyData.success || applyData.message.includes('already submitted'), 'Student Project Application submission & duplicate prevention');

    // 9. Client Updates Application Status & Timeline History (Advanced Feature 3)
    const myAppsRes = await fetch(`${BASE_URL}/applications/my-applications`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    const myAppsData = await myAppsRes.json();
    assert(myAppsData.success && myAppsData.data.length > 0 && myAppsData.data[0].history !== undefined, 'Application Status Tracking with Timeline History');

    // 10. BONUS CHALLENGE: Student-Project Matching Algorithm for Clients
    const bonusRes = await fetch(`${BASE_URL}/clients/projects/1/candidates`, {
      headers: { 'Authorization': `Bearer ${clientToken}` }
    });
    const bonusData = await bonusRes.json();
    const rankedCandidates = bonusData.data;
    assert(
      bonusData.success && 
      Array.isArray(rankedCandidates) && 
      rankedCandidates.length > 0 &&
      rankedCandidates[0].matchPercentage >= rankedCandidates[rankedCandidates.length - 1].matchPercentage,
      'BONUS CHALLENGE: Student-Project Matching & Ranking Algorithm (Ranked by Skill Match %)'
    );

    // 11. Notifications System
    const notifRes = await fetch(`${BASE_URL}/notifications`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    const notifData = await notifRes.json();
    assert(notifData.success && Array.isArray(notifData.data), 'In-App Notification Dispatcher');

    // 12. Admin Metrics & Governance
    const adminOvRes = await fetch(`${BASE_URL}/admin/overview`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const adminOv = await adminOvRes.json();
    assert(
      adminOv.success && 
      adminOv.data.metrics.totalStudents > 0 && 
      adminOv.data.metrics.totalProjects > 0,
      'Administrator Dashboard KPIs & Visual Analytics'
    );

    console.log(`\n========================================`);
    console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================`);
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Fatal Test Error:', err);
    process.exit(1);
  }
}

runTests();

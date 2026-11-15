import bcrypt from 'bcryptjs';
import { db, initDatabase } from './connection.js';

export function runSeed() {
  console.log('🌱 Starting SkillBridge Database Seeding...');

  initDatabase();

  // Clean existing tables (in foreign key safe order)
  db.exec('PRAGMA foreign_keys = OFF;');
  db.exec('DELETE FROM reports;');
  db.exec('DELETE FROM reviews;');
  db.exec('DELETE FROM notifications;');
  db.exec('DELETE FROM application_status_history;');
  db.exec('DELETE FROM applications;');
  db.exec('DELETE FROM portfolio_items;');
  db.exec('DELETE FROM project_required_skills;');
  db.exec('DELETE FROM projects;');
  db.exec('DELETE FROM student_skills;');
  db.exec('DELETE FROM skills;');
  db.exec('DELETE FROM client_profiles;');
  db.exec('DELETE FROM student_profiles;');
  db.exec('DELETE FROM users;');
  db.exec('PRAGMA foreign_keys = ON;');

  // 1. Seed Skills
  const skillsData = [
    { name: 'UI Design', category: 'creative' },
    { name: 'Web Design', category: 'creative' },
    { name: 'Landing Page', category: 'technical' },
    { name: 'Web Development', category: 'technical' },
    { name: 'WordPress', category: 'technical' },
    { name: 'Graphic Design', category: 'creative' },
    { name: 'Logo Design', category: 'creative' },
    { name: 'UIUX', category: 'creative' },
    { name: 'Responsive Design', category: 'technical' },
    { name: 'Adobe Photoshop', category: 'creative' },
    { name: 'Figma', category: 'creative' },
    { name: 'Prototyping', category: 'creative' },
    { name: 'React', category: 'technical' },
    { name: 'TypeScript', category: 'technical' },
    { name: 'Node.js', category: 'technical' },
    { name: 'Python', category: 'technical' },
    { name: 'Django', category: 'technical' },
    { name: 'PostgreSQL', category: 'technical' },
    { name: 'REST API', category: 'technical' },
    { name: 'Flutter', category: 'technical' },
    { name: 'Mobile App', category: 'technical' },
    { name: 'Firebase', category: 'technical' },
    { name: 'Content Writing', category: 'writing' },
    { name: 'SEO Optimization', category: 'business' },
    { name: 'Data Analysis', category: 'technical' },
    { name: 'Machine Learning', category: 'technical' }
  ];

  const insertSkill = db.prepare('INSERT INTO skills (name, category) VALUES (?, ?)');
  const skillMap = new Map<string, number>();

  for (const s of skillsData) {
    const res = insertSkill.run(s.name, s.category);
    skillMap.set(s.name, Number(res.lastInsertRowid));
  }
  console.log(`✓ Inserted ${skillsData.length} core skills.`);

  // Passwords
  const adminPass = bcrypt.hashSync('admin123', 10);
  const studentPass = bcrypt.hashSync('student123', 10);
  const clientPass = bcrypt.hashSync('client123', 10);

  // 2. Seed Users
  const insertUser = db.prepare(`
    INSERT INTO users (email, password_hash, role, first_name, last_name, avatar_url, phone, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
  `);

  // Admin
  const adminRes = insertUser.run(
    'admin@skillbridge.edu',
    adminPass,
    'admin',
    'Platform',
    'Admin',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    '+1 (555) 019-2831'
  );
  const adminId = Number(adminRes.lastInsertRowid);

  // Students
  // Student 1: Akmal Nasrulloh (Primary UI persona matching reference image)
  const akmalRes = insertUser.run(
    'akmalnsrllh@gmail.com',
    studentPass,
    'student',
    'Akmal',
    'Nasrulloh',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    '+1 (555) 234-5678'
  );
  const akmalId = Number(akmalRes.lastInsertRowid);

  // Student 2: Sarah Jenkins (Full-Stack Python/Django)
  const sarahRes = insertUser.run(
    'sarah.jenkins@stanford.edu',
    studentPass,
    'student',
    'Sarah',
    'Jenkins',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    '+1 (555) 345-6789'
  );
  const sarahId = Number(sarahRes.lastInsertRowid);

  // Student 3: Alex Kumar (Frontend React Specialist)
  const alexRes = insertUser.run(
    'alex.kumar@mit.edu',
    studentPass,
    'student',
    'Alex',
    'Kumar',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    '+1 (555) 456-7890'
  );
  const alexId = Number(alexRes.lastInsertRowid);

  // Student 4: Elena Rostova (Mobile App & Flutter)
  const elenaRes = insertUser.run(
    'elena.rostova@oxford.edu',
    studentPass,
    'student',
    'Elena',
    'Rostova',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    '+1 (555) 567-8901'
  );
  const elenaId = Number(elenaRes.lastInsertRowid);

  // Clients
  // Client 1: Marcus Vance / HAV
  const havRes = insertUser.run(
    'contact@hav-design.de',
    clientPass,
    'client',
    'Marcus',
    'Hoffman',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    '+49 30 123456'
  );
  const havClientId = Number(havRes.lastInsertRowid);

  // Client 2: OnlineEdu Corp
  const eduRes = insertUser.run(
    'hiring@onlinecoursehub.com',
    clientPass,
    'client',
    'Jessica',
    'Miller',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    '+1 (555) 876-5432'
  );
  const eduClientId = Number(eduRes.lastInsertRowid);

  // Client 3: DeshiMart E-Commerce
  const martRes = insertUser.run(
    'tech@deshimart.com',
    clientPass,
    'client',
    'Tanvir',
    'Rahman',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    '+880 1712 345678'
  );
  const martClientId = Number(martRes.lastInsertRowid);

  // Client 4: Vance Creative
  const vanceRes = insertUser.run(
    'carl@vancedesign.ca',
    clientPass,
    'client',
    'Carl',
    'Vance',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    '+1 (416) 555-0199'
  );
  const vanceClientId = Number(vanceRes.lastInsertRowid);

  console.log('✓ Inserted Admin, 4 Students, and 4 Clients.');

  // 3. Seed Student Profiles
  const insertStudentProfile = db.prepare(`
    INSERT INTO student_profiles (
      user_id, university, department, student_id, bio, experience_level,
      education, github_url, linkedin_url, website_url, profile_completed
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const akmalProfileRes = insertStudentProfile.run(
    akmalId,
    'State University of Technology',
    'Computer Science & Interaction Design',
    'STU-99214',
    'Passionate UI/UX designer and frontend developer with 3+ years of freelance experience crafting high-conversion landing pages and intuitive web applications.',
    'intermediate',
    'B.S. in Computer Science (Senior Year, GPA: 3.85)',
    'https://github.com/akmalnasrulloh',
    'https://linkedin.com/in/akmalnasrulloh',
    'https://akmal.design',
    95
  );
  const akmalProfileId = Number(akmalProfileRes.lastInsertRowid);

  const sarahProfileRes = insertStudentProfile.run(
    sarahId,
    'Stanford University',
    'Software Engineering',
    'STU-88321',
    'Full-stack engineer focusing on Python, Django, PostgreSQL, and robust REST APIs. Built production microservices and data pipelines for campus startups.',
    'expert',
    'B.S. in Software Engineering, Minor in Mathematics (GPA: 3.92)',
    'https://github.com/sarahjenkins-dev',
    'https://linkedin.com/in/sarahjenkins-swe',
    'https://sarahjenkins.io',
    90
  );
  const sarahProfileId = Number(sarahProfileRes.lastInsertRowid);

  const alexProfileRes = insertStudentProfile.run(
    alexId,
    'Massachusetts Institute of Technology',
    'Electrical Engineering & CS',
    'STU-77412',
    'React, Next.js, and TypeScript specialist. Loves building performant dashboards, interactive animations, and responsive accessible web systems.',
    'intermediate',
    'B.S. in EECS (Junior, GPA: 3.78)',
    'https://github.com/alexkumar-code',
    'https://linkedin.com/in/alexkumar',
    'https://alexkumar.dev',
    85
  );
  const alexProfileId = Number(alexProfileRes.lastInsertRowid);

  const elenaProfileRes = insertStudentProfile.run(
    elenaId,
    'University of Oxford',
    'Informatics & Digital Media',
    'STU-66503',
    'Mobile application engineer specialized in cross-platform Flutter and Firebase. Published 4 apps on App Store and Google Play with 50K+ downloads.',
    'expert',
    'B.Sc. in Computer Science (Senior, First Class Honours)',
    'https://github.com/elenarostova',
    'https://linkedin.com/in/elenarostova',
    'https://elenamobile.dev',
    90
  );
  const elenaProfileId = Number(elenaProfileRes.lastInsertRowid);

  // 4. Seed Client Profiles
  const insertClientProfile = db.prepare(`
    INSERT INTO client_profiles (user_id, company_name, industry, company_size, website_url, bio, location, is_verified)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1)
  `);

  insertClientProfile.run(
    havClientId,
    'HAV Solutions GmbH',
    'Design & Software Agency',
    '11-50 employees',
    'https://hav-design.de',
    'Leading digital product studio in Berlin creating modern brands and seamless digital customer experiences.',
    'Germany'
  );

  insertClientProfile.run(
    eduClientId,
    'OnlineEdu Corp',
    'E-Learning & EdTech',
    '50-200 employees',
    'https://onlinecoursehub.com',
    'Global online learning platform hosting certified tech and business masterclasses for 300,000 students worldwide.',
    'United States'
  );

  insertClientProfile.run(
    martClientId,
    'DeshiMart E-Commerce',
    'Retail & E-Commerce',
    '10-30 employees',
    'https://deshimart.com',
    'Fast-growing e-commerce marketplace delivering organic lifestyle products and consumer goods across South Asia.',
    'Bangladesh'
  );

  insertClientProfile.run(
    vanceClientId,
    'Vance Creative Labs',
    'Branding & Advertising',
    '5-15 employees',
    'https://vancedesign.ca',
    'Toronto-based creative studio crafting brand identities, packaging, and digital flagship destinations.',
    'Canada'
  );

  // 5. Seed Student Skills
  const insertStudentSkill = db.prepare(`
    INSERT INTO student_skills (student_profile_id, skill_id, proficiency, years_of_experience)
    VALUES (?, ?, ?, ?)
  `);

  // Akmal's skills
  insertStudentSkill.run(akmalProfileId, skillMap.get('Web Design')!, 'expert', 3.5);
  insertStudentSkill.run(akmalProfileId, skillMap.get('UI Design')!, 'advanced', 3.0);
  insertStudentSkill.run(akmalProfileId, skillMap.get('Landing Page')!, 'expert', 3.0);
  insertStudentSkill.run(akmalProfileId, skillMap.get('WordPress')!, 'advanced', 2.5);
  insertStudentSkill.run(akmalProfileId, skillMap.get('Graphic Design')!, 'intermediate', 2.0);
  insertStudentSkill.run(akmalProfileId, skillMap.get('UIUX')!, 'advanced', 3.0);
  insertStudentSkill.run(akmalProfileId, skillMap.get('Figma')!, 'expert', 3.5);
  insertStudentSkill.run(akmalProfileId, skillMap.get('Responsive Design')!, 'advanced', 3.0);

  // Sarah's skills
  insertStudentSkill.run(sarahProfileId, skillMap.get('Python')!, 'expert', 4.0);
  insertStudentSkill.run(sarahProfileId, skillMap.get('Django')!, 'advanced', 3.0);
  insertStudentSkill.run(sarahProfileId, skillMap.get('PostgreSQL')!, 'advanced', 3.0);
  insertStudentSkill.run(sarahProfileId, skillMap.get('REST API')!, 'expert', 3.5);
  insertStudentSkill.run(sarahProfileId, skillMap.get('Data Analysis')!, 'advanced', 2.0);

  // Alex's skills
  insertStudentSkill.run(alexProfileId, skillMap.get('React')!, 'expert', 3.0);
  insertStudentSkill.run(alexProfileId, skillMap.get('TypeScript')!, 'advanced', 2.5);
  insertStudentSkill.run(alexProfileId, skillMap.get('Node.js')!, 'advanced', 2.5);
  insertStudentSkill.run(alexProfileId, skillMap.get('Web Development')!, 'expert', 3.0);

  // Elena's skills
  insertStudentSkill.run(elenaProfileId, skillMap.get('Mobile App')!, 'expert', 4.0);
  insertStudentSkill.run(elenaProfileId, skillMap.get('Flutter')!, 'expert', 3.5);
  insertStudentSkill.run(elenaProfileId, skillMap.get('Firebase')!, 'advanced', 3.0);
  insertStudentSkill.run(elenaProfileId, skillMap.get('UIUX')!, 'intermediate', 2.0);

  console.log('✓ Linked Student Profiles & Skills.');

  // 6. Seed Student Portfolio Items
  const insertPortfolio = db.prepare(`
    INSERT INTO portfolio_items (student_profile_id, title, description, project_url, github_url, image_url, technologies)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertPortfolio.run(
    akmalProfileId,
    'SaaS Analytics Dashboard',
    'Interactive revenue analytics dashboard for B2B fintech startups featuring real-time charts and dark mode.',
    'https://saas-metrics-demo.vercel.app',
    'https://github.com/akmalnasrulloh/saas-dashboard',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
    'React, Tailwind CSS, Chart.js, Figma'
  );

  insertPortfolio.run(
    akmalProfileId,
    'Modern E-Commerce Storefront',
    'Full responsive shopping experience with filtering, mini cart, and Stripe checkout integration.',
    'https://shop-zenith.demo.app',
    'https://github.com/akmalnasrulloh/ecommerce-store',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
    'Next.js, Tailwind CSS, TypeScript, WordPress Headless'
  );

  insertPortfolio.run(
    sarahProfileId,
    'Campus Marketplace API Microservices',
    'High-throughput backend API handling book exchanges, room listings, and real-time chat with JWT auth.',
    'https://api.campusmarket.io/docs',
    'https://github.com/sarahjenkins-dev/campus-api',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
    'Python, Django REST Framework, PostgreSQL, Redis, Docker'
  );

  // 7. Seed Projects (Strictly mirroring the UI Reference image and adding more diversity)
  const insertProject = db.prepare(`
    INSERT INTO projects (
      client_id, title, description, category, budget, budget_type,
      project_type, experience_level, deadline, status, additional_requirements, location, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Project 1 (Matches reference image card 1)
  const p1Res = insertProject.run(
    havClientId,
    "Let's Collaborate on HAV's Website Redesign",
    'We are looking for a creative person who can redesign & build beautiful landing pages in WordPress sites. Must have proven aesthetic sense and speed.',
    'Web & App Design',
    15.00,
    'hourly',
    'one-time',
    'entry',
    '2026-12-15',
    'open',
    'Please include links to previous live WordPress websites you designed.',
    'Germany',
    '2026-11-15 13:09:00'
  );
  const p1Id = Number(p1Res.lastInsertRowid);

  // Project 2 (Matches reference image card 2)
  const p2Res = insertProject.run(
    eduClientId,
    'Build/Edit Landing Page for Online Course',
    'Have a current landing page for my website/course already. Can either edit that one for my new course or make a brand new one with modern animations.',
    'Web & App Design',
    20.00,
    'hourly',
    'one-time',
    'entry',
    '2026-12-20',
    'open',
    'High conversion focus, mobile responsive, clean typography.',
    'United States',
    '2026-11-15 13:04:00'
  );
  const p2Id = Number(p2Res.lastInsertRowid);

  // Project 3 (Matches reference image card 3)
  const p3Res = insertProject.run(
    martClientId,
    'Web Designer for E-Commerce Website',
    'Install new e-commerce responsive WordPress theme, Redesign menu, layout and create pages and posts for our fast growing retail marketplace.',
    'Web Development',
    25.00,
    'hourly',
    'one-time',
    'intermediate',
    '2026-12-10',
    'open',
    'WooCommerce experience required. Fast loading time optimization.',
    'Bangladesh',
    '2026-11-15 12:59:00'
  );
  const p3Id = Number(p3Res.lastInsertRowid);

  // Project 4 (Matches reference image card 4)
  const p4Res = insertProject.run(
    vanceClientId,
    'Website Designer',
    "We're looking for a website designer who can help us redesign our company website, we prefer based designs using Figma before implementation.",
    'Web & App Design',
    50.00,
    'hourly',
    'ongoing',
    'expert',
    '2027-01-15',
    'open',
    'Full Figma component library, wireframes, and design token handoff.',
    'Canada',
    '2026-11-15 12:49:00'
  );
  const p4Id = Number(p4Res.lastInsertRowid);

  // Project 5: Python Backend API
  const p5Res = insertProject.run(
    eduClientId,
    'Full-Stack Student Assessment Portal Backend',
    'Build robust REST APIs using Python, Django, and PostgreSQL to handle exam submissions, auto-grading, and student certificate generation.',
    'Software & Tech',
    1200.00,
    'fixed',
    'one-time',
    'expert',
    '2026-12-30',
    'open',
    'Write clean unit tests, comprehensive OpenAPI Swagger docs, and Docker setup.',
    'United States',
    '2026-11-14 10:00:00'
  );
  const p5Id = Number(p5Res.lastInsertRowid);

  // Project 6: Mobile App MVP in Flutter
  const p6Res = insertProject.run(
    havClientId,
    'Campus Delivery Cross-Platform Mobile App',
    'Develop a smooth, interactive food and stationery delivery mobile app for university dorms using Flutter and Firebase backend.',
    'Mobile Development',
    800.00,
    'fixed',
    'one-time',
    'intermediate',
    '2026-12-25',
    'open',
    'Push notifications, real-time order tracking map, and student ID verification.',
    'Germany',
    '2026-11-13 15:30:00'
  );
  const p6Id = Number(p6Res.lastInsertRowid);

  // Project 7: Completed project for review testing
  const p7Res = insertProject.run(
    martClientId,
    'Brand Identity & Social Media Graphics Kit',
    'Design brand guidelines, vector logos, and social media promotion banner templates for e-commerce launch.',
    'Graphic Design',
    350.00,
    'fixed',
    'one-time',
    'intermediate',
    '2026-11-01',
    'completed',
    'Deliver Adobe Illustrator vector source files and PNG exports.',
    'Bangladesh',
    '2026-10-15 09:00:00'
  );
  const p7Id = Number(p7Res.lastInsertRowid);

  // 8. Link Project Required Skills
  const insertProjectSkill = db.prepare(`
    INSERT INTO project_required_skills (project_id, skill_id, is_mandatory)
    VALUES (?, ?, ?)
  `);

  // Project 1 skills: UI Design, Web Design, Landing Page, Web Development, WordPress, Graphic Design
  ['UI Design', 'Web Design', 'Landing Page', 'Web Development', 'WordPress', 'Graphic Design'].forEach(s => {
    insertProjectSkill.run(p1Id, skillMap.get(s)!, 1);
  });

  // Project 2 skills: Website Redesign (Web Design), Landing Page, Graphic Design, Logo Design, UIUX
  ['Web Design', 'Landing Page', 'Graphic Design', 'Logo Design', 'UIUX'].forEach(s => {
    insertProjectSkill.run(p2Id, skillMap.get(s)!, 1);
  });

  // Project 3 skills: Web Design, Responsive Design, Web Development, WordPress
  ['Web Design', 'Responsive Design', 'Web Development', 'WordPress'].forEach(s => {
    insertProjectSkill.run(p3Id, skillMap.get(s)!, 1);
  });

  // Project 4 skills: Web Design, Adobe Photoshop, Figma, Prototyping, Logo Design
  ['Web Design', 'Adobe Photoshop', 'Figma', 'Prototyping', 'Logo Design'].forEach(s => {
    insertProjectSkill.run(p4Id, skillMap.get(s)!, 1);
  });

  // Project 5 skills: Python, Django, PostgreSQL, REST API
  ['Python', 'Django', 'PostgreSQL', 'REST API'].forEach(s => {
    insertProjectSkill.run(p5Id, skillMap.get(s)!, 1);
  });

  // Project 6 skills: Mobile App, Flutter, Firebase, UIUX
  ['Mobile App', 'Flutter', 'Firebase', 'UIUX'].forEach(s => {
    insertProjectSkill.run(p6Id, skillMap.get(s)!, 1);
  });

  // Project 7 skills: Graphic Design, Logo Design, Figma
  ['Graphic Design', 'Logo Design', 'Figma'].forEach(s => {
    insertProjectSkill.run(p7Id, skillMap.get(s)!, 1);
  });

  console.log('✓ Inserted Projects and linked required skill tags.');

  // 9. Seed Applications (Including Akmal having applied to Project 3, showing "Applied" in UI)
  const insertApplication = db.prepare(`
    INSERT INTO applications (
      project_id, student_id, cover_letter, proposed_rate, delivery_time,
      relevant_experience, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Akmal applied to Project 3 ("Web Designer for E-Commerce Website")
  const app1Res = insertApplication.run(
    p3Id,
    akmalId,
    'Hi Tanvir, I have 3 years of deep experience building and customizing WordPress & WooCommerce themes. I can install your theme, customize the menu, and create high-converting pages within 5 days.',
    25.00,
    '5 days',
    'Designed 12+ responsive e-commerce stores with WooCommerce and Elementor.',
    'under_review',
    '2026-11-15 13:00:00'
  );
  const app1Id = Number(app1Res.lastInsertRowid);

  // Sarah applied to Project 5
  const app2Res = insertApplication.run(
    p5Id,
    sarahId,
    'Hello Jessica, I specialize in Django REST Framework and PostgreSQL optimization. I have previously designed exam and grading platforms for student hackathons.',
    1200.00,
    '14 days',
    'Built campus marketplace API with 100% test coverage.',
    'shortlisted',
    '2026-11-14 11:30:00'
  );
  const app2Id = Number(app2Res.lastInsertRowid);

  // Elena applied to Project 6
  insertApplication.run(
    p6Id,
    elenaId,
    'Hi Marcus, Flutter & Firebase is my daily bread. I have built cross-platform delivery apps with Google Maps location tracking and cloud push notifications.',
    800.00,
    '10 days',
    'Published 4 mobile apps on App Store and Google Play.',
    'accepted',
    '2026-11-13 18:00:00'
  );

  // Akmal completed Project 7 (Brand Identity) in the past
  const app4Res = insertApplication.run(
    p7Id,
    akmalId,
    'I would love to help create the brand guidelines and social media templates for DeshiMart.',
    350.00,
    '7 days',
    'Branding portfolios for 5+ e-commerce brands.',
    'completed',
    '2026-10-16 10:00:00'
  );
  const app4Id = Number(app4Res.lastInsertRowid);

  // Application Status History
  const insertHistory = db.prepare(`
    INSERT INTO application_status_history (application_id, previous_status, new_status, note, changed_by, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  insertHistory.run(app1Id, null, 'pending', 'Application submitted by student', akmalId, '2026-11-15 13:00:00');
  insertHistory.run(app1Id, 'pending', 'under_review', 'Client viewed application', martClientId, '2026-11-15 13:10:00');

  insertHistory.run(app2Id, null, 'pending', 'Application submitted by student', sarahId, '2026-11-14 11:30:00');
  insertHistory.run(app2Id, 'pending', 'shortlisted', 'Candidate shortlisted for interview', eduClientId, '2026-11-14 15:00:00');

  insertHistory.run(app4Id, null, 'pending', 'Application submitted', akmalId, '2026-10-16 10:00:00');
  insertHistory.run(app4Id, 'pending', 'accepted', 'Hired for brand identity', martClientId, '2026-10-17 12:00:00');
  insertHistory.run(app4Id, 'accepted', 'completed', 'Project deliverables accepted', martClientId, '2026-10-24 16:00:00');

  // 10. Seed Reviews (Two-way reviews for Project 7)
  const insertReview = db.prepare(`
    INSERT INTO reviews (project_id, reviewer_id, reviewee_id, reviewer_role, rating, comment, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  // Client reviews student Akmal
  insertReview.run(
    p7Id,
    martClientId,
    akmalId,
    'client',
    5,
    'Akmal did an extraordinary job! The branding kit was delivered ahead of schedule and the visual aesthetics exceeded our expectations. Highly recommended!',
    '2026-10-25 10:00:00'
  );

  // Student Akmal reviews Client DeshiMart
  insertReview.run(
    p7Id,
    akmalId,
    martClientId,
    'student',
    5,
    'Working with Tanvir and DeshiMart was a fantastic experience. Clear guidelines, prompt feedback, and friendly communication throughout.',
    '2026-10-25 11:30:00'
  );

  // 11. Seed Notifications
  const insertNotification = db.prepare(`
    INSERT INTO notifications (user_id, type, title, message, link, is_read, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertNotification.run(
    akmalId,
    'application_under_review',
    'Application Under Review',
    'Your application for "Web Designer for E-Commerce Website" is now under review by DeshiMart.',
    '/student/applications',
    0,
    '2026-11-15 13:10:00'
  );

  insertNotification.run(
    akmalId,
    'new_review',
    '⭐ 5-Star Review Received!',
    'DeshiMart E-Commerce gave you a 5-star review for "Brand Identity & Social Media Graphics Kit"!',
    '/student/profile',
    1,
    '2026-10-25 10:00:00'
  );

  insertNotification.run(
    akmalId,
    'recommendation',
    'New Project Recommendation',
    'A new project "Let\'s Collaborate on HAV\'s Website Redesign" matches 95% of your skill profile!',
    '/browse',
    0,
    '2026-11-15 13:15:00'
  );

  // 12. Seed Reports (For Admin moderation testing)
  const insertReport = db.prepare(`
    INSERT INTO reports (reporter_id, reported_type, reported_id, reason, details, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertReport.run(
    sarahId,
    'project',
    p1Id,
    'Suspicious Budget Terms',
    'Wanted to verify if external off-platform payment was suggested.',
    'pending',
    '2026-11-15 11:00:00'
  );

  console.log('✅ SkillBridge Database Seeding Complete!');
}

// Execute if run directly
runSeed();

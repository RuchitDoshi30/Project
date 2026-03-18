import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import connectDB from '../config/db';
import { User, Problem, Submission, AptitudeQuestion, AptitudeTest, AptitudeAttempt, UserProgress, Announcement, PlacementDrive, BulkEmail } from '../models';

dotenv.config();

// ============================================================
// PRODUCTION-SCALE SEED SCRIPT
// Target: 100K users, 1M aptitude attempts, 200K submissions
// Uses raw collection.insertMany to bypass Mongoose hooks
// ============================================================

// --- Name pools for generating Indian names ---
const FIRST_NAMES = [
  'Aarav','Aditi','Akash','Ananya','Arjun','Bhavya','Chetan','Deepika','Dhruv','Divya',
  'Gaurav','Harini','Ishaan','Janvi','Karan','Kavya','Lakshmi','Manish','Neha','Omkar',
  'Pooja','Pranav','Priya','Rahul','Ritika','Rohit','Sakshi','Sandeep','Shreya','Siddharth',
  'Sneha','Suresh','Tanvi','Tushar','Varun','Vidya','Vikram','Yash','Zara','Aditya',
  'Anjali','Arnav','Disha','Harsh','Isha','Jayesh','Kriti','Mihir','Nidhi','Ruchit',
  'Vivek','Meera','Kunal','Swati','Nikhil','Shweta','Raghav','Pallavi','Amit','Sanjana',
  'Tarun','Aparna','Vishal','Rekha','Sunil','Ankita','Rajesh','Sonali','Manoj','Komal',
  'Raj','Payal','Arun','Swapna','Naveen','Megha','Prasad','Nisha','Ashok','Ritu',
  'Vijay','Archana','Sagar','Poonam','Deepak','Madhuri','Ramesh','Radha','Pankaj','Seema',
  'Girish','Lata','Mohan','Usha','Kishore','Geeta','Dinesh','Hema','Ganesh','Jaya',
];

const LAST_NAMES = [
  'Sharma','Patel','Verma','Iyer','Mehta','Gupta','Reddy','Nair','Joshi','Krishnan',
  'Singh','Das','Kapoor','Desai','Malhotra','Hegde','Rao','Tiwari','Saxena','Patil',
  'Bhatt','Kulkarni','Agarwal','Chauhan','Bajaj','Pandey','Dubey','Mishra','Banerjee','Jain',
  'Choudhary','Kumar','Shah','Goyal','Srinivasan','Menon','Rathore','Agrawal','Bose','Pillai',
  'Sethi','Thakur','Vardhan','Soni','Parmar','Bhagat','Goel','Doshi','Prasad','Arora',
  'Chandra','Shukla','Gandhi','Bhatia','Naik','Karmakar','Sengupta','Mukherjee','Ghosh','Roy',
  'Dutta','Bhargava','Narayan','Dixit','Khanna','Wagh','Gadkari','Pawar','More','Kale',
  'Jadhav','Sawant','Shinde','Kadam','Chavan','Nikam','Mane','Gaikwad','Salunkhe','Deshpande',
  'Jog','Bhosle','Kolte','Mhatre','Shirke','Lad','Gore','Vaidya','Karnik','Joglekar',
  'Ranade','Sathe','Kelkar','Phadke','Gokhale','Apte','Barve','Deo','Nene','Oak',
];

const BRANCHES = ['Computer Engineering','Information Technology','Computer Science','Electronics & Communication','Mechanical','Civil'];
const BRANCH_SHORT = ['CE','IT','CS','EC','ME','CV'];
const SEMESTERS = [3,4,5,6,7,8];
const CATEGORIES = ['Quantitative','Logical','Verbal','Technical'];
const DIFFICULTIES = ['Beginner','Intermediate','Advanced'];

function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

// --- Helper: batch insert ---
async function batchInsert(collection: any, docs: any[], batchSize = 5000, label = '') {
  const total = docs.length;
  for (let i = 0; i < total; i += batchSize) {
    const batch = docs.slice(i, i + batchSize);
    await collection.insertMany(batch, { ordered: false });
    const pct = Math.min(100, Math.round(((i + batch.length) / total) * 100));
    process.stdout.write(`\r   ${label}: ${pct}% (${Math.min(i + batchSize, total).toLocaleString()}/${total.toLocaleString()})`);
  }
  console.log('');
}

// ============================================================
const seedDatabase = async () => {
  const startTime = Date.now();

  try {
    await connectDB();
    const db = mongoose.connection.db!;

    // --- 1. DROP COLLECTIONS ---
    console.log('🗑️  Dropping all collections...');
    const collections = ['users','problems','submissions','aptitudequestions','aptitudetests',
      'aptitudeattempts','userprogresses','announcements','placementdrives','bulkemails'];
    for (const c of collections) {
      try { await db.collection(c).drop(); } catch { /* may not exist */ }
    }

    // --- 2. PRE-HASH PASSWORD ---
    console.log('🔐 Pre-hashing password...');
    const hashedPassword = await bcrypt.hash('student123', 10);
    const adminPassword = await bcrypt.hash('admin123', 10);

    // --- 3. ADMIN ---
    console.log('👤 Creating admin...');
    const adminResult = await db.collection('users').insertOne({
      name: 'Dr. Placement Coordinator', email: 'admin@marwadiuniversity.ac.in',
      universityId: 'ADMIN001', role: 'admin', passwordHash: adminPassword,
      accountStatus: 'active', createdAt: new Date(), updatedAt: new Date(),
    });
    const adminId = adminResult.insertedId;

    // --- 4. STUDENTS (100,000) ---
    console.log('👥 Generating 100,000 students...');
    const studentDocs: any[] = [];
    const usedEmails = new Set<string>();

    for (let i = 0; i < 100000; i++) {
      const firstName = pick(FIRST_NAMES);
      const lastName = pick(LAST_NAMES);
      const grno = String(100000 + i);
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${grno}@marwadiuniversity.ac.in`;

      if (usedEmails.has(email)) continue; // skip rare collisions
      usedEmails.add(email);

      studentDocs.push({
        _id: new mongoose.Types.ObjectId(),
        name: `${firstName} ${lastName}`,
        email,
        universityId: `STU${grno}`,
        role: 'student',
        passwordHash: hashedPassword,
        branch: pick(BRANCHES),
        semester: pick(SEMESTERS),
        enrollmentYear: rand(2022, 2025),
        accountStatus: 'active',
        createdAt: new Date(Date.now() - rand(0, 365) * 86400000),
        updatedAt: new Date(),
      });
    }
    await batchInsert(db.collection('users'), studentDocs, 5000, 'Students');
    const totalStudents = studentDocs.length;
    console.log(`   ✅ ${totalStudents.toLocaleString()} students inserted`);

    // --- 5. PROBLEMS (50) ---
    console.log('💻 Generating 50 problems...');
    const problemTitles = [
      'Two Sum','Valid Parentheses','Merge Two Sorted Lists','Binary Search','Maximum Subarray',
      'Climbing Stairs','Reverse Linked List','Binary Tree Level Order','Contains Duplicate','Best Time to Buy Stock',
      'Valid Anagram','Linked List Cycle','Min Stack','Invert Binary Tree','Symmetric Tree',
      'Maximum Depth of Binary Tree','Single Number','Majority Element','Move Zeroes','Power of Two',
      'Palindrome Linked List','Intersection of Two Linked Lists','Happy Number','Count Primes','Reverse String',
      'First Unique Character','Find All Duplicates','Product of Array Except Self','Longest Substring Without Repeat','Container With Most Water',
      'Three Sum','Letter Combinations','Generate Parentheses','Combination Sum','Permutations',
      'Rotate Image','Group Anagrams','Merge Intervals','Search in Rotated Sorted Array','Word Search',
      'Decode Ways','Unique Paths','Jump Game','Coin Change','Longest Increasing Subsequence',
      'Word Break','House Robber','Course Schedule','Implement Trie','Kth Largest Element',
    ];
    const tags = ['Array','String','Hash Table','Linked List','Stack','Queue','Tree','Graph','DP','Binary Search','Math','Recursion','Sorting','Greedy','Backtracking'];

    const problemDocs: any[] = [];
    for (let i = 0; i < 50; i++) {
      const diff = pick(DIFFICULTIES);
      problemDocs.push({
        _id: new mongoose.Types.ObjectId(),
        slug: problemTitles[i].toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        title: problemTitles[i],
        description: `Solve the ${problemTitles[i]} problem. This is a ${diff.toLowerCase()}-level challenge.`,
        difficulty: diff,
        tags: [pick(tags), pick(tags), pick(tags)].filter((v, idx, a) => a.indexOf(v) === idx),
        constraints: '1 <= input size <= 10^5',
        testCases: [
          { input: 'sample_input_1', expectedOutput: 'sample_output_1', isHidden: false },
          { input: 'sample_input_2', expectedOutput: 'sample_output_2', isHidden: true },
        ],
        createdBy: adminId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    await db.collection('problems').insertMany(problemDocs);
    console.log('   ✅ 50 problems inserted');

    // --- 6. APTITUDE QUESTIONS (100) ---
    console.log('📝 Generating 100 aptitude questions...');
    const questionDocs: any[] = [];
    const questionTemplates = [
      { q: 'If a train travels {D} km in {T} hours, what is its speed?', cat: 'Quantitative' },
      { q: 'What is {P}% of {N}?', cat: 'Quantitative' },
      { q: 'Find the odd one out: {SEQ}', cat: 'Logical' },
      { q: 'Choose the word most similar to "{W}"', cat: 'Verbal' },
      { q: 'What does {TECH} stand for?', cat: 'Technical' },
    ];

    for (let i = 0; i < 100; i++) {
      const template = questionTemplates[i % questionTemplates.length];
      const correctIdx = rand(0, 3);
      questionDocs.push({
        _id: new mongoose.Types.ObjectId(),
        question: `Q${i + 1}: ${template.q.replace(/{[^}]+}/g, String(rand(10, 500)))}`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctOptionIndex: correctIdx,
        category: template.cat,
        difficulty: pick(DIFFICULTIES),
        explanation: `Correct answer is option ${String.fromCharCode(65 + correctIdx)}.`,
        createdBy: adminId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    await db.collection('aptitudequestions').insertMany(questionDocs);
    console.log('   ✅ 100 questions inserted');

    // --- 7. APTITUDE TESTS (20) ---
    console.log('📋 Generating 20 aptitude tests...');
    const testDocs: any[] = [];
    for (let i = 0; i < 20; i++) {
      const numQ = rand(5, 15);
      const qIds = [];
      for (let j = 0; j < numQ; j++) qIds.push(questionDocs[rand(0, 99)]._id);
      testDocs.push({
        _id: new mongoose.Types.ObjectId(),
        title: `Aptitude Test ${i + 1} — ${pick(CATEGORIES)}`,
        description: `Assessment test #${i + 1}`,
        category: pick(CATEGORIES),
        questions: qIds,
        duration: rand(10, 30),
        passingPercentage: rand(50, 80),
        createdBy: adminId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    await db.collection('aptitudetests').insertMany(testDocs);
    console.log('   ✅ 20 tests inserted');

    // --- 8. SUBMISSIONS (200,000) ---
    console.log('📤 Generating 200,000 submissions...');
    const statuses = ['Accepted','Wrong Answer','Pending Review','Time Limit Exceeded','Runtime Error'];
    const languages = ['javascript','python','java','cpp'];
    const submissionDocs: any[] = [];
    for (let i = 0; i < 200000; i++) {
      const student = studentDocs[i % totalStudents];
      const problem = problemDocs[i % 50];
      const status = pick(statuses);
      const totalTC = 10;
      submissionDocs.push({
        problemId: problem._id,
        userId: student._id,
        code: `// Solution by ${student.name}\nfunction solve() { /* ... */ }`,
        language: pick(languages),
        status,
        testCasesPassed: status === 'Accepted' ? totalTC : rand(0, totalTC - 1),
        totalTestCases: totalTC,
        submittedAt: new Date(Date.now() - rand(0, 180) * 86400000),
      });
    }
    await batchInsert(db.collection('submissions'), submissionDocs, 10000, 'Submissions');
    console.log('   ✅ 200,000 submissions inserted');

    // --- 9. APTITUDE ATTEMPTS (1,000,000) ---
    console.log('✍️  Generating 1,000,000 aptitude attempts (this takes a few minutes)...');
    const attemptDocs: any[] = [];
    for (let i = 0; i < 1000000; i++) {
      const student = studentDocs[i % totalStudents];
      const test = testDocs[i % 20];
      const testQs = test.questions as any[];
      const numQ = testQs.length;
      const correctCount = rand(0, numQ);
      const score = Math.round((correctCount / numQ) * 100);

      attemptDocs.push({
        testId: test._id,
        userId: student._id,
        answers: testQs.map((qId: any) => ({
          questionId: qId,
          selectedOption: rand(0, 3),
          isConfident: Math.random() > 0.5,
        })),
        score,
        totalQuestions: numQ,
        passed: score >= test.passingPercentage,
        completedAt: new Date(Date.now() - rand(0, 365) * 86400000),
      });

      // Flush every 50K to avoid memory pressure
      if (attemptDocs.length >= 50000) {
        await batchInsert(db.collection('aptitudeattempts'), attemptDocs, 10000, 'Attempts');
        attemptDocs.length = 0;
      }
    }
    if (attemptDocs.length > 0) {
      await batchInsert(db.collection('aptitudeattempts'), attemptDocs, 10000, 'Attempts');
    }
    console.log('   ✅ 1,000,000 attempts inserted');

    // --- 10. USER PROGRESS (100,000) ---
    console.log('📈 Generating user progress for all students...');
    const progressDocs: any[] = [];
    for (let i = 0; i < totalStudents; i++) {
      progressDocs.push({
        userId: studentDocs[i]._id,
        problemsSolved: { easy: rand(0, 15), medium: rand(0, 10), hard: rand(0, 5) },
        aptitudeTestsTaken: rand(1, 20),
        totalSubmissions: rand(1, 30),
        lastActiveDate: new Date(Date.now() - rand(0, 30) * 86400000),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    await batchInsert(db.collection('userprogresses'), progressDocs, 5000, 'UserProgress');
    console.log('   ✅ User progress inserted');

    // --- 11. ANNOUNCEMENTS (15) ---
    console.log('📢 Inserting 15 announcements...');
    const annDocs: any[] = [];
    const companies = ['TCS','Infosys','Wipro','Cognizant','Deloitte','Amazon','Microsoft','Google','Flipkart','Accenture','HCL','Tech Mahindra','L&T','Capgemini','Reliance Jio'];
    const priorities = ['Normal','Important','Urgent'];
    for (let i = 0; i < 15; i++) {
      annDocs.push({
        title: `${companies[i]} — Campus Drive ${2026}`,
        body: `${companies[i]} will conduct a recruitment drive. Register through the portal. Eligible branches: ${pick(BRANCH_SHORT)}, ${pick(BRANCH_SHORT)}.`,
        priority: pick(priorities),
        targetAudience: `${pick(BRANCH_SHORT)}, ${pick(BRANCH_SHORT)} — Batch 2026`,
        expiresAt: new Date(Date.now() + rand(30, 120) * 86400000),
        isPinned: i < 3,
        author: 'Dr. Placement Coordinator',
        views: rand(50, 500),
        createdAt: new Date(Date.now() - rand(0, 60) * 86400000),
        updatedAt: new Date(),
      });
    }
    await db.collection('announcements').insertMany(annDocs);
    console.log('   ✅ 15 announcements inserted');

    // --- 12. PLACEMENT DRIVES (12) ---
    console.log('🏢 Inserting 12 placement drives...');
    const driveDocs: any[] = [];
    const driveStatuses = ['Upcoming','Ongoing','Completed','Cancelled'];
    for (let i = 0; i < 12; i++) {
      const regStudents = rand(20, 200);
      driveDocs.push({
        companyName: companies[i],
        jobRole: pick(['Software Developer','Systems Engineer','Analyst','Project Engineer','SDE Intern','Data Analyst','Quality Analyst','DevOps Engineer','Cloud Engineer','Full Stack Developer','Backend Developer','Frontend Developer']),
        packageLPA: String(rand(35, 150) / 10),
        driveDate: new Date(Date.now() + rand(-60, 90) * 86400000),
        lastDateToApply: new Date(Date.now() + rand(-65, 85) * 86400000),
        location: pick(['Campus - Main Auditorium','Campus - Seminar Hall','Campus - Block A','Virtual (Online)','Campus - Conference Centre']),
        eligibleBranches: [pick(BRANCH_SHORT), pick(BRANCH_SHORT), pick(BRANCH_SHORT)].filter((v, idx, a) => a.indexOf(v) === idx),
        minCGPA: rand(55, 80) / 10,
        status: pick(driveStatuses),
        rounds: ['Online Test', 'Technical Interview', 'HR Interview'].slice(0, rand(2, 3)),
        registeredStudents: regStudents,
        selectedStudents: rand(0, Math.floor(regStudents / 3)),
        description: `${companies[i]} campus recruitment drive for ${2026} batch.`,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    await db.collection('placementdrives').insertMany(driveDocs);
    console.log('   ✅ 12 drives inserted');

    // --- 13. BULK EMAILS (10) ---
    console.log('📧 Inserting 10 bulk email records...');
    const emailDocs: any[] = [];
    for (let i = 0; i < 10; i++) {
      emailDocs.push({
        subject: `[${companies[i]}] Campus Drive Notification`,
        body: `Dear Students, ${companies[i]} is visiting our campus for recruitment...`,
        filters: { branches: [pick(BRANCH_SHORT)], batch: '2026' },
        recipientCount: rand(50, 500),
        status: 'Delivered',
        sentBy: adminId,
        sentAt: new Date(Date.now() - rand(1, 60) * 86400000),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    await db.collection('bulkemails').insertMany(emailDocs);
    console.log('   ✅ 10 bulk emails inserted');

    console.log('\n🔧 Rebuilding indexes...');
    // Force Mongoose models to sync their indexes
    await Promise.all([
      User.syncIndexes(),
      Problem.syncIndexes(),
      Submission.syncIndexes(),
      AptitudeQuestion.syncIndexes(),
      AptitudeTest.syncIndexes(),
      AptitudeAttempt.syncIndexes(),
      UserProgress.syncIndexes(),
      Announcement.syncIndexes(),
      PlacementDrive.syncIndexes(),
      BulkEmail.syncIndexes(),
    ]);
    console.log('   ✅ All indexes synced\n');

    // --- SUMMARY ---
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('='.repeat(55));
    console.log('✅ DATABASE SEEDED SUCCESSFULLY');
    console.log('='.repeat(55));
    console.log(`   Admin:             1`);
    console.log(`   Students:          ${totalStudents.toLocaleString()}`);
    console.log(`   Problems:          50`);
    console.log(`   Aptitude Questions: 100`);
    console.log(`   Aptitude Tests:    20`);
    console.log(`   Submissions:       200,000`);
    console.log(`   Aptitude Attempts: 1,000,000`);
    console.log(`   User Progress:     ${totalStudents.toLocaleString()}`);
    console.log(`   Announcements:     15`);
    console.log(`   Placement Drives:  12`);
    console.log(`   Bulk Emails:       10`);
    console.log(`   ⏱️  Time: ${elapsed}s`);
    console.log('='.repeat(55));
    console.log('\n🔑 Credentials:');
    console.log('   Admin:   admin@marwadiuniversity.ac.in / admin123');
    console.log('   Student: any student email / student123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();

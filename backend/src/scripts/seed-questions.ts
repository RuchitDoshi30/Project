/**
 * Seed Script: 100 Coding Problems + 200 Aptitude Questions + 20 Tests
 * Run: npx ts-node src/scripts/seed-questions.ts
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/placement_portal';

// ─── Coding Problems Data ──────────────────────────────────────────
interface ProblemData {
  slug: string; title: string; description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  tags: string[]; constraints: string;
  testCases: { input: string; expectedOutput: string; isHidden: boolean }[];
}

const codingProblems: ProblemData[] = [
  // ── BEGINNER (40) ──
  { slug: 'two-sum', title: 'Two Sum', description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.', difficulty: 'Beginner', tags: ['Arrays', 'Hash Table'], constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9', testCases: [{ input: 'nums = [2,7,11,15], target = 9', expectedOutput: '[0,1]', isHidden: false }, { input: 'nums = [3,2,4], target = 6', expectedOutput: '[1,2]', isHidden: true }] },
  { slug: 'reverse-string', title: 'Reverse String', description: 'Write a function that reverses a string. The input string is given as an array of characters `s`.\n\nYou must do this by modifying the input array in-place with O(1) extra memory.', difficulty: 'Beginner', tags: ['Strings', 'Two Pointers'], constraints: '1 <= s.length <= 10^5\ns[i] is a printable ascii character', testCases: [{ input: 's = ["h","e","l","l","o"]', expectedOutput: '["o","l","l","e","h"]', isHidden: false }, { input: 's = ["H","a","n","n","a","h"]', expectedOutput: '["h","a","n","n","a","H"]', isHidden: false }] },
  { slug: 'valid-parentheses', title: 'Valid Parentheses', description: 'Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.', difficulty: 'Beginner', tags: ['Stack', 'Strings'], constraints: '1 <= s.length <= 10^4\ns consists of parentheses only', testCases: [{ input: 's = "()"', expectedOutput: 'true', isHidden: false }, { input: 's = "()[]{}"', expectedOutput: 'true', isHidden: false }, { input: 's = "(]"', expectedOutput: 'false', isHidden: true }] },
  { slug: 'palindrome-number', title: 'Palindrome Number', description: 'Given an integer `x`, return `true` if `x` is a palindrome, and `false` otherwise.\n\nAn integer is a palindrome when it reads the same forward and backward.', difficulty: 'Beginner', tags: ['Math'], constraints: '-2^31 <= x <= 2^31 - 1', testCases: [{ input: 'x = 121', expectedOutput: 'true', isHidden: false }, { input: 'x = -121', expectedOutput: 'false', isHidden: false }] },
  { slug: 'fizz-buzz', title: 'Fizz Buzz', description: 'Given an integer `n`, return a string array `answer` (1-indexed) where:\n- `answer[i] == "FizzBuzz"` if `i` is divisible by 3 and 5.\n- `answer[i] == "Fizz"` if `i` is divisible by 3.\n- `answer[i] == "Buzz"` if `i` is divisible by 5.\n- `answer[i] == i` (as a string) if none of the above conditions are true.', difficulty: 'Beginner', tags: ['Math', 'Strings'], constraints: '1 <= n <= 10^4', testCases: [{ input: 'n = 3', expectedOutput: '["1","2","Fizz"]', isHidden: false }, { input: 'n = 5', expectedOutput: '["1","2","Fizz","4","Buzz"]', isHidden: false }] },
  { slug: 'maximum-subarray', title: 'Maximum Subarray', description: 'Given an integer array `nums`, find the subarray with the largest sum, and return its sum.\n\nA subarray is a contiguous non-empty sequence of elements within an array.', difficulty: 'Beginner', tags: ['Arrays', 'Dynamic Programming'], constraints: '1 <= nums.length <= 10^5\n-10^4 <= nums[i] <= 10^4', testCases: [{ input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', expectedOutput: '6', isHidden: false }, { input: 'nums = [1]', expectedOutput: '1', isHidden: false }] },
  { slug: 'roman-to-integer', title: 'Roman to Integer', description: 'Roman numerals are represented by seven different symbols: I, V, X, L, C, D and M.\n\nGiven a roman numeral, convert it to an integer.', difficulty: 'Beginner', tags: ['Math', 'Strings', 'Hash Table'], constraints: '1 <= s.length <= 15\ns contains only characters (I, V, X, L, C, D, M)', testCases: [{ input: 's = "III"', expectedOutput: '3', isHidden: false }, { input: 's = "LVIII"', expectedOutput: '58', isHidden: false }] },
  { slug: 'merge-sorted-array', title: 'Merge Sorted Array', description: 'You are given two integer arrays `nums1` and `nums2`, sorted in non-decreasing order, and two integers `m` and `n`, representing the number of elements in `nums1` and `nums2` respectively.\n\nMerge `nums2` into `nums1` as one sorted array.', difficulty: 'Beginner', tags: ['Arrays', 'Two Pointers', 'Sorting'], constraints: 'nums1.length == m + n\nnums2.length == n\n0 <= m, n <= 200', testCases: [{ input: 'nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3', expectedOutput: '[1,2,2,3,5,6]', isHidden: false }] },
  { slug: 'best-time-to-buy-sell-stock', title: 'Best Time to Buy and Sell Stock', description: 'You are given an array `prices` where `prices[i]` is the price of a given stock on the ith day.\n\nYou want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.\n\nReturn the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.', difficulty: 'Beginner', tags: ['Arrays', 'Dynamic Programming'], constraints: '1 <= prices.length <= 10^5\n0 <= prices[i] <= 10^4', testCases: [{ input: 'prices = [7,1,5,3,6,4]', expectedOutput: '5', isHidden: false }, { input: 'prices = [7,6,4,3,1]', expectedOutput: '0', isHidden: true }] },
  { slug: 'single-number', title: 'Single Number', description: 'Given a non-empty array of integers `nums`, every element appears twice except for one. Find that single one.\n\nYou must implement a solution with a linear runtime complexity and use only constant extra space.', difficulty: 'Beginner', tags: ['Arrays', 'Bit Manipulation'], constraints: '1 <= nums.length <= 3 * 10^4\n-3 * 10^4 <= nums[i] <= 3 * 10^4', testCases: [{ input: 'nums = [2,2,1]', expectedOutput: '1', isHidden: false }, { input: 'nums = [4,1,2,1,2]', expectedOutput: '4', isHidden: false }] },
  { slug: 'contains-duplicate', title: 'Contains Duplicate', description: 'Given an integer array `nums`, return `true` if any value appears at least twice in the array, and return `false` if every element is distinct.', difficulty: 'Beginner', tags: ['Arrays', 'Hash Table', 'Sorting'], constraints: '1 <= nums.length <= 10^5\n-10^9 <= nums[i] <= 10^9', testCases: [{ input: 'nums = [1,2,3,1]', expectedOutput: 'true', isHidden: false }, { input: 'nums = [1,2,3,4]', expectedOutput: 'false', isHidden: false }] },
  { slug: 'move-zeroes', title: 'Move Zeroes', description: 'Given an integer array `nums`, move all 0s to the end of it while maintaining the relative order of the non-zero elements.\n\nNote that you must do this in-place without making a copy of the array.', difficulty: 'Beginner', tags: ['Arrays', 'Two Pointers'], constraints: '1 <= nums.length <= 10^4\n-2^31 <= nums[i] <= 2^31 - 1', testCases: [{ input: 'nums = [0,1,0,3,12]', expectedOutput: '[1,3,12,0,0]', isHidden: false }] },
  { slug: 'plus-one', title: 'Plus One', description: 'You are given a large integer represented as an integer array `digits`, where each `digits[i]` is the ith digit of the integer. The digits are ordered from most significant to least significant in left-to-right order.\n\nIncrement the large integer by one and return the resulting array of digits.', difficulty: 'Beginner', tags: ['Arrays', 'Math'], constraints: '1 <= digits.length <= 100\n0 <= digits[i] <= 9', testCases: [{ input: 'digits = [1,2,3]', expectedOutput: '[1,2,4]', isHidden: false }, { input: 'digits = [9,9,9]', expectedOutput: '[1,0,0,0]', isHidden: true }] },
  { slug: 'remove-duplicates-sorted-array', title: 'Remove Duplicates from Sorted Array', description: 'Given an integer array `nums` sorted in non-decreasing order, remove the duplicates in-place such that each unique element appears only once. The relative order of the elements should be kept the same.\n\nReturn the number of unique elements.', difficulty: 'Beginner', tags: ['Arrays', 'Two Pointers'], constraints: '1 <= nums.length <= 3 * 10^4\n-100 <= nums[i] <= 100', testCases: [{ input: 'nums = [1,1,2]', expectedOutput: '2', isHidden: false }] },
  { slug: 'climbing-stairs', title: 'Climbing Stairs', description: 'You are climbing a staircase. It takes `n` steps to reach the top.\n\nEach time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?', difficulty: 'Beginner', tags: ['Dynamic Programming', 'Math'], constraints: '1 <= n <= 45', testCases: [{ input: 'n = 2', expectedOutput: '2', isHidden: false }, { input: 'n = 3', expectedOutput: '3', isHidden: false }] },
  { slug: 'intersection-of-two-arrays-ii', title: 'Intersection of Two Arrays II', description: 'Given two integer arrays `nums1` and `nums2`, return an array of their intersection. Each element in the result must appear as many times as it shows in both arrays.', difficulty: 'Beginner', tags: ['Arrays', 'Hash Table', 'Sorting'], constraints: '1 <= nums1.length, nums2.length <= 1000\n0 <= nums1[i], nums2[i] <= 1000', testCases: [{ input: 'nums1 = [1,2,2,1], nums2 = [2,2]', expectedOutput: '[2,2]', isHidden: false }] },
  { slug: 'missing-number', title: 'Missing Number', description: 'Given an array `nums` containing `n` distinct numbers in the range `[0, n]`, return the only number in the range that is missing from the array.', difficulty: 'Beginner', tags: ['Arrays', 'Math', 'Bit Manipulation'], constraints: 'n == nums.length\n1 <= n <= 10^4', testCases: [{ input: 'nums = [3,0,1]', expectedOutput: '2', isHidden: false }, { input: 'nums = [0,1]', expectedOutput: '2', isHidden: false }] },
  { slug: 'power-of-two', title: 'Power of Two', description: 'Given an integer `n`, return `true` if it is a power of two. Otherwise, return `false`.', difficulty: 'Beginner', tags: ['Math', 'Bit Manipulation'], constraints: '-2^31 <= n <= 2^31 - 1', testCases: [{ input: 'n = 1', expectedOutput: 'true', isHidden: false }, { input: 'n = 16', expectedOutput: 'true', isHidden: false }, { input: 'n = 3', expectedOutput: 'false', isHidden: true }] },
  { slug: 'valid-anagram', title: 'Valid Anagram', description: 'Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise.', difficulty: 'Beginner', tags: ['Strings', 'Hash Table', 'Sorting'], constraints: '1 <= s.length, t.length <= 5 * 10^4\ns and t consist of lowercase English letters', testCases: [{ input: 's = "anagram", t = "nagaram"', expectedOutput: 'true', isHidden: false }, { input: 's = "rat", t = "car"', expectedOutput: 'false', isHidden: false }] },
  { slug: 'majority-element', title: 'Majority Element', description: 'Given an array `nums` of size `n`, return the majority element.\n\nThe majority element is the element that appears more than ⌊n / 2⌋ times.', difficulty: 'Beginner', tags: ['Arrays', 'Hash Table', 'Sorting'], constraints: 'n == nums.length\n1 <= n <= 5 * 10^4', testCases: [{ input: 'nums = [3,2,3]', expectedOutput: '3', isHidden: false }, { input: 'nums = [2,2,1,1,1,2,2]', expectedOutput: '2', isHidden: false }] },
  ..._generateBeginnerProblems(),
  // ── INTERMEDIATE (35) ──
  ..._generateIntermediateProblems(),
  // ── ADVANCED (25) ──
  ..._generateAdvancedProblems(),
];

function _generateBeginnerProblems(): ProblemData[] {
  const extra: [string, string, string[]][] = [
    ['count-primes', 'Count Primes', ['Math']],
    ['power-of-three', 'Power of Three', ['Math']],
    ['reverse-linked-list', 'Reverse Linked List', ['Linked List', 'Recursion']],
    ['merge-two-sorted-lists', 'Merge Two Sorted Lists', ['Linked List']],
    ['symmetric-tree', 'Symmetric Tree', ['Trees', 'BFS', 'DFS']],
    ['maximum-depth-binary-tree', 'Maximum Depth of Binary Tree', ['Trees', 'DFS']],
    ['binary-search', 'Binary Search', ['Arrays', 'Binary Search']],
    ['first-bad-version', 'First Bad Version', ['Binary Search']],
    ['ransom-note', 'Ransom Note', ['Strings', 'Hash Table']],
    ['isomorphic-strings', 'Isomorphic Strings', ['Strings', 'Hash Table']],
    ['happy-number', 'Happy Number', ['Math', 'Hash Table']],
    ['excel-sheet-column-number', 'Excel Sheet Column Number', ['Math', 'Strings']],
    ['linked-list-cycle', 'Linked List Cycle', ['Linked List', 'Two Pointers']],
    ['min-stack', 'Min Stack', ['Stack', 'Design']],
    ['implement-queue-using-stacks', 'Implement Queue using Stacks', ['Stack', 'Queue', 'Design']],
    ['sqrt-x', 'Sqrt(x)', ['Math', 'Binary Search']],
    ['length-of-last-word', 'Length of Last Word', ['Strings']],
    ['add-binary', 'Add Binary', ['Math', 'Strings', 'Bit Manipulation']],
    ['pascals-triangle', 'Pascal\'s Triangle', ['Arrays', 'Dynamic Programming']],
    ['search-insert-position', 'Search Insert Position', ['Arrays', 'Binary Search']],
  ];
  return extra.map(([slug, title, tags]) => ({
    slug, title,
    description: `Implement a solution for the classic "${title}" problem.\n\nThis is a fundamental problem that tests your understanding of ${tags.join(', ')}.`,
    difficulty: 'Beginner' as const, tags,
    constraints: 'Standard constraints apply.\nInput size <= 10^4',
    testCases: [{ input: 'See problem description', expectedOutput: 'See expected output', isHidden: false }],
  }));
}

function _generateIntermediateProblems(): ProblemData[] {
  const problems: [string, string, string[]][] = [
    ['add-two-numbers', 'Add Two Numbers', ['Linked List', 'Math']],
    ['longest-substring-without-repeating', 'Longest Substring Without Repeating Characters', ['Strings', 'Sliding Window', 'Hash Table']],
    ['container-with-most-water', 'Container With Most Water', ['Arrays', 'Two Pointers', 'Greedy']],
    ['three-sum', 'Three Sum', ['Arrays', 'Two Pointers', 'Sorting']],
    ['letter-combinations-phone', 'Letter Combinations of a Phone Number', ['Strings', 'Backtracking']],
    ['remove-nth-node-from-end', 'Remove Nth Node From End of List', ['Linked List', 'Two Pointers']],
    ['generate-parentheses', 'Generate Parentheses', ['Strings', 'Backtracking', 'Dynamic Programming']],
    ['search-rotated-sorted-array', 'Search in Rotated Sorted Array', ['Arrays', 'Binary Search']],
    ['find-first-last-position', 'Find First and Last Position of Element', ['Arrays', 'Binary Search']],
    ['combination-sum', 'Combination Sum', ['Arrays', 'Backtracking']],
    ['rotate-image', 'Rotate Image', ['Arrays', 'Math', 'Matrix']],
    ['group-anagrams', 'Group Anagrams', ['Strings', 'Hash Table', 'Sorting']],
    ['pow-x-n', 'Pow(x, n)', ['Math', 'Recursion']],
    ['spiral-matrix', 'Spiral Matrix', ['Arrays', 'Matrix']],
    ['jump-game', 'Jump Game', ['Arrays', 'Dynamic Programming', 'Greedy']],
    ['merge-intervals', 'Merge Intervals', ['Arrays', 'Sorting']],
    ['unique-paths', 'Unique Paths', ['Math', 'Dynamic Programming']],
    ['sort-colors', 'Sort Colors', ['Arrays', 'Two Pointers', 'Sorting']],
    ['subsets', 'Subsets', ['Arrays', 'Backtracking', 'Bit Manipulation']],
    ['word-search', 'Word Search', ['Arrays', 'Backtracking', 'Matrix']],
    ['decode-ways', 'Decode Ways', ['Strings', 'Dynamic Programming']],
    ['validate-bst', 'Validate Binary Search Tree', ['Trees', 'DFS', 'BST']],
    ['binary-tree-level-order', 'Binary Tree Level Order Traversal', ['Trees', 'BFS']],
    ['construct-binary-tree', 'Construct Binary Tree from Preorder and Inorder', ['Trees', 'Arrays', 'Recursion']],
    ['flatten-binary-tree', 'Flatten Binary Tree to Linked List', ['Trees', 'DFS', 'Linked List']],
    ['lru-cache', 'LRU Cache', ['Hash Table', 'Linked List', 'Design']],
    ['coin-change', 'Coin Change', ['Arrays', 'Dynamic Programming', 'BFS']],
    ['product-except-self', 'Product of Array Except Self', ['Arrays', 'Prefix Sum']],
    ['find-peak-element', 'Find Peak Element', ['Arrays', 'Binary Search']],
    ['top-k-frequent-elements', 'Top K Frequent Elements', ['Arrays', 'Hash Table', 'Heap']],
    ['kth-largest-element', 'Kth Largest Element in an Array', ['Arrays', 'Sorting', 'Heap']],
    ['longest-increasing-subsequence', 'Longest Increasing Subsequence', ['Arrays', 'Dynamic Programming', 'Binary Search']],
    ['course-schedule', 'Course Schedule', ['Graphs', 'DFS', 'BFS', 'Topological Sort']],
    ['number-of-islands', 'Number of Islands', ['Arrays', 'DFS', 'BFS', 'Matrix']],
    ['house-robber', 'House Robber', ['Arrays', 'Dynamic Programming']],
  ];
  return problems.map(([slug, title, tags]) => ({
    slug, title,
    description: `Solve the "${title}" problem.\n\nThis medium-difficulty problem tests your knowledge of ${tags.join(', ')}.\n\nProvide an efficient solution with optimal time and space complexity.`,
    difficulty: 'Intermediate' as const, tags,
    constraints: 'Standard constraints apply.\nInput size up to 10^5',
    testCases: [
      { input: 'See problem description', expectedOutput: 'See expected output', isHidden: false },
      { input: 'Edge case input', expectedOutput: 'Edge case output', isHidden: true },
    ],
  }));
}

function _generateAdvancedProblems(): ProblemData[] {
  const problems: [string, string, string[]][] = [
    ['median-two-sorted-arrays', 'Median of Two Sorted Arrays', ['Arrays', 'Binary Search', 'Divide and Conquer']],
    ['regular-expression-matching', 'Regular Expression Matching', ['Strings', 'Dynamic Programming', 'Recursion']],
    ['merge-k-sorted-lists', 'Merge k Sorted Lists', ['Linked List', 'Heap', 'Divide and Conquer']],
    ['trapping-rain-water', 'Trapping Rain Water', ['Arrays', 'Two Pointers', 'Dynamic Programming', 'Stack']],
    ['wildcard-matching', 'Wildcard Matching', ['Strings', 'Dynamic Programming', 'Greedy']],
    ['n-queens', 'N-Queens', ['Arrays', 'Backtracking']],
    ['minimum-window-substring', 'Minimum Window Substring', ['Strings', 'Sliding Window', 'Hash Table']],
    ['largest-rectangle-histogram', 'Largest Rectangle in Histogram', ['Arrays', 'Stack']],
    ['maximal-rectangle', 'Maximal Rectangle', ['Arrays', 'Dynamic Programming', 'Stack', 'Matrix']],
    ['word-ladder', 'Word Ladder', ['Strings', 'BFS', 'Hash Table']],
    ['word-break-ii', 'Word Break II', ['Strings', 'Dynamic Programming', 'Backtracking']],
    ['longest-valid-parentheses', 'Longest Valid Parentheses', ['Strings', 'Dynamic Programming', 'Stack']],
    ['sudoku-solver', 'Sudoku Solver', ['Arrays', 'Backtracking', 'Matrix']],
    ['first-missing-positive', 'First Missing Positive', ['Arrays', 'Hash Table']],
    ['edit-distance', 'Edit Distance', ['Strings', 'Dynamic Programming']],
    ['binary-tree-max-path-sum', 'Binary Tree Maximum Path Sum', ['Trees', 'DFS', 'Dynamic Programming']],
    ['serialize-deserialize-bt', 'Serialize and Deserialize Binary Tree', ['Trees', 'DFS', 'BFS', 'Design']],
    ['alien-dictionary', 'Alien Dictionary', ['Strings', 'Graphs', 'Topological Sort']],
    ['burst-balloons', 'Burst Balloons', ['Arrays', 'Dynamic Programming']],
    ['count-smaller-after-self', 'Count of Smaller Numbers After Self', ['Arrays', 'Binary Search', 'Divide and Conquer']],
    ['longest-consecutive-sequence', 'Longest Consecutive Sequence', ['Arrays', 'Hash Table']],
    ['dungeon-game', 'Dungeon Game', ['Arrays', 'Dynamic Programming', 'Matrix']],
    ['palindrome-partitioning-ii', 'Palindrome Partitioning II', ['Strings', 'Dynamic Programming']],
    ['critical-connections', 'Critical Connections in a Network', ['Graphs', 'DFS']],
    ['swim-in-rising-water', 'Swim in Rising Water', ['Arrays', 'Graphs', 'Binary Search', 'Heap']],
  ];
  return problems.map(([slug, title, tags]) => ({
    slug, title,
    description: `Solve the advanced "${title}" problem.\n\nThis is a challenging problem requiring deep understanding of ${tags.join(', ')}.\n\nAim for the most optimal time and space complexity possible.`,
    difficulty: 'Advanced' as const, tags,
    constraints: 'Standard constraints apply.\nOptimal solution required for large inputs.',
    testCases: [
      { input: 'See problem description', expectedOutput: 'See expected output', isHidden: false },
      { input: 'Large input test', expectedOutput: 'Expected output', isHidden: true },
    ],
  }));
}

// ─── Aptitude Questions Data ──────────────────────────────────────────
// Stored in separate file to keep this manageable
import { aptitudeQuestions } from './aptitude-data';

// ─── Main Seed Function ──────────────────────────────────────────
async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db!;

  // Get admin user for createdBy
  const adminUser = await db.collection('users').findOne({ role: 'admin' });
  if (!adminUser) { console.error('No admin user found. Run main seed first.'); process.exit(1); }
  const adminId = adminUser._id;

  // Drop old data
  console.log('Dropping old problems, questions, and tests...');
  await db.collection('problems').deleteMany({});
  await db.collection('aptitudequestions').deleteMany({});
  await db.collection('aptitudetests').deleteMany({});

  // Insert coding problems
  console.log(`Inserting ${codingProblems.length} coding problems...`);
  const problemDocs = codingProblems.map(p => ({ ...p, createdBy: adminId, createdAt: new Date(), updatedAt: new Date() }));
  await db.collection('problems').insertMany(problemDocs);
  console.log(`✅ ${codingProblems.length} coding problems inserted`);

  // Insert aptitude questions
  console.log(`Inserting ${aptitudeQuestions.length} aptitude questions...`);
  const questionDocs = aptitudeQuestions.map(q => ({ ...q, createdBy: adminId, createdAt: new Date(), updatedAt: new Date() }));
  const insertedQuestions = await db.collection('aptitudequestions').insertMany(questionDocs);
  const questionIds = Object.values(insertedQuestions.insertedIds);
  console.log(`✅ ${aptitudeQuestions.length} aptitude questions inserted`);

  // Create aptitude tests (5 per category, 10 questions each)
  const categories = ['Quantitative', 'Logical', 'Verbal', 'Technical'] as const;
  const tests: any[] = [];

  for (const cat of categories) {
    const catQuestionIds = questionIds.filter((_, idx) => aptitudeQuestions[idx].category === cat);
    for (let i = 0; i < 5; i++) {
      const start = i * 10;
      const testQuestionIds = catQuestionIds.slice(start, start + 10);
      if (testQuestionIds.length < 5) continue; // Skip if not enough questions
      tests.push({
        title: `${cat} Test ${i + 1}`,
        description: `${cat} aptitude test covering fundamental concepts. Test ${i + 1} of 5.`,
        category: cat,
        questions: testQuestionIds,
        duration: 15,
        passingPercentage: 60,
        createdBy: adminId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  console.log(`Inserting ${tests.length} aptitude tests...`);
  await db.collection('aptitudetests').insertMany(tests);
  console.log(`✅ ${tests.length} aptitude tests inserted`);

  console.log('\n🎉 Seed complete!');
  console.log(`   Problems:  ${codingProblems.length}`);
  console.log(`   Questions: ${aptitudeQuestions.length}`);
  console.log(`   Tests:     ${tests.length}`);

  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });

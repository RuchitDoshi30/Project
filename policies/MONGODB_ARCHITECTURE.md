# 📊 MongoDB Architecture & Database Design
## Placement Preparation Platform for Engineering Students

This document details the production-ready MongoDB architecture for the application, designed as per the `DATABASE_DESIGN.md` guidelines. It translates relational logic into NoSQL constructs like embedding, referencing, indexing, and aggregation pipelines.

---

## 1. List of Collections

The system revolves around the following MongoDB collections:

1. **`users`**: Stores student and admin profiles.
2. **`problems`**: Stores programming problems. Includes embedded `testCases`.
3. **`submissions`**: Tracks coding problem submissions and review statuses.
4. **`aptitudequestions`**: Stores pure MCQs with categories and difficulties.
5. **`aptitudetests`**: Groups questions together by references.
6. **`aptitudeattempts`**: Records student attempts for specific tests.
7. **`userprogresses`**: A derived analytics collection containing summary statistics of user activity.

---

## 2. Schema Normalization Strategy

We follow a hybrid approach prioritizing read performance:

### What is Embedded?
- **Test Cases in Coding Problems**: We embed `testCases` within `problems` because they are strictly bound to a problem, only bounded up to a reasonable limit (e.g., 20 cases), and are always retrieved alongside the problem.
- **Answers in Test Attempts**: Student answers are embedded inside `aptitudeattempts` rather than creating a separate collection. This handles bulk insert operations atomically per submission.

### What is Referenced?
- **Questions in Aptitude Tests**: An `aptitudetests` document stores an array of ObjectId references (e.g., `questions: [ObjectId...]`). This allows the same question to be reused across different tests easily.
- **Submissions to Problems and Users**: `submissions` rely on referencing `userId` and `problemId`. Keeping them separate ensures unbounded growth is isolated from the student/profile read operations.

---

## 3. Trigger Equivalents (Mongoose Hooks)

Since MongoDB doesn’t support traditional RDBMS triggers, we have implemented **Mongoose Pre/Post Save Hooks** for side-effect operations:

1. **Password Hashing (Pre-Hook)**:
   - *Collection*: `users`
   - *Action*: Before a user document is saved, `bcrypt` encrypts the `passwordHash` if modified.

2. **User Progress Auto-Initialization (Post-Hook)**:
   - *Collection*: `users`
   - *Action*: On `student` account creation, a default record is upserted into the `userprogresses` collection.

3. **Stats Update on Coding Submission (Post-Hook)**:
   - *Collection*: `submissions`
   - *Action*: Every time a submission is created, `totalSubmissions` increments in `userprogresses`. If the status changes to `Accepted`, the `problemsSolved` stats (easy, medium, hard) increment dynamically based on the parent problem's difficulty.

4. **Stats Update on Aptitude Completion (Post-Hook)**:
   - *Collection*: `aptitudeattempts`
   - *Action*: When a student completes a test, `aptitudeTestsTaken` is updated asynchronously.

---

## 4. Indexing Strategy for Performance

Efficient indexing keeps operations fast, bypassing full collection scans:

| Collection | Indexed Fields | Type | Purpose |
|------------|---------------|------|---------|
| `users` | `universityId` | Single | Fast login lookup. |
| `users` | `role`, `accountStatus` | Compound | Fast admin dashboard filtering. |
| `problems` | `slug` | Single | Fast retrieval of problem by URL. |
| `problems` | `tags`, `difficulty` | Compound| Quick problem set filtering across topics. |
| `problems` | `title`, `description` | Text | Full-text searching of problem libraries. |
| `submissions` | `userId`, `problemId`, `submittedAt` (-1) | Compound | Finding latest attempts of a user for a specific problem. |
| `submissions` | `status`, `submittedAt` (-1) | Compound | Rapid lookup for Admin "Pending Review" dashboard filters. |
| `aptitudeattempts`| `userId`, `testId`, `completedAt` (-1) | Compound| Dashboard analytics for a specific student's attempt. |

---

## 5. Advanced Aggregation Pipelines

We replace SQL `JOIN`, `GROUP BY`, and `Window Functions` with MongoDB Aggregation Pipelines.

### 5.1 Analytics: Global Student Leaderboard (Replaces SQL `RANK()` Window Function)
```json
[
  // 1. Join with User Progress collection
  {
    $lookup: {
      from: "userprogresses",
      localField: "_id",
      foreignField: "userId",
      as: "progress"
    }
  },
  { $unwind: "$progress" },
  // 2. Project calculated score
  {
    $project: {
      name: 1,
      universityId: 1,
      totalScore: {
        $add: [
          { $multiply: ["$progress.problemsSolved.easy", 10] },
          { $multiply: ["$progress.problemsSolved.medium", 20] },
          { $multiply: ["$progress.problemsSolved.hard", 30] },
          { $multiply: ["$progress.aptitudeTestsTaken", 5] }
        ]
      }
    }
  },
  // 3. Sort Descending by Score (Ranking)
  { $sort: { totalScore: -1 } },
  // 4. Paginate
  { $limit: 10 }
]
```

### 5.2 Deep Fetch: Get Aptitude Test with Populated Questions (Replaces SQL `JOIN`)
Since references are array bounds, mongoose `.populate('questions')` resolves this under the hood. For true aggregations:
```json
[
  { $match: { _id: ObjectId("test_id") } },
  {
    $lookup: {
      from: "aptitudequestions",
      localField: "questions",
      foreignField: "_id",
      as: "populatedQuestions"
    }
  }
]
```

### 5.3 Daily Dashboard Statistics (Replaces `GROUP BY`)
Find out how many submissions are created per day for the last 7 days.
```json
[
  {
    $match: {
      submittedAt: { $gte: ISODate("2024-01-01T00:00:00Z") }
    }
  },
  {
    $group: {
      _id: { $dateToString: { format: "%Y-%m-%d", date: "$submittedAt" } },
      submissionCount: { $sum: 1 },
      avgExecutionTime: { $avg: "$executionTime" }
    }
  },
  { $sort: { _id: 1 } }
]
```

---

## 6. Performance & Pagination Optimization

- **Pagination Approach**: Avoid traditional offset pagination (`skip(n)`). Use **Cursor-based Pagination** based on `createdAt` or `_id` to dramatically speed up large page iterations (e.g. `Submission.find({ _id: { $lt: lastSeenId } }).limit(20)`).
- **Projections**: Read operations limit returned fields (`.select('-passwordHash')`) to reduce wire-overhead.

## 7. Risks and Trade-offs

1. **Eventually Consistent Counters**: Using `$inc` within post hooks to maintain derived tables (`userprogresses`) acts asynchronously. Under a heavy concurrent load, statistics could technically fall out of sync. For absolute precision, a cron job script should run weekly to correct aggregate values from raw data.
2. **Testing Limitations**: Mongoose models map exactly to current schema. When structural rules change, data migrations form scripts are strictly required despite MongoDB being schema-less, to avoid `strictQuery` validation skips.

*This MongoDB logic respects the "Security over Features" policy mapped out inherently across `POLICIES/PROJECT_OVERVIEW.md`.*

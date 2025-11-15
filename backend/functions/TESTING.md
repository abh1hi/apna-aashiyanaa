# Property Dealer App – API & Cloud Functions Testing Guide

This document summarizes the testing setup and provides sample test commands to verify the backend (Cloud Functions) and API endpoints, and checks for all critical workflows using local Firebase Emulators.

## 🛠 Prerequisites

- Node.js >= 18 (Node.js 22 preferred for Firebase Functions)
- npm
- Firebase CLI installed
- Firebase Emulators set up and running locally
- All dependencies installed in `metainflu/backend/functions/`


## 🚦 Directory Structure for Backend Testing

```
metainflu/backend/functions/
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── tests/
│   ├── auth.test.js
│   └── firebase-init.js
├── utils/
├── index.js
├── package.json
```


## ⚡ Running Unit/Integration Tests

All sample/auth tests use [Jest](https://jestjs.io/) or Node's built-in test runner. You can add more test files in `functions/tests/` as needed. 

### 1. Setup and Start Emulators

```bash
cd metainflu/backend
firebase emulators:start
```

### 2. Install DevTest Dependencies (if missing)

```bash
cd functions
npm install --save-dev jest supertest @firebase/rules-unit-testing
```

### 3. Run Tests (Jest/Node)

First, check if there's a Jest script:

```bash
# Check package.json for test script (if missing, add below)
npm run test
```

If not, run directly (Node >= 18):

```bash
node --test tests/auth.test.js
```

### 4. Add More Test Files
- Place new test suites in `functions/tests/` 
- Name as `ServiceName.test.js` (e.g., property.test.js, users.test.js)


## 📋 What Should Be Tested

### Authentication Workflows
- [x] Register new user (OTP)
- [x] Register new user (password)
- [x] Login (OTP)
- [x] Login (password)
- [x] OTP verification endpoint
- [x] Token issuance & validation

### Property Flows
- [ ] Create property (POST /api/properties)
- [ ] List properties (GET /api/properties)
- [ ] Get property details (GET /api/properties/:id)
- [ ] Update property
- [ ] Delete property (soft delete)

### User Profile
- [ ] Get user profile
- [ ] Update profile
- [ ] Change avatar
- [ ] Access controls (protected routes)

### Security Rules (Firestore/Storage)
- [ ] Unauthenticated DB edits must fail
- [ ] Users can ONLY edit their own docs/files
- [ ] Storage uploads/deletes only by owner

### Cloud Functions APIs
- [ ] All endpoints return appropriate status
- [ ] Error cases (failures & validation) handled


## 🔑 Example Auth Test: `auth.test.js`

```javascript
// Excerpt from functions/tests/auth.test.js

const request = require('supertest');
const app = require('../index');

describe('Authentication Routes', () => {
  it('responds to /api/auth/register with 201', async () => {
    const res = await request(app).post('/api/auth/register').send({
      mobile: "+911234567890",
      // ... required fields
    });
    expect(res.statusCode).toBe(201);
    // ... add more expectations
  });
});
```

You can duplicate/extend this for properties, users, etc.


## 🚀 Test Workflow Summary

1. Make sure your repo is on `main`, up to date, and all directories are present in `functions/`.
2. Start emulators locally.
3. Install test dependencies (`jest`, `supertest`, etc.).
4. Write/update test files in `functions/tests/`.
5. Run tests using `npm test` or `node --test`.
6. All critical flows (auth, property CRUD, user profile) must pass tests.

---

**With this setup, anyone can clone-and-test the repo for all API endpoints and business logic against the Firebase Emulators, with coverage easily expanded by adding more test files.**

If you want a specific test example or template for a new service, let me know!

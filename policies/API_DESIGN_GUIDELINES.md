# 🔌 API Design Guidelines  
## Placement Preparation Platform for Engineering Students

This document defines the API design principles followed in the system.

---

## 1. API Style

- RESTful architecture
- JSON-based request and response format
- Clear and predictable endpoints

---

## 2. Naming Conventions

- Nouns for resources
- Plural naming
- Clear hierarchy

Examples:
- `/auth/login`
- `/problems`
- `/submissions`
- `/aptitude/questions`

---

## 3. HTTP Methods Usage

- GET → Fetch data
- POST → Create resources
- PUT → Update resources
- DELETE → Remove resources

---

## 4. Status Code Standards

- 200 → Success
- 201 → Created
- 400 → Bad request
- 401 → Unauthorized
- 403 → Forbidden
- 404 → Not found
- 500 → Server error

---

## 5. API Response Structure

- Consistent success and error responses
- Minimal payload size
- No sensitive data exposure

---

## 6. Authentication Enforcement

- JWT required for protected routes
- Role validation for admin endpoints

---

## 7. Conclusion

These API guidelines ensure consistency, reliability, and ease of integration across the platform.

# 🔐 Security & Authentication Policy  
## Placement Preparation Platform for Engineering Students

This document defines the security mechanisms and authentication strategy used in the system to protect user data, enforce access control, and ensure safe operation within a college environment.

---

## 1. Authentication Strategy

- The system uses **JWT (JSON Web Tokens)** for authentication.
- Authentication is **stateless**, meaning no server-side sessions are stored.
- Tokens are issued upon successful login and verified on each protected request.

---

## 2. User Account Provisioning

- Student accounts are created **only by the college admin**.
- Public registration is disabled.
- Each account is linked to a college identifier (Enrollment ID / Email).

This ensures institutional control and prevents unauthorized access.

---

## 3. Password Security

- Passwords are never stored in plain text.
- Passwords are hashed using **bcrypt** before storage.
- Salted hashing protects against rainbow-table and brute-force attacks.

---

## 4. Authorization & Role-Based Access Control

Two roles are defined:
- **Student** – Access to practice modules and dashboard
- **Admin** – Access to content and user management

Access to APIs is enforced using middleware that checks:
- Token validity
- User role

---

## 5. Token Handling Rules

- Tokens expire after a fixed duration
- Expired tokens require re-authentication
- Tokens are not stored in URLs
- Sensitive actions always require a valid token

---

## 6. Input Validation & Sanitization

- All incoming API requests are validated
- Malformed or unexpected input is rejected
- Prevents injection and malformed data attacks

---

## 7. Environment Variables

- Secrets (JWT keys, DB credentials) are stored in environment variables
- No secrets are committed to source control

---

## 8. Security Scope Limitations

- No payment processing
- No third-party authentication
- No external user access

These limitations reduce attack surface and improve system safety.

---

## 9. Conclusion

This security policy ensures that the platform operates safely within a college environment using proven authentication and authorization techniques without unnecessary complexity.

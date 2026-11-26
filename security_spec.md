# Security Specification: Bharat Gurukul 360

## 1. Data Invariants
1. User accounts (`users/{userId}`) contain PII (`email`) and are strictly readable only by the owning user (`request.auth.uid == userId`) or a verified admin. Self-registration cannot assign `super_admin` or `school_admin` roles unless verified as the bootstrapped admin (`ccbvizag@gmail.com`).
2. Every user-owned document (`enrollments`, `homeschoolPlans`, `ventures`, `sportsLogs`, `assessments`) enforces `ownerId == request.auth.uid` (or `userId == request.auth.uid`) on creation and forbids changing ownership on update.
3. Public catalog collections (`categories`, `courses`, `courses/{courseId}/lessons`, `mentors`, `liveClasses`, `libraryResources`) allow read access for catalog browsing, while writes are restricted to verified admins (`isAdmin()`).
4. Lesson subcollection writes verify parent `/courses/{courseId}` exists via `exists()` (Master Gate).
5. All timestamps (`createdAt`, `updatedAt`) must equal `request.time`, and `createdAt` and `createdBy`/`ownerId`/`userId` are immutable after creation.
6. Every string field has strict `.size()` bounds, every array has `.size() <= MAX` bounds and element type checks, and every document ID matches `^[a-zA-Z0-9_\-]+$`.
7. Completed enrollments with `certificateIssued == true` lock `progressPercent` and `certificateIssued` against client tampering unless modified by an admin.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Self-Privilege Escalation**: Creating `/users/{uid}` with `role: "super_admin"` by a non-admin user -> `PERMISSION_DENIED`.
2. **PII Blanket Read**: Authenticated non-admin attempting `get` or `list` on `/users` for another user's profile -> `PERMISSION_DENIED`.
3. **Ghost Field Shadow Write**: Creating or updating a `courses` or `ventures` doc with an unlisted key `isVerified: true` -> `PERMISSION_DENIED` (`hasOnly` check).
4. **Email Spoofing Admin Bypass**: Token with `email: "ccbvizag@gmail.com"` and `email_verified: false` -> `PERMISSION_DENIED`.
5. **ID Poisoning**: Creating a document with a 1.5KB or slash-containing document ID -> `PERMISSION_DENIED` (`isValidId`).
6. **Orphaned Lesson Creation**: Creating `/courses/nonexistent/lessons/l1` when parent course does not exist -> `PERMISSION_DENIED` (`exists()` check).
7. **Ownership Hijack on Update**: Updating `/homeschoolPlans/p1` to change `ownerId` to another UID -> `PERMISSION_DENIED`.
8. **Timestamp Forgery**: Creating a `sportsLogs` record with backdated client `createdAt` instead of `request.time` -> `PERMISSION_DENIED`.
9. **Value Poisoning on Update**: Updating `ventures/v1` `budgetInr` to a negative integer or string -> `PERMISSION_DENIED` (`isValidVenture`).
10. **Array Overflow DoW**: Passing 500 elements in `completedLessonIds` or `interests` -> `PERMISSION_DENIED` (`size() <= MAX`).
11. **Unscoped List Query**: Listing `/enrollments` or `/sportsLogs` for another user's `userId`/`ownerId` -> `PERMISSION_DENIED` (`resource.data` enforced on `allow list`).
12. **Terminal Certificate Tampering**: Non-admin attempting to set `certificateIssued: true` when `progressPercent < 100` or mutating a certified enrollment -> `PERMISSION_DENIED`.

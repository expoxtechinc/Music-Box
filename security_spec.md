# Security Specification for MusisBox (Audiomack Clone)

This document maps the security invariants, validation blueprints, access control models, and adversarial simulation "Dirty Dozen" payloads for the MusisBox application.

## 1. Data Invariants

1. **User Profiles (`/users/{userId}`)**:
   - Only the authenticated owner of the UID can create or modify their own user document.
   - Access to check administrative role tags (`isAdmin`) is globally read-only but restricted for writing to avoid privilege escalation. Standard users cannot elevate themselves to admins.
   - PII is locked down. Standard profiles (email, name, photo) are standard.

2. **Tracks (`/tracks/{trackId}`)**:
   - Creating a track requires the user to be a verified Administrator (`isAdmin` document exists).
   - Standard visitors can read and stream track metadata globally.
   - Non-administrators can NEVER update track details, except for structural increments on `plays`, `likesCount`, or `sharesCount` via safe Atomic increments.
   - Deleting a track is restricted strictly to administrators.

3. **Likes (`/likes/{likeId}`)**:
   - A user can only like a track if they are logged in.
   - Complete id format for `likeId` is `userId_trackId` to guarantee uniqueness and prevent single-user multi-like flooding.
   - The user must be the actual author (`userId == request.auth.uid`).

4. **Comments (`/tracks/{trackId}/comments/{commentId}`)**:
   - A user must be signed in to post comments.
   - A user can only delete or update comments they created (`userId == request.auth.uid`).
   - Standard clean content validation is enforced.

5. **Playlists (`/playlists/{playlistId}`)**:
   - Only the owner/creator can update or delete their playlists.
   - Public playlists can be searched and read by anyone, whereas private playlists can only be viewed by the creator.

---

## 2. The "Dirty Dozen" (Red Team Attack Payloads)

Here are twelve vectors that would break the security system, with expected result `PERMISSION_DENIED`.

1. **Self-Elevation**: A regular logged-in user sends a write to `/users/<my-uid>` with `{"isAdmin": true}`.
2. **Identity Theft / User Spoofing**: Signed-in user `User_A` tries to create or update profile `/users/User_B`.
3. **Admin Playbook Bypass**: A normal user writes to `/tracks/MaliciousTrackId` with custom audio URLs.
4. **Invalid Track Id Injecting**: Attacker attempts to write a track with an ID containing malicious symbols and 12KB size (`/tracks/bad$%^*_payload`).
5. **Like Hijack**: User `User_A` tries to create/delete a like document under `User_B_trackXYZ`.
6. **Ghost Like Increment**: User sends an update to `/tracks/track123` changing `likesCount` to `999999` directly on the track record without executing /likes creation.
7. **Comment Forgery**: Signed-in user `User_A` comments on a track but puts `userId = "User_Admin"` in the payload to spoof identity.
8. **Comment Deletion Theft**: User `User_B` executes a delete operation on `/tracks/track123/comments/comment_A` (where `comment_A` belongs to `User_A`).
9. **Private Playlist Snooping**: Guest accesses a playlist at `/playlists/playlist_private_123` with `isPublic = false`.
10. **Playlist Hijack**: User `User_B` modifies `trackIds` on user `User_A`'s playlist at `/playlists/playlist_A`.
11. **Spoofed Server Timestamps**: User enters client-side datetime string in `createdAt` to simulate historic creation instead of using standard `request.time`.
12. **Denial of Wallet Long fields**: Attacker uploads a title string of `50,000` characters to exhaust project Firestore read/write storage sizing limits.

---

## 3. Test Runner Architecture (`firestore.rules.test.ts`)

A mock testing harness validates that any attempt to fire these payloads yields a security rejection error. All operations are tested client-side and compared with target rules.

See `firestore.rules` below for implementation details.

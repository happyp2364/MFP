# Security Specification for Firestore Rules

## Security Goals
1. Authenticated users can manage their own profile under `users/{userId}`.
2. Anyone (guests or logged-in users) can submit contact inquiries and book appointments.
3. Users can view and manage their own booked appointments (`appointments/{appointmentId}`).
4. Authenticated users can manage inquiries.

## Collections & Access Rules
- `users/{userId}`: Only the user matching `userId` can read or write.
- `inquiries/{inquiryId}`: Open write (`create`), read/update/delete restricted to authenticated users.
- `appointments/{appointmentId}`: Open create, read/update/delete restricted to appointment owner or authenticated user.

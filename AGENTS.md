# ENTERPRISE-SCALE ARCHITECTURE & DEVELOPMENT RULES

This project is governed by strict enterprise-grade performance, scalability, security, and architectural rules.

## MISSION
Build and maintain the project as an enterprise-grade e-commerce platform scaling efficiently from 10 to 1,000,000+ products and 10 to 100,000+ orders/day without structural redesign.

## CORE PRINCIPLES
- **Performance First**: Prioritize speed, scalability, maintainability, reliability, fault tolerance, security, realtime stability, and memory/network efficiency.
- **Database Rules**:
  - Never load an entire collection.
  - Always use pagination, cursor-based queries, query limits, indexes, filtered queries, incremental loading, and server-side ordering.
  - Read only required fields and documents. Prevent duplicate Firestore reads and listeners.
- **UI & Rendering Rules**:
  - Never render thousands of items at once.
  - Use lazy loading, infinite scroll, virtualized lists, skeleton loading, progressive rendering, and image placeholders.
- **Image Optimization**:
  - Auto-compress images, generate thumbnails, serve responsive sizes, lazy-load, and cache intelligently.
- **Firestore Efficiency**:
  - Dispose listeners immediately upon unmount; avoid duplicate or nested listeners.
  - Batch writes where appropriate and retry transient failures safely.
- **Background Processing**:
  - Execute heavy workloads (bulk imports, image processing, AI tasks, exports, backups) asynchronously off the main UI thread.
- **Error Handling & Resiliency**:
  - Every async operation must feature timeout, retry (where safe), fallback, user-friendly error messages, logging, and a recovery path. Never fail silently.
- **Security & Least Privilege**:
  - Protect admin actions, enforce server-side validation, and maintain least-privilege security rules.
- **Completion Criteria**:
  - Every modification must ensure existing features function without regressions, performance remains smooth across mobile and desktop, and queries remain optimized.

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Planned
- Improvements to spaced repetition algorithm
- Detailed mock exam analysis
- More interactive question types

---

## [1.0.1-alpha] - 2026-01-02

### 🔥 Removed

**Difficulty System Eliminated**
- Removed difficulty selection system (easy/medium/hard) throughout the entire project
- Removed `difficulty_es` and `difficulty_en` columns from `questions` table
- Removed difficulty parameter from all APIs and components
- UI simplification: study now focuses only on topics
- Migration applied: `20260102_remove_difficulty_columns.sql`

**Obsolete Files**
- Removed 15 deprecated files:
  - `temp_check.txt`
  - 12 obsolete documents (DEPLOY_STATUS, EMAILJS_MIGRATION, etc.)
  - Setup scripts: `setup.bat`, `setup.sh`

### ✨ Added

**Official ISTQB Distribution in Exams**
- Implemented official question distribution by chapter in mock exams:
  - Fundamentals of Testing: 8 questions
  - Testing Throughout SDLC: 6 questions  
  - Static Testing: 4 questions
  - Test Analysis and Design: 11 questions
  - Managing Test Activities: 9 questions
  - Test Tools: 2 questions
- Improved random selection algorithm with Fisher-Yates shuffle
- Complete documentation in `docs/EXAM_DISTRIBUTION.md`

**Study and Exam Session Protection**
- Detection and prevention of refresh during active sessions
- Detection of language changes during active sessions
- Automatic redirection to home on interruptions
- SessionStorage cleanup when completing or abandoning sessions

**Automated Tests**
- ✅ 68 API tests implemented (+55 new tests)
- ✅ 49 Web tests working
- **Coverage increased to 30.83%** (before: 11.88%)
- New test suites:
  - AuthService: 15 tests (signup, signin, getCurrentUser, updateUser)
  - AnswerService: 14 tests (statistics and success rate)
  - SpacedRepetitionService: 12 tests (SM-2 algorithm)
  - QuestionService: 11 tests (retrieval and randomization)
  - UserService: 8 tests (profile management)
  - ExamService: 8 tests (exam simulation)

**CI/CD with GitHub Actions**
- Complete workflow for tests and linting
- Automatic execution on PRs and commits to `main`/`develop`
- Type-checking for API and Web
- Coverage reporting with Codecov
- File: `.github/workflows/ci-cd.yml`

### 🔧 Changed

**QuestionCard Improvements**
- HTML rendering support in question descriptions
- Automatic detection of HTML vs plain text content
- Better line break handling with `whitespace-pre-line`
- Removed difficulty header

**Simplified API**
- `createExamSession()` no longer requires difficulty parameter
- `getQuestionsByTopic()` removed difficulty parameter
- Removed functions: `getQuestionCountByDifficulty()`, `getDifficultyLabel()`
- Reduced complexity in question and exam services

**Authentication Components**
- Added `suppressHydrationWarning` in signin/signup to prevent hydration errors
- Improved password input handling
- Enhanced password strength validation

**Bilingual README Updated**
- Updated badges: 68 tests passing, 30.83% coverage
- New detailed testing section with tested services
- CI/CD integration documentation
- Updates in Spanish and English

### ⚡ Performance

**Supabase Optimizations**
- **73% reduction** in performance issues (22 → 6 issues)
- 20 RLS policies optimized (avoid per-row re-evaluation)
- 6 indexes added for foreign keys
- 11 unused indexes removed
- 4 redundant policies consolidated
- Migration applied: `20260102_performance_optimization.sql`
- Documentation: `docs/PERFORMANCE_OPTIMIZATION_REPORT.md`

**Query Improvements**
- RLS policies now use `(select auth.uid())` instead of `auth.uid()`
- RLS queries up to 10x faster on tables with many rows
- Optimized JOINs thanks to new indexes

### 🐛 Fixed

**Lint and Type Errors**
- Fixed all ESLint errors in API and Web
- ESLint 8 (API) and ESLint 9 (Web) configuration
- Fixed: `no-case-declarations` in ReminderUtils
- Fixed: Vitest imports in Web tests
- Fixed: default export in UserService

**UI Fixes**
- Removed difficulty references throughout the interface
- Removed difficulty selectors from study and exam pages
- Updated translation system (i18n) to remove difficulty strings
- Type cleanup in `@istqb-app/shared`

**Exam Store**
- Removed `difficulty` field from `examStore.ts`
- Updated `ExamState` interface
- Simplified `startExam()` function (one less parameter)

### 🔒 Security

**Pending Recommendation**
- ⚠️ Enable "Leaked Password Protection" in Supabase dashboard
  - Path: Authentication → Settings → Password Settings
  - Prevents use of known compromised passwords

### 📚 Documentation

**New Documentation**
- `EXAM_DISTRIBUTION.md`: Explanation of official ISTQB distribution
- `PERFORMANCE_OPTIMIZATION_REPORT.md`: Detailed optimization report
- README updated with new test information
- GETTING_STARTED updated (removed references to setup scripts)

**Migrations**
- `20260102_remove_difficulty_columns.sql`
- `20260102_performance_optimization.sql`

### 🧪 Testing

**Coverage Statistics**
- Statements: 30.83% (before: 11.88%)
- Branches: 19.15%
- Functions: 38.09%
- Lines: 30.92%
- **Increase of +19 percentage points**

**Services with Complete Coverage**
- ✅ AuthService (15 tests)
- ✅ AnswerService (14 tests)
- ✅ SpacedRepetitionService (12 tests)
- ✅ QuestionService (11 tests)
- ✅ UserService (8 tests)
- ✅ ExamService (8 tests)

---

## [1.0.0-alpha] - 2025-12-28

### 🎉 Initial Release - Alpha Version

#### ✨ Main Features

**Question Engine**
- Question generation based on ISTQB Foundation Level syllabus
- Support for multiple choice, true/false, and situational questions
- Real-time evaluation system with detailed feedback
- ISTQB syllabus-based explanations with references

**Progress Management**
- Detailed user progress tracking by topic
- Performance metrics (success rate, temporal evolution)
- Complete history of answered questions
- Identification of mastered and weak topics

**ISTQB Exam Simulator**
- Real exam simulation: 40 questions in 60 minutes
- Random questions by topic following ISTQB standard
- Detailed results with topic-wise analysis
- Pass probability estimation
- Persistent performance statistics

**Spaced Repetition**
- SM-2 algorithm implementation
- Automatic reinforcement of failed questions
- Frequency adjustment based on performance
- Intelligent prioritization system

**Error Bank**
- Automatic error logging
- Review and retry of failed questions
- Extended explanations for each error
- Filtering by topic and difficulty

**Gamification**
- Achievement and badge system
- Daily study streaks
- Topic-wise preparation levels
- Visual progress with bars and percentages

**Reminder System**
- Personalized frequency configuration (daily, weekly, custom days)
- Email reminders
- Web push notifications (Web Push API)
- Complete management from UI

**PWA - Progressive Web App**
- Installable on mobile and desktop devices
- Complete offline mode
- Intelligent caching of questions and content
- Service Workers for background sync
- Optimized manifest.json

**Multi-language (i18n)**
- Complete support for Spanish and English
- Language switching from UI
- Content adapted by language (questions, explanations, UI)
- Extensible system for more languages

**Authentication and Security**
- Email/Password authentication via Supabase Auth
- Secure sessions with JWT
- Row Level Security (RLS) implemented
- Token validation in frontend and backend

**Admin Panel**
- User management
- Global usage statistics
- Performance monitoring
- CRUD for questions and content

#### 🏗️ Technical Architecture

**Frontend**
- Next.js 16 with React 19
- Strict TypeScript
- Tailwind CSS for styling
- Zustand for state management
- next-intl for internationalization
- Vitest + React Testing Library for tests

**Backend**
- Node.js with Express
- TypeScript
- Supabase as BaaS (Backend as a Service)
- PostgreSQL as database
- Edge Functions for serverless logic

**Infrastructure**
- Monorepo with workspaces (npm workspaces)
- Modular structure: packages/web, packages/api, packages/shared
- Automated testing (unit + integration)
- CI/CD with Render

**Database**
- PostgreSQL (Supabase)
- Versioned migrations
- Optimized SQL functions
- Performance indexes

#### 📦 Packages and Dependencies

**Core**
- next: ^16.1.0
- react: ^19.2.3
- @supabase/supabase-js: ^2.39.0
- zustand: ^5.0.9
- axios: ^1.6.2

**Utilities**
- date-fns: ^4.1.0
- clsx: ^2.1.0
- uuid: ^13.0.0

**Testing**
- vitest
- @testing-library/react
- @testing-library/jest-dom

#### 🐛 Known Issues (Alpha)
- Spaced repetition algorithm still requires fine-tuning
- Push notifications require HTTPS (don't work on localhost)
- Offline mode limitations for dynamic content

#### 📝 Alpha Version Notes
This is the first public alpha version of the project. All main features are implemented and functional, but we're still in testing and adjustment phase. Continuous improvements are expected based on user feedback.

---

## Change Types

- `✨ Added` for new features
- `🔧 Changed` for changes to existing features
- `🗑️ Deprecated` for features that will be removed
- `🔥 Removed` for removed features
- `🐛 Fixed` for bug fixes
- `🔒 Security` for security-related changes
- `⚡ Performance` for performance improvements
- `📚 Documentation` for documentation changes

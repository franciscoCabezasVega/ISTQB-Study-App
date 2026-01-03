# 📚 ISTQB Study App - Progressive Web Application

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.6-brightgreen)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen)
![TypeScript](https://img.shields.io/badge/typescript-5.3-blue)
![Tests](https://img.shields.io/badge/tests-0%20passing-success)
[![codecov](https://codecov.io/gh/franciscoCabezasVega/ISTQB-Study-App/branch/main/graph/badge.svg)](https://codecov.io/gh/franciscoCabezasVega/ISTQB-Study-App)

**[Español](README.es.md)** | **English**

A Progressive Web Application (PWA) to help students prepare for the ISTQB Foundation Level certification.

🚀 **[Live Demo](https://istqb-frontend.onrender.com/)** 🚀

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 🎯 Features

### 🧠 Smart Study System
- **Intelligent Question Engine**: Questions based on the official ISTQB Foundation Level syllabus
- **Question Randomization**: Random order of questions and answer options in each session
- **Topic-based Study**: Organized into 6 main syllabus topics
- **Spaced Repetition**: SM-2 algorithm to reinforce weak concepts
- **Error Bank**: Review and retry incorrectly answered questions

### 📝 Exam Simulation
- **Full Exam Simulator**: 40 questions in 60 minutes
- **Realistic ISTQB Distribution**: Follows official exam topic distribution
- **Detailed Statistics**: Performance tracking by topic and overall
- **Pass Probability**: Estimated likelihood of passing based on your results

### 🎮 Gamification & Progress
- **Achievements System**: Badges and unlockable achievements
- **Study Streaks**: Daily study tracking
- **Progress Dashboard**: Detailed performance metrics
- **Topics Mastery**: Track your strength in each syllabus area

### 🌐 Modern & Accessible
- **Progressive Web App**: Install as a native app on any device
- **Offline Mode**: Access questions without internet connection
- **Multi-language**: Full support for Spanish and English
- **Dark/Light Theme**: Adaptive UI for comfortable studying
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop

### 🔔 Study Tools
- **Smart Reminders**: Configurable email and web notifications
- **Custom Schedule**: Set study frequency and preferred times
- **Study Sessions**: Timed practice sessions with feedback

## 🏗️ Architecture

```
istqb-study-app/
├── packages/
│   ├── shared/          # Shared types and constants
│   │   └── src/
│   │       ├── types.ts
│   │       └── topicMap.ts
│   ├── api/             # Backend (Express + Supabase)
│   │   └── src/
│   │       ├── routes/
│   │       ├── services/
│   │       ├── middleware/
│   │       └── config/
│   └── web/             # Frontend (Next.js)
│       ├── app/
│       ├── components/
│       └── lib/
├── docs/                # Documentation
├── migrations/          # Database migrations
├── .github/
│   └── workflows/       # CI/CD pipelines
└── package.json         # Monorepo root
```

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth + JWT
- **Email Service**: EmailJS
- **Language**: TypeScript
- **Testing**: Jest

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Testing**: Vitest + React Testing Library
- **PWA**: next-pwa

### DevOps & Tools
- **Deployment**: Render
- **CI/CD**: GitHub Actions
- **Linting**: ESLint 9
- **Type Checking**: TypeScript strict mode
- **Package Manager**: npm workspaces

## 🚀 Getting Started

### Prerequisites
- Node.js >= 20.x
- npm >= 10.x
- Supabase account (free tier available)

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/franciscoCabezasVega/ISTQB-Study-App.git
cd ISTQB-Study-App
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create `packages/api/.env`:
```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT
JWT_SECRET=your-secure-jwt-secret

# Server
API_PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# EmailJS (for reminders)
EMAILJS_SERVICE_ID=your-service-id
EMAILJS_TEMPLATE_ID=your-template-id
EMAILJS_PUBLIC_KEY=your-public-key
EMAILJS_PRIVATE_KEY=your-private-key
```

Create `packages/web/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

4. **Set up Supabase database**

Follow the instructions in [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md) to:
- Create tables
- Set up Row Level Security (RLS)
- Create indexes
- Apply migrations

5. **Start development servers**

Terminal 1 - Backend:
```bash
npm run dev:api
```

Terminal 2 - Frontend:
```bash
npm run dev:web
```

Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 🧪 Testing

The project has comprehensive test coverage across both backend and frontend. View detailed coverage reports on [Codecov](https://codecov.io/gh/franciscoCabezasVega/ISTQB-Study-App).

### Running Tests

```bash
# Run all tests
npm test

# Run tests for specific package
npm test --workspace=packages/api
npm test --workspace=packages/web

# Run tests with coverage report
npm test -- --coverage

# Run specific test suite
npm test -- AuthService.spec.ts

# Type checking
npm run type-check

# Linting
npm run lint
```

### CI/CD Integration
All tests run automatically on:
- Pull requests to `main` branch
- Commits to `main` branch
- Pre-deployment validation

See [.github/workflows/ci.yml](.github/workflows/ci.yml) for CI/CD configuration.

## 📦 Production Build

```bash
# Build all packages
npm run build

# Build specific package
npm run build --workspace=packages/api
npm run build --workspace=packages/web
```

## 📚 Documentation

- [Getting Started Guide](./docs/GETTING_STARTED.md)
- [Supabase Setup](./docs/SUPABASE_SETUP.md)
- [Architecture Overview](./docs/ARCHITECTURE.md)
- [Testing Guidelines](./docs/TESTING_GUIDELINES.md)
- [Versioning Guide](./docs/VERSIONING_GUIDE.md)
- [Deployment Guide](./docs/RENDER_DEPLOY_GUIDE.md)

## 📖 ISTQB Topics Covered

The app covers all 6 chapters of the ISTQB Foundation Level syllabus:

1. **Fundamentals of Testing** (8 questions in exam)
   - What is testing
   - Why testing is necessary
   - Testing principles
   - Test activities and tasks
   - Essential skills for testing

2. **Testing Throughout the Software Development Lifecycle** (6 questions)
   - Testing in the context of SDLC
   - Test levels and types
   - Maintenance testing

3. **Static Testing** (4 questions)
   - Static testing basics
   - Feedback and review process
   - Reviews

4. **Test Analysis and Design** (11 questions)
   - Test techniques overview
   - Black-box test techniques
   - White-box test techniques
   - Experience-based test techniques
   - Collaboration-based test approaches

5. **Managing the Test Activities** (9 questions)
   - Test planning
   - Risk management
   - Test monitoring and control
   - Configuration management
   - Defect management

6. **Test Tools** (2 questions)
   - Tool support for testing
   - Benefits and risks of test automation

## 📋 Versioning

This project follows [Semantic Versioning](https://semver.org/). See [CHANGELOG.md](CHANGELOG.md) for detailed version history.

### Creating a Release

```bash
# Interactive release script (recommended)
npm run release

# Quick version bumps
npm run version:patch  # 1.0.0 -> 1.0.1
npm run version:minor  # 1.0.0 -> 1.1.0
npm run version:major  # 1.0.0 -> 2.0.0
```

## 🔐 Security

- ✅ JWT-based authentication
- ✅ HTTPS in production
- ✅ CORS configuration
- ✅ SQL injection prevention (Supabase PostgreSQL)
- ✅ XSS protection (React)
- ✅ Row Level Security (RLS) in database
- ✅ Environment variables for sensitive data

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and development process.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👏 Acknowledgments

This project was developed with the assistance of:

- **[GitHub Copilot](https://github.com/features/copilot)** - AI pair programmer that accelerated development and improved code quality
- **[Supabase MCP](https://supabase.com/docs/guides/getting-started/mcp)** - Model Context Protocol integration for seamless database operations
- **[Render MCP](https://render.com/docs/mcp-server)** - Model Context Protocol integration for streamlined deployment and infrastructure management

### Built With
- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Backend as a Service
- [Render](https://render.com/) - Cloud hosting platform
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript

## 🌟 Support

If you find this project helpful, please consider:
- ⭐ Starring the repository
- 🐛 Reporting bugs via [GitHub Issues](https://github.com/franciscoCabezasVega/ISTQB-Study-App/issues)
- 💡 Suggesting new features
- 📖 Contributing to documentation

## 📞 Contact

For questions, feedback, or support:
- Open an [issue](https://github.com/franciscoCabezasVega/ISTQB-Study-App/issues)
- Email: [frank_vega25@hotmail.com]

---

<div align="center">

**Made with ❤️ for the QA and Testing community**

[⬆ Back to top](#-istqb-study-app---progressive-web-application)

</div>

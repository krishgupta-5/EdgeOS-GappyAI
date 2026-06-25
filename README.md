<div align="center">

# 🚀 EdgeOS

### From an Idea to a Complete Software Blueprint.

AI-powered product development planning that transforms a simple product idea into developer-ready documentation, architecture, APIs, database schemas, roadmaps, and technical plans.

---

[![Next.js](https://img.shields.io/badge/Next.js-16.2.0-black?style=for-the-badge&logo=nextdotjs)]()
[![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=for-the-badge&logo=react)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)]()
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38BDF8?style=for-the-badge&logo=tailwindcss)]()
[![Firebase](https://img.shields.io/badge/Firebase-Backend-FFCA28?style=for-the-badge&logo=firebase)]()
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker)]()
[![Groq](https://img.shields.io/badge/Groq-AI-black?style=for-the-badge)]()
[![Gemini](https://img.shields.io/badge/Gemini-AI-4285F4?style=for-the-badge)]()

---

**🏆 Hackathon Submission**

Build software smarter—not harder.

</div>

---

# 🚀 Introduction

EdgeOS is an AI-powered Product Development Planning Platform.

Instead of spending days creating technical documentation before writing code, developers simply describe their product idea.

EdgeOS then generates the planning artifacts required throughout the Software Development Lifecycle (SDLC).

From Product Requirement Documents to Database Schemas and Deployment Guides, EdgeOS helps teams move from **idea → planning → development** much faster.

---

# ⚡ Installation

Clone the repository:

```bash
git clone https://github.com/your-username/edgeos.git
```

Move into the project:

```bash
cd edgeos
```

---

# 🔐 Environment Variables

You need to configure environment variables before running the application.

1. Rename `.env.example` to `.env.local` in the root directory (and in the `chat-page` and `landing-page` directories).
2. Fill in the required API keys (Clerk, Firebase, Groq, Gemini).

```bash
cp .env.example .env.local
```

---

# ▶️ Run Locally with Docker Compose

The easiest way to run the entire stack (Landing Page + Application) is using Docker Compose.

```bash
docker-compose up --build
```

- **Landing Page**: http://localhost:3000
- **App/Chat**: http://localhost:3001

Alternatively, you can run them individually by navigating to `landing-page` or `chat-page` and running `npm install && npm run dev`.

---

# 🏗️ Architecture Components

| Component | Port | Purpose |
|-----------|------|----------|
| `landing-page` | 3000 | The public-facing marketing and documentation site. |
| `chat-page` | 3001 | The core AI application dashboard and blueprint generation engine. |

Both services are integrated using a shared `.env.local` and Clerk authentication for a seamless experience.

---

# 🤝 Contributing

Contributions are always welcome.

If you would like to improve EdgeOS:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "Add new feature"`
4. Push your branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

# 📜 License

This project is licensed under the MIT License.

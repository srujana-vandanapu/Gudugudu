# 💰 SpendWise — Smart Expense Tracker

A full-stack expense tracking application with **Spring Boot** backend and **React** frontend. Works on both web and mobile browsers.

---

## ✨ Features

- 📱 **Mobile-responsive** — works perfectly on phones, tablets, and desktops
- 🔐 **Phone number + password authentication** with JWT tokens
- 📊 **Dashboard** with real-time charts (pie + bar), budget usage ring, savings calculator
- ⚠️ **Smart alerts** — notified when approaching or exceeding category/monthly limits
- 🗂️ **Categories** — custom icon, color, estimated budget, alert threshold per category
- 💸 **Expenses** — add, edit, delete with category assignment and date picker
- 📅 **Monthly tracking** — automatically scoped to current month
- 💾 **Savings calculator** — remaining money & savings computed automatically
- 🎨 **Dark theme** with smooth animations

---

## 🏗️ Tech Stack

| Layer    | Technology                              |
|----------|-----------------------------------------|
| Backend  | Spring Boot 3.2, Spring Security, JWT  |
| Database | H2 (in-memory, swap for MySQL/Postgres) |
| Frontend | React 18, Vite, Tailwind CSS           |
| Charts   | Recharts                                |
| Auth     | BCrypt + JWT (HS256)                   |

---

## 🚀 Getting Started

### Prerequisites
- Java 17+
- Node.js 18+
- Maven 3.8+

---

### Backend

```bash
cd backend
mvn spring-boot:run
# Server starts at http://localhost:8080
# H2 console: http://localhost:8080/h2-console (JDBC: jdbc:h2:mem:expensedb)
```

---

### Frontend

```bash
cd frontend
npm install
npm run dev
# App starts at http://localhost:3000
```

---

### Docker (Full Stack)

```bash
docker-compose up --build
# Frontend: http://localhost:3000
# Backend:  http://localhost:8080
```

---

## 📡 API Reference

### Auth
| Method | Endpoint             | Description      |
|--------|----------------------|------------------|
| POST   | `/api/auth/register` | Register user    |
| POST   | `/api/auth/login`    | Login, get token |

### Dashboard
| Method | Endpoint        | Description            |
|--------|-----------------|------------------------|
| GET    | `/api/dashboard` | Full month summary    |
| PUT    | `/api/budget`   | Update monthly budget  |

### Categories
| Method | Endpoint               | Description         |
|--------|------------------------|---------------------|
| GET    | `/api/categories`      | List all categories |
| POST   | `/api/categories`      | Create category     |
| PUT    | `/api/categories/{id}` | Update category     |
| DELETE | `/api/categories/{id}` | Delete category     |

### Expenses
| Method | Endpoint             | Description       |
|--------|----------------------|-------------------|
| GET    | `/api/expenses`      | List all expenses |
| POST   | `/api/expenses`      | Add expense       |
| PUT    | `/api/expenses/{id}` | Update expense    |
| DELETE | `/api/expenses/{id}` | Delete expense    |

---

## 🔒 Security

- Passwords hashed with BCrypt
- JWT tokens expire in 24 hours
- All API endpoints (except auth) require `Authorization: Bearer <token>`
- CORS configured for localhost dev (update for production)

---

## 🗄️ Switch to MySQL/PostgreSQL

1. Add MySQL/Postgres dependency in `pom.xml`
2. Update `application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/expensedb
spring.datasource.username=root
spring.datasource.password=yourpassword
spring.jpa.hibernate.ddl-auto=update
```

---

## 📱 Mobile PWA Setup

Add to `index.html` for installable PWA:
```html
<link rel="manifest" href="/manifest.json" />
```

---

## 📁 Project Structure

```
expense-tracker/
├── backend/
│   ├── src/main/java/com/tracker/
│   │   ├── controller/     # REST endpoints
│   │   ├── service/        # Business logic
│   │   ├── model/          # JPA entities
│   │   ├── repository/     # Spring Data repos
│   │   ├── security/       # JWT + Spring Security
│   │   └── dto/            # Request/Response objects
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── pages/          # Dashboard, Expenses, Categories, Login, Register
│   │   ├── components/     # Layout, shared UI
│   │   ├── context/        # Auth context
│   │   └── services/       # Axios API client
│   └── package.json
└── docker-compose.yml
```

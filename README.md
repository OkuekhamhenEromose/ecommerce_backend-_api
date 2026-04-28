# 🛒 E-commerce Backend API

A production-ready e-commerce backend built with **NestJS, TypeScript, Prisma, and JWT authentication**, supporting full product, cart, and order workflows.

---

## 🚀 Features

### 🔐 Authentication & Authorization

* JWT-based authentication (Register/Login)
* Protected routes using guards
* Role-based access control (Admin / User)
* Secure password hashing (bcrypt)

### 📦 Product Management

* Create, Read, Update, Delete (CRUD)
* Public product listing
* Get product by slug
* Pagination support

### 🛒 Cart Management

* Add/remove items
* Update quantity
* Retrieve cart
* Auto total calculation

### 📋 Order Management

* View order history
* Retrieve order details
* Order workflow structure ready

### 📁 Category Management

* Public category listing
* Admin-based creation (via role control or Prisma Studio)

---

## 🛠 Tech Stack

* **Framework:** NestJS
* **Language:** TypeScript
* **Database:** SQLite (Prisma ORM)
* **Authentication:** JWT
* **Validation:** class-validator
* **Caching:** Redis (implemented)
* **Documentation:** Swagger (OpenAPI)

---

## 🏗 Architecture

* Modular monorepo structure (NestJS modules)
* Controller → Service → Repository pattern
* DTO validation layer
* Environment-based configuration

---

## 📂 Project Structure

```
src/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── products/
│   ├── categories/
│   ├── cart/
│   ├── orders/
│   └── prisma/
├── common/
└── config/
```

---

## ⚙️ Setup Instructions

### 1. Clone Repository

```bash
git clone https://github.com/OkuekhamhenEromose/ecommerce_backend-_api
cd ecommerce-backend-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Create `.env` file:

```env
PORT=3000
DATABASE_URL="file:./dev.db"
JWT_SECRET=your-secret-key
THROTTLE_TTL=60
THROTTLE_LIMIT=100
```

### 4. Prisma Setup

```bash
npx prisma generate
npx prisma db push
```

### 5. Run Application

```bash
npm run start:dev
```

---

## 📚 API Documentation

Swagger UI:

```
http://localhost:3000/api/docs
```

---

## 🧪 Tested Endpoints (Verified Working)

✔ Authentication (Register/Login)
✔ User Profile
✔ Categories (via Prisma Studio)
✔ Products (Create, Read, Slug retrieval)
✔ Cart (Add, Retrieve)
✔ Orders (Retrieve)

> All endpoints were tested using PowerShell and Postman successfully.

---

## 🔎 Sample Test Flow

1. Login → get JWT token
2. Fetch categories
3. Create product
4. Fetch products
5. Add product to cart
6. Retrieve cart
7. Fetch orders

---

## ⚠️ Notes

* Category creation is restricted (Admin role), so categories were seeded via Prisma Studio.
* JWT tokens expire — must refresh before protected requests.
* Product pagination implemented with skip/take logic.

---

## 📦 Bonus Implementations

* Clean modular architecture
* DTO validation
* Error handling
* Rate limiting
* Redis caching layer
* Swagger documentation

---

## 👨‍💻 Author

Backend Technical Assessment Submission

---

## ✅ Status

🚀 **All core requirements implemented and tested successfully.**

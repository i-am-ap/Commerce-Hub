# 🛒 Commerce Hub

<div align="center">

### 🚀 Industry-Level Full Stack Multi-Vendor E-Commerce Platform

Inspired by modern commerce platforms like Amazon, Flipkart, and Shopify.

Built using React, Vite, Express, MongoDB, Redis, JWT Authentication, Docker, Cloudinary, Razorpay, Google OAuth, and modern scalable architecture.

</div>

---

# ✨ Overview

Commerce Hub is a powerful multi-role e-commerce platform that supports:

✅ Customers  
✅ Sellers  
✅ Admins  

with a complete real-world marketplace workflow.

The platform includes:

- 🛍️ Dynamic storefront
- 🔐 JWT authentication + refresh token sessions
- 🔑 Google OAuth login
- 📦 Seller inventory management
- 🧠 Personalized recommendations
- 💳 Razorpay / Stripe payment integration
- ☁️ Cloudinary image uploads
- ⚡ Redis session caching
- 🔍 Advanced search & filtering
- 📊 Analytics & dashboards
- 🔔 Real-time notifications
- 🐳 Dockerized services
- 📄 Swagger API docs
- 🚀 CI/CD-ready deployment structure

---

# 🌐 Tech Stack

## 🖥️ Frontend

| Technology | Usage |
|---|---|
| React + Vite | Frontend Framework |
| Redux Toolkit | Global State Management |
| React Router | Routing |
| Tailwind CSS | Styling |
| ShadCN UI | Modern UI Components |
| Axios | API Requests |
| Socket.io Client | Real-time Updates |
| Google OAuth | Google Sign-In |
| Google Analytics | User Tracking |

---

## ⚙️ Backend

| Technology | Usage |
|---|---|
| Node.js | Runtime |
| Express.js | API Server |
| MongoDB | Primary Database |
| Mongoose | ODM |
| Redis | Session & Cache Store |
| JWT | Authentication |
| Socket.io | Live Notifications |
| Cloudinary | Image Storage |
| Razorpay / Stripe | Payment Gateway |
| ElasticSearch | Product Search |
| Swagger | API Documentation |

---

## ☁️ DevOps & Deployment

| Technology | Usage |
|---|---|
| Docker | Containerization |
| Docker Compose | Multi-Service Orchestration |
| Nginx | Reverse Proxy |
| GitHub Actions | CI/CD |
| AWS EC2 | Deployment |
| AWS S3 | Static Hosting |

---

# 🔥 Major Features

# 👤 Authentication System

✅ JWT Access + Refresh Tokens  
✅ HTTP-only Secure Cookies  
✅ Google OAuth Login  
✅ Password Reset System  
✅ Session Management using Redis  
✅ Role-Based Authorization  

---

# 🛍️ Customer Features

✅ Browse products  
✅ Search & filter products  
✅ Product recommendations  
✅ Product reviews & ratings  
✅ Add to cart  
✅ Apply coupons  
✅ Secure checkout  
✅ Track orders  
✅ Wishlist support  
✅ Personalized shopping experience  

---

# 🏪 Seller Dashboard

✅ Seller registration & approval  
✅ Add products dynamically from UI  
✅ Upload multiple product images  
✅ Cloudinary image storage  
✅ Add specifications & tags  
✅ Edit products  
✅ Delete products  
✅ Inventory management  
✅ Revenue tracking  
✅ Seller order monitoring  

---

# 🛠️ Admin Dashboard

✅ Seller approval system  
✅ User management  
✅ Product moderation  
✅ Platform analytics  
✅ Order monitoring  
✅ Dashboard metrics  

---

# 💳 Payment System

Integrated payment architecture using:

- 💳 Razorpay
- 💳 Stripe

Supports:

✅ Real payment processing  
✅ Order creation  
✅ Payment verification  
✅ Secure checkout flow  
✅ Payment abstraction layer  

---

# ☁️ Cloudinary Integration

Commerce Hub uses Cloudinary for:

✅ Product image uploads  
✅ CDN image delivery  
✅ Optimized image rendering  
✅ Cloud image storage  

---

# ⚡ Redis Integration

Redis is used for:

✅ Refresh token sessions  
✅ Fast authentication lookup  
✅ Cache optimization  
✅ Session invalidation  
✅ Performance improvements  

---

# 🔍 Search System

Supports:

✅ Product search  
✅ Tag search  
✅ Category filtering  
✅ Price filtering  
✅ Keyword indexing  
✅ ElasticSearch integration  

---

# 📊 Analytics

Integrated with Google Analytics for:

✅ Visitor tracking  
✅ User activity monitoring  
✅ Product engagement analysis  
✅ Traffic analytics  
✅ Performance insights  

---

# 🔔 Real-Time Features

Using Socket.io:

✅ Live notifications  
✅ Order updates  
✅ Seller alerts  
✅ Instant UI updates  

---

# 📸 Screenshots

<img width="1897" height="910" alt="image" src="https://github.com/user-attachments/assets/814805f6-99c3-4259-944d-17d6d24c72cf" />&nbsp;
<img width="1892" height="910" alt="image" src="https://github.com/user-attachments/assets/b810b571-c583-47b8-abd9-c7a6c9480272" />&nbsp;
<img width="1895" height="906" alt="image" src="https://github.com/user-attachments/assets/449fcfd9-2d78-4dc1-8c91-4360c3ea1dc9" />&nbsp;
<img width="1892" height="908" alt="image" src="https://github.com/user-attachments/assets/fe61451a-3261-4d54-bc69-8665c5998fbc" />&nbsp;
<img width="1917" height="911" alt="image" src="https://github.com/user-attachments/assets/fccc5dd5-7c87-48b4-89cb-431309c49a27" />&nbsp;
<img width="1842" height="911" alt="image" src="https://github.com/user-attachments/assets/9abe2c9d-9d11-40e2-b80f-2fb855986d86" />


---


# 🧠 Advanced Architecture

Commerce Hub follows scalable industry architecture:

✅ RESTful APIs  
✅ Modular backend structure  
✅ Middleware-based security  
✅ MVC pattern  
✅ Service-layer architecture  
✅ Environment-based configuration  
✅ Reusable UI components  
✅ Protected routes  
✅ Role-based access control  

---

# 📁 Folder Structure

```text
client/
  src/
    app/
    components/
    features/
    hooks/
    lib/
    pages/

server/
  src/
    config/
    controllers/
    middleware/
    models/
    routes/
    services/
    sockets/
    seed/

docker-compose.yml
nginx/
docs/
```

---

# ⚙️ Installation & Setup

# 1️⃣ Clone Repository

```bash
git clone <your-repository-url>
cd commerce-hub
```

---

# 2️⃣ Install Dependencies

```bash
npm install
npm install --workspace server
npm install --workspace client
```

---

# 3️⃣ Configure Environment Variables

## Root `.env`

```env
NODE_ENV=development
CLIENT_URL=http://localhost:5173
API_URL=http://localhost:5000
MONGO_URI=mongodb://localhost:27017/commerce-hub
REDIS_URL=redis://localhost:6379
```

---

## `server/.env`

```env
PORT=5000

ACCESS_TOKEN_SECRET=your_secret
REFRESH_TOKEN_SECRET=your_secret

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

GOOGLE_CLIENT_ID=
```

---

## `client/.env`

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=
VITE_GA_MEASUREMENT_ID=
```

---

# 4️⃣ Start MongoDB & Redis

Using Docker:

```bash
docker run -d --name redis -p 6379:6379 redis
```

MongoDB can be:

- Local MongoDB
- MongoDB Atlas
- Docker MongoDB

---

# 5️⃣ Run Development Server

```bash
npm run dev
```

---

# 6️⃣ Seed Demo Data

```bash
npm run seed
```

---

# 🔑 Demo Credentials

## 👑 Admin

```text
admin@commercehub.dev
Admin@123
```

---

## 🏪 Seller

```text
seller@commercehub.dev
Seller@123
```

---

## 🛍️ Customer

```text
customer@commercehub.dev
Customer@123
```

---

# 📄 API Documentation

## Swagger Docs

```text
http://localhost:5000/docs
```

---

## Health Check

```text
http://localhost:5000/health
```

---

# 🚀 Production Features

✅ Dockerized Architecture  
✅ Nginx Reverse Proxy  
✅ CI/CD Ready  
✅ Secure Cookie Authentication  
✅ Scalable Backend Design  
✅ Production-Level Middleware  
✅ Error Handling System  
✅ API Validation  
✅ Cache Optimization  

---

# 🧪 Future Improvements

- 📱 React Native Mobile App
- 🤖 AI Product Recommendations
- 🧠 AI Chatbot Support
- 📈 Seller AI Analytics
- 🌍 Multi-language Support
- 💬 Live Chat
- 📦 Shipment Tracking APIs
- 🧾 Invoice Generation
- 🧠 AI Search Suggestions

---

# 🏆 Project Level

This project demonstrates:

✅ Full Stack Development  
✅ Backend Architecture  
✅ Authentication Systems  
✅ DevOps & Deployment  
✅ Cloud Integration  
✅ Payment Gateway Integration  
✅ Real-Time Systems  
✅ Database Design  
✅ Scalable Marketplace Logic  

---

# 👨‍💻 Developed By

### Aryan Palaspagar

🚀 Full Stack Developer | AI/ML Enthusiast | Cloud & DevOps Learner

---

# ⭐ Support

If you like this project:

⭐ Star the repository  
🍴 Fork the project  
🚀 Contribute to Commerce Hub

---

# 📜 License

This project is licensed under the MIT License.

# Flamia 🕯️

A premium candle e-commerce platform with luxury animated UI, featuring OTP authentication, variant-based products, multiple payment options, and comprehensive review system.

## 📋 Project Overview

**Project Type:** Premium Candle E-Commerce  
**Architecture:** Monolithic (Layered)  
**Repositories:** Separate frontend & backend

### Core Features

- 📱 OTP login using Indian mobile numbers
- 👥 Admin & Customer role management
- 🎨 Product variants with size-based pricing
- 🎟️ Coupon system
- 💳 Razorpay payment integration
- 📸 Manual UPI with screenshot upload
- 📦 Order tracking (Shiprocket manual entry)
- ⭐ Reviews with images + audio support
- ✨ Luxury animated UI with alive landing page

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React with Vite
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion
- **HTTP Client:** Axios
- **Authentication:** Supabase JS (OTP)
- **State Management:** Zustand (cart state)

### Backend
- **Framework:** Spring Boot 3
- **Language:** Java 17
- **Security:** Spring Security
- **ORM:** Spring Data JPA
- **Database:** PostgreSQL (Supabase)
- **Payment:** Razorpay Java SDK
- **Storage:** Supabase Storage REST
- **Email:** Spring Mail

### Hosting
- **Backend:** Render (Free tier)
- **Frontend:** Vercel (Free tier)
- **Database:** Supabase (Free tier)

---

## 🏗️ Architecture

```
Frontend (React) → Spring Boot API → PostgreSQL (Supabase)
                          ↓
                  Supabase Storage
```

**Authentication Flow:**
- OTP handled by Supabase
- JWT verified by Spring Security

---

## 📊 Database Schema

### Core Tables

**profiles**
- User accounts with mobile number authentication
- Role-based access (admin/customer)

**addresses**
- Multiple addresses per user
- Default address support

**products & product_sizes**
- Products with variant-based pricing
- Stock management per size

**coupons**
- Flat and percentage discounts
- Minimum cart value validation
- Expiry date management

**orders & order_items**
- Complete order management
- Payment and tracking status

**reviews**
- Product reviews with rating (1-5)
- Image and audio attachments
- Order-based validation

### Storage Buckets
- `product-media` - Product images
- `review-media` - Review images and audio
- `payment-proofs` - UPI payment screenshots

**File Limits:**
- Images: Max 3MB
- Audio: Max 3MB

---

## 📁 Backend Structure (Layered Architecture)

```
com.flamia/
├── controller/     # REST endpoints
├── service/        # Business logic
├── repository/     # Data access
├── entity/         # Database entities
├── dto/            # Data transfer objects
├── mapper/         # DTO ↔ Entity conversion
├── security/       # JWT & authentication
├── config/         # Configuration classes
├── exception/      # Exception handling
└── util/           # Helper utilities
```

**Flow:** Controller → Service → Repository  
**Mapping:** DTO ↔ Entity via Mapper

---

## 🔐 Authentication Flow

1. User enters mobile number
2. Supabase sends OTP
3. User verifies OTP
4. Supabase returns JWT
5. Frontend sends JWT in `Authorization` header
6. Spring validates JWT using Supabase public key
7. User role loaded from `profiles` table

**Note:** Admin accounts are seeded manually.

---

## 💳 Payment Integration

### Razorpay (Standard)
1. Backend creates Razorpay order
2. Frontend opens Razorpay checkout
3. Webhook verifies payment
4. Order status updated to `paid`

### Manual UPI
1. User uploads screenshot + UTR number
2. Order status set to `pending`
3. Admin manually verifies payment
4. Payment status updated to `verified`

---

## 📦 Order Flow

```
Cart → Apply Coupon → Validate Stock → Create Order →
Choose Payment → Confirm → Email Sent →
Admin Adds Tracking → Customer Tracks Order
```

---

## ⭐ Review System

### Rules
Users can review only if:
- Order exists and belongs to them
- Product is in that order
- Payment status is `paid`

### Admin Controls
- ✅ Can delete reviews
- ❌ Cannot edit reviews

---

## 📂 Frontend Structure

```
src/
├── components/     # Reusable UI components
├── pages/          # Route pages
├── layouts/        # Layout wrappers
├── services/       # API calls
├── hooks/          # Custom React hooks
├── store/          # Zustand state management
├── animations/     # Framer Motion configs
└── utils/          # Helper functions
```

---

## 🎨 UI Design Principles

**Theme:** Luxury + Animated + Alive

**Colors:**
- Ivory background
- Soft gold accents
- Deep charcoal text

**Typography:**
- Headings: Playfair Display (Serif)
- Body: Inter (Sans-serif)

**Landing Page Features:**
- Hero fade-in animation
- Scroll-based reveal
- Parallax effects
- Glowing buttons
- Storytelling sections
- Smooth transitions

**Design Philosophy:** No SaaS layout. No boxed dashboard look.

---

## 🚀 Development Phases

1. **PHASE 1** – Supabase Schema Setup
2. **PHASE 2** – Spring Boot Core Setup
3. **PHASE 3** – Security + JWT Integration
4. **PHASE 4** – Product Module
5. **PHASE 5** – Order + Coupon Logic
6. **PHASE 6** – Payment Integration
7. **PHASE 7** – Review System
8. **PHASE 8** – React UI Static
9. **PHASE 9** – API Integration
10. **PHASE 10** – Deployment

**⚠️ Follow strict order. No skipping.**

---

## 🔧 Setup Instructions

### Prerequisites
- Java 17
- Node.js 18+
- PostgreSQL (via Supabase)
- Razorpay account
- Supabase account

### Backend Setup

```bash
# Clone repository
git clone <backend-repo-url>
cd flamia-backend

# Configure application.properties
# Add Supabase, Razorpay, and database credentials

# Build and run
./mvnw spring-boot:run
```

### Frontend Setup

```bash
# Clone repository
git clone <frontend-repo-url>
cd flamia-frontend

# Install dependencies
npm install

# Configure environment variables
# Add backend API URL and Supabase credentials

# Run development server
npm run dev
```

---

## 🌐 Deployment

### Backend (Render)
- Java 17 environment
- Set all environment variables
- Enable health endpoint
- Monitor cold start delays

### Frontend (Vercel)
- Connect repository
- Configure backend URL in environment
- Production build optimization
- Enable automatic deployments

---

## ⚡ Performance Considerations

- Optimize JVM memory for free tier
- Stream file uploads
- Compress images client-side
- Use pagination for orders/reviews
- Avoid loading large objects in memory

---

## ⚠️ Risk Areas & Mitigation

| Risk | Mitigation |
|------|------------|
| Razorpay webhook validation | Test with Razorpay test mode |
| JWT validation mismatch | Verify Supabase public key |
| CORS misconfiguration | Configure Spring Security properly |
| File upload memory leaks | Use streaming uploads |
| Render cold start delays | Implement health checks |

**Strategy:** Test each module independently before integration.

---

## 🤖 AI Development Strategy

### Claude (Complex Logic)
- Architecture decisions
- Security implementation
- Business rule validation
- Debugging complex issues

### GitHub Copilot (Boilerplate)
- Entity and DTO generation
- Repository interfaces
- Mapper methods
- Service method completion

**Golden Rule:** Never generate full project at once. Generate per module.

---

## 📝 Workflow Summary

1. Setup Supabase (schema + storage)
2. Setup Spring Boot project
3. Implement security layer
4. Build product module
5. Build order module
6. Integrate payments
7. Build review system
8. Build animated frontend
9. Connect API endpoints
10. Deploy to production

---

## 📄 License

Proprietary - All rights reserved

---

## 👥 Team

**Development:** In Progress  
**Status:** Building Phase by Phase

---

## 📞 Support

For issues or questions, contact the development team.

---

**Built with ❤️ for luxury candle enthusiasts**

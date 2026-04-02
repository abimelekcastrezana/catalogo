You are a senior fullstack engineer.

The Sequelize models and relationships are already implemented.

Your task is to build the API layer using Next.js App Router, including authentication with NextAuth (Credentials Provider: email + password).

---

## ⚙️ Tech Stack

* Next.js (App Router)
* API Routes (`/app/api`)
* Sequelize (already configured)
* NextAuth (Credentials provider)
* bcrypt for password hashing
* UUID for IDs
* Local file storage (`/public/uploads`)

---

## 🔐 Authentication

Implement NextAuth with:

* Credentials provider (email + password)
* Password hashed with bcrypt
* Sessions using JWT

### User Model (add if not exists)

User:

* id (UUID, PK)
* email (string, unique)
* password (hashed)
* vendorId (FK → Vendor.id)  // 1 user = 1 vendor
* createdAt
* updatedAt

---

## 🔑 Auth Endpoints

POST `/api/auth/register`

* create user
* create vendor at the same time
* required:

  * email
  * password
  * vendor name
  * slug
  * whatsappPhone

POST `/api/auth/login`

* handled by NextAuth Credentials provider

---

## 🔒 Protected Routes

Require authentication (session):

* POST /api/vendors/[vendorId]/categories
* POST /api/vendors/[vendorId]/products
* POST /api/products/[productId]/images

Validate:

* user.vendorId === vendorId

---

## 📦 Public Endpoints

### Vendors

GET `/api/vendors`
GET `/api/vendors/[slug]`

---

### Categories

GET `/api/vendors/[slug]/categories`

---

### Products

GET `/api/vendors/[slug]/products`

* optional: categoryId

---

## 🛒 Cart (Guest)

NO authentication required.

POST `/api/carts`

* create cart with vendorId
* generate guestKey

GET `/api/carts/[guestKey]`
POST `/api/carts/[guestKey]/items`
PATCH `/api/carts/[guestKey]/items/[productId]`
DELETE `/api/carts/[guestKey]/items/[productId]`

---

## 📸 Image Upload

POST `/api/products/[productId]/images`

* max 2 images per product
* store in:
  `/public/uploads/products/{productId}/`
* save path in DB

---

## 💬 WhatsApp Order Endpoint

GET `/api/carts/[guestKey]/checkout`

* build WhatsApp message:

Format:

"Hola, quiero hacer el siguiente pedido:

* Producto: {name}
  SKU: {sku}
  Cantidad: {quantity}

Nombre: {cartName (optional)}"

* return:

{
"url": "https://wa.me/{vendorPhone}?text={encodedMessage}"
}

---

## 🧠 Rules

* Use async/await
* Clean code, no overengineering
* Validate inputs
* Handle errors properly
* Use HTTP status codes
* Keep controllers simple

---

## 📁 Suggested Structure

/app/api/
auth/
vendors/
products/
carts/

---

## 🎯 Goal

Deliver a working MVP backend with:

* authentication
* vendor management
* product catalog
* guest cart
* WhatsApp checkout

Code should be production-ready but minimal.

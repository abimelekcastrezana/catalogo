vendors
- id: UUID PK
- name: string NOT NULL
- slug: string UNIQUE NOT NULL
- logoUrl: string NULL
- whatsappPhone: string NOT NULL
- createdAt: datetime
- updatedAt: datetime

categories
- id: UUID PK
- vendorId: UUID FK -> vendors.id NOT NULL
- name: string NOT NULL
- slug: string NOT NULL
- createdAt: datetime
- updatedAt: datetime

UNIQUE(vendorId, slug)

products
- id: UUID PK
- vendorId: UUID FK -> vendors.id NOT NULL
- categoryId: UUID FK -> categories.id NULL
- name: string NOT NULL
- sku: string NOT NULL
- description: text NULL
- isActive: boolean DEFAULT true
- createdAt: datetime
- updatedAt: datetime

UNIQUE(vendorId, sku)

product_images
- id: UUID PK
- productId: UUID FK -> products.id NOT NULL
- path: string NOT NULL   // ejemplo: /uploads/products/abc123.jpg
- position: int NOT NULL
- createdAt
- updatedAt

carts
- id: UUID PK
- vendorId: UUID FK -> vendors.id NOT NULL
- guestKey: string UNIQUE NOT NULL
- cartName: string NULL
- status: string DEFAULT 'active'
- createdAt: datetime
- updatedAt: datetime

cart_items
- id: UUID PK
- cartId: UUID FK -> carts.id NOT NULL
- productId: UUID FK -> products.id NOT NULL
- quantity: int NOT NULL DEFAULT 1
- createdAt: datetime
- updatedAt: datetime

UNIQUE(cartId, productId)


vendors 1 --- N categories
vendors 1 --- N products
vendors 1 --- N carts
categories 1 --- N products
products 1 --- 2 product_images
carts 1 --- N cart_items
products 1 --- N cart_items
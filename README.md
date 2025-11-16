# 🗄️ E-Commerce Platform Database Schema

This document describes the structure of the **E-Commerce Platform Database**, including all tables, their fields, and key relationships.

---

## 📋 All Tables and Their Fields

---

### 🧱 Table: `DeliveryRider`

| Field | Type | Key | Description |
|-------|------|-----|--------------|
| ID | int | PRI | Primary key |
| Name | varchar(255) |  | Rider's full name |
| Address | text |  | Rider's address |
| Email | varchar(255) | UNI | Unique email ID |
| Phone | varchar(20) | UNI | Unique phone number |
| PasswordHash | varchar(255) |  | Encrypted password |
| IsActive | tinyint(1) |  | Rider account status |
| AadharCardNumber | varchar(20) | UNI | Unique Aadhar number |
| DrivingLicenseNumber | varchar(50) | UNI | Unique license number |
| CreatedAt | timestamp |  | Record creation time |
| UpdatedAt | timestamp |  | Last updated timestamp |

---

### 🧱 Table: `admin_user`

| Field | Type | Key | Description |
|-------|------|-----|--------------|
| id | int | PRI | Primary key |
| businessId | int | MUL | Foreign key to `business_details.id` |
| username | varchar(100) | UNI | Unique username |
| email | varchar(100) | UNI | Unique admin email |
| passwordHash | varchar(255) |  | Encrypted password |
| createdAt | datetime |  | Created date |
| isActive | tinyint(1) |  | Active status |
| role | varchar(50) |  | Admin role type |

---

### 🧱 Table: `business_details`

| Field | Type | Key | Description |
|-------|------|-----|--------------|
| id | int | PRI | Primary key |
| owner_name | varchar(100) |  | Owner's name |
| business_name | varchar(150) |  | Name of the business |
| business_email | varchar(100) |  | Business email |
| business_phone_no | varchar(20) |  | Business phone number |
| personal_phone_no | varchar(20) |  | Owner’s personal phone |
| gst_number | varchar(30) |  | GST Identification Number |
| business_docs | text |  | Uploaded documents |
| business_address | text |  | Registered address |
| business_front_image | varchar(255) |  | Front image of store |
| is_verified | tinyint(1) |  | Verification status |

---

### 🧱 Table: `categories`

| Field | Type | Key | Description |
|-------|------|-----|--------------|
| id | int | PRI | Primary key |
| name | varchar(255) |  | Category name |
| image | text |  | Category image URL |
| icon | text |  | Icon for category |
| parent_id | int | MUL | Parent category (for subcategories) |
| status | enum('active','inactive') |  | Current status |
| created_at | datetime |  | Creation date |
| updated_at | datetime |  | Last update timestamp |

---

### 🧱 Table: `inventory`

| Field | Type | Key | Description |
|-------|------|-----|--------------|
| id | int | PRI | Primary key |
| product_name | varchar(255) |  | Product name |
| business_id | int | MUL | Linked business |
| available_sizes | varchar(50) |  | Available sizes |
| available_colour | varchar(100) |  | Available colors |
| prices | decimal(10,2) |  | Price |
| is_return_acceptable | tinyint(1) |  | Can item be returned |
| is_available_on_rent | tinyint(1) |  | Is item rentable |
| product_images | text |  | Product image URLs |
| combo_details | text |  | Combo information |
| description | text |  | Product description |
| fabric_material | varchar(255) |  | Fabric/material info |
| status | enum('Active','Inactive') |  | Product visibility status |
| available_online | tinyint(1) |  | Availability in online store |

---

### 🧱 Table: `products`

| Field | Type | Key | Description |
|-------|------|-----|--------------|
| id | int | PRI | Primary key |
| business_id | int | MUL | Foreign key to `business_details.id` |
| name | varchar(255) |  | Product name |
| description | text |  | Product description |
| price | decimal(18,2) |  | Product price |
| stock_quantity | int |  | Quantity available |
| images | json |  | Product images |
| status | enum('pending','approved','rejected','blocked') |  | Product approval state |
| sku | varchar(100) | UNI | Unique SKU number |
| created_at | datetime |  | Created date |
| updated_at | datetime |  | Updated date |

---

### 🧱 Table: `users`

| Field | Type | Key | Description |
|-------|------|-----|--------------|
| id | int | PRI | Primary key |
| fullName | varchar(255) |  | Full name of user |
| email | varchar(255) | UNI | Unique email |
| password | varchar(255) |  | Hashed password |
| confirmPassword | varchar(255) |  | Confirmation password (may be deprecated) |
| phone | varchar(15) |  | User phone number |
| address | text |  | Address of user |
| gender | enum('Male','Female','Other') |  | Gender |
| profileImage | varchar(255) |  | Profile picture URL |
| status | enum('Active','Inactive') |  | Account status |
| isDeleted | tinyint(1) |  | Soft delete flag |
| createdA

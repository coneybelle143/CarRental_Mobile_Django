
-- ============================================================================
-- 1. USERS TABLE - Main user accounts (Tenants & Landlords)
-- ============================================================================
CREATE TABLE users (
  id VARCHAR(50) PRIMARY KEY,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  user_type ENUM('tenant', 'landlord') NOT NULL,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  profile_image_url VARCHAR(500),
  bio TEXT,
  verified BOOLEAN DEFAULT FALSE,
  verification_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  INDEX idx_email (email),
  INDEX idx_phone (phone),
  INDEX idx_user_type (user_type),
  INDEX idx_verified (verified)
);

-- ============================================================================
-- 2. TENANT_PROFILE TABLE - Extended tenant information
-- ============================================================================
CREATE TABLE tenant_profile (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL UNIQUE,
  occupation VARCHAR(100),
  company_name VARCHAR(100),
  id_type ENUM('national_id', 'passport', 'drivers_license') DEFAULT 'national_id',
  id_number VARCHAR(50) UNIQUE,
  date_of_birth DATE,
  gender ENUM('male', 'female', 'other'),
  move_in_date DATE,
  budget_min DECIMAL(10, 2),
  budget_max DECIMAL(10, 2),
  preferences TEXT,
  emergency_contact_name VARCHAR(100),
  emergency_contact_phone VARCHAR(20),
  rating DECIMAL(3, 2) DEFAULT 0.00,
  total_reviews INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_budget (budget_min, budget_max)
);

-- ============================================================================
-- 3. LANDLORD_PROFILE TABLE - Extended landlord information
-- ============================================================================
CREATE TABLE landlord_profile (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL UNIQUE,
  company_name VARCHAR(100),
  years_experience INT DEFAULT 0,
  total_properties INT DEFAULT 0,
  response_rate DECIMAL(5, 2) DEFAULT 0.00,
  response_time VARCHAR(50),
  rating DECIMAL(3, 2) DEFAULT 0.00,
  total_reviews INT DEFAULT 0,
  verification_document_url VARCHAR(500),
  tax_id VARCHAR(50) UNIQUE,
  bank_account_verified BOOLEAN DEFAULT FALSE,
  join_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_verified (verification_document_url)
);

-- ============================================================================
-- 4. LISTINGS TABLE - Boarding house/room listings
-- ============================================================================
CREATE TABLE listings (
  id VARCHAR(50) PRIMARY KEY,
  landlord_id VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  property_type ENUM('boarding_house', 'apartment', 'room', 'dormitory') DEFAULT 'boarding_house',
  room_type ENUM('single_room', 'shared_room', 'studio', 'suite') DEFAULT 'single_room',
  address VARCHAR(255) NOT NULL,
  city VARCHAR(50) NOT NULL,
  postal_code VARCHAR(20),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  max_guests INT DEFAULT 1,
  price_per_month DECIMAL(10, 2) NOT NULL,
  amenities JSON,
  images JSON,
  floor_plans JSON,
  virtual_tour_url VARCHAR(500),
  available BOOLEAN DEFAULT TRUE,
  total_rooms INT,
  available_rooms INT,
  rating DECIMAL(3, 2) DEFAULT 0.00,
  total_reviews INT DEFAULT 0,
  total_views INT DEFAULT 0,
  favorite_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (landlord_id) REFERENCES landlord_profile(id) ON DELETE CASCADE,
  INDEX idx_landlord_id (landlord_id),
  INDEX idx_city (city),
  INDEX idx_price (price_per_month),
  INDEX idx_available (available),
  INDEX idx_rating (rating)
);

-- ============================================================================
-- 5. BOOKINGS TABLE - Tenant bookings/reservations
-- ============================================================================
CREATE TABLE bookings (
  id VARCHAR(50) PRIMARY KEY,
  listing_id VARCHAR(50) NOT NULL,
  tenant_id VARCHAR(50) NOT NULL,
  landlord_id VARCHAR(50) NOT NULL,
  booking_date DATE NOT NULL,
  move_in_date DATE NOT NULL,
  move_out_date DATE,
  status ENUM('pending', 'approved', 'rejected', 'cancelled', 'completed') DEFAULT 'pending',
  duration_months INT,
  number_of_guests INT DEFAULT 1,
  special_requests TEXT,
  landlord_notes TEXT,
  booking_reason ENUM('urgent', 'student', 'work', 'family', 'other') DEFAULT 'other',
  total_amount DECIMAL(10, 2),
  deposit_amount DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
  FOREIGN KEY (tenant_id) REFERENCES tenant_profile(id) ON DELETE CASCADE,
  FOREIGN KEY (landlord_id) REFERENCES landlord_profile(id) ON DELETE CASCADE,
  INDEX idx_tenant_id (tenant_id),
  INDEX idx_landlord_id (landlord_id),
  INDEX idx_listing_id (listing_id),
  INDEX idx_status (status),
  INDEX idx_dates (move_in_date, move_out_date)
);

-- ============================================================================
-- 6. PAYMENTS TABLE - Payment records
-- ============================================================================
CREATE TABLE payments (
  id VARCHAR(50) PRIMARY KEY,
  booking_id VARCHAR(50),
  landlord_id VARCHAR(50) NOT NULL,
  tenant_id VARCHAR(50) NOT NULL,
  listing_id VARCHAR(50) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_type ENUM('rent', 'deposit', 'utility', 'maintenance', 'other') DEFAULT 'rent',
  status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  payment_method ENUM('bank_transfer', 'credit_card', 'debit_card', 'mobile_wallet', 'cash') DEFAULT 'bank_transfer',
  transaction_id VARCHAR(100) UNIQUE,
  due_date DATE,
  paid_date DATE,
  recorded_manually BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
  FOREIGN KEY (landlord_id) REFERENCES landlord_profile(id) ON DELETE CASCADE,
  FOREIGN KEY (tenant_id) REFERENCES tenant_profile(id) ON DELETE CASCADE,
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
  INDEX idx_landlord_id (landlord_id),
  INDEX idx_tenant_id (tenant_id),
  INDEX idx_status (status),
  INDEX idx_due_date (due_date),
  INDEX idx_paid_date (paid_date)
);

-- ============================================================================
-- 7. MESSAGES TABLE - Direct messages between tenants and landlords
-- ============================================================================
CREATE TABLE messages (
  id VARCHAR(50) PRIMARY KEY,
  conversation_id VARCHAR(50) NOT NULL,
  sender_id VARCHAR(50) NOT NULL,
  receiver_id VARCHAR(50) NOT NULL,
  sender_type ENUM('tenant', 'landlord') NOT NULL,
  message_text TEXT,
  message_type ENUM('text', 'image', 'document', 'inquiry', 'booking', 'payment_reminder') DEFAULT 'text',
  media_url VARCHAR(500),
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_conversation_id (conversation_id),
  INDEX idx_sender_id (sender_id),
  INDEX idx_receiver_id (receiver_id),
  INDEX idx_is_read (is_read),
  INDEX idx_created_at (created_at)
);

-- ============================================================================
-- 8. CONVERSATIONS TABLE - Chat conversations
-- ============================================================================
CREATE TABLE conversations (
  id VARCHAR(50) PRIMARY KEY,
  landlord_id VARCHAR(50) NOT NULL,
  tenant_id VARCHAR(50) NOT NULL,
  listing_id VARCHAR(50),
  booking_id VARCHAR(50),
  conversation_topic ENUM('inquiry', 'booking', 'maintenance', 'payment', 'general') DEFAULT 'general',
  last_message TEXT,
  last_message_sender_id VARCHAR(50),
  last_message_time TIMESTAMP,
  unread_count_tenant INT DEFAULT 0,
  unread_count_landlord INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (landlord_id) REFERENCES landlord_profile(id) ON DELETE CASCADE,
  FOREIGN KEY (tenant_id) REFERENCES tenant_profile(id) ON DELETE CASCADE,
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE SET NULL,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
  INDEX idx_landlord_id (landlord_id),
  INDEX idx_tenant_id (tenant_id),
  INDEX idx_listing_id (listing_id),
  INDEX idx_is_active (is_active)
);

-- ============================================================================
-- 9. INQUIRIES TABLE - General inquiries and support tickets
-- ============================================================================
CREATE TABLE inquiries (
  id VARCHAR(50) PRIMARY KEY,
  listing_id VARCHAR(50),
  tenant_id VARCHAR(50),
  landlord_id VARCHAR(50),
  inquiry_type ENUM('availability', 'pricing', 'amenities', 'booking', 'support', 'complaint') DEFAULT 'availability',
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  response_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP,
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE SET NULL,
  FOREIGN KEY (tenant_id) REFERENCES tenant_profile(id) ON DELETE CASCADE,
  FOREIGN KEY (landlord_id) REFERENCES landlord_profile(id) ON DELETE CASCADE,
  INDEX idx_tenant_id (tenant_id),
  INDEX idx_landlord_id (landlord_id),
  INDEX idx_status (status),
  INDEX idx_priority (priority)
);

-- ============================================================================
-- 10. REVIEWS TABLE - Reviews for listings and users
-- ============================================================================
CREATE TABLE reviews (
  id VARCHAR(50) PRIMARY KEY,
  reviewed_item_type ENUM('listing', 'landlord', 'tenant') NOT NULL,
  reviewed_item_id VARCHAR(50) NOT NULL,
  reviewer_id VARCHAR(50) NOT NULL,
  booking_id VARCHAR(50),
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title VARCHAR(255),
  review_text TEXT,
  cleanliness INT CHECK (cleanliness BETWEEN 1 AND 5),
  communication INT CHECK (communication BETWEEN 1 AND 5),
  amenities INT CHECK (amenities BETWEEN 1 AND 5),
  location INT CHECK (location BETWEEN 1 AND 5),
  value_for_money INT CHECK (value_for_money BETWEEN 1 AND 5),
  helpful_count INT DEFAULT 0,
  images JSON,
  reviewer_name VARCHAR(100),
  is_verified_booking BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
  INDEX idx_reviewed_item (reviewed_item_type, reviewed_item_id),
  INDEX idx_rating (rating),
  INDEX idx_created_at (created_at)
);

-- ============================================================================
-- 11. FAVORITES TABLE - Tenant favorite listings
-- ============================================================================
CREATE TABLE favorites (
  id VARCHAR(50) PRIMARY KEY,
  tenant_id VARCHAR(50) NOT NULL,
  listing_id VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenant_profile(id) ON DELETE CASCADE,
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
  UNIQUE KEY unique_favorite (tenant_id, listing_id),
  INDEX idx_tenant_id (tenant_id),
  INDEX idx_listing_id (listing_id)
);

-- ============================================================================
-- 12. NOTIFICATIONS TABLE - System notifications
-- ============================================================================
CREATE TABLE notifications (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  notification_type ENUM('booking_request', 'booking_approved', 'payment_due', 'message', 'review', 'system') DEFAULT 'system',
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  related_entity_type VARCHAR(50),
  related_entity_id VARCHAR(50),
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  action_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_is_read (is_read),
  INDEX idx_created_at (created_at)
);

-- ============================================================================
-- 13. SEARCH_HISTORY TABLE - Track user searches
-- ============================================================================
CREATE TABLE search_history (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50),
  search_query VARCHAR(255),
  filters JSON,
  results_count INT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_timestamp (timestamp)
);

-- ============================================================================
-- 14. TRANSACTIONS_LOG TABLE - Financial transaction log
-- ============================================================================
CREATE TABLE transactions_log (
  id VARCHAR(50) PRIMARY KEY,
  transaction_type ENUM('payment_in', 'payment_out', 'refund', 'deposit', 'withdrawal', 'fee') DEFAULT 'payment_in',
  user_id VARCHAR(50) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'PHP',
  status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
  reference_id VARCHAR(100),
  payment_id VARCHAR(50),
  description TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_timestamp (timestamp)
);

-- ============================================================================
-- 15. DOCUMENTS TABLE - User documents (ID verification, etc.)
-- ============================================================================
CREATE TABLE documents (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  document_type ENUM('national_id', 'passport', 'drivers_license', 'business_permit', 'proof_of_address') DEFAULT 'national_id',
  document_url VARCHAR(500) NOT NULL,
  verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
  verified_by VARCHAR(50),
  verification_notes TEXT,
  expiration_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  verified_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_status (verification_status)
);

-- ============================================================================
-- 16. FEEDBACK TABLE - User feedback and complaints
-- ============================================================================
CREATE TABLE feedback (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  feedback_type ENUM('bug_report', 'feature_request', 'complaint', 'suggestion', 'other') DEFAULT 'other',
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  related_entity_type VARCHAR(50),
  related_entity_id VARCHAR(50),
  attachment_url VARCHAR(500),
  status ENUM('open', 'in_review', 'in_progress', 'completed', 'closed') DEFAULT 'open',
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ============================================================================
CREATE INDEX idx_users_created ON users(created_at);
CREATE INDEX idx_listings_created ON listings(created_at);
CREATE INDEX idx_bookings_created ON bookings(created_at);
CREATE INDEX idx_payments_created ON payments(created_at);
CREATE INDEX idx_messages_created ON messages(created_at);

-- ============================================================================
-- ERD RELATIONSHIP SUMMARY
-- ============================================================================
/*

CORE ENTITIES:
├── USERS (id, email, user_type, etc.)
│   ├── 1-to-1 ─→ TENANT_PROFILE (via user_id)
│   ├── 1-to-1 ─→ LANDLORD_PROFILE (via user_id)
│   ├── 1-to-many ─→ DOCUMENTS (via user_id)
│   ├── 1-to-many ─→ NOTIFICATIONS (via user_id)
│   ├── 1-to-many ─→ MESSAGES (sender_id / receiver_id)
│   ├── 1-to-many ─→ FEEDBACK (via user_id)
│   └── 1-to-many ─→ SEARCH_HISTORY (via user_id)
│
├── TENANT_PROFILE
│   ├── 1-to-many ─→ BOOKINGS (via tenant_id)
│   ├── 1-to-many ─→ FAVORITES (via tenant_id)
│   ├── 1-to-many ─→ PAYMENTS (via tenant_id)
│   ├── 1-to-many ─→ INQUIRIES (via tenant_id)
│   └── 1-to-many ─→ CONVERSATIONS (via tenant_id)
│
├── LANDLORD_PROFILE
│   ├── 1-to-many ─→ LISTINGS (via landlord_id)
│   ├── 1-to-many ─→ BOOKINGS (via landlord_id)
│   ├── 1-to-many ─→ PAYMENTS (via landlord_id)
│   ├── 1-to-many ─→ INQUIRIES (via landlord_id)
│   └── 1-to-many ─→ CONVERSATIONS (via landlord_id)
│
├── LISTINGS
│   ├── 1-to-many ─→ BOOKINGS (via listing_id)
│   ├── 1-to-many ─→ FAVORITES (via listing_id)
│   ├── 1-to-many ─→ PAYMENTS (via listing_id)
│   ├── 1-to-many ─→ REVIEWS (via reviewed_item_id)
│   ├── 1-to-many ─→ CONVERSATIONS (via listing_id)
│   └── 1-to-many ─→ INQUIRIES (via listing_id)
│
├── BOOKINGS
│   ├── 1-to-many ─→ PAYMENTS (via booking_id)
│   ├── 1-to-many ─→ REVIEWS (via booking_id)
│   ├── 1-to-many ─→ CONVERSATIONS (via booking_id)
│   └── 1-to-1 ─→ CONVERSATIONS (reverse relation)
│
├── MESSAGES
│   └── Many-to-1 ─→ CONVERSATIONS (via conversation_id)
│
├── PAYMENTS
│   └── 1-to-many ─→ TRANSACTIONS_LOG (via payment_id)
│
└── REVIEWS
    └── Covers: listings, landlords, tenants
    └── Links back to: bookings for verification

AGGREGATION PATHS:
- Tenant booking flow: USERS → TENANT_PROFILE → BOOKINGS → PAYMENTS
- Landlord income flow: USERS → LANDLORD_PROFILE → LISTINGS → BOOKINGS → PAYMENTS
- Communication flow: USERS → CONVERSATIONS → MESSAGES
- Review flow: BOOKINGS → REVIEWS (after checkout)
- Search flow: USERS → SEARCH_HISTORY → LISTINGS
*/



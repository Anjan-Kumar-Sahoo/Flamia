-- ============================================================
-- V001: Create users table
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supabase_id     VARCHAR(255) NOT NULL UNIQUE,
    phone           VARCHAR(15) NOT NULL UNIQUE,
    name            VARCHAR(100),
    email           VARCHAR(255),
    role            VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER'
                        CHECK (role IN ('CUSTOMER', 'ADMIN')),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    last_login_at   TIMESTAMP
);

CREATE INDEX idx_users_supabase_id ON users (supabase_id);
CREATE INDEX idx_users_phone ON users (phone);

-- ============================================================
-- V002: Create categories table
-- ============================================================

CREATE TABLE IF NOT EXISTS categories (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL UNIQUE,
    slug            VARCHAR(120) NOT NULL UNIQUE,
    description     TEXT,
    image_url       VARCHAR(500),
    display_order   INTEGER NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON categories (slug);

-- ============================================================
-- V003: Create products table
-- ============================================================

CREATE TABLE IF NOT EXISTS products (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(200) NOT NULL,
    slug                VARCHAR(250) NOT NULL UNIQUE,
    description         TEXT,
    short_description   VARCHAR(300),
    price               NUMERIC(10,2) NOT NULL CHECK (price > 0),
    compare_at_price    NUMERIC(10,2) CHECK (compare_at_price IS NULL OR compare_at_price >= 0),
    stock_quantity      INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    category_id         UUID NOT NULL REFERENCES categories(id),
    scent_notes         VARCHAR(500),
    weight              VARCHAR(50),
    burn_time           VARCHAR(50),
    ingredients         TEXT,
    average_rating      NUMERIC(3,2) NOT NULL DEFAULT 0.00,
    review_count        INTEGER NOT NULL DEFAULT 0,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_slug ON products (slug);
CREATE INDEX idx_products_category ON products (category_id);
CREATE INDEX idx_products_active ON products (is_active);
CREATE INDEX idx_products_price ON products (price);

-- ============================================================
-- V004: Create product_images table
-- ============================================================

CREATE TABLE IF NOT EXISTS product_images (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    url             VARCHAR(500) NOT NULL,
    alt_text        VARCHAR(200),
    display_order   INTEGER NOT NULL DEFAULT 0,
    is_primary      BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_product_images_product ON product_images (product_id);

-- ============================================================
-- V005: Create addresses table
-- ============================================================

CREATE TABLE IF NOT EXISTS addresses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    label           VARCHAR(50),
    full_name       VARCHAR(100) NOT NULL,
    phone           VARCHAR(15) NOT NULL,
    address_line1   VARCHAR(255) NOT NULL,
    address_line2   VARCHAR(255),
    city            VARCHAR(100) NOT NULL,
    state           VARCHAR(100) NOT NULL,
    pincode         VARCHAR(6) NOT NULL CHECK (pincode ~ '^[1-9][0-9]{5}$'),
    is_default      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_addresses_user ON addresses (user_id);

-- ============================================================
-- V006: Create orders table
-- ============================================================

CREATE TABLE IF NOT EXISTS orders (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number    VARCHAR(30) NOT NULL UNIQUE,
    user_id         UUID NOT NULL REFERENCES users(id),
    status          VARCHAR(20) NOT NULL DEFAULT 'PLACED'
                        CHECK (status IN ('PLACED','CONFIRMED','SHIPPED','DELIVERED','CANCELLED')),
    subtotal        NUMERIC(10,2) NOT NULL,
    discount        NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    total           NUMERIC(10,2) NOT NULL,
    coupon_code     VARCHAR(20),
    address_json    JSONB NOT NULL,
    tracking_id     VARCHAR(100),
    notes           TEXT,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_user ON orders (user_id);
CREATE INDEX idx_orders_status ON orders (status);
CREATE INDEX idx_orders_created ON orders (created_at DESC);
CREATE INDEX idx_orders_stale ON orders (created_at) WHERE status = 'PLACED';

-- ============================================================
-- V007: Create order_items table
-- ============================================================

CREATE TABLE IF NOT EXISTS order_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id      UUID NOT NULL REFERENCES products(id),
    product_name    VARCHAR(200) NOT NULL,
    product_image   VARCHAR(500),
    quantity        INTEGER NOT NULL CHECK (quantity > 0),
    unit_price      NUMERIC(10,2) NOT NULL CHECK (unit_price > 0),
    total_price     NUMERIC(10,2) NOT NULL CHECK (total_price > 0)
);

CREATE INDEX idx_order_items_order ON order_items (order_id);
CREATE INDEX idx_order_items_product ON order_items (product_id);

-- ============================================================
-- V008: Create payments table
-- ============================================================

CREATE TABLE IF NOT EXISTS payments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id            UUID NOT NULL UNIQUE REFERENCES orders(id),
    method              VARCHAR(20) NOT NULL
                            CHECK (method IN ('RAZORPAY','UPI_MANUAL')),
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                            CHECK (status IN ('PENDING','PAID','FAILED')),
    amount              NUMERIC(10,2) NOT NULL,
    razorpay_order_id   VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    razorpay_signature  VARCHAR(255),
    utr_number          VARCHAR(50),
    screenshot_url      VARCHAR(500),
    remarks             VARCHAR(500),
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_order ON payments (order_id);
CREATE INDEX idx_payments_status ON payments (status);

-- ============================================================
-- V009: Create reviews table
-- ============================================================

CREATE TABLE IF NOT EXISTS reviews (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    product_id      UUID NOT NULL REFERENCES products(id),
    rating          INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment         VARCHAR(2000),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, product_id)
);

CREATE INDEX idx_reviews_product ON reviews (product_id);
CREATE INDEX idx_reviews_user ON reviews (user_id);

-- ============================================================
-- V010: Create review_media table
-- ============================================================

CREATE TABLE IF NOT EXISTS review_media (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id       UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    media_type      VARCHAR(10) NOT NULL CHECK (media_type IN ('IMAGE','AUDIO')),
    url             VARCHAR(500) NOT NULL,
    file_name       VARCHAR(255),
    file_size       BIGINT CHECK (file_size IS NULL OR file_size <= 3145728)
);

CREATE INDEX idx_review_media_review ON review_media (review_id);

-- ============================================================
-- V011: Create coupons table
-- ============================================================

CREATE TABLE IF NOT EXISTS coupons (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code                VARCHAR(20) NOT NULL UNIQUE,
    description         VARCHAR(255),
    type                VARCHAR(20) NOT NULL
                            CHECK (type IN ('PERCENTAGE','FIXED_AMOUNT')),
    value               NUMERIC(10,2) NOT NULL CHECK (value > 0),
    minimum_order_value NUMERIC(10,2) DEFAULT 0.00,
    maximum_discount    NUMERIC(10,2),
    usage_limit         INTEGER,
    used_count          INTEGER NOT NULL DEFAULT 0,
    per_user_limit      INTEGER NOT NULL DEFAULT 1,
    status              VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                            CHECK (status IN ('ACTIVE','INACTIVE','EXPIRED')),
    start_date          TIMESTAMP,
    end_date            TIMESTAMP,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_coupons_code ON coupons (code);
CREATE INDEX idx_coupons_status ON coupons (status);

-- ============================================================
-- V012: Create coupon_usages table
-- ============================================================

CREATE TABLE IF NOT EXISTS coupon_usages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id       UUID NOT NULL REFERENCES coupons(id),
    user_id         UUID NOT NULL REFERENCES users(id),
    order_id        UUID NOT NULL REFERENCES orders(id),
    used_at         TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (coupon_id, order_id)
);

CREATE INDEX idx_coupon_usages_coupon_user ON coupon_usages (coupon_id, user_id);

-- ============================================================
-- V013: Enable pg_trgm extension for product search
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Trigram index for fuzzy product name search
CREATE INDEX idx_products_name_trgm ON products USING gin (name gin_trgm_ops);

-- ============================================================
-- V014: Seed initial categories
-- ============================================================

INSERT INTO categories (name, slug, description, display_order) VALUES
    ('Signature Scents',    'signature-scents',    'Our most beloved and iconic fragrances',     1),
    ('Seasonal Collection', 'seasonal-collection', 'Limited edition candles for every season',    2),
    ('Wellness & Calm',     'wellness-and-calm',   'Soothing scents for relaxation and meditation', 3),
    ('Gift Sets',           'gift-sets',           'Curated candle gift boxes for every occasion', 4),
    ('Mini Candles',        'mini-candles',        'Travel-sized luxury for on-the-go fragrance', 5)
ON CONFLICT (slug) DO NOTHING;

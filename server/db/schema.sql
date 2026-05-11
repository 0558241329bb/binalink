-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT CHECK(role IN ('client', 'provider', 'admin')) NOT NULL DEFAULT 'client',
    avatar_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Service Providers Table (Extends User)
CREATE TABLE IF NOT EXISTS service_providers (
    user_id INTEGER PRIMARY KEY,
    business_name TEXT NOT NULL,
    category TEXT NOT NULL, -- e.g., 'Contractor', 'Architect', 'Plumber', 'Interior Designer'
    description TEXT,
    location TEXT, -- e.g., 'Algiers', 'Oran', 'Constantine'
    experience_years INTEGER,
    is_verified BOOLEAN DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Services Offered by Providers
CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    provider_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    price_range TEXT, -- e.g., '10k - 50k DZD'
    FOREIGN KEY (provider_id) REFERENCES service_providers(user_id) ON DELETE CASCADE
);

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    provider_id INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT CHECK(status IN ('pending', 'active', 'completed', 'cancelled')) NOT NULL DEFAULT 'pending',
    budget REAL,
    start_date DATETIME,
    end_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (provider_id) REFERENCES service_providers(user_id) ON DELETE SET NULL
);

-- Project Milestones
CREATE TABLE IF NOT EXISTS milestones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    due_date DATETIME,
    status TEXT CHECK(status IN ('pending', 'completed')) NOT NULL DEFAULT 'pending',
    payment_amount REAL,
    is_paid BOOLEAN DEFAULT 0,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER UNIQUE NOT NULL,
    client_id INTEGER NOT NULL,
    provider_id INTEGER NOT NULL,
    rating INTEGER CHECK(rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (provider_id) REFERENCES service_providers(user_id) ON DELETE CASCADE
);

-- New fields for provider_profiles
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS contractorTier TEXT DEFAULT 'STANDARD';
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS capitalAmount INTEGER;
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS brandReputation TEXT;
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS priceRangeMin INTEGER;
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS priceRangeMax INTEGER;
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS serviceType TEXT;
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS blueprintImages TEXT;
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS publicPhone TEXT;
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS publicEmail TEXT;
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS starRating INTEGER DEFAULT 3;
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS reputationScore TEXT;
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS pricePerUnit INTEGER;
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS completionTimeWeeks INTEGER;

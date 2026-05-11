-- Darie Tech: PostgreSQL Database Schema
-- Optimized for a construction marketplace connecting homeowners with multiple providers

-- 1. Extensions & Custom Types
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE user_role AS ENUM ('client', 'provider', 'admin');
CREATE TYPE project_status AS ENUM ('draft', 'bidding', 'active', 'completed', 'cancelled');
CREATE TYPE milestone_status AS ENUM ('pending', 'in_progress', 'review', 'completed');
CREATE TYPE quote_status AS ENUM ('pending', 'accepted', 'rejected', 'expired');
CREATE TYPE media_type AS ENUM ('image', 'video', 'document');

-- 2. Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'client',
    avatar_url TEXT,
    phone_number TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Service Providers Profile
CREATE TABLE service_providers (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    bio TEXT,
    location TEXT NOT NULL, -- e.g., 'Algiers, Algeria'
    experience_years INT DEFAULT 0,
    skills TEXT[] DEFAULT '{}', -- Array of skills
    portfolio_urls JSONB DEFAULT '[]', -- List of portfolio item objects
    availability_status BOOLEAN DEFAULT true,
    average_rating DECIMAL(3, 2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Categories & Subcategories
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    icon_url TEXT
);

CREATE TABLE subcategories (
    id SERIAL PRIMARY KEY,
    category_id INT REFERENCES categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    UNIQUE(category_id, name)
);

-- 5. Services Offered
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID REFERENCES service_providers(user_id) ON DELETE CASCADE,
    subcategory_id INT REFERENCES subcategories(id),
    title TEXT NOT NULL,
    description TEXT,
    base_price DECIMAL(12, 2),
    price_unit TEXT DEFAULT 'total', -- e.g., 'per sqm', 'per hour'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Projects
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    location TEXT,
    status project_status DEFAULT 'draft',
    total_budget DECIMAL(15, 2),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Project Assignments (Linking multiple providers to one project)
CREATE TABLE project_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES service_providers(user_id) ON DELETE CASCADE,
    role_in_project TEXT, -- e.g., 'Lead Architect', 'Plumbing Subcontractor'
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, provider_id)
);

-- 8. Quotes / Bids
CREATE TABLE quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES service_providers(user_id) ON DELETE CASCADE,
    amount DECIMAL(15, 2) NOT NULL,
    estimated_duration_days INT,
    proposal_text TEXT,
    status quote_status DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ
);

-- 9. Project Milestones (Phases)
CREATE TABLE project_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INT NOT NULL, -- To maintain sequence
    completion_percentage INT DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    status milestone_status DEFAULT 'pending',
    due_date DATE,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Media (Photos/Videos per Milestone)
CREATE TABLE media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    milestone_id UUID REFERENCES project_milestones(id) ON DELETE CASCADE,
    uploader_id UUID REFERENCES users(id),
    url TEXT NOT NULL,
    file_type media_type NOT NULL,
    caption TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Reviews
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    client_id UUID REFERENCES users(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES service_providers(user_id) ON DELETE CASCADE,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(project_id, client_id, provider_id) -- One review per provider per project
);

-- 12. Messages (In-app Chat)
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Indexes for Performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_projects_client ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_milestones_project ON project_milestones(project_id);
CREATE INDEX idx_quotes_project ON quotes(project_id);
CREATE INDEX idx_messages_project ON messages(project_id);
CREATE INDEX idx_media_milestone ON media(milestone_id);
CREATE INDEX idx_providers_category ON services(subcategory_id);

-- 14. Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_projects_modtime BEFORE UPDATE ON projects FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_providers_modtime BEFORE UPDATE ON service_providers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

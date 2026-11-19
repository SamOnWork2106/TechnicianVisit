-- ==============================================================================
-- IntelliGreen Technologies — Supabase Database Schema
-- Standalone Field Service & Air Quality Reporting Platform
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- Table: technicians
-- Technician profiles permitted to log into the field portal
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.technicians (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    role VARCHAR(50) DEFAULT 'field_technician',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Seed primary technician account (LokendraS)
INSERT INTO public.technicians (username, full_name, email, phone, role)
VALUES 
    ('LokendraS', 'Lokendra Sharma', 'lokendra@intelligreentech.com', '+91 98765 43210', 'lead_technician'),
    ('technician', 'Field Technician', 'service@intelligreentech.com', '+91 98765 43211', 'field_technician')
ON CONFLICT (username) DO UPDATE 
SET full_name = EXCLUDED.full_name,
    email = EXCLUDED.email;

-- ==============================================================================
-- Table: commissioning_reports
-- Permanent persistence for on-site commissioning reports
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.commissioning_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_number VARCHAR(100),
    client_name VARCHAR(255) NOT NULL,
    project_name VARCHAR(255) NOT NULL,
    site_location VARCHAR(255),
    system_type VARCHAR(255),
    commissioning_date DATE,
    technician_id VARCHAR(100),
    technician_name VARCHAR(255) NOT NULL,
    engineer_name VARCHAR(255),
    client_rep_name VARCHAR(255),
    manager_email VARCHAR(255) DEFAULT 'vikash@intelligreentech.com',
    company_email VARCHAR(255) DEFAULT 'info@intelligreentech.com',
    ion_samples_count INT DEFAULT 0,
    sensors_count INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'submitted',
    pdf_filename VARCHAR(255),
    raw_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for rapid lookup and reporting dashboards
CREATE INDEX IF NOT EXISTS idx_comm_reports_client ON public.commissioning_reports(client_name);
CREATE INDEX IF NOT EXISTS idx_comm_reports_project ON public.commissioning_reports(project_name);
CREATE INDEX IF NOT EXISTS idx_comm_reports_date ON public.commissioning_reports(commissioning_date);
CREATE INDEX IF NOT EXISTS idx_comm_reports_technician ON public.commissioning_reports(technician_name);
CREATE INDEX IF NOT EXISTS idx_comm_reports_created_at ON public.commissioning_reports(created_at DESC);

-- ==============================================================================
-- Table: ppm_reports
-- Permanent persistence for Periodic Preventive Maintenance (PPM) check lists
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.ppm_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_number VARCHAR(100),
    client_name VARCHAR(255) NOT NULL,
    project_name VARCHAR(255) NOT NULL,
    site_location VARCHAR(255),
    system_installed VARCHAR(255),
    maintenance_date DATE,
    service_contract_no VARCHAR(100),
    quarter_or_type VARCHAR(100),
    technician_name VARCHAR(255) NOT NULL,
    client_rep_name VARCHAR(255),
    manager_email VARCHAR(255) DEFAULT 'vikash@intelligreentech.com',
    company_email VARCHAR(255) DEFAULT 'info@intelligreentech.com',
    status VARCHAR(50) DEFAULT 'submitted',
    client_remarks TEXT,
    pdf_filename VARCHAR(255),
    raw_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for PPM queries
CREATE INDEX IF NOT EXISTS idx_ppm_reports_client ON public.ppm_reports(client_name);
CREATE INDEX IF NOT EXISTS idx_ppm_reports_project ON public.ppm_reports(project_name);
CREATE INDEX IF NOT EXISTS idx_ppm_reports_date ON public.ppm_reports(maintenance_date);
CREATE INDEX IF NOT EXISTS idx_ppm_reports_technician ON public.ppm_reports(technician_name);
CREATE INDEX IF NOT EXISTS idx_ppm_reports_created_at ON public.ppm_reports(created_at DESC);

-- ==============================================================================
-- Row-Level Security (RLS) Policies
-- Allow public access with anon / service_role API keys
-- ==============================================================================
ALTER TABLE public.technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissioning_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ppm_reports ENABLE ROW LEVEL SECURITY;

-- Technicians table policies
CREATE POLICY "Allow public read on technicians" 
ON public.technicians FOR SELECT USING (true);

CREATE POLICY "Allow service role full access on technicians" 
ON public.technicians FOR ALL USING (true);

-- Commissioning reports policies
CREATE POLICY "Allow read on commissioning_reports" 
ON public.commissioning_reports FOR SELECT USING (true);

CREATE POLICY "Allow insert on commissioning_reports" 
ON public.commissioning_reports FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update on commissioning_reports" 
ON public.commissioning_reports FOR UPDATE USING (true);

-- PPM reports policies
CREATE POLICY "Allow read on ppm_reports" 
ON public.ppm_reports FOR SELECT USING (true);

CREATE POLICY "Allow insert on ppm_reports" 
ON public.ppm_reports FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update on ppm_reports" 
ON public.ppm_reports FOR UPDATE USING (true);

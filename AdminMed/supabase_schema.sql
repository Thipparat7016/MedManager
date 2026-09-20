-- ==============================================================================
-- MedManager Database Schema & RLS Policies for Supabase
-- ==============================================================================

-- 1. Table: medications (ข้อมูลยาพื้นฐาน)
CREATE TABLE IF NOT EXISTS medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL,
  name_th VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL, -- e.g. เม็ด, แคปซูล, ยาน้ำ
  dosage VARCHAR(100) NOT NULL, -- e.g. 500, 1000
  unit VARCHAR(50) NOT NULL DEFAULT 'mg', -- mg, ml, IU, g
  category VARCHAR(100) NOT NULL DEFAULT 'ยา', -- ยา, อาหารเสริม
  indications TEXT, -- ข้อบ่งใช้
  instructions TEXT, -- วิธีรับประทาน / ข้อแนะนำ
  precautions TEXT, -- ข้อควรระวังและผลข้างเคียง
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table: drug_food_interactions (ปฏิสัมพันธ์ยา-อาหาร)
CREATE TABLE IF NOT EXISTS drug_food_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50),
  medication_id UUID REFERENCES medications(id) ON DELETE SET NULL,
  medication_name VARCHAR(255) NOT NULL,
  food_name VARCHAR(255) NOT NULL,
  interaction_type VARCHAR(100) NOT NULL, -- หลีกเลี่ยง, แนะนำ, ข้อควรระวัง
  severity VARCHAR(50) NOT NULL, -- สูง, กลาง, ต่ำ
  hours_note VARCHAR(100), -- เช่น 2 ชม. ก่อน-หลัง
  hours_before NUMERIC DEFAULT 0,
  hours_after NUMERIC DEFAULT 0,
  impact_details TEXT NOT NULL,
  source_type VARCHAR(100), -- FDA / WHO / PubMed / Thai FDA
  source_name VARCHAR(255) NOT NULL,
  url_doi TEXT,
  publish_year VARCHAR(10),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Table: app_users (รายชื่อบัญชีผู้ใช้งานแอป)
CREATE TABLE IF NOT EXISTS app_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  status VARCHAR(50) DEFAULT 'Active', -- Active, Pending, Suspended
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Table: admin_profiles (ข้อมูลโปรไฟล์แอดมิน)
CREATE TABLE IF NOT EXISTS admin_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  role VARCHAR(100) DEFAULT 'Admin',
  avatar_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Table: activity_logs (บันทึกกิจกรรมล่าสุด)
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  time VARCHAR(20) NOT NULL,
  user_name VARCHAR(150) NOT NULL,
  activity VARCHAR(150) NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Row Level Security (RLS) Policies (แก้ปัญหา 403 Forbidden)
-- ------------------------------------------------------------------------------

-- 1. medications
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to medications" ON medications;
CREATE POLICY "Allow all access to medications" ON medications FOR ALL USING (true) WITH CHECK (true);

-- 2. drug_food_interactions
ALTER TABLE drug_food_interactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to drug_food_interactions" ON drug_food_interactions;
CREATE POLICY "Allow all access to drug_food_interactions" ON drug_food_interactions FOR ALL USING (true) WITH CHECK (true);

-- 3. app_users
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to app_users" ON app_users;
CREATE POLICY "Allow all access to app_users" ON app_users FOR ALL USING (true) WITH CHECK (true);

-- 4. admin_profiles
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to admin_profiles" ON admin_profiles;
CREATE POLICY "Allow all access to admin_profiles" ON admin_profiles FOR ALL USING (true) WITH CHECK (true);

-- 5. activity_logs
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to activity_logs" ON activity_logs;
CREATE POLICY "Allow all access to activity_logs" ON activity_logs FOR ALL USING (true) WITH CHECK (true);

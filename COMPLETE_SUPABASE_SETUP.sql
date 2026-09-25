-- ==============================================================================
-- MedManager: Complete Supabase Database Setup & RLS Policies
-- คำสั่ง SQL สำหรับรันใน Supabase Dashboard -> SQL Editor (New Query -> Run)
-- ครอบคลุมทั้ง 8 ตารางตาม context.md และเปิดสิทธิ์การอ่าน/เขียน (RLS Policies)
-- ==============================================================================

-- 1. Table: medications (ข้อมูลยาพื้นฐาน)
CREATE TABLE IF NOT EXISTS medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL,
  name_th VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  dosage VARCHAR(100) NOT NULL,
  unit VARCHAR(50) NOT NULL DEFAULT 'mg',
  category VARCHAR(100) NOT NULL DEFAULT 'ยา',
  indications TEXT,
  instructions TEXT,
  precautions TEXT,
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
  interaction_type VARCHAR(100) NOT NULL,
  severity VARCHAR(50) NOT NULL,
  hours_note VARCHAR(100),
  hours_before NUMERIC DEFAULT 0,
  hours_after NUMERIC DEFAULT 0,
  impact_details TEXT NOT NULL,
  source_type VARCHAR(100),
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
  status VARCHAR(50) DEFAULT 'Active',
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

-- 6. Table: appointments (นัดหมายแพทย์)
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES app_users(id) ON DELETE CASCADE,
  doctor_name VARCHAR(255) NOT NULL,
  department VARCHAR(255),
  hospital VARCHAR(255),
  appointment_date VARCHAR(50) NOT NULL,
  appointment_time VARCHAR(50) NOT NULL,
  details TEXT,
  status VARCHAR(50) DEFAULT 'confirmed',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Table: side_effects (บันทึกผลข้างเคียง)
CREATE TABLE IF NOT EXISTS side_effects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES app_users(id) ON DELETE CASCADE,
  medication_name VARCHAR(255) NOT NULL,
  symptoms TEXT[],
  severity VARCHAR(50) DEFAULT 'กลาง',
  log_date VARCHAR(50) NOT NULL,
  log_time VARCHAR(50) NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Table: user_schedules (ตารางยาและการกินยาประจำวัน)
CREATE TABLE IF NOT EXISTS user_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES app_users(id) ON DELETE CASCADE,
  medication_id UUID REFERENCES medications(id) ON DELETE SET NULL,
  medication_name VARCHAR(255) NOT NULL,
  dosage VARCHAR(100),
  unit VARCHAR(50),
  type VARCHAR(50),
  meal_timing VARCHAR(100),
  time VARCHAR(50) NOT NULL,
  date VARCHAR(50),
  is_taken BOOLEAN DEFAULT FALSE,
  taken_at VARCHAR(50),
  is_skipped BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- Row Level Security (RLS) Policies (ให้สิทธิ์อ่าน-เขียนทั้ง AdminMed และ MedApp)
-- ==============================================================================

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

-- 6. appointments
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to appointments" ON appointments;
CREATE POLICY "Allow all access to appointments" ON appointments FOR ALL USING (true) WITH CHECK (true);

-- 7. side_effects
ALTER TABLE side_effects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to side_effects" ON side_effects;
CREATE POLICY "Allow all access to side_effects" ON side_effects FOR ALL USING (true) WITH CHECK (true);

-- 8. user_schedules
ALTER TABLE user_schedules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to user_schedules" ON user_schedules;
CREATE POLICY "Allow all access to user_schedules" ON user_schedules FOR ALL USING (true) WITH CHECK (true);

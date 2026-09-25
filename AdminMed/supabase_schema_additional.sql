-- ==============================================================================
-- Additional Tables for MedManager: appointments, side_effects, user_schedules
-- Run this script in Supabase Dashboard -> SQL Editor
-- ==============================================================================

-- 6. Table: appointments (นัดหมายแพทย์)
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES app_users(id) ON DELETE SET NULL,
  doctor_name VARCHAR(255) NOT NULL,
  department VARCHAR(255),
  hospital VARCHAR(255),
  appointment_date VARCHAR(50) NOT NULL, -- e.g. '2026-07-13' or '13/07/2569'
  appointment_time VARCHAR(50) NOT NULL, -- e.g. '09:00 น.'
  details TEXT,
  status VARCHAR(50) DEFAULT 'confirmed', -- confirmed, pending, passed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Table: side_effects (บันทึกผลข้างเคียง)
CREATE TABLE IF NOT EXISTS side_effects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES app_users(id) ON DELETE SET NULL,
  medication_name VARCHAR(255) NOT NULL,
  symptoms TEXT[] NOT NULL DEFAULT '{}',
  severity VARCHAR(50) NOT NULL, -- สูง, กลาง, ต่ำ
  log_date VARCHAR(50),
  log_time VARCHAR(50),
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Table: user_schedules (ตารางการรับประทานยาและประวัติการกินยา)
CREATE TABLE IF NOT EXISTS user_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES app_users(id) ON DELETE SET NULL,
  medication_id UUID REFERENCES medications(id) ON DELETE CASCADE,
  medication_name VARCHAR(255) NOT NULL,
  dosage VARCHAR(100),
  unit VARCHAR(50),
  type VARCHAR(100),
  meal_timing VARCHAR(100),
  time VARCHAR(50) NOT NULL, -- e.g. '08:00 น.'
  date VARCHAR(50) NOT NULL, -- e.g. '2026-07-12'
  is_taken BOOLEAN DEFAULT false,
  taken_at VARCHAR(50),
  is_skipped BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- RLS Policies
-- ------------------------------------------------------------------------------
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to appointments" ON appointments;
CREATE POLICY "Allow all access to appointments" ON appointments FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE side_effects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to side_effects" ON side_effects;
CREATE POLICY "Allow all access to side_effects" ON side_effects FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE user_schedules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to user_schedules" ON user_schedules;
CREATE POLICY "Allow all access to user_schedules" ON user_schedules FOR ALL USING (true) WITH CHECK (true);

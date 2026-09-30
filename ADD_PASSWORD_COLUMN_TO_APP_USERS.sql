-- ============================================================================
-- SQL Script: เพิ่มคอลัมน์ password ในตาราง app_users สำหรับการตรวจสอบรหัสผ่าน
-- วิธีใช้: นำคำสั่งนี้ไปรันใน Supabase Dashboard -> SQL Editor
-- ============================================================================

ALTER TABLE app_users ADD COLUMN IF NOT EXISTS password VARCHAR(255);

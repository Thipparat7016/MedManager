# MedManager Project Context

## ภาพรวมโปรเจกต์
ระบบสนับสนุนการบริหารจัดการยาและการแจ้งเตือนสำหรับผู้ป่วย (MedManager) ประกอบด้วย 2 ส่วนหลัก:
1. **AdminMed**: ระบบ Admin Web Panel สำหรับผู้ดูแลระบบในการจัดการข้อมูลยาพื้นฐาน, ปฏิสัมพันธ์ยา-อาหาร, แดชบอร์ดสรุปผล, จัดการผู้ใช้งาน และระบบเข้าสู่ระบบ (Login)
2. **MedApp**: แอปพลิเคชันฝั่งผู้ป่วย/ผู้ใช้งานทั่วไป

## เทคโนโลยีที่ใช้ (Tech Stack)
* **Frontend**: React + Vite + React Router DOM + Lucide React (Icons)
* **Styling**: Vanilla CSS / Custom Modern Design System
* **Backend / Database**: Supabase (PostgreSQL + Supabase JS Client & Supabase Auth)
* **โหมดข้อมูล**: **Pure Supabase Mode (เริ่มจาก 0)** — ข้อมูลทั้งหมดดึงและบันทึกตรงกับ Supabase จริง

## โครงสร้าง Database (Supabase Schema)
### 1. `medications` (ข้อมูลยาพื้นฐาน)
* `id` (UUID, PK)
* `code` (VARCHAR)
* `name_th` (VARCHAR) — ชื่อยาภาษาไทย
* `name_en` (VARCHAR) — Drug Name (English)
* `type` (VARCHAR) — เช่น 'เม็ด', 'แคปซูล', 'ยาน้ำ'
* `dosage` (VARCHAR) — เช่น '500', '1000'
* `unit` (VARCHAR) — เช่น 'mg', 'ml', 'IU', 'g'
* `category` (VARCHAR) — 'ยา' / 'อาหารเสริม'
* `indications` (TEXT) — ข้อบ่งใช้
* `instructions` (TEXT) — วิธีรับประทาน / ข้อแนะนำ
* `precautions` (TEXT) — ข้อควรระวังและผลข้างเคียง
* `image_url` (TEXT) — URL ของรูปภาพยา
* `created_at` (TIMESTAMPTZ)
* `updated_at` (TIMESTAMPTZ)

### 2. `drug_food_interactions` (ปฏิสัมพันธ์ยา-อาหาร)
* `id` (UUID, PK)
* `code` (VARCHAR)
* `medication_name` (VARCHAR) — เช่น 'แอสไพริน / Aspirin'
* `food_name` (VARCHAR) — เช่น 'น้ำผลไม้ส้ม / เกรปฟรุต'
* `interaction_type` (VARCHAR) — 'หลีกเลี่ยง' / 'แนะนำ' / 'ข้อควรระวัง'
* `severity` (VARCHAR) — 'สูง' / 'กลาง' / 'ต่ำ'
* `hours_note` (VARCHAR) — เช่น '2 ชม. ก่อน-หลัง'
* `hours_before` (NUMERIC)
* `hours_after` (NUMERIC)
* `impact_details` (TEXT)
* `source_type` (VARCHAR)
* `source_name` (VARCHAR)
* `url_doi` (TEXT)
* `publish_year` (VARCHAR)
* `created_at` (TIMESTAMPTZ)

### 3. `app_users` (รายชื่อบัญชีผู้ใช้งานแอป)
* `id` (UUID, PK)
* `code` (VARCHAR)
* `name` (VARCHAR)
* `email` (VARCHAR)
* `phone` (VARCHAR)
* `status` (VARCHAR)
* `created_at` (TIMESTAMPTZ)

### 4. `admin_profiles` (ข้อมูลผู้ดูแลระบบ)
* `id` (UUID, PK)
* `first_name` (VARCHAR)
* `last_name` (VARCHAR)
* `email` (VARCHAR)
* `phone` (VARCHAR)
* `role` (VARCHAR)
* `avatar_url` (TEXT)
* `updated_at` (TIMESTAMPTZ)

### 5. `activity_logs` (บันทึกกิจกรรมล่าสุด)
* `id` (UUID, PK)
* `time` (VARCHAR)
* `user_name` (VARCHAR)
* `activity` (VARCHAR)
* `details` (TEXT)
* `created_at` (TIMESTAMPTZ)

---

## ข้อมูลการเชื่อมต่อ Supabase
* **Project URL**: `https://lgkabxnmgcwsuqrhmdyv.supabase.co`
* **Auth Provider**: Email & Password (`admin@gmail.com`)

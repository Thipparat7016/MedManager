import React from 'react'
import { Check } from 'lucide-react'
import AlertBanner from '../common/AlertBanner'

export default function AdminPersonalInfoCard({
  formData,
  saving,
  saveSuccess,
  onChange,
  onSave
}) {
  return (
    <div className="card">
      <div className="card-title">ข้อมูลส่วนตัว</div>

      <AlertBanner
        variant="settings-success"
        message={saveSuccess ? 'บันทึกข้อมูลส่วนตัวสำเร็จแล้ว' : ''}
      />

      <form onSubmit={onSave}>
        <div className="form-row" style={{ marginBottom: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              ชื่อ <span className="required">*</span>
            </label>
            <input
              type="text"
              name="first_name"
              className="form-input"
              placeholder="สมชาย"
              value={formData.first_name}
              onChange={onChange}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              นามสกุล <span className="required">*</span>
            </label>
            <input
              type="text"
              name="last_name"
              className="form-input"
              placeholder="ใจดี"
              value={formData.last_name}
              onChange={onChange}
              required
            />
          </div>
        </div>

        <div className="form-row" style={{ marginBottom: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              อีเมล <span className="required">*</span>
            </label>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="admin@gmail.com"
              value={formData.email}
              onChange={onChange}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              เบอร์โทรศัพท์ <span className="required">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              className="form-input"
              placeholder="081-234-5678"
              value={formData.phone}
              onChange={onChange}
              required
            />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '24px' }}>
          <label className="form-label">
            ตำแหน่ง <span className="required">*</span>
          </label>
          <input
            type="text"
            name="role"
            className="form-input"
            placeholder="Admin"
            value={formData.role}
            onChange={onChange}
            required
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '10px' }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 24px' }}
          >
            <Check size={16} />
            <span>{saving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}

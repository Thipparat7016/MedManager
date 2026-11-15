import React from 'react'

export default function DashboardKpiGrid({ stats }) {
  return (
    <div className="stat-cards-grid">
      {/* Card 1: Medications & Supplements */}
      <div className="stat-card">
        <div className="stat-value">{stats?.medicationsCount || '0'}</div>
        <div className="stat-label">ยาและอาหารเสริมในระบบ</div>
        <div className="stat-sub">{stats?.medicationsSub || 'ยังไม่มีรายการยาในคลัง'}</div>
      </div>

      {/* Card 2: Total Drug-Food Interactions */}
      <div className="stat-card">
        <div className="stat-value">{stats?.interactionsCount || '0'}</div>
        <div className="stat-label">ปฏิสัมพันธ์ยา-อาหารทั้งหมด</div>
        <div className="stat-sub">{stats?.interactionsSub || 'ยังไม่มีข้อมูลในฐานข้อมูล'}</div>
      </div>

      {/* Card 3: High-Severity Interactions */}
      <div className="stat-card">
        <div className="stat-value">{stats?.highSeverityInteractionsCount || '0'}</div>
        <div className="stat-label">ปฏิสัมพันธ์ระดับรุนแรงสูง</div>
        <div className="stat-sub">{stats?.highSeverityInteractionsSub || 'ไม่มีรายการความรุนแรงสูง'}</div>
      </div>

      {/* Card 4: Side Effect / ADR Reports */}
      <div className="stat-card">
        <div className="stat-value">{stats?.sideEffectsCount || '0'}</div>
        <div className="stat-label">รายงานผลข้างเคียง (ADR)</div>
        <div className="stat-sub">{stats?.sideEffectsSub || 'ยังไม่มีรายงานผลข้างเคียง'}</div>
      </div>

      {/* Card 5: Medication Adherence Rate */}
      <div className="stat-card">
        <div className="stat-value">{stats?.adherenceRate || '0%'}</div>
        <div className="stat-label">อัตราการกินยาตรงเวลา</div>
        <div className="stat-sub">{stats?.adherenceSub || 'ยังไม่มีประวัติการกินยา'}</div>
      </div>

      {/* Card 6: Patients in System */}
      <div className="stat-card">
        <div className="stat-value">{stats?.totalPatients || '0'}</div>
        <div className="stat-label">ผู้ป่วยในระบบ</div>
        <div className="stat-sub">{stats?.totalPatientsSub || 'ยังไม่มีผู้ป่วยในระบบ'}</div>
      </div>
    </div>
  )
}

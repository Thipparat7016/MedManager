import React from 'react'
import { Check } from 'lucide-react'
import AlertBanner from '../components/common/AlertBanner'
import InteractionMedicationSelect from '../components/interactions/InteractionMedicationSelect'
import InteractionFoodSelect from '../components/interactions/InteractionFoodSelect'
import { useInteractionForm } from '../hooks/useInteractionForm'
import './InteractionFormPage.css'

export default function InteractionFormPage() {
  const {
    isEditing,
    formData,
    saving,
    errorMsg,
    successMsg,
    autoFillSuccess,
    medSuggestions,
    showMedDropdown,
    medHighlightIndex,
    setMedHighlightIndex,
    medDropdownRef,
    showFoodDropdown,
    highlightIndex,
    setHighlightIndex,
    foodDropdownRef,
    orderedSuggestions,
    isRecommend,
    handleMedInputChange,
    handleMedInputFocus,
    handleSelectMedication,
    handleMedKeyDown,
    handleFoodNameChange,
    handleFoodInputFocus,
    handleChange,
    handleSelectFoodItem,
    handleKeyDown,
    handleSelectInteractionType,
    handleSelectSeverity,
    handleSubmit,
    handleCancel
  } = useInteractionForm()

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">{isEditing ? 'แก้ไข ปฏิสัมพันธ์ยา-อาหาร' : 'เพิ่ม ปฏิสัมพันธ์ยา-อาหาร'}</h1>
        <div className="page-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={handleCancel}
          >
            ยกเลิก
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Check size={16} />
            <span>{saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}</span>
          </button>
        </div>
      </div>

      <AlertBanner variant="error" message={errorMsg} />
      <AlertBanner variant="success" message={successMsg} />
      <AlertBanner variant="autofill-success" message={autoFillSuccess} />

      {/* Card 1: ข้อมูลหลัก */}
      <div className="card">
        <div className="card-title">ข้อมูลหลัก</div>

        {/* Row 1: ชื่อยา + ชื่ออาหาร (พร้อม dropdown list) */}
        <div className="form-row" style={{ marginBottom: '16px' }}>
          <InteractionMedicationSelect
            containerRef={medDropdownRef}
            value={formData.medication_name}
            onChange={handleMedInputChange}
            onFocus={handleMedInputFocus}
            onClick={handleMedInputFocus}
            onKeyDown={handleMedKeyDown}
            showDropdown={showMedDropdown}
            suggestions={medSuggestions}
            highlightIndex={medHighlightIndex}
            onSelect={handleSelectMedication}
            onHoverIndex={setMedHighlightIndex}
          />

          <InteractionFoodSelect
            containerRef={foodDropdownRef}
            value={formData.food_name}
            medicationName={formData.medication_name}
            onChange={handleFoodNameChange}
            onFocus={handleFoodInputFocus}
            onClick={handleFoodInputFocus}
            onKeyDown={handleKeyDown}
            showDropdown={showFoodDropdown}
            orderedSuggestions={orderedSuggestions}
            highlightIndex={highlightIndex}
            onSelect={handleSelectFoodItem}
            onHoverIndex={setHighlightIndex}
          />
        </div>

        {/* Row 2: ซ้าย (ประเภทปฏิสัมพันธ์) / ขวา (งดก่อน + งดหลัง อยู่ชิดกัน) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
            marginBottom: '24px',
            alignItems: 'flex-start'
          }}
        >
          {/* ฝั่งซ้าย: ประเภทปฏิสัมพันธ์ */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>
              ประเภทปฏิสัมพันธ์ <span className="required">*</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                className={`segment-btn ${formData.interaction_type === 'หลีกเลี่ยง' ? 'active' : ''}`}
                onClick={() => handleSelectInteractionType('หลีกเลี่ยง')}
                style={{
                  height: '42px',
                  minHeight: '42px',
                  padding: '0 8px',
                  fontSize: '13.5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <span>หลีกเลี่ยง</span>
              </button>
              <button
                type="button"
                className={`segment-btn ${isRecommend ? 'active' : ''}`}
                onClick={() => handleSelectInteractionType('แนะนำให้รับประทานร่วม')}
                style={{
                  height: '42px',
                  minHeight: '42px',
                  padding: '0 8px',
                  fontSize: '13.5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <span>แนะนำ</span>
              </button>
            </div>
          </div>

          {/* ฝั่งขวา: มัดรวม งดก่อน + งดหลัง */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>
                <span>งดก่อน (ชั่วโมง)</span>
              </label>
              <input
                type="number"
                name="hours_before"
                className="form-input"
                placeholder={isRecommend ? '-' : 'เช่น 2'}
                value={formData.hours_before}
                onChange={handleChange}
                disabled={isRecommend}
                style={{
                  width: '100%',
                  height: '42px',
                  backgroundColor: isRecommend ? '#f8fafc' : '#ffffff',
                  cursor: isRecommend ? 'not-allowed' : 'text',
                  opacity: isRecommend ? 0.6 : 1
                }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>
                <span>งดหลัง (ชั่วโมง)</span>
              </label>
              <input
                type="number"
                name="hours_after"
                className="form-input"
                placeholder={isRecommend ? '-' : 'เช่น 2'}
                value={formData.hours_after}
                onChange={handleChange}
                disabled={isRecommend}
                style={{
                  width: '100%',
                  height: '42px',
                  backgroundColor: isRecommend ? '#f8fafc' : '#ffffff',
                  cursor: isRecommend ? 'not-allowed' : 'text',
                  opacity: isRecommend ? 0.6 : 1
                }}
              />
            </div>
          </div>
        </div>

        {/* Row 3: ความรุนแรง */}
        <div className="form-group" style={{ marginBottom: '24px' }}>
          <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>ความรุนแรง</span>
            {isRecommend && (
              <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'normal' }}>
                (ไม่ต้องระบุสำหรับรายการที่แนะนำ)
              </span>
            )}
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', maxWidth: '420px' }}>
            {['สูง', 'กลาง', 'ต่ำ'].map((lvl) => (
              <button
                key={lvl}
                type="button"
                disabled={isRecommend}
                className={`segment-btn ${formData.severity === lvl ? 'active' : ''}`}
                onClick={() => handleSelectSeverity(lvl)}
                style={{
                  width: '377px',
                  height: '42px',
                  minHeight: '42px',
                  padding: '0 8px',
                  fontSize: '13.5px',
                  opacity: isRecommend ? 0.35 : 1,
                  cursor: isRecommend ? 'not-allowed' : 'pointer'
                }}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Row 5: รายละเอียดผลกระทบและประโยชน์ */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">
            รายละเอียดผลกระทบ / ประโยชน์ <span className="required">*</span>
          </label>
          <textarea
            name="impact_details"
            className="form-textarea"
            placeholder="อธิบายอันตรายหรือประโยชน์ที่อาจเกิดขึ้นกับผู้ป่วย..."
            value={formData.impact_details}
            onChange={handleChange}
            style={{ minHeight: '110px' }}
            required
          />
        </div>
      </div>

      {/* Card 2: แหล่งอ้างอิง */}
      <div className="card">
        <div className="card-title">แหล่งอ้างอิง</div>

        <div className="form-row" style={{ marginBottom: '16px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">ประเภทแหล่งที่มา</label>
            <input
              type="text"
              name="source_type"
              className="form-input"
              placeholder="FDA / WHO / PubMed / Thai FDA"
              value={formData.source_type}
              onChange={handleChange}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              ชื่อแหล่งอ้างอิง <span className="required">*</span>
            </label>
            <input
              type="text"
              name="source_name"
              className="form-input"
              placeholder="เช่น U.S. FDA Drug-Food Interaction Guide, คณะเภสัชศาสตร์ ม.มหิดล"
              value={formData.source_name}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">URL / DOI</label>
            <input
              type="text"
              name="url_doi"
              className="form-input"
              placeholder="https://..."
              value={formData.url_doi}
              onChange={handleChange}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">ปีที่เผยแพร่</label>
            <input
              type="text"
              name="publish_year"
              className="form-input"
              placeholder="2024"
              value={formData.publish_year}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

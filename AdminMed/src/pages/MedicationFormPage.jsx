import React from 'react'
import { Check } from 'lucide-react'
import AlertBanner from '../components/common/AlertBanner'
import CustomSelectDropdown from '../components/common/CustomSelectDropdown'
import MedicationAutocompleteDropdown from '../components/medications/MedicationAutocompleteDropdown'
import MedicationImageCard from '../components/medications/MedicationImageCard'
import { useMedicationForm } from '../hooks/useMedicationForm'
import './MedicationFormPage.css'

const CATEGORY_OPTIONS = ['ยา', 'อาหารเสริม']
const TYPE_OPTIONS = ['เม็ด', 'แคปซูล', 'ยาน้ำ']
const UNIT_OPTIONS = ['mg', 'ml']

export default function MedicationFormPage() {
  const {
    fileInputRef,
    dropdownRefEn,
    dropdownRefTh,
    dropdownRefCategory,
    dropdownRefType,
    dropdownRefUnit,
    openCustomDropdown,
    formData,
    imagePreview,
    saving,
    errorMsg,
    fdaSuccessMsg,
    fdaErrorMsg,
    activeDropdownField,
    suggestions,
    highlightIndex,
    setHighlightIndex,
    handleSelectDrug,
    handleRemoveImage,
    handleEnglishNameChange,
    handleThaiNameChange,
    handleEnglishFocus,
    handleThaiFocus,
    handleKeyDown,
    handleChange,
    handleSelectCustomDropdown,
    handleToggleCustomDropdown,
    handleImageChange,
    handleSubmit,
    handleCancel
  } = useMedicationForm()

  return (
    <div style={{ maxWidth: '1580px', margin: '0 auto' }}>
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">เพิ่ม / แก้ไขข้อมูลยา</h1>
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
      <AlertBanner variant="success" message={fdaSuccessMsg} />
      <AlertBanner variant="fda-error" message={fdaErrorMsg} />

      {/* 2-Column Desktop Layout: Form on Left, Image Card on Right */}
      <div className="form-2col-layout">
        {/* Left Column: Form Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Section 1: ข้อมูลพื้นฐาน */}
          <div className="card" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div className="card-title" style={{ marginBottom: 0 }}>ส่วนที่ 1 — ข้อมูลพื้นฐาน</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
              {/* Thai Name with Autocomplete Dropdown */}
              <div className="form-group" style={{ marginBottom: 0, position: 'relative' }} ref={dropdownRefTh}>
                <label className="form-label">
                  {formData.category === 'อาหารเสริม' ? 'ชื่ออาหารเสริม (ภาษาไทย)' : 'ชื่อยา (ภาษาไทย)'} <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="name_th"
                  className="form-input"
                  placeholder={formData.category === 'อาหารเสริม' ? 'เช่น วิตามินซี, น้ำมันปลา, คอลลาเจน, ซิงค์' : 'เช่น พาราเซตามอล, ทิฟฟี่, แอสไพริน'}
                  value={formData.name_th}
                  onChange={handleThaiNameChange}
                  onFocus={handleThaiFocus}
                  onClick={handleThaiFocus}
                  onKeyDown={(e) => handleKeyDown(e, 'name_th')}
                  autoComplete="off"
                  required
                />
                <MedicationAutocompleteDropdown
                  isVisible={activeDropdownField === 'name_th'}
                  field="name_th"
                  suggestions={suggestions}
                  highlightIndex={highlightIndex}
                  onSelect={handleSelectDrug}
                  onHoverIndex={setHighlightIndex}
                />
              </div>

              {/* English Name with Autocomplete Dropdown */}
              <div className="form-group" style={{ marginBottom: 0, position: 'relative' }} ref={dropdownRefEn}>
                <label className="form-label">
                  {formData.category === 'อาหารเสริม' ? 'ชื่ออาหารเสริม (ภาษาอังกฤษ)' : 'ชื่อยา (ภาษาอังกฤษ)'} <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="name_en"
                  className="form-input"
                  placeholder={formData.category === 'อาหารเสริม' ? 'เช่น Vitamin C, Fish Oil, Collagen, Zinc' : 'เช่น Paracetamol, Metformin, Aspirin'}
                  value={formData.name_en}
                  onChange={handleEnglishNameChange}
                  onFocus={handleEnglishFocus}
                  onClick={handleEnglishFocus}
                  onKeyDown={(e) => handleKeyDown(e, 'name_en')}
                  autoComplete="off"
                  required
                />
                <MedicationAutocompleteDropdown
                  isVisible={activeDropdownField === 'name_en'}
                  field="name_en"
                  suggestions={suggestions}
                  highlightIndex={highlightIndex}
                  onSelect={handleSelectDrug}
                  onHoverIndex={setHighlightIndex}
                />
              </div>

              {/* Category */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  หมวดหมู่ <span className="required">*</span>
                </label>
                <CustomSelectDropdown
                  isOpen={openCustomDropdown === 'category'}
                  onToggle={() => handleToggleCustomDropdown('category')}
                  selectedValue={formData.category}
                  placeholder="-- เลือกหมวดหมู่ --"
                  options={CATEGORY_OPTIONS}
                  onSelect={(val) => handleSelectCustomDropdown('category', val)}
                  containerRef={dropdownRefCategory}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  {formData.category === 'อาหารเสริม' ? 'รูปแบบ / ประเภท' : 'ประเภทยา'} <span className="required">*</span>
                </label>
                <CustomSelectDropdown
                  isOpen={openCustomDropdown === 'type'}
                  onToggle={() => handleToggleCustomDropdown('type')}
                  selectedValue={formData.type === 'เม็ด' && formData.category !== 'อาหารเสริม' ? 'ยาเม็ด' : formData.type}
                  placeholder={`-- ${formData.category === 'อาหารเสริม' ? 'เลือกรูปแบบ / ประเภท' : 'เลือกประเภทยา'} --`}
                  options={TYPE_OPTIONS}
                  onSelect={(typ) => handleSelectCustomDropdown('type', typ === 'ยาเม็ด' ? 'เม็ด' : typ)}
                  containerRef={dropdownRefType}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  {formData.category === 'อาหารเสริม' ? 'ขนาด / ปริมาณ' : 'ขนาดยา'} <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="dosage"
                  className="form-input"
                  placeholder="เช่น 100, 500"
                  value={formData.dosage}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  หน่วย <span className="required">*</span>
                </label>
                <CustomSelectDropdown
                  isOpen={openCustomDropdown === 'unit'}
                  onToggle={() => handleToggleCustomDropdown('unit')}
                  selectedValue={formData.unit}
                  placeholder="-- เลือกหน่วย --"
                  options={UNIT_OPTIONS}
                  onSelect={(val) => handleSelectCustomDropdown('unit', val)}
                  containerRef={dropdownRefUnit}
                />
              </div>
            </div>
          </div>

          {/* Section 2: คำแนะนำการใช้ยา / อาหารเสริม */}
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-title">
              {formData.category === 'อาหารเสริม' ? 'ส่วนที่ 2 — คำแนะนำการรับประทาน / ข้อมูลอาหารเสริม' : 'ส่วนที่ 2 — คำแนะนำการใช้ยา'}
            </div>

            <div className="form-group">
              <label className="form-label">
                {formData.category === 'อาหารเสริม' ? 'สรรพคุณ' : 'สรรพคุณ'} <span className="required">*</span>
              </label>
              <textarea
                name="indications"
                className="form-textarea"
                placeholder={formData.category === 'อาหารเสริม' ? 'อธิบายประโยชน์หลักของอาหารเสริม เช่น เสริมสร้างภูมิคุ้มกัน ต้านอนุมูลอิสระ บำรุงผิวพรรณ...' : 'อธิบายการใช้งานหลักของยา เช่น ลดไข้ ลดปวด...'}
                value={formData.indications}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                วิธีรับประทาน / ข้อแนะนำ
              </label>
              <textarea
                name="instructions"
                className="form-textarea"
                placeholder="ก่อน/หลังอาหาร — จำนวน — ความถี่..."
                value={formData.instructions}
                onChange={handleChange}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                {formData.category === 'อาหารเสริม' ? 'ข้อควรระวัง / คำเตือน' : 'ข้อควรระวัง / ผลข้างเคียง'}
              </label>
              <textarea
                name="precautions"
                className="form-textarea"
                placeholder={formData.category === 'อาหารเสริม' ? 'ผู้ที่ไม่ควรรับประทาน คำเตือน หรือข้อควรระวังในการใช้ร่วมกับยา...' : 'ผู้ที่ไม่ควรใช้ยานี้ หรือผลข้างเคียงที่พบบ่อย...'}
                value={formData.precautions}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Image Upload & Preview Card */}
        <MedicationImageCard
          fileInputRef={fileInputRef}
          imagePreview={imagePreview}
          onImageChange={handleImageChange}
          onRemoveImage={handleRemoveImage}
          onImageError={handleRemoveImage}
        />
      </div>
    </div>
  )
}

import {
  POPULAR_SUPPLEMENT_MAP,
  findSupplementPreset,
  getSupplementSuggestions,
  fetchSupplementFromApi
} from './supplementService.js'

export {
  POPULAR_SUPPLEMENT_MAP,
  findSupplementPreset,
  getSupplementSuggestions,
  fetchSupplementFromApi
}

// ==============================================================================
// openFDA Drug & Dietary Supplement Service
// Provides live API search and Thai auto-fill for medication & supplement details
// ==============================================================================

export const COMMON_DRUG_MAP = {
  // --- 0. ยาสามัญประจำบ้านและยารักษาอาการหวัดยอดนิยมในไทย (Popular Thai OTC Brands) ---
  tiffy: {
    searchQuery: 'acetaminophen chlorpheniramine',
    th: 'ทิฟฟี่ (พาราเซตามอล + คลอร์เฟนิรามีน + ฟีนิลเอฟรีน)',
    en: 'Tiffy Dey',
    type: 'เม็ด',
    dosage: '500',
    unit: 'mg',
    indications_th: 'บรรเทาอาการหวัด คัดจมูก มีน้ำมูก ปวดศีรษะ และมีไข้',
    instructions_th: 'ผู้ใหญ่รับประทานครั้งละ 1-2 เม็ด ทุก 4-6 ชั่วโมงเมื่อมีอาการ (ห้ามรับประทานเกินวันละ 8 เม็ด)',
    precautions_th: 'ยานี้อาจทำให้เกิดอาการง่วงซึม หลีกเลี่ยงการขับขี่ยานพาหนะ ไม่ควรรับประทานร่วมกับยาพาราเซตามอลอื่น',
  },
  decolgen: {
    searchQuery: 'acetaminophen chlorpheniramine',
    th: 'ดีคอลเจน (พาราเซตามอล + คลอร์เฟนิรามีน)',
    en: 'Decolgen Prin',
    type: 'เม็ด',
    dosage: '500',
    unit: 'mg',
    indications_th: 'บรรเทาอาการหวัด ลดไข้ บรรเทาอาการคัดจมูก น้ำมูกไหล ปวดศีรษะ',
    instructions_th: 'ผู้ใหญ่รับประทานครั้งละ 1 เม็ด ทุก 4-6 ชั่วโมงเมื่อมีอาการ',
    precautions_th: 'ทำให้ง่วงซึม ห้ามดื่มเครื่องดื่มแอลกอฮอล์ และระวังการใช้ร่วมกับยาแก้หวัดอื่น',
  },
  sara: {
    searchQuery: 'acetaminophen',
    th: 'ซาร่า (พาราเซตามอล)',
    en: 'Sara (Paracetamol)',
    type: 'เม็ด',
    dosage: '500',
    unit: 'mg',
    indications_th: 'ลดไข้ บรรเทาอาการปวดเล็กน้อยถึงปานกลาง เช่น ปวดหัว ปวดฟัน ปวดกล้ามเนื้อ',
    instructions_th: 'รับประทานครั้งละ 1-2 เม็ด ทุก 4-6 ชั่วโมงเมื่อมีอาการ (ไม่เกินวันละ 8 เม็ด)',
    precautions_th: 'ห้ามรับประทานเกินขนาดที่กำหนด เพราะอาจเกิดพิษต่อตับ และหลีกเลี่ยงแอลกอฮอล์',
  },
  tylenol: {
    searchQuery: 'acetaminophen',
    th: 'ไทลินอล (พาราเซตามอล 500 มก.)',
    en: 'Tylenol (Acetaminophen)',
    type: 'เม็ด',
    dosage: '500',
    unit: 'mg',
    indications_th: 'ลดไข้ บรรเทาอาการปวดศีรษะ ปวดฟัน ปวดเมื่อยตามร่างกาย',
    instructions_th: 'รับประทานครั้งละ 1-2 เม็ด ทุก 4-6 ชั่วโมงเมื่อมีอาการ',
    precautions_th: 'ระวังการรับประทานซ้ำซ้อนกับยาอื่นที่มีส่วนผสมของพาราเซตามอล',
  },
  ponstan: {
    searchQuery: 'mefenamic acid',
    th: 'พอนสแตน (กรดมีฟีนามิก)',
    en: 'Ponstan (Mefenamic Acid)',
    type: 'แคปซูล',
    dosage: '500',
    unit: 'mg',
    indications_th: 'บรรเทาอาการปวดประจำเดือน ปวดฟัน ปวดแผลผ่าตัด และอาการปวดกล้ามเนื้อ',
    instructions_th: 'รับประทานครั้งละ 1 เม็ด วันละ 3 ครั้ง หลังอาหารทันที พร้อมดื่มน้ำตามมากๆ',
    precautions_th: 'ต้องรับประทานหลังอาหารทันทีเพื่อป้องกันการระคายเคืองกระเพาะอาหาร ไม่ควรใช้ติดต่อกันเกิน 7 วัน',
  },
  gofen: {
    searchQuery: 'ibuprofen',
    th: 'โกเฟน 400 (ไอบูโพรเฟน แคปซูลนิ่ม)',
    en: 'Gofen 400 (Ibuprofen Liquid Gel)',
    type: 'แคปซูล',
    dosage: '400',
    unit: 'mg',
    indications_th: 'บรรเทาอาการปวดไมเกรนเฉียบพลัน ปวดฟัน ปวดประจำเดือน และลดไข้ต้านการอักเสบออกฤทธิ์เร็ว',
    instructions_th: 'รับประทานครั้งละ 1 แคปซูล หลังอาหารทันที พร้อมดื่มน้ำตามมากๆ',
    precautions_th: 'ห้ามรับประทานตอนท้องว่าง ผู้เป็นโรคกระเพาะอาหารหรือโรคไตควรระวัง',
  },
  norgesic: {
    searchQuery: 'orphenadrine acetaminophen',
    th: 'นอร์จีสิก (ยาคลายกล้ามเนื้อแก้ปวด)',
    en: 'Norgesic (Orphenadrine + Paracetamol)',
    type: 'เม็ด',
    dosage: '485',
    unit: 'mg',
    indications_th: 'คลายกล้ามเนื้อ บรรเทาอาการปวดเมื่อยคอบ่าไหล่ ปวดหลัง กล้ามเนื้อตึงเกร็ง',
    instructions_th: 'รับประทานครั้งละ 1-2 เม็ด วันละ 3 ครั้ง หลังอาหาร',
    precautions_th: 'อาจทำให้ปากแห้ง คอแห้ง วิงเวียน ตาพร่ามัว ห้ามใช้ในผู้ป่วยโรคต้อหิน',
  },
  antacil: {
    searchQuery: 'antacid',
    th: 'แอนตาซิล (ยาลดกรด เคลือบกระเพาะ)',
    en: 'Antacil (Antacid)',
    type: 'เม็ด',
    dosage: '1',
    unit: 'เม็ด',
    indications_th: 'บรรเทาอาการแสบร้อนกลางอก แผลในกระเพาะอาหาร จุกเสียด แน่นท้องจากกรดเกิน',
    instructions_th: 'เคี้ยวให้ละเอียดก่อนกลืน ครั้งละ 1-2 เม็ด หลังอาหาร 1 ชั่วโมงและก่อนนอน',
    precautions_th: 'ห้ามกลืนทั้งเม็ด ระวังการใช้ร่วมกับยาฆ่าเชื้อเพราะอาจลดการดูดซึมยาอื่น',
  },
  air_x: {
    searchQuery: 'simethicone',
    th: 'แอร์เอ็กซ์ (ไซเมทิโคน ยาแก้ท้องอืด เม็ดเคี้ยว)',
    en: 'Air-X (Simethicone Chewable)',
    type: 'เม็ด',
    dosage: '80',
    unit: 'mg',
    indications_th: 'ขับลม บรรเทาอาการท้องอืด แน่นท้อง ท้องเฟ้อ มีแก๊สในกระเพาะอาหาร',
    instructions_th: 'เคี้ยวให้ละเอียดก่อนกลืน ครั้งละ 1-2 เม็ด เมื่อมีอาการหลังอาหาร',
    precautions_th: 'ต้องเคี้ยวยาให้ละเอียดก่อนกลืนทุกครั้ง',
  },
  gaviscon: {
    searchQuery: 'alginate antacid',
    th: 'กาวิสคอน (ยาลดกรดไหลย้อน)',
    en: 'Gaviscon (Sodium Alginate)',
    type: 'ยาน้ำ',
    dosage: '10',
    unit: 'ml',
    indications_th: 'บรรเทาอาการแสบร้อนกลางอกจากกรดไหลย้อน อาหารไม่ย่อย และลดกรดในกระเพาะ',
    instructions_th: 'รับประทานครั้งละ 10-20 มล. หลังอาหารและก่อนนอน',
    precautions_th: 'ควรรับประทานห่างจากยาอื่นอย่างน้อย 2 ชั่วโมง ผู้ควบคุมเกลือโซเดียมควรระวัง',
  },
  flying_rabbit: {
    searchQuery: 'salol menthol',
    th: 'ยาธาตุน้ำขาวตรากระต่ายบิน',
    en: 'Flying Rabbit (Salol Menthol)',
    type: 'ยาน้ำ',
    dosage: '15',
    unit: 'ml',
    indications_th: 'รักษาอาการปวดท้อง ท้องเสีย ท้องอืด ท้องเฟ้อ จุกเสียด แน่นท้อง ขับลม',
    instructions_th: 'เขย่าขวดก่อนใช้ ผู้ใหญ่รับประทานครั้งละ 1-2 ช้อนโต๊ะ (15-30 มล.) วันละ 3 ครั้ง',
    precautions_th: 'ห้ามใช้ในผู้ที่แพ้ยากลุ่มซาลิไซเลตหรือแพ้แอสไพริน',
  },
  stomachic: {
    searchQuery: 'sodium bicarbonate mixture',
    th: 'ยาธาตุน้ำแดง',
    en: 'Stomachic Mixture',
    type: 'ยาน้ำ',
    dosage: '15',
    unit: 'ml',
    indications_th: 'ขับลม บรรเทาอาการท้องอืด ท้องเฟ้อ จุกเสียด แน่นเฟ้อ อาหารไม่ย่อย',
    instructions_th: 'รับประทานครั้งละ 1-2 ช้อนโต๊ะ ก่อนหรือหลังอาหาร',
    precautions_th: 'ผู้ป่วยโรคความดันโลหิตสูงหรือโรคหัวใจควรระวังปริมาณโซเดียม',
  },
  ultracarbon: {
    searchQuery: 'activated charcoal',
    th: 'อัลตร้าคาร์บอน (ผงถ่านดูดซับสารพิษ แก้ท้องเสีย)',
    en: 'Ultracarbon (Activated Charcoal)',
    type: 'เม็ด',
    dosage: '250',
    unit: 'mg',
    indications_th: 'ดูดซับสารพิษ สารระคายเคือง บรรเทาอาการท้องเสีย แน่นท้อง ถ่ายเหลว',
    instructions_th: 'รับประทานครั้งละ 2-3 เม็ด พร้อมน้ำสะอาด 1 แก้วเต็ม วันละ 3-4 ครั้ง',
    precautions_th: 'ทำให้อุจจาระมีสีดำ ควรรับประทานห่างจากยาอื่นอย่างน้อย 2 ชั่วโมงเพื่อป้องกันการดูดซับยาตัวอื่น',
  },
  tempra_syrup: {
    searchQuery: 'acetaminophen syrup kids',
    th: 'เทมปร้า คิดส์ ยาน้ำเชื่อมลดไข้ (พาราเซตามอลเด็ก)',
    en: 'Tempra Kids Syrup (Paracetamol)',
    type: 'ยาน้ำ',
    dosage: '120',
    unit: 'mg',
    indications_th: 'ลดไข้ บรรเทาอาการปวดสำหรับเด็ก รสสตรอว์เบอร์รี/รสส้ม รับประทานง่าย',
    instructions_th: 'รับประทานทุก 4-6 ชั่วโมง ตามน้ำหนักตัวเด็กเมื่อมีอาการ (ห้ามเกิน 5 ครั้งต่อวัน)',
    precautions_th: 'ระวังการใช้ขนาดยาเกินตามน้ำหนักตัว ห้ามใช้ร่วมกับยาพาราเซตามอลอื่น',
  },
  sara_syrup: {
    searchQuery: 'paracetamol syrup children',
    th: 'ซาร่า ยาน้ำเชื่อมสำหรับเด็ก (พาราเซตามอล)',
    en: 'Sara Syrup (Paracetamol)',
    type: 'ยาน้ำ',
    dosage: '120',
    unit: 'mg',
    indications_th: 'ลดไข้ บรรเทาอาการปวดศีรษะ ปวดฟัน สำหรับทารกและเด็ก ปราศจากแอลกอฮอล์',
    instructions_th: 'รับประทานทุก 4-6 ชั่วโมง ตามน้ำหนักตัวเด็ก (ใช้ช้อนยาตวง)',
    precautions_th: 'เขย่าขวดก่อนใช้ ระวังการใช้ซ้ำซ้อนกับยาแก้หวัดอื่นที่มีพาราเซตามอล',
  },
  amoxicillin_syrup: {
    searchQuery: 'amoxicillin suspension',
    th: 'อะม็อกซีซิลลิน ยาน้ำเชื่อมแห้งสำหรับเด็ก',
    en: 'Amoxicillin Dry Syrup (Suspension)',
    type: 'ยาน้ำ',
    dosage: '125',
    unit: 'mg',
    indications_th: 'ยาปฏิชีวนะรักษาการติดเชื้อแบคทีเรียทางเดินหายใจ หู คอ จมูก ในเด็ก',
    instructions_th: 'เขย่าขวดก่อนรินยา รับประทานครั้งละ 1 ช้อนชา วันละ 3 ครั้ง ติดต่อกันจนหมดตามแพทย์สั่ง',
    precautions_th: 'หลังผสมน้ำต้องเก็บในตู้เย็นและใช้ให้หมดภายใน 7-14 วัน ห้ามใช้ในผู้แพ้เพนิซิลลิน',
  },
  cpm_syrup: {
    searchQuery: 'chlorpheniramine syrup',
    th: 'คลอร์เฟนิรามีน ยาน้ำเชื่อม (CPM ยาน้ำแก้แพ้)',
    en: 'Chlorpheniramine Syrup (CPM)',
    type: 'ยาน้ำ',
    dosage: '2',
    unit: 'mg',
    indications_th: 'บรรเทาอาการแพ้อากาศ น้ำมูกไหล จาม คันตา คันคอ ในเด็ก',
    instructions_th: 'รับประทานทุก 4-6 ชั่วโมง ตามคำแนะนำของแพทย์หรือเอกสารกำกับยา',
    precautions_th: 'อาจทำให้เด็กง่วงซึม หลีกเลี่ยงการใช้ในทารกแรกเกิดหรือเด็กคลอดก่อนกำหนด',
  },
  buscopan: {
    searchQuery: 'hyoscine butylbromide',
    th: 'บัสโคพาน (ไฮออสซีน - ยาแก้ปวดเกร็งช่องท้อง)',
    en: 'Buscopan (Hyoscine Butylbromide)',
    type: 'เม็ด',
    dosage: '10',
    unit: 'mg',
    indications_th: 'บรรเทาอาการปวดเกร็งช่องท้อง ปวดเกร็งลำไส้ ปวดประจำเดือน กระเพาะอาหารบีบเกร็ง',
    instructions_th: 'รับประทานครั้งละ 1-2 เม็ด วันละ 3-4 ครั้ง เมื่อมีอาการปวดเกร็ง',
    precautions_th: 'อาจทำให้ปากแห้ง ตาพร่า ใจสั่น ห้ามใช้ในผู้ป่วยต้อหินมุมปิดหรือต่อมลูกหมากโต',
  },
  brown_mixture: {
    searchQuery: 'glycyrrhiza compound',
    th: 'ยาน้ำดำแก้ไอ',
    en: 'Brown Mixture',
    type: 'ยาน้ำ',
    dosage: '10',
    unit: 'ml',
    indications_th: 'บรรเทาอาการไอ ขับเสมหะ บรรเทาอาการระคายคอ ชุ่มคอ',
    instructions_th: 'เขย่าขวดก่อนใช้ จิบครั้งละ 1-2 ช้อนชา (5-10 มล.) วันละ 3-4 ครั้ง',
    precautions_th: 'มีส่วนผสมของแอลกอฮอล์และฝิ่นในปริมาณควบคุม ไม่ควรใช้ในเด็กเล็ก',
  },
  senna: {
    searchQuery: 'senna',
    th: 'ยาระบายมะขามแขก (เซนนา)',
    en: 'Senna Tablet',
    type: 'เม็ด',
    dosage: '7.5',
    unit: 'mg',
    indications_th: 'บรรเทาอาการท้องผูก ยาระบายจากสมุนไพรธรรมชาติ',
    instructions_th: 'รับประทานครั้งละ 1-2 เม็ด ก่อนนอน กลืนพร้อมน้ำสะอาด',
    precautions_th: 'ยาจะออกฤทธิ์หลังรับประทาน 6-12 ชั่วโมง ไม่ควรใช้ติดต่อกันเป็นเวลานานเกินไป',
  },

  // --- 1. ยาแก้ปวด ลดไข้ และต้านการอักเสบ (Analgesics & NSAIDs) ---
  paracetamol: {
    searchQuery: 'acetaminophen',
    th: 'พาราเซตามอล',
    en: 'Paracetamol',
    type: 'เม็ด',
    dosage: '500',
    unit: 'mg',
    indications_th: 'บรรเทาอาการปวดเล็กน้อยถึงปานกลาง เช่น ปวดศีรษะ ปวดฟัน ปวดกล้ามเนื้อ และช่วยลดไข้',
    instructions_th: 'รับประทานครั้งละ 1-2 เม็ด ทุก 4-6 ชั่วโมงเมื่อมีอาการ (ห้ามรับประทานเกินวันละ 8 เม็ด หรือ 4,000 มก.)',
    precautions_th: 'ไม่ควรรับประทานเกินขนาดที่กำหนด เพราะอาจเกิดพิษต่อตับ และหลีกเลี่ยงการดื่มเครื่องดื่มแอลกอฮอล์ร่วมด้วย',
  },
  acetaminophen: {
    searchQuery: 'acetaminophen',
    th: 'พาราเซตามอล (อะเซตามีโนเฟน)',
    en: 'Acetaminophen',
    type: 'เม็ด',
    dosage: '500',
    unit: 'mg',
    indications_th: 'บรรเทาอาการปวดเล็กน้อยถึงปานกลาง และลดไข้',
    instructions_th: 'รับประทานครั้งละ 1-2 เม็ด ทุก 4-6 ชั่วโมงเมื่อมีอาการ',
    precautions_th: 'ระวังการใช้ยาเกินขนาดซึ่งอาจทำให้เกิดภาวะตับวายเฉียบพลันได้',
  },
  aspirin: {
    searchQuery: 'aspirin',
    th: 'แอสไพริน',
    en: 'Aspirin',
    type: 'เม็ด',
    dosage: '81',
    unit: 'mg',
    indications_th: 'ป้องกันการเกิดลิ่มเลือดอุดตันในหลอดเลือดหัวใจและสมอง, บรรเทาอาการปวดและลดการอักเสบ',
    instructions_th: 'รับประทานวันละ 1 ครั้ง หลังอาหารทันที พร้อมดื่มน้ำตามมากๆ',
    precautions_th: 'ห้ามรับประทานร่วมกับแอลกอฮอล์, ระวังการเกิดแผลในกระเพาะอาหารและภาวะเลือดออกผิดปกติ',
  },
  ibuprofen: {
    searchQuery: 'ibuprofen',
    th: 'ไอบูโพรเฟน',
    en: 'Ibuprofen',
    type: 'เม็ด',
    dosage: '400',
    unit: 'mg',
    indications_th: 'บรรเทาอาการปวดประจำเดือน ปวดข้อ ปวดฟัน ปวดกล้ามเนื้อ และลดไข้ต้านการอักเสบ',
    instructions_th: 'รับประทานครั้งละ 1 เม็ด วันละ 3 ครั้ง หลังอาหารทันที พร้อมดื่มน้ำตามมากๆ',
    precautions_th: 'ระวังการระคายเคืองกระเพาะอาหาร ผู้ที่เป็นโรคไต โรคหัวใจ หรือมีแผลในทางเดินอาหารควรปรึกษาแพทย์ก่อนใช้',
  },
  diclofenac: {
    searchQuery: 'diclofenac',
    th: 'ไดโคลฟีแนค',
    en: 'Diclofenac',
    type: 'เม็ด',
    dosage: '25',
    unit: 'mg',
    indications_th: 'บรรเทาอาการปวด บวม และการอักเสบจากโรคข้ออักเสบ ข้อเสื่อม และกล้ามเนื้อบาดเจ็บ',
    instructions_th: 'รับประทานวันละ 2-3 ครั้ง หลังอาหารทันที ห้ามเคี้ยวหรือหักเม็ดยา',
    precautions_th: 'อาจระคายเคืองกระเพาะอาหาร ห้ามใช้ในผู้ที่มีประวัติแพ้ยากลุ่ม NSAIDs หรือเป็นโรคหลอดเลือดหัวใจรุนแรง',
  },
  mefenamic: {
    searchQuery: 'mefenamic acid',
    th: 'กรดมีฟีนามิก (พอนสแตน)',
    en: 'Mefenamic Acid',
    type: 'แคปซูล',
    dosage: '500',
    unit: 'mg',
    indications_th: 'บรรเทาอาการปวดประจำเดือน ปวดฟัน และอาการปวดกล้ามเนื้อทั่วไป',
    instructions_th: 'รับประทานครั้งละ 1 เม็ด วันละ 3 ครั้ง หลังอาหารทันที เมื่อมีอาการปวด',
    precautions_th: 'ไม่ควรรับประทานติดต่อกันเกิน 7 วัน และควรระวังในผู้ป่วยโรคกระเพาะอาหารหรือโรคไต',
  },
  celecoxib: {
    searchQuery: 'celecoxib',
    th: 'เซเลคอกซิบ',
    en: 'Celecoxib',
    type: 'แคปซูล',
    dosage: '200',
    unit: 'mg',
    indications_th: 'รักษาอาการข้ออักเสบรูมาตอยด์ ข้อเสื่อม และบรรเทาอาการปวดเฉียบพลัน',
    instructions_th: 'รับประทานวันละ 1-2 ครั้ง พร้อมอาหารหรือหลังอาหารทันที',
    precautions_th: 'ห้ามใช้ในผู้ที่แพ้ยากลุ่มซัลฟา (Sulfa) และระวังในผู้ป่วยโรคหัวใจและหลอดเลือด',
  },
  meloxicam: {
    searchQuery: 'meloxicam',
    th: 'เมล็อกซิแคม',
    en: 'Meloxicam',
    type: 'เม็ด',
    dosage: '7.5',
    unit: 'mg',
    indications_th: 'บรรเทาอาการปวดและอักเสบจากโรคข้อกระดูกเสื่อม และข้ออักเสบรูมาตอยด์',
    instructions_th: 'รับประทานวันละ 1 ครั้ง หลังอาหารทันที',
    precautions_th: 'ระวังภาวะเลือดออกในทางเดินอาหารและความดันโลหิตสูงขึ้น',
  },
  tramadol: {
    searchQuery: 'tramadol',
    th: 'ทรามาดอล',
    en: 'Tramadol',
    type: 'แคปซูล',
    dosage: '50',
    unit: 'mg',
    indications_th: 'บรรเทาอาการปวดระดับปานกลางถึงรุนแรง',
    instructions_th: 'รับประทานครั้งละ 1 แคปซูล ทุก 6-8 ชั่วโมง เมื่อมีอาการปวดรุนแรง (ตามแพทย์สั่งเท่านั้น)',
    precautions_th: 'เป็นยาควบคุม อาจทำให้เกิดการติดยา คลื่นไส้ อาเจียน วิงเวียนศีรษะ ห้ามรับประทานร่วมกับแอลกอฮอล์',
  },
  colchicine: {
    searchQuery: 'colchicine',
    th: 'โคลชิซิน (ยารักษาโรคเกาต์)',
    en: 'Colchicine',
    type: 'เม็ด',
    dosage: '0.6',
    unit: 'mg',
    indications_th: 'รักษาและป้องกันอาการข้ออักเสบจากโรคเกาต์เฉียบพลัน',
    instructions_th: 'รับประทานตามคำแนะนำของแพทย์อย่างเคร่งครัด พร้อมน้ำหนึ่งแก้วเต็ม',
    precautions_th: 'หากมีอาการท้องเสียรุนแรง คลื่นไส้ หรืออาเจียน ให้หยุดยาและแจ้งแพทย์ทันที',
  },
  allopurinol: {
    searchQuery: 'allopurinol',
    th: 'อัลโลพูรินอล (ยาลดยูริก)',
    en: 'Allopurinol',
    type: 'เม็ด',
    dosage: '100',
    unit: 'mg',
    indications_th: 'ลดระดับกรดยูริกในเลือด ป้องกันการเกิดโรคเกาต์ซ้ำและนิ่วในไต',
    instructions_th: 'รับประทานวันละ 1 ครั้ง หลังอาหารทันที และควรดื่มน้ำมากๆ ระหว่างวัน',
    precautions_th: 'หากมีผื่นคันตามผิวหนัง มีไข้ เจ็บคอ หรือตาอักเสบ ให้หยุดยาและพบแพทย์ทันทีเนื่องจากอาจเกิดการแพ้ยารุนแรง',
  },

  // --- 2. ยารักษาโรคเบาหวาน (Antidiabetic Drugs) ---
  metformin: {
    searchQuery: 'metformin',
    th: 'เมทฟอร์มิน',
    en: 'Metformin',
    type: 'เม็ด',
    dosage: '500',
    unit: 'mg',
    indications_th: 'รักษาและควบคุมระดับน้ำตาลในเลือดสำหรับผู้ป่วยโรคเบาหวานชนิดที่ 2',
    instructions_th: 'รับประทานพร้อมอาหารหรือหลังอาหารทันที เพื่อลดอาการไม่สบายท้องหรือคลื่นไส้',
    precautions_th: 'หลีกเลี่ยงการดื่มเครื่องดื่มแอลกอฮอล์ และควรตรวจการทำงานของไตอย่างสม่ำเสมอ',
  },
  glipizide: {
    searchQuery: 'glipizide',
    th: 'กลิพิไซด์',
    en: 'Glipizide',
    type: 'เม็ด',
    dosage: '5',
    unit: 'mg',
    indications_th: 'กระตุ้นการหลั่งอินซูลินเพื่อควบคุมระดับน้ำตาลในเลือดสำหรับผู้ป่วยเบาหวานชนิดที่ 2',
    instructions_th: 'รับประทานก่อนอาหารเช้า 30 นาที วันละ 1 ครั้ง',
    precautions_th: 'ระวังภาวะน้ำตาลในเลือดต่ำเกินไป (เหงื่อออก ใจสั่น หน้ามืด) ควรพกของหวานหรือลูกอมติดตัวไว้',
  },
  gliclazide: {
    searchQuery: 'gliclazide',
    th: 'ไกลคลาไซด์',
    en: 'Gliclazide',
    type: 'เม็ด',
    dosage: '80',
    unit: 'mg',
    indications_th: 'ช่วยควบคุมระดับน้ำตาลในเลือดในผู้ป่วยโรคเบาหวานชนิดที่ 2',
    instructions_th: 'รับประทานพร้อมอาหารมื้อเช้า',
    precautions_th: 'ระวังอาการน้ำตาลในเลือดต่ำ ห้ามอดอาหารหรือออกกำลังกายหักโหมเกินไป',
  },
  pioglitazone: {
    searchQuery: 'pioglitazone',
    th: 'ไพโอกลิตาโซน',
    en: 'Pioglitazone',
    type: 'เม็ด',
    dosage: '15',
    unit: 'mg',
    indications_th: 'เพิ่มความไวของร่างกายต่ออินซูลินเพื่อควบคุมระดับน้ำตาลในเลือด',
    instructions_th: 'รับประทานวันละ 1 ครั้ง พร้อมหรือหลังอาหาร',
    precautions_th: 'อาจทำให้เกิดอาการบวมน้ำ น้ำหนักตัวเพิ่ม ห้ามใช้ในผู้ป่วยโรคหัวใจล้มเหลว',
  },
  dapagliflozin: {
    searchQuery: 'dapagliflozin',
    th: 'ดาพากลิโฟลซิน',
    en: 'Dapagliflozin',
    type: 'เม็ด',
    dosage: '10',
    unit: 'mg',
    indications_th: 'ขับน้ำตาลส่วนเกินออกทางปัสสาวะเพื่อควบคุมเบาหวาน และช่วยปกป้องการทำงานของไตและหัวใจ',
    instructions_th: 'รับประทานวันละ 1 ครั้ง ตอนเช้า พร้อมหรือไม่พร้อมอาหารก็ได้',
    precautions_th: 'ควรดื่มน้ำให้เพียงพอ ระวังการติดเชื้อในระบบทางเดินปัสสาวะและอวัยวะสืบพันธุ์',
  },

  // --- 3. ยารักษาโรคความดันโลหิตสูงและโรคหัวใจ (Cardiovascular & Antihypertensives) ---
  amlodipine: {
    searchQuery: 'amlodipine',
    th: 'แอมโลดิพีน',
    en: 'Amlodipine',
    type: 'เม็ด',
    dosage: '5',
    unit: 'mg',
    indications_th: 'รักษาโรคความดันโลหิตสูง และป้องกันอาการเจ็บหน้าอกขาดเลือด (Angina)',
    instructions_th: 'รับประทานวันละ 1 ครั้ง ในเวลาเดียวกันของทุกวัน โดยก่อนหรือหลังอาหารก็ได้',
    precautions_th: 'อาจทำให้ข้อเท้าบวม วิงเวียนศีรษะเมื่อลุกขึ้นยืน หลีกเลี่ยงการรับประทานร่วมกับน้ำเกรปฟรุต',
  },
  losartan: {
    searchQuery: 'losartan',
    th: 'โลซาร์แทน',
    en: 'Losartan',
    type: 'เม็ด',
    dosage: '50',
    unit: 'mg',
    indications_th: 'รักษาโรคความดันโลหิตสูง และช่วยปกป้องไตในผู้ป่วยเบาหวาน',
    instructions_th: 'รับประทานวันละ 1 ครั้ง ในเวลาเดิมทุกวัน',
    precautions_th: 'ห้ามใช้ในสตรีมีครรภ์ ระวังการใช้สารทดแทนเกลือโพแทสเซียมสูง',
  },
  enalapril: {
    searchQuery: 'enalapril',
    th: 'อีนาราพริล',
    en: 'Enalapril',
    type: 'เม็ด',
    dosage: '5',
    unit: 'mg',
    indications_th: 'รักษาโรคความดันโลหิตสูงและภาวะหัวใจล้มเหลว',
    instructions_th: 'รับประทานวันละ 1-2 ครั้ง ตามแพทย์สั่งอย่างสม่ำเสมอ',
    precautions_th: 'อาจทำให้เกิดอาการไอแห้งๆ ห้ามใช้ในสตรีมีครรภ์ หากมีอาการหน้าบวมปากบวมให้หยุดยาและพบแพทย์ทันที',
  },
  atenolol: {
    searchQuery: 'atenolol',
    th: 'อะทีโนลอล',
    en: 'Atenolol',
    type: 'เม็ด',
    dosage: '50',
    unit: 'mg',
    indications_th: 'รักษาโรคความดันโลหิตสูง อาการเจ็บหน้าอก และควบคุมจังหวะการเต้นของหัวใจ',
    instructions_th: 'รับประทานวันละ 1 ครั้ง ในเวลาเดียวกันทุกวัน',
    precautions_th: 'ห้ามหยุดยากะทันหันเพราะอาจทำให้หัวใจเต้นผิดจังหวะหรือความดันพุ่งสูง ระวังในผู้ป่วยโรคหอบหืด',
  },
  metoprolol: {
    searchQuery: 'metoprolol',
    th: 'เมโทโพรลอล',
    en: 'Metoprolol',
    type: 'เม็ด',
    dosage: '50',
    unit: 'mg',
    indications_th: 'รักษาความดันโลหิตสูง เจ็บหน้าอก และลดความเสี่ยงภาวะหัวใจวาย',
    instructions_th: 'รับประทานพร้อมหรือหลังอาหารทันที',
    precautions_th: 'อาจทำให้หัวใจเต้นช้าลง วิงเวียน หรือเหนื่อยง่าย ห้ามหยุดยากะทันหัน',
  },
  propranolol: {
    searchQuery: 'propranolol',
    th: 'โพรพราโนลอล',
    en: 'Propranolol',
    type: 'เม็ด',
    dosage: '10',
    unit: 'mg',
    indications_th: 'ลดความดันโลหิต ลดอาการใจสั่น มือสั่น และป้องกันอาการปวดศีรษะไมเกรน',
    instructions_th: 'รับประทานวันละ 2-3 ครั้ง ก่อนอาหาร',
    precautions_th: 'ห้ามใช้ในผู้ป่วยโรคหอบหืดรุนแรง หรือผู้ที่มีภาวะหัวใจเต้นช้าผิดปกติ',
  },
  furosemide: {
    searchQuery: 'furosemide',
    th: 'ฟูโรซีไมด์ (ยาขับปัสสาวะ)',
    en: 'Furosemide',
    type: 'เม็ด',
    dosage: '40',
    unit: 'mg',
    indications_th: 'รักษาภาวะบวมน้ำจากโรคหัวใจ ตับ หรือไต และช่วยลดความดันโลหิต',
    instructions_th: 'รับประทานตอนเช้าหลังอาหาร เพื่อหลีกเลี่ยงการตื่นมาปัสสาวะตอนกลางคืน',
    precautions_th: 'ระวังภาวะขาดน้ำและระดับเกลือแร่โพแทสเซียมในเลือดต่ำ ควรตรวจติดตามเลือดตามแพทย์นัด',
  },
  hydrochlorothiazide: {
    searchQuery: 'hydrochlorothiazide',
    th: 'ไฮโดรคลอโรไทอะไซด์ (HCTZ)',
    en: 'Hydrochlorothiazide',
    type: 'เม็ด',
    dosage: '25',
    unit: 'mg',
    indications_th: 'ลดความดันโลหิตสูง และลดอาการบวมน้ำ',
    instructions_th: 'รับประทานวันละ 1 ครั้ง ในตอนเช้าหลังอาหาร',
    precautions_th: 'อาจทำให้ระดับโพแทสเซียมในเลือดต่ำ และระดับกรดยูริกหรือน้ำตาลในเลือดสูงขึ้นเล็กน้อย',
  },
  spironolactone: {
    searchQuery: 'spironolactone',
    th: 'สไปโรโนแลคโตน',
    en: 'Spironolactone',
    type: 'เม็ด',
    dosage: '25',
    unit: 'mg',
    indications_th: 'รักษาภาวะหัวใจล้มเหลว โรคตับบวมน้ำ และความดันโลหิตสูง',
    instructions_th: 'รับประทานพร้อมอาหารหรือหลังอาหารทันทีในตอนเช้า',
    precautions_th: 'ระวังภาวะโพแทสเซียมในเลือดสูง หลีกเลี่ยงการรับประทานอาหารที่มีโพแทสเซียมสูงเกินไป',
  },

  // --- 4. ยาลดไขมันในเลือด (Lipid-lowering Drugs / Statins) ---
  atorvastatin: {
    searchQuery: 'atorvastatin',
    th: 'อะทอร์วาสแตติน',
    en: 'Atorvastatin',
    type: 'เม็ด',
    dosage: '20',
    unit: 'mg',
    indications_th: 'ลดระดับคอเลสเตอรอลชนิดไม่ดี (LDL) และไตรกลีเซอไรด์ ป้องกันโรคหลอดเลือดหัวใจและสมอง',
    instructions_th: 'รับประทานวันละ 1 ครั้ง ก่อนนอนหรือเวลาเดียวกันทุกวัน',
    precautions_th: 'หลีกเลี่ยงการดื่มน้ำเกรปฟรุต แจ้งแพทย์ทันทีหากมีอาการปวดกล้ามเนื้อผิดปกติหรือปัสสาวะสีเข้ม',
  },
  simvastatin: {
    searchQuery: 'simvastatin',
    th: 'ซิมวาสแตติน',
    en: 'Simvastatin',
    type: 'เม็ด',
    dosage: '20',
    unit: 'mg',
    indications_th: 'ลดระดับคอเลสเตอรอลในเลือด ป้องกันโรคหลอดเลือดหัวใจตีบ',
    instructions_th: 'รับประทานวันละ 1 ครั้ง ในเวลาเย็นหรือก่อนนอน',
    precautions_th: 'หลีกเลี่ยงเครื่องดื่มแอลกอฮอล์ หากมีอาการปวดเมื่อยกล้ามเนื้อรุนแรงให้รีบพบแพทย์',
  },
  rosuvastatin: {
    searchQuery: 'rosuvastatin',
    th: 'โรซูวาสแตติน',
    en: 'Rosuvastatin',
    type: 'เม็ด',
    dosage: '10',
    unit: 'mg',
    indications_th: 'ลดระดับไขมันคอเลสเตอรอลในเลือดประสิทธิภาพสูง ป้องกันโรคหัวใจขาดเลือด',
    instructions_th: 'รับประทานวันละ 1 ครั้ง เวลาใดก็ได้ของวัน แต่ควรเป็นเวลาเดียวกันทุกวัน',
    precautions_th: 'ระวังผลต่อตับและกล้ามเนื้อ ควรตรวจการทำงานของตับตามที่แพทย์นัดหมาย',
  },
  fenofibrate: {
    searchQuery: 'fenofibrate',
    th: 'ฟีโนไฟเบรต',
    en: 'Fenofibrate',
    type: 'แคปซูล',
    dosage: '160',
    unit: 'mg',
    indications_th: 'ลดระดับไขมันไตรกลีเซอไรด์ในเลือดสูง ป้องกันโรคตับอ่อนอักเสบ',
    instructions_th: 'รับประทานพร้อมอาหารมื้อหลัก เพื่อให้ยาดูดซึมได้ดีที่สุด',
    precautions_th: 'ระวังอาการปวดกล้ามเนื้อ หรือความผิดปกติของการทำงานของถุงน้ำดีและตับ',
  },

  // --- 5. ยาต้านเกล็ดเลือดและยาต้านการแข็งตัวของเลือด (Antithrombotics) ---
  clopidogrel: {
    searchQuery: 'clopidogrel',
    th: 'โคลพิโดเกรล (ยาต้านเกล็ดเลือด)',
    en: 'Clopidogrel',
    type: 'เม็ด',
    dosage: '75',
    unit: 'mg',
    indications_th: 'ป้องกันการเกิดลิ่มเลือดอุดตันในผู้ป่วยโรคหลอดเลือดสมองและกล้ามเนื้อหัวใจขาดเลือด',
    instructions_th: 'รับประทานวันละ 1 ครั้ง ในเวลาเดิมทุกวัน ก่อนหรือหลังอาหาร',
    precautions_th: 'ระวังภาวะเลือดออกผิดปกติ เช่น เลือดกำเดาไหล เลือดออกตามไรฟัน รอยฟกช้ำง่าย แจ้งแพทย์ก่อนรับการผ่าตัดหรือถอนฟัน',
  },
  warfarin: {
    searchQuery: 'warfarin',
    th: 'วาร์ฟาริน (ยาละลายลิ่มเลือด)',
    en: 'Warfarin',
    type: 'เม็ด',
    dosage: '3',
    unit: 'mg',
    indications_th: 'ป้องกันและรักษาลิ่มเลือดอุดตันในหลอดเลือดดำ ปอด และในผู้ป่วยใส่ลิ้นหัวใจเทียม',
    instructions_th: 'รับประทานวันละ 1 ครั้ง ในเวลาเดียวกันอย่างเคร่งครัด (แนะนำเวลา 18.00 น. หรือก่อนนอน)',
    precautions_th: 'ต้องตรวจติดตามค่าการแข็งตัวของเลือด (INR) อย่างสม่ำเสมอ หลีกเลี่ยงผักใบเขียวเข้มปริมาณมากเกินไป และระวังการเกิดเลือดออกผิดปกติ',
  },

  // --- 6. ยาระบบทางเดินอาหาร (Gastrointestinal Drugs) ---
  omeprazole: {
    searchQuery: 'omeprazole',
    th: 'โอเมพราโซล',
    en: 'Omeprazole',
    type: 'แคปซูล',
    dosage: '20',
    unit: 'mg',
    indications_th: 'รักษาโรคกรดไหลย้อน (GERD) แผลในกระเพาะอาหารและลำไส้เล็กส่วนต้น',
    instructions_th: 'รับประทานวันละ 1 ครั้ง ก่อนอาหารเช้าอย่างน้อย 30-60 นาที (กลืนทั้งแคปซูล ห้ามเคี้ยวหรือบดยา)',
    precautions_th: 'การใช้ติดต่อกันเป็นเวลานานอาจส่งผลต่อการดูดซึมแคลเซียม วิตามินบี 12 และแมกนีเซียม',
  },
  pantoprazole: {
    searchQuery: 'pantoprazole',
    th: 'แพนโทพราโซล',
    en: 'Pantoprazole',
    type: 'เม็ด',
    dosage: '40',
    unit: 'mg',
    indications_th: 'รักษาและป้องกันแผลในทางเดินอาหาร และบรรเทาอาการแสบร้อนกลางอกจากกรดไหลย้อน',
    instructions_th: 'รับประทานวันละ 1 ครั้ง ก่อนอาหารเช้า 30-60 นาที กลืนทั้งเม็ดพร้อมน้ำ',
    precautions_th: 'ห้ามเคี้ยวหรือบดเม็ดยา หากใช้ยาเกิน 8 สัปดาห์ควรปรึกษาแพทย์',
  },
  esomeprazole: {
    searchQuery: 'esomeprazole',
    th: 'เอสโอเมพราโซล',
    en: 'Esomeprazole',
    type: 'เม็ด',
    dosage: '20',
    unit: 'mg',
    indications_th: 'ยับยั้งการหลั่งกรดในกระเพาะอาหาร รักษาอาการหลอดอาหารอักเสบจากกรดไหลย้อน',
    instructions_th: 'รับประทานวันละ 1 ครั้ง ก่อนอาหารเช้าอย่างน้อย 1 ชั่วโมง',
    precautions_th: 'ไม่ควรบดหรือเคี้ยวเม็ดยา ระวังการใช้ร่วมกับยาบางชนิด เช่น Clopidogrel',
  },
  domperidone: {
    searchQuery: 'domperidone',
    th: 'ดอมเพอริโดน (ยาแก้คลื่นไส้ แน่นท้อง)',
    en: 'Domperidone',
    type: 'เม็ด',
    dosage: '10',
    unit: 'mg',
    indications_th: 'บรรเทาอาการคลื่นไส้ อาเจียน แน่นท้อง ท้องอืด อาหารไม่ย่อย',
    instructions_th: 'รับประทานครั้งละ 1 เม็ด วันละ 3 ครั้ง ก่อนอาหาร 15-30 นาที',
    precautions_th: 'ผู้ป่วยโรคหัวใจเต้นผิดจังหวะควรปรึกษาแพทย์ ไม่ควรรับประทานติดต่อกันเกิน 1 สัปดาห์',
  },
  dimenhydrinate: {
    searchQuery: 'dimenhydrinate',
    th: 'ไดเมนไฮดริเนต (ยาแก้เมารถ วิงเวียน)',
    en: 'Dimenhydrinate',
    type: 'เม็ด',
    dosage: '50',
    unit: 'mg',
    indications_th: 'ป้องกันและบรรเทาอาการเมารถ เมาเรือ วิงเวียนศีรษะ และคลื่นไส้อาเจียน',
    instructions_th: 'รับประทานครั้งละ 1 เม็ด ก่อนออกเดินทางอย่างน้อย 30 นาที สามารถซ้ำได้ทุก 4-6 ชั่วโมง',
    precautions_th: 'ทำให้เกิดอาการง่วงซึมมาก ห้ามขับขี่ยานพาหนะหรือทำงานกับเครื่องจักรกลอันตราย',
  },
  simethicone: {
    searchQuery: 'simethicone',
    th: 'ไซเมทิโคน (ยาขับลม ขจัดแก๊ส)',
    en: 'Simethicone',
    type: 'เม็ด',
    dosage: '80',
    unit: 'mg',
    indications_th: 'บรรเทาอาการท้องอืด ท้องเฟ้อ มีแก๊สในกระเพาะ แน่น จุกเสียด',
    instructions_th: 'เคี้ยวให้ละเอียดก่อนกลืน รับประทานครั้งละ 1-2 เม็ด หลังอาหารและก่อนนอน',
    precautions_th: 'เป็นยาที่ปลอดภัยสูง หากอาการแน่นท้องไม่ดีขึ้นภายใน 2 สัปดาห์ควรพบแพทย์',
  },
  bisacodyl: {
    searchQuery: 'bisacodyl',
    th: 'ไบซาโคดิล (ยาระบาย)',
    en: 'Bisacodyl',
    type: 'เม็ด',
    dosage: '5',
    unit: 'mg',
    indications_th: 'บรรเทาอาการท้องผูก กระตุ้นการขับถ่าย',
    instructions_th: 'รับประทานครั้งละ 1-2 เม็ด ก่อนนอน กลืนทั้งเม็ดพร้อมน้ำ',
    precautions_th: 'ห้ามเคี้ยวเม็ดยา และห้ามรับประทานร่วมกับนมหรือยาลดกรดภายใน 1 ชั่วโมง ไม่ควรใช้ติดต่อกันเกิน 7 วัน',
  },

  // --- 7. ยาแก้แพ้และทางเดินหายใจ (Antihistamines & Respiratory) ---
  cetirizine: {
    searchQuery: 'cetirizine',
    th: 'เซทิริซีน (ยาแก้แพ้)',
    en: 'Cetirizine',
    type: 'เม็ด',
    dosage: '10',
    unit: 'mg',
    indications_th: 'บรรเทาอาการแพ้อากาศ ลมพิษ ผื่นคัน น้ำมูกไหล จาม คันตา',
    instructions_th: 'รับประทานวันละ 1 ครั้ง ก่อนนอนหรือเมื่อมีอาการแพ้',
    precautions_th: 'อาจทำให้เกิดอาการง่วงซึมในผู้ป่วยบางราย ควรหลีกเลี่ยงการขับขี่ยานพาหนะ',
  },
  loratadine: {
    searchQuery: 'loratadine',
    th: 'ลอราทาดีน (ยาแก้แพ้ไม่ง่วง)',
    en: 'Loratadine',
    type: 'เม็ด',
    dosage: '10',
    unit: 'mg',
    indications_th: 'บรรเทาอาการภูมิแพ้ จาม คันจมูก น้ำมูกไหล ผื่นลมพิษเรื้อรัง',
    instructions_th: 'รับประทานวันละ 1 ครั้ง พร้อมหรือหลังอาหาร',
    precautions_th: 'ปลอดภัยต่อการทำงานมากกว่ากลุ่มเก่า แต่ผู้ป่วยโรคตับรุนแรงควรปรึกษาแพทย์ก่อนใช้',
  },
  fexofenadine: {
    searchQuery: 'fexofenadine',
    th: 'เฟกโซเฟนาดีน',
    en: 'Fexofenadine',
    type: 'เม็ด',
    dosage: '60',
    unit: 'mg',
    indications_th: 'บรรเทาอาการเยื่อบุจมูกอักเสบจากภูมิแพ้ และลมพิษเรื้อรัง (ไม่ง่วงซึม)',
    instructions_th: 'รับประทานวันละ 1-2 ครั้ง พร้อมน้ำเปล่า (หลีกเลี่ยงน้ำผลไม้ เช่น น้ำส้ม น้ำแอปเปิ้ล)',
    precautions_th: 'หลีกเลี่ยงการรับประทานร่วมกับยาลดกรดที่มีอะลูมิเนียมหรือแมกนีเซียม',
  },
  chlorpheniramine: {
    searchQuery: 'chlorpheniramine',
    th: 'คลอร์เฟนิรามีน (CPM)',
    en: 'Chlorpheniramine',
    type: 'เม็ด',
    dosage: '4',
    unit: 'mg',
    indications_th: 'บรรเทาอาการแพ้ หวัด คัดจมูก น้ำมูกไหล จาม และผื่นคัน',
    instructions_th: 'รับประทานครั้งละ 1 เม็ด ทุก 4-6 ชั่วโมงเมื่อมีอาการ',
    precautions_th: 'ทำให้ง่วงซึมมาก ปากแห้ง คอแห้ง ห้ามขับขี่รถยนต์หรือดื่มสุรา',
  },
  dextromethorphan: {
    searchQuery: 'dextromethorphan',
    th: 'เดกซ์โทรเมทอร์แฟน (ยาแก้ไอแห้ง)',
    en: 'Dextromethorphan',
    type: 'เม็ด',
    dosage: '15',
    unit: 'mg',
    indications_th: 'บรรเทาอาการไอแห้งๆ ไอไม่มีเสมหะ ระคายคอ',
    instructions_th: 'รับประทานครั้งละ 1 เม็ด ทุก 6-8 ชั่วโมง เมื่อมีอาการไอ',
    precautions_th: 'ห้ามใช้ในผู้ที่มีอาการไอแบบมีเสมหะมาก หรือผู้ป่วยโรคหอบหืดรุนแรง',
  },
  acetylcysteine: {
    searchQuery: 'acetylcysteine',
    th: 'อะเซทิลซิสเทอีน (ยาละลายเสมหะ)',
    en: 'Acetylcysteine',
    type: 'เม็ด',
    dosage: '600',
    unit: 'mg',
    indications_th: 'ละลายเสมหะ บรรเทาอาการไอมีเสมหะข้นเหนียวในโรคทางเดินหายใจ',
    instructions_th: 'ละลายเม็ดฟู่ในน้ำสะอาด 1 แก้ว ดื่มวันละ 1 ครั้ง หลังอาหาร',
    precautions_th: 'ควรดื่มน้ำมากๆ ระหว่างวันเพื่อช่วยให้เสมหะขับออกได้ง่ายขึ้น ระวังในผู้ป่วยโรคหอบหืด',
  },
  salbutamol: {
    searchQuery: 'albuterol',
    th: 'ซัลบูทามอล (ยาขยายหลอดลม)',
    en: 'Salbutamol',
    type: 'เม็ด',
    dosage: '2',
    unit: 'mg',
    indications_th: 'ขยายหลอดลม บรรเทาอาการหอบเหนื่อย แน่นหน้าอก ในโรคหอบหืดและปอดอุดกั้นเรื้อรัง',
    instructions_th: 'รับประทานครั้งละ 1-2 เม็ด วันละ 3-4 ครั้ง ตามแพทย์สั่ง',
    precautions_th: 'อาจทำให้ใจสั่น มือสั่น หัวใจเต้นเร็ว หรือกระวนกระวายใจ',
  },

  // --- 8. ยาฆ่าเชื้อและยาปฏิชีวนะ (Antibiotics & Anti-infectives) ---
  amoxicillin: {
    searchQuery: 'amoxicillin',
    th: 'อะม็อกซีซิลลิน',
    en: 'Amoxicillin',
    type: 'แคปซูล',
    dosage: '500',
    unit: 'mg',
    indications_th: 'ยาปฏิชีวนะรักษาการติดเชื้อแบคทีเรีย เช่น คออักเสบ ทอนซิลอักเสบ ไซนัส หูชั้นกลาง และทางเดินปัสสาวะ',
    instructions_th: 'รับประทานครั้งละ 1 แคปซูล วันละ 3 ครั้ง (หรือทุก 8 ชั่วโมง) และต้องรับประทานติดต่อกันจนหมดตามคำสั่งแพทย์',
    precautions_th: 'ห้ามใช้ในผู้ที่แพ้ยากลุ่มเพนิซิลลิน หากเกิดผื่นคัน ปากบวม หรือหายใจติดขัดให้หยุดยาทันที',
  },
  augmentin: {
    searchQuery: 'amoxicillin clavulanate',
    th: 'อะม็อกซีซิลลิน + กรดคลาวูลานิก',
    en: 'Amoxicillin Clavulanate',
    type: 'เม็ด',
    dosage: '625',
    unit: 'mg',
    indications_th: 'ยาปฏิชีวนะออกฤทธิ์กว้าง รักษาการติดเชื้อแบคทีเรียที่ดื้อยา ทางเดินหายใจ ทางเดินปัสสาวะ และผิวหนัง',
    instructions_th: 'รับประทานครั้งละ 1 เม็ด วันละ 2 ครั้ง พร้อมอาหารมื้อเช้าและเย็น และรับประทานจนหมด',
    precautions_th: 'อาจทำให้ถ่ายเหลว ท้องเสีย คลื่นไส้ ควรรับประทานพร้อมอาหารเพื่อลดอาการไม่สบายท้อง',
  },
  azithromycin: {
    searchQuery: 'azithromycin',
    th: 'อะซิโทรมัยซิน',
    en: 'Azithromycin',
    type: 'แคปซูล',
    dosage: '250',
    unit: 'mg',
    indications_th: 'ยาปฏิชีวนะรักษาการติดเชื้อทางเดินหายใจ ปอดอักเสบ และโรคติดต่อทางเพศสัมพันธ์บางชนิด',
    instructions_th: 'รับประทานวันละ 1 ครั้ง ก่อนอาหาร 1 ชั่วโมง หรือหลังอาหาร 2 ชั่วโมง ติดต่อกันตามแพทย์สั่ง',
    precautions_th: 'ห้ามใช้ร่วมกับยาลดกรดในเวลาเดียวกัน อาจทำให้เกิดอาการคลื่นไส้ แน่นท้อง',
  },
  ciprofloxacin: {
    searchQuery: 'ciprofloxacin',
    th: 'ซิโปรฟลอกซาซิน',
    en: 'Ciprofloxacin',
    type: 'เม็ด',
    dosage: '500',
    unit: 'mg',
    indications_th: 'ยาปฏิชีวนะรักษาการติดเชื้อทางเดินปัสสาวะ ทางเดินอาหาร และการติดเชื้อรุนแรง',
    instructions_th: 'รับประทานวันละ 2 ครั้ง ทุก 12 ชั่วโมง พร้อมดื่มน้ำตามมากๆ รับประทานยาจนครบกำหนด',
    precautions_th: 'หลีกเลี่ยงการรับประทานพร้อมนม ยาลดกรด หรือแคลเซียม ระวังอาการปวดเอ็นร้อยหวาย',
  },
  norfloxacin: {
    searchQuery: 'norfloxacin',
    th: 'นอร์ฟลอกซาซิน',
    en: 'Norfloxacin',
    type: 'เม็ด',
    dosage: '400',
    unit: 'mg',
    indications_th: 'รักษาโรคติดเชื้อในระบบทางเดินปัสสาวะ กระเพาะปัสสาวะอักเสบ และโรคท้องร่วงจากการติดเชื้อแบคทีเรีย',
    instructions_th: 'รับประทานครั้งละ 1 เม็ด วันละ 2 ครั้ง ก่อนอาหาร 1 ชั่วโมง หรือหลังอาหาร 2 ชั่วโมง ติดต่อกัน 3-5 วัน',
    precautions_th: 'ดื่มน้ำมากๆ ระหว่างใช้ยา ห้ามรับประทานร่วมกับนมหรือยาลดกรด',
  },
  doxycycline: {
    searchQuery: 'doxycycline',
    th: 'ด็อกซีไซคลิน',
    en: 'Doxycycline',
    type: 'แคปซูล',
    dosage: '100',
    unit: 'mg',
    indications_th: 'รักษาการติดเชื้อแบคทีเรีย สิวอักเสบ การติดเชื้อทางเดินหายใจ และโรคไข้รากสาดใหญ่',
    instructions_th: 'รับประทานพร้อมน้ำแก้วใหญ่ นั่งหรือยืนตัวตรงอย่างน้อย 30 นาทีหลังรับประทาน ห้ามเคี้ยวแคปซูล',
    precautions_th: 'ห้ามนอนราบทันทีหลังรับประทานยาเพราะอาจระคายเคืองหลอดอาหาร ห้ามใช้ในเด็กและสตรีมีครรภ์',
  },
  fluconazole: {
    searchQuery: 'fluconazole',
    th: 'ฟลูโคนาโซล (ยาฆ่าเชื้อรา)',
    en: 'Fluconazole',
    type: 'แคปซูล',
    dosage: '150',
    unit: 'mg',
    indications_th: 'รักษาและป้องกันการติดเชื้อราในช่องคลอด ผิวหนัง เล็บ และเชื้อราในช่องปาก',
    instructions_th: 'รับประทานตามคำสั่งแพทย์ สามารถรับประทานก่อนหรือหลังอาหารก็ได้',
    precautions_th: 'ระวังการใช้ร่วมกับยาอื่นหลายชนิด และห้ามใช้ในสตรีมีครรภ์',
  },
  acyclovir: {
    searchQuery: 'acyclovir',
    th: 'อะไซโคลเวียร์ (ยาต้านไวรัส)',
    en: 'Acyclovir',
    type: 'เม็ด',
    dosage: '400',
    unit: 'mg',
    indications_th: 'รักษาและบรรเทาอาการโรคเริม โรคงูสวัด และอีสุกอีใส',
    instructions_th: 'รับประทานตามขนาดและระยะเวลาที่แพทย์สั่งอย่างเคร่งครัด ควรดื่มน้ำตามมากๆ',
    precautions_th: 'ควรเริ่มใช้ยาให้เร็วที่สุดเมื่อเริ่มมีอาการ และดื่มน้ำให้เพียงพอเพื่อป้องกันการสะสมยาในไต',
  },

  // --- 9. ยาระบบประสาท จิตเวช และกล้ามเนื้อ (Neurological & Psychotropic) ---
  gabapentin: {
    searchQuery: 'gabapentin',
    th: 'กาบาเพนติน (ยาระงับปวดปลายประสาท)',
    en: 'Gabapentin',
    type: 'แคปซูล',
    dosage: '300',
    unit: 'mg',
    indications_th: 'รักษาอาการปวดแสบร้อนจากเส้นประสาท เช่น งูสวัด เบาหวาน และใช้ควบคุมโรคลมชัก',
    instructions_th: 'รับประทานตามคำสั่งแพทย์อย่างเคร่งครัด ควรกลืนทั้งเม็ดพร้อมน้ำ',
    precautions_th: 'ทำให้วิงเวียนศีรษะและง่วงซึม ห้ามหยุดยากะทันหันเพราะอาจทำให้อาการกำเริบ',
  },
  pregabalin: {
    searchQuery: 'pregabalin',
    th: 'พรีกาบาลิน',
    en: 'Pregabalin',
    type: 'แคปซูล',
    dosage: '75',
    unit: 'mg',
    indications_th: 'รักษาอาการปวดประสาทส่วนปลาย โรคปวดกล้ามเนื้อเรื้อรัง (Fibromyalgia) และโรควิตกกังวล',
    instructions_th: 'รับประทานวันละ 2 ครั้ง เช้า-เย็น พร้อมหรือไม่พร้อมอาหารก็ได้',
    precautions_th: 'อาจทำให้ง่วงซึม มึนงง น้ำหนักตัวเพิ่ม ห้ามหยุดยาเองโดยไม่ปรึกษาแพทย์',
  },
  sertraline: {
    searchQuery: 'sertraline',
    th: 'เซอร์ทราลีน',
    en: 'Sertraline',
    type: 'เม็ด',
    dosage: '50',
    unit: 'mg',
    indications_th: 'รักษาโรคซึมเศร้า โรควิตกกังวล โรคแพนิค และโรคย้ำคิดย้ำทำ',
    instructions_th: 'รับประทานวันละ 1 ครั้ง ในเวลาเช้าหรือเย็นเป็นประจำทุกวัน',
    precautions_th: 'ยาต้องใช้เวลา 2-4 สัปดาห์จึงจะเห็นผลเต็มที่ ห้ามหยุดยากะทันหัน และหลีกเลี่ยงแอลกอฮอล์',
  },
  fluoxetine: {
    searchQuery: 'fluoxetine',
    th: 'ฟลูออกซิทีน',
    en: 'Fluoxetine',
    type: 'แคปซูล',
    dosage: '20',
    unit: 'mg',
    indications_th: 'รักษาโรคซึมเศร้า โรควิตกกังวล และความผิดปกติในการรับประทานอาหาร',
    instructions_th: 'รับประทานวันละ 1 ครั้ง ในตอนเช้าหลังอาหาร',
    precautions_th: 'อาจทำให้นอนไม่หลับ คลื่นไส้ในช่วงแรก ห้ามหยุดยาเอง',
  },
  amitriptyline: {
    searchQuery: 'amitriptyline',
    th: 'อะมิทริปไทลีน',
    en: 'Amitriptyline',
    type: 'เม็ด',
    dosage: '10',
    unit: 'mg',
    indications_th: 'ช่วยให้นอนหลับ ป้องกันไมเกรน บรรเทาอาการปวดประสาทเรื้อรัง และรักษาภาวะซึมเศร้า',
    instructions_th: 'รับประทานวันละ 1 ครั้ง ก่อนนอน',
    precautions_th: 'ทำให้ง่วงซึมมาก ปากแห้ง คอแห้ง ท้องผูก ตาพร่า หลีกเลี่ยงการขับรถ',
  },
  lorazepam: {
    searchQuery: 'lorazepam',
    th: 'ลอราซีแพม (ยาคลายกังวล ช่วยนอนหลับ)',
    en: 'Lorazepam',
    type: 'เม็ด',
    dosage: '1',
    unit: 'mg',
    indications_th: 'บรรเทาอาการวิตกกังวล เครียด กระสับกระส่าย และช่วยให้นอนหลับ',
    instructions_th: 'รับประทานตามแพทย์สั่งอย่างเคร่งครัด (มักให้รับประทานก่อนนอนเมื่อมีอาการ)',
    precautions_th: 'เป็นยาควบคุม ทำให้ง่วงซึมสูง อาจเกิดการดื้อยาและติดยาได้หากใช้ติดต่อกันนาน ห้ามดื่มสุราเด็ดขาด',
  },
  diazepam: {
    searchQuery: 'diazepam',
    th: 'ไดอะซีแพม (ยาคลายกล้ามเนื้อ คลายกังวล)',
    en: 'Diazepam',
    type: 'เม็ด',
    dosage: '2',
    unit: 'mg',
    indications_th: 'คลายความวิตกกังวล คลายกล้ามเนื้อหดเกร็ง และช่วยสงบประสาท',
    instructions_th: 'รับประทานตามแพทย์สั่งอย่างเคร่งครัด',
    precautions_th: 'ทำให้ง่วงซึมและเสียการทรงตัว ห้ามใช้ร่วมกับแอลกอฮอล์หรือสารกดประสาท',
  },

  // --- 10. วิตามินและแร่ธาตุบำรุงร่างกาย (Vitamins & Supplements) ---
  folic_acid: {
    searchQuery: 'folic acid',
    th: 'กรดโฟลิก (บำรุงเม็ดเลือด)',
    en: 'Folic Acid',
    type: 'เม็ด',
    dosage: '5',
    unit: 'mg',
    indications_th: 'ป้องกันและรักษาภาวะโลหิตจาง และเสริมสร้างพัฒนาการระบบประสาทของทารกในครรภ์',
    instructions_th: 'รับประทานวันละ 1 ครั้ง พร้อมหรือหลังอาหาร',
    precautions_th: 'เป็นวิตามินที่ปลอดภัยสูง ควรรับประทานต่อเนื่องตามแพทย์แนะนำ',
  },
  ferrous_fumarate: {
    searchQuery: 'ferrous fumarate',
    th: 'เฟอร์รัสฟูมาเรต (ธาตุเหล็กบำรุงเลือด)',
    en: 'Ferrous Fumarate',
    type: 'เม็ด',
    dosage: '200',
    unit: 'mg',
    indications_th: 'รักษาและป้องกันภาวะโลหิตจางจากการขาดธาตุเหล็ก',
    instructions_th: 'รับประทานวันละ 1-2 ครั้ง พร้อมหรือหลังอาหารทันที (หรือก่อนอาหารหากทนอาการคลื่นไส้ได้)',
    precautions_th: 'อาจทำให้ถ่ายอุจจาระมีสีดำ คลื่นไส้ หรือท้องผูก ห้ามรับประทานพร้อมนมหรือชา กาแฟ',
  },
  calcium_carbonate: {
    searchQuery: 'calcium carbonate',
    th: 'แคลเซียมคาร์บอเนต',
    en: 'Calcium Carbonate',
    type: 'เม็ด',
    dosage: '1000',
    unit: 'mg',
    indications_th: 'เสริมสร้างกระดูกและฟัน ป้องกันและรักษาโรคกระดูกพรุน',
    instructions_th: 'รับประทานพร้อมอาหารหรือหลังอาหารทันที เพื่อให้กรดในกระเพาะช่วยดูดซึมแคลเซียม',
    precautions_th: 'อาจทำให้เกิดอาการท้องผูก ท้องอืด ควรดื่มน้ำตามมากๆ',
  },
  vitamin_b_complex: {
    searchQuery: 'vitamin b complex',
    th: 'วิตามินบีรวม (บำรุงปลายประสาท)',
    en: 'Vitamin B Complex',
    type: 'เม็ด',
    dosage: '1',
    unit: 'เม็ด',
    indications_th: 'บำรุงระบบประสาท กล้ามเนื้อ ป้องกันอาการเหน็บชา และบรรเทาความอ่อนล้า',
    instructions_th: 'รับประทานวันละ 1 ครั้ง หลังอาหารเช้า',
    precautions_th: 'อาจทำให้ปัสสาวะมีสีเหลืองเข้มสดใส ซึ่งเป็นภาวะปกติไม่มีอันตราย',
  },
  vitamin_c: {
    searchQuery: 'ascorbic acid',
    th: 'วิตามินซี (กรดแอสคอร์บิก)',
    en: 'Vitamin C',
    type: 'เม็ด',
    dosage: '500',
    unit: 'mg',
    indications_th: 'เสริมสร้างภูมิคุ้มกัน ป้องกันโรคเลือดออกตามไรฟัน และต้านอนุมูลอิสระ',
    instructions_th: 'รับประทานวันละ 1 ครั้ง หลังอาหาร พร้อมดื่มน้ำสะอาด',
    precautions_th: 'ผู้ป่วยโรคนิ่วในไตควรปรึกษาแพทย์ ไม่ควรรับประทานตอนท้องว่างเพราะอาจระคายเคืองกระเพาะ',
  },
};

/**
 * Get medication and supplement suggestions for autocomplete based on user input
 * @param {string} query
 * @param {string} categoryFilter - 'ยา' | 'อาหารเสริม' | ''
 * @returns {Array<{key: string, en: string, th: string, dosage: string, unit: string, type: string, category: string}>}
 */
export function getDrugSuggestions(query = '', categoryFilter = '') {
  const q = query.trim().toLowerCase();
  
  const drugEntries = Object.entries(COMMON_DRUG_MAP).map(([key, val]) => ({
    key,
    en: val.en,
    th: val.th,
    dosage: val.dosage,
    unit: val.unit,
    type: val.type,
    category: 'ยา',
  }));

  const supplementEntries = Object.entries(POPULAR_SUPPLEMENT_MAP).map(([key, val]) => ({
    key,
    en: val.en,
    th: val.th,
    dosage: val.dosage,
    unit: val.unit,
    type: val.type,
    category: 'อาหารเสริม',
  }));

  let combined = [];
  if (categoryFilter === 'อาหารเสริม') {
    combined = [...supplementEntries, ...drugEntries];
  } else if (categoryFilter === 'ยา') {
    combined = [...drugEntries, ...supplementEntries];
  } else {
    combined = [...drugEntries, ...supplementEntries];
  }

  if (!q) {
    if (categoryFilter === 'อาหารเสริม') return supplementEntries;
    if (categoryFilter === 'ยา') return drugEntries;
    return combined;
  }

  // Filter entries where english name, thai name, or key contains query
  let matches = combined.filter(item => 
    item.en.toLowerCase().includes(q) ||
    item.th.toLowerCase().includes(q) ||
    item.key.toLowerCase().includes(q)
  );

  if (categoryFilter) {
    matches.sort((a, b) => {
      if (a.category === categoryFilter && b.category !== categoryFilter) return -1;
      if (b.category === categoryFilter && a.category !== categoryFilter) return 1;
      return 0;
    });
  }

  return matches;
}

/**
 * Helper to clean and summarize text to Thai strictly
 */
function translateOrSummarizeToThai(type, openFdaRawText, drugName = '') {
  if (!openFdaRawText) {
    if (type === 'indications') return 'ใช้รักษาและบรรเทาอาการตามข้อบ่งใช้ทางการแพทย์ที่แพทย์หรือเภสัชกรกำหนด';
    if (type === 'instructions') return 'รับประทานตามคำแนะนำของแพทย์ เภสัชกร หรือเอกสารกำกับยาอย่างเคร่งครัด';
    return 'ห้ามใช้ในผู้ที่มีประวัติแพ้ยานี้ สตรีมีครรภ์หรือให้นมบุตรควรปรึกษาแพทย์ก่อนใช้';
  }

  const text = (Array.isArray(openFdaRawText) ? openFdaRawText.join(' ') : String(openFdaRawText)).toLowerCase();

  if (type === 'indications') {
    if (text.includes('pain') || text.includes('fever') || text.includes('headache')) {
      return 'บรรเทาอาการปวดเล็กน้อยถึงปานกลาง เช่น ปวดศีรษะ ปวดกล้ามเนื้อ และช่วยลดไข้';
    }
    if (text.includes('blood pressure') || text.includes('hypertension')) {
      return 'รักษาและควบคุมระดับความดันโลหิตสูง ลดความเสี่ยงโรคหลอดเลือดหัวใจ';
    }
    if (text.includes('diabetes') || text.includes('glucose') || text.includes('glycemic')) {
      return 'ควบคุมระดับน้ำตาลในเลือดสำหรับผู้ป่วยโรคเบาหวานชนิดที่ 2';
    }
    if (text.includes('cholesterol') || text.includes('lipid') || text.includes('triglyceride')) {
      return 'ลดระดับคอเลสเตอรอลและไขมันในเลือด ป้องกันโรคหลอดเลือดหัวใจตีบ';
    }
    if (text.includes('allergy') || text.includes('allergic') || text.includes('rhinitis') || text.includes('histamine')) {
      return 'บรรเทาอาการแพ้อากาศ ลมพิษ ผื่นคัน น้ำมูกไหล จาม คันตา';
    }
    if (text.includes('infection') || text.includes('bacteria') || text.includes('antibacterial')) {
      return 'ยาปฏิชีวนะรักษาการติดเชื้อแบคทีเรียตามแพทย์สั่งอย่างเคร่งครัด';
    }
    if (text.includes('acid') || text.includes('reflux') || text.includes('gerd') || text.includes('ulcer') || text.includes('heartburn')) {
      return 'รักษาโรคกรดไหลย้อน แผลในกระเพาะอาหาร และลดการหลั่งกรดในทางเดินอาหาร';
    }
    if (text.includes('cough') || text.includes('expectorant') || text.includes('mucus')) {
      return 'บรรเทาอาการไอ ขับเสมหะ และลดการระคายเคืองในทางเดินหายใจ';
    }
    return `รักษาและบรรเทาอาการตามข้อบ่งใช้ทางการแพทย์ของยา ${drugName}`;
  }

  if (type === 'instructions') {
    if (text.includes('before meals') || text.includes('empty stomach')) {
      return 'รับประทานก่อนอาหารอย่างน้อย 30-60 นาที พร้อมดื่มน้ำสะอาด';
    }
    if (text.includes('with food') || text.includes('after meal')) {
      return 'รับประทานพร้อมอาหารหรือหลังอาหารทันที พร้อมดื่มน้ำตามมากๆ';
    }
    if (text.includes('once daily') || text.includes('once a day')) {
      return 'รับประทานวันละ 1 ครั้ง ในเวลาเดียวกันของทุกวัน';
    }
    if (text.includes('every 4 to 6') || text.includes('every 4-6')) {
      return 'รับประทานครั้งละ 1-2 เม็ด ทุก 4-6 ชั่วโมง เมื่อมีอาการ';
    }
    if (text.includes('bedtime')) {
      return 'รับประทานวันละ 1 ครั้ง ก่อนนอน';
    }
    return 'รับประทานตามคำแนะนำของแพทย์หรือเอกสารกำกับยาอย่างเคร่งครัด';
  }

  if (type === 'precautions') {
    const points = ['ห้ามใช้ในผู้ที่มีประวัติแพ้ยานี้'];
    if (text.includes('liver') || text.includes('hepatic')) {
      points.push('ระวังการใช้ในผู้ป่วยโรคตับ และหลีกเลี่ยงเครื่องดื่มแอลกอฮอล์');
    }
    if (text.includes('kidney') || text.includes('renal')) {
      points.push('ระวังการใช้ในผู้ป่วยโรคไต');
    }
    if (text.includes('drowsiness') || text.includes('drowsy') || text.includes('sleepy')) {
      points.push('ยานี้อาจทำให้ง่วงซึม หลีกเลี่ยงการขับขี่ยานพาหนะ');
    }
    if (text.includes('pregnancy') || text.includes('pregnant')) {
      points.push('สตรีมีครรภ์หรือให้นมบุตรควรปรึกษาแพทย์ก่อนใช้ยา');
    }
    if (text.includes('bleeding') || text.includes('stomach')) {
      points.push('ระวังภาวะระคายเคืองกระเพาะอาหารและเลือดออกผิดปกติ');
    }
    return points.join(', ');
  }

  return '';
}

function findPreset(query) {
  if (!query) return null;
  const q = query.trim().toLowerCase();
  if (COMMON_DRUG_MAP[q]) return COMMON_DRUG_MAP[q];

  const cleanQ = q.replace(/[\(\)\-\_\/]/g, ' ').replace(/\s+/g, ' ').trim();

  for (const [key, val] of Object.entries(COMMON_DRUG_MAP)) {
    const cleanKey = key.replace(/_/g, ' ');
    const cleanEn = (val.en || '').toLowerCase().replace(/[\(\)\-\_\/]/g, ' ').replace(/\s+/g, ' ').trim();
    const cleanTh = (val.th || '').toLowerCase().replace(/[\(\)\-\_\/]/g, ' ').replace(/\s+/g, ' ').trim();

    if (
      q === key ||
      cleanQ === cleanKey ||
      cleanQ === cleanEn ||
      cleanQ === cleanTh ||
      cleanQ.includes(cleanKey) ||
      cleanKey.includes(cleanQ) ||
      cleanQ.includes(cleanEn) ||
      cleanEn.includes(cleanQ) ||
      cleanTh.includes(cleanQ) ||
      cleanQ.includes(cleanTh)
    ) {
      return val;
    }
  }
  return null;
}

/**
 * Validate and determine if the drug is strictly tablet (เม็ด), capsule (แคปซูล), or liquid (ยาน้ำ)
 * Rejects non-tablet/capsule/liquid forms (such as injections, topical creams, inhalers, eye drops, patches, powders)
 */
function determineAllowedDrugType(record, drugName) {
  const combinedText = [
    ...(record.dosage_forms_and_strengths || []),
    ...(record.openfda?.dosage_form || []),
    ...(record.openfda?.route || []),
    ...(record.how_supplied || []),
    ...(record.description || []),
    ...(record.dosage_and_administration || [])
  ].join(' ').toLowerCase();

  const routes = (record.openfda?.route || []).map(r => String(r).toUpperCase());
  const isStrictlyNonOralRoute = routes.length > 0 && !routes.includes('ORAL');

  // Check for allowed forms
  const isCapsule = combinedText.includes('capsule') || combinedText.includes('softgel');
  const isLiquid = combinedText.includes('suspension') || combinedText.includes('oral solution') || combinedText.includes('syrup') || combinedText.includes('elixir') || combinedText.includes('liquid') || (combinedText.includes('solution') && !combinedText.includes('injection'));
  const isTablet = combinedText.includes('tablet') || combinedText.includes('caplet') || combinedText.includes('pill') || combinedText.includes('chewable');

  // If matched an allowed form and not exclusively a non-oral route
  if (isCapsule && !isStrictlyNonOralRoute) {
    return { type: 'แคปซูล', unit: 'mg', dosage: '250' };
  }
  if (isLiquid && !isStrictlyNonOralRoute) {
    return { type: 'ยาน้ำ', unit: 'ml', dosage: '10' };
  }
  if (isTablet && !isStrictlyNonOralRoute) {
    return { type: 'เม็ด', unit: 'mg', dosage: '500' };
  }

  // If route is oral and no disallowed terms found, default to tablet
  if (routes.includes('ORAL') && !isStrictlyNonOralRoute) {
    return { type: 'เม็ด', unit: 'mg', dosage: '500' };
  }

  // Check for disallowed forms to provide a helpful error
  let detectedType = '';
  if (combinedText.includes('injection') || combinedText.includes('injectable') || routes.includes('INTRAVENOUS') || routes.includes('SUBCUTANEOUS') || routes.includes('INTRAMUSCULAR')) {
    detectedType = 'ยาฉีด (Injection)';
  } else if (combinedText.includes('cream') || combinedText.includes('ointment') || combinedText.includes('gel') || combinedText.includes('lotion') || routes.includes('TOPICAL')) {
    detectedType = 'ยาทา/ครีม (Topical / Cream)';
  } else if (combinedText.includes('inhaler') || combinedText.includes('inhalation') || combinedText.includes('spray') || routes.includes('RESPIRATORY')) {
    detectedType = 'ยาพ่น/สูดดม (Inhaler / Spray)';
  } else if (combinedText.includes('ophthalmic') || combinedText.includes('eye drop') || routes.includes('OPHTHALMIC')) {
    detectedType = 'ยาหยอดตา (Eye Drops)';
  } else if (combinedText.includes('transdermal') || combinedText.includes('patch')) {
    detectedType = 'แผ่นแปะผิวหนัง (Transdermal Patch)';
  } else if (combinedText.includes('suppository') || routes.includes('RECTAL')) {
    detectedType = 'ยาเหน็บ (Suppository)';
  } else if (combinedText.includes('powder') && !combinedText.includes('suspension')) {
    detectedType = 'ยาผง (Powder)';
  }

  if (detectedType || isStrictlyNonOralRoute) {
    throw new Error(`ระบบรองรับเฉพาะ "ยาเม็ด", "แคปซูล" และ "ยาน้ำ" เท่านั้น ยา "${drugName}" ตรวจพบเป็น ${detectedType || 'ยาประเภทอื่น'} จึงไม่สามารถนำเข้าข้อมูลได้`);
  }

  // Fallback to tablet if oral
  return { type: 'เม็ด', unit: 'mg', dosage: '100' };
}

/**
 * Fetch drug data and format strictly into Thai
 */
export async function fetchDrugFromOpenFda(drugName) {
  const rawQuery = drugName.trim().toLowerCase();
  if (!rawQuery) throw new Error('กรุณากรอกชื่อยาภาษาอังกฤษก่อนกดดึงข้อมูล');

  // Check known mapping (matches key, english name, thai name, or clean keywords)
  const matchedPreset = findPreset(rawQuery);

  // If in our curated Thai medical database, return THAI ONLY!
  if (matchedPreset) {
    return {
      name_en: matchedPreset.en,
      name_th: matchedPreset.th,
      type: matchedPreset.type,
      dosage: matchedPreset.dosage,
      unit: matchedPreset.unit,
      category: 'ยา',
      indications: matchedPreset.indications_th,
      instructions: matchedPreset.instructions_th,
      precautions: matchedPreset.precautions_th,
      source: 'ฐานข้อมูลเภสัชกรรมมาตรฐาน (อย. / FDA)',
    };
  }

  // Otherwise, query openFDA live
  const actualSearchTerm = rawQuery;
  const urls = [
    `https://api.fda.gov/drug/label.json?search=openfda.generic_name:"${encodeURIComponent(actualSearchTerm)}"&limit=1`,
    `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${encodeURIComponent(actualSearchTerm)}"&limit=1`,
    `https://api.fda.gov/drug/label.json?search="${encodeURIComponent(actualSearchTerm)}"&limit=1`,
  ];

  let record = null;
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.results && json.results.length > 0) {
          record = json.results[0];
          break;
        }
      }
    } catch (e) {
      // try next url
    }
  }

  if (record) {
    // Validate that the drug is strictly tablet, capsule, or liquid
    const typeInfo = determineAllowedDrugType(record, drugName);

    const rawGeneric = record.openfda?.generic_name?.[0] || drugName;
    const genericName = rawGeneric.charAt(0).toUpperCase() + rawGeneric.slice(1);
    
    // Convert openFDA contents strictly into Thai
    const indications = translateOrSummarizeToThai('indications', record.indications_and_usage || record.purpose || '', genericName);
    const instructions = translateOrSummarizeToThai('instructions', record.dosage_and_administration || '', genericName);
    const precautions = translateOrSummarizeToThai('precautions', record.warnings || record.warnings_and_cautions || record.precautions || '', genericName);

    return {
      name_en: genericName,
      name_th: genericName,
      type: typeInfo.type,
      dosage: typeInfo.dosage,
      unit: typeInfo.unit,
      category: 'ยา',
      indications,
      instructions,
      precautions,
      source: 'openFDA (U.S. FDA)',
    };
  }

  throw new Error(`ไม่พบข้อมูลยาสำหรับ "${drugName}" ในฐานข้อมูล กรุณาตรวจสอบตัวสะกดภาษาอังกฤษ เช่น Aspirin, Metformin, Paracetamol, Amlodipine`);
}

/**
 * Unified auto-fill fetcher for both medications and dietary supplements
 * @param {string} query - Drug or supplement name
 * @param {string} preferredCategory - 'ยา' | 'อาหารเสริม' | ''
 */
export async function fetchMedicalEntity(query, preferredCategory = '') {
  const q = (query || '').trim();
  if (!q) throw new Error('กรุณาระบุชื่อยาหรืออาหารเสริมก่อนค้นหา');

  // If category is explicitly 'อาหารเสริม' or matches supplement preset
  if (preferredCategory === 'อาหารเสริม' || findSupplementPreset(q)) {
    try {
      return await fetchSupplementFromApi(q);
    } catch (suppErr) {
      try {
        return await fetchDrugFromOpenFda(q);
      } catch (fdaErr) {
        throw suppErr;
      }
    }
  }

  // Otherwise, try drug first
  try {
    return await fetchDrugFromOpenFda(q);
  } catch (fdaErr) {
    try {
      return await fetchSupplementFromApi(q);
    } catch (suppErr) {
      throw new Error(`ไม่พบข้อมูลยาหรืออาหารเสริมสำหรับ "${q}" ในฐานข้อมูล`);
    }
  }
}

// ==============================================================================
// Dietary Supplement Service
// Provides live API search and Thai auto-fill for dietary supplements
// (วิตามิน และ ผลิตภัณฑ์เสริมอาหารยอดนิยมในประเทศไทย)
// ==============================================================================

export const POPULAR_SUPPLEMENT_MAP = {
  // ---------------------------------------------------------------------------
  // 1. กลุ่มวิตามินและสารต้านอนุมูลอิสระ (Vitamins & Antioxidants)
  // ---------------------------------------------------------------------------
  vitamin_c: {
    searchQuery: 'vitamin c ascorbic acid',
    th: 'วิตามินซี (กรดแอสคอร์บิก 1000 มก.)',
    en: 'Vitamin C (Ascorbic Acid 1000mg)',
    type: 'เม็ด',
    dosage: '1000',
    unit: 'mg',
    category: 'อาหารเสริม',
    indications_th: 'เสริมสร้างระบบภูมิคุ้มกัน ต้านอนุมูลอิสระ ป้องกันและบรรเทาอาการหวัด บำรุงผิวพรรณ และช่วยการสังเคราะห์คอลลาเจน',
    instructions_th: 'รับประทานวันละ 1 เม็ด พร้อมมื้ออาหารหรือหลังอาหารเช้าทันที พร้อมดื่มน้ำสะอาดตามมากๆ',
    precautions_th: 'ไม่ควรรับประทานเกินวันละ 2,000 มก. ผู้ป่วยโรคนิ่วในทางเดินปัสสาวะหรือโรคไตควรปรึกษาแพทย์ก่อนใช้',
  },
  blackmores_bio_c: {
    searchQuery: 'blackmores bio c',
    th: 'แบลคมอร์ส ไบโอ ซี (วิตามินซีจากธรรมชาติ)',
    en: 'Blackmores Bio C 1000mg',
    type: 'เม็ด',
    dosage: '1000',
    unit: 'mg',
    category: 'อาหารเสริม',
    indications_th: 'วิตามินซีสูตรผสมไบโอฟลาโวนอยด์ ช่วยเพิ่มการดูดซึม เสริมภูมิคุ้มกัน ป้องกันเลือดออกตามไรฟันและชะลอความเสื่อมของเซลล์',
    instructions_th: 'รับประทานวันละ 1 เม็ด พร้อมอาหารมื้อใดก็ได้ของวัน',
    precautions_th: 'ควรดื่มน้ำตามมากๆ ห้ามเคี้ยวหรือกลืนเม็ดยาขณะท้องว่างจัด',
  },
  nat_c: {
    searchQuery: 'mega we care nat c',
    th: 'แนท ซี (วิตามินซีธรรมชาติสูตรระคายเคืองกระเพาะต่ำ)',
    en: 'Mega We Care Nat C 1000mg',
    type: 'เม็ด',
    dosage: '1000',
    unit: 'mg',
    category: 'อาหารเสริม',
    indications_th: 'เสริมภูมิต้านทาน ป้องกันหวัด ภูมิแพ้ ต้านอนุมูลอิสระ สูตรผสมไบโอฟลาโวนอยด์ รูติน และเฮสเพอริดิน อ่อนโยนต่อกระเพาะ',
    instructions_th: 'รับประทานวันละ 1 เม็ด หลังอาหารเช้าทันที',
    precautions_th: 'ผู้ป่วยโรคตับหรือโรคนิ่วควรปรึกษาแพทย์ ไม่ควรรับประทานเกินขนาดที่กำหนด',
  },
  vistra_acerola_cherry: {
    searchQuery: 'vistra acerola cherry 1000mg',
    th: 'วิสทร้า อะเซโรล่า เชอร์รี่ (1000 มก.)',
    en: 'Vistra Acerola Cherry 1000mg',
    type: 'เม็ด',
    dosage: '1000',
    unit: 'mg',
    category: 'อาหารเสริม',
    indications_th: 'วิตามินซีธรรมชาติจากสารสกัดอะเซโรล่า เชอร์รี่ ดูดซึมเร็ว ช่วยให้ผิวกระจ่างใส เสริมภูมิคุ้มกันร่างกายและลดอาการภูมิแพ้',
    instructions_th: 'รับประทานวันละ 1 เม็ด พร้อมมื้ออาหารเช้าหรือเย็น',
    precautions_th: 'ควรรับประทานพร้อมอาหารเพื่อป้องกันการระคายเคืองกระเพาะอาหาร',
  },
  vitamin_d3: {
    searchQuery: 'vitamin d3 cholecalciferol',
    th: 'วิตามินดี 3 (โคลแคลซิเฟอรอล)',
    en: 'Vitamin D3 (Cholecalciferol 1000 IU)',
    type: 'แคปซูล',
    dosage: '1000',
    unit: 'IU',
    category: 'อาหารเสริม',
    indications_th: 'ช่วยดูดซึมแคลเซียมและฟอสฟอรัส เสริมสร้างความแข็งแรงของกระดูกและฟัน สนับสนุนการทำงานของระบบภูมิคุ้มกันและกล้ามเนื้อ',
    instructions_th: 'รับประทานวันละ 1 แคปซูล พร้อมอาหารที่มีไขมันเพื่อเพิ่มการดูดซึม',
    precautions_th: 'ผู้ป่วยที่มีภาวะแคลเซียมในเลือดสูง หรือโรคไตวายเรื้อรังควรปรึกษาแพทย์',
  },
  vitamin_b_complex: {
    searchQuery: 'vitamin b complex',
    th: 'วิตามินบีรวม (บำรุงประสาทและสมอง)',
    en: 'High Potency Vitamin B Complex',
    type: 'แคปซูล',
    dosage: '1',
    unit: 'แคปซูล',
    category: 'อาหารเสริม',
    indications_th: 'บำรุงระบบประสาท คลายความเครียด บรรเทาอาการเหน็บชา อ่อนเพลียจากการทำงานหนัก หรือการพักผ่อนไม่เพียงพอ',
    instructions_th: 'รับประทานวันละ 1 แคปซูล พร้อมอาหารเช้า',
    precautions_th: 'อาจทำให้ปัสสาวะมีสีเหลืองสว่างสดใส ซึ่งเป็นภาวะปกติของการขับวิตามินบี 2 (ไรโบฟลาวิน) ส่วนเกิน',
  },
  nat_b: {
    searchQuery: 'mega we care nat b',
    th: 'แนท บี (วิตามินบีสูตรเข้มข้น)',
    en: 'Mega We Care Nat B',
    type: 'แคปซูล',
    dosage: '1',
    unit: 'แคปซูล',
    category: 'อาหารเสริม',
    indications_th: 'วิตามินบีรวมเข้มข้น ฟื้นฟูร่างกายจากความเหนื่อยล้า บำรุงปลายประสาท เสริมสมาธิสำหรับผู้ใช้สมองหนัก',
    instructions_th: 'รับประทานวันละ 1 แคปซูล พร้อมอาหารเช้า',
    precautions_th: 'ควรรับประทานในมื้อเช้าเพื่อป้องกันอาการนอนไม่หลับในผู้ที่ไวต่อวิตามินบี',
  },
  blackmores_exec_b: {
    searchQuery: 'blackmores exec b stress',
    th: 'แบลคมอร์ส เอ็กเซค บีส์ (สูตรลดความเครียด)',
    en: "Blackmores Exec B's",
    type: 'เม็ด',
    dosage: '1',
    unit: 'เม็ด',
    category: 'อาหารเสริม',
    indications_th: 'วิตามินบีรวมผสมแร่ธาตุและสมุนไพร ช่วยบำรุงระบบประสาท คลายความตึงเครียดจากการทำงานหนักและช่วยฟื้นฟูพลังงาน',
    instructions_th: 'รับประทานวันละ 1 เม็ด พร้อมอาหารเช้า',
    precautions_th: 'เด็กและสตรีมีครรภ์ไม่ควรรับประทาน',
  },
  vitamin_e: {
    searchQuery: 'vitamin e d-alpha tocopherol',
    th: 'วิตามินอี ธรรมชาติ (400 ไอยู)',
    en: 'Natural Vitamin E (400 IU)',
    type: 'แคปซูล',
    dosage: '400',
    unit: 'IU',
    category: 'อาหารเสริม',
    indications_th: 'ต้านอนุมูลอิสระ ชะลอความเสื่อมของเซลล์ บำรุงผิวพรรณให้ชุ่มชื้น ลดเลือนรอยแผลเป็น และบำรุงระบบหลอดเลือดหัวใจ',
    instructions_th: 'รับประทานวันละ 1 แคปซูล พร้อมมื้ออาหารที่มีไขมัน',
    precautions_th: 'ระวังการใช้ร่วมกับยาละลายลิ่มเลือด (Warfarin) และควรหยุดรับประทานก่อนการผ่าตัดอย่างน้อย 2 สัปดาห์',
  },

  // ---------------------------------------------------------------------------
  // 2. กลุ่มกรดไขมันและบำรุงหัวใจ/สมอง (Essential Fatty Acids & Heart/Brain)
  // ---------------------------------------------------------------------------
  fish_oil: {
    searchQuery: 'omega 3 fish oil',
    th: 'น้ำมันปลา โอเมก้า-3 (1000 มก.)',
    en: 'Fish Oil (Omega-3 1000mg)',
    type: 'แคปซูล',
    dosage: '1000',
    unit: 'mg',
    category: 'อาหารเสริม',
    indications_th: 'บำรุงหลอดเลือดหัวใจ ลดระดับไตรกลีเซอไรด์ในเลือด บำรุงสมองและความจำ ลดการอักเสบของข้อต่อ',
    instructions_th: 'รับประทานครั้งละ 1 แคปซูล วันละ 1-2 ครั้ง พร้อมอาหารมื้อหลัก (เพื่อการดูดซึมที่ดีที่สุด)',
    precautions_th: 'ห้ามใช้ในผู้ที่แพ้ปลาทะเลหรือน้ำมันปลา ระวังการใช้ร่วมกับยาต้านการแข็งตัวของเลือด (เช่น Warfarin, Aspirin)',
  },
  blackmores_fish_oil: {
    searchQuery: 'blackmores fish oil',
    th: 'แบลคมอร์ส ฟิช ออยล์ 1000 มก.',
    en: 'Blackmores Fish Oil 1000',
    type: 'แคปซูล',
    dosage: '1000',
    unit: 'mg',
    category: 'อาหารเสริม',
    indications_th: 'น้ำมันปลาเข้มข้นมาตรฐาน อุดมด้วยกรดไขมัน EPA และ DHA บำรุงสุขภาพหัวใจ สมอง สายตา และบรรเทาอาการข้อขัด',
    instructions_th: 'รับประทานครั้งละ 1 แคปซูล วันละ 1-2 ครั้ง พร้อมอาหาร',
    precautions_th: 'ควรหยุดใช้ก่อนการผ่าตัดหรือถอนฟันอย่างน้อย 1-2 สัปดาห์',
  },
  mega_fish_oil: {
    searchQuery: 'mega we care max omega 3',
    th: 'เมก้า วี แคร์ แมกซ์-โอเมก้า 3',
    en: 'Mega We Care Maxx Omega 3',
    type: 'แคปซูล',
    dosage: '1000',
    unit: 'mg',
    category: 'อาหารเสริม',
    indications_th: 'น้ำมันปลาเข้มข้นมาตรฐานสูง อุดมด้วยกรดไขมันจำเป็นไม่อิ่มตัว บำรุงสมองและป้องกันภาวะหลอดเลือดแดงแข็งตัว',
    instructions_th: 'รับประทานวันละ 1 แคปซูล พร้อมอาหารเช้าหรือเย็น',
    precautions_th: 'ห้ามใช้ในผู้ที่แพ้อาหารทะเลหรือน้ำมันปลา',
  },
  evening_primrose: {
    searchQuery: 'evening primrose oil epo',
    th: 'น้ำมันอีฟนิ่งพริมโรส (EPO 1000 มก.)',
    en: 'Evening Primrose Oil (1000mg)',
    type: 'แคปซูล',
    dosage: '1000',
    unit: 'mg',
    category: 'อาหารเสริม',
    indications_th: 'อุดมด้วยกรดแกมมา-ไลโนเลนิก (GLA) บรรเทาอาการไม่สบายตัวก่อนมีประจำเดือน (PMS) ปวดคัดตึงหน้าอก และช่วยให้ผิวชุ่มชื้น',
    instructions_th: 'รับประทานครั้งละ 1 แคปซูล วันละ 1-2 ครั้ง พร้อมมื้ออาหาร',
    precautions_th: 'ห้ามใช้ในผู้ป่วยโรคลมชัก หรือผู้ที่รับประทานยากันชัก',
  },
  coq10: {
    searchQuery: 'coenzyme q10',
    th: 'โคเอนไซม์ คิวเท็น (CoQ10 100 มก.)',
    en: 'Coenzyme Q10 (100mg)',
    type: 'แคปซูล',
    dosage: '100',
    unit: 'mg',
    category: 'อาหารเสริม',
    indications_th: 'เพิ่มพลังงานระดับเซลล์ให้กล้ามเนื้อหัวใจ สารต้านอนุมูลอิสระชะลอวัย เหมาะสำหรับผู้ทานยาลดไขมันกลุ่มสแตติน (Statin)',
    instructions_th: 'รับประทานวันละ 1 แคปซูล พร้อมอาหารเช้าหรือเที่ยง',
    precautions_th: 'สตรีมีครรภ์หรือให้นมบุตรควรปรึกษาแพทย์ก่อนรับประทาน',
  },
  lecithin: {
    searchQuery: 'lecithin phosphatidylcholine',
    th: 'เลซิติน (1200 มก.)',
    en: 'Lecithin (1200mg)',
    type: 'แคปซูล',
    dosage: '1200',
    unit: 'mg',
    category: 'อาหารเสริม',
    indications_th: 'อุดมด้วยฟอสฟาติดิลโคลีน บำรุงสมอง เสริมความจำ สลายไขมันในตับ และช่วยป้องกันท่อน้ำนมอุดตันในคุณแม่ให้นมบุตร',
    instructions_th: 'รับประทานครั้งละ 1 แคปซูล วันละ 1-2 ครั้ง พร้อมอาหาร',
    precautions_th: 'ผู้ที่แพ้ถั่วเหลืองควรระมัดระวังเป็นพิเศษ',
  },

  // ---------------------------------------------------------------------------
  // 3. กลุ่มแร่ธาตุและบำรุงกระดูก/ข้อต่อ (Minerals, Bones & Joints)
  // ---------------------------------------------------------------------------
  calcium_d: {
    searchQuery: 'calcium carbonate vitamin d',
    th: 'แคลเซียม ผสมวิตามินดี (600 มก.)',
    en: 'Calcium 600mg + Vitamin D3',
    type: 'เม็ด',
    dosage: '600',
    unit: 'mg',
    category: 'อาหารเสริม',
    indications_th: 'เสริมสร้างมวลกระดูกและฟันให้แข็งแรง ป้องกันและชะลอโรคกระดูกพรุนในสตรีวัยทองและผู้สูงอายุ',
    instructions_th: 'รับประทานครั้งละ 1 เม็ด วันละ 1-2 ครั้ง หลังอาหาร พร้อมดื่มน้ำสะอาดตามมากๆ',
    precautions_th: 'ควรรับประทานห่างจากยาฆ่าเชื้อ (Tetracycline, Ciprofloxacin) และธาตุเหล็กอย่างน้อย 2 ชั่วโมง',
  },
  caltrate: {
    searchQuery: 'caltrate plus calcium',
    th: 'แคลเทรต พลัส (แคลเซียม + วิตามินดี + แร่ธาตุบำรุงกระดูก)',
    en: 'Caltrate Plus (Calcium + Vitamin D)',
    type: 'เม็ด',
    dosage: '600',
    unit: 'mg',
    category: 'อาหารเสริม',
    indications_th: 'แคลเซียมสูตรครบถ้วน ผสมวิตามินดี แมกนีเซียม สังกะสี ทองแดง และแมงกานีส ป้องกันโรคกระดูกบางและกระดูกหักง่าย',
    instructions_th: 'รับประทานวันละ 1-2 เม็ด หลังอาหารเช้าหรือเย็น',
    precautions_th: 'ห้ามรับประทานเกินขนาด ผู้ป่วยโรคไตหรือนิ่วแคลเซียมควรปรึกษาแพทย์',
  },
  cdr: {
    searchQuery: 'cdr calcium vitamin c d',
    th: 'ซีดีอาร์ (แคลเซียมเม็ดฟู่ผสมวิตามินซีและดี)',
    en: 'CDR Calcium-D-Redoxon Effervescent',
    type: 'เม็ด',
    dosage: '1',
    unit: 'เม็ด',
    category: 'อาหารเสริม',
    indications_th: 'เสริมสร้างความแข็งแรงของกระดูกและฟัน ช่วยการดูดซึมแคลเซียมและเสริมภูมิคุ้มกันร่างกาย',
    instructions_th: 'ละลายยา 1 เม็ดในน้ำเย็น 1 แก้ว ดื่มวันละ 1 ครั้งหลังอาหาร',
    precautions_th: 'ผู้ป่วยโรคไตหรือผู้ที่ต้องจำกัดเกลือโซเดียมควรระวัง',
  },
  zinc: {
    searchQuery: 'zinc amino acid chelate',
    th: 'ซิงค์ สังกะสี (15 มก.)',
    en: 'Zinc Amino Acid Chelate (15mg)',
    type: 'แคปซูล',
    dosage: '15',
    unit: 'mg',
    category: 'อาหารเสริม',
    indications_th: 'ควบคุมความมันบนใบหน้า ลดการเกิดสิวอักเสบ เสริมภูมิต้านทานร่างกาย ลดผมร่วง และช่วยสมานบาดแผล',
    instructions_th: 'รับประทานวันละ 1 แคปซูล พร้อมอาหารมื้อใดก็ได้ (หลีกเลี่ยงการทานตอนท้องว่าง)',
    precautions_th: 'ไม่ควรรับประทานเกินวันละ 40 มก. ติดต่อกันเป็นเวลานานเกินไป',
  },
  vistra_zinc: {
    searchQuery: 'vistra zinc',
    th: 'วิสทร้า ซิงค์ (15 มก.)',
    en: 'Vistra Zinc (15mg)',
    type: 'แคปซูล',
    dosage: '15',
    unit: 'mg',
    category: 'อาหารเสริม',
    indications_th: 'ซิงค์เกรดอะมิโนแอซิดคีเลต ดูดซึมไว ช่วยปรับสมดุลฮอร์โมน ลดสิว บำรุงเล็บและรากผมให้แข็งแรง',
    instructions_th: 'รับประทานวันละ 1 แคปซูล พร้อมมื้ออาหาร',
    precautions_th: 'ควรรับประทานพร้อมอาหารเพื่อป้องกันอาการคลื่นไส้',
  },
  magnesium: {
    searchQuery: 'magnesium amino acid chelate',
    th: 'แมกนีเซียม คอมเพล็กซ์ (350 มก.)',
    en: 'Magnesium Complex (350mg)',
    type: 'เม็ด',
    dosage: '350',
    unit: 'mg',
    category: 'อาหารเสริม',
    indications_th: 'ช่วยผ่อนคลายกล้ามเนื้อ ป้องกันตะคริว บรรเทาอาการไมเกรน และช่วยให้นอนหลับสบายขึ้น',
    instructions_th: 'รับประทานวันละ 1 เม็ด ก่อนนอนหรือพร้อมมื้ออาหารเย็น',
    precautions_th: 'ผู้ป่วยโรคไตวายควรปรึกษาแพทย์ก่อนรับประทาน',
  },
  folic_acid: {
    searchQuery: 'folic acid vitamin b9',
    th: 'กรดโฟลิก บำรุงเลือด (5 มก.)',
    en: 'Folic Acid (5mg)',
    type: 'เม็ด',
    dosage: '5',
    unit: 'mg',
    category: 'อาหารเสริม',
    indications_th: 'บำรุงโลหิต ป้องกันภาวะโลหิตจาง และจำเป็นอย่างยิ่งสำหรับสตรีเตรียมตั้งครรภ์เพื่อป้องกันความพิการของทารก',
    instructions_th: 'รับประทานวันละ 1 เม็ด หลังอาหารเช้า',
    precautions_th: 'ควรรับประทานตามคำแนะนำของแพทย์หรือเภสัชกร',
  },
  ferrous_fumarate: {
    searchQuery: 'ferrous fumarate iron',
    th: 'ธาตุเหล็ก บำรุงโลหิต (200 มก.)',
    en: 'Ferrous Fumarate (Iron 200mg)',
    type: 'เม็ด',
    dosage: '200',
    unit: 'mg',
    category: 'อาหารเสริม',
    indications_th: 'เสริมสร้างเม็ดเลือดแดง รักษาและป้องกันภาวะโลหิตจางจากการขาดธาตุเหล็ก',
    instructions_th: 'รับประทานวันละ 1 เม็ด ก่อนอาหารหรือหลังอาหารทันทีหากมีอาการระคายเคืองกระเพาะ',
    precautions_th: 'อาจทำให้อุจจาระมีสีดำเข้มซึ่งเป็นภาวะปกติ ห้ามทานร่วมกับนม ชา หรือกาแฟ',
  },
  glucosamine_sulfate: {
    searchQuery: 'glucosamine sulfate',
    th: 'กลูโคซามีน ซัลเฟต (1500 มก.)',
    en: 'Glucosamine Sulfate (1500mg)',
    type: 'แคปซูล',
    dosage: '1500',
    unit: 'mg',
    category: 'อาหารเสริม',
    indications_th: 'บรรเทาอาการข้อเข่าเสื่อม ช่วยเสริมสร้างน้ำหล่อเลี้ยงข้อและกระดูกอ่อนผิวข้อ ลดเสียงกร๊อบแกร๊บในข้อต่อ',
    instructions_th: 'รับประทานวันละ 1 ครั้ง พร้อมหรือหลังอาหารทันที ต่อเนื่องอย่างน้อย 6-8 สัปดาห์',
    precautions_th: 'ผู้ที่แพ้อาหารทะเลเปลือกแข็ง (กุ้ง ปู) ควรระมัดระวัง',
  },

  // ---------------------------------------------------------------------------
  // 4. กลุ่มบำรุงผิวพรรณ ชะลอวัย และสายตา (Beauty, Anti-Aging & Eye Care)
  // ---------------------------------------------------------------------------
  centrum_silver: {
    searchQuery: 'centrum silver multivitamin',
    th: 'เซนทรัม ซิลเวอร์ (วิตามินและเกลือแร่รวมสำหรับผู้สูงวัย)',
    en: 'Centrum Silver 50+ Multivitamins',
    type: 'เม็ด',
    dosage: '1',
    unit: 'เม็ด',
    category: 'อาหารเสริม',
    indications_th: 'วิตามินและแร่ธาตุรวมสูตรเฉพาะสำหรับผู้มีอายุ 50 ปีขึ้นไป บำรุงสายตา หัวใจ สมอง และกระดูก',
    instructions_th: 'รับประทานวันละ 1 เม็ด พร้อมอาหารเช้า',
    precautions_th: 'ไม่ควรรับประทานร่วมกับผลิตภัณฑ์เสริมวิตามินรวมอื่นเพื่อป้องกันการได้รับวิตามินเกินขนาด',
  },
  blackmores_multivitamin: {
    searchQuery: 'blackmores multivitamin minerals',
    th: 'แบลคมอร์ส มัลติวิตามิน แอคทีฟ',
    en: 'Blackmores Multivitamin Active',
    type: 'เม็ด',
    dosage: '1',
    unit: 'เม็ด',
    category: 'อาหารเสริม',
    indications_th: 'วิตามินและเกลือแร่รวม 24 ชนิด พร้อมสารสกัดสมุนไพร ช่วยเสริมสร้างพลังงาน บำรุงร่างกายและระบบภูมิคุ้มกัน',
    instructions_th: 'รับประทานวันละ 1 เม็ด พร้อมมื้ออาหาร',
    precautions_th: 'ควรดื่มน้ำตามมากๆ และเก็บในที่แห้งและเย็น',
  },
  collagen_tripeptide: {
    searchQuery: 'collagen peptide tripeptide',
    th: 'คอลลาเจน ไตรเปปไทด์ (บำรุงผิวและข้อต่อ)',
    en: 'Collagen Tripeptide (1000mg)',
    type: 'เม็ด',
    dosage: '1000',
    unit: 'mg',
    category: 'อาหารเสริม',
    indications_th: 'เสริมสร้างความยืดหยุ่นและความชุ่มชื้นให้ผิวพรรณ ชะลอริ้วรอย บำรุงกระดูกอ่อนและข้อต่อให้เคลื่อนไหวสะดวก',
    instructions_th: 'รับประทานวันละ 1-2 เม็ด ก่อนนอนหรือขณะท้องว่าง พร้อมดื่มน้ำตามมากๆ',
    precautions_th: 'ผู้ที่แพ้ปลาทะเลหรืออาหารทะเลควรตรวจสอบแหล่งที่มาของคอลลาเจน',
  },
  amado_collagen: {
    searchQuery: 'amado collagen tablet',
    th: 'อมาโด้ คอลลาเจน (คอลลาเจนบริสุทธิ์ชนิดเม็ด)',
    en: 'Amado Pure Collagen Tablets',
    type: 'เม็ด',
    dosage: '1000',
    unit: 'mg',
    category: 'อาหารเสริม',
    indications_th: 'คอลลาเจนเปปไทด์เข้มข้น ฟื้นฟูสภาพผิว ชะลอวัย บำรุงข้อต่อ ผม เล็บ และกระดูก',
    instructions_th: 'รับประทานวันละ 1-2 เม็ด ก่อนนอนหรือตื่นนอนตอนเช้าขณะท้องว่าง',
    precautions_th: 'ผู้ที่แพ้ปลาทะเลควรหลีกเลี่ยงการรับประทาน',
  },
  glutathione: {
    searchQuery: 'l-glutathione reduced',
    th: 'แอล-กลูตาไธโอน (250 มก.)',
    en: 'L-Glutathione (250mg)',
    type: 'แคปซูล',
    dosage: '250',
    unit: 'mg',
    category: 'อาหารเสริม',
    indications_th: 'สารต้านอนุมูลอิสระประสิทธิภาพสูง ยับยั้งการสร้างเม็ดสีเมลานินสีคล้ำ บำรุงผิวให้กระจ่างใส และช่วยกำจัดสารพิษในตับ',
    instructions_th: 'รับประทานวันละ 1 แคปซูล ขณะท้องว่าง หรือพร้อมกับวิตามินซีเพื่อเสริมประสิทธิภาพ',
    precautions_th: 'สตรีมีครรภ์หรือให้นมบุตรไม่ควรรับประทาน',
  },
  astaxanthin: {
    searchQuery: 'astaxanthin',
    th: 'แอสตาแซนธิน (สารสกัดสาหร่ายสีแดง 6 มก.)',
    en: 'Astaxanthin Extract (6mg)',
    type: 'แคปซูล',
    dosage: '6',
    unit: 'mg',
    category: 'อาหารเสริม',
    indications_th: 'สารต้านอนุมูลอิสระประสิทธิภาพสูง ชะลอวัย ลดเลือนริ้วรอยลึก ฟื้นฟูกล้ามเนื้อจากการออกกำลังกาย และปกป้องผิวจากแสงแดด',
    instructions_th: 'รับประทานวันละ 1 แคปซูล พร้อมอาหารมื้อหลักที่มีไขมัน',
    precautions_th: 'สตรีมีครรภ์ควรปรึกษาแพทย์ก่อนรับประทาน',
  },
  grape_seed: {
    searchQuery: 'grape seed extract opc',
    th: 'สารสกัดจากเมล็ดองุ่น (60 มก.)',
    en: 'Grape Seed Extract (60mg)',
    type: 'แคปซูล',
    dosage: '60',
    unit: 'mg',
    category: 'อาหารเสริม',
    indications_th: 'อุดมด้วยสารโอพีซี (OPCs) ต้านอนุมูลอิสระ บำรุงผิวกระจ่างใส ลดความเสี่ยงเส้นเลือดขอด และเสริมความยืดหยุ่นของหลอดเลือด',
    instructions_th: 'รับประทานวันละ 1 แคปซูล พร้อมอาหารเช้า',
    precautions_th: 'ระวังการใช้ร่วมกับยาต้านการแข็งตัวของเลือด (เช่น Warfarin, Aspirin)',
  },
  lutein_zeaxanthin: {
    searchQuery: 'lutein zeaxanthin bilberry',
    th: 'ลูทีนและซีแซนทีน (บำรุงสายตา กรองแสงสีฟ้า)',
    en: 'Lutein & Zeaxanthin Eye Complex',
    type: 'แคปซูล',
    dosage: '10',
    unit: 'mg',
    category: 'อาหารเสริม',
    indications_th: 'ปกป้องจอประสาทตา กรองแสงสีฟ้าจากจอมือถือและคอมพิวเตอร์ ลดอาการตาแห้ง เมื่อยล้าสายตา และชะลอการเกิดต้อกระจก',
    instructions_th: 'รับประทานวันละ 1 แคปซูล หลังอาหารมื้อหลัก',
    precautions_th: 'หญิงตั้งครรภ์หรือให้นมบุตรควรปรึกษาแพทย์',
  },
  biotin: {
    searchQuery: 'biotin vitamin b7',
    th: 'ไบโอติน (บำรุงเส้นผมและเล็บ 5000 ไมโครกรัม)',
    en: 'Biotin (5000mcg)',
    type: 'แคปซูล',
    dosage: '5000',
    unit: 'mcg',
    category: 'อาหารเสริม',
    indications_th: 'เสริมสร้างความแข็งแรงของเคราตินในเส้นผม ลดปัญหาผมร่วง ผมบาง บำรุงเล็บไม่ให้เปราะฉีกง่าย',
    instructions_th: 'รับประทานวันละ 1 แคปซูล พร้อมอาหารมื้อเช้า',
    precautions_th: 'อาจรบกวนผลการตรวจระดับฮอร์โมนไทรอยด์ในเลือด ควรแจ้งแพทย์ก่อนตรวจเลือด',
  },
  royal_jelly: {
    searchQuery: 'royal jelly 1000mg',
    th: 'นมผึ้ง รอยัลเยลลี (1000 มก.)',
    en: 'Royal Jelly (1000mg)',
    type: 'แคปซูล',
    dosage: '1000',
    unit: 'mg',
    category: 'อาหารเสริม',
    indications_th: 'บำรุงร่างกาย ชะลอวัย ปรับสมดุลฮอร์โมน คลายความเครียด ช่วยให้นอนหลับลึก และฟื้นฟูผิวพรรณ',
    instructions_th: 'รับประทานวันละ 1 แคปซูล ก่อนนอนหรือก่อนอาหารเช้า',
    precautions_th: 'ห้ามใช้ในผู้ที่มีประวัติแพ้ผลิตภัณฑ์จากผึ้งหรือผู้ป่วยโรคหอบหืด',
  },
  spirulina: {
    searchQuery: 'spirulina algae 500mg',
    th: 'สาหร่ายสไปรูลิน่า (500 มก.)',
    en: 'Spirulina (500mg)',
    type: 'แคปซูล',
    dosage: '500',
    unit: 'mg',
    category: 'อาหารเสริม',
    indications_th: 'แหล่งโปรตีน คลอโรฟิลล์ และสารอาหารธรรมชาติ บำรุงสุขภาพ ฟื้นฟูร่างกายจากความอ่อนเพลีย ขับล้างสารพิษ',
    instructions_th: 'รับประทานครั้งละ 1-2 แคปซูล วันละ 2 ครั้ง ก่อนหรือพร้อมอาหาร',
    precautions_th: 'ผู้ป่วยโรคแพ้ภูมิตัวเอง (SLE) หรือผู้มีภาวะฟีนิลคีโตนูเรียควรปรึกษาแพทย์',
  },

  // ---------------------------------------------------------------------------
  // 5. กลุ่มสมุนไพรและระบบทางเดินอาหาร/การนอนหลับ (Herbs, Digestion & Sleep)
  // ---------------------------------------------------------------------------
  ginkgo_biloba: {
    searchQuery: 'ginkgo biloba extract',
    th: 'สารสกัดจากใบแปะก๊วย (40 มก.)',
    en: 'Ginkgo Biloba Extract (40mg)',
    type: 'เม็ด',
    dosage: '40',
    unit: 'mg',
    category: 'อาหารเสริม',
    indications_th: 'กระตุ้นการไหลเวียนโลหิตไปเลี้ยงสมอง เพิ่มสมาธิ ความจำ ลดอาการวิงเวียนศีรษะ บ้านหมุน และอาการชาตามปลายมือปลายเท้า',
    instructions_th: 'รับประทานครั้งละ 1 เม็ด วันละ 1-2 ครั้ง พร้อมหรือหลังอาหาร',
    precautions_th: 'ห้ามรับประทานร่วมกับยาต้านการแข็งตัวของเลือด (Warfarin, Aspirin, Clopidogrel) เพราะอาจเพิ่มความเสี่ยงเลือดออกผิดปกติ',
  },
  probiotics: {
    searchQuery: 'probiotics multi strain',
    th: 'โพรไบโอติกส์ (จุลินทรีย์มีชีวิตปรับสมดุลลำไส้)',
    en: 'Multi-Strain Probiotics Complex',
    type: 'แคปซูล',
    dosage: '1',
    unit: 'แคปซูล',
    category: 'อาหารเสริม',
    indications_th: 'ปรับสมดุลจุลินทรีย์ในลำไส้ ฟื้นฟูระบบขับถ่าย บรรเทาอาการลำไส้แปรปรวน (IBS) ท้องผูก ท้องเสีย และช่วยเสริมภูมิต้านทาน',
    instructions_th: 'รับประทานวันละ 1 แคปซูล ก่อนนอนหรือก่อนอาหาร 30 นาที พร้อมน้ำอุณหภูมิปกติ (ห้ามดื่มน้ำร้อน)',
    precautions_th: 'หากรับประทานยาปฏิชีวนะ (ยาฆ่าเชื้อ) ควรรอห่างกันอย่างน้อย 2-3 ชั่วโมง',
  },
  curcumin_extract: {
    searchQuery: 'curcumin extract turmeric',
    th: 'สารสกัดขมิ้นชัน (500 มก.)',
    en: 'Curcumin Extract (500mg)',
    type: 'แคปซูล',
    dosage: '500',
    unit: 'mg',
    category: 'อาหารเสริม',
    indications_th: 'ต้านการอักเสบ บรรเทาอาการท้องอืด ท้องเฟ้อ แน่น จุกเสียด บำรุงกระเพาะอาหาร และช่วยลดอาการปวดข้อเข่า',
    instructions_th: 'รับประทานครั้งละ 1 แคปซูล วันละ 2-3 ครั้ง หลังอาหาร',
    precautions_th: 'ห้ามใช้ในผู้ป่วยท่อน้ำดีอุดตัน หรือผู้ที่มีนิ่วในถุงน้ำดี',
  },
  fah_talai_jone: {
    searchQuery: 'andrographis paniculata extract',
    th: 'ฟ้าทะลายโจร สกัด (แคปซูล)',
    en: 'Andrographis Paniculata Extract Capsules',
    type: 'แคปซูล',
    dosage: '350',
    unit: 'mg',
    category: 'อาหารเสริม',
    indications_th: 'บรรเทาอาการหวัด เจ็บคอ ลดไข้ บรรเทาอาการไอ และเสริมสร้างภูมิคุ้มกันร่างกายตามศาสตร์สมุนไพรไทย',
    instructions_th: 'รับประทานครั้งละ 1-2 แคปซูล วันละ 3 ครั้ง หลังอาหารและก่อนนอน เมื่อเริ่มมีอาการ',
    precautions_th: 'ห้ามใช้ในสตรีมีครรภ์หรือให้นมบุตร ไม่ควรรับประทานติดต่อกันเกิน 5-7 วัน',
  },
  cordyceps: {
    searchQuery: 'cordyceps sinensis extract',
    th: 'สารสกัดถั่งเช่า (500 มก.)',
    en: 'Cordyceps Sinensis Extract (500mg)',
    type: 'แคปซูล',
    dosage: '500',
    unit: 'mg',
    category: 'อาหารเสริม',
    indications_th: 'บำรุงไต เสริมสมรรถภาพร่างกาย กระตุ้นระบบไหลเวียนโลหิต ลดความเหนื่อยล้า และเพิ่มภูมิคุ้มกัน',
    instructions_th: 'รับประทานวันละ 1-2 แคปซูล ก่อนอาหารเช้าหรือก่อนนอน',
    precautions_th: 'ผู้ป่วยที่รับประทานยาละลายลิ่มเลือดหรือยากดภูมิคุ้มกันควรปรึกษาแพทย์',
  },
  lingzhi: {
    searchQuery: 'reishi mushroom lingzhi extract',
    th: 'สารสกัดเห็ดหลินจือ (500 มก.)',
    en: 'Reishi Mushroom (Lingzhi) Extract (500mg)',
    type: 'แคปซูล',
    dosage: '500',
    unit: 'mg',
    category: 'อาหารเสริม',
    indications_th: 'บำรุงสุขภาพ ต้านอนุมูลอิสระ เสริมสร้างภูมิคุ้มกัน ควบคุมระดับความดันโลหิตและน้ำตาลในเลือด',
    instructions_th: 'รับประทานครั้งละ 1 แคปซูล วันละ 1-2 ครั้ง ก่อนอาหาร',
    precautions_th: 'ระวังการใช้ร่วมกับยาต้านการแข็งตัวของเลือดและยาลดความดัน',
  },
  melatonin: {
    searchQuery: 'melatonin sleep aid',
    th: 'เมลาโทนิน (ช่วยการนอนหลับ 5 มก.)',
    en: 'Melatonin (5mg)',
    type: 'เม็ด',
    dosage: '5',
    unit: 'mg',
    category: 'อาหารเสริม',
    indications_th: 'ปรับสมดุลนาฬิกาชีวิต บรรเทาอาการนอนไม่หลับ หลับยาก หรืออาการเจ็ทแล็ก (Jet Lag) จากการเดินทาง',
    instructions_th: 'รับประทานครั้งละ 1 เม็ด ก่อนนอน 30-60 นาที',
    precautions_th: 'ทำให้เกิดอาการง่วงซึม ห้ามขับขี่ยานพาหนะหรือทำงานกับเครื่องจักรกลอันตรายหลังรับประทาน',
  },

  // ---------------------------------------------------------------------------
  // 6. กลุ่มอาหารเสริมชนิดยาน้ำ (Liquid Supplements)
  // ---------------------------------------------------------------------------
  vitamin_c_liquid: {
    searchQuery: 'vitamin c drops syrup kids',
    th: 'วิตามินซี ไซรัปสำหรับเด็ก (ยาน้ำ)',
    en: 'Kids Vitamin C Liquid Drops',
    type: 'ยาน้ำ',
    dosage: '50',
    unit: 'mg',
    category: 'อาหารเสริม',
    indications_th: 'วิตามินซีชนิดน้ำสำหรับเด็ก รสส้ม ป้องกันภาวะขาดวิตามินซี เสริมภูมิคุ้มกัน และป้องกันหวัดในเด็กเล็ก',
    instructions_th: 'รับประทานวันละ 1 ช้อนชา (5 มล.) หลังอาหารเช้า',
    precautions_th: 'เขย่าขวดก่อนรินยา และควรให้เด็กบ้วนปากหรือแปรงฟันหลังทานเพื่อป้องกันฟันผุ',
  },
  cod_liver_oil_liquid: {
    searchQuery: 'scotts emulsion cod liver oil',
    th: 'สก๊อต อีมัลชั่น น้ำมันตับปลา (ยาน้ำ)',
    en: "Scott's Emulsion Cod Liver Oil",
    type: 'ยาน้ำ',
    dosage: '15',
    unit: 'ml',
    category: 'อาหารเสริม',
    indications_th: 'น้ำมันตับปลาชนิดน้ำ ผสมวิตามินเอ ดี และแคลเซียม บำรุงกระดูก ฟัน สายตา และช่วยการเจริญเติบโตของร่างกาย',
    instructions_th: 'รับประทานครั้งละ 1 ช้อนโต๊ะ (15 มล.) วันละ 1 ครั้ง หลังอาหาร',
    precautions_th: 'ห้ามรับประทานเกินขนาดที่กำหนด เพราะวิตามินเอและดีเป็นวิตามินสะสมในร่างกาย',
  },
  seven_seas_liquid: {
    searchQuery: 'seven seas multivitamin syrup cod liver oil',
    th: 'เซเว่น ซีส์ (ยาน้ำวิตามินรวมผสมน้ำมันตับปลา)',
    en: 'Seven Seas Multivitamin Syrup with Cod Liver Oil',
    type: 'ยาน้ำ',
    dosage: '10',
    unit: 'ml',
    category: 'อาหารเสริม',
    indications_th: 'บำรุงร่างกายเด็ก ช่วยเจริญอาหาร เสริมภูมิคุ้มกัน บำรุงกระดูก ฟัน และสายตาด้วยวิตามินรวม 8 ชนิด',
    instructions_th: 'รับประทานวันละ 1-2 ช้อนชา (5-10 มล.) วันละ 1 ครั้ง พร้อมมื้ออาหาร',
    precautions_th: 'ห้ามใช้ในเด็กที่แพ้อาหารทะเลหรือน้ำมันตับปลา',
  },
  brands_essence_liquid: {
    searchQuery: 'brands essence of chicken',
    th: 'แบรนด์ ซุปไก่สกัด (สูตรต้นตำรับ)',
    en: "Brand's Essence of Chicken",
    type: 'ยาน้ำ',
    dosage: '70',
    unit: 'ml',
    category: 'อาหารเสริม',
    indications_th: 'อุดมด้วยโปรตีนเปปไทด์ ย่อยง่าย ช่วยฟื้นฟูร่างกายจากความเหนื่อยล้า บำรุงสมอง และเพิ่มความกระปรี้กระเปร่า',
    instructions_th: 'ดื่มวันละ 1 ขวด ดื่มได้ทั้งอุ่นหรือแช่เย็น แนะนำดื่มตอนเช้าหรือระหว่างวัน',
    precautions_th: 'ผู้ป่วยโรคเกาต์หรือโรคไตควรปรึกษาแพทย์ก่อนรับประทาน',
  },
  brands_birds_nest_liquid: {
    searchQuery: 'brands birds nest beverage',
    th: 'แบรนด์ รังนกแท้ (สูตรน้ำตาลกรวด)',
    en: "Brand's Bird's Nest Beverage",
    type: 'ยาน้ำ',
    dosage: '70',
    unit: 'ml',
    category: 'อาหารเสริม',
    indications_th: 'บำรุงสุขภาพ บำรุงระบบทางเดินหายใจ ชะลอวัย อุดมด้วยกรดไซอาลิก (NANA) และสารอาหารจากรังนกแท้',
    instructions_th: 'ดื่มวันละ 1 ขวด แช่เย็นก่อนดื่มเพื่อความสดชื่น สามารถดื่มก่อนนอนหรือขณะท้องว่าง',
    precautions_th: 'ผู้ป่วยโรคเบาหวานควรเลือกสูตรไม่มีน้ำตาล (ไซลิทอล)',
  },
};

/**
 * Clean up text for fuzzy matching
 */
function cleanText(txt = '') {
  return String(txt)
    .toLowerCase()
    .replace(/[\(\)\-\_\/\+\,\.\']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Find matched supplement preset from local dictionary
 */
export function findSupplementPreset(query) {
  if (!query) return null;
  const q = String(query).trim().toLowerCase();
  if (POPULAR_SUPPLEMENT_MAP[q]) return POPULAR_SUPPLEMENT_MAP[q];

  const cleanQ = cleanText(q);

  for (const [key, val] of Object.entries(POPULAR_SUPPLEMENT_MAP)) {
    const cleanKey = cleanText(key);
    const cleanEn = cleanText(val.en);
    const cleanTh = cleanText(val.th);
    const cleanSearch = cleanText(val.searchQuery);

    if (
      q === key ||
      cleanQ === cleanKey ||
      cleanQ === cleanEn ||
      cleanQ === cleanTh ||
      cleanQ === cleanSearch ||
      cleanQ.includes(cleanKey) ||
      cleanKey.includes(cleanQ) ||
      cleanQ.includes(cleanEn) ||
      cleanEn.includes(cleanQ) ||
      cleanTh.includes(cleanQ) ||
      cleanQ.includes(cleanTh) ||
      cleanSearch.includes(cleanQ)
    ) {
      return val;
    }
  }
  return null;
}

/**
 * Get supplement autocomplete suggestions
 */
export function getSupplementSuggestions(query = '') {
  const q = String(query).trim().toLowerCase();
  const cleanQ = cleanText(q);

  const allEntries = Object.entries(POPULAR_SUPPLEMENT_MAP).map(([key, val]) => ({
    key,
    en: val.en,
    th: val.th,
    dosage: val.dosage,
    unit: val.unit,
    type: val.type,
    category: 'อาหารเสริม',
  }));

  if (!q) {
    return allEntries;
  }

  return allEntries.filter(item => {
    const itemEn = cleanText(item.en);
    const itemTh = cleanText(item.th);
    const itemKey = cleanText(item.key);

    return (
      itemEn.includes(cleanQ) ||
      itemTh.includes(cleanQ) ||
      itemKey.includes(cleanQ) ||
      cleanQ.includes(itemKey)
    );
  });
}

/**
 * Fetch supplement data: First checks local popular Thai supplement dictionary,
 * then falls back to NIH RxNav / Open Food Facts API
 */
export async function fetchSupplementFromApi(supplementName) {
  const rawQuery = String(supplementName || '').trim();
  if (!rawQuery) throw new Error('กรุณากรอกชื่ออาหารเสริมก่อนค้นหาข้อมูล');

  // 1. Check local curated Thai supplement database
  const matchedPreset = findSupplementPreset(rawQuery);
  if (matchedPreset) {
    return {
      name_en: matchedPreset.en,
      name_th: matchedPreset.th,
      type: matchedPreset.type,
      dosage: matchedPreset.dosage,
      unit: matchedPreset.unit,
      category: 'อาหารเสริม',
      indications: matchedPreset.indications_th,
      instructions: matchedPreset.instructions_th,
      precautions: matchedPreset.precautions_th,
      source: 'ฐานข้อมูลผลิตภัณฑ์เสริมอาหารยอดนิยมในไทย (อย. / Thai FDA)',
    };
  }

  // 2. Query NIH RxNav API (Free, high reliability, covers vitamins, minerals & supplements)
  try {
    const rxUrl = `https://rxnav.nlm.nih.gov/REST/approximateTerm.json?term=${encodeURIComponent(rawQuery)}&maxEntries=5`;
    const rxRes = await fetch(rxUrl);
    if (rxRes.ok) {
      const rxData = await rxRes.json();
      const candidates = rxData.approximateGroup?.candidate || [];
      const namedCandidate = candidates.find(c => c.name && isNaN(c.name)) || candidates[0];

      if (namedCandidate && namedCandidate.rxcui) {
        const standardName = namedCandidate.name || rawQuery;
        const capitalizedName = standardName.charAt(0).toUpperCase() + standardName.slice(1);

        // Fetch related concepts to detect dosage form
        let detectedType = 'แคปซูล';
        let detectedUnit = 'mg';
        let detectedDosage = '500';

        try {
          const relatedUrl = `https://rxnav.nlm.nih.gov/REST/rxcui/${namedCandidate.rxcui}/related.json?tty=DF`;
          const relRes = await fetch(relatedUrl);
          if (relRes.ok) {
            const relData = await relRes.json();
            const dfList = relData.relatedGroup?.conceptGroup?.[0]?.conceptProperties || [];
            const dfText = dfList.map(d => d.name || '').join(' ').toLowerCase();

            if (dfText.includes('liquid') || dfText.includes('solution') || dfText.includes('syrup') || dfText.includes('drop')) {
              detectedType = 'ยาน้ำ';
              detectedUnit = 'ml';
              detectedDosage = '15';
            } else if (dfText.includes('tablet') || dfText.includes('pill') || dfText.includes('chewable')) {
              detectedType = 'เม็ด';
              detectedUnit = 'mg';
              detectedDosage = '500';
            } else {
              detectedType = 'แคปซูล';
              detectedUnit = 'mg';
              detectedDosage = '500';
            }
          }
        } catch (e) {
          // fallback to capsule
        }

        return {
          name_en: capitalizedName,
          name_th: `${capitalizedName} (ผลิตภัณฑ์เสริมอาหาร)`,
          type: detectedType,
          dosage: detectedDosage,
          unit: detectedUnit,
          category: 'อาหารเสริม',
          indications: `ผลิตภัณฑ์เสริมอาหาร ${capitalizedName} ช่วยเสริมสร้างโภชนาการ สารอาหารจำเป็น และบำรุงสุขภาพทั่วไปของร่างกาย`,
          instructions: 'รับประทานวันละ 1 ครั้ง พร้อมมื้ออาหารหรือหลังอาหารทันที พร้อมดื่มน้ำสะอาดตามมากๆ',
          precautions: 'อาหารเสริมไม่มีผลในการป้องกันหรือรักษาโรค ควรกินอาหารหลากหลายครบ 5 หมู่ในสัดส่วนที่เหมาะสม สตรีมีครรภ์ควรปรึกษาแพทย์ก่อนใช้',
          source: 'NIH RxNorm (U.S. National Library of Medicine)',
        };
      }
    }
  } catch (err) {
    console.warn('RxNav supplement query error:', err);
  }

  // 3. Fallback to Open Food Facts API if accessible
  try {
    const searchUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(rawQuery)}&search_simple=1&action=process&json=1&page_size=3`;
    const res = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'MedManager-SupplementService/1.0',
      },
    });

    if (res.ok) {
      const json = await res.json();
      if (json.products && json.products.length > 0) {
        const product = json.products.find(p => p.product_name || p.product_name_en || p.product_name_th) || json.products[0];
        const productName = product.product_name || product.product_name_en || product.product_name_th || rawQuery;
        const brand = product.brands || '';
        const fullName = brand ? `${brand} ${productName}` : productName;

        const fullDesc = `${product.categories || ''} ${product.quantity || ''} ${product.serving_size || ''} ${productName}`.toLowerCase();

        let detectedType = 'เม็ด';
        let detectedUnit = 'mg';
        let detectedDosage = '500';

        if (fullDesc.includes('capsule') || fullDesc.includes('softgel') || fullDesc.includes('แคปซูล')) {
          detectedType = 'แคปซูล';
          detectedUnit = 'mg';
          detectedDosage = '500';
        } else if (fullDesc.includes('liquid') || fullDesc.includes('syrup') || fullDesc.includes('drop') || fullDesc.includes('ยาน้ำ') || fullDesc.includes('ml')) {
          detectedType = 'ยาน้ำ';
          detectedUnit = 'ml';
          detectedDosage = '15';
        }

        return {
          name_en: fullName,
          name_th: `${fullName} (ผลิตภัณฑ์เสริมอาหาร)`,
          type: detectedType,
          dosage: detectedDosage,
          unit: detectedUnit,
          category: 'อาหารเสริม',
          indications: `ผลิตภัณฑ์เสริมอาหาร ${fullName} ช่วยเสริมสร้างโภชนาการ สารอาหาร และบำรุงสุขภาพทั่วไป`,
          instructions: 'รับประทานวันละ 1 ครั้ง พร้อมมื้ออาหารหรือหลังอาหารตามที่ระบุบนฉลากผลิตภัณฑ์ พร้อมดื่มน้ำตามมากๆ',
          precautions: 'อาหารเสริมไม่มีผลในการป้องกันหรือรักษาโรค ควรกินอาหารหลากหลายครบ 5 หมู่ในสัดส่วนที่เหมาะสม สตรีมีครรภ์ควรปรึกษาแพทย์ก่อนใช้',
          source: 'Open Food Facts (Worldwide Dietary Supplements Database)',
        };
      }
    }
  } catch (err) {
    // Open Food Facts failed, continue
  }

  throw new Error(`ไม่พบข้อมูลอาหารเสริมสำหรับ "${rawQuery}" ในระบบ กรุณาตรวจสอบตัวสะกด เช่น วิตามินซี, น้ำมันปลา, Vitamin C, Fish Oil, Collagen, Zinc, Melatonin`);
}

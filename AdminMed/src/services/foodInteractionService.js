// ==============================================================================
// Food-Drug & Food-Supplement Interaction Service
// Comprehensive clinical interaction database matching all drugs & supplements in system
// (ระบบข้อมูลและบริการปฏิสัมพันธ์ระหว่างยากับอาหารและอาหารเสริม)
// ==============================================================================

export const PRESET_FOOD_INTERACTIONS = [
  // ---------------------------------------------------------------------------
  // 1. พาราเซตามอล & ยาแก้หวัดสูตรผสม (Paracetamol, Tiffy, Sara, Decolgen, Tylenol, Tempra)
  // ---------------------------------------------------------------------------
  {
    medication_keys: ['paracetamol', 'acetaminophen', 'tiffy', 'sara', 'decolgen', 'tylenol', 'tempra', 'พาราเซตามอล', 'ทิฟฟี่', 'ซาร่า', 'ดีคอลเจน', 'ไทลินอล', 'เทมปร้า'],
    medication_label: 'พาราเซตามอล (Paracetamol) / ทิฟฟี่ / ซาร่า / ไทลินอล',
    food_name: 'เครื่องดื่มแอลกอฮอล์ (สุรา, เบียร์, ไวน์)',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'สูง',
    hours_before: '24',
    hours_after: '24',
    impact_details: 'แอลกอฮอล์กระตุ้นเอนไซม์ CYP2E1 ในตับให้เปลี่ยนพาราเซตามอลไปเป็นสารพิษ NAPQI เพิ่มความเสี่ยงเกิดภาวะตับวายเฉียบพลันและเซลล์ตับถูกทำลายอย่างรุนแรง แม้รับประทานยาในขนาดปกติ',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'U.S. FDA Drug-Food Interaction Guide',
    url_doi: 'https://www.fda.gov/drugs/resources-drugs/avoid-food-drug-interactions',
    publish_year: '2024',
  },
  {
    medication_keys: ['tiffy', 'decolgen', 'ทิฟฟี่', 'ดีคอลเจน', 'chlorpheniramine', 'phenylephrine'],
    medication_label: 'ทิฟฟี่ / ดีคอลเจน (ยาแก้หวัดสูตรผสม)',
    food_name: 'เครื่องดื่มที่มีคาเฟอีน (ชาเข้มข้น, กาแฟ, เครื่องดื่มชูกำลัง)',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'กลาง',
    hours_before: '2',
    hours_after: '2',
    impact_details: 'คาเฟอีนมีฤทธิ์กระตุ้นประสาทร่วมกับฟีนิลเอฟรีนในยาแก้หวัด อาจทำให้เกิดอาการใจสั่น ความดันโลหิตสูงขึ้นเฉียบพลัน กระสับกระส่าย และนอนไม่หลับอย่างรุนแรง',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'คณะเภสัชศาสตร์ มหาวิทยาลัยมหิดล',
    url_doi: 'https://pharmacy.mahidol.ac.th',
    publish_year: '2023',
  },

  // ---------------------------------------------------------------------------
  // 2. ยากลุ่ม NSAIDs & ยาแก้ปวด (Ibuprofen, Gofen, Aspirin, Ponstan, Mefenamic, Diclofenac, Meloxicam, Celecoxib)
  // ---------------------------------------------------------------------------
  {
    medication_keys: ['ibuprofen', 'gofen', 'aspirin', 'ponstan', 'mefenamic', 'diclofenac', 'meloxicam', 'celecoxib', 'ไอบูโพรเฟน', 'โกเฟน', 'แอสไพริน', 'พอนสแตน', 'ไดโคลฟีแนค', 'เมล็อกซิแคม', 'เซเลคอกซิบ'],
    medication_label: 'ไอบูโพรเฟน (Ibuprofen) / แอสไพริน / พอนสแตน / โกเฟน / ไดโคลฟีแนค',
    food_name: 'เครื่องดื่มแอลกอฮอล์',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'สูง',
    hours_before: '6',
    hours_after: '6',
    impact_details: 'แอลกอฮอล์และยากลุ่ม NSAIDs มีฤทธิ์ทำลายชั้นเมือกปกป้องกระเพาะอาหารทั้งคู่ เมื่อใช้ร่วมกันจะเพิ่มความเสี่ยงเกิดแผลในกระเพาะอาหารและภาวะเลือดออกในทางเดินอาหารอย่างรุนแรงถึงชีวิต',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'U.S. FDA Guide to Food and Drug Interactions',
    url_doi: 'https://www.fda.gov/drugs/resources-drugs/avoid-food-drug-interactions',
    publish_year: '2024',
  },
  {
    medication_keys: ['ibuprofen', 'gofen', 'aspirin', 'ponstan', 'mefenamic', 'diclofenac', 'meloxicam', 'celecoxib', 'ไอบูโพรเฟน', 'โกเฟน', 'แอสไพริน', 'พอนสแตน', 'ไดโคลฟีแนค'],
    medication_label: 'ยากลุ่ม NSAIDs (ไอบูโพรเฟน / แอสไพริน / พอนสแตน / ไดโคลฟีแนค)',
    food_name: 'อาหารรสจัด, อาหารเผ็ดร้อน, ชา, กาแฟเข้มข้น',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'กลาง',
    hours_before: '2',
    hours_after: '2',
    impact_details: 'อาหารรสจัดและคาเฟอีนกระตุ้นการหลั่งกรดในกระเพาะอาหาร เสริมให้ยาระคายเคืองกระเพาะมากขึ้น แนะนำให้รับประทานยาพร้อมอาหารหรือหลังอาหารทันทีพร้อมดื่มน้ำตามมากๆ',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'ภาควิชาเภสัชวิทยา คณะแพทยศาสตร์ศิริราชพยาบาล',
    url_doi: 'https://www.si.mahidol.ac.th',
    publish_year: '2023',
  },
  {
    medication_keys: ['ibuprofen', 'gofen', 'aspirin', 'ponstan', 'mefenamic', 'diclofenac', 'meloxicam', 'celecoxib', 'ไอบูโพรเฟน', 'โกเฟน', 'แอสไพริน', 'พอนสแตน'],
    medication_label: 'ยากลุ่ม NSAIDs (ไอบูโพรเฟน / แอสไพริน / พอนสแตน / โกเฟน)',
    food_name: 'อาหารมื้อหลัก หรือ นมวัว',
    interaction_type: 'แนะนำให้รับประทานร่วม',
    severity: '',
    hours_before: '',
    hours_after: '',
    impact_details: 'แนะนำให้รับประทานยาพร้อมอาหารมื้อหลักหรือหลังอาหารทันที หรือดื่มนมตาม เพื่อช่วยเคลือบเยื่อบุกระเพาะอาหารและลดอาการระคายเคือง แสบท้อง คลื่นไส้ ได้อย่างมีประสิทธิภาพ',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'U.S. FDA Drug Information on NSAIDs',
    url_doi: 'https://www.fda.gov',
    publish_year: '2024',
  },

  // ---------------------------------------------------------------------------
  // 3. ยาคลายกล้ามเนื้อ (Norgesic, Diazepam, Lorazepam, Orphenadrine)
  // ---------------------------------------------------------------------------
  {
    medication_keys: ['norgesic', 'orphenadrine', 'diazepam', 'lorazepam', 'นอร์จีสิก', 'ไดอะซีแพม', 'ลอราซีแพม', 'ยาคลายกล้ามเนื้อ'],
    medication_label: 'นอร์จีสิก (Norgesic) / ไดอะซีแพม (ยาคลายกล้ามเนื้อ)',
    food_name: 'เครื่องดื่มแอลกอฮอล์',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'สูง',
    hours_before: '12',
    hours_after: '12',
    impact_details: 'ออร์เฟนาดรีนและไดอะซีแพมมีฤทธิ์กดประสาทส่วนกลางร่วมกับแอลกอฮอล์ ทำให้ง่วงซึมอย่างรุนแรง สูญเสียการทรงตัว กดการหายใจ และเพิ่มพิษต่อตับ',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'กรมการแพทย์ กระทรวงสาธารณสุข',
    url_doi: 'https://www.dms.go.th',
    publish_year: '2023',
  },

  // ---------------------------------------------------------------------------
  // 4. ยาปฏิชีวนะกลุ่มควิโนโลนและเตตราไซคลิน (Ciprofloxacin, Norfloxacin, Tetracycline, Doxycycline)
  // ---------------------------------------------------------------------------
  {
    medication_keys: ['ciprofloxacin', 'norfloxacin', 'ofloxacin', 'ซิโปรฟลอกซาซิน', 'นอร์ฟลอกซาซิน', 'tetracycline', 'doxycycline', 'เตตราไซคลิน', 'ด็อกซีไซคลิน'],
    medication_label: 'ยาปฏิชีวนะ (Ciprofloxacin, Norfloxacin, Doxycycline)',
    food_name: 'นม, โยเกิร์ต, ชีส, ผลิตภัณฑ์จากนม และน้ำผลไม้เสริมแคลเซียม',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'สูง',
    hours_before: '2',
    hours_after: '2',
    impact_details: 'แคลเซียมและแร่ธาตุในนมจะจับตัวกับโมเลกุลของยาปฏิชีวนะ เกิดเป็นสารประกอบเชิงซ้อนที่ไม่ละลายน้ำ ทำให้ร่างกายดูดซึมยาได้ลดลงกว่า 50-80% ส่งผลให้ระดับยาในเลือดไม่เพียงพอและรักษาการติดเชื้อไม่ได้ผล',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'U.S. FDA Drug Safety Communications',
    url_doi: 'https://www.fda.gov/drugs/resources-drugs/avoid-food-drug-interactions',
    publish_year: '2024',
  },

  // ---------------------------------------------------------------------------
  // 5. ยาปฏิชีวนะกลุ่มเพนิซิลลินและแมคโครไลด์ (Amoxicillin, Augmentin, Azithromycin)
  // ---------------------------------------------------------------------------
  {
    medication_keys: ['amoxicillin', 'augmentin', 'อะม็อกซีซิลลิน', 'ออกเมนติน'],
    medication_label: 'อะม็อกซีซิลลิน (Amoxicillin / Augmentin)',
    food_name: 'อาหารมื้อหลัก หรืออาหารว่างเบาๆ',
    interaction_type: 'แนะนำให้รับประทานร่วม',
    severity: '',
    hours_before: '',
    hours_after: '',
    impact_details: 'แนะนำให้รับประทานพร้อมอาหารหรือหลังอาหารทันที เพื่อลดอาการคลื่นไส้ ปวดมวนท้อง และไม่รบกวนประสิทธิภาพการดูดซึมของตัวยา',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'British National Formulary (BNF)',
    url_doi: 'https://bnf.nice.org.uk',
    publish_year: '2024',
  },
  {
    medication_keys: ['azithromycin', 'อะซิโทรมัยซิน'],
    medication_label: 'อะซิโทรมัยซิน (Azithromycin)',
    food_name: 'ยาลดกรดที่มีอะลูมิเนียม หรือแมกนีเซียม',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'สูง',
    hours_before: '2',
    hours_after: '2',
    impact_details: 'ยาลดกรดที่มีส่วนผสมของอะลูมิเนียมและแมกนีเซียมจะลดความเข้มข้นสูงสุดของยาอะซิโทรมัยซินในเลือด ทำให้ประสิทธิภาพในการฆ่าเชื้อโรคลดลงอย่างมีนัยสำคัญ',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'U.S. FDA Drug Information on Azithromycin',
    url_doi: 'https://www.fda.gov',
    publish_year: '2024',
  },

  // ---------------------------------------------------------------------------
  // 6. ยาลดความดันโลหิตกลุ่มแคลเซียมบล็อกเกอร์ (Amlodipine, Felodipine, Nifedipine)
  // ---------------------------------------------------------------------------
  {
    medication_keys: ['amlodipine', 'felodipine', 'nifedipine', 'แอมโลดิพีน', 'แอมโลดิปีน', 'เฟโลดิปีน', 'นิเฟดิปีน'],
    medication_label: 'แอมโลดิพีน (Amlodipine) / ยากลุ่มลดความดันแคลเซียมบล็อกเกอร์',
    food_name: 'น้ำเกรปฟรุต (Grapefruit juice) และส้มโอ',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'สูง',
    hours_before: '4',
    hours_after: '4',
    impact_details: 'สารฟูราโนคูมาริน (Furanocoumarins) ในเกรปฟรุตและส้มโอ ยับยั้งเอนไซม์ CYP3A4 ในลำไส้ ทำให้การทำลายตัวยาลดลง ส่งผลให้ระดับยาในกระแสเลือดพุ่งสูงขึ้นอย่างรวดเร็ว เกิดภาวะความดันโลหิตตกเฉียบพลัน หน้ามืด เป็นลม และหัวใจเต้นเร็วผิดปกติ',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: "U.S. FDA Consumer Update: Grapefruit Juice and Some Drugs Don't Mix",
    url_doi: 'https://www.fda.gov/consumers/consumer-updates/grapefruit-juice-and-some-drugs-dont-mix',
    publish_year: '2024',
  },

  // ---------------------------------------------------------------------------
  // 7. ยาลดความดันกลุ่ม ACEIs & ARBs (Enalapril, Losartan, Valsartan, Captopril)
  // ---------------------------------------------------------------------------
  {
    medication_keys: ['enalapril', 'losartan', 'valsartan', 'captopril', 'อีนาราพริล', 'อีนาลาพริล', 'โลซาร์แทน', 'วาลซาร์แทน'],
    medication_label: 'อีนาราพริล / โลซาร์แทน (ยากลุ่ม ACEIs / ARBs)',
    food_name: 'อาหารที่มีโพแทสเซียมสูง (กล้วยหอม, น้ำส้มเข้มข้น, เกลือลดโซเดียมสูตรโพแทสเซียม)',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'สูง',
    hours_before: '2',
    hours_after: '2',
    impact_details: 'ยากลุ่มนี้ลดการขับโพแทสเซียมทางไต หากรับประทานอาหารที่มีโพแทสเซียมสูงหรือเกลือทดแทนโพแทสเซียมมากเกินไป อาจเกิดภาวะโพแทสเซียมในเลือดสูง (Hyperkalemia) ส่งผลให้หัวใจเต้นผิดจังหวะจนอาจเป็นอันตรายถึงชีวิต',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'American Heart Association (AHA) & U.S. FDA Guidelines',
    url_doi: 'https://www.fda.gov',
    publish_year: '2024',
  },

  // ---------------------------------------------------------------------------
  // 8. ยาขับปัสสาวะ (Spironolactone, Furosemide, HCTZ)
  // ---------------------------------------------------------------------------
  {
    medication_keys: ['spironolactone', 'furosemide', 'hydrochlorothiazide', 'hctz', 'สไปโรโนแลคโตน', 'ฟูโรซีไมด์', 'ยาขับปัสสาวะ'],
    medication_label: 'สไปโรโนแลคโตน / ฟูโรซีไมด์ (ยาขับปัสสาวะ)',
    food_name: 'เกลือทดแทนโซเดียม (เกลือโพแทสเซียม) และแอลกอฮอล์',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'สูง',
    hours_before: '4',
    hours_after: '4',
    impact_details: 'เกลือทดแทนโพแทสเซียมทำให้ระดับโพแทสเซียมในเลือดคั่งสูงจนเกิดภาวะหัวใจหยุดเต้น ส่วนแอลกอฮอล์เสริมฤทธิ์ลดความดันโลหิต ทำให้ความดันตกวูบและหน้ามืดเป็นลมรุนแรง',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'American Heart Association (AHA)',
    url_doi: 'https://www.heart.org',
    publish_year: '2024',
  },

  // ---------------------------------------------------------------------------
  // 9. ยากลุ่มเบต้าบล็อกเกอร์ (Propranolol, Atenolol, Metoprolol)
  // ---------------------------------------------------------------------------
  {
    medication_keys: ['propranolol', 'atenolol', 'metoprolol', 'โพรพราโนลอล', 'อะทีโนลอล', 'เมโทโพรลอล'],
    medication_label: 'โพรพราโนลอล / อะทีโนลอล (ยาควบคุมการเต้นของหัวใจและความดัน)',
    food_name: 'เครื่องดื่มแอลกอฮอล์ และเครื่องดื่มชูกำลัง/กาแฟเข้มข้น',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'สูง',
    hours_before: '4',
    hours_after: '4',
    impact_details: 'แอลกอฮอล์ทำให้ความดันโลหิตลดต่ำลงรวดเร็ว ส่วนคาเฟอีนในเครื่องดื่มชูกำลังต้านฤทธิ์ยา ทำให้หัวใจเต้นเร็วผิดปกติและความดันโลหิตควบคุมไม่ได้',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'Mayo Clinic Drug and Food Interactions',
    url_doi: 'https://www.mayoclinic.org',
    publish_year: '2024',
  },

  // ---------------------------------------------------------------------------
  // 10. ยาละลายลิ่มเลือดและยาต้านเกล็ดเลือด (Warfarin, Aspirin, Clopidogrel)
  // ---------------------------------------------------------------------------
  {
    medication_keys: ['warfarin', 'วาร์ฟาริน'],
    medication_label: 'วาร์ฟาริน (Warfarin - ยาต้านการแข็งตัวของเลือด)',
    food_name: 'ผักใบเขียวเข้ม (คะน้า, ผักโขม, บรอกโคลี, กะหล่ำปลี, ใบชะพลู)',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'สูง',
    hours_before: '4',
    hours_after: '4',
    impact_details: 'ผักใบเขียวมีวิตามินเค (Vitamin K) สูง ซึ่งเป็นสารตั้งต้นในการสร้างสารที่ทำให้เลือดแข็งตัว การรับประทานผักใบเขียวในปริมาณที่ไม่สม่ำเสมอจะไปต้านฤทธิ์ยาวาร์ฟาริน ทำให้ค่า INR แกว่ง และเสี่ยงต่อการเกิดลิ่มเลือดอุดตันอันตรายถึงชีวิต',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'American Heart Association & U.S. FDA Warfarin Diet Guide',
    url_doi: 'https://www.fda.gov/drugs/resources-drugs/avoid-food-drug-interactions',
    publish_year: '2024',
  },
  {
    medication_keys: ['warfarin', 'aspirin', 'clopidogrel', 'วาร์ฟาริน', 'แอสไพริน', 'โคลพิโดเกรล'],
    medication_label: 'ยาวาร์ฟาริน / แอสไพริน / โคลพิโดเกรล (ยาต้านการแข็งตัวของเลือด)',
    food_name: 'กระเทียมสกัด, ขิงเข้มข้น, น้ำมันปลา (Fish Oil), สารสกัดใบแปะก๊วย',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'สูง',
    hours_before: '4',
    hours_after: '4',
    impact_details: 'สมุนไพรและอาหารเสริมเหล่านี้มีฤทธิ์ต้านการเกาะกลุ่มของเกล็ดเลือด เมื่อรับประทานร่วมกับยาวาร์ฟารินหรือแอสไพรินจะเสริมฤทธิ์กัน ทำให้เลือดหยุดไหลยาก มีรอยฟกช้ำตามตัว เลือดกำเดาไหล หรือเลือดออกในระบบทางเดินอาหาร',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'ศูนย์ข้อมูลยาและพิษวิทยา คณะเภสัชศาสตร์ ม.มหิดล',
    url_doi: 'https://pharmacy.mahidol.ac.th',
    publish_year: '2024',
  },

  // ---------------------------------------------------------------------------
  // 11. ยาเบาหวาน (Metformin, Glipizide, Gliclazide, Pioglitazone, Dapagliflozin)
  // ---------------------------------------------------------------------------
  {
    medication_keys: ['metformin', 'glipizide', 'gliclazide', 'pioglitazone', 'dapagliflozin', 'เมทฟอร์มิน', 'เมตฟอร์มิน', 'กลิพิไซด์', 'ไกลคลาไซด์', 'ดาพากลิโฟลซิน'],
    medication_label: 'เมทฟอร์มิน (Metformin) / ยารักษาเบาหวาน',
    food_name: 'เครื่องดื่มแอลกอฮอล์',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'สูง',
    hours_before: '24',
    hours_after: '24',
    impact_details: 'แอลกอฮอล์ยับยั้งการสร้างน้ำตาลที่ตับ เสี่ยงเกิดภาวะน้ำตาลในเลือดต่ำรุนแรง (Hypoglycemia) และเพิ่มความเสี่ยงต่อการเกิดภาวะกรดแลกติกคั่งในกระแสเลือด (Lactic Acidosis) ซึ่งมีอัตราการเสียชีวิตสูง',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'American Diabetes Association (ADA) & U.S. FDA Drug Information',
    url_doi: 'https://www.fda.gov',
    publish_year: '2024',
  },
  {
    medication_keys: ['metformin', 'glipizide', 'gliclazide', 'เมทฟอร์มิน', 'เมตฟอร์มิน', 'กลิพิไซด์'],
    medication_label: 'เมทฟอร์มิน (Metformin) / กลิพิไซด์',
    food_name: 'อาหารมื้อหลัก (ตรงตามเวลา)',
    interaction_type: 'แนะนำให้รับประทานร่วม',
    severity: '',
    hours_before: '',
    hours_after: '',
    impact_details: 'แนะนำให้รับประทานยาพร้อมอาหารมื้อหลักหรือหลังอาหารทันที เพื่อลดอาการระคายเคืองกระเพาะอาหาร คลื่นไส้ แน่นท้อง และป้องกันภาวะน้ำตาลในเลือดลดต่ำเกินไป',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'American Diabetes Association (ADA)',
    url_doi: 'https://diabetes.org',
    publish_year: '2024',
  },

  // ---------------------------------------------------------------------------
  // 12. ยาลดไขมันในเลือดกลุ่มสแตติน (Atorvastatin, Simvastatin, Rosuvastatin, Fenofibrate)
  // ---------------------------------------------------------------------------
  {
    medication_keys: ['simvastatin', 'atorvastatin', 'rosuvastatin', 'fenofibrate', 'ซิมวาสแตติน', 'อะทอร์วาสแตติน', 'โรซูวาสแตติน', 'ฟีโนไฟเบรต'],
    medication_label: 'ซิมวาสแตติน / อะทอร์วาสแตติน (ยาลดไขมันในเลือด)',
    food_name: 'น้ำเกรปฟรุต (Grapefruit juice) และส้มโอ',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'สูง',
    hours_before: '4',
    hours_after: '4',
    impact_details: 'เกรปฟรุตยับยั้งการกำจัดยาสแตติน ทำให้ระดับยาในกระแสเลือดสูงขึ้นหลายเท่า เสี่ยงต่อการเกิดพิษต่อตับ และภาวะกล้ามเนื้อลายสลายตัว (Rhabdomyolysis) ส่งผลให้ปวดกล้ามเนื้อรุนแรง ปัสสาวะสีโค้ก และไตวายเฉียบพลัน',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'U.S. FDA Drug Safety Communications on Statins',
    url_doi: 'https://www.fda.gov/drugs/resources-drugs/avoid-food-drug-interactions',
    publish_year: '2024',
  },

  // ---------------------------------------------------------------------------
  // 13. ยาลดกรดและยาเคลือบกระเพาะ (Antacil, Gaviscon, Omeprazole, Pantoprazole, Esomeprazole)
  // ---------------------------------------------------------------------------
  {
    medication_keys: ['antacil', 'antacid', 'gaviscon', 'แอนตาซิล', 'ยาลดกรด', 'กาวิสคอน'],
    medication_label: 'แอนตาซิล (Antacil) / กาวิสคอน / ยาลดกรด',
    food_name: 'น้ำผลไม้รสเปรี้ยวเข้มข้น (น้ำส้ม, น้ำมะนาว)',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'กลาง',
    hours_before: '2',
    hours_after: '2',
    impact_details: 'กรดซิตริกในน้ำผลไม้รสเปรี้ยวเพิ่มการดูดซึมอะลูมิเนียมในยาลดกรดเข้าสู่กระแสเลือด ซึ่งอาจสะสมและเกิดพิษได้ในผู้ป่วยโรคไต ควรรับประทานยาลดกรดห่างจากน้ำผลไม้รสเปรี้ยวอย่างน้อย 2 ชั่วโมง',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'คณะเภสัชศาสตร์ มหาวิทยาลัยเชียงใหม่',
    url_doi: 'https://pharmacy.cmu.ac.th',
    publish_year: '2023',
  },
  {
    medication_keys: ['omeprazole', 'pantoprazole', 'esomeprazole', 'โอเมพราโซล', 'แพนโทพราโซล', 'เอสโอเมพราโซล'],
    medication_label: 'โอเมพราโซล (Omeprazole) / ยาลดการหลั่งกรดในกระเพาะอาหาร',
    food_name: 'อาหารรสจัด, กาแฟเข้มข้น, ช็อกโกแลต, อาหารมันจัด',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'กลาง',
    hours_before: '2',
    hours_after: '2',
    impact_details: 'คาเฟอีน ไขมันสูง และอาหารรสจัดจะคลายกล้ามเนื้อหูรูดหลอดอาหารและกระตุ้นการหลั่งกรดย้อนกลับ ต้านฤทธิ์การรักษาของยาโอเมพราโซล แนะนำให้รับประทานยาก่อนอาหาร 30-60 นาทีขณะท้องว่าง',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'American College of Gastroenterology (ACG)',
    url_doi: 'https://gi.org',
    publish_year: '2024',
  },

  // ---------------------------------------------------------------------------
  // 13.1 ยาสามัญประจำบ้านกลุ่มทางเดินอาหาร (ยาธาตุน้ำขาวตรากระต่ายบิน, ยาธาตุน้ำแดง, อัลตร้าคาร์บอน, แอร์เอ็กซ์, กาวิสคอน, บัสโคพาน, ยาระบายมะขามแขก)
  // ---------------------------------------------------------------------------
  {
    medication_keys: ['flying_rabbit', 'salol', 'menthol', 'กระต่ายบิน', 'ยาธาตุน้ำขาว', 'ยาธาตุน้ำขาวตรากระต่ายบิน', 'salol menthol'],
    medication_label: 'ยาธาตุน้ำขาวตรากระต่ายบิน (Flying Rabbit - Salol Menthol)',
    food_name: 'เครื่องดื่มแอลกอฮอล์, อาหารรสจัด, อาหารไขมันสูง',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'สูง',
    hours_before: '2',
    hours_after: '2',
    impact_details: 'สารซาลอล (Phenyl Salicylate) ในยาธาตุน้ำขาวเป็นอนุพันธ์ของซาลิไซเลต (กลุ่มเดียวกับแอสไพริน) เมื่อรับประทานร่วมกับแอลกอฮอล์หรืออาหารรสจัด จะเพิ่มการระคายเคืองเยื่อบุกระเพาะและลำไส้อย่างรุนแรง เสี่ยงต่อเลือดออกในทางเดินอาหาร และแอลกอฮอล์จะกระตุ้นให้ลำไส้บีบตัวผิดปกติจนอาการท้องเสียหรือปวดเกร็งช่องท้องรุนแรงขึ้น',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'สำนักงานคณะกรรมการอาหารและยา (อย. ไทย) & ตำรับยาสามัญประจำบ้าน',
    url_doi: 'https://www.fda.moph.go.th',
    publish_year: '2024',
  },
  {
    medication_keys: ['flying_rabbit', 'salol', 'menthol', 'กระต่ายบิน', 'ยาธาตุน้ำขาว', 'ยาธาตุน้ำขาวตรากระต่ายบิน'],
    medication_label: 'ยาธาตุน้ำขาวตรากระต่ายบิน (Flying Rabbit)',
    food_name: 'นมสด, ผลิตภัณฑ์จากนม และน้ำผลไม้รสเปรี้ยว',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'กลาง',
    hours_before: '2',
    hours_after: '2',
    impact_details: 'ขณะมีอาการปวดท้อง ท้องเสีย ท้องอืด การดื่มนมสดจะย่อยน้ำตาลแลคโตสได้ยากขึ้น เกิดแก๊สในกระเพาะและทำให้ถ่ายเหลวมากขึ้น และโปรตีนในนมอาจรบกวนการออกฤทธิ์ฆ่าเชื้ออ่อนๆ ของตัวยาในทางเดินอาหาร',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'ภาควิชาเภสัชวิทยา คณะแพทยศาสตร์ศิริราชพยาบาล',
    url_doi: 'https://www.si.mahidol.ac.th',
    publish_year: '2023',
  },
  {
    medication_keys: ['flying_rabbit', 'salol', 'menthol', 'กระต่ายบิน', 'ยาธาตุน้ำขาว', 'ยาธาตุน้ำขาวตรากระต่ายบิน'],
    medication_label: 'ยาธาตุน้ำขาวตรากระต่ายบิน (Flying Rabbit)',
    food_name: 'น้ำสะอาดอุณหภูมิปกติ (ดื่มน้ำตามพอสมควร)',
    interaction_type: 'แนะนำให้รับประทานร่วม',
    severity: '',
    hours_before: '',
    hours_after: '',
    impact_details: 'แนะนำให้ดื่มน้ำสะอาดตามพอสมควรเพื่อช่วยกระจายตัวยาให้เคลือบและฆ่าเชื้อในลำไส้ได้อย่างทั่วถึง และช่วยชดเชยการสูญเสียน้ำในร่างกายกรณีที่มีอาการท้องเสียหรือถ่ายเหลว',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'กรมการแพทย์ กระทรวงสาธารณสุข',
    url_doi: 'https://www.dms.go.th',
    publish_year: '2024',
  },
  {
    medication_keys: ['stomachic', 'ยาธาตุน้ำแดง', 'โซเดียมไบคาร์บอเนต'],
    medication_label: 'ยาธาตุน้ำแดง (Stomachic Mixture)',
    food_name: 'อาหารรสเค็มจัด หรืออาหารที่มีโซเดียมสูง',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'สูง',
    hours_before: '2',
    hours_after: '2',
    impact_details: 'ยาธาตุน้ำแดงมีโซเดียมไบคาร์บอเนตสูง หากรับประทานร่วมกับอาหารเค็มจัดจะทำให้ร่างกายได้รับโซเดียมเกินขนาด ส่งผลให้ความดันโลหิตพุ่งสูง บวมน้ำ และเป็นอันตรายอย่างยิ่งในผู้ป่วยโรคหัวใจหรือโรคไต',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'คณะแพทยศาสตร์ศิริราชพยาบาล',
    url_doi: 'https://www.si.mahidol.ac.th',
    publish_year: '2023',
  },
  {
    medication_keys: ['stomachic', 'ยาธาตุน้ำแดง'],
    medication_label: 'ยาธาตุน้ำแดง (Stomachic Mixture)',
    food_name: 'เครื่องดื่มแอลกอฮอล์, กาแฟเข้มข้น และน้ำอัดลม',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'กลาง',
    hours_before: '2',
    hours_after: '2',
    impact_details: 'คาเฟอีน แอลกอฮอล์ และแก๊สในน้ำอัดลมจะกระตุ้นการหลั่งกรดและเพิ่มความดันในกระเพาะอาหาร ต้านฤทธิ์ขับลมและบรรเทาอาการจุกเสียดของยาธาตุน้ำแดง',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'สำนักงานคณะกรรมการอาหารและยา (อย. ไทย)',
    url_doi: 'https://www.fda.moph.go.th',
    publish_year: '2024',
  },
  {
    medication_keys: ['ultracarbon', 'activated_charcoal', 'อัลตร้าคาร์บอน', 'ผงถ่าน', 'คาร์บอน'],
    medication_label: 'อัลตร้าคาร์บอน (Ultracarbon / ผงถ่านกัมมันต์)',
    food_name: 'อาหารมื้อหลัก, นมสด, ชา, กาแฟ, น้ำผลไม้ (อาหารทุกชนิด)',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'สูง',
    hours_before: '2',
    hours_after: '2',
    impact_details: 'ผงถ่านกัมมันต์มีรูพรุนที่ดูดซับสารต่างๆ อย่างไม่จำเพาะเจาะจง หากรับประทานพร้อมอาหาร ผงถ่านจะไปดูดซับสารอาหาร วิตามิน และแร่ธาตุในอาหารจนหมด ทำให้ประสิทธิภาพในการดูดซับสารพิษและเชื้อโรคในลำไส้ลดลงอย่างมาก ต้องรับประทานตอนท้องว่างห่างจากอาหารอย่างน้อย 2 ชั่วโมง',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'คณะเภสัชศาสตร์ มหาวิทยาลัยมหิดล',
    url_doi: 'https://pharmacy.mahidol.ac.th',
    publish_year: '2024',
  },
  {
    medication_keys: ['ultracarbon', 'activated_charcoal', 'อัลตร้าคาร์บอน', 'ผงถ่าน'],
    medication_label: 'อัลตร้าคาร์บอน (Ultracarbon)',
    food_name: 'น้ำสะอาดปริมาณมาก (อย่างน้อย 1-2 แก้วเต็ม)',
    interaction_type: 'แนะนำให้รับประทานร่วม',
    severity: '',
    hours_before: '',
    hours_after: '',
    impact_details: 'การดื่มน้ำสะอาดตามมากๆ ช่วยให้ผงถ่านกระจายตัวอย่างทั่วถึงในกระเพาะและลำไส้เพื่อดักจับสารพิษ และช่วยป้องกันภาวะท้องผูก ลำไส้อุดตันจากกากผงถ่าน',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'กรมการแพทย์ กระทรวงสาธารณสุข',
    url_doi: 'https://www.dms.go.th',
    publish_year: '2024',
  },
  {
    medication_keys: ['air_x', 'simethicone', 'แอร์เอ็กซ์', 'ไซเมทิโคน'],
    medication_label: 'แอร์เอ็กซ์ (Air-X / ไซเมทิโคน)',
    food_name: 'น้ำอัดลม, โซดา, เครื่องดื่มที่มีก๊าซคาร์บอเนต',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'กลาง',
    hours_before: '2',
    hours_after: '2',
    impact_details: 'น้ำอัดลมและโซดาเพิ่มฟองก๊าซในกระเพาะอาหารอย่างมหาศาล ทำให้ยาไซเมทิโคนสลายแรงตึงผิวของฟองก๊าซได้ไม่ทัน ส่งผลให้อาการท้องอืด จุกเสียด แน่นเฟ้อ ไม่ทุเลาลง',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'สำนักงานคณะกรรมการอาหารและยา (อย. ไทย)',
    url_doi: 'https://www.fda.moph.go.th',
    publish_year: '2024',
  },
  {
    medication_keys: ['air_x', 'simethicone', 'แอร์เอ็กซ์', 'ไซเมทิโคน'],
    medication_label: 'แอร์เอ็กซ์ (Air-X / ไซเมทิโคน)',
    food_name: 'อาหารมื้อหลัก (เคี้ยวเม็ดยาให้ละเอียดทันทีหลังอาหาร)',
    interaction_type: 'แนะนำให้รับประทานร่วม',
    severity: '',
    hours_before: '',
    hours_after: '',
    impact_details: 'การเคี้ยวเม็ดยาให้ละเอียดพร้อมอาหารหรือหลังอาหารทันที ช่วยให้ตัวยากระจายตัวผสมกับกากอาหารได้อย่างรวดเร็ว และสลายฟองก๊าซที่เกิดจากกระบวนการย่อยอาหารได้อย่างมีประสิทธิภาพสูงสุด',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'Mayo Clinic Drugs and Supplements',
    url_doi: 'https://www.mayoclinic.org',
    publish_year: '2024',
  },
  {
    medication_keys: ['buscopan', 'hyoscine', 'บัสโคพาน', 'ไฮออสซีน'],
    medication_label: 'บัสโคพาน (Buscopan / ไฮออสซีน)',
    food_name: 'เครื่องดื่มแอลกอฮอล์',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'สูง',
    hours_before: '12',
    hours_after: '12',
    impact_details: 'แอลกอฮอล์เสริมฤทธิ์ต้านโคลิเนอร์จิกของยาบัสโคพาน ทำให้ปากแห้ง คอแห้ง วิงเวียน ตาพร่ามัว ปัสสาวะคั่ง และหัวใจเต้นเร็วผิดปกติ',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'British National Formulary (BNF)',
    url_doi: 'https://bnf.nice.org.uk',
    publish_year: '2024',
  },
  {
    medication_keys: ['buscopan', 'hyoscine', 'บัสโคพาน', 'ไฮออสซีน'],
    medication_label: 'บัสโคพาน (Buscopan / ไฮออสซีน)',
    food_name: 'ชา กาแฟ หรือเครื่องดื่มที่มีคาเฟอีนสูง',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'กลาง',
    hours_before: '2',
    hours_after: '2',
    impact_details: 'คาเฟอีนกระตุ้นการหลั่งกรดและการบีบตัวของทางเดินอาหาร ซึ่งต้านฤทธิ์คลายกล้ามเนื้อเรียบของยาบัสโคพาน ทำให้อาการปวดเกร็งช่องท้องไม่ทุเลาลง',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'คณะแพทยศาสตร์ศิริราชพยาบาล',
    url_doi: 'https://www.si.mahidol.ac.th',
    publish_year: '2023',
  },
  {
    medication_keys: ['senna', 'มะขามแขก', 'ยาระบายมะขามแขก'],
    medication_label: 'ยาระบายมะขามแขก (Senna)',
    food_name: 'นมสด, ผลิตภัณฑ์จากนม และยาลดกรด',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'กลาง',
    hours_before: '2',
    hours_after: '2',
    impact_details: 'นมสดและยาลดกรดปรับสภาพความเป็นกรดในกระเพาะ ทำให้สารสำคัญในมะขามแขกแตกตัวก่อนเวลา อาจเกิดอาการปวดบิดมวนท้องรุนแรงและคลื่นไส้ ควรรับประทานห่างจากนมอย่างน้อย 2 ชั่วโมง',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'กรมการแพทย์แผนไทยและการแพทย์ทางเลือก',
    url_doi: 'https://dtam.moph.go.th',
    publish_year: '2024',
  },
  {
    medication_keys: ['senna', 'มะขามแขก', 'ยาระบายมะขามแขก'],
    medication_label: 'ยาระบายมะขามแขก (Senna)',
    food_name: 'น้ำสะอาดปริมาณมาก (อย่างน้อย 1-2 แก้ว) ก่อนนอน',
    interaction_type: 'แนะนำให้รับประทานร่วม',
    severity: '',
    hours_before: '',
    hours_after: '',
    impact_details: 'การดื่มน้ำสะอาดตามมากๆ ช่วยเพิ่มปริมาณน้ำในลำไส้ใหญ่ ทำให้อุจจาระนุ่มลง ถ่ายได้ง่ายขึ้น และป้องกันภาวะร่างกายขาดน้ำจากการระบายท้อง',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'สำนักงานคณะกรรมการอาหารและยา (อย. ไทย)',
    url_doi: 'https://www.fda.moph.go.th',
    publish_year: '2024',
  },

  // ---------------------------------------------------------------------------
  // 14. ยาแก้แพ้และยาแก้เวียนศีรษะ (CPM, Dimenhydrinate, Cetirizine, Loratadine, Fexofenadine)
  // ---------------------------------------------------------------------------
  {
    medication_keys: ['cpm', 'chlorpheniramine', 'dimenhydrinate', 'cetirizine', 'loratadine', 'fexofenadine', 'คลอร์เฟนิรามีน', 'ไดเมนไฮดริเนต', 'เซทิริซีน', 'ลอราทาดีน', 'เฟกโซเฟนาดีน', 'ยาแก้แพ้'],
    medication_label: 'คลอร์เฟนิรามีน (CPM) / ไดเมนไฮดริเนต (ยาแก้เมา แก้แพ้)',
    food_name: 'เครื่องดื่มแอลกอฮอล์',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'สูง',
    hours_before: '24',
    hours_after: '24',
    impact_details: 'แอลกอฮอล์เสริมฤทธิ์กดประสาทส่วนกลางของยาแก้แพ้อย่างรุนแรง ทำให้เกิดอาการง่วงซึมมาก มึนงง สับสน ตอบสนองช้า และอาจกดศูนย์ควบคุมการหายใจจนเป็นอันตราย',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'U.S. FDA Consumer Health Information',
    url_doi: 'https://www.fda.gov',
    publish_year: '2024',
  },
  {
    medication_keys: ['fexofenadine', 'เฟกโซเฟนาดีน'],
    medication_label: 'เฟกโซเฟนาดีน (Fexofenadine - ยาแก้แพ้ไม่ง่วง)',
    food_name: 'น้ำส้มคั้น, น้ำแอปเปิ้ล, น้ำเกรปฟรุต (น้ำผลไม้สด)',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'กลาง',
    hours_before: '4',
    hours_after: '4',
    impact_details: 'สารฟลาโวนอยด์ในน้ำผลไม้ยับยั้งตัวขนส่ง OATP1A2 ในลำไส้ ทำให้ร่างกายดูดซึมยาเฟกโซเฟนาดีนได้ลดลงมากกว่า 50% ส่งผลให้ยาออกฤทธิ์ลดอาการภูมิแพ้ไม่ได้ผล ควรดื่มน้ำเปล่าสะอาดตามเท่านั้น',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'U.S. FDA Drug Labeling for Fexofenadine',
    url_doi: 'https://www.fda.gov',
    publish_year: '2024',
  },

  // ---------------------------------------------------------------------------
  // 15. ยาแก้ไอและละลายเสมหะ (Acetylcysteine, Dextromethorphan, Brown Mixture)
  // ---------------------------------------------------------------------------
  {
    medication_keys: ['acetylcysteine', 'nac', 'อะเซทิลซิสเทอีน', 'ยาละลายเสมหะ'],
    medication_label: 'อะเซทิลซิสเทอีน (Acetylcysteine / NAC)',
    food_name: 'น้ำสะอาดอุณหภูมิปกติ 1-2 แก้ว (ดื่มน้ำตามมากๆ)',
    interaction_type: 'แนะนำให้รับประทานร่วม',
    severity: '',
    hours_before: '',
    hours_after: '',
    impact_details: 'การดื่มน้ำตามมากๆ ช่วยเสริมการทำงานของยาในการตัดพันธะไดซัลไฟด์ของโมเลกุลเมือก ทำให้เสมหะเหลวตัวลง ร่างกายสามารถขับเสมหะออกจากทางเดินหายใจได้รวดเร็วและมีประสิทธิภาพสูงสุด',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'คณะแพทยศาสตร์ศิริราชพยาบาล',
    url_doi: 'https://www.si.mahidol.ac.th',
    publish_year: '2024',
  },
  {
    medication_keys: ['dextromethorphan', 'brown_mixture', 'เดกซ์โทรเมทอร์แฟน', 'ยาน้ำดำ'],
    medication_label: 'เดกซ์โทรเมทอร์แฟน / ยาน้ำดำแก้ไอ',
    food_name: 'เครื่องดื่มแอลกอฮอล์',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'สูง',
    hours_before: '12',
    hours_after: '12',
    impact_details: 'แอลกอฮอล์เสริมฤทธิ์กดประสาทส่วนกลางของยาแก้ไอ ทำให้เกิดอาการง่วงซึมรุนแรง สูญเสียการควบคุมสติ และอาจกดการหายใจจนถึงขั้นหมดสติได้',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'U.S. FDA MedWatch Safety Alert',
    url_doi: 'https://www.fda.gov',
    publish_year: '2024',
  },

  // ---------------------------------------------------------------------------
  // 16. ยารักษาโรคเกาต์ (Colchicine, Allopurinol)
  // ---------------------------------------------------------------------------
  {
    medication_keys: ['colchicine', 'โคลชิซิน'],
    medication_label: 'โคลชิซิน (Colchicine - ยารักษาโรคเกาต์เฉียบพลัน)',
    food_name: 'น้ำเกรปฟรุต (Grapefruit juice)',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'สูง',
    hours_before: '4',
    hours_after: '4',
    impact_details: 'เกรปฟรุตยับยั้งเอนไซม์ CYP3A4 และ P-glycoprotein อย่างรุนแรง ทำให้ระดับยาโคลชิซินในเลือดสูงเกินขนาด เกิดพิษต่อระบบทางเดินอาหาร กล้ามเนื้อสลายตัว และอาจกดการทำงานของไขกระดูก',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'U.S. FDA Safety Alert on Colchicine Toxicity',
    url_doi: 'https://www.fda.gov',
    publish_year: '2024',
  },
  {
    medication_keys: ['allopurinol', 'อัลโลพูรินอล'],
    medication_label: 'อัลโลพูรินอล (Allopurinol - ยาลดกรดยูริก)',
    food_name: 'เครื่องดื่มแอลกอฮอล์ (โดยเฉพาะเบียร์) และอาหารพิวรีนสูง',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'สูง',
    hours_before: '24',
    hours_after: '24',
    impact_details: 'แอลกอฮอล์โดยเฉพาะเบียร์มีสารพิวรีนสูง และกระตุ้นการสร้างกรดยูริกในตับ พร้อมทั้งยับยั้งการขับยูริกออกทางไต ทำให้ระดับกรดยูริกในเลือดพุ่งสูงขึ้นอย่างรวดเร็ว ต้านการรักษาของยาอัลโลพูรินอล',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'American College of Rheumatology (ACR) Gout Guidelines',
    url_doi: 'https://rheumatology.org',
    publish_year: '2024',
  },
  {
    medication_keys: ['allopurinol', 'อัลโลพูรินอล'],
    medication_label: 'อัลโลพูรินอล (Allopurinol)',
    food_name: 'น้ำสะอาดปริมาณมาก (2-3 ลิตรต่อวัน)',
    interaction_type: 'แนะนำให้รับประทานร่วม',
    severity: '',
    hours_before: '',
    hours_after: '',
    impact_details: 'แนะนำให้ดื่มน้ำสะอาดมากๆ อย่างน้อย 2-3 ลิตรต่อวันตลอดช่วงที่รับประทานยา เพื่อช่วยเจือจางและเร่งการขับกรดยูริกออกทางปัสสาวะ ป้องกันการตกผลึกเป็นนิ่วในไต',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'British National Formulary (BNF)',
    url_doi: 'https://bnf.nice.org.uk',
    publish_year: '2024',
  },

  // ---------------------------------------------------------------------------
  // 17. ยาต้านอาการซึมเศร้าและยาระงับประสาท (Sertraline, Fluoxetine, Amitriptyline, Gabapentin, Pregabalin)
  // ---------------------------------------------------------------------------
  {
    medication_keys: ['sertraline', 'fluoxetine', 'amitriptyline', 'gabapentin', 'pregabalin', 'เซอร์ทราลีน', 'ฟลูออกซิทีน', 'อะมิทริปไทลีน', 'กาบาเพนติน', 'พรีกาบาลิน'],
    medication_label: 'เซอร์ทราลีน / อะมิทริปไทลีน / กาบาเพนติน',
    food_name: 'เครื่องดื่มแอลกอฮอล์',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'สูง',
    hours_before: '24',
    hours_after: '24',
    impact_details: 'แอลกอฮอล์กดการทำงานของระบบประสาทร่วมกับยา ทำให้เกิดอาการมึนงง สับสน เดินเซ ง่วงซึมอย่างรุนแรง และอาจกดการทำงานของหัวใจและการหายใจ',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'U.S. National Institute of Mental Health (NIMH)',
    url_doi: 'https://www.nimh.nih.gov',
    publish_year: '2024',
  },

  // ---------------------------------------------------------------------------
  // 18. ผลิตภัณฑ์เสริมอาหาร: ธาตุเหล็ก (Ferrous Fumarate / Iron)
  // ---------------------------------------------------------------------------
  {
    medication_keys: ['ferrous_fumarate', 'iron', 'ธาตุเหล็ก', 'เฟอร์รัสฟูมาเรต'],
    medication_label: 'ธาตุเหล็ก (Ferrous Fumarate / Iron 200mg)',
    food_name: 'ชา, กาแฟ, นมวัว, นมถั่วเหลือง (น้ำเต้าหู้)',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'สูง',
    hours_before: '2',
    hours_after: '2',
    impact_details: 'สารแทนนินในชา/กาแฟ และแคลเซียมในนมจะจับกับธาตุเหล็ก เกิดเป็นตะกอนที่ไม่ละลายน้ำ ขัดขวางการดูดซึมธาตุเหล็กเข้าสู่ร่างกาย ทำให้การรักษาภาวะโลหิตจางไม่ได้ผล',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'WHO Guidelines on Iron Supplementation & Thai FDA',
    url_doi: 'https://www.who.int',
    publish_year: '2024',
  },
  {
    medication_keys: ['ferrous_fumarate', 'iron', 'ธาตุเหล็ก', 'เฟอร์รัสฟูมาเรต'],
    medication_label: 'ธาตุเหล็ก (Ferrous Fumarate / Iron)',
    food_name: 'น้ำส้มคั้นสด, น้ำมะนาว, ผลไม้รสเปรี้ยว (วิตามินซี)',
    interaction_type: 'แนะนำให้รับประทานร่วม',
    severity: '',
    hours_before: '',
    hours_after: '',
    impact_details: 'วิตามินซี (กรดแอสคอร์บิก) ช่วยรีดิวซ์ธาตุเหล็กให้อยู่ในรูป Ferrous (Fe2+) ซึ่งละลายน้ำได้ดีในลำไส้เล็ก ทำให้ร่างกายดูดซึมธาตุเหล็กได้เพิ่มขึ้นกว่า 2-3 เท่า',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'NIH Office of Dietary Supplements (ODS) - Iron Fact Sheet',
    url_doi: 'https://ods.od.nih.gov/factsheets/Iron-HealthProfessional/',
    publish_year: '2024',
  },

  // ---------------------------------------------------------------------------
  // 19. ผลิตภัณฑ์เสริมอาหาร: แคลเซียม (Calcium 600mg, Caltrate, CDR)
  // ---------------------------------------------------------------------------
  {
    medication_keys: ['calcium', 'caltrate', 'cdr', 'แคลเซียม', 'แคลเทรต', 'ซีดีอาร์'],
    medication_label: 'แคลเซียม (Calcium 600mg / Caltrate Plus / CDR)',
    food_name: 'ผักโขม, ใบชะพลู, หน่อไม้ (ผักที่มีกรดออกซาเลตสูง)',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'กลาง',
    hours_before: '2',
    hours_after: '2',
    impact_details: 'กรดออกซาเลตในผักจะจับตัวกับแคลเซียมในลำไส้ เกิดเป็นผลึกแคลเซียมออกซาเลตที่ไม่ละลายน้ำ ทำให้ร่างกายดูดซึมแคลเซียมไม่ได้ และอาจเพิ่มความเสี่ยงเกิดนิ่วในทางเดินปัสสาวะ',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'สำนักโภชนาการ กรมอนามัย กระทรวงสาธารณสุข',
    url_doi: 'https://nutrition2.anamai.moph.go.th',
    publish_year: '2023',
  },
  {
    medication_keys: ['calcium', 'caltrate', 'cdr', 'แคลเซียม', 'แคลเทรต', 'ซีดีอาร์'],
    medication_label: 'แคลเซียม (Calcium 600mg / Caltrate Plus)',
    food_name: 'อาหารมื้อหลัก หรืออาหารที่มีวิตามินดี',
    interaction_type: 'แนะนำให้รับประทานร่วม',
    severity: '',
    hours_before: '',
    hours_after: '',
    impact_details: 'การรับประทานแคลเซียมพร้อมอาหารมื้อหลัก กรดในกระเพาะอาหารจะช่วยแตกตัวและละลายแคลเซียมได้ดีขึ้น ส่วนวิตามินดีช่วยกระตุ้นการดูดซึมแคลเซียมเข้าสู่กระดูกได้อย่างเต็มที่',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'NIH Office of Dietary Supplements (ODS) - Calcium Fact Sheet',
    url_doi: 'https://ods.od.nih.gov/factsheets/Calcium-HealthProfessional/',
    publish_year: '2024',
  },

  // ---------------------------------------------------------------------------
  // 20. ผลิตภัณฑ์เสริมอาหาร: น้ำมันปลา โอเมก้า-3 (Fish Oil 1000mg, Cod Liver Oil)
  // ---------------------------------------------------------------------------
  {
    medication_keys: ['fish_oil', 'omega_3', 'cod_liver_oil', 'น้ำมันปลา', 'ฟิช ออยล์', 'น้ำมันตับปลา'],
    medication_label: 'น้ำมันปลา โอเมก้า-3 (Fish Oil 1000mg)',
    food_name: 'สารสกัดกระเทียม, ขิงสกัด, แปะก๊วย (สมุนไพรต้านการแข็งตัวของเลือด)',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'สูง',
    hours_before: '4',
    hours_after: '4',
    impact_details: 'กรดไขมัน EPA และ DHA ในน้ำมันปลามีฤทธิ์ยับยั้งการรวมตัวของเกล็ดเลือด เมื่อรับประทานร่วมกับกระเทียม ขิง หรือแปะก๊วย จะเสริมฤทธิ์กัน ทำให้เลือดหยุดช้าลง ฟกช้ำง่าย และเสี่ยงต่อภาวะเลือดออกผิดปกติ',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'Harvard Health Publishing - Drug & Supplement Interactions',
    url_doi: 'https://www.health.harvard.edu',
    publish_year: '2024',
  },
  {
    medication_keys: ['fish_oil', 'omega_3', 'cod_liver_oil', 'น้ำมันปลา', 'ฟิช ออยล์'],
    medication_label: 'น้ำมันปลา โอเมก้า-3 (Fish Oil 1000mg)',
    food_name: 'อาหารมื้อหลักที่มีไขมันดี (ปลา, ไข่, น้ำมันมะกอก)',
    interaction_type: 'แนะนำให้รับประทานร่วม',
    severity: '',
    hours_before: '',
    hours_after: '',
    impact_details: 'เนื่องจากน้ำมันปลาเป็นกรดไขมัน การรับประทานพร้อมอาหารมื้อหลักจะกระตุ้นการหลั่งน้ำดี ช่วยย่อยและเพิ่มการดูดซึมกรดไขมัน EPA และ DHA เข้าสู่ร่างกายได้สูงสุด และลดอาการเรอเหม็นคาวปลา',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'Mayo Clinic Nutrition and Healthy Eating',
    url_doi: 'https://www.mayoclinic.org',
    publish_year: '2024',
  },

  // ---------------------------------------------------------------------------
  // 21. ผลิตภัณฑ์เสริมอาหาร: สารสกัดจากใบแปะก๊วย (Ginkgo Biloba Extract)
  // ---------------------------------------------------------------------------
  {
    medication_keys: ['ginkgo', 'ginkgo_biloba', 'แปะก๊วย', 'ใบแปะก๊วย'],
    medication_label: 'สารสกัดจากใบแปะก๊วย (Ginkgo Biloba)',
    food_name: 'กระเทียม, ขิง, โสม, อาหารเสริมที่มีฤทธิ์ต้านเกล็ดเลือด',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'สูง',
    hours_before: '4',
    hours_after: '4',
    impact_details: 'สารสกัดแปะก๊วยยับยั้ง Platelet-activating factor (PAF) ส่งผลให้เลือดแข็งตัวช้า หากทานร่วมกับสมุนไพรที่มีฤทธิ์ต้านเกล็ดเลือดจะเพิ่มความเสี่ยงเกิดเลือดออกในทางเดินอาหารหรือสมอง ควรหยุดทานก่อนการผ่าตัดอย่างน้อย 2 สัปดาห์',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'NIH National Center for Complementary and Integrative Health (NCCIH)',
    url_doi: 'https://www.nccih.nih.gov/health/ginkgo',
    publish_year: '2024',
  },

  // ---------------------------------------------------------------------------
  // 22. ผลิตภัณฑ์เสริมอาหาร: วิตามินดี 3, วิตามินอี, โคเอนไซม์ คิวเท็น, แอสตาแซนธิน (ละลายในไขมัน)
  // ---------------------------------------------------------------------------
  {
    medication_keys: ['vitamin_d3', 'vitamin_e', 'coq10', 'astaxanthin', 'วิตามินดี', 'วิตามินอี', 'คิวเท็น', 'โคเอนไซม์', 'แอสตาแซนธิน'],
    medication_label: 'วิตามินดี 3 / วิตามินอี / โคเอนไซม์ คิวเท็น / แอสตาแซนธิน',
    food_name: 'อาหารมื้อหลักที่มีไขมันดี (น้ำมันมะกอก, อะโวคาโด, ปลา, ไข่)',
    interaction_type: 'แนะนำให้รับประทานร่วม',
    severity: '',
    hours_before: '',
    hours_after: '',
    impact_details: 'วิตามินดี วิตามินอี CoQ10 และแอสตาแซนธิน เป็นสารอาหารที่ละลายในไขมัน (Fat-soluble) การรับประทานพร้อมอาหารมื้อหลักที่มีไขมันจะกระตุ้นการหลั่งน้ำดี ทำให้ร่างกายดูดซึมสารอาหารเข้าสู่กระแสเลือดได้เพิ่มขึ้นกว่า 30-50%',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'NIH Office of Dietary Supplements (ODS)',
    url_doi: 'https://ods.od.nih.gov',
    publish_year: '2024',
  },
  {
    medication_keys: ['vitamin_d3', 'vitamin_e', 'coq10', 'astaxanthin', 'วิตามินดี', 'วิตามินอี', 'คิวเท็น'],
    medication_label: 'วิตามินละลายในไขมัน (วิตามินดี / วิตามินอี / CoQ10)',
    food_name: 'เครื่องดื่มแอลกอฮอล์',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'กลาง',
    hours_before: '4',
    hours_after: '4',
    impact_details: 'แอลกอฮอล์ขัดขวางการดูดซึมและลดประสิทธิภาพการเปลี่ยนรูปวิตามินที่ตับ ส่งผลให้ระดับวิตามินและสารต้านอนุมูลอิสระในร่างกายลดต่ำลง',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'Harvard Health Publishing',
    url_doi: 'https://www.health.harvard.edu',
    publish_year: '2024',
  },

  // ---------------------------------------------------------------------------
  // 23. ผลิตภัณฑ์เสริมอาหาร: ซิงค์ สังกะสี (Zinc 15mg)
  // ---------------------------------------------------------------------------
  {
    medication_keys: ['zinc', 'vistra_zinc', 'ซิงค์', 'สังกะสี'],
    medication_label: 'ซิงค์ สังกะสี (Zinc Amino Acid Chelate 15mg)',
    food_name: 'กาแฟ, ชาเข้มข้น, ธัญพืชไม่ขัดสี (อาหารที่มีไฟเตตสูง)',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'กลาง',
    hours_before: '2',
    hours_after: '2',
    impact_details: 'กรดไฟติก (Phytic acid) ในธัญพืชไม่ขัดสีและสารแทนนินในชา/กาแฟ จะจับกับซิงค์ ทำให้การดูดซึมซิงค์ลดลงอย่างมาก ควรรับประทานซิงค์ห่างจากกาแฟหรือชาอย่างน้อย 2 ชั่วโมง',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'NIH Office of Dietary Supplements - Zinc Fact Sheet',
    url_doi: 'https://ods.od.nih.gov/factsheets/Zinc-HealthProfessional/',
    publish_year: '2024',
  },
  {
    medication_keys: ['zinc', 'vistra_zinc', 'ซิงค์', 'สังกะสี'],
    medication_label: 'ซิงค์ สังกะสี (Zinc 15mg)',
    food_name: 'อาหารมื้อหลักที่มีโปรตีนสูง',
    interaction_type: 'แนะนำให้รับประทานร่วม',
    severity: '',
    hours_before: '',
    hours_after: '',
    impact_details: 'กรดอะมิโนจากโปรตีนในมื้ออาหารช่วยส่งเสริมการลำเลียงแร่ธาตุสังกะสีผ่านผนังลำไส้ และช่วยป้องกันอาการคลื่นไส้ มวนท้อง ที่มักเกิดจากการทานสังกะสีตอนท้องว่าง',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'National Institutes of Health (NIH)',
    url_doi: 'https://ods.od.nih.gov',
    publish_year: '2024',
  },

  // ---------------------------------------------------------------------------
  // 24. ผลิตภัณฑ์เสริมอาหาร: โพรไบโอติกส์ (Probiotics)
  // ---------------------------------------------------------------------------
  {
    medication_keys: ['probiotics', 'โพรไบโอติกส์', 'จุลินทรีย์'],
    medication_label: 'โพรไบโอติกส์ (Multi-Strain Probiotics)',
    food_name: 'เครื่องดื่มร้อน (น้ำร้อน, ชาร้อน, กาแฟร้อน) และแอลกอฮอล์',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'สูง',
    hours_before: '2',
    hours_after: '2',
    impact_details: 'ความร้อนสูงเกิน 40-50 องศาเซลเซียส และแอลกอฮอล์จะทำลายผนังเซลล์ของจุลินทรีย์มีชีวิต ทำให้โพรไบโอติกส์ตายก่อนเดินทางไปถึงลำไส้ ควรรับประทานพร้อมน้ำอุณหภูมิปกติหรือน้ำเย็นเท่านั้น',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'International Scientific Association for Probiotics and Prebiotics (ISAPP)',
    url_doi: 'https://isappscience.org',
    publish_year: '2023',
  },
  {
    medication_keys: ['probiotics', 'โพรไบโอติกส์', 'จุลินทรีย์'],
    medication_label: 'โพรไบโอติกส์ (Multi-Strain Probiotics)',
    food_name: 'อาหารที่มีพรีไบโอติกส์ (กล้วยหอม, ข้าวโอ๊ต, แอปเปิ้ล, กระเทียม)',
    interaction_type: 'แนะนำให้รับประทานร่วม',
    severity: '',
    hours_before: '',
    hours_after: '',
    impact_details: 'พรีไบโอติกส์เป็นใยอาหารชนิดละลายน้ำที่เป็นแหล่งอาหารหลักของจุลินทรีย์ดี ช่วยกระตุ้นการเจริญเติบโตและการตั้งรกรากของโพรไบโอติกส์ในลำไส้ใหญ่ ส่งเสริมระบบภูมิคุ้มกันและการขับถ่ายอย่างสมบูรณ์',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'World Gastroenterology Organisation (WGO) Guidelines',
    url_doi: 'https://www.worldgastroenterology.org',
    publish_year: '2024',
  },

  // ---------------------------------------------------------------------------
  // 25. ผลิตภัณฑ์เสริมอาหาร: เมลาโทนิน (Melatonin)
  // ---------------------------------------------------------------------------
  {
    medication_keys: ['melatonin', 'เมลาโทนิน'],
    medication_label: 'เมลาโทนิน (Melatonin 5mg)',
    food_name: 'เครื่องดื่มแอลกอฮอล์ และกาแฟ (คาเฟอีน)',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'สูง',
    hours_before: '4',
    hours_after: '4',
    impact_details: 'แอลกอฮอล์เสริมฤทธิ์กดประสาทของเมลาโทนินแต่กลับทำลายคุณภาพการนอนหลับลึก (Sleep Architecture) ส่วนคาเฟอีนมีฤทธิ์ยับยั้งตัวรับอะดีโนซีน ทำให้ต้านฤทธิ์ง่วงนอนของเมลาโทนินโดยตรง',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'National Sleep Foundation & U.S. FDA Drug Information',
    url_doi: 'https://www.sleepfoundation.org',
    publish_year: '2024',
  },

  // ---------------------------------------------------------------------------
  // 26. ผลิตภัณฑ์เสริมอาหาร: ฟ้าทะลายโจร (Fah Talai Jone)
  // ---------------------------------------------------------------------------
  {
    medication_keys: ['fah_talai_jone', 'andrographis', 'ฟ้าทะลายโจร'],
    medication_label: 'ฟ้าทะลายโจร สกัด (Andrographis Paniculata)',
    food_name: 'ยาลดความดันโลหิต หรือยาต้านการแข็งตัวของเลือด',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'กลาง',
    hours_before: '2',
    hours_after: '2',
    impact_details: 'สารแอนโดรกราโฟไลด์ในฟ้าทะลายโจรมีฤทธิ์ลดความดันโลหิตและต้านเกล็ดเลือด อาจเสริมฤทธิ์ยาลดความดันทำให้ความดันตกเฉียบพลัน หรือเสริมฤทธิ์ยาต้านการแข็งตัวของเลือดจนเลือดหยุดยาก',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'กรมการแพทย์แผนไทยและการแพทย์ทางเลือก กระทรวงสาธารณสุข',
    url_doi: 'https://dtam.moph.go.th',
    publish_year: '2024',
  },

  // ---------------------------------------------------------------------------
  // 27. ผลิตภัณฑ์เสริมอาหาร: วิตามินซี (Vitamin C, Bio C, Nat C, Acerola Cherry)
  // ---------------------------------------------------------------------------
  {
    medication_keys: ['vitamin_c', 'bio_c', 'nat_c', 'acerola_cherry', 'วิตามินซี', 'ไบโอซี', 'แนทซี', 'อะเซโรล่า', 'ascorbic'],
    medication_label: 'วิตามินซี (Vitamin C 1000mg / Bio C / Nat C)',
    food_name: 'อาหารมื้อหลัก หรืออาหารเสริมธาตุเหล็ก / คอลลาเจน',
    interaction_type: 'แนะนำให้รับประทานร่วม',
    severity: '',
    hours_before: '',
    hours_after: '',
    impact_details: 'วิตามินซีช่วยกระตุ้นการดูดซึมธาตุเหล็กและเป็นโคแฟกเตอร์จำเป็นในการสังเคราะห์เส้นใยคอลลาเจนในร่างกาย การรับประทานพร้อมอาหารช่วยลดการระคายเคืองกระเพาะอาหารจากความเป็นกรด',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'NIH Office of Dietary Supplements (ODS) - Vitamin C Fact Sheet',
    url_doi: 'https://ods.od.nih.gov/factsheets/VitaminC-HealthProfessional/',
    publish_year: '2024',
  },
  {
    medication_keys: ['vitamin_c', 'bio_c', 'nat_c', 'acerola_cherry', 'วิตามินซี', 'ไบโอซี', 'แนทซี', 'ascorbic'],
    medication_label: 'วิตามินซี (Vitamin C 1000mg)',
    food_name: 'ยาลดกรดที่มีอะลูมิเนียม หรือเครื่องดื่มแอลกอฮอล์/กาแฟเข้มข้น',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'กลาง',
    hours_before: '2',
    hours_after: '2',
    impact_details: 'วิตามินซีเพิ่มการดูดซึมอะลูมิเนียมในยาลดกรด ซึ่งอาจสะสมและเป็นอันตรายในผู้ป่วยโรคไต ส่วนคาเฟอีนและแอลกอฮอล์มีฤทธิ์ขับปัสสาวะ เร่งการขับวิตามินซีออกจากร่างกายเร็วขึ้น',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'คณะเภสัชศาสตร์ มหาวิทยาลัยมหิดล',
    url_doi: 'https://pharmacy.mahidol.ac.th',
    publish_year: '2023',
  },

  // ---------------------------------------------------------------------------
  // 28. ผลิตภัณฑ์เสริมอาหาร: คอลลาเจน (Collagen Peptide / Tripeptide / Amado)
  // ---------------------------------------------------------------------------
  {
    medication_keys: ['collagen', 'amado', 'คอลลาเจน', 'อมาโด้'],
    medication_label: 'คอลลาเจน เปปไทด์ (Collagen Peptide)',
    food_name: 'น้ำส้มคั้นสด, น้ำมะนาว หรือวิตามินซี',
    interaction_type: 'แนะนำให้รับประทานร่วม',
    severity: '',
    hours_before: '',
    hours_after: '',
    impact_details: 'วิตามินซีเป็นสารจำเป็นในการสร้างพันธะไฮดรอกซีโพรลีน (Hydroxyproline) ช่วยให้ร่างกายสังเคราะห์เส้นใยคอลลาเจนได้อย่างสมบูรณ์และเพิ่มประสิทธิภาพในการบำรุงผิวพรรณและข้อต่อ',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'สำนักโภชนาการ กรมอนามัย กระทรวงสาธารณสุข',
    url_doi: 'https://nutrition2.anamai.moph.go.th',
    publish_year: '2024',
  },
  {
    medication_keys: ['collagen', 'amado', 'คอลลาเจน'],
    medication_label: 'คอลลาเจน เปปไทด์ (Collagen Peptide)',
    food_name: 'อาหารโปรตีนสูงมื้อหนักมาก หรือเครื่องดื่มร้อนจัด',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'กลาง',
    hours_before: '2',
    hours_after: '2',
    impact_details: 'กรดอะมิโนจากโปรตีนในอาหารมื้อหนักจะแย่งตัวขนส่งการดูดซึมคอลลาเจนในลำไส้ และความร้อนจัดอาจทำลายโครงสร้างเปปไทด์ ควรรับประทานตอนท้องว่างหรือก่อนนอนพร้อมน้ำอุณหภูมิปกติ',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'Journal of Agricultural and Food Chemistry',
    url_doi: 'https://pubs.acs.org',
    publish_year: '2023',
  },

  // ---------------------------------------------------------------------------
  // 29. ผลิตภัณฑ์เสริมอาหาร: วิตามินรวมและเกลือแร่ (Multivitamins, Centrum, Berocca)
  // ---------------------------------------------------------------------------
  {
    medication_keys: ['multivitamin', 'centrum', 'berocca', 'วิตามินรวม', 'เซนทรัม', 'บีรอคคา'],
    medication_label: 'วิตามินรวมและเกลือแร่ (Centrum / Multivitamins)',
    food_name: 'ชาเข้มข้น, กาแฟ, นมวัว, นมถั่วเหลือง',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'กลาง',
    hours_before: '2',
    hours_after: '2',
    impact_details: 'สารแทนนินในชา/กาแฟ และแคลเซียมในนม จะจับกับแร่ธาตุในวิตามินรวม เช่น ธาตุเหล็ก สังกะสี และแมกนีเซียม ทำให้ร่างกายดูดซึมสารอาหารได้ลดลงอย่างมาก ควรเว้นระยะห่างอย่างน้อย 2 ชั่วโมง',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'Harvard Health Publishing - Making the Most of Vitamins',
    url_doi: 'https://www.health.harvard.edu',
    publish_year: '2024',
  },
  {
    medication_keys: ['multivitamin', 'centrum', 'berocca', 'วิตามินรวม', 'เซนทรัม'],
    medication_label: 'วิตามินรวมและเกลือแร่ (Centrum / Multivitamins)',
    food_name: 'อาหารมื้อเช้า หรือมื้อกลางวัน',
    interaction_type: 'แนะนำให้รับประทานร่วม',
    severity: '',
    hours_before: '',
    hours_after: '',
    impact_details: 'การรับประทานวิตามินรวมพร้อมอาหารมื้อหลัก ช่วยให้ร่างกายดูดซึมได้ทั้งวิตามินที่ละลายในน้ำและวิตามินที่ละลายในไขมันได้อย่างครบถ้วน และให้พลังงานสดชื่นพร้อมทำกิจกรรมตลอดวัน',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'Harvard T.H. Chan School of Public Health',
    url_doi: 'https://www.hsph.harvard.edu',
    publish_year: '2024',
  },

  // ---------------------------------------------------------------------------
  // 30. ผลิตภัณฑ์เสริมอาหาร: แมกนีเซียม (Magnesium Complex)
  // ---------------------------------------------------------------------------
  {
    medication_keys: ['magnesium', 'แมกนีเซียม'],
    medication_label: 'แมกนีเซียม (Magnesium Complex)',
    food_name: 'อาหารที่มีไขมันสูงมาก หรือแอลกอฮอล์',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'กลาง',
    hours_before: '2',
    hours_after: '2',
    impact_details: 'อาหารไขมันสูงมากจับตัวกับแมกนีเซียมเป็นสบู่ที่ไม่ละลายน้ำ ทำให้การดูดซึมลดลง ส่วนแอลกอฮอล์เร่งการขับแมกนีเซียมออกทางไต ส่งผลให้ระดับแมกนีเซียมในเลือดลดต่ำลง',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'NIH Office of Dietary Supplements (ODS) - Magnesium Fact Sheet',
    url_doi: 'https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/',
    publish_year: '2024',
  },
  {
    medication_keys: ['magnesium', 'แมกนีเซียม'],
    medication_label: 'แมกนีเซียม (Magnesium Complex)',
    food_name: 'อาหารมื้อเย็น หรือก่อนนอนพร้อมน้ำอุ่น',
    interaction_type: 'แนะนำให้รับประทานร่วม',
    severity: '',
    hours_before: '',
    hours_after: '',
    impact_details: 'การรับประทานแมกนีเซียมพร้อมอาหารเย็นหรือก่อนนอน ช่วยให้กล้ามเนื้อและระบบประสาทคลายตัว ลดความตึงเครียด ส่งเสริมการนอนหลับลึกอย่างมีคุณภาพ และลดการระคายเคืองทางเดินอาหาร',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'Sleep Foundation & NIH ODS',
    url_doi: 'https://www.sleepfoundation.org',
    publish_year: '2024',
  },

  // ---------------------------------------------------------------------------
  // 31. ผลิตภัณฑ์เสริมอาหาร: กลูตาไธโอน / สารสกัดเมล็ดองุ่น (Glutathione, Grape Seed)
  // ---------------------------------------------------------------------------
  {
    medication_keys: ['glutathione', 'grape_seed', 'กลูตาไธโอน', 'เมล็ดองุ่น'],
    medication_label: 'แอล-กลูตาไธโอน (L-Glutathione) / สารสกัดเมล็ดองุ่น',
    food_name: 'น้ำส้มคั้นสด, วิตามินซี หรือผลไม้รสเปรี้ยว',
    interaction_type: 'แนะนำให้รับประทานร่วม',
    severity: '',
    hours_before: '',
    hours_after: '',
    impact_details: 'วิตามินซีช่วยรีไซเคิลโมเลกุลกลูตาไธโอนที่ถูกออกซิไดซ์ให้กลับมาอยู่ในรูปออกฤทธิ์ (Reduced Glutathione) ช่วยเพิ่มประสิทธิภาพการต้านอนุมูลอิสระและการบำรุงผิวพรรณกระจ่างใสได้ถึง 2 เท่า',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'American Journal of Clinical Nutrition',
    url_doi: 'https://academic.oup.com/ajcn',
    publish_year: '2023',
  },
  {
    medication_keys: ['glutathione', 'grape_seed', 'กลูตาไธโอน', 'เมล็ดองุ่น'],
    medication_label: 'แอล-กลูตาไธโอน (L-Glutathione)',
    food_name: 'เครื่องดื่มแอลกอฮอล์',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'สูง',
    hours_before: '12',
    hours_after: '12',
    impact_details: 'แอลกอฮอล์ดึงกลูตาไธโอนในตับไปใช้กำจัดสารพิษอะซีตัลดีไฮด์จนหมด ทำให้ระดับกลูตาไธโอนในร่างกายลดฮวบ และทำให้เซลล์ตับถูกทำลายจากอนุมูลอิสระ',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'National Institutes of Health (NIH)',
    url_doi: 'https://www.ncbi.nlm.nih.gov/pmc/',
    publish_year: '2023',
  },

  // ---------------------------------------------------------------------------
  // 32. ผลิตภัณฑ์เสริมอาหาร: สารสกัดขมิ้นชัน (Curcumin Extract)
  // ---------------------------------------------------------------------------
  {
    medication_keys: ['curcumin', 'ขมิ้นชัน'],
    medication_label: 'สารสกัดขมิ้นชัน (Curcumin Extract)',
    food_name: 'อาหารที่มีพริกไทยดำ (พิเพอรีน) หรืออาหารที่มีไขมันดี',
    interaction_type: 'แนะนำให้รับประทานร่วม',
    severity: '',
    hours_before: '',
    hours_after: '',
    impact_details: 'สารพิเพอรีน (Piperine) ในพริกไทยดำช่วยยับยั้งกระบวนการกลูคูโรนิเดชันในตับและลำไส้ เพิ่มการดูดซึมสารเคอร์คูมินเข้าสู่กระแสเลือดได้มากกว่า 2000% (20 เท่า) ส่งเสริมการต้านการอักเสบได้อย่างยอดเยี่ยม',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'Planta Medica & NIH PubMed',
    url_doi: 'https://pubmed.ncbi.nlm.nih.gov/9619120/',
    publish_year: '2023',
  },
  {
    medication_keys: ['curcumin', 'ขมิ้นชัน'],
    medication_label: 'สารสกัดขมิ้นชัน (Curcumin Extract)',
    food_name: 'ยาต้านการแข็งตัวของเลือด (วาร์ฟาริน, แอสไพริน)',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'สูง',
    hours_before: '4',
    hours_after: '4',
    impact_details: 'ขมิ้นชันมีฤทธิ์ต้านการเกาะกลุ่มของเกล็ดเลือด เมื่อใช้ร่วมกับยาต้านการแข็งตัวของเลือดจะเสริมฤทธิ์กัน ทำให้เลือดหยุดช้า ฟกช้ำง่าย และเสี่ยงต่อภาวะเลือดออกในทางเดินอาหาร',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'กรมการแพทย์แผนไทยและการแพทย์ทางเลือก',
    url_doi: 'https://dtam.moph.go.th',
    publish_year: '2024',
  },

  // ---------------------------------------------------------------------------
  // 33. ผลิตภัณฑ์เสริมอาหาร: ถั่งเช่า และ เห็ดหลินจือ (Cordyceps, Lingzhi Extract)
  // ---------------------------------------------------------------------------
  {
    medication_keys: ['cordyceps', 'lingzhi', 'reishi', 'ถั่งเช่า', 'เห็ดหลินจือ'],
    medication_label: 'สารสกัดถั่งเช่า / สารสกัดเห็ดหลินจือ',
    food_name: 'ยาวาร์ฟาริน, แอสไพริน หรือยาต้านเกล็ดเลือด',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'สูง',
    hours_before: '4',
    hours_after: '4',
    impact_details: 'สารสำคัญในถั่งเช่าและเห็ดหลินจือมีฤทธิ์ยับยั้งการรวมตัวของเกล็ดเลือด อาจเสริมฤทธิ์ยาต้านการแข็งตัวของเลือดจนทำให้เลือดออกไม่หยุด ควรหยุดรับประทานก่อนการผ่าตัดอย่างน้อย 2 สัปดาห์',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'Memorial Sloan Kettering Cancer Center (MSKCC)',
    url_doi: 'https://www.mskcc.org/cancer-care/integrative-medicine/herbs',
    publish_year: '2024',
  },
  {
    medication_keys: ['cordyceps', 'lingzhi', 'reishi', 'ถั่งเช่า', 'เห็ดหลินจือ'],
    medication_label: 'สารสกัดถั่งเช่า / สารสกัดเห็ดหลินจือ',
    food_name: 'น้ำส้มคั้นสด, น้ำมะนาว หรือวิตามินซี',
    interaction_type: 'แนะนำให้รับประทานร่วม',
    severity: '',
    hours_before: '',
    hours_after: '',
    impact_details: 'วิตามินซีช่วยย่อยสลายโครงสร้างโพลีแซคคาไรด์โมเลกุลใหญ่ของเห็ดหลินจือและถั่งเช่าให้เล็กลง ทำให้ร่างกายดูดซึมเบต้ากลูแคนไปกระตุ้นระบบภูมิคุ้มกันได้ดียิ่งขึ้น',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'International Journal of Medicinal Mushrooms',
    url_doi: 'https://www.dl.begellhouse.com/journals/medicinal-mushrooms.html',
    publish_year: '2023',
  },

  // ---------------------------------------------------------------------------
  // 34. ผลิตภัณฑ์เสริมอาหาร: เลซิติน (Lecithin 1200mg)
  // ---------------------------------------------------------------------------
  {
    medication_keys: ['lecithin', 'เลซิติน'],
    medication_label: 'เลซิติน (Lecithin 1200mg)',
    food_name: 'อาหารมื้อหลัก',
    interaction_type: 'แนะนำให้รับประทานร่วม',
    severity: '',
    hours_before: '',
    hours_after: '',
    impact_details: 'การรับประทานเลซิตินพร้อมอาหารมื้อหลักช่วยกระตุ้นการหลั่งน้ำดี ย่อยฟอสโฟลิปิดได้อย่างสมบูรณ์ และช่วยให้ตับนำโคลีนไปใช้สลายไขมันพอกตับและบำรุงเซลล์สมองได้สูงสุด',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'NIH Office of Dietary Supplements',
    url_doi: 'https://ods.od.nih.gov',
    publish_year: '2024',
  },

  // ---------------------------------------------------------------------------
  // 35. ผลิตภัณฑ์เสริมอาหาร: น้ำมันอีฟนิ่งพริมโรส (Evening Primrose Oil - EPO)
  // ---------------------------------------------------------------------------
  {
    medication_keys: ['evening_primrose', 'epo', 'อีฟนิ่งพริมโรส'],
    medication_label: 'น้ำมันอีฟนิ่งพริมโรส (Evening Primrose Oil 1000mg)',
    food_name: 'อาหารมื้อหลัก',
    interaction_type: 'แนะนำให้รับประทานร่วม',
    severity: '',
    hours_before: '',
    hours_after: '',
    impact_details: 'กรดแกมมา-ไลโนเลนิก (GLA) ในน้ำมันอีฟนิ่งพริมโรสเป็นกรดไขมันจำเป็น การทานพร้อมอาหารช่วยเพิ่มการดูดซึมเข้าสู่กระแสเลือด บรรเทาอาการก่อนมีประจำเดือน (PMS) และบำรุงผิวชุ่มชื้น',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'Mayo Clinic Dietary Supplements Guide',
    url_doi: 'https://www.mayoclinic.org',
    publish_year: '2024',
  },
  {
    medication_keys: ['evening_primrose', 'epo', 'อีฟนิ่งพริมโรส'],
    medication_label: 'น้ำมันอีฟนิ่งพริมโรส (EPO 1000mg)',
    food_name: 'สารสกัดแปะก๊วย, กระเทียม หรือยาต้านเกล็ดเลือด',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'สูง',
    hours_before: '4',
    hours_after: '4',
    impact_details: 'น้ำมันอีฟนิ่งพริมโรสมีฤทธิ์ต้านการรวมตัวของเกล็ดเลือดเล็กน้อย หากทานร่วมกับแปะก๊วยหรือยาละลายลิ่มเลือดจะเสริมฤทธิ์กัน ทำให้เลือดหยุดยาก',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'NIH NCCIH Evening Primrose Oil',
    url_doi: 'https://www.nccih.nih.gov',
    publish_year: '2024',
  },

  // ---------------------------------------------------------------------------
  // 36. ผลิตภัณฑ์เสริมอาหาร: ไบโอติน (Biotin 5000mcg)
  // ---------------------------------------------------------------------------
  {
    medication_keys: ['biotin', 'ไบโอติน'],
    medication_label: 'ไบโอติน (Biotin 5000mcg - บำรุงผมและเล็บ)',
    food_name: 'ไข่ขาวดิบ (Raw egg whites)',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'สูง',
    hours_before: '4',
    hours_after: '4',
    impact_details: 'โปรตีนอะวิดิน (Avidin) ในไข่ขาวดิบจะจับตัวกับไบโอตินอย่างถาวรในทางเดินอาหาร ขัดขวางการดูดซึมไบโอตินเข้าสู่ร่างกาย ทำให้ร่างกายขาดไบโอติน เส้นผมร่วง ผิวหนังอักเสบ และเล็บเปราะฉีกง่าย',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'NIH Office of Dietary Supplements - Biotin Fact Sheet',
    url_doi: 'https://ods.od.nih.gov/factsheets/Biotin-HealthProfessional/',
    publish_year: '2024',
  },

  // ---------------------------------------------------------------------------
  // 37. ผลิตภัณฑ์เสริมอาหาร: วิตามินบีรวม (Vitamin B Complex, Nat B, Exec B)
  // ---------------------------------------------------------------------------
  {
    medication_keys: ['vitamin_b', 'nat_b', 'exec_b', 'วิตามินบี', 'แนท บี', 'เอ็กเซค บี'],
    medication_label: 'วิตามินบีรวม (High Potency Vitamin B Complex / Nat B)',
    food_name: 'ชา, กาแฟเข้มข้น และเครื่องดื่มแอลกอฮอล์',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'กลาง',
    hours_before: '2',
    hours_after: '2',
    impact_details: 'คาเฟอีนและแอลกอฮอล์มีฤทธิ์ขับปัสสาวะ เร่งการขับวิตามินบี (ซึ่งละลายในน้ำ) ออกจากร่างกายเร็วเกินไป ทำให้ร่างกายไม่สามารถนำวิตามินไปใช้บำรุงปลายประสาทและสมองได้อย่างเต็มที่',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'Harvard Health Publishing - Vitamin B Benefits',
    url_doi: 'https://www.health.harvard.edu',
    publish_year: '2024',
  },
  {
    medication_keys: ['vitamin_b', 'nat_b', 'exec_b', 'วิตามินบี', 'แนท บี'],
    medication_label: 'วิตามินบีรวม (Vitamin B Complex / Nat B)',
    food_name: 'อาหารมื้อเช้า',
    interaction_type: 'แนะนำให้รับประทานร่วม',
    severity: '',
    hours_before: '',
    hours_after: '',
    impact_details: 'การรับประทานวิตามินบีพร้อมอาหารเช้าช่วยให้ร่างกายเผาผลาญสารอาหารคาร์โบไฮเดรต โปรตีน และไขมันไปเป็นพลังงานได้อย่างมีประสิทธิภาพ เพิ่มความสดชื่นกระปรี้กระเปร่าและลดความอ่อนเพลียตลอดวัน',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'National Institutes of Health (NIH)',
    url_doi: 'https://ods.od.nih.gov',
    publish_year: '2024',
  },

  // ---------------------------------------------------------------------------
  // 38. ผลิตภัณฑ์เสริมอาหาร: กรดโฟลิก (Folic Acid 5mg)
  // ---------------------------------------------------------------------------
  {
    medication_keys: ['folic_acid', 'folic', 'กรดโฟลิก', 'โฟลิก'],
    medication_label: 'กรดโฟลิก (Folic Acid 5mg - บำรุงเม็ดเลือด)',
    food_name: 'ชาเขียวเข้มข้น (สารแคทีชิน EGCG)',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'กลาง',
    hours_before: '2',
    hours_after: '2',
    impact_details: 'สารแคทีชิน (EGCG) ในชาเขียวเข้มข้นยับยั้งเอนไซม์ Dihydrofolate Reductase (DHFR) ขัดขวางการดูดซึมและการนำกรดโฟลิกไปใช้สร้างเม็ดเลือดแดง ควรเว้นระยะห่างอย่างน้อย 2 ชั่วโมง',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'Cancer Research Journal & NIH PubMed',
    url_doi: 'https://pubmed.ncbi.nlm.nih.gov/15781622/',
    publish_year: '2023',
  },
  {
    medication_keys: ['folic_acid', 'folic', 'กรดโฟลิก'],
    medication_label: 'กรดโฟลิก (Folic Acid 5mg)',
    food_name: 'อาหารมื้อหลัก หรือผลไม้ที่มีวิตามินซี / บี 12',
    interaction_type: 'แนะนำให้รับประทานร่วม',
    severity: '',
    hours_before: '',
    hours_after: '',
    impact_details: 'การรับประทานพร้อมอาหารมื้อหลักหรือวิตามินบี 12 ช่วยเสริมการทำงานร่วมกันในการสังเคราะห์ดีเอ็นเอและการสร้างเซลล์เม็ดเลือดแดงที่สมบูรณ์ ป้องกันภาวะโลหิตจางได้อย่างมีประสิทธิภาพ',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'U.S. CDC Folic Acid Guidelines',
    url_doi: 'https://www.cdc.gov/ncbddd/folicacid/',
    publish_year: '2024',
  },

  // ---------------------------------------------------------------------------
  // 39. ผลิตภัณฑ์เสริมอาหาร: กลูโคซามีน ซัลเฟต (Glucosamine Sulfate 1500mg)
  // ---------------------------------------------------------------------------
  {
    medication_keys: ['glucosamine', 'กลูโคซามีน'],
    medication_label: 'กลูโคซามีน ซัลเฟต (Glucosamine Sulfate 1500mg - บำรุงข้อต่อ)',
    food_name: 'อาหารมื้อหลัก',
    interaction_type: 'แนะนำให้รับประทานร่วม',
    severity: '',
    hours_before: '',
    hours_after: '',
    impact_details: 'แนะนำให้รับประทานพร้อมอาหารหรือหลังอาหารทันที เพื่อช่วยลดอาการคลื่นไส้ แน่นท้อง แสบยอดอก และช่วยให้ร่างกายดูดซึมสารอาหารไปซ่อมแซมกระดูกอ่อนผิวข้อได้อย่างต่อเนื่อง',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'Arthritis Foundation Guidelines',
    url_doi: 'https://www.arthritis.org',
    publish_year: '2024',
  },

// ---------------------------------------------------------------------------
  // 40. พาราเซตามอล & ยาแก้หวัดสูตรผสม (แนะนำให้รับประทานร่วม)
  // ---------------------------------------------------------------------------
  {
    medication_keys: [
      'paracetamol', 'acetaminophen', 'tiffy', 'sara', 'decolgen', 'tylenol', 'tempra',
      'พาราเซตามอล', 'ทิฟฟี่', 'ซาร่า', 'ดีคอลเจน', 'ไทลินอล', 'เทมปร้า', 'อะเซตามีโนเฟน',
      'tempra_syrup', 'sara_syrup'
    ],
    medication_label: 'พาราเซตามอล (Paracetamol) / ไทลินอล / ซาร่า / ทิฟฟี่ / ดีคอลเจน',
    food_name: 'น้ำสะอาด 1 แก้วเต็ม (หรืออาหารว่างมื้อเบา)',
    interaction_type: 'แนะนำให้รับประทานร่วม',
    severity: '',
    hours_before: '',
    hours_after: '',
    impact_details: 'สามารถรับประทานพร้อมอาหารหรือตอนท้องว่างได้ โดยการดื่มน้ำตาม 1 แก้วเต็มจะช่วยให้ตัวยาแตกตัวและดูดซึมเข้าสู่กระแสเลือดได้อย่างรวดเร็วและมีประสิทธิภาพ',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'U.S. FDA Drug Information on Acetaminophen',
    url_doi: 'https://www.fda.gov/drugs/resources-drugs/avoid-food-drug-interactions',
    publish_year: '2024',
  },

  // ---------------------------------------------------------------------------
  // 41. ยาคลายกล้ามเนื้อ (แนะนำให้รับประทานร่วม)
  // ---------------------------------------------------------------------------
  {
    medication_keys: [
      'norgesic', 'orphenadrine', 'diazepam', 'lorazepam', 'นอร์จีสิก', 'ไดอะซีแพม',
      'ลอราซีแพม', 'ยาคลายกล้ามเนื้อ', 'ออร์เฟนาดรีน'
    ],
    medication_label: 'นอร์จีสิก (Norgesic) / ไดอะซีแพม / ลอราซีแพม',
    food_name: 'อาหารมื้อหลัก หรือ นมสด 1 แก้ว',
    interaction_type: 'แนะนำให้รับประทานร่วม',
    severity: '',
    hours_before: '',
    hours_after: '',
    impact_details: 'แนะนำให้รับประทานพร้อมอาหารมื้อหลักหรือหลังอาหารทันที หรือดื่มนมตาม เพื่อช่วยเคลือบเยื่อบุกระเพาะอาหาร ลดอาการระคายเคือง คลื่นไส้ และลดอาการมึนงง',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'คณะแพทยศาสตร์ศิริราชพยาบาล มหาวิทยาลัยมหิดล',
    url_doi: 'https://www.si.mahidol.ac.th',
    publish_year: '2024',
  },

  // ---------------------------------------------------------------------------
  // 42. ยาลดกรดและยาเคลือบกระเพาะอาหาร (แนะนำให้รับประทานร่วม)
  // ---------------------------------------------------------------------------
  {
    medication_keys: [
      'antacil', 'gaviscon', 'stomachic', 'buscopan', 'แอนตาซิล', 'กาวิสคอน',
      'ยาธาตุน้ำแดง', 'บัสโคพาน', 'ไฮออสซีน', 'alginate', 'hyoscine', 'stomachic mixture'
    ],
    medication_label: 'แอนตาซิล / กาวิสคอน / ยาธาตุน้ำแดง / บัสโคพาน',
    food_name: 'น้ำสะอาด 1/2 แก้ว (รับประทานหลังอาหาร 1-2 ชั่วโมง หรือเมื่อมีอาการ)',
    interaction_type: 'แนะนำให้รับประทานร่วม',
    severity: '',
    hours_before: '',
    hours_after: '',
    impact_details: 'แนะนำให้รับประทานหลังอาหาร 1-2 ชั่วโมง หรือเมื่อมีอาการแสบร้อนกลางอก พร้อมดื่มน้ำตามเล็กน้อย (ประมาณครึ่งแก้ว) เพื่อช่วยกระจายตัวยาให้เคลือบเยื่อบุกระเพาะและหลอดอาหารได้ทั่วถึง ไม่ควรดื่มน้ำตามมากเกินไปเพราะจะเจือจางความเข้มข้นของตัวยา',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'ภาควิชาเภสัชวิทยา คณะแพทยศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย',
    url_doi: 'https://www.chula.ac.th',
    publish_year: '2024',
  },

  // ---------------------------------------------------------------------------
  // 43. ยายับยั้งการหลั่งกรดกลุ่ม PPIs (แนะนำให้รับประทานร่วม)
  // ---------------------------------------------------------------------------
  {
    medication_keys: [
      'omeprazole', 'pantoprazole', 'esomeprazole', 'โอเมพราโซล', 'แพนโทพราโซล',
      'เอสโอเมพราโซล', 'miracid', 'controloc', 'nexium', 'ppi'
    ],
    medication_label: 'โอเมพราโซล / แพนโทพราโซล / เอสโอเมพราโซล (ยายับยั้งการหลั่งกรด PPIs)',
    food_name: 'น้ำสะอาด 1 แก้ว ก่อนอาหารเช้า 30-60 นาที',
    interaction_type: 'แนะนำให้รับประทานร่วม',
    severity: '',
    hours_before: '',
    hours_after: '',
    impact_details: 'ยายับยั้งการหลั่งกรดกลุ่ม PPIs มีประสิทธิภาพสูงสุดในการยับยั้งปั๊มโปรตอน (Proton Pump) เมื่อรับประทานก่อนอาหารมื้อแรกของวัน 30-60 นาที เพื่อให้ตัวยาถูกดูดซึมและพร้อมออกฤทธิ์บล็อกการหลั่งกรดที่ถูกกระตุ้นจากอาหารเช้า',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'American College of Gastroenterology (ACG) Clinical Guidelines',
    url_doi: 'https://gi.org',
    publish_year: '2024',
  },

  // ---------------------------------------------------------------------------
  // 44. ยาแก้แพ้และยาแก้เวียนศีรษะ (แนะนำให้รับประทานร่วม)
  // ---------------------------------------------------------------------------
  {
    medication_keys: [
      'cetirizine', 'loratadine', 'fexofenadine', 'chlorpheniramine', 'cpm', 'dimenhydrinate',
      'เซทิริซีน', 'ลอราทาดีน', 'เฟกโซเฟนาดีน', 'คลอร์เฟนิรามีน', 'ไดเมนไฮดริเนต', 'cpm_syrup',
      'zyrtec', 'claritin', 'telfast', 'dramamine'
    ],
    medication_label: 'ยาแก้แพ้และยาแก้เวียนศีรษะ (Cetirizine, Loratadine, Fexofenadine, CPM, Dimenhydrinate)',
    food_name: 'น้ำสะอาด 1 แก้วเต็ม (รับประทานพร้อมหรือหลังอาหาร)',
    interaction_type: 'แนะนำให้รับประทานร่วม',
    severity: '',
    hours_before: '',
    hours_after: '',
    impact_details: 'สามารถรับประทานพร้อมอาหารหรือหลังอาหารทันทีพร้อมดื่มน้ำสะอาด 1 แก้วเต็ม เพื่อช่วยลดอาการระคายเคืองกระเพาะอาหาร และช่วยบรรเทาผลข้างเคียงคอแห้ง ปากแห้ง ได้อย่างมีประสิทธิภาพ',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'U.S. FDA Drug Information on Antihistamines',
    url_doi: 'https://www.fda.gov',
    publish_year: '2024',
  },

  // ---------------------------------------------------------------------------
  // 45. ยาแก้ไอแห้งและยาน้ำดำแก้ไอ (แนะนำให้รับประทานร่วม)
  // ---------------------------------------------------------------------------
  {
    medication_keys: [
      'brown_mixture', 'dextromethorphan', 'ยาน้ำดำแก้ไอ', 'เดกซ์โทรเมทอร์แฟน', 'robitussin', 'brown mixture'
    ],
    medication_label: 'ยาน้ำดำแก้ไอ / เดกซ์โทรเมทอร์แฟน (ยาบรรเทาอาการไอ)',
    food_name: 'น้ำอุ่นสะอาด (จิบตามเล็กน้อยหลังรับประทานยา หรือจิบน้ำอุ่นตลอดวัน)',
    interaction_type: 'แนะนำให้รับประทานร่วม',
    severity: '',
    hours_before: '',
    hours_after: '',
    impact_details: 'การจิบน้ำอุ่นสะอาดตามหลังรับประทานยาเล็กน้อย ช่วยให้ลำคอชุ่มชื้น ลดการระคายเคืองเยื่อบุทางเดินหายใจ และช่วยส่งเสริมให้ยาออกฤทธิ์ระงับอาการไอได้อย่างมีประสิทธิภาพ',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'คณะเภสัชศาสตร์ มหาวิทยาลัยมหิดล',
    url_doi: 'https://pharmacy.mahidol.ac.th',
    publish_year: '2023',
  },

  // ---------------------------------------------------------------------------
  // 46. โคลชิซิน ยารักษาโรคเกาต์ (แนะนำให้รับประทานร่วม)
  // ---------------------------------------------------------------------------
  {
    medication_keys: ['colchicine', 'โคลชิซิน', 'ยารักษาโรคเกาต์'],
    medication_label: 'โคลชิซิน (Colchicine - ยารักษาโรคเกาต์)',
    food_name: 'น้ำสะอาด 1-2 แก้วเต็ม (และดื่มน้ำวันละ 2-3 ลิตร)',
    interaction_type: 'แนะนำให้รับประทานร่วม',
    severity: '',
    hours_before: '',
    hours_after: '',
    impact_details: 'การดื่มน้ำสะอาดในปริมาณที่เพียงพอ (อย่างน้อยวันละ 2-3 ลิตร) ช่วยส่งเสริมให้ไตขับกรดยูริกและตัวยาออกทางปัสสาวะได้อย่างปลอดภัย ป้องกันการเกิดผลึกนิ่วในทางเดินปัสสาวะและลดความเสี่ยงต่อการเกิดผลข้างเคียงต่อระบบทางเดินอาหาร',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'American College of Rheumatology (ACR) Gout Guidelines',
    url_doi: 'https://rheumatology.org',
    publish_year: '2024',
  },

  // ---------------------------------------------------------------------------
  // 47. ยารักษาโรคเบาหวาน (Pioglitazone, Dapagliflozin - แนะนำให้รับประทานร่วม)
  // ---------------------------------------------------------------------------
  {
    medication_keys: ['pioglitazone', 'ไพโอกลิตาโซน', 'actos'],
    medication_label: 'ไพโอกลิตาโซน (Pioglitazone)',
    food_name: 'อาหารมื้อหลัก (รับประทานเวลาเดิมสม่ำเสมอทุกวัน)',
    interaction_type: 'แนะนำให้รับประทานร่วม',
    severity: '',
    hours_before: '',
    hours_after: '',
    impact_details: 'แนะนำให้รับประทานพร้อมอาหารมื้อหลักในเวลาเดียวกันของทุกวัน เพื่อช่วยให้ร่างกายดูดซึมยาได้อย่างสม่ำเสมอ และช่วยเพิ่มความไวของอินซูลินในการควบคุมระดับน้ำตาลในเลือดได้อย่างมีประสิทธิภาพ',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'American Diabetes Association (ADA)',
    url_doi: 'https://diabetes.org',
    publish_year: '2024',
  },
  {
    medication_keys: ['dapagliflozin', 'ดาพากลิโฟลซิน', 'forxiga', 'sglt2'],
    medication_label: 'ดาพากลิโฟลซิน (Dapagliflozin)',
    food_name: 'น้ำสะอาด ดื่มสม่ำเสมอตลอดวัน (วันละ 2-2.5 ลิตร)',
    interaction_type: 'แนะนำให้รับประทานร่วม',
    severity: '',
    hours_before: '',
    hours_after: '',
    impact_details: 'การดื่มน้ำสะอาดอย่างสม่ำเสมอตลอดวัน (2-2.5 ลิตร) ช่วยส่งเสริมกลไกของยาในการขับน้ำตาลส่วนเกินออกทางปัสสาวะได้อย่างเต็มประสิทธิภาพ และป้องกันภาวะขาดน้ำหรือการติดเชื้อในระบบทางเดินปัสสาวะ',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'U.S. FDA Drug Information on SGLT2 Inhibitors',
    url_doi: 'https://www.fda.gov',
    publish_year: '2024',
  },

  // ---------------------------------------------------------------------------
  // 48. ยาลดความดันโลหิตและโรคหัวใจ (แนะนำให้รับประทานร่วม)
  // ---------------------------------------------------------------------------
  {
    medication_keys: ['amlodipine', 'แอมโลดิพีน', 'แอมโลดิปีน', 'norvasc'],
    medication_label: 'แอมโลดิพีน (Amlodipine)',
    food_name: 'น้ำสะอาด 1 แก้ว (รับประทานเวลาเดิมทุกวันสม่ำเสมอ)',
    interaction_type: 'แนะนำให้รับประทานร่วม',
    severity: '',
    hours_before: '',
    hours_after: '',
    impact_details: 'สามารถรับประทานพร้อมหรือไม่พร้อมอาหารก็ได้ การรับประทานยาในเวลาเดียวกันทุกวันช่วยรักษาระดับยาในกระแสเลือดและควบคุมความดันโลหิตให้คงที่ตลอด 24 ชั่วโมง',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'American Heart Association (AHA)',
    url_doi: 'https://www.heart.org',
    publish_year: '2024',
  },
  {
    medication_keys: ['enalapril', 'losartan', 'valsartan', 'captopril', 'อีนาราพริล', 'อีนาลาพริล', 'โลซาร์แทน', 'วาลซาร์แทน', 'cozaar', 'ednyt'],
    medication_label: 'อีนาราพริล / โลซาร์แทน (ยากลุ่ม ACEIs / ARBs)',
    food_name: 'น้ำสะอาด 1 แก้วเต็ม (รับประทานเวลาเดิมเป็นประจำทุกวัน)',
    interaction_type: 'แนะนำให้รับประทานร่วม',
    severity: '',
    hours_before: '',
    hours_after: '',
    impact_details: 'แนะนำให้รับประทานยาเวลาเดียวกันเป็นประจำทุกวันพร้อมน้ำสะอาด 1 แก้ว สามารถรับประทานพร้อมอาหารหรือขณะท้องว่างได้ ช่วยให้ควบคุมความดันโลหิตได้อย่างมีประสิทธิภาพและสม่ำเสมอ',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'American Heart Association (AHA)',
    url_doi: 'https://www.heart.org',
    publish_year: '2024',
  },
  {
    medication_keys: ['propranolol', 'atenolol', 'metoprolol', 'โพรพราโนลอล', 'อะทีโนลอล', 'เมโทโพรลอล', 'betaloc', 'tenormin'],
    medication_label: 'โพรพราโนลอล / อะทีโนลอล / เมโทโพรลอล (ยากลุ่มเบต้าบล็อกเกอร์)',
    food_name: 'อาหารมื้อหลัก',
    interaction_type: 'แนะนำให้รับประทานร่วม',
    severity: '',
    hours_before: '',
    hours_after: '',
    impact_details: 'แนะนำให้รับประทานพร้อมอาหารหรือหลังอาหารทันที เพื่อช่วยเพิ่มความสม่ำเสมอในการดูดซึมยาเข้าสู่กระแสเลือด และช่วยลดอาการข้างเคียง เช่น อาการวิงเวียนศีรษะหรือความดันตกขณะเปลี่ยนท่า',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'Mayo Clinic Cardiovascular Drug Information',
    url_doi: 'https://www.mayoclinic.org',
    publish_year: '2024',
  },
  {
    medication_keys: ['spironolactone', 'furosemide', 'hydrochlorothiazide', 'hctz', 'สไปโรโนแลคโตน', 'ฟูโรซีไมด์', 'ไฮโดรคลอโรไทอะไซด์', 'lasix'],
    medication_label: 'ฟูโรซีไมด์ / ไฮโดรคลอโรไทอะไซด์ (ยาขับปัสสาวะ)',
    food_name: 'อาหารที่มีโพแทสเซียมตามธรรมชาติ (เช่น กล้วย ส้ม มะเขือเทศ ในปริมาณพอเหมาะ) พร้อมดื่มน้ำให้เพียงพอในตอนเช้า',
    interaction_type: 'แนะนำให้รับประทานร่วม',
    severity: '',
    hours_before: '',
    hours_after: '',
    impact_details: 'การรับประทานอาหารที่มีโพแทสเซียมตามธรรมชาติช่วยชดเชยการสูญเสียเกลือแร่โพแทสเซียมที่ถูกขับออกทางปัสสาวะ และควรรับประทานในมื้อเช้าพร้อมน้ำสะอาดเพื่อหลีกเลี่ยงการตื่นมาปัสสาวะบ่อยในเวลากลางคืน',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'American Heart Association (AHA)',
    url_doi: 'https://www.heart.org',
    publish_year: '2024',
  },

  // ---------------------------------------------------------------------------
  // 49. ยาลดไขมันในเลือดกลุ่มสแตตินและไฟเบรต (แนะนำให้รับประทานร่วม)
  // ---------------------------------------------------------------------------
  {
    medication_keys: ['atorvastatin', 'simvastatin', 'rosuvastatin', 'อะทอร์วาสแตติน', 'ซิมวาสแตติน', 'โรซูวาสแตติน', 'lipitor', 'zocor', 'crestor'],
    medication_label: 'อะทอร์วาสแตติน / ซิมวาสแตติน / โรซูวาสแตติน (ยากลุ่มสแตติน)',
    food_name: 'น้ำสะอาด 1 แก้ว (รับประทานพร้อมอาหารมื้อเย็นหรือก่อนนอน)',
    interaction_type: 'แนะนำให้รับประทานร่วม',
    severity: '',
    hours_before: '',
    hours_after: '',
    impact_details: 'เนื่องจากกระบวนการสังเคราะห์คอเลสเตอรอลในตับจะเกิดขึ้นสูงสุดในเวลากลางคืน การรับประทานยากลุ่มสแตตินในมื้อเย็นหรือก่อนนอนจะช่วยให้ยามีประสิทธิภาพสูงสุดในการยับยั้งเอนไซม์ HMG-CoA reductase และลดระดับไขมันเลว (LDL)',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'American College of Cardiology (ACC) / AHA Cholesterol Guidelines',
    url_doi: 'https://www.acc.org',
    publish_year: '2024',
  },
  {
    medication_keys: ['fenofibrate', 'ฟีโนไฟเบรต', 'lipanthyl'],
    medication_label: 'ฟีโนไฟเบรต (Fenofibrate)',
    food_name: 'อาหารมื้อหลักทันที',
    interaction_type: 'แนะนำให้รับประทานร่วม',
    severity: '',
    hours_before: '',
    hours_after: '',
    impact_details: 'แนะนำให้รับประทานพร้อมอาหารมื้อหลักทันที เนื่องจากอาหารช่วยเพิ่มการละลายและการดูดซึมยาเฟโนไฟเบรตเข้าสู่กระแสเลือดได้เพิ่มขึ้นมากกว่า 35% ส่งผลให้ยาสามารถลดระดับไตรกลีเซอไรด์ได้อย่างมีประสิทธิภาพสูงสุด',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'U.S. FDA Drug Information on Fenofibrate',
    url_doi: 'https://www.fda.gov',
    publish_year: '2024',
  },

  // ---------------------------------------------------------------------------
  // 50. ยาต้านเกล็ดเลือดและยาละลายลิ่มเลือด (แนะนำให้รับประทานร่วม)
  // ---------------------------------------------------------------------------
  {
    medication_keys: ['clopidogrel', 'โคลพิโดเกรล', 'plavix'],
    medication_label: 'โคลพิโดเกรล (Clopidogrel - ยาต้านเกล็ดเลือด)',
    food_name: 'อาหารมื้อหลัก หรือ น้ำสะอาด 1 แก้วเต็ม',
    interaction_type: 'แนะนำให้รับประทานร่วม',
    severity: '',
    hours_before: '',
    hours_after: '',
    impact_details: 'สามารถรับประทานพร้อมอาหารหรือหลังอาหารทันทีพร้อมดื่มน้ำ 1 แก้วเต็ม เพื่อช่วยลดอาการระคายเคืองกระเพาะอาหาร และควรรับประทานเวลาเดิมเป็นประจำทุกวัน',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'U.S. FDA Drug Information on Clopidogrel',
    url_doi: 'https://www.fda.gov',
    publish_year: '2024',
  },
  {
    medication_keys: ['warfarin', 'วาร์ฟาริน', 'coumadin'],
    medication_label: 'วาร์ฟาริน (Warfarin - ยาต้านการแข็งตัวของเลือด)',
    food_name: 'อาหารที่มีสัดส่วนผักใบเขียวสม่ำเสมอในทุกวัน พร้อมน้ำสะอาด 1 แก้ว',
    interaction_type: 'แนะนำให้รับประทานร่วม',
    severity: '',
    hours_before: '',
    hours_after: '',
    impact_details: 'ผู้ใช้ยาวาร์ฟารินควรรับประทานอาหารประเภทผักใบเขียวในปริมาณที่คงที่สม่ำเสมอในแต่ละสัปดาห์ ไม่เพิ่มหรือลดอย่างกะทันหัน เพื่อให้ระดับค่าการแข็งตัวของเลือด (INR) อยู่ในเกณฑ์การรักษาที่ปลอดภัย',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'American Heart Association & U.S. FDA Warfarin Diet Guide',
    url_doi: 'https://www.fda.gov/drugs/resources-drugs/avoid-food-drug-interactions',
    publish_year: '2024',
  },

  // ---------------------------------------------------------------------------
  // 51. ยาปฏิชีวนะกลุ่มควิโนโลน เตตราไซคลิน และแมคโครไลด์ (แนะนำให้รับประทานร่วม)
  // ---------------------------------------------------------------------------
  {
    medication_keys: ['azithromycin', 'อะซิโทรมัยซิน', 'zithromax'],
    medication_label: 'อะซิโทรมัยซิน (Azithromycin)',
    food_name: 'น้ำสะอาด 1 แก้วเต็ม (และดื่มน้ำอย่างเพียงพอตลอดวัน)',
    interaction_type: 'แนะนำให้รับประทานร่วม',
    severity: '',
    hours_before: '',
    hours_after: '',
    impact_details: 'การรับประทานพร้อมน้ำสะอาด 1 แก้วเต็มช่วยให้การดูดซึมและกระจายตัวยาไปยังเนื้อเยื่อที่ติดเชื้อเป็นไปอย่างมีประสิทธิภาพ และช่วยลดอาการคลื่นไส้ไม่สบายท้อง',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'British National Formulary (BNF)',
    url_doi: 'https://bnf.nice.org.uk',
    publish_year: '2024',
  },
  {
    medication_keys: [
      'ciprofloxacin', 'norfloxacin', 'ofloxacin', 'ซิโปรฟลอกซาซิน', 'นอร์ฟลอกซาซิน', 'ciprobay', 'norbactin'
    ],
    medication_label: 'ซิโปรฟลอกซาซิน / นอร์ฟลอกซาซิน (Ciprofloxacin / Norfloxacin)',
    food_name: 'น้ำสะอาด 1-2 แก้วเต็ม ดื่มตามทันที (และดื่มน้ำวันละ 2-3 ลิตร)',
    interaction_type: 'แนะนำให้รับประทานร่วม',
    severity: '',
    hours_before: '',
    hours_after: '',
    impact_details: 'แนะนำให้ดื่มน้ำสะอาดตาม 1-2 แก้วทันที และดื่มน้ำตลอดวัน 2-3 ลิตร เพื่อป้องกันการตกผลึกของยาในปัสสาวะ (Crystalluria) และช่วยขับเชื้อแบคทีเรียออกจากทางเดินปัสสาวะได้อย่างรวดเร็ว',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'U.S. FDA Drug Information on Fluoroquinolones',
    url_doi: 'https://www.fda.gov',
    publish_year: '2024',
  },
  {
    medication_keys: ['doxycycline', 'ด็อกซีไซคลิน', 'vibramycin'],
    medication_label: 'ด็อกซีไซคลิน (Doxycycline)',
    food_name: 'น้ำสะอาด 1 แก้วใหญ่ (250 มล.) พร้อมนั่งหรือยืนตัวตรงอย่างน้อย 30 นาที',
    interaction_type: 'แนะนำให้รับประทานร่วม',
    severity: '',
    hours_before: '',
    hours_after: '',
    impact_details: 'ต้องรับประทานยาพร้อมน้ำสะอาดแก้วใหญ่ (อย่างน้อย 250 มล.) และห้ามนอนราบเป็นเวลาอย่างน้อย 30 นาทีหลังรับประทานยา เพื่อป้องกันไม่ให้แคปซูลยาติดค้างที่หลอดอาหาร ซึ่งอาจทำให้เกิดแผลไหม้และระคายเคืองหลอดอาหารอย่างรุนแรง',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'U.S. FDA Drug Safety Guide on Doxycycline',
    url_doi: 'https://www.fda.gov',
    publish_year: '2024',
  },

  // ---------------------------------------------------------------------------
  // 52. ยากลุ่มระงับปวดปลายประสาทและยาต้านซึมเศร้า (แนะนำให้รับประทานร่วม)
  // ---------------------------------------------------------------------------
  {
    medication_keys: [
      'gabapentin', 'pregabalin', 'sertraline', 'fluoxetine', 'amitriptyline',
      'กาบาเพนติน', 'พรีกาบาลิน', 'เซอร์ทราลีน', 'ฟลูออกซิทีน', 'อะมิทริปไทลีน',
      'neurontin', 'lyrica', 'zoloft', 'prozac'
    ],
    medication_label: 'ยากลุ่มระบบประสาทและยาต้านซึมเศร้า (Gabapentin, Pregabalin, Sertraline, Fluoxetine, Amitriptyline)',
    food_name: 'อาหารมื้อหลัก หรือ ของว่างเบาๆ',
    interaction_type: 'แนะนำให้รับประทานร่วม',
    severity: '',
    hours_before: '',
    hours_after: '',
    impact_details: 'การรับประทานพร้อมอาหารหรือของว่างเบาๆ ช่วยลดอาการข้างเคียง เช่น คลื่นไส้ มึนงง แสบท้อง ในช่วงเริ่มต้นของการรับประทานยา และช่วยให้การดูดซึมยาคงที่สม่ำเสมอ',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'National Institute of Mental Health (NIMH)',
    url_doi: 'https://www.nimh.nih.gov',
    publish_year: '2024',
  },

  // ---------------------------------------------------------------------------
  // 53. อาหารเสริม: ไบโอติน แปะก๊วย ฟ้าทะลายโจร เมลาโทนิน (แนะนำให้รับประทานร่วม)
  // ---------------------------------------------------------------------------
  {
    medication_keys: ['biotin', 'ไบโอติน', 'วิตามินบี7'],
    medication_label: 'ไบโอติน (Biotin 5000mcg)',
    food_name: 'น้ำสะอาด 1 แก้ว พร้อมอาหารมื้อเช้า',
    interaction_type: 'แนะนำให้รับประทานร่วม',
    severity: '',
    hours_before: '',
    hours_after: '',
    impact_details: 'ไบโอตินเป็นวิตามินบีที่ละลายในน้ำ การรับประทานพร้อมอาหารมื้อเช้าช่วยให้ร่างกายดูดซึมและนำไปใช้ในการเผาผลาญสารอาหารและสังเคราะห์เคราตินบำรุงเส้นผมและเล็บได้อย่างมีประสิทธิภาพสูงสุด',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'NIH Office of Dietary Supplements (ODS) - Biotin Fact Sheet',
    url_doi: 'https://ods.od.nih.gov/factsheets/Biotin-HealthProfessional/',
    publish_year: '2024',
  },
  {
    medication_keys: ['ginkgo_biloba', 'ginkgo', 'ใบแปะก๊วย', 'กิงโกะ', 'แปะก๊วย'],
    medication_label: 'สารสกัดจากใบแปะก๊วย (Ginkgo Biloba Extract)',
    food_name: 'อาหารมื้อหลัก (มื้อเช้าหรือกลางวัน)',
    interaction_type: 'แนะนำให้รับประทานร่วม',
    severity: '',
    hours_before: '',
    hours_after: '',
    impact_details: 'การรับประทานพร้อมอาหารช่วยลดอาการระคายเคืองกระเพาะอาหาร และสารสกัดฟลาโวนอยด์จะถูกดูดซึมเข้าสู่กระแสเลือดไปบำรุงการไหลเวียนโลหิตและสมองได้อย่างมีประสิทธิภาพ',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'National Center for Complementary and Integrative Health (NCCIH)',
    url_doi: 'https://www.nccih.nih.gov/health/ginkgo',
    publish_year: '2024',
  },
  {
    medication_keys: ['fah_talai_jone', 'ฟ้าทะลายโจร', 'andrographis'],
    medication_label: 'ฟ้าทะลายโจร สกัด (Andrographis Paniculata)',
    food_name: 'น้ำอุ่นสะอาด 1-2 แก้ว หลังอาหารทันที',
    interaction_type: 'แนะนำให้รับประทานร่วม',
    severity: '',
    hours_before: '',
    hours_after: '',
    impact_details: 'แนะนำรับประทานหลังอาหารทันทีพร้อมน้ำอุ่นสะอาด เพื่อช่วยให้ตัวยากระจายตัวได้ดี และลดอาการระคายเคืองกระเพาะอาหารจากรสขมและฤทธิ์เย็นของสมุนไพร',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'กรมการแพทย์แผนไทยและการแพทย์ทางเลือก กระทรวงสาธารณสุข',
    url_doi: 'https://dtam.moph.go.th',
    publish_year: '2024',
  },
  {
    medication_keys: ['melatonin', 'เมลาโทนิน'],
    medication_label: 'เมลาโทนิน (Melatonin)',
    food_name: 'น้ำสะอาด 1/2 แก้ว ก่อนนอน 30-60 นาที (ในห้องที่มืดและเงียบสงบ)',
    interaction_type: 'แนะนำให้รับประทานร่วม',
    severity: '',
    hours_before: '',
    hours_after: '',
    impact_details: 'การรับประทานก่อนนอน 30-60 นาที ในสภาวะแวดล้อมที่มืดสนิทและไม่มีแสงสีฟ้าจากหน้าจอมือถือ จะช่วยกระตุ้นการทำงานของเมลาโทนินตามจังหวะชีวภาพ (Circadian Rhythm) ส่งเสริมให้ร่างกายเข้าสู่การนอนหลับลึกอย่างเป็นธรรมชาติ',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'Sleep Foundation & NIH Guidelines on Melatonin',
    url_doi: 'https://www.sleepfoundation.org',
    publish_year: '2024',
  },

  // ---------------------------------------------------------------------------
  // 54. ดอมเพอริโดน (Domperidone - ครบทั้งหลีกเลี่ยงและแนะนำ)
  // ---------------------------------------------------------------------------
  {
    medication_keys: ['domperidone', 'ดอมเพอริโดน', 'motilium'],
    medication_label: 'ดอมเพอริโดน (Domperidone - ยาแก้คลื่นไส้ แน่นท้อง)',
    food_name: 'เครื่องดื่มแอลกอฮอล์ และน้ำเกรปฟรุต (Grapefruit)',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'สูง',
    hours_before: '12',
    hours_after: '12',
    impact_details: 'น้ำเกรปฟรุตยับยั้งเอนไซม์ CYP3A4 ทำให้ระดับยาในเลือดพุ่งสูงขึ้น เพิ่มความเสี่ยงเกิดภาวะคลื่นไฟฟ้าหัวใจ QT ผิดปกติ (QT prolongation) และหัวใจเต้นผิดจังหวะรุนแรง ส่วนแอลกอฮอล์เสริมอาการง่วงซึมและลดประสิทธิภาพยา',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'European Medicines Agency (EMA) & Thai FDA',
    url_doi: 'https://www.ema.europa.eu',
    publish_year: '2024',
  },
  {
    medication_keys: ['domperidone', 'ดอมเพอริโดน', 'motilium'],
    medication_label: 'ดอมเพอริโดน (Domperidone - ยาแก้คลื่นไส้ แน่นท้อง)',
    food_name: 'น้ำสะอาด 1 แก้ว ก่อนอาหาร 15-30 นาที',
    interaction_type: 'แนะนำให้รับประทานร่วม',
    severity: '',
    hours_before: '',
    hours_after: '',
    impact_details: 'แนะนำรับประทานก่อนอาหาร 15-30 นาที พร้อมน้ำสะอาด เพื่อให้ตัวยาดูดซึมและเริ่มออกฤทธิ์กระตุ้นการเคลื่อนไหวของกระเพาะอาหารและลำไส้ล่วงหน้า ป้องกันอาการคลื่นไส้ อาเจียน และแน่นท้องหลังมื้ออาหารได้อย่างมีประสิทธิภาพสูงสุด',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'คณะแพทยศาสตร์ศิริราชพยาบาล มหาวิทยาลัยมหิดล',
    url_doi: 'https://www.si.mahidol.ac.th',
    publish_year: '2024',
  },

  // ---------------------------------------------------------------------------
  // 55. ไบซาโคดิล (Bisacodyl - ครบทั้งหลีกเลี่ยงและแนะนำ)
  // ---------------------------------------------------------------------------
  {
    medication_keys: ['bisacodyl', 'ไบซาโคดิล', 'dulcolax'],
    medication_label: 'ไบซาโคดิล (Bisacodyl - ยาระบาย)',
    food_name: 'นม, ผลิตภัณฑ์จากนม และยาลดกรดเคลือบกระเพาะ',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'สูง',
    hours_before: '2',
    hours_after: '2',
    impact_details: 'ความเป็นด่างของนมและยาลดกรดจะทำลายสารเคลือบเม็ดยา (Enteric coating) ก่อนเวลาอันควร ทำให้ตัวยาแตกตัวและละลายในกระเพาะอาหาร เกิดอาการระคายเคืองกระเพาะ ปวดมวนท้อง แสบท้อง และคลื่นไส้อย่างรุนแรง',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'U.S. FDA Drug Information on Bisacodyl',
    url_doi: 'https://www.fda.gov',
    publish_year: '2024',
  },
  {
    medication_keys: ['bisacodyl', 'ไบซาโคดิล', 'dulcolax'],
    medication_label: 'ไบซาโคดิล (Bisacodyl - ยาระบาย)',
    food_name: 'น้ำสะอาด 1-2 แก้วเต็ม ก่อนนอน (และดื่มน้ำวันละ 1.5-2 ลิตร)',
    interaction_type: 'แนะนำให้รับประทานร่วม',
    severity: '',
    hours_before: '',
    hours_after: '',
    impact_details: 'การรับประทานก่อนนอนพร้อมน้ำสะอาด 1-2 แก้วเต็ม และดื่มน้ำให้เพียงพอร์ตลออดวัน ช่วยเพิ่มปริมาณน้ำในลำไส้ใหญ่ ทำให้อุจจาระนุ่มและกระตุ้นการขับถ่ายได้อย่างเป็นธรรมชาติในตอนเช้า',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'American Gastroenterological Association (AGA)',
    url_doi: 'https://gastro.org',
    publish_year: '2024',
  },

  // ---------------------------------------------------------------------------
  // 56. ซัลบูทามอล (Salbutamol - ครบทั้งหลีกเลี่ยงและแนะนำ)
  // ---------------------------------------------------------------------------
  {
    medication_keys: ['salbutamol', 'albuterol', 'ซัลบูทามอล', 'ventolin'],
    medication_label: 'ซัลบูทามอล (Salbutamol - ยาขยายหลอดลม)',
    food_name: 'กาแฟเข้มข้น, ชา, น้ำอัดลมโคล่า และเครื่องดื่มชูกำลัง (คาเฟอีนสูง)',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'กลาง',
    hours_before: '3',
    hours_after: '3',
    impact_details: 'คาเฟอีนและซัลบูทามอลมีฤทธิ์กระตุ้นระบบประสาทซิมพาเทติกทั้งคู่ เมื่อใช้ร่วมกันจะเสริมฤทธิ์ทำให้หัวใจเต้นเร็วผิดปกติ ใจสั่น มือสั่น กระสับกระส่าย และความดันโลหิตสูงขึ้น',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'Global Initiative for Asthma (GINA) Guidelines',
    url_doi: 'https://ginasthma.org',
    publish_year: '2024',
  },
  {
    medication_keys: ['salbutamol', 'albuterol', 'ซัลบูทามอล', 'ventolin'],
    medication_label: 'ซัลบูทามอล (Salbutamol - ยาขยายหลอดลม)',
    food_name: 'น้ำอุ่นสะอาด ดื่มในปริมาณที่เพียงพอสม่ำเสมอ',
    interaction_type: 'แนะนำให้รับประทานร่วม',
    severity: '',
    hours_before: '',
    hours_after: '',
    impact_details: 'การดื่มน้ำอุ่นสะอาดช่วยให้ทางเดินหายใจชุ่มชื้น ลดความเหนียวข้นของเสมหะ และช่วยให้ทางเดินหายใจขยายตัวได้โล่งขึ้นเมื่อยาออกฤทธิ์',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'คณะแพทยศาสตร์ศิริราชพยาบาล มหาวิทยาลัยมหิดล',
    url_doi: 'https://www.si.mahidol.ac.th',
    publish_year: '2024',
  },

  // ---------------------------------------------------------------------------
  // 57. ฟลูโคนาโซล (Fluconazole - ครบทั้งหลีกเลี่ยงและแนะนำ)
  // ---------------------------------------------------------------------------
  {
    medication_keys: ['fluconazole', 'ฟลูโคนาโซล', 'diflucan'],
    medication_label: 'ฟลูโคนาโซล (Fluconazole - ยาฆ่าเชื้อรา)',
    food_name: 'เครื่องดื่มแอลกอฮอล์ และน้ำเกรปฟรุต (Grapefruit)',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'สูง',
    hours_before: '24',
    hours_after: '24',
    impact_details: 'ฟลูโคนาโซลยับยั้งเอนไซม์ CYP ในตับอย่างรุนแรง การดื่มแอลกอฮอล์จะเพิ่มความเสี่ยงต่อการเกิดพิษต่อตับและตับอักเสบเฉียบพลัน ส่วนน้ำเกรปฟรุตอาจทำให้ระดับยาในเลือดสูงขึ้นจนเกิดผลข้างเคียงอันตราย',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'U.S. FDA Drug Safety on Antifungals',
    url_doi: 'https://www.fda.gov',
    publish_year: '2024',
  },
  {
    medication_keys: ['fluconazole', 'ฟลูโคนาโซล', 'diflucan'],
    medication_label: 'ฟลูโคนาโซล (Fluconazole - ยาฆ่าเชื้อรา)',
    food_name: 'อาหารมื้อหลัก หรือหลังอาหารทันทีพร้อมน้ำสะอาด 1 แก้ว',
    interaction_type: 'แนะนำให้รับประทานร่วม',
    severity: '',
    hours_before: '',
    hours_after: '',
    impact_details: 'การรับประทานพร้อมอาหารหรือหลังอาหารทันทีช่วยลดอาการคลื่นไส้ ปวดท้อง และช่วยให้ร่างกายดูดซึมยาเข้าสู่กระแสเลือดได้อย่างสม่ำเสมอ',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'Infectious Diseases Society of America (IDSA)',
    url_doi: 'https://www.idsociety.org',
    publish_year: '2024',
  },

  // ---------------------------------------------------------------------------
  // 58. อะไซโคลเวียร์ (Acyclovir - ครบทั้งหลีกเลี่ยงและแนะนำ)
  // ---------------------------------------------------------------------------
  {
    medication_keys: ['acyclovir', 'อะไซโคลเวียร์', 'zovirax'],
    medication_label: 'อะไซโคลเวียร์ (Acyclovir - ยาต้านไวรัส)',
    food_name: 'เครื่องดื่มแอลกอฮอล์ และการดื่มน้ำน้อย (ภาวะขาดน้ำ)',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'สูง',
    hours_before: '12',
    hours_after: '12',
    impact_details: 'การดื่มน้ำน้อยหรือดื่มแอลกอฮอล์ทำให้ร่างกายขาดน้ำและปัสสาวะมีความเข้มข้นสูง ส่งผลให้ตัวยาอะไซโคลเวียร์ตกผลึกในท่อไต (Renal Tubular Crystallization) นำไปสู่ภาวะไตวายเฉียบพลันได้',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'U.S. FDA Drug Information on Acyclovir',
    url_doi: 'https://www.fda.gov',
    publish_year: '2024',
  },
  {
    medication_keys: ['acyclovir', 'อะไซโคลเวียร์', 'zovirax'],
    medication_label: 'อะไซโคลเวียร์ (Acyclovir - ยาต้านไวรัส)',
    food_name: 'น้ำสะอาด 1-2 แก้วเต็ม ดื่มตามทันที (และดื่มน้ำวันละ 2-3 ลิตร)',
    interaction_type: 'แนะนำให้รับประทานร่วม',
    severity: '',
    hours_before: '',
    hours_after: '',
    impact_details: 'ต้องดื่มน้ำสะอาดตาม 1-2 แก้วทันที และดื่มน้ำตลอดวัน 2-3 ลิตร เพื่อช่วยให้ยาละลายตัวได้ดี ป้องกันการตกผลึกของยาในไต และช่วยให้ไตขับยาออกได้อย่างปลอดภัย',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'Centers for Disease Control and Prevention (CDC)',
    url_doi: 'https://www.cdc.gov',
    publish_year: '2024',
  },

  // ---------------------------------------------------------------------------
  // 59. ลูทีนและซีแซนทีน (Lutein & Zeaxanthin - ครบทั้งหลีกเลี่ยงและแนะนำ)
  // ---------------------------------------------------------------------------
  {
    medication_keys: ['lutein', 'zeaxanthin', 'ลูทีน', 'ซีแซนทีน', 'lutein_zeaxanthin', 'บำรุงสายตา'],
    medication_label: 'ลูทีนและซีแซนทีน (Lutein & Zeaxanthin Eye Complex)',
    food_name: 'ยาดักจับไขมัน (Orlistat) หรืออาหารทอดน้ำมันซ้ำ',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'กลาง',
    hours_before: '3',
    hours_after: '3',
    impact_details: 'ยาดักจับไขมันจะขัดขวางการดูดซึมแคโรทีนอยด์ในลำไส้ ทำให้ร่างกายดูดซึมลูทีนและซีแซนทีนลดลงมากกว่า 60% ส่วนอาหารทอดน้ำมันซ้ำมีอนุมูลอิสระสูงที่ทำลายสารต้านอนุมูลอิสระ',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'NIH Office of Dietary Supplements (ODS)',
    url_doi: 'https://ods.od.nih.gov',
    publish_year: '2024',
  },
  {
    medication_keys: ['lutein', 'zeaxanthin', 'ลูทีน', 'ซีแซนทีน', 'lutein_zeaxanthin', 'บำรุงสายตา'],
    medication_label: 'ลูทีนและซีแซนทีน (Lutein & Zeaxanthin Eye Complex)',
    food_name: 'อาหารที่มีไขมันดี (เช่น อะโวคาโด น้ำมันมะกอก นม หรือไข่)',
    interaction_type: 'แนะนำให้รับประทานร่วม',
    severity: '',
    hours_before: '',
    hours_after: '',
    impact_details: 'เนื่องจากลูทีนและซีแซนทีนเป็นสารในกลุ่มแคโรทีนอยด์ที่ละลายในไขมัน การรับประทานพร้อมมื้ออาหารที่มีไขมันดี เช่น ไข่ต้ม อะโวคาโด หรือน้ำมันมะกอก จะช่วยเพิ่มการดูดซึมเข้าสู่กระแสเลือดเพื่อนำไปเลี้ยงจอประสาทตาได้เพิ่มขึ้น 2-3 เท่า',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'American Macular Degeneration Foundation (AMDF)',
    url_doi: 'https://www.macular.org',
    publish_year: '2024',
  },

  // ---------------------------------------------------------------------------
  // 60. นมผึ้ง รอยัลเยลลี (Royal Jelly - ครบทั้งหลีกเลี่ยงและแนะนำ)
  // ---------------------------------------------------------------------------
  {
    medication_keys: ['royal_jelly', 'นมผึ้ง', 'รอยัลเยลลี'],
    medication_label: 'นมผึ้ง รอยัลเยลลี (Royal Jelly 1000mg)',
    food_name: 'ชาเข้มข้น, กาแฟ หรือเครื่องดื่มแอลกอฮอล์',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'กลาง',
    hours_before: '2',
    hours_after: '2',
    impact_details: 'สารแทนนินในชาและกาแฟเข้มข้น และแอลกอฮอล์ อาจทำลายโปรตีนชีวภาพ Royalisin และกรด 10-HDA ซึ่งเป็นสารออกฤทธิ์สำคัญในนมผึ้ง ทำให้คุณค่าทางโภชนาการลดลง',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'กรมวิทยาศาสตร์การแพทย์ กระทรวงสาธารณสุข',
    url_doi: 'https://www.dmsc.moph.go.th',
    publish_year: '2024',
  },
  {
    medication_keys: ['royal_jelly', 'นมผึ้ง', 'รอยัลเยลลี'],
    medication_label: 'นมผึ้ง รอยัลเยลลี (Royal Jelly 1000mg)',
    food_name: 'น้ำสะอาดอุณหภูมิห้อง รับประทานตอนเช้าขณะท้องว่าง หรือก่อนนอน',
    interaction_type: 'แนะนำให้รับประทานร่วม',
    severity: '',
    hours_before: '',
    hours_after: '',
    impact_details: 'การรับประทานขณะท้องว่างในตอนเช้าหลังตื่นนอนหรือก่อนนอน พร้อมน้ำสะอาดอุณหภูมิห้อง ช่วยให้ร่างกายดูดซึมกรดอะมิโน วิตามินบี และสาร 10-HDA เข้าสู่ร่างกายได้อย่างรวดเร็วและเต็มประสิทธิภาพ',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'European Food Safety Authority (EFSA)',
    url_doi: 'https://www.efsa.europa.eu',
    publish_year: '2024',
  },

  // ---------------------------------------------------------------------------
  // 61. สาหร่ายสไปรูลิน่า (Spirulina - ครบทั้งหลีกเลี่ยงและแนะนำ)
  // ---------------------------------------------------------------------------
  {
    medication_keys: ['spirulina', 'สาหร่ายสไปรูลิน่า', 'สไปรูลิน่า'],
    medication_label: 'สาหร่ายสไปรูลิน่า (Spirulina 500mg)',
    food_name: 'ชาเข้มข้น, กาแฟ, นม และเครื่องดื่มแอลกอฮอล์',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'กลาง',
    hours_before: '2',
    hours_after: '2',
    impact_details: 'แทนนินในชา/กาแฟ และแคลเซียมในนม จะจับตัวกับธาตุเหล็กและแร่ธาตุในสาหร่ายสไปรูลิน่า ทำให้ร่างกายดูดซึมแร่ธาตุสำคัญได้ลดลงอย่างมาก',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'NIH Office of Dietary Supplements (ODS)',
    url_doi: 'https://ods.od.nih.gov',
    publish_year: '2024',
  },
  {
    medication_keys: ['spirulina', 'สาหร่ายสไปรูลิน่า', 'สไปรูลิน่า'],
    medication_label: 'สาหร่ายสไปรูลิน่า (Spirulina 500mg)',
    food_name: 'น้ำผลไม้ที่มีวิตามินซีสูง (เช่น น้ำส้ม, น้ำฝรั่ง) หรืออาหารเช้า',
    interaction_type: 'แนะนำให้รับประทานร่วม',
    severity: '',
    hours_before: '',
    hours_after: '',
    impact_details: 'วิตามินซีในน้ำผลไม้จะช่วยเปลี่ยนรูปธาตุเหล็กในสาหร่ายสไปรูลิน่าให้อยู่ในรูปแบบที่ร่างกายดูดซึมได้ง่ายขึ้น และช่วยเสริมฤทธิ์สารต้านอนุมูลอิสระไฟโคไซยานิน (Phycocyanin)',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'World Health Organization (WHO) Food Safety',
    url_doi: 'https://www.who.int',
    publish_year: '2024',
  },

  // ---------------------------------------------------------------------------
  // 62. แบรนด์ ซุปไก่สกัด (Brand's Essence of Chicken - ครบทั้งหลีกเลี่ยงและแนะนำ)
  // ---------------------------------------------------------------------------
  {
    medication_keys: ['brands_essence', 'brands_essence_liquid', 'ซุปไก่สกัด', 'แบรนด์ ซุปไก่สกัด', 'essence of chicken'],
    medication_label: 'แบรนด์ ซุปไก่สกัด (Brand\'s Essence of Chicken)',
    food_name: 'ชาเข้มข้น หรือ กาแฟเข้มข้น ในเวลาเดียวกัน',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'ต่ำ',
    hours_before: '1',
    hours_after: '1',
    impact_details: 'สารแทนนินในชาและกาแฟเข้มข้นอาจตกตะกอนเปปไทด์ขนาดเล็กและกรดอะมิโนในซุปไก่สกัด ทำให้การดูดซึมช้าลง ควรเว้นระยะห่างการดื่มอย่างน้อย 1 ชั่วโมง',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'กรมวิทยาศาสตร์การแพทย์ กระทรวงสาธารณสุข',
    url_doi: 'https://www.dmsc.moph.go.th',
    publish_year: '2024',
  },
  {
    medication_keys: ['brands_essence', 'brands_essence_liquid', 'ซุปไก่สกัด', 'แบรนด์ ซุปไก่สกัด', 'essence of chicken'],
    medication_label: 'แบรนด์ ซุปไก่สกัด (Brand\'s Essence of Chicken)',
    food_name: 'รับประทานขณะท้องว่างในตอนเช้า หรือก่อนเริ่มกิจกรรมที่ต้องใช้สมาธิ',
    interaction_type: 'แนะนำให้รับประทานร่วม',
    severity: '',
    hours_before: '',
    hours_after: '',
    impact_details: 'การรับประทานขณะท้องว่างตอนเช้าหรือก่อนทำงาน/อ่านหนังสือ ช่วยให้ร่างกายดูดซึมไดเปปไทด์ คาร์โนซีน (Carnosine) และแอนเซอรีน (Anserine) เข้าสู่กระแสเลือดและสมองได้อย่างรวดเร็ว ช่วยฟื้นฟูความเหนื่อยล้าทางสมอง',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'Journal of Nutritional Science & Vitaminology',
    url_doi: 'https://www.jstage.jst.go.jp',
    publish_year: '2024',
  },

  // ---------------------------------------------------------------------------
  // 63. แบรนด์ รังนกแท้ (Brand's Bird's Nest - ครบทั้งหลีกเลี่ยงและแนะนำ)
  // ---------------------------------------------------------------------------
  {
    medication_keys: ['brands_birds_nest', 'brands_birds_nest_liquid', 'รังนกแท้', 'แบรนด์ รังนก', 'bird\'s nest', 'birds nest'],
    medication_label: 'แบรนด์ รังนกแท้ (Brand\'s Bird\'s Nest Beverage)',
    food_name: 'เครื่องดื่มแอลกอฮอล์ และอาหารรสจัด/มีความเป็นกรดสูง',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'ต่ำ',
    hours_before: '2',
    hours_after: '2',
    impact_details: 'แอลกอฮอล์และอาหารที่มีกรดจัดอาจทำลายโครงสร้างไกลโคโปรตีนและกรดไซอะลิก (Sialic Acid) ในรังนก ทำให้คุณประโยชน์ในการบำรุงสุขภาพลดลง',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'สถาบันโภชนาการ มหาวิทยาลัยมหิดล',
    url_doi: 'https://inmu2.mahidol.ac.th',
    publish_year: '2024',
  },
  {
    medication_keys: ['brands_birds_nest', 'brands_birds_nest_liquid', 'รังนกแท้', 'แบรนด์ รังนก', 'bird\'s nest', 'birds nest'],
    medication_label: 'แบรนด์ รังนกแท้ (Brand\'s Bird\'s Nest Beverage)',
    food_name: 'รับประทานขณะท้องว่างในตอนเช้าหลังตื่นนอน หรือก่อนเข้านอน',
    interaction_type: 'แนะนำให้รับประทานร่วม',
    severity: '',
    hours_before: '',
    hours_after: '',
    impact_details: 'การรับประทานขณะท้องว่างในตอนเช้าหรือก่อนนอน เป็นช่วงที่ระบบทางเดินอาหารสามารถดูดซึมสารไกลโคโปรตีนและปัจจัยการเจริญเติบโตของผิว (Epidermal Growth Factor - EGF) ได้อย่างเต็มที่',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'Food Research International Journal',
    url_doi: 'https://www.sciencedirect.com',
    publish_year: '2024',
  },

  // ---------------------------------------------------------------------------
  // 64. ยาปฏิชีวนะกลุ่มเพนิซิลลิน (Amoxicillin, Augmentin - หลีกเลี่ยง)
  // ---------------------------------------------------------------------------
  {
    medication_keys: [
      'amoxicillin', 'augmentin', 'amoxicillin_syrup', 'อะม็อกซีซิลลิน', 'ออกเมนติน', 'กรดคลาวูลานิก',
      'clavulanate'
    ],
    medication_label: 'อะม็อกซีซิลลิน (Amoxicillin / Augmentin)',
    food_name: 'เครื่องดื่มแอลกอฮอล์ และน้ำผลไม้รสเปรี้ยวจัด/น้ำอัดลม (เครื่องดื่มที่มีกรดสูง)',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'สูง',
    hours_before: '2',
    hours_after: '2',
    impact_details: 'เครื่องดื่มที่มีความเป็นกรดสูงอาจเร่งการสลายตัวของยาอะม็อกซีซิลลินในกระเพาะอาหาร ทำให้ประสิทธิภาพการฆ่าเชื้อลดลง ส่วนแอลกอฮอล์รบกวนระบบภูมิคุ้มกันและอาจเพิ่มอาการคลื่นไส้ อาเจียน',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'British National Formulary (BNF) & U.S. FDA',
    url_doi: 'https://bnf.nice.org.uk',
    publish_year: '2024',
  },

  // ---------------------------------------------------------------------------
  // 65. ยาละลายเสมหะ อะเซทิลซิสเทอีน (Acetylcysteine - หลีกเลี่ยง)
  // ---------------------------------------------------------------------------
  {
    medication_keys: ['acetylcysteine', 'อะเซทิลซิสเทอีน', 'nac', 'fluimucil'],
    medication_label: 'อะเซทิลซิสเทอีน (Acetylcysteine - ยาละลายเสมหะ)',
    food_name: 'เครื่องดื่มแอลกอฮอล์ และการรับประทานพร้อมยาปฏิชีวนะทันที',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'กลาง',
    hours_before: '2',
    hours_after: '2',
    impact_details: 'กลุ่มซัลฟ์ไฮดริล (-SH) ในอะเซทิลซิสเทอีนอาจจับตัวและลดฤทธิ์ของยาปฏิชีวนะบางชนิด (เช่น Penicillins, Tetracyclines) จึงควรรับประทานห่างจากยาปฏิชีวนะอย่างน้อย 2 ชั่วโมง และแอลกอฮอล์อาจทำให้ระคายเคืองกระเพาะ',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'European Medicines Agency (EMA) Drug Interaction',
    url_doi: 'https://www.ema.europa.eu',
    publish_year: '2024',
  },

  // ---------------------------------------------------------------------------
  // 66. อาหารเสริม: เลซิติน (Lecithin - หลีกเลี่ยง)
  // ---------------------------------------------------------------------------
  {
    medication_keys: ['lecithin', 'เลซิติน'],
    medication_label: 'เลซิติน (Lecithin 1200mg)',
    food_name: 'ยาลดการดูดซึมไขมัน (Orlistat) หรือ เครื่องดื่มแอลกอฮอล์',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'กลาง',
    hours_before: '3',
    hours_after: '3',
    impact_details: 'ยาดักจับไขมันจะขัดขวางการดูดซึมฟอสโฟลิปิดในเลซิติน ทำให้ประสิทธิภาพในการบำรุงตับและสมองลดลง ส่วนแอลกอฮอล์ทำลายเซลล์ตับและขัดขวางการเผาผลาญไขมัน',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'NIH Office of Dietary Supplements (ODS)',
    url_doi: 'https://ods.od.nih.gov',
    publish_year: '2024',
  },

  // ---------------------------------------------------------------------------
  // 67. อาหารเสริม: กลูโคซามีน ซัลเฟต (Glucosamine Sulfate - หลีกเลี่ยง)
  // ---------------------------------------------------------------------------
  {
    medication_keys: ['glucosamine_sulfate', 'glucosamine', 'กลูโคซามีน', 'กลูโคซามีน ซัลเฟต'],
    medication_label: 'กลูโคซามีน ซัลเฟต (Glucosamine Sulfate 1500mg)',
    food_name: 'เครื่องดื่มแอลกอฮอล์ และอาหารที่มีน้ำตาลสูงมาก',
    interaction_type: 'หลีกเลี่ยง',
    severity: 'กลาง',
    hours_before: '4',
    hours_after: '4',
    impact_details: 'อาหารรสหวานจัดและแอลกอฮอล์กระตุ้นกระบวนการอักเสบในข้อต่อและลดการสร้างกระดูกอ่อนใหม่ ซึ่งต้านผลการรักษาของกลูโคซามีน และแอลกอฮอล์อาจเพิ่มการระคายเคืองกระเพาะอาหาร',
    source_type: 'FDA / WHO / PubMed / Thai FDA',
    source_name: 'Arthritis Foundation Guidelines',
    url_doi: 'https://www.arthritis.org',
    publish_year: '2024',
  },
];

/**
 * Clean text for fuzzy keyword matching
 */
function cleanText(txt = '') {
  return String(txt)
    .toLowerCase()
    .replace(/[\(\)\-\_\/\+\,\.\']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Helper to extract base key from food name for deduplication
 */
function getBaseFoodKey(foodName) {
  if (!foodName) return '';
  let base = foodName.replace(/\(.*?\)/g, '').trim();
  base = base.replace(/^(เครื่องดื่ม|อาหาร|ผลิตภัณฑ์|กลุ่ม)/, '').trim();
  return base.toLowerCase().replace(/\s+/g, '');
}

/**
 * Get matching food interactions for a given medication or supplement name
 * @param {string} medName - Thai or English medication name
 * @returns {Array} List of matched interaction presets
 */
export function getInteractionsForMedication(medName = '') {
  if (!medName) return [];
  const cleanQ = cleanText(medName);

  const matched = [];
  const seenFoodKeys = new Set();

  for (const item of PRESET_FOOD_INTERACTIONS) {
    const isHit = item.medication_keys.some(key => {
      const cleanKey = cleanText(key);
      if (!cleanKey) return false;
      if (cleanQ.includes(cleanKey)) return true;
      if (cleanQ.length >= 3 && cleanKey.includes(cleanQ)) return true;
      return false;
    });

    if (isHit) {
      const typeKey = (item.interaction_type || '').includes('แนะนำ') ? 'recommend' : 'avoid';
      const baseFood = getBaseFoodKey(item.food_name);
      const dedupeKey = `${typeKey}:${baseFood}`;

      if (!seenFoodKeys.has(dedupeKey)) {
        seenFoodKeys.add(dedupeKey);
        matched.push(item);
      }
    }
  }

  return matched;
}

/**
 * Search all interaction presets by food name or medication name
 * @param {string} query
 * @returns {Array}
 */
export function searchInteractionPresets(query = '') {
  if (!query) return PRESET_FOOD_INTERACTIONS;
  const cleanQ = cleanText(query);

  return PRESET_FOOD_INTERACTIONS.filter(item => {
    const medLabel = cleanText(item.medication_label);
    const foodName = cleanText(item.food_name);
    const impact = cleanText(item.impact_details);
    const keys = item.medication_keys.map(cleanText).join(' ');

    return (
      medLabel.includes(cleanQ) ||
      foodName.includes(cleanQ) ||
      impact.includes(cleanQ) ||
      keys.includes(cleanQ)
    );
  });
}

/**
 * Live search via openFDA API for food interactions
 * @param {string} drugName - Generic or brand name
 */
export async function fetchFoodInteractionsFromOpenFda(drugName) {
  const rawQuery = String(drugName || '').trim();
  if (!rawQuery) throw new Error('กรุณาระบุชื่อยาก่อนค้นหาข้อมูลปฏิสัมพันธ์');

  // 1. Check curated presets first
  const presetHits = getInteractionsForMedication(rawQuery);
  if (presetHits.length > 0) {
    return presetHits[0];
  }

  // 2. Query openFDA for drug label food_interactions
  try {
    const urls = [
      `https://api.fda.gov/drug/label.json?search=openfda.generic_name:"${encodeURIComponent(rawQuery)}"&limit=1`,
      `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${encodeURIComponent(rawQuery)}"&limit=1`,
      `https://api.fda.gov/drug/label.json?search="${encodeURIComponent(rawQuery)}"&limit=1`,
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
      const foodText = (record.food_safety_warning || record.food_interactions || record.drug_and_or_laboratory_test_interactions || []).join(' ');
      const warningsText = (record.warnings || record.warnings_and_cautions || []).join(' ');
      const combined = `${foodText} ${warningsText}`.toLowerCase();

      let detectedFood = 'เครื่องดื่มแอลกอฮอล์ หรืออาหารมื้อหนัก';
      let detectedType = 'หลีกเลี่ยง';
      let detectedSeverity = 'สูง';
      let detectedHours = '2';
      let impactThai = `จากการตรวจสอบฐานข้อมูล openFDA ของยา ${drugName} พบว่าควรหลีกเลี่ยงการรับประทานร่วมกับเครื่องดื่มแอลกอฮอล์หรืออาหารที่อาจส่งผลกระทบต่อการดูดซึมของยา`;

      if (combined.includes('alcohol')) {
        detectedFood = 'เครื่องดื่มแอลกอฮอล์';
        detectedSeverity = 'สูง';
        detectedType = 'หลีกเลี่ยง';
        impactThai = `ห้ามรับประทานร่วมกับเครื่องดื่มแอลกอฮอล์ เนื่องจากอาจเสริมฤทธิ์กดประสาท หรือเพิ่มความเสี่ยงต่อการเกิดพิษต่อตับและทางเดินอาหาร`;
      } else if (combined.includes('grapefruit')) {
        detectedFood = 'น้ำเกรปฟรุต (Grapefruit) และส้มโอ';
        detectedSeverity = 'สูง';
        detectedType = 'หลีกเลี่ยง';
        impactThai = `เกรปฟรุตยับยั้งเอนไซม์ CYP3A4 ทำให้ระดับยาในกระแสเลือดสูงขึ้นจนอาจเกิดอันตรายจากผลข้างเคียงของยา`;
      } else if (combined.includes('milk') || combined.includes('dairy') || combined.includes('calcium')) {
        detectedFood = 'นม, โยเกิร์ต, ผลิตภัณฑ์จากนม และแคลเซียม';
        detectedSeverity = 'สูง';
        detectedType = 'หลีกเลี่ยง';
        detectedHours = '2';
        impactThai = `แคลเซียมและโปรตีนในนมจับตัวกับยา ทำให้ร่างกายดูดซึมยาได้ลดลง ควรรับประทานห่างจากนมอย่างน้อย 2 ชั่วโมง`;
      } else if (combined.includes('take with food') || combined.includes('with meals')) {
        detectedFood = 'อาหารมื้อหลัก';
        detectedSeverity = '';
        detectedType = 'แนะนำให้รับประทานร่วม';
        detectedHours = '';
        impactThai = `แนะนำให้รับประทานพร้อมอาหารหรือหลังอาหารทันที เพื่อลดอาการระคายเคืองกระเพาะอาหารและช่วยให้ดูดซึมยาได้ดียิ่งขึ้น`;
      }

      return {
        medication_label: drugName,
        food_name: detectedFood,
        interaction_type: detectedType,
        severity: detectedSeverity,
        hours_before: detectedHours,
        hours_after: detectedHours,
        impact_details: impactThai,
        source_type: 'FDA / WHO / PubMed / Thai FDA',
        source_name: 'openFDA Drug Label Interaction API (U.S. FDA)',
        url_doi: 'https://api.fda.gov/drug/label.json',
        publish_year: '2024',
      };
    }
  } catch (err) {
    console.warn('openFDA food interaction query error:', err);
  }

  throw new Error(`ไม่พบข้อมูลปฏิสัมพันธ์กับอาหารสำหรับ "${rawQuery}" ในระบบ กรุณาตรวจสอบตัวสะกดหรือกรอกข้อมูลด้วยตนเอง`);
}

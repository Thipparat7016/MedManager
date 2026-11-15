import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { AppHeader } from '@/components/ui/AppHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CalendarModal } from '@/components/ui/CalendarModal';
import { useApp } from '@/context/AppContext';
import { formatCleanDrugName, isMedicationMatch } from '@/services/interactionMatcher';

export default function LogSideEffectScreen() {
  const router = useRouter();
  const { sideEffects, addSideEffect, medications, masterMedications } = useApp();

  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const defaultDate = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear() + 543}`;
  const defaultTime = `${pad(now.getHours())}:${pad(now.getMinutes())} น.`;

  // 1. Date & Calendar State (defaults to today's date)
  const [date, setDate] = useState<string>(defaultDate);
  const [showCalendar, setShowCalendar] = useState<boolean>(false);

  // 2. Time & Time Picker Popup State (defaults to current time)
  const [time, setTime] = useState<string>(defaultTime);
  const [showTimeModal, setShowTimeModal] = useState<boolean>(false);
  const [modalHour, setModalHour] = useState<number>(now.getHours());
  const [modalMinute, setModalMinute] = useState<number>(Math.floor(now.getMinutes() / 5) * 5);
  const [selectedQuickTime, setSelectedQuickTime] = useState<string | null>(null);

  // 3. Related Drug Dropdown State (defaults to empty on initial load)
  const [selectedDrug, setSelectedDrug] = useState<string>('');
  const [showDrugDropdown, setShowDrugDropdown] = useState<boolean>(false);

  // 4. Symptoms Dropdown State
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [showSymptomDropdown, setShowSymptomDropdown] = useState<boolean>(false);
  const [showCustomSymptomInput, setShowCustomSymptomInput] = useState<boolean>(false);
  const [customSymptomText, setCustomSymptomText] = useState<string>('');

  // 5. Severity & Details (defaults to null so no button is pre-selected initially)
  const [severity, setSeverity] = useState<'สูง' | 'กลาง' | 'ต่ำ' | null>(null);
  const [details, setDetails] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Standard symptom options for dropdown
  const commonSymptoms = [
    'คลื่นไส้',
    'อาเจียน',
    'ปวดท้อง',
    'ปวดหัว',
    'วิงเวียน',
    'ผื่นคัน',
    'หายใจหอบ',
    'ใจสั่น',
    'นอนไม่หลับ',
    'ท้องเสีย',
    'ท้องผูก',
    'ง่วงซึม',
    'แน่นหน้าอก',
    'เบื่ออาหาร',
    'ปากแห้ง / คอแห้ง',
  ];

  // Quick Time presets
  const quickTimePresets = [
    { label: 'เช้า (08:00)', hour: 8, minute: 0 },
    { label: 'กลางวัน (12:00)', hour: 12, minute: 0 },
    { label: 'เย็น (18:00)', hour: 18, minute: 0 },
    { label: 'ก่อนนอน (21:00)', hour: 21, minute: 0 },
  ];

  // Compute drug list for dropdown (Only user's added medications, matching add-medication catalog card format)
  const userDrugList = useMemo(() => {
    const list: typeof medications = [];
    const seen = new Set<string>();
    for (const m of medications) {
      const clean = formatCleanDrugName(m.name).toLowerCase();
      if (!seen.has(clean)) {
        seen.add(clean);
        list.push(m);
      }
    }
    return list;
  }, [medications]);

  // Find backend precaution / side effect info for selectedDrug
  const backendDrugInfo = useMemo(() => {
    if (!selectedDrug) return null;

    // Check user medications first
    const userMatch = medications.find(
      m => m.name === selectedDrug || isMedicationMatch(selectedDrug, m.name)
    );
    if (userMatch?.precautions) {
      return {
        drugName: userMatch.name,
        precautions: userMatch.precautions,
      };
    }

    // Check master medications catalog
    const masterMatch = masterMedications.find(
      m => m.name === selectedDrug || isMedicationMatch(selectedDrug, m.name)
    );
    if (masterMatch?.precautions) {
      return {
        drugName: masterMatch.name,
        precautions: masterMatch.precautions,
      };
    }

    return null;
  }, [selectedDrug, medications, masterMedications]);

  // Derive suggested side-effects symptoms based on the selected drug
  const suggestedSymptomsForDrug = useMemo(() => {
    if (!selectedDrug) return [];
    const text = (backendDrugInfo?.precautions || selectedDrug).toLowerCase();

    const matches: string[] = [];
    if (text.includes('ง่วง') || text.includes('ซึม')) matches.push('ง่วงซึม');
    if (text.includes('คลื่นไส้')) matches.push('คลื่นไส้');
    if (text.includes('อาเจียน')) matches.push('อาเจียน');
    if (text.includes('กระเพาะ') || text.includes('ปวดท้อง')) matches.push('ปวดท้อง');
    if (text.includes('ปวดหัว') || text.includes('ศีรษะ')) matches.push('ปวดหัว');
    if (text.includes('วิงเวียน')) matches.push('วิงเวียน');
    if (text.includes('ผื่น') || text.includes('คัน')) matches.push('ผื่นคัน');
    if (text.includes('ใจสั่น')) matches.push('ใจสั่น');
    if (text.includes('นอนไม่หลับ')) matches.push('นอนไม่หลับ');
    if (text.includes('ท้องเสีย')) matches.push('ท้องเสีย');
    if (text.includes('ท้องผูก')) matches.push('ท้องผูก');
    if (text.includes('ปากแห้ง') || text.includes('คอแห้ง')) matches.push('ปากแห้ง / คอแห้ง');

    // Default suggestions if no specific matches
    if (matches.length === 0) {
      return ['ง่วงซึม', 'คลื่นไส้', 'วิงเวียน', 'ปวดท้อง'];
    }
    return Array.from(new Set(matches));
  }, [selectedDrug, backendDrugInfo]);

  const toggleSymptom = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const handleAddCustomSymptom = () => {
    const trimmed = customSymptomText.trim();
    if (!trimmed) return;
    if (!selectedSymptoms.includes(trimmed)) {
      setSelectedSymptoms([...selectedSymptoms, trimmed]);
    }
    setCustomSymptomText('');
    setShowCustomSymptomInput(false);
  };

  const handleSaveTime = () => {
    const formatted = `${pad(modalHour)}:${pad(modalMinute)} น.`;
    setTime(formatted);
    setShowTimeModal(false);
  };

  const handleSubmit = async () => {
    if (!selectedDrug || selectedSymptoms.length === 0) {
      Alert.alert('ข้อมูลไม่ครบถ้วน', 'กรุณาระบุยาที่เกี่ยวข้องและเลือกอาการที่พบอย่างน้อย 1 อย่าง');
      return;
    }

    setIsSubmitting(true);
    await addSideEffect({
      date,
      time,
      medicationName: selectedDrug,
      symptoms: selectedSymptoms,
      severity: severity || 'กลาง',
      details,
    });
    setIsSubmitting(false);

    Alert.alert('สำเร็จ', 'บันทึกข้อมูลผลข้างเคียงเรียบร้อยแล้ว', [
      { text: 'ตกลง', onPress: () => router.replace('/(tabs)' as any) },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="บันทึกผลข้างเคียง" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.subtitle}>
          บันทึกอาการหลังรับประทานยาเพื่อให้แพทย์ติดตามการรักษาได้อย่างแม่นยำ
        </Text>

        {/* ========================================================================= */}
        {/* Section: Backend Recommended Side Effects & Precautions Card              */}
        {/* ========================================================================= */}
        <View style={styles.recommendSectionCard}>
          <View style={styles.recommendHeaderRow}>
            <Text style={styles.recommendHeaderTitle}>
              {selectedDrug
                ? `ผลข้างเคียงที่อาจพบ • ${formatCleanDrugName(selectedDrug)}`
                : 'ผลข้างเคียงที่อาจพบได้'}
            </Text>
          </View>

          {selectedDrug ? (
            <View style={styles.recommendBody}>
              {backendDrugInfo?.precautions ? (
                <Text style={styles.recommendPrecautionText}>
                  {backendDrugInfo.precautions}
                </Text>
              ) : (
                <Text style={styles.recommendPrecautionText}>
                  ข้อควรระวังทั่วไป: หากมีอาการวิงเวียน ผื่นคัน แน่นหน้าอก หรืออาการผิดปกติรุนแรง ควรหยุดยาและปรึกษาแพทย์
                </Text>
              )}

              {/* Potential side effects list for this drug */}
              <View style={styles.suggestionBox}>
                <Text style={styles.suggestionTitle}>
                  ผลข้างเคียงที่อาจเกิดขึ้น:
                </Text>
                <View style={styles.suggestionBulletList}>
                  {suggestedSymptomsForDrug.map(sym => (
                    <Text key={sym} style={styles.suggestionBulletText}>
                      • {sym}
                    </Text>
                  ))}
                </View>
              </View>
            </View>
          ) : (
            <Text style={styles.recommendEmptyText}>
              เลือกยาที่เกี่ยวข้องด้านล่าง เพื่อดูข้อมูลผลข้างเคียงและข้อควรระวังที่พบบ่อยจากระบบ
            </Text>
          )}
        </View>

        {/* ========================================================================= */}
        {/* Date & Time Row (With Calendar and Time Popup)                             */}
        {/* ========================================================================= */}
        <View style={styles.rowInputs}>
          {/* วันที่ */}
          <View style={styles.halfInput}>
            <Text style={styles.inputLabel}>วันที่</Text>
            <TouchableOpacity
              style={styles.pickerInputBox}
              onPress={() => setShowCalendar(true)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.pickerInputText,
                  date ? styles.pickerInputTextFilled : null,
                ]}
              >
                {date}
              </Text>
              <Feather name="calendar" size={18} color="#F87171" />
            </TouchableOpacity>
          </View>

          {/* เวลา */}
          <View style={styles.halfInput}>
            <Text style={styles.inputLabel}>เวลา</Text>
            <TouchableOpacity
              style={styles.pickerInputBox}
              onPress={() => {
                const match = time.match(/(\d+):(\d+)/);
                if (match) {
                  setModalHour(parseInt(match[1], 10));
                  setModalMinute(parseInt(match[2], 10));
                }
                setShowTimeModal(true);
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.pickerInputText,
                  time ? styles.pickerInputTextFilled : null,
                ]}
              >
                {time}
              </Text>
              <Feather name="clock" size={18} color="#F87171" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ========================================================================= */}
        {/* ยาที่เกี่ยวข้อง (Dropdown Selector - styled like add-medication without icon) */}
        {/* ========================================================================= */}
        <Text style={styles.sectionLabel}>ยาที่เกี่ยวข้อง *</Text>
        <View
          style={[
            styles.dropdownTrigger,
            showDrugDropdown && styles.dropdownTriggerActive,
          ]}
        >
          <TouchableOpacity
            style={styles.dropdownTriggerLeft}
            onPress={() => {
              setShowDrugDropdown(!showDrugDropdown);
              setShowSymptomDropdown(false);
            }}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.dropdownValueText,
                selectedDrug
                  ? styles.dropdownValueTextFilled
                  : styles.dropdownPlaceholder,
              ]}
              numberOfLines={1}
            >
              {selectedDrug
                ? formatCleanDrugName(selectedDrug)
                : 'เลือกยาที่เกี่ยวข้อง...'}
            </Text>
          </TouchableOpacity>
          {selectedDrug ? (
            <TouchableOpacity
              onPress={() => setSelectedDrug('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.clearBtn}
            >
              <Feather name="x" size={16} color="#94A3B8" />
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            onPress={() => {
              setShowDrugDropdown(!showDrugDropdown);
              setShowSymptomDropdown(false);
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather
              name={showDrugDropdown ? 'chevron-up' : 'chevron-down'}
              size={18}
              color="#F87171" // <-- เปลี่ยนจาก "#64748B" เป็น "#F87171"
            />
          </TouchableOpacity>
        </View>

        {/* Dropdown Menu List for Drugs (Card style like add-medication, no icon) */}
        {showDrugDropdown && (
          <View style={styles.masterCatalogList}>
            <View style={styles.dropdownHeaderRow}>
              <Text style={styles.masterCatalogHeader}>
                รายการยาที่บันทึกไว้ในระบบ
              </Text>
              <TouchableOpacity onPress={() => setShowDrugDropdown(false)}>
                <Text style={styles.dropdownCloseText}>ปิด</Text>
              </TouchableOpacity>
            </View>

            {userDrugList.length === 0 ? (
              <View style={styles.dropdownEmptyBox}>
                <Text style={styles.dropdownEmptyText}>
                  ยังไม่มีรายการยาที่คุณเพิ่มไว้ในระบบ
                </Text>
              </View>
            ) : (
              <ScrollView
                nestedScrollEnabled
                style={{ maxHeight: 240 }}
                showsVerticalScrollIndicator={true}
              >
                {userDrugList.map((item, idx) => {
                  const isSelected = selectedDrug === item.name;
                  const isSupplement = item.category === 'อาหารเสริม';
                  return (
                    <TouchableOpacity
                      key={item.id || item.name + idx}
                      style={[
                        styles.masterItemCard,
                        isSelected && styles.masterItemCardActive,
                      ]}
                      onPress={() => {
                        if (isSelected) {
                          setSelectedDrug('');
                        } else {
                          setSelectedDrug(item.name);
                        }
                        setShowDrugDropdown(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={{ flex: 1, paddingRight: 8 }}>
                        <Text style={styles.masterItemName} numberOfLines={1}>
                          {formatCleanDrugName(item.name)}
                        </Text>
                        <Text style={styles.masterItemMeta} numberOfLines={1}>
                          {item.category || 'ยา'} • {item.type || 'เม็ด'}
                          {item.dosage ? ` • ${item.dosage}${item.unit || ''}` : ''}
                        </Text>
                      </View>

                      {isSelected ? (
                        <View style={styles.selectedCheckBadge}>
                          <Ionicons name="checkmark" size={14} color="#0284C7" />
                        </View>
                      ) : (
                        <View
                          style={[
                            styles.categoryBadgeBase,
                            isSupplement
                              ? styles.categoryBadgeSupplement
                              : styles.categoryBadgeDrug,
                          ]}
                        >
                          <Text
                            style={[
                              styles.categoryBadgeTextBase,
                              isSupplement
                                ? styles.categoryTextSupplement
                                : styles.categoryTextDrug,
                            ]}
                          >
                            {isSupplement ? 'อาหารเสริม' : 'ยา'}
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </View>
        )}

        {/* ========================================================================= */}
        {/* อาการที่พบ (Dropdown Selector - styled like add-medication without icon)   */}
        {/* ========================================================================= */}
        <Text style={[styles.sectionLabel, { marginTop: 14 }]}>อาการที่พบ *</Text>

        {/* Selected Symptoms Chips Display */}
        {selectedSymptoms.length > 0 && (
          <View style={styles.selectedSymptomsWrap}>
            {selectedSymptoms.map(sym => (
              <View key={sym} style={styles.selectedSymptomChip}>
                <Text style={styles.selectedSymptomChipText}>{sym}</Text>
                <TouchableOpacity
                  onPress={() => toggleSymptom(sym)}
                  hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                >
                  <Feather name="x" size={13} color="#FB7185" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Symptoms Dropdown Trigger */}
        <TouchableOpacity
          style={[
            styles.dropdownTrigger,
            showSymptomDropdown && styles.dropdownTriggerActive,
          ]}
          onPress={() => {
            setShowSymptomDropdown(!showSymptomDropdown);
            setShowDrugDropdown(false);
          }}
          activeOpacity={0.7}
        >
          <View style={styles.dropdownTriggerLeft}>
            <Text
              style={[
                styles.dropdownValueText,
                selectedSymptoms.length > 0
                  ? styles.dropdownValueTextFilled
                  : styles.dropdownPlaceholder,
              ]}
              numberOfLines={1}
            >
              {selectedSymptoms.length > 0
                ? `เลือกอาการเพิ่ม (เลือกแล้ว ${selectedSymptoms.length} อาการ)`
                : 'เลือกอาการที่พบจากรายการ...'}
            </Text>
          </View>
          <Feather
            name={showSymptomDropdown ? 'chevron-up' : 'chevron-down'}
            size={18}
            color="#F87171" // <-- เปลี่ยนจาก "#64748B" เป็น "#F87171"
          />
        </TouchableOpacity>

        {/* Symptoms Dropdown Menu (Styled like add-medication masterCatalogList without icons) */}
        {showSymptomDropdown && (
          <View style={styles.masterCatalogList}>
            <View style={styles.dropdownHeaderRow}>
              <Text style={styles.masterCatalogHeader}>
                รายการอาการที่พบบ่อย (เลือกได้มากกว่า 1 ข้อ)
              </Text>
              <TouchableOpacity onPress={() => setShowSymptomDropdown(false)}>
                <Text style={styles.dropdownCloseText}>ปิด</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              nestedScrollEnabled
              style={{ maxHeight: 240 }}
              showsVerticalScrollIndicator={true}
            >
              {commonSymptoms.map(sym => {
                const isSelected = selectedSymptoms.includes(sym);
                return (
                  <TouchableOpacity
                    key={sym}
                    style={[
                      styles.masterItemCard,
                      isSelected && styles.symptomItemCardActive,
                    ]}
                    onPress={() => toggleSymptom(sym)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.masterItemName,
                        isSelected && styles.symptomItemNameActive,
                      ]}
                    >
                      {sym}
                    </Text>
                    <View
                      style={[
                        styles.multiCheckCircle,
                        isSelected && styles.multiCheckCircleActive,
                      ]}
                    >
                      {isSelected && (
                        <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}

              {/* Option to add other custom symptom */}
              <TouchableOpacity
                style={styles.masterItemCardDashed}
                onPress={() => {
                  setShowCustomSymptomInput(true);
                  setShowSymptomDropdown(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.dashedOptionText}>
                  + อื่นๆ (ระบุอาการนอกเหนือจากรายการ)
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}

        {/* Custom Symptom Input Field when "+ อื่นๆ" is activated */}
        {showCustomSymptomInput && (
          <View style={styles.customSymptomInputCard}>
            <Text style={styles.customFieldLabel}>ระบุอาการนอกเหนือจากรายการ:</Text>
            <View style={styles.customSymptomInputRow}>
              <TextInput
                style={styles.customSymptomTextInput}
                value={customSymptomText}
                onChangeText={setCustomSymptomText}
                placeholder="เช่น ผื่นแดงรูปปีกผีเสื้อ, ชาปลายมือ..."
                placeholderTextColor="#94A3B8"
                autoFocus
              />
              <TouchableOpacity
                style={styles.addCustomSymptomBtn}
                onPress={handleAddCustomSymptom}
                activeOpacity={0.8}
              >
                <Text style={styles.addCustomSymptomBtnText}>เพิ่ม</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ========================================================================= */}
        {/* Severity Selection (Default: No action taken on initial load)              */}
        {/* ========================================================================= */}
        <Text style={[styles.sectionLabel, { marginTop: 16 }]}>ความรุนแรง</Text>
        <View style={styles.severityRow}>
          {/* ปุ่ม สูง */}
          <TouchableOpacity
            style={[
              styles.severityBtn,
              styles.btnHigh, // <-- เพิ่มขอบสีแดงตอนยังไม่กด
              severity === 'สูง' && styles.severityHighActive,
            ]}
            onPress={() => setSeverity(severity === 'สูง' ? null : 'สูง')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.severityText,
                { color: '#EF4444' }, // สีฟอนต์แดง
                severity === 'สูง' && styles.severityTextActive,
              ]}
            >
              สูง
            </Text>
          </TouchableOpacity>
          {/* ปุ่ม กลาง */}
          <TouchableOpacity
            style={[
              styles.severityBtn,
              styles.btnMed, // <-- เพิ่มขอบสีส้มตอนยังไม่กด
              severity === 'กลาง' && styles.severityMedActive,
            ]}
            onPress={() => setSeverity(severity === 'กลาง' ? null : 'กลาง')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.severityText,
                { color: '#EA580C' }, // สีฟอนต์ส้ม
                severity === 'กลาง' && styles.severityTextActive,
              ]}
            >
              กลาง
            </Text>
          </TouchableOpacity>
          {/* ปุ่ม ต่ำ */}
          <TouchableOpacity
            style={[
              styles.severityBtn,
              styles.btnLow, // <-- เพิ่มขอบสีเหลืองตอนยังไม่กด
              severity === 'ต่ำ' && styles.severityLowActive,
            ]}
            onPress={() => setSeverity(severity === 'ต่ำ' ? null : 'ต่ำ')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.severityText,
                { color: '#CA8A04' }, // สีฟอนต์เหลือง
                severity === 'ต่ำ' && styles.severityTextActive,
              ]}
            >
              ต่ำ
            </Text>
          </TouchableOpacity>
        </View>

        {/* ========================================================================= */}
        {/* Notes Details Textarea                                                    */}
        {/* ========================================================================= */}
        {/* รายละเอียดเพิ่มเติม */}
        <Text style={styles.sectionLabel}>รายละเอียดเพิ่มเติม</Text>
        <TextInput
          style={[styles.textArea, details ? styles.textAreaFilled : null]}
          multiline
          numberOfLines={4}
          placeholder="อธิบายอาการ เริ่มเมื่อไร นานแค่ไหน สิ่งที่ทำให้ดีขึ้น/แย่ลง..."
          placeholderTextColor="#94A3B8"
          value={details}
          onChangeText={setDetails}
          textAlignVertical="top"
        />

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          activeOpacity={0.8}
          disabled={isSubmitting}
        >
          <Text style={styles.submitBtnText}>
            {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกอาการ'}
          </Text>
        </TouchableOpacity>

        {/* ========================================================================= */}
        {/* Past History List                                                         */}
        {/* ========================================================================= */}
        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>ประวัติการบันทึก</Text>
        {sideEffects.length === 0 ? (
          <Text style={{ fontSize: 13, color: '#94A3B8', marginTop: 4 }}>
            ยังไม่มีประวัติการบันทึกผลข้างเคียง
          </Text>
        ) : (
          sideEffects.map(item => (
            <View key={item.id} style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyDrug} numberOfLines={1}>
                  {item.date} {item.time ? `• ${item.time}` : ''} • {formatCleanDrugName(item.medicationName)}
                </Text>
                <View style={styles.badgeWrap}>
                  <StatusBadge
                    label={item.severity}
                    variant={
                      item.severity === 'สูง'
                        ? 'high'
                        : item.severity === 'กลาง'
                          ? 'medium'
                          : 'low'
                    }
                    size="sm"
                  />
                </View>
              </View>
              <Text style={styles.historySymptoms}>{item.symptoms.join(', ')}</Text>
              {item.details ? (
                <Text style={styles.historyDetails}>{item.details}</Text>
              ) : null}
            </View>
          ))
        )}
      </ScrollView>

      {/* ========================================================================= */}
      {/* 1. CALENDAR MODAL                                                         */}
      {/* ========================================================================= */}
      <CalendarModal
        visible={showCalendar}
        onClose={() => setShowCalendar(false)}
        onSelectDate={newDate => {
          setDate(newDate);
          setShowCalendar(false);
        }}
        initialDate={date}
        title="เลือกวันที่เกิดผลข้างเคียง"
        theme="coral"
      />

      {/* ========================================================================= */}
      {/* 2. TIME PICKER MODAL                                                      */}
      {/* ========================================================================= */}
      <Modal
        visible={showTimeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTimeModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowTimeModal(false)}
        >
          <Pressable style={styles.timeModalContainer} onPress={e => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>เลือกเวลาที่เกิดอาการ</Text>
              <TouchableOpacity
                onPress={() => setShowTimeModal(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Feather name="x" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Digital Clock Steppers */}
            <View style={styles.digitalClockRow}>
              {/* Hours */}
              <View style={styles.timeBoxCol}>
                <TouchableOpacity
                  style={styles.timeStepBtn}
                  onPress={() => {
                    setModalHour(h => (h + 1) % 24);
                    setSelectedQuickTime(null);
                  }}
                >
                  <Feather name="chevron-up" size={20} color="#475569" />
                </TouchableOpacity>
                <View style={styles.timeDigitBox}>
                  <Text style={styles.timeDigitText}>{pad(modalHour)}</Text>
                </View>
                <TouchableOpacity
                  style={styles.timeStepBtn}
                  onPress={() => {
                    setModalHour(h => (h - 1 + 24) % 24);
                    setSelectedQuickTime(null);
                  }}
                >
                  <Feather name="chevron-down" size={20} color="#475569" />
                </TouchableOpacity>
                <Text style={styles.timeUnitSub}>ชั่วโมง</Text>
              </View>

              <Text style={styles.timeColonText}>:</Text>

              {/* Minutes */}
              <View style={styles.timeBoxCol}>
                <TouchableOpacity
                  style={styles.timeStepBtn}
                  onPress={() => {
                    setModalMinute(m => (m + 5) % 60);
                    setSelectedQuickTime(null);
                  }}
                >
                  <Feather name="chevron-up" size={20} color="#475569" />
                </TouchableOpacity>
                <View style={styles.timeDigitBox}>
                  <Text style={styles.timeDigitText}>{pad(modalMinute)}</Text>
                </View>
                <TouchableOpacity
                  style={styles.timeStepBtn}
                  onPress={() => {
                    setModalMinute(m => (m - 5 + 60) % 60);
                    setSelectedQuickTime(null);
                  }}
                >
                  <Feather name="chevron-down" size={20} color="#475569" />
                </TouchableOpacity>
                <Text style={styles.timeUnitSub}>นาที</Text>
              </View>
            </View>

            {/* Quick Time Presets */}
            <Text style={styles.quickTimeHeader}>เวลาแนะนำ:</Text>
            <View style={styles.quickTimesGrid}>
              {quickTimePresets.map(preset => {
                const isSelected =
                  selectedQuickTime === preset.label ||
                  (modalHour === preset.hour && modalMinute === preset.minute);
                return (
                  <TouchableOpacity
                    key={preset.label}
                    style={[
                      styles.quickTimeChip,
                      isSelected && styles.quickTimeChipActive,
                    ]}
                    onPress={() => {
                      setModalHour(preset.hour);
                      setModalMinute(preset.minute);
                      setSelectedQuickTime(preset.label);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.quickTimeText,
                        isSelected && styles.quickTimeTextActive,
                      ]}
                    >
                      {preset.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Modal Action Buttons */}
            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowTimeModal(false)}
              >
                <Text style={styles.modalCancelText}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleSaveTime}
              >
                <Text style={styles.modalConfirmText}>ตกลง</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 16,
  },
  // Recommendation Card from Backend
  recommendSectionCard: {
    backgroundColor: '#FFF7ED',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    padding: 14,
    marginBottom: 18,
  },
  recommendHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#9A3412',
    marginLeft: 2,
  },
  recommendBody: {
    marginTop: 2,
  },
  recommendPrecautionText: {
    fontSize: 12,
    color: '#7C2D12',
    lineHeight: 18,
    marginBottom: 8,
  },
  recommendEmptyText: {
    fontSize: 12,
    color: '#9A3412',
    lineHeight: 18,
  },
  suggestionBox: {
    marginTop: 6,
    borderTopWidth: 0.5,
    borderTopColor: '#FED7AA',
    paddingTop: 6,
  },
  suggestionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C2410C',
    marginBottom: 6,
  },
  suggestionBulletList: {
    marginTop: 2,
    gap: 4,
  },
  suggestionBulletText: {
    fontSize: 12,
    color: '#7C2D12',
    lineHeight: 18,
  },

  // Date & Time Inputs
  rowInputs: {
    flexDirection: 'row', 
    gap: 8, 
    marginBottom: 18,
  },
  halfInput: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  pickerInputBox: {
    height: 40,
    borderWidth: 1,
    borderColor: '#FA969D',
    borderRadius: 9,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FBFC',
  },
  pickerInputText: {
    fontSize: 13, 
    color: '#94A3B8', 
    fontWeight: '500',
  },
  pickerInputTextFilled: {
    color: '#0F172A',
    fontWeight: '600',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },

  // Dropdown Trigger (styled like input in add-medication)
  dropdownTrigger: {
    height: 45,               // ความสูง (เดิม 52 -> ปรับเป็น 36 เหมือนวันที่และเวลา)
    borderWidth: 1,           // ความหนาขอบ (เดิม 1.5 -> ปรับเป็น 1)
    borderColor: '#FA969D',   // สีขอบ (เดิม #E2E8F0 -> ปรับเป็นสีชมพู/ส้มโอรสตามวันที่และเวลา)
    borderRadius: 9,          // ความโค้งมน (เดิม 14 -> ปรับเป็น 9)
    paddingHorizontal: 10,    // ระยะขอบซ้ายขวาด้านใน (เดิม 16 -> ปรับเป็น 10)
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FBFC', // สีพื้นหลัง (เหมือนวันที่และเวลา)
    marginBottom: 8,
  },
  dropdownTriggerActive: {
    borderColor: '#F87171',
    backgroundColor: '#FFFFFF',
  },
  dropdownTriggerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  dropdownValueText: {
    fontSize: 13,             // ขนาดฟอนต์ (เดิม 14 -> ปรับเป็น 12 เหมือนวันที่และเวลา)
    fontWeight: '500',        // น้ำหนักฟอนต์ (เดิม '600' -> ปรับเป็น '500')
    color: '#94A3B8',         // สีฟอนต์ค่าเริ่มต้น
    flex: 1,
  },
  dropdownValueTextFilled: {
    color: '#0F172A',         // สีฟอนต์เข้มขึ้นเมื่อเลือกหรือกรอกข้อมูล
    fontWeight: '600',
  },
  dropdownPlaceholder: {
    color: '#94A3B8',         // สีฟอนต์ Placeholder
    fontWeight: '500',
  },
  clearBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    marginRight: 2,
  },

  // Master Catalog Dropdown Style (Exact match of add-medication.tsx without icons)
  masterCatalogList: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 12,
    marginTop: 4,
    marginBottom: 16,
  },
  dropdownHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  masterCatalogHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  dropdownCloseText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F87171',
  },
  masterItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  masterItemCardActive: {
    borderColor: '#F87171',
    backgroundColor: '#FFF5F5',
  },
  masterItemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  masterItemMeta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  // Category Badges styled to match AdminMed
  categoryBadgeBase: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBadgeSupplement: {
    backgroundColor: '#E8E4FB', // สีม่วงพาสเทลอ่อน (AdminMed)
    borderColor: '#C9C3EE',
  },
  categoryBadgeTextBase: {
    fontSize: 11,
    fontWeight: '600',
  },
  categoryTextSupplement: {
    fontSize: 11,
    fontWeight: '600',
    color: '#7C6CD8', // สีม่วง AdminMed
  },
  categoryBadgeDrug: {
    backgroundColor: '#E0F2FE',
    borderColor: '#B9E2FE',
  },
  categoryTextDrug: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0284C7',
  },
  selectedCheckBadge: {
    backgroundColor: '#E0F2FE',
    borderWidth: 1,
    borderColor: '#B9E2FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  masterItemCardDashed: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 12,
    marginBottom: 4,
  },
  dashedOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E11D48',
  },
  dropdownEmptyBox: {
    paddingVertical: 18,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownEmptyText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  customFieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
    marginBottom: 6,
  },

  // Symptoms Selection & Chips (Soft pastel rose palette)
  selectedSymptomsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  selectedSymptomChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  selectedSymptomChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E11D48',
  },
  symptomItemCardActive: {
    borderColor: '#FECDD3',
    backgroundColor: '#FFF5F5',
  },
  symptomItemNameActive: {
    color: '#E11D48',
    fontWeight: '600',
  },
  multiCheckCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  multiCheckCircleActive: {
    backgroundColor: '#FB7185',
    borderColor: '#FB7185',
  },
  customSymptomInputCard: {
    marginTop: 8,
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  customSymptomInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  customSymptomTextInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#0F172A',
  },
  addCustomSymptomBtn: {
    backgroundColor: '#F87171',
    borderRadius: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCustomSymptomBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  // Severity Selection
  severityRow: {
    flexDirection: 'row', 
    gap: 5, 
    marginBottom: 18,
  },
   severityBtn: {
    flex: 1,
    height: 36,
    borderRadius: 15,
    borderWidth: 1,
    backgroundColor: '#FFFFFF', // พื้นหลังสีขาวตอนยังไม่กด
    alignItems: 'center',
    justifyContent: 'center',
  },
  // ขอบของแต่ละปุ่มตอนยังไม่กด (พื้นหลังยังคงเป็นสีขาว)
  btnHigh: {
    borderColor: '#FCA5A5', // ขอบแดงอ่อน
  },
  btnMed: {
    borderColor: '#FDBA74', // ขอบส้มอ่อน
  },
  btnLow: {
    borderColor: '#FDE047', // ขอบเหลืองอ่อน
  },
   // พอกดเลือก: สีพื้นหลังจะเปลี่ยนตามปุ่ม และขอบจะเข้มขึ้น
  severityHighActive: {
    backgroundColor: '#FEE2E2', // พื้นหลังแดงอ่อน
    borderColor: '#FEE2E2',     // ขอบแดงเข้ม
  },
  severityMedActive: {
    backgroundColor: '#FFEDD5', // พื้นหลังส้มอ่อน
    borderColor: '#FFEDD5',     // ขอบส้มเข้ม
  },
  severityLowActive: {
    backgroundColor: '#fcefbaff', // พื้นหลังเหลืองอ่อน
    borderColor: '#fcefbaff',     // ขอบเหลืองเข้ม
  },
  severityText: {
    fontSize: 14,
    fontWeight: '700',
  },
  severityTextActive: {
    fontWeight: '800',
  },
  textArea: {
    borderWidth: 1,             // ความหนาขอบ (เดิม 1.5 -> ปรับเป็น 1 เหมือนวันที่/เวลา)
    borderColor: '#FA969D',     // สีขอบ (เดิม #E2E8F0 -> ปรับเป็นสีชมพู/ส้มโอรส #FA969D)
    borderRadius: 12,           // ความโค้งมน (เดิม 16 -> ปรับให้รับกับช่องด้านบน)
    padding: 12,
    fontSize: 12,               // ขนาดฟอนต์ (เดิม 14 -> ปรับเป็น 12 เหมือนวันที่/เวลา)
    fontWeight: '500',          // น้ำหนักฟอนต์ (เดิมค่าปกติ -> ปรับเป็น '500')
    color: '#0F172A',           // สีฟอนต์เวลาพิมพ์ เปลี่ยนเป็นสีเข้ม
    height: 100,                // ความสูงกล่องข้อความ (คงไว้ที่ 100)
    marginBottom: 20,
    backgroundColor: '#F9FBFC',   // สีพื้นหลัง (เดิม #FAFAFC -> ปรับเป็น #F9FBFC เหมือนวันที่/เวลา)
  },
  textAreaFilled: {
    color: '#0F172A',
  },
  submitBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#F87171',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F87171',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  historyCard: {
    backgroundColor: '#FAFAFC',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    paddingTop: 14,
    paddingBottom: 14,
    paddingLeft: 14,
    paddingRight: 8,
    marginBottom: 10,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  historyDrug: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    marginRight: 8,
  },
  badgeWrap: {
    flexShrink: 0,
  },
  historySymptoms: {
    fontSize: 13,
    color: '#475569',
  },
  historyDetails: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },

  // Time Picker Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  timeModalContainer: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  digitalClockRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
  },
  timeBoxCol: {
    alignItems: 'center',
  },
  timeStepBtn: {
    padding: 6,
  },
  timeDigitBox: {
    width: 64,
    height: 60,
    backgroundColor: '#FFF5F5',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#FECACA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeDigitText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#DC2626',
  },
  timeUnitSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '600',
  },
  timeColonText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#DC2626',
    marginHorizontal: 12,
    paddingBottom: 20,
  },
  quickTimeHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 8,
    marginBottom: 8,
  },
  quickTimesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  quickTimeChip: {
    flexBasis: '48%',
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  quickTimeChipActive: {
    backgroundColor: '#FEE2E2',
    borderColor: '#F87171',
  },
  quickTimeText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  quickTimeTextActive: {
    color: '#DC2626',
    fontWeight: '700',
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  modalConfirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#F87171',
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});


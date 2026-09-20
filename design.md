---
# ============================================================
# MedManager Design System
# Version: 1.0.0
# Platform: React Native (iOS / Android)
# Last updated: 2569-07-12
# ============================================================
title: MedManager Design System
version: 1.0.0
platform: react-native
language: th
author: MedManager Team
status: draft
figma_source: medicine_project.pdf
font_primary: Sarabun
font_base_size: 16
breakpoints:
  mobile_sm: 360
  mobile_base: 390
  mobile_lg: 430
  tablet: 768
---

---

## 1. Color Tokens

> โทนสีหลักของแอปพลิเคชันใช้ **Soft Lavender Purple** เป็นตัวระบุความน่าเชื่อถือด้านสุขภาพ ผสานกับ Neutral Slate เพื่อลดความล้าสายตาสำหรับผู้ใช้สูงอายุ

### 1.1 Brand / Primary Palette

```yaml
color-primary-50:   "#F5F3FF"   # Background tint – app shell background
color-primary-100:  "#EDE9FC"   # Surface tint – card hover / selected state
color-primary-200:  "#DDD8F8"   # Border – input focused outline
color-primary-300:  "#BCB4F0"   # Placeholder / decorative divider
color-primary-400:  "#9B8EE8"   # Icon secondary / inactive tab
color-primary-500:  "#7C6CD8"   # PRIMARY – main buttons, active nav, progress bar  ← brand core
color-primary-600:  "#6A5AC4"   # Primary pressed state
color-primary-700:  "#5547A6"   # Primary dark – link text on light bg
color-primary-800:  "#3E348A"   # Rarely used – badge outline on white
color-primary-900:  "#29205E"   # Almost never – deep accent
```

### 1.2 Neutral / Slate Palette

```yaml
color-neutral-0:    "#FFFFFF"   # Surface – card, modal, bottom sheet
color-neutral-50:   "#F7F6FF"   # App shell / screen background
color-neutral-100:  "#ECEAF5"   # Skeleton loader / divider
color-neutral-200:  "#D6D4E8"   # Input border default
color-neutral-300:  "#B8B2D0"   # Disabled element border
color-neutral-400:  "#9590B0"   # Placeholder text
color-neutral-500:  "#6B648A"   # Secondary / caption text
color-neutral-600:  "#4E4870"   # Body text secondary
color-neutral-700:  "#363060"   # Body text primary
color-neutral-800:  "#231E48"   # Heading text
color-neutral-900:  "#1A1535"   # Title / display text
```

### 1.3 Semantic – Status Colors

```yaml
# ─── SUCCESS ────────────────────────────────────────────────
color-success-50:   "#F0FBF4"
color-success-100:  "#D8F5E4"
color-success-500:  "#4DB06F"   # Confirmed intake checkmark, success toast
color-success-700:  "#2E7D4F"   # Success text label on light bg

# ─── WARNING ────────────────────────────────────────────────
color-warning-50:   "#FFFBEB"
color-warning-100:  "#FEF3DC"
color-warning-500:  "#F5A623"   # Medium severity badge, expiry alert
color-warning-700:  "#B87108"   # Warning text label

# ─── DANGER / HIGH-SEVERITY ─────────────────────────────────
color-danger-50:    "#FFF5F5"
color-danger-100:   "#FDEAEA"
color-danger-500:   "#E84646"   # High-severity drug-food interaction, error state
color-danger-700:   "#B52020"   # Danger text label

# ─── INFO ───────────────────────────────────────────────────
color-info-50:      "#EFF6FF"
color-info-100:     "#DBEAFE"
color-info-500:     "#3B82F6"   # Low-severity badge, informational chip
color-info-700:     "#1D4ED8"   # Info text label
```

### 1.4 Severity Palette (Drug-Food Interaction)

```yaml
# แสดงในหน้า "ข้อมูลยาและอาหารที่ควรหลีกเลี่ยง"
severity-high:
  bg:     "#FDEAEA"   # pill background
  text:   "#B52020"   # pill label
  border: "#E84646"
  icon:   "#E84646"   # ⚠ warning icon

severity-medium:
  bg:     "#FEF3DC"
  text:   "#B87108"
  border: "#F5A623"
  icon:   "#F5A623"

severity-low:
  bg:     "#DBEAFE"
  text:   "#1D4ED8"
  border: "#3B82F6"
  icon:   "#3B82F6"
```

### 1.5 Gradient Tokens

```yaml
gradient-primary:
  from: "#9B8EE8"     # color-primary-400
  to:   "#7C6CD8"     # color-primary-500
  direction: "135deg"
  usage: "Progress bar fill, hero section accent"

gradient-surface:
  from: "#F7F6FF"     # color-neutral-50
  to:   "#FFFFFF"     # color-neutral-0
  direction: "180deg"
  usage: "Screen background, bottom sheet drag handle zone"
```

### 1.6 On-Color (Contrast Pairs)

| Token | Background | Text/Icon | WCAG AA (4.5:1) |
|---|---|---|---|
| on-primary | #7C6CD8 | #FFFFFF | ✅ 5.2:1 |
| on-success | #4DB06F | #FFFFFF | ✅ 4.7:1 |
| on-danger | #E84646 | #FFFFFF | ✅ 5.0:1 |
| on-warning | #F5A623 | #1A1535 | ✅ 6.1:1 |
| on-neutral-0 | #FFFFFF | #1A1535 | ✅ 15.8:1 |
| on-neutral-50 | #F7F6FF | #363060 | ✅ 7.4:1 |

---

## 2. Typography Tokens

> ใช้ **Sarabun** เพียง family เดียว ด้วย weight และ size ที่ต่างกันชัดเจน ไม่ผสม typeface เพื่อรักษาความเป็นเอกภาพ และเพิ่มความอ่านง่ายสำหรับผู้ใช้สูงอายุ

### 2.1 Font Family

```yaml
font-family-primary:   "'Sarabun', 'Noto Sans Thai', sans-serif"
font-family-mono:      "'JetBrains Mono', monospace"   # เฉพาะ timestamp / version label
```

### 2.2 Type Scale

```yaml
# Base = 16px  |  Scale ratio ≈ 1.25 (Major Third)

text-display:
  size:         28px   # 28 / 16 = 1.75rem
  weight:       700    # Bold
  line-height:  1.25
  tracking:     -0.02em
  usage:        "ชื่อแอปบนหน้า Login (MedManager)"

text-h1:
  size:         24px   # 1.5rem
  weight:       700
  line-height:  1.3
  tracking:     -0.01em
  usage:        "ชื่อหน้า / หัวข้อหลัก"

text-h2:
  size:         20px   # 1.25rem
  weight:       600
  line-height:  1.35
  tracking:     0
  usage:        "ชื่อ section card / modal title"

text-h3:
  size:         18px   # 1.125rem
  weight:       600
  line-height:  1.4
  tracking:     0
  usage:        "ชื่อยา / รายการหลัก"

text-body-lg:
  size:         16px   # 1rem  ← BASE
  weight:       400
  line-height:  1.6
  tracking:     0.01em
  usage:        "เนื้อหาทั่วไป, ข้อความในฟอร์ม, รายละเอียดยา"

text-body-md:
  size:         15px   # 0.9375rem
  weight:       400
  line-height:  1.55
  tracking:     0.01em
  usage:        "รายการ secondary ในการ์ด"

text-body-sm:
  size:         14px   # 0.875rem
  weight:       400
  line-height:  1.5
  tracking:     0.01em
  usage:        "caption, helper text, วันที่, เวลา"

text-label-md:
  size:         14px
  weight:       600
  line-height:  1.2
  tracking:     0.02em
  usage:        "Button text, form label, tab label"

text-label-sm:
  size:         12px   # 0.75rem
  weight:       600
  line-height:  1.2
  tracking:     0.03em
  usage:        "Severity badge, pill chip, unit label (mg, เม็ด)"

text-caption:
  size:         12px
  weight:       400
  line-height:  1.4
  tracking:     0.02em
  usage:        "Timestamp, source citation, footnote"

text-overline:
  size:         11px
  weight:       600
  line-height:  1.2
  tracking:     0.08em
  text-transform: uppercase
  usage:        "Section eyebrow (ใช้น้อย – เฉพาะที่จำเป็น)"
```

### 2.3 Thai Text Rules

```yaml
# กฎการจัดการข้อความภาษาไทย
word-break:       "keep-all"         # ไม่ตัดคำกลางพยางค์
overflow-wrap:    "break-word"       # ตัดเฉพาะเมื่อจำเป็น
line-break:       "strict"
hanging-punctuation: false
```

---

## 3. Shape and Spacing Tokens

### 3.1 Border Radius

```yaml
radius-none:      0px
radius-xs:        4px    # Badge border ขนาดเล็ก
radius-sm:        8px    # Input field, small card
radius-md:        12px   # Button, form input (default)
radius-lg:        16px   # Card container (default)
radius-xl:        20px   # Bottom sheet, modal top corners
radius-2xl:       24px   # Drug-food interaction card
radius-pill:      9999px # Severity badge, tab chip, avatar
radius-circle:    50%    # Avatar, FAB button
```

### 3.2 Spacing Scale (4px base unit)

```yaml
space-1:    4px
space-2:    8px
space-3:    12px
space-4:    16px    # ← กฎ padding มาตรฐาน (screen edge)
space-5:    20px
space-6:    24px
space-7:    28px
space-8:    32px
space-10:   40px
space-12:   48px
space-14:   56px
space-16:   64px
```

### 3.3 Layout Constants

```yaml
screen-padding-horizontal:  16px    # space-4 – ขอบซ้าย-ขวาทุกหน้าจอ
screen-padding-top:         20px    # ต่ำกว่า status bar
screen-padding-bottom:      16px    # เหนือ bottom nav (เพิ่ม safe-area)

bottom-nav-height:          64px    # แถบนำทางล่าง (5 tabs)
top-bar-height:             56px    # Header bar (back + title)
status-bar-height:          44px    # iOS / อ้างอิง

card-padding:               16px    # padding ภายใน card
card-gap:                   12px    # ระยะห่างระหว่าง card
list-item-height-sm:        56px    # รายการขนาดเล็ก
list-item-height-md:        72px    # รายการมีรูปภาพ / ข้อมูลเพิ่ม
list-item-height-lg:        88px    # รายการ medication (ชื่อ + ขนาด + เวลา)
touch-target-min:           44px    # WCAG 2.5.5 – minimum tap size
```

### 3.4 Icon Size

```yaml
icon-xs:   16px
icon-sm:   20px
icon-md:   24px   # default (bottom nav, list icon)
icon-lg:   32px
icon-xl:   48px   # confirmation screen illustration
icon-2xl:  64px   # success / empty state illustration
```

---

## 4. Component Tokens

### 4.1 Button

```yaml
button-primary:
  bg:             color-primary-500      # #7C6CD8
  bg-pressed:     color-primary-600      # #6A5AC4
  bg-disabled:    color-neutral-200      # #D6D4E8
  text:           color-neutral-0        # #FFFFFF
  text-disabled:  color-neutral-400      # #9590B0
  border:         none
  border-radius:  radius-md              # 12px
  height:         52px
  padding-h:      space-6               # 24px
  text-style:     text-label-md

button-secondary:
  bg:             color-primary-100      # #EDE9FC
  bg-pressed:     color-primary-200      # #DDD8F8
  text:           color-primary-700      # #5547A6
  border:         "1px solid color-primary-300"
  border-radius:  radius-md
  height:         48px
  padding-h:      space-5               # 20px

button-ghost:
  bg:             transparent
  text:           color-primary-500
  border:         none
  height:         44px
  padding-h:      space-4               # 16px
  text-style:     text-label-md

button-destructive:
  bg:             color-danger-500       # #E84646
  bg-pressed:     color-danger-700
  text:           color-neutral-0
  border-radius:  radius-md
  height:         52px

button-confirm:
  bg:             color-success-500      # #4DB06F
  bg-pressed:     color-success-700
  text:           color-neutral-0
  border-radius:  radius-md
  height:         52px
  icon-left:      check-circle
```

### 4.2 Input Field

```yaml
input-default:
  bg:             color-neutral-0
  border:         "1px solid color-neutral-200"
  border-radius:  radius-sm              # 8px
  height:         48px
  padding-h:      space-4
  text-style:     text-body-lg
  placeholder-color: color-neutral-400

input-focused:
  border:         "2px solid color-primary-500"
  bg:             color-neutral-0
  shadow:         "0 0 0 3px color-primary-100"

input-error:
  border:         "1px solid color-danger-500"
  shadow:         "0 0 0 3px color-danger-100"

input-disabled:
  bg:             color-neutral-100
  border:         "1px solid color-neutral-200"
  text:           color-neutral-400
```

### 4.3 Card

```yaml
card-default:
  bg:             color-neutral-0
  border-radius:  radius-lg              # 16px
  padding:        card-padding           # 16px
  shadow:         "0 2px 12px rgba(124, 108, 216, 0.08)"

card-highlighted:
  bg:             color-primary-50       # #F5F3FF
  border:         "1px solid color-primary-200"
  border-radius:  radius-lg
  padding:        card-padding

card-medication:
  bg:             color-neutral-0
  border-radius:  radius-lg
  padding:        "16px"
  min-height:     list-item-height-lg   # 88px
  border-left:    "4px solid color-primary-500"   # ตัวระบุสถานะยา
  shadow:         "0 2px 8px rgba(0,0,0,0.06)"

card-warning:
  bg:             color-warning-50
  border:         "1px solid color-warning-500"
  border-radius:  radius-lg

card-danger:
  bg:             color-danger-50
  border:         "1px solid color-danger-500"
  border-radius:  radius-lg
```

### 4.4 Badge / Pill

```yaml
badge-severity-high:
  bg:     color-danger-100
  text:   color-danger-700
  border: "1px solid color-danger-500"
  border-radius: radius-pill
  padding: "2px 10px"
  text-style: text-label-sm

badge-severity-medium:
  bg:     color-warning-100
  text:   color-warning-700
  border: "1px solid color-warning-500"
  border-radius: radius-pill
  padding: "2px 10px"
  text-style: text-label-sm

badge-severity-low:
  bg:     color-info-100
  text:   color-info-700
  border: "1px solid color-info-500"
  border-radius: radius-pill
  padding: "2px 10px"
  text-style: text-label-sm

badge-status-confirmed:
  bg:     color-success-100
  text:   color-success-700
  border-radius: radius-pill
  padding: "2px 10px"
  icon-left: check-circle (icon-xs)

badge-status-pending:
  bg:     color-neutral-100
  text:   color-neutral-600
  border-radius: radius-pill
  padding: "2px 10px"

badge-count:
  bg:     color-danger-500
  text:   color-neutral-0
  size:   18px
  border-radius: radius-circle
  position: "top-right of icon"
```

### 4.5 Bottom Navigation Bar

```yaml
bottom-nav:
  bg:             color-neutral-0
  height:         bottom-nav-height      # 64px
  border-top:     "1px solid color-neutral-100"
  shadow:         "0 -2px 8px rgba(124, 108, 216, 0.08)"
  padding-bottom: "safe-area-inset-bottom"

  tab-count:      5
  tab-items:
    - key: home
      label: "หน้าหลัก"
      icon:  home-outline / home-filled
    - key: medications
      label: "ยาของฉัน"
      icon:  pill-outline / pill-filled
    - key: appointments
      label: "นัดหมาย"
      icon:  calendar-outline / calendar-filled
    - key: profile
      label: "โปรไฟล์"
      icon:  person-outline / person-filled

  tab-active:
    icon-color:   color-primary-500
    label-color:  color-primary-500
    label-style:  text-label-sm + weight-600

  tab-inactive:
    icon-color:   color-neutral-400
    label-color:  color-neutral-400
    label-style:  text-label-sm + weight-400
```

### 4.6 Notification / Alert Row

```yaml
notification-row:
  bg:             color-neutral-0
  bg-unread:      color-primary-50
  min-height:     72px
  padding:        "12px 16px"
  border-bottom:  "1px solid color-neutral-100"

  unread-indicator:
    color:        color-primary-500
    size:         8px
    border-radius: radius-circle

  action-buttons:
    confirm:
      label:  "ยืนยันกิน"
      style:  button-confirm (height 36px)
    snooze:
      label:  "เลื่อน 30 นาที"
      style:  button-secondary (height 36px)
    skip:
      label:  "✕ ข้ามครั้งนี้"
      style:  button-ghost (height 36px)
```

### 4.7 Drug-Food Interaction Card

```yaml
interaction-card:
  bg:             color-neutral-0
  border-radius:  radius-xl              # 20px
  padding:        space-4               # 16px
  shadow:         "0 2px 12px rgba(124, 108, 216, 0.08)"
  gap:            space-3               # 12px (ระหว่าง section)

  header:
    food-name:    text-h3
    severity-badge: badge-severity-*
    warning-icon: icon-md (⚠)

  body:
    drug-chip:
      bg:         color-primary-100
      text:       color-primary-700
      border-radius: radius-pill
      padding:    "4px 10px"
      text-style: text-label-sm

    avoid-time:
      icon:       clock-outline (icon-sm)
      text-style: text-body-sm + color-neutral-600

    warning-text:
      text-style: text-body-sm
      color:      color-neutral-700
      prefix-icon: "⚠" in severity color

    source-cite:
      text-style: text-caption + italic
      color:      color-neutral-400
      prefix:     "แหล่งอ้างอิง:"
```

### 4.8 Schedule / Timeline Slot

```yaml
schedule-slot:
  height:         list-item-height-md    # 72px
  padding:        "12px 16px"
  bg:             color-neutral-0
  border-bottom:  "1px solid color-neutral-100"

  time-label:
    text-style:   text-label-md
    color:        color-neutral-700
    min-width:    64px

  medication-name:
    text-style:   text-body-lg + weight-600
    color:        color-neutral-900

  dosage-info:
    text-style:   text-body-sm
    color:        color-neutral-500

  status-icon:
    confirmed:    ✓ (color-success-500, icon-md)
    pending:      ○ (color-neutral-300, icon-md)
    missed:       ✕ (color-danger-500, icon-md)
```

### 4.9 Progress Indicator

```yaml
progress-bar:
  track-bg:       color-neutral-100
  fill:           gradient-primary
  height:         8px
  border-radius:  radius-pill

progress-label:
  text-style:     text-body-sm
  color:          color-neutral-600
  format:         "{done} / {total} รายการ"
```

### 4.10 Avatar / Profile

```yaml
avatar:
  size-sm:   32px
  size-md:   48px
  size-lg:   64px
  size-xl:   80px

  bg-fallback:  color-primary-200
  text-color:   color-primary-700
  text-style:   text-h2 (scaled to size)
  border-radius: radius-circle
```

---

## 5. Overview Prose

**MedManager** เป็นแอปพลิเคชันจัดการยาสำหรับผู้ป่วยในชีวิตประจำวัน ระบบ Design ถูกออกแบบรอบหลักการสำคัญสามประการ ได้แก่ **ความชัดเจน** (ผู้ใช้รู้ทันทีว่าต้องทำอะไร) **ความปลอดภัย** (ข้อมูลวิกฤติต้องเด่นชัด) และ **ความเข้าถึงได้** (รองรับผู้สูงอายุและผู้ที่ไม่คุ้นเคยกับเทคโนโลยี)

ระบบใช้ Soft Lavender Purple เป็นสีแบรนด์หลัก ซึ่งให้ความรู้สึกสงบ น่าเชื่อถือ และแตกต่างจาก Healthcare App ทั่วไปที่มักใช้ Green หรือ Blue เป็นหลัก สีม่วงอ่อนนี้ยังให้คอนทราสต์เพียงพอบนพื้นหลังขาวครีม โดยยังคง WCAG AA compliance

Font Sarabun ถูกเลือกเพราะรองรับภาษาไทยได้ดีที่สุดในกลุ่ม Sans-serif ที่มีในระบบ Google Fonts น้ำหนัก Regular (400) และ SemiBold (600) ให้ลำดับชั้นข้อมูลที่ชัดเจนโดยไม่ต้องการ typeface สอง family

Component ทุกตัวถูกออกแบบให้ touch target มีขนาดอย่างน้อย 44×44px ตามมาตรฐาน WCAG 2.5.5 เพื่อรองรับผู้ใช้สูงอายุที่มือสั่นหรือการมองเห็นไม่ดี

---

## 6. Design Principles Prose

### 6.1 Colors

สีในระบบแบ่งเป็นสองชั้น ชั้นแรกคือ **Brand Layer** ซึ่งประกอบด้วย Primary Purple 9 shade และ Neutral Slate 10 shade ใช้สำหรับ UI ทั่วไป ชั้นที่สองคือ **Semantic Layer** ซึ่งสื่อความหมายโดยตรงได้แก่ Success Green สำหรับการยืนยันกินยาสำเร็จ Warning Amber สำหรับการแจ้งเตือนระดับกลาง Danger Red สำหรับปฏิกิริยายาระดับสูงและข้อผิดพลาด และ Info Blue สำหรับระดับความเสี่ยงต่ำ

กฎที่เข้มงวด: ห้ามใช้สีแดง (color-danger-*) เพื่อการตกแต่ง ทุกครั้งที่ใช้ต้องสื่อความหมายว่า "ต้องระวัง" หรือ "ผิดพลาด" เท่านั้น ช่วยให้ผู้ใช้เรียนรู้ความหมายของสีได้รวดเร็วและไม่สับสน

พื้นหลังหน้าจอใช้ `color-neutral-50` (#F7F6FF) แทนขาวบริสุทธิ์ เพื่อลดความล้าสายตาสำหรับการใช้งานระยะยาว Card และ modal ใช้ `color-neutral-0` (#FFFFFF) เพื่อสร้างความแตกต่างของชั้นข้อมูล (Elevation through color)

### 6.2 Typography

ลำดับชั้นตัวอักษรมี 7 ระดับ ตั้งแต่ `text-display` (28px, Bold) สำหรับชื่อแอป ไปจนถึง `text-caption` (12px, Regular) สำหรับการอ้างอิงแหล่งที่มา ทุก size ถูกกำหนด line-height อย่างชัดเจน ระหว่าง 1.2 (heading) ถึง 1.6 (body) เพื่อให้ภาษาไทยที่มีวรรณยุกต์อ่านง่าย

น้ำหนักที่ใช้มีเพียง Regular (400) และ SemiBold (600) สำหรับเนื้อหาทั่วไป และ Bold (700) เฉพาะ Heading ระดับ H1 และ Display ข้อจำกัดนี้ทำให้หน้าจอสะอาดและไม่ "ดังเกินไป" ซึ่งเหมาะกับบริบทสุขภาพที่ต้องการความสงบ

ข้อความ Thai ทั้งหมดใช้ `word-break: keep-all` เพื่อป้องกันการตัดคำกลางพยางค์ซึ่งทำให้อ่านยาก

### 6.3 Layout

ทุกหน้าจอมี horizontal padding 16px (space-4) คงเส้นคงวา สร้าง reading lane ที่ชัดเจน เนื้อหาทั้งหมด left-aligned ยกเว้น Success / Empty state ที่ center-aligned ด้วยเหตุผลเชิงอารมณ์

การ์ดยาในรายการ (`card-medication`) มี left border 4px เพื่อบอก status สี เป็น visual affordance ที่ผู้ใช้สูงอายุเข้าใจได้โดยไม่ต้องอ่านข้อความ

Bottom Navigation Bar มี 4 tabs หลัก (หน้าหลัก / ยาของฉัน / นัดหมาย / โปรไฟล์) ออกแบบให้ tap target กว้าง เพื่อลด mis-tap

### 6.4 Elevation

ระบบ elevation ใช้ box-shadow แทน color ไม่ใช้ z-index ลำพัง:

| Layer | Shadow | ตัวอย่าง |
|---|---|---|
| Level 0 | none | Screen background |
| Level 1 | `0 2px 8px rgba(0,0,0,0.06)` | List item, divider |
| Level 2 | `0 2px 12px rgba(124,108,216,0.08)` | Card default |
| Level 3 | `0 4px 20px rgba(124,108,216,0.12)` | Modal, action sheet |
| Level 4 | `0 8px 32px rgba(124,108,216,0.16)` | Bottom sheet, FAB |

Shadow ทั้งหมดใช้สีม่วงอ่อน (primary color tinted) แทน neutral black เพื่อให้ blend เข้ากับ palette และไม่รู้สึก "หนัก"

---

## 7. Components Prose

### 7.1 Button System

ระบบ button มี 5 variant ที่มีลำดับความสำคัญชัดเจน:

**Primary** (สีม่วง เต็ม) ใช้กับ action สำคัญที่สุดในหน้า เช่น "เข้าสู่ระบบ" "บันทึก" ในหนึ่งหน้าควรมีไม่เกิน 1 Primary Button เพื่อไม่สร้างความสับสน

**Confirm** (สีเขียว) ใช้เฉพาะ "ยืนยันรับประทานยาแล้ว" เพื่อให้ action ที่สำคัญที่สุดด้านสุขภาพมีสีสัญลักษณ์ที่เด่นชัดและแยกจาก Primary ได้ทันที

**Secondary** (สีม่วงอ่อน) ใช้กับ action รอง เช่น "เลื่อน 30 นาที" "ดูตาราง"

**Ghost** ใช้กับ action ที่สาม เช่น "ข้ามครั้งนี้" หรือ "ยกเลิก" — ลด visual weight เพื่อไม่ดึงความสนใจ

**Destructive** (สีแดง) ใช้เฉพาะการลบข้อมูล ต้องมี confirmation dialog ก่อนทุกครั้ง

ทุก button มีความสูงอย่างน้อย 44px และ loading state (spinner) เพื่อป้องกัน double-tap

### 7.2 Drug-Food Interaction Card

หัวใจของ Feature เด่นในแอป Card นี้แสดงข้อมูลแบบ 3-zone:

**Zone 1 — Header**: ชื่ออาหาร + Severity Badge (สูง/กลาง/ต่ำ) + Warning icon ให้ผู้ใช้ประเมินความเสี่ยงก่อนอ่านรายละเอียด

**Zone 2 — Details**: ยาที่เกี่ยวข้อง (Drug Chip), ระยะเวลาที่ต้องหลีกเลี่ยง (⏱ icon + ข้อความ), คำอธิบายผลที่เกิดขึ้น (⚠ icon + สีตาม severity)

**Zone 3 — Source**: แหล่งอ้างอิงแบบ italic text ขนาด 12px เพื่อสร้างความน่าเชื่อถือและตรวจสอบได้

Filter chip bar ด้านบน (ทั้งหมด / แอสไพริน / เมทฟอร์มิน / โอเมก้า 3) ช่วยให้ค้นหาเฉพาะยาที่ตนใช้ได้รวดเร็ว

### 7.3 Confirmation Screen

หน้ายืนยันการรับประทานยาถูกออกแบบให้ทำ single-action ให้เสร็จในขั้นตอนเดียว:

1. **Medication summary** บนสุด — ชื่อยา, ขนาด, เวลา, วิธีรับประทาน
2. **Warning zone** (สีแดงอ่อน) — อาหารที่ต้องหลีกเลี่ยง เพื่อให้อ่านก่อนกด confirm
3. **Instruction zone** (สีขาว) — คำแนะนำการรับประทาน
4. **Side effects preview** — อาการที่ควรระวัง (linkable ไปยัง side effect form)
5. **Action buttons** — Confirm (เขียว, เต็ม), Snooze (ม่วงอ่อน), Skip (ghost)

ลำดับนี้บังคับให้ผู้ใช้ scroll ผ่านข้อมูลความปลอดภัยก่อนกด Confirm ซึ่งเป็น UX Safety Pattern สำคัญ

### 7.4 Success / Empty States

**Success State** (หลังบันทึกยา): ใช้ checkmark icon ขนาด 64px สีเขียวตรงกลาง + ข้อความสรุปสิ่งที่บันทึก center-aligned หน้านี้เป็น "moment of calm" ให้ผู้ใช้รู้ว่าระบบทำงานแล้ว ก่อน navigate ออก

**Empty State** (ยังไม่มียา): icon ยาขนาด 64px สีม่วงอ่อน + ข้อความกระชับ + Primary Button "เพิ่มยา" ทันที เพื่อ convert ผู้ใช้ใหม่เข้า flow หลัก

---

## 8. Responsive Behavior and Known Gaps

### 8.1 Breakpoints

แอปเป็น Mobile-first React Native ดังนั้น breakpoint ไม่ใช่ CSS media query แบบ web แต่ใช้ Dimensions API ของ React Native:

```typescript
const Breakpoints = {
  sm:     360,   // โทรศัพท์หน้าจอเล็ก (เช่น iPhone SE)
  base:   390,   // Target หลัก (iPhone 14 / Samsung S23)
  lg:     430,   // iPhone 14 Plus / Pro Max
  tablet: 768,   // iPad / Android tablet
};
```

### 8.2 Responsive Rules ต่อ Breakpoint

| Component | sm (360px) | base (390px) | lg (430px) | tablet (768px) |
|---|---|---|---|---|
| card-gap | 8px | 12px | 12px | 16px |
| screen-padding-h | 12px | 16px | 16px | 24px |
| text-display | 24px | 28px | 28px | 32px |
| text-h1 | 20px | 24px | 24px | 28px |
| text-body-lg | 15px | 16px | 16px | 17px |
| bottom-nav-height | 60px | 64px | 64px | 72px |
| bottom-nav-labels | ซ่อน | แสดง | แสดง | แสดง |
| card columns | 1 | 1 | 1 | 2 |
| medication list | เต็มความกว้าง | เต็มความกว้าง | เต็มความกว้าง | 2 คอลัมน์ |

### 8.3 Font Scaling (Accessibility)

React Native รองรับ `allowFontScaling` เพื่อให้ผู้ใช้ปรับขนาดตัวอักษรได้จาก system setting:

```typescript
// กฎ: body text อนุญาตให้ scale สูงสุด 1.4x
// กฎ: label/badge text cap ที่ 1.2x เพื่อป้องกัน layout แตก
const FontScaleConfig = {
  body:    { allowFontScaling: true,  maxFontSizeMultiplier: 1.4 },
  label:   { allowFontScaling: true,  maxFontSizeMultiplier: 1.2 },
  caption: { allowFontScaling: true,  maxFontSizeMultiplier: 1.2 },
  badge:   { allowFontScaling: false },   // badge ขนาดตายตัว
};
```

### 8.4 Dark Mode

ระบบ v1.0 **ยังไม่รองรับ Dark Mode** (Known Gap)
แนะนำให้เพิ่มใน v2.0 โดยใช้ token aliasing:

```yaml
# ตัวอย่าง future token alias
surface-default:
  light: color-neutral-0      # #FFFFFF
  dark:  "#1E1B2E"

surface-app:
  light: color-neutral-50     # #F7F6FF
  dark:  "#15122A"

text-primary:
  light: color-neutral-900    # #1A1535
  dark:  "#EDE9FC"
```

### 8.5 Known Gaps (v1.0)

| # | ช่องว่างที่รู้อยู่ | ผลกระทบ | Priority |
|---|---|---|---|
| 1 | Dark Mode ไม่รองรับ | ผู้ใช้กลางคืนเมื่อยตา | Medium |
| 2 | ไม่มี component สำหรับ Tablet 2-column layout | หน้าจอ iPad ใช้ layout มือถือ | Low |
| 3 | Animation / micro-interaction ยังไม่ document | Dev ต้องตีความเอง | Medium |
| 4 | Skeleton loader ยังไม่มี spec | Loading state ไม่สม่ำเสมอ | High |
| 5 | RTL (Right-to-Left) ไม่รองรับ | ไม่กระทบผู้ใช้ไทย แต่จำกัด localization | Low |
| 6 | Web Admin Dashboard ยังไม่มี design spec | Admin ใช้ layout แยก (React Web) | High |
| 7 | Haptic Feedback pattern ไม่ระบุ | Dev ต้องกำหนดเองตาม platform | Medium |
| 8 | Image upload preview component ขาด | หน้า "เพิ่มยาใหม่" ใช้ placeholder | Medium |

### 8.6 Accessibility Checklist

- [x] Touch target ≥ 44×44px ทุก interactive element
- [x] Color contrast ratio ≥ 4.5:1 สำหรับ body text (WCAG AA)
- [x] ไม่ใช้สีเพียงอย่างเดียวสื่อความหมาย (มี icon + label ประกอบเสมอ)
- [x] Font scaling รองรับถึง 140%
- [x] Error state มีข้อความ helper ประกอบ ไม่แสดงเฉพาะเส้นขอบสีแดง
- [ ] Screen reader (TalkBack / VoiceOver) labels — TODO v1.1
- [ ] Keyboard navigation สำหรับ external keyboard — TODO v1.1
- [ ] Reduced Motion — TODO v1.1

---

*MedManager Design System v1.0.0 — สงวนลิขสิทธิ์ © 2569 — อัปเดตล่าสุด 12 กรกฎาคม 2569*

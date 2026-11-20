import { supabase } from './supabaseClient'
import { normalizeStr } from '../utils/adherenceUtils'
import { findCascadeInteractionIds } from '../utils/medicationUtils'
import { compressDataUrlIfOversized } from './drugImageService'

const autoCompressedMedIds = new Set()

export const medicationService = {
  async getMedications(filters = {}) {
    if (!supabase) return []
    try {
      let query = supabase.from('medications').select('*').order('created_at', { ascending: true })
      if (filters.search) {
        query = query.or(`name_th.ilike.%${filters.search}%,name_en.ilike.%${filters.search}%,code.ilike.%${filters.search}%`)
      }
      if (filters.type && filters.type !== 'ทั้งหมด') {
        query = query.eq('type', filters.type)
      }
      if (filters.category && filters.category !== 'ทั้งหมด') {
        query = query.eq('category', filters.category)
      }
      const { data, error } = await query
      if (error) {
        console.error('Error fetching medications:', error)
        return []
      }
      const rows = data || []

      // Automatically shrink any oversized legacy Base64 images (>80KB) in the background once
      rows.forEach(row => {
        if (
          row?.id &&
          typeof row.image_url === 'string' &&
          row.image_url.startsWith('data:image/') &&
          row.image_url.length > 80000 &&
          !autoCompressedMedIds.has(row.id)
        ) {
          autoCompressedMedIds.add(row.id)
          compressDataUrlIfOversized(row.image_url)
            .then(compressed => {
              if (compressed && compressed.length < row.image_url.length) {
                row.image_url = compressed
                supabase
                  .from('medications')
                  .update({ image_url: compressed })
                  .eq('id', row.id)
                  .then(() => {}, () => {})
              }
            })
            .catch(() => {})
        }
      })

      return rows
    } catch (err) {
      console.error('getMedications error:', err)
      return []
    }
  },

  async getMedicationById(id) {
    if (!supabase) return null
    try {
      const { data, error } = await supabase.from('medications').select('*').eq('id', id).single()
      if (error) {
        console.error('Error fetching medication by id:', error)
        return null
      }
      return data
    } catch (err) {
      console.error('getMedicationById error:', err)
      return null
    }
  },

  async saveMedication(data) {
    if (!supabase) throw new Error('Supabase is not configured')

    const targetTh = normalizeStr(data.name_th)
    const targetEn = normalizeStr(data.name_en)

    const { data: allMeds, error: fetchMedsError } = await supabase
      .from('medications')
      .select('id, name_th, name_en')

    if (!fetchMedsError && allMeds) {
      const duplicate = allMeds.find(m => {
        if (data.id && String(m.id) === String(data.id)) return false
        const existingTh = normalizeStr(m.name_th)
        const existingEn = normalizeStr(m.name_en)
        return (targetTh && existingTh === targetTh) || (targetEn && existingEn === targetEn)
      })

      if (duplicate) {
        const dupTh = normalizeStr(duplicate.name_th)
        if (targetTh && dupTh === targetTh) {
          throw new Error(`ชื่อยาภาษาไทย "${data.name_th.trim()}" มีอยู่ในระบบแล้ว ไม่สามารถเพิ่มซ้ำได้`)
        } else {
          throw new Error(`ชื่อยาภาษาอังกฤษ "${data.name_en.trim()}" มีอยู่ในระบบแล้ว ไม่สามารถเพิ่มซ้ำได้`)
        }
      }
    }

    const optimizedImageUrl = await compressDataUrlIfOversized(data.image_url)

    if (data.id && !data.id.startsWith('med-')) {
      const updatePayload = {
        name_th: data.name_th,
        name_en: data.name_en,
        type: data.type,
        dosage: data.dosage,
        unit: data.unit,
        category: data.category,
        indications: data.indications,
        instructions: data.instructions,
        precautions: data.precautions,
        image_url: optimizedImageUrl,
        updated_at: new Date().toISOString()
      }
      const { data: res, error } = await supabase
        .from('medications')
        .update(updatePayload)
        .eq('id', data.id)
        .select()
      if (error) throw error
      return res?.[0]
    }

    const { data: existing } = await supabase.from('medications').select('code').order('code', { ascending: false }).limit(1)
    let nextCode = '001'
    if (existing && existing.length > 0 && existing[0].code) {
      const num = parseInt(existing[0].code, 10)
      if (!isNaN(num)) {
        nextCode = String(num + 1).padStart(3, '0')
      }
    }

    const insertPayload = {
      code: data.code || nextCode,
      name_th: data.name_th,
      name_en: data.name_en,
      type: data.type,
      dosage: data.dosage,
      unit: data.unit,
      category: data.category,
      indications: data.indications,
      instructions: data.instructions,
      precautions: data.precautions,
      image_url: optimizedImageUrl
    }

    const { data: res, error } = await supabase
      .from('medications')
      .insert([insertPayload])
      .select()
    if (error) throw error
    return res?.[0]
  },

  async deleteInteractionsForMedications(medsList) {
    if (!supabase || !medsList || medsList.length === 0) return

    try {
      const { data: allInteractions, error: fetchErr } = await supabase
        .from('drug_food_interactions')
        .select('id, medication_id, medication_name, food_name')

      if (fetchErr) {
        console.error('Error fetching interactions for cascade delete:', fetchErr)
        return
      }

      if (!allInteractions || allInteractions.length === 0) return

      const toDeleteIds = findCascadeInteractionIds(allInteractions, medsList)

      if (toDeleteIds.length > 0) {
        console.log(`Cascade deleting ${toDeleteIds.length} interactions for medications:`, medsList.map(m => m.name_th || m.name_en))
        const { error: delErr } = await supabase
          .from('drug_food_interactions')
          .delete()
          .in('id', toDeleteIds)

        if (delErr) {
          console.error('Error cascade deleting interactions:', delErr)
          throw delErr
        }
      }
    } catch (err) {
      console.error('deleteInteractionsForMedications error:', err)
      throw err
    }
  },

  async deleteMedication(id) {
    if (!supabase) return false
    try {
      const { data: med, error: fetchErr } = await supabase
        .from('medications')
        .select('id, name_th, name_en')
        .eq('id', id)
        .maybeSingle()

      if (fetchErr) {
        console.error('Error fetching medication before delete:', fetchErr)
      }

      if (med) {
        await medicationService.deleteInteractionsForMedications([med])
      }

      const { error } = await supabase.from('medications').delete().eq('id', id)
      if (error) {
        console.error('Error deleting medication:', error)
        throw error
      }
      return true
    } catch (err) {
      console.error('deleteMedication error:', err)
      throw err
    }
  },

  async deleteMultipleMedications(ids) {
    if (!supabase) return false
    if (!ids || ids.length === 0) return true
    try {
      const { data: meds, error: fetchErr } = await supabase
        .from('medications')
        .select('id, name_th, name_en')
        .in('id', ids)

      if (fetchErr) {
        console.error('Error fetching medications before delete:', fetchErr)
      }

      if (meds && meds.length > 0) {
        await medicationService.deleteInteractionsForMedications(meds)
      }

      const { error } = await supabase.from('medications').delete().in('id', ids)
      if (error) {
        console.error('Error deleting multiple medications:', error)
        throw error
      }
      return true
    } catch (err) {
      console.error('deleteMultipleMedications error:', err)
      throw err
    }
  }
}

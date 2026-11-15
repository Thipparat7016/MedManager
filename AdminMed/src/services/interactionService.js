import { supabase } from './supabaseClient'
import { normalizeStr } from '../utils/adherenceUtils'

export const interactionService = {
  async getInteractions(filters = {}) {
    if (!supabase) return []
    try {
      let query = supabase.from('drug_food_interactions').select('*').order('created_at', { ascending: true })
      if (filters.search) {
        query = query.or(`medication_name.ilike.%${filters.search}%,food_name.ilike.%${filters.search}%`)
      }
      if (filters.severity && filters.severity !== 'ทั้งหมด') {
        query = query.eq('severity', filters.severity)
      }
      if (filters.type && filters.type !== 'ทั้งหมด') {
        if (filters.type === 'แนะนำ') {
          query = query.or('interaction_type.eq.แนะนำ,interaction_type.eq.แนะนำให้รับประทานร่วม')
        } else {
          query = query.eq('interaction_type', filters.type)
        }
      }
      const { data, error } = await query
      if (error) {
        console.error('Error fetching interactions:', error)
        return []
      }
      return data || []
    } catch (err) {
      console.error('getInteractions error:', err)
      return []
    }
  },

  async getInteractionById(id) {
    if (!supabase) return null
    try {
      const { data, error } = await supabase.from('drug_food_interactions').select('*').eq('id', id).single()
      if (error) {
        console.error('Error fetching interaction by id:', error)
        return null
      }
      return data
    } catch (err) {
      console.error('getInteractionById error:', err)
      return null
    }
  },

  async saveInteraction(data) {
    if (!supabase) throw new Error('Supabase is not configured')

    const targetMed = normalizeStr(data.medication_name)
    const targetFood = normalizeStr(data.food_name)

    const { data: allInteractions, error: fetchInterError } = await supabase
      .from('drug_food_interactions')
      .select('id, medication_name, food_name')

    if (!fetchInterError && allInteractions) {
      const duplicate = allInteractions.find(item => {
        if (data.id && String(item.id) === String(data.id)) return false
        const existingMed = normalizeStr(item.medication_name)
        const existingFood = normalizeStr(item.food_name)
        return existingMed === targetMed && existingFood === targetFood
      })

      if (duplicate) {
        throw new Error(`มีข้อมูลปฏิสัมพันธ์ระหว่างยา "${data.medication_name.trim()}" กับอาหาร "${data.food_name.trim()}" ในระบบแล้ว ไม่สามารถเพิ่มซ้ำได้`)
      }
    }

    const hoursNote = data.hours_note || (data.hours_before || data.hours_after ? `${data.hours_before || 0} ชม. ก่อน-${data.hours_after || 0} ชม. หลัง` : '')

    let resolvedMedId = data.medication_id || null
    if (!resolvedMedId && data.medication_name) {
      try {
        const { data: matchedMeds } = await supabase
          .from('medications')
          .select('id, name_th, name_en')
        if (matchedMeds) {
          const found = matchedMeds.find(m =>
            normalizeStr(m.name_th) === targetMed ||
            normalizeStr(m.name_en) === targetMed
          )
          if (found) {
            resolvedMedId = found.id
          }
        }
      } catch (err) {
        console.error('Error resolving medication_id:', err)
      }
    }

    if (data.id && !data.id.startsWith('inter-')) {
      const updatePayload = {
        medication_id: resolvedMedId,
        medication_name: data.medication_name,
        food_name: data.food_name,
        interaction_type: data.interaction_type,
        severity: data.severity,
        hours_note: hoursNote,
        hours_before: Number(data.hours_before) || 0,
        hours_after: Number(data.hours_after) || 0,
        impact_details: data.impact_details,
        source_type: data.source_type,
        source_name: data.source_name,
        url_doi: data.url_doi,
        publish_year: data.publish_year,
        updated_at: new Date().toISOString()
      }
      const { data: res, error } = await supabase
        .from('drug_food_interactions')
        .update(updatePayload)
        .eq('id', data.id)
        .select()
      if (error) throw error
      return res?.[0]
    }

    const { data: existing } = await supabase.from('drug_food_interactions').select('code').order('code', { ascending: false }).limit(1)
    let nextCode = '001'
    if (existing && existing.length > 0 && existing[0].code) {
      const num = parseInt(existing[0].code, 10)
      if (!isNaN(num)) {
        nextCode = String(num + 1).padStart(3, '0')
      }
    }

    const insertPayload = {
      code: data.code || nextCode,
      medication_id: resolvedMedId,
      medication_name: data.medication_name,
      food_name: data.food_name,
      interaction_type: data.interaction_type,
      severity: data.severity,
      hours_note: hoursNote,
      hours_before: Number(data.hours_before) || 0,
      hours_after: Number(data.hours_after) || 0,
      impact_details: data.impact_details,
      source_type: data.source_type,
      source_name: data.source_name,
      url_doi: data.url_doi,
      publish_year: data.publish_year
    }

    const { data: res, error } = await supabase
      .from('drug_food_interactions')
      .insert([insertPayload])
      .select()
    if (error) throw error
    return res?.[0]
  },

  async deleteInteraction(id) {
    if (!supabase) return false
    const { error } = await supabase.from('drug_food_interactions').delete().eq('id', id)
    if (error) {
      console.error('Error deleting interaction:', error)
      throw error
    }
    return true
  },

  async deleteMultipleInteractions(ids) {
    if (!supabase) return false
    const { error } = await supabase.from('drug_food_interactions').delete().in('id', ids)
    if (error) {
      console.error('Error deleting multiple interactions:', error)
      throw error
    }
    return true
  }
}

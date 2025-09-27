// إعداد Supabase - قم بتحديث هذه القيم بمعلومات مشروعك
import { createClient } from '@supabase/supabase-js'

// ⚠️ قم بتحديث هذه القيم من لوحة تحكم Supabase
const supabaseUrl = 'https://your-project-ref.supabase.co' // استبدل بـ URL مشروعك
const supabaseKey = 'your-anon-key-here' // استبدل بـ API Key الخاص بك

// إنشاء عميل Supabase
export const supabase = createClient(supabaseUrl, supabaseKey)

// دالة للتحقق من الاتصال
export async function testConnection() {
    try {
        const { data, error } = await supabase
            .from('patients')
            .select('count', { count: 'exact', head: true })
        
        if (error) {
            throw error
        }
        
        console.log('✅ تم الاتصال بقاعدة البيانات بنجاح')
        return { success: true, count: data }
    } catch (error) {
        console.error('❌ خطأ في الاتصال بقاعدة البيانات:', error)
        return { success: false, error: error.message }
    }
}

// دوال قاعدة البيانات

// إضافة مريض جديد
export async function addPatient(patientData) {
    try {
        const { data, error } = await supabase
            .from('patients')
            .insert([patientData])
            .select()
        
        if (error) throw error
        return { success: true, data }
    } catch (error) {
        console.error('خطأ في إضافة المريض:', error)
        return { success: false, error: error.message }
    }
}

// جلب جميع المرضى
export async function getAllPatients() {
    try {
        const { data, error } = await supabase
            .from('patients')
            .select('*')
            .order('created_at', { ascending: false })
        
        if (error) throw error
        return { success: true, data }
    } catch (error) {
        console.error('خطأ في جلب المرضى:', error)
        return { success: false, error: error.message }
    }
}

// تحديث بيانات مريض
export async function updatePatient(patientId, updateData) {
    try {
        const { data, error } = await supabase
            .from('patients')
            .update(updateData)
            .eq('id', patientId)
            .select()
        
        if (error) throw error
        return { success: true, data }
    } catch (error) {
        console.error('خطأ في تحديث المريض:', error)
        return { success: false, error: error.message }
    }
}

// حذف مريض
export async function deletePatient(patientId) {
    try {
        const { error } = await supabase
            .from('patients')
            .delete()
            .eq('id', patientId)
        
        if (error) throw error
        return { success: true }
    } catch (error) {
        console.error('خطأ في حذف المريض:', error)
        return { success: false, error: error.message }
    }
}

// البحث في المرضى
export async function searchPatients(searchCriteria) {
    try {
        let query = supabase.from('patients').select('*')
        
        if (searchCriteria.name) {
            query = query.ilike('name', `%${searchCriteria.name}%`)
        }
        
        if (searchCriteria.diagnosis) {
            query = query.ilike('diagnosis', `%${searchCriteria.diagnosis}%`)
        }
        
        if (searchCriteria.date) {
            query = query.eq('visit_date', searchCriteria.date)
        }
        
        const { data, error } = await query.order('created_at', { ascending: false })
        
        if (error) throw error
        return { success: true, data }
    } catch (error) {
        console.error('خطأ في البحث:', error)
        return { success: false, error: error.message }
    }
}

// إضافة دواء جديد
export async function addMedication(medicationData) {
    try {
        const { data, error } = await supabase
            .from('medications')
            .insert([medicationData])
            .select()
        
        if (error) throw error
        return { success: true, data }
    } catch (error) {
        console.error('خطأ في إضافة الدواء:', error)
        return { success: false, error: error.message }
    }
}

// جلب جميع الأدوية
export async function getAllMedications() {
    try {
        const { data, error } = await supabase
            .from('medications')
            .select('*')
            .order('name')
        
        if (error) throw error
        return { success: true, data }
    } catch (error) {
        console.error('خطأ في جلب الأدوية:', error)
        return { success: false, error: error.message }
    }
}

// تحديث دواء
export async function updateMedication(medicationId, updateData) {
    try {
        const { data, error } = await supabase
            .from('medications')
            .update(updateData)
            .eq('id', medicationId)
            .select()
        
        if (error) throw error
        return { success: true, data }
    } catch (error) {
        console.error('خطأ في تحديث الدواء:', error)
        return { success: false, error: error.message }
    }
}

// حذف دواء
export async function deleteMedication(medicationId) {
    try {
        const { error } = await supabase
            .from('medications')
            .delete()
            .eq('id', medicationId)
        
        if (error) throw error
        return { success: true }
    } catch (error) {
        console.error('خطأ في حذف الدواء:', error)
        return { success: false, error: error.message }
    }
}

// جلب الإحصائيات المالية
export async function getFinancialStats(startDate, endDate) {
    try {
        let query = supabase.from('patients').select('examination_cost, discount, visit_date')
        
        if (startDate) {
            query = query.gte('visit_date', startDate)
        }
        
        if (endDate) {
            query = query.lte('visit_date', endDate)
        }
        
        const { data, error } = await query
        
        if (error) throw error
        
        // حساب الإحصائيات
        const stats = {
            totalRevenue: 0,
            totalExaminations: data.length,
            totalDiscounts: 0,
            averageCost: 0
        }
        
        data.forEach(patient => {
            const cost = parseFloat(patient.examination_cost) || 0
            const discount = parseFloat(patient.discount) || 0
            const total = cost - discount
            
            stats.totalRevenue += total
            stats.totalDiscounts += discount
        })
        
        stats.averageCost = stats.totalExaminations > 0 ? 
            stats.totalRevenue / stats.totalExaminations : 0
        
        return { success: true, data: stats }
    } catch (error) {
        console.error('خطأ في جلب الإحصائيات المالية:', error)
        return { success: false, error: error.message }
    }
}

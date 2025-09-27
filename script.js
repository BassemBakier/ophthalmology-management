// نظام إدارة مرضى طب العيون مع Supabase - نسخة كاملة مع إدارة الأدوية
// Ophthalmology Patient Management System with Supabase - Complete with Medications Management

// إعداد Supabase - تم تحديث القيم مع إعدادات CORS محسنة
const SUPABASE_URL = 'https://ogjpsyoewaoghppmuhcd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9nanBzeW9ld2FvZ2hwcG11aGNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5OTE2ODcsImV4cCI6MjA3NDU2NzY4N30.UdF6Mluzkf01XfhnvGp0Gec3VwGP8HZAukMNjka61jw';

// إنشاء عميل Supabase مع إعدادات محسنة للاتصال من أي جهاز
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
    },
    global: {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
    },
    db: {
        schema: 'public'
    },
    realtime: {
        params: {
            eventsPerSecond: 10
        }
    }
});

// متغيرات عامة
let patients = [];
let medications = [];
let currentPatientId = 1;
let editingMedicationId = null;

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', async function() {
    await initializeApp();
    setupEventListeners();
});

// تهيئة التطبيق
async function initializeApp() {
    try {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('visit-date').value = today;
    
        updateConnectionStatus('connecting');
        
        // عرض معلومات الاتصال للمطور
        logConnectionInfo();
        
        // اختبار الاتصال أولاً
        await testConnection();
        
        await loadPatientsFromSupabase();
        await loadMedicationsFromSupabase();
    updatePatientsTable();
        renderMedications();
        updateConnectionStatus('connected');
        showAlert('تم تحميل البيانات بنجاح!', 'success');
    } catch (error) {
        console.error('خطأ في تهيئة التطبيق:', error);
        updateConnectionStatus('error');
        showAlert('خطأ في الاتصال بقاعدة البيانات - تحقق من إعدادات CORS', 'error');
        
        // عرض نصائح لحل المشكلة
        showConnectionTroubleshooting();
    }
}

// عرض معلومات الاتصال
function logConnectionInfo() {
    console.log('🔗 معلومات الاتصال:');
    console.log('📍 Supabase URL:', SUPABASE_URL);
    console.log('🔑 API Key:', SUPABASE_KEY.substring(0, 20) + '...');
    console.log('🌐 Current Origin:', window.location.origin);
    console.log('📱 User Agent:', navigator.userAgent);
}

// عرض نصائح حل المشاكل
function showConnectionTroubleshooting() {
    console.log('🔧 نصائح لحل مشاكل الاتصال:');
    console.log('1. اذهب إلى Supabase > Settings > API');
    console.log('2. أضف هذه النطاقات في CORS Origins:');
    console.log('   - https://bassembakier.github.io');
    console.log('   - https://bassembakier.github.io/*');
    console.log('   - * (للتطوير فقط)');
    console.log('3. احفظ التغييرات وانتظر دقيقة');
    console.log('4. أعد تحميل الصفحة');
}

// اختبار الاتصال مع معلومات مفصلة
async function testConnection() {
    try {
        console.log('🔄 جاري اختبار الاتصال بقاعدة البيانات...');
        console.log('📍 URL:', SUPABASE_URL);
        console.log('🌐 Origin:', window.location.origin);
        console.log('📱 User Agent:', navigator.userAgent);
        
        // اختبار الاتصال الأساسي
        const { data, error } = await supabase
            .from('patients')
            .select('count', { count: 'exact', head: true });
        
        if (error) {
            console.error('❌ خطأ في الاتصال:', error);
            console.error('📋 تفاصيل الخطأ:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            
            // محاولة اختبار أبسط
            try {
                const { data: simpleTest, error: simpleError } = await supabase
                    .from('medications')
                    .select('id')
                    .limit(1);
                
                if (simpleError) {
                    throw simpleError;
                }
                
                console.log('✅ تم الاتصال بقاعدة البيانات بنجاح (اختبار مبسط)');
                return true;
            } catch (simpleError) {
                console.error('❌ فشل في الاختبار المبسط:', simpleError);
                throw simpleError;
            }
        }
        
        console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');
        console.log('📊 عدد المرضى:', data?.[0]?.count || 0);
        return true;
    } catch (error) {
        console.error('❌ فشل في الاتصال:', error);
        console.error('💡 نصائح لحل المشكلة:');
        console.error('1. تحقق من إعدادات CORS في Supabase');
        console.error('2. تأكد من صحة URL والـ API Key');
        console.error('3. تحقق من اتصال الإنترنت');
        console.error('4. تأكد من أن المشروع نشط في Supabase');
        throw error;
    }
}

// تحديث مؤشر حالة الاتصال
function updateConnectionStatus(status) {
    const statusElement = document.getElementById('connection-status');
    switch(status) {
        case 'connecting':
            statusElement.innerHTML = '<i class="fas fa-circle"></i> Connecting...';
            statusElement.className = 'status-indicator connecting';
            break;
        case 'connected':
            statusElement.innerHTML = '<i class="fas fa-circle"></i> Connected';
            statusElement.className = 'status-indicator connected';
            break;
        case 'error':
            statusElement.innerHTML = '<i class="fas fa-circle"></i> Connection Error';
            statusElement.className = 'status-indicator error';
            break;
    }
}

// إعداد مستمعي الأحداث
function setupEventListeners() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });

    document.getElementById('patient-form').addEventListener('submit', handlePatientSubmit);
    document.getElementById('patient-form').addEventListener('reset', handleFormReset);
    document.getElementById('export-btn').addEventListener('click', exportPatients);
    document.getElementById('clear-all-btn').addEventListener('click', clearAllPatients);
    document.getElementById('search-btn').addEventListener('click', searchPatientsHandler);
    document.getElementById('clear-search-btn').addEventListener('click', clearSearch);

    // أحداث الأدوية
    document.getElementById('medication-form').addEventListener('submit', handleMedicationSubmit);
    document.getElementById('medication-form').addEventListener('reset', handleMedicationFormReset);

    document.querySelector('.close').addEventListener('click', closeModal);
    document.querySelector('#medication-modal .close').addEventListener('click', closeMedicationModal);
    
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('patient-modal');
        const medicationModal = document.getElementById('medication-modal');
        if (event.target === modal) {
            closeModal();
        }
        if (event.target === medicationModal) {
            closeMedicationModal();
        }
    });

    document.getElementById('search-name').addEventListener('input', debounce(searchPatientsHandler, 300));
    document.getElementById('search-diagnosis').addEventListener('input', debounce(searchPatientsHandler, 300));
    document.getElementById('search-date').addEventListener('change', searchPatientsHandler);

    // إضافة مستمعي أحداث لحساب التكلفة الإجمالية
    const examinationCostInput = document.getElementById('examination-cost');
    const discountInput = document.getElementById('discount');
    
    if (examinationCostInput) {
        examinationCostInput.addEventListener('input', calculateTotal);
    }
    if (discountInput) {
        discountInput.addEventListener('input', calculateTotal);
    }
}

// ============================================================================
// إدارة المرضى
// ============================================================================

// تحميل المرضى من Supabase
async function loadPatientsFromSupabase() {
    try {
        const { data, error } = await supabase
            .from('patients')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('خطأ في تحميل المرضى:', error);
            throw error;
        }
        
        patients = data || [];
        if (patients.length > 0) {
            const maxId = Math.max(...patients.map(p => parseInt(p.patient_id?.split('-')[1]) || 0));
            currentPatientId = maxId + 1;
        }
        generatePatientId();
    } catch (error) {
        console.error('خطأ في تحميل المرضى:', error);
        showAlert('خطأ في تحميل بيانات المرضى - تحقق من إعدادات CORS', 'error');
    }
}

// تحميل الأدوية من Supabase
async function loadMedicationsFromSupabase() {
    try {
        const { data, error } = await supabase
            .from('medications')
            .select('*')
            .order('name');
        
        if (error) {
            console.error('خطأ في تحميل الأدوية:', error);
            throw error;
        }
        
        medications = data || [];
        updateMedicationSelect();
        renderMedications();
    } catch (error) {
        console.error('خطأ في تحميل الأدوية:', error);
    }
}

// توليد رقم المريض
function generatePatientId() {
    document.getElementById('patient-id').value = `OPTH-${currentPatientId.toString().padStart(4, '0')}`;
}

// معالجة إرسال نموذج المريض
async function handlePatientSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const patientData = {
        patient_id: document.getElementById('patient-id').value,
        name: formData.get('name'),
        age: parseInt(formData.get('age')),
        phone: formData.get('phone'),
        gender: formData.get('gender'),
        visit_date: formData.get('visitDate'),
        
        right_eye_va: formData.get('rightVA') || null,
        right_eye_bcva: formData.get('rightBCVA') || null,
        right_eye_comea: formData.get('rightCOMEA') || null,
        right_eye_lid: formData.get('rightLID') || null,
        right_eye_lens: formData.get('rightLENS') || null,
        right_eye_iop: parseFloat(formData.get('rightIOP')) || null,
        right_eye_fundus: formData.get('rightFUNDUS') || null,
        
        left_eye_va: formData.get('leftVA') || null,
        left_eye_bcva: formData.get('leftBCVA') || null,
        left_eye_comea: formData.get('leftCOMEA') || null,
        left_eye_lid: formData.get('leftLID') || null,
        left_eye_lens: formData.get('leftLENS') || null,
        left_eye_iop: parseFloat(formData.get('leftIOP')) || null,
        left_eye_fundus: formData.get('leftFUNDUS') || null,
        
        right_dist_sph: formData.get('rightDistSph') || null,
        right_dist_cyl: formData.get('rightDistCyl') || null,
        right_dist_axis: formData.get('rightDistAxis') || null,
        right_read_sph: formData.get('rightReadSph') || null,
        right_read_cyl: formData.get('rightReadCyl') || null,
        right_read_axis: formData.get('rightReadAxis') || null,
        
        left_dist_sph: formData.get('leftDistSph') || null,
        left_dist_cyl: formData.get('leftDistCyl') || null,
        left_dist_axis: formData.get('leftDistAxis') || null,
        left_read_sph: formData.get('leftReadSph') || null,
        left_read_cyl: formData.get('leftReadCyl') || null,
        left_read_axis: formData.get('leftReadAxis') || null,
        
        ipa_dist: formData.get('ipaDist') || null,
        ipa_dist2: formData.get('ipaDist2') || null,
        ipa_read: formData.get('ipaRead') || null,
        ipa_read2: formData.get('ipaRead2') || null,
        
        chief_complaint: formData.get('complain'),
        diagnosis: formData.get('diagnosis'),
        treatment: formData.get('treatmentMedication'),
        operation: formData.get('operation'),
        
        examination_cost: parseFloat(formData.get('examinationCost')) || 0,
            discount: parseFloat(formData.get('discount')) || 0,
        notes: formData.get('notes')
    };

    if (!validatePatientData(patientData)) {
        return;
    }

    try {
        const { data, error } = await supabase
            .from('patients')
            .insert([patientData])
            .select();
        
        if (error) {
            console.error('خطأ في حفظ المريض:', error);
            throw error;
        }
        
        showAlert('تم حفظ بيانات المريض بنجاح!', 'success');
        
    e.target.reset();
        currentPatientId++;
    generatePatientId();
    
        await loadPatientsFromSupabase();
        updatePatientsTable();
        
    switchTab('patients-list');
    } catch (error) {
        console.error('خطأ في حفظ المريض:', error);
        showAlert('خطأ في حفظ بيانات المريض - تحقق من إعدادات CORS', 'error');
    }
}

// التحقق من صحة البيانات
function validatePatientData(data) {
    if (!data.name || data.name.trim().length < 2) {
        showAlert('يرجى إدخال اسم المريض بشكل صحيح', 'error');
        return false;
    }
    
    if (!data.age || data.age < 0 || data.age > 120) {
        showAlert('يرجى إدخال عمر صحيح', 'error');
        return false;
    }
    
    if (!data.phone || data.phone.trim().length < 10) {
        showAlert('يرجى إدخال رقم هاتف صحيح', 'error');
        return false;
    }
    
    if (!data.gender) {
        showAlert('يرجى اختيار جنس المريض', 'error');
        return false;
    }
    
    if (!data.visit_date) {
        showAlert('يرجى اختيار تاريخ الزيارة', 'error');
        return false;
    }
    
    if (!data.chief_complaint || data.chief_complaint.trim().length < 5) {
        showAlert('يرجى إدخال الشكوى الرئيسية', 'error');
        return false;
    }
    
    if (!data.diagnosis || data.diagnosis.trim().length < 5) {
        showAlert('يرجى إدخال التشخيص', 'error');
        return false;
    }
    
    return true;
}

// البحث في المرضى
async function searchPatientsHandler() {
    const searchName = document.getElementById('search-name').value.toLowerCase();
    const searchDiagnosis = document.getElementById('search-diagnosis').value.toLowerCase();
    const searchDate = document.getElementById('search-date').value;
    
    try {
        let query = supabase.from('patients').select('*');
        
        if (searchName) {
            query = query.ilike('name', `%${searchName}%`);
        }
        
        if (searchDiagnosis) {
            query = query.ilike('diagnosis', `%${searchDiagnosis}%`);
        }
        
        if (searchDate) {
            query = query.eq('visit_date', searchDate);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) {
            console.error('خطأ في البحث:', error);
            throw error;
        }
        
        displaySearchResults(data);
    } catch (error) {
        console.error('خطأ في البحث:', error);
        showAlert('خطأ في البحث - تحقق من إعدادات CORS', 'error');
    }
}

// حذف المريض
async function deletePatientHandler(patientId) {
    if (confirm('هل أنت متأكد من حذف بيانات هذا المريض؟')) {
        try {
            const { error } = await supabase
                .from('patients')
                .delete()
                .eq('id', patientId);
            
            if (error) {
                console.error('خطأ في حذف المريض:', error);
                throw error;
            }
            
            showAlert('تم حذف بيانات المريض بنجاح!', 'success');
            await loadPatientsFromSupabase();
            updatePatientsTable();
        } catch (error) {
            console.error('خطأ في حذف المريض:', error);
            showAlert('خطأ في حذف المريض - تحقق من إعدادات CORS', 'error');
        }
    }
}

// ============================================================================
// إدارة الأدوية - وظائف كاملة
// ============================================================================

// فتح نافذة إضافة/تعديل دواء
function openMedicationModal(medicationId = null) {
    const modal = document.getElementById('medication-modal');
    const title = document.getElementById('medication-modal-title');
    const form = document.getElementById('medication-form');

    form.reset();
    editingMedicationId = medicationId;

    if (medicationId) {
        title.textContent = 'تعديل دواء';
        const medication = medications.find(m => m.id === medicationId);
        if (medication) {
            document.getElementById('medication-name').value = medication.name;
            document.getElementById('medication-type').value = medication.type;
            document.getElementById('medication-description').value = medication.description || '';
            document.getElementById('medication-notes').value = medication.notes || '';
        }
    } else {
        title.textContent = 'إضافة دواء جديد';
    }
    modal.style.display = 'block';
}

// إغلاق نافذة إضافة/تعديل دواء
function closeMedicationModal() {
    document.getElementById('medication-modal').style.display = 'none';
    editingMedicationId = null;
    document.getElementById('medication-form').reset();
}

// معالجة إرسال نموذج الدواء
async function handleMedicationSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const medicationData = {
        name: formData.get('name') ? formData.get('name').trim() : '',
        type: formData.get('type') || '',
        description: formData.get('description') ? formData.get('description').trim() : '',
        notes: formData.get('notes') ? formData.get('notes').trim() : ''
    };

    // التحقق من صحة البيانات
    if (!medicationData.name || medicationData.name.length < 2) {
        showAlert('يرجى إدخال اسم الدواء بشكل صحيح', 'error');
        return;
    }

    if (!medicationData.type) {
        showAlert('يرجى اختيار نوع الدواء', 'error');
        return;
    }

    try {
        if (editingMedicationId) {
            // تعديل دواء موجود
            const { data, error } = await supabase
                .from('medications')
                .update(medicationData)
                .eq('id', editingMedicationId)
                .select();

            if (error) {
                console.error('خطأ في تحديث الدواء:', error);
                throw error;
            }
            showAlert('تم تحديث الدواء بنجاح!', 'success');
        } else {
            // إضافة دواء جديد
            const { data, error } = await supabase
                .from('medications')
                .insert([medicationData])
                .select();

            if (error) {
                console.error('خطأ في إضافة الدواء:', error);
                throw error;
            }
            showAlert('تم إضافة الدواء بنجاح!', 'success');
        }

        closeMedicationModal();
        await loadMedicationsFromSupabase();
        
    } catch (error) {
        console.error('خطأ في حفظ الدواء:', error);
        if (error.message.includes('duplicate key')) {
            showAlert('اسم الدواء موجود بالفعل!', 'error');
        } else {
            showAlert('خطأ في حفظ الدواء - تحقق من إعدادات CORS', 'error');
        }
    }
}

// معالجة إعادة تعيين نموذج الدواء
function handleMedicationFormReset() {
    editingMedicationId = null;
    document.getElementById('medication-modal-title').textContent = 'إضافة دواء جديد';
}

// عرض الأدوية في قائمة الإدارة
function renderMedications() {
    const medicationsListDiv = document.getElementById('medications-list');
    medicationsListDiv.innerHTML = '';

    if (medications.length === 0) {
        medicationsListDiv.innerHTML = `
            <div class="no-results">
                <i class="fas fa-pills" style="font-size: 3rem; color: #bdc3c7; margin-bottom: 20px;"></i>
                <h3>لا توجد أدوية مسجلة</h3>
                <p>اضغط على "إضافة دواء جديد" لإضافة دواء</p>
            </div>
        `;
        return;
    }
    
    medications.forEach(med => {
        const card = document.createElement('div');
        card.className = 'medication-card';
        card.innerHTML = `
            <div class="medication-card-header">
                <h4 class="medication-name">${med.name}</h4>
                <span class="medication-type">${getMedicationTypeLabel(med.type)}</span>
        </div>
            <p class="medication-description">${truncateText(med.description || 'لا يوجد وصف', 100)}</p>
            <p class="medication-notes">${truncateText(med.notes || 'لا توجد ملاحظات', 80)}</p>
            <div class="medication-actions">
                <button class="btn btn-primary" onclick="openMedicationModal('${med.id}')">
                    <i class="fas fa-edit"></i> تعديل
                </button>
                <button class="btn btn-danger" onclick="deleteMedication('${med.id}')">
                    <i class="fas fa-trash"></i> حذف
                    </button>
            </div>
        `;
        medicationsListDiv.appendChild(card);
    });
}

// حذف دواء
async function deleteMedication(medicationId) {
    if (confirm('هل أنت متأكد من حذف هذا الدواء؟')) {
        try {
            const { error } = await supabase
                .from('medications')
                .delete()
                .eq('id', medicationId);

            if (error) {
                console.error('خطأ في حذف الدواء:', error);
                throw error;
            }
            
            showAlert('تم حذف الدواء بنجاح!', 'success');
            await loadMedicationsFromSupabase();
        } catch (error) {
            console.error('خطأ في حذف الدواء:', error);
            showAlert('خطأ في حذف الدواء - تحقق من إعدادات CORS', 'error');
        }
    }
}

// تحديث قائمة الأدوية في نموذج المريض
function updateMedicationSelect() {
    const select = document.getElementById('treatment-medication');
    select.innerHTML = '<option value="">اختر دواء</option>';
    
    medications.forEach(medication => {
        const option = document.createElement('option');
        option.value = medication.name;
        option.textContent = medication.name;
        select.appendChild(option);
    });
}

// الحصول على تسمية نوع الدواء
function getMedicationTypeLabel(type) {
    const types = {
        'Drops': 'قطرة',
        'Ointment': 'مرهم',
        'Tablet': 'أقراص',
        'Capsule': 'كبسولة',
        'Injection': 'حقن',
        'Other': 'أخرى'
    };
    return types[type] || type;
}

// ============================================================================
// وظائف مساعدة
// ============================================================================

// عرض رسالة تنبيه
function showAlert(message, type) {
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        ${message}
    `;
    
    const container = document.querySelector('.container');
    container.insertBefore(alert, container.firstChild);
    
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

// تبديل التبويبات
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    document.getElementById(tabName).classList.add('active');
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    if (tabName === 'patients-list') {
        updatePatientsTable();
    } else if (tabName === 'medications') {
        renderMedications();
    }
}

// تحديث جدول المرضى
function updatePatientsTable() {
    const tbody = document.getElementById('patients-tbody');
    tbody.innerHTML = '';

    if (patients.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 40px; color: #7f8c8d;">
                    <i class="fas fa-user-slash" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                    لا توجد بيانات مرضى
                </td>
                            </tr>
        `;
        return;
    }
    
    patients.forEach((patient, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${patient.patient_id}</td>
            <td>${patient.name}</td>
            <td>${patient.age}</td>
            <td>${patient.gender === 'male' ? 'ذكر' : 'أنثى'}</td>
            <td>${formatDate(patient.visit_date)}</td>
            <td>
                <div class="vision-summary">
                    <span class="eye-label">V.A:</span> ${patient.right_eye_va || 'غير محدد'}<br>
                    <span class="eye-label">IOP:</span> ${patient.right_eye_iop || 'غير محدد'} mmHg
                </div>
            </td>
            <td>
                <div class="vision-summary">
                    <span class="eye-label">V.A:</span> ${patient.left_eye_va || 'غير محدد'}<br>
                    <span class="eye-label">IOP:</span> ${patient.left_eye_iop || 'غير محدد'} mmHg
                </div>
            </td>
            <td>${truncateText(patient.diagnosis, 30)}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view-btn" onclick="viewPatient('${patient.id}')" title="عرض التفاصيل">
                                <i class="fas fa-eye"></i>
                            </button>
                    <button class="action-btn edit-btn" onclick="editPatient('${patient.id}')" title="تعديل">
                                <i class="fas fa-edit"></i>
                            </button>
                    <button class="action-btn delete-btn" onclick="deletePatientHandler('${patient.id}')" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                        </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// دوال مساعدة
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA');
}

function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ============================================================================
// دوال للاستخدام في HTML
// ============================================================================

window.viewPatient = viewPatient;
window.editPatient = editPatient;
window.deletePatientHandler = deletePatientHandler;
window.switchTab = switchTab;
window.showAlert = showAlert;
window.openMedicationModal = openMedicationModal;
window.closeMedicationModal = closeMedicationModal;
// دالة saveMedication للاستخدام في HTML
function saveMedication() {
    // هذا سيتم استدعاؤه من خلال النموذج
    const form = document.getElementById('medication-form');
    if (form) {
        const event = { preventDefault: () => {}, target: form };
        handleMedicationSubmit(event);
    }
}

window.saveMedication = saveMedication;
window.deleteMedication = deleteMedication;
window.calculateTotal = calculateTotal;
window.refreshData = loadPatientsFromSupabase;
window.exportAllData = exportPatients;

// دوال مؤقتة (سيتم تطويرها لاحقاً)
function viewPatient(patientId) {
    showAlert('ميزة عرض تفاصيل المريض قيد التطوير', 'info');
}

function editPatient(patientId) {
    showAlert('ميزة تعديل المريض قيد التطوير', 'info');
}

function exportPatients() {
    showAlert('ميزة تصدير البيانات قيد التطوير', 'info');
}

function clearAllPatients() {
    showAlert('ميزة حذف جميع البيانات قيد التطوير', 'info');
}

function clearSearch() {
    document.getElementById('search-name').value = '';
    document.getElementById('search-diagnosis').value = '';
    document.getElementById('search-date').value = '';
    document.getElementById('search-results').innerHTML = '';
}

function searchPatientHistory() {
    showAlert('ميزة البحث في تاريخ المريض قيد التطوير', 'info');
}

function updateFinancialReport() {
    showAlert('ميزة التقارير المالية قيد التطوير', 'info');
}

function setToday() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('start-date').value = today;
    document.getElementById('end-date').value = today;
}

function setThisMonth() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
    
    document.getElementById('start-date').value = firstDay;
    document.getElementById('end-date').value = lastDay;
}

function setAllTime() {
    document.getElementById('start-date').value = '';
    document.getElementById('end-date').value = '';
}

function exportFinancialReport() {
    showAlert('ميزة تصدير التقرير المالي قيد التطوير', 'info');
}

function printFinancialReport() {
    showAlert('ميزة طباعة التقرير المالي قيد التطوير', 'info');
}

function displaySearchResults(results) {
    const container = document.getElementById('search-results');
    
    if (results.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search" style="font-size: 3rem; color: #bdc3c7; margin-bottom: 20px;"></i>
                <h3>لا توجد نتائج مطابقة للبحث</h3>
                <p>جرب تغيير معايير البحث</p>
            </div>
        `;
        return;
    }
    
    let resultsHTML = `
        <div class="search-results-header">
            <h3>نتائج البحث (${results.length} مريض)</h3>
        </div>
        <div class="search-results-grid">
    `;
    
    results.forEach((patient, index) => {
        resultsHTML += `
            <div class="patient-card">
                <div class="patient-card-header">
                    <h4>${patient.name}</h4>
                    <span class="patient-id">${patient.patient_id}</span>
                   </div>
                <div class="patient-card-body">
                    <p><strong>العمر:</strong> ${patient.age} سنة</p>
                    <p><strong>الجنس:</strong> ${patient.gender === 'male' ? 'ذكر' : 'أنثى'}</p>
                    <p><strong>تاريخ الزيارة:</strong> ${formatDate(patient.visit_date)}</p>
                    <div class="vision-info">
                        <div class="eye-data">
                            <span><strong>العين اليمنى:</strong></span>
                            <span>${patient.right_eye_va || 'غير محدد'}</span>
               </div>
                        <div class="eye-data">
                            <span><strong>العين اليسرى:</strong></span>
                            <span>${patient.left_eye_va || 'غير محدد'}</span>
                </div>
                </div>
                    <p><strong>التشخيص:</strong> ${truncateText(patient.diagnosis, 50)}</p>
                </div>
                <div class="patient-card-actions">
                    <button class="btn btn-primary" onclick="viewPatient('${patient.id}')">
                        <i class="fas fa-eye"></i> عرض التفاصيل
                    </button>
                </div>
            </div>
        `;
    });
    
    resultsHTML += '</div>';
    container.innerHTML = resultsHTML;
}

function closeModal() {
    document.getElementById('patient-modal').style.display = 'none';
}

function printPatientDetails() {
    showAlert('ميزة طباعة تفاصيل المريض قيد التطوير', 'info');
}

function calculateTotal() {
    const examinationCost = parseFloat(document.getElementById('examination-cost').value) || 0;
    const discount = parseFloat(document.getElementById('discount').value) || 0;
    const total = examinationCost - discount;
    document.getElementById('total-cost').value = total.toFixed(2);
}

function handleFormReset() {
    generatePatientId();
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('visit-date').value = today;
    calculateTotal();
}

// حساب التكلفة الإجمالية
function calculateTotal() {
    const examinationCost = parseFloat(document.getElementById('examination-cost')?.value) || 0;
    const discount = parseFloat(document.getElementById('discount')?.value) || 0;
    const total = examinationCost - discount;
    const totalCostElement = document.getElementById('total-cost');
    if (totalCostElement) {
        totalCostElement.value = total.toFixed(2);
    }
}

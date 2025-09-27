// نظام إدارة مرضى طب العيون مع Supabase
// Ophthalmology Patient Management System with Supabase

// استيراد Supabase
import { 
    supabase, 
    addPatient, 
    getAllPatients, 
    updatePatient, 
    deletePatient, 
    searchPatients,
    addMedication,
    getAllMedications,
    updateMedication,
    deleteMedication,
    getFinancialStats
} from './supabase-config.js';

// متغيرات عامة
let patients = [];
let medications = [];
let currentPatientId = 1;

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', async function() {
    await initializeApp();
    setupEventListeners();
    await loadInitialData();
});

// تهيئة التطبيق
async function initializeApp() {
    try {
        // تعيين تاريخ اليوم كتاريخ افتراضي
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('visit-date').value = today;
        
        // تحميل البيانات من Supabase
        await loadPatientsFromSupabase();
        await loadMedicationsFromSupabase();
        
        // تحديث قائمة المرضى
        updatePatientsTable();
        
        // تحديث قائمة الأدوية
        updateMedicationsList();
        
        showAlert('تم تحميل البيانات بنجاح!', 'success');
    } catch (error) {
        console.error('خطأ في تهيئة التطبيق:', error);
        showAlert('خطأ في تحميل البيانات من الخادم', 'error');
    }
}

// تحميل البيانات الأولية
async function loadInitialData() {
    await loadPatientsFromSupabase();
    await loadMedicationsFromSupabase();
}

// إعداد مستمعي الأحداث
function setupEventListeners() {
    // التبويبات
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });

    // نموذج إضافة المريض
    document.getElementById('patient-form').addEventListener('submit', handlePatientSubmit);
    document.getElementById('patient-form').addEventListener('reset', handleFormReset);

    // أزرار القائمة
    document.getElementById('export-btn').addEventListener('click', exportPatients);
    document.getElementById('clear-all-btn').addEventListener('click', clearAllPatients);

    // البحث
    document.getElementById('search-btn').addEventListener('click', searchPatientsHandler);
    document.getElementById('clear-search-btn').addEventListener('click', clearSearch);

    // البحث في تاريخ المريض
    document.getElementById('history-search-btn').addEventListener('click', searchPatientHistory);

    // النافذة المنبثقة
    document.querySelector('.close').addEventListener('click', closeModal);
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('patient-modal');
        if (event.target === modal) {
            closeModal();
        }
    });

    // البحث المباشر أثناء الكتابة
    document.getElementById('search-name').addEventListener('input', debounce(searchPatientsHandler, 300));
    document.getElementById('search-diagnosis').addEventListener('input', debounce(searchPatientsHandler, 300));
    document.getElementById('search-date').addEventListener('change', searchPatientsHandler);

    // التقارير المالية
    document.getElementById('start-date').addEventListener('change', updateFinancialReport);
    document.getElementById('end-date').addEventListener('change', updateFinancialReport);
}

// تحميل المرضى من Supabase
async function loadPatientsFromSupabase() {
    try {
        const result = await getAllPatients();
        if (result.success) {
            patients = result.data || [];
            // تحديث معرف المريض الحالي
            if (patients.length > 0) {
                const maxId = Math.max(...patients.map(p => parseInt(p.patient_id?.split('-')[1]) || 0));
                currentPatientId = maxId + 1;
            }
            generatePatientId();
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('خطأ في تحميل المرضى:', error);
        showAlert('خطأ في تحميل بيانات المرضى', 'error');
    }
}

// تحميل الأدوية من Supabase
async function loadMedicationsFromSupabase() {
    try {
        const result = await getAllMedications();
        if (result.success) {
            medications = result.data || [];
            updateMedicationSelect();
        } else {
            throw new Error(result.error);
        }
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
        
        // بيانات جدول EX
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
        
        // بيانات جدول Refraction
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

    // التحقق من صحة البيانات
    if (!validatePatientData(patientData)) {
        return;
    }

    try {
        // إضافة المريض إلى Supabase
        const result = await addPatient(patientData);
        
        if (result.success) {
            showAlert('تم حفظ بيانات المريض بنجاح!', 'success');
            
            // إعادة تعيين النموذج
            e.target.reset();
            currentPatientId++;
            generatePatientId();
            
            // تحديث قائمة المرضى
            await loadPatientsFromSupabase();
            updatePatientsTable();
            
            // التبديل إلى قائمة المرضى
            switchTab('patients-list');
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('خطأ في حفظ المريض:', error);
        showAlert('خطأ في حفظ بيانات المريض', 'error');
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
        const result = await searchPatients({
            name: searchName || null,
            diagnosis: searchDiagnosis || null,
            date: searchDate || null
        });
        
        if (result.success) {
            displaySearchResults(result.data);
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('خطأ في البحث:', error);
        showAlert('خطأ في البحث', 'error');
    }
}

// حذف المريض
async function deletePatientHandler(patientId) {
    if (confirm('هل أنت متأكد من حذف بيانات هذا المريض؟')) {
        try {
            const result = await deletePatient(patientId);
            
            if (result.success) {
                showAlert('تم حذف بيانات المريض بنجاح!', 'success');
                await loadPatientsFromSupabase();
                updatePatientsTable();
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('خطأ في حذف المريض:', error);
            showAlert('خطأ في حذف المريض', 'error');
        }
    }
}

// عرض رسالة تنبيه
function showAlert(message, type) {
    // إزالة الرسائل السابقة
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        ${message}
    `;
    
    // إدراج الرسالة في بداية المحتوى
    const container = document.querySelector('.container');
    container.insertBefore(alert, container.firstChild);
    
    // إزالة الرسالة بعد 5 ثوان
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

// دوال مساعدة أخرى...
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
    } else if (tabName === 'financial') {
        updateFinancialReport();
    }
}

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

// تصدير الدوال للاستخدام في HTML
window.viewPatient = viewPatient;
window.editPatient = editPatient;
window.deletePatientHandler = deletePatientHandler;
window.switchTab = switchTab;
window.showAlert = showAlert;

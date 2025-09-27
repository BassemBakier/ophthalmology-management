// متغيرات عامة
let patients = JSON.parse(localStorage.getItem('ophthalmology_patients')) || [];
let currentPatientId = 1;

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    generatePatientId();
    loadPatients();
});

// تهيئة التطبيق
function initializeApp() {
    // تعيين تاريخ اليوم كتاريخ افتراضي
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('visit-date').value = today;
    
    // تحديث قائمة المرضى
    updatePatientsTable();
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
    document.getElementById('search-btn').addEventListener('click', searchPatients);
    document.getElementById('clear-search-btn').addEventListener('click', clearSearch);

    // النافذة المنبثقة
    document.querySelector('.close').addEventListener('click', closeModal);
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('patient-modal');
        if (event.target === modal) {
            closeModal();
        }
    });

    // البحث المباشر أثناء الكتابة
    document.getElementById('search-name').addEventListener('input', debounce(searchPatients, 300));
    document.getElementById('search-diagnosis').addEventListener('input', debounce(searchPatients, 300));
    document.getElementById('search-date').addEventListener('change', searchPatients);
}

// تبديل التبويبات
function switchTab(tabName) {
    // إخفاء جميع التبويبات
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // إزالة النشاط من جميع أزرار التبويبات
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // إظهار التبويب المحدد
    document.getElementById(tabName).classList.add('active');
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // تحديث قائمة المرضى عند فتح تبويب القائمة
    if (tabName === 'patients-list') {
        updatePatientsTable();
    }
}

// توليد رقم المريض
function generatePatientId() {
    if (patients.length > 0) {
        const maxId = Math.max(...patients.map(p => parseInt(p.patientId) || 0));
        currentPatientId = maxId + 1;
    }
    document.getElementById('patient-id').value = `OPTH-${currentPatientId.toString().padStart(4, '0')}`;
}

// معالجة إرسال نموذج المريض
function handlePatientSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const patientData = {
        patientId: document.getElementById('patient-id').value,
        name: formData.get('name'),
        age: parseInt(formData.get('age')),
        phone: formData.get('phone'),
        gender: formData.get('gender'),
        visitDate: formData.get('visitDate'),
        // بيانات جدول EX
        exData: {
            rightEye: {
                VA: formData.get('rightVA') || '',
                BCVA: formData.get('rightBCVA') || '',
                COMEA: formData.get('rightCOMEA') || '',
                LID: formData.get('rightLID') || '',
                LENS: formData.get('rightLENS') || '',
                IOP: parseFloat(formData.get('rightIOP')) || null,
                FUNDUS: formData.get('rightFUNDUS') || ''
            },
            leftEye: {
                VA: formData.get('leftVA') || '',
                BCVA: formData.get('leftBCVA') || '',
                COMEA: formData.get('leftCOMEA') || '',
                LID: formData.get('leftLID') || '',
                LENS: formData.get('leftLENS') || '',
                IOP: parseFloat(formData.get('leftIOP')) || null,
                FUNDUS: formData.get('leftFUNDUS') || ''
            }
        },
        // بيانات جدول Refraction
        refractionData: {
            rightEye: {
                dist: {
                    sph: formData.get('rightDistSph') || '',
                    cyl: formData.get('rightDistCyl') || '',
                    axis: formData.get('rightDistAxis') || ''
                },
                read: {
                    sph: formData.get('rightReadSph') || '',
                    cyl: formData.get('rightReadCyl') || '',
                    axis: formData.get('rightReadAxis') || ''
                }
            },
            leftEye: {
                dist: {
                    sph: formData.get('leftDistSph') || '',
                    cyl: formData.get('leftDistCyl') || '',
                    axis: formData.get('leftDistAxis') || ''
                },
                read: {
                    sph: formData.get('leftReadSph') || '',
                    cyl: formData.get('leftReadCyl') || '',
                    axis: formData.get('leftReadAxis') || ''
                }
            },
            ipa: {
                dist: formData.get('ipaDist') || '',
                dist2: formData.get('ipaDist2') || '',
                read: formData.get('ipaRead') || '',
                read2: formData.get('ipaRead2') || ''
            }
        },
        chiefComplaint: formData.get('chiefComplaint'),
        diagnosis: formData.get('diagnosis'),
        treatment: formData.get('treatment'),
        notes: formData.get('notes'),
        createdAt: new Date().toISOString()
    };

    // التحقق من صحة البيانات
    if (!validatePatientData(patientData)) {
        return;
    }

    // إضافة المريض
    patients.push(patientData);
    savePatients();
    
    // إظهار رسالة نجاح
    showAlert('تم حفظ بيانات المريض بنجاح!', 'success');
    
    // إعادة تعيين النموذج
    e.target.reset();
    generatePatientId();
    
    // التبديل إلى قائمة المرضى
    switchTab('patients-list');
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
    
    if (!data.visitDate) {
        showAlert('يرجى اختيار تاريخ الزيارة', 'error');
        return false;
    }
    
    if (!data.chiefComplaint || data.chiefComplaint.trim().length < 5) {
        showAlert('يرجى إدخال الشكوى الرئيسية', 'error');
        return false;
    }
    
    if (!data.diagnosis || data.diagnosis.trim().length < 5) {
        showAlert('يرجى إدخال التشخيص', 'error');
        return false;
    }
    
    return true;
}

// معالجة إعادة تعيين النموذج
function handleFormReset() {
    generatePatientId();
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('visit-date').value = today;
}

// حفظ البيانات في التخزين المحلي
function savePatients() {
    localStorage.setItem('ophthalmology_patients', JSON.stringify(patients));
}

// تحميل البيانات من التخزين المحلي
function loadPatients() {
    patients = JSON.parse(localStorage.getItem('ophthalmology_patients')) || [];
    updatePatientsTable();
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
            <td>${patient.patientId}</td>
            <td>${patient.name}</td>
            <td>${patient.age}</td>
            <td>${patient.gender === 'male' ? 'ذكر' : 'أنثى'}</td>
            <td>${formatDate(patient.visitDate)}</td>
            <td>
                <div class="vision-summary">
                    <span class="eye-label">V.A:</span> ${patient.exData?.rightEye?.VA || 'غير محدد'}<br>
                    <span class="eye-label">IOP:</span> ${patient.exData?.rightEye?.IOP || 'غير محدد'} mmHg
                </div>
            </td>
            <td>
                <div class="vision-summary">
                    <span class="eye-label">V.A:</span> ${patient.exData?.leftEye?.VA || 'غير محدد'}<br>
                    <span class="eye-label">IOP:</span> ${patient.exData?.leftEye?.IOP || 'غير محدد'} mmHg
                </div>
            </td>
            <td>${truncateText(patient.diagnosis, 30)}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view-btn" onclick="viewPatient(${index})" title="عرض التفاصيل">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit-btn" onclick="editPatient(${index})" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="deletePatient(${index})" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// عرض تفاصيل المريض
function viewPatient(index) {
    const patient = patients[index];
    const modalBody = document.getElementById('patient-details');
    
    modalBody.innerHTML = `
        <div class="patient-details">
            <div class="detail-section">
                <h4><i class="fas fa-user"></i> البيانات الشخصية</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>رقم المريض:</label>
                        <span>${patient.patientId}</span>
                    </div>
                    <div class="detail-item">
                        <label>الاسم:</label>
                        <span>${patient.name}</span>
                    </div>
                    <div class="detail-item">
                        <label>العمر:</label>
                        <span>${patient.age} سنة</span>
                    </div>
                    <div class="detail-item">
                        <label>الجنس:</label>
                        <span>${patient.gender === 'male' ? 'ذكر' : 'أنثى'}</span>
                    </div>
                    <div class="detail-item">
                        <label>رقم الهاتف:</label>
                        <span>${patient.phone}</span>
                    </div>
                    <div class="detail-item">
                        <label>تاريخ الزيارة:</label>
                        <span>${formatDate(patient.visitDate)}</span>
                    </div>
                </div>
            </div>
            
            <div class="detail-section">
                <h4><i class="fas fa-eye"></i> جدول EX</h4>
                <div class="ex-table-container">
                    <table class="ex-table">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Right Eye</th>
                                <th>Left Eye</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="ex-label">V.A</td>
                                <td>${patient.exData?.rightEye?.VA || 'غير محدد'}</td>
                                <td>${patient.exData?.leftEye?.VA || 'غير محدد'}</td>
                            </tr>
                            <tr>
                                <td class="ex-label">BCVA</td>
                                <td>${patient.exData?.rightEye?.BCVA || 'غير محدد'}</td>
                                <td>${patient.exData?.leftEye?.BCVA || 'غير محدد'}</td>
                            </tr>
                            <tr>
                                <td class="ex-label">COMEA</td>
                                <td>${patient.exData?.rightEye?.COMEA || 'غير محدد'}</td>
                                <td>${patient.exData?.leftEye?.COMEA || 'غير محدد'}</td>
                            </tr>
                            <tr>
                                <td class="ex-label">LID</td>
                                <td>${patient.exData?.rightEye?.LID || 'غير محدد'}</td>
                                <td>${patient.exData?.leftEye?.LID || 'غير محدد'}</td>
                            </tr>
                            <tr>
                                <td class="ex-label">LENS</td>
                                <td>${patient.exData?.rightEye?.LENS || 'غير محدد'}</td>
                                <td>${patient.exData?.leftEye?.LENS || 'غير محدد'}</td>
                            </tr>
                            <tr>
                                <td class="ex-label">IOP</td>
                                <td>${patient.exData?.rightEye?.IOP || 'غير محدد'} mmHg</td>
                                <td>${patient.exData?.leftEye?.IOP || 'غير محدد'} mmHg</td>
                            </tr>
                            <tr>
                                <td class="ex-label">FUNDUS</td>
                                <td>${patient.exData?.rightEye?.FUNDUS || 'غير محدد'}</td>
                                <td>${patient.exData?.leftEye?.FUNDUS || 'غير محدد'}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="detail-section">
                <h4><i class="fas fa-eye"></i> جدول Refraction</h4>
                <div class="refraction-table-container">
                    <table class="refraction-table">
                        <thead>
                            <tr>
                                <th></th>
                                <th colspan="3">Right</th>
                                <th colspan="2">IPA</th>
                                <th colspan="3">Left</th>
                            </tr>
                            <tr>
                                <th></th>
                                <th>Sph</th>
                                <th>Cyl</th>
                                <th>Axis</th>
                                <th></th>
                                <th></th>
                                <th>Sph</th>
                                <th>Cyl</th>
                                <th>Axis</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="refraction-label">Dist:</td>
                                <td>${patient.refractionData?.rightEye?.dist?.sph || 'غير محدد'}</td>
                                <td>${patient.refractionData?.rightEye?.dist?.cyl || 'غير محدد'}</td>
                                <td>${patient.refractionData?.rightEye?.dist?.axis || 'غير محدد'}</td>
                                <td>${patient.refractionData?.ipa?.dist || 'غير محدد'}</td>
                                <td>${patient.refractionData?.ipa?.dist2 || 'غير محدد'}</td>
                                <td>${patient.refractionData?.leftEye?.dist?.sph || 'غير محدد'}</td>
                                <td>${patient.refractionData?.leftEye?.dist?.cyl || 'غير محدد'}</td>
                                <td>${patient.refractionData?.leftEye?.dist?.axis || 'غير محدد'}</td>
                            </tr>
                            <tr>
                                <td class="refraction-label">Read:</td>
                                <td>${patient.refractionData?.rightEye?.read?.sph || 'غير محدد'}</td>
                                <td>${patient.refractionData?.rightEye?.read?.cyl || 'غير محدد'}</td>
                                <td>${patient.refractionData?.rightEye?.read?.axis || 'غير محدد'}</td>
                                <td>${patient.refractionData?.ipa?.read || 'غير محدد'}</td>
                                <td>${patient.refractionData?.ipa?.read2 || 'غير محدد'}</td>
                                <td>${patient.refractionData?.leftEye?.read?.sph || 'غير محدد'}</td>
                                <td>${patient.refractionData?.leftEye?.read?.cyl || 'غير محدد'}</td>
                                <td>${patient.refractionData?.leftEye?.read?.axis || 'غير محدد'}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="detail-section">
                <h4><i class="fas fa-stethoscope"></i> المعلومات الطبية</h4>
                <div class="detail-item">
                    <label>الشكوى الرئيسية:</label>
                    <p>${patient.chiefComplaint}</p>
                </div>
                <div class="detail-item">
                    <label>التشخيص:</label>
                    <p>${patient.diagnosis}</p>
                </div>
                <div class="detail-item">
                    <label>العلاج الموصوف:</label>
                    <p>${patient.treatment || 'لم يتم تحديد علاج'}</p>
                </div>
                <div class="detail-item">
                    <label>ملاحظات إضافية:</label>
                    <p>${patient.notes || 'لا توجد ملاحظات'}</p>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('patient-modal').style.display = 'block';
}

// تعديل المريض
function editPatient(index) {
    const patient = patients[index];
    
    // ملء النموذج بالبيانات
    document.getElementById('patient-name').value = patient.name;
    document.getElementById('patient-age').value = patient.age;
    document.getElementById('patient-phone').value = patient.phone;
    document.getElementById('patient-gender').value = patient.gender;
    document.getElementById('visit-date').value = patient.visitDate;
    document.getElementById('patient-id').value = patient.patientId;
    
    // ملء بيانات جدول EX
    if (patient.exData) {
        // العين اليمنى
        document.querySelector('input[name="rightVA"]').value = patient.exData.rightEye?.VA || '';
        document.querySelector('input[name="rightBCVA"]').value = patient.exData.rightEye?.BCVA || '';
        document.querySelector('input[name="rightCOMEA"]').value = patient.exData.rightEye?.COMEA || '';
        document.querySelector('input[name="rightLID"]').value = patient.exData.rightEye?.LID || '';
        document.querySelector('input[name="rightLENS"]').value = patient.exData.rightEye?.LENS || '';
        document.querySelector('input[name="rightIOP"]').value = patient.exData.rightEye?.IOP || '';
        document.querySelector('input[name="rightFUNDUS"]').value = patient.exData.rightEye?.FUNDUS || '';
        
        // العين اليسرى
        document.querySelector('input[name="leftVA"]').value = patient.exData.leftEye?.VA || '';
        document.querySelector('input[name="leftBCVA"]').value = patient.exData.leftEye?.BCVA || '';
        document.querySelector('input[name="leftCOMEA"]').value = patient.exData.leftEye?.COMEA || '';
        document.querySelector('input[name="leftLID"]').value = patient.exData.leftEye?.LID || '';
        document.querySelector('input[name="leftLENS"]').value = patient.exData.leftEye?.LENS || '';
        document.querySelector('input[name="leftIOP"]').value = patient.exData.leftEye?.IOP || '';
        document.querySelector('input[name="leftFUNDUS"]').value = patient.exData.leftEye?.FUNDUS || '';
    }
    
    // ملء بيانات جدول Refraction
    if (patient.refractionData) {
        // العين اليمنى - Dist
        document.querySelector('input[name="rightDistSph"]').value = patient.refractionData.rightEye?.dist?.sph || '';
        document.querySelector('input[name="rightDistCyl"]').value = patient.refractionData.rightEye?.dist?.cyl || '';
        document.querySelector('input[name="rightDistAxis"]').value = patient.refractionData.rightEye?.dist?.axis || '';
        
        // العين اليمنى - Read
        document.querySelector('input[name="rightReadSph"]').value = patient.refractionData.rightEye?.read?.sph || '';
        document.querySelector('input[name="rightReadCyl"]').value = patient.refractionData.rightEye?.read?.cyl || '';
        document.querySelector('input[name="rightReadAxis"]').value = patient.refractionData.rightEye?.read?.axis || '';
        
        // العين اليسرى - Dist
        document.querySelector('input[name="leftDistSph"]').value = patient.refractionData.leftEye?.dist?.sph || '';
        document.querySelector('input[name="leftDistCyl"]').value = patient.refractionData.leftEye?.dist?.cyl || '';
        document.querySelector('input[name="leftDistAxis"]').value = patient.refractionData.leftEye?.dist?.axis || '';
        
        // العين اليسرى - Read
        document.querySelector('input[name="leftReadSph"]').value = patient.refractionData.leftEye?.read?.sph || '';
        document.querySelector('input[name="leftReadCyl"]').value = patient.refractionData.leftEye?.read?.cyl || '';
        document.querySelector('input[name="leftReadAxis"]').value = patient.refractionData.leftEye?.read?.axis || '';
        
        // IPA
        document.querySelector('input[name="ipaDist"]').value = patient.refractionData.ipa?.dist || '';
        document.querySelector('input[name="ipaDist2"]').value = patient.refractionData.ipa?.dist2 || '';
        document.querySelector('input[name="ipaRead"]').value = patient.refractionData.ipa?.read || '';
        document.querySelector('input[name="ipaRead2"]').value = patient.refractionData.ipa?.read2 || '';
    }
    
    document.getElementById('chief-complaint').value = patient.chiefComplaint;
    document.getElementById('diagnosis').value = patient.diagnosis;
    document.getElementById('treatment').value = patient.treatment || '';
    document.getElementById('notes').value = patient.notes || '';
    
    // التبديل إلى تبويب الإضافة
    switchTab('add-patient');
    
    // إضافة معالج خاص للتحديث
    const form = document.getElementById('patient-form');
    form.onsubmit = function(e) {
        e.preventDefault();
        updatePatient(index);
    };
}

// تحديث بيانات المريض
function updatePatient(index) {
    const formData = new FormData(document.getElementById('patient-form'));
    const patientData = {
        ...patients[index],
        name: formData.get('name'),
        age: parseInt(formData.get('age')),
        phone: formData.get('phone'),
        gender: formData.get('gender'),
        visitDate: formData.get('visitDate'),
        // بيانات جدول EX
        exData: {
            rightEye: {
                VA: formData.get('rightVA') || '',
                BCVA: formData.get('rightBCVA') || '',
                COMEA: formData.get('rightCOMEA') || '',
                LID: formData.get('rightLID') || '',
                LENS: formData.get('rightLENS') || '',
                IOP: parseFloat(formData.get('rightIOP')) || null,
                FUNDUS: formData.get('rightFUNDUS') || ''
            },
            leftEye: {
                VA: formData.get('leftVA') || '',
                BCVA: formData.get('leftBCVA') || '',
                COMEA: formData.get('leftCOMEA') || '',
                LID: formData.get('leftLID') || '',
                LENS: formData.get('leftLENS') || '',
                IOP: parseFloat(formData.get('leftIOP')) || null,
                FUNDUS: formData.get('leftFUNDUS') || ''
            }
        },
        // بيانات جدول Refraction
        refractionData: {
            rightEye: {
                dist: {
                    sph: formData.get('rightDistSph') || '',
                    cyl: formData.get('rightDistCyl') || '',
                    axis: formData.get('rightDistAxis') || ''
                },
                read: {
                    sph: formData.get('rightReadSph') || '',
                    cyl: formData.get('rightReadCyl') || '',
                    axis: formData.get('rightReadAxis') || ''
                }
            },
            leftEye: {
                dist: {
                    sph: formData.get('leftDistSph') || '',
                    cyl: formData.get('leftDistCyl') || '',
                    axis: formData.get('leftDistAxis') || ''
                },
                read: {
                    sph: formData.get('leftReadSph') || '',
                    cyl: formData.get('leftReadCyl') || '',
                    axis: formData.get('leftReadAxis') || ''
                }
            },
            ipa: {
                dist: formData.get('ipaDist') || '',
                dist2: formData.get('ipaDist2') || '',
                read: formData.get('ipaRead') || '',
                read2: formData.get('ipaRead2') || ''
            }
        },
        chiefComplaint: formData.get('chiefComplaint'),
        diagnosis: formData.get('diagnosis'),
        treatment: formData.get('treatment'),
        notes: formData.get('notes'),
        updatedAt: new Date().toISOString()
    };

    if (!validatePatientData(patientData)) {
        return;
    }

    patients[index] = patientData;
    savePatients();
    updatePatientsTable();
    
    showAlert('تم تحديث بيانات المريض بنجاح!', 'success');
    
    // إعادة تعيين معالج النموذج
    document.getElementById('patient-form').onsubmit = handlePatientSubmit;
    
    // إعادة تعيين النموذج
    document.getElementById('patient-form').reset();
    generatePatientId();
}

// حذف المريض
function deletePatient(index) {
    if (confirm('هل أنت متأكد من حذف بيانات هذا المريض؟')) {
        patients.splice(index, 1);
        savePatients();
        updatePatientsTable();
        showAlert('تم حذف بيانات المريض بنجاح!', 'success');
    }
}

// البحث في المرضى
function searchPatients() {
    const searchName = document.getElementById('search-name').value.toLowerCase();
    const searchDiagnosis = document.getElementById('search-diagnosis').value.toLowerCase();
    const searchDate = document.getElementById('search-date').value;
    
    const filteredPatients = patients.filter(patient => {
        const nameMatch = !searchName || patient.name.toLowerCase().includes(searchName);
        const diagnosisMatch = !searchDiagnosis || patient.diagnosis.toLowerCase().includes(searchDiagnosis);
        const dateMatch = !searchDate || patient.visitDate === searchDate;
        
        return nameMatch && diagnosisMatch && dateMatch;
    });
    
    displaySearchResults(filteredPatients);
}

// عرض نتائج البحث
function displaySearchResults(filteredPatients) {
    const resultsContainer = document.getElementById('search-results');
    
    if (filteredPatients.length === 0) {
        resultsContainer.innerHTML = `
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
            <h3>نتائج البحث (${filteredPatients.length} مريض)</h3>
        </div>
        <div class="search-results-grid">
    `;
    
    filteredPatients.forEach((patient, index) => {
        const originalIndex = patients.findIndex(p => p.patientId === patient.patientId);
        resultsHTML += `
            <div class="patient-card">
                <div class="patient-card-header">
                    <h4>${patient.name}</h4>
                    <span class="patient-id">${patient.patientId}</span>
                </div>
                <div class="patient-card-body">
                    <p><strong>العمر:</strong> ${patient.age} سنة</p>
                    <p><strong>الجنس:</strong> ${patient.gender === 'male' ? 'ذكر' : 'أنثى'}</p>
                    <p><strong>تاريخ الزيارة:</strong> ${formatDate(patient.visitDate)}</p>
                    <div class="vision-info">
                        <div class="eye-data">
                            <span><strong>العين اليمنى:</strong></span>
                            <span>${patient.exData?.rightEye?.VA || 'غير محدد'}</span>
                        </div>
                        <div class="eye-data">
                            <span><strong>العين اليسرى:</strong></span>
                            <span>${patient.exData?.leftEye?.VA || 'غير محدد'}</span>
                        </div>
                    </div>
                    <p><strong>التشخيص:</strong> ${truncateText(patient.diagnosis, 50)}</p>
                </div>
                <div class="patient-card-actions">
                    <button class="btn btn-primary" onclick="viewPatient(${originalIndex})">
                        <i class="fas fa-eye"></i> عرض التفاصيل
                    </button>
                </div>
            </div>
        `;
    });
    
    resultsHTML += '</div>';
    resultsContainer.innerHTML = resultsHTML;
}

// مسح البحث
function clearSearch() {
    document.getElementById('search-name').value = '';
    document.getElementById('search-diagnosis').value = '';
    document.getElementById('search-date').value = '';
    document.getElementById('search-results').innerHTML = '';
}

// تصدير البيانات
function exportPatients() {
    if (patients.length === 0) {
        showAlert('لا توجد بيانات للتصدير', 'error');
        return;
    }
    
    const csvContent = generateCSV(patients);
    downloadCSV(csvContent, 'ophthalmology_patients.csv');
    showAlert('تم تصدير البيانات بنجاح!', 'success');
}

// توليد ملف CSV
function generateCSV(data) {
    const headers = ['رقم المريض', 'الاسم', 'العمر', 'الجنس', 'رقم الهاتف', 'تاريخ الزيارة', 'V.A اليمنى', 'BCVA اليمنى', 'COMEA اليمنى', 'LID اليمنى', 'LENS اليمنى', 'IOP اليمنى', 'FUNDUS اليمنى', 'V.A اليسرى', 'BCVA اليسرى', 'COMEA اليسرى', 'LID اليسرى', 'LENS اليسرى', 'IOP اليسرى', 'FUNDUS اليسرى', 'Right Dist Sph', 'Right Dist Cyl', 'Right Dist Axis', 'Right Read Sph', 'Right Read Cyl', 'Right Read Axis', 'Left Dist Sph', 'Left Dist Cyl', 'Left Dist Axis', 'Left Read Sph', 'Left Read Cyl', 'Left Read Axis', 'IPA Dist', 'IPA Dist2', 'IPA Read', 'IPA Read2', 'الشكوى الرئيسية', 'التشخيص', 'العلاج', 'ملاحظات'];
    const csvRows = [headers.join(',')];
    
    data.forEach(patient => {
        const row = [
            patient.patientId,
            `"${patient.name}"`,
            patient.age,
            patient.gender === 'male' ? 'ذكر' : 'أنثى',
            patient.phone,
            patient.visitDate,
            `"${patient.exData?.rightEye?.VA || ''}"`,
            `"${patient.exData?.rightEye?.BCVA || ''}"`,
            `"${patient.exData?.rightEye?.COMEA || ''}"`,
            `"${patient.exData?.rightEye?.LID || ''}"`,
            `"${patient.exData?.rightEye?.LENS || ''}"`,
            patient.exData?.rightEye?.IOP || '',
            `"${patient.exData?.rightEye?.FUNDUS || ''}"`,
            `"${patient.exData?.leftEye?.VA || ''}"`,
            `"${patient.exData?.leftEye?.BCVA || ''}"`,
            `"${patient.exData?.leftEye?.COMEA || ''}"`,
            `"${patient.exData?.leftEye?.LID || ''}"`,
            `"${patient.exData?.leftEye?.LENS || ''}"`,
            patient.exData?.leftEye?.IOP || '',
            `"${patient.exData?.leftEye?.FUNDUS || ''}"`,
            `"${patient.refractionData?.rightEye?.dist?.sph || ''}"`,
            `"${patient.refractionData?.rightEye?.dist?.cyl || ''}"`,
            `"${patient.refractionData?.rightEye?.dist?.axis || ''}"`,
            `"${patient.refractionData?.rightEye?.read?.sph || ''}"`,
            `"${patient.refractionData?.rightEye?.read?.cyl || ''}"`,
            `"${patient.refractionData?.rightEye?.read?.axis || ''}"`,
            `"${patient.refractionData?.leftEye?.dist?.sph || ''}"`,
            `"${patient.refractionData?.leftEye?.dist?.cyl || ''}"`,
            `"${patient.refractionData?.leftEye?.dist?.axis || ''}"`,
            `"${patient.refractionData?.leftEye?.read?.sph || ''}"`,
            `"${patient.refractionData?.leftEye?.read?.cyl || ''}"`,
            `"${patient.refractionData?.leftEye?.read?.axis || ''}"`,
            `"${patient.refractionData?.ipa?.dist || ''}"`,
            `"${patient.refractionData?.ipa?.dist2 || ''}"`,
            `"${patient.refractionData?.ipa?.read || ''}"`,
            `"${patient.refractionData?.ipa?.read2 || ''}"`,
            `"${patient.chiefComplaint}"`,
            `"${patient.diagnosis}"`,
            `"${patient.treatment || ''}"`,
            `"${patient.notes || ''}"`
        ];
        csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
}

// تحميل ملف CSV
function downloadCSV(csvContent, filename) {
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// حذف جميع المرضى
function clearAllPatients() {
    if (confirm('هل أنت متأكد من حذف جميع بيانات المرضى؟ لا يمكن التراجع عن هذا الإجراء.')) {
        patients = [];
        savePatients();
        updatePatientsTable();
        showAlert('تم حذف جميع البيانات بنجاح!', 'success');
    }
}

// إغلاق النافذة المنبثقة
function closeModal() {
    document.getElementById('patient-modal').style.display = 'none';
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

// تنسيق التاريخ
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA');
}

// قطع النص
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// تأخير التنفيذ
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

// إضافة أنماط CSS للتفاصيل
const additionalStyles = `
<style>
.patient-details {
    font-family: 'Cairo', Arial, sans-serif;
}

.detail-section {
    margin-bottom: 30px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 10px;
    border-right: 4px solid #3498db;
}

.detail-section h4 {
    color: #2c3e50;
    margin-bottom: 20px;
    font-size: 1.2rem;
    font-weight: 600;
}

.detail-section h4 i {
    color: #3498db;
    margin-left: 10px;
}

.detail-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
}

.detail-item {
    margin-bottom: 15px;
}

.detail-item label {
    font-weight: 600;
    color: #2c3e50;
    display: block;
    margin-bottom: 5px;
}

.detail-item span,
.detail-item p {
    color: #555;
    line-height: 1.6;
}

.search-results-header {
    margin-bottom: 20px;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 10px;
    text-align: center;
}

.search-results-header h3 {
    color: #2c3e50;
    margin: 0;
}

.search-results-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
}

.patient-card {
    background: white;
    border-radius: 10px;
    padding: 20px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;
}

.patient-card:hover {
    transform: translateY(-5px);
}

.patient-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    padding-bottom: 10px;
    border-bottom: 2px solid #e1e8ed;
}

.patient-card-header h4 {
    color: #2c3e50;
    margin: 0;
    font-size: 1.1rem;
}

.patient-id {
    background: #3498db;
    color: white;
    padding: 4px 8px;
    border-radius: 5px;
    font-size: 0.8rem;
    font-weight: 600;
}

.patient-card-body p {
    margin-bottom: 8px;
    color: #555;
    font-size: 0.9rem;
}

.patient-card-actions {
    margin-top: 15px;
    text-align: center;
}

.no-results {
    text-align: center;
    padding: 60px 20px;
    color: #7f8c8d;
}

.no-results h3 {
    margin-bottom: 10px;
    color: #95a5a6;
}

@media (max-width: 768px) {
    .detail-grid {
        grid-template-columns: 1fr;
    }
    
    .search-results-grid {
        grid-template-columns: 1fr;
    }
}
</style>
`;

// إضافة الأنماط الإضافية
document.head.insertAdjacentHTML('beforeend', additionalStyles);

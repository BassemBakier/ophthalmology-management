-- إنشاء جداول قاعدة البيانات لـ نظام إدارة مرضى طب العيون
-- Ophthalmology Patient Management System Database Setup

-- جدول المرضى
CREATE TABLE IF NOT EXISTS patients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 0 AND age <= 120),
    phone TEXT NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
    visit_date DATE NOT NULL,
    
    -- بيانات جدول EX (فحص العين)
    right_eye_va TEXT,
    right_eye_bcva TEXT,
    right_eye_comea TEXT,
    right_eye_lid TEXT,
    right_eye_lens TEXT,
    right_eye_iop DECIMAL(5,2),
    right_eye_fundus TEXT,
    
    left_eye_va TEXT,
    left_eye_bcva TEXT,
    left_eye_comea TEXT,
    left_eye_lid TEXT,
    left_eye_lens TEXT,
    left_eye_iop DECIMAL(5,2),
    left_eye_fundus TEXT,
    
    -- بيانات جدول Refraction (انكسار العين)
    right_dist_sph TEXT,
    right_dist_cyl TEXT,
    right_dist_axis TEXT,
    right_read_sph TEXT,
    right_read_cyl TEXT,
    right_read_axis TEXT,
    
    left_dist_sph TEXT,
    left_dist_cyl TEXT,
    left_dist_axis TEXT,
    left_read_sph TEXT,
    left_read_cyl TEXT,
    left_read_axis TEXT,
    
    ipa_dist TEXT,
    ipa_dist2 TEXT,
    ipa_read TEXT,
    ipa_read2 TEXT,
    
    -- المعلومات الطبية
    chief_complaint TEXT NOT NULL,
    diagnosis TEXT NOT NULL,
    treatment TEXT,
    operation TEXT,
    
    -- معلومات التكلفة
    examination_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount DECIMAL(10,2) DEFAULT 0,
    total_cost DECIMAL(10,2) GENERATED ALWAYS AS (examination_cost - discount) STORED,
    
    -- ملاحظات إضافية
    notes TEXT,
    
    -- تواريخ النظام
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول الأدوية
CREATE TABLE IF NOT EXISTS medications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Drops', 'Ointment', 'Tablet', 'Capsule', 'Injection', 'Other')),
    description TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول زيارة المرضى (للمتابعة)
CREATE TABLE IF NOT EXISTS patient_visits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    visit_date DATE NOT NULL,
    visit_type TEXT CHECK (visit_type IN ('initial', 'follow_up', 'emergency')),
    
    -- بيانات الفحص الجديد
    right_eye_va TEXT,
    right_eye_bcva TEXT,
    right_eye_iop DECIMAL(5,2),
    right_eye_notes TEXT,
    
    left_eye_va TEXT,
    left_eye_bcva TEXT,
    left_eye_iop DECIMAL(5,2),
    left_eye_notes TEXT,
    
    -- التشخيص والمتابعة
    diagnosis TEXT,
    treatment TEXT,
    next_visit_date DATE,
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول العلاج الموصوف
CREATE TABLE IF NOT EXISTS prescribed_treatments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    medication_id UUID REFERENCES medications(id) ON DELETE SET NULL,
    medication_name TEXT NOT NULL,
    dosage TEXT,
    duration TEXT,
    instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_patients_patient_id ON patients(patient_id);
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(name);
CREATE INDEX IF NOT EXISTS idx_patients_visit_date ON patients(visit_date);
CREATE INDEX IF NOT EXISTS idx_patients_created_at ON patients(created_at);

CREATE INDEX IF NOT EXISTS idx_medications_name ON medications(name);
CREATE INDEX IF NOT EXISTS idx_medications_type ON medications(type);

CREATE INDEX IF NOT EXISTS idx_visits_patient_id ON patient_visits(patient_id);
CREATE INDEX IF NOT EXISTS idx_visits_date ON patient_visits(visit_date);

CREATE INDEX IF NOT EXISTS idx_treatments_patient_id ON prescribed_treatments(patient_id);
CREATE INDEX IF NOT EXISTS idx_treatments_medication_id ON prescribed_treatments(medication_id);

-- إنشاء دالة لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- تطبيق دالة التحديث على الجداول
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medications_updated_at BEFORE UPDATE ON medications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- إنشاء سياسات الأمان (RLS) - Row Level Security
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescribed_treatments ENABLE ROW LEVEL SECURITY;

-- سياسة السماح بالقراءة والكتابة للجميع (يمكن تخصيصها حسب الحاجة)
CREATE POLICY "Allow all operations for authenticated users" ON patients
    FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON medications
    FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON patient_visits
    FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON prescribed_treatments
    FOR ALL USING (true);

-- إدراج بعض الأدوية الافتراضية
INSERT INTO medications (name, type, description) VALUES
('Tobramycin Eye Drops', 'Drops', 'مضاد حيوي لالتهابات العين'),
('Artificial Tears', 'Drops', 'دموع اصطناعية لترطيب العين'),
('Prednisolone Eye Drops', 'Drops', 'كورتيزون لعلاج الالتهابات'),
('Atropine Eye Drops', 'Drops', 'لتوسيع حدقة العين'),
('Timolol Eye Drops', 'Drops', 'لعلاج ارتفاع ضغط العين'),
('Pilocarpine Eye Drops', 'Drops', 'لتضييق حدقة العين'),
('Brimonidine Eye Drops', 'Drops', 'لعلاج ارتفاع ضغط العين'),
('Latanoprost Eye Drops', 'Drops', 'لعلاج الجلوكوما'),
('Dexamethasone Eye Ointment', 'Ointment', 'مرهم كورتيزون للعين'),
('Erythromycin Eye Ointment', 'Ointment', 'مرهم مضاد حيوي للعين')
ON CONFLICT DO NOTHING;

-- إنشاء عرض للتقارير المالية
CREATE OR REPLACE VIEW financial_summary AS
SELECT 
    DATE_TRUNC('month', visit_date) as month,
    COUNT(*) as total_patients,
    SUM(examination_cost) as total_revenue,
    SUM(discount) as total_discounts,
    SUM(total_cost) as net_revenue,
    AVG(examination_cost) as average_cost
FROM patients
GROUP BY DATE_TRUNC('month', visit_date)
ORDER BY month DESC;

-- إنشاء عرض لإحصائيات المرضى
CREATE OR REPLACE VIEW patient_statistics AS
SELECT 
    COUNT(*) as total_patients,
    COUNT(CASE WHEN gender = 'male' THEN 1 END) as male_patients,
    COUNT(CASE WHEN gender = 'female' THEN 1 END) as female_patients,
    AVG(age) as average_age,
    MIN(visit_date) as first_visit,
    MAX(visit_date) as last_visit,
    SUM(examination_cost) as total_revenue,
    SUM(discount) as total_discounts
FROM patients;

-- رسالة نجاح
SELECT 'تم إنشاء قاعدة البيانات بنجاح! Ophthalmology Management Database Created Successfully!' as message;

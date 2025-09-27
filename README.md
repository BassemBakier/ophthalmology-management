# نظام إدارة مرضى طب العيون - Ophthalmology Management System

نظام متكامل لإدارة مرضى طب العيون باستخدام Supabase كقاعدة بيانات خلفية.

## المميزات

- 📋 إدارة شاملة لبيانات المرضى
- 👁️ جداول فحص العين (EX Table) و Refraction
- 💊 إدارة الأدوية والعلاجات
- 📊 تقارير مالية مفصلة
- 🔍 بحث متقدم في بيانات المرضى
- 📱 واجهة مستخدم متجاوبة
- 💾 حفظ البيانات على Supabase
- 🔒 أمان متقدم للبيانات

## التقنيات المستخدمة

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Supabase
- **Database**: PostgreSQL
- **Authentication**: Supabase Auth
- **Deployment**: Supabase Hosting

## متطلبات النظام

- Node.js 16+ 
- npm أو yarn
- حساب Supabase

## خطوات التثبيت والنشر

### 1. إعداد مشروع Supabase

1. اذهب إلى [Supabase](https://supabase.com)
2. سجل دخولك أو أنشئ حساب جديد
3. أنشئ مشروع جديد باسم `ophthalmology-management`
4. احفظ:
   - Project URL
   - API Key (anon public)

### 2. إعداد قاعدة البيانات

1. في لوحة تحكم Supabase، اذهب إلى SQL Editor
2. انسخ محتوى ملف `database-setup.sql`
3. قم بتنفيذ الاستعلام لإنشاء الجداول

```sql
-- انسخ محتوى database-setup.sql هنا
```

### 3. إعداد المشروع محلياً

1. استنسخ المشروع:
```bash
git clone <repository-url>
cd ophthalmology-management
```

2. ثبت التبعيات:
```bash
npm install
```

3. قم بتحديث ملف `supabase-config.js`:
```javascript
const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'
```

### 4. تشغيل المشروع محلياً

```bash
npm run dev
```

المشروع سيعمل على: `http://localhost:3000`

### 5. النشر على Supabase

#### الطريقة الأولى: استخدام Supabase CLI

1. ثبت Supabase CLI:
```bash
npm install -g supabase
```

2. سجل دخولك:
```bash
supabase login
```

3. اربط المشروع:
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

4. انشر المشروع:
```bash
supabase functions deploy
```

#### الطريقة الثانية: النشر اليدوي

1. في لوحة تحكم Supabase، اذهب إلى Storage
2. ارفع ملفات المشروع:
   - `index.html`
   - `styles.css`
   - `script-supabase.js`
   - `supabase-config.js`
   - `logo.svg`

3. قم بتعيين `index.html` كصفحة رئيسية

## هيكل قاعدة البيانات

### جدول المرضى (patients)
- معلومات شخصية أساسية
- بيانات فحص العين (EX Table)
- بيانات انكسار العين (Refraction)
- معلومات طبية وتشخيص
- بيانات مالية

### جدول الأدوية (medications)
- أسماء الأدوية
- أنواع الأدوية
- وصفات وملاحظات

### جدول زيارات المرضى (patient_visits)
- تتبع زيارات المتابعة
- تحديثات التشخيص
- مواعيد الزيارات القادمة

### جدول العلاجات الموصوفة (prescribed_treatments)
- ربط المرضى بالأدوية
- جرعات ومدة العلاج
- تعليمات خاصة

## الأمان

- تم تفعيل Row Level Security (RLS)
- سياسات أمان محددة لكل جدول
- تشفير البيانات في النقل والتخزين
- مصادقة آمنة

## الاستخدام

### إضافة مريض جديد
1. اذهب إلى تبويب "Add New Patient"
2. املأ البيانات الأساسية
3. أدخل نتائج فحص العين
4. أضف التشخيص والعلاج
5. احفظ البيانات

### البحث في المرضى
1. اذهب إلى تبويب "Search"
2. استخدم معايير البحث المختلفة
3. عرض النتائج المفصلة

### التقارير المالية
1. اذهب إلى تبويب "Financial Reports"
2. حدد الفترة الزمنية
3. عرض الإحصائيات والرسوم البيانية

## استكشاف الأخطاء

### مشاكل الاتصال بقاعدة البيانات
- تأكد من صحة URL و API Key
- تحقق من إعدادات CORS
- راجع سياسات الأمان

### مشاكل في التحميل
- تحقق من اتصال الإنترنت
- راجع Console للأخطاء
- تأكد من صحة البيانات المرسلة

## المساهمة

نرحب بالمساهمات! يرجى:
1. Fork المشروع
2. إنشاء branch جديد
3. إجراء التغييرات
4. إرسال Pull Request

## الترخيص

هذا المشروع مرخص تحت رخصة MIT - راجع ملف LICENSE للتفاصيل.

## الدعم

للحصول على الدعم:
- أنشئ Issue في GitHub
- راسلنا على البريد الإلكتروني
- راجع الوثائق

## التحديثات القادمة

- [ ] نظام مصادقة المستخدمين
- [ ] تقارير PDF قابلة للطباعة
- [ ] تطبيق موبايل
- [ ] دعم متعدد اللغات
- [ ] نظام إشعارات
- [ ] دعم الصور والملفات

---

**ملاحظة**: تأكد من تحديث معلومات الاتصال بقاعدة البيانات قبل النشر على الإنتاج.

## معلومات الاتصال

- **اسم المشروع**: ophthalmology-management
- **كلمة المرور**: Character!@12
- **قاعدة البيانات**: PostgreSQL على Supabase
- **الاستضافة**: Supabase Hosting

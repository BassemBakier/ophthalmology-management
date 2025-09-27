# خطوات الـ Deploy على GitHub

## ✅ تم إنجازه:
- ✅ إنشاء Git repository محلي
- ✅ إضافة جميع الملفات
- ✅ عمل commit أولي
- ✅ تغيير الفرع إلى main

## 🔄 الخطوات التالية:

### 1. إنشاء Repository على GitHub:
1. اذهب إلى https://github.com/new
2. Repository name: `ophthalmology-management`
3. Description: `Ophthalmology Patient Management System`
4. اختر Public
5. **لا تضع علامة** على README, .gitignore, license
6. اضغط "Create repository"

### 2. ربط المشروع بـ GitHub:
```bash
# في Terminal في مجلد C:\OPTH
git remote add origin https://github.com/YOUR_USERNAME/ophthalmology-management.git
git push -u origin main
```

### 3. إعداد GitHub Pages:
1. اذهب إلى Settings في repository
2. انتقل إلى Pages في القائمة الجانبية
3. في "Source" اختر "GitHub Actions"
4. احفظ

### 4. تحديث إعدادات Supabase:
1. افتح ملف `script.js`
2. حدث هذه الأسطر:
```javascript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_KEY = 'your-anon-key';
```

### 5. إعداد قاعدة البيانات:
1. اذهب إلى https://supabase.com
2. افتح مشروعك
3. اذهب إلى SQL Editor
4. انسخ محتوى `database-setup.sql`
5. نفذ الاستعلام

## 🌐 النتيجة:
موقعك سيكون متاح على:
`https://YOUR_USERNAME.github.io/ophthalmology-management`

## 📋 الملفات المرفوعة:
- ✅ index.html (الصفحة الرئيسية)
- ✅ script.js (JavaScript مع Supabase)
- ✅ styles.css (التصميم)
- ✅ package.json (التبعيات)
- ✅ database-setup.sql (قاعدة البيانات)
- ✅ README.md (الوثائق)
- ✅ .github/workflows/deploy.yml (النشر التلقائي)

---
**ملاحظة:** استبدل YOUR_USERNAME باسم المستخدم الخاص بك على GitHub

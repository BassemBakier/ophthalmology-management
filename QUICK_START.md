# دليل البدء السريع - Quick Start Guide

## 🚀 رفع المشروع على GitHub في 5 خطوات

### الخطوة 1: إنشاء Repository
1. اذهب إلى [GitHub.com](https://github.com)
2. اضغط "New repository"
3. اسم المشروع: `ophthalmology-management`
4. اختر Public
5. اضغط "Create repository"

### الخطوة 2: رفع الملفات
```bash
# افتح Terminal في مجلد المشروع
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ophthalmology-management.git
git push -u origin main
```

### الخطوة 3: إعداد GitHub Pages
1. اذهب إلى Settings في repository
2. انتقل إلى Pages
3. اختر "GitHub Actions" في Source
4. احفظ

### الخطوة 4: تحديث Supabase
1. افتح `script.js`
2. حدث هذه الأسطر:
```javascript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_KEY = 'your-anon-key';
```

### الخطوة 5: إعداد قاعدة البيانات
1. اذهب إلى [Supabase.com](https://supabase.com)
2. افتح مشروعك
3. اذهب إلى SQL Editor
4. انسخ محتوى `database-setup.sql`
5. نفذ الاستعلام

## ✅ النتيجة
- 🌐 موقعك سيكون متاح على: `https://YOUR_USERNAME.github.io/ophthalmology-management`
- 💾 البيانات محفوظة في Supabase
- 🔄 تحديث تلقائي عند كل push

## 🆘 مساعدة سريعة

### المشروع لا يعمل؟
- تحقق من Console للأخطاء
- تأكد من صحة Supabase URL و Key

### البيانات لا تظهر؟
- تأكد من إنشاء الجداول في Supabase
- تحقق من سياسات RLS

### GitHub Pages لا يعمل؟
- انتظر 5-10 دقائق
- تحقق من Actions في repository

---

**🎉 مبروك! مشروعك الآن على الإنترنت!**

# تعليمات النشر على GitHub - Deployment Guide

## خطوات النشر على GitHub Pages

### 1. إعداد Repository على GitHub

1. **اذهب إلى [GitHub](https://github.com)**
2. **أنشئ repository جديد:**
   - Repository name: `ophthalmology-management`
   - Description: `Ophthalmology Patient Management System`
   - اختر Public أو Private حسب رغبتك
   - **لا تضع علامة** على Initialize with README

### 2. رفع الملفات إلى GitHub

#### الطريقة الأولى: استخدام Git Command Line

```bash
# في مجلد المشروع
git init
git add .
git commit -m "Initial commit: Ophthalmology Management System"

# اربط المشروع بـ GitHub (استبدل YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/ophthalmology-management.git
git branch -M main
git push -u origin main
```

#### الطريقة الثانية: استخدام GitHub Desktop

1. **حمل [GitHub Desktop](https://desktop.github.com)**
2. **افتح GitHub Desktop**
3. **اختر "Add an Existing Repository"**
4. **اختر مجلد المشروع**
5. **اضغط "Publish repository"**

#### الطريقة الثالثة: الرفع اليدوي

1. **اذهب إلى repository على GitHub**
2. **اضغط "uploading an existing file"**
3. **اسحب الملفات أو اخترها**
4. **اكتب رسالة commit**
5. **اضغط "Commit changes"**

### 3. إعداد GitHub Pages

1. **اذهب إلى Settings في repository**
2. **انتقل إلى قسم "Pages" في القائمة الجانبية**
3. **في "Source" اختر "GitHub Actions"**
4. **احفظ التغييرات**

### 4. تحديث إعدادات Supabase

1. **افتح ملف `script.js`**
2. **حدث هذه الأسطر:**

```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // ضع URL مشروعك
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY'; // ضع API Key
```

### 5. إعداد قاعدة البيانات

1. **اذهب إلى [Supabase](https://supabase.com)**
2. **افتح مشروعك**
3. **اذهب إلى SQL Editor**
4. **انسخ محتوى ملف `database-setup.sql`**
5. **نفذ الاستعلام**

### 6. اختبار النشر

1. **اذهب إلى Actions في repository**
2. **انتظر حتى ينتهي workflow**
3. **اذهب إلى Settings > Pages**
4. **ستجد رابط الموقع المنشور**

## خيارات النشر البديلة

### Netlify (أسهل)

1. **اذهب إلى [Netlify](https://netlify.com)**
2. **اضغط "New site from Git"**
3. **اختر GitHub و repository**
4. **اختر إعدادات النشر:**
   - Build command: `npm run build`
   - Publish directory: `.`
5. **اضغط "Deploy site"**

### Vercel (سريع)

1. **اذهب إلى [Vercel](https://vercel.com)**
2. **اضغط "Import Project"**
3. **اختر GitHub repository**
4. **اضغط "Deploy"**

### Firebase Hosting

1. **حمل [Firebase CLI](https://firebase.google.com/docs/cli)**
2. **في مجلد المشروع:**

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

## نصائح مهمة

### الأمان
- ✅ لا تضع API keys في الكود العام
- ✅ استخدم Environment Variables
- ✅ فعّل Row Level Security في Supabase

### الأداء
- ✅ استخدم CDN للصور
- ✅ فعّل Compression
- ✅ استخدم Service Worker للـ caching

### SEO
- ✅ أضف Meta tags
- ✅ استخدم Structured Data
- ✅ فعّل Analytics

## استكشاف الأخطاء

### مشكلة: الموقع لا يعمل
**الحل:**
1. تحقق من Console للأخطاء
2. تأكد من صحة Supabase URL و Key
3. راجع إعدادات CORS

### مشكلة: البيانات لا تظهر
**الحل:**
1. تأكد من إنشاء الجداول في Supabase
2. تحقق من سياسات RLS
3. راجع Network tab في Developer Tools

### مشكلة: GitHub Pages لا يعمل
**الحل:**
1. تحقق من Actions في repository
2. تأكد من إعداد Pages في Settings
3. راجع logs للأخطاء

## روابط مفيدة

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Supabase Documentation](https://supabase.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [Vercel Documentation](https://vercel.com/docs)

---

**ملاحظة**: تذكر تحديث إعدادات Supabase قبل النشر على الإنتاج!

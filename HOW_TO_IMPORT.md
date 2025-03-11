# كيفية استيراد لوحة التحكم إلى Appsmith

## الطريقة المباشرة (الموصى بها)

1. قم بتنزيل ملف التصدير [appsmith-export.json](https://github.com/ElshinQ/matjarna-appsmith-dashboard/raw/main/appsmith-export.json) من المستودع (انقر على الرابط ثم اضغط الزر الأيمن واختر "حفظ باسم")

2. سجل الدخول إلى لوحة تحكم Appsmith الخاصة بك
   - على سبيل المثال: https://build.elshin.cloud

3. اضغط على زر "+ New" الموجود في الزاوية العليا اليمنى في الصفحة الرئيسية

4. اختر "Import"  من القائمة المنسدلة
   ![خطوة الاستيراد 1](https://i.imgur.com/oUJKTmq.png)

5. في النافذة المنبثقة، انقر على "Browse" واختر ملف `appsmith-export.json` الذي قمت بتنزيله
   ![خطوة الاستيراد 2](https://i.imgur.com/YyYZikG.png)

6. انتظر قليلاً حتى يتم تحميل الملف، ثم اضغط على زر "Import"
   ![خطوة الاستيراد 3](https://i.imgur.com/DLpG1n9.png)

7. سيتم إنشاء التطبيق وفتحه تلقائياً

8. بعد الاستيراد، ستحتاج إلى إدخال كلمات المرور لاتصالات قواعد البيانات:
   - افتح إعدادات كل مصدر بيانات (matjarnaDB و authDB) وأدخل كلمة المرور: `MyDB123456`
   - اختبر الاتصالات للتأكد من أنها تعمل بشكل صحيح

## الطريقة اليدوية (إذا فشلت الطريقة المباشرة)

إذا واجهت مشاكل مع ملف التصدير، يمكنك إنشاء التطبيق يدوياً باتباع الخطوات التالية:

### 1. إنشاء تطبيق جديد

1. سجل الدخول إلى Appsmith
2. اضغط على "+ New" واختر "Application"
3. اختر "Start from scratch"
4. أدخل اسم "Matjarna Dashboard"

### 2. إعداد مصادر البيانات

#### إعداد اتصال قاعدة بيانات المتجر

1. انقر على "+" بجانب "Datasources"
2. اختر "PostgreSQL"
3. أدخل المعلومات التالية:
   - **Name**: `matjarnaDB`
   - **Host**: `postgres`
   - **Port**: `5432`
   - **Database Name**: `matjarna_db`
   - **Username**: `noor`
   - **Password**: `MyDB123456`
4. اختبر الاتصال واضغط "Save"

#### إعداد اتصال قاعدة بيانات المستخدمين

1. انقر على "+" بجانب "Datasources" مرة أخرى
2. اختر "PostgreSQL"
3. أدخل المعلومات التالية:
   - **Name**: `authDB`
   - **Host**: `postgres`
   - **Port**: `5432`
   - **Database Name**: `auth_db`
   - **Username**: `noor`
   - **Password**: `MyDB123456`
4. اختبر الاتصال واضغط "Save"

### 3. إنشاء كائنات JavaScript

1. في الشريط الجانبي، انقر على "+" بجانب "JS Objects"
2. انشئ كائن جديد بالاسم المناسب، مثلاً "DatabaseIntegration"
3. انسخ محتوى الملف المقابل من مستودع GitHub
4. كرر هذه العملية لباقي الملفات JavaScript:
   - [DatabaseIntegration.js](https://github.com/ElshinQ/matjarna-appsmith-dashboard/blob/main/appsmith/js/DatabaseIntegration.js)
   - [ChatBotIntegration.js](https://github.com/ElshinQ/matjarna-appsmith-dashboard/blob/main/appsmith/js/ChatBotIntegration.js)
   - [N8nIntegration.js](https://github.com/ElshinQ/matjarna-appsmith-dashboard/blob/main/appsmith/js/N8nIntegration.js)
   - [ProductManagement.js](https://github.com/ElshinQ/matjarna-appsmith-dashboard/blob/main/appsmith/js/ProductManagement.js)
   - [OrderManagement.js](https://github.com/ElshinQ/matjarna-appsmith-dashboard/blob/main/appsmith/js/OrderManagement.js)
   - [CustomerManagement.js](https://github.com/ElshinQ/matjarna-appsmith-dashboard/blob/main/appsmith/js/CustomerManagement.js)

### 4. إنشاء واجهة المستخدم

أنشئ الشاشات اللازمة يدوياً بالترتيب التالي:

1. **Dashboard**: الشاشة الرئيسية مع عرض ملخص المبيعات والطلبات
2. **Product Management**: إدارة المنتجات مع نماذج إنشاء/تعديل المنتجات
3. **Order Management**: إدارة الطلبات مع إمكانية تغيير حالة الطلب
4. **Customer Records**: سجلات العملاء مع بحث وتصفية

### 5. إعداد متغيرات التطبيق

1. انتقل إلى "Settings" > "App Settings" > "Store"
2. أضف متغير باسم "OPENAI_API_KEY" وأدخل مفتاح API الخاص بك من OpenAI

## مشاكل شائعة وحلولها

### عدم القدرة على الاتصال بقاعدة البيانات

- تأكد من أن خادم PostgreSQL يعمل والحاويات (containers) في حالة تشغيل
- تأكد من استخدام اسم الحاوية `postgres` كعنوان للمضيف وليس `localhost`
- تأكد من صحة اسم المستخدم وكلمة المرور

### مشاكل في استيراد ملف JSON

- تأكد من تنزيل الملف بالكامل دون تغيير
- جرب إعادة تنزيل الملف من المستودع
- إذا استمرت المشكلة، اتبع الطريقة اليدوية

### عناصر الواجهة غير مترابطة

- تأكد من تسمية الكائنات والمتغيرات بنفس الأسماء المستخدمة في الكود
- تأكد من إنشاء جميع الاستعلامات اللازمة

## المزيد من المساعدة

لمزيد من التفاصيل، يمكنك الرجوع إلى:

- [INSTALLATION.md](https://github.com/ElshinQ/matjarna-appsmith-dashboard/blob/main/INSTALLATION.md) - دليل التثبيت
- [DEPLOYMENT.md](https://github.com/ElshinQ/matjarna-appsmith-dashboard/blob/main/DEPLOYMENT.md) - دليل النشر
- [IMPORT_GUIDE.md](https://github.com/ElshinQ/matjarna-appsmith-dashboard/blob/main/IMPORT_GUIDE.md) - دليل الاستيراد المفصل

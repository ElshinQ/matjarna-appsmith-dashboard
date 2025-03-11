# دليل استيراد لوحة التحكم إلى Appsmith

نظرًا لأن استيراد ملف JSON كامل قد يواجه بعض المشاكل، إليك دليل تفصيلي لإعداد لوحة التحكم خطوة بخطوة في Appsmith.

## الخطوة 1: إنشاء تطبيق جديد في Appsmith

1. قم بتسجيل الدخول إلى منصة Appsmith الخاصة بك (https://build.elshin.cloud).
2. اضغط على "+ New" في الزاوية العلوية اليمنى ثم اختر "Create New Application".
3. أدخل اسم التطبيق: "Matjarna Dashboard".
4. اختر خيار "Start from scratch" ثم اضغط "Create".

## الخطوة 2: إعداد مصادر البيانات (Datasources)

### إعداد اتصال قاعدة بيانات المتجر

1. اضغط على "+" بجانب "Datasources" في الشريط الجانبي.
2. اختر "PostgreSQL".
3. أدخل المعلومات التالية:
   - **Name**: `matjarnaDB`
   - **Host**: `postgres`
   - **Port**: `5432`
   - **Database Name**: `matjarna_db`
   - **Username**: `noor`
   - **Password**: `MyDB123456`
4. اضغط على "Test Connection" للتأكد من صحة الاتصال.
5. اضغط على "Save" لحفظ مصدر البيانات.

### إعداد اتصال قاعدة بيانات المستخدمين

1. اضغط على "+ New Datasource" مرة أخرى.
2. اختر "PostgreSQL".
3. أدخل المعلومات التالية:
   - **Name**: `authDB`
   - **Host**: `postgres`
   - **Port**: `5432`
   - **Database Name**: `auth_db`
   - **Username**: `noor`
   - **Password**: `MyDB123456`
4. اضغط على "Test Connection" للتأكد من صحة الاتصال.
5. اضغط على "Save" لحفظ مصدر البيانات.

## الخطوة 3: إنشاء JS Objects

الآن سوف نقوم بإنشاء كائنات JavaScript التي تحتوي على المنطق الأساسي للتطبيق.

### إنشاء DatabaseIntegration

1. اضغط على "+" بجانب "JS Objects" في الشريط الجانبي.
2. اختر "New JS Object".
3. سمّ الكائن "DatabaseIntegration".
4. احذف المحتوى الافتراضي واستبدله بمحتوى ملف [DatabaseIntegration.js](https://github.com/ElshinQ/matjarna-appsmith-dashboard/blob/main/appsmith/js/DatabaseIntegration.js) من المستودع.
5. اضغط على "Save" لحفظ الكائن.

### إنشاء ChatBotIntegration

1. اضغط على "+" بجانب "JS Objects" مرة أخرى.
2. اختر "New JS Object".
3. سمّ الكائن "ChatBotIntegration".
4. احذف المحتوى الافتراضي واستبدله بمحتوى ملف [ChatBotIntegration.js](https://github.com/ElshinQ/matjarna-appsmith-dashboard/blob/main/appsmith/js/ChatBotIntegration.js) من المستودع.
5. اضغط على "Save" لحفظ الكائن.

### إنشاء N8nIntegration

1. كرر الخطوات السابقة لإنشاء كائن باسم "N8nIntegration".
2. استبدل المحتوى بمحتوى ملف [N8nIntegration.js](https://github.com/ElshinQ/matjarna-appsmith-dashboard/blob/main/appsmith/js/N8nIntegration.js) من المستودع.

### إنشاء ProductManagement

1. كرر الخطوات السابقة لإنشاء كائن باسم "ProductManagement".
2. استبدل المحتوى بمحتوى ملف [ProductManagement.js](https://github.com/ElshinQ/matjarna-appsmith-dashboard/blob/main/appsmith/js/ProductManagement.js) من المستودع.

### إنشاء OrderManagement

1. كرر الخطوات السابقة لإنشاء كائن باسم "OrderManagement".
2. استبدل المحتوى بمحتوى ملف [OrderManagement.js](https://github.com/ElshinQ/matjarna-appsmith-dashboard/blob/main/appsmith/js/OrderManagement.js) من المستودع.

### إنشاء CustomerManagement

1. كرر الخطوات السابقة لإنشاء كائن باسم "CustomerManagement".
2. استبدل المحتوى بمحتوى ملف [CustomerManagement.js](https://github.com/ElshinQ/matjarna-appsmith-dashboard/blob/main/appsmith/js/CustomerManagement.js) من المستودع.

## الخطوة 4: إنشاء صفحات التطبيق

### إنشاء صفحة Dashboard

1. افتح أول صفحة في التطبيق (تسمى عادة "Page1").
2. قم بتغيير اسمها إلى "Dashboard".
3. استخدم الواجهة البصرية لإضافة العناصر التالية:

   - **Header Container**: شريط علوي بلون الثيم الأساسي
     - أضف عنصر نص بداخله مع قيمة "لوحة التحكم - متجرنا"
     - أضف زر أيقونة لتبديل السمة (theme toggle)

   - **Stats Container**: حاوية للإحصائيات
     - أضف 4 بطاقات (cards) داخل الحاوية لعرض:
       1. إجمالي المبيعات
       2. عدد الطلبات
       3. عدد المنتجات
       4. المنتجات منخفضة المخزون

   - **Chart Container**: حاوية للرسم البياني
     - أضف عنصر مخطط خطي (line chart) لعرض مبيعات الشهر الحالي

   - **Navigation Container**: حاوية للتنقل السريع
     - أضف 4 أزرار للتنقل إلى:
       1. إدارة المنتجات
       2. إدارة الطلبات
       3. سجلات العملاء
       4. دردشة المساعدة

### إنشاء صفحات إضافية

1. اضغط على "+" بجانب "Pages" في الشريط الجانبي لإنشاء الصفحات التالية:
   - "Product Management"
   - "Order Management"
   - "Customer Records"
   - "Chat Support"

2. في كل صفحة، قم بإضافة العناصر المناسبة وفقًا للتصميم المطلوب.

## الخطوة 5: إنشاء الاستعلامات (Queries)

1. اضغط على "+" بجانب "Queries/JS" في الشريط الجانبي.
2. اختر "New Query".
3. اختر مصدر البيانات "matjarnaDB".
4. قم بإنشاء الاستعلامات الأساسية التالية:

   - **getAllProducts**: `SELECT * FROM inventory ORDER BY id DESC`
   - **getLowStockProducts**: `SELECT * FROM inventory WHERE "الكمية"::integer <= "المخزون_المنخفض"::integer ORDER BY id DESC`
   - **getProductById**: `SELECT * FROM inventory WHERE id = {{productId}}`

5. استمر في إنشاء باقي الاستعلامات المطلوبة لكل وظيفة في التطبيق، باستخدام الأمثلة الموجودة في كائن DatabaseIntegration.

## الخطوة 6: إعداد المتغيرات العامة

1. انتقل إلى "Settings" > "App Settings" > "Store".
2. أضف متغير باسم "OPENAI_API_KEY" وأدخل مفتاح API الخاص بك من OpenAI.

## الخطوة 7: اختبار التطبيق

1. اضغط على زر "Preview" في الزاوية العلوية اليمنى لاختبار التطبيق.
2. تأكد من أن جميع الوظائف تعمل كما هو متوقع.
3. اختبر الاتصالات بقواعد البيانات والـ API الخارجية.

## الخطوة 8: نشر التطبيق

1. اضغط على زر "Deploy" في الزاوية العلوية اليمنى.
2. اضغط على "Deploy" مرة أخرى في النافذة المنبثقة.

## ملاحظات هامة

- إذا واجهتك أي مشكلة في نسخ الكود من المستودع، يمكنك استخدام وظيفة "Raw" في GitHub لنسخ النص الخام.
- تأكد من إنشاء جميع الاستعلامات المطلوبة قبل الانتقال لاختبار التطبيق.
- قد تحتاج إلى تعديل بعض الإعدادات وفقًا لبيئة التشغيل الخاصة بك.

## تخصيص التطبيق

بعد إنشاء النسخة الأساسية من التطبيق، يمكنك تخصيصه وفقًا لاحتياجاتك:

1. قم بتعديل الألوان والسمات من خلال قسم "Settings" > "Theme".
2. أضف المزيد من الصفحات أو العناصر حسب الحاجة.
3. قم بتخصيص الاستعلامات والمنطق لتناسب بيانات عملك الفعلية.

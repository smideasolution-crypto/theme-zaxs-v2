# ZAXS — ثيم سلة Twilight

ثيم متجر **ZAXS** جاهز للرفع على GitHub ثم ربطه من سلة.

الملف المضغوط: `theme-zaxs-salla.zip` (بدون preview أو ملفات الهوية PDF).

## رفعه على GitHub

1. افتح [github.com/new](https://github.com/new)
2. اسم المستودع: `theme-zaxs`
3. اختَر **Private** — لا تخليه Public
4. أنشئ المستودع فاضي، بدون README
5. ارفع **بس** مجلد `theme-zaxs-salla` (حجمه 5MB). لا ترفع المشروع كامل.
6. GitHub ما يقبل أكثر من 100 ملف مرة واحدة. ارفع على دفعتين:
   - الدفعة 1: كل الملفات **ما عدا** مجلد `src/assets`
   - الدفعة 2: مجلد `src/assets`
7. في `twilight.json` غيّر `USERNAME` إلى يوزر GitHub حقك

إذا عندك Git مثبت:

```bash
git remote add origin https://github.com/USERNAME/theme-zaxs.git
git push -u origin main
```

## ربطه بسلة

1. ادخل [Salla Partners](https://salla.partners/)
2. **الثيمات** ← ثيم جديد / ربط GitHub
3. اختر مستودع `theme-zaxs`
4. سلة تبني الثيم من `twilight.json` + `src/`
5. من لوحة المتجر: **التصميم ← الثيمات** ← فعّل ثيم زاكس

بعد التفعيل: ارفع شعار المتجر من إعدادات سلة، وصورة الهيرو من إعدادات الثيم.

## الملفات المهمة

| ملف | الوظيفة |
| --- | --- |
| `twilight.json` | اسم الثيم وإعدادات التاجر |
| `src/views/components/home/zaxs-campaign.twig` | الصفحة الرئيسية |
| `src/assets/styles/zaxs-overlay.css` | هوية ZAXS |
| `webpack.config.js` | بناء CSS/JS |

مجلدات `preview/` و `tmp/` و `brand/` محلية وما تنرفع مع الثيم.

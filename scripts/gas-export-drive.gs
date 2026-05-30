/**
 * تصدير مجلد Google Drive — أرشيف الشيخ خالد بن علي الجريش
 * ===========================================================
 * الهدف: استخراج معرّفات (IDs) ملفات مجلد في Drive + جعلها قابلة للمشاركة،
 * لتُستورد بعد ذلك إلى الموقع.
 *
 * طريقة التشغيل (مرّة واحدة لكل مجلد):
 *   1) افتح https://script.google.com ← «مشروع جديد».
 *   2) الصق هذا الملف بالكامل مكان الكود الموجود.
 *   3) ضع معرّف المجلد في FOLDER_ID بالأسفل:
 *        - افتح المجلد في drive.google.com، ورابطه ينتهي بـ:
 *          .../folders/XXXXXXXXXXXX  ← الجزء XXXX هو المعرّف.
 *   4) من القائمة العلوية اختر الدالة "listFolder" ثم اضغط ▶ تشغيل.
 *   5) أول مرة سيطلب إذناً — اسمح (Authorize) بحسابك.
 *   6) عند الانتهاء سيُنشئ ملف "khalid-drive-export.json" في «ملفاتي».
 *      أخبر المساعد لأقرأه من G:\ملفاتي مباشرة.
 *
 * ملاحظات:
 *   - MAKE_PUBLIC = true يجعل كل ملف "لأي شخص لديه الرابط - مشاهدة".
 *     اجعله false إن أردت السرد فقط دون تغيير المشاركة.
 *   - يتجاهل ملفات Google الأصلية (مستندات/جداول) لأنها ليست وسائط قابلة للتضمين.
 *   - يسرد المجلدات الفرعية بشكل متكرّر، ويسجّل مسار كل ملف في حقل "folder".
 */

// ====== اضبط هذين فقط ======
const FOLDER_ID = 'ضع_معرّف_المجلد_هنا';
const MAKE_PUBLIC = true;
// ===========================

function listFolder() {
  const root = DriveApp.getFolderById(FOLDER_ID);
  const out = [];
  walk_(root, root.getName(), out);

  const json = JSON.stringify(out, null, 2);
  // احذف نسخة قديمة بنفس الاسم إن وُجدت
  const old = DriveApp.getFilesByName('khalid-drive-export.json');
  while (old.hasNext()) old.next().setTrashed(true);
  DriveApp.createFile('khalid-drive-export.json', json, 'application/json');

  Logger.log('تم: ' + out.length + ' ملفاً. أُنشئ khalid-drive-export.json في «ملفاتي».');
}

function walk_(folder, pathName, out) {
  const files = folder.getFiles();
  while (files.hasNext()) {
    const f = files.next();
    const mime = f.getMimeType();
    // تخطَّ مجلدات/اختصارات Google الأصلية
    if (mime && mime.indexOf('application/vnd.google-apps') === 0) continue;
    if (MAKE_PUBLIC) {
      try {
        f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      } catch (e) { /* تجاهل أخطاء المشاركة الفردية */ }
    }
    out.push({
      id: f.getId(),
      name: f.getName(),
      mimeType: mime,
      sizeMB: Math.round((f.getSize() / 1048576) * 10) / 10,
      folder: pathName,
    });
  }
  const subs = folder.getFolders();
  while (subs.hasNext()) {
    const sf = subs.next();
    walk_(sf, pathName + ' / ' + sf.getName(), out);
  }
}

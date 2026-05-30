/**
 * تصدير مجلدات Google Drive — أرشيف الشيخ خالد بن علي الجريش
 * ===========================================================
 * الهدف: استخراج معرّفات (IDs) ملفات عدة مجلدات + جعلها قابلة للمشاركة،
 * لتُستورد بعد ذلك إلى الموقع.
 *
 * طريقة التشغيل:
 *   1) افتح https://script.google.com ← «مشروع جديد».
 *   2) الصق هذا الملف بالكامل مكان الكود الموجود.
 *   3) ضع معرّفات المجلدات داخل FOLDER_IDS (موجودة بالأسفل، عدّلها إن لزم).
 *   4) اختر الدالة "listFolders" من الأعلى ثم اضغط ▶ تشغيل.
 *   5) أول مرة سيطلب إذناً — اسمح (Authorize) بحسابك.
 *   6) عند الانتهاء سيُنشئ ملف "khalid-drive-export.json" في «ملفاتي».
 *      أخبر المساعد لأقرأه من G:\ملفاتي مباشرة.
 *
 * ملاحظات:
 *   - MAKE_PUBLIC = true يجعل كل ملف "لأي شخص لديه الرابط - مشاهدة".
 *   - يتجاهل ملفات Google الأصلية (مستندات/جداول) لأنها ليست وسائط قابلة للتضمين.
 *   - يسرد المجلدات الفرعية بشكل متكرّر، ويسجّل مسار كل ملف في حقل "folder".
 *   - يزيل المكرّر إن ظهر نفس الملف في أكثر من مجلد.
 */

// ====== اضبط هذه فقط ======
const FOLDER_IDS = [
  '1BzANASiVQVJ6QUy2_m5UdHgBaM211wDt',
  '1b-SN0OMc_UFk_z4YgSiyosjT6e_QdR5n',
  '14rALChHSsxDWLIfzDM1qw9K6k8KE53uC',
];
const MAKE_PUBLIC = true;
// ===========================

function listFolders() {
  const out = [];
  const seen = {};
  for (let i = 0; i < FOLDER_IDS.length; i++) {
    const id = String(FOLDER_IDS[i]).trim();
    if (!id) continue;
    let root;
    try {
      root = DriveApp.getFolderById(id);
    } catch (e) {
      Logger.log('تعذّر فتح المجلد ' + id + ' — تخطّيته: ' + e);
      continue;
    }
    walk_(root, root.getName(), out, seen);
  }

  const json = JSON.stringify(out, null, 2);
  const old = DriveApp.getFilesByName('khalid-drive-export.json');
  while (old.hasNext()) old.next().setTrashed(true);
  DriveApp.createFile('khalid-drive-export.json', json, 'application/json');

  Logger.log('تم: ' + out.length + ' ملفاً. أُنشئ khalid-drive-export.json في «ملفاتي».');
}

function walk_(folder, pathName, out, seen) {
  const files = folder.getFiles();
  while (files.hasNext()) {
    const f = files.next();
    const id = f.getId();
    if (seen[id]) continue;
    seen[id] = true;
    const mime = f.getMimeType();
    if (mime && mime.indexOf('application/vnd.google-apps') === 0) continue;
    if (MAKE_PUBLIC) {
      try {
        f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      } catch (e) { /* تجاهل أخطاء المشاركة الفردية */ }
    }
    out.push({
      id: id,
      name: f.getName(),
      mimeType: mime,
      sizeMB: Math.round((f.getSize() / 1048576) * 10) / 10,
      folder: pathName,
    });
  }
  const subs = folder.getFolders();
  while (subs.hasNext()) {
    const sf = subs.next();
    walk_(sf, pathName + ' / ' + sf.getName(), out, seen);
  }
}

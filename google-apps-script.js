/**
 * Google Apps Script — приём заявок от формы МФО и запись в Google Таблицу.
 *
 * Установка:
 * 1. Откройте Google Таблицу, в которую хотите сохранять заявки.
 * 2. Расширения → Apps Script.
 * 3. Вставьте этот код в редактор, сохраните.
 * 4. Развернуть → Новое развертывание → Тип: «Веб-приложение».
 *    - Доступ: «Все» (Anyone).
 *    - Запуск от имени: «Я».
 * 5. Скопируйте URL веб-приложения и вставьте его в index.html (SCRIPT_URL).
 */

// Заголовки колонок таблицы
var HEADERS = ["Дата/время", "ФИО", "Телефон", "Город", "Тип", "Сумма", "Источник", "Комментарий"];

function doPost(e) {
  try {
    var payload = {};
    if (e && e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        payload = e.parameter || {};
      }
    } else if (e && e.parameter) {
      payload = e.parameter;
    }

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Если лист пустой — добавляем заголовки и оформляем строку
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      var header = sheet.getRange(1, 1, 1, HEADERS.length);
      header
        .setBackground("#059669")        // зелёный фон шапки
        .setFontColor("#ffffff")          // белый текст
        .setFontWeight("bold")
        .setHorizontalAlignment("center")
        .setVerticalAlignment("middle");
      sheet.setRowHeight(1, 32);
      sheet.setFrozenRows(1);             // закрепляем строку заголовков
    }

    var row = [
      new Date(),
      payload.fio || "",
      payload.phone || "",
      payload.city || "",
      payload.type || "",
      payload.amount || "",
      payload.source || "",
      payload.comment || ""
    ];

    sheet.appendRow(row);

    return jsonResponse({ status: "success" });
  } catch (err) {
    return jsonResponse({ status: "error", message: String(err) });
  }
}

// Ответ на preflight-запрос (CORS)
function doOptions(e) {
  return jsonResponse({ status: "ok" });
}

// GET — для проверки, что эндпоинт работает
function doGet(e) {
  return jsonResponse({ status: "ok", service: "MFO leads endpoint" });
}

/**
 * Возвращает JSON-ответ с CORS-заголовками.
 * Примечание: ContentService в Apps Script ограничен в установке заголовков,
 * однако веб-приложения, развёрнутые с доступом «Anyone», по умолчанию
 * отвечают с разрешающими CORS-заголовками для простых POST-запросов.
 */
function jsonResponse(obj) {
  var output = ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
  return output;
}

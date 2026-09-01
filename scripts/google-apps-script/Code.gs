/**
 * Free Google Drive storage — no Google Cloud Console.
 * Sign in at https://script.google.com with tutimanicabs@gmail.com
 *
 * Deploy: Deploy → New deployment → Web app
 *   Execute as: Me
 *   Who has access: Anyone
 * Copy the Web app URL into GOOGLE_APPS_SCRIPT_URL
 *
 * Put the same secret in DRIVE_BRIDGE_SECRET in .env / Netlify.
 */
const SCRIPT_SECRET = "tm-drive-7f3c9a2e";

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    if (!body || body.secret !== SCRIPT_SECRET) {
      return json_({ ok: false, message: "Unauthorized" });
    }
    const folderId = body.folderId;
    if (!folderId) {
      return json_({ ok: false, message: "Missing folderId" });
    }

    switch (body.action) {
      case "readData":
        return json_({ ok: true, data: readData_(folderId) });
      case "writeData":
        writeData_(folderId, body.data);
        return json_({ ok: true });
      case "uploadPdf":
        return json_({ ok: true, file: uploadPdf_(folderId, body) });
      case "downloadPdf":
        return json_({ ok: true, base64: downloadPdf_(body.fileId) });
      case "deletePdf":
        deletePdf_(body.fileId);
        return json_({ ok: true });
      default:
        return json_({ ok: false, message: "Unknown action" });
    }
  } catch (err) {
    return json_({ ok: false, message: String(err) });
  }
}

function doGet() {
  return json_({ ok: true, message: "Travel Drive bridge is running" });
}

function getOrCreateFolder_(parent, name) {
  const it = parent.getFoldersByName(name);
  if (it.hasNext()) return it.next();
  return parent.createFolder(name);
}

function dataFolder_(rootId) {
  const root = DriveApp.getFolderById(rootId);
  const travel = getOrCreateFolder_(root, "Travel Management");
  getOrCreateFolder_(travel, "Invoices");
  return getOrCreateFolder_(travel, "Data");
}

function invoiceFolder_(rootId, year, monthName) {
  const root = DriveApp.getFolderById(rootId);
  const travel = getOrCreateFolder_(root, "Travel Management");
  const invoices = getOrCreateFolder_(travel, "Invoices");
  const yearFolder = getOrCreateFolder_(invoices, String(year));
  return getOrCreateFolder_(yearFolder, monthName);
}

function readData_(rootId) {
  const folder = dataFolder_(rootId);
  const files = folder.getFilesByName("app-data.json");
  if (!files.hasNext()) {
    return { users: [], travelRecords: [], invoiceCounters: {}, places: [] };
  }
  const text = files.next().getBlob().getDataAsString();
  if (!text) return { users: [], travelRecords: [], invoiceCounters: {}, places: [] };
  return JSON.parse(text);
}

function writeData_(rootId, data) {
  const folder = dataFolder_(rootId);
  const files = folder.getFilesByName("app-data.json");
  const content = JSON.stringify(data, null, 2);
  if (files.hasNext()) {
    files.next().setContent(content);
    return;
  }
  folder.createFile("app-data.json", content, MimeType.PLAIN_TEXT);
}

function uploadPdf_(rootId, body) {
  const folder = invoiceFolder_(rootId, body.year, body.monthName);
  const bytes = Utilities.base64Decode(body.base64);
  const blob = Utilities.newBlob(bytes, "application/pdf", body.filename);
  const existing = folder.getFilesByName(body.filename);
  while (existing.hasNext()) {
    existing.next().setTrashed(true);
  }
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return {
    id: file.getId(),
    webViewLink: "https://drive.google.com/file/d/" + file.getId() + "/view",
  };
}

function downloadPdf_(fileId) {
  const file = DriveApp.getFileById(fileId);
  return Utilities.base64Encode(file.getBlob().getBytes());
}

function deletePdf_(fileId) {
  DriveApp.getFileById(fileId).setTrashed(true);
}

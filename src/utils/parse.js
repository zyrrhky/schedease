import { nextId } from "./ids";

function splitTokens(line) {
  if (!line) return [];
  if (line.indexOf("\t") >= 0) return line.split("\t").map((s) => s.trim()).filter(Boolean);
  return line.split(/\s+/).map((s) => s.trim()).filter(Boolean);
}

function lineHasPureNumberToken(line) {
  if (!line) return false;
  return splitTokens(line).some((t) => /^\d+$/.test(t));
}

export function parsePlain(text) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.replace(/\u00A0/g, " ").trim())
    .filter((l) => l.length > 0);

  const rows = [];
  for (let i = 0; i < lines.length; ) {
    const line1 = lines[i];
    const tokens1 = splitTokens(line1);
    const number = tokens1[0] || "";
    const offering = tokens1[1] || "";
    const subject_code = tokens1[2] || "";
    let credited_units = "";
    let section = "";
    let subject_title = "";
    if (tokens1.length >= 5) {
      credited_units = tokens1[tokens1.length - 2];
      section = tokens1[tokens1.length - 1];
      subject_title = tokens1.slice(3, tokens1.length - 2).join(" ");
    } else {
      subject_title = tokens1.slice(3).join(" ");
    }
    i++;

    const scheduleLines = [];
    while (i < lines.length && !lineHasPureNumberToken(lines[i]) && !/^\s*$/.test(lines[i])) {
      scheduleLines.push(lines[i].trim());
      i++;
      if (i < lines.length) {
        const peekTokens = splitTokens(lines[i]);
        if (
          peekTokens.length >= 3 &&
          /^\d+$/.test(peekTokens[0]) &&
          /^[A-Za-z]{1,}\d{1,}/.test(peekTokens[2])
        ) {
          break;
        }
      }
    }

    let room = "";
    let total_slots = "";
    let enrolled = "";
    let assessed = "";
    let is_closed = "";

    if (i < lines.length && lineHasPureNumberToken(lines[i])) {
      const parts = splitTokens(lines[i]);
      const numericTokens = parts.filter((p) => /^\d+$/.test(p));
      if (numericTokens.length >= 1) {
        total_slots = numericTokens[0] ?? "";
        enrolled = numericTokens[1] ?? "";
        assessed = numericTokens[2] ?? "";
      }
      const nonNumParts = parts.filter((p) => !/^\d+$/.test(p));
      if (nonNumParts.length) {
        const last = nonNumParts[nonNumParts.length - 1];
        if (/^(yes|no|y|n|true|false)$/i.test(last)) {
          is_closed = last;
          nonNumParts.pop();
        }
        room = nonNumParts.join(" ");
      }
      i++;
    }

    const schedule = scheduleLines.join(" / ");

    rows.push([
      number,
      offering,
      subject_code,
      subject_title,
      credited_units,
      section,
      schedule,
      room,
      total_slots,
      enrolled,
      assessed,
      is_closed,
    ]);
  }

  return rows;
}

export function normalizeRecord(arr) {
  const [
    number,
    offering_dept,
    subject_code,
    subject_title,
    credited_units,
    section,
    schedule,
    room,
    total_slots,
    enrolled,
    assessed,
    is_closed,
  ] = arr;

  const toNum = (v) => {
    if (v == null || v === "") return null;
    const n = Number(String(v).replace(/[^0-9.\-]/g, ""));
    return Number.isFinite(n) ? n : null;
  };

  let closed = is_closed;
  if (typeof closed === "string") {
    const s = closed.trim().toLowerCase();
    if (["yes", "y", "true", "closed"].includes(s)) closed = true;
    else if (["no", "n", "false", "open"].includes(s)) closed = false;
  }

  return {
    data_id: nextId("data"),
    number: number ?? "",
    offering_dept: offering_dept ?? "",
    subject_code: subject_code ?? "",
    subject_title: subject_title ?? "",
    credited_units: toNum(credited_units),
    section: section ?? "",
    schedule: schedule ?? "",
    room: room ?? "",
    total_slots: toNum(total_slots),
    enrolled: toNum(enrolled),
    assessed: toNum(assessed),
    is_closed: closed ?? false,
  };
}

export function splitCSVLine(line) {
  const out = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQ && line[i + 1] === '"') {
        cur += '"'; i++;
      } else inQ = !inQ;
    } else if (ch === "," && !inQ) {
      out.push(cur); cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out;
}

export function parseCSV(text = "") {
  const lines = text.replace(/\r/g, "").split("\n").filter(Boolean);
  if (!lines.length) return [];
  const headers = splitCSVLine(lines[0]).map((h) => h.trim());
  return lines.slice(1).map((ln) => {
    const cells = splitCSVLine(ln);
    const obj = {};
    headers.forEach((h, i) => (obj[h] = cells[i] ?? ""));
    return obj;
  });
}

export function parseScheduleString(raw = "") {
  const s = String(raw).trim().replace(/\s+/g, " ");
  const m = s.match(/^([A-Za-z]{1,2})\s+(\d{1,2}:\d{2}\s*[ap]m)\s*-\s*(\d{1,2}:\d{2}\s*[ap]m)\s*(.*)$/i);
  if (!m) return null;
  const [, day, start12, end12, tail] = m;
  const room = tail?.trim() || "";
  return {
    day: normalizeDay(day),
    start: to24h(start12),
    end: to24h(end12),
    room
  };
}

function normalizeDay(d) {
  const x = d.toUpperCase();
  if (x === "TH") return "TH";
  if (x === "SU" || x === "SUN") return "SU";
  const map = { M: "M", T: "T", W: "W", F: "F", S: "S" };
  return map[x] || x[0] || "M";
}

function to24h(t) {
  const m = String(t).trim().toUpperCase().match(/^(\d{1,2}):(\d{2})\s*([AP])M$/);
  if (!m) return t;
  let [, hh, mm, ap] = m;
  let h = parseInt(hh, 10);
  if (ap === "P" && h !== 12) h += 12;
  if (ap === "A" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${mm}`;
}

export function normalizeRow(raw = {}, ensureUniqueId = true) {
  const kmap = {};
  Object.keys(raw).forEach((k) => (kmap[k.trim().toLowerCase()] = k));
  const read = (names, def = "") => {
    for (const n of names) {
      const k = kmap[n.toLowerCase()];
      if (k !== undefined && raw[k] != null && String(raw[k]).trim() !== "") return raw[k];
    }
    return def;
  };
  const row = {
    data_id: read(["data_id", "id", "data id"]),
    number: read(["#", "no", "number", "index"]) || undefined,
    offering_dept: read(["offering dept", "offering_dept", "offering", "dept", "department"]),
    subject_code: read(["subject", "subject_code", "subject code", "code"]),
    subject_title: read(["subject title", "subject_title", "title"]),
    credited_units: read(["credited units", "credited_units", "credits", "credited"]),
    section: read(["section", "sect"]),
    schedule: read(["schedule", "schedules", "time", "when"]),
    room: read(["room", "rooms", "venue"]),
    total_slots: read(["total slots", "total_slots", "slots"]),
    enrolled: read(["enrolled", "enrollee", "enrollment", "enrol"]),
    assessed: read(["assessed"]),
    is_closed: read(["is closed", "is_closed", "closed", "status"])
  };
  const toNum = (v) => {
    if (v == null || v === "") return null;
    const n = Number(String(v).replace(/[^0-9.\-]/g, ""));
    return Number.isFinite(n) ? n : null;
  };
  row.credited_units = toNum(row.credited_units) ?? row.credited_units;
  row.total_slots = toNum(row.total_slots);
  row.enrolled = toNum(row.enrolled);
  row.assessed = toNum(row.assessed);
  if (typeof row.is_closed === "string") {
    const s = row.is_closed.trim().toLowerCase();
    if (["yes", "y", "true", "closed"].includes(s)) row.is_closed = true;
    else if (["no", "n", "false", "open"].includes(s)) row.is_closed = false;
  }
  if (!row.data_id || !String(row.data_id).trim()) row.data_id = nextId("data");
  if (!ensureUniqueId) return row;
  return row;
}

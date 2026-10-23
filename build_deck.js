const pptxgen = require("pptxgenjs");
const { applyTheme } = require("/mnt/skills/public/pptx/scripts/apply_theme.js");

// ===== 테마 =====
const THEME = {
  name: "CyberSecLab", headFontFace: "Arial", bodyFontFace: "Calibri",
  colors: {
    dk1: "0F1420", lt1: "FFFFFF", dk2: "1C2436", lt2: "E6EBF5",
    accent1: "5EEAD4", accent2: "818CF8", accent3: "F87171",
    accent4: "4ADE80", accent5: "FBBF24", accent6: "94A3B8",
    hlink: "5EEAD4", folHlink: "818CF8",
  },
};
const BG = "0F1420", CARD = "1C2436", CARD2 = "232C42", LINE = "2E3850";
const TEXT = "E6EBF5", MUTED = "94A3B8", TEAL = "5EEAD4", INDIGO = "818CF8";
const DANGER = "F87171", SAFE = "4ADE80", WARN = "FBBF24";
const MONO = "Consolas";

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.author = "보안 특강";
pres.title = "웹 해킹 체험 특강 (3시간)";

pres.defineSlideMaster({
  title: "DARK", background: { color: BG },
  objects: [
    { text: { text: "웹 해킹 체험 · 보안 특강", options: {
      x: 0.5, y: 7.05, w: 8, h: 0.3, fontSize: 9, color: MUTED, align: "left", fontFace: "Calibri" } } },
  ],
  slideNumber: { x: 12.5, y: 7.05, w: 0.5, h: 0.3, fontSize: 9, color: MUTED, fontFace: "Calibri" },
});

// ===== 헬퍼 =====
function card(slide, x, y, w, h, opts = {}) {
  slide.addShape(pres.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.08,
    fill: { color: opts.fill || CARD }, line: { color: opts.line || LINE, width: 1 },
    shadow: { type: "outer", color: "000000", opacity: 0.35, blur: 8, offset: 3, angle: 90 },
  });
}
function tag(slide, x, y, text, color) {
  const w = Math.max(0.9, text.length * 0.115 + 0.45);
  slide.addShape(pres.ShapeType.roundRect, { x, y, w, h: 0.34, rectRadius: 0.17,
    fill: { color: BG }, line: { color, width: 1 } });
  slide.addText(text, { x, y, w, h: 0.34, fontSize: 11, bold: true, color,
    align: "center", valign: "middle", fontFace: MONO, isTextBox: true, margin: 0 });
}
function title(slide, text, color = TEXT) {
  slide.addText(text, { x: 0.6, y: 0.45, w: 12.1, h: 0.8, fontSize: 31, bold: true,
    color, fontFace: "Arial", isTextBox: true, margin: 0 });
}
function head(slide, tagText, tcolor, titleText) {
  tag(slide, 0.6, 0.5, tagText, tcolor);
  slide.addText(titleText, { x: 0.6, y: 0.95, w: 12.1, h: 0.7, fontSize: 28, bold: true,
    color: TEXT, fontFace: "Arial", isTextBox: true, margin: 0 });
}
function subtitle(slide, text, y = 1.25) {
  slide.addText(text, { x: 0.6, y, w: 12.1, h: 0.5, fontSize: 16, color: MUTED,
    fontFace: "Calibri", isTextBox: true, margin: 0 });
}
function codeBlock(slide, x, y, w, h, lines, opts = {}) {
  card(slide, x, y, w, h, { fill: "0A0E17", line: opts.line || LINE });
  slide.addText(lines, { x: x + 0.25, y: y + 0.2, w: w - 0.5, h: h - 0.4,
    fontSize: opts.fontSize || 13, fontFace: MONO, color: opts.color || TEXT,
    lineSpacingMultiple: 1.25, valign: "top", isTextBox: true, margin: 0 });
}
function bullets(slide, x, y, w, h, items, opts = {}) {
  slide.addText(items.map((b, i) => ({
    text: b, options: { bullet: { characterCode: "2022", indent: 15 }, color: opts.color || TEXT,
      fontSize: opts.fontSize || 14.5, breakLine: i !== items.length - 1, paraSpaceAfter: opts.gap || 9 } })),
    { x, y, w, h, fontFace: "Calibri", valign: "top", isTextBox: true, margin: 0 });
}
function divider(part, tagText, name, sub, color) {
  const sl = pres.addSlide({ masterName: "DARK" });
  sl.addText(part, { x: 0.6, y: 1.7, w: 12, h: 2.2, fontSize: 150, bold: true,
    color: CARD2, fontFace: "Arial", isTextBox: true, margin: 0 });
  tag(sl, 0.7, 2.75, tagText, color);
  sl.addText(name, { x: 0.65, y: 3.2, w: 12, h: 1.0, fontSize: 46, bold: true,
    color: TEXT, fontFace: "Arial", isTextBox: true, margin: 0 });
  sl.addText(sub, { x: 0.7, y: 4.35, w: 11.5, h: 0.7, fontSize: 18, color: MUTED,
    fontFace: "Calibri", isTextBox: true, margin: 0 });
  return sl;
}
// N개 카드(헤더+불릿) 가로 배치
function columnsSlide({ tagText, color, titleText, sub, cols, notes }) {
  const sl = pres.addSlide({ masterName: "DARK" });
  head(sl, tagText, color, titleText);
  if (sub) subtitle(sl, sub, 1.65);
  const n = cols.length;
  const gap = 0.3, totalW = 12.1;
  const w = (totalW - gap * (n - 1)) / n;
  let x = 0.6;
  const y = sub ? 2.35 : 1.9, h = sub ? 4.05 : 4.5;
  cols.forEach((c) => {
    card(sl, x, y, w, h, { line: c.color || LINE });
    sl.addText(c.h, { x: x + 0.25, y: y + 0.22, w: w - 0.5, h: 0.55, fontSize: 17, bold: true,
      color: c.color || TEXT, fontFace: "Arial", isTextBox: true, margin: 0 });
    if (c.tagline) sl.addText(c.tagline, { x: x + 0.25, y: y + 0.72, w: w - 0.5, h: 0.4, fontSize: 12.5,
      italic: true, color: MUTED, fontFace: "Calibri", isTextBox: true, margin: 0 });
    bullets(sl, x + 0.3, y + (c.tagline ? 1.2 : 0.8), w - 0.55, h - 1.4, c.items, { fontSize: 13.5, gap: 9 });
    x += w + gap;
  });
  if (notes) sl.addNotes(notes);
  return sl;
}
// 실제 사례 슬라이드
function caseStudy({ tagText, color, name, when, what, statBig, statLabel, lesson, notes }) {
  const sl = pres.addSlide({ masterName: "DARK" });
  head(sl, tagText, color, "실제로 일어난 일 — " + name);
  subtitle(sl, when, 1.65);
  card(sl, 0.6, 2.35, 7.4, 3.0, { line: color });
  sl.addText("무슨 일이 있었나", { x: 0.9, y: 2.55, w: 6.8, h: 0.45, fontSize: 15, bold: true, color, fontFace: "Arial", isTextBox: true, margin: 0 });
  sl.addText(what, { x: 0.9, y: 3.05, w: 6.9, h: 2.2, fontSize: 14.5, color: TEXT, fontFace: "Calibri", lineSpacingMultiple: 1.3, valign: "top", isTextBox: true, margin: 0 });
  card(sl, 8.2, 2.35, 4.5, 3.0, { fill: CARD2 });
  sl.addText(statBig, { x: 8.3, y: 3.0, w: 4.3, h: 1.0, fontSize: 46, bold: true, color, align: "center", fontFace: "Arial", isTextBox: true, margin: 0 });
  sl.addText(statLabel, { x: 8.3, y: 4.0, w: 4.3, h: 1.0, fontSize: 14, color: MUTED, align: "center", fontFace: "Calibri", lineSpacingMultiple: 1.2, valign: "top", isTextBox: true, margin: 0 });
  card(sl, 0.6, 5.55, 12.1, 1.0, { fill: CARD2, line: WARN });
  sl.addText("💡 교훈", { x: 0.9, y: 5.68, w: 1.6, h: 0.75, fontSize: 14, bold: true, color: WARN, valign: "middle", fontFace: "Arial", isTextBox: true, margin: 0 });
  sl.addText(lesson, { x: 2.3, y: 5.6, w: 10.2, h: 0.9, fontSize: 14, color: TEXT, valign: "middle", fontFace: "Calibri", isTextBox: true, margin: 0 });
  if (notes) sl.addNotes(notes);
  return sl;
}
// 실습 미션 슬라이드
function labMission({ tagText, color, titleText, file, steps, payload, expect, flag, notes }) {
  const sl = pres.addSlide({ masterName: "DARK" });
  head(sl, tagText, color, titleText);
  sl.addText([
    { text: "실습 파일  ", options: { color: MUTED } },
    { text: file, options: { bold: true, color, fontFace: MONO } },
  ], { x: 0.6, y: 1.65, w: 12, h: 0.4, fontSize: 14, fontFace: "Calibri", isTextBox: true, margin: 0 });
  // 왼쪽: 단계
  card(sl, 0.6, 2.25, 6.3, 4.3, { line: color });
  sl.addText("이렇게 해보세요", { x: 0.9, y: 2.45, w: 5.7, h: 0.45, fontSize: 15, bold: true, color, fontFace: "Arial", isTextBox: true, margin: 0 });
  sl.addText(steps.map((t, i) => ({
    text: t, options: { color: TEXT, fontSize: 14, breakLine: true, paraSpaceAfter: 12,
      bullet: { characterCode: "2022", indent: 16 } } })),
    { x: 1.0, y: 3.0, w: 5.6, h: 3.4, fontFace: "Calibri", valign: "top", lineSpacingMultiple: 1.1, isTextBox: true, margin: 0 });
  // 오른쪽 위: payload
  codeBlock(sl, 7.1, 2.25, 5.6, 1.7, payload, { fontSize: 13, line: color });
  sl.addText("↑ 입력할 공격 문자열(payload)", { x: 7.1, y: 3.98, w: 5.6, h: 0.35, fontSize: 11.5, italic: true, color: MUTED, fontFace: "Calibri", isTextBox: true, margin: 0 });
  // 오른쪽 아래: 성공하면 + flag
  card(sl, 7.1, 4.5, 5.6, 2.05, { fill: CARD2, line: SAFE });
  sl.addText("성공하면", { x: 7.35, y: 4.68, w: 5.1, h: 0.4, fontSize: 14, bold: true, color: SAFE, fontFace: "Arial", isTextBox: true, margin: 0 });
  sl.addText(expect, { x: 7.35, y: 5.08, w: 5.1, h: 0.8, fontSize: 13, color: TEXT, fontFace: "Calibri", lineSpacingMultiple: 1.2, valign: "top", isTextBox: true, margin: 0 });
  sl.addShape(pres.ShapeType.roundRect, { x: 7.35, y: 5.95, w: 5.1, h: 0.42, rectRadius: 0.08, fill: { color: "0A0E17" }, line: { color: SAFE, width: 1, dashType: "dash" } });
  sl.addText(flag, { x: 7.35, y: 5.95, w: 5.1, h: 0.42, fontSize: 12.5, bold: true, color: SAFE, align: "center", valign: "middle", fontFace: MONO, isTextBox: true, margin: 0 });
  if (notes) sl.addNotes(notes);
  return sl;
}
// 개념 슬라이드
function conceptSlide({ tagText, color, name, sub, analogy, points, notes }) {
  const sl = pres.addSlide({ masterName: "DARK" });
  tag(sl, 0.6, 0.5, tagText, color);
  sl.addText(name, { x: 0.6, y: 0.95, w: 12, h: 0.7, fontSize: 29, bold: true, color: TEXT, fontFace: "Arial", isTextBox: true, margin: 0 });
  sl.addText(sub, { x: 0.6, y: 1.65, w: 12, h: 0.5, fontSize: 16, italic: true, color, fontFace: "Calibri", isTextBox: true, margin: 0 });
  card(sl, 0.6, 2.35, 5.7, 4.1, { line: color });
  sl.addText("🧩 쉽게 말하면", { x: 0.9, y: 2.6, w: 5.1, h: 0.45, fontSize: 15, bold: true, color, fontFace: "Arial", isTextBox: true, margin: 0 });
  sl.addText(analogy, { x: 0.9, y: 3.1, w: 5.1, h: 3.1, fontSize: 15, color: TEXT, fontFace: "Calibri", lineSpacingMultiple: 1.25, valign: "top", isTextBox: true, margin: 0 });
  card(sl, 6.6, 2.35, 6.1, 4.1);
  sl.addText("📌 핵심 포인트", { x: 6.9, y: 2.6, w: 5.5, h: 0.45, fontSize: 15, bold: true, color: TEAL, fontFace: "Arial", isTextBox: true, margin: 0 });
  bullets(sl, 6.95, 3.15, 5.5, 3.1, points, { fontSize: 14.5, gap: 10 });
  if (notes) sl.addNotes(notes);
  return sl;
}
// 방어 슬라이드 (취약/안전 코드 + 방어요약)
function defenseSlide({ tagText, color, name, vulnCode, safeCode, defenses, note, notes }) {
  const sl = pres.addSlide({ masterName: "DARK" });
  head(sl, tagText, color, name + " · 어떻게 막을까");
  if (note) subtitle(sl, note, 1.65);
  const topY = note ? 2.3 : 1.9;
  card(sl, 0.6, topY, 6.0, 2.3, { line: DANGER });
  sl.addText("🔓 취약한 코드", { x: 0.85, y: topY + 0.18, w: 5.5, h: 0.4, fontSize: 14, bold: true, color: DANGER, fontFace: "Arial", isTextBox: true, margin: 0 });
  sl.addText(vulnCode, { x: 0.85, y: topY + 0.62, w: 5.5, h: 1.5, fontSize: 12, color: "FCA5A5", fontFace: MONO, lineSpacingMultiple: 1.2, valign: "top", isTextBox: true, margin: 0 });
  card(sl, 6.7, topY, 6.0, 2.3, { line: SAFE });
  sl.addText("🔒 방어된 코드", { x: 6.95, y: topY + 0.18, w: 5.5, h: 0.4, fontSize: 14, bold: true, color: SAFE, fontFace: "Arial", isTextBox: true, margin: 0 });
  sl.addText(safeCode, { x: 6.95, y: topY + 0.62, w: 5.5, h: 1.5, fontSize: 12, color: "86EFAC", fontFace: MONO, lineSpacingMultiple: 1.2, valign: "top", isTextBox: true, margin: 0 });
  const defY = topY + 2.5;
  card(sl, 0.6, defY, 12.1, 6.5 - defY + 0.15, { fill: CARD2, line: SAFE });
  sl.addText("🛡️ 방어 요약", { x: 0.9, y: defY + 0.17, w: 11.5, h: 0.4, fontSize: 15, bold: true, color: SAFE, fontFace: "Arial", isTextBox: true, margin: 0 });
  sl.addText(defenses.map((d, i) => ({
    text: `${i + 1}.  ${d}`, options: { color: TEXT, fontSize: 14, breakLine: true, paraSpaceAfter: 7 } })),
    { x: 0.95, y: defY + 0.6, w: 11.5, h: 6.5 - defY - 0.5, fontFace: "Calibri", valign: "top", isTextBox: true, margin: 0 });
  if (notes) sl.addNotes(notes);
  return sl;
}

// =====================================================================
// 1. 타이틀
// =====================================================================
let s = pres.addSlide({ masterName: "DARK" });
s.addShape(pres.ShapeType.roundRect, { x: 0.6, y: 1.0, w: 2.3, h: 0.42, rectRadius: 0.21,
  fill: { color: "232C42" }, line: { color: INDIGO, width: 1 } });
s.addText("WHITE HACKER", { x: 0.6, y: 1.0, w: 2.3, h: 0.42, fontSize: 11, bold: true,
  color: INDIGO, align: "center", valign: "middle", fontFace: MONO, isTextBox: true, margin: 0 });
s.addText([
  { text: "해커처럼 공격하고,\n", options: { color: TEXT } },
  { text: "개발자처럼 방어하기", options: { color: TEAL } },
], { x: 0.55, y: 1.7, w: 12, h: 2.2, fontSize: 52, bold: true, fontFace: "Arial", lineSpacingMultiple: 1.05, isTextBox: true, margin: 0 });
s.addText("웹의 동작 원리부터 차근차근 — 4대 취약점을 직접 공격하고 막아보는 3시간 실습 특강",
  { x: 0.6, y: 4.0, w: 11.8, h: 0.5, fontSize: 18, color: MUTED, fontFace: "Calibri", isTextBox: true, margin: 0 });
const chips = [["WEB 기초", MUTED], ["XSS", TEAL], ["SQLi", INDIGO], ["SSRF", WARN], ["CSRF", DANGER]];
let cx = 0.6;
chips.forEach(([t, c]) => {
  const w = t.length * 0.13 + 0.6;
  s.addShape(pres.ShapeType.roundRect, { x: cx, y: 4.9, w, h: 0.55, rectRadius: 0.1, fill: { color: CARD }, line: { color: c, width: 1.5 } });
  s.addText(t, { x: cx, y: 4.9, w, h: 0.55, fontSize: 15, bold: true, color: c, align: "center", valign: "middle", fontFace: MONO, isTextBox: true, margin: 0 });
  cx += w + 0.25;
});
s.addNotes("[~3분] 인사. 오늘은 이론만 듣는 게 아니라 직접 해커가 되어 공격을 성공시키고, 그다음 개발자가 되어 똑같은 공격을 막습니다. 3시간 동안 기초→공격→실습→방어를 반복합니다.");

// =====================================================================
// 2. 오늘의 수업 (아젠다 + 시간)
// =====================================================================
s = pres.addSlide({ masterName: "DARK" });
title(s, "오늘의 수업");
const chapters = [
  ["PART 0", "웹은 어떻게 동작할까", "요청·응답, URL, 개발자도구, DB, 쿠키 — 공격을 이해하기 위한 토대", "약 45분", MUTED],
  ["PART 1", "XSS", "남이 심어둔 코드가 내 브라우저에서 실행된다", "약 30분", TEAL],
  ["PART 2", "SQL 인젝션", "비밀번호 없이 로그인을 뚫는다", "약 30분", INDIGO],
  ["", "쉬는 시간", "", "10분", WARN],
  ["PART 3", "SSRF", "서버를 속여 내부 비밀을 훔쳐온다", "약 25분", WARN],
  ["PART 4", "CSRF", "클릭 한 번으로 나도 모르게 송금된다", "약 25분", DANGER],
  ["정리", "복습 · 윤리 · 더 배우기", "오늘 배운 것을 묶고, 다음 단계를 안내", "약 15분", TEAL],
];
let ay = 1.5;
chapters.forEach(([p, h, d, t, c]) => {
  const isBreak = h === "쉬는 시간";
  card(s, 0.6, ay, 12.1, isBreak ? 0.5 : 0.72, { fill: isBreak ? BG : CARD, line: isBreak ? WARN : LINE });
  if (p) s.addText(p, { x: 0.85, y: ay, w: 1.5, h: isBreak ? 0.5 : 0.72, fontSize: 13, bold: true, color: c, fontFace: MONO, valign: "middle", isTextBox: true, margin: 0 });
  s.addText(h, { x: 2.5, y: ay, w: 3.4, h: isBreak ? 0.5 : 0.72, fontSize: isBreak ? 14 : 17, bold: true, color: isBreak ? WARN : TEXT, fontFace: "Arial", valign: "middle", isTextBox: true, margin: 0 });
  if (d) s.addText(d, { x: 5.9, y: ay, w: 5.1, h: 0.72, fontSize: 12.5, color: MUTED, fontFace: "Calibri", valign: "middle", isTextBox: true, margin: 0 });
  s.addText(t, { x: 11.0, y: ay, w: 1.5, h: isBreak ? 0.5 : 0.72, fontSize: 12.5, bold: true, color: c, fontFace: MONO, align: "right", valign: "middle", isTextBox: true, margin: 0 });
  ay += isBreak ? 0.62 : 0.84;
});
s.addNotes("총 3시간. 각 PART는 '개념→실제 사례→직접 실습→방어' 순서. 실습 시간을 넉넉히 잡았으니 학생들이 직접 손으로 해보게 한다.");

// =====================================================================
// 3. 수업 진행 방식
// =====================================================================
s = pres.addSlide({ masterName: "DARK" });
title(s, "이 수업은 이렇게 진행돼요");
subtitle(s, "모든 취약점을 같은 4단계로 반복합니다. 패턴에 익숙해지면 새로운 취약점도 스스로 분석할 수 있어요.", 1.3);
const flow4 = [
  ["1", "개념", "비유로 쉽게 이해", TEAL],
  ["2", "실제 사례", "진짜 해킹 사건으로 실감", INDIGO],
  ["3", "직접 실습", "실습 사이트에서 공격 성공 (FLAG 획득)", WARN],
  ["4", "방어", "개발자가 되어 똑같은 공격을 차단", SAFE],
];
let fx = 0.6;
const fw = (12.1 - 0.3 * 3) / 4;
flow4.forEach(([n, h, d, c], i) => {
  card(s, fx, 2.3, fw, 2.6, { line: c });
  s.addText(n, { x: fx, y: 2.6, w: fw, h: 0.9, fontSize: 48, bold: true, color: c, align: "center", fontFace: MONO, isTextBox: true, margin: 0 });
  s.addText(h, { x: fx, y: 3.55, w: fw, h: 0.5, fontSize: 19, bold: true, color: TEXT, align: "center", fontFace: "Arial", isTextBox: true, margin: 0 });
  s.addText(d, { x: fx + 0.2, y: 4.1, w: fw - 0.4, h: 0.7, fontSize: 12.5, color: MUTED, align: "center", fontFace: "Calibri", isTextBox: true, margin: 0 });
  if (i < 3) s.addText("→", { x: fx + fw - 0.05, y: 2.3, w: 0.35, h: 2.6, fontSize: 22, bold: true, color: MUTED, align: "center", valign: "middle", isTextBox: true, margin: 0 });
  fx += fw + 0.3;
});
card(s, 0.6, 5.3, 12.1, 1.2, { fill: CARD2, line: TEAL });
s.addText("🧪 실습 사이트를 미리 열어두세요", { x: 0.9, y: 5.45, w: 11.5, h: 0.45, fontSize: 15, bold: true, color: TEAL, fontFace: "Arial", isTextBox: true, margin: 0 });
s.addText([
  { text: "강사가 알려주는 주소로 접속 → 각 실습마다 ", options: { color: TEXT } },
  { text: "FLAG{...}", options: { bold: true, color: SAFE, fontFace: MONO } },
  { text: " 를 찾아 CTF 페이지에 제출합니다. 6개 모두 찾으면 오늘의 화이트해커 인증!", options: { color: TEXT } },
], { x: 0.9, y: 5.9, w: 11.5, h: 0.5, fontSize: 14, fontFace: "Calibri", isTextBox: true, margin: 0 });
s.addNotes("[~3분] 수업의 리듬을 미리 알려주면 학생들이 따라오기 쉽다. 지금 실습 사이트 접속을 다 같이 해두면 좋다.");

// 3-B. 미니 CTF 안내
s = pres.addSlide({ masterName: "DARK" });
head(s, "수업 진행 · CTF", TEAL, "오늘의 미션 — 미니 CTF 🚩");
subtitle(s, "공격에 성공해 찾은 FLAG를 'CTF 페이지'에 제출하세요. 점수와 시간이 기록됩니다.", 1.65);
const ctfChals = [
  ["XSS", "100pt", "★☆☆", TEAL], ["SQLi", "150pt", "★★☆", INDIGO],
  ["SSRF", "200pt", "★★★", WARN], ["CSRF", "200pt", "★★★", DANGER],
  ["보너스·소스 정찰", "120pt", "★★☆", SAFE], ["보너스·콘솔", "80pt", "★☆☆", SAFE],
];
ctfChals.forEach(([n, p, d, c], i) => {
  const col = i % 3, row = Math.floor(i / 3);
  const x = 0.6 + col * 4.1, y = 2.45 + row * 1.35;
  card(s, x, y, 3.9, 1.15, { line: c });
  s.addText(n, { x: x + 0.25, y: y + 0.18, w: 2.6, h: 0.5, fontSize: 15, bold: true, color: c, fontFace: "Arial", isTextBox: true, margin: 0 });
  s.addText(p, { x: x + 2.6, y: y + 0.18, w: 1.1, h: 0.5, fontSize: 14, bold: true, color: WARN, align: "right", fontFace: MONO, isTextBox: true, margin: 0 });
  s.addText("난이도 " + d, { x: x + 0.25, y: y + 0.65, w: 3.4, h: 0.4, fontSize: 12, color: MUTED, fontFace: "Calibri", isTextBox: true, margin: 0 });
});
card(s, 0.6, 5.55, 12.1, 1.0, { fill: CARD2, line: TEAL });
s.addText([
  { text: "기본 4문제", options: { bold: true, color: TEAL } },
  { text: "는 실습에서 공격 성공 시 플래그가 나오고, ", options: { color: TEXT } },
  { text: "보너스 2문제", options: { bold: true, color: SAFE } },
  { text: "는 개발자도구(F12)로 직접 찾습니다. 먼저 6개 다 찾거나, 가장 빠른 사람이 승자!", options: { color: TEXT } },
], { x: 0.9, y: 5.75, w: 11.5, h: 0.65, fontSize: 14, fontFace: "Calibri", valign: "middle", isTextBox: true, margin: 0 });
s.addNotes("[~2분] CTF는 시간이 남든 모자라든 자연스럽게 흡수되는 장치. 보너스 2개(소스 정찰·콘솔)는 0-7 개발자도구 수업과 직접 연결된다. 공유 순위표는 없으니(서버 없음) '먼저 6개' 또는 '최단 시간'으로 교실에서 집계.");

// =====================================================================
// PART 0
// =====================================================================
divider("0", "PART 0 · FOUNDATION", "웹은 어떻게 동작할까", "공격을 배우기 전에, 웹이 돌아가는 원리부터 천천히.", MUTED)
  .addNotes("[여기부터 ~45분] 기초. 질문을 많이 받으며 천천히. 이 토대가 뒤의 모든 공격을 이해하는 열쇠.");

// 0-1 요청/응답
s = pres.addSlide({ masterName: "DARK" });
head(s, "0-1 · 요청과 응답", MUTED, "웹사이트를 연다는 것 = 편지를 주고받는 것");
subtitle(s, "주소창에 youtube.com 을 치면, 사실은 이런 대화가 오갑니다.", 1.7);
const reqflow = [
  ["나(브라우저)", "\"youtube.com 페이지 좀 주세요!\"", "요청(Request)을 편지로 보냄", TEAL],
  ["서버", "\"여기 있어요\" + HTML 코드 한 뭉치", "응답(Response)을 답장으로 보냄", INDIGO],
  ["나(브라우저)", "받은 HTML을 해석해 화면에 그림", "우리가 보는 '화면'이 완성됨", SAFE],
];
let ry = 2.45;
reqflow.forEach(([who, say, what, c], i) => {
  card(s, 0.6, ry, 12.1, 1.15, { line: c });
  s.addText(`${i + 1}`, { x: 0.9, y: ry + 0.3, w: 0.55, h: 0.55, fontSize: 20, bold: true, color: BG, fill: { color: c }, align: "center", valign: "middle", fontFace: MONO, isTextBox: true, margin: 0 });
  s.addText(who, { x: 1.7, y: ry + 0.17, w: 2.6, h: 0.8, fontSize: 15, bold: true, color: c, valign: "middle", fontFace: "Arial", isTextBox: true, margin: 0 });
  s.addText(say, { x: 4.3, y: ry + 0.17, w: 5.2, h: 0.8, fontSize: 14, color: TEXT, valign: "middle", fontFace: "Calibri", isTextBox: true, margin: 0 });
  s.addText(what, { x: 9.6, y: ry + 0.17, w: 2.9, h: 0.8, fontSize: 12.5, color: MUTED, valign: "middle", fontFace: "Calibri", isTextBox: true, margin: 0 });
  ry += 1.3;
});
s.addNotes("가장 중요한 한 가지: 웹은 전부 '요청 → 응답'의 반복. 해킹은 대부분 이 '요청'을 조작하는 일이다.");

// 0-2 클라이언트/서버
s = pres.addSlide({ masterName: "DARK" });
head(s, "0-2 · 클라이언트 vs 서버", MUTED, "누가 '클라이언트'이고 누가 '서버'일까");
card(s, 0.6, 1.85, 5.95, 4.55, { line: TEAL });
s.addText("🧑‍💻 클라이언트", { x: 0.6, y: 2.1, w: 5.95, h: 0.55, fontSize: 22, bold: true, color: TEAL, align: "center", fontFace: "Arial", isTextBox: true, margin: 0 });
s.addText("= 내 컴퓨터의 브라우저", { x: 0.6, y: 2.65, w: 5.95, h: 0.4, fontSize: 14, color: MUTED, align: "center", fontFace: "Calibri", isTextBox: true, margin: 0 });
bullets(s, 1.0, 3.35, 5.2, 2.8, ["화면을 그리고 보여주는 쪽", "크롬·사파리·엣지 같은 브라우저", "HTML/CSS/JS를 '실행'하는 곳", "사용자(여러분)가 직접 만지는 곳"], { fontSize: 15, gap: 11 });
card(s, 6.75, 1.85, 5.95, 4.55, { line: INDIGO });
s.addText("🖥️ 서버", { x: 6.75, y: 2.1, w: 5.95, h: 0.55, fontSize: 22, bold: true, color: INDIGO, align: "center", fontFace: "Arial", isTextBox: true, margin: 0 });
s.addText("= 어딘가에 있는 강력한 컴퓨터", { x: 6.75, y: 2.65, w: 5.95, h: 0.4, fontSize: 14, color: MUTED, align: "center", fontFace: "Calibri", isTextBox: true, margin: 0 });
bullets(s, 7.15, 3.35, 5.2, 2.8, ["요청을 받아 처리하는 쪽", "데이터베이스(DB)를 품고 있음", "로그인·결제 등 '진짜 중요한 일' 담당", "사용자가 직접 볼 수 없는 곳"], { fontSize: 15, gap: 11 });
s.addNotes("보안이 진짜 중요한 건 서버. 하지만 공격은 클라이언트가 보낸 요청으로 들어온다. XSS만 예외로 피해자 '브라우저'를 노린다.");

// 0-3 HTTP 요청
s = pres.addSlide({ masterName: "DARK" });
head(s, "0-3 · 요청의 생김새", MUTED, "브라우저가 보내는 '편지'를 열어보면");
subtitle(s, "로그인 버튼을 누르면 브라우저는 서버에 이런 요청을 보냅니다.", 1.7);
codeBlock(s, 0.6, 2.35, 7.3, 3.1, [
  { text: "POST /login HTTP/1.1", options: { color: TEAL, breakLine: true } },
  { text: "Host: school.com", options: { color: TEXT, breakLine: true } },
  { text: "Cookie: session=abc123xyz", options: { color: WARN, breakLine: true } },
  { text: "", options: { breakLine: true } },
  { text: "id=admin&pw=1234", options: { color: DANGER, breakLine: true } },
], { fontSize: 15 });
const parts03 = [
  ["POST /login", "무엇을 · 어디에 (메서드 · 경로)", TEAL],
  ["Cookie:", "내 로그인 출입증 (자동으로 붙음)", WARN],
  ["id=admin&pw=1234", "내가 입력한 값 = 입력(input)", DANGER],
];
let py03 = 2.35;
parts03.forEach(([code, desc, c]) => {
  card(s, 8.1, py03, 4.6, 0.95, { line: c });
  s.addText(code, { x: 8.35, y: py03 + 0.13, w: 4.1, h: 0.4, fontSize: 13, bold: true, color: c, fontFace: MONO, isTextBox: true, margin: 0 });
  s.addText(desc, { x: 8.35, y: py03 + 0.5, w: 4.1, h: 0.4, fontSize: 12, color: MUTED, fontFace: "Calibri", isTextBox: true, margin: 0 });
  py03 += 1.07;
});
card(s, 0.6, 5.65, 12.1, 0.85, { fill: CARD2, line: DANGER });
s.addText([
  { text: "기억하세요 — ", options: { bold: true, color: DANGER } },
  { text: "빨간 부분(입력)과 노란 부분(쿠키)은 ", options: { color: TEXT } },
  { text: "사용자가 바꿔서 보낼 수 있습니다.", options: { bold: true, color: TEXT } },
  { text: " 바로 여기서 공격이 시작돼요.", options: { color: MUTED } },
], { x: 0.9, y: 5.78, w: 11.5, h: 0.6, fontSize: 15, fontFace: "Calibri", valign: "middle", isTextBox: true, margin: 0 });
s.addNotes("PART 0의 핵심 복선. 입력(빨강)=SQLi·XSS, 쿠키(노랑)=CSRF.");

// 0-4 GET vs POST
columnsSlide({
  tagText: "0-4 · 메서드", color: MUTED, titleText: "요청에도 종류가 있다 — GET과 POST",
  sub: "'무엇을 하려는 요청인지' 알려주는 꼬리표. 공격 지점을 찾을 때 중요해요.",
  cols: [
    { h: "GET", color: TEAL, tagline: "가져다 줘 (조회)", items: ["페이지·검색 결과를 '읽어올' 때", "보내는 값이 주소(URL) 뒤에 붙음", "예: /search?q=안녕", "주소만 알면 누구나 같은 요청 가능 → CSRF·SSRF와 관련"] },
    { h: "POST", color: INDIGO, tagline: "이걸 처리해 줘 (변경)", items: ["로그인·글쓰기·송금 등 '바꿀' 때", "보내는 값이 요청 본문(body)에 담김", "예: id=admin&pw=1234", "중요한 작업은 보통 POST로"] },
  ],
  notes: "GET=읽기, POST=쓰기/변경 정도로만 이해시키면 충분. '송금 같은 중요한 일이 GET으로 되면 위험하다'를 CSRF 복선으로 심어둔다.",
});

// 0-5 URL
s = pres.addSlide({ masterName: "DARK" });
head(s, "0-5 · URL 구조", MUTED, "주소(URL)도 뜯어보면 여러 부분으로 나뉜다");
card(s, 0.6, 1.95, 12.1, 1.15, { fill: "0A0E17" });
s.addText([
  { text: "https://", options: { color: SAFE } },
  { text: "school.com", options: { color: TEAL } },
  { text: "/search", options: { color: INDIGO } },
  { text: "?q=안녕", options: { color: DANGER } },
], { x: 0.9, y: 2.15, w: 11.5, h: 0.7, fontSize: 26, bold: true, fontFace: MONO, valign: "middle", isTextBox: true, margin: 0 });
const urlparts = [
  ["https://", "프로토콜", "암호화해서 주고받겠다는 약속", SAFE],
  ["school.com", "도메인", "어느 서버에 갈지 (집 주소)", TEAL],
  ["/search", "경로", "그 서버의 어느 기능인지", INDIGO],
  ["?q=안녕", "쿼리", "내가 넘기는 값 = 입력!", DANGER],
];
let ux = 0.6;
urlparts.forEach(([code, name, desc, c]) => {
  card(s, ux, 3.4, 2.92, 2.5, { line: c });
  s.addText(code, { x: ux + 0.15, y: 3.6, w: 2.6, h: 0.5, fontSize: 14, bold: true, color: c, fontFace: MONO, align: "center", valign: "middle", isTextBox: true, margin: 0 });
  s.addText(name, { x: ux + 0.15, y: 4.15, w: 2.6, h: 0.45, fontSize: 17, bold: true, color: TEXT, align: "center", fontFace: "Arial", isTextBox: true, margin: 0 });
  s.addText(desc, { x: ux + 0.15, y: 4.65, w: 2.6, h: 1.1, fontSize: 13, color: MUTED, align: "center", fontFace: "Calibri", valign: "top", isTextBox: true, margin: 0 });
  ux += 3.06;
});
s.addText("빨간 '쿼리'처럼, 주소 안에도 내가 넣은 값이 들어갑니다. → SSRF·XSS에서 이걸 악용해요.",
  { x: 0.6, y: 6.1, w: 12, h: 0.4, fontSize: 14, italic: true, color: MUTED, fontFace: "Calibri", isTextBox: true, margin: 0 });
s.addNotes("쿼리스트링이 사용자 입력이라는 점 강조. 반사형 XSS, SSRF의 URL 입력으로 연결.");

// 0-6 프론트엔드
s = pres.addSlide({ masterName: "DARK" });
head(s, "0-6 · 프론트엔드", TEAL, "브라우저는 받은 글을 '코드'로 실행한다");
subtitle(s, "화면을 만드는 3가지 — 특히 JS는 '진짜 실행되는 명령'이에요.", 1.7);
const fe = [
  ["HTML", "뼈대 · 내용", "제목, 글, 버튼 같은 '구조'를 만든다", TEAL],
  ["CSS", "꾸미기 · 디자인", "색·글꼴·배치 등 '보이는 모습'을 입힌다", INDIGO],
  ["JavaScript", "동작 · 명령", "클릭 반응 등 '실제로 실행되는 코드'", DANGER],
];
let fex = 0.6;
fe.forEach(([n, r, d, c]) => {
  card(s, fex, 2.45, 3.9, 2.0, { line: c });
  s.addText(n, { x: fex, y: 2.65, w: 3.9, h: 0.5, fontSize: 20, bold: true, color: c, align: "center", fontFace: MONO, isTextBox: true, margin: 0 });
  s.addText(r, { x: fex, y: 3.15, w: 3.9, h: 0.4, fontSize: 14, bold: true, color: TEXT, align: "center", fontFace: "Arial", isTextBox: true, margin: 0 });
  s.addText(d, { x: fex + 0.25, y: 3.6, w: 3.4, h: 0.8, fontSize: 13, color: MUTED, align: "center", fontFace: "Calibri", isTextBox: true, margin: 0 });
  fex += 4.1;
});
card(s, 0.6, 4.75, 12.1, 1.65, { fill: CARD2, line: WARN });
s.addText("⚠️ 그래서 생기는 문제", { x: 0.9, y: 4.92, w: 11.5, h: 0.4, fontSize: 15, bold: true, color: WARN, fontFace: "Arial", isTextBox: true, margin: 0 });
s.addText([
  { text: "브라우저는 받은 ", options: { color: TEXT } },
  { text: "<b>안녕</b>", options: { color: TEAL, fontFace: MONO } },
  { text: " 를 '굵은 글씨'로 그리고, ", options: { color: TEXT } },
  { text: "<script>...</script>", options: { color: DANGER, fontFace: MONO } },
  { text: " 를 만나면 '진짜 명령'으로 실행합니다.", options: { color: TEXT } },
], { x: 0.9, y: 5.35, w: 11.5, h: 0.5, fontSize: 15, fontFace: "Calibri", isTextBox: true, margin: 0 });
s.addText("→ 남이 쓴 글에 <script>가 숨어 있으면? 이게 바로 XSS입니다.",
  { x: 0.9, y: 5.9, w: 11.5, h: 0.4, fontSize: 14, italic: true, color: DANGER, fontFace: "Calibri", isTextBox: true, margin: 0 });
s.addNotes("XSS 직접 복선. '브라우저는 글자와 코드를 구분 못 할 수 있다'가 핵심.");

// 0-7 개발자도구 (실습형)
s = pres.addSlide({ masterName: "DARK" });
head(s, "0-7 · 실습 준비", TEAL, "개발자도구(F12) — 해커의 돋보기");
subtitle(s, "브라우저에 숨어 있는 비밀 도구. 지금 다 같이 한 번 열어봅시다!", 1.7);
card(s, 0.6, 2.35, 6.0, 4.1, { line: TEAL });
s.addText("열어보는 법", { x: 0.9, y: 2.55, w: 5.4, h: 0.45, fontSize: 15, bold: true, color: TEAL, fontFace: "Arial", isTextBox: true, margin: 0 });
bullets(s, 1.0, 3.1, 5.4, 3.1, [
  "키보드 F12 (또는 Ctrl+Shift+I / ⌘+⌥+I)",
  "마우스 오른쪽 클릭 → '검사(Inspect)'",
  "Elements 탭: 페이지의 HTML 구조가 보임",
  "Console 탭: JavaScript를 직접 실행",
  "Network 탭: 오가는 요청·응답을 엿보기",
], { fontSize: 14.5, gap: 12 });
card(s, 6.8, 2.35, 5.9, 4.1, { fill: CARD2 });
s.addText("왜 보안에서 중요할까", { x: 7.1, y: 2.55, w: 5.3, h: 0.45, fontSize: 15, bold: true, color: INDIGO, fontFace: "Arial", isTextBox: true, margin: 0 });
bullets(s, 7.2, 3.1, 5.3, 3.1, [
  "화면 뒤에서 '실제로 무슨 요청이 오가는지' 볼 수 있다",
  "입력값이 서버로 어떻게 전달되는지 확인",
  "공격이 통했는지(응답·쿠키 변화) 관찰",
  "오늘 실습 내내 이 도구를 켜 두면 좋아요",
], { fontSize: 14.5, gap: 12 });
s.addNotes("[실습 5분] 다 같이 F12를 눌러 Console에 간단히 alert('hi') 쳐보게 하면 흥미 유발 + XSS 이해에 직접 연결된다.");

// 0-8 DB & SQL
s = pres.addSlide({ masterName: "DARK" });
head(s, "0-8 · 백엔드 & DB", INDIGO, "데이터는 어디에? — 데이터베이스와 SQL");
subtitle(s, "회원정보·게시글은 서버의 데이터베이스(DB)에 거대한 '표'로 저장됩니다.", 1.7);
const dbTbl = [
  [{ t: "id" }, { t: "pw" }, { t: "role" }],
  ["admin", "S3cr3t!", "관리자"],
  ["student", "pass1234", "학생"],
];
const dbRows = dbTbl.map((r, ri) => r.map((cell) => {
  const txt = typeof cell === "string" ? cell : cell.t;
  return { text: txt, options: { fontSize: 14, bold: ri === 0, color: ri === 0 ? BG : TEXT,
    fill: { color: ri === 0 ? INDIGO : (ri % 2 ? CARD : CARD2) }, fontFace: MONO, align: "center", valign: "middle", margin: 4 } };
}));
s.addText("users 라는 표", { x: 0.6, y: 2.45, w: 5, h: 0.4, fontSize: 13, color: MUTED, fontFace: "Calibri", isTextBox: true, margin: 0 });
s.addTable(dbRows, { x: 0.6, y: 2.85, w: 5.7, colW: [1.9, 1.9, 1.9], rowH: [0.5, 0.55, 0.55], border: { type: "solid", color: LINE, pt: 1 }, valign: "middle" });
s.addText("'SQL' = DB에게 던지는 질문", { x: 6.7, y: 2.45, w: 6, h: 0.4, fontSize: 13, color: MUTED, fontFace: "Calibri", isTextBox: true, margin: 0 });
codeBlock(s, 6.7, 2.85, 6.0, 1.55, [
  { text: "SELECT * FROM users", options: { color: TEAL, breakLine: true } },
  { text: "WHERE id='admin'", options: { color: TEXT, breakLine: true } },
], { fontSize: 15 });
s.addText("\"users 표에서 id가 admin인 행을 다 가져와\" 라는 뜻",
  { x: 6.7, y: 4.45, w: 6, h: 0.5, fontSize: 13, italic: true, color: MUTED, fontFace: "Calibri", isTextBox: true, margin: 0 });
card(s, 0.6, 5.35, 12.1, 1.05, { fill: CARD2, line: INDIGO });
s.addText([
  { text: "그런데 ", options: { color: TEXT } },
  { text: "id='admin'", options: { color: INDIGO, fontFace: MONO } },
  { text: " 의 admin 부분에 ", options: { color: TEXT } },
  { text: "내 입력이 그대로 들어간다면?", options: { bold: true, color: TEXT } },
  { text: "  → 질문 자체를 조작할 수 있어요. 이게 SQL 인젝션입니다.", options: { color: MUTED } },
], { x: 0.9, y: 5.55, w: 11.5, h: 0.65, fontSize: 15, fontFace: "Calibri", valign: "middle", isTextBox: true, margin: 0 });
s.addNotes("SQLi 직접 복선. DB=표, SQL=질문, 입력이 질문에 끼워진다 — 3단계로 천천히.");

// 0-9 쿠키 & 세션
s = pres.addSlide({ masterName: "DARK" });
head(s, "0-9 · 쿠키 & 로그인", WARN, "로그인 상태는 어떻게 유지될까 — 쿠키");
subtitle(s, "한 번 로그인하면 매번 비번을 안 쳐도 되는 이유가 있어요.", 1.7);
const ck = [
  ["로그인 성공", "서버가 '출입증(쿠키)'을 발급해 브라우저에 저장", TEAL],
  ["다음 요청부터", "브라우저가 그 쿠키를 자동으로 함께 보냄", WARN],
  ["서버", "쿠키를 보고 \"아, 로그인한 그 사람이구나\" 인식", INDIGO],
];
let cky = 2.5;
ck.forEach(([h, d, c], i) => {
  card(s, 0.6, cky, 12.1, 1.08, { line: c });
  s.addText(`${i + 1}`, { x: 0.9, y: cky + 0.27, w: 0.55, h: 0.55, fontSize: 20, bold: true, color: BG, fill: { color: c }, align: "center", valign: "middle", fontFace: MONO, isTextBox: true, margin: 0 });
  s.addText(h, { x: 1.7, y: cky + 0.15, w: 3.0, h: 0.78, fontSize: 16, bold: true, color: c, valign: "middle", fontFace: "Arial", isTextBox: true, margin: 0 });
  s.addText(d, { x: 4.8, y: cky + 0.15, w: 7.7, h: 0.78, fontSize: 14.5, color: TEXT, valign: "middle", fontFace: "Calibri", isTextBox: true, margin: 0 });
  cky += 1.2;
});
s.addText("→ '자동으로 보내진다'는 점이 편리하지만, 동시에 CSRF 공격의 빈틈이 됩니다.",
  { x: 0.6, y: 6.2, w: 12, h: 0.4, fontSize: 14, italic: true, color: DANGER, fontFace: "Calibri", isTextBox: true, margin: 0 });
s.addNotes("CSRF 직접 복선. '쿠키는 자동 전송'이 핵심.");

// 0-10 입력을 믿지 마라
s = pres.addSlide({ masterName: "DARK" });
head(s, "0-10 · 보안의 출발점", TEAL, "오늘의 큰 그림: \"입력을 믿지 마라\"");
subtitle(s, "사용자가 서버로 보내는 '모든 것'은 조작될 수 있다고 가정해야 합니다.", 1.7);
const inputs = [
  ["🔎 검색어 · 글 내용", "XSS", TEAL],
  ["🔐 로그인 입력값", "SQL 인젝션", INDIGO],
  ["🔗 URL · 주소값", "SSRF", WARN],
  ["🍪 쿠키 · 요청 자체", "CSRF", DANGER],
];
inputs.forEach(([what, vuln, c], i) => {
  const col = i % 2, row = Math.floor(i / 2);
  const x = 0.6 + col * 6.15, y = 2.55 + row * 1.75;
  card(s, x, y, 5.95, 1.55, { line: c });
  s.addText(what, { x: x + 0.3, y: y + 0.25, w: 5.4, h: 0.5, fontSize: 18, bold: true, color: TEXT, fontFace: "Arial", isTextBox: true, margin: 0 });
  s.addText([
    { text: "믿고 처리하면 → ", options: { color: MUTED } },
    { text: vuln, options: { bold: true, color: c } },
  ], { x: x + 0.3, y: y + 0.82, w: 5.4, h: 0.5, fontSize: 15, fontFace: "Calibri", isTextBox: true, margin: 0 });
});
card(s, 0.6, 6.1, 12.1, 0.72, { fill: CARD2, line: TEAL });
s.addText("네 가지 공격은 결국 하나의 실수 — \"입력을 그대로 믿었다\" — 에서 출발합니다.",
  { x: 0.9, y: 6.2, w: 11.5, h: 0.5, fontSize: 15, bold: true, color: TEAL, valign: "middle", fontFace: "Calibri", isTextBox: true, margin: 0 });
s.addNotes("PART 0의 결론이자 PART 1~4의 지도. 복선 4개를 한 장으로 묶는다.");

// =====================================================================
// PART 1 · XSS
// =====================================================================
divider("1", "PART 1 · XSS", "크로스 사이트 스크립팅", "남이 심어둔 코드가 내 브라우저에서 실행된다.", TEAL)
  .addNotes("[~30분] 0-6(프론트엔드) 상기하며 시작: 브라우저는 글자와 코드를 구분 못 할 수 있다.");
conceptSlide({
  tagText: "1 · XSS", color: TEAL, name: "크로스 사이트 스크립팅 (XSS)",
  sub: "남이 심어둔 코드가 내 브라우저에서 실행된다",
  analogy: "게시판에 글을 올릴 때, 글 내용에 몰래 \"명령문(script)\"을 숨겨 넣습니다.\n\n그 글을 읽는 사람의 브라우저가 글을 그리다가, 숨겨진 명령문까지 '진짜 코드'로 실행해 버려요.\n\n→ 댓글·닉네임·프로필처럼 '남이 쓴 글'을 보여주는 곳은 모두 위험할 수 있습니다.",
  points: ["공격자의 코드가 피해자 브라우저에서 실행됨", "로그인 쿠키·세션 탈취 → 계정 도용", "가짜 입력창을 띄워 비밀번호 수집", "화면 변조, 악성 사이트로 유도", "가장 흔하고 많이 발견되는 웹 취약점"],
  notes: "'내 브라우저가 공격자 코드를 대신 실행한다'가 핵심. 쿠키가 털리면 비번 없이도 로그인된다는 점을 0-9와 연결.",
});
columnsSlide({
  tagText: "1 · XSS", color: TEAL, titleText: "XSS에도 3가지 종류가 있다",
  sub: "'악성 코드가 어디에 들어가느냐'로 나뉩니다.",
  cols: [
    { h: "저장형 (Stored)", color: DANGER, tagline: "가장 위험", items: ["서버 DB에 악성 코드가 저장됨", "그 글을 보는 모든 사람이 피해", "게시판·댓글·프로필", "예: MySpace 'Samy' 웜"] },
    { h: "반사형 (Reflected)", color: WARN, tagline: "링크로 유인", items: ["악성 코드가 URL에 담김", "그 링크를 클릭한 사람만 피해", "검색 결과·에러 메시지", "피싱 메일과 자주 결합"] },
    { h: "DOM 기반", color: INDIGO, tagline: "브라우저 안에서", items: ["서버를 거치지 않음", "브라우저의 JS가 직접 처리하다 발생", "주소의 #뒷부분 등", "오늘 실습이 이 방식에 가까움"] },
  ],
  notes: "종류를 외우게 할 필요는 없다. '저장형=모두 피해, 반사형=클릭한 사람만'만 감 잡으면 충분. 오늘 실습 사이트는 브라우저 안에서 도는 DOM/저장형 혼합.",
});
caseStudy({
  tagText: "1 · XSS", color: TEAL, name: "MySpace 'Samy' 웜 (2005)",
  when: "2005년, 세계 최대 SNS였던 MySpace에서 벌어진 사건",
  what: "Samy Kamkar라는 사람이 자기 프로필에 XSS 코드를 심었습니다. 그 프로필을 '보기만' 해도 코드가 실행돼, 방문자의 프로필에 \"Samy는 내 영웅\"이 추가되고 그 코드가 다시 복제됐어요. 사람에서 사람으로 번지는 '웜(worm)'이 된 거죠.",
  statBig: "20시간",
  statLabel: "만에 100만 명 이상 감염\nMySpace가 잠시 서비스를 내려야 했음",
  lesson: "'보기만 해도' 퍼진다 — 저장형 XSS의 무서움. 사용자가 올린 글을 그대로 믿고 출력하면 전염병처럼 번질 수 있다.",
  notes: "학생들이 가장 흥미로워하는 사례. '클릭도 안 했는데 보기만 해도 감염'을 강조. Samy는 이후 화이트해커가 됨.",
});
labMission({
  tagText: "1 · XSS", color: TEAL, titleText: "실습 ① XSS 직접 공격하기", file: "labs/xss.html",
  steps: [
    "실습 사이트에서 'XSS' 실습에 들어갑니다.",
    "'취약한 버전' 상태인지 확인합니다.",
    "메시지 칸에 오른쪽 payload를 붙여넣습니다.",
    "'글 남기기'를 누릅니다.",
    "경고창이 뜨면 성공! 이제 '방어된 버전'으로 바꿔 다시 시도해보세요.",
  ],
  payload: [{ text: "<img src=x onerror=", options: { color: DANGER, breakLine: true } },
            { text: "  alert('해킹당함!')>", options: { color: DANGER, breakLine: true } }],
  expect: "경고창이 뜨고, 숨겨진 FLAG가 화면에 나타납니다. 방어 버전에서는 코드가 그냥 글자로만 보여요.",
  flag: "FLAG{XSS_c0de_1n_y0ur_br0wser}",
  notes: "[실습 ~8분] 먼저 평범한 글을 써서 정상 동작을 보여준 뒤 payload를 넣게 하면 대비가 선명하다. 방어 버전 전환까지 꼭 시킨다.",
});
defenseSlide({
  tagText: "1 · XSS", color: TEAL, name: "XSS",
  note: "핵심은 '입력을 글자로만 다루기'. 코드로 해석될 틈을 주지 않는다.",
  vulnCode: "// 입력을 HTML로 그대로 삽입\nbox.innerHTML =\n   name + \": \" + msg;\n// <script>가 실행되어 버림",
  safeCode: "// 입력을 '글자'로만 삽입\nbox.textContent =\n   name + \": \" + msg;\n// escapeHtml()로 < > 변환",
  defenses: [
    "출력할 때 innerHTML 대신 textContent 사용 (가장 쉬운 방어)",
    "서버에서 특수문자( < > \" ' )를 이스케이프 처리",
    "Content-Security-Policy(CSP) 헤더로 허용되지 않은 스크립트 실행 차단",
    "입력 검증 + 신뢰할 수 있는 라이브러리(DOMPurify 등)로 정화",
  ],
  notes: "방어는 '출력 시점'이 핵심이라는 걸 강조. 입력을 막기보다 출력을 안전하게.",
});

// =====================================================================
// PART 2 · SQLi
// =====================================================================
divider("2", "PART 2 · SQL INJECTION", "SQL 인젝션", "비밀번호를 몰라도 로그인에 성공하는 주문.", INDIGO)
  .addNotes("[~30분] 0-8(DB·SQL) 상기: SQL은 질문이고, 입력이 그 질문에 끼워진다.");
conceptSlide({
  tagText: "2 · SQL INJECTION", color: INDIGO, name: "SQL 인젝션 (SQLi)",
  sub: "비밀번호를 몰라도 로그인에 성공하는 주문",
  analogy: "로그인하면 서버는 DB에게 묻습니다:\n\"id가 admin이고 비번이 XXX인 사람 있어?\"\n\n이 질문(SQL)에 내 입력이 그대로 끼워지면, 질문 자체를 조작할 수 있어요.\n\n' OR '1'='1 을 넣으면\n\"...또는 1=1인 사람?\"으로 바뀌고,\n1은 항상 1이라 모두가 통과됩니다.",
  points: ["DB 질의문의 '구조'를 입력으로 바꿔치기", "인증 우회(로그인 뚫기)", "회원 전체 개인정보·비밀번호 유출", "데이터 수정·삭제까지 가능", "OWASP가 꼽는 가장 위험한 취약점 중 하나"],
  notes: "0-8의 SELECT 문을 다시 띄워 비교하면 이해가 빠르다.",
});
columnsSlide({
  tagText: "2 · SQL INJECTION", color: INDIGO, titleText: "질문을 조작하는 여러 방법",
  sub: "핵심 아이디어는 하나 — 입력으로 SQL 문장의 '구조'를 바꾼다.",
  cols: [
    { h: "① 항상 참 만들기", color: WARN, tagline: "인증 우회", items: ["' OR '1'='1", "조건을 '항상 참'으로 바꿈", "모든 행이 조건에 맞아 로그인 통과"] },
    { h: "② 주석으로 지우기", color: DANGER, tagline: "뒷부분 무력화", items: ["admin' --", "-- 뒤는 전부 주석(무시)", "비밀번호 검사 부분을 통째로 삭제"] },
    { h: "③ 데이터 빼내기", color: INDIGO, tagline: "정보 유출", items: ["UNION SELECT ...", "다른 표의 데이터를 결과에 끼워 넣음", "회원정보 전체를 긁어올 수 있음"] },
  ],
  notes: "①②는 오늘 실습에서 직접 해본다. ③(UNION)은 '이런 것도 된다' 정도로만 소개. 깊이 들어가지 말 것.",
});
caseStudy({
  tagText: "2 · SQL INJECTION", color: INDIGO, name: "Heartland 카드사 유출 (2008)",
  when: "2008년, 미국의 대형 결제 처리 회사 Heartland Payment Systems",
  what: "공격자들은 회사의 웹 애플리케이션에서 SQL 인젝션으로 처음 침투했습니다. 거기서 내부 네트워크로 파고들어, 결제 과정에서 오가는 신용카드 정보를 대량으로 빼냈어요. 당시 역사상 최대 규모의 카드 정보 유출로 기록됐습니다.",
  statBig: "1억 3천만+",
  statLabel: "건의 신용카드 번호 유출\n출발점은 단 한 줄의 SQL 인젝션",
  lesson: "작은 입력창 하나가 회사 전체를 무너뜨릴 수 있다. SQL 인젝션은 '옛날 기술' 같지만 지금도 꾸준히 발견된다.",
  notes: "초기 침투 벡터가 SQL 인젝션이었다고 알려진 사건. '작은 구멍 → 거대한 피해'의 전형. 숫자로 규모를 실감시킨다.",
});
labMission({
  tagText: "2 · SQL INJECTION", color: INDIGO, titleText: "실습 ② 비밀번호 없이 로그인하기", file: "labs/sqli.html",
  steps: [
    "'SQL 인젝션' 실습에 들어갑니다.",
    "아이디 칸은 admin 그대로 둡니다.",
    "비밀번호 칸에 오른쪽 payload를 입력합니다.",
    "'로그인'을 누르고, 화면에 실제 실행되는 SQL이 어떻게 바뀌는지 봅니다.",
    "방어 버전으로 바꿔 같은 입력이 막히는지 확인합니다.",
  ],
  payload: [{ text: "' OR '1'='1", options: { color: DANGER, breakLine: true } },
            { text: "", options: { breakLine: true } },
            { text: "(아이디에 admin' -- 도 시도)", options: { color: MUTED } }],
  expect: "비밀번호를 몰라도 admin으로 로그인 성공! 바뀐 SQL 문장과 FLAG가 표시됩니다.",
  flag: "FLAG{5ql_1nj3ct10n_0R_1=1}",
  notes: "[실습 ~8분] 실행되는 SQL이 화면에 보이는 게 이 실습의 포인트. 입력이 문장 구조를 바꾸는 걸 눈으로 확인시킨다.",
});
defenseSlide({
  tagText: "2 · SQL INJECTION", color: INDIGO, name: "SQL 인젝션",
  note: "핵심은 '입력을 질문의 구조가 아니라, 값으로만 다루기'.",
  vulnCode: "# 문자열을 그대로 이어붙임\nsql = \"...WHERE id='\" + id +\n       \"' AND pw='\" + pw + \"'\"",
  safeCode: "# 파라미터 바인딩(?)\nsql = \"...WHERE id=? AND pw=?\"\ncursor.execute(sql, (id, pw))\n# ?에 '값'으로만 안전하게 들어감",
  defenses: [
    "Prepared Statement / 파라미터 바인딩 — 가장 중요하고 확실한 방어",
    "ORM 사용 (Django ORM, SQLAlchemy 등) — 내부적으로 바인딩 처리",
    "입력값 검증 (형식·길이·허용 문자)",
    "DB 계정 권한 최소화 — 뚫려도 피해를 줄임",
  ],
  notes: "'입력을 막는 것'보다 '구조와 값을 분리하는 것'이 정답임을 강조. 바인딩 하나면 대부분 끝난다.",
});

// =====================================================================
// 쉬는 시간
// =====================================================================
s = pres.addSlide({ masterName: "DARK" });
s.addText("쉬는 시간", { x: 0.6, y: 2.7, w: 12.1, h: 1.2, fontSize: 60, bold: true, color: WARN, align: "center", fontFace: "Arial", isTextBox: true, margin: 0 });
s.addText("10분 뒤에 PART 3 (SSRF)로 이어갑니다.", { x: 0.6, y: 4.0, w: 12.1, h: 0.6, fontSize: 20, color: MUTED, align: "center", fontFace: "Calibri", isTextBox: true, margin: 0 });
s.addText("여기까지 FLAG 2개 — 아직 못 찾았다면 쉬는 시간에 마저 도전!", { x: 0.6, y: 4.7, w: 12.1, h: 0.5, fontSize: 15, italic: true, color: SAFE, align: "center", fontFace: "Calibri", isTextBox: true, margin: 0 });
s.addNotes("[10분] 전반부(기초+XSS+SQLi)가 꽤 밀도 높으니 여기서 환기. 못 따라온 학생 개별 도움.");

// =====================================================================
// PART 3 · SSRF
// =====================================================================
divider("3", "PART 3 · SSRF", "서버 측 요청 위조", "서버를 속여 내부 비밀을 대신 훔쳐오게 만든다.", WARN)
  .addNotes("[~25분] 0-1(요청/응답), 0-5(URL) 상기: 이번엔 '서버가' 요청을 보내는 쪽이다.");
conceptSlide({
  tagText: "3 · SSRF", color: WARN, name: "서버 측 요청 위조 (SSRF)",
  sub: "서버를 속여 내부 비밀을 대신 훔쳐오게 만들기",
  analogy: "\"URL을 넣으면 미리보기를 보여주는\" 기능이 있죠.\n이때 서버가 대신 그 주소에 접속합니다.\n\n공격자가 외부 주소 대신 '서버 내부 주소'를 넣으면?\n\n바깥에선 절대 못 보는 내부 관리자 페이지나, 클라우드의 비밀 열쇠를 서버가 친절하게 가져다 줍니다.",
  points: ["서버의 '심부름' 권한을 악용", "내부망·관리자 페이지 접근", "클라우드 메타데이터에서 비밀 키 탈취", "방화벽 안쪽을 서버를 통해 훔쳐봄", "실제 대형 클라우드 유출의 단골 원인"],
  notes: "포인트: 공격자가 직접 못 가는 곳을, '서버를 시켜서' 간다. 내부망의 대리인으로 서버를 악용.",
});
caseStudy({
  tagText: "3 · SSRF", color: WARN, name: "Capital One 은행 유출 (2019)",
  when: "2019년, 미국 대형 은행 Capital One (클라우드는 AWS 사용)",
  what: "공격자는 잘못 설정된 방화벽을 통해 SSRF 공격을 성공시켰습니다. 서버를 속여 AWS의 내부 메타데이터 주소(169.254.169.254)에 접속하게 만들고, 거기 있던 '서버의 비밀 열쇠'를 빼냈어요. 그 키로 클라우드 저장소의 고객 데이터를 통째로 가져갔습니다.",
  statBig: "1억 600만",
  statLabel: "명의 고객 정보 유출\n(미국·캐나다 합산)",
  lesson: "오늘 실습에서 넣어볼 바로 그 주소(169.254.169.254)가 현실에서 터뜨린 사건. 내부 주소 차단이 왜 중요한지 보여준다.",
  notes: "오늘 SSRF 실습 payload와 '똑같은 주소'가 등장한 실제 사건이라 몰입도가 높다. 실습 직전에 깔아준다.",
});
labMission({
  tagText: "3 · SSRF", color: WARN, titleText: "실습 ③ 서버로 내부 비밀 훔치기", file: "labs/ssrf.html",
  steps: [
    "'SSRF' 실습에 들어갑니다.",
    "URL 칸에 평범한 외부 이미지 주소를 넣어 정상 동작을 봅니다.",
    "이번엔 오른쪽 payload(내부 메타데이터 주소)를 넣습니다.",
    "'서버가 가져오기'를 누릅니다.",
    "방어 버전에서는 내부 주소가 차단되는 걸 확인합니다.",
  ],
  payload: [{ text: "http://169.254.169.254/", options: { color: DANGER, breakLine: true } },
            { text: "  latest/meta-data/", options: { color: DANGER, breakLine: true } }],
  expect: "서버가 가짜 AWS 비밀 키를 가져옵니다 — Capital One 사건과 똑같은 방식! FLAG가 나타납니다.",
  flag: "FLAG{55rf_m3tadata_1s_m1ne}",
  notes: "[실습 ~7분] 방금 본 Capital One과 연결. localhost:8080/admin/secret 도 시도해보게 하면 '내부 관리자 페이지' 개념까지 잡힌다.",
});
defenseSlide({
  tagText: "3 · SSRF", color: WARN, name: "SSRF",
  note: "핵심은 '서버가 아무 주소에나 가지 못하게' 막기.",
  vulnCode: "# 받은 주소를 검증 없이 요청\nresp = requests.get(user_url)\nreturn resp.text\n# 내부 주소든 뭐든 다 감",
  safeCode: "host = urlparse(url).hostname\nif is_private_ip(host):\n    raise Error('내부 접근 금지')\n# 허용 목록만 통과",
  defenses: [
    "사설 IP 대역(10./192.168./127./169.254.) 차단",
    "허용 목록(allowlist) 방식 — 믿을 수 있는 도메인만 통과",
    "클라우드 메타데이터는 IMDSv2(토큰 필요)로 전환",
    "불필요한 리다이렉트 따라가기 금지",
  ],
  notes: "allowlist(허용 목록)가 blocklist(차단 목록)보다 안전한 이유도 한마디. 막을 것을 나열하는 것보다 허용할 것만 통과시키는 게 빈틈이 적다.",
});

// =====================================================================
// PART 4 · CSRF
// =====================================================================
divider("4", "PART 4 · CSRF", "크로스 사이트 요청 위조", "클릭 한 번으로, 나도 모르게 송금된다.", DANGER)
  .addNotes("[~25분] 0-9(쿠키) 상기: 쿠키는 자동 전송된다. 그 점을 악용하는 공격.");
conceptSlide({
  tagText: "4 · CSRF", color: DANGER, name: "크로스 사이트 요청 위조 (CSRF)",
  sub: "링크 한 번 눌렀을 뿐인데 내 돈이 송금됐다?",
  analogy: "은행에 로그인한 상태에서, 공격자가 보낸 수상한 페이지를 엽니다.\n\n그 페이지엔 '송금 요청'이 숨어 있어요.\n내 브라우저는 은행 쿠키를 자동으로 함께 보내므로,\n\n은행은 \"로그인한 본인의 정상 요청\"으로 착각하고 송금을 실행합니다. 내가 누른 적도 없는데 말이죠.",
  points: ["피해자의 '로그인 상태'를 몰래 악용", "브라우저가 쿠키를 자동 전송하는 점을 이용", "송금·비밀번호 변경·회원탈퇴 강제 실행", "피해자는 수상한 링크 클릭만으로 당함", "XSS와 달리 코드 실행이 아니라 '요청 위조'"],
  notes: "XSS와 헷갈리기 쉬움. XSS=코드가 실행됨 / CSRF=요청이 위조됨. 공격자는 응답을 못 보지만 '행동'은 일어난다.",
});
caseStudy({
  tagText: "4 · CSRF", color: DANGER, name: "초창기 웹을 괴롭힌 CSRF",
  when: "2000년대, 수많은 웹사이트·공유기 관리 페이지에서",
  what: "예전엔 많은 사이트가 '로그인 쿠키만' 보고 요청을 처리했습니다. 공격자는 이미지 태그나 숨은 폼에 '비밀번호 변경'·'설정 변경' 요청을 심어, 피해자가 그 페이지를 열기만 해도 요청이 나가게 했어요. 집 공유기 설정이 몰래 바뀌는 피해도 흔했습니다.",
  statBig: "기본 탑재",
  statLabel: "지금은 거의 모든 웹 프레임워크가\nCSRF 토큰을 기본으로 넣어줌",
  lesson: "너무 흔했기에, 이제는 'CSRF 방어가 기본값'이 됐다. 프레임워크가 주는 보호 장치를 끄지 않는 것만으로도 큰 방어가 된다.",
  notes: "특정 회사 숫자 대신 '업계가 통째로 학습해 기본 방어가 된' 흐름으로 설명. 과장된 수치 없이 정확하게.",
});
labMission({
  tagText: "4 · CSRF", color: DANGER, titleText: "실습 ④ 나도 모르게 송금되기", file: "labs/csrf.html",
  steps: [
    "'CSRF' 실습에 들어갑니다. 위쪽은 '로그인된 은행', 아래는 '공격 페이지'예요.",
    "'취약한 은행' 상태에서 아래 '🎁 기프티콘 받기'를 누릅니다.",
    "이벤트 페이지일 뿐인데 내 은행 잔액이 줄어드는 걸 확인합니다.",
    "'방어된 은행'으로 바꾸고 다시 눌러봅니다.",
    "이번엔 요청이 거부되는 걸 확인합니다.",
  ],
  payload: [{ text: "// 공격 페이지에 숨은 요청", options: { color: MUTED, breakLine: true } },
            { text: "POST /transfer", options: { color: DANGER, breakLine: true } },
            { text: "  to=해커&amount=500000", options: { color: DANGER } }],
  expect: "클릭 한 번에 '해커'에게 송금이 실행됩니다. 방어 버전(CSRF 토큰)에서는 거부돼요.",
  flag: "FLAG{c5rf_1_d1dnt_cl1ck_th4t}",
  notes: "[실습 ~7분] '버튼엔 기프티콘이라 쓰여 있는데 실제론 송금'이라는 속임수를 강조. 쿠키 자동 전송(0-9)과 연결.",
});
defenseSlide({
  tagText: "4 · CSRF", color: DANGER, name: "CSRF",
  note: "핵심은 '쿠키만으로 믿지 말고, 진짜 그 페이지에서 온 요청인지 확인'.",
  vulnCode: "# 로그인 쿠키만 확인\n@post('/transfer')\ndef transfer(to, amount):\n    do_transfer(user, to, amount)",
  safeCode: "# 비밀 토큰도 함께 검증\nif csrf_token != session.token:\n    raise Error('위조된 요청!')\n# 공격 페이지는 이 토큰을 모름",
  defenses: [
    "CSRF 토큰 — 폼마다 예측 불가능한 비밀값을 넣고 검증 (공격 페이지는 모름)",
    "SameSite 쿠키 설정 — 다른 사이트에서 온 요청엔 쿠키를 안 보냄",
    "중요한 작업은 재인증(비밀번호 재입력·OTP) 요구",
    "프레임워크가 주는 CSRF 보호 기능을 끄지 않기",
  ],
  notes: "SameSite 쿠키는 요즘 브라우저 기본값이 강화돼 자동 방어가 늘었다는 점도 한마디.",
});

// =====================================================================
// 정리 · 비교표
// =====================================================================
s = pres.addSlide({ masterName: "DARK" });
title(s, "4대 취약점 한눈에 비교");
const rows = [
  [{ t: "취약점" }, { t: "한 줄 요약" }, { t: "노리는 것" }, { t: "핵심 방어" }],
  ["XSS", "남의 코드가 내 브라우저에서 실행", "사용자(브라우저)", "출력 이스케이프 · CSP"],
  ["SQL Injection", "질의문을 조작해 인증·DB 장악", "데이터베이스", "파라미터 바인딩"],
  ["SSRF", "서버를 속여 내부 자원 요청", "서버·내부망", "허용 목록 · 내부 IP 차단"],
  ["CSRF", "로그인 상태를 악용한 강제 요청", "로그인 세션", "CSRF 토큰 · SameSite"],
];
const rowColors = [null, TEAL, INDIGO, WARN, DANGER];
const tblRows = rows.map((r, ri) => r.map((cell, ci) => {
  const txt = typeof cell === "string" ? cell : cell.t;
  return { text: txt, options: {
    fontSize: ri === 0 ? 14 : 13, bold: ri === 0, align: ci === 0 ? "center" : "left",
    color: ri === 0 ? BG : (ci === 0 && rowColors[ri] ? rowColors[ri] : TEXT),
    fill: { color: ri === 0 ? TEAL : (ri % 2 ? CARD : CARD2) },
    fontFace: ci === 0 ? MONO : "Calibri", valign: "middle", margin: [4, 6, 4, 6] } };
}));
s.addTable(tblRows, { x: 0.6, y: 1.6, w: 12.1, colW: [2.2, 4.0, 2.4, 3.5],
  rowH: [0.5, 0.85, 0.85, 0.85, 0.85], border: { type: "solid", color: LINE, pt: 1 }, valign: "middle" });
s.addText("네 가지 모두 \"입력을 믿어서\" 생깁니다. 방어의 출발점은 항상 '검증'이에요.",
  { x: 0.6, y: 6.4, w: 12, h: 0.5, fontSize: 15, italic: true, color: WARN, fontFace: "Calibri", isTextBox: true, margin: 0 });
s.addNotes("PART 0의 '입력을 믿지 마라'로 다시 묶으며 복습. 학생들에게 각 칸을 맞혀보게 해도 좋다.");

// 정리 · 퀴즈
columnsSlide({
  tagText: "정리 · QUIZ", color: TEAL, titleText: "복습 퀴즈 — 어떤 공격일까?",
  sub: "상황을 듣고 어떤 취약점인지 맞혀보세요. (정답은 다 같이!)",
  cols: [
    { h: "Q1", color: TEAL, items: ["친구 프로필을 '봤을 뿐'인데 내 계정이 이상한 글을 올렸다.", "", "→ 무엇?"] },
    { h: "Q2", color: INDIGO, items: ["로그인 창에 이상한 기호를 넣었더니 비번 없이 들어가졌다.", "", "→ 무엇?"] },
    { h: "Q3", color: DANGER, items: ["이벤트 링크를 눌렀더니 내 계정에서 돈이 빠져나갔다.", "", "→ 무엇?"] },
  ],
  notes: "정답: Q1=XSS(저장형), Q2=SQL 인젝션, Q3=CSRF. 손 들어 맞히게 하면 복습 효과가 크다. SSRF는 '서버가 대신 내부에 접속' 상황으로 추가 질문 가능.",
});

// 정리 · 공통 3원칙
s = pres.addSlide({ masterName: "DARK" });
title(s, "결국 개발자가 기억할 3가지");
const principles = [
  ["🚫", "입력을 믿지 마라", "사용자가 보낸 모든 값은 공격일 수 있다고 가정하고 검증한다.", TEAL],
  ["🔀", "데이터와 명령을 분리하라", "입력이 코드·질의문·주소의 '구조'를 바꾸지 못하게 한다. (바인딩·이스케이프·허용목록)", INDIGO],
  ["🔑", "권한과 상태를 다시 확인하라", "쿠키만 믿지 말고 토큰·재인증으로 '진짜 그 사람의 의도'인지 확인한다.", DANGER],
];
let ppy = 1.65;
principles.forEach(([ic, h, d, c]) => {
  card(s, 0.6, ppy, 12.1, 1.45, { line: c });
  s.addText(ic, { x: 0.9, y: ppy + 0.25, w: 1.1, h: 0.95, fontSize: 38, align: "center", valign: "middle", isTextBox: true, margin: 0 });
  s.addText(h, { x: 2.1, y: ppy + 0.25, w: 10.3, h: 0.5, fontSize: 21, bold: true, color: c, fontFace: "Arial", isTextBox: true, margin: 0 });
  s.addText(d, { x: 2.1, y: ppy + 0.78, w: 10.3, h: 0.55, fontSize: 14.5, color: MUTED, fontFace: "Calibri", isTextBox: true, margin: 0 });
  ppy += 1.65;
});
s.addNotes("오늘 특강의 결론. 4개 공격을 관통하는 교훈 3개.");

// 정리 · 윤리 & 마무리
s = pres.addSlide({ masterName: "DARK" });
tag(s, 0.6, 0.5, "WRAP-UP", TEAL);
s.addText("화이트해커의 약속", { x: 0.6, y: 0.95, w: 12, h: 0.7, fontSize: 30, bold: true, color: TEXT, fontFace: "Arial", isTextBox: true, margin: 0 });
card(s, 0.6, 1.9, 12.1, 1.75, { fill: "3B1D22", line: DANGER });
s.addText("⚠️ 가장 중요한 규칙", { x: 0.9, y: 2.1, w: 11.5, h: 0.45, fontSize: 17, bold: true, color: DANGER, fontFace: "Arial", isTextBox: true, margin: 0 });
s.addText([
  { text: "오늘 배운 기술은 ", options: { color: "FCA5A5" } },
  { text: "허락받지 않은 실제 사이트에 절대 사용하면 안 됩니다.", options: { bold: true, color: "FFFFFF" } },
  { text: "\n타인의 시스템을 무단 공격하면 ", options: { color: "FCA5A5" } },
  { text: "정보통신망법 위반으로 처벌", options: { bold: true, color: "FFFFFF" } },
  { text: "받습니다. 보안 지식은 '지키기 위해' 배웁니다.", options: { color: "FCA5A5" } },
], { x: 0.9, y: 2.55, w: 11.5, h: 1, fontSize: 15, fontFace: "Calibri", lineSpacingMultiple: 1.2, isTextBox: true, margin: 0 });
card(s, 0.6, 3.9, 5.9, 2.5);
s.addText("🧪 실습 사이트", { x: 0.9, y: 4.1, w: 5.3, h: 0.45, fontSize: 16, bold: true, color: TEAL, fontFace: "Arial", isTextBox: true, margin: 0 });
s.addText("여섯 개 FLAG를 모두 찾았나요? 집에서도 '방어 버전'의 코드를 더 살펴보며 복습해보세요.",
  { x: 0.9, y: 4.6, w: 5.3, h: 1, fontSize: 14, color: MUTED, fontFace: "Calibri", lineSpacingMultiple: 1.2, isTextBox: true, margin: 0 });
s.addShape(pres.ShapeType.roundRect, { x: 0.9, y: 5.7, w: 5.3, h: 0.5, rectRadius: 0.1, fill: { color: BG }, line: { color: TEAL, width: 1 } });
s.addText("[여기에 GitHub Pages 주소]", { x: 0.9, y: 5.7, w: 5.3, h: 0.5, fontSize: 13, color: TEAL, align: "center", valign: "middle", fontFace: MONO, isTextBox: true, margin: 0 });
card(s, 6.7, 3.9, 6.0, 2.5);
s.addText("🚀 더 배우고 싶다면", { x: 7.0, y: 4.1, w: 5.4, h: 0.45, fontSize: 16, bold: true, color: INDIGO, fontFace: "Arial", isTextBox: true, margin: 0 });
bullets(s, 7.05, 4.6, 5.4, 1.7, [
  "DVWA · WebGoat — 합법적인 취약점 연습 사이트",
  "Dreamhack · Hack The Box — 워게임 / CTF",
  "OWASP Top 10 — 실무 웹 취약점 공식 목록",
], { fontSize: 13.5, gap: 8 });
s.addText("질문 환영합니다!", { x: 0.6, y: 6.6, w: 12, h: 0.4, fontSize: 15, italic: true, bold: true, color: TEAL, align: "center", fontFace: "Calibri", isTextBox: true, margin: 0 });
s.addNotes("[~10분] 법·윤리 강조 필수. 실습 사이트 주소는 발표 전 GitHub Pages 주소로 교체. 질의응답으로 마무리.");

// =====================================================================
(async () => {
  await pres.writeFile({ fileName: "security-lab-특강.pptx" });
  await applyTheme("security-lab-특강.pptx", THEME);
  console.log("done");
})();

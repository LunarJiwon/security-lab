/* ===== 미니 CTF 엔진 =====
   - 플래그는 평문으로 저장하지 않고 SHA-256 해시로만 검증 (소스를 봐도 정답이 안 보임)
   - 진행상황·타이머는 브라우저(localStorage)에 저장 (사람마다 개인 기록)
*/

const CHALLENGES = [
  { id: "xss",  title: "크로스 사이트 스크립팅", cat: "XSS",  pts: 100, diff: "★☆☆",
    where: "labs/xss.html",  hint: "방명록에 <img src=x onerror=alert(1)> 같은 코드를 넣어 실행시키세요.",
    hash: "4669f57255b2b6a2f20e515903dd454e302d52f87f181e417e1dcd157e8927d5" },
  { id: "sqli", title: "SQL 인젝션",            cat: "SQLi", pts: 150, diff: "★★☆",
    where: "labs/sqli.html", hint: "비밀번호 칸에 ' OR '1'='1 을 넣어 로그인을 뚫으세요.",
    hash: "dcd4680cfc6a792563b93711ff12dc1180a5dd9dde1363af6303453e3b37910e" },
  { id: "ssrf", title: "서버 측 요청 위조",      cat: "SSRF", pts: 200, diff: "★★★",
    where: "labs/ssrf.html", hint: "URL 칸에 http://169.254.169.254/latest/meta-data/ 를 넣어보세요.",
    hash: "94d97e3d272f7e364e8e1db5dfb3133537367b0aa6dbb05ec30d79c1bc0a1f70" },
  { id: "csrf", title: "크로스 사이트 요청 위조", cat: "CSRF", pts: 200, diff: "★★★",
    where: "labs/csrf.html", hint: "'취약한 은행' 상태에서 '기프티콘 받기' 버튼을 눌러보세요.",
    hash: "a8324fa5abbc20847846ac249834ced0197f495d6ca7ad24b160112ce91f368a" },
  { id: "recon", title: "보너스 — 숨은 플래그 찾기", cat: "RECON", pts: 120, diff: "★★☆",
    where: "이 페이지", hint: "F12로 이 페이지의 소스(HTML)를 뒤져보세요. Base64로 숨겨져 있어요. (base64 디코딩 필요)",
    hash: "24c88945393c86fd8c41817f77661fc7baf4d32afbdd0ba79b773c30a5e49563" },
  { id: "console", title: "보너스 — 콘솔의 비밀", cat: "RECON", pts: 80, diff: "★☆☆",
    where: "이 페이지", hint: "F12 → Console 탭을 열어보세요. 안내 메시지가 기다리고 있어요.",
    hash: "5e813a9efa3bd80c65e66c1356f031d69316dc4743e61d58f8af637c12a0a819" },
];

const TOTAL_PTS = CHALLENGES.reduce((a, c) => a + c.pts, 0);
const LS_KEY = "ctf_solved_v1";
const LS_START = "ctf_start_v1";

// ---- 상태 저장/로드 (localStorage 실패해도 동작) ----
function loadSolved() {
  try { return new Set(JSON.parse(localStorage.getItem(LS_KEY) || "[]")); }
  catch (e) { return new Set(); }
}
function saveSolved(set) {
  try { localStorage.setItem(LS_KEY, JSON.stringify([...set])); } catch (e) {}
}
function getStart() {
  try {
    let t = localStorage.getItem(LS_START);
    if (!t) { t = String(Date.now()); localStorage.setItem(LS_START, t); }
    return parseInt(t, 10);
  } catch (e) { return Date.now(); }
}

let solved = loadSolved();

// ---- SHA-256 (브라우저 내장 crypto) ----
async function sha256(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ---- 렌더링 ----
function score() {
  return CHALLENGES.filter((c) => solved.has(c.id)).reduce((a, c) => a + c.pts, 0);
}
function renderStats() {
  document.getElementById("stat-score").textContent = score();
  document.getElementById("stat-total").textContent = TOTAL_PTS;
  document.getElementById("stat-solved").textContent = `${solved.size} / ${CHALLENGES.length}`;
  const pct = Math.round((score() / TOTAL_PTS) * 100);
  document.getElementById("progress-bar").style.width = pct + "%";
  const done = solved.size === CHALLENGES.length;
  document.getElementById("cert").style.display = done ? "block" : "none";
  if (done) {
    document.getElementById("cert-time").textContent = fmtTime(Date.now() - getStart());
    stopTimer();
  }
}
function renderBoard() {
  const board = document.getElementById("board");
  board.innerHTML = "";
  CHALLENGES.forEach((c) => {
    const ok = solved.has(c.id);
    const div = document.createElement("div");
    div.className = "chal" + (ok ? " solved" : "");
    div.innerHTML =
      `<div class="chal-top">
         <span class="chal-cat">${c.cat}</span>
         <span class="chal-pts">${c.pts} pt</span>
       </div>
       <h3>${escapeHtml(c.title)}</h3>
       <div class="chal-meta">난이도 ${c.diff} · 위치: ${escapeHtml(c.where)}</div>
       <div class="chal-hint">💡 ${escapeHtml(c.hint)}</div>
       <div class="chal-status">${ok ? "✅ 해결!" : "🔒 미해결"}</div>`;
    board.appendChild(div);
  });
  renderStats();
}

// ---- 플래그 제출 ----
async function submitFlag() {
  const input = document.getElementById("flag-input");
  const msg = document.getElementById("submit-msg");
  const raw = input.value.trim();
  if (!raw) { return; }
  const h = await sha256(raw);
  const match = CHALLENGES.find((c) => c.hash === h);
  if (!match) {
    msg.className = "submit-msg bad";
    msg.textContent = "❌ 틀렸어요. 플래그를 다시 확인하세요. (FLAG{...} 전체를 정확히)";
    return;
  }
  if (solved.has(match.id)) {
    msg.className = "submit-msg hint";
    msg.textContent = `이미 해결한 문제예요 — ${match.cat}`;
    return;
  }
  solved.add(match.id);
  saveSolved(solved);
  input.value = "";
  msg.className = "submit-msg ok";
  msg.textContent = `🎉 정답! ${match.cat} (+${match.pts}pt) 획득!`;
  renderBoard();
}

// ---- 타이머 ----
let timerId = null;
function fmtTime(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const pad = (n) => String(n).padStart(2, "0");
  return (h > 0 ? h + ":" : "") + pad(m % 60) + ":" + pad(s % 60);
}
function tickTimer() {
  const el = document.getElementById("stat-timer");
  if (el) el.textContent = fmtTime(Date.now() - getStart());
}
function startTimer() { getStart(); tickTimer(); timerId = setInterval(tickTimer, 1000); }
function stopTimer() { if (timerId) { clearInterval(timerId); timerId = null; } }

// ---- 리셋 (강사/재도전용) ----
function resetCtf() {
  if (!confirm("정말 모든 진행상황과 기록을 초기화할까요?")) return;
  solved = new Set();
  try { localStorage.removeItem(LS_KEY); localStorage.removeItem(LS_START); } catch (e) {}
  stopTimer();
  startTimer();
  renderBoard();
  document.getElementById("submit-msg").textContent = "";
}

// ---- 콘솔 챌린지 (보너스) ----
function printConsoleChallenge() {
  // 평문 대신 base64로 숨겨 런타임에 조립
  const b64 = "RkxBR3tjMG5zMGwzXzFzX3AwdzNyZnVsfQ==";
  const flag = atob(b64);
  const big = "font-size:16px;font-weight:bold;color:#5eead4";
  const norm = "font-size:13px;color:#94a3b8";
  console.log("%c🎉 콘솔 챌린지 발견!", big);
  console.log("%c개발자도구 Console 탭을 열 줄 아는 당신, 화이트해커의 자질이 있군요.", norm);
  console.log("%c아래 플래그를 CTF 페이지에 제출하세요:", norm);
  console.log("%c" + flag, "font-size:18px;font-weight:bold;color:#4ade80");
}

// ---- 시작 ----
document.addEventListener("DOMContentLoaded", () => {
  renderBoard();
  startTimer();
  printConsoleChallenge();
  const btn = document.getElementById("submit-btn");
  if (btn) btn.addEventListener("click", submitFlag);
  const input = document.getElementById("flag-input");
  if (input) input.addEventListener("keydown", (e) => { if (e.key === "Enter") submitFlag(); });
});

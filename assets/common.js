/* ===== 공통 유틸 ===== */

// HTML 이스케이프 (방어 코드에서 사용)
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// 취약/안전 모드 토글 위젯 연결
// containerId 안의 .mode-switch 버튼과 data-mode 영역을 제어
function setupModeSwitch(onChange) {
  const buttons = document.querySelectorAll(".mode-switch button");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const mode = btn.dataset.mode; // "vuln" | "safe"
      document.querySelectorAll("[data-mode-banner]").forEach((el) => {
        el.style.display = el.dataset.modeBanner === mode ? "flex" : "none";
      });
      if (onChange) onChange(mode);
    });
  });
}

function currentMode() {
  const active = document.querySelector(".mode-switch button.active");
  return active ? active.dataset.mode : "vuln";
}

// 공격 성공 시 플래그 공개 (평문은 소스에 없음 — data-f에 base64로 숨김)
function revealFlag() {
  const box = document.getElementById("flag-box");
  if (!box) return;
  box.style.display = "block";
  const el = box.querySelector(".flag[data-f]");
  if (el && !el.textContent) {
    try { el.textContent = atob(el.dataset.f); } catch (e) {}
  }
  box.scrollIntoView({ behavior: "smooth", block: "center" });
}

// 현재 연도 푸터
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
});

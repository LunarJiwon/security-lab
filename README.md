# 🛡️ 웹 해킹 체험 실습실 (Web Security Lab)

중·고등학생 대상 **사이버보안 특강** 실습 자료입니다.
웹에서 가장 흔한 4대 취약점을 **브라우저에서 직접 공격하고, 직접 방어**해봅니다.

> 🔗 **실습 사이트:** [GitHub Pages 주소를 여기에 넣으세요]
> 📊 **발표 자료:** [`security-lab-특강.pptx`](./security-lab-특강.pptx)

---

## 📚 실습 목록

| # | 취약점 | 한 줄 요약 | 페이지 |
|---|--------|-----------|--------|
| 01 | **XSS** | 남이 심어둔 코드가 내 브라우저에서 실행 | [`labs/xss.html`](./labs/xss.html) |
| 02 | **SQL Injection** | 비밀번호 없이 로그인 뚫기 | [`labs/sqli.html`](./labs/sqli.html) |
| 03 | **SSRF** | 서버를 속여 내부 비밀 훔쳐오기 | [`labs/ssrf.html`](./labs/ssrf.html) |
| 04 | **CSRF** | 클릭 한 번으로 나도 모르게 송금 | [`labs/csrf.html`](./labs/csrf.html) |

각 실습은 **① 공격 성공 → ② 원리 이해 → ③ 방어 적용** 순서로 구성되어 있고,
공격에 성공하면 숨겨진 `FLAG{...}` 가 나타납니다.

### 🚩 미니 CTF — [`ctf.html`](./ctf.html)
찾은 플래그를 제출하고 점수·시간을 겨루는 CTF 페이지입니다.
- 기본 4문제(XSS/SQLi/SSRF/CSRF) + **보너스 2문제**(개발자도구 F12로 찾는 정찰형) = 총 6문제
- 플래그는 **SHA-256 해시로 검증** → 소스를 봐도 정답이 안 보입니다
- 점수·경과시간·진행상황은 브라우저(localStorage)에 저장 (사람마다 개인 기록)
- 교실에서는 "먼저 6개 다 찾기" 또는 "가장 빠른 완료 시간"으로 순위를 매기세요
- ⚠️ 서버가 없어 **공유 순위표는 없습니다**(기기별 개별 집계). 필요하면 구글폼/시트로 제출받으면 됩니다.

---

## 🚀 실행 방법

### 방법 1 — GitHub Pages (학생 배포용)
저장소 **Settings → Pages → Source: `main` 브랜치 / `/ (root)`** 로 설정하면
몇 분 뒤 `https://<사용자명>.github.io/<저장소명>/` 에서 바로 열립니다.

### 방법 2 — 로컬에서 바로 열기
별도 서버 없이 `index.html` 을 더블클릭해도 동작합니다.
(모든 "서버·DB"는 브라우저 안에서 도는 시뮬레이션이기 때문입니다.)

```bash
# 또는 간단한 로컬 서버로 실행
python3 -m http.server 8000
# → http://localhost:8000 접속
```

---

## 🗂️ 구조

```
security-lab/
├── index.html              # 실습실 허브 (시작 페이지)
├── ctf.html                # 미니 CTF (플래그 제출·채점·타이머)
├── labs/
│   ├── xss.html            # 01. 크로스 사이트 스크립팅
│   ├── sqli.html           # 02. SQL 인젝션
│   ├── ssrf.html           # 03. 서버 측 요청 위조
│   └── csrf.html           # 04. 크로스 사이트 요청 위조
├── assets/
│   ├── style.css           # 공통 스타일
│   ├── common.js           # 공통 유틸 (이스케이프, 모드 전환, 플래그 공개)
│   └── ctf.js              # CTF 엔진 (해시 검증·채점·타이머)
├── security-lab-특강.pptx   # 발표용 슬라이드 (41장, 3시간 분량)
└── build_deck.js           # PPT 생성 스크립트 (pptxgenjs)
```

---

## 🏁 FLAG 목록 (강사용)

<details>
<summary>펼쳐보기</summary>

기본 4문제 (실습 성공 시 공개):
- XSS: `FLAG{XSS_c0de_1n_y0ur_br0wser}`
- SQLi: `FLAG{5ql_1nj3ct10n_0R_1=1}`
- SSRF: `FLAG{55rf_m3tadata_1s_m1ne}`
- CSRF: `FLAG{c5rf_1_d1dnt_cl1ck_th4t}`

보너스 2문제 (개발자도구로 찾기):
- 숨은 플래그(소스 Base64): `FLAG{v13w_s0urc3_r3c0n}` — `ctf.html` HTML 주석에 숨김
- 콘솔의 비밀: `FLAG{c0ns0l3_1s_p0w3rful}` — F12 Console 탭에 출력됨

> 플래그는 각 페이지 소스에 **평문으로 들어있지 않습니다**(base64·해시 처리). 위 목록은 강사 확인용이에요.

</details>

---

## ⚠️ 주의 — 윤리와 법

이 실습실은 **교육 목적의 가짜(시뮬레이션) 사이트**입니다.
여기서 배운 기술을 **허락받지 않은 실제 사이트에 사용하면 정보통신망법 위반으로 처벌**받습니다.
보안 지식은 **지키기 위해** 배웁니다. 🙌

## 📖 더 배우기
- [DVWA](https://github.com/digininja/DVWA) · [OWASP WebGoat](https://owasp.org/www-project-webgoat/) — 합법적 취약점 연습 환경
- [Dreamhack](https://dreamhack.io/) · [Hack The Box](https://www.hackthebox.com/) — 워게임 / CTF
- [OWASP Top 10](https://owasp.org/www-project-top-ten/) — 실무 웹 취약점 공식 목록

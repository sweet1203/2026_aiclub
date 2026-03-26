# 🤖 AI 코딩 도우미 - 배포 가이드

동아리 학생 전용 AI 웹앱 개발 도우미입니다.

---

## 📁 파일 구조

```
ai-coding-helper/
├── api/
│   └── chat.js          ← Claude API 연결 (API 키 여기에 보관됨)
├── public/
│   └── index.html       ← 학생들이 보는 화면
├── vercel.json          ← Vercel 배포 설정
├── .gitignore           ← .env 파일이 git에 올라가지 않도록
└── README.md            ← 이 파일
```

---

## 🚀 배포 방법 (처음 1회)

### 1단계 - GitHub에 올리기

```bash
git init
git add .
git commit -m "첫 번째 커밋"
git remote add origin https://github.com/본인아이디/ai-coding-helper.git
git push -u origin main
```

### 2단계 - Vercel 연결

1. https://vercel.com 접속 → GitHub 로그인
2. "New Project" → 방금 만든 저장소 선택
3. "Deploy" 클릭 (설정 건드릴 필요 없어요!)
4. 배포 완료 후 **Environment Variables** 설정 (아래 참고)

### 3단계 - API 키 환경변수 등록 (중요! ⚠️)

Vercel 대시보드 → Settings → Environment Variables

| Name | Value |
|------|-------|
| `ANTHROPIC_API_KEY` | `sk-ant-여기에본인키입력` |

저장 후 **Redeploy** 클릭!

---

## 🔑 비밀번호 변경 방법

`public/index.html` 파일에서 이 줄을 찾아서 바꾸세요:

```javascript
const ACCESS_PASSWORD = 'coding2025';   // ← 여기를 원하는 비밀번호로!
```

---

## ✅ 완료 후 확인사항

- [ ] Vercel 배포 URL에서 비밀번호 입력 화면 뜨는지 확인
- [ ] 비밀번호 입력 후 채팅 화면 들어가는지 확인
- [ ] AI에게 질문하면 답변 오는지 확인
- [ ] GitHub에 `.env` 파일이 올라가지 않았는지 확인

---

## 🛠️ 자주 묻는 질문

**Q: 학생이 비밀번호를 잊어버렸어요**
A: `index.html`에서 비밀번호 확인 후 알려주세요.

**Q: AI가 답변을 안 해요**
A: Vercel 대시보드에서 API 키가 환경변수에 등록됐는지 확인하세요.

**Q: 비용이 걱정돼요**
A: 대화 기록을 최근 20개로 제한해 놨어요. Anthropic 콘솔에서 월 사용량 한도 설정도 가능해요.

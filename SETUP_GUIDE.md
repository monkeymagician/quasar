# TON-618 Quasar 3D - 설치 및 실행 가이드

## 📦 설치 단계별 가이드

### 1단계: 사전 요구사항 확인

다음 프로그램들이 설치되어 있는지 확인하세요:

```powershell
# Node.js 버전 확인
node --version
# 출력 예: v18.0.0 이상

# npm 버전 확인
npm --version
# 출력 예: 9.0.0 이상

# Python 버전 확인
python --version
# 출력 예: Python 3.8.0 이상
```

설치되어 있지 않다면:
- Node.js: https://nodejs.org/ (LTS 버전 권장)
- Python: https://www.python.org/ (3.8 이상)

### 2단계: 백엔드 설정

```powershell
# 1. 프로젝트 루트 디렉토리로 이동
cd C:\path\to\ton618-quasar-3d

# 2. backend 디렉토리로 이동
cd backend

# 3. Python 가상환경 생성
python -m venv venv

# 4. 가상환경 활성화
.\venv\Scripts\activate

# 성공하면 프롬프트 앞에 (venv)가 표시됩니다:
# (venv) PS C:\path\to\ton618-quasar-3d\backend>

# 5. pip 업그레이드 (선택사항)
python -m pip install --upgrade pip

# 6. 의존성 설치
pip install -r requirements.txt

# 7. 설치 확인
pip list
# fastapi, uvicorn, pydantic 등이 표시되어야 합니다
```

**가상환경 활성화 오류 해결:**

만약 `.\venv\Scripts\activate` 실행 시 오류가 발생하면:

```powershell
# PowerShell 실행 정책 확인
Get-ExecutionPolicy

# Restricted로 표시되면 변경 필요
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 다시 활성화 시도
.\venv\Scripts\activate
```

### 3단계: 프론트엔드 설정

**새 PowerShell 터미널을 열고:**

```powershell
# 1. 프로젝트 루트 디렉토리로 이동
cd C:\path\to\ton618-quasar-3d

# 2. frontend 디렉토리로 이동
cd frontend

# 3. npm 패키지 설치
npm install

# 설치 시간: 약 2-5분 소요
# node_modules 폴더가 생성되고 수천 개의 패키지가 설치됩니다

# 4. 설치 확인
npm list --depth=0
# react, three, @react-three/fiber 등이 표시되어야 합니다
```

## 🚀 실행 방법

### 방법 1: 두 개의 터미널 사용 (권장)

**터미널 1 - 백엔드:**
```powershell
cd backend
.\venv\Scripts\activate
uvicorn main:app --reload

# 출력:
# INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
# INFO:     Started reloader process
```

**터미널 2 - 프론트엔드:**
```powershell
cd frontend
npm run dev

# 출력:
# VITE v5.0.8  ready in 500 ms
# ➜  Local:   http://localhost:5173/
# ➜  Network: use --host to expose
```

### 방법 2: 백그라운드 실행

**백엔드를 백그라운드로 실행:**
```powershell
cd backend
.\venv\Scripts\activate
Start-Process powershell -ArgumentList "-NoExit", "-Command", "uvicorn main:app --reload"
```

**프론트엔드 실행:**
```powershell
cd frontend
npm run dev
```

## 🌐 애플리케이션 접속

1. 브라우저를 열고 http://localhost:5173 접속
2. 3D 우주 씬이 로드되는 것을 확인
3. 별들과 중앙의 퀘이사가 보여야 합니다

## ✅ 동작 확인 체크리스트

### 백엔드 확인
- [ ] http://localhost:8000 접속 시 JSON 응답 확인
- [ ] http://localhost:8000/docs 에서 API 문서 확인
- [ ] http://localhost:8000/health 에서 상태 확인

### 프론트엔드 확인
- [ ] 검은 배경에 별들이 보임
- [ ] 중앙에 주황색 퀘이사가 보임
- [ ] 퀘이사 주변에 회전하는 원반이 보임
- [ ] 5개의 행성이 공전하는 것이 보임
- [ ] 마우스로 카메라 회전 가능
- [ ] 마우스 휠로 줌 인/아웃 가능
- [ ] 우측 상단에 "Andromeda Galaxy" 버튼이 보임
- [ ] 좌측 하단에 정보 패널이 보임

### 인터랙션 확인
- [ ] 행성 클릭 시 카메라가 줌인됨
- [ ] 콘솔에 행성 정보가 출력됨
- [ ] R 키 누르면 카메라가 리셋됨
- [ ] "Andromeda Galaxy" 버튼 클릭 시 모달이 열림
- [ ] 모달에 AI 응답이 표시됨

## 🐛 문제 해결

### 백엔드가 시작되지 않음

**증상:** `uvicorn: command not found` 또는 유사한 오류

**해결:**
```powershell
# 가상환경이 활성화되었는지 확인
# 프롬프트에 (venv)가 있어야 함

# 없다면 다시 활성화
.\venv\Scripts\activate

# uvicorn 재설치
pip install uvicorn[standard]
```

### 프론트엔드가 시작되지 않음

**증상:** `npm: command not found` 또는 모듈 오류

**해결:**
```powershell
# Node.js 재설치 확인
node --version

# node_modules 삭제 후 재설치
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### CORS 오류

**증상:** 브라우저 콘솔에 CORS 관련 오류

**해결:**
1. 백엔드가 포트 8000에서 실행 중인지 확인
2. `backend/.env` 파일 확인:
   ```
   CORS_ORIGINS=http://localhost:5173
   ```
3. 백엔드 재시작

### 3D 씬이 보이지 않음

**증상:** 검은 화면만 보임

**해결:**
1. 브라우저 콘솔(F12) 열어서 에러 확인
2. WebGL 지원 확인: https://get.webgl.org/
3. 브라우저 하드웨어 가속 활성화:
   - Chrome: `chrome://settings/system`
   - "하드웨어 가속 사용" 활성화

### 성능 문제 (낮은 FPS)

**해결:**
1. 다른 탭과 프로그램 닫기
2. 브라우저 하드웨어 가속 확인
3. GPU 드라이버 업데이트
4. 자동 품질 조정이 작동 중 (정상)

## 🔄 개발 워크플로우

### 코드 수정 시
- **백엔드**: 파일 저장 시 자동 재시작 (`--reload` 옵션)
- **프론트엔드**: 파일 저장 시 자동 새로고침 (HMR)

### 서버 중지
- **Ctrl + C** 키를 눌러 서버 중지

### 가상환경 비활성화
```powershell
deactivate
```

## 📝 추가 명령어

### 백엔드 테스트
```powershell
cd backend
.\venv\Scripts\activate
python -m pytest  # 테스트 파일이 있는 경우
```

### 프론트엔드 빌드
```powershell
cd frontend
npm run build
# dist/ 폴더에 프로덕션 빌드 생성
```

### 프론트엔드 프리뷰
```powershell
cd frontend
npm run preview
# 빌드된 파일을 로컬 서버로 미리보기
```

## 🎯 다음 단계

1. ✅ 설치 완료
2. ✅ 애플리케이션 실행
3. 🎨 코드 커스터마이징
4. 🚀 프로덕션 배포

## 💡 팁

- **개발 중**: 두 터미널을 항상 열어두세요
- **디버깅**: 브라우저 개발자 도구(F12) 활용
- **성능**: 크롬 개발자 도구의 Performance 탭 사용
- **API 테스트**: http://localhost:8000/docs 에서 직접 테스트

## 📞 도움이 필요하신가요?

- 이슈 생성: GitHub Issues
- 문서 확인: README.md
- API 문서: http://localhost:8000/docs

---

**Happy Coding! 🚀✨**

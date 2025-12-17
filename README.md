# TON-618 Quasar 3D Web Application

초고퀄리티 3D 우주 시뮬레이션 웹 애플리케이션 - TON-618 퀘이사를 중심으로 한 인터랙티브 우주 탐험

![TON-618 Quasar](https://img.shields.io/badge/TON--618-Quasar-blueviolet)
![React](https://img.shields.io/badge/React-18.2-blue)
![Three.js](https://img.shields.io/badge/Three.js-0.160-green)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-teal)

## 🌟 주요 기능

- 🌌 **절차적 별밭 배경**: 5000개 이상의 별로 구성된 깊이감 있는 우주 공간
- ⚫ **GARGANTUA 블랙홀**: 영화 <인터스텔라> 수준의 초고퀄리티 구현
  - **8 Octave FBM**: 극한 디테일의 가스 구름
  - **Domain Warping**: 유기적이고 복잡한 흐름
  - **7개 나선팔**: Gargantua 스타일의 날카로운 나선 구조
  - **Vortex Effect**: 중심부 강력한 소용돌이
  - **Filaments**: 밝은 필라멘트 스트릭
  - **차등 회전**: 내부 3.5x, 외부 0.8x (실제 물리)
  - **극한 밝기**: 최대 20배 밝기로 눈부신 Bloom
  - **Event Horizon**: Fresnel 효과의 중력 렌즈 시뮬레이션
- 🪐 **5개의 공전 행성**: 각기 다른 색상, 크기, 궤도를 가진 행성들
- 🎯 **인터랙티브 클릭**: 행성 클릭 시 카메라 줌 애니메이션
- 🎨 **Glassmorphism UI**: 반투명 유리 질감의 미래지향적 인터페이스
- 🤖 **AI 에이전트 통신**: FastAPI 백엔드와 실시간 통신
- 📸 **고급 후처리**: ACES Filmic Tone Mapping + 강화된 Bloom
- ⚡ **성능 최적화**: 자동 품질 조정으로 30+ FPS 유지

## 🛠 기술 스택

### Frontend
- **React 18** - UI 라이브러리
- **TypeScript** - 타입 안정성
- **Vite** - 빠른 개발 서버
- **Three.js** - 3D 렌더링 엔진
- **@react-three/fiber** - React용 Three.js 래퍼
- **@react-three/drei** - 유용한 Three.js 헬퍼
- **@react-three/postprocessing** - 후처리 효과
- **Tailwind CSS** - 유틸리티 CSS 프레임워크
- **Axios** - HTTP 클라이언트

### Backend
- **Python 3.8+** - 프로그래밍 언어
- **FastAPI** - 현대적인 웹 프레임워크
- **Uvicorn** - ASGI 서버
- **Pydantic** - 데이터 검증

## 📋 사전 요구사항

- **Node.js** 18.0 이상 ([다운로드](https://nodejs.org/))
- **Python** 3.8 이상 ([다운로드](https://www.python.org/))
- **npm** 또는 **yarn**
- **Windows PowerShell** (Windows 사용자)

## 🚀 빠른 시작 (Windows PowerShell)

### 1️⃣ 백엔드 설정

```powershell
# 프로젝트 루트에서 backend 디렉토리로 이동
cd backend

# Python 가상환경 생성
python -m venv venv

# 가상환경 활성화 (Windows PowerShell)
.\venv\Scripts\activate

# 의존성 설치
pip install -r requirements.txt

# 백엔드 서버 실행
uvicorn main:app --reload
```

✅ 백엔드가 **http://localhost:8000** 에서 실행됩니다.

API 문서: http://localhost:8000/docs

### 2️⃣ 프론트엔드 설정

새 터미널을 열고:

```powershell
# 프로젝트 루트에서 frontend 디렉토리로 이동
cd frontend

# npm 패키지 설치
npm install

# 개발 서버 실행
npm run dev
```

✅ 프론트엔드가 **http://localhost:5173** 에서 실행됩니다.

브라우저에서 http://localhost:5173 을 열어 애플리케이션을 확인하세요!

## 🎮 사용 방법

### 기본 조작
- **마우스 드래그**: 카메라 회전
- **마우스 휠**: 줌 인/아웃
- **행성 클릭**: 해당 행성으로 카메라 줌
- **R 키**: 카메라 뷰 리셋

### UI 요소
- **우측 상단 버튼**: "Andromeda Galaxy" - AI 에이전트와 통신
- **좌측 하단 패널**: TON-618 정보 및 조작 가이드

## 📁 프로젝트 구조

```
ton618-quasar-3d/
├── backend/                    # FastAPI 백엔드
│   ├── main.py                # FastAPI 애플리케이션
│   ├── requirements.txt       # Python 의존성
│   ├── .env                   # 환경 변수
│   └── venv/                  # Python 가상환경
│
├── frontend/                   # React 프론트엔드
│   ├── src/
│   │   ├── components/        # React 컴포넌트
│   │   │   ├── Scene.tsx      # 3D 캔버스 래퍼
│   │   │   ├── Quasar.tsx     # 퀘이사 + 쉐이더
│   │   │   ├── AccretionDisk.tsx  # 강착원반
│   │   │   ├── Planets.tsx    # 행성 시스템
│   │   │   └── UI.tsx         # HTML 오버레이
│   │   ├── api/
│   │   │   └── client.ts      # Axios API 클라이언트
│   │   ├── types.ts           # TypeScript 타입 정의
│   │   ├── App.tsx            # 메인 앱 컴포넌트
│   │   ├── main.tsx           # 엔트리 포인트
│   │   └── index.css          # 글로벌 스타일
│   ├── public/                # 정적 파일
│   ├── package.json           # npm 의존성
│   ├── tsconfig.json          # TypeScript 설정
│   ├── vite.config.ts         # Vite 설정
│   ├── tailwind.config.js     # Tailwind 설정
│   └── .env                   # 환경 변수
│
├── .kiro/                      # Kiro 스펙 문서
│   └── specs/ton618-quasar-3d/
│       ├── requirements.md    # 요구사항 문서
│       ├── design.md          # 설계 문서
│       └── tasks.md           # 구현 태스크
│
└── README.md                   # 이 파일
```

## 🎨 커스텀 쉐이더 (GARGANTUA 스타일)

### Black Hole Event Horizon Shader
블랙홀 중심부는 거의 완전한 검은색 구체로 구현됩니다:
- **Fresnel Rim Light**: 빛이 블랙홀 주변에서 휘어지는 중력 렌즈 효과
- **Subtle Pulsing**: 미묘한 펄스 효과로 생동감 부여
- **Deep Black Core**: 이벤트 호라이즌의 절대적 어둠 표현 (RGB: 0.005)

### Accretion Disk Shader (Gargantua-Level)
강착원반은 영화 <인터스텔라> 수준의 초고퀄리티 쉐이더로 구현됩니다:

**핵심 기술:**
- **8 Octave FBM**: 이전보다 33% 더 많은 디테일
- **Domain Warping**: 노이즈를 노이즈로 왜곡하여 극도로 유기적인 패턴
- **4-Layer Turbulence**: 서로 다른 스케일과 속도의 난류 레이어
- **7 Spiral Arms**: Gargantua 스타일의 날카로운 나선 구조
- **Vortex Effect**: 중심부 근처의 강력한 소용돌이
- **Filaments**: 가스 구름 사이의 극도로 밝은 필라멘트 스트릭
- **Differential Rotation**: 내부 3.5x, 외부 0.8x (실제 강착원반 물리)
- **4-Stage Color Gradient**: 빨강 → 주황 → 노랑 → 흰색 (온도 기반)
- **Extreme Brightness**: 최대 20배 밝기 (Bloom 극대화)
- **Edge Glow Enhancement**: 강착원반 가장자리 추가 발광
- **Gas Cloud Transparency**: 패턴과 온도 기반 알파 블렌딩
- **PlaneGeometry 256x256**: 부드러운 그라데이션을 위한 고밀도 메시
- **Additive Blending**: 여러 레이어의 빛 합성
- **toneMapped=false**: Bloom 효과를 위한 극한 밝기 출력 (최대 20.0)

## 🔧 환경 변수

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
```

### Backend (.env)
```env
CORS_ORIGINS=http://localhost:5173
PORT=8000
```

## 🐛 문제 해결

### npm 명령어를 찾을 수 없음
**해결**: Node.js를 설치하세요 → https://nodejs.org/

### Python을 찾을 수 없음
**해결**: Python 3.8 이상을 설치하세요 → https://www.python.org/

### 가상환경 활성화 오류
**문제**: `.\venv\Scripts\activate` 실행 시 권한 오류

**해결**: PowerShell 실행 정책 변경
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### CORS 오류
**문제**: 프론트엔드에서 백엔드 API 호출 시 CORS 오류

**해결**: 
1. 백엔드가 포트 8000에서 실행 중인지 확인
2. `backend/.env` 파일에서 CORS_ORIGINS 확인
3. 백엔드 재시작

### 3D 씬이 렌더링되지 않음
**문제**: 검은 화면만 보임

**해결**:
1. 브라우저 콘솔에서 에러 확인
2. WebGL 지원 확인: https://get.webgl.org/
3. GPU 드라이버 업데이트

### 성능 문제 (낮은 FPS)
**해결**:
1. 브라우저 하드웨어 가속 활성화
2. 다른 탭/프로그램 닫기
3. 자동 품질 조정이 작동 중 (PerformanceMonitor)

## 📚 API 엔드포인트

### POST /chat
AI 에이전트와 대화

**요청:**
```json
{
  "message": "Hello from TON-618!"
}
```

**응답:**
```json
{
  "response": "🌌 Greetings from the TON-618 Quasar!...",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### GET /health
서버 상태 확인

**응답:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🚢 프로덕션 빌드

### Frontend
```powershell
cd frontend
npm run build
```
빌드된 파일은 `frontend/dist/` 에 생성됩니다.

### Backend
```powershell
cd backend
.\venv\Scripts\activate
uvicorn main:app --host 0.0.0.0 --port 8000
```

## 🤝 기여

이슈와 풀 리퀘스트를 환영합니다!

## 📄 라이선스

MIT License

## 🌌 TON-618에 대하여

TON-618은 알려진 우주에서 가장 거대한 블랙홀 중 하나로, 태양 질량의 약 660억 배에 달합니다. 지구에서 약 104억 광년 떨어진 곳에 위치한 이 퀘이사는 우주의 신비를 탐구하는 천문학자들에게 중요한 연구 대상입니다.

---

**Made with ❤️ using React Three Fiber and FastAPI**

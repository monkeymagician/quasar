# Design Document

## Overview

TON-618 Quasar 3D Web Application은 최신 웹 기술을 활용한 몰입형 3D 우주 시뮬레이션입니다. React Three Fiber를 사용하여 WebGL 기반의 고품질 3D 그래픽을 렌더링하고, FastAPI 백엔드와 통신하여 AI 기능을 제공합니다.

핵심 기술 스택:
- **Frontend**: React 18 + TypeScript + Vite
- **3D Rendering**: Three.js + @react-three/fiber + @react-three/drei
- **Styling**: Tailwind CSS
- **Backend**: Python FastAPI
- **Communication**: Axios for HTTP requests

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (Client)                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              React Application (Port 5173)             │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │ │
│  │  │   UI Layer   │  │  3D Canvas   │  │  API Client │ │ │
│  │  │  (Overlay)   │  │   (R3F)      │  │   (Axios)   │ │ │
│  │  └──────────────┘  └──────────────┘  └─────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   FastAPI Server (Port 8000)                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                    API Endpoints                        │ │
│  │  ┌──────────────┐  ┌──────────────┐                   │ │
│  │  │  /chat       │  │   CORS       │                   │ │
│  │  │  (POST)      │  │  Middleware  │                   │ │
│  │  └──────────────┘  └──────────────┘                   │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture

```
App.tsx
  └── Scene.tsx (Canvas wrapper)
       ├── Lighting (Ambient, Point lights)
       ├── Quasar.tsx (Central object with shader)
       │    └── AccretionDisk (Ring with animated shader)
       ├── Planets.tsx (5 orbiting spheres)
       ├── Stars (Background from drei)
       ├── OrbitControls (Camera controls from drei)
       └── EffectComposer (Post-processing)
            └── Bloom (Glow effect)
  └── UI.tsx (HTML overlay)
       └── AndromedaButton (Top-right glassmorphism button)
```

## Components and Interfaces

### Frontend Components

#### 1. App.tsx
Main application component that orchestrates the entire UI.

```typescript
interface AppProps {}

// Renders Scene and UI components
// Manages global state if needed
```

#### 2. Scene.tsx
Wraps the Three.js Canvas and contains all 3D objects.

```typescript
interface SceneProps {
  className?: string;
}

// Contains:
// - Canvas from @react-three/fiber
// - Camera configuration
// - All 3D scene objects
// - Post-processing effects
```

#### 3. Quasar.tsx
The central TON-618 quasar with custom shader material.

```typescript
interface QuasarProps {
  position?: [number, number, number];
  scale?: number;
}

// Features:
// - Custom vertex and fragment shaders
// - Time-based animation uniforms
// - Procedural lava texture
// - Emissive material properties
```

#### 4. AccretionDisk (within Quasar.tsx)
Rotating disk around the quasar.

```typescript
interface AccretionDiskProps {
  innerRadius: number;
  outerRadius: number;
  position?: [number, number, number];
}

// Features:
// - Torus geometry
// - Rotating shader pattern
// - Semi-transparent emissive material
```

#### 5. Planets.tsx
Container for all orbiting planets.

```typescript
interface PlanetData {
  id: string;
  color: string;
  size: number;
  orbitRadius: number;
  orbitSpeed: number;
}

interface PlanetsProps {
  planetCount?: number;
}

// Features:
// - Generates 5 planets with unique properties
// - Handles orbital animation
// - Click interaction handlers
```

#### 6. Planet (within Planets.tsx)
Individual planet component.

```typescript
interface PlanetProps {
  data: PlanetData;
  onClick: (data: PlanetData) => void;
}

// Features:
// - Sphere geometry
// - Standard material with color
// - Click event handling
// - Position calculation based on orbit
```

#### 7. UI.tsx
HTML overlay containing interactive UI elements.

```typescript
interface UIProps {
  onAndromedaClick: () => void;
}

// Features:
// - Glassmorphism button
// - Absolute positioning
// - Tailwind CSS styling
```

### Backend Components

#### 1. main.py
FastAPI application with API endpoints.

```python
# Endpoints:
# POST /chat - Receives message, returns AI response

# Features:
# - CORS middleware configuration
# - Request/response models using Pydantic
# - Error handling
```

### Data Models

#### Frontend Types

```typescript
// Three.js related types
import * as THREE from 'three';

// Planet data structure
interface PlanetData {
  id: string;
  color: string;
  size: number;
  orbitRadius: number;
  orbitSpeed: number;
}

// API request/response types
interface ChatRequest {
  message: string;
}

interface ChatResponse {
  response: string;
  timestamp: string;
}

// Shader uniform types
interface QuasarUniforms {
  time: { value: number };
  color1: { value: THREE.Color };
  color2: { value: THREE.Color };
}
```

#### Backend Models

```python
from pydantic import BaseModel
from datetime import datetime

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    timestamp: str
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Starfield rendering consistency
*For any* scene initialization, the starfield background should render with visible stars and maintain the specified frame rate threshold
**Validates: Requirements 1.1, 1.4**

### Property 2: Quasar shader animation continuity
*For any* frame rendered, the quasar shader time uniform should increment monotonically, ensuring continuous animation without jumps
**Validates: Requirements 2.3**

### Property 3: Planet orbital mechanics
*For any* planet and any given time t, the planet's position should satisfy the orbital equation: position = (orbitRadius * cos(orbitSpeed * t), 0, orbitRadius * sin(orbitSpeed * t))
**Validates: Requirements 4.3, 4.4**

### Property 4: Planet uniqueness
*For any* two planets in the scene, they should have different combinations of color, size, or orbital parameters
**Validates: Requirements 4.1, 4.2**

### Property 5: Click detection accuracy
*For any* planet that is clicked, the click handler should receive the correct planet data corresponding to the clicked object
**Validates: Requirements 5.1, 5.2**

### Property 6: UI overlay non-obstruction
*For any* viewport size, the central quasar should remain visible and not be covered by UI elements
**Validates: Requirements 7.4**

### Property 7: API request-response correspondence
*For any* chat request sent to the backend, the frontend should receive a response with a matching or subsequent timestamp
**Validates: Requirements 8.1, 8.2, 8.3**

### Property 8: CORS configuration correctness
*For any* HTTP request from the frontend origin (localhost:5173), the backend should include appropriate CORS headers in the response
**Validates: Requirements 8.5**

### Property 9: TypeScript type safety
*For any* component prop or function parameter, TypeScript should enforce type checking at compile time and reject invalid types
**Validates: Requirements 10.3, 10.4**

### Property 10: Camera control bounds
*For any* camera zoom operation, the camera distance should remain within the configured minimum and maximum bounds
**Validates: Requirements 12.4**

## Error Handling

### Frontend Error Handling

1. **API Communication Errors**
   - Network failures: Display user-friendly error message
   - Timeout: Show retry option
   - Invalid response: Log error and show generic message

2. **3D Rendering Errors**
   - WebGL not supported: Show fallback message
   - Shader compilation errors: Log to console, use fallback material
   - Performance issues: Reduce quality settings automatically

3. **User Input Errors**
   - Invalid click targets: Ignore silently
   - Rapid clicking: Debounce or throttle events

### Backend Error Handling

1. **Request Validation**
   - Invalid JSON: Return 400 Bad Request
   - Missing required fields: Return 422 Unprocessable Entity
   - Malformed data: Return descriptive error message

2. **Server Errors**
   - Unexpected exceptions: Return 500 Internal Server Error
   - Log all errors for debugging

## Testing Strategy

### Unit Testing

**Frontend Unit Tests:**
- Component rendering tests using React Testing Library
- Utility function tests (orbital calculations, color conversions)
- API client mock tests

**Backend Unit Tests:**
- Endpoint response validation
- Request model validation
- CORS header verification

### Property-Based Testing

We will use **fast-check** for JavaScript/TypeScript property-based testing.

**Configuration:**
- Each property test should run a minimum of 100 iterations
- Tests should use appropriate generators for input data

**Property Tests to Implement:**

1. **Orbital Position Calculation**
   - Generate random time values and orbital parameters
   - Verify position satisfies orbital equation
   - **Feature: ton618-quasar-3d, Property 3: Planet orbital mechanics**

2. **Planet Uniqueness**
   - Generate random planet configurations
   - Verify no two planets are identical
   - **Feature: ton618-quasar-3d, Property 4: Planet uniqueness**

3. **API Response Timestamp**
   - Generate random chat messages
   - Verify response timestamp is valid and recent
   - **Feature: ton618-quasar-3d, Property 7: API request-response correspondence**

4. **Camera Bounds**
   - Generate random zoom inputs
   - Verify camera distance stays within bounds
   - **Feature: ton618-quasar-3d, Property 10: Camera control bounds**

### Integration Testing

- End-to-end tests using Playwright or Cypress
- Test full user workflows (load scene → click planet → call API)
- Verify frontend-backend communication

### Visual Regression Testing

- Capture screenshots of 3D scene
- Compare against baseline images
- Detect unintended visual changes

## Implementation Notes

### Shader Development

**Quasar Vertex Shader:**
```glsl
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vUv = uv;
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
```

**Quasar Fragment Shader:**
```glsl
uniform float time;
uniform vec3 color1;
uniform vec3 color2;
varying vec2 vUv;
varying vec3 vPosition;

// Noise function for procedural texture
float noise(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec2 uv = vUv;
  
  // Animated noise pattern
  float n = noise(uv * 10.0 + time * 0.5);
  n += noise(uv * 20.0 - time * 0.3) * 0.5;
  
  // Mix colors based on noise
  vec3 color = mix(color1, color2, n);
  
  // Add pulsing effect
  float pulse = sin(time * 2.0) * 0.5 + 0.5;
  color *= (0.8 + pulse * 0.2);
  
  gl_FragColor = vec4(color, 1.0);
}
```

### Performance Optimization

1. **Geometry Instancing**: If adding more planets, use instanced rendering
2. **Texture Atlasing**: Combine textures to reduce draw calls
3. **Level of Detail**: Reduce planet geometry detail when far from camera
4. **Shader Optimization**: Minimize complex calculations in fragment shader

### Windows Development Setup

**Python Virtual Environment:**
```powershell
# Create virtual environment
python -m venv venv

# Activate (Windows PowerShell)
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

**Frontend Setup:**
```powershell
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

**Running Both Servers:**
```powershell
# Terminal 1 - Backend
cd backend
.\venv\Scripts\activate
uvicorn main:app --reload

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Technology Decisions

### Why React Three Fiber?
- Declarative API for Three.js
- React component model for 3D objects
- Better integration with React ecosystem
- Easier state management

### Why FastAPI?
- Modern Python web framework
- Automatic API documentation
- Built-in data validation with Pydantic
- Excellent performance
- Easy CORS configuration

### Why Vite?
- Fast development server with HMR
- Optimized production builds
- Native ES modules support
- Better TypeScript integration than CRA

### Why Tailwind CSS?
- Utility-first approach for rapid development
- Small bundle size with purging
- Consistent design system
- Easy to create glassmorphism effects

## Security Considerations

1. **CORS Configuration**: Restrict to specific origins in production
2. **Input Validation**: Validate all user inputs on backend
3. **Rate Limiting**: Implement rate limiting on API endpoints
4. **XSS Prevention**: Sanitize any user-generated content
5. **HTTPS**: Use HTTPS in production for secure communication

## Deployment Considerations

### Frontend Deployment
- Build static files: `npm run build`
- Deploy to Vercel, Netlify, or similar
- Configure environment variables for API URL

### Backend Deployment
- Use production ASGI server (Uvicorn with Gunicorn)
- Set up proper logging
- Configure environment variables
- Use process manager (PM2, systemd)

### Environment Variables

**Frontend (.env):**
```
VITE_API_URL=http://localhost:8000
```

**Backend (.env):**
```
CORS_ORIGINS=http://localhost:5173
PORT=8000
```

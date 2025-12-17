import * as THREE from 'three';

// Planet data structure
export interface PlanetData {
  id: string;
  color: string;
  size: number;
  orbitRadius: number;
  orbitSpeed: number;
}

// API request/response types
export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  response: string;
  timestamp: string;
}

// Shader uniform types
export interface QuasarUniforms {
  time: { value: number };
  color1: { value: THREE.Color };
  color2: { value: THREE.Color };
  color3?: { value: THREE.Color };
}

export interface AccretionDiskUniforms {
  time: { value: number };
  color1: { value: THREE.Color };
  color2: { value: THREE.Color };
}

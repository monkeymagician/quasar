import { useState } from 'react';
import Scene from './components/Scene';
import UI from './components/UI';
import { chatWithBackend } from './api/client';

function App() {
  const [showModal, setShowModal] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleAndromedaClick = async () => {
    console.log('🌌 Andromeda Galaxy button clicked!');
    setShowModal(true);
    setIsLoading(true);
    setError('');
    setAiResponse('');
    
    try {
      const response = await chatWithBackend('Hello from the TON-618 Quasar!');
      setAiResponse(response.response);
      console.log('✅ API Response:', response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to backend';
      setError(errorMessage);
      console.error('❌ API Error:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* 3D Canvas Background */}
      <Scene className="absolute inset-0" />
      
      {/* UI Overlay */}
      <UI onAndromedaClick={handleAndromedaClick} />
      
      {/* Modal for AI response */}
      {showModal && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-auto z-50">
          <div className="
            bg-black/80 backdrop-blur-md
            border-2 border-neon-purple
            rounded-xl p-8 max-w-2xl max-h-[80vh] overflow-y-auto
            shadow-[0_0_40px_rgba(191,0,255,0.6)]
          ">
            <h2 className="text-2xl font-orbitron font-bold text-neon-purple mb-4">
              🤖 AI Agent Response
            </h2>
            
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-blue"></div>
                <p className="ml-4 text-white/80 font-rajdhani">Connecting to backend...</p>
              </div>
            )}
            
            {error && (
              <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-4">
                <p className="text-red-300 font-rajdhani">
                  ⚠️ {error}
                </p>
                <p className="text-red-200/60 text-sm mt-2">
                  Make sure the backend server is running on port 8000
                </p>
              </div>
            )}
            
            {aiResponse && (
              <div className="bg-neon-purple/10 border border-neon-purple/50 rounded-lg p-4 mb-6">
                <p className="text-white/90 font-rajdhani text-lg leading-relaxed">
                  {aiResponse}
                </p>
              </div>
            )}
            
            <button
              onClick={() => setShowModal(false)}
              className="
                px-6 py-2
                font-orbitron font-bold
                bg-neon-purple/20
                border border-neon-purple
                rounded-lg
                text-neon-purple
                hover:bg-neon-purple/30
                hover:shadow-[0_0_20px_rgba(191,0,255,0.5)]
                transition-all duration-300
              "
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

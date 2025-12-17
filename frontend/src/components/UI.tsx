interface UIProps {
  onAndromedaClick: () => void;
}

function UI({ onAndromedaClick }: UIProps) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Top-right button */}
      <div className="absolute top-6 right-6 pointer-events-auto">
        <button
          onClick={onAndromedaClick}
          className="
            px-6 py-3
            font-orbitron font-bold text-lg
            bg-black/30 backdrop-blur-md
            border-2 border-neon-blue
            rounded-lg
            text-neon-blue
            shadow-[0_0_20px_rgba(0,243,255,0.5)]
            hover:shadow-[0_0_30px_rgba(0,243,255,0.8)]
            hover:bg-black/40
            hover:scale-105
            transition-all duration-300
            cursor-pointer
          "
        >
          🌌 Andromeda Galaxy
        </button>
      </div>
      
      {/* Bottom-left info panel */}
      <div className="absolute bottom-6 left-6 pointer-events-auto">
        <div className="
          px-4 py-3
          font-rajdhani
          bg-black/40 backdrop-blur-md
          border border-neon-purple/50
          rounded-lg
          text-white/80
          shadow-[0_0_15px_rgba(191,0,255,0.3)]
        ">
          <h3 className="text-neon-purple font-bold text-sm mb-1">TON-618 Quasar</h3>
          <p className="text-xs">Most massive black hole known</p>
          <p className="text-xs text-gray-400 mt-1">Click planets to explore • Press R to reset view</p>
        </div>
      </div>
      
      {/* Title overlay removed - don't obstruct the beautiful black hole! */}
    </div>
  );
}

export default UI;

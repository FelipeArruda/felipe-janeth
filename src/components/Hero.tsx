import { Heart } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <style>{`
        @keyframes hero-reveal {
          0% {
            clip-path: inset(0 0 0 0);
          }
          100% {
            clip-path: inset(0 0 0 100%);
          }
        }

        .hero-reveal {
          animation: hero-reveal 2.6s ease-in-out forwards;
          animation-delay: 0.1s;
          will-change: clip-path;
        }

        .hero-content {
          opacity: 0;
          animation: hero-content-fade 1.2s ease-out forwards;
          animation-delay: 1.2s;
        }

        @keyframes hero-content-fade {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/IMG_1450.JPG)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50"></div>
        <div className="absolute inset-0 bg-slate-950/35 hero-reveal"></div>
      </div>

      <div className="relative z-10 text-center text-white px-4 hero-content">
        <div className="mb-8 flex justify-center">
          <Heart className="w-16 h-16 fill-rose-400 text-rose-400 animate-pulse" />
        </div>

        <h1 className="font-serif text-6xl md:text-8xl mb-4 tracking-wide">
          Felipe <span className="text-rose-400">&</span> Janeth
        </h1>

        <div className="w-32 h-1 bg-rose-400 mx-auto mb-6"></div>

        <p className="text-2xl md:text-3xl font-light tracking-wider mb-8">
          Vamos nos casar!
        </p>

        <p className="text-xl md:text-2xl font-light">
          27 de Abril de 2026
        </p>
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-white rounded-full"></div>
        </div>
      </div>
    </section>
  );
}

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/gallery/hero.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 38%',
        }}
      >
        <div className="absolute inset-0 bg-black/15"></div>
      </div>

      <div className="absolute bottom-8 left-1/2 z-10 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-white rounded-full"></div>
        </div>
      </div>
    </section>
  );
}

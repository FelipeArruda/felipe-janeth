export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/paris1.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 60%',
        }}
      >
        <div className="absolute inset-0 bg-black/15"></div>
      </div>

      <div className="relative z-10 text-center text-white px-4">
        <h1 className="font-serif text-6xl md:text-8xl mb-4 tracking-wide leading-none md:leading-tight">
          <span className="block md:inline">Janeth</span>{' '}
          <span className="block md:inline text-rose-400">&</span>{' '}
          <span className="block md:inline">Felipe</span>
        </h1>

        <div className="w-32 h-1 bg-rose-400 mx-auto mb-6"></div>

        <p className="text-2xl md:text-3xl font-light tracking-wider mb-8">
          Vamos nos casar!
        </p>

        <p className="text-xl md:text-2xl font-light">
          24 de Abril de 2026
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

import { Calendar, MapPin, Clock } from 'lucide-react';

interface SaveTheDateProps {
  onRSVPClick: () => void;
}

export default function SaveTheDate({ onRSVPClick }: SaveTheDateProps) {
  const mapsUrl =
    'https://www.google.com/maps/search/?api=1&query=Ladeira+Alexandre+Leonel,+221+-+Loja+102+-+Sao+Mateus,+Juiz+de+Fora+-+MG,+36033-240';

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-rose-500 to-rose-600 text-white">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-rose-100" />
          <h2 className="font-serif text-5xl md:text-6xl mb-4">Reserve a Data</h2>
          <div className="w-24 h-1 bg-white mx-auto"></div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 mb-8">
          <p className="text-6xl md:text-8xl font-serif mb-4">24</p>
          <p className="text-3xl md:text-4xl font-light mb-2">Abril</p>
          <p className="text-3xl md:text-4xl font-light">2026</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <Clock className="w-8 h-8 mx-auto mb-3 text-rose-100" />
            <h3 className="font-serif text-2xl mb-2">Horário</h3>
            <p className="text-lg text-rose-100">18h às 21h</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <MapPin className="w-8 h-8 mx-auto mb-3 text-rose-100" />
            <h3 className="font-serif text-2xl mb-2">Local</h3>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-block text-lg text-rose-100 underline underline-offset-4 hover:text-white"
            >
              Lourdes Square Spazio
            </a>
          </div>
        </div>

        <div className="mt-12">
          <p className="text-xl md:text-2xl font-light text-rose-100 mb-8">
            Mal podemos esperar para celebrar este momento especial com vocês!
          </p>
          <button
            onClick={onRSVPClick}
            className="px-10 py-4 bg-white text-rose-500 font-semibold rounded-lg hover:bg-rose-50 transition-colors inline-block"
          >
            Confirme Sua Presença
          </button>
        </div>
      </div>
    </section>
  );
}

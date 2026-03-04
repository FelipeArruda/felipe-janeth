import { Calendar, MapPin, Clock } from 'lucide-react';

interface SaveTheDateProps {
  onRSVPClick: () => void;
  rsvpDeadline?: string;
}

const parseDeadline = (value?: string): Date | null => {
  if (!value) return null;

  // If only the date is provided, keep RSVP open until end of day in Brasilia time.
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T23:59:59.999-03:00`);
  }

  // If datetime is provided without timezone, assume Brasilia timezone.
  const hasTimezone = /(Z|[+-]\d{2}:\d{2})$/.test(value);
  const normalizedValue = hasTimezone ? value : `${value}-03:00`;
  const parsed = new Date(normalizedValue);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

export default function SaveTheDate({ onRSVPClick, rsvpDeadline }: SaveTheDateProps) {
  const mapsUrl =
    'https://www.google.com/maps/search/?api=1&query=Ladeira+Alexandre+Leonel,+221+-+Loja+102+-+Sao+Mateus,+Juiz+de+Fora+-+MG,+36033-240';

  const deadlineDate = parseDeadline(rsvpDeadline);
  const isRSVPOpen = !deadlineDate || Date.now() <= deadlineDate.getTime();
  const cardBaseClass =
    'rounded-2xl border border-white/20 bg-white/12 backdrop-blur-sm shadow-[0_8px_24px_rgba(76,9,28,0.18)]';

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-rose-500 to-rose-600 text-white">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-8">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-rose-100" />
          <h2 className="font-serif text-5xl md:text-6xl mb-4">Reserve a Data</h2>
          <div className="w-24 h-1 bg-white mx-auto"></div>
        </div>

        <div className={`${cardBaseClass} mb-8 px-8 py-10 md:py-12`}>
          <div className="mx-auto max-w-sm">
            <p className="text-6xl md:text-8xl font-serif leading-none">24</p>
            <p className="mt-4 text-3xl md:text-4xl font-light leading-none">Abril</p>
            <p className="mt-3 text-3xl md:text-4xl font-light leading-none">2026</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <div className={`${cardBaseClass} min-h-[176px] px-6 py-7 flex flex-col items-center justify-center`}>
            <Clock className="w-8 h-8 mx-auto mb-4 text-rose-100" />
            <h3 className="font-serif text-2xl mb-3">Horário</h3>
            <p className="text-2xl font-medium tracking-tight">18h às 21h</p>
          </div>

          <div className={`${cardBaseClass} min-h-[176px] px-6 py-7 flex flex-col items-center justify-center`}>
            <MapPin className="w-8 h-8 mx-auto mb-4 text-rose-100" />
            <h3 className="font-serif text-2xl mb-3">Local</h3>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-block text-2xl font-medium tracking-tight text-white underline underline-offset-4 decoration-white/70 hover:decoration-white"
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
            disabled={!isRSVPOpen}
            className="px-10 py-4 bg-white text-rose-500 font-semibold rounded-lg hover:bg-rose-50 transition-colors inline-block disabled:bg-white/60 disabled:text-rose-200 disabled:cursor-not-allowed"
          >
            {isRSVPOpen ? 'Confirme Sua Presença' : 'Confirmações Encerradas'}
          </button>
        </div>
      </div>
    </section>
  );
}

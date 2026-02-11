import { Gift } from 'lucide-react';

const AMAZON_LIST_URL =
  'https://www.amazon.com.br/hz/wishlist/ls/YBNA9SEONVOM?ref_=wl_share';

export default function GiftRegistry() {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-white via-rose-50 to-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <Gift className="w-12 h-12 text-rose-400 mx-auto mb-4" />
          <h2 className="font-serif text-4xl md:text-5xl mb-4 text-gray-800">
            Lista de Presentes
          </h2>
          <p className="text-lg text-gray-600">
            Ajude-nos a começar nossa jornada juntos! Acesse a lista completa na
            Amazon.
          </p>
        </div>

        <div className="flex justify-center">
          <a
            href={AMAZON_LIST_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 rounded-full bg-rose-400 px-8 py-4 text-white text-base font-semibold shadow-lg transition-transform duration-300 hover:scale-105 hover:bg-rose-500"
          >
            Ver lista na Amazon
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
              →
            </span>
          </a>
        </div>

      </div>
    </section>
  );
}

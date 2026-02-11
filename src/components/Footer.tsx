import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex items-center justify-center mb-4">
          <Heart className="w-8 h-8 text-rose-400 fill-rose-400 animate-pulse" />
        </div>

        <h3 className="font-serif text-3xl mb-2">Felipe & Janeth</h3>
        <p className="text-gray-400 mb-6">27 de Abril de 2026</p>

        <div className="w-32 h-px bg-gray-700 mx-auto mb-6"></div>

        <p className="text-gray-400 text-sm">
          Feito com amor para celebrar nosso amor
        </p>
      </div>
    </footer>
  );
}

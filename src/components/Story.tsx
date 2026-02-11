import { Smartphone, Heart } from 'lucide-react';

export default function Story() {
  return (
    <section className="py-20 px-4 max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="font-serif text-5xl md:text-6xl text-gray-800 mb-4">Nossa História</h2>
        <div className="w-24 h-1 bg-rose-400 mx-auto"></div>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="order-2 md:order-1">
          <div className="bg-white rounded-2xl shadow-xl p-8 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-center mb-6">
              <Smartphone className="w-12 h-12 text-rose-500" />
              <Heart className="w-8 h-8 text-rose-400 mx-4 fill-rose-400" />
              <Smartphone className="w-12 h-12 text-rose-500" />
            </div>

            <h3 className="font-serif text-3xl text-center mb-6 text-gray-800">
              Começou com um Match
            </h3>

            <p className="text-gray-600 text-lg leading-relaxed mb-4">
              Tudo começou no Tinder, onde um simples "match" se transformou em algo muito mais especial.
              Felipe, engenheiro de dados, e Janeth, professora de português, descobriram que tinham muito
              mais em comum do que imaginavam.
            </p>

            <p className="text-gray-600 text-lg leading-relaxed">
              O que começou com conversas online rapidamente se tornou encontros inesquecíveis, viagens
              pelo mundo, e a construção de uma vida juntos. Hoje, estamos prontos para celebrar nosso
              amor com todos que fazem parte da nossa história.
            </p>
          </div>
        </div>

        <div className="order-1 md:order-2">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <img
              src="https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Casal"
              className="w-full h-[500px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
          </div>
        </div>
      </div>
    </section>
  );
}

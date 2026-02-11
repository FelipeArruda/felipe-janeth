import { Dog, Baby, Heart } from 'lucide-react';

export default function Family() {
  return (
    <section className="py-20 px-4 bg-gradient-to-b from-rose-50 to-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-4">
            <Heart className="w-10 h-10 text-rose-500 fill-rose-500" />
          </div>
          <h2 className="font-serif text-5xl md:text-6xl text-gray-800 mb-4">Nossa Família</h2>
          <div className="w-24 h-1 bg-rose-400 mx-auto"></div>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition-all duration-300">
            <div className="relative h-64">
              <img
                src="https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Dog"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              <div className="absolute top-4 right-4 bg-white rounded-full p-3">
                <Dog className="w-8 h-8 text-amber-500" />
              </div>
            </div>
            <div className="p-8">
              <h3 className="font-serif text-3xl text-gray-800 mb-4">Minnie</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Nossa cachorrinha querida que nos enche de alegria todos os dias. Minnie é parte
                essencial da nossa família e sempre nos recebe com muito amor e carinho.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition-all duration-300">
            <div className="relative h-64 bg-gradient-to-br from-blue-100 to-blue-200">
              <img
                src="https://images.pexels.com/photos/1912868/pexels-photo-1912868.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Baby"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              <div className="absolute top-4 right-4 bg-white rounded-full p-3">
                <Baby className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <div className="p-8">
              <h3 className="font-serif text-3xl text-gray-800 mb-4">Benício</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Estamos esperando ansiosamente pela chegada do Benício, nosso primeiro filho.
                Ele já é muito amado e será recebido com todo carinho em nossa família que está crescendo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

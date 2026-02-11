import { MapPin, Plane } from 'lucide-react';

export default function Travels() {
  const destinations = [
    {
      name: "Ibitipoca, MG",
      image: "https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=800",
      description: "Natureza e aventura"
    },
    {
      name: "Recife",
      image: "https://images.pexels.com/photos/2412609/pexels-photo-2412609.jpeg?auto=compress&cs=tinysrgb&w=800",
      description: "Praias paradisíacas"
    },
    {
      name: "Lisboa, Portugal",
      image: "https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg?auto=compress&cs=tinysrgb&w=800",
      description: "Charme europeu"
    },
    {
      name: "Paris, França",
      image: "https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg?auto=compress&cs=tinysrgb&w=800",
      description: "A cidade do amor"
    },
    {
      name: "Curaçao",
      image: "https://images.pexels.com/photos/1007657/pexels-photo-1007657.jpeg?auto=compress&cs=tinysrgb&w=800",
      description: "Águas cristalinas"
    }
  ];

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-4">
            <Plane className="w-10 h-10 text-rose-500" />
          </div>
          <h2 className="font-serif text-5xl md:text-6xl text-gray-800 mb-4">Nossas Aventuras</h2>
          <div className="w-24 h-1 bg-rose-400 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Viajar juntos nos ensinou que o amor é a melhor companhia em qualquer destino
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map((destination, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-300 cursor-pointer h-80"
            >
              <img
                src={destination.image}
                alt={destination.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="flex items-center mb-2">
                  <MapPin className="w-5 h-5 mr-2 text-rose-400" />
                  <h3 className="font-serif text-2xl">{destination.name}</h3>
                </div>
                <p className="text-gray-200">{destination.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

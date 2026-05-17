import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react';

interface Photo {
  name: string;
  path: string;
}

export default function WeddingGallery() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPhotos = async () => {
      try {
        const response = await fetch('/api/gallery-photos');
        const data = await response.json();
        setPhotos(data.photos || []);
      } catch (error) {
        console.error('Error loading gallery photos:', error);
        setPhotos([]);
      } finally {
        setLoading(false);
      }
    };

    loadPhotos();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;

      if (e.key === 'Escape') {
        setSelectedIndex(null);
      } else if (e.key === 'ArrowLeft') {
        setSelectedIndex((prev) => (prev! > 0 ? prev! - 1 : photos.length - 1));
      } else if (e.key === 'ArrowRight') {
        setSelectedIndex((prev) => (prev! < photos.length - 1 ? prev! + 1 : 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, photos.length]);

  const downloadPhoto = (photo: Photo) => {
    const link = document.createElement('a');
    link.href = photo.path;
    link.download = photo.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllPhotos = () => {
    photos.forEach((photo, index) => {
      setTimeout(() => {
        downloadPhoto(photo);
      }, index * 200);
    });
  };

  if (loading) {
    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-rose-400 animate-pulse">Carregando fotos...</p>
          </div>
        </div>
      </section>
    );
  }

  if (photos.length === 0) {
    return null;
  }

  return (
    <>
      {/* Decorative Separator */}
      <div className="flex justify-center items-center py-8 px-4">
        <div className="flex-1 max-w-xs h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent"></div>
        <div className="px-4 text-rose-400 text-2xl">♥</div>
        <div className="flex-1 max-w-xs h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent"></div>
      </div>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
          <div className="mb-4">
            <h2 className="font-serif text-5xl md:text-6xl text-gray-900 mb-2">
              Momentos do Nosso Dia
            </h2>
            <div className="w-24 h-1 bg-rose-400 mx-auto"></div>
          </div>
          <p className="text-gray-600 text-lg mt-6">
            Reviva os melhores momentos do nosso casamento
          </p>
          {photos.length > 0 && (
            <button
              onClick={downloadAllPhotos}
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-rose-400 text-white rounded-lg hover:bg-rose-500 transition-colors duration-200 font-medium"
            >
              <Download size={20} />
              Baixar todas as fotos
            </button>
          )}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {photos.map((photo, index) => (
            <div
              key={index}
              className="group relative aspect-square overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer bg-gray-100"
              onClick={() => setSelectedIndex(index)}
            >
              {/* Image */}
              <img
                src={photo.path}
                alt={`Foto do casamento ${index + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadPhoto(photo);
                    }}
                    className="p-3 bg-white rounded-full hover:bg-rose-50 transition-colors duration-200 shadow-lg"
                    title="Baixar foto"
                  >
                    <Download size={24} className="text-rose-400" />
                  </button>
                </div>
              </div>

              {/* Index indicator on hover */}
              <div className="absolute top-3 right-3 px-3 py-1 bg-white/90 rounded-full text-sm font-medium text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {index + 1} / {photos.length}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {selectedIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4">
          {/* Close button */}
          <button
            onClick={() => setSelectedIndex(null)}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full transition-colors duration-200"
            title="Fechar (ESC)"
          >
            <X size={32} />
          </button>

          {/* Image container */}
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={photos[selectedIndex].path}
              alt={`Foto ${selectedIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />

            {/* Photo counter */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium">
              {selectedIndex + 1} / {photos.length}
            </div>

            {/* Download button in lightbox */}
            <button
              onClick={() => downloadPhoto(photos[selectedIndex])}
              className="absolute bottom-4 right-4 p-3 bg-rose-400 text-white rounded-full hover:bg-rose-500 transition-colors duration-200 shadow-lg"
              title="Baixar foto"
            >
              <Download size={24} />
            </button>
          </div>

          {/* Navigation buttons */}
          {photos.length > 1 && (
            <>
              <button
                onClick={() =>
                  setSelectedIndex((prev) => (prev! > 0 ? prev! - 1 : photos.length - 1))
                }
                className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors duration-200 backdrop-blur-sm"
                title="Foto anterior (← seta)"
              >
                <ChevronLeft size={28} />
              </button>

              <button
                onClick={() =>
                  setSelectedIndex((prev) => (prev! < photos.length - 1 ? prev! + 1 : 0))
                }
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors duration-200 backdrop-blur-sm"
                title="Próxima foto (→ seta)"
              >
                <ChevronRight size={28} />
              </button>
            </>
          )}
        </div>
        )}
      </section>
    </>
  );
}

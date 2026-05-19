import { useEffect, useMemo, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react';

interface Photo {
  name: string;
  path: string;
}

const isHeroPhoto = (photo: Photo) => {
  const normalizedName = photo.name.trim().toLowerCase();
  return normalizedName === 'hero.jpg' || normalizedName === 'hero.png';
};

export default function WeddingGallery() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [imageRatios, setImageRatios] = useState<Record<string, number>>({});
  const [columnCount, setColumnCount] = useState(1);
  const apiBase = useMemo(() => '', []);

  useEffect(() => {
    const updateColumnCount = () => {
      const width = window.innerWidth;
      if (width >= 1280) {
        setColumnCount(4);
      } else if (width >= 1024) {
        setColumnCount(3);
      } else if (width >= 640) {
        setColumnCount(2);
      } else {
        setColumnCount(1);
      }
    };

    updateColumnCount();
    window.addEventListener('resize', updateColumnCount);
    return () => window.removeEventListener('resize', updateColumnCount);
  }, []);

  useEffect(() => {
    const loadPhotos = async () => {
      try {
        const response = await fetch(`${apiBase}/api/gallery-photos`);
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        const data = await response.json();
        const apiPhotos = Array.isArray(data?.photos) ? data.photos.filter((photo: Photo) => !isHeroPhoto(photo)) : [];

        if (apiPhotos.length > 0) {
          setPhotos(apiPhotos);
          return;
        }

        const fallbackResponse = await fetch('/gallery/gallery.json');
        if (!fallbackResponse.ok) {
          setPhotos([]);
          return;
        }

        const fallbackData = await fallbackResponse.json();
        const fallbackPhotos = Array.isArray(fallbackData?.photos)
          ? fallbackData.photos.filter((photo: Photo) => !isHeroPhoto(photo))
          : [];
        setPhotos(fallbackPhotos);
      } catch (error) {
        try {
          const fallbackResponse = await fetch('/gallery/gallery.json');
          if (!fallbackResponse.ok) {
            setPhotos([]);
          } else {
            const fallbackData = await fallbackResponse.json();
            const fallbackPhotos = Array.isArray(fallbackData?.photos)
              ? fallbackData.photos.filter((photo: Photo) => !isHeroPhoto(photo))
              : [];
            setPhotos(fallbackPhotos);
          }
        } catch (fallbackError) {
          console.error('Error loading gallery photos:', error, fallbackError);
          setPhotos([]);
        }
      } finally {
        setLoading(false);
      }
    };

    loadPhotos();
  }, [apiBase]);

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

  const balancedColumns = useMemo(() => {
    const columns: Array<Array<{ photo: Photo; index: number }>> = Array.from({ length: columnCount }, () => []);
    const heights = Array.from({ length: columnCount }, () => 0);

    photos.forEach((photo, index) => {
      let target = 0;
      for (let i = 1; i < columnCount; i += 1) {
        if (heights[i] < heights[target]) target = i;
      }

      const ratio = imageRatios[photo.path] || 1.3;
      columns[target].push({ photo, index });
      heights[target] += ratio + 0.1;
    });

    return columns;
  }, [photos, imageRatios, columnCount]);
  const hasPhotos = photos.length > 0;

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

  return (
    <>
      <div className="flex justify-center items-center pt-6 pb-2 px-4">
        <div className="flex-1 max-w-xs h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent" />
        <div className="px-4 text-rose-400 text-2xl">&hearts;</div>
        <div className="flex-1 max-w-xs h-px bg-gradient-to-r from-transparent via-rose-400 to-transparent" />
      </div>

      <section className="pt-8 pb-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="mb-4">
              <p className="uppercase tracking-[0.3em] text-rose-400 text-xs sm:text-sm mb-3">Janeth & Felipe</p>
              <h2 className="font-serif text-4xl md:text-6xl text-gray-900 mb-2">24.04.2026</h2>
              <div className="w-24 h-1 bg-rose-400 mx-auto" />
            </div>
          </div>

          {hasPhotos ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 items-start">
              {balancedColumns.map((column, colIndex) => (
                <div key={`col-${colIndex}`} className="flex flex-col gap-4 sm:gap-6">
                  {column.map(({ photo, index }) => (
                    <div
                      key={photo.path}
                      className="group relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
                      onClick={() => setSelectedIndex(index)}
                    >
                      {!loadedImages[photo.path] && (
                        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-rose-100 via-rose-50 to-white" />
                      )}

                      <img
                        src={photo.path}
                        alt={`Foto do casamento ${index + 1}`}
                        loading="lazy"
                        onLoad={(e) => {
                          setLoadedImages((prev) => ({
                            ...prev,
                            [photo.path]: true,
                          }));
                          const { naturalWidth, naturalHeight } = e.currentTarget;
                          if (naturalWidth > 0 && naturalHeight > 0) {
                            setImageRatios((prev) => ({
                              ...prev,
                              [photo.path]: naturalHeight / naturalWidth,
                            }));
                          }
                        }}
                        className={`w-full h-auto group-hover:scale-105 transition-all duration-300 ${
                          loadedImages[photo.path] ? 'opacity-100 blur-0' : 'opacity-0 blur-sm'
                        }`}
                      />

                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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

                      <div className="absolute top-3 right-3 px-3 py-1 bg-white/90 rounded-full text-sm font-medium text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {index + 1} / {photos.length}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-rose-100 bg-rose-50/60 p-8 text-center">
              <p className="text-gray-700 font-medium">Nenhuma foto encontrada na galeria.</p>
              <p className="text-gray-500 text-sm mt-2">
                Adicione imagens em <code>/public/gallery</code> para exibir aqui.
              </p>
            </div>
          )}
        </div>

        {selectedIndex !== null && (
          <div
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setSelectedIndex(null)}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedIndex(null);
              }}
              className="absolute top-4 right-4 z-[70] p-2 text-white hover:bg-white/10 rounded-full transition-colors duration-200"
              title="Fechar (ESC)"
            >
              <X size={32} />
            </button>

            <div
              className="relative w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={photos[selectedIndex].path}
                alt={`Foto ${selectedIndex + 1}`}
                className="max-w-full max-h-full object-contain"
              />

              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium">
                {selectedIndex + 1} / {photos.length}
              </div>

              <button
                onClick={() => downloadPhoto(photos[selectedIndex])}
                className="absolute bottom-4 right-4 p-3 bg-rose-400 text-white rounded-full hover:bg-rose-500 transition-colors duration-200 shadow-lg"
                title="Baixar foto"
              >
                <Download size={24} />
              </button>
            </div>

            {photos.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIndex((prev) => (prev! > 0 ? prev! - 1 : photos.length - 1));
                  }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors duration-200 backdrop-blur-sm"
                  title="Foto anterior (seta esquerda)"
                >
                  <ChevronLeft size={28} />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIndex((prev) => (prev! < photos.length - 1 ? prev! + 1 : 0));
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors duration-200 backdrop-blur-sm"
                  title="Proxima foto (seta direita)"
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

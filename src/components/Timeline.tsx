import { Briefcase, Heart, Baby, Home } from 'lucide-react';

type Milestone = {
  icon: typeof Heart;
  title: string;
  date: string;
  description: string;
  color: string;
};

export default function Timeline() {
  const milestones: Milestone[] = [
    {
      icon: Heart,
      title: 'Primeiro Match',
      date: 'Junho de 2021',
      description: 'Nos conhecemos na internet e descobrimos uma conexao especial',
      color: 'bg-rose-500',
    },
    {
      icon: Briefcase,
      title: 'Viagens',
      date: '2022',
      description: 'Descobrimos o mundo juntos, criando memórias inesquecíveis em cada destino',
      color: 'bg-amber-500',
    },
    {
      icon: Home,
      title: 'Mudança',
      date: '2023 - 2024',
      description: 'Decidimos morar juntos, construindo um lar cheio de amor e alegria',
      color: 'bg-pink-500',
    },
    {
      icon: Baby,
      title: 'Benício a caminho',
      date: '2025 -2026',
      description: 'Estamos esperando nosso primeiro filho que chegará em breve',
      color: 'bg-blue-500',
    },
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-white to-rose-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif text-5xl md:text-6xl text-gray-800 mb-4">Nossa Jornada</h2>
          <div className="w-24 h-1 bg-rose-400 mx-auto"></div>
        </div>

        <div className="relative">
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-rose-300 hidden md:block"></div>

          {milestones.map((milestone, index) => {
            const Icon = milestone.icon;
            const isEven = index % 2 === 0;

            return (
              <div key={index} className={`relative mb-12 ${isEven ? 'md:pr-1/2' : 'md:pl-1/2'}`}>
                <div className={`md:w-1/2 ${isEven ? 'md:ml-auto md:pl-12' : 'md:mr-auto md:pr-12'}`}>
                  <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-500 mb-3">
                      {milestone.date}
                    </p>
                    <div className={`${milestone.color} w-12 h-12 rounded-full flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-serif text-2xl text-gray-800 mb-2">{milestone.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{milestone.description}</p>
                  </div>
                </div>

                <div className="absolute left-1/2 top-6 transform -translate-x-1/2 w-4 h-4 bg-rose-400 rounded-full border-4 border-white hidden md:block"></div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

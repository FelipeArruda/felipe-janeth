import { useState, FormEvent } from 'react';
import { CheckCircle, ArrowLeft, Heart } from 'lucide-react';
import { publicApi } from '../lib/api';

interface FamilyMember {
  id: string;
  name: string;
  relationship: string | null;
}

interface MemberConfirmation {
  memberId: string;
  attending: boolean;
}

interface RSVPFormProps {
  familyId: string;
  familyName: string;
  members: FamilyMember[];
  onBack: () => void;
}

export default function RSVP({ familyId, familyName, members, onBack }: RSVPFormProps) {
  const [confirmations, setConfirmations] = useState<Record<string, MemberConfirmation>>(
    members.reduce((acc, member) => ({
      ...acc,
      [member.id]: {
        memberId: member.id,
        attending: true,
      },
    }), {})
  );

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [familyMessage, setFamilyMessage] = useState('');

  const handleMemberChange = (memberId: string, field: string, value: any) => {
    setConfirmations((prev) => ({
      ...prev,
      [memberId]: {
        ...prev[memberId],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const confirmationsArray = Object.values(confirmations).map((conf) => ({
        member_id: Number(conf.memberId),
        attending: conf.attending,
        message: familyMessage.trim() || null,
        family_id: familyId,
      }));

      await publicApi.sendConfirmations(confirmationsArray);
      setSubmitted(true);
    } catch (err) {
      setError('Erro ao enviar confirmação. Tente novamente.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <section className="py-20 px-4 bg-gradient-to-b from-white to-rose-50">
        <div className="max-w-2xl mx-auto text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h2 className="font-serif text-4xl mb-4 text-gray-800">
            Confirmação Recebida!
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Obrigado por confirmar sua presença! Estamos ansiosos para compartilhar este dia especial com você.
          </p>
          <button
            onClick={onBack}
            className="px-8 py-3 bg-rose-400 text-white rounded-lg hover:bg-rose-500 transition-colors"
          >
            Voltar ao Início
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-white via-rose-50/60 to-white">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-rose-400 hover:text-rose-500 mb-10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </button>

        <div className="text-center mb-12">
          <div className="mx-auto w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center mb-4 shadow-sm">
            <Heart className="w-10 h-10 text-rose-400" />
          </div>
          <h2 className="font-serif text-4xl md:text-5xl mb-3 text-gray-800">
            Bem-vindo, {familyName}!
          </h2>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Estamos felizes por ter você com a gente. Confirme a presença de cada pessoa da família.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 md:p-10">
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="divide-y divide-rose-100/70">
            {members.map((member) => (
              <div
                key={member.id}
                className="py-6 first:pt-0 last:pb-0"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-serif text-2xl text-gray-800">
                      {member.name}
                    </h3>
                    {member.relationship && (
                      <p className="text-sm text-gray-500">{member.relationship}</p>
                    )}
                  </div>
                  <div className="inline-flex rounded-full border border-rose-100 bg-white/80 p-1 shadow-sm">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name={`attending-${member.id}`}
                        checked={confirmations[member.id]?.attending === true}
                        onChange={(e) =>
                          handleMemberChange(member.id, 'attending', e.target.checked)
                        }
                        className="sr-only"
                      />
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                          confirmations[member.id]?.attending === true
                            ? 'bg-rose-500 text-white shadow'
                            : 'text-gray-600'
                        }`}
                      >
                        Vai
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name={`attending-${member.id}`}
                        checked={confirmations[member.id]?.attending === false}
                        onChange={(e) =>
                          handleMemberChange(
                            member.id,
                            'attending',
                            !e.target.checked
                          )
                        }
                        className="sr-only"
                      />
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                          confirmations[member.id]?.attending === false
                            ? 'bg-slate-900 text-white shadow'
                            : 'text-gray-600'
                        }`}
                      >
                        Não vai
                      </span>
                    </label>
                  </div>
                </div>

              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-rose-100 bg-white p-6 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mensagem da família (opcional)
            </label>
            <textarea
              value={familyMessage}
              onChange={(e) => setFamilyMessage(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200 resize-none bg-white"
              placeholder="Conte-nos algo especial..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-10 py-4 bg-gradient-to-r from-rose-400 to-pink-500 text-white font-semibold rounded-xl hover:from-rose-500 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? 'Enviando...' : 'Confirmar Presença'}
          </button>
        </form>
      </div>
    </section>
  );
}

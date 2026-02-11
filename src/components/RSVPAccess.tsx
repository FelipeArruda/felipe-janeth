import { useState, ChangeEvent, FormEvent } from 'react';
import { Key, AlertCircle, ArrowLeft } from 'lucide-react';
import { publicApi } from '../lib/api';

interface Family {
  id: number;
  family_name: string;
  access_code: string;
}

interface FamilyMember {
  id: number;
  name: string;
  relationship: string | null;
}

interface RSVPAccessProps {
  onAccessGranted: (familyId: string, familyName: string, members: FamilyMember[]) => void;
  onBack: () => void;
}

export default function RSVPAccess({ onAccessGranted, onBack }: RSVPAccessProps) {
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatAccessCode = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 4) {
      return cleaned;
    }
    return cleaned.slice(0, 4) + '-' + cleaned.slice(4, 8);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAccessCode(e.target.value);
    setAccessCode(formatted);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const normalizedCode = accessCode.replace('-', '');
      const data = await publicApi.getAccess(normalizedCode);
      const family = data.family as Family;

      onAccessGranted(
        family.id.toString(),
        family.family_name,
        (data.members || []) as FamilyMember[]
      );
    } catch (err) {
      setError('Código de acesso inválido. Verifique e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen py-20 px-4 bg-gradient-to-b from-white to-rose-50 flex items-center">
      <div className="max-w-md mx-auto w-full">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-rose-400 hover:text-rose-500 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar ao site
        </button>

        <div className="text-center mb-12">
          <Key className="w-12 h-12 text-rose-400 mx-auto mb-4" />
          <h1 className="font-serif text-4xl mb-4 text-gray-800">
            Confirme sua Presença
          </h1>
          <p className="text-lg text-gray-600">
            Digite o código enviado no convite para acessar sua confirmação de presença.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="mb-8">
            <label className="block text-gray-700 font-medium mb-3">
              Código de Acesso
            </label>
            <input
              type="text"
              value={accessCode}
              onChange={handleChange}
              placeholder="XXXX-XXXX"
              maxLength={9}
              required
              className="w-full px-4 py-4 text-center text-2xl font-mono tracking-widest border-2 border-gray-300 rounded-lg focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200 uppercase"
            />
            <p className="text-sm text-gray-500 mt-2">
              O código está no seu convite
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || accessCode.length < 9}
            className="w-full py-4 bg-gradient-to-r from-rose-400 to-pink-500 text-white font-semibold rounded-lg hover:from-rose-500 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verificando...' : 'Continuar'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-8">
          Não recebeu um convite?{' '}
          <span className="text-rose-400 font-medium">
            Entre em contato conosco
          </span>
        </p>
      </div>
    </section>
  );
}

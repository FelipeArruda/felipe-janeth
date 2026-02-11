import { useEffect, useMemo, useRef, useState, FormEvent } from 'react';
import { Key, LogOut, Pencil, Plus, Trash2, UserPlus } from 'lucide-react';
import { toPng } from 'html-to-image';
import { QRCodeSVG } from 'qrcode.react';
import { adminApi, publicApi } from '../lib/api';

interface Family {
  id: number;
  family_name: string;
  access_code: string;
  phone: string | null;
  notes: string | null;
  created_at: string;
}

interface FamilyMember {
  id: number;
  family_id: number;
  name: string;
  relationship: string | null;
}

interface MemberConfirmation {
  id: number;
  member_id: number;
  attending: number;
  dietary_restrictions: string | null;
  message: string | null;
  confirmed_at: string;
}

interface NewMember {
  name: string;
  relationship: string;
}

interface AdminProps {
  onExit: () => void;
}

const WEDDING_DATE = '27 Abril 2026';
const WEDDING_TIME = '18h';
const WEDDING_LOCATION = 'Lourdes Square';
const COUPLE_NAME = 'Felipe & Janeth';

const formatAccessCode = (value: string) => {
  const cleaned = value.replace(/\D/g, '').slice(0, 8);
  if (cleaned.length <= 4) return cleaned;
  return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}`;
};

const BoardingPassInvite = ({ family }: { family: Family }) => {
  const inviteUrl =
    typeof window !== 'undefined' && window.location?.origin
      ? `${window.location.origin}/?code=${family.access_code}`
      : family.access_code;

  return (
    <div className="relative w-[900px] h-[600px] rounded-[28px] bg-[#fbf7f2] border border-rose-100 shadow-none overflow-hidden">
      <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-rose-100/60 blur-3xl" />
      <div className="absolute -bottom-28 -right-28 h-72 w-72 rounded-full bg-amber-100/50 blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.8)_0,rgba(255,255,255,0.4)_35%,transparent_60%)] opacity-60" />

      <div className="absolute inset-x-12 top-12 border border-rose-100/80 rounded-[22px] h-[520px] bg-white/80 backdrop-blur-sm shadow-none" />

      <div className="absolute inset-x-24 top-20 text-center">
        <div className="text-[11px] uppercase tracking-[0.4em] text-rose-400">
          Convite de Casamento
        </div>
        <div className="mt-4 font-serif text-4xl text-gray-800">
          {COUPLE_NAME}
        </div>
        <div className="mt-2 text-sm text-gray-500">{family.family_name}</div>
        <div className="mt-4 text-sm text-gray-500 uppercase tracking-[0.2em]">
          com amor, convidamos você para celebrar conosco
        </div>
      </div>

      <div className="absolute left-24 top-[220px] right-24 flex items-center justify-center gap-6">
        <div className="h-px flex-1 bg-rose-200/70" />
        <div className="text-rose-400 text-sm uppercase tracking-[0.35em]">Save the Date</div>
        <div className="h-px flex-1 bg-rose-200/70" />
      </div>

      <div className="absolute left-24 top-[270px] right-24 grid grid-cols-3 gap-6 text-center">
        <div className="rounded-2xl bg-rose-50/70 border border-rose-100 p-4">
          <p className="text-[10px] uppercase tracking-[0.3em] text-rose-400">Data</p>
          <p className="mt-2 text-lg font-semibold text-gray-800">{WEDDING_DATE}</p>
        </div>
        <div className="rounded-2xl bg-rose-50/70 border border-rose-100 p-4">
          <p className="text-[10px] uppercase tracking-[0.3em] text-rose-400">Hora</p>
          <p className="mt-2 text-lg font-semibold text-gray-800">{WEDDING_TIME}</p>
        </div>
        <div className="rounded-2xl bg-rose-50/70 border border-rose-100 p-4">
          <p className="text-[10px] uppercase tracking-[0.3em] text-rose-400">Local</p>
          <p className="mt-2 text-lg font-semibold text-gray-800">{WEDDING_LOCATION}</p>
        </div>
      </div>

      <div className="absolute left-24 right-24 top-[360px] grid grid-cols-3 gap-6">
        <div />
        <div className="rounded-2xl bg-rose-50/70 border border-rose-100 px-4 py-5 flex flex-col items-center justify-center gap-3 text-center">
          <div className="text-[10px] uppercase tracking-[0.3em] text-rose-400">
            Confirme sua presença
          </div>
          <QRCodeSVG
            value={inviteUrl}
            size={72}
            bgColor="transparent"
            fgColor="#1f2937"
            level="M"
            includeMargin={false}
          />
          <div className="text-xs font-semibold text-gray-700">
            {formatAccessCode(family.access_code)}
          </div>
        </div>
        <div />
      </div>
    </div>
  );
};

export default function Admin({ onExit }: AdminProps) {
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [families, setFamilies] = useState<Family[]>([]);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [confirmations, setConfirmations] = useState<MemberConfirmation[]>([]);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const [familyName, setFamilyName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [newMembers, setNewMembers] = useState<NewMember[]>([
    { name: '', relationship: '' },
  ]);
  const [editingFamilyId, setEditingFamilyId] = useState<number | null>(null);
  const [inviteFamily, setInviteFamily] = useState<Family | null>(null);
  const inviteRef = useRef<HTMLDivElement | null>(null);
  const [downloadingInvite, setDownloadingInvite] = useState(false);

  const memberMap = useMemo(() => {
    return members.reduce<Record<string, FamilyMember[]>>((acc, member) => {
      acc[member.family_id] = acc[member.family_id] || [];
      acc[member.family_id].push(member);
      return acc;
    }, {});
  }, [members]);

  const confirmationMap = useMemo(() => {
    return confirmations.reduce<Record<number, MemberConfirmation>>((acc, conf) => {
      if (!acc[conf.member_id]) {
        acc[conf.member_id] = conf;
      }
      return acc;
    }, {});
  }, [confirmations]);

  const stats = useMemo(() => {
    const totalFamilies = families.length;
    const totalMembers = members.length;
    let attendingYes = 0;
    let attendingNo = 0;
    let pending = 0;

    members.forEach((member) => {
      const confirmation = confirmationMap[member.id];
      if (!confirmation) {
        pending += 1;
      } else if (confirmation.attending === 1) {
        attendingYes += 1;
      } else {
        attendingNo += 1;
      }
    });

    return {
      totalFamilies,
      totalMembers,
      attendingYes,
      attendingNo,
      pending,
    };
  }, [families.length, members, confirmationMap]);

  const handleExportCsv = () => {
    const escapeCsv = (value: string | number | null | undefined) => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      if (/[",\n]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = [
      [
        'familia',
        'telefone',
        'observacoes',
        'membro',
        'parentesco',
        'status',
        'confirmado_em',
      ],
    ];

    members.forEach((member) => {
      const family = families.find((item) => item.id === member.family_id);
      const confirmation = confirmationMap[member.id];
      const status = confirmation
        ? confirmation.attending === 1
          ? 'Sim'
          : 'Nao'
        : 'Pendente';
      rows.push([
        family?.family_name ?? '',
        family?.phone ?? '',
        family?.notes ?? '',
        member.name,
        member.relationship ?? '',
        status,
        confirmation?.confirmed_at ?? '',
      ]);
    });

    const csvContent = rows.map((row) => row.map(escapeCsv).join(',')).join('\n');
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'lista-convidados.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const loadData = async () => {
    setLoading(true);
    setFormError('');

    try {
      const data = await adminApi.getFamilies();
      setFamilies(data.families || []);
      setMembers(data.members || []);
      setConfirmations(data.confirmations || []);
    } catch (err) {
      setFormError('Erro ao carregar dados.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      const session = await adminApi.getSession();
      if (!isMounted) return;
      setSessionEmail(session?.email ?? null);
      setAuthLoading(false);
    };

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (sessionEmail) {
      loadData();
    }
  }, [sessionEmail]);

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      const data = await publicApi.login(email, password);
      adminApi.setToken(data.token);
      setSessionEmail(data.email);
      setAuthLoading(false);
    } catch (err) {
      setAuthError('Login inválido. Verifique seu email e senha.');
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    adminApi.clearToken();
    setSessionEmail(null);
    setEmail('');
    setPassword('');
  };

  const handleAddMember = () => {
    setNewMembers((prev) => [...prev, { name: '', relationship: '' }]);
  };

  const handleRemoveMember = (index: number) => {
    setNewMembers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMemberChange = (
    index: number,
    field: 'name' | 'relationship',
    value: string
  ) => {
    setNewMembers((prev) =>
      prev.map((member, i) =>
        i === index ? { ...member, [field]: value } : member
      )
    );
  };

  const handleDownloadInvite = async () => {
    if (!inviteRef.current || !inviteFamily) return;
    setDownloadingInvite(true);

    try {
      const dataUrl = await toPng(inviteRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `convite-${inviteFamily.family_name.replace(/\s+/g, '-')}.png`;
      link.click();
    } catch (err) {
      console.error('Erro ao gerar convite:', err);
    } finally {
      setDownloadingInvite(false);
    }
  };

  const handleCreateFamily = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');

    const validMembers = newMembers.filter((member) => member.name.trim());

    if (!familyName.trim()) {
      setFormError('Informe o nome da família.');
      return;
    }

    if (validMembers.length === 0) {
      setFormError('Adicione pelo menos um familiar.');
      return;
    }

    setLoading(true);

    try {
      if (editingFamilyId) {
        await adminApi.updateFamily(editingFamilyId, {
          family_name: familyName.trim(),
          phone: phone.trim() || null,
          notes: notes.trim() || null,
          members: validMembers,
        });
      } else {
        await adminApi.createFamily({
          family_name: familyName.trim(),
          phone: phone.trim() || null,
          notes: notes.trim() || null,
          members: validMembers,
        });
      }

      setFamilyName('');
      setPhone('');
      setNotes('');
      setNewMembers([{ name: '', relationship: '' }]);
      setEditingFamilyId(null);

      await loadData();
    } catch (err) {
      setFormError('Erro ao salvar família.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-rose-50">
        <p className="text-gray-500">Carregando...</p>
      </section>
    );
  }

  if (!sessionEmail) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-rose-50 px-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-6">
            <Key className="w-12 h-12 text-rose-400 mx-auto mb-4" />
            <h1 className="font-serif text-3xl text-gray-800">Área Administrativa</h1>
            <p className="text-gray-600 mt-2">Acesse com seu email e senha.</p>
          </div>

          {authError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded">
              {authError}
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
                required
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 rounded-lg bg-rose-400 text-white font-semibold hover:bg-rose-500 transition-colors"
            >
              Entrar
            </button>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-b from-white to-rose-50 px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
          <div>
            <h1 className="font-serif text-4xl text-gray-800">Painel de Convidados</h1>
            <p className="text-gray-600">Logado como {sessionEmail}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={onExit}
              className="px-4 py-2 rounded-lg border border-rose-200 text-rose-500 hover:bg-rose-50 transition-colors"
            >
              Voltar ao site
            </button>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[380px,1fr] gap-8">
          <form
            onSubmit={handleCreateFamily}
            className="bg-white rounded-xl shadow-lg p-6 space-y-4"
          >
            <div className="flex items-center gap-2 text-rose-500 font-semibold">
              <UserPlus className="w-5 h-5" />
              {editingFamilyId ? 'Editar família' : 'Nova família'}
            </div>

            {formError && (
              <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded">
                {formError}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da família
              </label>
              <input
                type="text"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefone (WhatsApp)
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
                placeholder="(00) 00000-0000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200 resize-none"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Familiares</span>
                <button
                  type="button"
                  onClick={handleAddMember}
                  className="inline-flex items-center gap-1 text-rose-500 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar
                </button>
              </div>

              {newMembers.map((member, index) => (
                <div key={`member-${index}`} className="space-y-2">
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
                    placeholder="Nome do familiar"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={member.relationship}
                      onChange={(e) => handleMemberChange(index, 'relationship', e.target.value)}
                      className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200"
                      placeholder="Parentesco (opcional)"
                    />
                    {newMembers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(index)}
                        className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:text-rose-500 hover:border-rose-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-rose-400 text-white font-semibold hover:bg-rose-500 transition-colors disabled:opacity-60"
            >
              {loading
                ? 'Salvando...'
                : editingFamilyId
                ? 'Atualizar família'
                : 'Salvar família'}
            </button>
            {editingFamilyId && (
              <button
                type="button"
                onClick={() => {
                  setEditingFamilyId(null);
                  setFamilyName('');
                  setPhone('');
                  setNotes('');
                  setNewMembers([{ name: '', relationship: '' }]);
                }}
                className="w-full py-3 rounded-lg border border-gray-200 text-gray-600 hover:border-rose-200 hover:text-rose-500 transition-colors"
              >
                Cancelar edição
              </button>
            )}
          </form>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-rose-100/70 p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-serif text-gray-800">Estatísticas</h2>
                  <p className="text-sm text-gray-500">
                    Visão geral das confirmações de presença.
                  </p>
                </div>
                <button
                  onClick={handleExportCsv}
                  className="px-4 py-2 rounded-lg bg-rose-500 text-white font-semibold hover:bg-rose-600"
                >
                  Exportar lista (CSV)
                </button>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <div className="rounded-xl border border-rose-100 bg-rose-50/60 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-rose-400">
                    Famílias
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-gray-800">
                    {stats.totalFamilies}
                  </p>
                </div>
                <div className="rounded-xl border border-rose-100 bg-rose-50/60 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-rose-400">
                    Convidados
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-gray-800">
                    {stats.totalMembers}
                  </p>
                </div>
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-emerald-500">
                    Vão
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-emerald-700">
                    {stats.attendingYes}
                  </p>
                </div>
                <div className="rounded-xl border border-rose-100 bg-rose-50/60 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-rose-500">
                    Não vão
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-rose-700">
                    {stats.attendingNo}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-gray-500">
                    Pendentes
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-gray-700">
                    {stats.pending}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-serif text-gray-800">Famílias cadastradas</h2>
              <button
                onClick={loadData}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:border-rose-200 hover:text-rose-500"
              >
                Atualizar
              </button>
            </div>

            {loading && families.length === 0 ? (
              <p className="text-gray-500">Carregando famílias...</p>
            ) : null}

            <div className="space-y-5">
              {families.map((family) => (
                <div
                  key={family.id}
                  className="bg-white rounded-2xl border border-rose-100/70 p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex flex-wrap items-start justify-between gap-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">
                        {family.family_name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Código:{' '}
                        <span className="font-mono tracking-wide">
                          {formatAccessCode(family.access_code)}
                        </span>
                      </p>
                      {family.phone && (
                        <p className="text-sm text-gray-500">WhatsApp: {family.phone}</p>
                      )}
                    </div>
                    {family.notes && (
                      <p className="text-sm text-gray-500 max-w-md">{family.notes}</p>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingFamilyId(family.id);
                        setFamilyName(family.family_name);
                        setPhone(family.phone || '');
                        setNotes(family.notes || '');
                        const familyMembers = memberMap[family.id] || [];
                        setNewMembers(
                          familyMembers.length
                            ? familyMembers.map((member) => ({
                                name: member.name,
                                relationship: member.relationship || '',
                              }))
                            : [{ name: '', relationship: '' }]
                        );
                      }}
                      className="inline-flex items-center gap-2 rounded-lg border border-rose-200 px-3 py-1.5 text-sm text-rose-500 hover:bg-rose-50"
                    >
                      <Pencil className="w-4 h-4" />
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => setInviteFamily(family)}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:text-rose-500 hover:border-rose-200"
                    >
                      Baixar convite
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!confirm('Tem certeza que deseja remover esta família?')) return;
                        setLoading(true);
                        try {
                          await adminApi.deleteFamily(family.id);
                          if (editingFamilyId === family.id) {
                            setEditingFamilyId(null);
                            setFamilyName('');
                            setPhone('');
                            setNotes('');
                            setNewMembers([{ name: '', relationship: '' }]);
                          }
                          await loadData();
                        } catch (err) {
                          setFormError('Erro ao remover família.');
                        } finally {
                          setLoading(false);
                        }
                      }}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:text-rose-500 hover:border-rose-200"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remover
                    </button>
                  </div>

                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700">Familiares</p>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      {(memberMap[family.id] || []).map((member) => {
                        const confirmation = confirmationMap[member.id];
                        const attending =
                          confirmation?.attending === 1
                            ? 'Confirmado'
                            : confirmation?.attending === 0
                            ? 'Não irá'
                            : 'Sem resposta';
                        const badgeClass =
                          confirmation?.attending === 1
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : confirmation?.attending === 0
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-gray-50 text-gray-600 border-gray-200';

                        return (
                          <div
                            key={member.id}
                            className="rounded-xl border border-gray-100 bg-white px-4 py-3"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-gray-800">
                                  {member.name}
                                </p>
                                {member.relationship && (
                                  <p className="text-xs text-gray-500">
                                    {member.relationship}
                                  </p>
                                )}
                              </div>
                              <span
                                className={`rounded-full border px-3 py-1 text-xs font-semibold ${badgeClass}`}
                              >
                                {attending}
                              </span>
                            </div>
                            {confirmation?.dietary_restrictions && (
                              <p className="mt-2 text-xs text-gray-600">
                                Restrição: {confirmation.dietary_restrictions}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}

              {families.length === 0 && !loading ? (
                <div className="bg-white rounded-xl border border-dashed border-rose-200 p-6 text-center text-gray-500">
                  Nenhuma família cadastrada ainda.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {inviteFamily && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4 py-10">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-5xl w-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Convite</h3>
                <p className="text-sm text-gray-500">{inviteFamily.family_name}</p>
              </div>
              <button
                onClick={() => setInviteFamily(null)}
                className="text-gray-500 hover:text-rose-500"
              >
                Fechar
              </button>
            </div>

            <div className="overflow-auto">
              <div ref={inviteRef} className="inline-block">
                <BoardingPassInvite family={inviteFamily} />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setInviteFamily(null)}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:border-rose-200 hover:text-rose-500"
              >
                Cancelar
              </button>
              <button
                onClick={handleDownloadInvite}
                disabled={downloadingInvite}
                className="px-4 py-2 rounded-lg bg-rose-500 text-white font-semibold hover:bg-rose-600 disabled:opacity-60"
              >
                {downloadingInvite ? 'Gerando...' : 'Baixar PNG'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

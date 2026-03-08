import { useEffect, useMemo, useRef, useState, FormEvent } from 'react';
import { Key, LogOut, Pencil, Plus, Printer, Trash2, UserPlus } from 'lucide-react';
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
}

interface MemberConfirmation {
  id: number;
  member_id: number;
  attending: boolean;
  dietary_restrictions: string | null;
  message: string | null;
  confirmed_at: string;
}

interface NewMember {
  id?: number;
  name: string;
}

interface AdminProps {
  onExit: () => void;
}

const WEDDING_DATE = '24 Abril 2026';
const WEDDING_TIME = '18h às 21h';
const WEDDING_LOCATION = 'Lourdes Square Spazio';
const COUPLE_NAME = 'Janeth & Felipe';
const INVITE_SITE_URL =
  (import.meta.env.INVITE_SITE_URL as string | undefined) || window.location.origin;

const formatAccessCode = (value: string) => {
  const cleaned = value.replace(/\D/g, '').slice(0, 8);
  if (cleaned.length <= 4) return cleaned;
  return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}`;
};

const parseDeadline = (value?: string): Date | null => {
  if (!value) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T23:59:59.999-03:00`);
  }

  const hasTimezone = /(Z|[+-]\d{2}:\d{2})$/.test(value);
  const normalizedValue = hasTimezone ? value : `${value}-03:00`;
  const parsed = new Date(normalizedValue);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

const formatDeadlineLabel = (value?: string) => {
  const deadline = parseDeadline(value);
  if (!deadline) return 'Escaneie para confirmar presença';
  return `Confirme até ${deadline.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const BoardingPassInvite = ({ family }: { family: Family }) => {
  const rsvpDeadline = import.meta.env.VITE_RSVP_DEADLINE as string | undefined;
  const deadlineLabel = formatDeadlineLabel(rsvpDeadline);
  const inviteUrl = INVITE_SITE_URL;

  return (
    <div className="relative w-[900px] h-[600px] rounded-[28px] overflow-hidden border border-rose-100 bg-[#f6f2ef]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(251,232,236,0.55),transparent_38%),radial-gradient(circle_at_96%_96%,rgba(243,231,205,0.45),transparent_42%)]" />
      <div className="absolute inset-[24px] rounded-[22px] border border-rose-100 bg-white/70" />
      <div className="absolute top-[62px] left-0 right-0 text-center">
        <p className="text-[11px] uppercase tracking-[0.42em] text-rose-400">Recepção de Casamento</p>
        <h2 className="mt-3 font-serif text-[58px] leading-none text-gray-800">{COUPLE_NAME}</h2>
      </div>

      <div className="absolute top-[168px] left-[74px] right-[74px] text-center">
        <p className="text-[13px] leading-none text-gray-500 uppercase tracking-[0.22em]">
          Com amor, convidamos você para celebrar este dia conosco
        </p>
        <div className="mt-3 flex items-center justify-center gap-6">
          <div className="h-px w-[34%] bg-rose-200" />
          <p className="text-rose-400 text-[14px] uppercase tracking-[0.36em] leading-none">Save the Date</p>
          <div className="h-px w-[34%] bg-rose-200" />
        </div>
      </div>

      <div className="absolute top-[226px] left-[74px] right-[74px] px-10 py-8">
        <div className="grid grid-cols-[1fr,220px] gap-8 items-stretch">
          <div className="rounded-3xl border border-rose-100 bg-white/85 p-8">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4 border-b border-rose-100 pb-3">
                <span className="text-xs uppercase tracking-[0.2em] text-rose-300">Data</span>
                <span className="font-semibold text-gray-800 text-lg">{WEDDING_DATE}</span>
              </div>
              <div className="flex items-start justify-between gap-4 border-b border-rose-100 pb-3">
                <span className="text-xs uppercase tracking-[0.2em] text-rose-300">Horário</span>
                <span className="font-semibold text-gray-800 text-lg">{WEDDING_TIME}</span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-xs uppercase tracking-[0.2em] text-rose-300">Local</span>
                <span className="font-semibold text-right text-gray-800 text-lg">{WEDDING_LOCATION}</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-rose-100 bg-[#fffdfb] px-5 py-6 text-center">
            <p className="text-[10px] uppercase tracking-[0.3em] text-rose-400">RSVP</p>
            <div className="mx-auto mt-3 inline-flex rounded-xl bg-white p-3">
              <QRCodeSVG
                value={inviteUrl}
                size={110}
                bgColor="transparent"
                fgColor="#374151"
                level="M"
                includeMargin={false}
              />
            </div>
            <p className="mt-4 text-sm font-semibold tracking-[0.16em] text-gray-700">{formatAccessCode(family.access_code)}</p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-gray-400">{deadlineLabel}</p>
          </div>
        </div>
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
    { name: '' },
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
      } else if (confirmation.attending) {
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

  const familyMessages = useMemo(() => {
    return families
      .map((family) => {
        const familyMembers = memberMap[family.id] || [];
        const memberIds = new Set(familyMembers.map((member) => member.id));
        const withMessage = confirmations
          .filter(
            (confirmation) =>
              memberIds.has(confirmation.member_id) &&
              typeof confirmation.message === 'string' &&
              confirmation.message.trim().length > 0
          )
          .sort((a, b) => {
            const dateDiff =
              new Date(b.confirmed_at).getTime() - new Date(a.confirmed_at).getTime();
            if (dateDiff !== 0) return dateDiff;
            return b.id - a.id;
          });

        if (withMessage.length === 0) return null;

        const latestMessage = withMessage[0];
        const attendingYes = familyMembers.filter(
          (member) => confirmationMap[member.id]?.attending === true
        ).length;
        const attendingNo = familyMembers.filter(
          (member) => confirmationMap[member.id]?.attending === false
        ).length;

        return {
          familyName: family.family_name,
          message: latestMessage.message || '',
          confirmedAt: latestMessage.confirmed_at,
          attendingYes,
          attendingNo,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort(
        (a, b) =>
          new Date(b.confirmedAt).getTime() - new Date(a.confirmedAt).getTime()
      );
  }, [families, memberMap, confirmations, confirmationMap]);

  const handleExportCsv = () => {
    const escapeCsv = (value: string | number | null | undefined) => {
      if (value === null || value === undefined) return '';
      const str = String(value);
      if (/[;"\n]/.test(str)) {
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
        'status',
        'confirmado_em',
      ],
    ];

    members.forEach((member) => {
      const family = families.find((item) => item.id === member.family_id);
      const confirmation = confirmationMap[member.id];
      const status = confirmation ? (confirmation.attending ? 'Sim' : 'Nao') : 'Pendente';
      rows.push([
        family?.family_name ?? '',
        family?.phone ?? '',
        family?.notes ?? '',
        member.name,
        status,
        confirmation?.confirmed_at ?? '',
      ]);
    });

    const csvContent = rows.map((row) => row.map(escapeCsv).join(';')).join('\n');
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'lista-convidados.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintMessages = () => {
    if (familyMessages.length === 0) {
      setFormError('Nenhuma mensagem enviada ainda para impressão.');
      return;
    }

    const printWindow = window.open('', '_blank', 'width=1200,height=900');
    if (!printWindow) {
      setFormError('Não foi possível abrir a janela de impressão.');
      return;
    }

    const cardsHtml = familyMessages
      .map((item) => {
        return `
          <section class="print-sheet">
            <article class="tag-scene">
              <div class="gift-tag">
                <div class="tag-hole"></div>
                <div class="frame-inner">
                  <div class="ornament ornament-top-left"></div>
                  <div class="ornament ornament-top-right"></div>
                  <div class="ornament ornament-bottom-left"></div>
                  <div class="ornament ornament-bottom-right"></div>
                  <header class="card-header">
                    <p class="eyebrow">Mensagem Especial</p>
                    <h1>${escapeHtml(item.familyName)}</h1>
                    <div class="divider">
                      <span></span>
                      <i>•••</i>
                      <span></span>
                    </div>
                  </header>
                  <blockquote>${escapeHtml(item.message)}</blockquote>
                  <footer>
                    <strong>Janeth &amp; Felipe</strong>
                    <span>${escapeHtml(WEDDING_DATE)}</span>
                  </footer>
                </div>
              </div>
            </article>
          </section>
        `;
      })
      .join('');

    printWindow.document.write(`
      <!doctype html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Mensagens das Famílias</title>
          <style>
            @page { size: A4; margin: 14mm; }
            :root {
              --paper: #f0e8de;
              --tag: #fffdf9;
              --ink: #2d2722;
              --ink-soft: #5f5449;
              --rope: #9d7d57;
              --line: rgba(140, 118, 87, 0.36);
              --gold: #a68352;
            }
            * { box-sizing: border-box; }
            body {
              margin: 0;
              background:
                radial-gradient(circle at 0% 0%, rgba(255, 255, 255, 0.7), transparent 40%),
                radial-gradient(circle at 100% 100%, rgba(190, 155, 112, 0.16), transparent 35%),
                var(--paper);
              color: var(--ink);
              font-family: "Cormorant Garamond", "Times New Roman", serif;
            }
            .page { padding: 6px; }
            .print-sheet {
              width: 100%;
              min-height: calc(297mm - 28mm);
              display: flex;
              align-items: center;
              justify-content: center;
              page-break-after: always;
            }
            .print-sheet:last-of-type { page-break-after: auto; }

            .tag-scene {
              position: relative;
              width: 95mm;
              min-height: 152mm;
              display: flex;
              align-items: center;
              justify-content: center;
              padding-top: 0;
            }

            .gift-tag {
              position: absolute;
              top: 8mm;
              width: 86mm;
              min-height: 138mm;
              padding: 15mm 4mm 4mm;
              border: 1px solid var(--line);
              border-radius: 2.6mm;
              background:
                linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.95)),
                var(--tag);
              box-shadow: 0 10px 22px rgba(47, 32, 17, 0.16);
              overflow: hidden;
            }

            .gift-tag::before {
              content: '';
              position: absolute;
              inset: 2.3mm;
              border: 1px solid rgba(140, 118, 87, 0.24);
              border-radius: 1.8mm;
              pointer-events: none;
            }

            .tag-hole {
              position: absolute;
              left: 50%;
              top: 4mm;
              width: 5.2mm;
              height: 5.2mm;
              margin-left: -2.6mm;
              border-radius: 50%;
              background: #ece3d8;
              border: 1px solid #9e876a;
              box-shadow: inset 0 0 0 1px rgba(146, 123, 96, 0.2);
              z-index: 2;
            }

            .frame-inner {
              position: relative;
              min-height: 126mm;
              width: 100%;
              border: 1px solid rgba(140, 118, 87, 0.28);
              background:
                radial-gradient(rgba(109, 84, 53, 0.045) 0.55px, transparent 0.75px),
                linear-gradient(160deg, rgba(255, 255, 255, 0.82), rgba(245, 236, 223, 0.6)),
                var(--tag);
              background-size: 4px 4px, 100% 100%, 100% 100%;
              border-radius: 1.4mm;
              padding: 13mm 6mm 7mm;
              overflow: hidden;
            }

            .ornament {
              position: absolute;
              width: 10mm;
              height: 10mm;
              border: 1px solid rgba(166, 131, 82, 0.42);
              border-radius: 1px;
              pointer-events: none;
            }
            .ornament::before,
            .ornament::after {
              content: "";
              position: absolute;
              border: 1px solid rgba(166, 131, 82, 0.42);
              width: 5.6mm;
              height: 5.6mm;
              transform: rotate(45deg);
            }
            .ornament::before { top: -3.7mm; left: 2.2mm; }
            .ornament::after { top: 2.2mm; left: -3.7mm; }
            .ornament-top-left { top: 2.6mm; left: 2.6mm; border-right: 0; border-bottom: 0; }
            .ornament-top-right { top: 2.6mm; right: 2.6mm; border-left: 0; border-bottom: 0; transform: scaleX(-1); }
            .ornament-bottom-left { bottom: 2.6mm; left: 2.6mm; border-right: 0; border-top: 0; transform: scaleY(-1); }
            .ornament-bottom-right { bottom: 2.6mm; right: 2.6mm; border-left: 0; border-top: 0; transform: scale(-1); }

            .divider {
              margin: 3.2mm auto 0;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 6px;
              color: var(--gold);
            }
            .divider span {
              display: block;
              width: 16mm;
              height: 1px;
              background: linear-gradient(
                to right,
                rgba(166, 131, 82, 0),
                rgba(166, 131, 82, 0.75),
                rgba(166, 131, 82, 0)
              );
            }
            .divider i {
              margin: 0;
              font-style: normal;
              font-size: 7px;
              letter-spacing: 0.2em;
            }

            .card-header {
              text-align: center;
              padding: 3mm 1mm 0;
              position: relative;
              z-index: 1;
            }

            .eyebrow {
              margin: 0;
              font: 600 7.8px/1.2 "Arial", sans-serif;
              letter-spacing: 0.24em;
              text-transform: uppercase;
              color: #8c7a62;
            }

            h1 {
              margin: 2.8mm 0 0;
              font: 600 13.5px/1.14 "Playfair Display", "Times New Roman", serif;
              letter-spacing: 0.015em;
              color: #2f2923;
            }

            blockquote {
              margin: 6.5mm 0 0;
              border: 0;
              padding: 0;
              text-align: center;
              white-space: pre-wrap;
              font: 500 11.6px/1.45 "Cormorant Garamond", "Times New Roman", serif;
              color: var(--ink-soft);
              min-height: 70mm;
              position: relative;
              z-index: 1;
            }

            footer {
              margin-top: 7mm;
              border-top: 1px solid rgba(133, 106, 74, 0.28);
              padding-top: 2.8mm;
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 1.2mm;
              font: 600 7.6px/1.2 "Arial", sans-serif;
              letter-spacing: 0.16em;
              text-transform: uppercase;
              color: #74614a;
              position: relative;
              z-index: 1;
            }

            footer strong {
              font-size: 8px;
              letter-spacing: 0.2em;
            }

            .actions {
              position: sticky;
              bottom: 0;
              background: linear-gradient(to top, rgba(244, 239, 232, 0.98), rgba(244, 239, 232, 0));
              padding: 14px 8px 8px;
              display: flex;
              justify-content: flex-end;
              gap: 8px;
            }
            button {
              border: 0;
              border-radius: 8px;
              padding: 10px 14px;
              font: 600 13px/1 "Arial", sans-serif;
              cursor: pointer;
            }
            .print-btn { background: #7a5a2f; color: #fff; }
            .close-btn { background: #e5e7eb; color: #111827; }

            @media print {
              body { background: #fff; }
              .page { padding: 0; }
              .actions { display: none; }
              .gift-tag { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <main class="page">
            ${cardsHtml}
            <div class="actions">
              <button class="close-btn" onclick="window.close()">Fechar</button>
              <button class="print-btn" onclick="window.print()">Imprimir</button>
            </div>
          </main>
        </body>
      </html>
    `);
    printWindow.document.close();
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
    } catch {
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
    setNewMembers((prev) => [...prev, { name: '' }]);
  };

  const handleRemoveMember = (index: number) => {
    setNewMembers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMemberChange = (
    index: number,
    field: 'name',
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
      setNewMembers([{ name: '' }]);
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
    <section className="min-h-screen bg-gradient-to-b from-white to-rose-50 px-4 py-6 lg:h-screen lg:overflow-hidden">
      <div className="max-w-6xl mx-auto lg:h-full lg:flex lg:flex-col">
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

        <div className="grid grid-cols-1 lg:grid-cols-[380px,1fr] gap-8 lg:min-h-0 lg:flex-1">
          <form
            onSubmit={handleCreateFamily}
            className="bg-white rounded-xl shadow-lg p-6 space-y-4 lg:max-h-full lg:overflow-y-auto"
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
                  setNewMembers([{ name: '' }]);
                }}
                className="w-full py-3 rounded-lg border border-gray-200 text-gray-600 hover:border-rose-200 hover:text-rose-500 transition-colors"
              >
                Cancelar edição
              </button>
            )}
          </form>

          <div className="space-y-4 lg:min-h-0 lg:flex lg:flex-col">
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
                <button
                  onClick={handlePrintMessages}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-rose-200 text-rose-600 font-semibold hover:bg-rose-50"
                >
                  <Printer className="w-4 h-4" />
                  Imprimir mensagens
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

            <div className="lg:min-h-0 lg:overflow-y-auto lg:pr-2">
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
                                  id: member.id,
                                  name: member.name,
                                }))
                              : [{ name: '' }]
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
                              setNewMembers([{ name: '' }]);
                            }
                            await loadData();
                          } catch {
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
                            confirmation?.attending
                              ? 'Confirmado'
                              : confirmation
                              ? 'Não irá'
                              : 'Sem resposta';
                          const badgeClass =
                            confirmation?.attending
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : confirmation
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



import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { 
  Shield, 
  Users, 
  Calendar, 
  LogOut, 
  Menu, 
  X, 
  Home, 
  Search, 
  Plus, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Download,
  Trash2,
  Edit2,
  ChevronRight,
  Sparkles,
  Award,
  Lock,
  Activity,
  Filter,
  ArrowUpDown,
  CalendarCheck,
  CheckSquare,
  ListPlus
} from 'lucide-react';
import { StorageService } from './services/storageService';
import { GeminiService } from './services/geminiService';
import { Officer, LeaveRecord, Rank, ServiceType, LeaveStatus, RANKS_LIST, SERVICE_TYPES_LIST } from './types';
import { Button } from './components/Button';
import { StatCard } from './components/StatCard';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

// --- Helpers ---
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// --- Components defined within App.tsx ---

// 1. Login Screen
const LoginScreen = ({ onLogin }: { onLogin: (isAdmin: boolean) => void }) => {
  const [showAdminInput, setShowAdminInput] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '1234') { 
      onLogin(true);
    } else {
      setError('Senha incorreta.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center border-t-4 border-police-700">
        <div className="mx-auto bg-police-900 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-police-900/30 border-2 border-accent-500">
          <Activity className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-police-900 mb-1">Controle de Folgas - DS</h1>
        <p className="text-police-600 font-semibold text-sm mb-6 uppercase tracking-wider">Diretoria de Saúde da PMCE</p>
        
        {!showAdminInput ? (
          <div className="space-y-4 animate-fade-in">
            <Button fullWidth size="lg" onClick={() => setShowAdminInput(true)} className="bg-police-900 hover:bg-police-800">
              <Lock size={16} className="mr-2" /> Acessar como Administrador
            </Button>
            <Button fullWidth variant="secondary" onClick={() => onLogin(false)}>
              Acessar Consulta Pública
            </Button>
          </div>
        ) : (
          <form onSubmit={handleAdminLogin} className="space-y-4 animate-fade-in text-left">
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha de Administrador</label>
                <input 
                  type="password" 
                  autoFocus
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-police-500 focus:border-police-500"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="Digite a senha (padrão: 1234)"
                />
                {error && <p className="text-red-500 text-xs mt-2 font-medium flex items-center"><AlertTriangle size={12} className="mr-1"/> {error}</p>}
             </div>
             <Button fullWidth type="submit" size="lg" className="bg-police-900 hover:bg-police-800">
               Entrar
             </Button>
             <button 
               type="button"
               onClick={() => { setShowAdminInput(false); setError(''); setPassword(''); }}
               className="w-full text-center text-sm text-gray-500 hover:text-police-900 underline mt-2"
             >
               Voltar para seleção
             </button>
          </form>
        )}
        
        <p className="mt-8 text-xs text-gray-400">Sistema Administrativo • Uso Interno</p>
      </div>
    </div>
  );
};

// 2. Layout
const Layout = ({ children, isAdmin, onLogout }: { children?: React.ReactNode, isAdmin: boolean, onLogout: () => void }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const NavItem = ({ to, icon: Icon, label }: any) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        onClick={() => setMobileMenuOpen(false)}
        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
          isActive 
            ? 'bg-police-700 text-white shadow-md' 
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        <Icon size={20} className={isActive ? 'text-accent-500' : 'text-gray-500'} />
        <span className="font-medium">{label}</span>
      </Link>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 shadow-sm z-10">
        <div className="p-6 border-b border-gray-100 flex items-center space-x-3 bg-police-900">
          <div className="bg-white/10 p-2 rounded-lg border border-accent-500/30">
            <Activity className="w-5 h-5 text-accent-500" />
          </div>
          <div>
             <span className="font-bold text-white block leading-tight text-sm">Diretoria de Saúde</span>
             <span className="text-[10px] text-gray-300 uppercase tracking-widest">PMCE</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <NavItem to="/" icon={Home} label="Dashboard" />
          <NavItem to="/officers" icon={Users} label="Efetivo" />
          {isAdmin && (
            <>
              <NavItem to="/add-leave" icon={Plus} label="Lançar Folga" />
              <NavItem to="/redeem-leave" icon={CheckSquare} label="Lançar Gozo" />
            </>
          )}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button onClick={onLogout} className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg w-full transition-colors">
            <LogOut size={20} />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header & Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="md:hidden bg-police-900 text-white border-b border-police-800 p-4 flex justify-between items-center z-20 shadow-md">
          <div className="flex items-center space-x-2">
            <Activity className="w-6 h-6 text-accent-500" />
            <span className="font-bold text-lg">Diretoria de Saúde</span>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-white">
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </header>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-white z-10 pt-20 px-6 md:hidden animate-fade-in">
            <nav className="space-y-4">
              <NavItem to="/" icon={Home} label="Dashboard" />
              <NavItem to="/officers" icon={Users} label="Efetivo" />
              {isAdmin && (
                <>
                  <NavItem to="/add-leave" icon={Plus} label="Lançar Folga" />
                  <NavItem to="/redeem-leave" icon={CheckSquare} label="Lançar Gozo" />
                </>
              )}
              <div className="pt-8 border-t border-gray-100">
                <button onClick={onLogout} className="flex items-center space-x-3 px-4 py-3 text-red-600 w-full">
                  <LogOut size={20} />
                  <span className="font-medium">Sair do Sistema</span>
                </button>
              </div>
            </nav>
          </div>
        )}

        <main className="flex-1 overflow-auto p-4 md:p-8 pb-20 md:pb-8">
          {children}
        </main>
      </div>
    </div>
  );
};

// 3. Pages

const Dashboard = () => {
  const [stats, setStats] = useState({ officerCount: 0, totalAvailable: 0, totalUsed: 0 });
  
  useEffect(() => {
    const loadStats = async () => {
      const data = await StorageService.getSummary();
      setStats(data);
    };
    loadStats();
  }, []);

  const data = [
    { name: 'Disponíveis', value: stats.totalAvailable, color: '#059669' }, // Emerald 600
    { name: 'Gozadas', value: stats.totalUsed, color: '#52525b' }, // Zinc 600
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-police-900 border-l-4 border-accent-500 pl-3">Visão Geral</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          title="Efetivo Cadastrado" 
          value={stats.officerCount} 
          icon={<Users size={24} />} 
          color="blue" 
        />
        <StatCard 
          title="Folgas Disponíveis" 
          value={stats.totalAvailable} 
          icon={<CheckCircle size={24} />} 
          color="green" 
        />
        <StatCard 
          title="Folgas Gozadas" 
          value={stats.totalUsed} 
          icon={<Calendar size={24} />} 
          color="slate" 
        />
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-police-900">Status das Folgas</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center space-x-6 mt-4">
          {data.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-sm text-gray-600 font-medium">{entry.name}: {entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const OfficerList = ({ isAdmin }: { isAdmin: boolean }) => {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    StorageService.getOfficers().then(setOfficers);
  }, []);

  const refreshList = async () => {
    const updated = await StorageService.getOfficers();
    setOfficers(updated);
  };

  const deleteOfficer = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if(window.confirm('ATENÇÃO: Deseja realmente excluir este policial e todo seu histórico?')) {
        await StorageService.deleteOfficer(id);
        refreshList();
    }
  };

  const filtered = officers.filter(o => 
    o.name.toLowerCase().includes(search.toLowerCase()) || 
    o.matricula?.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-police-900 border-l-4 border-accent-500 pl-3">Efetivo</h2>
        {isAdmin && (
          <Link to="/officers/new">
             <Button size="sm" className="bg-police-700 hover:bg-police-600"><Plus size={16} className="mr-2" /> Novo Policial</Button>
          </Link>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Buscar por nome ou matrícula..." 
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-police-900 focus:border-transparent outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Nenhum policial encontrado.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filtered.map(officer => (
              <li key={officer.id}>
                <Link to={`/officers/${officer.id}`} className="block hover:bg-gray-50 transition-colors p-4 group">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-police-50 rounded-full flex items-center justify-center text-police-700 font-bold text-sm border border-police-100">
                        {officer.rank.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-police-900">{officer.rank} {officer.name}</p>
                        <p className="text-xs text-gray-500">Mat: {officer.matricula || 'N/A'} • {officer.unit || 'Sem Unidade'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                       {isAdmin && (
                           <button 
                             onClick={(e) => deleteOfficer(e, officer.id)}
                             className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                             title="Excluir Policial"
                           >
                             <Trash2 size={18} />
                           </button>
                       )}
                       <ChevronRight className="text-gray-300" size={20} />
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

const OfficerDetails = ({ isAdmin }: { isAdmin: boolean }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [officer, setOfficer] = useState<Officer | null>(null);
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);

  // Filter and Sort State
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [sortOption, setSortOption] = useState<string>('SERVICE_DESC');

  // Redeem Modal State
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
  const [leaveToRedeem, setLeaveToRedeem] = useState<LeaveRecord | null>(null);
  const [redeemDate, setRedeemDate] = useState('');
  const [redeemAmount, setRedeemAmount] = useState<number>(0);

  useEffect(() => {
    if (id) {
      Promise.all([
        StorageService.getOfficerById(id),
        StorageService.getLeavesByOfficer(id)
      ]).then(([off, lvs]) => {
        setOfficer(off || null);
        setLeaves(lvs);
        setLoading(false);
      });
    }
  }, [id]);

  const processedLeaves = useMemo(() => {
    let result = [...leaves];
    if (filterStatus !== 'ALL') {
      result = result.filter(leave => leave.status === filterStatus);
    }
    result.sort((a, b) => {
      const dateA = new Date(a.serviceDate).getTime();
      const dateB = new Date(b.serviceDate).getTime();
      const usedA = a.dateUsed ? new Date(a.dateUsed).getTime() : 0;
      const usedB = b.dateUsed ? new Date(b.dateUsed).getTime() : 0;

      switch (sortOption) {
        case 'SERVICE_DESC': return dateB - dateA;
        case 'SERVICE_ASC': return dateA - dateB;
        case 'USED_DESC':
          if (!a.dateUsed && !b.dateUsed) return 0;
          if (!a.dateUsed) return 1;
          if (!b.dateUsed) return -1;
          return usedB - usedA;
        default: return 0;
      }
    });
    return result;
  }, [leaves, filterStatus, sortOption]);

  const handleDelete = async () => {
    if (window.confirm("ATENÇÃO: Tem certeza que deseja remover este policial e todo seu histórico?") && id) {
      await StorageService.deleteOfficer(id);
      navigate('/officers');
    }
  };
  
  const handleDeleteLeave = async (leaveId: string) => {
      if(window.confirm("ATENÇÃO: Tem certeza que deseja excluir este registro de folga? Esta ação não pode ser desfeita.")) {
          await StorageService.deleteLeave(leaveId);
          if (id) {
            const newLeaves = await StorageService.getLeavesByOfficer(id);
            setLeaves(newLeaves);
          }
      }
  };

  const handleGenerateReport = async () => {
    if (!officer) return;
    setGeneratingReport(true);
    const report = await GeminiService.generateOfficerReport(officer, leaves);
    setAiReport(report);
    setGeneratingReport(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const openRedeemModal = (leave: LeaveRecord) => {
    setLeaveToRedeem(leave);
    setRedeemAmount(leave.amount);
    setRedeemDate(new Date().toISOString().split('T')[0]);
    setIsRedeemModalOpen(true);
  };

  const handleConfirmRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (leaveToRedeem && redeemDate && officer) {
      const amountToRedeem = Number(redeemAmount);
      if (amountToRedeem <= 0 || amountToRedeem > leaveToRedeem.amount) {
        alert("Quantidade inválida.");
        return;
      }
      if (amountToRedeem === leaveToRedeem.amount) {
        const updated = {
          ...leaveToRedeem,
          status: LeaveStatus.USED,
          dateUsed: redeemDate
        };
        await StorageService.saveLeave(updated);
      } else {
        const remaining = {
          ...leaveToRedeem,
          amount: leaveToRedeem.amount - amountToRedeem
        };
        await StorageService.saveLeave(remaining);
        const usedPortion: LeaveRecord = {
          ...leaveToRedeem,
          id: generateId(),
          amount: amountToRedeem,
          status: LeaveStatus.USED,
          dateUsed: redeemDate,
          notes: leaveToRedeem.notes ? `${leaveToRedeem.notes} (Fracionada)` : '(Fracionada)',
          serviceDescription: leaveToRedeem.serviceDescription
        };
        await StorageService.saveLeave(usedPortion);
      }
      const newLeaves = await StorageService.getLeavesByOfficer(officer.id);
      setLeaves(newLeaves);
      setIsRedeemModalOpen(false);
      setLeaveToRedeem(null);
    }
  };

  if (loading) return <div className="p-8 text-center">Carregando...</div>;
  if (!officer) return <div className="p-8 text-center text-red-500">Policial não encontrado.</div>;

  const totalAvailable = leaves.filter(l => l.status === LeaveStatus.AVAILABLE).reduce((acc, curr) => acc + curr.amount, 0);
  const totalUsed = leaves.filter(l => l.status === LeaveStatus.USED).reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6 pb-12 relative">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-l-4 border-police-900">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-police-900">{officer.rank} {officer.name}</h1>
            <span className="bg-police-50 text-police-700 border border-police-200 text-xs px-2 py-1 rounded-full">{officer.unit}</span>
          </div>
          <p className="text-gray-500 text-sm mt-1">Matrícula: {officer.matricula}</p>
        </div>
        <div className="flex space-x-2 no-print">
          <Button variant="ghost" onClick={handlePrint}><Download size={18} /></Button>
          {isAdmin && (
            <Button variant="danger" onClick={handleDelete} title="Excluir Efetivo"><Trash2 size={18} /></Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 p-4 rounded-xl border border-green-200">
          <p className="text-green-800 text-xs font-bold uppercase flex items-center gap-1"><CheckCircle size={14} /> Disponíveis</p>
          <p className="text-3xl font-bold text-green-700 mt-1">{totalAvailable}</p>
          <p className="text-green-600 text-xs mt-2">folgas a gozar</p>
        </div>
        <div className="bg-gray-100 p-4 rounded-xl border border-gray-200">
          <p className="text-gray-600 text-xs font-bold uppercase flex items-center gap-1"><Clock size={14} /> Gozadas</p>
          <p className="text-3xl font-bold text-gray-700 mt-1">{totalUsed}</p>
          <p className="text-gray-500 text-xs mt-2">folgas utilizadas</p>
        </div>
      </div>

      <div className="no-print">
        {!aiReport ? (
            <Button variant="secondary" fullWidth onClick={handleGenerateReport} disabled={generatingReport}>
              {generatingReport ? <><span className="animate-spin mr-2">⏳</span> Analisando...</> : <><Sparkles size={18} className="mr-2 text-accent-500" /> Relatório de Inteligência</>}
            </Button>
        ) : (
            <div className="bg-gradient-to-br from-police-900 to-police-800 text-white p-6 rounded-xl shadow-lg relative overflow-hidden border-t-4 border-accent-500">
               <Award className="absolute top-4 right-4 text-accent-500 opacity-20" size={64} />
               <h3 className="font-bold text-lg mb-2 flex items-center text-accent-500"><Sparkles size={18} className="mr-2" /> Análise de Inteligência</h3>
               <div className="prose prose-invert text-sm text-gray-200 whitespace-pre-line">{aiReport}</div>
               <button onClick={() => setAiReport(null)} className="mt-4 text-xs text-gray-400 hover:text-white underline">Fechar Análise</button>
            </div>
        )}
      </div>

      <div>
        <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center mb-4 gap-4">
          <h3 className="text-lg font-bold text-police-900">Histórico de Folgas</h3>
          {isAdmin && (
             <Link to={`/add-leave?officerId=${officer.id}`}><Button size="sm" className="bg-police-700 hover:bg-police-600">Adicionar</Button></Link>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-4 no-print bg-gray-50 p-3 rounded-lg border border-gray-200">
           <div className="flex items-center gap-2 flex-1">
             <Filter size={16} className="text-gray-500" />
             <select className="w-full text-sm p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-police-500 outline-none bg-white" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
               <option value="ALL">Todos os Status</option>
               <option value={LeaveStatus.AVAILABLE}>{LeaveStatus.AVAILABLE}</option>
               <option value={LeaveStatus.USED}>{LeaveStatus.USED}</option>
               <option value={LeaveStatus.EXPIRED}>{LeaveStatus.EXPIRED}</option>
             </select>
           </div>
           <div className="flex items-center gap-2 flex-1">
             <ArrowUpDown size={16} className="text-gray-500" />
             <select className="w-full text-sm p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-police-500 outline-none bg-white" value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
               <option value="SERVICE_DESC">Data Serviço (Recente)</option>
               <option value="SERVICE_ASC">Data Serviço (Antiga)</option>
               <option value="USED_DESC">Data do Gozo (Recente)</option>
             </select>
           </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {processedLeaves.length === 0 ? (
             <div className="p-6 text-center text-gray-400 text-sm">Nenhum registro encontrado.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">Origem e Vínculo</th>
                    <th className="px-4 py-3">Qtd</th>
                    <th className="px-4 py-3">Situação</th>
                    <th className="px-4 py-3">Data do Gozo</th>
                    {isAdmin && <th className="px-4 py-3 no-print">Ação</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {processedLeaves.map(leave => (
                    <tr key={leave.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <span className="font-bold text-police-900 block">{leave.serviceType}</span>
                        {leave.serviceDescription && <span className="text-sm font-medium text-police-700 block mt-0.5">{leave.serviceDescription}</span>}
                        <span className="text-xs text-gray-500 flex items-center mt-1"><CalendarCheck size={12} className="mr-1" /> Gerado em: <strong className="ml-1">{leave.serviceDate.split('-').reverse().join('/')}</strong></span>
                      </td>
                      <td className="px-4 py-3 font-bold">{leave.amount}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${leave.status === LeaveStatus.AVAILABLE ? 'bg-green-50 text-green-700 border-green-200' : leave.status === LeaveStatus.USED ? 'bg-gray-100 text-gray-600 border-gray-200' : 'bg-red-50 text-red-600 border-red-200'}`}>{leave.status}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                         {leave.dateUsed ? <span className="font-semibold text-police-900">{leave.dateUsed.split('-').reverse().join('/')}</span> : <span className="text-gray-400 italic">--</span>}
                      </td>
                      {isAdmin && (
                         <td className="px-4 py-3 no-print">
                           <div className="flex items-center gap-2">
                            {leave.status === LeaveStatus.AVAILABLE && (
                              <button onClick={() => openRedeemModal(leave)} className="text-blue-600 hover:text-blue-800 font-medium text-xs border border-blue-200 bg-blue-50 px-3 py-1.5 rounded hover:bg-blue-100 transition-colors flex items-center">
                                <CheckCircle size={14} className="mr-1" /> Baixar
                              </button>
                            )}
                            {leave.status === LeaveStatus.USED && <span className="text-xs text-gray-400 flex items-center mr-2"><Lock size={12} className="mr-1" /> Baixada</span>}
                            <button onClick={() => handleDeleteLeave(leave.id)} className="text-gray-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded transition-colors" title="Excluir Folga"><Trash2 size={16} /></button>
                           </div>
                         </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {isRedeemModalOpen && leaveToRedeem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h3 className="text-lg font-bold text-police-900">Registrar Gozo de Folga</h3>
              <button onClick={() => setIsRedeemModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleConfirmRedeem}>
              <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-100">
                <p className="text-sm text-blue-800 font-semibold mb-1">Vínculo do Benefício:</p>
                <p className="text-xs text-gray-600">Serviço: <span className="font-bold">{leaveToRedeem.serviceType}</span></p>
                {leaveToRedeem.serviceDescription && <p className="text-xs text-gray-600">Descrição: <span className="font-bold">{leaveToRedeem.serviceDescription}</span></p>}
                <p className="text-xs text-gray-600">Data do Serviço: <span className="font-bold">{leaveToRedeem.serviceDate.split('-').reverse().join('/')}</span></p>
                <p className="text-xs text-gray-600">Saldo Disponível: <span className="font-bold">{leaveToRedeem.amount} folga(s)</span></p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantidade a Gozar</label>
                <input type="number" min="0.5" step="0.5" max={leaveToRedeem.amount} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-police-500 focus:border-police-500 outline-none" value={redeemAmount} onChange={(e) => setRedeemAmount(Number(e.target.value))} required />
                <p className="text-xs text-gray-500 mt-1">Se o valor for menor que o saldo, a folga será fracionada.</p>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Em qual data o policial gozou?</label>
                <input type="date" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-police-500 focus:border-police-500 outline-none" value={redeemDate} onChange={(e) => setRedeemDate(e.target.value)} required />
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="secondary" fullWidth onClick={() => setIsRedeemModalOpen(false)}>Cancelar</Button>
                <Button type="submit" fullWidth className="bg-police-700 hover:bg-police-600">Confirmar Baixa</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const RedeemLeave = () => {
  const navigate = useNavigate();
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [selectedOfficerId, setSelectedOfficerId] = useState('');
  const [availableLeaves, setAvailableLeaves] = useState<LeaveRecord[]>([]);
  const [selectedLeaveId, setSelectedLeaveId] = useState('');
  const [usageDate, setUsageDate] = useState(new Date().toISOString().split('T')[0]);
  const [redeemAmount, setRedeemAmount] = useState(0);

  useEffect(() => { StorageService.getOfficers().then(setOfficers); }, []);

  useEffect(() => {
    if (selectedOfficerId) {
      StorageService.getLeavesByOfficer(selectedOfficerId).then(leaves => {
        setAvailableLeaves(leaves.filter(l => l.status === LeaveStatus.AVAILABLE));
        setSelectedLeaveId('');
        setRedeemAmount(0);
      });
    } else {
      setAvailableLeaves([]);
      setRedeemAmount(0);
    }
  }, [selectedOfficerId]);

  useEffect(() => {
    if (selectedLeaveId) {
      const leave = availableLeaves.find(l => l.id === selectedLeaveId);
      if (leave) setRedeemAmount(leave.amount);
    }
  }, [selectedLeaveId, availableLeaves]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeaveId) return;
    const leaveToUpdate = availableLeaves.find(l => l.id === selectedLeaveId);
    if (!leaveToUpdate) return;
    
    const amount = Number(redeemAmount);
    if (amount <= 0 || amount > leaveToUpdate.amount) { alert("Quantidade inválida."); return; }

    if (amount === leaveToUpdate.amount) {
        const updatedLeave = { ...leaveToUpdate, status: LeaveStatus.USED, dateUsed: usageDate };
        await StorageService.saveLeave(updatedLeave);
    } else {
        const remaining = { ...leaveToUpdate, amount: leaveToUpdate.amount - amount };
        await StorageService.saveLeave(remaining);
        const used: LeaveRecord = {
            ...leaveToUpdate,
            id: generateId(),
            amount: amount,
            status: LeaveStatus.USED,
            dateUsed: usageDate,
            notes: leaveToUpdate.notes ? `${leaveToUpdate.notes} (Fracionada)` : '(Fracionada)',
            serviceDescription: leaveToUpdate.serviceDescription
        };
        await StorageService.saveLeave(used);
    }
    alert('Gozo de folga registrado com sucesso!');
    navigate(`/officers/${selectedOfficerId}`);
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <h2 className="text-xl font-bold text-police-900 mb-6 border-b pb-4">Lançar Gozo de Folga</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Selecione o Policial</label>
          <select className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-police-500 focus:border-police-500" value={selectedOfficerId} onChange={e => setSelectedOfficerId(e.target.value)} required>
            <option value="">Selecione...</option>
            {officers.map(o => (<option key={o.id} value={o.id}>{o.rank} {o.name} ({o.unit || 'S/Unidade'})</option>))}
          </select>
        </div>
        {selectedOfficerId && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Selecione a Folga Disponível</label>
            {availableLeaves.length === 0 ? (
              <div className="p-4 bg-yellow-50 text-yellow-800 text-sm rounded-lg border border-yellow-200 flex items-center"><AlertTriangle size={18} className="mr-2" />Este policial não possui folgas disponíveis.</div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                <p className="text-xs text-gray-500 mb-2">Selecione qual benefício está sendo usufruído:</p>
                {availableLeaves.map(leave => (
                  <label key={leave.id} className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${selectedLeaveId === leave.id ? 'bg-police-50 border-police-500 ring-1 ring-police-500' : 'hover:bg-gray-50 border-gray-200'}`}>
                    <input type="radio" name="leaveSelect" value={leave.id} checked={selectedLeaveId === leave.id} onChange={() => setSelectedLeaveId(leave.id)} className="mt-1 text-police-600 focus:ring-police-500 accent-police-600" />
                    <div className="ml-3 w-full">
                      <div className="flex justify-between">
                         <span className="block font-bold text-gray-900 text-sm">{leave.serviceType}</span>
                         <span className="text-xs font-bold text-police-700 bg-police-100 px-2 py-0.5 rounded-full">{leave.amount} Folga(s)</span>
                      </div>
                      {leave.serviceDescription && <span className="block text-xs font-semibold text-police-800 mt-1">{leave.serviceDescription}</span>}
                      <span className="block text-xs text-gray-500 mt-1">Gerada no serviço de: {leave.serviceDate.split('-').reverse().join('/')}</span>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}
        {selectedLeaveId && (
           <div className="animate-fade-in space-y-4">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade a Gozar</label>
               <input type="number" step="0.5" min="0.5" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-police-500 focus:border-police-500" value={redeemAmount} onChange={e => setRedeemAmount(Number(e.target.value))} required />
               <p className="text-xs text-gray-500 mt-1">Saldo total disponível: {availableLeaves.find(l => l.id === selectedLeaveId)?.amount}</p>
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">Data do Gozo</label>
               <input type="date" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-police-500 focus:border-police-500" value={usageDate} onChange={e => setUsageDate(e.target.value)} required />
             </div>
          </div>
        )}
        <div className="pt-2">
           <Button fullWidth type="submit" size="lg" className="bg-police-900 hover:bg-police-800 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed" disabled={!selectedLeaveId}><CheckSquare className="mr-2" size={18} /> Confirmar Gozo</Button>
        </div>
      </form>
    </div>
  );
};

const AddLeave = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const preSelectedOfficerId = query.get('officerId');

  const [officerId, setOfficerId] = useState(preSelectedOfficerId || '');
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [existingLeaves, setExistingLeaves] = useState<LeaveRecord[]>([]);

  const [formData, setFormData] = useState({
    serviceType: ServiceType.ESCALA_EXTRA,
    serviceDescription: '',
    serviceDate: new Date().toISOString().split('T')[0],
    amount: 1,
    notes: '',
    dateUsed: ''
  });

  useEffect(() => { 
    // Carrega tanto oficiais quanto histórico de folgas para sugestões
    Promise.all([
      StorageService.getOfficers(),
      StorageService.getLeaves()
    ]).then(([loadedOfficers, loadedLeaves]) => {
      setOfficers(loadedOfficers);
      setExistingLeaves(loadedLeaves);
    });
  }, []);

  // Filtra descrições únicas baseadas no tipo de serviço selecionado
  const availableDescriptions = useMemo(() => {
    const descriptions = existingLeaves
      .filter(l => l.serviceType === formData.serviceType && l.serviceDescription)
      .map(l => l.serviceDescription as string);
    return Array.from(new Set(descriptions)).sort();
  }, [existingLeaves, formData.serviceType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!officerId) return alert('Selecione um policial');

    const status = formData.dateUsed ? LeaveStatus.USED : LeaveStatus.AVAILABLE;
    const newLeave: LeaveRecord = {
      id: generateId(),
      officerId,
      status: status,
      ...formData,
      serviceType: formData.serviceType as ServiceType,
      amount: Number(formData.amount),
      dateUsed: formData.dateUsed || undefined
    };

    await StorageService.saveLeave(newLeave);
    navigate(`/officers/${officerId}`);
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <h2 className="text-xl font-bold text-police-900 mb-6 border-b pb-4">Registrar Folga</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Policial</label>
          <select className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-police-500 focus:border-police-500" value={officerId} onChange={e => setOfficerId(e.target.value)} required disabled={!!preSelectedOfficerId}>
            <option value="">Selecione...</option>
            {officers.map(o => (<option key={o.id} value={o.id}>{o.rank} {o.name}</option>))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Origem (Serviço)</label>
          <select className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-police-500 focus:border-police-500" value={formData.serviceType} onChange={e => setFormData({...formData, serviceType: e.target.value as ServiceType, serviceDescription: ''})}>
            {SERVICE_TYPES_LIST.map(t => (<option key={t} value={t}>{t}</option>))}
          </select>
        </div>
        <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">Descrição do Serviço (Opcional)</label>
           <div className="relative">
             <input 
               list="service-descriptions"
               type="text" 
               className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-police-500 focus:border-police-500 pr-8" 
               value={formData.serviceDescription} 
               onChange={e => setFormData({...formData, serviceDescription: e.target.value})} 
               placeholder="Selecione ou digite (Ex: Operação Verão)" 
               autoComplete="off"
             />
             <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
               <ListPlus size={16} />
             </div>
           </div>
           {/* Datalist para sugestões */}
           <datalist id="service-descriptions">
             {availableDescriptions.map((desc, index) => (
               <option key={index} value={desc} />
             ))}
           </datalist>
           <p className="text-[10px] text-gray-500 mt-1 ml-1">
             {availableDescriptions.length > 0 ? `${availableDescriptions.length} descrições encontradas para este tipo.` : 'Nenhuma descrição anterior encontrada.'}
           </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data do Serviço</label>
            <input type="date" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-police-500 focus:border-police-500" value={formData.serviceDate} onChange={e => setFormData({...formData, serviceDate: e.target.value})} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Qtd. Folgas</label>
            <input type="number" min="0.5" step="0.5" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-police-500 focus:border-police-500" value={formData.amount} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} required />
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
           <label className="block text-sm font-bold text-police-700 mb-1 flex items-center"><Calendar size={16} className="mr-1"/> Data do Gozo (Opcional)</label>
           <p className="text-xs text-gray-500 mb-2">Preencha apenas se a folga já foi ou será gozada em data definida.</p>
           <input type="date" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-police-500 focus:border-police-500" value={formData.dateUsed} onChange={e => setFormData({...formData, dateUsed: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
          <textarea className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-police-500 focus:border-police-500" rows={2} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
        </div>
        <div className="pt-4">
          <Button fullWidth type="submit" size="lg" className="bg-police-900 hover:bg-police-800">{formData.dateUsed ? 'Registrar como Gozada' : 'Registrar Folga'}</Button>
        </div>
      </form>
    </div>
  );
};

const OfficerForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', rank: Rank.SD, matricula: '', unit: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newOfficer: Officer = { id: generateId(), createdAt: Date.now(), ...formData, rank: formData.rank as Rank };
    await StorageService.saveOfficer(newOfficer);
    navigate('/officers');
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <h2 className="text-xl font-bold text-police-900 mb-6 border-b pb-4">Cadastrar Policial</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Posto/Graduação</label>
          <select className="w-full p-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-police-500 focus:border-police-500" value={formData.rank} onChange={e => setFormData({...formData, rank: e.target.value as Rank})}>
            {RANKS_LIST.map(r => (<option key={r} value={r}>{r}</option>))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome de Guerra / Completo</label>
          <input type="text" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-police-500 focus:border-police-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="Ex: Silva" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Matrícula</label>
            <input type="text" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-police-500 focus:border-police-500" value={formData.matricula} onChange={e => setFormData({...formData, matricula: e.target.value})} placeholder="000.000-0-X" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unidade</label>
            <input type="text" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-police-500 focus:border-police-500" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} placeholder="Ex: 1º CIA" />
          </div>
        </div>
        <div className="pt-4">
          <Button fullWidth type="submit" size="lg" className="bg-police-900 hover:bg-police-800">Salvar Policial</Button>
        </div>
      </form>
    </div>
  );
};

// 4. Main App Component
const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const handleLogin = (adminRole: boolean) => {
    setIsAdmin(adminRole);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  if (!isAuthenticated) return <LoginScreen onLogin={handleLogin} />;

  return (
    <HashRouter>
      <Layout isAdmin={isAdmin} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/officers" element={<OfficerList isAdmin={isAdmin} />} />
          <Route path="/officers/new" element={isAdmin ? <OfficerForm /> : <div className="text-center mt-10 text-red-500">Acesso Negado</div>} />
          <Route path="/officers/:id" element={<OfficerDetails isAdmin={isAdmin} />} />
          <Route path="/add-leave" element={isAdmin ? <AddLeave /> : <div className="text-center mt-10 text-red-500">Acesso Negado</div>} />
          <Route path="/redeem-leave" element={isAdmin ? <RedeemLeave /> : <div className="text-center mt-10 text-red-500">Acesso Negado</div>} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
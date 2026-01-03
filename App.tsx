
import React, { useState, useMemo } from 'react';
import { UserRole, Farmer, CropLoad, Sale, QualityGrade, SmsLog, Market, User } from './types';
import { INITIAL_FARMERS, INITIAL_LOADS, INITIAL_SALES, Icons, TAMIL_NADU_MARKETS } from './constants';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, ComposedChart, Legend 
} from 'recharts';
import { askAssistant } from './geminiService';
import { generateDailySummarySms, generateSaleSms } from './smsService';
import LoginPage from './LoginPage';

// --- Subcomponents ---

const SidebarItem: React.FC<{ icon: React.ReactNode; label: string; active: boolean; onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-3 w-full px-4 py-3 rounded-2xl transition-all duration-300 ${
      active 
        ? 'bg-green-600 text-white shadow-lg shadow-green-200' 
        : 'text-gray-500 hover:bg-green-50 hover:text-green-700'
    }`}
  >
    <div className={active ? 'text-white' : 'text-gray-400'}>{icon}</div>
    <span className="font-bold text-sm tracking-tight">{label}</span>
  </button>
);

const StatCard: React.FC<{ label: string; value: string | number; color: string; icon?: React.ReactNode; trend?: string }> = ({ label, value, color, icon, trend }) => (
  <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-4 rounded-2xl ${color} bg-opacity-10 text-${color.split('-')[1]}-600`}>
        {icon}
      </div>
      {trend && (
        <div className={`px-2 py-1 rounded-full text-[10px] font-black ${trend.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {trend}
        </div>
      )}
    </div>
    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
    <h3 className="text-3xl font-black text-gray-900 tracking-tighter">{value}</h3>
  </div>
);

// --- Main App ---

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedMarketId, setSelectedMarketId] = useState<string>(TAMIL_NADU_MARKETS[0].id);
  
  // Data States
  const [farmers, setFarmers] = useState<Farmer[]>(INITIAL_FARMERS);
  const [loads, setLoads] = useState<CropLoad[]>(INITIAL_LOADS);
  const [sales, setSales] = useState<Sale[]>(INITIAL_SALES);
  const [smsLogs, setSmsLogs] = useState<SmsLog[]>([]);
  
  // AI Assistant State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant'; text: string }[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // Filtered Data based on Selection
  const currentMarket = useMemo(() => TAMIL_NADU_MARKETS.find(m => m.id === selectedMarketId), [selectedMarketId]);
  const marketFarmers = useMemo(() => farmers.filter(f => f.marketId === selectedMarketId), [farmers, selectedMarketId]);
  const marketLoads = useMemo(() => loads.filter(l => l.marketId === selectedMarketId), [loads, selectedMarketId]);
  const marketSales = useMemo(() => sales.filter(s => s.marketId === selectedMarketId), [sales, selectedMarketId]);

  // Modals
  const [showFarmerModal, setShowFarmerModal] = useState(false);
  const [newFarmer, setNewFarmer] = useState<Partial<Farmer>>({ marketId: selectedMarketId });
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [newLoad, setNewLoad] = useState<Partial<CropLoad>>({ grade: QualityGrade.A, marketId: selectedMarketId });
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [selectedLoadForSale, setSelectedLoadForSale] = useState<CropLoad | null>(null);
  const [salePrice, setSalePrice] = useState<number>(0);
  const [buyerName, setBuyerName] = useState('');

  // Calculations
  const stats = useMemo(() => ({
    farmers: marketFarmers.length,
    sales: marketSales.reduce((acc, s) => acc + s.netAmount, 0),
    arrivals: marketLoads.reduce((acc, l) => acc + l.quantity, 0),
    pending: marketLoads.filter(l => l.status === 'PENDING').length
  }), [marketFarmers, marketSales, marketLoads]);

  const cropMixData = useMemo(() => {
    const data: Record<string, number> = {};
    marketLoads.forEach(l => { data[l.crop] = (data[l.crop] || 0) + l.quantity; });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [marketLoads]);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  const trendData = [
    { name: 'Mon', price: 32, volume: 1200 },
    { name: 'Tue', price: 35, volume: 1500 },
    { name: 'Wed', price: 34, volume: 1100 },
    { name: 'Thu', price: 38, volume: 1800 },
    { name: 'Fri', price: 36, volume: 1600 },
    { name: 'Sat', price: 40, volume: 2200 },
    { name: 'Sun', price: 42, volume: 2400 },
  ];

  // Logic Handlers
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const msg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: msg }]);
    setIsTyping(true);
    const response = await askAssistant(msg);
    setChatHistory(prev => [...prev, { role: 'assistant', text: response }]);
    setIsTyping(false);
  };

  const addFarmer = () => {
    if (newFarmer.name && newFarmer.phone) {
      const id = `F${Date.now()}`;
      setFarmers([...farmers, { ...newFarmer, id, marketId: selectedMarketId } as Farmer]);
      setShowFarmerModal(false);
      setNewFarmer({ marketId: selectedMarketId });
    }
  };

  const addLoad = () => {
    if (newLoad.farmerId && newLoad.quantity) {
      const id = `L${Date.now()}`;
      setLoads([...loads, { ...newLoad, id, marketId: selectedMarketId, status: 'PENDING', date: new Date().toISOString().split('T')[0] } as CropLoad]);
      setShowLoadModal(false);
      setNewLoad({ grade: QualityGrade.A, marketId: selectedMarketId });
    }
  };

  const processSale = () => {
    if (selectedLoadForSale && salePrice > 0 && buyerName) {
      const total = selectedLoadForSale.quantity * salePrice;
      const deductions = total * 0.05;
      const net = total - deductions;
      const newSale: Sale = {
        id: `S${Date.now()}`,
        loadId: selectedLoadForSale.id,
        farmerId: selectedLoadForSale.farmerId,
        marketId: selectedMarketId,
        pricePerUnit: salePrice,
        buyerName,
        totalAmount: total,
        deductions,
        netAmount: net,
        timestamp: new Date().toISOString(),
      };
      setSales([...sales, newSale]);
      setLoads(loads.map(l => l.id === selectedLoadForSale.id ? { ...l, status: 'SOLD' } : l));
      const farmer = farmers.find(f => f.id === selectedLoadForSale.farmerId);
      if (farmer) {
        const msg = generateSaleSms(farmer, newSale, selectedLoadForSale);
        setSmsLogs(prev => [{
          id: `SMS-${Date.now()}`,
          farmerName: farmer.name,
          phone: farmer.phone,
          message: msg,
          timestamp: new Date().toISOString(),
          status: 'DELIVERED'
        }, ...prev]);
      }
      setShowSaleModal(false);
    }
  };

  const exportCSV = () => {
    const headers = ['Farmer', 'Crop', 'Qty (kg)', 'Buyer', 'Net Amount (₹)', 'Timestamp'];
    const rows = marketSales.map(s => [
      farmers.find(f => f.id === s.farmerId)?.name || 'Unknown',
      loads.find(l => l.id === s.loadId)?.crop || 'Unknown',
      loads.find(l => l.id === s.loadId)?.quantity || 0,
      s.buyerName,
      s.netAmount,
      new Date(s.timestamp).toLocaleString()
    ]);
    const content = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(content));
    link.setAttribute("download", `Uzhavar360_${currentMarket?.district}_Data.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sendDailySummaries = () => {
    const today = new Date().toISOString().split('T')[0];
    const summaries: Record<string, number> = {};
    marketSales.forEach(s => {
      if (s.timestamp.startsWith(today)) {
        summaries[s.farmerId] = (summaries[s.farmerId] || 0) + s.netAmount;
      }
    });

    const newLogs: SmsLog[] = [];
    Object.entries(summaries).forEach(([fid, total]) => {
      const farmer = farmers.find(f => f.id === fid);
      if (farmer) {
        newLogs.push({
          id: `SMS-SUM-${Date.now()}-${fid}`,
          farmerName: farmer.name,
          phone: farmer.phone,
          message: generateDailySummarySms(farmer, total),
          timestamp: new Date().toISOString(),
          status: 'DELIVERED'
        });
      }
    });

    if (newLogs.length > 0) {
      setSmsLogs(prev => [...newLogs, ...prev]);
      alert(`Sent summaries to ${newLogs.length} farmers.`);
    } else {
      alert("No sales recorded today to summarize.");
    }
  };

  if (!user) return <LoginPage onLogin={setUser} />;

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden text-slate-900">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-100 flex flex-col hidden lg:flex shadow-sm z-20">
        <div className="p-10">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-green-100">U</div>
            <h1 className="text-xl font-black text-slate-900 tracking-tighter">UZHAVAR<span className="text-green-600">360</span></h1>
          </div>
        </div>
        
        <nav className="flex-1 px-6 space-y-2">
          <SidebarItem icon={<Icons.Dashboard />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={<Icons.Users />} label="Farmers" active={activeTab === 'farmers'} onClick={() => setActiveTab('farmers')} />
          <SidebarItem icon={<Icons.Inventory />} label="Daily Loads" active={activeTab === 'loads'} onClick={() => setActiveTab('loads')} />
          <SidebarItem icon={<Icons.Sales />} label="Sales Ledger" active={activeTab === 'sales'} onClick={() => setActiveTab('sales')} />
          <SidebarItem icon={<Icons.Chat />} label="SMS Logs" active={activeTab === 'sms'} onClick={() => setActiveTab('sms')} />
        </nav>

        <div className="p-8">
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Logged in as</p>
            <div className="flex items-center space-x-3 mb-4">
              <img src={`https://ui-avatars.com/api/?name=${user.name}&background=16a34a&color=fff&bold=true`} className="w-10 h-10 rounded-xl" alt="Avatar" />
              <div className="overflow-hidden">
                <p className="text-xs font-black truncate">{user.name}</p>
                <p className="text-[10px] text-slate-400 font-bold">{user.role}</p>
              </div>
            </div>
            <button onClick={() => setUser(null)} className="w-full py-2 bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-colors">Logout</button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40 px-10 py-6 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight capitalize">{activeTab}</h2>
            <div className="flex items-center space-x-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Market:</span>
              <select 
                className="bg-slate-50 border-none text-sm font-black text-green-700 px-4 py-2 rounded-xl focus:ring-4 focus:ring-green-500/10 transition-all outline-none cursor-pointer"
                value={selectedMarketId}
                onChange={(e) => setSelectedMarketId(e.target.value)}
              >
                {TAMIL_NADU_MARKETS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
             <button onClick={exportCSV} className="flex items-center space-x-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-black hover:bg-black transition-all shadow-xl shadow-slate-100">
                <Icons.Download />
                <span>Export Data</span>
              </button>
              {activeTab === 'sales' && user.role === UserRole.ADMIN && (
                <button onClick={sendDailySummaries} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-blue-100">Send Daily SMS</button>
              )}
          </div>
        </header>

        <div className="p-10 space-y-10">
          {activeTab === 'dashboard' && (
            <div className="space-y-10 animate-in fade-in duration-700">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard label="Total Producers" value={stats.farmers} color="bg-blue-600" icon={<Icons.Users />} trend="+5%" />
                <StatCard label="Net Transactions" value={`₹${stats.sales.toLocaleString()}`} color="bg-green-600" icon={<Icons.Sales />} trend="+18%" />
                <StatCard label="Daily Arrivals" value={`${stats.arrivals} kg`} color="bg-amber-500" icon={<Icons.Inventory />} trend="-2%" />
                <StatCard label="Active settlements" value={stats.pending} color="bg-rose-500" icon={<Icons.Dashboard />} trend="+3" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">Market Pulse Index</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 'bold', fontSize: 11}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 'bold', fontSize: 11}} />
                        <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)'}} />
                        <Area type="monotone" dataKey="price" stroke="#16a34a" fill="#dcfce7" strokeWidth={4} />
                        <Bar dataKey="volume" fill="#e2e8f0" radius={[6, 6, 0, 0]} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">Stock Distribution</h3>
                  <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={cropMixData} innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value">
                          {cropMixData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{fontSize: '11px', fontWeight: 'bold', paddingTop: '20px'}} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'farmers' && (
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
               <div className="p-10 border-b border-gray-50 flex items-center justify-between">
                 <div>
                   <h3 className="text-2xl font-black text-slate-900 tracking-tight">Producer Registry</h3>
                   <p className="text-sm text-slate-400 font-bold mt-1">Verified farmers for {currentMarket?.name}</p>
                 </div>
                 <button onClick={() => setShowFarmerModal(true)} className="bg-green-600 text-white px-6 py-3 rounded-2xl text-xs font-black shadow-lg shadow-green-100 hover:bg-green-700 transition-all">+ REGISTER FARMER</button>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead className="bg-slate-50 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                     <tr>
                        <th className="px-10 py-5">Unique ID</th>
                        <th className="px-10 py-5">Full Name</th>
                        <th className="px-10 py-5">Contact</th>
                        <th className="px-10 py-5">Origin Village</th>
                        <th className="px-10 py-5">Specialization</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50">
                     {marketFarmers.map(f => (
                       <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                         <td className="px-10 py-6 font-mono text-xs text-slate-400 font-bold">{f.id}</td>
                         <td className="px-10 py-6 font-black text-slate-900">{f.name}</td>
                         <td className="px-10 py-6 text-slate-600 font-bold">{f.phone}</td>
                         <td className="px-10 py-6 text-slate-500 font-semibold">{f.village}</td>
                         <td className="px-10 py-6">
                           <span className="bg-green-100 text-green-700 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest">{f.primaryCrop}</span>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          )}

          {activeTab === 'loads' && (
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
               <div className="p-10 border-b border-gray-50 flex items-center justify-between">
                 <h3 className="text-2xl font-black text-slate-900 tracking-tight">Daily Stock Entries</h3>
                 <button onClick={() => setShowLoadModal(true)} className="bg-green-600 text-white px-6 py-3 rounded-2xl text-xs font-black shadow-lg shadow-green-100">+ RECORD ARRIVAL</button>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead className="bg-slate-50 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                     <tr>
                        <th className="px-10 py-5">Timestamp</th>
                        <th className="px-10 py-5">Producer</th>
                        <th className="px-10 py-5">Commodity</th>
                        <th className="px-10 py-5">Volume (kg)</th>
                        <th className="px-10 py-5">Quality</th>
                        <th className="px-10 py-5 text-right">Process</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50">
                     {marketLoads.map(l => (
                       <tr key={l.id} className="hover:bg-slate-50">
                         <td className="px-10 py-6 text-slate-400 font-bold">{l.date}</td>
                         <td className="px-10 py-6 font-black text-slate-900">{farmers.find(f => f.id === l.farmerId)?.name}</td>
                         <td className="px-10 py-6 text-slate-600 font-black">{l.crop}</td>
                         <td className="px-10 py-6 font-black text-slate-900">{l.quantity}</td>
                         <td className="px-10 py-6">
                           <span className={`px-3 py-1 rounded-xl text-[10px] font-black ${l.grade === 'A' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>GRADE {l.grade}</span>
                         </td>
                         <td className="px-10 py-6 text-right">
                           {l.status === 'PENDING' ? (
                             <button onClick={() => { setSelectedLoadForSale(l); setShowSaleModal(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black shadow-lg shadow-blue-50">SALE ENTRY</button>
                           ) : <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Closed</span>}
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          )}

          {activeTab === 'sales' && (
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
               <div className="p-10 border-b border-gray-50">
                 <h3 className="text-2xl font-black text-slate-900 tracking-tight">Market Sales Ledger</h3>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead className="bg-slate-50 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                     <tr>
                        <th className="px-10 py-5">Audit ID</th>
                        <th className="px-10 py-5">Farmer</th>
                        <th className="px-10 py-5">Buyer</th>
                        <th className="px-10 py-5 text-right">Settlement (₹)</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50">
                     {marketSales.map(s => (
                       <tr key={s.id}>
                         <td className="px-10 py-6 font-mono text-[10px] text-slate-400">{s.id}</td>
                         <td className="px-10 py-6 font-black text-slate-900">{farmers.find(f => f.id === s.farmerId)?.name}</td>
                         <td className="px-10 py-6 font-bold text-blue-600">{s.buyerName}</td>
                         <td className="px-10 py-6 text-right font-black text-green-700 text-lg">₹{s.netAmount.toLocaleString()}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          )}

          {activeTab === 'sms' && (
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
               <div className="p-10 border-b border-gray-50">
                 <h3 className="text-2xl font-black text-slate-900 tracking-tight">Notification Logs</h3>
               </div>
               <div className="p-10 space-y-8">
                  {smsLogs.length === 0 ? <div className="text-center py-20 text-slate-300 font-black uppercase tracking-widest italic">No outbound traffic</div> : 
                    smsLogs.map(log => (
                      <div key={log.id} className="p-8 bg-slate-50 border border-slate-100 rounded-[2rem] flex items-start space-x-6">
                        <div className="w-12 h-12 bg-green-100 text-green-700 rounded-2xl flex items-center justify-center flex-shrink-0"><Icons.Chat /></div>
                        <div>
                           <div className="flex items-center justify-between mb-2">
                             <h4 className="font-black text-slate-900">{log.farmerName}</h4>
                             <span className="text-[10px] font-black text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                           </div>
                           <p className="text-sm font-bold text-slate-600 leading-relaxed italic">"{log.message}"</p>
                           <div className="mt-4 flex space-x-2"><span className="px-3 py-1 bg-green-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest">SENT</span></div>
                        </div>
                      </div>
                    ))
                  }
               </div>
            </div>
          )}
        </div>
      </main>

      {/* Floating AI Assistant - High Visibility Text Fix Included */}
      <div className={`fixed bottom-8 right-8 z-[100] transition-all duration-500 transform ${chatOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-75 translate-y-10 opacity-0 pointer-events-none'}`}>
        <div className="bg-white rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] w-[24rem] md:w-[28rem] border border-gray-100 flex flex-col h-[600px] overflow-hidden">
          <div className="bg-green-600 text-white p-8 flex items-center justify-between">
            <div className="flex items-center space-x-4">
               <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><Icons.Chat /></div>
               <span className="font-black tracking-tight">Uzhavar360 AI</span>
            </div>
            <button onClick={() => setChatOpen(false)} className="text-white hover:opacity-50 transition-opacity">✕</button>
          </div>
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-6 py-4 rounded-[2rem] text-sm font-bold shadow-sm ${msg.role === 'user' ? 'bg-green-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/50'}`}>{msg.text}</div>
              </div>
            ))}
            {isTyping && <div className="text-[10px] font-black text-green-600 uppercase tracking-[0.2em] ml-2 animate-pulse">Assistant is thinking...</div>}
          </div>
          <div className="p-8 pt-0">
            <div className="bg-slate-50 border-2 border-slate-100 rounded-[2rem] p-2 flex items-center focus-within:border-green-500/20 transition-all">
              <input 
                type="text" 
                placeholder="Ask about your market..." 
                className="flex-1 bg-transparent text-sm font-bold text-slate-900 border-none focus:ring-0 px-4 py-2 outline-none" 
                value={chatInput} 
                onChange={(e) => setChatInput(e.target.value)} 
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} 
              />
              <button onClick={handleSendMessage} className="bg-green-600 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all">↑</button>
            </div>
          </div>
        </div>
      </div>
      
      <button onClick={() => setChatOpen(!chatOpen)} className={`fixed bottom-8 right-8 w-16 h-16 bg-green-600 text-white rounded-[1.5rem] shadow-2xl flex items-center justify-center hover:bg-green-700 transition-all z-[90] ${chatOpen ? 'opacity-0' : 'opacity-100'}`}><Icons.Chat /></button>

      {/* Modals - All with text-slate-900 fixes */}
      {showFarmerModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-lg p-12 shadow-2xl">
            <h3 className="text-3xl font-black text-slate-900 mb-8 tracking-tight text-center">New Producer</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Full Name" className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 focus:ring-2 focus:ring-green-500/20 outline-none" onChange={(e) => setNewFarmer({...newFarmer, name: e.target.value})} />
              <input type="text" placeholder="Mobile Number" className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 focus:ring-2 focus:ring-green-500/20 outline-none" onChange={(e) => setNewFarmer({...newFarmer, phone: e.target.value})} />
              <input type="text" placeholder="Village" className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 focus:ring-2 focus:ring-green-500/20 outline-none" onChange={(e) => setNewFarmer({...newFarmer, village: e.target.value})} />
              <input type="text" placeholder="Primary Crop" className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 focus:ring-2 focus:ring-green-500/20 outline-none" onChange={(e) => setNewFarmer({...newFarmer, primaryCrop: e.target.value})} />
            </div>
            <div className="mt-10 flex space-x-4">
              <button onClick={() => setShowFarmerModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-sm uppercase tracking-widest">Cancel</button>
              <button onClick={addFarmer} className="flex-[2] py-4 bg-green-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-green-100">Register</button>
            </div>
          </div>
        </div>
      )}

      {showLoadModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-lg p-12 shadow-2xl border-t-[10px] border-amber-400">
            <h3 className="text-3xl font-black text-slate-900 mb-8 tracking-tight text-center">Stock Entry</h3>
            <div className="space-y-4">
              <select className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 outline-none cursor-pointer" onChange={(e) => setNewLoad({...newLoad, farmerId: e.target.value})}>
                <option value="">Select Producer</option>
                {marketFarmers.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
              <input type="text" placeholder="Commodity" className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 outline-none" onChange={(e) => setNewLoad({...newLoad, crop: e.target.value})} />
              <input type="number" placeholder="Net Weight (kg)" className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 outline-none" onChange={(e) => setNewLoad({...newLoad, quantity: Number(e.target.value)})} />
            </div>
            <div className="mt-10 flex space-x-4">
              <button onClick={() => setShowLoadModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-sm uppercase tracking-widest">Cancel</button>
              <button onClick={addLoad} className="flex-[2] py-4 bg-amber-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-amber-100">Commit</button>
            </div>
          </div>
        </div>
      )}

      {showSaleModal && selectedLoadForSale && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-lg p-12 shadow-2xl border-t-[10px] border-blue-600">
            <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Finalize Sale</h3>
            <p className="text-sm font-bold text-slate-400 mb-10 uppercase tracking-widest">Settling {selectedLoadForSale.quantity}kg of {selectedLoadForSale.crop}</p>
            <div className="space-y-6">
               <input type="number" placeholder="Unit Price (₹/kg)" className="w-full bg-slate-50 border-none rounded-2xl px-6 py-5 text-2xl font-black text-blue-600 focus:ring-4 focus:ring-blue-500/10 outline-none" onChange={(e) => setSalePrice(Number(e.target.value))} />
               <input type="text" placeholder="Buyer / Corporate Entity" className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-900 outline-none" onChange={(e) => setBuyerName(e.target.value)} />
               <div className="bg-blue-50 p-6 rounded-[1.5rem] flex justify-between items-center">
                  <span className="text-xs font-black text-blue-700 uppercase tracking-widest">Est. Farmer Credit:</span>
                  <span className="text-2xl font-black text-blue-800">₹{(salePrice * selectedLoadForSale.quantity * 0.95).toLocaleString()}</span>
               </div>
            </div>
            <div className="mt-10 flex space-x-4">
              <button onClick={() => setShowSaleModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-sm uppercase tracking-widest">Abort</button>
              <button onClick={processSale} className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-100">Authorize</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

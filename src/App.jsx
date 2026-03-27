import React, { useState } from 'react';
import { 
  ClipboardList, 
  PlusCircle, 
  Search, 
  Phone, 
  CheckCircle2, 
  Settings, 
  Printer, 
  Clock, 
  Wrench, 
  Hourglass, 
  AlertTriangle 
} from 'lucide-react';
import { useOrders } from './hooks/useOrders';
import { generateReceipt } from './utils/pdfGenerator';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Helper function to merge tailwind classes */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ST_STATUSES = [
  'INGRESADO',
  'EN REVISIÓN',
  'EN REPARACIÓN',
  'ESPERANDO REPUESTO',
  'LISTO',
  'AVISADO',
  'ENTREGADO'
];

const STATUS_COLORS = {
  'INGRESADO': 'bg-amber-100 text-amber-800 border-amber-200',
  'EN REVISIÓN': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'EN REPARACIÓN': 'bg-orange-100 text-orange-800 border-orange-200',
  'ESPERANDO REPUESTO': 'bg-red-100 text-red-800 border-red-200',
  'LISTO': 'bg-green-100 text-green-800 border-green-200',
  'AVISADO': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'ENTREGADO': 'bg-blue-100 text-blue-800 border-blue-200'
};

const DashboardCard = ({ title, count, icon: Icon, color, items }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <div className={cn("p-4 flex items-center justify-between border-b", color)}>
      <div className="flex items-center gap-2">
        <Icon size={20} />
        <h3 className="font-bold uppercase tracking-wider text-sm">{title}</h3>
      </div>
      <span className="text-2xl font-black opacity-40">{count}</span>
    </div>
    <div className="p-2 space-y-2 max-h-[300px] overflow-y-auto">
      {items.length === 0 ? (
        <p className="text-gray-400 text-xs text-center py-4 italic">Sin órdenes en este estado</p>
      ) : (
        items.map(order => (
          <div key={order.id} className="p-3 border rounded-lg hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-1">
              <span className="text-xs font-black text-gray-500">{order.stId}</span>
              <span className="text-[10px] text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
            <p className="font-bold text-sm truncate">{order.client}</p>
            <p className="text-xs text-gray-600 truncate">{order.machine} - {order.model}</p>
            <p className="text-[10px] text-red-500 mt-1 line-clamp-2 italic">{order.failure}</p>
          </div>
        ))
      )}
    </div>
  </div>
);

export default function App() {
  const { orders, loading, addOrder, updateOrder } = useOrders();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [businessLogo, setBusinessLogo] = useState(localStorage.getItem('business_logo') || null);
  const [businessInfo, setBusinessInfo] = useState(JSON.parse(localStorage.getItem('business_info')) || {
    name: 'COMERCIAL SOTAVENTO LTDA.',
    area: 'Servicio Técnico',
    address: 'Ancud, Calle Pudeto 351, Chile',
    phone: '(65) 262 3000'
  });

  const handleSaveSettings = (newInfo) => {
    setBusinessInfo(newInfo);
    localStorage.setItem('business_info', JSON.stringify(newInfo));
    setIsSettingsOpen(false);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        setBusinessLogo(base64);
        localStorage.setItem('business_logo', base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const [formData, setFormData] = useState({
    client: '',
    phone: '',
    machine: '',
    model: '',
    serialNumber: '',
    failure: '',
    status: 'INGRESADO'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const stId = await addOrder(formData);
    setFormData({
      client: '', phone: '', machine: '', model: '', serialNumber: '', failure: '', status: 'INGRESADO'
    });
    setIsFormOpen(false);
    // Auto-generate PDF for new order
    const newOrder = { ...formData, stId, createdAt: new Date().toISOString() };
    generateReceipt(newOrder);
  };

  const handleMarkAsCalled = async (order) => {
    await updateOrder(order.id, { 
      status: 'AVISADO', 
      lastCalled: new Date().toISOString() 
    });
  };

  const handleStatusChange = async (orderId, newStatus) => {
    await updateOrder(orderId, { status: newStatus });
  };

  const filteredOrders = orders.filter(o => 
    o.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.stId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.machine.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    'EN PROCESO': orders.filter(o => ['INGRESADO', 'EN REVISIÓN', 'EN REPARACIÓN'].includes(o.status)),
    'ESPERANDO REPUESTO': orders.filter(o => o.status === 'ESPERANDO REPUESTO'),
    'LISTOS': orders.filter(o => o.status === 'LISTO'),
    'AVISADOS': orders.filter(o => o.status === 'AVISADO')
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Cargando...</div>;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-blue-900 text-white p-4 shadow-lg sticky top-0 z-10">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <label className="cursor-pointer group relative">
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              <div className="bg-white p-2 rounded-lg hover:ring-2 ring-blue-300 transition-all">
                {businessLogo ? (
                  <img src={businessLogo} alt="Logo" className="w-12 h-12 object-contain" />
                ) : (
                  <div className="w-12 h-12 bg-blue-100 rounded text-blue-900 flex items-center justify-center font-black">CS</div>
                )}
                <div className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-lg transition-opacity text-[8px] font-bold">CARGAR LOGO</div>
              </div>
            </label>
            <div>
              <h1 className="text-xl font-black tracking-tighter">{businessInfo.name}</h1>
              <p className="text-xs font-medium opacity-80 uppercase tracking-widest">{businessInfo.area}</p>
              <p className="text-[10px] opacity-60">{businessInfo.address}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300" size={18} />
              <input 
                type="text" 
                placeholder="Buscar por ID, Cliente o Equipo..." 
                className="w-full pl-10 pr-4 py-2 bg-blue-800/50 border border-blue-700 rounded-lg text-white placeholder-blue-300 outline-none focus:ring-2 focus:ring-blue-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="bg-blue-800 hover:bg-blue-700 p-2 rounded-lg transition-colors"
              title="Configuración de Empresa"
            >
              <Settings size={20} />
            </button>
            <button 
              onClick={() => setIsFormOpen(true)}
              className="bg-blue-500 hover:bg-blue-400 p-2 rounded-lg flex items-center gap-2 transition-colors font-bold whitespace-nowrap"
            >
              <PlusCircle size={20} />
              <span className="hidden sm:inline">NUEVO INGRESO</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 flex-1 space-y-8">
        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardCard title="En Proceso" count={stats['EN PROCESO'].length} icon={Wrench} color="bg-amber-50 text-amber-700 border-amber-100" items={stats['EN PROCESO']} />
          <DashboardCard title="Espera Repuesto" count={stats['ESPERANDO REPUESTO'].length} icon={Hourglass} color="bg-red-50 text-red-700 border-red-100" items={stats['ESPERANDO REPUESTO']} />
          <DashboardCard title="Listos" count={stats['LISTOS'].length} icon={CheckCircle2} color="bg-green-50 text-green-700 border-green-100" items={stats['LISTOS']} />
          <DashboardCard title="Avisados" count={stats['AVISADOS'].length} icon={Phone} color="bg-emerald-50 text-emerald-700 border-emerald-100" items={stats['AVISADOS']} />
        </div>

        {/* Orders List / Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-xl font-black text-gray-800 flex items-center gap-2 uppercase tracking-tight">
              <ClipboardList className="text-blue-600" />
              Gestión de Órdenes
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b text-xs font-bold text-gray-500 uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">ID / Ingreso</th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Equipo</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredOrders.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">No se encontraron órdenes</td></tr>
                ) : (
                  filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-black text-blue-900">{order.stId}</div>
                        <div className="text-[10px] text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-800">{order.client}</div>
                        <div className="text-xs text-gray-500">{order.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-700">{order.machine}</div>
                        <div className="text-[10px] text-gray-400">{order.model} - S/N: {order.serialNumber}</div>
                      </td>
                      <td className="px-6 py-4">
                        <select 
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={cn(
                            "text-[10px] font-bold px-2 py-1 rounded-full border outline-none cursor-pointer",
                            STATUS_COLORS[order.status]
                          )}
                        >
                          {ST_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {order.status !== 'AVISADO' && order.status !== 'ENTREGADO' && (
                            <button 
                              onClick={() => handleMarkAsCalled(order)}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors title='Marcar como avisado'"
                            >
                              <Phone size={18} />
                            </button>
                          )}
                          <button 
                            onClick={() => generateReceipt(order)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors title='Imprimir Comprobante'"
                          >
                            <Printer size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black tracking-tight">REGISTRAR INGRESO</h2>
                <p className="text-blue-100 text-sm">Nueva orden de trabajo técnico</p>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="text-white hover:bg-blue-500 p-2 rounded-lg transition-colors">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Cliente</label>
                  <input required type="text" className="input-field" placeholder="Nombre completo" value={formData.client} onChange={e => setFormData({...formData, client: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Teléfono</label>
                  <input required type="text" className="input-field" placeholder="(+56) 9..." value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Equipo / Máquina</label>
                  <input required type="text" className="input-field" placeholder="Ej: Motosierra" value={formData.machine} onChange={e => setFormData({...formData, machine: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Modelo</label>
                  <input required type="text" className="input-field" placeholder="Ej: MS-170" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">N° de Serie</label>
                  <input type="text" className="input-field" placeholder="Opcional" value={formData.serialNumber} onChange={e => setFormData({...formData, serialNumber: e.target.value})} />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Falla Reportada</label>
                  <textarea required rows={4} className="input-field resize-none" placeholder="Descripción detallada del problema..." value={formData.failure} onChange={e => setFormData({...formData, failure: e.target.value})}></textarea>
                </div>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsFormOpen(false)} className="btn btn-secondary flex-1">CANCELAR</button>
                <button type="submit" className="btn btn-primary flex-1">GUARDAR E IMPRIMIR</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-blue-900 p-6 text-white flex justify-between items-center">
              <h2 className="text-xl font-black">DATOS DEL NEGOCIO</h2>
              <button onClick={() => setIsSettingsOpen(false)}>✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Nombre del Negocio</label>
                <input type="text" className="input-field" value={businessInfo.name} onChange={e => setBusinessInfo({...businessInfo, name: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Área / Especialidad</label>
                <input type="text" className="input-field" value={businessInfo.area} onChange={e => setBusinessInfo({...businessInfo, area: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Dirección</label>
                <input type="text" className="input-field" value={businessInfo.address} onChange={e => setBusinessInfo({...businessInfo, address: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Teléfono de Contacto</label>
                <input type="text" className="input-field" value={businessInfo.phone} onChange={e => setBusinessInfo({...businessInfo, phone: e.target.value})} />
              </div>
              <div className="pt-4 flex gap-3">
                <button onClick={() => setIsSettingsOpen(false)} className="btn btn-secondary flex-1">CANCELAR</button>
                <button onClick={() => handleSaveSettings(businessInfo)} className="btn btn-primary flex-1">GUARDAR CAMBIOS</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-100 p-4 text-center text-[10px] text-gray-400 font-medium">
        SISTEMA DE SERVICIO TÉCNICO - COMERCIAL SOTAVENTO LTDA. © 2026
      </footer>
    </div>
  );
}

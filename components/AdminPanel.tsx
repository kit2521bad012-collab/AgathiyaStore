
import React, { useState, useEffect } from 'react';
import { Product, Order, Analytics, CategoryType, UnitType } from '../types';
import { dbService } from '../services/dbService';
import { generateProductDescription } from '../services/geminiService';

export const AdminPanel: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'orders' | 'products'>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Analytics | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', unit: 'kg' as UnitType, category: 'Vegetables' as CategoryType, imageUrl: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageError, setImageError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setProducts(await dbService.getProducts());
    setOrders(await dbService.getOrders());
    setStats(await dbService.getAnalytics());
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImageError('');
    
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setImageError('Image size exceeds 2MB limit.');
        e.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateAI = async () => {
    if (!formData.name) return alert('Enter a product name first');
    setIsGenerating(true);
    const desc = await generateProductDescription(formData.name);
    setFormData(prev => ({ ...prev, description: desc }));
    setIsGenerating(false);
  };

  return (
    <div className="pb-24">
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 md:justify-center">
        <button onClick={() => setView('dashboard')} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${view === 'dashboard' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-emerald-700 shadow-sm'}`}>Dashboard</button>
        <button onClick={() => setView('orders')} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${view === 'orders' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-emerald-700 shadow-sm'}`}>Orders</button>
        <button onClick={() => setView('products')} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${view === 'products' ? 'bg-emerald-600 text-white shadow-md' : 'bg-white text-emerald-700 shadow-sm'}`}>Inventory</button>
      </div>

      {view === 'dashboard' && stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} color="emerald" />
          <StatCard title="Total Orders" value={stats.totalOrders} color="blue" />
          <StatCard title="Total Users" value={stats.totalUsers} color="purple" />
          <StatCard title="Pending" value={stats.pendingOrders} color="amber" />
        </div>
      )}

      {view === 'orders' && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-emerald-950">Order Management</h2>
          {orders.map(order => (
            <div key={order.id} className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-50 text-sm">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-[10px] font-mono text-emerald-600 block uppercase font-bold">{order.id}</span>
                  <h4 className="font-bold text-slate-800 text-base">Order by {order.userName}</h4>
                </div>
                <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${order.status === 'Pending' ? 'bg-amber-100 text-amber-700' : order.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>{order.status}</span>
              </div>
              
              <div className="space-y-2 mb-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs bg-slate-50/50 p-2 rounded-lg border border-emerald-50/50">
                    <span className="font-medium text-slate-700">{item.productName} ({item.quantity} {item.quantityUnit})</span>
                    <span className="font-bold text-emerald-700">₹{item.total}</span>
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 p-3 rounded-xl text-slate-500 text-xs mb-4 space-y-1">
                <p className="flex justify-between"><span className="font-bold">Phone:</span> <span>{order.userPhone}</span></p>
                <p className="flex justify-between"><span className="font-bold">Address:</span> <span className="text-right ml-4">{order.userAddress}</span></p>
                <p className="flex justify-between border-t border-slate-200 pt-1 mt-1 text-slate-950 text-sm font-black"><span className="font-bold">Total Bill:</span> <span>₹{order.totalAmount}</span></p>
              </div>

              <div className="flex gap-2">
                <button onClick={() => {dbService.updateOrderStatus(order.id, 'Delivered'); fetchData();}} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm active:scale-95 transition-all">Mark Delivered</button>
                <button onClick={() => {dbService.updateOrderStatus(order.id, 'Cancelled'); fetchData();}} className="flex-1 py-3 bg-white text-red-500 border border-red-100 rounded-xl text-xs font-bold active:scale-95 transition-all">Cancel</button>
              </div>
            </div>
          ))}
          {orders.length === 0 && <p className="text-center text-slate-400 py-10">No orders placed yet.</p>}
        </div>
      )}

      {view === 'products' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-emerald-50 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              {editingId ? 'Edit Item' : 'Add New Grocery'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase mb-1 block ml-1">Product Name</label>
                <input type="text" placeholder="e.g. Alphonso Mangoes" className="admin-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-1 block ml-1">Category</label>
                  <select className="admin-input" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})}><option value="Vegetables">Vegetables</option><option value="Fruits">Fruits</option><option value="Dairy">Dairy</option><option value="Spices">Spices</option><option value="Grains">Grains</option><option value="Beverages">Beverages</option></select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-1 block ml-1">Base Unit</label>
                  <select className="admin-input" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value as any})}><option value="kg">kg</option><option value="gm">gm</option><option value="pack">pack</option><option value="liter">liter</option><option value="pc">piece</option></select>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-400 uppercase block ml-1">Description</label>
                  <button type="button" onClick={handleGenerateAI} disabled={isGenerating} className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 disabled:opacity-50">
                    {isGenerating ? 'Generating...' : '✨ Suggest AI'}
                  </button>
                </div>
                <textarea rows={2} placeholder="Brief product summary..." className="admin-input resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-1 block ml-1">Price (₹)</label>
                  <input type="number" placeholder="0.00" className="admin-input" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-1 block ml-1">Upload Image (Max 2MB)</label>
                  <div className="relative">
                    <input type="file" accept="image/*" onChange={handleImageChange} className="admin-input file:hidden text-xs" />
                  </div>
                </div>
              </div>
              
              {imageError && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{imageError}</p>}
              
              {formData.imageUrl && (
                <div className="mt-2 relative inline-block">
                  <img src={formData.imageUrl} className="w-24 h-24 rounded-xl object-cover border border-emerald-100" />
                  <button onClick={() => setFormData({...formData, imageUrl: ''})} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <button onClick={async () => {
                  if(!formData.name || !formData.price) return alert('Name and Price are required');
                  const payload = { ...formData, price: parseFloat(formData.price), imageUrl: formData.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e' };
                  if(editingId) await dbService.updateProduct(editingId, payload);
                  else await dbService.addProduct(payload);
                  setEditingId(null); setFormData({name:'', description:'', price:'', unit:'kg', category:'Vegetables', imageUrl:''});
                  fetchData();
                }} className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-200 active:scale-95 transition-all">
                  {editingId ? 'Update Item' : 'Save Product'}
                </button>
                {editingId && (
                  <button onClick={() => {setEditingId(null); setFormData({name:'', description:'', price:'', unit:'kg', category:'Vegetables', imageUrl:''});}} className="px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold active:scale-95 transition-all">Cancel</button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-bold text-emerald-950 px-2">Current Inventory</h2>
            {products.map(p => (
              <div key={p.id} className="flex items-center gap-3 bg-white p-3 rounded-2xl shadow-sm border border-emerald-50 hover:border-emerald-200 transition-colors">
                <img src={p.imageUrl} className="w-14 h-14 rounded-xl object-cover shadow-sm" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-800 truncate">{p.name}</h4>
                  <p className="text-[10px] text-emerald-600 font-bold tracking-wide">{p.category} • ₹{p.price}/{p.unit}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => {setEditingId(p.id); setFormData({...p, price: p.price.toString()}); window.scrollTo({top: 0, behavior: 'smooth'});}} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"><EditIcon/></button>
                  <button onClick={() => {if(confirm('Delete?')) { dbService.deleteProduct(p.id); fetchData(); }}} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"><DeleteIcon/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`.admin-input { @apply w-full px-4 py-3 rounded-xl border border-emerald-50 text-sm outline-none focus:ring-2 focus:ring-emerald-500 bg-emerald-50/10 transition-all; }`}</style>
    </div>
  );
};

const StatCard = ({ title, value, color }: any) => (
  <div className={`p-4 rounded-2xl border bg-white border-${color}-50 shadow-sm text-center`}>
    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{title}</p>
    <p className={`text-xl font-black text-${color}-600 mt-1`}>{value}</p>
  </div>
);

const EditIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>;
const DeleteIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

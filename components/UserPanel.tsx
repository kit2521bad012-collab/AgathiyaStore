
import React, { useState, useEffect } from 'react';
import { Product, Order, AuthUser, OrderItem } from '../types';
import { dbService } from '../services/dbService';
import { ProductCard } from './ProductCard';

interface CartItem extends Product {
  cartQuantity: number;
  cartUnit: string;
}

export const UserPanel: React.FC = () => {
  const [view, setView] = useState<'shop' | 'cart' | 'orders' | 'profile'>('shop');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  
  const [showConfigModal, setShowConfigModal] = useState<Product | null>(null);
  const [tempQuantity, setTempQuantity] = useState<number>(1);
  const [tempUnit, setTempUnit] = useState<string>('');
  
  const [isPlacing, setIsPlacing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const user = dbService.getCurrentUser() as AuthUser;

  useEffect(() => { 
    fetchData(); 
    const savedCart = localStorage.getItem('agathiya_temp_cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  useEffect(() => {
    localStorage.setItem('agathiya_temp_cart', JSON.stringify(cart));
  }, [cart]);

  const fetchData = async () => {
    setProducts(await dbService.getProducts());
    const o = await dbService.getOrders();
    setOrders(o.filter(order => order.userName === user.name));
  };

  const handleAddToCart = () => {
    if (!showConfigModal) return;
    setErrorMessage(null);

    if (tempUnit === 'kg' && tempQuantity < 1) {
      setErrorMessage("Minimum quantity is 1 kg.");
      return;
    }
    if (tempUnit === 'gm' && tempQuantity < 1000) {
      setErrorMessage("Minimum quantity is 1000 gm (1 kg).");
      return;
    }

    const newItem: CartItem = {
      ...showConfigModal,
      cartQuantity: tempQuantity,
      cartUnit: tempUnit
    };

    setCart(prev => {
      const existing = prev.findIndex(item => item.id === newItem.id && item.cartUnit === newItem.cartUnit);
      if (existing > -1) {
        const updated = [...prev];
        updated[existing].cartQuantity += newItem.cartQuantity;
        return updated;
      }
      return [...prev, newItem];
    });

    setShowConfigModal(null);
    setTempQuantity(1);
    setView('cart');
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const cartTotal = cart.reduce((sum, item) => {
    const pricePerUnit = item.cartUnit === 'gm' ? item.price / 1000 : item.price;
    return sum + (pricePerUnit * item.cartQuantity);
  }, 0);

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    if (cartTotal < 100) {
      setErrorMessage("Minimum order total must be ₹100.");
      return;
    }

    setIsPlacing(true);
    try {
      const orderItems: OrderItem[] = cart.map(item => ({
        productId: item.id,
        productName: item.name,
        price: item.price,
        quantity: item.cartQuantity,
        quantityUnit: item.cartUnit,
        total: Math.round((item.cartUnit === 'gm' ? item.price / 1000 : item.price) * item.cartQuantity)
      }));

      await dbService.placeOrder({
        userName: user.name,
        userPhone: user.phone,
        userAddress: user.address,
        items: orderItems,
        totalAmount: Math.round(cartTotal)
      });

      setIsPlacing(false);
      setOrderSuccess(true);
      setCart([]);
      
      setTimeout(() => {
        setOrderSuccess(false);
        fetchData();
        setView('orders');
      }, 2000);
    } catch (e) {
      setErrorMessage("Order failed. Please try again.");
      setIsPlacing(false);
    }
  };

  const adjustTempQuantity = (val: number) => {
    setErrorMessage(null);
    const step = tempUnit === 'gm' ? 250 : 0.25;
    const nextVal = Math.max(0, tempQuantity + val);
    setTempQuantity(parseFloat(nextVal.toFixed(2)));
  };

  return (
    <div className="pb-32 px-1">
      {view === 'shop' && (
        <div className="space-y-6">
          <div className="relative">
            <input type="text" placeholder="Search farm-fresh produce..." className="w-full pl-12 pr-4 py-4 rounded-3xl border border-emerald-100 bg-white shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
            <svg className="w-6 h-6 absolute left-4 top-4 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {products.map(p => (
              <ProductCard key={p.id} product={p} onOrder={(prod) => { 
                setShowConfigModal(prod); 
                setTempUnit(prod.unit); 
                setTempQuantity(1);
                setErrorMessage(null);
              }} />
            ))}
          </div>
        </div>
      )}

      {view === 'cart' && (
        <div className="space-y-6 animate-slide-up">
          <h2 className="text-2xl font-black text-emerald-950 px-1">My Cart</h2>
          {cart.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[2rem] border border-emerald-50">
              <p className="text-slate-400 font-bold mb-4">Your cart is empty</p>
              <button onClick={() => setView('shop')} className="text-emerald-600 font-bold">Browse Products</button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-3">
                {cart.map((item, idx) => (
                  <div key={`${item.id}-${idx}`} className="bg-white p-4 rounded-2xl border border-emerald-50 flex items-center gap-4 shadow-sm">
                    <img src={item.imageUrl} className="w-16 h-16 rounded-xl object-cover" />
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-800 text-sm">{item.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold tracking-tight uppercase">{item.cartQuantity} {item.cartUnit} • ₹{Math.round((item.cartUnit === 'gm' ? item.price/1000 : item.price) * item.cartQuantity)}</p>
                    </div>
                    <button onClick={() => removeFromCart(idx)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </div>
                ))}
              </div>

              <div className="bg-emerald-900 text-white p-6 rounded-[2rem] shadow-xl space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-emerald-400 font-bold uppercase text-[10px] tracking-widest">Grand Total</span>
                  <span className="text-3xl font-black">₹{Math.round(cartTotal)}</span>
                </div>
                
                {cartTotal < 100 && (
                  <div className="p-3 bg-white/10 rounded-xl text-[10px] font-bold text-emerald-200 text-center border border-emerald-500/30">
                    Add ₹{Math.round(100 - cartTotal)} more to reach minimum order value (₹100)
                  </div>
                )}

                {errorMessage && (
                  <div className="p-3 bg-red-500/20 rounded-xl text-[10px] font-bold text-red-200 text-center">
                    {errorMessage}
                  </div>
                )}

                <button 
                  onClick={handlePlaceOrder}
                  disabled={isPlacing || cartTotal < 100}
                  className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all disabled:opacity-30 disabled:grayscale"
                >
                  {isPlacing ? 'Processing...' : 'Complete Order'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {view === 'orders' && (
        <div className="space-y-4 animate-slide-up">
          <h2 className="text-2xl font-black text-emerald-950 px-1">Order History</h2>
          <div className="space-y-4">
            {orders.map(o => (
              <div key={o.id} className="bg-white p-5 rounded-3xl shadow-sm border border-emerald-50">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-[9px] font-mono text-emerald-500 font-bold mb-1 tracking-widest">{o.id}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(o.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${o.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {o.status}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  {o.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <span className="text-slate-600 font-medium">{item.productName} ({item.quantity} {item.quantityUnit})</span>
                      <span className="text-slate-800 font-bold">₹{item.total}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-50 flex justify-between items-center">
                  <span className="text-[10px] font-black text-emerald-900 uppercase tracking-widest">Paid Total</span>
                  <span className="text-lg font-black text-emerald-600">₹{o.totalAmount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'profile' && (
        <div className="space-y-6 animate-slide-up">
          <div className="bg-white p-8 rounded-[2.5rem] border border-emerald-50 shadow-sm text-center">
            <div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
              {user.name[0]}
            </div>
            <h2 className="text-xl font-black text-emerald-950">{user.name}</h2>
            <p className="text-emerald-600 text-xs font-bold">{user.email}</p>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-emerald-50 space-y-4">
             <div className="pb-3 border-b border-slate-50">
               <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Delivery Address</p>
               <p className="text-sm font-bold text-slate-800">{user.address}</p>
             </div>
             <div>
               <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Contact</p>
               <p className="text-sm font-bold text-slate-800">{user.phone}</p>
             </div>
          </div>
        </div>
      )}

      {/* CONFIG MODAL */}
      {showConfigModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-emerald-950/40 backdrop-blur-md">
          <div className="bg-white rounded-t-[3rem] sm:rounded-[3rem] p-8 w-full max-w-md shadow-2xl animate-slide-up relative">
            <button onClick={() => setShowConfigModal(null)} className="absolute top-6 right-6 p-2 text-slate-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
            <h3 className="text-2xl font-black text-emerald-950 mb-2">{showConfigModal.name}</h3>
            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mb-6">Select weight for cart</p>
            
            <div className="flex gap-2 mb-8 bg-slate-50 p-1 rounded-2xl">
              <button onClick={() => { setTempUnit(showConfigModal.unit); setTempQuantity(1); }} className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${tempUnit === showConfigModal.unit ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-400'}`}>By {showConfigModal.unit}</button>
              {showConfigModal.unit === 'kg' && <button onClick={() => { setTempUnit('gm'); setTempQuantity(1000); }} className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${tempUnit === 'gm' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-400'}`}>By gm</button>}
            </div>

            <div className="flex items-center gap-4 mb-4">
              <button onClick={() => adjustTempQuantity(-(tempUnit === 'gm' ? 250 : 0.25))} className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-2xl">-</button>
              <div className="flex-1 text-center bg-white border-2 border-emerald-50 rounded-2xl py-2">
                <input type="number" step={tempUnit === 'gm' ? '1' : '0.25'} className="w-full text-center text-3xl font-black text-slate-800 bg-transparent outline-none" value={tempQuantity} onChange={(e) => {setTempQuantity(parseFloat(e.target.value) || 0); setErrorMessage(null);}} />
                <span className="block text-[10px] text-emerald-600 font-black uppercase">{tempUnit}(s)</span>
              </div>
              <button onClick={() => adjustTempQuantity(tempUnit === 'gm' ? 250 : 0.25)} className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-2xl">+</button>
            </div>

            {errorMessage && <p className="mb-6 text-red-500 text-center text-xs font-bold">{errorMessage}</p>}

            <button onClick={handleAddToCart} className="w-full py-5 bg-emerald-600 text-white rounded-[1.5rem] font-bold shadow-xl shadow-emerald-200">
              Add to Cart
            </button>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {orderSuccess && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-emerald-950/40 backdrop-blur-md">
          <div className="bg-white p-12 rounded-[3rem] text-center shadow-2xl animate-bounce">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
            </div>
            <h3 className="text-2xl font-black text-emerald-950">Placed!</h3>
            <p className="text-slate-500 mt-2">Your grouped order is confirmed.</p>
          </div>
        </div>
      )}

      {/* NAVIGATION */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-emerald-50 px-6 py-4 flex justify-between items-center shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-50 rounded-t-[2.5rem]">
        <NavButton active={view === 'shop'} icon="Shop" label="Fresh" onClick={() => setView('shop')} />
        <NavButton active={view === 'cart'} icon="Cart" label="Cart" onClick={() => setView('cart')} count={cart.length} />
        <NavButton active={view === 'orders'} icon="List" label="History" onClick={() => setView('orders')} />
        <NavButton active={view === 'profile'} icon="User" label="Me" onClick={() => setView('profile')} />
      </div>
    </div>
  );
};

const NavButton = ({ active, label, onClick, icon, count }: any) => (
  <button onClick={onClick} className={`relative flex flex-col items-center gap-1 transition-all ${active ? 'text-emerald-600 scale-110' : 'text-slate-300'}`}>
    <div className={`p-2 rounded-2xl ${active ? 'bg-emerald-50' : ''}`}>
      {icon === 'Shop' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>}
      {icon === 'Cart' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>}
      {icon === 'List' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>}
      {icon === 'User' && <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>}
    </div>
    <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
    {count > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">{count}</span>}
  </button>
);

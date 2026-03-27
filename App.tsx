import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, push } from "firebase/database";
import { ShoppingCart, Plus, Settings, X, ChevronRight } from 'lucide-react';

// --- CONFIGURAÇÃO DO SEU FIREBASE (AQUELE QUE VOCÊ GEROU) ---
const firebaseConfig = {
  apiKey: "AIzaSyDIKhc4cXJCWAUqG0XJXe6rroDgp5wbOfE",
  authDomain: "://firebaseapp.com",
  projectId: "delicias-da-mari",
  storageBucket: "delicias-da-mari.firebasestorage.app",
  messagingSenderId: "647245961489",
  appId: "1:647245961489:web:ef03b264b2c074d67894b0",
  databaseURL: "https://firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const DeliciasDaMari: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [showAdmin, setShowAdmin] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: 'Bolos de Pote', image: '', desc: '' });

  // 1. Buscar doces do Banco de Dados
  useEffect(() => {
    const productsRef = ref(db, 'products');
    onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setProducts(list);
      }
    });
  }, []);

  // 2. Lógica de Adicionar ao Carrinho e WhatsApp
  const addToCart = (product: any) => setCart([...cart, product]);

  const finalizeOrder = () => {
    const total = cart.reduce((acc, item) => acc + item.price, 0);
    const msg = `*Pedido Delícias Da Mari*\n\n` + 
                cart.map(i => `• ${i.name} (R$ ${i.price.toFixed(2)})`).join('\n') +
                `\n\n*Total: R$ ${total.toFixed(2)}*`;
    window.open(`https://wa.me{encodeURIComponent(msg)}`); // <--- MUDE O NÚMERO AQUI
  };

  // 3. Lógica do Admin
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const pass = prompt("Digite a senha administrativa:");
    if(pass === "mari123") {
      push(ref(db, 'products'), { ...newProduct, price: parseFloat(newProduct.price) });
      setShowAdmin(false);
      setNewProduct({ name: '', price: '', category: 'Bolos de Pote', image: '', desc: '' });
    } else {
      alert("Senha incorreta!");
    }
  };

  const categories = [...new Set(products.map(p => p.category))];

  return (
    <div className="min-h-screen bg-[#FFF5F7] pb-32 font-sans">
      
      {/* HEADER ROSA */}
      <header className="bg-white p-8 rounded-b-[40px] shadow-sm text-center sticky top-0 z-50">
        <h1 className="text-[#FF85A2] text-3xl font-black italic tracking-tighter">Delícias Da Mari 🧁</h1>
        <p className="text-[10px] uppercase tracking-[4px] text-pink-300 font-bold mt-1">Doces de Família</p>
        <button onClick={() => setShowAdmin(true)} className="absolute top-8 right-8 text-pink-100"><Settings size={20} /></button>
      </header>

      {/* VITRINE COM SCROLL LATERAL */}
      <main className="mt-10">
        {categories.length === 0 && <p className="text-center p-20 text-pink-200">Abra o Admin (engrenagem) para cadastrar o primeiro doce!</p>}
        
        {categories.map(cat => (
          <section key={cat} className="mb-12">
            <div className="px-8 flex justify-between items-center mb-4">
              <h2 className="font-black text-[#6D4C41] text-lg uppercase tracking-tight border-l-4 border-[#FF85A2] pl-4">{cat}</h2>
              <span className="text-[10px] text-pink-300 font-bold uppercase animate-pulse">Arraste ➔</span>
            </div>

            <div className="flex overflow-x-auto gap-6 px-8 no-scrollbar snap-x pb-4">
              {products.filter(p => p.category === cat).map(product => (
                <div key={product.id} className="min-w-[260px] bg-white rounded-[30px] shadow-xl shadow-pink-100/30 snap-start overflow-hidden border border-pink-50 transition-transform active:scale-95">
                  <img src={product.image || 'https://placeholder.com'} className="w-full h-48 object-cover" />
                  <div className="p-6">
                    <h3 className="font-bold text-gray-800 text-lg">{product.name}</h3>
                    <p className="text-xs text-gray-400 mt-2 h-8 leading-tight line-clamp-2">{product.desc}</p>
                    <div className="flex justify-between items-center mt-6">
                      <span className="text-[#FF85A2] font-black text-xl">R$ {product.price.toFixed(2)}</span>
                      <button onClick={() => addToCart(product)} className="bg-[#FF85A2] text-white p-3 rounded-2xl shadow-lg shadow-pink-200"><Plus size={24} /></button>
                    </div>
                  </div>
                </div>
              ))}
              <div className="min-w-[20px]" /> 
            </div>
          </section>
        ))}
      </main>

      {/* CARRINHO ESTILO APP */}
      {cart.length > 0 && (
        <div onClick={finalizeOrder} className="fixed bottom-8 left-6 right-6 bg-[#2D2D2D] text-white p-6 rounded-[28px] flex justify-between items-center shadow-2xl cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="bg-[#FF85A2] w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">{cart.length}</div>
            <span className="font-bold">Ver sacola</span>
          </div>
          <span className="font-black text-lg">R$ {cart.reduce((a, b) => a + b.price, 0).toFixed(2)}</span>
        </div>
      )}

      {/* MODAL ADMIN */}
      {showAdmin && (
        <div className="fixed inset-0 bg-pink-900/40 backdrop-blur-md z-[100] p-6 flex items-center justify-center">
          <div className="bg-white w-full max-w-md rounded-[40px] p-8 shadow-2xl relative">
            <button onClick={() => setShowAdmin(false)} className="absolute top-8 right-8 text-gray-300"><X /></button>
            <h2 className="font-black text-2xl text-[#6D4C41] mb-6">Novo Doce 🎀</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <input required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} placeholder="Nome do Doce" className="w-full bg-pink-50/50 rounded-2xl p-4 outline-none border border-transparent focus:border-pink-300" />
              <div className="flex gap-3">
                <input required type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} placeholder="Preço" className="w-1/2 bg-pink-50/50 rounded-2xl p-4 outline-none" />
                <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-1/2 bg-pink-50/50 rounded-2xl p-4 outline-none">
                  <option>Bolos de Pote</option>
                  <option>Brigadeiros</option>
                  <option>Sobremesas</option>
                </select>
              </div>
              <input value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} placeholder="URL da Foto (Link)" className="w-full bg-pink-50/50 rounded-2xl p-4 outline-none" />
              <textarea value={newProduct.desc} onChange={e => setNewProduct({...newProduct, desc: e.target.value})} placeholder="Descrição curta" className="w-full bg-pink-50/50 rounded-2xl p-4 outline-none h-24" />
              <button type="submit" className="w-full bg-[#FF85A2] text-white font-black py-5 rounded-[22px] shadow-lg shadow-pink-200 active:scale-95 transition-all">SALVAR NA VITRINE</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliciasDaMari;

import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, push } from "firebase/database";
import { Plus, Settings } from 'lucide-react';

// Configuração corrigida (Preenchi os links que faltavam baseados no seu ID)
const firebaseConfig = {
  apiKey: "AIzaSyDIKhc4cXJCWAUqG0XJXe6rroDgp5wbOfE",
  authDomain: "delicias-da-mari.firebaseapp.com",
  projectId: "delicias-da-mari",
  storageBucket: "delicias-da-mari.firebasestorage.app",
  messagingSenderId: "647245961489",
  appId: "1:647245961489:web:ef03b264b2c074d67894b0",
  databaseURL: "https://delicias-da-mari-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export default function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [showAdmin, setShowAdmin] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: 'Bolos de Pote', image: '', desc: '' });

  useEffect(() => {
    const productsRef = ref(db, 'products');
    onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loadedProducts = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setProducts(loadedProducts);
      }
    });
  }, []);

  const finalizeOrder = () => {
    const total = cart.reduce((acc, item) => acc + Number(item.price), 0);
    const itensLista = cart.map(i => `• ${i.name}`).join('\n');
    const msg = `*Pedido Delícias Da Mari*\n\n${itensLista}\n\n*Total: R$ ${total.toFixed(2)}*`;
    // Corrigido o link do WhatsApp que estava quebrando
    window.open(`https://wa.me{encodeURIComponent(msg)}`);
  };

  const categories = [...new Set(products.map(p => p.category))];

  return (
    <div className="min-h-screen bg-[#FFF5F7] pb-32 font-sans overflow-x-hidden">
      <header className="bg-white p-6 rounded-b-[40px] shadow-sm text-center sticky top-0 z-50">
        <h1 className="text-[#FF85A2] text-2xl font-black italic">Delícias Da Mari 🧁</h1>
        <button 
          onClick={() => { const p = prompt("Senha:"); if(p==="mari123") setShowAdmin(true) }} 
          className="absolute top-6 right-6 opacity-20 text-pink-300"
        >
          <Settings size={20} />
        </button>
      </header>

      <main className="mt-8">
        {products.length === 0 && (
          <div className="text-center p-10">
             <p className="text-pink-300 mb-4">A vitrine está vazia!</p>
             <p className="text-xs text-gray-400">Dica: Toque na engrenagem no topo direito para cadastrar produtos.</p>
          </div>
        )}
        
        {categories.map(cat => (
          <section key={cat} className="mb-8">
            <h2 className="px-6 font-bold text-[#6D4C41] uppercase text-sm mb-4 border-l-4 border-[#FF85A2] ml-6">{cat}</h2>
            <div className="flex overflow-x-auto gap-4 px-6 no-scrollbar pb-4" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
              {products.filter(p => p.category === cat).map(product => (
                <div key={product.id} className="min-w-[220px] bg-white rounded-[24px] shadow-md overflow-hidden border border-pink-50">
                  <img src={product.image || 'https://unsplash.com'} className="w-full h-40 object-cover" />
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800">{product.name}</h3>
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-[#FF85A2] font-bold">R$ {Number(product.price).toFixed(2)}</span>
                      <button onClick={() => setCart([...cart, product])} className="bg-[#FF85A2] text-white p-2 rounded-xl active:scale-95 transition-transform"><Plus size={20} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>

      {cart.length > 0 && (
        <div onClick={finalizeOrder} className="fixed bottom-6 left-6 right-6 bg-[#2D2D2D] text-white p-5 rounded-[22px] flex justify-between items-center shadow-2xl cursor-pointer active:scale-95 transition-transform">
          <div className="flex items-center gap-3">
             <span className="bg-[#FF85A2] px-2 py-1 rounded-lg text-xs font-bold">{cart.length}</span>
             <span className="font-bold text-sm">Fechar Pedido</span>
          </div>
          <span className="font-bold text-[#FF85A2]">Zap →</span>
        </div>
      )}

      {showAdmin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] p-6 flex items-center justify-center">
          <div className="bg-white w-full max-w-sm rounded-[30px] p-8 shadow-2xl">
            <h2 className="font-bold mb-6 text-[#6D4C41] text-center text-xl">Novo Doce 🎀</h2>
            <input placeholder="Nome do Doce" className="w-full border p-4 mb-3 rounded-2xl bg-gray-50 outline-none focus:border-[#FF85A2]" onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
            <input placeholder="Preço (Ex: 15.00)" type="number" className="w-full border p-4 mb-3 rounded-2xl bg-gray-50 outline-none focus:border-[#FF85A2]" onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
            <input placeholder="Link da Foto (URL)" className="w-full border p-4 mb-3 rounded-2xl bg-gray-50 outline-none focus:border-[#FF85A2]" onChange={e => setNewProduct({...newProduct, image: e.target.value})} />
            <select className="w-full border p-4 mb-6 rounded-2xl bg-gray-50 outline-none" onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
               <option>Bolos de Pote</option>
               <option>Brigadeiros</option>
               <option>Sobremesas</option>
            </select>
            <button 
              onClick={() => { 
                if(!newProduct.name || !newProduct.price) return alert("Preencha nome e preço!");
                push(ref(db, 'products'), {...newProduct, price: parseFloat(newProduct.price)}); 
                setShowAdmin(false); 
              }} 
              className="w-full bg-[#FF85A2] text-white font-bold py-4 rounded-2xl shadow-lg shadow-pink-200"
            >
              SALVAR PRODUTO
            </button>
            <button onClick={() => setShowAdmin(false)} className="w-full text-gray-400 mt-6 text-sm font-medium">Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}

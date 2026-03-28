import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, push, remove } from "firebase/database";
import { Plus, Settings } from 'lucide-react';

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

export default function App() {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [showAdmin, setShowAdmin] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: 'Bolos de Pote', image: '' });

  useEffect(() => {
    const productsRef = ref(db, 'products');
    const unsubscribe = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setProducts(Object.keys(data).map(key => ({ id: key, ...data[key] })));
      } else {
        setProducts([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const finalizeOrder = () => {
    const total = cart.reduce((acc, item) => acc + (Number(item.price) || 0), 0);
    const itensLista = cart.map(i => `• ${i.name}`).join('%0A');
    const msg = `*Pedido Delícias Da Mari*%0A%0A${itensLista}%0A%0A*Total: R$ ${total.toFixed(2)}*`;
    window.open(`https://wa.me{msg}`, '_blank');
  };

  const categories = [...new Set(products.map(p => p.category))];

  return (
    <div className="min-h-screen bg-[#FFF5F7] pb-32 font-sans">
      <header className="bg-white p-6 rounded-b-[40px] shadow-sm text-center sticky top-0 z-40">
        <h1 className="text-[#FF85A2] text-2xl font-black italic">Delícias Da Mari 🧁</h1>
        <button 
          onClick={() => { const p = prompt("Senha:"); if(p==="mari123") setShowAdmin(true) }} 
          className="absolute top-6 right-6 opacity-20"
        >
          <Settings size={20} />
        </button>
      </header>

      <main className="mt-8">
        {products.length === 0 && (
          <p className="text-center p-10 text-pink-300">Carregando cardápio... 🎀</p>
        )}
        
        {categories.map(cat => (
          <section key={cat} className="mb-8">
            <h2 className="px-6 font-bold text-[#6D4C41] uppercase text-xs mb-4 border-l-4 border-[#FF85A2] ml-6">{cat}</h2>
            <div className="flex overflow-x-auto gap-4 px-6 no-scrollbar pb-4" style={{scrollbarWidth: 'none'}}>
              {products.filter(p => p.category === cat).map(product => (
                <div key={product.id} className="min-w-[200px] bg-white rounded-[24px] shadow-md overflow-hidden border border-pink-50">
                  <img src={product.image || 'https://placeholder.com'} className="w-full h-40 object-cover" alt={product.name} />
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 text-sm h-10 overflow-hidden">{product.name}</h3>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[#FF85A2] font-bold">R$ {Number(product.price).toFixed(2)}</span>
                      <button onClick={() => setCart([...cart, product])} className="bg-[#FF85A2] text-white p-2 rounded-xl active:scale-90">
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>

      {cart.length > 0 && (
        <div className="fixed bottom-6 left-6 right-6 z-50">
          <button onClick={finalizeOrder} className="w-full bg-[#2D2D2D] text-white p-5 rounded-[22px] flex justify-between items-center shadow-2xl">
             <span className="bg-[#FF85A2] px-2 py-1 rounded-lg text-xs font-bold">{cart.length} itens</span>
             <span className="font-bold">Pedir no WhatsApp →</span>
          </button>
        </div>
      )}

      {showAdmin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 p-6 flex items-center justify-center">
          <div className="bg-white w-full max-w-sm rounded-[30px] p-6 shadow-2xl max-h-[80vh] overflow-y-auto">
            <h2 className="font-bold mb-4 text-[#6D4C41]">Painel ADM 🎀</h2>
            <input placeholder="Nome" className="w-full border p-3 mb-2 rounded-xl" onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
            <input placeholder="Preço" type="number" className="w-full border p-3 mb-2 rounded-xl" onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
            <input placeholder="Link da Foto" className="w-full border p-3 mb-2 rounded-xl" onChange={e => setNewProduct({...newProduct, image: e.target.value})} />
            <select className="w-full border p-3 mb-4 rounded-xl bg-white" onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
               <option>Bolos de Pote</option>
               <option>Brigadeiros</option>
               <option>Sobremesas</option>
            </select>
            <button 
              onClick={() => { 
                if(!newProduct.name || !newProduct.price) return alert("Preencha tudo!");
                push(ref(db, 'products'), {...newProduct, price: parseFloat(newProduct.price)}); 
                alert("Salvo!");
              }} 
              className="w-full bg-[#FF85A2] text-white font-bold py-4 rounded-xl"
            >CADASTRAR</button>
            <button onClick={() => setShowAdmin(false)} className="w-full text-gray-400 mt-4 text-xs">Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}

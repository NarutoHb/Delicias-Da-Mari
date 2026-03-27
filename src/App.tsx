import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, push, remove } from "firebase/database";
import { Plus, Settings, Trash2, X } from 'lucide-react';

// Configuração Firebase
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
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [showAdmin, setShowAdmin] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: 'Bolos de Pote', image: '' });

  useEffect(() => {
    const productsRef = ref(db, 'products');
    onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loadedProducts = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setProducts(loadedProducts);
      } else {
        setProducts([]);
      }
    });
  }, []);

  const finalizeOrder = () => {
    const total = cart.reduce((acc, item) => acc + Number(item.price), 0);
    const itensLista = cart.map(i => `• ${i.name}`).join('%0A');
    const msg = `*Novo Pedido - Delícias Da Mari*%0A%0A${itensLista}%0A%0A*Total: R$ ${total.toFixed(2)}*`;
    const numeroMari = "5511945812309";
    window.open(`https://wa.me{numeroMari}?text=${msg}`, '_blank');
  };

  const deleteProduct = (id) => {
    if(window.confirm("Deseja mesmo excluir este doce?")) {
      remove(ref(db, `products/${id}`));
    }
  };

  const categories = [...new Set(products.map(p => p.category))];

  return (
    <div className="min-h-screen bg-[#FFF5F7] pb-32 font-sans overflow-x-hidden">
      {/* Header Profissional */}
      <header className="bg-white p-6 rounded-b-[40px] shadow-md text-center sticky top-0 z-40 border-b border-pink-100">
        <h1 className="text-[#FF85A2] text-2xl font-black tracking-tight italic">Delícias Da Mari 🧁</h1>
        <p className="text-[10px] text-pink-300 uppercase tracking-widest font-bold mt-1">Doces Artesanais com Amor</p>
        <button 
          onClick={() => { const p = prompt("Senha do Painel:"); if(p==="mari123") setShowAdmin(true) }} 
          className="absolute top-7 right-7 text-pink-200 hover:text-pink-400 transition-colors"
        >
          <Settings size={22} />
        </button>
      </header>

      <main className="mt-8">
        {products.length === 0 && (
          <div className="text-center p-20 opacity-50">
             <div className="text-4xl mb-4">✨</div>
             <p className="text-pink-400 font-medium text-sm">A vitrine está sendo preparada...</p>
          </div>
        )}
        
        {categories.map(cat => (
          <section key={cat} className="mb-10">
            <div className="flex items-center justify-between px-6 mb-4">
              <h2 className="font-black text-[#6D4C41] uppercase text-xs tracking-tighter border-l-4 border-[#FF85A2] pl-3">{cat}</h2>
              <span className="text-[10px] text-pink-300 font-bold bg-pink-50 px-2 py-1 rounded-full">{products.filter(p => p.category === cat).length} ITENS</span>
            </div>
            
            <div className="flex overflow-x-auto gap-5 px-6 no-scrollbar pb-4" style={{scrollbarWidth: 'none'}}>
              {products.filter(p => p.category === cat).map(product => (
                <div key={product.id} className="min-w-[200px] max-w-[200px] bg-white rounded-[32px] shadow-lg shadow-pink-100/50 overflow-hidden border border-white">
                  <div className="h-40 overflow-hidden">
                    <img src={product.image || 'https://unsplash.com'} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-gray-700 text-sm leading-tight h-8 overflow-hidden">{product.name}</h3>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-[#FF85A2] font-black text-lg">R$ {Number(product.price).toFixed(2)}</span>
                      <button 
                        onClick={() => setCart([...cart, product])} 
                        className="bg-[#FF85A2] text-white p-2.5 rounded-2xl active:scale-90 transition-all shadow-lg shadow-pink-200"
                      >
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

      {/* Botão Flutuante do Carrinho */}
      {cart.length > 0 && (
        <div className="fixed bottom-8 left-6 right-6 z-50">
          <button 
            onClick={finalizeOrder} 
            className="w-full bg-[#2D2D2D] text-white p-5 rounded-[28px] flex justify-between items-center shadow-2xl active:scale-95 transition-transform border-2 border-white/10"
          >
            <div className="flex items-center gap-3">
               <span className="bg-[#FF85A2] w-7 h-7 flex items-center justify-center rounded-full text-xs font-black">{cart.length}</span>
               <span className="font-bold text-sm tracking-wide">Finalizar Pedido</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 font-bold italic">No WhatsApp</span>
              <span className="text-[#FF85A2] font-bold text-xl">→</span>
            </div>
          </button>
          <button onClick={() => setCart([])} className="absolute -top-3 -right-2 bg-red-400 text-white p-1 rounded-full shadow-lg"><X size={14}/></button>
        </div>
      )}

      {/* Painel ADM Melhorado */}
      {showAdmin && (
        <div className="fixed inset-0 bg-[#6D4C41]/80 backdrop-blur-md z-50 p-6 flex items-center justify-center">
          <div className="bg-white w-full max-w-md rounded-[40px] p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-black text-xl text-[#6D4C41]">Gerenciar Doces 🎀</h2>
              <button onClick={() => setShowAdmin(false)} className="bg-gray-100 p-2 rounded-full text-gray-400"><X size={20}/></button>
            </div>

            {/* Cadastro */}
            <div className="space-y-3 mb-10 bg-pink-50 p-5 rounded-[30px]">
              <h3 className="text-[10px] font-bold text-pink-400 uppercase tracking-widest ml-2">Novo Cadastro</h3>
              <input placeholder="Nome do Doce" className="w-full bg-white p-4 rounded-2xl outline-none text-sm shadow-sm" onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
              <input placeholder="Preço (ex: 12.50)" type="number" className="w-full bg-white p-4 rounded-2xl outline-none text-sm shadow-sm" onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
              <input placeholder="Link da Foto" className="w-full bg-white p-4 rounded-2xl outline-none text-sm shadow-sm" onChange={e => setNewProduct({...newProduct, image: e.target.value})} />
              <select className="w-full bg-white p-4 rounded-2xl outline-none text-sm shadow-sm" onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                 <option>Bolos de Pote</option>
                 <option>Brigadeiros</option>
                 <option>Sobremesas</option>
              </select>
              <button 
                onClick={() => { 
                  if(!newProduct.name || !newProduct.price) return alert("Preencha nome e preço!");
                  push(ref(db, 'products'), {...newProduct, price: parseFloat(newProduct.price)}); 
                  alert("Doce adicionado com sucesso!");
                }} 
                className="w-full bg-[#FF85A2] text-white font-black py-4 rounded-2xl shadow-lg shadow-pink-200 mt-2 active:scale-95"
              >
                CADASTRAR DOCE
              </button>
            </div>

            {/* Lista para Excluir */}
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-2 mb-4">Itens Atuais</h3>
            <div className="space-y-3">
              {products.map(p => (
                <div key={p.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <img src={p.image} className="w-10 h-10 rounded-lg object-cover" />
                    <span className="text-sm font-bold text-gray-600 truncate w-32">{p.name}</span>
                  </div>
                  <button onClick={() => deleteProduct(p.id)} className="text-red-300 p-2"><Trash2 size={18}/></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

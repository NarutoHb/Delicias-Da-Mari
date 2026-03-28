import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, push, remove } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDIKhc4cXJCWAUqG0XJXe6rroDgp5wbOfE",
  authDomain: "delicias-da-mari.firebaseapp.com",
  databaseURL: "https://delicias-da-mari-default-rtdb.firebaseio.com",
  projectId: "delicias-da-mari",
  storageBucket: "delicias-da-mari.firebasestorage.app",
  messagingSenderId: "647245961489",
  appId: "1:647245961489:web:ef03b264b2c074d67894b0"
};

let db: ReturnType<typeof getDatabase> | null = null;
try {
  const app = initializeApp(firebaseConfig);
  db = getDatabase(app);
} catch (e) {
  console.error("Erro ao inicializar Firebase:", e);
}

export default function App() {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [showAdmin, setShowAdmin] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: 'Bolos de Pote', image: '' });

  useEffect(() => {
    if (!db) return;
    onValue(ref(db, 'products'), (snapshot) => {
      const data = snapshot.val();
      if (data) setProducts(Object.keys(data).map(key => ({ id: key, ...data[key] })));
      else setProducts([]);
    });
  }, []);

  const finalizeOrder = () => {
    const total = cart.reduce((acc, item) => acc + Number(item.price), 0);
    const itens = cart.map(i => `• ${i.name}`).join('%0A');
    const msg = `*Pedido Mari*%0A%0A${itens}%0A%0A*Total: R$ ${total.toFixed(2)}*`;
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  const categories = [...new Set(products.map(p => p.category))];

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '120px' }}>
      <header style={{ background: 'white', padding: '25px', textAlign: 'center', borderRadius: '0 0 40px 40px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 10 }}>
        <h1 style={{ color: '#FF85A2', margin: 0, fontSize: '24px', fontWeight: '900' }}>Delícias Da Mari 🧁</h1>
        <button onClick={() => { if(prompt("Senha:")==="mari123") setShowAdmin(true) }} style={{ position: 'absolute', right: '20px', top: '25px', opacity: 0.1, border: 'none', background: 'none' }}>⚙️</button>
      </header>

      <main style={{ padding: '20px' }}>
        {categories.map(cat => (
          <section key={cat} style={{ marginBottom: '35px' }}>
            <h2 style={{ fontSize: '14px', color: '#6D4C41', textTransform: 'uppercase', marginBottom: '15px', borderLeft: '4px solid #FF85A2', paddingLeft: '12px' }}>{cat}</h2>
            <div style={{ display: 'flex', overflowX: 'auto', gap: '15px', paddingBottom: '10px' }} className="no-scrollbar">
              {products.filter(p => p.category === cat).map(p => (
                <div key={p.id} style={{ minWidth: '200px', backgroundColor: 'white', borderRadius: '25px', padding: '15px', boxShadow: '0 8px 20px rgba(0,0,0,0.03)' }}>
                  <img src={p.image || 'https://via.placeholder.com/200x130?text=Sem+foto'} style={{ width: '100%', height: '130px', borderRadius: '20px', objectFit: 'cover' }} />
                  <h3 style={{ margin: '12px 0 8px 0', fontSize: '15px', color: '#444' }}>{p.name}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#FF85A2', fontWeight: '900' }}>R$ {Number(p.price).toFixed(2)}</span>
                    <button onClick={() => setCart([...cart, p])} style={{ backgroundColor: '#FF85A2', color: 'white', border: 'none', width: '38px', height: '38px', borderRadius: '12px', fontSize: '20px', fontWeight: 'bold' }}>+</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>

      {cart.length > 0 && (
        <div style={{ position: 'fixed', bottom: '25px', left: '20px', right: '20px', zIndex: 20 }}>
          <button onClick={finalizeOrder} style={{ width: '100%', backgroundColor: '#2D2D2D', color: 'white', padding: '20px', borderRadius: '22px', border: 'none', fontWeight: 'bold', fontSize: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            FECHAR PEDIDO ({cart.length})
          </button>
        </div>
      )}

      {showAdmin && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'white', padding: '30px', zIndex: 100, overflowY: 'auto' }}>
          <h2 style={{ color: '#6D4C41', textAlign: 'center' }}>Painel ADM 🎀</h2>
          <input placeholder="Nome" style={{ width: '100%', padding: '15px', marginBottom: '10px', borderRadius: '15px', border: '1px solid #eee' }} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
          <input placeholder="Preço" type="number" style={{ width: '100%', padding: '15px', marginBottom: '10px', borderRadius: '15px', border: '1px solid #eee' }} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
          <select style={{ width: '100%', padding: '15px', marginBottom: '10px', borderRadius: '15px', border: '1px solid #eee' }} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
            <option>Bolos de Pote</option>
            <option>Brigadeiros</option>
            <option>Tortas</option>
            <option>Outros</option>
          </select>
          <input placeholder="Link da Foto" style={{ width: '100%', padding: '15px', marginBottom: '20px', borderRadius: '15px', border: '1px solid #eee' }} onChange={e => setNewProduct({...newProduct, image: e.target.value})} />
          <button onClick={() => {
            if (!db) return alert("Firebase não conectado.");
            if(!newProduct.name || !newProduct.price) return alert("Preencha tudo!");
            push(ref(db, 'products'), {...newProduct, price: parseFloat(newProduct.price)});
            alert("Salvo!");
          }} style={{ width: '100%', backgroundColor: '#FF85A2', color: 'white', padding: '18px', borderRadius: '15px', border: 'none', fontWeight: 'bold' }}>SALVAR NOVO DOCE</button>

          <div style={{ marginTop: '30px' }}>
            <p style={{ fontSize: '12px', color: '#999', marginBottom: '10px' }}>ITENS NA VITRINE:</p>
            {products.map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}>
                <span>{p.name}</span>
                <button onClick={() => db && remove(ref(db, `products/${p.id}`))} style={{ color: 'red', border: 'none', background: 'none' }}>Excluir</button>
              </div>
            ))}
          </div>
          <button onClick={() => setShowAdmin(false)} style={{ width: '100%', marginTop: '30px', background: 'none', border: 'none', color: '#ccc' }}>FECHAR</button>
        </div>
      )}
    </div>
  );
}

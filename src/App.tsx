import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, push, remove, set } from "firebase/database";

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
  const [activeTab, setActiveTab] = useState<'vitrine' | 'familia'>('vitrine');
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: 'Bolos de Pote', image: '' });
  const [familia, setFamilia] = useState({ foto: '', historia: '' });
  const [editFamilia, setEditFamilia] = useState({ foto: '', historia: '' });

  useEffect(() => {
    if (!db) return;
    onValue(ref(db, 'products'), (snapshot) => {
      const data = snapshot.val();
      if (data) setProducts(Object.keys(data).map(key => ({ id: key, ...data[key] })));
      else setProducts([]);
    });
    onValue(ref(db, 'familia'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setFamilia(data);
        setEditFamilia(data);
      }
    });
  }, []);

  const finalizeOrder = () => {
    const total = cart.reduce((acc, item) => acc + Number(item.price), 0);
    const itens = cart.map(i => `• ${i.name}`).join('%0A');
    const msg = `*Pedido Mari*%0A%0A${itens}%0A%0A*Total: R$ ${total.toFixed(2)}*`;
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  const salvarFamilia = () => {
    if (!db) return alert("Firebase não conectado.");
    set(ref(db, 'familia'), editFamilia);
    alert("História salva!");
  };

  const categories = [...new Set(products.map(p => p.category))];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFF5F8', fontFamily: 'sans-serif' }}>

      <header style={{ background: 'white', padding: '20px 25px', textAlign: 'center', borderRadius: '0 0 30px 30px', boxShadow: '0 4px 15px rgba(0,0,0,0.06)', position: 'sticky', top: 0, zIndex: 10 }}>
        <h1 style={{ color: '#FF85A2', margin: 0, fontSize: '22px', fontWeight: '900' }}>Delícias Da Mari 🧁</h1>
        <button
          onClick={() => { if (prompt("Senha:") === "mari123") setShowAdmin(true); }}
          style={{ position: 'absolute', right: '20px', top: '22px', opacity: 0.1, border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer' }}
        >⚙️</button>
      </header>

      <div style={{ display: 'flex', background: 'white', margin: '15px 20px 0', borderRadius: '18px', padding: '5px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
        <button
          onClick={() => setActiveTab('vitrine')}
          style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '14px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s', background: activeTab === 'vitrine' ? '#FF85A2' : 'transparent', color: activeTab === 'vitrine' ? 'white' : '#aaa' }}
        >🛍️ Vitrine</button>
        <button
          onClick={() => setActiveTab('familia')}
          style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '14px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s', background: activeTab === 'familia' ? '#FF85A2' : 'transparent', color: activeTab === 'familia' ? 'white' : '#aaa' }}
        >👨‍👩‍👧 Família da Mari</button>
      </div>

      {activeTab === 'vitrine' && (
        <main style={{ padding: '20px', paddingBottom: cart.length > 0 ? '120px' : '30px' }}>
          {categories.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#ccc' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🧁</div>
              <p style={{ fontSize: '15px' }}>Nenhum produto ainda.<br />Adicione pelo painel ADM.</p>
            </div>
          )}
          {categories.map(cat => (
            <section key={cat} style={{ marginBottom: '30px' }}>
              <h2 style={{ fontSize: '13px', color: '#6D4C41', textTransform: 'uppercase', marginBottom: '15px', borderLeft: '4px solid #FF85A2', paddingLeft: '12px', letterSpacing: '1px' }}>{cat}</h2>
              <div style={{ display: 'flex', overflowX: 'auto', gap: '14px', paddingBottom: '10px' }} className="no-scrollbar">
                {products.filter(p => p.category === cat).map(p => (
                  <div key={p.id} style={{ minWidth: '185px', backgroundColor: 'white', borderRadius: '22px', padding: '14px', boxShadow: '0 6px 18px rgba(0,0,0,0.05)', flexShrink: 0 }}>
                    <img src={p.image || 'https://via.placeholder.com/200x130?text=🧁'} style={{ width: '100%', height: '125px', borderRadius: '16px', objectFit: 'cover' }} />
                    <h3 style={{ margin: '10px 0 6px 0', fontSize: '14px', color: '#444', fontWeight: '700' }}>{p.name}</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#FF85A2', fontWeight: '900', fontSize: '15px' }}>R$ {Number(p.price).toFixed(2)}</span>
                      <button onClick={() => setCart([...cart, p])} style={{ backgroundColor: '#FF85A2', color: 'white', border: 'none', width: '36px', height: '36px', borderRadius: '11px', fontSize: '20px', fontWeight: 'bold', cursor: 'pointer' }}>+</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </main>
      )}

      {activeTab === 'familia' && (
        <div style={{ paddingBottom: '40px' }}>
          <div style={{
            width: '100%',
            height: '300px',
            background: familia.foto
              ? `url(${familia.foto}) center/cover no-repeat`
              : 'linear-gradient(135deg, #FFD6E0, #FF85A2)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            position: 'relative'
          }}>
            {!familia.foto && (
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center', color: 'white' }}>
                <div style={{ fontSize: '52px' }}>👨‍👩‍👧</div>
                <p style={{ fontSize: '14px', opacity: 0.9, marginTop: '8px' }}>Adicione uma foto da família<br/>pelo painel ADM</p>
              </div>
            )}
            <div style={{ width: '100%', height: '80px', background: 'linear-gradient(to top, #FFF5F8, transparent)' }} />
          </div>

          <div style={{ padding: '10px 25px 30px' }}>
            <h2 style={{ color: '#FF85A2', fontSize: '22px', fontWeight: '900', marginBottom: '4px' }}>Nossa História 🩷</h2>
            <p style={{ fontSize: '15px', color: '#555', lineHeight: '1.8', whiteSpace: 'pre-line' }}>
              {familia.historia || 'A história da Mari e sua família aparecerá aqui.\n\nAdicione pelo painel ADM!'}
            </p>
            <div style={{ marginTop: '30px', padding: '20px', backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', textAlign: 'center' }}>
              <p style={{ margin: 0, color: '#FF85A2', fontWeight: '700', fontSize: '15px' }}>Feito com amor 🧁</p>
              <p style={{ margin: '6px 0 0', color: '#aaa', fontSize: '13px' }}>Cada doce carrega um pedacinho do nosso coração.</p>
            </div>
          </div>
        </div>
      )}

      {cart.length > 0 && activeTab === 'vitrine' && (
        <div style={{ position: 'fixed', bottom: '25px', left: '20px', right: '20px', zIndex: 20 }}>
          <button onClick={finalizeOrder} style={{ width: '100%', backgroundColor: '#2D2D2D', color: 'white', padding: '20px', borderRadius: '22px', border: 'none', fontWeight: 'bold', fontSize: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', cursor: 'pointer' }}>
            FECHAR PEDIDO ({cart.length}) — R$ {cart.reduce((a, i) => a + Number(i.price), 0).toFixed(2)}
          </button>
        </div>
      )}

      {showAdmin && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'white', padding: '30px', zIndex: 100, overflowY: 'auto' }}>
          <h2 style={{ color: '#6D4C41', textAlign: 'center', marginBottom: '25px' }}>Painel ADM 🎀</h2>

          <p style={{ fontSize: '12px', color: '#FF85A2', fontWeight: '700', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Adicionar Produto</p>
          <input placeholder="Nome do doce" style={{ width: '100%', padding: '14px', marginBottom: '10px', borderRadius: '14px', border: '1px solid #eee', boxSizing: 'border-box' }} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
          <input placeholder="Preço (ex: 12.50)" type="number" style={{ width: '100%', padding: '14px', marginBottom: '10px', borderRadius: '14px', border: '1px solid #eee', boxSizing: 'border-box' }} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} />
          <select style={{ width: '100%', padding: '14px', marginBottom: '10px', borderRadius: '14px', border: '1px solid #eee', boxSizing: 'border-box' }} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}>
            <option>Bolos de Pote</option>
            <option>Brigadeiros</option>
            <option>Tortas</option>
            <option>Outros</option>
          </select>
          <input placeholder="Link da foto do produto" style={{ width: '100%', padding: '14px', marginBottom: '15px', borderRadius: '14px', border: '1px solid #eee', boxSizing: 'border-box' }} onChange={e => setNewProduct({ ...newProduct, image: e.target.value })} />
          <button onClick={() => {
            if (!db) return alert("Firebase não conectado.");
            if (!newProduct.name || !newProduct.price) return alert("Preencha nome e preço!");
            push(ref(db, 'products'), { ...newProduct, price: parseFloat(newProduct.price) });
            alert("Produto salvo!");
          }} style={{ width: '100%', backgroundColor: '#FF85A2', color: 'white', padding: '16px', borderRadius: '14px', border: 'none', fontWeight: 'bold', cursor: 'pointer', marginBottom: '30px' }}>SALVAR PRODUTO</button>

          <p style={{ fontSize: '12px', color: '#FF85A2', fontWeight: '700', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Família da Mari</p>
          <input
            placeholder="Link da foto da família"
            defaultValue={familia.foto}
            style={{ width: '100%', padding: '14px', marginBottom: '10px', borderRadius: '14px', border: '1px solid #eee', boxSizing: 'border-box' }}
            onChange={e => setEditFamilia({ ...editFamilia, foto: e.target.value })}
          />
          <textarea
            placeholder="Escreva a história da Mari e da família aqui..."
            defaultValue={familia.historia}
            rows={6}
            style={{ width: '100%', padding: '14px', marginBottom: '15px', borderRadius: '14px', border: '1px solid #eee', boxSizing: 'border-box', resize: 'none', fontFamily: 'sans-serif', fontSize: '14px' }}
            onChange={e => setEditFamilia({ ...editFamilia, historia: e.target.value })}
          />
          <button onClick={salvarFamilia} style={{ width: '100%', backgroundColor: '#6D4C41', color: 'white', padding: '16px', borderRadius: '14px', border: 'none', fontWeight: 'bold', cursor: 'pointer', marginBottom: '30px' }}>SALVAR HISTÓRIA</button>

          <p style={{ fontSize: '12px', color: '#999', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Produtos na Vitrine</p>
          {products.length === 0 && <p style={{ color: '#ccc', fontSize: '14px' }}>Nenhum produto cadastrado.</p>}
          {products.map(p => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f5f5f5' }}>
              <div>
                <span style={{ fontSize: '14px', color: '#444', fontWeight: '600' }}>{p.name}</span>
                <span style={{ fontSize: '13px', color: '#FF85A2', marginLeft: '8px' }}>R$ {Number(p.price).toFixed(2)}</span>
              </div>
              <button onClick={() => db && remove(ref(db, `products/${p.id}`))} style={{ color: 'red', border: 'none', background: 'none', fontSize: '13px', cursor: 'pointer' }}>Excluir</button>
            </div>
          ))}

          <button onClick={() => setShowAdmin(false)} style={{ width: '100%', marginTop: '30px', background: 'none', border: 'none', color: '#ccc', fontSize: '14px', cursor: 'pointer' }}>FECHAR</button>
        </div>
      )}
    </div>
  );
}

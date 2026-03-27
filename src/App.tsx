import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, push, remove } from "firebase/database";

// Configuração Firebase CORRIGIDA
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
    const total = cart.reduce((acc, item) => acc + Number(item.price), 0);
    const itensLista = cart.map(i => `• ${i.name}`).join('%0A');
    const msg = `*Pedido Delícias Da Mari*%0A%0A${itensLista}%0A%0A*Total: R$ ${total.toFixed(2)}*`;
    const numeroMari = "5511945812309";
    window.open(`https://wa.me{numeroMari}?text=${msg}`, '_blank');
  };

  const deleteProduct = (id: string) => {
    if(window.confirm("Excluir este doce?")) {
      remove(ref(db, `products/${id}`));
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFF5F7', paddingBottom: '100px', fontFamily: 'sans-serif' }}>
      <header style={{ backgroundColor: 'white', padding: '20px', borderRadius: '0 0 30px 30px', textAlign: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 10 }}>
        <h1 style={{ color: '#FF85A2', margin: 0, fontSize: '24px' }}>Delícias Da Mari 🧁</h1>
        <button 
          onClick={() => { const p = prompt("Senha:"); if(p==="mari123") setShowAdmin(true) }} 
          style={{ position: 'absolute', right: '20px', top: '25px', opacity: 0.2, border: 'none', background: 'none' }}
        >
          ⚙️
        </button>
      </header>

      <main style={{ padding: '20px' }}>
        {products.length === 0 && (
          <p style={{ textAlign: 'center', color: '#FF85A2', marginTop: '50px' }}>
            Carregando doces da Mari...
          </p>
        )}
        <div style={{ display: 'grid', gap: '15px' }}>
          {products.map(p => (
            <div key={p.id} style={{ backgroundColor: 'white', borderRadius: '20px', padding: '15px', display: 'flex', gap: '15px', alignItems: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
              <img 
                src={p.image || 'https://placeholder.com'} 
                alt={p.name}
                style={{ width: '80px', height: '80px', borderRadius: '15px', objectFit: 'cover' }} 
              />
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#444' }}>{p.name}</h3>
                <span style={{ color: '#FF85A2', fontWeight: 'bold' }}>R$ {Number(p.price).toFixed(2)}</span>
              </div>
              <button 
                onClick={() => setCart([...cart, p])} 
                style={{ backgroundColor: '#FF85A2', color: 'white', border: 'none', width: '35px', height: '35px', borderRadius: '10px', fontSize: '20px', fontWeight: 'bold' }}
              >
                +
              </button>
            </div>
          ))}
        </div>
      </main>

      {cart.length > 0 && (
        <div style={{ position: 'fixed', bottom: '20px', left: '20px', right: '20px', zIndex: 20 }}>
          <button 
            onClick={finalizeOrder} 
            style={{ width: '100%', backgroundColor: '#2D2D2D', color: 'white', padding: '20px', borderRadius: '20px', border: 'none', fontWeight: 'bold', fontSize: '16px', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}
          >
            Pedir no WhatsApp ({cart.length})
          </button>
        </div>
      )}

      {showAdmin && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', padding: '20px', zIndex: 100, display: 'flex', alignItems: 'center' }}>
          <div style={{ backgroundColor: 'white', width: '100%', borderRadius: '25px', padding: '25px', maxHeight: '80vh', overflowY: 'auto' }}>
            <h2 style={{ color: '#6D4C41', marginTop: 0 }}>Painel ADM 🎀</h2>
            <input 
              placeholder="Nome" 
              style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '10px', border: '1px solid #ddd' }} 
              onChange={e => setNewProduct({...newProduct, name: e.target.value})} 
            />
            <input 
              placeholder="Preço" 
              type="number" 
              style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '10px', border: '1px solid #ddd' }} 
              onChange={e => setNewProduct({...newProduct, price: e.target.value})} 
            />
            <input 
              placeholder="Link da Foto" 
              style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '10px', border: '1px solid #ddd' }} 
              onChange={e => setNewProduct({...newProduct, image: e.target.value})} 
            />
            <button 
              onClick={() => { 
                if(!newProduct.name || !newProduct.price) return alert("Preencha tudo!"); 
                push(ref(db, 'products'), {...newProduct, price: parseFloat(newProduct.price)}); 
                alert("Salvo!"); 
              }} 
              style={{ width: '100%', backgroundColor: '#FF85A2', color: 'white', padding: '15px', borderRadius: '15px', border: 'none', fontWeight: 'bold' }}
            >
              SALVAR NOVO DOCE
            </button>
            
            <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
              <p style={{ fontSize: '12px', color: '#999', marginBottom: '10px' }}>DOCES CADASTRADOS:</p>
              {products.map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f9f9f9', fontSize: '14px' }}>
                  <span>{p.name}</span>
                  <button onClick={() => deleteProduct(p.id)} style={{ color: 'red', border: 'none', background: 'none' }}>Excluir</button>
                </div>
              ))}
            </div>
            <button onClick={() => setShowAdmin(false)} style={{ width: '100%', marginTop: '20px', background: 'none', border: 'none', color: '#999' }}>Sair</button>
          </div>
        </div>
      )}
    </div>
  );
}

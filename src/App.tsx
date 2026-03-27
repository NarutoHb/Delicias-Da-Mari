import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, push } from "firebase/database";

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

  useEffect(() => {
    const productsRef = ref(db, 'products');
    onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setProducts([]);
        return;
      }
      
      // TRATAMENTO BLINDADO: Tenta converter, se der erro, limpa a lista
      try {
        const loadedProducts = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setProducts(loadedProducts);
      } catch (e) {
        console.error("Dados do Firebase incompatíveis", e);
        setProducts([]); 
      }
    });
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFF5F7', padding: '20px', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#FF85A2' }}>Delícias Da Mari 🧁</h1>
        <button onClick={() => setShowAdmin(true)} style={{ opacity: 0.3, background: 'none', border: 'none' }}>⚙️ ADM</button>
      </header>

      <main>
        {products.length === 0 ? (
          <div style={{ padding: '40px', border: '2px dashed #FF85A2', borderRadius: '20px', color: '#FF85A2' }}>
            <p>O cardápio está vazio ou os dados antigos eram incompatíveis.</p>
            <p>Clique em <b>ADM</b> acima para cadastrar um novo doce!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {products.map(p => (
              <div key={p.id} style={{ backgroundColor: 'white', padding: '15px', borderRadius: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ textAlign: 'left' }}>
                  <h3 style={{ margin: 0 }}>{p.name || 'Doce Sem Nome'}</h3>
                  <span style={{ color: '#FF85A2', fontWeight: 'bold' }}>R$ {Number(p.price || 0).toFixed(2)}</span>
                </div>
                <button onClick={() => setCart([...cart, p])} style={{ backgroundColor: '#FF85A2', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 15px' }}>+</button>
              </div>
            ))}
          </div>
        )}
      </main>

      {showAdmin && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'white', padding: '40px', zLimit: 100 }}>
           <h2>Cadastrar Novo Doce</h2>
           <button onClick={() => {
             push(ref(db, 'products'), { name: "Bolo de Pote Teste", price: 15.00, image: "" });
             alert("Enviado! Feche e veja se apareceu.");
           }} style={{ padding: '15px', backgroundColor: '#FF85A2', color: 'white', border: 'none', borderRadius: '10px' }}>
             CRIAR DOCE DE TESTE
           </button>
           <br/><br/>
           <button onClick={() => setShowAdmin(false)}>Fechar</button>
        </div>
      )}
    </div>
  );
}

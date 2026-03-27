import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, push } from "firebase/database";

// Configuração extraída da sua imagem (CONFIRMADA)
const firebaseConfig = {
  apiKey: "AIzaSyDIKhc4cXJCWAUqG0XJXe6rroDgp5wbOfE",
  authDomain: "://firebaseapp.com",
  projectId: "delicias-da-mari",
  storageBucket: "delicias-da-mari.firebasestorage.app",
  messagingSenderId: "647245961489",
  appId: "1:647245961489:web:ef03b264b2c074d67894b0",
  databaseURL: "https://firebaseio.com"
};

// Inicialização
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export default function App() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const productsRef = ref(db, 'products');
    const unsubscribe = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Se os dados existirem, transforma em lista
        const lista = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setProducts(lista);
      } else {
        setProducts([]);
      }
      setLoading(false);
    }, (error) => {
      console.error("Erro no Firebase:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const criarProdutoTeste = () => {
    const productsRef = ref(db, 'products');
    push(productsRef, {
      name: "Bolo de Pote Morango",
      price: 12.50,
      image: "https://placeholder.com"
    }).then(() => alert("Produto criado com sucesso!"));
  };

  if (loading) {
    return <div style={{ padding: '50px', textAlign: 'center' }}>Conectando ao Firebase da Mari... 🧁</div>;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFF5F7', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#FF85A2', textAlign: 'center' }}>Delícias Da Mari 🧁</h1>
      
      {products.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <p>O cardápio ainda está vazio!</p>
          <button 
            onClick={criarProdutoTeste}
            style={{ backgroundColor: '#FF85A2', color: 'white', border: 'none', padding: '15px', borderRadius: '10px', fontWeight: 'bold' }}
          >
            CRIAR PRIMEIRO DOCE (TESTE)
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {products.map(p => (
            <div key={p.id} style={{ backgroundColor: 'white', padding: '15px', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
              <div>
                <h3 style={{ margin: 0 }}>{p.name}</h3>
                <span style={{ color: '#FF85A2', fontWeight: 'bold' }}>R$ {Number(p.price).toFixed(2)}</span>
              </div>
              <button style={{ backgroundColor: '#FF85A2', color: 'white', border: 'none', borderRadius: '50%', width: '30px', height: '30px' }}>+</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

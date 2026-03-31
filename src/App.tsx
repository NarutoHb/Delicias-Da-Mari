import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, push, remove, set } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDIKhc4cXJCWAUqG0XJXe6rroDgp5wbOfE",
  authDomain: "://firebaseapp.com",
  databaseURL: "https://firebaseio.com",
  projectId: "delicias-da-mari",
  storageBucket: "delicias-da-mari.firebasestorage.app",
  messagingSenderId: "647245961489",
  appId: "1:647245961489:web:ef03b264b2c074d67894b0"
};

// Inicialização do Firebase com verificação
let db: any = null;
try {
  const app = initializeApp(firebaseConfig);
  db = getDatabase(app);
} catch (e) {
  console.error("Erro ao inicializar Firebase:", e);
}

const ORDER_WHATSAPP = '5511945812309';

interface Product     { id: string; name: string; price: number; category: string; image: string; destaque?: boolean; }
interface Categoria   { id: string; nome: string; }
interface Depoimento  { id: string; nome: string; texto: string; estrelas: number; foto?: string; }
interface HeroData    { titulo: string; subtitulo: string; cta: string; imagem: string; }
interface FamiliaData { foto: string; historia: string; }
interface FooterData  { whatsapp: string; email: string; bairro: string; horario: string; instagram: string; facebook: string; }
interface BannerData  { ativo: boolean; titulo: string; texto: string; cta: string; link: string; imagem: string; corFundo: string; }

const defaultHero: HeroData    = { titulo: 'Transformando momentos simples em memórias doces.', subtitulo: 'Doces artesanais feitos com amor para tornar cada ocasião especial.', cta: 'Ver Cardápio', imagem: '' };
const defaultFooter: FooterData = { whatsapp: '', email: '', bairro: '', horario: 'Terça a Sábado, das 10h às 19h', instagram: '', facebook: '' };
const defaultBanner: BannerData = { ativo: false, titulo: '🔥 Promoção especial!', texto: 'Brigadeiros 3 por R$ 15 — só hoje! Aproveite essa oferta imperdível.', cta: 'Quero aproveitar!', link: '', imagem: '', corFundo: '#FF85A2' };

const PINK  = '#FF85A2';
const BROWN = '#6D4C41';
const BG    = '#FFF5F8';

// Estilos Reutilizáveis
const card: React.CSSProperties = { background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '20px' };
const inp: React.CSSProperties = { width: '100%', padding: '12px 14px', marginBottom: '10px', borderRadius: '12px', border: '1px solid #f0d0da', boxSizing: 'border-box', fontSize: '16px', color: '#333' };
const btnP: React.CSSProperties = { width: '100%', backgroundColor: PINK, color: 'white', padding: '14px', borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' };
const lbl: React.CSSProperties  = { fontSize: '11px', color: PINK, fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px', marginTop: '12px' };

function Stars({ n }: { n: number }) {
  return <span style={{ color: '#FFB300', fontSize: '16px' }}>{Array.from({ length: 5 }, (_, i) => i < n ? '★' : '☆').join('')}</span>;
}

function Avatar({ nome, foto }: { nome: string; foto?: string }) {
  if (foto) return <img src={foto} alt={nome} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${PINK}`, flexShrink: 0 }} />;
  const initials = nome.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  return <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: `linear-gradient(135deg, ${PINK}, #ffb3c6)`, color: 'white', fontWeight: '900', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{initials}</div>;
}

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [depoimentos, setDepoimentos] = useState<Depoimento[]>([]);
  const [hero, setHero] = useState<HeroData>(defaultHero);
  const [familia, setFamilia] = useState<FamiliaData>({ foto: '', historia: '' });
  const [footer, setFooter] = useState<FooterData>(defaultFooter);
  const [banner, setBanner] = useState<BannerData>(defaultBanner);
  
  const [showAdmin, setShowAdmin] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: '', image: '', destaque: false });

  useEffect(() => {
    if (!db) return;
    onValue(ref(db, 'products'), (s) => { const d = s.val(); setProducts(d ? Object.keys(d).map(k => ({ id: k, ...d[k] })) : []); });
    onValue(ref(db, 'categorias'), (s) => { const d = s.val(); setCategorias(d ? Object.keys(d).map(k => ({ id: k, nome: d[k] })) : []); });
    onValue(ref(db, 'depoimentos'), (s) => { const d = s.val(); setDepoimentos(d ? Object.keys(d).map(k => ({ id: k, ...d[k] })) : []); });
    onValue(ref(db, 'hero'), (s) => { const d = s.val(); if (d) setHero(d); });
    onValue(ref(db, 'familia'), (s) => { const d = s.val(); if (d) setFamilia(d); });
    onValue(ref(db, 'footer'), (s) => { const d = s.val(); if (d) setFooter(d); });
    onValue(ref(db, 'banner'), (s) => { const d = s.val(); if (d) setBanner(d); });
  }, []);

  const handleSaveProduct = () => {
    if (!db || !newProduct.name) return;
    push(ref(db, 'products'), { ...newProduct, price: Number(newProduct.price) });
    setNewProduct({ name: '', price: '', category: '', image: '', destaque: false });
    alert("Produto salvo!");
  };

  return (
    <div style={{ backgroundColor: BG, minHeight: '100vh', fontFamily: 'sans-serif', paddingBottom: '40px' }}>
      
      {/* HEADER SIMPLES */}
      <header style={{ padding: '20px', textAlign: 'center', backgroundColor: 'white' }}>
        <h1 style={{ color: PINK, margin: 0, fontSize: '24px', cursor: 'pointer' }} onClick={() => setShowAdmin(!showAdmin)}>
          Delícias da Mari 🧁
        </h1>
      </header>

      {!showAdmin ? (
        <main style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
          
          {/* HERO SECTION */}
          <section style={{ ...card, textAlign: 'center', background: `linear-gradient(to bottom, #fff, ${BG})` }}>
            <h2 style={{ color: BROWN, fontSize: '28px' }}>{hero.titulo}</h2>
            <p style={{ color: '#666' }}>{hero.subtitulo}</p>
            <button style={{ ...btnP, width: 'auto', padding: '12px 30px' }}>{hero.cta}</button>
          </section>

          {/* LISTA DE PRODUTOS */}
          <h3 style={{ color: PINK }}>Cardápio</h3>
          {products.map(p => (
            <div key={p.id} style={{ ...card, display: 'flex', gap: '15px', alignItems: 'center' }}>
              <img src={p.image || 'https://placeholder.com'} alt={p.name} style={{ width: '80px', height: '80px', borderRadius: '12px', objectFit: 'cover' }} />
              <div style={{ flex: 1 }}>
                <strong style={{ display: 'block', color: BROWN }}>{p.name}</strong>
                <span style={{ color: PINK, fontWeight: 'bold' }}>R$ {Number(p.price).toFixed(2)}</span>
              </div>
            </div>
          ))}

          {/* DEPOIMENTOS (CORRIGIDO) */}
          <h3 style={{ color: PINK, marginTop: '40px' }}>O que dizem nossas clientes</h3>
          {depoimentos.map(d => (
            <div key={d.id} style={card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <Avatar nome={d.nome} foto={d.foto} />
                <div>
                  <strong style={{ display: 'block', fontSize: '14px' }}>{d.nome}</strong>
                  <Stars n={d.estrelas} />
                </div>
              </div>
              <p style={{ fontStyle: 'italic', color: '#555', margin: 0 }}>"{d.texto}"</p>
            </div>
          ))}

        </main>
      ) : (
        <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
          <h2 style={{ color: BROWN }}>Painel Administrativo 🛠️</h2>
          
          <div style={card}>
            <label style={lbl}>Nome do Produto</label>
            <input style={inp} value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} placeholder="Ex: Bolo de Pote" />
            
            <label style={lbl}>Preço (R$)</label>
            <input style={inp} type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} placeholder="0.00" />
            
            <label style={lbl}>URL da Imagem</label>
            <input style={inp} value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} placeholder="https://..." />
            
            <button style={btnP} onClick={handleSaveProduct}>Salvar Produto</button>
          </div>
          
          <button style={{ ...btnP, backgroundColor: '#ccc', marginTop: '20px' }} onClick={() => setShowAdmin(false)}>Voltar para o Site</button>
        </div>
      )}

      {/* FOOTER */}
      <footer style={{ textAlign: 'center', padding: '40px 20px', color: '#888', fontSize: '12px' }}>
        <p>© 2024 Delícias da Mari. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
      }

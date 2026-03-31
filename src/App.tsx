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

let db: any = null;
try {
  const app = initializeApp(firebaseConfig);
  db = getDatabase(app);
} catch (e) {
  console.error("Erro ao inicializar Firebase:", e);
}

const ORDER_WHATSAPP = '5511945812309';

// INTERFACES
interface Product     { id: string; name: string; price: number; category: string; image: string; destaque?: boolean; }
interface Categoria   { id: string; nome: string; }
interface Depoimento  { id: string; nome: string; texto: string; estrelas: number; foto?: string; }
interface HeroData    { titulo: string; subtitulo: string; cta: string; imagem: string; }
interface FamiliaData { foto: string; historia: string; }
interface FooterData  { whatsapp: string; email: string; bairro: string; horario: string; instagram: string; facebook: string; }
interface BannerData  { ativo: boolean; titulo: string; texto: string; cta: string; link: string; imagem: string; corFundo: string; }

const defaultHero: HeroData    = { titulo: 'Transformando momentos simples em memórias doces.', subtitulo: 'Doces artesanais feitos com amor para tornar cada ocasião especial.', cta: 'Ver Cardápio', imagem: '' };
const defaultFooter: FooterData = { whatsapp: '', email: '', bairro: '', horario: 'Terça a Sábado, das 10h às 19h', instagram: '', facebook: '' };
const defaultBanner: BannerData = { ativo: false, titulo: '🔥 Promoção especial!', texto: 'Brigadeiros 3 por R$ 15 — só hoje!', cta: 'Quero aproveitar!', link: '', imagem: '', corFundo: '#FF85A2' };

const PINK  = '#FF85A2';
const BROWN = '#6D4C41';
const BG    = '#FFF5F8';

// ESTILOS
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
  const [adminTab, setAdminTab] = useState('produtos');
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: '', image: '', destaque: false });
  const [newDep, setNewDep] = useState({ nome: '', texto: '', estrelas: 5, foto: '' });

  useEffect(() => {
    if (!db) return;
    onValue(ref(db, 'products'), s => { const d = s.val(); setProducts(d ? Object.keys(d).map(k => ({ id: k, ...d[k] })) : []); });
    onValue(ref(db, 'categorias'), s => { const d = s.val(); setCategorias(d ? Object.keys(d).map(k => ({ id: k, nome: d[k] })) : []); });
    onValue(ref(db, 'depoimentos'), s => { const d = s.val(); setDepoimentos(d ? Object.keys(d).map(k => ({ id: k, ...d[k] })) : []); });
    onValue(ref(db, 'hero'), s => { const d = s.val(); if (d) setHero(d); });
    onValue(ref(db, 'familia'), s => { const d = s.val(); if (d) setFamilia(d); });
    onValue(ref(db, 'footer'), s => { const d = s.val(); if (d) setFooter(d); });
    onValue(ref(db, 'banner'), s => { const d = s.val(); if (d) setBanner(d); });
  }, []);

  const saveToFirebase = (path: string, data: any) => {
    if (!db) return;
    set(ref(db, path), data);
    alert("Alteração salva com sucesso! ✨");
  };

  return (
    <div style={{ backgroundColor: BG, minHeight: '100vh', fontFamily: 'sans-serif' }}>
      
      {/* BANNER PROMOCIONAL */}
      {banner.ativo && !showAdmin && (
        <div style={{ backgroundColor: banner.corFundo, color: 'white', padding: '10px', textAlign: 'center', fontSize: '14px', fontWeight: 'bold' }}>
          {banner.titulo} - {banner.texto} <a href={banner.link} style={{ color: 'white', textDecoration: 'underline', marginLeft: '10px' }}>{banner.cta}</a>
        </div>
      )}

      <header style={{ padding: '20px', textAlign: 'center', backgroundColor: 'white', borderBottom: `1px solid ${BG}` }}>
        <h1 style={{ color: PINK, margin: 0, fontSize: '22px', cursor: 'pointer' }} onClick={() => setShowAdmin(!showAdmin)}>
          Delícias da Mari 🧁
        </h1>
      </header>

      {!showAdmin ? (
        <main style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
          
          {/* HERO */}
          <section style={{ ...card, textAlign: 'center', padding: '40px 20px' }}>
            <h2 style={{ color: BROWN, fontSize: '26px', lineHeight: '1.2' }}>{hero.titulo}</h2>
            <p style={{ color: '#666', fontSize: '15px' }}>{hero.subtitulo}</p>
            <button style={{ ...btnP, width: 'auto', padding: '12px 40px', marginTop: '10px' }}>{hero.cta}</button>
          </section>

          {/* PRODUTOS */}
          <h3 style={{ color: PINK, marginBottom: '15px' }}>Nosso Cardápio</h3>
          {products.map(p => (
            <div key={p.id} style={{ ...card, display: 'flex', gap: '15px', alignItems: 'center' }}>
              <img src={p.image || 'https://placeholder.com'} alt={p.name} style={{ width: '70px', height: '70px', borderRadius: '12px', objectFit: 'cover' }} />
              <div style={{ flex: 1 }}>
                <strong style={{ color: BROWN }}>{p.name}</strong>
                <div style={{ color: PINK, fontWeight: 'bold', fontSize: '14px' }}>R$ {Number(p.price).toFixed(2)}</div>
              </div>
            </div>
          ))}

          {/* HISTÓRIA DA FAMÍLIA */}
          <section style={{ ...card, marginTop: '40px' }}>
            <h3 style={{ color: PINK, textAlign: 'center' }}>Nossa História</h3>
            {familia.foto && <img src={familia.foto} style={{ width: '100%', borderRadius: '12px', marginBottom: '15px' }} />}
            <p style={{ color: '#555', fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{familia.historia}</p>
          </section>

          {/* DEPOIMENTOS */}
          <h3 style={{ color: PINK, marginTop: '40px' }}>Clientes Felizes</h3>
          {depoimentos.map(d => (
            <div key={d.id} style={card}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <Avatar nome={d.nome} foto={d.foto} />
                <div>
                  <strong style={{ display: 'block', fontSize: '14px' }}>{d.nome}</strong>
                  <Stars n={d.estrelas} />
                </div>
              </div>
              <p style={{ fontStyle: 'italic', color: '#555', margin: 0, fontSize: '14px' }}>"{d.texto}"</p>
            </div>
          ))}
        </main>
      ) : (
        /* PAINEL ADMIN COMPLETO */
        <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ color: BROWN }}>Painel Admin</h2>
            <button onClick={() => setShowAdmin(false)} style={{ background: 'none', border: 'none', color: PINK, cursor: 'pointer' }}>Fechar ✕</button>
          </div>

          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '20px' }}>
            {['produtos', 'hero', 'banner', 'familia', 'rodape'].map(tab => (
              <button 
                key={tab} 
                onClick={() => setAdminTab(tab)}
                style={{ padding: '8px 15px', borderRadius: '20px', border: '1px solid #eee', background: adminTab === tab ? PINK : 'white', color: adminTab === tab ? 'white' : '#666', whiteSpace: 'nowrap' }}
              >
                {tab.toUpperCase()}
              </button>
            ))}
          </div>

          {adminTab === 'produtos' && (
            <div style={card}>
              <label style={lbl}>Novo Produto</label>
              <input style={inp} placeholder="Nome" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
              <input style={inp} placeholder="Preço" type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
              <input style={inp} placeholder="Link da Foto" value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} />
              <button style={btnP} onClick={() => { push(ref(db, 'products'), {...newProduct, price: Number(newProduct.price)}); setNewProduct({name:'', price:'', category:'', image:'', destaque:false}); }}>Adicionar Produto</button>
              
              <div style={{ marginTop: '20px' }}>
                {products.map(p => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                    <span style={{ fontSize: '14px' }}>{p.name}</span>
                    <button onClick={() => remove(ref(db, `products/${p.id}`))} style={{ color: 'red', border: 'none', background: 'none' }}>Excluir</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {adminTab === 'hero' && (
            <div style={card}>
              <label style={lbl}>Título Principal</label>
              <input style={inp} value={hero.titulo} onChange={e => setHero({...hero, titulo: e.target.value})} />
              <label style={lbl}>Subtítulo</label>
              <textarea style={{...inp, height: '80px'}} value={hero.subtitulo} onChange={e => setHero({...hero, subtitulo: e.target.value})} />
              <button style={btnP} onClick={() => saveToFirebase('hero', hero)}>Salvar Hero</button>
            </div>
          )}

          {adminTab === 'familia' && (
            <div style={card}>
              <label style={lbl}>Link da Foto da Família</label>
              <input style={inp} value={familia.foto} onChange={e => setFamilia({...familia, foto: e.target.value})} />
              <label style={lbl}>Nossa História</label>
              <textarea style={{...inp, height: '150px'}} value={familia.historia} onChange={e => setFamilia({...familia, historia: e.target.value})} />
              <button style={btnP} onClick={() => saveToFirebase('familia', familia)}>Salvar História</button>
            </div>
          )}
        </div>
      )}

      {/* RODAPÉ DINÂMICO */}
      {!showAdmin && (
        <footer style={{ backgroundColor: 'white', padding: '40px 20px', textAlign: 'center', borderTop: `1px solid ${BG}` }}>
          <div style={{ color: BROWN, fontWeight: 'bold', marginBottom: '10px' }}>Delícias da Mari</div>
          <div style={{ color: '#888', fontSize: '13px' }}>{footer.horario}</div>
          <div style={{ color: '#888', fontSize: '13px', marginTop: '5px' }}>{footer.bairro}</div>
          <div style={{ marginTop: '20px', fontSize: '12px', color: '#bbb' }}>© 2024 - Feito com ❤️ para o portfólio</div>
        </footer>
      )}
    </div>
  );
          }
                                                                             

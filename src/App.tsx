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

const inp: React.CSSProperties = { width: '100%', padding: '12px 14px', marginBottom: '10px', borderRadius: '12px', border: '1px solid #f0d0da', boxSizing: 'border-box', fontSize: '14px', outline: 'none', fontFamily: 'sans-serif' };
const btnP: React.CSSProperties = { width: '100%', backgroundColor: PINK, color: 'white', padding: '14px', borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' };
const lbl: React.CSSProperties  = { fontSize: '11px', color: PINK, fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px', marginTop: '18px' };

function Stars({ n }: { n: number }) {
  return <span style={{ color: '#FFB300', fontSize: '16px' }}>{Array.from({ length: 5 }, (_, i) => i < n ? '★' : '☆').join('')}</span>;
}

function Avatar({ nome, foto }: { nome: string; foto?: string }) {
  if (foto) return <img src={foto} alt={nome} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${PINK}`, flexShrink: 0 }} />;
  const initials = nome.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  return <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: `linear-gradient(135deg, ${PINK}, #ffb3c6)`, color: 'white', fontWeight: '900', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{initials}</div>;
}

const ADMIN_TABS = [
  { key: 'produtos',    label: '📦 Produtos'    },
  { key: 'categorias',  label: '🏷️ Categ.'      },
  { key: 'banner',      label: '📢 Banner'      },
  { key: 'hero',        label: '🎨 Hero'        },
  { key: 'depoimentos', label: '⭐ Depoimentos' },
  { key: 'familia',     label: '👩 Família'     },
  { key: 'rodape',      label: '📋 Rodapé'      },
] as const;
type AdminTab = typeof ADMIN_TABS[number]['key'];

export default function App() {
  const [products,         setProducts]        = useState<Product[]>([]);
  const [categorias,       setCategorias]       = useState<Categoria[]>([]);
  const [depoimentos,      setDepoimentos]      = useState<Depoimento[]>([]);
  const [hero,             setHero]             = useState<HeroData>(defaultHero);
  const [familia,          setFamilia]          = useState<FamiliaData>({ foto: '', historia: '' });
  const [footer,           setFooter]           = useState<FooterData>(defaultFooter);
  const [banner,           setBanner]           = useState<BannerData>(defaultBanner);
  const [showAdmin,        setShowAdmin]        = useState(false);
  const [adminTab,         setAdminTab]         = useState<AdminTab>('produtos');
  const [newProduct,       setNewProduct]       = useState({ name: '', price: '', category: '', image: '', destaque: false });
  const [newDep,           setNewDep]           = useState({ nome: '', texto: '', estrelas: 5, foto: '' });
  const [newCategoria,     setNewCategoria]     = useState('');

  useEffect(() => {
    if (!db) return;
    onValue(ref(db, 'products'),    s => { const d = s.val(); setProducts(d ? Object.keys(d).map(k => ({ id: k, ...d[k] })) : []); });
    onValue(ref(db, 'categorias'),  s => { const d = s.val(); setCategorias(d ? Object.keys(d).map(k => ({ id: k, nome: d[k] })) : []); });
    onValue(ref(db, 'depoimentos'), s => { const d = s.val(); setDepoimentos(d ? Object.keys(d).map(k => ({ id: k, ...d[k] })) : []); });
    onValue(ref(db, 'hero'),    s => { if (s.val()) setHero(s.val()); });
    onValue(ref(db, 'familia'), s => { if (s.val()) setFamilia(s.val()); });
    onValue(ref(db, 'footer'),  s => { if (s.val()) setFooter(s.val()); });
    onValue(ref(db, 'banner'),  s => { if (s.val()) setBanner(s.val()); });
  }, []);

  const save = (path: string, data: any) => { if (db) set(ref(db, path), data).then(() => alert('Salvo com sucesso! ✨')); };
  const removeS = (path: string, id: string) => { if (db) remove(ref(db, `${path}/${id}`)); };

  return (
    <div style={{ backgroundColor: BG, minHeight: '100vh', fontFamily: 'sans-serif' }}>
      
      {/* Banner Promocional */}
      {banner.ativo && !showAdmin && (
        <div style={{ backgroundColor: banner.corFundo, color: 'white', padding: '12px', textAlign: 'center', fontWeight: 'bold', fontSize: '14px' }}>
          {banner.titulo} | {banner.texto} <a href={banner.link} style={{ color: 'white', marginLeft: '10px' }}>{banner.cta}</a>
        </div>
      )}

      {/* Header */}
      <header style={{ padding: '20px', textAlign: 'center', backgroundColor: 'white', borderBottom: '1px solid #eee' }}>
        <h1 style={{ color: PINK, margin: 0, fontSize: '22px', cursor: 'pointer' }} onClick={() => setShowAdmin(!showAdmin)}>Delícias da Mari 🧁</h1>
      </header>

      {!showAdmin ? (
        <main style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
          {/* Hero */}
          <section style={{ textAlign: 'center', padding: '40px 20px', background: 'white', borderRadius: '20px', marginBottom: '20px' }}>
            <h2 style={{ color: BROWN, fontSize: '26px' }}>{hero.titulo}</h2>
            <p style={{ color: '#666' }}>{hero.subtitulo}</p>
            <button style={{ ...btnP, width: 'auto', padding: '12px 30px' }}>{hero.cta}</button>
          </section>

          {/* Vitrine */}
          <h3 style={{ color: PINK }}>Cardápio</h3>
          {products.map(p => (
            <div key={p.id} style={{ display: 'flex', gap: '15px', background: 'white', padding: '15px', borderRadius: '15px', marginBottom: '10px', alignItems: 'center' }}>
              <img src={p.image} alt={p.name} style={{ width: '70px', height: '70px', borderRadius: '10px', objectFit: 'cover' }} />
              <div>
                <strong style={{ display: 'block', color: BROWN }}>{p.name}</strong>
                <span style={{ color: PINK, fontWeight: 'bold' }}>R$ {Number(p.price).toFixed(2)}</span>
              </div>
            </div>
          ))}

          {/* Nossa História */}
          <section style={{ background: 'white', padding: '25px', borderRadius: '20px', marginTop: '30px' }}>
            <h3 style={{ color: PINK, textAlign: 'center' }}>Nossa História</h3>
            {familia.foto && <img src={familia.foto} style={{ width: '100%', borderRadius: '15px', marginBottom: '15px' }} />}
            <p style={{ color: '#555', lineHeight: '1.6', fontSize: '14px', whiteSpace: 'pre-wrap' }}>{familia.historia}</p>
          </section>

          {/* Depoimentos */}
          <h3 style={{ color: PINK, marginTop: '40px' }}>Depoimentos</h3>
          {depoimentos.map(d => (
            <div key={d.id} style={{ background: 'white', padding: '20px', borderRadius: '20px', marginBottom: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <Avatar nome={d.nome} foto={d.foto} />
                <div>
                  <strong style={{ color: BROWN, fontSize: '15px' }}>{d.nome}</strong>
                  <Stars n={d.estrelas} />
                </div>
              </div>
              <p style={{ color: '#666', fontSize: '14px', fontStyle: 'italic', margin: 0 }}>"{d.texto}"</p>
            </div>
          ))}
        </main>
      ) : (
        /* ADMIN PANEL */
        <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '20px', paddingBottom: '10px' }}>
            {ADMIN_TABS.map(t => (
              <button key={t.key} onClick={() => setAdminTab(t.key)} style={{ padding: '10px 15px', borderRadius: '20px', border: 'none', background: adminTab === t.key ? PINK : '#eee', color: adminTab === t.key ? 'white' : '#666', whiteSpace: 'nowrap', cursor: 'pointer', fontSize: '13px' }}>{t.label}</button>
            ))}
          </div>

          {adminTab === 'produtos' && (
            <div style={{ background: 'white', padding: '20px', borderRadius: '20px' }}>
              <label style={lbl}>Novo Produto</label>
              <input style={inp} placeholder="Nome" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
              <input style={inp} placeholder="Preço" type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
              <input style={inp} placeholder="URL da Imagem" value={newProduct.image} onChange={e => setNewProduct({...newProduct, image: e.target.value})} />
              <button style={btnP} onClick={() => { if (db) push(ref(db, 'products'), {...newProduct, price: Number(newProduct.price)}); setNewProduct({name:'', price:'', category:'', image:'', destaque:false}); }}>Adicionar</button>
              <div style={{ marginTop: '20px' }}>
                {products.map(p => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                    <span style={{ fontSize: '13px' }}>{p.name}</span>
                    <button onClick={() => removeS('products', p.id)} style={{ color: 'red', border: 'none', background: 'none' }}>Excluir</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {adminTab === 'hero' && (
            <div style={{ background: 'white', padding: '20px', borderRadius: '20px' }}>
              <label style={lbl}>Título</label>
              <input style={inp} value={hero.titulo} onChange={e => setHero({...hero, titulo: e.target.value})} />
              <label style={lbl}>Subtítulo</label>
              <textarea style={{...inp, height: '80px'}} value={hero.subtitulo} onChange={e => setHero({...hero, subtitulo: e.target.value})} />
              <button style={btnP} onClick={() => save('hero', hero)}>Salvar</button>
            </div>
          )}

          {adminTab === 'familia' && (
            <div style={{ background: 'white', padding: '20px', borderRadius: '20px' }}>
              <label style={lbl}>Foto</label>
              <input style={inp} value={familia.foto} onChange={e => setFamilia({...familia, foto: e.target.value})} />
              <label style={lbl}>História</label>
              <textarea style={{...inp, height: '150px'}} value={familia.historia} onChange={e => setFamilia({...familia, historia: e.target.value})} />
              <button style={btnP} onClick={() => save('familia', familia)}>Salvar</button>
            </div>
          )}

          {adminTab === 'depoimentos' && (
            <div style={{ background: 'white', padding: '20px', borderRadius: '20px' }}>
              <label style={lbl}>Nome</label>
              <input style={inp} value={newDep.nome} onChange={e => setNewDep({...newDep, nome: e.target.value})} />
              <label style={lbl}>Texto</label>
              <textarea style={inp} value={newDep.texto} onChange={e => setNewDep({...newDep, texto: e.target.value})} />
              <label style={lbl}>Estrelas (1-5)</label>
              <input style={inp} type="number" value={newDep.estrelas} onChange={e => setNewDep({...newDep, estrelas: Number(e.target.value)})} />
              <button style={btnP} onClick={() => { if (db) push(ref(db, 'depoimentos'), newDep); setNewDep({nome:'', texto:'', estrelas:5, foto:''}); }}>Adicionar Depoimento</button>
            </div>
          )}

          {adminTab === 'rodape' && (
            <div style={{ background: 'white', padding: '20px', borderRadius: '20px' }}>
              <label style={lbl}>Bairro</label>
              <input style={inp} value={footer.bairro} onChange={e => setFooter({...footer, bairro: e.target.value})} />
              <label style={lbl}>Horário</label>
              <input style={inp} value={footer.horario} onChange={e => setFooter({...footer, horario: e.target.value})} />
              <button style={btnP} onClick={() => save('footer', footer)}>Salvar Rodapé</button>
            </div>
          )}
          
          <button style={{ ...btnP, backgroundColor: '#888', marginTop: '20px' }} onClick={() => setShowAdmin(false)}>Sair do Painel</button>
        </div>
      )}

      {/* Footer Final */}
      {!showAdmin && (
        <footer style={{ textAlign: 'center', padding: '40px 20px', color: '#999', fontSize: '12px' }}>
          <strong>Delícias da Mari</strong><br/>
          {footer.horario}<br/>
          {footer.bairro}<br/><br/>
          © 2024 - Todos os direitos reservados.
        </footer>
      )}
    </div>
  );
}

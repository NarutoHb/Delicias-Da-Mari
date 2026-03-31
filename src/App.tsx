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

const ORDER_WHATSAPP = '5511945812309';

interface Product     { id: string; name: string; price: number; category: string; image: string; destaque?: boolean; }
interface Categoria   { id: string; nome: string; }
interface Depoimento  { id: string; nome: string; texto: string; estrelas: number; foto?: string; }
interface HeroData    { titulo: string; subtitulo: string; cta: string; imagem: string; }
interface FamiliaData { foto: string; historia: string; }
interface FooterData  { whatsapp: string; email: string; bairro: string; horario: string; instagram: string; facebook: string; }
interface BannerData  { ativo: boolean; titulo: string; texto: string; cta: string; link: string; imagem: string; corFundo: string; }

const defaultHero: HeroData     = { titulo: 'Transformando momentos simples em memórias doces.', subtitulo: 'Doces artesanais feitos com amor para tornar cada ocasião especial.', cta: 'Ver Cardápio', imagem: '' };
const defaultFooter: FooterData = { whatsapp: '', email: '', bairro: '', horario: 'Terça a Sábado, das 10h às 19h', instagram: '', facebook: '' };
const defaultBanner: BannerData = { ativo: false, titulo: '🔥 Promoção especial!', texto: 'Brigadeiros 3 por R$ 15 — só hoje! Aproveite essa oferta imperdível.', cta: 'Quero aproveitar!', link: '', imagem: '', corFundo: '#FF85A2' };

const PINK  = '#FF85A2';
const BROWN = '#6D4C41';
const BG    = '#FFF5F8';

const inp: React.CSSProperties  = { width: '100%', padding: '12px 14px', marginBottom: '10px', borderRadius: '12px', border: '1px solid #f0d0da', boxSizing: 'border-box', fontSize: '14px', outline: 'none', fontFamily: 'sans-serif' };
const btnP: React.CSSProperties = { width: '100%', backgroundColor: PINK, color: 'white', padding: '14px', borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' };
const btnB: React.CSSProperties = { ...btnP, backgroundColor: BROWN };
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
  const [cart,             setCart]             = useState<Product[]>([]);
  const [showAdmin,        setShowAdmin]        = useState(false);
  const [adminTab,         setAdminTab]         = useState<AdminTab>('produtos');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [editHero,         setEditHero]         = useState<HeroData>(defaultHero);
  const [editFamilia,      setEditFamilia]      = useState<FamiliaData>({ foto: '', historia: '' });
  const [editFooter,       setEditFooter]       = useState<FooterData>(defaultFooter);
  const [editBanner,       setEditBanner]       = useState<BannerData>(defaultBanner);
  const [newProduct,       setNewProduct]       = useState({ name: '', price: '', category: '', image: '', destaque: false });
  const [newDep,           setNewDep]           = useState({ nome: '', texto: '', estrelas: 5, foto: '' });
  const [newCategoria,     setNewCategoria]     = useState('');

  useEffect(() => {
    if (!db) return;
    onValue(ref(db, 'products'),    s => { const d = s.val(); setProducts(d ? Object.keys(d).map(k => ({ id: k, ...d[k] })) : []); });
    onValue(ref(db, 'categorias'),  s => { const d = s.val(); setCategorias(d ? Object.keys(d).map(k => ({ id: k, nome: d[k] })) : []); });
    onValue(ref(db, 'depoimentos'), s => { const d = s.val(); setDepoimentos(d ? Object.keys(d).map(k => ({ id: k, ...d[k] })) : []); });
    onValue(ref(db, 'hero'),    s => { const d = s.val(); if (d) { setHero(d); setEditHero(d); } });
    onValue(ref(db, 'familia'), s => { const d = s.val(); if (d) { setFamilia(d); setEditFamilia(d); } });
    onValue(ref(db, 'footer'),  s => { const d = s.val(); if (d) { setFooter(d); setEditFooter(d); } });
    onValue(ref(db, 'banner'),  s => { const d = s.val(); if (d) { setBanner(d); setEditBanner(d); } });
  }, []);

  const catNames   = categorias.map(c => c.nome);
  const filterCats = ['Todos', ...catNames];
  const filtered   = selectedCategory === 'Todos' ? products : products.filter(p => p.category === selectedCategory);
  const featured   = filtered.filter(p => p.destaque);
  const regular    = filtered.filter(p => !p.destaque);
  const cartTotal  = cart.reduce((a, i) => a + Number(i.price), 0);
  const defaultCat = catNames[0] || '';

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const finalizeOrder = () => {
    const grouped: Record<string, { produto: Product; qty: number }> = {};
    cart.forEach(item => {
      if (grouped[item.id]) grouped[item.id].qty++;
      else grouped[item.id] = { produto: item, qty: 1 };
    });
    const linhas = Object.values(grouped)
      .map(({ produto, qty }) => `🧁 ${qty}x ${produto.name} — R$ ${(Number(produto.price) * qty).toFixed(2)}`)
      .join('%0A');
    const msg = `${getGreeting()}! Gostaria de fazer um pedido:%0A%0A${linhas}%0A%0A💰 *Total: R$ ${cartTotal.toFixed(2)}*%0A%0AFico no aguardo! 🩷`;
    window.open(`https://wa.me/${ORDER_WHATSAPP}?text=${msg}`, '_blank');
  };

  const saveHero    = () => { if (!db) return; set(ref(db, 'hero'),    editHero);    alert('Hero salvo!'); };
  const saveFamilia = () => { if (!db) return; set(ref(db, 'familia'), editFamilia); alert('História salva!'); };
  const saveFooter  = () => { if (!db) return; set(ref(db, 'footer'),  editFooter);  alert('Rodapé salvo!'); };
  const saveBanner  = () => { if (!db) return; set(ref(db, 'banner'),  editBanner);  alert('Banner salvo!'); };

  const addProduct = () => {
    if (!db) return alert("Firebase não conectado.");
    if (!newProduct.name || !newProduct.price) return alert("Preencha nome e preço!");
    const cat = newProduct.category || defaultCat;
    if (!cat) return alert("Crie uma categoria primeiro!");
    push(ref(db, 'products'), { name: newProduct.name, price: parseFloat(newProduct.price), category: cat, image: newProduct.image, destaque: newProduct.destaque });
    setNewProduct({ name: '', price: '', category: '', image: '', destaque: false });
    alert("Produto salvo!");
  };

  const addDepoimento = () => {
    if (!db) return alert("Firebase não conectado.");
    if (!newDep.nome || !newDep.texto) return alert("Preencha nome e depoimento!");
    push(ref(db, 'depoimentos'), { nome: newDep.nome, texto: newDep.texto, estrelas: newDep.estrelas, foto: newDep.foto });
    setNewDep({ nome: '', texto: '', estrelas: 5, foto: '' });
    alert("Depoimento salvo!");
  };

  const addCategoria = () => {
    if (!db) return alert("Firebase não conectado.");
    if (!newCategoria.trim()) return alert("Digite o nome da categoria!");
    if (catNames.includes(newCategoria.trim())) return alert("Essa categoria já existe!");
    push(ref(db, 'categorias'), newCategoria.trim());
    setNewCategoria('');
  };

  const ProductCard = ({ p }: { p: Product }) => (
    <div style={{ flexShrink: 0, width: '200px', background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(255,133,162,0.12)', position: 'relative' }}>
      {p.destaque && (
        <div style={{ position: 'absolute', top: '10px', left: '10px', background: '#FFB300', color: 'white', fontSize: '10px', fontWeight: '800', padding: '3px 8px', borderRadius: '20px', zIndex: 1 }}>⭐ DESTAQUE</div>
      )}
      <div style={{ width: '100%', height: '160px', background: '#fff0f4', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {p.image ? <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '48px' }}>🍰</span>}
      </div>
      <div style={{ padding: '14px' }}>
        <div style={{ fontSize: '10px', color: PINK, fontWeight: '700', letterSpacing: '1px', marginBottom: '4px' }}>{p.category}</div>
        <div style={{ fontWeight: '700', fontSize: '14px', color: '#333', marginBottom: '4px', lineHeight: 1.3 }}>{p.name}</div>
        <div style={{ color: PINK, fontWeight: '900', fontSize: '17px', marginBottom: '10px' }}>R$ {Number(p.price).toFixed(2)}</div>
        <button onClick={() => setCart(c => [...c, p])} style={{ ...btnP, padding: '9px', fontSize: '12px' }}>+ Adicionar</button>
      </div>
    </div>
  );

  const HorizontalRow = ({ items, title, icon }: { items: Product[]; title?: string; icon?: string }) => (
    <div style={{ marginBottom: '32px' }}>
      {title && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', paddingLeft: '4px' }}>
          {icon && <span style={{ fontSize: '18px' }}>{icon}</span>}
          <span style={{ color: BROWN, fontWeight: '800', fontSize: '15px' }}>{title}</span>
        </div>
      )}
      <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '12px', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
        {items.map(p => <ProductCard key={p.id} p={p} />)}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: BG, fontFamily: "'Segoe UI', sans-serif", color: '#333' }}>

      {/* Aviso de entrega */}
      <div style={{ background: BROWN, color: 'white', padding: '8px 20px', textAlign: 'center', fontSize: '13px', fontWeight: '600', letterSpacing: '0.3px' }}>
        📍 Por enquanto, a Delícias da Mari atende apenas <strong>Osasco e região</strong>
      </div>

      {/* Header */}
      <header style={{ background: 'white', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 12px rgba(255,133,162,0.12)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '28px' }}>🧁</span>
          <div>
            <div style={{ color: PINK, fontWeight: '900', fontSize: '18px', lineHeight: 1 }}>Delícias Da Mari</div>
            <div style={{ color: '#bbb', fontSize: '11px', letterSpacing: '1px' }}>Doces artesanais</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {cart.length > 0 && (
            <button onClick={finalizeOrder} style={{ background: '#25D366', color: 'white', border: 'none', borderRadius: '20px', padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              🛒 {cart.length} — R$ {cartTotal.toFixed(2)}
            </button>
          )}
          <button
            onClick={() => {
              const senha = prompt("Senha:");
              if (senha === "mari123") { setShowAdmin(true); setAdminTab('produtos'); }
              else alert("Senha incorreta.");
            }}
            style={{ opacity: 0.15, border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer' }}
          >⚙️</button>
        </div>
      </header>

      {/* Hero */}
      <section style={{ position: 'relative', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: 'linear-gradient(135deg, #FF85A2 0%, #ffb3c6 50%, #ffe0ea 100%)' }}>
        {hero.imagem && <img src={hero.imagem} alt="hero" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3 }} />}
        <div style={{ position: 'relative', textAlign: 'center', padding: '60px 30px', maxWidth: '600px' }}>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.9)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px', fontWeight: '700' }}>🧁 Feito com amor</div>
          <h1 style={{ color: 'white', fontSize: 'clamp(22px, 5vw, 38px)', fontWeight: '900', margin: '0 0 16px', lineHeight: 1.25, textShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>{hero.titulo}</h1>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px', margin: '0 0 30px', lineHeight: 1.7 }}>{hero.subtitulo}</p>
          <a href="#cardapio" style={{ display: 'inline-block', background: 'white', color: PINK, padding: '14px 36px', borderRadius: '30px', fontWeight: '800', fontSize: '15px', textDecoration: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
            {hero.cta || 'Ver Cardápio'} →
          </a>
        </div>
      </section>

      {/* Banner promocional */}
      {banner.ativo && (
        <section style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'relative', minHeight: '220px', display: 'flex', alignItems: 'center', background: banner.imagem ? 'none' : `linear-gradient(135deg, ${banner.corFundo}, ${banner.corFundo}cc)` }}>
            {banner.imagem && (
              <>
                <img src={banner.imagem} alt="banner" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: `${banner.corFundo}cc` }} />
              </>
            )}
            <div style={{ position: 'relative', padding: '40px 32px', maxWidth: '700px', margin: '0 auto', width: '100%', textAlign: 'center' }}>
              <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.2)', color: 'white', padding: '4px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', letterSpacing: '1px', marginBottom: '12px' }}>PROMOÇÃO</div>
              <h2 style={{ color: 'white', fontSize: 'clamp(20px, 4vw, 32px)', fontWeight: '900', margin: '0 0 12px', lineHeight: 1.2, textShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>{banner.titulo}</h2>
              <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '15px', margin: '0 0 22px', lineHeight: 1.6 }}>{banner.texto}</p>
              {banner.cta && (
                <a href={banner.link || `https://wa.me/${ORDER_WHATSAPP}?text=Oi! Vi a promoção no site e quero aproveitar! 🧁`} target="_blank" rel="noreferrer"
                  style={{ display: 'inline-block', background: 'white', color: banner.corFundo, padding: '12px 28px', borderRadius: '30px', fontWeight: '800', fontSize: '14px', textDecoration: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
                  {banner.cta}
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Cardápio */}
      <section id="cardapio" style={{ padding: '50px 20px', maxWidth: '980px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-block', background: '#ffe0ea', color: PINK, padding: '4px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', letterSpacing: '1px', marginBottom: '10px' }}>CARDÁPIO</div>
          <h2 style={{ color: BROWN, fontSize: '26px', fontWeight: '900', margin: 0 }}>Nossos Doces</h2>
        </div>
        {filterCats.length > 1 && (
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '14px', marginBottom: '28px', scrollbarWidth: 'none' } as React.CSSProperties}>
            {filterCats.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} style={{ flexShrink: 0, padding: '8px 20px', borderRadius: '20px', border: '2px solid', borderColor: selectedCategory === cat ? PINK : '#f5d0db', background: selectedCategory === cat ? PINK : 'white', color: selectedCategory === cat ? 'white' : '#999', fontWeight: '700', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {cat}
              </button>
            ))}
          </div>
        )}
        {featured.length === 0 && regular.length === 0 && (
          <p style={{ textAlign: 'center', color: '#ccc', padding: '50px 0', fontSize: '15px' }}>🍰 Nenhum produto encontrado.</p>
        )}
        {featured.length > 0 && <HorizontalRow items={featured} title="Destaques" icon="⭐" />}
        {regular.length > 0  && <HorizontalRow items={regular} />}
      </section>

      {/* Depoimentos */}
      {depoimentos.length > 0 && (
        <section style={{ background: 'white', padding: '56px 20px' }}>
          <div style={{ maxWidth: '980px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '36px' }}>
              <div style={{ display: 'inline-block', background: '#ffe0ea', color: PINK, padding: '4px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', letterSpacing: '1px', marginBottom: '10px' }}>AVALIAÇÕES</div>
              <h2 style={{ color: BROWN, fontSize: '26px', fontWeight: '900', margin: 0 }}>O que nossas clientes dizem</h2>
            </div>
            <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '12px', scrollbarWidth: 'none' } as React.CSSProperties}>
              {depoimentos.map(d => (
                <div key={d.id} style={{ flexShrink: 0, width: '280px', background: BG, borderRadius: '20px', padding: '22px', border: '1px solid #f5d0db' }}>
                  <Stars n={d.estrelas} />
                  <p style={{ color: '#555', fontSize: '14px', lineHeight: 1.7, margin: '12px 0 18px', fontStyle: 'italic' }}>"{d.texto}"</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Avatar nome={d.nome} foto={d.foto} />
                    <div style={{ color: BROWN, fontWeight: '800', fontSize: '13px' }}>{d.nome}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Nossa Família */}
      {(familia.historia || familia.foto) && (
        <section style={{ padding: '56px 20px', background: BG }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '36px' }}>
              <div style={{ display: 'inline-block', background: '#ffe0ea', color: PINK, padding: '4px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', letterSpacing: '1px', marginBottom: '10px' }}>NOSSA HISTÓRIA</div>
              <h2 style={{ color: BROWN, fontSize: '26px', fontWeight: '900', margin: 0 }}>Feito com amor de verdade</h2>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', alignItems: 'center', justifyContent: 'center' }}>
              {familia.foto && (
                <img src={familia.foto} alt="Nossa família" style={{ width: '260px', height: '260px', borderRadius: '24px', objectFit: 'cover', boxShadow: '0 8px 32px rgba(255,133,162,0.18)' }} />
              )}
              {familia.historia && (
                <p style={{ flex: '1 1 280px', color: '#555', fontSize: '15px', lineHeight: 1.9, margin: 0 }}>{familia.historia}</p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer style={{ background: BROWN, color: 'white', padding: '48px 20px 24px' }}>
        <div style={{ maxWidth: '980px', margin: '0 auto' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', marginBottom: '32px' }}>
            <div style={{ flex: '1 1 200px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span style={{ fontSize: '24px' }}>🧁</span>
                <span style={{ fontWeight: '900', fontSize: '18px' }}>Delícias Da Mari</span>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', lineHeight: 1.7, margin: 0 }}>Doces artesanais feitos com amor para tornar cada momento especial.</p>
            </div>
            <div style={{ flex: '1 1 160px' }}>
              <div style={{ fontWeight: '800', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', color: PINK, marginBottom: '12px' }}>Contato</div>
              {footer.whatsapp && <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', marginBottom: '6px' }}>📱 {footer.whatsapp}</div>}
              {footer.email    && <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', marginBottom: '6px' }}>✉️ {footer.email}</div>}
              {footer.bairro   && <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', marginBottom: '6px' }}>📍 {footer.bairro}</div>}
              {footer.horario  && <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>🕐 {footer.horario}</div>}
            </div>
            <div style={{ flex: '1 1 160px' }}>
              <div style={{ fontWeight: '800', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', color: PINK, marginBottom: '12px' }}>Redes Sociais</div>
              {footer.instagram && (
                <a href={`https://instagram.com/${footer.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.8)', textDecoration: 'none', marginBottom: '6px' }}>
                  📸 Instagram
                </a>
              )}
              {footer.facebook && (
                <a href={footer.facebook} target="_blank" rel="noreferrer" style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.8)', textDecoration: 'none' }}>
                  👤 Facebook
                </a>
              )}
              <a
                href={`https://wa.me/${ORDER_WHATSAPP}?text=Oi%20Mari!%20Vim%20pelo%20site%20e%20quero%20fazer%20um%20pedido%20🧁`}
                target="_blank" rel="noreferrer"
                style={{ display: 'inline-block', marginTop: '12px', background: '#25D366', color: 'white', padding: '8px 18px', borderRadius: '20px', fontWeight: '700', fontSize: '13px', textDecoration: 'none' }}
              >
                💬 WhatsApp
              </a>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
            © {new Date().getFullYear()} Delícias Da Mari. Feito com 🩷
          </div>
        </div>
      </footer>

      {/* Painel Admin */}
      {showAdmin && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', overflowY: 'auto', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '560px', padding: '28px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', margin: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ fontWeight: '900', fontSize: '18px', color: BROWN }}>⚙️ Painel Admin</div>
              <button onClick={() => setShowAdmin(false)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#999' }}>✕</button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '24px' }}>
              {ADMIN_TABS.map(t => (
                <button key={t.key} onClick={() => setAdminTab(t.key)} style={{ padding: '7px 14px', borderRadius: '20px', border: '2px solid', borderColor: adminTab === t.key ? PINK : '#f0d0da', background: adminTab === t.key ? PINK : 'white', color: adminTab === t.key ? 'white' : '#999', fontWeight: '700', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab: Produtos */}
            {adminTab === 'produtos' && (
              <div>
                <label style={lbl}>Nome do produto</label>
                <input style={inp} value={newProduct.name} onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Brigadeiro de Nutella" />
                <label style={lbl}>Preço (R$)</label>
                <input style={inp} type="number" value={newProduct.price} onChange={e => setNewProduct(p => ({ ...p, price: e.target.value }))} placeholder="Ex: 5.50" />
                <label style={lbl}>Categoria</label>
                <select style={inp} value={newProduct.category || defaultCat} onChange={e => setNewProduct(p => ({ ...p, category: e.target.value }))}>
                  {catNames.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <label style={lbl}>URL da imagem</label>
                <input style={inp} value={newProduct.image} onChange={e => setNewProduct(p => ({ ...p, image: e.target.value }))} placeholder="https://..." />
                <label style={{ ...lbl, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={newProduct.destaque} onChange={e => setNewProduct(p => ({ ...p, destaque: e.target.checked }))} />
                  Marcar como destaque ⭐
                </label>
                <button onClick={addProduct} style={{ ...btnP, marginTop: '16px' }}>Salvar Produto</button>

                <div style={{ marginTop: '24px' }}>
                  <div style={{ fontWeight: '800', fontSize: '13px', color: BROWN, marginBottom: '12px' }}>Produtos cadastrados ({products.length})</div>
                  {products.map(p => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: BG, borderRadius: '12px', marginBottom: '8px' }}>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '13px' }}>{p.name}</div>
                        <div style={{ color: '#999', fontSize: '11px' }}>{p.category} · R$ {Number(p.price).toFixed(2)}{p.destaque ? ' ⭐' : ''}</div>
                      </div>
                      <button onClick={() => { if (!db) return; remove(ref(db, `products/${p.id}`)); }} style={{ background: '#ffeeee', color: '#e55', border: 'none', borderRadius: '8px', padding: '5px 10px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>🗑</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Categorias */}
            {adminTab === 'categorias' && (
              <div>
                <label style={lbl}>Nova categoria</label>
                <input style={inp} value={newCategoria} onChange={e => setNewCategoria(e.target.value)} placeholder="Ex: Brigadeiros" />
                <button onClick={addCategoria} style={btnP}>Adicionar Categoria</button>
                <div style={{ marginTop: '20px' }}>
                  {categorias.map(c => (
                    <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: BG, borderRadius: '12px', marginBottom: '8px' }}>
                      <span style={{ fontWeight: '700', fontSize: '13px' }}>{c.nome}</span>
                      <button onClick={() => { if (!db) return; remove(ref(db, `categorias/${c.id}`)); }} style={{ background: '#ffeeee', color: '#e55', border: 'none', borderRadius: '8px', padding: '5px 10px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>🗑</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Banner */}
            {adminTab === 'banner' && (
              <div>
                <label style={{ ...lbl, display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', marginTop: '4px' }}>
                  <input type="checkbox" checked={editBanner.ativo} onChange={e => setEditBanner(b => ({ ...b, ativo: e.target.checked }))} />
                  Exibir banner
                </label>
                <label style={lbl}>Título</label>
                <input style={inp} value={editBanner.titulo} onChange={e => setEditBanner(b => ({ ...b, titulo: e.target.value }))} />
                <label style={lbl}>Texto</label>
                <textarea style={{ ...inp, minHeight: '80px', resize: 'vertical' }} value={editBanner.texto} onChange={e => setEditBanner(b => ({ ...b, texto: e.target.value }))} />
                <label style={lbl}>Texto do botão (CTA)</label>
                <input style={inp} value={editBanner.cta} onChange={e => setEditBanner(b => ({ ...b, cta: e.target.value }))} />
                <label style={lbl}>Link do botão</label>
                <input style={inp} value={editBanner.link} onChange={e => setEditBanner(b => ({ ...b, link: e.target.value }))} placeholder="https://... (vazio = WhatsApp)" />
                <label style={lbl}>URL da imagem de fundo</label>
                <input style={inp} value={editBanner.imagem} onChange={e => setEditBanner(b => ({ ...b, imagem: e.target.value }))} placeholder="https://..." />
                <label style={lbl}>Cor de fundo (hex)</label>
                <input style={inp} value={editBanner.corFundo} onChange={e => setEditBanner(b => ({ ...b, corFundo: e.target.value }))} placeholder="#FF85A2" />
                <button onClick={saveBanner} style={{ ...btnP, marginTop: '8px' }}>Salvar Banner</button>
              </div>
            )}

            {/* Tab: Hero */}
            {adminTab === 'hero' && (
              <div>
                <label style={lbl}>Título principal</label>
                <input style={inp} value={editHero.titulo} onChange={e => setEditHero(h => ({ ...h, titulo: e.target.value }))} />
                <label style={lbl}>Subtítulo</label>
                <textarea style={{ ...inp, minHeight: '80px', resize: 'vertical' }} value={editHero.subtitulo} onChange={e => setEditHero(h => ({ ...h, subtitulo: e.target.value }))} />
                <label style={lbl}>Texto do botão</label>
                <input style={inp} value={editHero.cta} onChange={e => setEditHero(h => ({ ...h, cta: e.target.value }))} />
                <label style={lbl}>URL da imagem de fundo</label>
                <input style={inp} value={editHero.imagem} onChange={e => setEditHero(h => ({ ...h, imagem: e.target.value }))} placeholder="https://..." />
                <button onClick={saveHero} style={{ ...btnP, marginTop: '8px' }}>Salvar Hero</button>
              </div>
            )}

            {/* Tab: Depoimentos */}
            {adminTab === 'depoimentos' && (
              <div>
                <label style={lbl}>Nome</label>
                <input style={inp} value={newDep.nome} onChange={e => setNewDep(d => ({ ...d, nome: e.target.value }))} placeholder="Ex: Ana Paula" />
                <label style={lbl}>Depoimento</label>
                <textarea style={{ ...inp, minHeight: '80px', resize: 'vertical' }} value={newDep.texto} onChange={e => setNewDep(d => ({ ...d, texto: e.target.value }))} placeholder="O que a cliente disse..." />
                <label style={lbl}>Estrelas</label>
                <select style={inp} value={newDep.estrelas} onChange={e => setNewDep(d => ({ ...d, estrelas: Number(e.target.value) }))}>
                  {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{Array.from({ length: n }, () => '★').join('')}</option>)}
                </select>
                <label style={lbl}>URL da foto (opcional)</label>
                <input style={inp} value={newDep.foto} onChange={e => setNewDep(d => ({ ...d, foto: e.target.value }))} placeholder="https://..." />
                <button onClick={addDepoimento} style={btnP}>Salvar Depoimento</button>
                <div style={{ marginTop: '20px' }}>
                  {depoimentos.map(d => (
                    <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: BG, borderRadius: '12px', marginBottom: '8px' }}>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '13px' }}>{d.nome}</div>
                        <div style={{ color: '#999', fontSize: '11px' }}>{Array.from({ length: d.estrelas }, () => '★').join('')} · {d.texto.slice(0, 40)}…</div>
                      </div>
                      <button onClick={() => { if (!db) return; remove(ref(db, `depoimentos/${d.id}`)); }} style={{ background: '#ffeeee', color: '#e55', border: 'none', borderRadius: '8px', padding: '5px 10px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>🗑</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Família */}
            {adminTab === 'familia' && (
              <div>
                <label style={lbl}>URL da foto</label>
                <input style={inp} value={editFamilia.foto} onChange={e => setEditFamilia(f => ({ ...f, foto: e.target.value }))} placeholder="https://..." />
                <label style={lbl}>Nossa história</label>
                <textarea style={{ ...inp, minHeight: '140px', resize: 'vertical' }} value={editFamilia.historia} onChange={e => setEditFamilia(f => ({ ...f, historia: e.target.value }))} placeholder="Conte um pouco sobre você e sua família..." />
                <button onClick={saveFamilia} style={{ ...btnP, marginTop: '8px' }}>Salvar História</button>
              </div>
            )}

            {/* Tab: Rodapé */}
            {adminTab === 'rodape' && (
              <div>
                <label style={lbl}>WhatsApp (com DDD)</label>
                <input style={inp} value={editFooter.whatsapp} onChange={e => setEditFooter(f => ({ ...f, whatsapp: e.target.value }))} placeholder="(11) 9 xxxx-xxxx" />
                <label style={lbl}>E-mail</label>
                <input style={inp} value={editFooter.email} onChange={e => setEditFooter(f => ({ ...f, email: e.target.value }))} placeholder="seu@email.com" />
                <label style={lbl}>Bairro / Região</label>
                <input style={inp} value={editFooter.bairro} onChange={e => setEditFooter(f => ({ ...f, bairro: e.target.value }))} placeholder="Osasco, SP" />
                <label style={lbl}>Horário de atendimento</label>
                <input style={inp} value={editFooter.horario} onChange={e => setEditFooter(f => ({ ...f, horario: e.target.value }))} placeholder="Terça a Sábado, das 10h às 19h" />
                <label style={lbl}>Instagram</label>
                <input style={inp} value={editFooter.instagram} onChange={e => setEditFooter(f => ({ ...f, instagram: e.target.value }))} placeholder="@deliciasdamari" />
                <label style={lbl}>Facebook (URL)</label>
                <input style={inp} value={editFooter.facebook} onChange={e => setEditFooter(f => ({ ...f, facebook: e.target.value }))} placeholder="https://facebook.com/..." />
                <button onClick={saveFooter} style={{ ...btnP, marginTop: '8px' }}>Salvar Rodapé</button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

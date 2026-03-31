import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, push, remove, set, update } from "firebase/database";

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

interface Variacao       { nome: string; preco: number; estoque: number; }
interface Product        { id: string; name: string; price: number; precoBase?: number; category: string; image: string; destaque?: boolean; temVariacoes?: boolean; variacoes?: Variacao[]; status?: 'disponivel' | 'esgotado'; estoqueIndividual?: number; ativo?: boolean; }
interface CartItem       { product: Product; variacaoNome?: string; variacaoPreco: number; }
interface Categoria      { id: string; nome: string; }
interface Depoimento     { id: string; nome: string; texto: string; estrelas: number; foto?: string; }
interface HeroData       { titulo: string; subtitulo: string; cta: string; imagem: string; }
interface FamiliaData    { foto: string; historia: string; }
interface FooterData     { whatsapp: string; email: string; bairro: string; horario: string; instagram: string; facebook: string; }
interface BannerData     { ativo: boolean; titulo: string; texto: string; cta: string; link: string; imagem: string; corFundo: string; }
interface NewProductForm { name: string; precoBase: string; category: string; image: string; destaque: boolean; temVariacoes: boolean; estoqueIndividual: string; variacoes: { nome: string; preco: string; estoque: string }[]; }

const defaultHero: HeroData     = { titulo: 'Transformando momentos simples em memórias doces.', subtitulo: 'Doces artesanais feitos com amor para tornar cada ocasião especial.', cta: 'Ver Cardápio', imagem: '' };
const defaultFooter: FooterData = { whatsapp: '', email: '', bairro: '', horario: 'Terça a Sábado, das 10h às 19h', instagram: '', facebook: '' };
const defaultBanner: BannerData = { ativo: false, titulo: '🔥 Promoção especial!', texto: 'Brigadeiros 3 por R$ 15 — só hoje! Aproveite essa oferta imperdível.', cta: 'Quero aproveitar!', link: '', imagem: '', corFundo: '#FF85A2' };
const defaultNewProduct: NewProductForm = { name: '', precoBase: '', category: '', image: '', destaque: false, temVariacoes: false, estoqueIndividual: '', variacoes: [] };

const PINK  = '#FF85A2';
const BROWN = '#6D4C41';
const BG    = '#FFF5F8';

const inp: React.CSSProperties  = { width: '100%', padding: '12px 14px', marginBottom: '10px', borderRadius: '12px', border: '1px solid #f0d0da', boxSizing: 'border-box', fontSize: '14px', outline: 'none', fontFamily: 'sans-serif' };
const btnP: React.CSSProperties = { width: '100%', backgroundColor: PINK, color: 'white', padding: '14px', borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' };
const btnB: React.CSSProperties = { ...btnP, backgroundColor: BROWN };
const lbl: React.CSSProperties  = { fontSize: '11px', color: PINK, fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '8px', marginTop: '18px' };

const SKELETON_CSS = `
  @keyframes sklPulse { 0%,100%{opacity:1} 50%{opacity:.45} }
  .skl { background:#f0e8ec; animation:sklPulse 1.5s ease-in-out infinite; }
`;

function Stars({ n }: { n: number }) {
  return <span style={{ color: '#FFB300', fontSize: '16px' }}>{Array.from({ length: 5 }, (_, i) => i < n ? '★' : '☆').join('')}</span>;
}

function Avatar({ nome, foto }: { nome: string; foto?: string }) {
  if (foto) return <img src={foto} alt={nome} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${PINK}`, flexShrink: 0 }} />;
  const initials = nome.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  return <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: `linear-gradient(135deg, ${PINK}, #ffb3c6)`, color: 'white', fontWeight: '900', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{initials}</div>;
}

function SkeletonCard() {
  return (
    <div style={{ flexShrink: 0, width: '200px', background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(255,133,162,0.12)' }}>
      <div className="skl" style={{ width: '100%', height: '160px' }} />
      <div style={{ padding: '14px' }}>
        <div className="skl" style={{ height: '10px', borderRadius: '6px', marginBottom: '8px', width: '60%' }} />
        <div className="skl" style={{ height: '14px', borderRadius: '6px', marginBottom: '8px', width: '85%' }} />
        <div className="skl" style={{ height: '18px', borderRadius: '6px', marginBottom: '12px', width: '40%' }} />
        <div className="skl" style={{ height: '36px', borderRadius: '12px' }} />
      </div>
    </div>
  );
}

function Switch({ on, onToggle, label, sublabel }: { on: boolean; onToggle: () => void; label: string; sublabel?: string }) {
  return (
    <label onClick={onToggle} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '12px', background: on ? '#fff0f7' : BG, border: `1px solid ${on ? PINK : '#f0d0da'}`, cursor: 'pointer', marginBottom: '14px', userSelect: 'none' }}>
      <div style={{ width: '44px', height: '24px', borderRadius: '12px', background: on ? PINK : '#ddd', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
        <div style={{ position: 'absolute', top: '3px', left: on ? '22px' : '3px', width: '18px', height: '18px', borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
      </div>
      <div>
        <div style={{ fontSize: '13px', fontWeight: '700', color: on ? PINK : '#555' }}>{label}</div>
        {sublabel && <div style={{ fontSize: '11px', color: '#aaa' }}>{sublabel}</div>}
      </div>
    </label>
  );
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
type Page = 'cardapio' | 'historia';

export default function App() {
  const [page,             setPage]            = useState<Page>('cardapio');
  const [loading,          setLoading]         = useState(true);
  const [products,         setProducts]        = useState<Product[]>([]);
  const [categorias,       setCategorias]       = useState<Categoria[]>([]);
  const [depoimentos,      setDepoimentos]      = useState<Depoimento[]>([]);
  const [hero,             setHero]             = useState<HeroData>(defaultHero);
  const [familia,          setFamilia]          = useState<FamiliaData>({ foto: '', historia: '' });
  const [footer,           setFooter]           = useState<FooterData>(defaultFooter);
  const [banner,           setBanner]           = useState<BannerData>(defaultBanner);
  const [cart,             setCart]             = useState<CartItem[]>([]);
  const [showAdmin,        setShowAdmin]        = useState(false);
  const [adminTab,         setAdminTab]         = useState<AdminTab>('produtos');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [editHero,         setEditHero]         = useState<HeroData>(defaultHero);
  const [editFamilia,      setEditFamilia]      = useState<FamiliaData>({ foto: '', historia: '' });
  const [editFooter,       setEditFooter]       = useState<FooterData>(defaultFooter);
  const [editBanner,       setEditBanner]       = useState<BannerData>(defaultBanner);
  const [newProduct,       setNewProduct]       = useState<NewProductForm>(defaultNewProduct);
  const [newDep,           setNewDep]           = useState({ nome: '', texto: '', estrelas: 5, foto: '' });
  const [newCategoria,     setNewCategoria]     = useState('');
  const [selVar,           setSelVar]           = useState<Record<string, number>>({});

  useEffect(() => {
    if (!db) { setLoading(false); return; }
    onValue(ref(db, 'products'), s => {
      const d = s.val();
      setProducts(d ? Object.keys(d).map(k => ({ id: k, ...d[k] })) : []);
      setLoading(false);
    });
    onValue(ref(db, 'categorias'),  s => { const d = s.val(); setCategorias(d ? Object.keys(d).map(k => ({ id: k, nome: d[k] })) : []); });
    onValue(ref(db, 'depoimentos'), s => { const d = s.val(); setDepoimentos(d ? Object.keys(d).map(k => ({ id: k, ...d[k] })) : []); });
    onValue(ref(db, 'hero'),    s => { const d = s.val(); if (d) { setHero(d); setEditHero(d); } });
    onValue(ref(db, 'familia'), s => { const d = s.val(); if (d) { setFamilia(d); setEditFamilia(d); } });
    onValue(ref(db, 'footer'),  s => { const d = s.val(); if (d) { setFooter(d); setEditFooter(d); } });
    onValue(ref(db, 'banner'),  s => { const d = s.val(); if (d) { setBanner(d); setEditBanner(d); } });
  }, []);

  const catNames   = categorias.map(c => c.nome);
  const filterCats = ['Todos', ...catNames];
  const visible    = products.filter(p => p.ativo !== false);
  const filtered   = selectedCategory === 'Todos' ? visible : visible.filter(p => p.category === selectedCategory);
  const featured   = filtered.filter(p => p.destaque);
  const regular    = filtered.filter(p => !p.destaque);
  const cartTotal  = cart.reduce((a, i) => a + i.variacaoPreco, 0);
  const defaultCat = catNames[0] || '';

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const getStatus = (p: Product): 'disponivel' | 'esgotado' => {
    if (p.temVariacoes && p.variacoes && p.variacoes.length > 0) {
      return p.variacoes.some(v => v.estoque > 0) ? 'disponivel' : 'esgotado';
    }
    return p.status || 'disponivel';
  };

  const finalizeOrder = () => {
    const grouped: Record<string, { produto: Product; variacaoNome?: string; variacaoPreco: number; qty: number }> = {};
    cart.forEach(item => {
      const key = `${item.product.id}_${item.variacaoNome || ''}`;
      if (grouped[key]) grouped[key].qty++;
      else grouped[key] = { produto: item.product, variacaoNome: item.variacaoNome, variacaoPreco: item.variacaoPreco, qty: 1 };
    });
    const linhas = Object.values(grouped)
      .map(({ produto, variacaoNome, variacaoPreco, qty }) => {
        const v = variacaoNome ? ` (Tamanho: ${variacaoNome})` : '';
        return `🧁 ${qty}x ${produto.name}${v} — R$ ${(variacaoPreco * qty).toFixed(2)}`;
      })
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
    if (!newProduct.name) return alert("Preencha o nome!");
    const cat = newProduct.category || defaultCat;
    if (!cat) return alert("Crie uma categoria primeiro!");

    if (newProduct.temVariacoes) {
      if (newProduct.variacoes.length === 0) return alert("Adicione pelo menos uma variação!");
      const vars = newProduct.variacoes.map(v => ({ nome: v.nome, preco: parseFloat(v.preco) || 0, estoque: parseInt(v.estoque) || 0 }));
      push(ref(db, 'products'), { name: newProduct.name, price: vars[0]?.preco || 0, precoBase: vars[0]?.preco || 0, category: cat, image: newProduct.image, destaque: newProduct.destaque, temVariacoes: true, variacoes: vars, status: 'disponivel', ativo: true });
    } else {
      if (!newProduct.precoBase) return alert("Preencha o preço!");
      const preco   = parseFloat(newProduct.precoBase);
      const estoque = parseInt(newProduct.estoqueIndividual) || 0;
      push(ref(db, 'products'), { name: newProduct.name, price: preco, precoBase: preco, category: cat, image: newProduct.image, destaque: newProduct.destaque, temVariacoes: false, status: estoque === 0 ? 'esgotado' : 'disponivel', estoqueIndividual: estoque, ativo: true });
    }
    setNewProduct(defaultNewProduct);
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

  const addVariacao    = () => setNewProduct(p => ({ ...p, variacoes: [...p.variacoes, { nome: '', preco: '', estoque: '' }] }));
  const removeVariacao = (idx: number) => setNewProduct(p => ({ ...p, variacoes: p.variacoes.filter((_, i) => i !== idx) }));
  const updateVariacao = (idx: number, field: keyof NewProductForm['variacoes'][number], value: string) =>
    setNewProduct(p => ({ ...p, variacoes: p.variacoes.map((v, i) => i === idx ? { ...v, [field]: value } : v) }));

  const toggleAtivo    = (p: Product) => { if (!db) return; update(ref(db, `products/${p.id}`), { ativo: p.ativo === false }); };
  const toggleDestaque = (p: Product) => { if (!db) return; update(ref(db, `products/${p.id}`), { destaque: !p.destaque }); };

  const ProductCard = ({ p }: { p: Product }) => {
    const vars       = p.variacoes || [];
    const idx        = selVar[p.id] ?? 0;
    const selectedV  = vars[idx];
    const price      = p.temVariacoes ? (selectedV?.preco ?? vars[0]?.preco ?? p.price) : (p.precoBase ?? p.price);
    const status     = getStatus(p);
    const esgotado   = status === 'esgotado';
    const varEsgot   = p.temVariacoes && selectedV !== undefined && selectedV.estoque === 0;
    const disabled   = esgotado || varEsgot;

    return (
      <div style={{ flexShrink: 0, width: '200px', background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(255,133,162,0.12)', position: 'relative', opacity: esgotado ? 0.72 : 1 }}>
        {p.destaque && <div style={{ position: 'absolute', top: '10px', left: '10px', background: '#FFB300', color: 'white', fontSize: '10px', fontWeight: '800', padding: '3px 8px', borderRadius: '20px', zIndex: 1 }}>⭐ DESTAQUE</div>}
        {esgotado   && <div style={{ position: 'absolute', top: '10px', right: '10px', background: '#999', color: 'white', fontSize: '10px', fontWeight: '800', padding: '3px 8px', borderRadius: '20px', zIndex: 1 }}>ESGOTADO</div>}
        <div style={{ width: '100%', height: '160px', background: '#fff0f4', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {p.image ? <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '48px' }}>🍰</span>}
        </div>
        <div style={{ padding: '14px' }}>
          <div style={{ fontSize: '10px', color: PINK, fontWeight: '700', letterSpacing: '1px', marginBottom: '4px' }}>{p.category}</div>
          <div style={{ fontWeight: '700', fontSize: '14px', color: '#333', marginBottom: '6px', lineHeight: 1.3 }}>{p.name}</div>

          {p.temVariacoes && vars.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
              {vars.map((v, i) => (
                <button
                  key={i}
                  onClick={() => setSelVar(sv => ({ ...sv, [p.id]: i }))}
                  style={{ padding: '3px 9px', borderRadius: '20px', border: `2px solid ${i === idx ? PINK : '#f0d0da'}`, background: i === idx ? PINK : 'white', color: i === idx ? 'white' : '#777', fontSize: '11px', fontWeight: '700', cursor: v.estoque === 0 ? 'not-allowed' : 'pointer', opacity: v.estoque === 0 ? 0.45 : 1, textDecoration: v.estoque === 0 ? 'line-through' : 'none' }}
                >
                  {v.nome}
                </button>
              ))}
            </div>
          )}

          <div style={{ color: PINK, fontWeight: '900', fontSize: '17px', marginBottom: '10px' }}>R$ {price.toFixed(2)}</div>
          <button
            onClick={() => !disabled && setCart(c => [...c, { product: p, variacaoNome: p.temVariacoes ? selectedV?.nome : undefined, variacaoPreco: price }])}
            style={{ ...btnP, padding: '9px', fontSize: '12px', backgroundColor: disabled ? '#ccc' : PINK, cursor: disabled ? 'not-allowed' : 'pointer' }}
          >
            {disabled ? 'Esgotado' : '+ Adicionar'}
          </button>
        </div>
      </div>
    );
  };

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

  if (page === 'historia') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: BG, fontFamily: "'Segoe UI', sans-serif" }}>
        <style>{SKELETON_CSS}</style>
        <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'white', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 2px 12px rgba(255,133,162,0.12)' }}>
          <button onClick={() => setPage('cardapio')} style={{ background: PINK, color: 'white', border: 'none', borderRadius: '12px', padding: '10px 20px', fontWeight: '800', fontSize: '14px', cursor: 'pointer' }}>← Cardápio</button>
          <span style={{ color: BROWN, fontWeight: '900', fontSize: '16px' }}>Nossa História</span>
        </div>
        <div style={{ maxWidth: '760px', margin: '0 auto', padding: '50px 24px 100px' }}>
          {familia.foto && (
            <div style={{ borderRadius: '24px', overflow: 'hidden', marginBottom: '40px', boxShadow: '0 8px 32px rgba(255,133,162,0.2)' }}>
              <img src={familia.foto} alt="Família" style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '440px', objectFit: 'cover' }} />
            </div>
          )}
          <div style={{ display: 'inline-block', background: '#ffe0ea', color: PINK, padding: '4px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', letterSpacing: '1px', marginBottom: '20px' }}>NOSSA HISTÓRIA</div>
          <h1 style={{ color: BROWN, fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: '900', margin: '0 0 28px', lineHeight: 1.3 }}>Feito com amor de verdade 🩷</h1>
          <p style={{ color: '#555', fontSize: '16px', lineHeight: 2, whiteSpace: 'pre-line', margin: 0 }}>{familia.historia || 'Em breve...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: BG, fontFamily: "'Segoe UI', sans-serif", color: '#333' }}>
      <style>{SKELETON_CSS}</style>

      {/* ── AVISO ── */}
      <div style={{ background: BROWN, color: 'white', padding: '8px 20px', textAlign: 'center', fontSize: '13px', fontWeight: '600', letterSpacing: '0.3px' }}>
        📍 Por enquanto, a Delícias da Mari atende apenas <strong>Osasco e região</strong>
      </div>

      {/* ── HEADER ── */}
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
            onClick={() => { const s = prompt("Senha:"); if (s === "mari123") { setShowAdmin(true); setAdminTab('produtos'); } else if (s !== null) alert("Senha incorreta."); }}
            style={{ opacity: 0.15, border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer' }}
          >⚙️</button>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: 'linear-gradient(135deg, #FF85A2 0%, #ffb3c6 50%, #ffe0ea 100%)' }}>
        {hero.imagem && <img src={hero.imagem} alt="hero" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3 }} />}
        <div style={{ position: 'relative', textAlign: 'center', padding: '60px 30px', maxWidth: '600px' }}>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.9)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px', fontWeight: '700' }}>🧁 Feito com amor</div>
          <h1 style={{ color: 'white', fontSize: 'clamp(22px, 5vw, 38px)', fontWeight: '900', margin: '0 0 16px', lineHeight: 1.25, textShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>{hero.titulo}</h1>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px', margin: '0 0 30px', lineHeight: 1.7 }}>{hero.subtitulo}</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#cardapio" style={{ display: 'inline-block', background: 'white', color: PINK, padding: '14px 36px', borderRadius: '30px', fontWeight: '800', fontSize: '15px', textDecoration: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
              {hero.cta || 'Ver Cardápio'} →
            </a>
            {(familia.historia || familia.foto) && (
              <button onClick={() => setPage('historia')} style={{ background: 'transparent', color: 'white', border: '2px solid rgba(255,255,255,0.75)', padding: '14px 28px', borderRadius: '30px', fontWeight: '800', fontSize: '15px', cursor: 'pointer' }}>
                Nossa História
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── BANNER PROMOCIONAL ── */}
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

      {/* ── PRODUTOS ── */}
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

        {loading && (
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '12px', scrollbarWidth: 'none' } as React.CSSProperties}>
              {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          </div>
        )}

        {!loading && featured.length === 0 && regular.length === 0 && (
          <p style={{ textAlign: 'center', color: '#ccc', padding: '50px 0', fontSize: '15px' }}>🍰 Nenhum produto encontrado.</p>
        )}

        {!loading && featured.length > 0 && <HorizontalRow items={featured} title="Destaques" icon="⭐" />}
        {!loading && regular.length  > 0 && <HorizontalRow items={regular} />}
      </section>

      {/* ── DEPOIMENTOS ── */}
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

      {/* ── FAMÍLIA / SOBRE NÓS ── */}
      {(familia.historia || familia.foto) && (
        <section style={{ padding: '60px 20px', background: 'linear-gradient(135deg, #fff5f8 0%, #ffe8ef 100%)' }}>
          <div style={{ maxWidth: '820px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'center' }}>
            {familia.foto && (
              <div style={{ flex: '1 1 280px' }}>
                <img src={familia.foto} alt="Família" style={{ width: '100%', borderRadius: '24px', boxShadow: '0 8px 32px rgba(255,133,162,0.2)', objectFit: 'cover', aspectRatio: '4/3' }} />
              </div>
            )}
            <div style={{ flex: '1 1 280px' }}>
              <div style={{ display: 'inline-block', background: '#ffe0ea', color: PINK, padding: '4px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', letterSpacing: '1px', marginBottom: '14px' }}>NOSSA HISTÓRIA</div>
              <h2 style={{ color: BROWN, fontSize: '24px', fontWeight: '900', margin: '0 0 16px' }}>Feito com amor de verdade 🩷</h2>
              <p style={{ color: '#666', fontSize: '15px', lineHeight: 1.85, margin: '0 0 20px', whiteSpace: 'pre-line' }}>{familia.historia.slice(0, 220)}{familia.historia.length > 220 ? '...' : ''}</p>
              <button onClick={() => setPage('historia')} style={{ ...btnP, width: 'auto', padding: '10px 24px', fontSize: '13px' }}>Ler história completa →</button>
            </div>
          </div>
        </section>
      )}

      {/* ── FOOTER ── */}
      <footer style={{ background: BROWN, color: 'white', padding: '44px 24px 24px' }}>
        <div style={{ maxWidth: '980px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '36px', justifyContent: 'space-between' }}>
          <div style={{ flex: '1 1 200px' }}>
            <div style={{ fontSize: '22px', fontWeight: '900', color: '#ffb3c6', marginBottom: '8px' }}>🧁 Delícias Da Mari</div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>Doces artesanais feitos com amor para adoçar a sua vida.</div>
            <div style={{ marginTop: '14px', display: 'inline-block', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', padding: '8px 14px', fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>
              📍 Atendemos <strong>Osasco e região</strong>
            </div>
          </div>
          <div style={{ flex: '1 1 180px' }}>
            <div style={{ fontWeight: '700', color: '#ffb3c6', marginBottom: '12px', fontSize: '12px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Contato</div>
            {footer.whatsapp && <div style={{ fontSize: '14px', marginBottom: '8px', color: 'rgba(255,255,255,0.8)' }}>📱 {footer.whatsapp}</div>}
            {footer.email    && <div style={{ fontSize: '14px', marginBottom: '8px', color: 'rgba(255,255,255,0.8)' }}>✉️ {footer.email}</div>}
            {footer.bairro   && <div style={{ fontSize: '14px', marginBottom: '8px', color: 'rgba(255,255,255,0.8)' }}>📍 {footer.bairro}</div>}
          </div>
          <div style={{ flex: '1 1 180px' }}>
            <div style={{ fontWeight: '700', color: '#ffb3c6', marginBottom: '12px', fontSize: '12px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Atendimento</div>
            {footer.horario && <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', marginBottom: '16px', lineHeight: 1.7 }}>🕐 {footer.horario}</div>}
            <div style={{ display: 'flex', gap: '14px' }}>
              {footer.instagram && <a href={`https://instagram.com/${footer.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" style={{ color: '#ffb3c6', fontWeight: '700', fontSize: '13px', textDecoration: 'none' }}>📸 Instagram</a>}
              {footer.facebook  && <a href={footer.facebook} target="_blank" rel="noreferrer" style={{ color: '#ffb3c6', fontWeight: '700', fontSize: '13px', textDecoration: 'none' }}>👤 Facebook</a>}
            </div>
          </div>
        </div>
        <div style={{ maxWidth: '980px', margin: '32px auto 0', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '18px', textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>
          © {new Date().getFullYear()} Delícias Da Mari · Feito com 💕
          <br />
          <span style={{ fontSize: '11px', opacity: 0.6 }}>Desenvolvido por Rickflow/Henrique</span>
        </div>
      </footer>

      {/* ── WHATSAPP FLUTUANTE ── */}
      <a
        href={`https://wa.me/${ORDER_WHATSAPP}?text=${getGreeting()}! Gostaria de fazer um pedido 🧁`}
        target="_blank" rel="noreferrer"
        style={{ position: 'fixed', bottom: cart.length > 0 ? '95px' : '24px', right: '20px', background: '#25D366', color: 'white', borderRadius: '50px', padding: '14px 20px', fontWeight: '800', fontSize: '15px', textDecoration: 'none', boxShadow: '0 4px 20px rgba(37,211,102,0.4)', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 99, transition: 'bottom 0.3s' }}
      >
        <span style={{ fontSize: '20px' }}>💬</span> WhatsApp
      </a>

      {/* ── CARRINHO FLUTUANTE ── */}
      {cart.length > 0 && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', borderTop: `3px solid ${PINK}`, padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 -4px 20px rgba(255,133,162,0.15)', zIndex: 98 }}>
          <div>
            <div style={{ fontSize: '12px', color: '#aaa', marginBottom: '2px' }}>{cart.length} {cart.length === 1 ? 'item' : 'itens'} no pedido</div>
            <div style={{ fontWeight: '900', fontSize: '18px', color: PINK }}>R$ {cartTotal.toFixed(2)}</div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setCart([])} style={{ padding: '10px 16px', border: '1px solid #eee', borderRadius: '10px', background: 'white', color: '#aaa', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>Limpar</button>
            <button onClick={finalizeOrder} style={{ ...btnP, width: 'auto', padding: '10px 22px', fontSize: '14px' }}>Pedir pelo WhatsApp 🚀</button>
          </div>
        </div>
      )}

      {/* ── ADMIN PANEL ── */}
      {showAdmin && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }}>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.45)' }} onClick={() => setShowAdmin(false)} />
          <div style={{ width: '370px', maxWidth: '100vw', background: 'white', height: '100%', overflowY: 'auto', boxShadow: '-4px 0 24px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column' }}>

            <div style={{ padding: '20px', background: `linear-gradient(135deg, ${PINK}, #ff6b96)`, color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div>
                <div style={{ fontWeight: '900', fontSize: '16px' }}>⚙️ Painel Admin</div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>Delícias da Mari</div>
              </div>
              <button onClick={() => setShowAdmin(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' }}>✕</button>
            </div>

            <div style={{ display: 'flex', overflowX: 'auto', borderBottom: '1px solid #f0d0da', flexShrink: 0, scrollbarWidth: 'none' } as React.CSSProperties}>
              {ADMIN_TABS.map(({ key, label }) => (
                <button key={key} onClick={() => setAdminTab(key)} style={{ flexShrink: 0, padding: '11px 11px', border: 'none', background: 'none', fontWeight: '700', fontSize: '11px', cursor: 'pointer', color: adminTab === key ? PINK : '#bbb', borderBottom: `2px solid ${adminTab === key ? PINK : 'transparent'}` }}>
                  {label}
                </button>
              ))}
            </div>

            <div style={{ padding: '20px', flex: 1 }}>

              {/* ── TAB PRODUTOS ── */}
              {adminTab === 'produtos' && (
                <div>
                  <span style={lbl}>Novo Produto</span>
                  <input style={inp} placeholder="Nome do produto" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />

                  <Switch
                    on={newProduct.temVariacoes}
                    onToggle={() => setNewProduct({ ...newProduct, temVariacoes: !newProduct.temVariacoes, variacoes: [] })}
                    label="Adicionar variações/tamanhos?"
                    sublabel="Ex: 500ml, 1L, Pequeno, Grande"
                  />

                  {!newProduct.temVariacoes && (
                    <>
                      <input style={inp} placeholder="Preço (ex: 12.50)" type="number" value={newProduct.precoBase} onChange={e => setNewProduct({ ...newProduct, precoBase: e.target.value })} />
                      <input style={inp} placeholder="Unidades disponíveis (0 = Esgotado)" type="number" value={newProduct.estoqueIndividual} onChange={e => setNewProduct({ ...newProduct, estoqueIndividual: e.target.value })} />
                    </>
                  )}

                  {newProduct.temVariacoes && (
                    <div style={{ marginBottom: '10px' }}>
                      <span style={{ ...lbl, marginTop: '4px' }}>Variações</span>
                      {newProduct.variacoes.map((v, i) => (
                        <div key={i} style={{ display: 'flex', gap: '6px', marginBottom: '8px', alignItems: 'center' }}>
                          <input style={{ ...inp, marginBottom: 0, flex: 2 }} placeholder="Nome (ex: 500ml)" value={v.nome}   onChange={e => updateVariacao(i, 'nome',   e.target.value)} />
                          <input style={{ ...inp, marginBottom: 0, flex: 1 }} placeholder="R$"                type="number"   value={v.preco}  onChange={e => updateVariacao(i, 'preco',  e.target.value)} />
                          <input style={{ ...inp, marginBottom: 0, flex: 1 }} placeholder="Qtd"               type="number"   value={v.estoque} onChange={e => updateVariacao(i, 'estoque', e.target.value)} />
                          <button onClick={() => removeVariacao(i)} style={{ background: 'none', border: '1px solid #ffb3c6', color: '#ff4d6d', borderRadius: '8px', padding: '6px 9px', cursor: 'pointer', fontSize: '13px', flexShrink: 0 }}>✕</button>
                        </div>
                      ))}
                      <button onClick={addVariacao} style={{ ...btnP, background: 'none', border: `2px dashed ${PINK}`, color: PINK, padding: '10px', fontSize: '13px' }}>+ Adicionar variação</button>
                    </div>
                  )}

                  <select style={inp} value={newProduct.category || defaultCat} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}>
                    {catNames.length === 0 && <option value="">— Crie categorias primeiro —</option>}
                    {catNames.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input style={inp} placeholder="Link da foto (URL)" value={newProduct.image} onChange={e => setNewProduct({ ...newProduct, image: e.target.value })} />
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', cursor: 'pointer', fontSize: '14px', color: '#555' }}>
                    <input type="checkbox" checked={newProduct.destaque} onChange={e => setNewProduct({ ...newProduct, destaque: e.target.checked })} style={{ width: '18px', height: '18px', accentColor: PINK }} />
                    Marcar como ⭐ Destaque
                  </label>
                  <button style={btnP} onClick={addProduct}>+ Salvar Produto</button>

                  <span style={{ ...lbl, marginTop: '28px' }}>Produtos Cadastrados ({products.length})</span>
                  {products.length === 0 && <p style={{ color: '#ccc', fontSize: '13px' }}>Nenhum produto ainda.</p>}
                  {products.map(p => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #fdeef2' }}>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: p.ativo === false ? '#bbb' : '#333' }}>{p.destaque ? '⭐ ' : ''}{p.name}</div>
                        <div style={{ fontSize: '12px', color: '#aaa' }}>
                          {p.category} · {p.temVariacoes ? `${(p.variacoes || []).length} variações` : `R$ ${Number(p.precoBase ?? p.price).toFixed(2)}`}
                        </div>
                        <div style={{ fontSize: '11px', marginTop: '2px', display: 'flex', gap: '8px' }}>
                          <span style={{ color: getStatus(p) === 'esgotado' ? '#ff4d6d' : '#22c55e', fontWeight: '700' }}>
                            {getStatus(p) === 'esgotado' ? '● Esgotado' : '● Disponível'}
                          </span>
                          <span style={{ color: p.ativo === false ? '#bbb' : PINK, fontWeight: '700' }}>
                            {p.ativo === false ? '🙈 Oculto' : '👁 Visível'}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button onClick={() => toggleDestaque(p)} style={{ color: p.destaque ? '#FFB300' : '#ccc', border: '1px solid #eee', background: 'none', borderRadius: '8px', padding: '4px 8px', fontSize: '14px', cursor: 'pointer' }}>⭐</button>
                        <button onClick={() => toggleAtivo(p)} style={{ color: p.ativo === false ? '#aaa' : PINK, border: `1px solid ${p.ativo === false ? '#eee' : PINK}`, background: 'none', borderRadius: '8px', padding: '4px 7px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>
                          {p.ativo === false ? 'Ativar' : 'Ocultar'}
                        </button>
                        <button onClick={() => db && remove(ref(db, `products/${p.id}`))} style={{ color: '#ff4d6d', border: '1px solid #ff4d6d', background: 'none', borderRadius: '8px', padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── TAB CATEGORIAS ── */}
              {adminTab === 'categorias' && (
                <div>
                  <p style={{ fontSize: '13px', color: '#888', lineHeight: 1.6, marginTop: 0 }}>Crie as categorias do seu cardápio. Elas aparecem como filtros na vitrine.</p>
                  <span style={lbl}>Nova Categoria</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input style={{ ...inp, marginBottom: 0, flex: 1 }} placeholder="Ex: Brigadeiros Gourmet" value={newCategoria} onChange={e => setNewCategoria(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCategoria()} />
                    <button onClick={addCategoria} style={{ ...btnP, width: 'auto', padding: '12px 16px', flexShrink: 0 }}>+</button>
                  </div>
                  <span style={{ ...lbl, marginTop: '28px' }}>Categorias ({categorias.length})</span>
                  {categorias.length === 0 && <p style={{ color: '#ccc', fontSize: '13px' }}>Nenhuma categoria ainda.</p>}
                  {categorias.map(c => (
                    <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: '12px', background: BG, marginBottom: '8px', border: '1px solid #f5d0db' }}>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: '#333' }}>🏷️ {c.nome}</span>
                      <button onClick={() => { const inUse = products.some(p => p.category === c.nome); if (inUse && !window.confirm(`A categoria "${c.nome}" tem produtos. Excluir mesmo assim?`)) return; if (db) remove(ref(db, `categorias/${c.id}`)); }} style={{ color: '#ff4d6d', border: '1px solid #ff4d6d', background: 'none', borderRadius: '8px', padding: '4px 10px', fontSize: '12px', cursor: 'pointer' }}>Excluir</button>
                    </div>
                  ))}
                </div>
              )}

              {/* ── TAB BANNER ── */}
              {adminTab === 'banner' && (
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px', borderRadius: '12px', background: editBanner.ativo ? '#edfff4' : BG, border: `1px solid ${editBanner.ativo ? '#86efac' : '#f0d0da'}`, cursor: 'pointer', marginBottom: '16px' }}>
                    <input type="checkbox" checked={editBanner.ativo} onChange={e => setEditBanner({ ...editBanner, ativo: e.target.checked })} style={{ width: '20px', height: '20px', accentColor: '#22c55e' }} />
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '14px', color: editBanner.ativo ? '#16a34a' : '#aaa' }}>{editBanner.ativo ? '✅ Banner ATIVO' : '⬜ Banner INATIVO'}</div>
                      <div style={{ fontSize: '12px', color: '#aaa' }}>Marque para exibir no site</div>
                    </div>
                  </label>
                  <span style={lbl}>Título do Banner</span>
                  <input style={inp} placeholder="Ex: 🔥 Promoção especial!" value={editBanner.titulo} onChange={e => setEditBanner({ ...editBanner, titulo: e.target.value })} />
                  <span style={lbl}>Texto / Descrição</span>
                  <textarea style={{ ...inp, resize: 'none' }} rows={3} placeholder="Descreva a promoção..." value={editBanner.texto} onChange={e => setEditBanner({ ...editBanner, texto: e.target.value })} />
                  <span style={lbl}>Texto do Botão</span>
                  <input style={inp} placeholder="Ex: Quero aproveitar!" value={editBanner.cta} onChange={e => setEditBanner({ ...editBanner, cta: e.target.value })} />
                  <span style={lbl}>Link do Botão (opcional)</span>
                  <input style={inp} placeholder="https://wa.me/... (vazio = WhatsApp)" value={editBanner.link} onChange={e => setEditBanner({ ...editBanner, link: e.target.value })} />
                  <span style={lbl}>Imagem de Fundo (URL, opcional)</span>
                  <input style={inp} placeholder="https://..." value={editBanner.imagem} onChange={e => setEditBanner({ ...editBanner, imagem: e.target.value })} />
                  <span style={lbl}>Cor de Sobreposição</span>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                    {['#FF85A2', '#6D4C41', '#7C3AED', '#059669', '#DC2626', '#D97706', '#0284C7'].map(cor => (
                      <button key={cor} onClick={() => setEditBanner({ ...editBanner, corFundo: cor })} style={{ width: '36px', height: '36px', borderRadius: '10px', background: cor, border: editBanner.corFundo === cor ? '3px solid #333' : '2px solid transparent', cursor: 'pointer' }} />
                    ))}
                    <input type="color" value={editBanner.corFundo} onChange={e => setEditBanner({ ...editBanner, corFundo: e.target.value })} style={{ width: '36px', height: '36px', borderRadius: '10px', border: '1px solid #eee', cursor: 'pointer', padding: '2px' }} />
                  </div>
                  <div style={{ borderRadius: '14px', overflow: 'hidden', marginBottom: '16px', position: 'relative', minHeight: '100px', background: editBanner.imagem ? 'none' : `linear-gradient(135deg, ${editBanner.corFundo}, ${editBanner.corFundo}cc)` }}>
                    {editBanner.imagem && (
                      <>
                        <img src={editBanner.imagem} alt="preview" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', inset: 0, background: `${editBanner.corFundo}cc` }} />
                      </>
                    )}
                    <div style={{ position: 'relative', padding: '20px', textAlign: 'center' }}>
                      <div style={{ color: 'white', fontWeight: '900', fontSize: '15px', marginBottom: '6px' }}>{editBanner.titulo || 'Título do banner'}</div>
                      <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px', marginBottom: '10px' }}>{editBanner.texto || 'Texto da promoção'}</div>
                      {editBanner.cta && <div style={{ display: 'inline-block', background: 'white', color: editBanner.corFundo, padding: '6px 16px', borderRadius: '20px', fontWeight: '800', fontSize: '12px' }}>{editBanner.cta}</div>}
                    </div>
                  </div>
                  <button style={btnP} onClick={saveBanner}>Salvar Banner</button>
                </div>
              )}

              {/* ── TAB HERO ── */}
              {adminTab === 'hero' && (
                <div>
                  <span style={lbl}>Título Principal</span>
                  <textarea style={{ ...inp, resize: 'none' }} rows={3} value={editHero.titulo} onChange={e => setEditHero({ ...editHero, titulo: e.target.value })} />
                  <span style={lbl}>Subtítulo</span>
                  <textarea style={{ ...inp, resize: 'none' }} rows={3} value={editHero.subtitulo} onChange={e => setEditHero({ ...editHero, subtitulo: e.target.value })} />
                  <span style={lbl}>Texto do Botão</span>
                  <input style={inp} value={editHero.cta} onChange={e => setEditHero({ ...editHero, cta: e.target.value })} />
                  <span style={lbl}>Imagem de Fundo (URL, opcional)</span>
                  <input style={inp} placeholder="https://..." value={editHero.imagem} onChange={e => setEditHero({ ...editHero, imagem: e.target.value })} />
                  <button style={btnP} onClick={saveHero}>Salvar Hero</button>
                </div>
              )}

              {/* ── TAB DEPOIMENTOS ── */}
              {adminTab === 'depoimentos' && (
                <div>
                  <span style={lbl}>Novo Depoimento</span>
                  <input style={inp} placeholder="Nome da cliente" value={newDep.nome} onChange={e => setNewDep({ ...newDep, nome: e.target.value })} />
                  <input style={inp} placeholder="Link da foto da cliente (URL, opcional)" value={newDep.foto} onChange={e => setNewDep({ ...newDep, foto: e.target.value })} />
                  <textarea style={{ ...inp, resize: 'none' }} rows={4} placeholder="O que ela disse..." value={newDep.texto} onChange={e => setNewDep({ ...newDep, texto: e.target.value })} />
                  <span style={{ ...lbl, marginTop: '6px' }}>Estrelas</span>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n} onClick={() => setNewDep({ ...newDep, estrelas: n })} style={{ fontSize: '22px', background: 'none', border: 'none', cursor: 'pointer', opacity: n <= newDep.estrelas ? 1 : 0.25 }}>★</button>
                    ))}
                  </div>
                  <button style={btnP} onClick={addDepoimento}>+ Salvar Depoimento</button>
                  <span style={{ ...lbl, marginTop: '28px' }}>Depoimentos ({depoimentos.length})</span>
                  {depoimentos.length === 0 && <p style={{ color: '#ccc', fontSize: '13px' }}>Nenhum depoimento ainda.</p>}
                  {depoimentos.map(d => (
                    <div key={d.id} style={{ background: BG, borderRadius: '12px', padding: '14px', marginBottom: '10px', border: '1px solid #f5d0db' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Avatar nome={d.nome} foto={d.foto} />
                          <div style={{ fontWeight: '700', fontSize: '13px', color: BROWN }}>{d.nome}</div>
                        </div>
                        <button onClick={() => db && remove(ref(db, `depoimentos/${d.id}`))} style={{ color: '#ff4d6d', border: 'none', background: 'none', cursor: 'pointer', fontSize: '14px' }}>✕</button>
                      </div>
                      <Stars n={d.estrelas} />
                      <p style={{ fontSize: '13px', color: '#666', margin: '6px 0 0', lineHeight: 1.6 }}>"{d.texto}"</p>
                    </div>
                  ))}
                </div>
              )}

              {/* ── TAB FAMÍLIA ── */}
              {adminTab === 'familia' && (
                <div>
                  <span style={lbl}>Foto da Família (URL)</span>
                  <input style={inp} placeholder="https://..." value={editFamilia.foto} onChange={e => setEditFamilia({ ...editFamilia, foto: e.target.value })} />
                  <span style={lbl}>História da Mari</span>
                  <textarea style={{ ...inp, resize: 'none' }} rows={8} placeholder="Conte a história da Mari e da família..." value={editFamilia.historia} onChange={e => setEditFamilia({ ...editFamilia, historia: e.target.value })} />
                  <button style={btnB} onClick={saveFamilia}>Salvar História</button>
                  {(editFamilia.foto || editFamilia.historia) && (
                    <button onClick={() => { if (window.confirm("Remover toda a seção Família?")) { if (db) set(ref(db, 'familia'), { foto: '', historia: '' }); } }} style={{ ...btnB, background: 'none', color: '#ccc', border: '1px solid #eee', marginTop: '10px' }}>Remover seção</button>
                  )}
                </div>
              )}

              {/* ── TAB RODAPÉ ── */}
              {adminTab === 'rodape' && (
                <div>
                  <span style={lbl}>WhatsApp (com DDD)</span>
                  <input style={inp} placeholder="(11) 99999-9999" value={editFooter.whatsapp} onChange={e => setEditFooter({ ...editFooter, whatsapp: e.target.value })} />
                  <span style={lbl}>E-mail</span>
                  <input style={inp} placeholder="contato@email.com" value={editFooter.email} onChange={e => setEditFooter({ ...editFooter, email: e.target.value })} />
                  <span style={lbl}>Bairro / Região de Entrega</span>
                  <input style={inp} placeholder="Ex: Osasco e região — SP" value={editFooter.bairro} onChange={e => setEditFooter({ ...editFooter, bairro: e.target.value })} />
                  <span style={lbl}>Horário de Funcionamento</span>
                  <input style={inp} placeholder="Seg a Sex, das 10h às 18h" value={editFooter.horario} onChange={e => setEditFooter({ ...editFooter, horario: e.target.value })} />
                  <span style={lbl}>Instagram (@usuario)</span>
                  <input style={inp} placeholder="@delicias_da_mari" value={editFooter.instagram} onChange={e => setEditFooter({ ...editFooter, instagram: e.target.value })} />
                  <span style={lbl}>Facebook (link completo)</span>
                  <input style={inp} placeholder="https://facebook.com/..." value={editFooter.facebook} onChange={e => setEditFooter({ ...editFooter, facebook: e.target.value })} />
                  <button style={btnP} onClick={saveFooter}>Salvar Rodapé</button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

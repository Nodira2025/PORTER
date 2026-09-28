import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  Beer,
  MapPin,
  Star,
  Menu as MenuIcon,
  ShoppingBag,
  Plus,
  Minus,
  Check,
  Clock,
  Navigation,
  Car,
  Users,
  Gift,
  CalendarDays,
  ShieldCheck,
  Utensils,
  ChevronDown,
} from "lucide-react";
import { useStore } from "./store";
import { supabase, errorText } from "./lib";
import {
  Brand,
  Button,
  BranchSelect,
  ExternalLink,
  Empty,
  Field,
  Form,
  Modal,
  Photo,
  Badge,
} from "./components";
import { catalogFor, cartTotal, money, dateTime } from "./domain";
import type { Branch, CartLine, Order } from "./types";
import { ReferenceMenu } from "./ReferenceMenu";
import {
  DEMO_EMAIL,
  DEMO_PASSWORD,
  isDemoEmail,
  validateDemoAccess,
} from "./demo-access";

export function PublicShell({ children }: { children: React.ReactNode }) {
  const { demo, path, guest } = useStore();
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  useEffect(() => setOpen(false), [loc.pathname]);
  return (
    <>
      <header className="public-header">
        <div className="container nav-inner">
          <Brand />
          <nav className={open ? "open" : ""}>
            <Link to={path("/carta")}>La carta</Link>
            <Link to={path("/#sucursales")}>Dónde encontrarnos</Link>
            <Link to={path("/club")}>
              Club Porter <span className="tiny-star">✦</span>
            </Link>
            {guest && <Link to={path("/mis-pedidos")}>Mis pedidos</Link>}
          </nav>
          <Link className="button header-cta" to={path("/#sucursales")}>
            Nos vemos en Porter <ArrowUpRight size={16} />
          </Link>
          <button
            className="icon-button mobile-nav"
            aria-label="Abrir navegación"
            onClick={() => setOpen(!open)}
          >
            <MenuIcon />
          </button>
        </div>
      </header>
      {demo && (
        <div className="demo-strip">
          <span>
            DEMO INTERACTIVA · Productos, precios y operaciones de ejemplo.
          </span>
          <Link to="/">
            Salir de la demo <ArrowUpRight size={14} />
          </Link>
        </div>
      )}
      <main id="main">{children}</main>
      <footer className="footer">
        <div className="container footer-grid">
          <Brand />
          <p>
            Buenos encuentros.
            <br />
            Desde 2016, en Tucumán.
          </p>
          <div>
            <ExternalLink href="https://www.instagram.com/porter.brew.house/">
              Instagram
            </ExternalLink>
            <ExternalLink href="https://www.facebook.com/porter.brew.house.barrionorte">
              Facebook
            </ExternalLink>
          </div>
          <div>
            <Link to={path("/equipo")}>Acceso del equipo</Link>
            <Link to="/equipo?demo=1">Explorar el sistema demo</Link>
            <Link to={path("/privacidad")}>Privacidad</Link>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>PORTER BREW HOUSE · TUCUMÁN, ARGENTINA</span>
          <span>
            Tomá con responsabilidad. Venta de alcohol solo a mayores de 18
            años.
          </span>
        </div>
      </footer>
    </>
  );
}
export function Home() {
  const { path } = useStore();
  const loc = useLocation();
  useEffect(() => {
    if (!loc.hash) return;
    const timer = setTimeout(
      () =>
        document
          .getElementById(loc.hash.slice(1))
          ?.scrollIntoView({ behavior: "smooth" }),
      150,
    );
    return () => clearTimeout(timer);
  }, [loc.hash]);
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="eyebrow light">
              <span className="line" /> CERVEZA ARTESANAL. BUENA COMPAÑÍA.
            </div>
            <h1>
              El clásico
              <br />
              al que siempre
              <br />
              <em>volvés.</em>
            </h1>
            <p>
              Una buena birra. Algo rico para compartir.
              <br />Y esa mesa donde la noche se hace larga.
            </p>
            <div className="hero-actions">
              <Link className="button lime" to={path("/carta")}>
                Descubrí nuestra carta <ArrowUpRight size={20} />
              </Link>
              <a className="text-link" href="#sucursales">
                Elegí tu Porter <ArrowRight size={18} />
              </a>
            </div>
            <div className="hero-foot">
              <span>01 / BARRIO NORTE</span>
              <span>02 / YERBA BUENA</span>
            </div>
          </div>
          <div className="hero-visual">
            <img
              className="hero-photo"
              src="/assets/porter-live.jpg"
              alt="Música en vivo en Porter Brew House Barrio Norte"
            />
            <div className="photo-grain" />
            <div className="anniversary-seal">
              <img
                src="/assets/anniversary-logo.jpg"
                alt="Porter Brew House, 10 años"
              />
            </div>
            <div className="photo-label">
              <span>ASÍ SE VIVE PORTER</span>
              <strong>Hay noches que se quedan.</strong>
              <a
                href="https://www.instagram.com/porter.brew.house/p/DaY-Zs-kflR/"
                target="_blank"
                rel="noreferrer"
                aria-label="Ver la publicación de Porter"
              >
                <ArrowUpRight />
              </a>
            </div>
          </div>
        </div>
        <div className="hero-bottom">
          TU CLÁSICO FAVORITO <span>✦</span> DESDE 2016 <span>✦</span> HECHO
          PARA COMPARTIR <span>✦</span> PORTER BREW HOUSE <span>✦</span>
        </div>
      </section>
      <section className="container intro-section" id="historia">
        <div>
          <span className="eyebrow">DIEZ AÑOS DE BUENOS ENCUENTROS</span>
          <h2>
            Cambian las historias.
            <br />
            <em>El punto de encuentro, no.</em>
          </h2>
        </div>
        <div>
          <p>
            Desde junio de 2016, Porter forma parte de las noches tucumanas.
            Cerveza artesanal, gastronomía y la excusa perfecta para
            encontrarnos.
          </p>
          <p>
            En Barrio Norte o en Yerba Buena, siempre hay lugar para una ronda
            más de historias.
          </p>
          <ExternalLink href="https://www.instagram.com/porter.brew.house/p/DZTsV0-EfZb/">
            Nuestra historia sigue
          </ExternalLink>
        </div>
      </section>
      <section className="container experience">
        <div className="section-top">
          <div>
            <span className="eyebrow">EL PLAN ES SIMPLE</span>
            <h2>
              Elegí la compañía.
              <br />
              Nosotros ponemos el resto.
            </h2>
          </div>
          <Link className="text-link" to={path("/carta")}>
            Explorar la carta <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="experience-grid">
          <article className="experience-card beer-card">
            <span className="card-number">01</span>
            <Beer size={78} strokeWidth={1} />
            <div>
              <h3>Una buena pinta.</h3>
              <p>
                Cerveza artesanal y ganas de descubrir
                <br />
                tu próxima favorita.
              </p>
            </div>
            <span className="round-arrow">
              <ArrowUpRight />
            </span>
          </article>
          <article className="experience-card food-card">
            <span className="card-number">02</span>
            <Utensils size={78} strokeWidth={1} />
            <div>
              <h3>Al medio, para todos.</h3>
              <p>
                Burgers, pizzas y algo rico
                <br />
                para compartir la mesa.
              </p>
            </div>
            <span className="round-arrow">
              <ArrowUpRight />
            </span>
          </article>
          <article className="experience-card night-card">
            <img
              src="/assets/porter-night.jpg"
              alt="Encuentros en el aniversario de Porter"
            />
            <div>
              <span className="eyebrow light">03 / EL AMBIENTE</span>
              <h3>Tu gente. Tu lugar.</h3>
            </div>
          </article>
        </div>
      </section>
      <Branches />
      <section className="reviews-section">
        <div className="container">
          <div className="section-top">
            <div>
              <span className="eyebrow">LOS QUE YA VINIERON</span>
              <h2>
                Porter, contado
                <br />
                por su gente.
              </h2>
            </div>
            <p>
              Encontrá experiencias y opiniones
              <br />
              en las fichas de Google Maps.
            </p>
          </div>
          <div className="review-grid">
            {[
              {
                name: "Barrio Norte",
                score: "4,2",
                count: "3.214",
                query: "Porter Brew House Barrio Norte",
              },
              {
                name: "Yerba Buena",
                score: "4,0",
                count: "1.897",
                query: "Porter Brew House Yerba Buena",
              },
            ].map((r) => (
              <a
                key={r.name}
                className="review-card"
                target="_blank"
                rel="noreferrer"
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.query)}`}
              >
                <div className="review-heading">
                  <span className="google-word">
                    Google <span>Maps</span>
                  </span>
                  <ArrowUpRight size={20} />
                </div>
                <h3>{r.name}</h3>
                <div className="rating">
                  <strong>{r.score}</strong>
                  <div>
                    <span className="stars" aria-label={`${r.score} sobre 5`}>
                      ★★★★★
                    </span>
                    <small>{r.count} opiniones en Google</small>
                  </div>
                </div>
                <span className="text-link">
                  Leer las reseñas originales <ArrowRight size={16} />
                </span>
              </a>
            ))}
          </div>
          <small className="source-note">
            Valoraciones consultadas el 25/09/2026. Pueden cambiar. Las reseñas
            completas y sus autores se consultan en Google Maps.
          </small>
        </div>
      </section>
      <section className="container club-banner">
        <div>
          <span className="eyebrow light">EL GUSTO DE VOLVER</span>
          <h2>
            Siempre hay una
            <br />
            buena razón. <em>Club Porter.</em>
          </h2>
          <p>
            Tu espacio para descubrir beneficios y seguir disfrutando de Porter.
          </p>
          <Link className="button lime" to={path("/club")}>
            Conocé el Club <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="member-card">
          <span>
            PORTER <small>BREW HOUSE</small>
          </span>
          <Gift size={44} strokeWidth={1.2} />
          <strong>
            CLÁSICO
            <br />
            DE LA CASA.
          </strong>
          <small>CLUB PORTER · TU PRÓXIMA BUENA HISTORIA</small>
        </div>
      </section>
    </>
  );
}

function BranchCard({ b, index }: { b: Branch; index: number }) {
  const [origin, setOrigin] = useState("");
  const [locating, setLocating] = useState(false);
  const [message, setMessage] = useState("");
  const [showMap, setShowMap] = useState(false);
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(b.address + " Tucumán Argentina")}${origin ? "&origin=" + encodeURIComponent(origin) : ""}`;
  return (
    <article className="branch-card">
      <div className="branch-card-head">
        <span>0{index + 1}</span>
        <MapPin size={25} />
      </div>
      <h3>{b.name}</h3>
      <p>{b.address}</p>
      <div className="branch-links">
        <a href={`tel:+54${b.phone.replace(/\D/g, "").replace(/^0/, "")}`}>
          {b.phone}
        </a>
        {b.reservation_url && (
          <ExternalLink href={b.reservation_url}>Reservar mesa</ExternalLink>
        )}
      </div>
      <div className="travel-panel">
        <label>
          <span>¿Desde dónde venís?</span>
          <input
            aria-label={`Punto de partida para ${b.name}`}
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            placeholder="Ingresá tu dirección"
          />
        </label>
        <Button
          className="ghost"
          disabled={locating}
          onClick={() =>
            new Promise<void>((resolve) => {
              if (!navigator.geolocation) {
                setMessage(
                  "Podés escribir tu dirección para ver el recorrido.",
                );
                resolve();
                return;
              }
              setLocating(true);
              navigator.geolocation.getCurrentPosition(
                (p) => {
                  setOrigin(`${p.coords.latitude},${p.coords.longitude}`);
                  setLocating(false);
                  setMessage(
                    "Ubicación obtenida. Abrí el recorrido para ver cómo llegar.",
                  );
                  resolve();
                },
                () => {
                  setLocating(false);
                  setMessage(
                    "No se pudo obtener tu ubicación. Escribí tu dirección.",
                  );
                  resolve();
                },
                { timeout: 10000, maximumAge: 60000 },
              );
            })
          }
        >
          <Navigation size={15} />
          {locating ? "Buscando ubicación…" : "Usar mi ubicación"}
        </Button>
        {message && <small role="status">{message}</small>}
        <div className="travel-buttons">
          <ExternalLink href={directions} className="button green">
            Cómo llegar
          </ExternalLink>
          <ExternalLink href="https://m.uber.com/" className="button outline">
            <Car size={16} /> Abrir Uber
          </ExternalLink>
        </div>
        <small>
          Elegí esta dirección como destino en Uber para consultar la tarifa y
          confirmar el viaje.
        </small>
        <details>
          <summary>
            Colectivos y transporte público <ChevronDown size={14} />
          </summary>
          <p>{b.transport_note}</p>
          <ExternalLink href={directions + "&travelmode=transit"}>
            Consultar transporte en Maps
          </ExternalLink>
        </details>
      </div>
      <button className="map-toggle" onClick={() => setShowMap(!showMap)}>
        {showMap ? "Ocultar mapa" : "Ver ubicación en el mapa"}{" "}
        <MapPin size={15} />
      </button>
      {showMap && (
        <iframe
          className="branch-map"
          title={`Mapa de Porter ${b.name}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://maps.google.com/maps?q=${encodeURIComponent("Porter Brew House " + b.name + " " + b.address)}&output=embed`}
        />
      )}
    </article>
  );
}
function Branches() {
  const { data } = useStore();
  return (
    <section className="branches-section" id="sucursales">
      <div className="container">
        <div className="section-top">
          <div>
            <span className="eyebrow">CERCA TUYO</span>
            <h2>
              Dos lugares.
              <br />
              <em>El mismo Porter.</em>
            </h2>
          </div>
          <p>
            Elegí tu sucursal y armá el plan.
            <br />
            Nos encontramos allá.
          </p>
        </div>
        <div className="branches-grid">
          {data.branches.map((b, i) => (
            <BranchCard key={b.id} b={b} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function MenuPage({ staffService }: { staffService?: string }) {
  const {
    data,
    demo,
    branch,
    guest,
    path,
    rpc,
    setGuest,
    toast,
    loading,
    error,
    refresh,
  } = useStore();
  const navigate = useNavigate();
  const products = catalogFor(
    data.products,
    data.availability,
    guest && !staffService ? guest.branch_id : branch,
  );
  const [category, setCategory] = useState("Todo");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [note, setNote] = useState("");
  const [method, setMethod] = useState("cash");
  const requestId = useRef(crypto.randomUUID());
  useEffect(() => {
    setCart([]);
    requestId.current = crypto.randomUUID();
  }, [branch, guest?.service_id, staffService]);
  const invalidCart = cart.some(
    (l) => !products.find((p) => p.id === l.product_id)?.available,
  );
  const total = cartTotal(
    cart.filter((l) => products.some((p) => p.id === l.product_id)),
    products,
  );
  const change = (pid: string, delta: number) => {
    requestId.current = crypto.randomUUID();
    setCart((old) => {
      const existing = old.find((l) => l.product_id === pid);
      return existing
        ? old
            .map((l) =>
              l.product_id === pid
                ? { ...l, quantity: Math.min(20, l.quantity + delta) }
                : l,
            )
            .filter((l) => l.quantity > 0)
        : [...old, { product_id: pid, quantity: 1, note: "" }];
    });
  };
  const sampleTable = async () => {
    const t = data.tables.find((t) => t.branch_id === branch)!;
    await rpc("open_table", { p_table: t.id });
    const g = await rpc("join_table", { p_qr: t.qr_token });
    setGuest(g);
    toast("Mesa de demostración abierta. Ya podés enviar un pedido.");
  };
  if (
    !demo &&
    !staffService &&
    !loading &&
    !data.products.some((p) => p.active)
  )
    return (
      <ReferenceMenu standalone existingIds={data.products.map((p) => p.id)} />
    );
  return (
    <section className={staffService ? "" : "container menu-page"}>
      <div className="menu-heading">
        <div>
          <span className="eyebrow">SIEMPRE HAY ALGO PARA COMPARTIR</span>
          <h1>{staffService ? "Tomar un pedido" : "La carta de Porter."}</h1>
          <p>
            {guest && !staffService ? (
              <>
                <span className="connected-dot" /> {guest.label} ·{" "}
                {data.branches.find((b) => b.id === guest.branch_id)?.name}
              </>
            ) : (
              "Elegí tu sucursal y encontrá tu próximo favorito."
            )}
          </p>
        </div>
        <BranchSelect disabled={!!guest || !!staffService} />
      </div>
      {demo && (
        <div className="info-banner">
          <Beer size={20} />
          <span>
            Esta carta es de ejemplo. Los productos, precios y recetas deben
            reemplazarse por los de Porter.
          </span>
          {!guest && !staffService && (
            <Button className="small green" onClick={sampleTable}>
              Probar desde una mesa
            </Button>
          )}
        </div>
      )}
      <div className="menu-toolbar">
        <div className="category-tabs">
          {["Todo", ...new Set(products.map((p) => p.category))].map((c) => (
            <button
              key={c}
              className={category === c ? "selected" : ""}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <input
          className="search-input"
          aria-label="Buscar en la carta"
          placeholder="Buscar algo rico…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {error ? (
        <Empty title="No pudimos actualizar la carta">
          <p>Revisá tu conexión antes de enviar un pedido.</p>
          <Button className="green" onClick={refresh}>
            Reintentar
          </Button>
        </Empty>
      ) : loading ? (
        <Empty title="Buscando la carta…" />
      ) : products.length === 0 ? (
        <Empty title="Estamos preparando la carta digital">
          <p>
            Consultá el menú y los precios vigentes con el personal de Porter.
          </p>
          <a
            className="button green"
            href="https://www.instagram.com/porter.brew.house/"
            target="_blank"
            rel="noreferrer"
          >
            Ver Instagram <ArrowUpRight size={17} />
          </a>
          <Link className="text-link" to="/carta?demo=1">
            Explorar una carta de demostración
          </Link>
        </Empty>
      ) : (
        <div className="product-grid">
          {products
            .filter(
              (p) =>
                (category === "Todo" || p.category === category) &&
                `${p.name} ${p.description}`
                  .toLowerCase()
                  .includes(search.toLowerCase()),
            )
            .map((p) => (
              <article
                className={`product-card ${!p.available ? "unavailable" : ""}`}
                key={p.id}
              >
                <Photo
                  className="product-photo"
                  src={p.image_url}
                  alt={p.name}
                />
                <div className="product-body">
                  <div className="product-category">
                    {p.category}
                    {!p.available && <span>Agotado</span>}
                  </div>
                  <h3>{p.name}</h3>
                  <p>{p.description}</p>
                  <div className="product-tags">
                    {p.tags.map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </div>
                  <div className="product-bottom">
                    <strong>{money(p.price)}</strong>
                    <button
                      className="add-button"
                      disabled={!p.available}
                      aria-label={`Agregar ${p.name}`}
                      onClick={() => change(p.id, 1)}
                    >
                      <Plus size={20} />
                      {cart.find((l) => l.product_id === p.id)?.quantity || ""}
                    </button>
                  </div>
                </div>
              </article>
            ))}
        </div>
      )}
      {!demo && !staffService && !loading && (
        <ReferenceMenu existingIds={data.products.map((p) => p.id)} />
      )}
      {cart.length > 0 && (
        <button className="cart-bar" onClick={() => setCartOpen(true)}>
          <span>
            <ShoppingBag size={19} />
            <b>{cart.reduce((s, l) => s + l.quantity, 0)}</b> Ver mi pedido
          </span>
          <strong>
            {money(total)} <ArrowRight size={18} />
          </strong>
        </button>
      )}
      {cartOpen && (
        <Modal title="Tu pedido" onClose={() => setCartOpen(false)}>
          <p className="muted">
            {demo
              ? "Pedido de demostración · sin cobros reales"
              : (guest?.label ?? "Pedido tomado por el personal")}
          </p>
          <div className="cart-lines">
            {cart.map((l) => {
              const p = products.find((p) => p.id === l.product_id);
              if (!p)
                return (
                  <div className="cart-line" key={l.product_id}>
                    <p>Este producto ya no está en la carta.</p>
                    <Button
                      className="outline"
                      onClick={() =>
                        setCart(
                          cart.filter((x) => x.product_id !== l.product_id),
                        )
                      }
                    >
                      Quitar producto
                    </Button>
                  </div>
                );
              return (
                <div className="cart-line" key={l.product_id}>
                  <div className="cart-line-top">
                    <strong>
                      {p.name}
                      {!p.available && " · Agotado"}
                    </strong>
                    <span>{money(p.price * l.quantity)}</span>
                  </div>
                  <div className="quantity-control">
                    <button
                      aria-label={`Quitar ${p.name}`}
                      onClick={() => change(p.id, -1)}
                    >
                      <Minus size={14} />
                    </button>
                    <span>{l.quantity}</span>
                    <button
                      aria-label={`Sumar ${p.name}`}
                      onClick={() => change(p.id, 1)}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <input
                    placeholder="Aclaración para este producto"
                    aria-label={`Observaciones de ${p.name}`}
                    maxLength={500}
                    value={l.note}
                    onChange={(e) => {
                      requestId.current = crypto.randomUUID();
                      setCart(
                        cart.map((x) =>
                          x.product_id === l.product_id
                            ? { ...x, note: e.target.value }
                            : x,
                        ),
                      );
                    }}
                  />
                </div>
              );
            })}
          </div>
          <Field label="Observaciones para el equipo">
            <textarea
              maxLength={1000}
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                requestId.current = crypto.randomUUID();
              }}
              placeholder="Si tenés una alergia, avisale también al personal."
            />
          </Field>
          <Field label="¿Cómo preferís pagar?">
            <select value={method} onChange={(e) => setMethod(e.target.value)}>
              <option value="cash">Efectivo · confirmar con el personal</option>
              <option value="transfer">Transferencia · validar en caja</option>
            </select>
          </Field>
          <p className="muted small-text">
            Mercado Pago estará disponible cuando Porter configure la pasarela.
            Enviar este pedido no realiza ningún cobro.
          </p>
          <div className="total-line">
            <span>Total estimado</span>
            <strong>{money(total)}</strong>
          </div>
          {!guest && !staffService ? (
            <div className="info-banner">
              Para pedir, escaneá el QR de tu mesa.{" "}
              {demo && (
                <Button className="small green" onClick={sampleTable}>
                  Abrir mesa demo
                </Button>
              )}
            </div>
          ) : (
            <Button
              className="green full"
              disabled={!cart.length || invalidCart || !!error}
              onClick={async () => {
                await rpc("submit_order", {
                  p_items: cart,
                  p_request: requestId.current,
                  p_note: note,
                  p_payment: method,
                  p_guest: staffService ? null : guest?.token,
                  p_service: staffService ?? null,
                });
                setCart([]);
                setCartOpen(false);
                requestId.current = crypto.randomUUID();
                toast("Pedido enviado. El personal lo confirmará.");
                navigate(
                  path(staffService ? "/equipo/pedidos" : "/mis-pedidos"),
                );
              }}
            >
              Enviar pedido <ArrowRight size={18} />
            </Button>
          )}
          {invalidCart && (
            <p className="form-error">
              Quitá los productos agotados o retirados de la carta para
              continuar.
            </p>
          )}
          <small className="source-note">
            El total final se calcula con los precios vigentes al enviar.
          </small>
        </Modal>
      )}
    </section>
  );
}

export function JoinTable() {
  const { qr } = useParams();
  const { rpc, setGuest, path, demo } = useStore();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <section className="container narrow section-pad">
      <span className="eyebrow">BIENVENIDO A TU MESA</span>
      <h1>
        La próxima ronda
        <br />
        empieza acá.
      </h1>
      <p>Abrí la carta de tu mesa para pedir sin crear una cuenta.</p>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <Button
        className="green"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError("");
          try {
            if (!demo && !/^[0-9a-f-]{36}$/i.test(qr ?? ""))
              throw Error("Este QR no corresponde a una mesa válida.");
            const guest = await rpc("join_table", { p_qr: qr });
            setGuest(guest);
            navigate(path("/carta"));
          } catch (e) {
            setError(errorText(e));
          } finally {
            setBusy(false);
          }
        }}
      >
        Comenzar pedido <ArrowRight size={18} />
      </Button>
      <p className="muted">
        El personal debe haber abierto la mesa para esta visita.
      </p>
    </section>
  );
}
export function MyOrders() {
  const { guest, rpc, path } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState("");
  const [transfer, setTransfer] = useState<Order | null>(null);
  const token = guest?.token;
  useEffect(() => {
    if (!token) return;
    let alive = true;
    const load = async () => {
      try {
        const result = await rpc("guest_orders", { p_guest: token });
        if (alive) {
          setOrders(result);
          setError("");
        }
      } catch (e) {
        if (alive) setError(errorText(e));
      }
    };
    void load();
    const t = setInterval(load, 6000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [token]);
  return (
    <section className="container section-pad">
      <div className="section-top">
        <div>
          <span className="eyebrow">TU MESA, AL DÍA</span>
          <h1>Mis pedidos.</h1>
          <p>{guest?.label} · Las novedades se actualizan automáticamente.</p>
        </div>
        <Link className="button green" to={path("/carta")}>
          Pedir algo más <Plus size={17} />
        </Link>
      </div>
      {error && <p className="form-error">{error}</p>}
      {!orders.length ? (
        <Empty title="Todavía no hay pedidos">
          <p>Elegí algo rico en la carta para empezar.</p>
        </Empty>
      ) : (
        <div className="orders-grid">
          {orders.map((o) => (
            <article className="order-card" key={o.id}>
              <div className="order-top">
                <strong>Pedido #{o.number}</strong>
                <Badge status={o.status} />
              </div>
              <small>{dateTime(o.created_at)}</small>
              <ul className="order-lines">
                {o.order_items.map((i) => (
                  <li key={i.id}>
                    <b>{i.quantity}×</b>
                    <span>
                      {i.name}
                      {i.note && <small>{i.note}</small>}
                    </span>
                    <span>{money(i.quantity * i.unit_price)}</span>
                  </li>
                ))}
              </ul>
              <div className="total-line">
                <span>Total</span>
                <strong>{money(o.total)}</strong>
              </div>
              <p className="muted">
                {Number(o.paid) >= Number(o.total)
                  ? "Pago confirmado por caja"
                  : `Saldo por pagar: ${money(Number(o.total) - Number(o.paid ?? 0))}`}
              </p>
              {o.payment_reference && (
                <p className="info-banner">
                  Transferencia informada. Caja debe verificar su acreditación.
                </p>
              )}
              {o.status !== "cancelled" &&
                Number(o.paid ?? 0) < Number(o.total) && (
                  <Button
                    className="outline small"
                    onClick={() => setTransfer(o)}
                  >
                    Informar transferencia
                  </Button>
                )}
            </article>
          ))}
        </div>
      )}
      {transfer && (
        <Modal title="Informar transferencia" onClose={() => setTransfer(null)}>
          <p>
            Solicitá al personal los datos bancarios oficiales. Informar una
            referencia no acredita el pago automáticamente.
          </p>
          <Form
            onSubmit={async (f) => {
              await rpc("report_transfer", {
                p_order: transfer.id,
                p_guest: guest?.token,
                p_reference: String(f.get("reference")),
              });
              setTransfer(null);
            }}
          >
            <Field label="Referencia o número de operación">
              <input name="reference" minLength={3} maxLength={250} required />
            </Field>
            <Button type="submit" className="green full">
              Enviar a caja
            </Button>
          </Form>
        </Modal>
      )}
    </section>
  );
}

export function Access() {
  const { user: realUser, demo, staff, refresh, path, toast } = useStore();
  const user = demo ? null : realUser;
  const [mode, setMode] = useState<"login" | "signup" | "recovery">("login");
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();
  return (
    <section className="auth-layout">
      <div className="auth-art">
        <img src="/assets/porter-live.jpg" alt="Una noche en Porter" />
        <div>
          <span className="eyebrow light">TU CLÁSICO FAVORITO</span>
          <h2>
            Qué bueno
            <br />
            <em>verte de nuevo.</em>
          </h2>
        </div>
      </div>
      <div className="auth-content">
        <Brand />
        {demo && (
          <div className="info-banner">
            <div>
              <strong>Acceso de demostración</strong>
              <p>
                Usuario: {DEMO_EMAIL}
                <br />
                Contraseña: {DEMO_PASSWORD}
              </p>
              <small>
                Datos ficticios guardados en este navegador. No es una cuenta
                real de Supabase.
              </small>
            </div>
          </div>
        )}
        <h1>
          {user
            ? "Tu cuenta"
            : mode === "login"
              ? "Bienvenido a Porter."
              : mode === "signup"
                ? "Sumate al Club."
                : "Recuperá tu acceso."}
        </h1>
        {user ? (
          <>
            <p>Sesión iniciada como {user.email}.</p>
            <Link
              className="button green"
              to={path(staff ? "/equipo" : "/club")}
            >
              Continuar <ArrowRight size={18} />
            </Link>
            <Button
              className="ghost"
              onClick={async () => {
                await supabase?.auth.signOut();
              }}
            >
              Cerrar sesión
            </Button>
          </>
        ) : sent ? (
          <div className="info-banner">
            <Check />
            <p>
              Revisá tu correo para continuar. Si no llega, mirá también la
              carpeta de spam.
            </p>
          </div>
        ) : (
          <Form
            key={demo ? "demo" : mode}
            onSubmit={async (f) => {
              const email = String(f.get("email")).trim();
              if (demo || isDemoEmail(email)) {
                if (mode !== "login")
                  throw Error(
                    "Este usuario es de demostración. Ingresá con la contraseña de prueba.",
                  );
                if (!validateDemoAccess(email, String(f.get("password"))))
                  throw Error("Para la demo usá " + DEMO_EMAIL);
                toast("Ingresaste a la demostración de Porter.");
                navigate("/equipo?demo=1");
                return;
              }
              if (!supabase) throw Error("Conexión no configurada.");
              if (mode === "recovery") {
                const { error } = await supabase.auth.resetPasswordForEmail(
                  email,
                  { redirectTo: location.origin + "/recuperar" },
                );
                if (error) throw error;
                setSent(true);
                return;
              }
              const password = String(f.get("password"));
              const result =
                mode === "login"
                  ? await supabase.auth.signInWithPassword({ email, password })
                  : await supabase.auth.signUp({
                      email,
                      password,
                      options: {
                        emailRedirectTo: location.origin + "/club",
                        data: { display_name: String(f.get("name") ?? "") },
                      },
                    });
              if (result.error) throw result.error;
              if (mode === "signup" && !result.data.session) {
                setSent(true);
                return;
              }
              await refresh();
              toast("Sesión iniciada.");
              navigate("/club");
            }}
          >
            {mode === "signup" && (
              <Field label="Tu nombre">
                <input
                  name="name"
                  autoComplete="name"
                  required
                  maxLength={100}
                />
              </Field>
            )}
            <Field label="Correo electrónico">
              <input
                name="email"
                type="email"
                autoComplete="email"
                defaultValue={demo ? DEMO_EMAIL : undefined}
                required
              />
            </Field>
            {mode !== "recovery" && (
              <Field label="Contraseña">
                <input
                  name="password"
                  type="password"
                  defaultValue={demo ? DEMO_PASSWORD : undefined}
                  minLength={8}
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                  required
                />
              </Field>
            )}
            <Button type="submit" className="green full">
              {mode === "login"
                ? "Ingresar"
                : mode === "signup"
                  ? "Crear mi cuenta"
                  : "Enviar recuperación"}{" "}
              <ArrowRight size={17} />
            </Button>
            {mode === "signup" && (
              <p className="muted small-text">
                Tu cuenta es personal. El acceso del equipo requiere que
                administración asigne un rol.
              </p>
            )}
          </Form>
        )}
        {!user && !demo && (
          <div className="auth-switch">
            <button
              onClick={() => {
                setMode(mode === "signup" ? "login" : "signup");
                setSent(false);
              }}
            >
              {mode === "signup" ? "Ya tengo una cuenta" : "Quiero registrarme"}
            </button>
            <button
              onClick={() => {
                setMode("recovery");
                setSent(false);
              }}
            >
              Olvidé mi contraseña
            </button>
          </div>
        )}
        <Link className="text-link" to={demo ? "/acceso" : "/acceso?demo=1"}>
          {demo
            ? "Ingresar con una cuenta real"
            : "Usar el acceso de demostración"}{" "}
          <ArrowUpRight size={17} />
        </Link>
      </div>
    </section>
  );
}
export function Recovery() {
  const { toast } = useStore();
  const navigate = useNavigate();
  return (
    <section className="container narrow section-pad">
      <h1>Nueva contraseña.</h1>
      <Form
        onSubmit={async (f) => {
          if (!supabase) throw Error("Sin conexión.");
          const { error } = await supabase.auth.updateUser({
            password: String(f.get("password")),
          });
          if (error) throw error;
          toast("Contraseña actualizada.");
          navigate("/acceso");
        }}
      >
        <Field label="Contraseña nueva (8 caracteres o más)">
          <input
            name="password"
            type="password"
            minLength={8}
            required
            autoComplete="new-password"
          />
        </Field>
        <Button type="submit" className="green">
          Guardar contraseña
        </Button>
      </Form>
    </section>
  );
}
export function Club() {
  const { data, demo, user, path, rpc, save, branch, toast } = useStore();
  const [reserve, setReserve] = useState(false);
  const points = data.points.reduce((s, p) => s + p.points, 0);
  return (
    <section className="container club-page">
      <div className="club-intro">
        <div>
          <span className="eyebrow">LAS BUENAS COSTUMBRES TIENEN PREMIO</span>
          <h1>
            Vos ya sos
            <br />
            <em>de la casa.</em>
          </h1>
          <p>Volver, compartir y disfrutar. Tu espacio en Club Porter.</p>
          {!user && !demo && (
            <Link className="button green" to={path("/acceso")}>
              Ingresar o crear mi perfil <ArrowRight size={18} />
            </Link>
          )}
        </div>
        <div className="member-card">
          <span>
            PORTER <small>BREW HOUSE</small>
          </span>
          <strong>
            {user || demo ? points : "—"}{" "}
            <small>PUNTOS {demo ? "DE EJEMPLO" : ""}</small>
          </strong>
          <small>
            {demo
              ? "MIEMBRO DE DEMOSTRACIÓN"
              : user?.user_metadata?.display_name || "CLUB PORTER"}
          </small>
        </div>
      </div>
      {!data.loyalty.enabled && (
        <div className="info-banner">
          <Gift />
          <p>
            Estamos preparando el Club digital. Los beneficios y puntos se
            habilitarán al confirmar las condiciones del programa de Porter.
          </p>
        </div>
      )}
      <div className="section-top">
        <h2>Algo bueno te espera.</h2>
        {(user || demo) && (
          <Button className="outline" onClick={() => setReserve(true)}>
            <CalendarDays size={17} /> Solicitar una reserva
          </Button>
        )}
      </div>
      <div className="rewards-grid">
        {data.rewards
          .filter((r) => r.active)
          .map((r) => (
            <article className="reward-card" key={r.id}>
              <Gift size={34} strokeWidth={1.4} />
              <span className="eyebrow">{r.cost} PUNTOS</span>
              <h3>{r.title}</h3>
              <p>{r.description}</p>
              <Button
                className="green"
                disabled={
                  !data.loyalty.enabled || (!user && !demo) || points < r.cost
                }
                onClick={async () => {
                  await rpc("redeem_reward", { p_reward: r.id });
                  toast("Beneficio canjeado. Mostrá el código al personal.");
                }}
              >
                Canjear beneficio
              </Button>
            </article>
          ))}
      </div>
      {(user || demo) && (
        <div className="club-columns">
          <div className="panel">
            <h3>Mis movimientos</h3>
            {data.points.length ? (
              data.points.map((p) => (
                <div className="simple-row" key={p.id}>
                  <span>{p.reason}</span>
                  <strong>
                    {p.points > 0 ? "+" : ""}
                    {p.points} pts
                  </strong>
                </div>
              ))
            ) : (
              <p className="muted">
                Tus puntos aparecerán después de los consumos acreditados.
              </p>
            )}
          </div>
          <div className="panel">
            <h3>Mis beneficios y reservas</h3>
            {data.claims.map((c) => (
              <div className="voucher" key={c.id}>
                <strong>{c.title}</strong>
                <small>Código: {c.code}</small>
              </div>
            ))}
            {data.reservations.map((r) => (
              <div className="simple-row" key={r.id}>
                <span>
                  {dateTime(r.scheduled_at)} · {r.guests} personas
                </span>
                <Badge status={r.status} />
              </div>
            ))}
            {!data.claims.length && !data.reservations.length && (
              <p className="muted">
                Acá vas a encontrar tus canjes y solicitudes de reserva.
              </p>
            )}
          </div>
        </div>
      )}
      {reserve && (
        <Modal title="Solicitar una reserva" onClose={() => setReserve(false)}>
          <p>
            El equipo confirmará la disponibilidad. La solicitud no garantiza
            una mesa hasta recibir su confirmación.
          </p>
          <Form
            onSubmit={async (f) => {
              const when = new Date(String(f.get("date")));
              if (when <= new Date()) throw Error("Elegí una fecha futura.");
              await save("reservations", {
                id: crypto.randomUUID(),
                customer_id: user?.id,
                branch_id: String(f.get("branch")),
                scheduled_at: when.toISOString(),
                guests: Number(f.get("guests")),
                note: String(f.get("note")),
                status: "requested",
              });
              setReserve(false);
              toast("Solicitud enviada. Esperá la confirmación del equipo.");
            }}
          >
            <Field label="Sucursal">
              <select name="branch" defaultValue={branch}>
                {data.branches.map((b) => (
                  <option value={b.id} key={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Fecha y hora">
              <input type="datetime-local" name="date" required />
            </Field>
            <Field label="Cantidad de personas">
              <input
                name="guests"
                type="number"
                min="1"
                max="30"
                defaultValue="2"
                required
              />
            </Field>
            <Field label="Comentarios">
              <textarea name="note" maxLength={500} />
            </Field>
            <Button type="submit" className="green full">
              Enviar solicitud
            </Button>
          </Form>
        </Modal>
      )}
    </section>
  );
}
export function Privacy() {
  return (
    <section className="container narrow section-pad prose">
      <span className="eyebrow">PORTER DIGITAL</span>
      <h1>Tu privacidad.</h1>
      <p>
        La carta pública puede consultarse sin una cuenta. Para pedidos por QR,
        este sitio conserva en tu navegador un identificador temporal de mesa.
        Al registrarte, Supabase procesa tu correo, credenciales y los datos
        necesarios para tu perfil.
      </p>
      <p>
        La ubicación solo se solicita al tocar “Usar mi ubicación”. Se utiliza
        para abrir el recorrido que elegís en Google Maps y no se guarda en la
        base de Porter. Los enlaces a Google Maps, Uber y redes sociales abren
        servicios externos con sus propias condiciones.
      </p>
      <p>
        La demostración guarda datos ficticios localmente en este navegador y se
        puede reiniciar desde el panel de demostración. No genera pagos ni
        pedidos para el local.
      </p>
      <p>
        Para solicitudes relacionadas con tu cuenta o tus datos, contactá al
        equipo de Porter mediante sus canales oficiales.
      </p>
      <ExternalLink href="https://www.instagram.com/porter.brew.house/">
        Contactar a Porter
      </ExternalLink>
    </section>
  );
}

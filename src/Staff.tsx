import { useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  LayoutDashboard,
  Armchair,
  ClipboardList,
  ChefHat,
  Wallet,
  BookOpen,
  Settings,
  LogOut,
  ArrowUpRight,
  Plus,
  RefreshCw,
  Check,
  Clock,
  QrCode,
  Printer,
  Beer,
  Utensils,
  CalendarDays,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Gift,
  Download,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useStore } from "./store";
import { supabase } from "./lib";
import {
  Brand,
  Button,
  BranchSelect,
  Empty,
  Field,
  Form,
  Modal,
  Badge,
  Photo,
} from "./components";
import {
  balance,
  money,
  dateTime,
  statusLabel,
  youtubeEmbed,
  safeImage,
} from "./domain";
import { MenuPage } from "./Public";
import type { Order, Product, Recipe, Table } from "./types";

const sections = [
  {
    path: "/equipo",
    label: "Resumen",
    icon: LayoutDashboard,
    roles: ["admin", "waiter", "kitchen", "cashier"],
  },
  {
    path: "/equipo/mesas",
    label: "Salón y mesas",
    icon: Armchair,
    roles: ["admin", "waiter", "cashier"],
  },
  {
    path: "/equipo/pedidos",
    label: "Pedidos",
    icon: ClipboardList,
    roles: ["admin", "waiter", "cashier"],
  },
  {
    path: "/equipo/cocina",
    label: "Cocina y barra",
    icon: ChefHat,
    roles: ["admin", "kitchen"],
  },
  {
    path: "/equipo/caja",
    label: "Caja",
    icon: Wallet,
    roles: ["admin", "cashier"],
  },
  {
    path: "/equipo/catalogo",
    label: "Carta y recetas",
    icon: BookOpen,
    roles: ["admin"],
  },
  {
    path: "/equipo/reservas",
    label: "Reservas",
    icon: CalendarDays,
    roles: ["admin", "waiter", "cashier"],
  },
  {
    path: "/equipo/configuracion",
    label: "Administración",
    icon: Settings,
    roles: ["admin"],
  },
];
export function StaffShell() {
  const {
    demo,
    path,
    staff,
    user,
    loading,
    error,
    connection,
    refresh,
    resetDemo,
  } = useStore();
  const loc = useLocation();
  const current = sections.find((s) => s.path === loc.pathname);
  if (loading && !staff)
    return (
      <div className="container section-pad">
        <Empty title="Conectando con Porter…" />
      </div>
    );
  if (!staff)
    return (
      <div className="staff-locked container">
        <Brand />
        <ShieldCheck size={58} strokeWidth={1} />
        <h1>El espacio del equipo.</h1>
        <p>
          {user
            ? "Tu cuenta está registrada. Administración debe asignarte un rol y una sucursal para entrar."
            : "Ingresá con la cuenta que Porter te asignó para trabajar."}
        </p>
        {error && <p className="form-error">{error}</p>}
        <Link className="button green" to="/acceso">
          Ingresar con mi cuenta <ArrowRight size={18} />
        </Link>
        <Link className="button outline" to="/equipo?demo=1">
          Explorar todos los módulos en demo
        </Link>
        <Link className="text-link" to="/">
          Volver a Porter
        </Link>
      </div>
    );
  const allowed =
    loc.pathname === "/equipo/nuevo"
      ? ["admin", "waiter", "cashier"].includes(staff.role)
      : !!current && current.roles.includes(staff.role);
  return (
    <div className="staff-shell">
      <aside className="staff-sidebar">
        <Brand />
        <div className="workspace-label">ESPACIO DEL EQUIPO</div>
        <nav>
          {sections
            .filter((s) => s.roles.includes(staff.role))
            .map((s) => (
              <NavLink
                key={s.path}
                end={s.path === "/equipo"}
                className={({ isActive }) => (isActive ? "active" : "")}
                to={path(s.path)}
              >
                <s.icon size={19} />
                {s.label}
              </NavLink>
            ))}
        </nav>
        <div className="sidebar-bottom">
          <Link to={path("/")}>
            <ArrowUpRight size={17} /> Ver sitio público
          </Link>
          <div className="team-user">
            <div className="avatar">
              {demo ? "P" : user?.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <strong>
                {demo
                  ? "Equipo de prueba"
                  : user?.user_metadata?.display_name || "Equipo Porter"}
              </strong>
              <small>
                {demo
                  ? "Todos los roles · demo"
                  : {
                      admin: "Administración",
                      waiter: "Salón",
                      kitchen: "Cocina",
                      cashier: "Caja",
                    }[staff.role]}
              </small>
            </div>
          </div>
          {demo ? (
            <Button className="ghost light" onClick={resetDemo}>
              <RefreshCw size={15} /> Reiniciar demo
            </Button>
          ) : (
            <Button
              className="ghost light"
              onClick={async () => {
                await supabase?.auth.signOut();
              }}
            >
              <LogOut size={15} /> Cerrar sesión
            </Button>
          )}
        </div>
      </aside>
      <div className="staff-main">
        <header className="staff-header">
          <span>
            PORTER <b>/</b> {current?.label ?? "Tomar pedido"}
          </span>
          <div>
            <span className={`connection ${error ? "offline" : ""}`}>
              <i />
              {demo ? "Demo local" : connection}
            </span>
            <BranchSelect disabled={!!staff.branch_id} />
            <Button className="icon-button" onClick={refresh}>
              <RefreshCw size={17} />
            </Button>
          </div>
        </header>
        {demo && (
          <div className="demo-strip">
            <span>
              DEMO · Todo lo que hagas acá usa datos ficticios guardados en este
              navegador.
            </span>
            <Link to="/equipo">
              Ir al sistema real <ArrowUpRight size={15} />
            </Link>
          </div>
        )}
        {error && !demo && (
          <div role="alert" className="form-error connection-error">
            No se pudo actualizar: {error}. Los datos visibles pueden estar
            desactualizados.
          </div>
        )}
        <div className="staff-content">
          {allowed ? (
            <Outlet />
          ) : (
            <Empty title="Esta sección requiere otro permiso">
              <p>Consultá con administración para revisar tu acceso.</p>
            </Empty>
          )}
        </div>
      </div>
    </div>
  );
}
function useBranchData() {
  const s = useStore();
  return {
    ...s,
    orders: s.data.orders.filter((o) => o.branch_id === s.branch),
    tables: s.data.tables.filter((t) => t.branch_id === s.branch),
    shifts: s.data.shifts.filter((x) => x.branch_id === s.branch),
  };
}
export function Dashboard() {
  const { data, orders, tables, shifts, branch, path, demo, staff } =
    useBranchData();
  const pending = orders.filter((o) => o.status === "pending");
  const active = orders.filter(
    (o) => !["delivered", "cancelled"].includes(o.status),
  );
  const openTables = tables.filter((t) =>
    data.services.some((s) => s.table_id === t.id && !s.closed_at),
  );
  const shift = shifts.find((s) => !s.closed_at);
  const takings = data.payments
    .filter((p) => p.shift_id === shift?.id)
    .reduce((sum, p) => sum + Number(p.amount), 0);
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            {data.branches.find((b) => b.id === branch)?.name.toUpperCase()}
          </span>
          <h1>
            Todo listo para
            <br className="mobile-only" /> una buena noche.
          </h1>
          <p>Un vistazo al salón, los pedidos y la operación de hoy.</p>
        </div>
        {staff?.role !== "kitchen" ? (
          <Link to={path("/equipo/mesas")} className="button green">
            <Plus size={18} /> Tomar un pedido
          </Link>
        ) : (
          <Link to={path("/equipo/cocina")} className="button green">
            <ChefHat size={18} /> Ir a preparación
          </Link>
        )}
      </div>
      <div className="stats-grid">
        {[
          {
            title: "Mesas abiertas",
            value: openTables.length,
            sub: `de ${tables.length} mesas`,
            icon: Armchair,
          },
          {
            title: "Pedidos en curso",
            value: active.length,
            sub: `${pending.length} por confirmar`,
            icon: ClipboardList,
          },
          {
            title: "Listos para retirar",
            value: orders.filter((o) => o.status === "ready").length,
            sub: "Cocina y barra",
            icon: ChefHat,
          },
          {
            title: "Cobros de esta caja",
            value: ["admin", "cashier"].includes(staff?.role ?? "")
              ? money(takings)
              : "—",
            sub: ["admin", "cashier"].includes(staff?.role ?? "")
              ? shift
                ? "Turno abierto"
                : "Caja cerrada"
              : "Consulta disponible en caja",
            icon: Wallet,
          },
        ].map((s) => (
          <div className="stat-card" key={s.title}>
            <div>
              <span>{s.title}</span>
              <s.icon size={20} />
            </div>
            <strong>{s.value}</strong>
            <small>{s.sub}</small>
          </div>
        ))}
      </div>
      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-heading">
            <h2>El salón ahora</h2>
            <Link to={path("/equipo/mesas")}>
              Ver mesas <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="mini-tables">
            {tables.slice(0, 12).map((t) => {
              const open = openTables.some((x) => x.id === t.id);
              return (
                <Link
                  to={path("/equipo/mesas")}
                  className={open ? "occupied" : ""}
                  key={t.id}
                >
                  <Armchair size={22} />
                  <strong>{t.label}</strong>
                  <small>{open ? "En servicio" : "Libre"}</small>
                </Link>
              );
            })}
          </div>
        </section>
        <section className="panel">
          <div className="panel-heading">
            <h2>Últimos pedidos</h2>
            <Link to={path("/equipo/pedidos")}>
              Ver todos <ArrowUpRight size={16} />
            </Link>
          </div>
          {orders.length ? (
            orders.slice(0, 5).map((o) => (
              <div className="recent-order" key={o.id}>
                <span className="order-number">#{o.number}</span>
                <div>
                  <strong>{tableLabel(o, data.services, tables)}</strong>
                  <small>
                    {o.order_items.reduce((s, i) => s + i.quantity, 0)}{" "}
                    productos · {money(o.total)}
                  </small>
                </div>
                <Badge status={o.status} />
              </div>
            ))
          ) : (
            <Empty title="La primera ronda está por venir">
              <p>
                Los pedidos aparecerán acá cuando los envíe una mesa o el
                personal.
              </p>
            </Empty>
          )}
        </section>
      </div>
      {demo && (
        <div className="demo-guide">
          <span className="eyebrow">PROBÁ EL RECORRIDO COMPLETO</span>
          <h3>De la mesa a la caja, en un solo lugar.</h3>
          <div>
            {[
              "Abrí una mesa",
              "Cargá el pedido",
              "Confirmalo en Pedidos",
              "Preparalo en Cocina",
              "Entregá y cobrá",
            ].map((v, i) => (
              <span key={v}>
                <b>{i + 1}</b>
                {v}
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
function tableLabel(
  o: Order,
  services: ReturnType<typeof useStore>["data"]["services"],
  tables: Table[],
) {
  const s = services.find((s) => s.id === o.service_id);
  return tables.find((t) => t.id === s?.table_id)?.label ?? "Mesa cerrada";
}
export function Tables() {
  const { data, tables, orders, rpc, path, demo, toast } = useBranchData();
  const [qr, setQr] = useState<Table | null>(null);
  const navigate = useNavigate();
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">SALÓN</span>
          <h1>Cada mesa, a la vista.</h1>
          <p>
            Abrí una mesa para habilitar sus pedidos y cerrala al terminar el
            servicio.
          </p>
        </div>
        <span className="legend">
          <i /> Disponible <i className="occupied" /> En servicio
        </span>
      </div>
      <div className="tables-grid">
        {tables.map((t) => {
          const session = data.services.find(
            (s) => s.table_id === t.id && !s.closed_at,
          );
          const os = orders.filter(
            (o) => o.service_id === session?.id && o.status !== "cancelled",
          );
          return (
            <article
              className={`table-card ${session ? "occupied" : ""}`}
              key={t.id}
            >
              <div className="table-card-top">
                <Armchair size={28} />
                <button
                  className="icon-button"
                  aria-label={`Ver QR de ${t.label}`}
                  onClick={() => setQr(t)}
                >
                  <QrCode size={20} />
                </button>
              </div>
              <h2>{t.label}</h2>
              <span className="table-state">
                {session ? "En servicio" : "Disponible"}
              </span>
              <p>
                {session
                  ? `${os.length} pedidos · ${money(os.reduce((s, o) => s + Number(o.total), 0))}`
                  : "Lista para recibir una nueva mesa"}
              </p>
              {session ? (
                <div className="stack">
                  <Link
                    className="button green"
                    to={path("/equipo/nuevo?servicio=" + session.id)}
                  >
                    <Plus size={16} /> Tomar pedido
                  </Link>
                  <Button
                    className="outline small"
                    onClick={async () => {
                      await rpc("close_table", { p_service: session.id });
                      toast("Mesa cerrada.");
                    }}
                  >
                    Cerrar mesa
                  </Button>
                </div>
              ) : (
                <Button
                  className="outline full"
                  onClick={async () => {
                    await rpc("open_table", { p_table: t.id });
                    toast(`${t.label} abierta.`);
                  }}
                >
                  Abrir mesa <ArrowRight size={16} />
                </Button>
              )}
            </article>
          );
        })}
      </div>
      {qr && (
        <Modal title={qr.label + " · código QR"} onClose={() => setQr(null)}>
          <div className="qr-print">
            <Brand />
            <h2>{qr.label}</h2>
            <p>{data.branches.find((b) => b.id === qr.branch_id)?.name}</p>
            <QRCodeSVG
              value={location.origin + path("/mesa/" + qr.qr_token)}
              size={230}
              level="M"
              marginSize={3}
            />
            <h3>Escaneá. Elegí. Disfrutá.</h3>
            <p>
              {demo
                ? "QR de demostración, sin pedidos reales."
                : "El personal habilita tu mesa al comenzar la visita."}
            </p>
          </div>
          <div className="form-actions">
            <Button className="outline" onClick={() => window.print()}>
              <Printer size={17} /> Imprimir QR
            </Button>
            <Button
              className="green"
              onClick={() => {
                navigate(path("/mesa/" + qr.qr_token));
              }}
            >
              Abrir como comensal
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
export function NewOrder() {
  const location = useLocation();
  const service = new URLSearchParams(location.search).get("servicio");
  const { data, path } = useStore();
  if (!service || !data.services.some((s) => s.id === service && !s.closed_at))
    return (
      <Empty title="Primero elegí una mesa abierta">
        <Link className="button green" to={path("/equipo/mesas")}>
          Ir al salón
        </Link>
      </Empty>
    );
  return <MenuPage staffService={service} />;
}
export function Orders() {
  const { orders, data, tables, rpc, toast, path } = useBranchData();
  const [filter, setFilter] = useState("active");
  const [cancel, setCancel] = useState<Order | null>(null);
  const filtered = orders.filter(
    (o) =>
      filter === "all" ||
      (filter === "active"
        ? !["delivered", "cancelled"].includes(o.status)
        : o.status === filter),
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">DEL SALÓN A LA COCINA</span>
          <h1>Pedidos, sin perder el hilo.</h1>
          <p>Confirmá los pedidos nuevos y entregá los que ya están listos.</p>
        </div>
        <Link to={path("/equipo/mesas")} className="button green">
          <Plus size={17} /> Nuevo pedido
        </Link>
      </div>
      <div className="filter-tabs">
        {[
          ["active", "En curso"],
          ["pending", "Por confirmar"],
          ["ready", "Listos"],
          ["all", "Todos"],
        ].map(([key, label]) => (
          <button
            key={key}
            className={filter === key ? "selected" : ""}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>
      {!filtered.length ? (
        <Empty title="Todo al día por acá">
          <p>No hay pedidos en este estado.</p>
        </Empty>
      ) : (
        <div className="orders-grid">
          {filtered.map((o) => (
            <article className="order-card" key={o.id}>
              <div className="order-top">
                <span>
                  <strong>#{o.number}</strong> ·{" "}
                  {tableLabel(o, data.services, tables)}
                </span>
                <Badge status={o.status} />
              </div>
              <small>{dateTime(o.created_at)}</small>
              <ul className="order-lines">
                {o.order_items.map((i) => (
                  <li key={i.id}>
                    <b>{i.quantity}×</b>
                    <span>
                      {i.name}
                      {i.note && <small className="item-note">{i.note}</small>}
                    </span>
                    <span>
                      {i.station === "bar" ? (
                        <Beer size={16} />
                      ) : (
                        <Utensils size={16} />
                      )}
                    </span>
                  </li>
                ))}
              </ul>
              {o.note && <div className="order-note">{o.note}</div>}
              <div className="total-line">
                <span>Total</span>
                <strong>{money(o.total)}</strong>
              </div>
              <div className="order-actions">
                {o.status === "pending" && (
                  <Button
                    className="green full"
                    onClick={async () => {
                      await rpc("advance_order", {
                        p_order: o.id,
                        p_status: "accepted",
                      });
                      toast("Pedido confirmado y enviado a cocina y barra.");
                    }}
                  >
                    <Check size={17} /> Confirmar y enviar a preparación
                  </Button>
                )}
                {o.status === "ready" && (
                  <Button
                    className="green full"
                    onClick={async () => {
                      await rpc("advance_order", {
                        p_order: o.id,
                        p_status: "delivered",
                      });
                      toast("Entrega registrada.");
                    }}
                  >
                    Marcar entregado <CheckCircle2 size={18} />
                  </Button>
                )}
                {!["delivered", "cancelled"].includes(o.status) && (
                  <button className="text-danger" onClick={() => setCancel(o)}>
                    Anular pedido
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
      {cancel && (
        <Modal
          title={`Anular pedido #${cancel.number}`}
          onClose={() => setCancel(null)}
        >
          <p>
            El pedido permanecerá en el historial con el motivo. Los pedidos
            cobrados deben resolverse con caja.
          </p>
          <Form
            onSubmit={async (f) => {
              await rpc("advance_order", {
                p_order: cancel.id,
                p_status: "cancelled",
                p_reason: String(f.get("reason")),
              });
              setCancel(null);
              toast("Anulación registrada.");
            }}
          >
            <Field label="Motivo de la anulación">
              <textarea name="reason" minLength={3} required />
            </Field>
            <Button type="submit" className="danger full">
              Registrar anulación
            </Button>
          </Form>
        </Modal>
      )}
    </>
  );
}
export function Kitchen() {
  const { orders, data, tables, rpc } = useBranchData();
  const [station, setStation] = useState("all");
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const active = orders.filter(
    (o) =>
      ["accepted", "preparing", "ready"].includes(o.status) &&
      o.order_items.some((i) => station === "all" || i.station === station),
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">PREPARACIÓN</span>
          <h1>Cada plato, a su tiempo.</h1>
          <p>Tomá cada preparación y avisá al salón cuando esté lista.</p>
        </div>
        <div className="filter-tabs">
          {[
            ["all", "Todo"],
            ["kitchen", "Cocina"],
            ["bar", "Barra"],
          ].map(([v, l]) => (
            <button
              key={v}
              className={station === v ? "selected" : ""}
              onClick={() => setStation(v)}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
      <div className="kitchen-columns">
        {[
          ["accepted", "Por preparar"],
          ["preparing", "En preparación"],
          ["ready", "Listos para retirar"],
        ].map(([state, label]) => (
          <section className={"kitchen-column " + state} key={state}>
            <h2>
              <i />
              {label}
              <span>{active.filter((o) => o.status === state).length}</span>
            </h2>
            {active
              .filter((o) => o.status === state)
              .map((o) => (
                <article className="kitchen-ticket" key={o.id}>
                  <div className="order-top">
                    <strong>
                      #{o.number} · {tableLabel(o, data.services, tables)}
                    </strong>
                    <Clock size={16} />
                  </div>
                  <small>{dateTime(o.created_at)}</small>
                  {o.note && <p className="order-note">{o.note}</p>}
                  {o.order_items
                    .filter((i) => station === "all" || i.station === station)
                    .map((i) => (
                      <div className="kitchen-item" key={i.id}>
                        <h3>
                          {i.quantity}× {i.name}
                        </h3>
                        {i.note && <p className="item-note">{i.note}</p>}
                        <div className="kitchen-item-actions">
                          <Button
                            className="ghost small"
                            onClick={() =>
                              setRecipe(
                                data.recipes.find(
                                  (r) => r.product_id === i.product_id,
                                ) ?? {
                                  product_id: i.product_id,
                                  ingredients: "",
                                  instructions:
                                    "Todavía no hay una receta cargada para este producto.",
                                  video_url: null,
                                },
                              )
                            }
                          >
                            <BookOpen size={14} /> Ver receta
                          </Button>
                          {i.status !== "ready" ? (
                            <Button
                              className={
                                i.status === "pending"
                                  ? "outline small"
                                  : "green small"
                              }
                              onClick={async () => {
                                await rpc("prepare_item", {
                                  p_item: i.id,
                                  p_status:
                                    i.status === "pending"
                                      ? "preparing"
                                      : "ready",
                                });
                                if (i.status === "pending") {
                                  const savedRecipe = data.recipes.find(
                                    (r) => r.product_id === i.product_id,
                                  );
                                  if (savedRecipe) setRecipe(savedRecipe);
                                }
                              }}
                            >
                              {i.status === "pending"
                                ? "Preparar"
                                : "Marcar listo"}
                            </Button>
                          ) : (
                            <span className="badge ready">
                              <Check size={13} /> Listo
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                </article>
              ))}
            {!active.some((o) => o.status === state) && (
              <div className="column-empty">Sin pedidos</div>
            )}
          </section>
        ))}
      </div>
      {recipe && (
        <Modal
          title={
            data.products.find((p) => p.id === recipe.product_id)?.name ??
            "Receta"
          }
          onClose={() => setRecipe(null)}
        >
          <div className="recipe-detail">
            <h3>Ingredientes</h3>
            <p>
              {recipe.ingredients || "Pendientes de cargar por administración."}
            </p>
            <h3>Preparación</h3>
            <p>{recipe.instructions}</p>
            {youtubeEmbed(recipe.video_url) ? (
              <iframe
                title="Video de preparación"
                className="recipe-video"
                src={youtubeEmbed(recipe.video_url)!}
                allow="fullscreen"
              />
            ) : (
              <div className="info-banner">
                El administrador puede incorporar un video de YouTube aprobado
                por cocina.
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
export function Cash() {
  const { orders, data, shifts, branch, rpc, toast } = useBranchData();
  const [modal, setModal] = useState<"open" | "movement" | "close" | null>(
    null,
  );
  const [payment, setPayment] = useState<Order | null>(null);
  const [receipt, setReceipt] = useState<Order | null>(null);
  const [paymentRequest, setPaymentRequest] = useState(crypto.randomUUID());
  const shift = shifts.find((s) => !s.closed_at);
  const payments = data.payments.filter((p) => p.shift_id === shift?.id);
  const movements = data.movements.filter((m) => m.shift_id === shift?.id);
  const cash = payments
    .filter((p) => p.method === "cash")
    .reduce((s, p) => s + Number(p.amount), 0);
  const digital = payments
    .filter((p) => p.method === "transfer")
    .reduce((s, p) => s + Number(p.amount), 0);
  const expected =
    Number(shift?.opening_amount ?? 0) +
    cash +
    movements.reduce((s, m) => s + Number(m.amount), 0);
  const unpaid = orders.filter(
    (o) => o.status !== "cancelled" && balance(o, data.payments) > 0,
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">CAJA Y COBROS</span>
          <h1>Las cuentas, claras.</h1>
          <p>
            {shift
              ? `Caja abierta el ${dateTime(shift.opened_at)}`
              : "Abrí un turno de caja para registrar los cobros del local."}
          </p>
        </div>
        {shift ? (
          <Button className="outline" onClick={() => setModal("close")}>
            Cerrar caja
          </Button>
        ) : (
          <Button className="green" onClick={() => setModal("open")}>
            <Plus size={18} /> Abrir caja
          </Button>
        )}
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <span>Fondo inicial</span>
          <strong>{money(Number(shift?.opening_amount ?? 0))}</strong>
          <small>Al abrir el turno</small>
        </div>
        <div className="stat-card">
          <span>Cobros en efectivo</span>
          <strong>{money(cash)}</strong>
          <small>
            {payments.filter((p) => p.method === "cash").length} registros
          </small>
        </div>
        <div className="stat-card">
          <span>Transferencias confirmadas</span>
          <strong>{money(digital)}</strong>
          <small>Validadas por caja</small>
        </div>
        <div className="stat-card highlight">
          <span>Efectivo esperado</span>
          <strong>{money(expected)}</strong>
          <small>Incluye ingresos y egresos de caja</small>
        </div>
      </div>
      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-heading">
            <h2>Pedidos por cobrar</h2>
            <span>{unpaid.length}</span>
          </div>
          {unpaid.length ? (
            unpaid.map((o) => (
              <div className="cash-order" key={o.id}>
                <div>
                  <strong>Pedido #{o.number}</strong>
                  <small>
                    {statusLabel[o.status]} · {money(balance(o, data.payments))}{" "}
                    pendientes
                  </small>
                  {o.payment_reference && (
                    <small className="item-note">
                      Transferencia informada: {o.payment_reference}
                    </small>
                  )}
                </div>
                <Button
                  className="green small"
                  disabled={!shift}
                  onClick={() => {
                    setPaymentRequest(crypto.randomUUID());
                    setPayment(o);
                  }}
                >
                  Cobrar
                </Button>
              </div>
            ))
          ) : (
            <Empty title="Sin saldos pendientes" />
          )}
        </section>
        <section className="panel">
          <div className="panel-heading">
            <h2>Movimientos de efectivo</h2>
            <Button
              className="outline small"
              disabled={!shift}
              onClick={() => setModal("movement")}
            >
              <Plus size={14} /> Registrar
            </Button>
          </div>
          {movements.length ? (
            movements.map((m) => (
              <div className="simple-row" key={m.id}>
                <span>
                  {m.reason}
                  <small>{dateTime(m.created_at)}</small>
                </span>
                <strong className={m.amount < 0 ? "negative" : ""}>
                  {money(Number(m.amount))}
                </strong>
              </div>
            ))
          ) : (
            <p className="muted">
              Los ingresos y egresos adicionales aparecerán acá con su motivo.
            </p>
          )}
        </section>
      </div>
      <section className="panel margin-top">
        <div className="panel-heading">
          <h2>Cobros registrados</h2>
          <Button
            className="outline small"
            disabled={!payments.length}
            onClick={() =>
              downloadCsv("porter-cobros.csv", [
                ["Fecha", "Pedido", "Medio", "Importe", "Referencia"],
                ...payments.map((p) => [
                  p.created_at,
                  String(
                    orders.find((o) => o.id === p.order_id)?.number ??
                      p.order_id,
                  ),
                  p.method,
                  String(p.amount),
                  p.reference,
                ]),
              ])
            }
          >
            <Download size={14} /> Exportar CSV
          </Button>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Fecha</th>
                <th>Medio</th>
                <th>Importe</th>
                <th>Detalle</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td>
                    #
                    {orders.find((o) => o.id === p.order_id)?.number ??
                      p.order_id.slice(0, 8)}
                  </td>
                  <td>{dateTime(p.created_at)}</td>
                  <td>{p.method === "cash" ? "Efectivo" : "Transferencia"}</td>
                  <td>{money(Number(p.amount))}</td>
                  <td>
                    <button
                      className="text-link"
                      onClick={() =>
                        setReceipt(
                          orders.find((o) => o.id === p.order_id) ?? null,
                        )
                      }
                    >
                      Ver ticket
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      {shifts.some((s) => s.closed_at) && (
        <section className="panel margin-top">
          <h2>Cierres anteriores</h2>
          {shifts
            .filter((s) => s.closed_at)
            .map((s) => (
              <div className="simple-row" key={s.id}>
                <span>
                  {dateTime(s.closed_at!)}
                  <small>
                    Esperado: {money(Number(s.expected_cash))} · Declarado:{" "}
                    {money(Number(s.declared_cash))}
                  </small>
                </span>
                <strong>
                  Diferencia{" "}
                  {money(Number(s.declared_cash) - Number(s.expected_cash))}
                </strong>
              </div>
            ))}
        </section>
      )}
      <p className="muted small-text">
        Los tickets de este módulo son constancias internas. La facturación
        fiscal y Mercado Pago requieren su integración específica.
      </p>
      {payment && (
        <Modal
          title={`Registrar cobro · #${payment.number}`}
          onClose={() => setPayment(null)}
        >
          <p>
            Saldo pendiente:{" "}
            <strong>{money(balance(payment, data.payments))}</strong>
          </p>
          <Form
            onSubmit={async (f) => {
              await rpc("register_payment", {
                p_order: payment.id,
                p_amount: Number(f.get("amount")),
                p_method: String(f.get("method")),
                p_reference: String(f.get("reference")),
                p_request: paymentRequest,
              });
              setPayment(null);
              toast("Cobro confirmado y registrado en caja.");
            }}
          >
            <Field label="Importe recibido">
              <input
                name="amount"
                type="number"
                min="0.01"
                step="0.01"
                max={balance(payment, data.payments)}
                defaultValue={balance(payment, data.payments)}
                required
              />
            </Field>
            <Field label="Medio de pago">
              <select name="method">
                <option value="cash">Efectivo</option>
                <option value="transfer">Transferencia verificada</option>
              </select>
            </Field>
            <Field label="Referencia (obligatoria para transferencia)">
              <input
                name="reference"
                defaultValue={payment.payment_reference}
                maxLength={250}
              />
            </Field>
            <label className="checkbox-label">
              <input type="checkbox" required /> Verifiqué que el dinero fue
              recibido o acreditado.
            </label>
            <Button type="submit" className="green full">
              Confirmar cobro
            </Button>
          </Form>
        </Modal>
      )}
      {modal && (
        <Modal
          title={
            {
              open: "Abrir caja",
              movement: "Movimiento de efectivo",
              close: "Cerrar caja",
            }[modal]
          }
          onClose={() => setModal(null)}
        >
          <Form
            onSubmit={async (f) => {
              if (modal === "open") {
                await rpc("open_shift", {
                  p_branch: branch,
                  p_amount: Number(f.get("amount")),
                });
                toast("Caja abierta.");
              }
              if (modal === "movement") {
                const sign = f.get("kind") === "expense" ? -1 : 1;
                await rpc("add_cash_movement", {
                  p_shift: shift!.id,
                  p_amount: Number(f.get("amount")) * sign,
                  p_reason: String(f.get("reason")),
                });
                toast("Movimiento registrado.");
              }
              if (modal === "close") {
                const diff = await rpc("close_shift", {
                  p_shift: shift!.id,
                  p_declared: Number(f.get("amount")),
                });
                toast(`Caja cerrada. Diferencia: ${money(Number(diff))}.`);
              }
              setModal(null);
            }}
          >
            {modal === "movement" && (
              <Field label="Tipo de movimiento">
                <select name="kind">
                  <option value="expense">Egreso de efectivo</option>
                  <option value="income">Ingreso de efectivo</option>
                </select>
              </Field>
            )}
            {modal === "close" && (
              <p>
                Efectivo esperado: <strong>{money(expected)}</strong>. Contá el
                efectivo físico y registrá el importe encontrado.
              </p>
            )}
            <Field
              label={
                modal === "open"
                  ? "Fondo inicial"
                  : modal === "close"
                    ? "Efectivo contado"
                    : "Importe"
              }
            >
              <input
                name="amount"
                type="number"
                step="0.01"
                min={modal === "movement" ? "0.01" : "0"}
                required
              />
            </Field>
            {modal === "movement" && (
              <Field label="Motivo">
                <input name="reason" minLength={3} required />
              </Field>
            )}
            <Button type="submit" className="green full">
              {modal === "close" ? "Confirmar cierre" : "Guardar"}
            </Button>
          </Form>
        </Modal>
      )}
      {receipt && (
        <Modal
          title={`Ticket interno #${receipt.number}`}
          onClose={() => setReceipt(null)}
        >
          <div className="qr-print receipt">
            <Brand />
            <h3>Constancia interna · No válida como factura</h3>
            <p>{dateTime(receipt.created_at)}</p>
            {receipt.order_items.map((i) => (
              <div className="simple-row" key={i.id}>
                <span>
                  {i.quantity}× {i.name}
                </span>
                <span>{money(i.quantity * i.unit_price)}</span>
              </div>
            ))}
            <div className="total-line">
              <span>Total</span>
              <strong>{money(receipt.total)}</strong>
            </div>
            <p>Saldo: {money(balance(receipt, data.payments))}</p>
          </div>
          <Button className="green" onClick={() => window.print()}>
            <Printer size={17} /> Imprimir ticket
          </Button>
        </Modal>
      )}
    </>
  );
}
function downloadCsv(name: string, rows: string[][]) {
  const content =
    "\uFEFF" +
    rows
      .map((row) =>
        row
          .map(
            (v) =>
              '"' +
              String(v)
                .replace(/^[=+@-]/, "'$&")
                .replaceAll('"', '""') +
              '"',
          )
          .join(";"),
      )
      .join("\r\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(
    new Blob([content], { type: "text/csv;charset=utf-8" }),
  );
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export function Catalog() {
  const { data, branch, save, toast } = useStore();
  const [edit, setEdit] = useState<Product | null>(null);
  const [search, setSearch] = useState("");
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">ADMINISTRACIÓN DE CONTENIDOS</span>
          <h1>La carta, siempre al día.</h1>
          <p>
            Productos, precios por sucursal, disponibilidad y recetas privadas
            para cocina.
          </p>
        </div>
        <Button
          className="green"
          onClick={() =>
            setEdit({
              id: crypto.randomUUID(),
              name: "",
              description: "",
              category: "Cervezas",
              price: 0,
              image_url: null,
              station: "bar",
              active: true,
              tags: [],
            })
          }
        >
          <Plus size={17} /> Nuevo producto
        </Button>
      </div>
      <input
        className="search-input"
        placeholder="Buscar producto…"
        aria-label="Buscar producto para editar"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="panel margin-top">
        {data.products
          .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
          .map((p) => {
            const a = data.availability.find(
              (a) => a.product_id === p.id && a.branch_id === branch,
            );
            return (
              <div className="catalog-row" key={p.id}>
                <Photo
                  src={p.image_url}
                  className="catalog-thumb"
                  alt={p.name}
                />
                <div>
                  <h3>{p.name}</h3>
                  <small>
                    {p.category} · {p.station === "bar" ? "Barra" : "Cocina"}
                    {!p.active ? " · Oculto en la carta" : ""}
                  </small>
                </div>
                <strong>{money(Number(a?.price_override ?? p.price))}</strong>
                <label className="availability-toggle">
                  <input
                    type="checkbox"
                    checked={a?.available ?? true}
                    onChange={(e) => {
                      void save("branch_products", {
                        branch_id: branch,
                        product_id: p.id,
                        available: e.target.checked,
                        price_override: a?.price_override ?? null,
                      })
                        .then(() => toast("Disponibilidad actualizada."))
                        .catch((e) => toast(e.message));
                    }}
                  />
                  Disponible aquí
                </label>
                <Button className="outline small" onClick={() => setEdit(p)}>
                  Editar
                </Button>
              </div>
            );
          })}
        {!data.products.length && (
          <Empty title="La carta está lista para tus productos">
            <p>
              Cargá la carta validada por Porter. Solo los productos activos
              serán visibles.
            </p>
          </Empty>
        )}
      </div>
      {edit && <ProductEditor product={edit} onClose={() => setEdit(null)} />}
    </>
  );
}
function ProductEditor({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const { data, branch, save, toast } = useStore();
  const recipe = data.recipes.find((r) => r.product_id === product.id);
  const a = data.availability.find(
    (a) => a.product_id === product.id && a.branch_id === branch,
  );
  return (
    <Modal
      title={product.name ? "Editar producto" : "Nuevo producto"}
      onClose={onClose}
    >
      <Form
        onSubmit={async (f) => {
          const image = String(f.get("image")).trim();
          const video = String(f.get("video")).trim();
          if (image && !safeImage(image))
            throw Error("La imagen debe usar una dirección HTTPS válida.");
          if (video && !youtubeEmbed(video))
            throw Error("Usá un enlace válido a un video de YouTube.");
          await save("products", {
            ...product,
            name: String(f.get("name")).trim(),
            description: String(f.get("description")),
            category: String(f.get("category")),
            price: Number(f.get("price")),
            image_url: image || null,
            station: String(f.get("station")),
            active: f.get("active") === "on",
            tags: String(f.get("tags"))
              .split(",")
              .map((v) => v.trim())
              .filter(Boolean),
          });
          await save("branch_products", {
            branch_id: branch,
            product_id: product.id,
            available: a?.available ?? true,
            price_override: f.get("override")
              ? Number(f.get("override"))
              : null,
          });
          await save("recipes", {
            product_id: product.id,
            ingredients: String(f.get("ingredients")),
            instructions: String(f.get("instructions")),
            video_url: video || null,
          });
          toast("Producto, disponibilidad y receta guardados.");
          onClose();
        }}
      >
        <div className="form-grid">
          <Field label="Nombre">
            <input
              name="name"
              defaultValue={product.name}
              minLength={2}
              maxLength={120}
              required
            />
          </Field>
          <Field label="Categoría">
            <input
              name="category"
              defaultValue={product.category}
              list="categories"
              required
            />
            <datalist id="categories">
              {[
                "Cervezas",
                "Burgers",
                "Para compartir",
                "Pizzas",
                "Tragos",
                "Sin alcohol",
                "Postres",
              ].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </datalist>
          </Field>
        </div>
        <Field label="Descripción pública">
          <textarea
            name="description"
            defaultValue={product.description}
            maxLength={1500}
          />
        </Field>
        <div className="form-grid">
          <Field label="Precio general (ARS)">
            <input
              type="number"
              step="0.01"
              min="0.01"
              name="price"
              defaultValue={product.price || ""}
              required
            />
          </Field>
          <Field label="Precio en esta sucursal (opcional)">
            <input
              type="number"
              step="0.01"
              min="0.01"
              name="override"
              defaultValue={a?.price_override ?? ""}
            />
          </Field>
        </div>
        <Field label="Dirección de la imagen (HTTPS)">
          <input
            name="image"
            defaultValue={product.image_url ?? ""}
            placeholder="https://…"
          />
        </Field>
        <Field label="Etiquetas separadas por coma">
          <input name="tags" defaultValue={product.tags.join(", ")} />
        </Field>
        <div className="form-grid">
          <Field label="Preparación a cargo de">
            <select name="station" defaultValue={product.station}>
              <option value="bar">Barra</option>
              <option value="kitchen">Cocina</option>
            </select>
          </Field>
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="active"
              defaultChecked={product.active}
            />{" "}
            Visible en la carta
          </label>
        </div>
        <div className="form-divider">
          <BookOpen size={18} /> Receta interna · solo para el equipo
        </div>
        <Field label="Ingredientes y cantidades">
          <textarea
            name="ingredients"
            defaultValue={recipe?.ingredients}
            rows={3}
          />
        </Field>
        <Field label="Pasos de preparación">
          <textarea
            name="instructions"
            defaultValue={recipe?.instructions}
            rows={5}
          />
        </Field>
        <Field label="Video de YouTube aprobado por cocina">
          <input
            name="video"
            defaultValue={recipe?.video_url ?? ""}
            placeholder="https://www.youtube.com/watch?v=…"
          />
        </Field>
        <Button type="submit" className="green full">
          Guardar producto y receta
        </Button>
      </Form>
    </Modal>
  );
}
export function Reservations() {
  const { data, branch, save, toast } = useStore();
  const reservations = data.reservations.filter((r) => r.branch_id === branch);
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">PLANIFICAR EL SALÓN</span>
          <h1>Una mesa para encontrarse.</h1>
          <p>
            Revisá las solicitudes del Club y confirmá la disponibilidad con el
            cliente.
          </p>
        </div>
      </div>
      <div className="orders-grid">
        {reservations.map((r) => (
          <article className="order-card" key={r.id}>
            <div className="order-top">
              <CalendarDays />
              <Badge status={r.status} />
            </div>
            <h2>{dateTime(r.scheduled_at)}</h2>
            <p>{r.guests} personas</p>
            <p>{r.note}</p>
            {r.status === "requested" && (
              <div className="form-actions">
                <Button
                  className="green"
                  onClick={async () => {
                    await save("reservations", { ...r, status: "confirmed" });
                    toast("Reserva confirmada.");
                  }}
                >
                  Confirmar
                </Button>
                <Button
                  className="outline"
                  onClick={async () => {
                    await save("reservations", { ...r, status: "cancelled" });
                    toast("Solicitud cancelada.");
                  }}
                >
                  No disponible
                </Button>
              </div>
            )}
          </article>
        ))}
      </div>
      {!reservations.length && (
        <Empty title="Todavía no hay solicitudes de reserva" />
      )}
    </>
  );
}
export function SettingsPage() {
  const { data, branch, save, demo, toast } = useStore();
  const b = data.branches.find((b) => b.id === branch)!;
  const [reward, setReward] = useState(false);
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">ADMINISTRACIÓN</span>
          <h1>Porter, a tu manera.</h1>
          <p>Configuración de sucursales y reglas del Club.</p>
        </div>
      </div>
      <div className="settings-grid">
        <section className="panel">
          <h2>{b.name}</h2>
          <Form
            key={b.id}
            onSubmit={async (f) => {
              const enabled = f.get("enabled") === "on";
              if (enabled && !data.products.some((p) => p.active))
                throw Error(
                  "Cargá al menos un producto activo antes de habilitar los pedidos.",
                );
              await save("branches", {
                ...b,
                address: String(f.get("address")),
                phone: String(f.get("phone")),
                transport_note: String(f.get("transport")),
                ordering_enabled: enabled,
              });
              toast("Sucursal actualizada.");
            }}
          >
            <Field label="Dirección">
              <input name="address" defaultValue={b.address} required />
            </Field>
            <Field label="Teléfono">
              <input name="phone" defaultValue={b.phone} />
            </Field>
            <Field label="Colectivos y paradas verificadas">
              <textarea name="transport" defaultValue={b.transport_note} />
            </Field>
            <label className="checkbox-label">
              <input
                name="enabled"
                type="checkbox"
                defaultChecked={b.ordering_enabled}
              />{" "}
              Habilitar pedidos digitales en esta sucursal
            </label>
            <p className="muted small-text">
              Habilitalos después de validar carta, precios, personal y mesas.
            </p>
            <Button type="submit" className="green">
              Guardar sucursal
            </Button>
          </Form>
        </section>
        <section className="panel">
          <h2>Reglas de Club Porter</h2>
          <p className="muted">
            Confirmá estas reglas con el programa existente antes de activarlas.
          </p>
          <Form
            onSubmit={async (f) => {
              await save("loyalty_settings", {
                id: true,
                enabled: f.get("enabled") === "on",
                pesos_per_point: Number(f.get("rate")),
              });
              toast("Reglas de puntos actualizadas.");
            }}
          >
            <Field label="Pesos consumidos por punto">
              <input
                name="rate"
                type="number"
                min="1"
                step="1"
                defaultValue={data.loyalty.pesos_per_point}
                required
              />
            </Field>
            <label className="checkbox-label">
              <input
                name="enabled"
                type="checkbox"
                defaultChecked={data.loyalty.enabled}
              />{" "}
              Activar acumulación y canje de puntos
            </label>
            <p className="muted small-text">
              Los puntos se acreditan una sola vez cuando el pedido asociado al
              cliente queda completamente pagado.
            </p>
            <Button type="submit" className="green">
              Guardar reglas
            </Button>
          </Form>
          <div className="form-divider">Beneficios</div>
          {data.rewards.map((r) => (
            <div className="simple-row" key={r.id}>
              <span>
                {r.title}
                <small>{r.cost} puntos</small>
              </span>
              <Button
                className="ghost small"
                onClick={async () => {
                  await save("rewards", { ...r, active: !r.active });
                  toast("Beneficio actualizado.");
                }}
              >
                {r.active ? "Desactivar" : "Activar"}
              </Button>
            </div>
          ))}
          <Button
            className="outline small margin-top"
            onClick={() => setReward(true)}
          >
            <Plus size={16} /> Nuevo beneficio
          </Button>
        </section>
      </div>
      <section className="panel margin-top">
        <h2>Conexiones del sistema</h2>
        <div className="integration-grid">
          {[
            {
              name: "Base de datos",
              state: demo ? "Demo local" : "Supabase configurado",
              text: "Pedidos y accesos protegidos por rol y sucursal.",
            },
            {
              name: "Mercado Pago",
              state: "Pendiente de configurar",
              text: "Requiere credenciales del comercio y validación de notificaciones de pago.",
            },
            {
              name: "Facturación fiscal",
              state: "Pendiente de integrar",
              text: "La caja registra cobros. Los tickets son constancias internas.",
            },
            {
              name: "Reseñas de Google",
              state: "Enlace a la fuente",
              text: "Importación de autores y fotografías pendiente de una integración autorizada.",
            },
          ].map((i) => (
            <div key={i.name}>
              <h3>{i.name}</h3>
              <span className="badge">{i.state}</span>
              <p>{i.text}</p>
            </div>
          ))}
        </div>
        <h3>Acceso del personal</h3>
        <p className="muted">
          Cada integrante se registra con su correo. El primer administrador
          debe asignarse en Supabase con su identidad exacta; los roles posibles
          son administración, salón, cocina y caja. Las cuentas nuevas no
          reciben permisos internos automáticamente.
        </p>
      </section>
      {reward && (
        <Modal title="Nuevo beneficio" onClose={() => setReward(false)}>
          <Form
            onSubmit={async (f) => {
              await save("rewards", {
                id: crypto.randomUUID(),
                title: String(f.get("title")),
                description: String(f.get("description")),
                cost: Number(f.get("cost")),
                active: true,
              });
              setReward(false);
              toast("Beneficio guardado.");
            }}
          >
            <Field label="Nombre del beneficio">
              <input name="title" required />
            </Field>
            <Field label="Descripción y condiciones">
              <textarea name="description" required />
            </Field>
            <Field label="Puntos necesarios">
              <input name="cost" type="number" min="1" step="1" required />
            </Field>
            <Button type="submit" className="green full">
              Crear beneficio
            </Button>
          </Form>
        </Modal>
      )}
    </>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Clock,
  MapPin,
  ClipboardList,
  LogOut,
  UserRound,
  Beer,
} from "lucide-react";
import { useStore } from "./store";
import { Brand, BranchSelect, Button, Modal } from "./components";
import { supabase } from "./lib";
import { DEMO_EMAIL } from "./demo-access";

const workspaces = {
  admin: {
    label: "Administración",
    route: "/equipo/resumen",
    text: "El salón, la cocina y cada detalle. Todo en tus manos.",
  },
  waiter: {
    label: "Salón",
    route: "/equipo/mesas",
    text: "Cada mesa, una buena historia. Prepará el próximo encuentro.",
  },
  kitchen: {
    label: "Cocina y barra",
    route: "/equipo/cocina",
    text: "El sabor de Porter empieza con vos. Vamos a preparar la próxima ronda.",
  },
  cashier: {
    label: "Caja",
    route: "/equipo/caja",
    text: "Las cuentas claras para cerrar una gran noche.",
  },
};

export function StaffWelcome() {
  const { user, staff, demo, path, data, branch, error } = useStore();
  const [now, setNow] = useState(() => new Date());
  const [profile, setProfile] = useState(false);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  if (!staff) return null;
  const workspace = workspaces[staff.role];
  const name = demo
    ? "Equipo de prueba"
    : user?.user_metadata?.display_name ||
      user?.email?.split("@")[0] ||
      "Equipo Porter";
  const email = demo ? DEMO_EMAIL : user?.email;
  const hour = Number(
    new Intl.DateTimeFormat("es-AR", {
      hour: "numeric",
      hourCycle: "h23",
      timeZone: "America/Argentina/Tucuman",
    }).format(now),
  );
  const greeting =
    hour < 12 ? "Buen día." : hour < 20 ? "Buenas tardes." : "Buenas noches.";
  const orders = data.orders.filter(
    (o) =>
      o.branch_id === branch && !["cancelled", "delivered"].includes(o.status),
  );
  return (
    <main className="porter-welcome" id="main">
      <div className="welcome-wallpaper" aria-hidden="true" />
      <header className="welcome-header">
        <Brand />
        <span>
          BUENOS ENCUENTROS.
          <br />
          UN GRAN EQUIPO.
        </span>
      </header>
      <section
        className="welcome-status"
        aria-label="Estado del espacio de trabajo"
      >
        <div>
          <Clock size={22} />
          <div>
            <strong>
              <time>
                {now.toLocaleTimeString("es-AR", {
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "America/Argentina/Tucuman",
                })}
              </time>
            </strong>
            <small>
              {now.toLocaleDateString("es-AR", {
                weekday: "short",
                day: "numeric",
                month: "long",
                timeZone: "America/Argentina/Tucuman",
              })}{" "}
              · Tucumán
            </small>
          </div>
        </div>
        <div>
          <MapPin size={22} />
          <div>
            <small>TU SUCURSAL</small>
            <BranchSelect disabled={!!staff.branch_id} />
          </div>
        </div>
        <div>
          <ClipboardList size={22} />
          <div>
            <strong>
              {error ? "Sin actualizar" : `${orders.length} en curso`}
            </strong>
            <small>
              {demo ? "Pedidos de demostración" : "Pedidos de la sucursal"}
            </small>
          </div>
        </div>
      </section>
      <section className="welcome-person">
        <span className="welcome-kicker">EL ESPACIO DEL EQUIPO</span>
        <p className="welcome-greeting">{greeting}</p>
        <h1>{name}.</h1>
        <p className="welcome-description">{workspace.text}</p>
        <div className="welcome-avatar" aria-hidden="true">
          {String(name)
            .split(" ")
            .slice(0, 2)
            .map((n) => n.charAt(0))
            .join("")
            .toUpperCase()}
        </div>
        <Button className="welcome-profile" onClick={() => setProfile(true)}>
          <UserRound size={14} /> Mi perfil
        </Button>
        <span className="welcome-role">
          {workspace.label}
          {demo ? " · DEMO" : ""}
        </span>
        <Link className="welcome-start" to={path(workspace.route)}>
          Iniciar <ArrowRight size={24} />
        </Link>
        <small>
          {demo
            ? "Datos ficticios. Las pruebas se guardan solo en este navegador."
            : "Entrá a tus herramientas y empezá el turno."}
        </small>
        {error && (
          <p className="welcome-error" role="alert">
            No se pudieron actualizar los datos. {error}
          </p>
        )}
      </section>
      <footer className="welcome-footer">
        <span>
          <Beer size={16} /> PORTER BREW HOUSE <b>·</b> DESDE 2016
        </span>
        {demo ? (
          <Link to="/">
            Salir de la demo <LogOut size={15} />
          </Link>
        ) : (
          <Button
            onClick={async () => {
              await supabase?.auth.signOut();
            }}
          >
            <LogOut size={15} /> Cerrar sesión
          </Button>
        )}
      </footer>
      {profile && (
        <Modal title="Mi perfil" onClose={() => setProfile(false)}>
          <dl className="welcome-profile-details">
            <dt>Nombre</dt>
            <dd>{name}</dd>
            <dt>Correo</dt>
            <dd>{email}</dd>
            <dt>Rol</dt>
            <dd>{workspace.label}</dd>
            <dt>Sucursal</dt>
            <dd>{data.branches.find((b) => b.id === branch)?.name}</dd>
          </dl>
          <p>
            Los roles y permisos los administra Porter.
            {demo ? " Este perfil pertenece a la demostración." : ""}
          </p>
        </Modal>
      )}
    </main>
  );
}

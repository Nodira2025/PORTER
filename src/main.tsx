import React, { Component, type ReactNode } from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  Link,
  useLocation,
} from "react-router-dom";
import { StoreProvider } from "./store";
import {
  PublicShell,
  Home,
  MenuPage,
  JoinTable,
  MyOrders,
  Access,
  Club,
  Privacy,
  Recovery,
} from "./Public";
import {
  StaffShell,
  Dashboard,
  Tables,
  Orders,
  Kitchen,
  Cash,
  Catalog,
  SettingsPage,
  NewOrder,
  Reservations,
} from "./Staff";
import "./styles.css";
import "./porter-brand.css";
class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: boolean }
> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? (
      <div className="container section-pad">
        <h1>Necesitamos volver a cargar.</h1>
        <p>
          La aplicación encontró un problema. Tus operaciones confirmadas
          permanecen guardadas.
        </p>
        <button className="button green" onClick={() => location.reload()}>
          Volver a cargar
        </button>
      </div>
    ) : (
      this.props.children
    );
  }
}
function ScrollReset() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <StoreProvider>
          <ScrollReset />
          <a className="skip-link" href="#main">
            Ir al contenido
          </a>
          <Routes>
            <Route
              element={
                <PublicShell>
                  <Outlet />
                </PublicShell>
              }
            >
              <Route path="/" element={<Home />} />
              <Route path="/carta" element={<MenuPage />} />
              <Route path="/mesa/:qr" element={<JoinTable />} />
              <Route path="/mis-pedidos" element={<MyOrders />} />
              <Route path="/club" element={<Club />} />
              <Route path="/acceso" element={<Access />} />
              <Route path="/recuperar" element={<Recovery />} />
              <Route path="/privacidad" element={<Privacy />} />
            </Route>
            <Route path="/equipo" element={<StaffShell />}>
              <Route index element={<Dashboard />} />
              <Route path="resumen" element={<Dashboard />} />
              <Route path="mesas" element={<Tables />} />
              <Route path="pedidos" element={<Orders />} />
              <Route path="nuevo" element={<NewOrder />} />
              <Route path="cocina" element={<Kitchen />} />
              <Route path="caja" element={<Cash />} />
              <Route path="catalogo" element={<Catalog />} />
              <Route path="reservas" element={<Reservations />} />
              <Route path="configuracion" element={<SettingsPage />} />
            </Route>
            <Route
              path="*"
              element={
                <div className="container section-pad">
                  <h1>Por acá no era.</h1>
                  <Link className="button green" to="/">
                    Volver a Porter
                  </Link>
                </div>
              }
            />
          </Routes>
        </StoreProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);

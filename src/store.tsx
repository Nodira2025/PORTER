import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { useLocation } from "react-router-dom";
import { emptyData, demoSeed } from "./data";
import { supabase, errorText } from "./lib";
import { balance, cartTotal, catalogFor } from "./domain";
import type { Dataset, Role, Guest, Order, CartLine } from "./types";

const DEMO_KEY = "porter-demo-v1";
const id = () => crypto.randomUUID();
const now = () => new Date().toISOString();
function demoRead() {
  try {
    return (
      (JSON.parse(localStorage.getItem(DEMO_KEY) || "null") as Dataset) ||
      demoSeed()
    );
  } catch {
    return demoSeed();
  }
}
type Staff = { user_id: string; role: Role; branch_id: string | null };
interface Store {
  data: Dataset;
  demo: boolean;
  branch: string;
  setBranch: (b: string) => void;
  user: User | null;
  staff: Staff | null;
  loading: boolean;
  connection: string;
  error: string;
  refresh: () => Promise<void>;
  rpc: (name: string, args?: Record<string, any>) => Promise<any>;
  save: (table: string, value: any) => Promise<void>;
  guest: Guest | null;
  setGuest: (g: Guest | null) => void;
  path: (s: string) => string;
  resetDemo: () => void;
  toast: (s: string) => void;
}
const Context = createContext<Store>(null!);
export const useStore = () => useContext(Context);

export function StoreProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const demo = new URLSearchParams(location.search).get("demo") === "1";
  const [data, setData] = useState<Dataset>(emptyData);
  const [branch, setBranchState] = useState(
    new URLSearchParams(location.search).get("sucursal") || "barrio-norte",
  );
  const [user, setUser] = useState<User | null>(null);
  const [staff, setStaff] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [connection, setConnection] = useState("Conectando");
  const [notice, setNotice] = useState("");
  const [guest, setGuestState] = useState<Guest | null>(null);
  const toast = useCallback((s: string) => setNotice(s), []);
  useEffect(() => {
    if (notice) {
      const timer = setTimeout(() => setNotice(""), 5500);
      return () => clearTimeout(timer);
    }
  }, [notice]);
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase.auth
      .getSession()
      .then(({ data }) => setUser(data.session?.user ?? null));
    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user ?? null),
    );
    return () => subscription.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    try {
      setGuestState(
        JSON.parse(
          sessionStorage.getItem(demo ? "porter-demo-guest" : "porter-guest") ||
            "null",
        ),
      );
    } catch {
      setGuestState(null);
    }
  }, [demo]);
  const setGuest = (g: Guest | null) => {
    setGuestState(g);
    sessionStorage.setItem(
      demo ? "porter-demo-guest" : "porter-guest",
      JSON.stringify(g),
    );
    if (g) setBranchState(g.branch_id);
  };
  const setBranch = (b: string) => {
    setBranchState(b);
  };
  const refresh = useCallback(async () => {
    if (demo) {
      setData(demoRead());
      setStaff({ user_id: "demo-staff", role: "admin", branch_id: null });
      setConnection("Demostración local");
      setError("");
      setLoading(false);
      return;
    }
    if (!supabase) {
      setConnection("Sin configurar");
      setError("Falta configurar la conexión a Supabase.");
      setLoading(false);
      return;
    }
    try {
      const get = async (q: any) => {
        const { data, error } = await q;
        if (error) throw error;
        return data ?? [];
      };
      const all = async (makeQuery: () => any) => {
        const rows: any[] = [];
        for (let offset = 0; ; offset += 500) {
          const page = await get(makeQuery().range(offset, offset + 499));
          rows.push(...page);
          if (page.length < 500) return rows;
        }
      };
      const [bs, ps, av, ls, rw] = await Promise.all([
        get(supabase.from("branches").select("*")),
        get(supabase.from("products").select("*").order("name")),
        get(supabase.from("branch_products").select("*")),
        get(supabase.from("loyalty_settings").select("*")),
        get(supabase.from("rewards").select("*")),
      ]);
      let member: Staff | null = null;
      if (user) {
        const members = await get(
          supabase
            .from("staff_members")
            .select("*")
            .eq("user_id", user.id)
            .eq("active", true),
        );
        member = members[0] ?? null;
      }
      setStaff(member);
      const result: Dataset = {
        ...structuredClone(emptyData),
        branches: bs,
        products: ps,
        availability: av,
        rewards: rw,
        loyalty: ls[0] ?? emptyData.loyalty,
      };
      if (member) {
        const b = member.branch_id ?? branch;
        if (member.branch_id && branch !== b) setBranchState(b);
        const cashier = ["admin", "cashier"].includes(member.role);
        const kitchen = ["admin", "kitchen"].includes(member.role);
        const [ts, ss, os, rs, sh, pa, mo, re] = await Promise.all([
          get(
            supabase
              .from("dining_tables")
              .select("*")
              .eq("branch_id", b)
              .order("label"),
          ),
          all(() =>
            supabase!
              .from("service_sessions")
              .select("*,dining_tables!inner(branch_id)")
              .eq("dining_tables.branch_id", b)
              .order("id"),
          ),
          all(() =>
            supabase!
              .from("orders")
              .select("*,order_items(*)")
              .eq("branch_id", b)
              .order("id"),
          ),
          kitchen ? get(supabase.from("recipes").select("*")) : [],
          cashier
            ? get(
                supabase
                  .from("cash_shifts")
                  .select("*")
                  .eq("branch_id", b)
                  .order("opened_at", { ascending: false })
                  .limit(30),
              )
            : [],
          cashier
            ? all(() =>
                supabase!
                  .from("payments")
                  .select("*,orders!inner(branch_id)")
                  .eq("orders.branch_id", b)
                  .order("id"),
              )
            : [],
          cashier
            ? all(() =>
                supabase!
                  .from("cash_movements")
                  .select("*,cash_shifts!inner(branch_id)")
                  .eq("cash_shifts.branch_id", b)
                  .order("id"),
              )
            : [],
          ["admin", "waiter", "cashier"].includes(member.role)
            ? get(
                supabase
                  .from("reservations")
                  .select("*")
                  .eq("branch_id", b)
                  .order("scheduled_at", { ascending: false })
                  .limit(100),
              )
            : [],
        ]);
        Object.assign(result, {
          tables: ts,
          services: ss,
          orders: os.sort((a: any, b: any) =>
            b.created_at.localeCompare(a.created_at),
          ),
          recipes: rs,
          shifts: sh,
          payments: pa,
          movements: mo,
          reservations: re,
        });
      }
      if (user && !member) {
        const [points, claims, reservations] = await Promise.all([
          get(
            supabase
              .from("loyalty_entries")
              .select("*")
              .eq("customer_id", user.id),
          ),
          get(
            supabase
              .from("reward_claims")
              .select("*")
              .eq("customer_id", user.id),
          ),
          get(
            supabase
              .from("reservations")
              .select("*")
              .eq("customer_id", user.id)
              .order("scheduled_at", { ascending: false }),
          ),
        ]);
        Object.assign(result, { points, claims, reservations });
      }
      setData(result);
      setConnection("Conectado a Supabase");
      setError("");
    } catch (e) {
      setError(errorText(e));
      setConnection("Sin conexión");
    } finally {
      setLoading(false);
    }
  }, [demo, user, branch]);
  useEffect(() => {
    setLoading(true);
    void refresh();
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, 10000);
    return () => clearInterval(timer);
  }, [refresh]);
  useEffect(() => {
    const sync = () => {
      if (demo) setData(demoRead());
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [demo]);
  const mutateDemo = (fn: (d: Dataset) => any) => {
    const d = demoRead();
    const result = fn(d);
    localStorage.setItem(DEMO_KEY, JSON.stringify(d));
    setData(d);
    return result;
  };
  const rpc = async (name: string, args: Record<string, any> = {}) => {
    if (!demo) {
      if (!supabase) throw Error("Conexión no configurada.");
      const { data, error } = await supabase.rpc(name, args);
      if (error) throw error;
      await refresh();
      return data;
    }
    return mutateDemo((d) => {
      const branchId = branch;
      if (name === "open_table") {
        const t = d.tables.find((t) => t.id === args.p_table);
        if (!t) throw Error("Mesa no encontrada.");
        let s = d.services.find((s) => s.table_id === t.id && !s.closed_at);
        if (!s) {
          s = { id: id(), table_id: t.id, opened_at: now(), closed_at: null };
          d.services.push(s);
        }
        return s.id;
      }
      if (name === "join_table") {
        const t = d.tables.find((t) => t.qr_token === args.p_qr);
        if (!t) throw Error("QR no válido.");
        const s = d.services.find((s) => s.table_id === t.id && !s.closed_at);
        if (!s) throw Error("Pedile al personal que abra tu mesa.");
        return {
          token: id(),
          service_id: s.id,
          branch_id: t.branch_id,
          label: t.label,
        };
      }
      if (name === "submit_order") {
        const old = d.orders.find((o) => o.id === args.p_request);
        if (old) return old.id;
        const serviceId = args.p_service ?? guest?.service_id;
        const s = d.services.find((s) => s.id === serviceId && !s.closed_at);
        if (!s) throw Error("La mesa no está abierta.");
        const t = d.tables.find((t) => t.id === s.table_id)!;
        const ps = catalogFor(d.products, d.availability, t.branch_id);
        const lines = args.p_items as CartLine[];
        if (
          lines.some((l) => !ps.find((p) => p.id === l.product_id)?.available)
        )
          throw Error("Un producto ya no está disponible.");
        const oid = args.p_request;
        const order: Order = {
          id: oid,
          number: d.orders.length + 1,
          branch_id: t.branch_id,
          service_id: s.id,
          status: "pending",
          total: cartTotal(lines, ps),
          note: args.p_note ?? "",
          payment_preference: args.p_payment ?? "cash",
          payment_reference: "",
          created_at: now(),
          guest_token: args.p_guest,
          order_items: lines.map((l) => {
            const p = ps.find((p) => p.id === l.product_id)!;
            return {
              id: id(),
              order_id: oid,
              product_id: p.id,
              name: p.name,
              quantity: l.quantity,
              unit_price: p.price,
              station: p.station,
              note: l.note,
              status: "pending",
            };
          }),
        };
        d.orders.unshift(order);
        return oid;
      }
      if (name === "guest_orders")
        return d.orders
          .filter((o) => o.guest_token === args.p_guest)
          .map((o) => ({
            ...o,
            paid: Number(o.total) - balance(o, d.payments),
          }));
      if (name === "report_transfer") {
        const o = d.orders.find((o) => o.id === args.p_order);
        if (o) o.payment_reference = args.p_reference;
        return;
      }
      if (name === "advance_order") {
        const o = d.orders.find((o) => o.id === args.p_order);
        if (!o) throw Error("Pedido no encontrado.");
        if (
          args.p_status === "cancelled" &&
          (d.payments.some((p) => p.order_id === o.id) ||
            args.p_reason?.trim().length < 3)
        )
          throw Error("La anulación requiere motivo y un pedido sin cobros.");
        o.status = args.p_status;
        return;
      }
      if (name === "prepare_item") {
        const o = d.orders.find((o) =>
          o.order_items.some((i) => i.id === args.p_item),
        );
        if (!o) throw Error("Pedido no encontrado.");
        const i = o.order_items.find((i) => i.id === args.p_item)!;
        i.status = args.p_status;
        o.status = o.order_items.every((i) => i.status === "ready")
          ? "ready"
          : "preparing";
        return;
      }
      if (name === "open_shift") {
        if (d.shifts.some((s) => s.branch_id === args.p_branch && !s.closed_at))
          throw Error("Ya hay una caja abierta.");
        const sid = id();
        d.shifts.unshift({
          id: sid,
          branch_id: args.p_branch,
          opening_amount: args.p_amount,
          opened_at: now(),
          closed_at: null,
        });
        return sid;
      }
      if (name === "register_payment") {
        const old = d.payments.find((p) => p.id === args.p_request);
        if (old) return old.id;
        const o = d.orders.find((o) => o.id === args.p_order)!;
        const s = d.shifts.find(
          (s) => s.branch_id === o.branch_id && !s.closed_at,
        );
        if (!s) throw Error("Abrí la caja antes de cobrar.");
        if (args.p_amount <= 0 || args.p_amount > balance(o, d.payments))
          throw Error("Importe fuera del saldo pendiente.");
        d.payments.push({
          id: args.p_request,
          order_id: o.id,
          shift_id: s.id,
          amount: args.p_amount,
          method: args.p_method,
          reference: args.p_reference,
          created_at: now(),
        });
        return args.p_request;
      }
      if (name === "add_cash_movement") {
        d.movements.push({
          id: id(),
          shift_id: args.p_shift,
          amount: args.p_amount,
          reason: args.p_reason,
          created_at: now(),
        });
        return;
      }
      if (name === "close_shift") {
        const s = d.shifts.find((s) => s.id === args.p_shift && !s.closed_at);
        if (!s) throw Error("Caja no encontrada.");
        s.closed_at = now();
        s.declared_cash = args.p_declared;
        s.expected_cash =
          s.opening_amount +
          d.payments
            .filter((p) => p.shift_id === s.id && p.method === "cash")
            .reduce((s, p) => s + p.amount, 0) +
          d.movements
            .filter((m) => m.shift_id === s.id)
            .reduce((s, m) => s + m.amount, 0);
        return Number(s.declared_cash) - Number(s.expected_cash);
      }
      if (name === "close_table") {
        const active = d.orders.filter(
          (o) => o.service_id === args.p_service && o.status !== "cancelled",
        );
        if (
          active.some(
            (o) => o.status !== "delivered" || balance(o, d.payments) > 0,
          )
        )
          throw Error("Hay pedidos sin entregar o saldos pendientes.");
        const s = d.services.find((s) => s.id === args.p_service)!;
        s.closed_at = now();
        return;
      }
      if (name === "redeem_reward") {
        const r = d.rewards.find((r) => r.id === args.p_reward)!;
        if (d.points.reduce((s, p) => s + p.points, 0) < r.cost)
          throw Error("Puntos insuficientes.");
        d.points.push({
          id: id(),
          points: -r.cost,
          reason: "Canje: " + r.title,
        });
        d.claims.push({ id: id(), title: r.title, code: id() });
        return;
      }
      throw Error(`La operación ${name} requiere conexión real.`);
    });
  };
  const save = async (table: string, value: any) => {
    const mapping: Record<string, keyof Dataset> = {
      products: "products",
      branch_products: "availability",
      recipes: "recipes",
      branches: "branches",
      rewards: "rewards",
      reservations: "reservations",
    };
    if (!demo) {
      if (!supabase) throw Error("Conexión no configurada.");
      const { error } = await supabase.from(table).upsert(value);
      if (error) throw error;
      await refresh();
      return;
    }
    mutateDemo((d) => {
      if (table === "loyalty_settings") {
        d.loyalty = value;
        return;
      }
      const key = mapping[table];
      if (!key) throw Error("Operación de demo no disponible.");
      const list = d[key] as any[];
      const index = list.findIndex((x) =>
        table === "branch_products"
          ? x.product_id === value.product_id && x.branch_id === value.branch_id
          : table === "recipes"
            ? x.product_id === value.product_id
            : x.id === value.id,
      );
      if (index >= 0) list[index] = { ...list[index], ...value };
      else list.push({ ...value, id: value.id ?? id() });
    });
  };
  const path = (s: string) => {
    if (!demo) return s;
    const [base, hash] = s.split("#");
    return (
      base +
      (base.includes("?") ? "&" : "?") +
      "demo=1" +
      (hash ? "#" + hash : "")
    );
  };
  const resetDemo = () => {
    localStorage.removeItem(DEMO_KEY);
    sessionStorage.removeItem("porter-demo-guest");
    setGuestState(null);
    setData(demoSeed());
    toast("Demostración reiniciada.");
  };
  return (
    <Context.Provider
      value={{
        data,
        demo,
        branch,
        setBranch,
        user,
        staff,
        loading,
        connection,
        error,
        refresh,
        rpc,
        save,
        guest,
        setGuest,
        path,
        resetDemo,
        toast,
      }}
    >
      {children}
      {notice && (
        <div role="status" className="toast">
          {notice}
          <button onClick={() => setNotice("")} aria-label="Cerrar aviso">
            ×
          </button>
        </div>
      )}
    </Context.Provider>
  );
}

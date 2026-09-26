import type { Availability, CartLine, Product, Payment, Order } from "./types";
export const money = (value: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(value);
export const statusLabel: Record<string, string> = {
  pending: "Por confirmar",
  accepted: "Confirmado",
  preparing: "En preparación",
  ready: "Listo para retirar",
  delivered: "Entregado",
  cancelled: "Anulado",
  requested: "Solicitada",
  confirmed: "Confirmada",
};
export function catalogFor(
  products: Product[],
  availability: Availability[],
  branch: string,
) {
  return products
    .filter((p) => p.active)
    .map((p) => {
      const a = availability.find(
        (x) => x.product_id === p.id && x.branch_id === branch,
      );
      return {
        ...p,
        price: Number(a?.price_override ?? p.price),
        available: a?.available ?? true,
      };
    });
}
export function cartTotal(lines: CartLine[], products: Product[]) {
  return (
    lines.reduce((sum, line) => {
      const p = products.find((p) => p.id === line.product_id);
      if (
        !p ||
        !Number.isInteger(line.quantity) ||
        line.quantity < 1 ||
        line.quantity > 20
      )
        throw Error("Revisá los productos y cantidades de tu pedido.");
      return sum + Math.round(p.price * 100) * line.quantity;
    }, 0) / 100
  );
}
export function balance(order: Order, payments: Payment[]) {
  return Math.max(
    0,
    Math.round(
      (Number(order.total) -
        payments
          .filter((p) => p.order_id === order.id)
          .reduce((s, p) => s + Number(p.amount), 0)) *
        100,
    ) / 100,
  );
}
export function youtubeEmbed(raw: string | null | undefined) {
  if (!raw) return null;
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:") return null;
    const id =
      u.hostname === "youtu.be"
        ? u.pathname.slice(1)
        : ["youtube.com", "www.youtube.com"].includes(u.hostname)
          ? (u.searchParams.get("v") ??
            u.pathname.match(/^\/(?:embed|shorts)\/([\w-]+)/)?.[1])
          : null;
    return id && /^[\w-]{11}$/.test(id)
      ? `https://www.youtube-nocookie.com/embed/${id}`
      : null;
  } catch {
    return null;
  }
}
export function safeImage(url: string | null | undefined) {
  if (!url) return null;
  if (url.startsWith("/assets/")) return url;
  try {
    return new URL(url).protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}
export const dateTime = (v: string) =>
  new Date(v).toLocaleString("es-AR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

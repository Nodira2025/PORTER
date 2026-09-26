import { describe, it, expect } from "vitest";
import {
  cartTotal,
  catalogFor,
  balance,
  youtubeEmbed,
  safeImage,
} from "./domain";
import { demoSeed } from "./data";
describe("Precios y disponibilidad", () => {
  it("calcula centavos sin errores de coma flotante", () => {
    const p = { ...demoSeed().products[0], price: 0.1 };
    expect(cartTotal([{ product_id: p.id, quantity: 3, note: "" }], [p])).toBe(
      0.3,
    );
  });
  it("rechaza cantidades manipuladas y productos inexistentes", () => {
    for (const q of [0, -1, 1.5, 21])
      expect(() =>
        cartTotal(
          [{ product_id: "demo-golden", quantity: q, note: "" }],
          demoSeed().products,
        ),
      ).toThrow();
    expect(() =>
      cartTotal([{ product_id: "missing", quantity: 1, note: "" }], []),
    ).toThrow();
  });
  it("respeta el precio y la disponibilidad de cada sucursal", () => {
    const p = demoSeed().products;
    const overrides = [
      {
        branch_id: "barrio-norte",
        product_id: p[0].id,
        price_override: 6000,
        available: false,
      },
    ];
    expect(catalogFor(p, overrides, "barrio-norte")[0]).toMatchObject({
      price: 6000,
      available: false,
    });
    expect(catalogFor(p, overrides, "yerba-buena")[0]).toMatchObject({
      price: 4900,
      available: true,
    });
  });
});
describe("Contenido externo", () => {
  it("solo incrusta videos de YouTube con un identificador válido", () => {
    expect(youtubeEmbed("https://youtu.be/abcdefghijk")).toBe(
      "https://www.youtube-nocookie.com/embed/abcdefghijk",
    );
    expect(
      youtubeEmbed("https://youtube.com.evil.test/watch?v=abcdefghijk"),
    ).toBeNull();
    expect(youtubeEmbed("javascript:alert(1)")).toBeNull();
  });
  it("rechaza imágenes ejecutables", () =>
    expect(safeImage("javascript:alert(1)")).toBeNull());
});

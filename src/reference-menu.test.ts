import { describe, it, expect } from "vitest";
import {
  referenceProducts,
  referenceToDraft,
  MENU_SOURCE,
} from "./reference-menu";
import { DEMO_EMAIL, DEMO_PASSWORD, validateDemoAccess } from "./demo-access";
describe("Reference catalog remains non-sellable until reviewed", () => {
  it("contains only unique draft identities with unknown prices", () => {
    expect(referenceProducts.length).toBe(72);
    expect(new Set(referenceProducts.map((p) => p.id)).size).toBe(
      referenceProducts.length,
    );
    for (const p of referenceProducts) {
      expect(p.price).toBeNull();
      expect(p.active).toBe(false);
      expect(p.source).toBe(MENU_SOURCE);
    }
  });
  it("never publishes historical products or supplies an invented price when completing a draft", () => {
    const draft = referenceToDraft(referenceProducts[0]);
    expect(draft.id).toBe(referenceProducts[0].id);
    expect(draft.active).toBe(false);
    expect(draft.price).toBe(0);
    expect(draft.image_url).toBeNull();
  });
});
describe("Demo access", () => {
  it("recognizes only the explicitly marked demo identity", () => {
    expect(validateDemoAccess(" USUARIO@PORTER.COM ", DEMO_PASSWORD)).toBe(
      true,
    );
    expect(validateDemoAccess("real@example.com", DEMO_PASSWORD)).toBe(false);
    expect(() => validateDemoAccess(DEMO_EMAIL, "incorrecta")).toThrow();
  });
});

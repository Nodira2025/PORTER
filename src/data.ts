import type { Dataset } from "./types";
export const branches = [
  {
    id: "barrio-norte",
    name: "Barrio Norte",
    address: "Muñecas 749, San Miguel de Tucumán",
    phone: "0381 484-0812",
    maps_url:
      "https://www.google.com/maps/search/?api=1&query=Porter+Brew+House+Barrio+Norte",
    reservation_url: "https://bookity.io/r/porter-barrio-norte",
    transport_note: "Recorridos y paradas pendientes de verificar.",
    ordering_enabled: false,
  },
  {
    id: "yerba-buena",
    name: "Yerba Buena",
    address: "Av. Juan Domingo Perón 1750, City Place",
    phone: "0381 485-8001",
    maps_url:
      "https://www.google.com/maps/search/?api=1&query=Porter+Brew+House+Yerba+Buena",
    reservation_url: null,
    transport_note: "Recorridos y paradas pendientes de verificar.",
    ordering_enabled: false,
  },
];
export const emptyData: Dataset = {
  branches,
  products: [],
  availability: [],
  recipes: [],
  tables: [],
  services: [],
  orders: [],
  shifts: [],
  payments: [],
  movements: [],
  rewards: [],
  points: [],
  claims: [],
  reservations: [],
  loyalty: { enabled: false, pesos_per_point: 1000 },
};
export function demoSeed(): Dataset {
  return {
    ...structuredClone(emptyData),
    branches: branches.map((b) => ({ ...b, ordering_enabled: true })),
    products: [
      {
        id: "demo-golden",
        name: "Golden de la casa",
        description: "Liviana, fresca y dorada. Una pinta para abrir la ronda.",
        category: "Cervezas",
        price: 4900,
        image_url: null,
        station: "bar",
        active: true,
        tags: ["Pinta · 500 ml"],
      },
      {
        id: "demo-ipa",
        name: "IPA artesanal",
        description: "Aromática, con carácter y un final bien lupulado.",
        category: "Cervezas",
        price: 5400,
        image_url: null,
        station: "bar",
        active: true,
        tags: ["Pinta · 500 ml"],
      },
      {
        id: "demo-burger",
        name: "Burger clásica",
        description:
          "Medallón de carne, cheddar, lechuga y salsa de la casa. Con papas.",
        category: "Burgers",
        price: 11900,
        image_url: null,
        station: "kitchen",
        active: true,
        tags: ["Con papas"],
      },
      {
        id: "demo-double",
        name: "Doble cheddar",
        description:
          "Doble medallón, doble cheddar y cebolla. Para los que van por todo.",
        category: "Burgers",
        price: 14900,
        image_url: null,
        station: "kitchen",
        active: true,
        tags: ["Con papas"],
      },
      {
        id: "demo-fries",
        name: "Papas para compartir",
        description:
          "Papas doradas con cheddar y verdeo. El centro de todas las mesas.",
        category: "Para compartir",
        price: 9500,
        image_url: null,
        station: "kitchen",
        active: true,
        tags: ["Para dos"],
      },
      {
        id: "demo-pizza",
        name: "Pizza muzzarella",
        description:
          "Salsa de tomate, muzzarella y orégano. Un clásico que nunca falla.",
        category: "Pizzas",
        price: 12900,
        image_url: null,
        station: "kitchen",
        active: true,
        tags: ["8 porciones"],
      },
      {
        id: "demo-lemon",
        name: "Limonada fresca",
        description: "Limón, menta y jengibre. Frescura sin alcohol.",
        category: "Sin alcohol",
        price: 4200,
        image_url: null,
        station: "bar",
        active: true,
        tags: ["Sin alcohol"],
      },
      {
        id: "demo-dessert",
        name: "Brownie con helado",
        description:
          "Chocolate tibio, helado de crema y ganas de una cucharada más.",
        category: "Postres",
        price: 6200,
        image_url: null,
        station: "kitchen",
        active: true,
        tags: ["Para cerrar"],
      },
    ],
    tables: branches.flatMap((b) =>
      Array.from({ length: 8 }, (_, i) => ({
        id: `${b.id}-${i + 1}`,
        branch_id: b.id,
        label: `Mesa ${i + 1}`,
        qr_token: `demo-${b.id}-${i + 1}`,
        active: true,
      })),
    ),
    rewards: [
      {
        id: "demo-r1",
        title: "Una pinta, por nuestra cuenta",
        description:
          "Ejemplo de recompensa. Sujeto a las reglas definitivas del Club.",
        cost: 100,
        active: true,
      },
      {
        id: "demo-r2",
        title: "La próxima ronda de papas",
        description: "Ejemplo de recompensa para compartir.",
        cost: 200,
        active: true,
      },
    ],
    points: [
      {
        id: "demo-welcome",
        points: 120,
        reason: "Puntos ficticios de demostración",
      },
    ],
    loyalty: { enabled: true, pesos_per_point: 1000 },
    recipes: [
      {
        product_id: "demo-burger",
        ingredients:
          "Ficha de ejemplo. Reemplazar por la receta aprobada por Porter.",
        instructions:
          "1. Revisar las observaciones del pedido.\n2. Preparar siguiendo la ficha validada por cocina.\n3. Verificar presentación y acompañamiento.\n4. Marcar listo para retirar.",
        video_url: null,
      },
    ],
  };
}

import type { Product } from "./types";

export const MENU_SOURCE =
  "https://www.instagram.com/stories/highlights/18326954677116176/";
export const MENU_CHECKED = "28/09/2026";
export type Crop = [number, number, number, number];
export interface ReferenceProduct extends Omit<Product, "price"> {
  price: null;
  source: string;
  crop?: Crop;
}
type Entry = [name: string, description: string, crop?: Crop];
type Group = {
  category: string;
  image?: string;
  station?: "bar" | "kitchen";
  items: Entry[];
};
const groups: Group[] = [
  {
    category: "Para picar",
    image: "tasty-food",
    items: [
      [
        "Tequeños",
        "Roll de masa crujiente relleno de muzzarella y panceta.",
        [10, 242, 230, 115],
      ],
      [
        "Chicken Fingers",
        "Pechuguitas de pollo rebozadas y fritas.",
        [246, 219, 232, 123],
      ],
      [
        "Nachos",
        "Nachos con cheddar y salsa 4 quesos, acompañados con dips de barbacoa, guacamole y pico de gallo.",
        [3, 447, 241, 124],
      ],
      [
        "Langostinos Crunch",
        "Langostinos rebozados y fritos, acompañados de salsa tártara.",
        [249, 413, 224, 127],
      ],
      [
        "Bocaditos de muzzarella",
        "Bocaditos de muzzarella rebozados y fritos.",
        [24, 694, 224, 133],
      ],
      [
        "Rabas",
        "Aros de calamar rebozados, acompañados con mayo del día.",
        [251, 650, 228, 133],
      ],
    ],
  },
  {
    category: "Para compartir",
    image: "para-compartir",
    items: [
      [
        "Porter Reloaded",
        "Nachos con cheddar, chicken fingers, tequeños, bocaditos de muzzarella, rabas, papas con salsa 4 quesos y aros de cebolla.",
        [12, 292, 461, 245],
      ],
      [
        "Knishe",
        "Bocaditos de masa casera al horno, rellenos de papa y cebolla.",
      ],
      [
        "Boio",
        "Masa casera rellena de acelga y espinaca, con queso gratinado por encima.",
      ],
    ],
  },
  {
    category: "Burgers",
    image: "burgers-homenajes",
    items: [
      [
        "Stacker",
        "Doble medallón, cheddar, panceta y salsa stacker.",
        [1, 280, 260, 109],
      ],
      [
        "Whopper",
        "Doble medallón, pepinillos, cebolla, tomate, lechuga, mayonesa y ketchup.",
        [262, 213, 215, 111],
      ],
      [
        "Cuarto de Libra",
        "Doble medallón, doble cheddar, pepinillos, cebolla, ketchup y mostaza.",
        [0, 493, 262, 118],
      ],
      [
        "Big Mac",
        "Doble medallón, cheddar, cebolla, pepinillos, lechuga y salsa Big Mac.",
        [260, 431, 220, 115],
      ],
    ],
  },
  {
    category: "Burgers",
    image: "burgers-clasicas",
    items: [
      [
        "Frida",
        "Doble medallón, doble cheddar, panceta, guacamole, crispy onions, papas pay y barbacoa.",
        [14, 279, 245, 103],
      ],
      [
        "Argentina",
        "Doble medallón, muzzarella, jamón, huevo frito, lechuga, tomate y mayonesa de chimichurri.",
        [267, 255, 210, 114],
      ],
      [
        "Americana",
        "Doble medallón, panceta, doble cheddar, barbacoa y aro de cebolla.",
        [4, 505, 253, 101],
      ],
      [
        "Cheese Burger 3.0",
        "Triple medallón, triple cheddar, cebolla y barbacoa.",
        [270, 454, 210, 105],
      ],
      [
        "Francesa",
        "Doble medallón, doble muzzarella, queso azul, cebolla caramelizada, champiñones y honey mustard.",
        [0, 708, 265, 121],
      ],
      [
        "Burger Porter",
        "Doble medallón de carne, bocaditos de muzzarella, tomate deshidratado, rúcula y barbacoa.",
        [276, 716, 202, 106],
      ],
    ],
  },
  {
    category: "Philly Cheese Steak",
    image: "burgers-homenajes",
    items: [
      [
        "Philly Americano",
        "Carne, cheddar, bacon y cebolla de verdeo.",
        [22, 765, 160, 68],
      ],
      [
        "Philly Cervecero",
        "Carne, salsa cuatro quesos, bacon y cebolla de verdeo.",
        [239, 771, 193, 73],
      ],
    ],
  },
  {
    category: "Ensaladas",
    image: "ensaladas",
    items: [
      [
        "Mediterránea",
        "Mix de hojas verdes, jamón crudo, bocaditos de muzzarella rebozados, olivas verdes, pecans caramelizadas y reducción de aceto.",
      ],
      [
        "Caesar",
        "Mix de hojas verdes, escamas de parmesano, croutons, pollo grillado y aderezo caesar.",
      ],
      [
        "Cobb Salad",
        "Mix de hojas verdes, pollo, panceta, palta, queso azul, huevo y tomate cherry.",
      ],
    ],
  },
  {
    category: "Papas",
    image: "papas",
    items: [
      ["Papas fritas", "Porción de papas fritas.", [0, 157, 241, 138]],
      ["Papas bravas", "Con chili mayo.", [242, 204, 235, 107]],
      [
        "Papas Argenta",
        "Jamón, muzzarella, huevo frito y cebolla de verdeo.",
        [5, 341, 247, 139],
      ],
      [
        "Chiken Fries",
        "Con bocaditos de chicken fingers y dressing Porter.",
        [245, 386, 232, 129],
      ],
      [
        "Papas Yankee",
        "Cheddar, panceta y cebolla de verdeo.",
        [0, 511, 242, 109],
      ],
      [
        "Cheeses Burger Fries",
        "Con lluvia de burger, barbacoa y cheddar.",
        [244, 604, 233, 119],
      ],
      [
        "Papas cerveceras",
        "Salsa 4 quesos, panceta y cebolla de verdeo.",
        [1, 694, 244, 124],
      ],
    ],
  },
  {
    category: "Pizzas",
    items: [
      ["Especial", "Pizza individual publicada en la carta de Porter."],
      ["Prosciutto", "Pizza individual publicada en la carta de Porter."],
      ["Porter", "Pizza individual publicada en la carta de Porter."],
      ["Ternera", "Pizza individual publicada en la carta de Porter."],
      ["4 Quesos", "Pizza individual publicada en la carta de Porter."],
      ["Muzza", "Pizza individual publicada en la carta de Porter."],
      ["Napolitana", "Pizza individual publicada en la carta de Porter."],
      ["Caprese", "Pizza individual publicada en la carta de Porter."],
      ["Lo de Roque", "Pizza individual publicada en la carta de Porter."],
    ],
  },
  {
    category: "Mexicana",
    items: [
      ["Quesadillas Chingonas", "Quesadillas publicadas en el destacado Menú."],
      ["Quesadillas Caprese", "Quesadillas publicadas en el destacado Menú."],
      ["Quesadillas Ternera", "Quesadillas publicadas en el destacado Menú."],
      ["Tacos de carne", "Opción para compartir publicada en la carta."],
      ["Tacos de pollo", "Opción para compartir publicada en la carta."],
      ["Tacos mixtos", "Opción para compartir publicada en la carta."],
      [
        "Burrito de carne",
        "Burrito acompañado con papas fritas, según la carta publicada.",
      ],
      [
        "Burrito de pollo",
        "Burrito acompañado con papas fritas, según la carta publicada.",
      ],
      [
        "Burrito Cheese Burger",
        "Burrito acompañado con papas fritas, según la carta publicada.",
      ],
      [
        "Burrito Caesar",
        "Burrito acompañado con papas fritas, según la carta publicada.",
      ],
    ],
  },
  {
    category: "Postres",
    items: [
      ["Volcán de chocolate", "Con helado de americana."],
      [
        "Volcán de dulce de leche",
        "Con corazón de chocolate blanco, acompañado con helado de americana.",
      ],
      [
        "Tiramisú",
        "Postre italiano a base de vainillas embebidas en café, mousse de mascarpone y cacao.",
      ],
      ["Suspiro limeño", "Postre publicado en la carta de Porter."],
      ["Brownie con helado", "Brownie acompañado con helado."],
    ],
  },
  {
    category: "Tragos clásicos",
    station: "bar",
    items: [
      ["Campari Orange", "Campari y naranja."],
      ["Campari Tonic", "Campari y agua tónica."],
      ["Carpano Orange", "Carpano, soda y rodaja de naranja."],
      ["Tinto de Verano", "Vino tinto, Sprite y naranja."],
      ["Gancia Batido", "Gancia, jugo de limón, almíbar y hielo."],
      ["Negroni", "Campari, gin y vermú Carpano rosso."],
      ["Cynar Julep", "Cynar, menta, azúcar y jugo de pomelo."],
    ],
  },
  {
    category: "Gin y coctelería",
    station: "bar",
    items: [
      ["Gin Tonic Clásico", "Gin, limón y tónica."],
      [
        "Gin Tonic Naranja & Canela",
        "Variante publicada en la carta de gin tonic.",
      ],
      ["Gin Tonic Arándanos", "Variante publicada en la carta de gin tonic."],
      ["Gin Tonic Maracuyá", "Variante publicada en la carta de gin tonic."],
      ["Gin Tonic Pepino", "Variante publicada en la carta de gin tonic."],
      ["Gin Frutos Rojos", "Gin pink, frutos rojos y tónica."],
      ["Gin Frambuesa & Menta", "Gin pink, frambuesa, menta y tónica."],
      [
        "Do It",
        "Gin, jugo de manzana, jugo de limón, almíbar, jengibre y menta.",
      ],
      ["Tom Collins", "Gin, limón, soda y azúcar."],
      ["Basil Smash", "Gin, jugo de limón, albahaca, azúcar y soda."],
    ],
  },
];
let sequence = 0;
export const referenceProducts: ReferenceProduct[] = groups.flatMap((group) =>
  group.items.map(([name, description, crop]) => ({
    id: `af092800-9bb4-4d56-9d28-${String(++sequence).padStart(12, "0")}`,
    name,
    description,
    category: group.category,
    price: null,
    image_url: group.image ? `/assets/menu/${group.image}.jpg` : null,
    station: group.station ?? "kitchen",
    active: false,
    tags: [],
    source: MENU_SOURCE,
    crop,
  })),
);
export const referenceSheets = [
  ["tasty-food", "Para picar"],
  ["para-compartir", "Para compartir"],
  ["burgers-homenajes", "Burgers: homenajes"],
  ["burgers-clasicas", "Burgers: las de siempre"],
  ["opciones", "Opciones de la carta"],
  ["ensaladas", "Ensaladas"],
  ["papas", "Papas"],
];
export function referenceToDraft(reference: ReferenceProduct): Product {
  // A reference without a known price is never a sellable product.
  return {
    id: reference.id,
    name: reference.name,
    description: reference.description,
    category: reference.category,
    price: 0,
    image_url: null,
    station: reference.station,
    active: false,
    tags: [],
  };
}

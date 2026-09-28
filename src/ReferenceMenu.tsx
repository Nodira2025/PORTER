import { useState } from "react";
import { Link } from "react-router-dom";
import { Utensils, ArrowUpRight, BookOpen } from "lucide-react";
import {
  referenceProducts,
  referenceSheets,
  MENU_SOURCE,
  MENU_CHECKED,
  referenceToDraft,
} from "./reference-menu";
import type { Product } from "./types";
import { Button, Modal } from "./components";
import "./reference-menu.css";

export function ReferenceMenu({
  existingIds = [],
  onEdit,
  standalone = false,
}: {
  existingIds?: string[];
  onEdit?: (p: Product) => void;
  standalone?: boolean;
}) {
  const [category, setCategory] = useState("Todo");
  const [search, setSearch] = useState("");
  const [sheet, setSheet] = useState<string | null>(null);
  const pending = referenceProducts.filter((p) => !existingIds.includes(p.id));
  const visible = pending.filter(
    (p) =>
      (category === "Todo" || p.category === category) &&
      `${p.name} ${p.description}`
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .includes(
          search
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase(),
        ),
  );
  if (!pending.length) return null;
  return (
    <section
      className={
        standalone
          ? "container menu-page reference-menu"
          : "reference-menu margin-top"
      }
    >
      <div className="section-top">
        <div>
          <span className="eyebrow">DE LAS HISTORIAS DE PORTER</span>
          {standalone ? (
            <h1>La carta de Porter.</h1>
          ) : (
            <h2>Productos por completar.</h2>
          )}
          <p>{pending.length} productos identificados en el destacado Menú.</p>
        </div>
        <a
          className="text-link"
          href={MENU_SOURCE}
          target="_blank"
          rel="noreferrer"
        >
          Ver destacado original <ArrowUpRight size={17} />
        </a>
      </div>
      <div className="info-banner">
        <BookOpen size={24} />
        <div>
          <strong>Precios y disponibilidad a confirmar.</strong>
          <p>
            Esta selección se transcribió de historias antiguas, consultadas el{" "}
            {MENU_CHECKED}. Consultá al personal por la carta vigente de cada
            sucursal.
          </p>
        </div>
      </div>
      {onEdit && (
        <p className="muted">
          Podés completar cada ficha y su precio. Se guarda oculta hasta que
          actives “Visible en la carta”. Las imágenes de las láminas son
          referencias; cargá la foto del producto al publicarlo.
        </p>
      )}
      <div className="menu-toolbar">
        <div className="category-tabs">
          {["Todo", ...new Set(pending.map((p) => p.category))].map((c) => (
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
          aria-label="Buscar productos de las historias"
          placeholder="Buscar en la carta…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="product-grid reference-grid">
        {visible.map((p) => (
          <article className="product-card" key={p.id}>
            {p.crop && p.image_url ? (
              <div
                className="reference-photo"
                style={{ aspectRatio: `${p.crop[2]}/${p.crop[3]}` }}
              >
                <img
                  src={p.image_url}
                  alt={`${p.name}, imagen de la carta publicada por Porter`}
                  loading="lazy"
                  style={{
                    width: `${(480 / p.crop[2]) * 100}%`,
                    left: `${(-p.crop[0] / p.crop[2]) * 100}%`,
                    top: `${(-p.crop[1] / p.crop[3]) * 100}%`,
                  }}
                />
              </div>
            ) : (
              <div className="reference-label">
                <Utensils size={20} />
                <span>{p.category}</span>
              </div>
            )}
            <div className="product-body">
              <div className="product-category">{p.category}</div>
              <h3>{p.name}</h3>
              <p>{p.description}</p>
              <div className="product-bottom">
                <strong className="pending-price">Precio a confirmar</strong>
                {onEdit ? (
                  <Button
                    className="outline small"
                    onClick={() => onEdit(referenceToDraft(p))}
                  >
                    Completar ficha
                  </Button>
                ) : p.image_url ? (
                  <button
                    className="text-link"
                    onClick={() => setSheet(p.image_url)}
                  >
                    Ver fuente <ArrowUpRight size={15} />
                  </button>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>
      {!visible.length && (
        <p className="empty">No encontramos productos con esa búsqueda.</p>
      )}
      <details className="reference-sheets panel margin-top">
        <summary>Ver las láminas originales recuperadas</summary>
        <p className="muted">
          Referencia histórica. Las opciones veggie y adaptaciones de
          ingredientes deben consultarse con el personal.
        </p>
        <div>
          {referenceSheets.map(([file, label]) => (
            <button
              key={file}
              onClick={() => setSheet(`/assets/menu/${file}.jpg`)}
            >
              <img
                src={`/assets/menu/${file}.jpg`}
                alt={label}
                loading="lazy"
              />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </details>
      {standalone && (
        <p className="source-note">
          Para probar pedidos con datos ficticios:{" "}
          <Link to="/acceso?demo=1">entrar a la demostración</Link>.
        </p>
      )}
      {sheet && (
        <Modal
          title="Lámina original · referencia histórica"
          onClose={() => setSheet(null)}
        >
          <img
            className="reference-original"
            src={sheet}
            alt="Carta publicada en historias destacadas de Porter"
          />
          <a href={MENU_SOURCE} target="_blank" rel="noreferrer">
            Consultar la publicación en Instagram
          </a>
        </Modal>
      )}
    </section>
  );
}

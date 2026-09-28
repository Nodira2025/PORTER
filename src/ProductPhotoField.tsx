import { useState } from "react";
import { Button, Field } from "./components";
import { safeImage } from "./domain";

export function ProductPhotoField({
  value,
  onChange,
  original,
}: {
  value: string;
  onChange: (value: string) => void;
  original: string;
}) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const url = safeImage(value.trim());
  return (
    <section className="product-photo-editor">
      <h3>Foto del producto</h3>
      <p className="muted">
        Pegá el enlace directo HTTPS de la nueva foto. Revisá la vista previa y
        guardá los cambios.
      </p>
      <Field label="Enlace de la foto (HTTPS)">
        <input
          name="image"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://…/foto.jpg"
        />
      </Field>
      <div className="product-photo-preview">
        {url && failedUrl !== url ? (
          <img
            key={url}
            src={url}
            alt="Vista previa de la foto del producto"
            onError={() => setFailedUrl(url)}
            onLoad={() => setFailedUrl(null)}
          />
        ) : (
          <p>
            {value.trim()
              ? "No se pudo mostrar la foto. Revisá que el enlace sea público y apunte a una imagen."
              : "Sin foto. Se mostrará la imagen de reemplazo de Porter."}
          </p>
        )}
      </div>
      <div className="product-photo-actions">
        <Button
          className="outline small"
          onClick={() => onChange("")}
          disabled={!value}
        >
          Quitar foto
        </Button>
        <Button
          className="outline small"
          onClick={() => {
            setFailedUrl(null);
            onChange(original);
          }}
          disabled={value === original}
        >
          Restaurar foto anterior
        </Button>
      </div>
      <small>
        Los cambios se aplican al guardar. Cerrar esta ventana los descarta.
      </small>
    </section>
  );
}

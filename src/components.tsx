import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type FormEvent,
} from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, LoaderCircle, X, Beer, MapPin } from "lucide-react";
import { useStore } from "./store";
import { errorText } from "./lib";
import { statusLabel, safeImage } from "./domain";
export function Brand() {
  const { path } = useStore();
  return (
    <Link className="brand" to={path("/")} aria-label="Porter, inicio">
      <span className="brand-symbol">
        P<span>✦</span>
      </span>
      <span>
        PORTER<small>BREW HOUSE</small>
      </span>
    </Link>
  );
}
export function Button({
  children,
  onClick,
  className = "",
  disabled = false,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void | Promise<void>;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  const [busy, setBusy] = useState(false);
  const { toast } = useStore();
  return (
    <button
      type={type}
      className={`button ${className}`}
      disabled={disabled || busy}
      onClick={
        onClick
          ? async () => {
              setBusy(true);
              try {
                await onClick();
              } catch (e) {
                toast(errorText(e));
              } finally {
                setBusy(false);
              }
            }
          : undefined
      }
    >
      {busy ? <LoaderCircle className="spin" size={18} /> : null}
      {children}
    </button>
  );
}
export function Form({
  children,
  onSubmit,
  className = "",
}: {
  children: ReactNode;
  onSubmit: (data: FormData) => Promise<void>;
  className?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <form
      className={className}
      onSubmit={async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (busy) return;
        const form = e.currentTarget;
        setBusy(true);
        setError("");
        try {
          await onSubmit(new FormData(form));
        } catch (e) {
          setError(errorText(e));
        } finally {
          setBusy(false);
        }
      }}
    >
      <fieldset disabled={busy}>{children}</fieldset>
      {busy && (
        <p className="muted" role="status">
          Procesando…
        </p>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    dialog.current?.showModal();
    return () => dialog.current?.close();
  }, []);
  return (
    <dialog
      ref={dialog}
      className="modal"
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <header>
        <h2>{title}</h2>
        <button className="icon-button" onClick={onClose} aria-label="Cerrar">
          <X />
        </button>
      </header>
      {children}
    </dialog>
  );
}
export function Empty({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty">
      <Beer size={36} strokeWidth={1.4} />
      <h3>{title}</h3>
      {children && <div>{children}</div>}
    </div>
  );
}
export function Badge({ status }: { status: string }) {
  return (
    <span className={`badge ${status}`}>{statusLabel[status] ?? status}</span>
  );
}
export function Photo({
  src,
  alt,
  className = "",
}: {
  src?: string | null;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  const url = safeImage(src);
  return url && !failed ? (
    <img
      className={className}
      src={url}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  ) : (
    <div className={`photo-placeholder ${className}`}>
      <Beer size={44} strokeWidth={1} />
      <span>PORTER</span>
    </div>
  );
}
export function BranchSelect({ disabled = false }: { disabled?: boolean }) {
  const { data, branch, setBranch } = useStore();
  return (
    <label className="branch-select">
      <MapPin size={16} />
      <select
        aria-label="Sucursal"
        value={branch}
        disabled={disabled}
        onChange={(e) => setBranch(e.target.value)}
      >
        {data.branches.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>
    </label>
  );
}
export function ExternalLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      className={`external ${className}`}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
      <ArrowUpRight size={17} />
    </a>
  );
}

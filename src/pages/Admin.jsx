import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash, faUpload } from "@fortawesome/free-solid-svg-icons";
import Cover from "../components/Cover";
import { useCatalog } from "../context/contexts";
import { api } from "../services/api";
import { detectMediaDuration, normalize, toDurationString, videoThumbnail } from "../utils/media";

// Campos de cada tipo de conteúdo (espelham as regras de api/resources.php)
const RESOURCES = {
  artists: {
    label: "Artistas",
    singular: "artista",
    path: "artist",
    fields: [
      { name: "name", label: "Nome", required: true, maxLength: 150 },
      { name: "image", label: "Foto (quadrada)", type: "media", upload: "image" },
      { name: "banner", label: "Banner (horizontal)", type: "media", upload: "image" },
      { name: "bio", label: "Biografia", type: "textarea" },
    ],
    title: (a) => a.name,
    image: (a) => a.image,
  },
  songs: {
    label: "Músicas",
    singular: "música",
    path: "song",
    fields: [
      { name: "name", label: "Nome da música", required: true, maxLength: 200 },
      { name: "artist_id", label: "Artista", type: "artist", required: true },
      { name: "audio", label: "Áudio (MP3)", type: "media", upload: "audio", required: true, detectDuration: true },
      { name: "image", label: "Capa", type: "media", upload: "image" },
      { name: "duration", label: "Duração (m:ss)", placeholder: "Detectada ao enviar o áudio", maxLength: 8 },
    ],
    title: (s) => s.name,
    subtitle: (s) => `${s.artist} · ${s.duration || "--:--"}`,
    image: (s) => s.image,
  },
  videos: {
    label: "Vídeos",
    singular: "vídeo",
    path: "video",
    fields: [
      { name: "title", label: "Título", required: true, maxLength: 200 },
      { name: "artist_id", label: "Artista (opcional)", type: "artist" },
      {
        name: "url",
        label: "Vídeo (link do YouTube ou arquivo MP4)",
        type: "media",
        upload: "video",
        required: true,
        placeholder: "https://www.youtube.com/watch?v=...",
      },
      { name: "thumbnail", label: "Miniatura (opcional para YouTube)", type: "media", upload: "image" },
      { name: "description", label: "Descrição", type: "textarea" },
    ],
    title: (v) => v.title,
    subtitle: (v) => v.artist || "Sem artista",
    image: (v) => videoThumbnail(v),
  },
  podcasts: {
    label: "Podcasts",
    singular: "podcast",
    path: "podcast",
    fields: [
      { name: "title", label: "Título do episódio", required: true, maxLength: 200 },
      { name: "host", label: "Programa / apresentador", maxLength: 150 },
      { name: "audio", label: "Áudio (MP3)", type: "media", upload: "audio", required: true, detectDuration: true },
      { name: "image", label: "Capa", type: "media", upload: "image" },
      { name: "duration", label: "Duração (m:ss)", placeholder: "Detectada ao enviar o áudio", maxLength: 8 },
      { name: "description", label: "Descrição", type: "textarea" },
    ],
    title: (p) => p.title,
    subtitle: (p) => `${p.host || "Podcast"} · ${p.duration || "--:--"}`,
    image: (p) => p.image,
  },
};

const ACCEPT = { image: "image/*", audio: "audio/*", video: "video/mp4,video/webm" };

const emptyForm = (fields) => Object.fromEntries(fields.map((f) => [f.name, ""]));

const MediaInput = ({ field, value, onChange, onUploaded, invalid }) => {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      const { url } = await api.upload(file, field.upload);
      onChange(url);
      onUploaded?.(url);
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <div className="media-input">
        <input
          id={`admin-${field.name}`}
          type="text"
          inputMode="url"
          value={value}
          placeholder={field.placeholder || "https://... ou envie um arquivo"}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => value && onUploaded?.(value)}
          aria-invalid={invalid}
          required={field.required}
        />
        <button type="button" className="btn btn--ghost" onClick={() => inputRef.current?.click()} disabled={uploading}>
          <FontAwesomeIcon icon={faUpload} /> {uploading ? "Enviando..." : "Enviar"}
        </button>
        <input ref={inputRef} type="file" accept={ACCEPT[field.upload]} hidden onChange={handleFile} />
      </div>
      {uploadError && <p className="form-error">{uploadError}</p>}
    </>
  );
};

const Admin = () => {
  const catalog = useCatalog();
  const [tab, setTab] = useState("artists");
  const config = RESOURCES[tab];

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(() => emptyForm(config.fields));
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState(null); // { type: "ok" | "error", text }
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("");
  const formRef = useRef(null);

  const items = catalog[tab];
  const filtered = useMemo(() => {
    const q = normalize(filter.trim());
    if (!q) return items;
    return items.filter((item) => normalize(`${config.title(item)} ${config.subtitle?.(item) ?? ""}`).includes(q));
  }, [items, filter, config]);

  const resetForm = (nextTab = tab) => {
    setEditingId(null);
    setForm(emptyForm(RESOURCES[nextTab].fields));
    setErrors({});
  };

  const switchTab = (next) => {
    setTab(next);
    setFilter("");
    setNotice(null);
    resetForm(next);
  };

  const setField = (name, value) => setForm((f) => ({ ...f, [name]: value }));

  const startEdit = (item) => {
    setEditingId(item.id);
    setForm(Object.fromEntries(config.fields.map((f) => [f.name, item[f.name] ?? ""])));
    setErrors({});
    setNotice(null);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const autoDuration = async (url) => {
    if (form.duration) return;
    const seconds = await detectMediaDuration(url);
    if (seconds) setForm((f) => (f.duration ? f : { ...f, duration: toDurationString(seconds) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    setNotice(null);
    const payload = Object.fromEntries(
      config.fields.map((f) => [f.name, typeof form[f.name] === "string" ? form[f.name].trim() : form[f.name]])
    );
    try {
      if (editingId) {
        await api.update(tab, editingId, payload);
      } else {
        await api.create(tab, payload);
      }
      await catalog.reload({ silent: true });
      setNotice({ type: "ok", text: editingId ? "Alterações salvas." : `Novo(a) ${config.singular} cadastrado(a)!` });
      resetForm();
    } catch (err) {
      setErrors(err.fields || {});
      setNotice({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    const extra =
      tab === "artists" && (catalog.songsByArtist[item.id]?.length ?? 0) > 0
        ? `\n\nAtenção: as ${catalog.songsByArtist[item.id].length} músicas deste artista também serão excluídas.`
        : "";
    if (!window.confirm(`Excluir "${config.title(item)}"?${extra}`)) return;
    try {
      await api.remove(tab, item.id);
      await catalog.reload({ silent: true });
      if (editingId === item.id) resetForm();
      setNotice({ type: "ok", text: "Item excluído." });
    } catch (err) {
      setNotice({ type: "error", text: err.message });
    }
  };

  const renderField = (field) => {
    const id = `admin-${field.name}`;
    const invalid = Boolean(errors[field.name]);
    let control;

    if (field.type === "textarea") {
      control = <textarea id={id} rows={3} value={form[field.name]} onChange={(e) => setField(field.name, e.target.value)} />;
    } else if (field.type === "artist") {
      control = (
        <select
          id={id}
          value={form[field.name]}
          onChange={(e) => setField(field.name, e.target.value)}
          required={field.required}
          aria-invalid={invalid}
        >
          <option value="">{field.required ? "Selecione..." : "— Nenhum —"}</option>
          {catalog.artists.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      );
    } else if (field.type === "media") {
      control = (
        <MediaInput
          field={field}
          value={form[field.name]}
          invalid={invalid}
          onChange={(v) => setField(field.name, v)}
          onUploaded={field.detectDuration ? autoDuration : undefined}
        />
      );
    } else {
      control = (
        <input
          id={id}
          type="text"
          value={form[field.name]}
          placeholder={field.placeholder}
          maxLength={field.maxLength}
          onChange={(e) => setField(field.name, e.target.value)}
          required={field.required}
          aria-invalid={invalid}
        />
      );
    }

    const preview = field.upload === "image" && form[field.name];

    return (
      <div className={`form-group ${field.type === "textarea" ? "form-group--wide" : ""}`} key={field.name}>
        <label htmlFor={id}>
          {field.label} {field.required && <span aria-hidden="true">*</span>}
        </label>
        {control}
        {preview && <Cover src={form[field.name]} alt="Pré-visualização" className="admin__preview" />}
        {errors[field.name] && <p className="form-error">{errors[field.name]}</p>}
      </div>
    );
  };

  return (
    <div className="main admin">
      <div className="admin__head">
        <h1 className="main__title">Painel admin</h1>
        <p className="admin__hint">Cadastre os artistas, músicas, vídeos e podcasts da cidade.</p>
      </div>

      <div className="admin__tabs" role="tablist">
        {Object.entries(RESOURCES).map(([key, r]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            className={`admin__tab ${tab === key ? "admin__tab--active" : ""}`}
            onClick={() => switchTab(key)}
          >
            {r.label} <span className="admin__count">{catalog[key].length}</span>
          </button>
        ))}
      </div>

      {tab === "songs" && catalog.artists.length === 0 && (
        <p className="form-message">Cadastre um artista antes de adicionar músicas.</p>
      )}

      <form ref={formRef} className="admin__form" onSubmit={handleSubmit}>
        <h2>{editingId ? `Editar ${config.singular}` : `Novo(a) ${config.singular}`}</h2>
        <div className="admin__grid">{config.fields.map(renderField)}</div>

        {notice && (
          <p className={notice.type === "ok" ? "form-success" : "form-message"} role="status">
            {notice.text}
          </p>
        )}

        <div className="admin__actions">
          <button type="submit" className="btn btn--primary" disabled={saving}>
            {saving ? "Salvando..." : editingId ? "Salvar alterações" : "Cadastrar"}
          </button>
          {editingId && (
            <button type="button" className="btn btn--ghost" onClick={() => resetForm()}>
              Cancelar edição
            </button>
          )}
        </div>
      </form>

      <section className="admin__list">
        <div className="admin__list-head">
          <h2>
            {config.label} cadastrados ({items.length})
          </h2>
          <input
            type="search"
            className="admin__filter"
            placeholder="Filtrar..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label={`Filtrar ${config.label.toLowerCase()}`}
          />
        </div>

        <ul className="admin__rows">
          {filtered.map((item) => (
            <li key={item.id} className={`admin__row ${editingId === item.id ? "admin__row--editing" : ""}`}>
              <Cover src={config.image(item)} alt="" label={config.title(item)} className="admin__thumb" />
              <div className="admin__row-text">
                <Link to={`/${config.path}/${item.id}`} className="admin__row-title">
                  {config.title(item)}
                </Link>
                {config.subtitle && <span className="admin__row-sub">{config.subtitle(item)}</span>}
              </div>
              <button type="button" className="btn btn--icon" onClick={() => startEdit(item)} aria-label={`Editar ${config.title(item)}`}>
                <FontAwesomeIcon icon={faPen} />
              </button>
              <button
                type="button"
                className="btn btn--icon btn--danger"
                onClick={() => handleDelete(item)}
                aria-label={`Excluir ${config.title(item)}`}
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </li>
          ))}
          {filtered.length === 0 && <li className="empty">Nenhum item.</li>}
        </ul>
      </section>
    </div>
  );
};

export default Admin;

const { useEffect, useMemo, useRef, useState } = React;

const slug = (value) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function ExporterApp() {
  const templates = window.SWIFT7_SOCIAL_TEMPLATES || [];
  const [activeId, setActiveId] = useState(templates[0]?.id || "");
  const [status, setStatus] = useState("Ready");
  const [isExporting, setIsExporting] = useState(false);
  const [selected, setSelected] = useState(null);
  const postRef = useRef(null);
  const imageInputRef = useRef(null);
  const imageTargetRef = useRef(null);
  const selectedElementRef = useRef(null);

  const active = useMemo(
    () => templates.find((template) => template.id === activeId) || templates[0],
    [activeId, templates]
  );

  useEffect(() => {
    setStatus(active ? `${active.width}x${active.height} preview ready` : "No templates found");
    setSelected(null);
    selectedElementRef.current = null;
  }, [active]);

  useEffect(() => {
    const target = postRef.current;
    if (!target) return;

    const editableSelector = [
      "h1",
      "h2",
      "h3",
      "p",
      ".eyebrow",
      ".url",
      ".tag",
      ".chip",
      ".cta",
      ".ck",
      ".quote",
      ".aname",
      ".abiz",
      ".step .num",
      ".step .stitle",
      ".step .sday",
      ".search .txt",
      ".price",
      ".avatar",
      "[style]",
    ].join(",");

    const textContainers = [
      "h1",
      "h2",
      "h3",
      "p",
      ".eyebrow",
      ".url",
      ".tag",
      ".chip",
      ".cta",
      ".ck",
      ".quote",
      ".aname",
      ".abiz",
      ".step .num",
      ".step .stitle",
      ".step .sday",
      ".search .txt",
      ".price",
      ".avatar",
    ].join(",");
    const skipClassNames = ["post", "sq", "st", "ls", "cov", "pad", "pad-st", "pad-ls", "pad-cov", "brandrow", "spacer", "shot", "checks", "steps", "step"];
    const nodes = Array.from(target.querySelectorAll(editableSelector));

    nodes.forEach((node) => {
      if (skipClassNames.some((name) => node.classList.contains(name))) return;
      if (node.querySelector("img")) return;
      if (node.children.length && !node.matches(textContainers)) return;
      if (!node.textContent.trim()) return;

      node.setAttribute("contenteditable", "true");
      node.setAttribute("spellcheck", "false");
      node.dataset.editableText = "true";
    });

    Array.from(target.querySelectorAll("img")).forEach((img) => {
      img.dataset.replaceableImage = "true";
      img.setAttribute("title", "Click to select image");
    });
  }, [activeId]);

  useEffect(() => {
    const target = postRef.current;
    if (!target) return;

    const selectElement = (element, type) => {
      target.querySelectorAll(".is-selected-editable").forEach((node) => node.classList.remove("is-selected-editable"));
      element.classList.add("is-selected-editable");
      selectedElementRef.current = element;

      if (type === "image") {
        imageTargetRef.current = element;
        const computed = window.getComputedStyle(element);
        const position = computed.objectPosition.split(" ");
        const scaleMatch = element.style.transform.match(/scale\(([^)]+)\)/);
        setSelected({
          type: "image",
          label: element.alt || "Selected image",
          scale: scaleMatch ? Math.round(Number(scaleMatch[1]) * 100) : 100,
          x: parseFloat(position[0]) || 50,
          y: parseFloat(position[1]) || 50,
        });
        setStatus("Image selected. Use the controls to replace, zoom or reposition it.");
        return;
      }

      const fontSize = parseFloat(window.getComputedStyle(element).fontSize);
      setSelected({
        type: "text",
        label: element.textContent.trim().slice(0, 34) || "Selected text",
        fontSize: Math.round(fontSize),
      });
      setStatus("Text selected. Use the font-size control to resize it.");
    };

    const onClick = (event) => {
      const image = event.target.closest?.("img[data-replaceable-image]");
      if (image && target.contains(image)) {
        event.preventDefault();
        event.stopPropagation();
        selectElement(image, "image");
        return;
      }

      const text = event.target.closest?.("[data-editable-text]");
      if (text && target.contains(text)) selectElement(text, "text");
    };

    const onFocusIn = (event) => {
      const text = event.target.closest?.("[data-editable-text]");
      if (text && target.contains(text)) selectElement(text, "text");
    };

    target.addEventListener("click", onClick);
    target.addEventListener("focusin", onFocusIn);
    return () => {
      target.removeEventListener("click", onClick);
      target.removeEventListener("focusin", onFocusIn);
    };
  }, [activeId]);

  function openImagePicker() {
    const image = selectedElementRef.current;
    if (!image || selected?.type !== "image") {
      setStatus("Select an image in the preview first");
      return;
    }
    imageTargetRef.current = image;
    imageInputRef.current?.click();
  }

  function updateTextSize(value) {
    const element = selectedElementRef.current;
    const next = Number(value);
    if (!element || selected?.type !== "text") return;
    element.style.fontSize = `${next}px`;
    setSelected((current) => ({ ...current, fontSize: next }));
  }

  function updateImageControl(key, value) {
    const image = selectedElementRef.current;
    const next = Number(value);
    if (!image || selected?.type !== "image") return;

    const updated = { ...selected, [key]: next };
    image.style.objectFit = "cover";
    image.style.objectPosition = `${updated.x}% ${updated.y}%`;
    image.style.transform = `scale(${updated.scale / 100})`;
    image.style.transformOrigin = `${updated.x}% ${updated.y}%`;
    setSelected(updated);
  }

  function resetSelectedStyle() {
    const element = selectedElementRef.current;
    if (!element || !selected) return;

    if (selected.type === "text") {
      element.style.fontSize = "";
      const fontSize = parseFloat(window.getComputedStyle(element).fontSize);
      setSelected((current) => ({ ...current, fontSize: Math.round(fontSize) }));
      return;
    }

    element.style.objectFit = "";
    element.style.objectPosition = "";
    element.style.transform = "";
    element.style.transformOrigin = "";
    setSelected((current) => ({ ...current, scale: 100, x: 50, y: 50 }));
  }

  function replaceSelectedImage(event) {
    const file = event.target.files?.[0];
    const image = imageTargetRef.current;
    event.target.value = "";
    if (!file || !image) return;
    if (!file.type.startsWith("image/")) {
      setStatus("Choose an image file to replace this image");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      image.src = reader.result;
      image.removeAttribute("srcset");
      image.style.objectFit = "cover";
      setStatus(`Replaced image in ${active.name}`);
    };
    reader.readAsDataURL(file);
  }

  if (!active) {
    return (
      <main className="exporter-empty">
        <h1>No Swift7 social templates found.</h1>
        <p>Check that SocialPosts.jsx is loading before SocialExporter.jsx.</p>
      </main>
    );
  }

  const ActivePost = active.component;

  async function waitForAssets(target = postRef.current) {
    if (document.fonts?.ready) await document.fonts.ready;
    const images = Array.from(target.querySelectorAll("img"));
    await Promise.all(images.map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.addEventListener("load", resolve, { once: true });
        img.addEventListener("error", resolve, { once: true });
      });
    }));
  }

  function createCaptureClone(template) {
    const host = document.createElement("div");
    host.className = "export-capture-host";
    host.style.width = `${template.width}px`;
    host.style.height = `${template.height}px`;

    const clone = postRef.current.cloneNode(true);
    clone.classList.add("is-exporting");
    clone.querySelectorAll("[contenteditable]").forEach((node) => {
      node.removeAttribute("contenteditable");
      node.removeAttribute("spellcheck");
      delete node.dataset.editableText;
    });

    host.appendChild(clone);
    document.body.appendChild(host);
    return host;
  }

  async function exportTemplate(template) {
    setIsExporting(true);
    setStatus(`Exporting ${template.name}...`);
    if (document.activeElement?.dataset?.editableText) document.activeElement.blur();
    setActiveId(template.id);
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    await waitForAssets();

    const captureHost = createCaptureClone(template);
    try {
      await waitForAssets(captureHost);
      const canvas = await html2canvas(captureHost, {
        backgroundColor: null,
        scale: 1,
        useCORS: true,
        allowTaint: false,
        width: template.width,
        height: template.height,
        windowWidth: template.width,
        windowHeight: template.height,
        logging: false,
      });

      const link = document.createElement("a");
      link.download = `swift7-${slug(template.name)}-${template.width}x${template.height}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      setStatus(`Downloaded ${link.download}`);
    } finally {
      captureHost.remove();
      setIsExporting(false);
    }
  }

  async function exportCurrent() {
    await exportTemplate(active);
  }

  async function exportAllSquares() {
    const squareTemplates = templates.filter((template) => template.format === "Square");
    for (const template of squareTemplates) {
      await exportTemplate(template);
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    setStatus(`Downloaded ${squareTemplates.length} square PNGs`);
  }

  return (
    <main className="exporter-shell">
      <aside className="exporter-panel">
        <div>
          <p className="exporter-kicker">Swift7 social exporter</p>
          <h1>Export branded posts as PNG.</h1>
          <p className="exporter-copy">Pick a template, check the preview, then download at native size.</p>
        </div>

        <div className="exporter-actions">
          <button className="exporter-primary" type="button" onClick={exportCurrent} disabled={isExporting}>
            Download PNG
          </button>
          <button className="exporter-secondary" type="button" onClick={exportAllSquares} disabled={isExporting}>
            Batch export squares
          </button>
          <button className="exporter-secondary" type="button" onClick={() => window.location.reload()} disabled={isExporting}>
            Reset edits
          </button>
        </div>

        <div className="exporter-status" aria-live="polite">{status}</div>
        <p className="edit-hint">Click text to edit. Click text or images to resize them. Your edits are captured in the PNG.</p>
        <input
          ref={imageInputRef}
          className="image-input"
          type="file"
          accept="image/*"
          onChange={replaceSelectedImage}
          aria-label="Replace selected post image"
        />

        <div className="edit-controls">
          <div className="edit-controls-head">
            <span>{selected ? selected.type === "text" ? "Text controls" : "Image controls" : "Resize controls"}</span>
            {selected && <button type="button" onClick={resetSelectedStyle}>Reset selected</button>}
          </div>
          {!selected && <p>Select text or an image in the preview to resize it.</p>}
          {selected?.type === "text" && (
            <label className="range-field">
              <span>Font size <b>{selected.fontSize}px</b></span>
              <input
                type="range"
                min="12"
                max="220"
                value={selected.fontSize}
                onChange={(event) => updateTextSize(event.target.value)}
              />
            </label>
          )}
          {selected?.type === "image" && (
            <>
              <button className="replace-image-btn" type="button" onClick={openImagePicker}>Replace selected image</button>
              <label className="range-field">
                <span>Zoom <b>{selected.scale}%</b></span>
                <input
                  type="range"
                  min="70"
                  max="220"
                  value={selected.scale}
                  onChange={(event) => updateImageControl("scale", event.target.value)}
                />
              </label>
              <label className="range-field">
                <span>Horizontal <b>{selected.x}%</b></span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selected.x}
                  onChange={(event) => updateImageControl("x", event.target.value)}
                />
              </label>
              <label className="range-field">
                <span>Vertical <b>{selected.y}%</b></span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selected.y}
                  onChange={(event) => updateImageControl("y", event.target.value)}
                />
              </label>
            </>
          )}
        </div>

        <div className="template-list" aria-label="Social post templates">
          {templates.map((template) => (
            <button
              key={template.id}
              className={`template-option ${template.id === active.id ? "is-active" : ""}`}
              type="button"
              onClick={() => setActiveId(template.id)}
            >
              <span>{template.name}</span>
              <small>{template.format} · {template.width}x{template.height}</small>
            </button>
          ))}
        </div>
      </aside>

      <section className="preview-area" aria-label="Selected social post preview">
        <div className="preview-meta">
          <span>{active.name}</span>
          <span>{active.width}x{active.height}</span>
        </div>
        <div
          className="preview-frame"
          style={{
            "--post-w": active.width,
            "--post-h": active.height,
            "--preview-scale": Math.min(1, 820 / active.width, 760 / active.height),
          }}
        >
          <div className="preview-scale">
            <div ref={postRef} className="capture-target">
              <ActivePost />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("exporter-root")).render(<ExporterApp />);

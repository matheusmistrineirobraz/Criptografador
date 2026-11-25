const tools = [
  {
    id: "pdf",
    title: "Gerenciador de PDF",
    description: "Junte, organize e transforme documentos.",
    category: "PDF",
    icon: "▤",
    subtitle: "Organize e transforme documentos sem sair do navegador.",
  },
  {
    id: "images",
    title: "Conversor de imagens",
    description: "Converta e redimensione arquivos em lote.",
    category: "IMAGEM",
    icon: "▧",
    subtitle: "Converta, redimensione e comprima várias imagens de uma vez.",
  },
  {
    id: "ocr",
    title: "Extrator de texto",
    description: "Transforme imagens em texto copiável.",
    category: "TEXTO",
    icon: "⌕",
    subtitle: "Reconheça texto em fotografias e documentos digitalizados.",
  },
  {
    id: "signature",
    title: "Assinatura de e-mail",
    description: "Monte uma assinatura profissional personalizada.",
    category: "UTILIDADES",
    icon: "✉",
    subtitle: "Crie uma assinatura profissional pronta para copiar.",
  },
  {
    id: "sheets",
    title: "Comparador de planilhas",
    description: "Encontre alterações entre duas planilhas.",
    category: "PLANILHAS",
    icon: "▦",
    subtitle: "Veja o que foi adicionado, removido ou alterado.",
  },
];
const page = document.querySelector("#page-content");
let activeTool = null;
let selectedFiles = [];
let convertedResults = [];
const intro = document.querySelector("#intro");
document
  .querySelector("#intro-enter")
  .addEventListener("click", () => intro.remove());
window.setTimeout(() => intro.remove(), 2900);
function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
}
function showToast(message) {
  document.querySelector("#toast-message").textContent = message;
  bootstrap.Toast.getOrCreateInstance(document.querySelector("#toast"), {
    delay: 3200,
  }).show();
}
function cardMarkup(tool) {
  return `<button class="tool-card" data-tool="${tool.id}"><span class="card-category">${tool.category}</span><span class="card-icon" aria-hidden="true">${tool.icon}</span><strong>${tool.title}</strong><p>${tool.description}</p><span class="card-open">Abrir ferramenta <span aria-hidden="true">→</span></span></button>`;
}
function renderHome() {
  activeTool = null;
  selectedFiles = [];
  page.innerHTML = `<section class="welcome"><div><p class="eyebrow">SEU KIT DE PRODUTIVIDADE</p><h1>Suas ferramentas<span>, do seu jeito.</span></h1><p>Escolha uma ferramenta para começar. Seus arquivos são processados no próprio navegador.</p></div><div class="privacy-badge"><span>●</span> Seus arquivos ficam com você</div></section><section><div class="section-head"><div><h2>Suas ferramentas</h2><p>Uma seleção para simplificar o seu trabalho.</p></div><span class="tool-count">${tools.length} ferramentas</span></div><div class="tool-grid">${tools.map(cardMarkup).join("")}</div></section><aside class="privacy-note"><span class="privacy-icon" aria-hidden="true">◈</span><div><strong>Privacidade em primeiro lugar</strong><p>Os arquivos são processados localmente e não são enviados para um servidor.</p></div></aside>`;
  page
    .querySelectorAll("[data-tool]")
    .forEach((button) =>
      button.addEventListener("click", () => renderTool(button.dataset.tool)),
    );
}
function field(label, control, hint = "") {
  return `<div class="field-wrap"><label class="form-label">${label}</label>${control}${hint ? `<span class="field-hint">${hint}</span>` : ""}</div>`;
}
function uploadBox(id, label, accept, multiple = false) {
  return `<label class="upload-area" for="${id}"><span class="upload-symbol" aria-hidden="true">↑</span><strong>${label}</strong><span>Arraste os arquivos ou <b>selecione no dispositivo</b></span><input id="${id}" type="file" accept="${accept}" ${multiple ? "multiple" : ""}></label>`;
}
function renderTool(id) {
  activeTool = id;
  selectedFiles = [];
  convertedResults = [];
  const tool = tools.find((item) => item.id === id);
  const forms = {
    pdf: pdfForm,
    images: imageForm,
    ocr: ocrForm,
    signature: signatureForm,
    sheets: sheetsForm,
  };
  page.innerHTML = `<button class="back-button" id="back-home"><span aria-hidden="true">←</span> Voltar às ferramentas</button><header class="tool-heading"><span class="card-icon" aria-hidden="true">${tool.icon}</span><div><p class="eyebrow">${tool.category}</p><h1 class="tool-title">${tool.title}</h1><p class="tool-subtitle">${tool.subtitle}</p></div></header><div class="tool-layout"><section class="form-card"><span class="local-label">● PROCESSAMENTO LOCAL</span><h2>Configurar ferramenta</h2><p class="form-intro">Selecione os arquivos e escolha como deseja continuar.</p><div id="tool-form">${forms[id]()}</div><div id="tool-status" aria-live="polite"></div><div id="tool-results" class="result-list"></div></section><aside class="tip-card"><span class="tip-symbol" aria-hidden="true">✳</span><strong>Simples e seguro</strong><p>Seus documentos são processados neste navegador. Nada é enviado para um servidor.</p><div class="tip-divider"></div><div class="tip-line"><span>✓</span> Sem instalação</div><div class="tip-line"><span>✓</span> Seus arquivos permanecem privados</div></aside></div>`;
  document.querySelector("#back-home").addEventListener("click", renderHome);
  bindForm(id);
}
function pdfForm() {
  return `${field("O que você quer fazer?", `<select class="form-select" id="pdf-operation"><option value="merge">Juntar vários PDFs</option><option value="unlock">Remover senha do PDF</option><option value="split">Separar páginas por intervalo</option><option value="reorder">Reordenar páginas</option><option value="compress">Otimizar arquivo PDF</option><option value="image-pdf">Converter imagens em PDF</option></select>`)}<div id="pdf-upload">${uploadBox("file-input", "Selecione dois ou mais PDFs", "application/pdf,.pdf", true)}</div><div id="pdf-options"></div><button class="primary-button" id="pdf-run">Processar PDF <span aria-hidden="true">→</span></button>`;
}
function imageForm() {
  return `${uploadBox("file-input", "Selecione várias imagens", "image/*", true)}<div class="form-row">${field("Formato de saída", `<select class="form-select" id="image-format"><option value="image/jpeg">JPG</option><option value="image/webp">WEBP</option><option value="image/png">PNG</option></select>`)}<div class="field-wrap"><label class="form-label" for="image-quality">Qualidade <span class="range-value" id="quality-value">82%</span></label><input class="form-range" type="range" min="30" max="100" value="82" id="image-quality"></div></div><div class="form-row">${field("Largura (px)", '<input class="form-control" id="image-width" type="number" min="1" placeholder="Original">', "Em branco: manter original")}${field("Altura (px)", '<input class="form-control" id="image-height" type="number" min="1" placeholder="Proporcional">', "Em branco: proporcional à largura")}</div><button class="primary-button" id="image-run">Converter imagens <span aria-hidden="true">→</span></button>`;
}
function ocrForm() {
  return `${uploadBox("file-input", "Selecione uma imagem para ler", "image/*")}<button class="primary-button" id="ocr-run">Extrair texto <span aria-hidden="true">→</span></button><p class="status-note mt-3">O reconhecimento usa os idiomas português e inglês. A primeira utilização pode levar alguns instantes para carregar.</p><div id="ocr-result"></div>`;
}
function signatureForm() {
  return `<div class="form-row">${field("Nome", '<input class="form-control" id="sig-name" placeholder="Seu nome">')}${field("Cargo", '<input class="form-control" id="sig-role" placeholder="Seu cargo">')}</div><div class="form-row">${field("Telefone", '<input class="form-control" id="sig-phone" placeholder="+55 11 99999-0000">')}${field("E-mail", '<input class="form-control" id="sig-email" type="email" placeholder="voce@empresa.com">')}</div>${field("Site ou link", '<input class="form-control" id="sig-site" placeholder="www.suaempresa.com.br">')}<div class="form-row">${field("Cor de destaque", '<input class="form-control color-picker" id="sig-color" type="color" value="#ff1744">')}${field("Logotipo", '<input class="form-control" id="sig-logo" type="file" accept="image/*">')}</div><div class="status-note mb-2">PRÉ-VISUALIZAÇÃO</div><div id="signature-preview" class="preview-panel"></div><div class="button-row"><button class="primary-button" id="signature-copy">Copiar HTML</button><button class="secondary-button" id="signature-download">Baixar HTML</button></div>`;
}
function sheetsForm() {
  return `<p class="status-note">Escolha duas planilhas Excel ou CSV para identificar linhas adicionadas, removidas e modificadas.</p><div class="form-row">${field("Planilha original", '<input class="form-control" id="sheet-a" type="file" accept=".xlsx,.xls,.csv">')}${field("Planilha atualizada", '<input class="form-control" id="sheet-b" type="file" accept=".xlsx,.xls,.csv">')}</div>${field("Coluna identificadora", '<input class="form-control" id="sheet-key" placeholder="Ex.: ID ou Código">', "Deixe vazio para comparar a linha inteira.")}<button class="primary-button" id="sheets-run">Comparar planilhas <span aria-hidden="true">→</span></button>`;
}
function setStatus(message, error = false) {
  document.querySelector("#tool-status").innerHTML =
    `<p class="status-message ${error ? "error" : ""}" role="status">${escapeHtml(message)}</p>`;
}
function showFiles(files) {
  selectedFiles = Array.from(files);
  let list = document.querySelector("#file-list");
  if (!list) {
    list = document.createElement("div");
    list.id = "file-list";
    document
      .querySelector("#tool-form")
      .insertBefore(
        list,
        document.querySelector("#tool-form").querySelector("button"),
      );
  }
  list.className = "file-list";
  list.innerHTML = selectedFiles
    .map(
      (file) =>
        `<div class="file-item">▧ ${escapeHtml(file.name)} <small>${(file.size / 1024 / 1024).toFixed(1)} MB</small></div>`,
    )
    .join("");
}
function bindForm(id) {
  const input = document.querySelector("#file-input");
  if (input)
    input.addEventListener("change", (event) => {
      showFiles(event.target.files);
      setStatus(`${event.target.files.length} arquivo(s) selecionado(s).`);
    });
  if (id === "pdf") bindPdf();
  if (id === "images") bindImages();
  if (id === "ocr") bindOcr();
  if (id === "signature") bindSignature();
  if (id === "sheets") bindSheets();
}
function saveBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1200);
}
function bindPdf() {
  const select = document.querySelector("#pdf-operation");
  const options = document.querySelector("#pdf-options");
  const upload = document.querySelector("#pdf-upload");
  function update() {
    const operation = select.value;
    upload.innerHTML = uploadBox(
      "file-input",
      operation === "merge"
        ? "Selecione dois ou mais PDFs"
        : operation === "image-pdf"
          ? "Selecione uma ou mais imagens"
          : "Selecione um arquivo PDF",
      operation === "image-pdf" ? "image/*" : "application/pdf,.pdf",
      operation === "merge" || operation === "image-pdf",
    );
    document
      .querySelector("#file-input")
      .addEventListener("change", (event) => {
        showFiles(event.target.files);
        setStatus(`${event.target.files.length} arquivo(s) selecionado(s).`);
      });
    options.innerHTML =
      operation === "unlock"
        ? `${field("Senha atual do PDF", '<input class="form-control" id="pdf-password" type="password" autocomplete="off" placeholder="Digite a senha do PDF">')}`
        : operation === "split"
          ? field(
              "Intervalo de páginas",
              '<input class="form-control" id="pdf-range" value="1-3">',
              "Exemplo: 2-6 exporta da página 2 até a 6.",
            )
          : operation === "reorder"
            ? field(
                "Nova ordem das páginas",
                '<input class="form-control" id="pdf-order" value="2, 1, 3">',
                "Informe a sequência separada por vírgulas.",
              )
            : "";
    selectedFiles = [];
    const list = document.querySelector("#file-list");
    if (list) list.remove();
  }
  select.addEventListener("change", update);
  update();
  document
    .querySelector("#pdf-run")
    .addEventListener("click", async (event) => {
      const button = event.currentTarget;
      const op = select.value;
      setStatus("");
      if (!selectedFiles.length) {
        setStatus("Selecione pelo menos um arquivo para continuar.", true);
        return;
      }
      button.disabled = true;
      button.textContent = "Processando…";
      try {
        if (op === "unlock") {
          const password = document.querySelector("#pdf-password").value;
          if (!password) throw Error("Informe a senha atual do PDF.");
          const qpdfModule =
            await import("https://esm.sh/@mssio/qpdf-wasm@1.1.0");
          const qpdf = await qpdfModule.createQpdf();
          try {
            const { output } = await qpdf.decrypt(selectedFiles[0], {
              password,
            });
            saveBlob(
              new Blob([output], { type: "application/pdf" }),
              selectedFiles[0].name.replace(/\.pdf$/i, "") + "-sem-senha.pdf",
            );
            setStatus(
              "Senha removida. O download do PDF sem proteção começou.",
            );
          } finally {
            qpdf.terminate();
          }
        } else if (op === "merge") {
          if (selectedFiles.length < 2)
            throw Error("Para juntar, selecione pelo menos dois PDFs.");
          const output = await PDFLib.PDFDocument.create();
          for (const file of selectedFiles) {
            const source = await PDFLib.PDFDocument.load(
              await file.arrayBuffer(),
            );
            const pages = await output.copyPages(
              source,
              source.getPageIndices(),
            );
            pages.forEach((page) => output.addPage(page));
          }
          saveBlob(
            new Blob([await output.save()], { type: "application/pdf" }),
            "documentos-juntos.pdf",
          );
          setStatus("Os arquivos foram unidos. O download começou.");
        } else if (op === "image-pdf") {
          const output = await PDFLib.PDFDocument.create();
          for (const file of selectedFiles) {
            const bytes = await file.arrayBuffer();
            const image =
              file.type === "image/png"
                ? await output.embedPng(bytes)
                : await output.embedJpg(bytes);
            const page = output.addPage([image.width, image.height]);
            page.drawImage(image, {
              x: 0,
              y: 0,
              width: image.width,
              height: image.height,
            });
          }
          saveBlob(
            new Blob([await output.save()], { type: "application/pdf" }),
            "imagens-convertidas.pdf",
          );
          setStatus("Imagens convertidas em PDF.");
        } else {
          const source = await PDFLib.PDFDocument.load(
            await selectedFiles[0].arrayBuffer(),
          );
          const count = source.getPageCount();
          let indices;
          if (op === "split") {
            const match = document
              .querySelector("#pdf-range")
              .value.match(/^\s*(\d+)\s*-\s*(\d+)\s*$/);
            if (!match) throw Error("Informe o intervalo no formato 1-3.");
            const start = Number(match[1]),
              end = Number(match[2]);
            if (start < 1 || end > count || start > end)
              throw Error(`Use um intervalo válido entre 1 e ${count}.`);
            indices = Array.from(
              { length: end - start + 1 },
              (_, i) => start - 1 + i,
            );
          } else if (op === "reorder") {
            indices = document
              .querySelector("#pdf-order")
              .value.split(",")
              .map((value) => Number(value.trim()) - 1);
            if (
              !indices.length ||
              indices.some(
                (value) =>
                  !Number.isInteger(value) || value < 0 || value >= count,
              ) ||
              new Set(indices).size !== indices.length
            )
              throw Error(
                `Informe páginas sem repetição entre 1 e ${count}, separadas por vírgula.`,
              );
          } else {
            const bytes = await source.save({ useObjectStreams: true });
            saveBlob(
              new Blob([bytes], { type: "application/pdf" }),
              selectedFiles[0].name.replace(/\.pdf$/i, "") + "-otimizado.pdf",
            );
            setStatus("PDF regravado com otimização estrutural.");
            return;
          }
          const output = await PDFLib.PDFDocument.create();
          const pages = await output.copyPages(source, indices);
          pages.forEach((page) => output.addPage(page));
          saveBlob(
            new Blob([await output.save()], { type: "application/pdf" }),
            op === "split"
              ? "paginas-separadas.pdf"
              : "paginas-reordenadas.pdf",
          );
          setStatus("Novo PDF preparado. O download começou.");
        }
      } catch (error) {
        setStatus(
          error.message || "Não foi possível processar o arquivo.",
          true,
        );
      } finally {
        button.disabled = false;
        button.innerHTML = 'Processar PDF <span aria-hidden="true">→</span>';
      }
    });
}
function bindImages() {
  document
    .querySelector("#image-quality")
    .addEventListener(
      "input",
      (event) =>
        (document.querySelector("#quality-value").textContent =
          event.target.value + "%"),
    );
  document.querySelector("#image-run").addEventListener("click", async () => {
    if (!selectedFiles.length) {
      setStatus("Selecione pelo menos uma imagem.", true);
      return;
    }
    const button = document.querySelector("#image-run");
    button.disabled = true;
    button.textContent = "Convertendo…";
    const format = document.querySelector("#image-format").value;
    const quality =
      Number(document.querySelector("#image-quality").value) / 100;
    const width = Number(document.querySelector("#image-width").value);
    const height = Number(document.querySelector("#image-height").value);
    try {
      const outputs = await Promise.all(
        selectedFiles.map(
          (file) =>
            new Promise((resolve, reject) => {
              const image = new Image();
              const source = URL.createObjectURL(file);
              image.onload = () => {
                const w = width || image.naturalWidth;
                const h =
                  height ||
                  Math.round((image.naturalHeight * w) / image.naturalWidth);
                const canvas = document.createElement("canvas");
                canvas.width = w;
                canvas.height = h;
                const context = canvas.getContext("2d");
                context.drawImage(image, 0, 0, w, h);
                canvas.toBlob(
                  (blob) => {
                    URL.revokeObjectURL(source);
                    if (!blob)
                      return reject(Error("Falha ao converter " + file.name));
                    const extension =
                      format === "image/png"
                        ? "png"
                        : format === "image/webp"
                          ? "webp"
                          : "jpg";
                    resolve({
                      name: file.name.replace(/\.[^.]+$/, "") + "." + extension,
                      blob,
                    });
                  },
                  format,
                  quality,
                );
              };
              image.onerror = () => {
                URL.revokeObjectURL(source);
                reject(Error("Não foi possível abrir " + file.name));
              };
              image.src = source;
            }),
        ),
      );
      const output = document.querySelector("#tool-results");
      output.innerHTML = outputs
        .map(
          (item, index) =>
            `<a class="result-link" download="${escapeHtml(item.name)}" href="${URL.createObjectURL(item.blob)}">${escapeHtml(item.name)} <span>Baixar ↓</span></a>`,
        )
        .join("");
      setStatus(
        `${outputs.length} imagem(ns) convertida(s) e pronta(s) para baixar.`,
      );
    } catch (error) {
      setStatus(error.message, true);
    } finally {
      button.disabled = false;
      button.innerHTML = 'Converter imagens <span aria-hidden="true">→</span>';
    }
  });
}
function bindOcr() {
  document.querySelector("#ocr-run").addEventListener("click", async () => {
    if (!selectedFiles[0]) {
      setStatus("Selecione uma fotografia ou imagem de documento.", true);
      return;
    }
    const button = document.querySelector("#ocr-run");
    button.disabled = true;
    button.textContent = "Carregando mecanismo de leitura…";
    setStatus("O reconhecimento pode levar alguns instantes.");
    try {
      const result = await Tesseract.recognize(selectedFiles[0], "por+eng", {
        logger: (message) => {
          if (message.status === "recognizing text")
            setStatus(`Lendo imagem… ${Math.round(message.progress * 100)}%`);
        },
      });
      const text = result.data.text.trim();
      document.querySelector("#ocr-result").innerHTML =
        `<div class="field-wrap mt-3"><label class="form-label" for="ocr-text">Texto reconhecido</label><textarea class="form-control text-output" id="ocr-text" rows="8">${escapeHtml(text)}</textarea></div><div class="button-row"><button class="secondary-button" id="ocr-copy">Copiar texto</button><button class="secondary-button" id="ocr-download">Exportar TXT</button></div>`;
      setStatus(
        text
          ? "Texto reconhecido. Revise o resultado antes de usar."
          : "Nenhum texto reconhecível foi encontrado.",
      );
      document
        .querySelector("#ocr-copy")
        .addEventListener("click", async () => {
          await navigator.clipboard.writeText(
            document.querySelector("#ocr-text").value,
          );
          showToast("Texto copiado.");
        });
      document
        .querySelector("#ocr-download")
        .addEventListener("click", () =>
          saveBlob(
            new Blob([document.querySelector("#ocr-text").value], {
              type: "text/plain;charset=utf-8",
            }),
            "texto-extraido.txt",
          ),
        );
    } catch (error) {
      setStatus("Não foi possível reconhecer o texto. " + error.message, true);
    } finally {
      button.disabled = false;
      button.innerHTML = 'Extrair texto <span aria-hidden="true">→</span>';
    }
  });
}
function signatureHtml() {
  const name = document.querySelector("#sig-name").value;
  const role = document.querySelector("#sig-role").value;
  const phone = document.querySelector("#sig-phone").value;
  const email = document.querySelector("#sig-email").value;
  const website = document.querySelector("#sig-site").value;
  const color = document.querySelector("#sig-color").value;
  return `<table cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;color:#172033"><tr><td style="border-left:3px solid ${color};padding-left:14px"><strong style="font-size:16px">${escapeHtml(name || "Seu nome")}</strong><br><span style="color:#5b6472">${escapeHtml(role || "Seu cargo")}</span><br>${phone ? `<a style="color:${color};text-decoration:none" href="tel:${escapeHtml(phone)}">${escapeHtml(phone)}</a><br>` : ""}${email ? `<a style="color:${color};text-decoration:none" href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a><br>` : ""}${website ? `<a style="color:${color};text-decoration:none" href="https://${escapeHtml(website.replace(/^https?:\/\//, ""))}">${escapeHtml(website)}</a>` : ""}</td></tr></table>`;
}
function bindSignature() {
  const update = () => {
    document.querySelector("#signature-preview").innerHTML =
      `<div class="signature-table">${signatureHtml()}</div>`;
  };
  [
    "sig-name",
    "sig-role",
    "sig-phone",
    "sig-email",
    "sig-site",
    "sig-color",
  ].forEach((id) =>
    document.querySelector("#" + id).addEventListener("input", update),
  );
  update();
  document
    .querySelector("#signature-copy")
    .addEventListener("click", async () => {
      await navigator.clipboard.writeText(signatureHtml());
      showToast("HTML da assinatura copiado.");
    });
  document
    .querySelector("#signature-download")
    .addEventListener("click", () =>
      saveBlob(
        new Blob([`<!doctype html><meta charset="utf-8">${signatureHtml()}`], {
          type: "text/html;charset=utf-8",
        }),
        "assinatura-email.html",
      ),
    );
  document.querySelector("#sig-logo").addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file)
      showToast(
        "Logo selecionado. A visualização compacta da assinatura não exibe a imagem.",
      );
  });
}
async function readSheet(file) {
  const bytes = await file.arrayBuffer();
  const workbook = XLSX.read(bytes, { type: "array" });
  return XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {
    defval: "",
  });
}
function bindSheets() {
  document.querySelector("#sheets-run").addEventListener("click", async () => {
    const a = document.querySelector("#sheet-a").files[0],
      b = document.querySelector("#sheet-b").files[0];
    if (!a || !b) {
      setStatus("Selecione as duas planilhas para comparar.", true);
      return;
    }
    try {
      const [before, after] = await Promise.all([readSheet(a), readSheet(b)]);
      const key = document.querySelector("#sheet-key").value.trim();
      const getKey = (row, index) =>
        key ? String(row[key] ?? "") : JSON.stringify(row);
      const oldMap = new Map(
        before.map((row, index) => [getKey(row, index), row]),
      );
      const newMap = new Map(
        after.map((row, index) => [getKey(row, index), row]),
      );
      const added = [...newMap].filter(([id]) => !oldMap.has(id));
      const removed = [...oldMap].filter(([id]) => !newMap.has(id));
      const changed = [...newMap].filter(
        ([id, row]) =>
          oldMap.has(id) &&
          JSON.stringify(row) !== JSON.stringify(oldMap.get(id)),
      );
      const lines = [
        ...added.map(([, row]) => ({ status: "Adicionado", ...row })),
        ...removed.map(([, row]) => ({ status: "Removido", ...row })),
        ...changed.map(([, row]) => ({ status: "Alterado", ...row })),
      ];
      const output = document.querySelector("#tool-results");
      if (lines.length) {
        const sheet = XLSX.utils.json_to_sheet(lines);
        const book = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(book, sheet, "Comparação");
        const data = XLSX.write(book, { bookType: "xlsx", type: "array" });
        const url = URL.createObjectURL(
          new Blob([data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          }),
        );
        output.innerHTML = `<a class="result-link" download="comparacao-planilhas.xlsx" href="${url}">Baixar relatório da comparação <span>↓</span></a>`;
      }
      setStatus(
        `Comparação concluída: ${added.length} adicionada(s), ${removed.length} removida(s) e ${changed.length} alterada(s).`,
      );
    } catch (error) {
      setStatus(
        "Não foi possível comparar as planilhas. " + error.message,
        true,
      );
    }
  });
}
renderHome();

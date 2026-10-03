// build.js — arma el sitio a partir de content/ y lo deja listo en la carpeta SALIDA (public/ por defecto)
//
//   npm run build   → genera la carpeta public/
//   npm start       → genera y además lo sirve en http://localhost:8080
//
// Lógica, en cuatro pasos:
//   1. Leer cada .md de content/<idioma>/ (frontmatter + texto)
//   2. Convertir el texto de markdown a HTML
//   3. Meterlo en la plantilla (cabecera con menú, pie)
//   4. Escribir el resultado en public/

import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';
import footnote from 'markdown-it-footnote';

// ───────────────────────── Configuración ─────────────────────────

// Carpeta donde queda el sitio terminado. Para publicar con GitHub Pages desde
// la rama principal, poné 'docs' (Pages solo sabe servir la raíz o /docs, no /public).
const SALIDA = 'docs';

const SITE = {
  title: 'Idalina Insfrán',
  // Si el sitio va a vivir en una subcarpeta (ej. midominio.com/peritaje), poné '/peritaje'.
  base: '',
  idiomaPrincipal: 'es',
  // Tipografía: nombre del paquete de @fontsource-variable (npm install @fontsource-variable/NOMBRE).
  // Para probar otra: instalala, cambiá este nombre y corré npm run build.
  fuente: 'ibm-plex-sans',
};

// Textos de la interfaz y comillas tipográficas de cada idioma.
const IDIOMAS = {
  es: {
    nombre: 'Español',
    locale: 'es-PY',
    articulos: 'Artículos',
    rutaArticulos: 'articulos',
    modoOscuro: 'Modo oscuro',
    modoClaro: 'Modo claro',
    noEncontrada: 'Página no encontrada',
    quotes: ['«', '»', '‹', '›'],
  },
  en: {
    nombre: 'English',
    locale: 'en-GB',
    articulos: 'Articles',
    rutaArticulos: 'articles',
    modoOscuro: 'Dark mode',
    modoClaro: 'Light mode',
    noEncontrada: 'Page not found',
    quotes: ['“', '”', '‘', '’'],
  },
};

// ───────────────────────── 1. Leer el contenido ─────────────────────────

function leerContenido() {
  const sitio = {};

  for (const lang of Object.keys(IDIOMAS)) {
    const carpeta = path.join('content', lang);
    if (!fs.existsSync(carpeta)) continue;

    sitio[lang] = [];

    for (const archivo of fs.readdirSync(carpeta)) {
      if (!archivo.endsWith('.md')) continue;

      const { data, content } = matter(fs.readFileSync(path.join(carpeta, archivo), 'utf8'));
      if (data.draft) continue;

      // "detalles.es.md" → "detalles"
      const slug = archivo.replace(/(\.[a-z]{2})?\.md$/, '');
      const categorias = [].concat(data.categories || []);

      sitio[lang].push({
        lang,
        slug,
        titulo: data.title || slug,
        nav: data.nav || data.title || slug, // texto corto para el menú
        fecha: data.date ? new Date(data.date) : null,
        peso: data.weight ?? 999,
        esArticulo: categorias.includes('post'),
        enMenu: data.menu === 'topnav',
        markdown: content,
      });
    }
  }
  return sitio;
}

// ───────────────────────── 2. Markdown → HTML ─────────────────────────

function crearConversor(lang) {
  const md = new MarkdownIt({ html: true, typographer: true, quotes: IDIOMAS[lang].quotes });
  md.use(footnote);
  return md;
}

// ───────────────────────── Ayudas pequeñas ─────────────────────────

const escapar = (t) =>
  String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function formatearFecha(fecha, lang) {
  return fecha.toLocaleDateString(IDIOMAS[lang].locale, { dateStyle: 'long', timeZone: 'UTC' });
}

// ───────────────────────── 3. Plantilla ─────────────────────────

function plantilla({ lang, titulo, cuerpo, menu, urlActual, otrosIdiomas, descripcion }) {
  const L = IDIOMAS[lang];
  const base = SITE.base;

  const enlacesMenu = menu
    .map((m) => {
      const actual = m.url === urlActual ? ' aria-current="page"' : '';
      return `<a href="${m.url}"${actual}>${escapar(m.texto)}</a>`;
    })
    .join('\n      ');

  const enlacesIdioma = otrosIdiomas
    .map((o) => `<a href="${o.url}" lang="${o.lang}" hreflang="${o.lang}">${IDIOMAS[o.lang].nombre}</a>`)
    .join('');

  const tituloPagina = titulo === SITE.title ? SITE.title : `${titulo} — ${SITE.title}`;
  const meta = descripcion ? `<meta name="description" content="${escapar(descripcion)}">` : '';

  return `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapar(tituloPagina)}</title>
  ${meta}
  <meta name="color-scheme" content="light dark">
  <script>
    // Aplica el modo elegido antes de pintar la página, así no parpadea.
    try { var t = localStorage.getItem('tema'); if (t) document.documentElement.dataset.theme = t; } catch (e) {}
  </script>
  <link rel="stylesheet" href="${base}/style.css">
</head>
<body>
  <header class="columna">
    <a class="marca" href="${menu[0] ? menu[0].urlInicio : base + '/' + lang + '/'}">${escapar(SITE.title)}</a>
    <nav aria-label="Menú">
      ${enlacesMenu}
    </nav>
    <div class="opciones">
      ${enlacesIdioma}
      <button id="tema" type="button" data-oscuro="${escapar(L.modoOscuro)}" data-claro="${escapar(L.modoClaro)}">${escapar(L.modoOscuro)}</button>
    </div>
  </header>

  <main class="columna">
${cuerpo}
  </main>

  <footer class="columna">© ${new Date().getFullYear()} ${escapar(SITE.title)}</footer>

  <script>
    // Botón de modo oscuro/claro: recuerda la elección en el navegador.
    (function () {
      var boton = document.getElementById('tema');
      var raiz = document.documentElement;
      function actual() {
        return raiz.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      }
      function etiqueta() {
        boton.textContent = actual() === 'dark' ? boton.dataset.claro : boton.dataset.oscuro;
      }
      boton.addEventListener('click', function () {
        var nuevo = actual() === 'dark' ? 'light' : 'dark';
        raiz.dataset.theme = nuevo;
        try { localStorage.setItem('tema', nuevo); } catch (e) {}
        etiqueta();
      });
      etiqueta();
    })();
  </script>
</body>
</html>
`;
}

// ───────────────────────── 4. Escribir archivos ─────────────────────────

// escribirPagina('/es/detalles/', html) → public/es/detalles/index.html
function escribirPagina(urlRelativa, html) {
  const destino = path.join(SALIDA, urlRelativa, 'index.html');
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, html);
}

function copiarRecursos() {
  fs.copyFileSync('assets/style.css', path.join(SALIDA, 'style.css'));

  // Tipografía: se copia desde el paquete instalado, sin pedir nada a servidores externos.
  // Siempre queda como fonts/texto-normal.woff2 y fonts/texto-italic.woff2, que es lo que lee style.css.
  const origen = `node_modules/@fontsource-variable/${SITE.fuente}/files`;
  fs.mkdirSync(path.join(SALIDA, 'fonts'), { recursive: true });
  for (const estilo of ['normal', 'italic']) {
    fs.copyFileSync(
      path.join(origen, `${SITE.fuente}-latin-wght-${estilo}.woff2`),
      path.join(SALIDA, 'fonts', `texto-${estilo}.woff2`)
    );
  }
}

// ───────────────────────── Armado general ─────────────────────────

function construir() {
  fs.rmSync(SALIDA, { recursive: true, force: true });
  fs.mkdirSync(SALIDA, { recursive: true });

  const sitio = leerContenido();
  const base = SITE.base;

  // Para cada idioma averiguamos cuál es su "inicio" (la página del menú con menor peso)
  // y cómo se llama la URL de cada página.
  const info = {};
  for (const lang of Object.keys(sitio)) {
    const items = sitio[lang];
    const delMenu = items.filter((i) => i.enMenu && !i.esArticulo).sort((a, b) => a.peso - b.peso);
    const inicio = delMenu[0] || items.find((i) => !i.esArticulo);
    const articulos = items
      .filter((i) => i.esArticulo)
      .sort((a, b) => (b.fecha || 0) - (a.fecha || 0));

    const urlInicio = `${base}/${lang}/`;
    const urlDe = (item) => (item === inicio ? urlInicio : `${base}/${lang}/${item.slug}/`);
    const urlArticulos = `${base}/${lang}/${IDIOMAS[lang].rutaArticulos}/`;

    // Menú: las páginas con "menu: topnav" por peso, y al final "Artículos" si hay.
    const menu = delMenu.map((i) => ({ texto: i.nav, url: urlDe(i), urlInicio }));
    if (articulos.length) {
      menu.push({ texto: IDIOMAS[lang].articulos, url: urlArticulos, urlInicio });
    }

    info[lang] = { items, inicio, articulos, menu, urlInicio, urlDe, urlArticulos };
  }

  // Dado un idioma y un slug, a dónde lleva el enlace "English"/"Español":
  // a la misma página si existe en el otro idioma; si no, a su inicio.
  function enlacesOtrosIdiomas(langActual, slug, esArticulos = false) {
    const lista = [];
    for (const otro of Object.keys(info)) {
      if (otro === langActual) continue;
      let url = info[otro].urlInicio;
      if (esArticulos && info[otro].articulos.length) {
        url = info[otro].urlArticulos;
      } else {
        const gemela = info[otro].items.find((i) => i.slug === slug);
        if (gemela) url = info[otro].urlDe(gemela);
      }
      lista.push({ lang: otro, url });
    }
    return lista;
  }

  for (const lang of Object.keys(info)) {
    const { items, articulos, menu, urlDe, urlArticulos } = info[lang];
    const md = crearConversor(lang);

    // Una página por cada archivo .md
    for (const item of items) {
      const url = urlDe(item);
      const fecha =
        item.esArticulo && item.fecha
          ? `<p class="fecha"><time datetime="${item.fecha.toISOString().slice(0, 10)}">${formatearFecha(item.fecha, lang)}</time></p>`
          : '';
      const cuerpo = `    <article>
      <h1>${escapar(item.titulo)}</h1>
      ${fecha}
${md.render(item.markdown)}
    </article>`;

      const html = plantilla({
        lang,
        titulo: item.titulo,
        cuerpo,
        menu,
        urlActual: url,
        otrosIdiomas: enlacesOtrosIdiomas(lang, item.slug),
      });
      escribirPagina(url.slice(base.length), html);
    }

    // Índice de artículos
    if (articulos.length) {
      const lista = articulos
        .map(
          (a) =>
            `      <li><a href="${urlDe(a)}">${escapar(a.titulo)}</a>` +
            (a.fecha ? ` <time datetime="${a.fecha.toISOString().slice(0, 10)}">${formatearFecha(a.fecha, lang)}</time>` : '') +
            `</li>`
        )
        .join('\n');
      const cuerpo = `    <h1>${escapar(IDIOMAS[lang].articulos)}</h1>\n    <ul class="indice">\n${lista}\n    </ul>`;

      const html = plantilla({
        lang,
        titulo: IDIOMAS[lang].articulos,
        cuerpo,
        menu,
        urlActual: urlArticulos,
        otrosIdiomas: enlacesOtrosIdiomas(lang, null, true),
      });
      escribirPagina(urlArticulos.slice(base.length), html);
    }
  }

  // Página 404
  const l = SITE.idiomaPrincipal;
  fs.writeFileSync(
    path.join(SALIDA, '404.html'),
    plantilla({
      lang: l,
      titulo: IDIOMAS[l].noEncontrada,
      cuerpo: `    <h1>${IDIOMAS[l].noEncontrada}</h1>\n    <p><a href="${info[l].urlInicio}">←</a></p>`,
      menu: info[l].menu,
      urlActual: '',
      otrosIdiomas: [],
    })
  );

  // Raíz del sitio: manda a /es/ o /en/ según el idioma del navegador.
  const otros = Object.keys(info).filter((x) => x !== l);
  fs.writeFileSync(
    path.join(SALIDA, 'index.html'),
    `<!doctype html>
<html lang="${l}"><head><meta charset="utf-8">
<meta http-equiv="refresh" content="0; url=${base}/${l}/">
<title>${escapar(SITE.title)}</title>
<script>
  var otros = ${JSON.stringify(otros)};
  var pref = (navigator.language || '').slice(0, 2);
  location.replace('${base}/' + (otros.indexOf(pref) >= 0 ? pref : '${l}') + '/');
</script></head>
<body><a href="${base}/${l}/">${escapar(SITE.title)}</a></body></html>
`
  );

  copiarRecursos();

  const total = Object.values(info).reduce((n, x) => n + x.items.length, 0);
  console.log(`Listo: ${total} páginas en ${SALIDA}/`);
}

// ───────────────────────── Servidor de prueba (opcional) ─────────────────────────

function servir(puerto = 8080) {
  const tipos = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.woff2': 'font/woff2',
  };
  http
    .createServer((req, res) => {
      let ruta = decodeURIComponent(req.url.split('?')[0]);
      if (ruta.endsWith('/')) ruta += 'index.html';
      const archivo = path.join(SALIDA, path.normalize(ruta));
      if (!archivo.startsWith(SALIDA) || !fs.existsSync(archivo)) {
        res.writeHead(404, { 'Content-Type': tipos['.html'] });
        return res.end(fs.readFileSync(path.join(SALIDA, '404.html')));
      }
      res.writeHead(200, { 'Content-Type': tipos[path.extname(archivo)] || 'application/octet-stream' });
      res.end(fs.readFileSync(archivo));
    })
    .listen(puerto, () => console.log(`Abrí http://localhost:${puerto}  (Ctrl+C para cortar)`));
}

construir();
if (process.argv.includes('--serve')) servir();

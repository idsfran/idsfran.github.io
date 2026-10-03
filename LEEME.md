# Sitio

    npm install        (una sola vez)
    npm run build      genera la carpeta public/ (esa es la que se sube)
    npm start          genera y sirve en http://localhost:8080

- Contenido: content/es/ y content/en/ (archivos NOMBRE.es.md / NOMBRE.en.md).
- Menú: las páginas con `menu: topnav` en el frontmatter, ordenadas por `weight`.
  La de menor `weight` es el inicio. `nav: "Texto corto"` es opcional (si no, usa `title`).
- "Artículos" aparece solo si hay archivos con `categories: ["post"]`.
- Nombre del sitio, idiomas y textos: arriba de build.js.
- Colores y estilo: assets/style.css (el acento es --acento, arriba de todo).
- Tipografía: `fuente` en build.js (IBM Plex Sans). Para probar otra: `npm install @fontsource-variable/NOMBRE`, cambiás el nombre y `npm run build`.
- Borradores: `draft: true` en el frontmatter oculta la página (es/about.es.md está así hasta que la escribas).

## Publicar en GitHub Pages (idsfran.github.io)
GitHub Pages sirve la raíz del repo o la carpeta /docs, no /public.
1. En build.js poné `const SALIDA = 'docs';`
2. `npm run build`, y subí todo el proyecto (el .gitignore deja afuera node_modules).
3. En el repo: Settings → Pages → Branch: main, carpeta /docs.
El repo tiene que llamarse idsfran.github.io.

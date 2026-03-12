# Lift – Landing del grupo juvenil

Sitio de presentación para **Lift** (Amor en comunión y verdad). Single-page con HTML, CSS y JavaScript; fondo 3D con Three.js, tema día/noche y sección de versículos bíblicos.

## Contenido

- **Inicio:** hero con fondo de nodos 3D (teal/negro).
- **Nosotros / Por qué nosotros / Versículos / Contacto:** secciones en la misma página.
- **Tema claro/oscuro:** botón en la cabecera; preferencia guardada en `localStorage`.
- **Versículos:** verso del día (card con flip), “Descubre otro verso”, copiar y grid de versículos desde `data/verses.json`.

## Cómo abrirlo en local

1. Clona o descarga el proyecto y entra en la carpeta:
   ```bash
   cd lift-landing
   ```
2. Sirve los archivos con un servidor local (para que `fetch('data/verses.json')` funcione):
   - **Node:** `npx serve .` o `npx http-server -p 8080`
   - **Python 3:** `python -m http.server 8080`
   - **VS Code:** extensión "Live Server" y "Open with Live Server" en `index.html`
3. Abre en el navegador la URL que indique el servidor (ej. `http://localhost:3000` o `http://localhost:8080`).

Abrir `index.html` directamente desde el disco puede dar error al cargar `data/verses.json` por CORS.

## Estructura

```
lift-landing/
├── index.html          # Página única con todas las secciones
├── css/                # variables, base, layout, components, sections, theme
├── js/                 # main, theme-toggle, scene3d, verses, contact
├── data/
│   └── verses.json     # Lista de versículos (id, reference, text, theme)
├── assets/
│   ├── images/         # Añade aquí logo-lift.png si lo tienes
│   ├── fonts/          # Opcional: fuentes locales
│   └── favicon.svg
└── README.md
```

## Desplegar

- **GitHub Pages:** sube la carpeta a un repo y activa Pages (origen: rama `main`, carpeta `/root` o la que contenga `index.html`).
- **Netlify / Vercel:** arrastra la carpeta o conecta el repo; no hace falta build.
- **Formulario de contacto:** para recibir mensajes, configura [Formspree](https://formspree.io) o Netlify Forms y pon en `index.html` el `action` del formulario que corresponda.

## Paleta (logo)

- Primario: `#0a0a0a`
- Acento: `#00b4d8` / `#00ced1`
- Fondos: claro `#f8fafb`, oscuro `#0f1419` / `#1a2332`

## Tecnologías

- HTML5, CSS3 (custom properties, Grid, Flexbox)
- JavaScript ES6+ (vanilla)
- Three.js r129 (CDN) para el fondo de partículas 3D

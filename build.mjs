import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { Marked } from 'marked';
import { codeToHtml } from 'shiki';
import { imageSize } from 'image-size';

const SITE = {
  title: 'rawley.me',
  url: 'https://rawley.me',
  author: 'Christian Rawley',
  description: 'Personal site of Christian Rawley: projects, writing and notes.',
  links: [
    ['github', 'https://github.com/ChristianRawley'],
    ['linkedin', 'https://www.linkedin.com/in/christian-rawley'],
    ['email', 'mailto:christian@rawley.me'],
  ],
};

const DIRS = {
  out: 'dist',
  static: 'static',
  pages: 'content/pages',
};

const NAV = [
  ['Home', '/'],
  ['Projects', '/projects/'],
  ['Blog', '/blog/'],
  ['About', '/about/'],
];

const COLLECTIONS = [
  {
    type: 'project',
    dir: 'content/projects',
    url: '/projects/',
    title: 'Projects',
    items: 'projects',
    empty: `Projects are on the way. In the meantime, my code lives on <a href="${SITE.links[0][1]}">GitHub</a>.`,
    homeLimit: 3,
    homeTitle: 'Featured projects',
    homeFilter: (e) => e.meta.featured === 'true',
  },
  {
    type: 'post',
    dir: 'content/posts',
    url: '/blog/',
    title: 'Blog',
    items: 'posts',
    empty: 'Nothing here yet.',
    homeLimit: 5,
    homeTitle: 'Latest posts',
  },
];

const DRAFTS = process.argv.includes('--drafts');

const LABELS = { github: 'GitHub', linkedin: 'LinkedIn', email: 'Email' };
const icon = (inner, cls = '') =>
  `<svg${cls ? ` class="${cls}"` : ''} viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">${inner}</svg>`;
const ICONS = {
  github: icon(
    '<path fill="currentColor" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>',
  ),
  linkedin: icon(
    '<path fill="currentColor" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>',
  ),
  sun: icon(
    '<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/></g>',
    'sun',
  ),
  moon: icon(
    '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
    'moon',
  ),
  external: icon(
    '<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6"/><path d="M20 4 10 14"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></g>',
    'external',
  ),
  email: icon(
    '<rect x="2" y="4" width="20" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M2.5 6.5 12 13.5l9.5-7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
  ),
};

const THEME_INIT = `try{var t=localStorage.getItem('theme');if(t)document.documentElement.dataset.theme=t}catch(e){}`;

const THEME_TOGGLE = `(function(){var b=document.getElementById('theme');if(!b)return;var r=document.documentElement;
function cur(){return r.dataset.theme||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')}
function label(){var to=cur()==='dark'?'light':'dark';b.dataset.to=to;b.title=b.ariaLabel='Switch to '+to+' mode'}
b.hidden=false;label();
b.addEventListener('click',function(){var n=cur()==='dark'?'light':'dark';r.dataset.theme=n;try{localStorage.setItem('theme',n)}catch(e){}label()})})();`;

const LIGHTBOX = `if(document.querySelector('main img')){
var imgs=[].filter.call(document.querySelectorAll('main img'),function(i){return!i.closest('a')});
if(imgs.length){
imgs.forEach(function(i){i.classList.add('zoomable');i.tabIndex=0;i.setAttribute('role','button');i.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();i.click()}})});
var l=document.createElement('link');l.rel='stylesheet';l.href='/vendor/photoswipe/photoswipe.css';document.head.appendChild(l);
var base='/vendor/photoswipe/';
import(base+'photoswipe-lightbox.esm.min.js').then(function(m){
var lb=new m.default({gallery:'main',children:'img.zoomable',pswpModule:function(){return import(base+'photoswipe.esm.min.js')},bgOpacity:0.92,wheelToZoom:true,showHideAnimationType:'zoom'});
lb.addFilter('domItemData',function(d,el){d.src=el.currentSrc||el.src;d.w=+el.getAttribute('width')||el.naturalWidth;d.h=+el.getAttribute('height')||el.naturalHeight;d.alt=el.alt;return d});
lb.init()})}}`;

const theme = {
  header: (path) => {
    const current = (href) => (href === '/' ? path === '/' : path.startsWith(href));
    const links = NAV.map(([name, href]) => `<a href="${href}"${current(href) ? ' aria-current="page"' : ''}>${name}</a>`);
    return `<header>
    <a class="site" href="/">${SITE.title}</a>
    <nav aria-label="Primary">${links.join(' ')}</nav>
  </header>`;
  },

  footer: () => {
    const links = SITE.links.map(
      ([name, href]) => `<a href="${esc(href)}" aria-label="${LABELS[name] || name}" title="${LABELS[name] || name}">${ICONS[name] || name}</a>`,
    );
    return `<footer>
    <span>&copy; ${new Date().getFullYear()} ${SITE.author}</span>
    <nav class="links" aria-label="Elsewhere">${links.join(' ')} <button id="theme" type="button" hidden>${ICONS.sun}${ICONS.moon}</button></nav>
  </footer>`;
  },

  layout: ({ title, description = SITE.description, body, path = '', type = 'website', published, noindex, jsonld }) => {
    const fullTitle = title ? `${esc(title)} - ${SITE.title}` : SITE.title;
    const url = SITE.url + path;
    const head = [
      `<title>${fullTitle}</title>`,
      `<meta name="description" content="${esc(description)}">`,
      `<meta name="author" content="${esc(SITE.author)}">`,
      noindex ? `<meta name="robots" content="noindex">` : `<link rel="canonical" href="${url}">`,
      `<meta property="og:site_name" content="${esc(SITE.title)}">`,
      `<meta property="og:type" content="${type}">`,
      `<meta property="og:title" content="${fullTitle}">`,
      `<meta property="og:description" content="${esc(description)}">`,
      noindex ? '' : `<meta property="og:url" content="${url}">`,
      published ? `<meta property="article:published_time" content="${published}">` : '',
      `<meta name="twitter:card" content="summary">`,
      jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, '\\u003c')}</script>` : '',
    ].filter(Boolean);
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <meta name="theme-color" content="#f6f1e6" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#1c1915" media="(prefers-color-scheme: dark)">
  ${head.join('\n  ')}
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="preload" href="/fonts/literata-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="/style.css">
  <script>${THEME_INIT}</script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<div id="page">
  ${theme.header(path)}
  <main id="main">
${body}
  </main>
  ${theme.footer()}
</div>
<script>${THEME_TOGGLE}</script>
<script type="module">${LIGHTBOX}</script>
</body>
</html>
`;
  },

  entryList: (entries) =>
    `<ul class="posts">\n${entries
      .map(
        (e) =>
          `  <li><a href="${e.url}"><span>${esc(e.title)}</span>${e.date ? timeTag(e.date) : ''}${e.description ? `<small>${esc(e.description)}</small>` : ''}</a></li>`,
      )
      .join('\n')}\n</ul>`,

  entry: (e, c, all, i) => {
    if (c.type === 'project') {
      const meta = e.tech.length ? esc(e.tech.join(', ')) : '';
      const link = e.link
        ? `<p class="project-link"><a target="_blank" rel="noopener" href="${esc(e.link)}"><span>${esc(linkLabel(e.link))}</span>${ICONS.external}</a></p>\n`
        : '';
      return `<p class="crumb"><a href="${c.url}">All ${c.items}</a></p>
<article>
<h1>${esc(e.title)}</h1>
${e.description ? `<p class="lede">${esc(e.description)}</p>\n` : ''}${meta ? `<p class="meta">${meta}</p>\n` : ''}${link}${e.html}
</article>`;
    }
    const meta = [timeTag(e.date), `${e.minutes} min read`, e.updated && `Updated ${timeTag(e.updated)}`].filter(Boolean);
    const older = all[i + 1];
    const newer = all[i - 1];
    const pager =
      older || newer
        ? `\n<nav class="pager" aria-label="More ${c.items}">
  ${older ? `<a class="prev" rel="prev" href="${older.url}"><small>Older</small><span>${esc(older.title)}</span></a>` : ''}
  ${newer ? `<a class="next" rel="next" href="${newer.url}"><small>Newer</small><span>${esc(newer.title)}</span></a>` : ''}
</nav>`
        : '';
    return `<p class="crumb"><a href="${c.url}">All ${c.items}</a></p>
<article>
<h1>${esc(e.title)}</h1>
<p class="meta">${meta.join(' &middot; ')}</p>
${e.html}
</article>${pager}`;
  },

  collectionIndex: (c, entries) =>
    `<h1>${esc(c.title)}</h1>\n${entries.length ? theme.entryList(entries) : `<p>${c.empty}</p>`}`,

  homeSection: (c, entries) =>
    `\n<div class="section-head"><h2>${esc(c.homeTitle)}</h2><a href="${c.url}">All ${c.items}</a></div>\n${theme.entryList(entries)}`,
};

const built = new Date().toISOString().slice(0, 10);
const warnings = [];
const sitemap = []; // [url, lastmod?]

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const unesc = (s) =>
  s.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

const fmtDate = (d) =>
  new Date(`${d}T00:00:00Z`).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });

const linkLabel = (url) => {
  try {
    const u = new URL(url);
    return (u.hostname.replace(/^www\./, '') + u.pathname).replace(/\/$/, '');
  } catch {
    return url;
  }
};

const timeTag = (d) => `<time datetime="${d}">${fmtDate(d)}</time>`;

const plainText = (html) =>
  unesc(
    html
      .replace(/<pre[\s\S]*?<\/pre>/g, ' ')
      .replace(/<\/(p|li|h\d|div|tr|td|th|blockquote)>|<br\s*\/?>/g, ' ')
      .replace(/<[^>]+>/g, ''),
  )
    .replace(/\s+/g, ' ')
    .trim();

const list = (v) =>
  (Array.isArray(v) ? v : v ? String(v).split(',') : []).map((s) => String(s).trim()).filter(Boolean);

function parse(src) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { meta: {}, body: src };
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(':');
    if (i <= 0) continue;
    const value = line.slice(i + 1).trim();
    const arr = value.match(/^\[(.*)\]$/);
    meta[line.slice(0, i).trim()] = arr ? list(arr[1]) : value.replace(/^["']|["']$/g, '');
  }
  return { meta, body: m[2] };
}

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/&[#\w]+;/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-');

const SHIKI = { themes: { light: 'github-light-high-contrast', dark: 'github-dark-high-contrast' }, defaultColor: false };

async function markdown(src) {
  const seen = new Map();
  const md = new Marked({
    async: true,
    renderer: {
      heading({ tokens, depth }) {
        const inner = this.parser.parseInline(tokens);
        if (depth < 2) return `<h${depth}>${inner}</h${depth}>\n`;
        const base = slugify(inner.replace(/<[^>]+>/g, '')) || 'section';
        const n = seen.get(base) ?? 0;
        seen.set(base, n + 1);
        const id = n ? `${base}-${n}` : base;
        return `<h${depth} id="${id}">${inner} <a class="anchor" href="#${id}" aria-label="Link to this section">#</a></h${depth}>\n`;
      },
      link({ href, title, tokens }) {
        const text = this.parser.parseInline(tokens);
        const external = /^https?:\/\//.test(href) && !href.startsWith(SITE.url);
        return `<a href="${esc(href)}"${title ? ` title="${esc(title)}"` : ''}${external ? ' target="_blank" rel="noopener"' : ''}>${text}</a>`;
      },
    },
    async walkTokens(token) {
      if (token.type !== 'code') return;
      const lang = (token.lang || '').split(/\s+/)[0] || 'text';
      let html;
      try {
        html = await codeToHtml(token.text, { ...SHIKI, lang });
      } catch {
        html = await codeToHtml(token.text, { ...SHIKI, lang: 'text' });
      }
      token.type = 'html';
      token.text = html;
    },
  });
  return enhanceImages(await md.parse(src));
}

// Adds width/height (read from the file in static/, so the browser reserves space
// before the image loads) and lazy loading to every <img>. The first image in a
// document loads right away since it's usually at the top of the page.
async function enhanceImages(html) {
  const sizes = new Map(); // src -> [width, height]
  for (const [, src] of html.matchAll(/<img\b[^>]*?\ssrc="(\/[^"/][^"]*)"/g)) {
    if (sizes.has(src)) continue;
    try {
      const file = path.join(DIRS.static, decodeURIComponent(src.split(/[?#]/)[0]));
      const { width, height, orientation } = imageSize(await fs.readFile(file));
      sizes.set(src, orientation >= 5 ? [height, width] : [width, height]); // phone photos can be rotated by EXIF
    } catch {} // missing file: the link check reports it
  }
  let n = 0;
  return html.replace(/<img\b[^>]*>/g, (tag) => {
    const src = tag.match(/\ssrc="([^"]*)"/)?.[1];
    const dims = sizes.get(src);
    const add = [
      dims && !/\swidth=/.test(tag) ? `width="${dims[0]}" height="${dims[1]}"` : '',
      n++ > 0 && !/\sloading=/.test(tag) ? 'loading="lazy"' : '',
      /\sdecoding=/.test(tag) ? '' : 'decoding="async"',
    ].filter(Boolean);
    return add.length ? tag.replace(/^<img/, `<img ${add.join(' ')}`) : tag;
  });
}

async function readMarkdown(dir) {
  let files = [];
  try {
    files = (await fs.readdir(dir)).filter((f) => f.endsWith('.md'));
  } catch {}
  return Promise.all(
    files.map(async (f) => {
      const file = path.join(dir, f);
      const { meta, body } = parse(await fs.readFile(file, 'utf8'));
      return { slug: f.replace(/\.md$/, ''), file, meta, html: await markdown(body) };
    }),
  );
}

async function write(file, content) {
  const p = path.join(DIRS.out, file);
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, content);
}

function checkDate(value, file, key) {
  if (!value) return undefined;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value))) {
    throw new Error(`${file}: ${key} "${value}" is not a valid YYYY-MM-DD date`);
  }
  return value;
}

function excerpt(html) {
  const p = html.match(/<p>([\s\S]*?)<\/p>/);
  if (!p) return undefined;
  const text = plainText(p[1]);
  return text.length > 160 ? `${text.slice(0, 157).replace(/\s+\S*$/, '')}...` : text;
}

async function loadCollection(c) {
  const entries = (await readMarkdown(c.dir))
    .filter((e) => DRAFTS || e.meta.draft !== 'true')
    .map((e) => {
      if (!e.meta.title) warnings.push(`${e.file}: missing title`);
      if (c.type === 'project' && e.meta.link && !/^https?:\/\//.test(e.meta.link)) {
        throw new Error(`${e.file}: link "${e.meta.link}" must start with http:// or https://`);
      }
      if (c.type !== 'project' && !e.meta.date) warnings.push(`${e.file}: missing date, using today (${built})`);
      if (!e.meta.description) warnings.push(`${e.file}: missing description, using the first paragraph`);
      return {
        meta: e.meta,
        title: e.meta.title || e.slug,
        date: c.type === 'project' ? undefined : (checkDate(e.meta.date, e.file, 'date') ?? built),
        updated: c.type === 'project' ? undefined : checkDate(e.meta.updated, e.file, 'updated'),
        description: e.meta.description || excerpt(e.html),
        tech: list(e.meta.tech),
        link: e.meta.link,
        order: Number(e.meta.order) || Infinity,
        url: `${c.url}${e.slug}/`,
        slug: e.slug,
        html: e.html,
        minutes: Math.max(1, Math.round(plainText(e.html).split(' ').length / 220)),
      };
    })
    .sort((a, b) =>
      c.type === 'project'
        ? a.order - b.order || a.title.localeCompare(b.title)
        : b.date.localeCompare(a.date) || a.title.localeCompare(b.title),
    );
  return { ...c, entries };
}

async function writeCollection(c) {
  for (const [i, e] of c.entries.entries()) {
    sitemap.push([e.url, e.updated || e.date]);
    await write(
      `${c.url}${e.slug}/index.html`,
      theme.layout({
        title: e.title,
        description: e.description,
        body: theme.entry(e, c, c.entries, i),
        path: e.url,
        type: c.type === 'post' ? 'article' : 'website',
        published: c.type === 'post' ? e.date : undefined,
      }),
    );
  }
  sitemap.push([c.url]);
  await write(
    `${c.url}index.html`,
    theme.layout({ title: c.title, body: theme.collectionIndex(c, c.entries), path: c.url }),
  );
}

async function writePages(collections) {
  for (const pg of await readMarkdown(DIRS.pages)) {
    const isHome = pg.slug === 'index';
    const is404 = pg.slug === '404';
    const url = isHome ? '/' : is404 ? '/404.html' : `/${pg.slug}/`;
    let body;
    if (isHome) {
      body = `<div class="home">\n${pg.html}`;
      for (const c of collections) {
        const shown = c.entries.filter(c.homeFilter || (() => true)).slice(0, c.homeLimit || 0);
        if (shown.length) body += theme.homeSection(c, shown);
      }
      body += '\n</div>';
    } else {
      if (!pg.meta.title) warnings.push(`${pg.file}: missing title`);
      body = `<h1>${esc(pg.meta.title || pg.slug)}</h1>\n${pg.html}`;
    }
    if (!is404) sitemap.push([url]);
    await write(
      isHome ? 'index.html' : is404 ? '404.html' : `${pg.slug}/index.html`,
      theme.layout({
        title: isHome ? SITE.author : pg.meta.title,
        body,
        description: pg.meta.description || (isHome ? excerpt(pg.html) : undefined),
        path: url,
        noindex: is404,
        jsonld: isHome
          ? {
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: SITE.author,
              url: SITE.url,
              sameAs: SITE.links.map(([, href]) => href).filter((h) => h.startsWith('http')),
            }
          : undefined,
      }),
    );
  }
}

async function writeSearchFiles() {
  const urls = sitemap
    .map(([u, mod]) => `  <url><loc>${SITE.url}${u}</loc>${mod ? `<lastmod>${mod}</lastmod>` : ''}</url>`)
    .join('\n');
  await write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
  await write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE.url}/sitemap.xml\n`);
}

async function checkLinks() {
  const broken = [];
  const files = (await fs.readdir(DIRS.out, { recursive: true })).filter((f) => f.endsWith('.html'));
  for (const f of files) {
    const html = await fs.readFile(path.join(DIRS.out, f), 'utf8');
    for (const [, href] of html.matchAll(/(?:href|src)="(\/[^"]*)"/g)) {
      if (href.startsWith('//')) continue;
      const p = href.split(/[?#]/)[0];
      const candidates = p.endsWith('/') ? [`${p}index.html`] : [p, `${p}/index.html`];
      if (!candidates.some((c) => existsSync(path.join(DIRS.out, c)))) broken.push(`${f}: ${href}`);
    }
  }
  return broken;
}

await fs.rm(DIRS.out, { recursive: true, force: true });
await fs.cp(DIRS.static, DIRS.out, { recursive: true });
const PSWP = 'node_modules/photoswipe/dist';
for (const f of ['photoswipe.css', 'photoswipe.esm.min.js', 'photoswipe-lightbox.esm.min.js']) {
  await fs.cp(path.join(PSWP, f), path.join(DIRS.out, 'vendor/photoswipe', f));
}

const collections = await Promise.all(COLLECTIONS.map(loadCollection));
for (const c of collections) await writeCollection(c);
await writePages(collections);
await writeSearchFiles();

console.log(`built ${collections.map((c) => `${c.entries.length} ${c.items}`).join(', ')} -> ${DIRS.out}/${DRAFTS ? ' (drafts included)' : ''}`);
for (const w of warnings) console.warn(`warning: ${w}`);

const broken = await checkLinks();
if (broken.length) {
  console.error(`\nbroken links:\n${broken.map((b) => `  ${b}`).join('\n')}`);
  process.exit(1);
}
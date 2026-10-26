// Service worker: păstrează interfața ca să se deschidă și fără semnal.
// Mesajele și datele merg mereu la server; aici se pun doar fișierele paginii.
const VERSIUNE = 'santier-log-chat-5'
const FISIERE = ['./', 'index.html', 'manifest.webmanifest', 'iconite/icon-192.png', 'iconite/icon-512.png', 'iconite/apple-touch-icon.png']

self.addEventListener('install', (ev) => {
  ev.waitUntil(caches.open(VERSIUNE).then((c) => c.addAll(FISIERE)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (ev) => {
  ev.waitUntil(
    caches.keys()
      .then((chei) => Promise.all(chei.filter((k) => k !== VERSIUNE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

// Doar fișierele noastre (aceeași adresă, GET): întâi rețeaua, ca să vină mereu versiunea nouă;
// fără rețea, din cache. Supabase și CDN-ul nu trec pe aici.
self.addEventListener('fetch', (ev) => {
  const req = ev.request
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return
  ev.respondWith(
    fetch(req)
      .then((r) => {
        if (r.ok) { const copie = r.clone(); caches.open(VERSIUNE).then((c) => c.put(req, copie)) }
        return r
      })
      .catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || caches.match('index.html')))
  )
})

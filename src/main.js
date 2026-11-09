import './legacy.css'
import './app.css'
import { registerSW } from 'virtual:pwa-register'

registerSW({ immediate: true })

// ---------- config ----------
const LOCATIONS = {
  lr: { name: 'Little Rock', short: 'LR', email: 'docslocs@gmail.com' },
  ftw: { name: 'Ft. Wayne', short: 'FTW', email: 'docslocs@gmail.com' }
}

// ---------- demo storage (stands in for the PHP/MySQL backend) ----------
const store = {
  get (k, d) { try { return JSON.parse(localStorage.getItem('dlmk:' + k)) ?? d } catch { return d } },
  set (k, v) { try { localStorage.setItem('dlmk:' + k, JSON.stringify(v)) } catch {} }
}
const users = (loc) => store.get(`users:${loc}`, [])
const session = (loc) => store.get(`session:${loc}`, null)
const currentUser = (loc) => users(loc).find((u) => u.email === session(loc))
const requests = (loc, email) => store.get(`requests:${loc}`, []).filter((r) => r.rltremail === email || r.owner === email)

const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
const mapLink = (addr) => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(addr)

// ---------- shared bits ----------
const header = (title, sub) => `
  <hr>
  <img class="header-logo" src="img/Header.png" alt="Docs Locs">
  <h5 class="center">${title}</h5>
  ${sub ? `<p class="center sub">${sub}</p>` : ''}`
const footer = `
  <hr>
  <a href="https://www.facebook.com/docslocs/" target="_blank" rel="noopener"><img class="social-icons" src="img/icons/facebook.svg" alt="Docs Locs on Facebook"></a>`
const field = (id, label, { type = 'text', placeholder = '', cls = 'validate', value = '', required = true } = {}) => `
  <div class="input-field col s12">
    <input id="${id}" name="${id}" type="${type}" placeholder="${placeholder}" class="${cls}" value="${esc(value)}" ${required ? 'required' : ''}>
    <label for="${id}" class="active">${label}</label>
  </div>`
const toast = (html) => window.M?.toast({ html })

// ---------- views ----------
const views = {
  home () {
    setNav('Docs Locs - MasterKey')
    return `${header('Welcome to Docs Locs - MasterKey', 'Please select your location')}
      <a href="#/ftw" class="content-button center">FT. WAYNE</a>
      <a href="#/lr" class="content-button center">LITTLE ROCK</a>
      ${footer}`
  },

  location (loc) {
    const L = LOCATIONS[loc]
    setNav(`Docs Locs - MasterKey - ${L.name}`)
    if (currentUser(loc)) { location.hash = `#/${loc}/request`; return '' }
    return `${header('Welcome to Docs Locs - MasterKey', 'Register if you’re new, or log in if you’re already registered.')}
      <a href="#/${loc}/register" class="content-button center">Register</a>
      <a href="#/${loc}/login" class="content-button center">Login</a>
      ${footer}`
  },

  register (loc) {
    const L = LOCATIONS[loc]
    setNav(`Docs Locs - MasterKey - ${L.name}`)
    return `${header(`Welcome to Docs Locs - ${L.name}`)}
      <div class="side-form">
        <form id="register-form" class="row">
          <h6 class="col s12">New Client Registration | Please fill out the form in full.</h6>
          ${field('coname', 'Realtor Co.', { placeholder: 'Your company name' })}
          ${field('rltrname', 'Realtor Name', { placeholder: 'First, Last Name' })}
          ${field('phone', 'Contact Number', { type: 'tel', placeholder: '(555) 555-5555', cls: 'validate phone' })}
          ${field('email', 'Email', { type: 'email', placeholder: 'email address' })}
          ${field('password', 'Password', { type: 'password', placeholder: 'password' })}
          <div class="col s12 center"><button class="btn-small register-submit-btn" type="submit">REGISTER</button></div>
          <p class="col s12 center small-link">Already registered? <a href="#/${loc}/login">Log in</a></p>
        </form>
      </div>${footer}`
  },

  login (loc) {
    const L = LOCATIONS[loc]
    setNav(`Docs Locs - MasterKey - ${L.name}`)
    return `${header(`Welcome to Docs Locs - ${L.name}`)}
      <div class="side-form">
        <form id="login-form" class="row">
          <h6 class="col s12">Realtor Login</h6>
          ${field('email', 'Email', { type: 'email', placeholder: 'email address' })}
          ${field('password', 'Password', { type: 'password', placeholder: 'password' })}
          <div class="col s12 center"><button class="btn-small register-submit-btn" type="submit">LOGIN</button></div>
          <p class="col s12 center small-link">New here? <a href="#/${loc}/register">Register</a></p>
        </form>
      </div>${footer}`
  },

  request (loc) {
    const L = LOCATIONS[loc]
    const u = currentUser(loc)
    if (!u) { location.hash = `#/${loc}/login`; return '' }
    setNav(`Docs Locs - MasterKey - ${L.name}`)
    const mine = requests(loc, u.email).slice(-5).reverse()
    return `${header(`Welcome ${esc(u.rltrname)} to Docs Locs - MasterKey`)}
      <div class="side-form">
        <form id="request-form" class="row">
          <h6 class="col s12">Service Request | Please fill out the form in full.</h6>
          ${field('coname', 'Company Name', { placeholder: 'Co. Name', value: u.coname })}
          ${field('rltrname', 'Realtor Name', { placeholder: 'Realtor Name', value: u.rltrname })}
          ${field('rltremail', 'Realtor Email', { type: 'email', placeholder: 'Realtor Email', value: u.email })}
          ${field('clntname', 'Client Name', { placeholder: 'Client Name' })}
          ${field('clsngdate', 'Closing Date', { placeholder: 'MM/DD/YYYY', cls: 'datepicker' })}
          ${field('clntaddy', 'Client Address', { placeholder: '123 Street Name, City, Zip' })}
          ${field('clntph', 'Client Phone', { type: 'tel', placeholder: '(555) 555-5555', cls: 'validate phone' })}
          <div class="input-field col s12">
            <textarea id="notes" name="notes" class="materialize-textarea" placeholder="Special Notes"></textarea>
            <label for="notes" class="active">Special Notes</label>
          </div>
          <div class="col s12 center"><button class="btn-small register-submit-btn" type="submit">SEND REQUEST</button></div>
        </form>
      </div>
      ${mine.length ? `<h6 class="recent-title">Your recent requests</h6>
        <ul class="collection recent">${mine.map((r) => `
          <li class="collection-item">
            <span class="title">${esc(r.clntname)}</span> &middot; closing ${esc(r.clsngdate || 'TBD')}<br>
            <a href="${mapLink(r.clntaddy)}" target="_blank" rel="noopener">${esc(r.clntaddy)}</a>
          </li>`).join('')}</ul>` : ''}
      <p class="center small-link"><a href="#" id="logout">Log out</a></p>
      ${footer}`
  },

  sent (loc) {
    const L = LOCATIONS[loc]
    const r = store.get('last-request', null)
    if (!r) { location.hash = `#/${loc}/request`; return '' }
    setNav(`Docs Locs - MasterKey - ${L.name}`)
    const body = [
      `Co Name: ${r.coname}`, `Realtor Name: ${r.rltrname}`, `Realtor Email: ${r.rltremail}`,
      `Client Name: ${r.clntname}`, `Closing Date: ${r.clsngdate}`,
      `Client Address: ${mapLink(r.clntaddy)}`, `Client Phone: ${r.clntph}`, `Special Info: ${r.notes}`
    ].join('\n')
    const mailto = `mailto:${L.email}?subject=${encodeURIComponent(`Docs Locs ${L.short} - Request`)}&body=${encodeURIComponent(body)}`
    return `${header('Request received!', `Docs Locs ${L.name} will reach out to schedule.`)}
      <div class="card-panel summary">
        <table><tbody>
          <tr><td>Company</td><td>${esc(r.coname)}</td></tr>
          <tr><td>Realtor</td><td>${esc(r.rltrname)}<br>${esc(r.rltremail)}</td></tr>
          <tr><td>Client</td><td>${esc(r.clntname)}<br>${esc(r.clntph)}</td></tr>
          <tr><td>Closing</td><td>${esc(r.clsngdate)}</td></tr>
          <tr><td>Address</td><td><a href="${mapLink(r.clntaddy)}" target="_blank" rel="noopener">${esc(r.clntaddy)}</a></td></tr>
          ${r.notes ? `<tr><td>Notes</td><td>${esc(r.notes)}</td></tr>` : ''}
        </tbody></table>
      </div>
      <a href="${mailto}" class="content-button center">Email This Request</a>
      <a href="#/${loc}/request" class="content-button center secondary">New Request</a>
      ${footer}`
  }
}

// ---------- router ----------
function setNav (t) { document.getElementById('nav-title').textContent = t }

function render () {
  const [, loc, page] = location.hash.replace(/^#/, '').split('/')
  const app = document.getElementById('app')
  let html
  if (!loc) html = views.home()
  else if (!LOCATIONS[loc]) { location.hash = '#/'; return }
  else if (!page) html = views.location(loc)
  else if (views[page] && page !== 'home' && page !== 'location') html = views[page](loc)
  else { location.hash = `#/${loc}`; return }
  if (html === '') return
  app.innerHTML = html
  window.scrollTo(0, 0)
  wire(loc)
}

// ---------- behavior ----------
function formatPhone (e) {
  const d = e.target.value.replace(/\D/g, '').slice(0, 10)
  const a = d.slice(0, 3); const b = d.slice(3, 6); const c = d.slice(6)
  e.target.value = d.length > 6 ? `(${a}) ${b}-${c}` : d.length > 3 ? `(${a}) ${b}` : d.length ? `(${a}` : ''
}

function wire (loc) {
  document.querySelectorAll('input.phone').forEach((el) => el.addEventListener('input', formatPhone))
  const dp = document.querySelectorAll('.datepicker')
  if (dp.length && window.M) window.M.Datepicker.init(dp, { format: 'mm/dd/yyyy', autoClose: true, minDate: new Date() })

  const data = (f) => Object.fromEntries(new FormData(f).entries())

  document.getElementById('register-form')?.addEventListener('submit', (e) => {
    e.preventDefault()
    const d = data(e.target)
    const list = users(loc)
    if (list.some((u) => u.email.toLowerCase() === d.email.toLowerCase())) return toast('That email is already registered. Please log in.')
    list.push({ ...d, email: d.email.trim(), loc: LOCATIONS[loc].short })
    store.set(`users:${loc}`, list)
    toast('Registered! Please log in.')
    location.hash = `#/${loc}/login`
  })

  document.getElementById('login-form')?.addEventListener('submit', (e) => {
    e.preventDefault()
    const d = data(e.target)
    const u = users(loc).find((x) => x.email.toLowerCase() === d.email.trim().toLowerCase())
    if (!u || u.password !== d.password) return toast('Wrong username or password!')
    store.set(`session:${loc}`, u.email)
    location.hash = `#/${loc}/request`
  })

  document.getElementById('request-form')?.addEventListener('submit', (e) => {
    e.preventDefault()
    const d = { ...data(e.target), owner: currentUser(loc).email, at: Date.now() }
    if (!d.clsngdate) return toast('Please pick a closing date.')
    const all = store.get(`requests:${loc}`, [])
    all.push(d)
    store.set(`requests:${loc}`, all)
    store.set('last-request', d)
    location.hash = `#/${loc}/sent`
  })

  document.getElementById('logout')?.addEventListener('click', (e) => {
    e.preventDefault()
    store.set(`session:${loc}`, null)
    location.hash = `#/${loc}`
  })
}

// ---------- install prompt (replaces the old a2hs/smartbanner scripts) ----------
function setupInstall () {
  const bar = document.getElementById('install-bar')
  const btn = document.getElementById('install-btn')
  const text = document.getElementById('install-text')
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone
  if (standalone || store.get('install-dismissed', false)) return
  let deferred
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e; bar.hidden = false })
  btn.addEventListener('click', async () => { if (deferred) { deferred.prompt(); await deferred.userChoice; deferred = null } bar.hidden = true })
  document.getElementById('install-close').addEventListener('click', () => { bar.hidden = true; store.set('install-dismissed', true) })
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
  if (ios) { text.innerHTML = 'Install: tap <b>Share</b> then <b>Add to Home Screen</b>'; btn.hidden = true; bar.hidden = false }
}

window.addEventListener('hashchange', render)
render()
setupInstall()

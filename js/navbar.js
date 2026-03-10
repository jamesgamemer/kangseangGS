/* ============================================================
   Navbar - Hamburger toggle + Active link + Language Switcher
   + Google-style Admin Profile Menu + Login Button
   Global i18n integration: all nav text uses data-i18n
   ============================================================ */
/* ── NAVIGATION MAP ── */
const navMap = {

 'index.html': { icon: '🏠', key: 'nav_home' },
  'characters.html': { icon: '⚔', key: 'nav_characters' },
  'tierlist.html': { icon: '🏆', key: 'nav_tierlist' },
  'events.html': { icon: '🎉', key: 'nav_events' }

};

/* =========================
   INIT NAVBAR
========================= */

function initNavbar(){

if(window._navbarInitDone) return;
window._navbarInitDone = true;

/* render navbar */
document.querySelectorAll('.navbar-links > li > a').forEach(function(a){

var href = a.getAttribute('href');
if (!href) return;

var page = href.split('/').pop();
var mapping = navMap[page];
if (!mapping) return;

a.innerHTML = '';

var icon = document.createElement("span");
icon.className = "nav-icon";
icon.innerHTML = mapping.icon;

var text = document.createElement('span');
text.className = 'nav-text';
text.textContent = I18n.t(mapping.key).toUpperCase();

a.appendChild(icon);
a.appendChild(document.createTextNode(' '));
a.appendChild(text);

});

/* language switch */
setupLangSwitch();

/* hamburger */
var ham = document.getElementById('navHam');
var links = document.getElementById('navLinks');

if(ham && links){
ham.addEventListener('click', function(){
links.classList.toggle('open');
});
}

/* auth menu */
injectAuthUI();

  /* ── Listen for language changes to update navbar text ── */
  if (typeof I18n !== 'undefined') {
    I18n.onChange(function() {
      applyNavI18n();
    });
  }
}

function applyNavI18n() {

if (typeof I18n === 'undefined') return;

document.querySelectorAll('.navbar-links > li > a').forEach(function(a){

var href = a.getAttribute('href');
if (!href) return;

var page = href.split('/').pop();
var mapping = navMap[page];

if (!mapping) return;

var label = (typeof I18n !== "undefined")
? I18n.t(mapping.key)
: mapping.key;

a.innerHTML =
mapping.icon +
' <span class="nav-text">' +
label.toUpperCase() +
'</span>';

});

  /* Update login button text if present */
  var loginBtn = document.querySelector('.nav-login-btn');
  if (loginBtn) {
    loginBtn.innerHTML = '<span class="nav-login-icon">&#128274;</span> ' + I18n.t('nav_login');
  }

  /* Update profile menu items if present */
  document.querySelectorAll('.profile-menu-item[data-i18n-key]').forEach(function(el) {
    var key = el.getAttribute('data-i18n-key');
    var icon = el.querySelector('.pmi-icon');
    var iconHtml = icon ? icon.outerHTML + ' ' : '';
    el.innerHTML = iconHtml + I18n.t(key);
  });

  /* Update footer */
  var footerText = document.querySelector('[data-i18n="footer_text"]');
  if (footerText) footerText.textContent = I18n.t('footer_text');
}

async function injectAuthUI() {
  var navLinks = document.getElementById('navLinks');
  if (!navLinks || navLinks.querySelector('.nav-auth-item')) return;

  var li = document.createElement('li');
  li.className = 'nav-auth-item';

  var isAdmin = false;
  var userEmail = '';
  if (typeof Auth !== 'undefined') {
    try {
      isAdmin = await Auth.isLoggedIn();
      if (isAdmin && typeof SupaDB !== 'undefined') {
        var session = await SupaDB.getSession();
        if (session && session.user) userEmail = session.user.email || '';
      }
    } catch(e) {}
  }

  if (isAdmin) {
    var initial = userEmail ? userEmail.charAt(0).toUpperCase() : 'A';
    var t = function(k) { return (typeof I18n !== 'undefined') ? I18n.t(k) : k; };
    li.innerHTML =
      '<div class="nav-profile-wrapper">' +
        '<button class="nav-profile-avatar" id="profileAvatarBtn" title="Admin Menu">' + initial + '</button>' +
        '<div class="nav-profile-menu" id="profileMenu">' +
          '<div class="profile-menu-header">' +
            '<div class="profile-menu-avatar">' + initial + '</div>' +
            '<div class="profile-menu-info">' +
              '<div class="profile-menu-role">Admin</div>' +
              '<div class="profile-menu-email">' + escNavHtml(userEmail) + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="profile-menu-divider"></div>' +
          '<a href="admin.html" class="profile-menu-item" data-i18n-key="menu_dashboard"><span class="pmi-icon">&#128200;</span> ' + t('menu_dashboard') + '</a>' +
          '<a href="characters.html" class="profile-menu-item" data-i18n-key="menu_characters"><span class="pmi-icon">&#9876;</span> ' + t('menu_characters') + '</a>' +
          '<a href="tierlist.html" class="profile-menu-item" data-i18n-key="menu_tierlist"><span class="pmi-icon">&#127942;</span> ' + t('menu_tierlist') + '</a>' +
          '<a href="events.html" class="profile-menu-item" data-i18n-key="menu_events"><span class="pmi-icon">&#127881;</span> ' + t('menu_events') + '</a>' +
          '<div class="profile-menu-divider"></div>' +
          '<button class="profile-menu-item logout-item" data-i18n-key="menu_logout" onclick="Auth.logout()"><span class="pmi-icon">&#128682;</span> ' + t('menu_logout') + '</button>' +
        '</div>' +
      '</div>';

    navLinks.appendChild(li);

    /* Toggle profile menu */
    var avatarBtn = document.getElementById('profileAvatarBtn');
    var profileMenu = document.getElementById('profileMenu');
    if (avatarBtn && profileMenu) {
      avatarBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        profileMenu.classList.toggle('open');
      });
      document.addEventListener('click', function (e) {
        if (!profileMenu.contains(e.target) && e.target !== avatarBtn) {
          profileMenu.classList.remove('open');
        }
      });
    }
  } else {
    var loginText = (typeof I18n !== 'undefined') ? I18n.t('nav_login') : 'Login';
    li.innerHTML =
      '<a href="login.html" class="nav-login-btn" title="Login">' +
        '<span class="nav-login-icon">&#128274;</span> ' + loginText +
      '</a>';
    navLinks.appendChild(li);
  }
}

function escNavHtml(str) {
  if (!str) return '';
  var d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function switchLang(lang) {
  if (typeof I18n !== 'undefined') {
    I18n.setLang(lang);
  }
  document.querySelectorAll('.lang-btn').forEach(function(b) {
    b.classList.toggle('active', b.dataset.lang === lang);
  });
  /* Re-apply navbar translations */
  applyNavI18n();
}

/* Run immediately if DOM is ready, otherwise wait */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNavbar);
} else {
  initNavbar();
}

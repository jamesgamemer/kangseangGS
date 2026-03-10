/* ============================================================
   NAVBAR SYSTEM (Stable Version)
   - icon + text render once
   - language switch
   - auth profile menu
   ============================================================ */

/* NAV MAP */
const navMap = {
  'index.html': { icon: '🏠', key: 'nav_home' },
  'characters.html': { icon: '⚔', key: 'nav_characters' },
  'tierlist.html': { icon: '🏆', key: 'nav_tierlist' },
  'events.html': { icon: '🎉', key: 'nav_events' },
  'guides.html': { icon: '📘', key: 'nav_guides' }
};


/* ============================================================
   INIT NAVBAR
   ============================================================ */

function initNavbar(){

  if(window._navbarInitDone) return;
  window._navbarInitDone = true;

  renderNavbar();
  setupHamburger();
  setupLangSwitch();
  injectAuthUI();

  /* update text when language changes */
  if(typeof I18n !== 'undefined'){
    I18n.onChange(applyNavI18n);
  }
}


/* ============================================================
   RENDER NAVBAR ICON + TEXT
   ============================================================ */

function renderNavbar(){

  document.querySelectorAll('.navbar-links > li > a').forEach(function(a){

    var href = a.getAttribute('href');
    if(!href) return;

    var page = href.split('/').pop();
    var mapping = navMap[page];
    if(!mapping) return;

    a.innerHTML = '';

    var icon = document.createElement("span");
    icon.className = "nav-icon";
    icon.innerHTML = mapping.icon;

    var text = document.createElement("span");
    text.className = "nav-text";
    text.textContent = getLabel(mapping.key);

    a.appendChild(icon);
    a.appendChild(document.createTextNode(' '));
    a.appendChild(text);

  });

}


/* ============================================================
   LANGUAGE UPDATE
   ============================================================ */

function applyNavI18n(){

  document.querySelectorAll('.navbar-links > li > a').forEach(function(a){

    var href = a.getAttribute('href');
    if(!href) return;

    var page = href.split('/').pop();
    var mapping = navMap[page];
    if(!mapping) return;

    var text = a.querySelector('.nav-text');
    if(text){
      text.textContent = getLabel(mapping.key);
    }

  });

}


/* ============================================================
   LANGUAGE SWITCH BUTTON
   ============================================================ */

function setupLangSwitch(){

  var navLinks = document.getElementById('navLinks');
  if(!navLinks || navLinks.querySelector('.nav-lang-switcher')) return;

  var li = document.createElement('li');
  li.className = 'nav-lang-switcher';

  var current = getLang();

  li.innerHTML =
    '<div class="lang-switch-group">'+
    '<button class="lang-btn '+(current==='en'?'active':'')+'" data-lang="en">EN</button>'+
    '<span class="lang-divider">|</span>'+
    '<button class="lang-btn '+(current==='th'?'active':'')+'" data-lang="th">TH</button>'+
    '</div>';

  navLinks.appendChild(li);

  li.querySelectorAll('.lang-btn').forEach(function(btn){

    btn.addEventListener('click',function(){

      var lang = btn.dataset.lang;

      if(typeof I18n !== 'undefined'){
        I18n.setLang(lang);
      }

      li.querySelectorAll('.lang-btn').forEach(b=>{
        b.classList.toggle('active',b.dataset.lang===lang);
      });

      applyNavI18n();

    });

  });

}


/* ============================================================
   HAMBURGER MENU
   ============================================================ */

function setupHamburger(){

  var ham = document.getElementById('navHam');
  var links = document.getElementById('navLinks');

  if(ham && links){
    ham.addEventListener('click',function(){
      links.classList.toggle('open');
    });
  }

}


/* ============================================================
   AUTH MENU
   ============================================================ */

async function injectAuthUI(){

  var navLinks = document.getElementById('navLinks');
  if(!navLinks || navLinks.querySelector('.nav-auth-item')) return;

  var li = document.createElement('li');
  li.className = 'nav-auth-item';

  var logged = false;
  var email = '';

  if(typeof Auth !== 'undefined'){
    try{
      logged = await Auth.isLoggedIn();

      if(logged && typeof SupaDB !== 'undefined'){
        var session = await SupaDB.getSession();
        if(session && session.user){
          email = session.user.email || '';
        }
      }

    }catch(e){}
  }

  if(logged){

    var initial = email ? email.charAt(0).toUpperCase() : 'A';

    li.innerHTML =
      '<div class="nav-profile-wrapper">'+
      '<button class="nav-profile-avatar" id="profileAvatarBtn">'+initial+'</button>'+
      '<div class="nav-profile-menu" id="profileMenu">'+

      '<a href="admin.html" class="profile-menu-item">📊 Dashboard</a>'+
      '<a href="characters.html" class="profile-menu-item">⚔ Characters</a>'+
      '<a href="tierlist.html" class="profile-menu-item">🏆 Tier List</a>'+
      '<a href="events.html" class="profile-menu-item">🎉 Events</a>'+
    '<a href="guides.html" class="profile-menu-item">🎉 Guides</a>'+

      '<div class="profile-menu-divider"></div>'+

      '<button class="profile-menu-item logout-item" onclick="Auth.logout()">Logout</button>'+

      '</div>'+
      '</div>';

    navLinks.appendChild(li);

    var avatar = document.getElementById('profileAvatarBtn');
    var menu = document.getElementById('profileMenu');

    avatar.addEventListener('click',function(e){

      e.stopPropagation();
      menu.classList.toggle('open');

    });

    document.addEventListener('click',function(e){

      if(!menu.contains(e.target) && e.target!==avatar){
        menu.classList.remove('open');
      }

    });

  }
  else{

    li.innerHTML =
      '<a href="login.html" class="nav-login-btn">'+
      '<span class="nav-login-icon">🔐</span> Login'+
      '</a>';

    navLinks.appendChild(li);

  }

}


/* ============================================================
   UTIL
   ============================================================ */

function getLabel(key){

  if(typeof I18n !== 'undefined'){
    return I18n.t(key).toUpperCase();
  }

  return key;

}

function getLang(){

  if(typeof I18n !== 'undefined'){
    return I18n.getLang();
  }

  return 'en';
}


/* ============================================================
   START
   ============================================================ */

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded',initNavbar);
}
else{
  initNavbar();
}

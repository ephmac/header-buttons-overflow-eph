const CZARNA_LISTA = new Set(["dnd5e", "wfrp4e"]);

let idSystemu;
let nazwaSystemu;
let BLOKADA = false

const STAN_NAGLOWKA = new WeakMap();

const DOMYSLNE = {
  aktorzy: {
    przyciski: "10",
    zamknij: "1"
  },
  przedmioty: {
    przyciski: "10",
    zamknij: "1"
  }
};
 

Hooks.once("init", () => {
  idSystemu = game.system.id;
  nazwaSystemu = game.system.title;
  if(CZARNA_LISTA.has(idSystemu)) BLOKADA = true;

  game.settings.register("header-buttons-overflow-eph", "przyciski", {
    scope: "world",
    config: false,
    type: Object,
    default: foundry.utils.deepClone(DOMYSLNE)
  });
});


Hooks.once("ready", async () => {
  if (BLOKADA) {

    const hint = game.i18n.localize("hbo.System") + ": " + nazwaSystemu + " - " + game.i18n.localize("hbo.modulWylaczony2")

    game.settings.register("header-buttons-overflow-eph", "disabledInfo", {
      name: game.i18n.localize("hbo.modulWylaczony"),
      hint: hint,
      scope: "world",
      config: true,
      type: Boolean,
      default: true,
      restricted: true,
      requiresReload: false,
      onChange: () => {}
    });

    return;
  }

  await import("./ustawienia.js");
});


Hooks.on("renderActorSheet", (_app, html) => {
  if(BLOKADA) return;

  const root   = html?.[0] ?? html;
  const header = root?.querySelector(".app .header-actions, .window-header");
  if (!header) return;

  const przyciskZamknij = header?.querySelector(
    ".close, button.close, [data-action='close'], button[aria-label='Close']"
  );
  const przyciskUUID = header?.querySelector(
    "[data-action='copy-uuid'], .copy-uuid, [aria-label*='uuid' i], [title*='uuid' i], [data-tooltip*='uuid' i]"
  );
  const doPominiecia = new Set([przyciskZamknij, przyciskUUID].filter(Boolean));

  // ZAMKNIJ
  const ustawieniaAktorzyZamknij = game.settings.get("header-buttons-overflow-eph", "przyciski").aktorzy.zamknij;
  if (ustawieniaAktorzyZamknij === "1") if(przyciskZamknij) ikonizacja(przyciskZamknij);

  // RESZTA
  const ustawieniaAktorzyPrzyciski =  game.settings.get("header-buttons-overflow-eph", "przyciski").aktorzy.przyciski;
  switch (ustawieniaAktorzyPrzyciski) {
    case "21": {
      zbudujListe(html, doPominiecia);
      wstawHBO(html, przyciskZamknij);
      break;
    }
    case "20": break;
    case "11": {
      zbudujListe(html, doPominiecia);
      ikonizacjaPrzyciskow(html, doPominiecia);
      wstawHBO(html, przyciskZamknij);
      break;
    }
    case "10": {
      ikonizacjaPrzyciskow(html, doPominiecia);
      break;
    }
    case "01": {
      zbudujListe(html, doPominiecia);
      usunPrzyciski(html, doPominiecia);
      wstawHBO(html, przyciskZamknij);
      break;
    }    
  }
});

Hooks.on("renderItemSheet", (_app, html) => {
  if(BLOKADA) return;

  const root   = html?.[0] ?? html;
  const header = root?.querySelector(".app .header-actions, .window-header");
  if (!header) return;

  const przyciskZamknij = header?.querySelector(
    ".close, button.close, [data-action='close'], button[aria-label='Close']"
  );
  const przyciskUUID = header?.querySelector(
    "[data-action='copy-uuid'], .copy-uuid, [aria-label*='uuid' i], [title*='uuid' i], [data-tooltip*='uuid' i]"
  );
  const doPominiecia = new Set([przyciskZamknij, przyciskUUID].filter(Boolean));

  // ZAMKNIJ
  const ustawieniaPrzedmiotyZamknij = game.settings.get("header-buttons-overflow-eph", "przyciski").przedmioty.zamknij;
  if (ustawieniaPrzedmiotyZamknij === "1") if(przyciskZamknij) ikonizacja(przyciskZamknij);

  // RESZTA
  const ustawieniaPrzedmiotyPrzyciski =  game.settings.get("header-buttons-overflow-eph", "przyciski").przedmioty.przyciski;
  switch (ustawieniaPrzedmiotyPrzyciski) {
    case "21": {
      zbudujListe(html, doPominiecia);
      wstawHBO(html, przyciskZamknij);
      break;
    }
    case "20": break;
    case "11": {
      zbudujListe(html, doPominiecia);
      ikonizacjaPrzyciskow(html, doPominiecia);
      wstawHBO(html, przyciskZamknij);
      break;
    }
    case "10": {
      ikonizacjaPrzyciskow(html, doPominiecia);
      break;
    }
    case "01": {
      zbudujListe(html, doPominiecia);
      usunPrzyciski(html, doPominiecia);
      wstawHBO(html, przyciskZamknij);
      break;
    }    
  }
});





function ikonizacja(przycisk) {

  const nazwa = przycisk.textContent.trim();
  if (nazwa) {
    przycisk.setAttribute("data-tooltip", nazwa);
    przycisk.setAttribute("data-tooltip-direction", "UP");
    przycisk.setAttribute("aria-label", nazwa);
    przycisk.removeAttribute("title");
  }

  const ikona = przycisk?.querySelector(":scope > i, :scope > svg") || przycisk.firstElementChild;
  if (!ikona) return; 

  przycisk.replaceChildren(ikona.cloneNode(true));

  const ikona2 = przycisk?.querySelector(":scope > i, :scope > svg") || przycisk.firstElementChild;
  if(ikona2) ikona2.style.fontSize = "16px"

}



function ikonizacjaPrzyciskow (html, pomin) {

  const root   = html?.[0] ?? html;
  const header = root?.querySelector(".app .header-actions, .window-header");
  if (!header) return;

  header.querySelectorAll("button, a").forEach(btn => {
    if (pomin.has(btn)) return;
    ikonizacja(btn);
  });

}



function zbudujListe(html, pomin) {

  const root   = html?.[0] ?? html;
  const header = root?.querySelector(".app .header-actions, .window-header");
  if (!header) return;

  const lista = [...header.querySelectorAll("button, a")]
    .filter(el => el && !pomin.has(el) && !el.classList.contains("hbo-btn"))
    .map(el => ({
      el,
      label: (
        el.getAttribute("aria-label") ||
        el.getAttribute("title") ||
        el.dataset.tooltip ||
        el.textContent ||
        el.dataset.action ||
        ""
      ).trim()
    }));

  STAN_NAGLOWKA.set(header, { lista });

}



function usunPrzyciski(html, pomin) {
  const root   = html?.[0] ?? html;
  const header = root?.querySelector(".app .header-actions, .window-header");
  if (!header) return;

  header.querySelectorAll("button, a").forEach(btn => {
    if (pomin.has(btn)) return;
    if (btn.classList.contains("hbo-btn")) return;
    btn.style.display = "none";
  });
}



function wstawHBO (html, zamknij) {
  const root   = html?.[0] ?? html;
  const header = root?.querySelector(".app .header-actions, .window-header");
  if (!header || !zamknij) return;

  const rodzic = zamknij.parentElement || header;
  if (rodzic.querySelector(".hbo-btn")) return;

  const hbo = document.createElement("a");
  hbo.className = "hbo-btn";
  hbo.setAttribute("data-tooltip", "Header Buttons Overflow");
  hbo.setAttribute("data-tooltip-direction", "UP");
  hbo.setAttribute("aria-label", "Header Buttons Overflow");
  hbo.innerHTML = '<i class="fa-solid fa-layer-group"></i>';

  hbo.style.fontSize = "16px"

  hbo.addEventListener("click", (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    pokazMenu(rodzic, hbo);
  });

  rodzic.insertBefore(hbo, zamknij);
}



function pokazMenu(rodzic, hbo) {
  
  const opened = document.querySelector(".hbo-menu");
  if (opened) { opened.remove(); return; } // raczej nic nie robi, ma zapobiegać dublowaniu ale chyba się nie dubluje

  const st = STAN_NAGLOWKA.get(rodzic) || { lista: [] };

  // Pozycja przycisku (ekranowa)
  const r = hbo.getBoundingClientRect();

  // Kontener menu
  const menu = document.createElement("div");
  menu.className = "hbo-menu";
  Object.assign(menu.style, {
    position: "fixed",
    top: `${r.bottom + 6}px`,
    left: `${Math.max(8, r.right - 240)}px`,
    width: "240px",
    background: "var(--color-bg, #222)",
    color: "var(--color-text, #ddd)",
    border: "1px solid rgba(255,255,255,.1)",
    borderRadius: "8px",
    boxShadow: "0 6px 18px rgba(0,0,0,.35)",
    padding: "6px",
    zIndex: 999999
  });

  // Zamknięcie po kliknięciu poza
  const onAway = (e) => {
    if (!menu.contains(e.target) && e.target !== hbo) {
      menu.remove(); document.removeEventListener("pointerdown", onAway, true);
    }
  };
  document.addEventListener("pointerdown", onAway, true);

  for (const item of st.lista) {
    const el = item.el;
    const label = item.label || el?.dataset?.hboLabel || "—";
    const ico = el?.querySelector?.(":scope > i, :scope > svg");

    const row = document.createElement("button");
    row.type = "button";
    row.className = "hbo-menu-item";
    Object.assign(row.style, {
      width:"100%",
      display:"flex", gap:"8px", alignItems:"center",
      padding:"6px 8px",
      borderRadius:"6px", border:"none",
      background:"transparent", color:"inherit",
      cursor:"pointer", textAlign:"left"
    });
      row.addEventListener("mouseenter", () => row.style.background = "rgba(255,255,255,.06)");
      row.addEventListener("mouseleave", () => row.style.background = "transparent");

    // Ikona
    if (ico) {
      const ic = ico.cloneNode(true);
      if (ic.tagName === "SVG") { ic.style.width = "16px"; ic.style.height = "16px"; }
      else { ic.style.fontSize = "16px"; }
      row.appendChild(ic);
    } else {
      const dot = document.createElement("span"); dot.textContent = "•"; row.appendChild(dot);
    }

    // Tekst
    const span = document.createElement("span");
    span.textContent = label;
    row.appendChild(span);

    // Klik w pozycję menu => kliknij oryginalny przycisk
    row.addEventListener("click", (e) => {
      e.preventDefault(); e.stopPropagation();
      try { el?.click?.(); } finally {
        menu.remove();
        document.removeEventListener("pointerdown", onAway, true);
      }
    });

    menu.appendChild(row);
  }
  document.body.appendChild(menu);
  
}
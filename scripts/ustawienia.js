import { otworzDialogWsparcia } from "./dialog_wsparcie.js";

const NS = "header-buttons-overflow-eph";
const TEMPLATE = "modules/header-buttons-overflow-eph/templates/ustawienia.hbs";


export class HBO_SettingsForm extends foundry.applications.api.HandlebarsApplicationMixin(
  foundry.applications.api.ApplicationV2
) {
  static PARTS = {
    main: { template: TEMPLATE }
  };

  static DEFAULT_OPTIONS = foundry.utils.mergeObject(super.DEFAULT_OPTIONS, {
    id: "hbo-przyciski-form",
    position: { width: 450 },
    window: { icon: "fas fa-cogs" },
    classes: ["hbo-settings"]
  });

  get title() {
    return game.i18n.localize("hbo.ustawieniaHBO");
  }
  _prepareContext(_options) {
    const s = game.settings.get(NS, "przyciski");
    const L = game.i18n.localize.bind(game.i18n);

    const CHOICES_5 = {
      "21": `${L("hbo.pelnePrzyciski")} ${L("hbo.i")} ${L("hbo.listaHBO")}`,
      "20": `${L("hbo.pelnePrzyciski")}`,
      "11": `${L("hbo.ikony")} ${L("hbo.i")} ${L("hbo.listaHBO")}`,
      "10": `${L("hbo.ikony")}`,
      "01": `${L("hbo.listaHBO")}`
    };

    const CHOICES_2 = {
      "2": `${L("hbo.pelnyPrzycisk")}`,
      "1": `${L("hbo.ikona")}`
    };

    return {
      ustawienia: s,
      choices: {
        przyciski: CHOICES_5,
        zamknij: CHOICES_2
      }
    };
  }

  _onRender(_context, _options) {
    const root = this.element;
    const $root = $(root);
    const form = root.querySelector("form") ?? root;

  $root.on("change", "select", async () => {
    const formData = new FormData(form);
    const expanded = foundry.utils.expandObject(Object.fromEntries(formData));

    const current = game.settings.get(NS, "przyciski");
    const payload = foundry.utils.mergeObject(current, expanded, { insertKeys: true, overwrite: true });

    await game.settings.set(NS, "przyciski", payload);
  });


    // Przyciski dolne
    $root.find(".hbo_przyciskZamknij").on("click", () => this.close());
    $root.find(".hbo_przyciskWsparcie").on("click", () => otworzDialogWsparcia());
  }
}


  game.settings.registerMenu(NS, "przyciskiMenu", {
    name: game.i18n.localize("hbo.ustawieniaHBO"),
    label: "",
    hint: game.i18n.localize("hbo.ustawieniaPodpowiedz"),
    icon: "fas fa-cogs",
    type: HBO_SettingsForm,
    restricted: true
  });


export function otworzUstawieniaHBO() {
  new HBO_SettingsForm().render(true);
}

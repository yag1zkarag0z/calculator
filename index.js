// === Calculator Core JS (DOM yüklendikten sonra, global fonksiyonlar) ===
document.addEventListener("DOMContentLoaded", () => {
  const display = document.getElementById("display");
  if (!display) {
    console.error('Input with id="display" bulunamadı.');
    return;
  }

  // Global yap (inline onclick için)
  window.appendToDisplay = function (val) {
    // max uzunluk
    if (display.value.length > 40) return;

    // "." kontrolü (aynı sayıda birden fazla nokta olmasın)
    if (val === ".") {
      const lastNumber = display.value.split(/[+\-*/]/).pop();
      if (lastNumber.includes(".")) return;
    }

    const lastChar = display.value.slice(-1);
    const isOp = /[+\-*/]/.test(val);
    const lastIsOp = /[+\-*/]/.test(lastChar);

    // Arka arkaya operatör engeli (başta sadece "-" serbest)
    if (isOp && lastIsOp) {
      if (!(val === "-" && display.value.length === 0)) return;
      return;
    }

    display.value += val;
  };

  window.clearDisplay = function () {
    display.value = "";
  };

  function safeEvaluate(expr) {
    expr = expr.trim();
    if (!expr) return "";

    const allowed = /^[0-9+\-*/.\s]+$/;
    if (!allowed.test(expr)) throw new Error("invalid");

    if (/[+\/*.]$/.test(expr)) throw new Error("invalid");
    if (/^[+/*.]/.test(expr)) throw new Error("invalid");
    if (/(?:[+\/*]{2,})/.test(expr)) throw new Error("invalid");

    // basit sıfıra bölme filtresi
    if (/\/\s*0(?![\d.])/.test(expr)) throw new Error("div0");

    // eslint-disable-next-line no-new-func
    const result = Function(`"use strict"; return (${expr})`)();
    if (!Number.isFinite(result)) throw new Error("invalid");
    return (+result.toFixed(12)).toString();
  }

  window.calculate = function () {
    try {
      const out = safeEvaluate(display.value);
      if (out === "") return;
      display.value = out;
    } catch (e) {
      display.value = e.message === "div0" ? "Sıfıra bölünemez" : "Hata";
      setTimeout(() => (display.value = ""), 800);
    }
  };

  // Klavye desteği (opsiyonel)
  document.addEventListener("keydown", (e) => {
    const k = e.key;
    if ((k >= "0" && k <= "9") || ["+", "-", "*", "/", "."].includes(k)) {
      window.appendToDisplay(k);
    } else if (k === "Enter" || k === "=") {
      e.preventDefault();
      window.calculate();
    } else if (k === "Backspace") {
      e.preventDefault();
      display.value = display.value.slice(0, -1);
    } else if (k === "Escape" || k === "Delete") {
      window.clearDisplay();
    }
  });
});


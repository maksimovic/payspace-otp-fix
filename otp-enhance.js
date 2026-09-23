(() => {
  "use strict";

  const DEFAULT_COUNT = 6;
  const PROCESSED_ATTR = "data-otpboxes-done";
  const AUTO_SUBMIT_DELAY_MS = 120;

  // The page's wrapper div is id="oneTimePassword" and the field is
  // id="OneTimePassword" — match the input by either casing, not the div.
  function findOtpField(root) {
    return (root || document).querySelector(
      'input[id="onetimepassword" i], input[name="onetimepassword" i]'
    );
  }

  function digitsOf(str) {
    return String(str).match(/\d/g) || [];
  }

  function build(original) {
    if (original.getAttribute(PROCESSED_ATTR)) return;
    original.setAttribute(PROCESSED_ATTR, "1");

    const ml = parseInt(original.getAttribute("maxlength"), 10);
    const count = ml >= 2 && ml <= 12 ? ml : DEFAULT_COUNT;

    original.classList.add("otpboxes-hidden-original");
    original.removeAttribute("autofocus");
    original.setAttribute("tabindex", "-1");
    original.setAttribute("aria-hidden", "true");

    const wrap = document.createElement("div");
    wrap.className = "otpboxes-wrap";
    wrap.setAttribute("role", "group");
    wrap.setAttribute("aria-label", "One-time passcode");

    const boxes = [];
    for (let i = 0; i < count; i++) {
      const b = document.createElement("input");
      b.type = "text";
      b.className = "otpboxes-box";
      b.inputMode = "numeric";
      b.autocomplete = i === 0 ? "one-time-code" : "off";
      b.maxLength = 1;
      b.setAttribute("pattern", "[0-9]*");
      b.setAttribute("aria-label", "Digit " + (i + 1));
      b.setAttribute("data-lpignore", "true");
      b.setAttribute("data-1p-ignore", "");
      b.setAttribute("data-bwignore", "");
      b.setAttribute("data-protonpass-ignore", "");
      boxes.push(b);
      wrap.appendChild(b);
    }

    original.insertAdjacentElement("afterend", wrap);

    let autoSubmitted = false;
    let submitTimer = null;

    function sync() {
      original.value = boxes.map((b) => b.value).join("");
      original.dispatchEvent(new Event("input", { bubbles: true }));
      original.dispatchEvent(new Event("change", { bubbles: true }));
      original.dispatchEvent(new KeyboardEvent("keyup", { bubbles: true }));
    }

    function isComplete() {
      return boxes.every((b) => /\d/.test(b.value));
    }

    function submitForm() {
      const form = original.form || original.closest("form");
      if (!form) return;
      const btn = form.querySelector('input[type="submit"], button[type="submit"]');
      try {
        if (btn) btn.click();
        else if (form.requestSubmit) form.requestSubmit();
        else form.submit();
      } catch (_) {
        try {
          form.submit();
        } catch (__) {}
      }
    }

    function maybeAutoSubmit() {
      if (autoSubmitted || !isComplete()) return;
      autoSubmitted = true;
      submitTimer = setTimeout(submitForm, AUTO_SUBMIT_DELAY_MS);
    }

    function cancelPendingSubmit() {
      if (submitTimer) {
        clearTimeout(submitTimer);
        submitTimer = null;
      }
      autoSubmitted = false;
    }

    function focusBox(i) {
      const b = boxes[i];
      if (!b) return;
      b.focus();
      b.select();
    }

    function distribute(str, startIndex) {
      const ds = digitsOf(str);
      let i = startIndex || 0;
      for (const d of ds) {
        if (i >= boxes.length) break;
        boxes[i].value = d;
        i++;
      }
      sync();
      focusBox(Math.min(i, boxes.length - 1));
      maybeAutoSubmit();
    }

    boxes.forEach((b, idx) => {
      b.addEventListener("input", () => {
        const only = digitsOf(b.value).join("");
        if (only.length > 1) {
          distribute(only, idx);
          return;
        }
        b.value = only;
        sync();
        if (only) focusBox(idx + 1);
        maybeAutoSubmit();
      });

      b.addEventListener("keydown", (e) => {
        if (e.key === "Backspace") {
          e.preventDefault();
          cancelPendingSubmit();
          if (b.value) {
            b.value = "";
            sync();
          } else if (boxes[idx - 1]) {
            boxes[idx - 1].value = "";
            sync();
            focusBox(idx - 1);
          }
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          focusBox(idx - 1);
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          focusBox(idx + 1);
        } else if (e.key === "Home") {
          e.preventDefault();
          focusBox(0);
        } else if (e.key === "End") {
          e.preventDefault();
          focusBox(boxes.length - 1);
        }
      });

      b.addEventListener("paste", (e) => {
        e.preventDefault();
        const cd = e.clipboardData || window.clipboardData;
        distribute(cd ? cd.getData("text") : "", idx);
      });

      b.addEventListener("focus", () => b.select());
    });

    // Seed any pre-filled value, but never auto-submit without a user action.
    if (original.value) {
      digitsOf(original.value).forEach((d, i) => {
        if (boxes[i]) boxes[i].value = d;
      });
      sync();
    }
    const firstEmpty = boxes.findIndex((b) => !b.value);
    focusBox(firstEmpty === -1 ? 0 : firstEmpty);
  }

  function scan() {
    const f = findOtpField(document);
    if (f && !f.getAttribute(PROCESSED_ATTR)) build(f);
  }

  scan();
  document.addEventListener("DOMContentLoaded", scan);

  const mo = new MutationObserver(scan);
  mo.observe(document.documentElement, { childList: true, subtree: true });
})();

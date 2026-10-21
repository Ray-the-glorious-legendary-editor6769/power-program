/* ============================================
   JAOUAD EL MAALEM — SITE SCRIPT
   Handles: view routing (home / subscribe),
   plan pre-selection, toggle groups, form submit,
   and scroll-reveal animations.
   ============================================ */

(function () {
  'use strict';

  var viewHome = document.getElementById('view-home');
  var viewSubscribe = document.getElementById('view-subscribe');

  var typeInput = document.getElementById('type-input');
  var typeGroup = document.getElementById('type-group');
  var planInput = document.getElementById('plan-input');
  var planFieldOnline = document.getElementById('plan-field-online');
  var planFieldIrl = document.getElementById('plan-field-irl');
  var planGroupOnline = document.getElementById('plan-group-online');
  var planGroupIrl = document.getElementById('plan-group-irl');
  var goalInput = document.getElementById('goal-input');
  var goalGroup = document.getElementById('goal-group');

  var form = document.getElementById('subscribe-form');
  var confirmationBox = document.getElementById('confirmation-box');
  var whatsappLink = document.getElementById('whatsapp-link');
  var paypalLink = document.getElementById('paypal-link');
  var popupBlockedNote = document.getElementById('popup-blocked-note');
  var setupNeededNote = document.getElementById('setup-needed-note');
  var confirmPlanName = document.getElementById('confirm-plan-name');
  var confirmPriceSar = document.getElementById('confirm-price-sar');
  var confirmPriceUsd = document.getElementById('confirm-price-usd');

  var WHATSAPP_NUMBER = '966569196038'; // no + or spaces, used for wa.me links

  // ---- Payment (PayPal subscription plans) ----
  // Each link below sends the client straight to PayPal's hosted checkout
  // for that specific recurring billing plan.
  var PLAN_DETAILS = {
    'Fuel Pack':  { sar: 200,  usd: '53.33',   link: 'https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-0GM82852BY985002CNKD6S7Q' },
    'Forge Pack': { sar: 400,  usd: '106.67',  link: 'https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-9K6180469B2147405NKD6OEA' },
    'Elite Pack': { sar: 500,  usd: '133.33',  link: 'https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-9GH785845G771684SNKD7AAI' },
    'Fighter':    { sar: 2500, usd: '666.67',  link: 'https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-08Y70668JC581460VNKD7CWQ' },
    'Warrior':    { sar: 4000, usd: '1066.67', link: 'https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=P-1LC48686RJ7607158NKD7LNY' }
  };

  /* ---------- Routing ---------- */
  function showView(route) {
    if (route === 'subscribe') {
      viewHome.hidden = true;
      viewSubscribe.hidden = false;
    } else {
      viewHome.hidden = false;
      viewSubscribe.hidden = true;
    }
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }

  function routeFromHash() {
    var hash = window.location.hash.replace('#', '');
    if (hash === 'subscribe') {
      showView('subscribe');
    } else if (hash && document.getElementById(hash) && !viewHome.hidden === false) {
      // hash points at a section on the home page (e.g. #services, #pricing)
      showView('home');
      var target = document.getElementById(hash);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    } else {
      showView('home');
    }
  }

  // Handle every link that declares a data-route, so both the header
  // and any button anywhere on the page can switch views.
  document.addEventListener('click', function (e) {
    var link = e.target.closest('[data-route]');
    if (!link) return;

    var route = link.getAttribute('data-route');

    // If a pricing "Subscribe" button carries a type + plan, pre-select both.
    var plan = link.getAttribute('data-plan');
    var type = link.getAttribute('data-type');
    if (plan && type) {
      applyPlan(type, plan);
    }

    if (route === 'subscribe' || route === 'home') {
      e.preventDefault();
      window.location.hash = route === 'home' ? '' : route;
      showView(route);
    }
  });

  window.addEventListener('hashchange', routeFromHash);
  routeFromHash();

  /* ---------- Toggle groups (type / plan / goal selectors) ---------- */
  function setActiveToggle(group, value) {
    if (!group) return;
    var buttons = group.querySelectorAll('.toggle-btn');
    buttons.forEach(function (btn) {
      btn.classList.toggle('is-active', btn.getAttribute('data-value') === value);
    });
  }

  function wireToggleGroup(group, hiddenInput) {
    if (!group) return;
    group.addEventListener('click', function (e) {
      var btn = e.target.closest('.toggle-btn');
      if (!btn) return;
      setActiveToggle(group, btn.getAttribute('data-value'));
      hiddenInput.value = btn.getAttribute('data-value');
    });
  }

  wireToggleGroup(goalGroup, goalInput);

  // Switch which plan fieldset is visible (Online vs In-Person), and keep
  // the single hidden `plan` input synced to whichever plan is active in
  // the now-visible group.
  function applyType(type) {
    typeInput.value = type;
    setActiveToggle(typeGroup, type);

    var showIrl = type === 'In-Person';
    planFieldOnline.hidden = showIrl;
    planFieldIrl.hidden = !showIrl;

    var activeGroup = showIrl ? planGroupIrl : planGroupOnline;
    var activeBtn = activeGroup.querySelector('.toggle-btn.is-active') || activeGroup.querySelector('.toggle-btn');
    planInput.value = activeBtn.getAttribute('data-value');
  }

  // Used when a pricing card's "Subscribe" button is clicked directly —
  // pre-selects both the subscription type and the specific plan.
  function applyPlan(type, plan) {
    applyType(type);
    planInput.value = plan;
    setActiveToggle(type === 'In-Person' ? planGroupIrl : planGroupOnline, plan);
  }

  if (typeGroup) {
    typeGroup.addEventListener('click', function (e) {
      var btn = e.target.closest('.toggle-btn');
      if (!btn) return;
      applyType(btn.getAttribute('data-value'));
    });
  }

  function wirePlanGroup(group) {
    if (!group) return;
    group.addEventListener('click', function (e) {
      var btn = e.target.closest('.toggle-btn');
      if (!btn) return;
      setActiveToggle(group, btn.getAttribute('data-value'));
      planInput.value = btn.getAttribute('data-value');
    });
  }
  wirePlanGroup(planGroupOnline);
  wirePlanGroup(planGroupIrl);

  // Sync the form to its default markup state on load.
  applyType(typeInput.value);

  /* ---------- Pricing tabs (Online / In-Person panels) ---------- */
  var pricingTabs = document.querySelectorAll('.pricing-tab');
  var pricingPanels = document.querySelectorAll('.pricing-panel');
  pricingTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var target = tab.getAttribute('data-tab');
      pricingTabs.forEach(function (t) {
        var active = t === tab;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      pricingPanels.forEach(function (panel) {
        panel.hidden = panel.getAttribute('data-panel') !== target;
      });
    });
  });

  /* ---------- Payment panel (PayPal) ---------- */
  // A link is still a placeholder if it hasn't been replaced with a real
  // paypal.com URL yet — catches the setup step being skipped so it fails
  // loudly (a visible note) instead of silently doing nothing.
  function isPlaceholderLink(link) {
    return !link || link.indexOf('http') !== 0;
  }

  // Populates the plan/price summary, points the "Pay with PayPal" link at
  // the right plan's payment link, and reveals the panel. Called after
  // submit regardless of whether the notification email succeeded — a
  // failed email should never block a paying client.
  function showPaymentPanel(plan) {
    var details = PLAN_DETAILS[plan];
    if (!details) return;

    confirmPlanName.textContent = plan;
    confirmPriceSar.textContent = details.sar + ' SAR';
    confirmPriceUsd.textContent = '$' + details.usd + ' USD';
    paypalLink.href = details.link;

    popupBlockedNote.hidden = true;
    setupNeededNote.hidden = true;

    confirmationBox.hidden = false;
    confirmationBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // On click: if this plan's PayPal link hasn't been set up yet, say so
  // clearly instead of silently failing. Otherwise, open WhatsApp — pre-
  // filled and ready to send — in a new tab, then let this same tab
  // navigate on to PayPal to complete payment. (WhatsApp itself still
  // needs a human tap on its own Send button — no site can submit that
  // silently on someone's behalf.)
  if (paypalLink) {
    paypalLink.addEventListener('click', function (e) {
      var plan = planInput.value;
      var details = PLAN_DETAILS[plan];

      if (!details || isPlaceholderLink(details.link)) {
        e.preventDefault();
        setupNeededNote.hidden = false;
        return;
      }

      popupBlockedNote.hidden = true;
      var waWindow = window.open(whatsappLink.href, '_blank');
      if (!waWindow) {
        popupBlockedNote.hidden = false;
      }
    });
  }

  /* ---------- Form submit ---------- */
  var submitBtn = document.getElementById('submit-btn');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = document.getElementById('fullname').value.trim();
      var email = document.getElementById('email').value.trim();

      if (!name || !email) {
        alert('Please fill in your name and email so Jaouad can reach you.');
        return;
      }

      var notes = document.getElementById('notes').value.trim();
      var type = typeInput.value;
      var plan = planInput.value;
      var goal = goalInput.value;

      // Build the pre-filled WhatsApp message the client will send Jaouad.
      var message =
        'Hi Jaouad, I just subscribed on the website.\n' +
        'Name: ' + name + '\n' +
        'Email: ' + email + '\n' +
        'Type: ' + type + '\n' +
        'Plan: ' + plan + '\n' +
        'Goal: ' + goal +
        (notes ? '\nStarting point: ' + notes : '');
      whatsappLink.href = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message);

      showPaymentPanel(plan);
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

})();

(function () {
  var form = document.getElementById('waitlist-form');
  if (!form) return;

  var cfg = window.AIA_CONFIG || {};
  var mode = cfg.waitlistEndpoint ? 'post'
    : (cfg.mailtoAddress && cfg.mailtoAddress.indexOf('REPLACE_ME') === -1 ? 'mailto' : 'closed');

  var step1 = form.querySelector('[data-step="1"]');
  var step2 = form.querySelector('[data-step="2"]');
  var email = form.querySelector('#wl-email');
  var consent = form.querySelector('#wl-consent');
  var status = document.getElementById('wl-status');
  var submit1 = form.querySelector('[data-action="join"]');
  var submit2 = form.querySelector('[data-action="answers"]');
  var skip = form.querySelector('[data-action="skip"]');

  function say(msg, tone) {
    status.textContent = msg;
    status.setAttribute('data-tone', tone || 'info');
  }

  function answers() {
    var pick = function (name) {
      var el = form.querySelector('input[name="' + name + '"]:checked');
      return el ? el.value : undefined;
    };
    var text = function (id) {
      var v = form.querySelector(id).value.trim();
      return v || undefined;
    };
    return {
      role: pick('role'),
      priceBand: pick('priceBand'),
      urgency: pick('urgency'),
      pain: text('#wl-pain'),
      alternative: text('#wl-alternative')
    };
  }

  function payload(extra) {
    var base = {
      productId: cfg.productId,
      email: email.value.trim(),
      consent: true,
      source: location.pathname
    };
    for (var k in extra) if (extra[k] !== undefined) base[k] = extra[k];
    return base;
  }

  function post(body) {
    return fetch(cfg.waitlistEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r;
    });
  }

  function openMail(extra) {
    var b = payload(extra);
    var lines = ['Please add me to the AI Architects academy waitlist.', '', 'Email: ' + b.email];
    if (b.role) lines.push('Role: ' + b.role);
    if (b.priceBand) lines.push('Expected price: ' + b.priceBand);
    if (b.urgency) lines.push('Timing: ' + b.urgency);
    if (b.pain) lines.push('Trying to do: ' + b.pain);
    if (b.alternative) lines.push('Use today: ' + b.alternative);
    location.href = 'mailto:' + encodeURIComponent(cfg.mailtoAddress) +
      '?subject=' + encodeURIComponent('Academy waitlist') +
      '&body=' + encodeURIComponent(lines.join('\n'));
    say('Your email app should open with the message filled in. Send it to join the waitlist.', 'ok');
  }

  function validEmail() {
    var ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim());
    email.setAttribute('aria-invalid', ok ? 'false' : 'true');
    return ok;
  }

  function showStep2() {
    step1.hidden = true;
    step2.hidden = false;
    var first = step2.querySelector('input, textarea');
    if (first) first.focus();
  }

  function finish(msg) {
    step2.hidden = true;
    say(msg, 'ok');
    status.focus();
  }

  function join() {
    if (!validEmail()) {
      say('Enter an email address, for example name@company.com.', 'error');
      email.focus();
      return;
    }
    if (!consent.checked) {
      say('Tick the box so we can email you about the academy.', 'error');
      consent.focus();
      return;
    }
    if (mode === 'closed') {
      say('The waitlist is not open yet. The form has no destination configured, so nothing was sent.', 'info');
      return;
    }
    if (mode === 'mailto') {
      say('');
      showStep2();
      return;
    }
    submit1.disabled = true;
    say('Joining the waitlist.', 'info');
    post(payload({}))
      .then(function () { say('You are on the waitlist.', 'ok'); showStep2(); })
      .catch(function () { say('That did not go through. Check your connection and try again.', 'error'); })
      .then(function () { submit1.disabled = false; });
  }

  function sendAnswers() {
    if (mode === 'mailto') { openMail(answers()); return; }
    submit2.disabled = true;
    say('Sending your answers.', 'info');
    post(payload(answers()))
      .then(function () { finish('Thank you. Your answers help set the price and the first cohort.'); })
      .catch(function () {
        submit2.disabled = false;
        say('Your answers did not send. You are still on the waitlist. Try again or skip.', 'error');
      });
  }

  submit2.addEventListener('click', sendAnswers);

  skip.addEventListener('click', function () {
    if (mode === 'mailto') { openMail({}); return; }
    finish('You are on the waitlist. We will email you when assessment opens.');
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (step1.hidden) sendAnswers(); else join();
  });
})();

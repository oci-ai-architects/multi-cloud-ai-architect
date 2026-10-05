(function () {
  var body = document.getElementById('matrix-body');
  if (!body) return;

  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var fmt = new Intl.NumberFormat('en-GB');
  var shortName = function (s) { return s.replace(/\s*\([^)]*\)\s*$/, ''); };
  var repoName = function (url) { return url.replace('https://github.com/', ''); };
  var link = function (href, text) {
    if (!/^https:\/\//.test(href || '')) return esc(text);
    return '<a href="' + esc(href) + '">' + esc(text) + '</a>';
  };
  var unverified = '<span class="tag">unverified</span>';
  var date = function (iso) {
    return new Date(iso + 'T00:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
  };

  function skills(p) {
    var repos = p.officialSkillRepos || [];
    if (!repos.length) return '<span class="muted">None published</span>';
    var top = repos[0];
    var out = link(top.repo, repoName(top.repo));
    var sub = [];
    if (top.stars != null) sub.push('<span class="num">' + fmt.format(top.stars) + '</span> stars');
    if (top.skillCount != null) sub.push('<span class="num">' + top.skillCount + '</span> skills');
    if (sub.length) sub[sub.length - 1] += ', as of ' + date(p.asOf);
    if (repos.length > 1) sub.push('+' + (repos.length - 1) + ' more');
    return out + '<span class="cell-sub">' + sub.join(', ') + '</span>';
  }

  function mcp(p) {
    var live = (p.mcpServers || []).filter(function (m) { return !m.archived; });
    if (!live.length) return '<span class="muted">None published</span>';
    var first = live[0];
    var remote = live.some(function (m) { return m.type === 'remote' || m.type === 'managed'; });
    var href = first.repo || first.url || first.docs;
    var sub = live.length + (live.length === 1 ? ' server or catalog' : ' servers or catalogs') + (remote ? ', hosted option' : '');
    return link(href, shortName(first.name)) + '<span class="cell-sub">' + sub + '</span>';
  }

  function framework(p) {
    var f = (p.agentFrameworks || [])[0];
    if (!f) return '<span class="muted">None published</span>';
    var href = f.repo || f.docs || f.url || f.source || (f.repos && f.repos[0]);
    var sub = f.stars != null ? '<span class="num">' + fmt.format(f.stars) + '</span> stars, as of ' + date(p.asOf) : (f.status || '');
    return link(href, shortName(f.name)) + (sub ? '<span class="cell-sub">' + sub + '</span>' : '');
  }

  function cert(p) {
    var c = (p.certifications || [])[0];
    var gap = p.certificationGap ? '<span class="cell-sub"><span class="tag tag--gap">gap</span> ' + esc(p.certificationGap) + '</span>' : '';
    if (!c) return '<span class="muted">None</span>' + gap;
    var cost = c.costUSD === 0 ? 'free' : c.costUSD != null ? '$' + fmt.format(c.costUSD) : 'price not confirmed';
    var sub = cost + (c.status ? '. ' + esc(c.status) : '');
    return link(c.url, shortName(c.name)) + (c.verified === false ? unverified : '') +
      '<span class="cell-sub">' + sub + '</span>' + gap;
  }

  function row(p) {
    return '<tr>' +
      '<th scope="row">' + esc(p.provider) + '<span class="tier">' + esc(p.tier) + ', read ' + date(p.asOf) + '</span></th>' +
      '<td data-label="Vendor-published skills">' + skills(p) + '</td>' +
      '<td data-label="MCP servers">' + mcp(p) + '</td>' +
      '<td data-label="Agent framework">' + framework(p) + '</td>' +
      '<td data-label="Architect-level certification">' + cert(p) + '</td>' +
      '</tr>';
  }

  fetch('data/provider-matrix.json')
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(function (rows) { body.innerHTML = rows.map(row).join(''); })
    .catch(function () {
      body.innerHTML = '<tr><td colspan="5" class="matrix-status">The provider matrix could not load. The same data is on the <a href="providers.html">providers page</a>.</td></tr>';
    });
})();

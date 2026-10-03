module.exports = String.raw`<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#f3f5f0">
  <title>Admin Voucher</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      color-scheme: light;
      --ink: #182522;
      --muted: #67736d;
      --line: #dce3dc;
      --paper: #f3f5f0;
      --white: #fff;
      --green: #17634d;
      --green-dark: #104b3a;
      --mint: #dceee4;
      --orange: #d96545;
      --orange-pale: #f8e8df;
      --shadow: 0 20px 55px rgba(28, 47, 39, .09);
      font-family: 'DM Sans', sans-serif;
      color: var(--ink);
      background: var(--paper);
    }
    * { box-sizing: border-box; }
    body { min-width: 320px; min-height: 100vh; margin: 0; background: var(--paper); }
    button, input, textarea { font: inherit; }
    button { cursor: pointer; }
    .topbar { height: 76px; display: flex; align-items: center; justify-content: space-between; padding: 0 clamp(20px, 5vw, 72px); border-bottom: 1px solid var(--line); background: rgba(255,255,255,.76); }
    .brand { display: flex; align-items: center; gap: 12px; font-family: 'Manrope', sans-serif; font-size: 14px; font-weight: 800; }
    .brand-mark { width: 38px; height: 38px; display: grid; place-items: center; border-radius: 11px; background: var(--green); color: white; font-size: 19px; }
    .brand small { display: block; margin-top: 1px; color: var(--muted); font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: .7px; text-transform: uppercase; }
    .topbar-meta { display: flex; align-items: center; gap: 18px; color: var(--muted); font-size: 13px; }
    .live-dot { display: inline-block; width: 8px; height: 8px; margin-right: 7px; border-radius: 50%; background: #3b9c72; }
    .button { min-height: 42px; padding: 0 16px; border: 1px solid transparent; border-radius: 7px; font-weight: 700; transition: background .16s ease, transform .16s ease; }
    .button:hover { transform: translateY(-1px); }
    .button-primary { background: var(--green); color: white; }
    .button-primary:hover { background: var(--green-dark); }
    .button-secondary { border-color: var(--line); background: white; color: var(--ink); }
    .button-secondary:hover { background: var(--mint); }
    .button-quiet { background: transparent; color: var(--muted); }
    .button-quiet:hover { background: var(--orange-pale); color: var(--orange); }
    .button-small { min-height: 34px; padding: 0 11px; font-size: 12px; }
    .login-wrap { width: min(1080px, calc(100% - 40px)); min-height: 560px; display: grid; grid-template-columns: 1.04fr .96fr; margin: 7vh auto; overflow: hidden; border: 1px solid var(--line); border-radius: 14px; background: white; box-shadow: var(--shadow); animation: enter .45s ease both; }
    .login-aside { position: relative; display: flex; flex-direction: column; justify-content: space-between; padding: clamp(32px, 5vw, 64px); overflow: hidden; background: var(--green); color: white; }
    .login-aside:after { position: absolute; right: -95px; bottom: -130px; width: 380px; height: 380px; border: 1px solid rgba(255,255,255,.19); border-radius: 50%; content: ''; box-shadow: 0 0 0 38px rgba(255,255,255,.035), 0 0 0 78px rgba(255,255,255,.035); }
    .eyebrow { color: #bbddc8; font-size: 11px; font-weight: 700; letter-spacing: 1.7px; text-transform: uppercase; }
    .login-aside h1 { position: relative; z-index: 1; max-width: 440px; margin: 24px 0 16px; font-family: 'Manrope', sans-serif; font-size: clamp(36px, 5vw, 54px); line-height: 1.08; }
    .login-aside p { position: relative; z-index: 1; max-width: 380px; margin: 0; color: #d6e8de; font-size: 15px; line-height: 1.7; }
    .aside-foot { position: relative; z-index: 1; color: #bbddc8; font-size: 12px; }
    .login-form-wrap { display: flex; align-items: center; padding: clamp(28px, 6vw, 70px); }
    .login-form { width: 100%; max-width: 360px; margin: auto; }
    .login-form h2 { margin: 0 0 8px; font-family: 'Manrope', sans-serif; font-size: 26px; }
    .login-form > p { margin: 0 0 28px; color: var(--muted); font-size: 14px; line-height: 1.55; }
    .field { display: grid; gap: 7px; margin-bottom: 17px; }
    .field label { color: #394640; font-size: 12px; font-weight: 700; }
    .field input, .field textarea { width: 100%; min-height: 45px; padding: 11px 12px; border: 1px solid #cfd9d1; border-radius: 6px; outline: none; background: white; color: var(--ink); }
    .field textarea { min-height: 78px; resize: vertical; }
    .field input:focus, .field textarea:focus { border-color: var(--green); box-shadow: 0 0 0 3px rgba(23,99,77,.12); }
    .login-form .button { width: 100%; margin-top: 7px; }
    .login-hint { margin-top: 17px; color: var(--muted); font-size: 12px; line-height: 1.55; }
    .dashboard { width: min(1320px, calc(100% - 48px)); margin: 38px auto 64px; animation: enter .35s ease both; }
    .page-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; margin-bottom: 25px; }
    .page-heading .eyebrow { color: var(--green); }
    .page-heading h1 { margin: 7px 0 5px; font-family: 'Manrope', sans-serif; font-size: 34px; letter-spacing: 0; }
    .page-heading p { margin: 0; color: var(--muted); font-size: 14px; }
    .stats { display: grid; grid-template-columns: repeat(3, 1fr); margin-bottom: 28px; border: 1px solid var(--line); border-radius: 9px; background: white; }
    .stat { min-height: 100px; padding: 18px 22px; }
    .stat + .stat { border-left: 1px solid var(--line); }
    .stat-label { color: var(--muted); font-size: 12px; font-weight: 600; }
    .stat-value { margin-top: 9px; font-family: 'Manrope', sans-serif; font-size: 27px; font-weight: 800; }
    .workspace { display: grid; grid-template-columns: minmax(0, 1.55fr) minmax(280px, .75fr); align-items: start; gap: 22px; }
    .section { border: 1px solid var(--line); border-radius: 9px; background: white; }
    .section-head { min-height: 68px; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px 19px; border-bottom: 1px solid var(--line); }
    .section-head h2 { margin: 0; font-family: 'Manrope', sans-serif; font-size: 16px; }
    .section-head p { margin: 4px 0 0; color: var(--muted); font-size: 12px; }
    .search { width: min(200px, 45%); min-height: 38px; padding: 8px 10px; border: 1px solid var(--line); border-radius: 6px; outline: none; }
    .search:focus { border-color: var(--green); }
    .table-scroll { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; text-align: left; }
    th { padding: 11px 14px; background: #f8faf7; color: var(--muted); font-size: 10px; letter-spacing: .7px; text-transform: uppercase; white-space: nowrap; }
    td { padding: 14px; border-top: 1px solid #edf0ec; font-size: 12px; vertical-align: middle; }
    .voucher-name { min-width: 165px; font-weight: 700; }
    .voucher-code { display: block; margin-top: 4px; color: var(--muted); font-size: 10px; letter-spacing: .4px; }
    .voucher-value { white-space: nowrap; font-weight: 700; }
    .points { color: var(--green); font-weight: 800; white-space: nowrap; }
    .badge { display: inline-block; padding: 5px 8px; border-radius: 20px; background: var(--mint); color: var(--green-dark); font-size: 10px; font-weight: 700; white-space: nowrap; }
    .badge-off { background: #eceeeb; color: #65706a; }
    .row-actions { display: flex; gap: 5px; white-space: nowrap; }
    .form-body { padding: 19px; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 12px; }
    .form-grid .field { min-width: 0; }
    .field-wide { grid-column: 1 / -1; }
    .form-actions { display: flex; gap: 8px; margin-top: 5px; }
    .empty-state { padding: 32px 18px; color: var(--muted); text-align: center; font-size: 13px; }
    .notice { position: fixed; right: 22px; bottom: 22px; z-index: 5; max-width: min(420px, calc(100vw - 44px)); padding: 13px 17px; border-radius: 7px; background: var(--ink); box-shadow: var(--shadow); color: white; font-size: 13px; opacity: 0; pointer-events: none; transform: translateY(10px); transition: .2s ease; }
    .notice.show { opacity: 1; transform: translateY(0); }
    .notice.error { background: #9e422e; }
    .hidden { display: none !important; }
    @keyframes enter { from { opacity: 0; transform: translateY(9px); } to { opacity: 1; transform: translateY(0); } }
    @media (max-width: 900px) { .workspace { grid-template-columns: 1fr; } .voucher-form-section { grid-row: 1; } }
    @media (max-width: 620px) {
      .topbar { height: 66px; padding: 0 16px; }
      .topbar-meta { gap: 8px; font-size: 11px; }
      .topbar-meta .live-status { display: none; }
      .login-wrap { width: calc(100% - 28px); min-height: 0; grid-template-columns: 1fr; margin: 20px auto; }
      .login-aside { min-height: 220px; padding: 25px; }
      .login-aside h1 { margin: 15px 0 9px; font-size: 34px; }
      .login-aside p { max-width: 320px; font-size: 13px; }
      .aside-foot { margin-top: 25px; }
      .login-form-wrap { padding: 28px 24px 32px; }
      .dashboard { width: calc(100% - 28px); margin: 26px auto 40px; }
      .page-heading { align-items: flex-start; flex-direction: column; }
      .page-heading h1 { font-size: 28px; }
      .stats { grid-template-columns: repeat(3, 1fr); }
      .stat { min-height: 82px; padding: 13px 11px; }
      .stat-value { font-size: 23px; }
      .stat-label { font-size: 10px; }
      .section-head { align-items: flex-start; flex-direction: column; }
      .search { width: 100%; }
      .form-grid { grid-template-columns: 1fr; }
      .field-wide { grid-column: auto; }
      .table-scroll { overflow-x: auto; }
      table { min-width: 620px; }
    }
    @media (prefers-reduced-motion: reduce) { *, *:before, *:after { animation-duration: .01ms !important; transition-duration: .01ms !important; scroll-behavior: auto !important; } }
  </style>
</head>
<body>
  <header class="topbar">
    <div class="brand"><span class="brand-mark">V</span><span>Vantage<small>Rewards operations</small></span></div>
    <div id="topbar-meta" class="topbar-meta"><span class="live-status"><span class="live-dot"></span>Admin portal</span><button id="logout-button" class="button button-quiet button-small hidden" type="button">Keluar</button></div>
  </header>

  <main id="login-screen" class="login-wrap">
    <section class="login-aside">
      <div>
        <div class="eyebrow">Rewards / Control room</div>
        <h1>Kelola voucher, kendalikan reward.</h1>
        <p>Ruang kerja untuk mengatur katalog voucher dan biaya penukaran poin.</p>
      </div>
      <div class="aside-foot">Akses terbatas untuk administrator terdaftar.</div>
    </section>
    <section class="login-form-wrap">
      <form id="login-form" class="login-form">
        <h2>Masuk sebagai admin</h2>
        <p>Gunakan akun dengan role ADMIN untuk membuka dashboard.</p>
        <div class="field"><label for="email">Email admin</label><input id="email" name="email" type="email" autocomplete="username" required></div>
        <div class="field"><label for="password">Password</label><input id="password" name="password" type="password" autocomplete="current-password" required></div>
        <button id="login-submit" class="button button-primary" type="submit">Masuk ke dashboard</button>
        <div id="login-error" class="login-hint" role="status" aria-live="polite"></div>
      </form>
    </section>
  </main>

  <main id="dashboard-screen" class="dashboard hidden">
    <div class="page-heading">
      <div><div class="eyebrow">Catalog management</div><h1>Voucher</h1><p id="welcome-text">Kelola penawaran dan biaya penukaran poin.</p></div>
      <button id="new-voucher-button" class="button button-primary" type="button">+ Voucher baru</button>
    </div>
    <section class="stats" aria-label="Ringkasan voucher">
      <div class="stat"><div class="stat-label">Total voucher</div><div id="total-count" class="stat-value">0</div></div>
      <div class="stat"><div class="stat-label">Aktif</div><div id="active-count" class="stat-value">0</div></div>
      <div class="stat"><div class="stat-label">Nonaktif</div><div id="inactive-count" class="stat-value">0</div></div>
    </section>
    <div class="workspace">
      <section class="section">
        <div class="section-head"><div><h2>Daftar voucher</h2><p>Voucher nonaktif tidak muncul di katalog pengguna.</p></div><input id="search-vouchers" class="search" type="search" placeholder="Cari voucher..." aria-label="Cari voucher"></div>
        <div class="table-scroll"><table><thead><tr><th>Voucher</th><th>Nilai</th><th>Biaya</th><th>Status</th><th>Aksi</th></tr></thead><tbody id="voucher-rows"><tr><td colspan="5" class="empty-state">Memuat data...</td></tr></tbody></table></div>
      </section>
      <section class="section voucher-form-section">
        <div class="section-head"><div><h2 id="form-title">Tambah voucher</h2><p>Isi nominal voucher dan poin yang dibutuhkan.</p></div></div>
        <form id="voucher-form" class="form-body">
          <div class="form-grid">
            <div class="field field-wide"><label for="voucher-code">Kode</label><input id="voucher-code" name="code" maxlength="50" placeholder="BELANJA-100K" pattern="[A-Za-z0-9][A-Za-z0-9_-]{2,49}" required></div>
            <div class="field field-wide"><label for="voucher-title">Nama voucher</label><input id="voucher-title" name="title" maxlength="120" required></div>
            <div class="field"><label for="value-amount">Nilai (IDR)</label><input id="value-amount" name="value_amount" type="number" min="1" step="1" required></div>
            <div class="field"><label for="points-cost">Biaya poin</label><input id="points-cost" name="points_cost" type="number" min="1" step="1" required></div>
            <div class="field field-wide"><label for="voucher-description">Deskripsi</label><textarea id="voucher-description" name="description" maxlength="300" required></textarea></div>
          </div>
          <div class="form-actions"><button id="save-voucher" class="button button-primary" type="submit">Simpan voucher</button><button id="cancel-edit" class="button button-secondary hidden" type="button">Batal</button></div>
        </form>
      </section>
    </div>
  </main>
  <div id="notice" class="notice" role="status" aria-live="polite"></div>

  <script>
    (function () {
      var token = null;
      var vouchers = [];
      var editingId = null;
      var noticeTimer;
      var byId = function (id) { return document.getElementById(id); };

      function notify(message, isError) {
        var notice = byId('notice');
        notice.textContent = message;
        notice.classList.toggle('error', Boolean(isError));
        notice.classList.add('show');
        clearTimeout(noticeTimer);
        noticeTimer = setTimeout(function () { notice.classList.remove('show'); }, 3200);
      }

      function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, function (character) {
          return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
        });
      }

      async function request(path, options) {
        options = options || {};
        options.headers = Object.assign({}, options.headers || {}, token ? { Authorization: 'Bearer ' + token } : {});
        if (options.body) options.headers['Content-Type'] = 'application/json';
        var response = await fetch(path, options);
        var payload = await response.json().catch(function () { return {}; });
        if (!response.ok) {
          var error = new Error(payload.error || 'Permintaan gagal');
          error.status = response.status;
          throw error;
        }
        return payload;
      }

      function showDashboard(user) {
        byId('login-screen').classList.add('hidden');
        byId('dashboard-screen').classList.remove('hidden');
        byId('logout-button').classList.remove('hidden');
        byId('welcome-text').textContent = 'Masuk sebagai ' + (user.name || user.email) + '. Kelola penawaran dan biaya poin.';
      }

      function showLogin() {
        token = null;
        editingId = null;
        vouchers = [];
        byId('login-screen').classList.remove('hidden');
        byId('dashboard-screen').classList.add('hidden');
        byId('logout-button').classList.add('hidden');
        byId('login-form').reset();
        byId('voucher-rows').innerHTML = '';
        resetVoucherForm();
      }

      function rupiah(value) {
        return 'Rp ' + new Intl.NumberFormat('id-ID').format(Number(value));
      }

      function renderVouchers() {
        var query = byId('search-vouchers').value.trim().toLowerCase();
        var filtered = vouchers.filter(function (voucher) {
          return [voucher.title, voucher.code, voucher.description].join(' ').toLowerCase().includes(query);
        });
        byId('total-count').textContent = vouchers.length;
        byId('active-count').textContent = vouchers.filter(function (voucher) { return voucher.is_active; }).length;
        byId('inactive-count').textContent = vouchers.filter(function (voucher) { return !voucher.is_active; }).length;

        if (!filtered.length) {
          byId('voucher-rows').innerHTML = '<tr><td colspan="5" class="empty-state">' + (vouchers.length ? 'Voucher tidak ditemukan.' : 'Belum ada voucher.') + '</td></tr>';
          return;
        }

        byId('voucher-rows').innerHTML = filtered.map(function (voucher) {
          var id = escapeHtml(voucher.id);
          return '<tr>' +
            '<td class="voucher-name">' + escapeHtml(voucher.title) + '<span class="voucher-code">' + escapeHtml(voucher.code) + '</span></td>' +
            '<td class="voucher-value">' + rupiah(voucher.value_amount) + '</td>' +
            '<td class="points">' + new Intl.NumberFormat('id-ID').format(Number(voucher.points_cost)) + ' poin</td>' +
            '<td><span class="badge ' + (voucher.is_active ? '' : 'badge-off') + '">' + (voucher.is_active ? 'Aktif' : 'Nonaktif') + '</span></td>' +
            '<td><div class="row-actions"><button class="button button-secondary button-small" type="button" data-edit="' + id + '">Edit</button>' +
            '<button class="button button-quiet button-small" type="button" data-toggle="' + id + '" data-active="' + String(voucher.is_active) + '">' + (voucher.is_active ? 'Nonaktifkan' : 'Aktifkan') + '</button></div></td>' +
            '</tr>';
        }).join('');
      }

      async function loadVouchers() {
        try {
          var payload = await request('/api/admin/vouchers');
          vouchers = payload.vouchers;
          renderVouchers();
        } catch (error) {
          if (error.status === 401 || error.status === 403) {
            showLogin();
            byId('login-error').textContent = 'Sesi tidak valid. Silakan masuk kembali sebagai admin.';
          } else {
            notify(error.message, true);
          }
        }
      }

      function resetVoucherForm() {
        byId('voucher-form').reset();
        byId('form-title').textContent = 'Tambah voucher';
        byId('save-voucher').textContent = 'Simpan voucher';
        byId('cancel-edit').classList.add('hidden');
        editingId = null;
      }

      byId('login-form').addEventListener('submit', async function (event) {
        event.preventDefault();
        byId('login-error').textContent = '';
        byId('login-submit').disabled = true;
        try {
          var payload = await request('/api/admin/login', {
            method: 'POST',
            body: JSON.stringify({ email: byId('email').value, password: byId('password').value }),
          });
          token = payload.token;
          showDashboard(payload.user);
          await loadVouchers();
        } catch (error) {
          byId('login-error').textContent = error.message;
        } finally {
          byId('login-submit').disabled = false;
        }
      });

      byId('voucher-form').addEventListener('submit', async function (event) {
        event.preventDefault();
        var payload = {
          code: byId('voucher-code').value,
          title: byId('voucher-title').value,
          value_amount: Number(byId('value-amount').value),
          points_cost: Number(byId('points-cost').value),
          description: byId('voucher-description').value,
        };
        var button = byId('save-voucher');
        button.disabled = true;
        try {
          await request(editingId ? '/api/admin/vouchers/' + encodeURIComponent(editingId) : '/api/admin/vouchers', {
            method: editingId ? 'PUT' : 'POST',
            body: JSON.stringify(payload),
          });
          notify(editingId ? 'Voucher diperbarui.' : 'Voucher berhasil dibuat.');
          resetVoucherForm();
          await loadVouchers();
        } catch (error) {
          notify(error.message, true);
        } finally {
          button.disabled = false;
        }
      });

      byId('voucher-rows').addEventListener('click', async function (event) {
        var editButton = event.target.closest('[data-edit]');
        if (editButton) {
          var voucher = vouchers.find(function (item) { return item.id === editButton.dataset.edit; });
          if (!voucher) return;
          editingId = voucher.id;
          byId('voucher-code').value = voucher.code;
          byId('voucher-title').value = voucher.title;
          byId('value-amount').value = voucher.value_amount;
          byId('points-cost').value = voucher.points_cost;
          byId('voucher-description').value = voucher.description;
          byId('form-title').textContent = 'Edit voucher';
          byId('save-voucher').textContent = 'Simpan perubahan';
          byId('cancel-edit').classList.remove('hidden');
          byId('voucher-code').focus();
          return;
        }

        var toggleButton = event.target.closest('[data-toggle]');
        if (!toggleButton) return;
        try {
          await request('/api/admin/vouchers/' + encodeURIComponent(toggleButton.dataset.toggle) + '/status', {
            method: 'PATCH',
            body: JSON.stringify({ is_active: toggleButton.dataset.active !== 'true' }),
          });
          notify('Status voucher diperbarui.');
          await loadVouchers();
        } catch (error) {
          notify(error.message, true);
        }
      });

      byId('search-vouchers').addEventListener('input', renderVouchers);
      byId('cancel-edit').addEventListener('click', resetVoucherForm);
      byId('new-voucher-button').addEventListener('click', function () {
        resetVoucherForm();
        byId('voucher-code').focus();
      });
      byId('logout-button').addEventListener('click', showLogin);
    })();
  </script>
</body>
</html>`;
/**
 * Life ERP Extensions — finance depth, import, command palette, productivity, charts, bank sync.
 * Loaded after admin.js; initialized via window.initLifeERPExtensions(api).
 */
(function () {
  'use strict';

  let api = null;
  let financeMonth = null;
  let financeSourceFilter = 'all';
  let financeAccountFilter = 'all';
  let paletteIndex = 0;
  let paletteItems = [];

  const getFinanceMonth = () => {
    if (financeMonth) return financeMonth;
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
  };

  const monthStartEnd = (ym) => {
    const [y, m] = ym.split('-').map(Number);
    const start = `${y}-${String(m).padStart(2, '0')}-01`;
    const last = new Date(y, m, 0).getDate();
    const end = `${y}-${String(m).padStart(2, '0')}-${String(last).padStart(2, '0')}`;
    return { start, end };
  };

  const txnsInMonth = (txns, ym) => {
    const { start, end } = monthStartEnd(ym);
    return (txns || []).filter(t => t.date >= start && t.date <= end);
  };

  const txnSource = (t) => {
    if (t._lifeLogEntryId) return 'lifelog';
    if (t._sfinId) return 'bank';
    if (t._importHash) return 'import';
    return 'manual';
  };

  const SOURCE_LABELS = { import: 'OFX import', bank: 'Bank sync', lifelog: 'Life Log', manual: 'Manual' };
  const SOURCE_COLORS = { import: 'text-blue-500', bank: 'text-green-500', lifelog: 'text-purple-500', manual: 'text-slate-400' };

  const filterBySource = (txns) => {
    if (financeSourceFilter === 'all') return txns;
    if (financeSourceFilter === 'transfer') return txns.filter(t => t.type === 'transfer');
    return txns.filter(t => txnSource(t) === financeSourceFilter);
  };

  const filterByAccount = (txns) => {
    if (financeAccountFilter === 'all') return txns;
    if (financeAccountFilter === 'none') return txns.filter(t => !t.accountId);
    return txns.filter(t => t.accountId === financeAccountFilter);
  };

  const applyTxnFilters = (txns) => filterByAccount(filterBySource(txns));

  const isSpendingExpense = (t) => t.type === 'expense';

  const CC_PAYMENT_RE = /credit\s*card|card\s*payment|card\s*pymt|autopay|auto\s*pay|payment\s*thank\s*you|online\s*payment|payment\s*to\s*chase|chase\s*credit|capital\s*one|discover\s*card|amex|american\s*express|citi\s*card|apple\s*card|barclays\s*card|syncb|card\s*bill|visa\s*payment|mastercard/i;

  const looksLikeCcPayment = (desc) => CC_PAYMENT_RE.test(String(desc || ''));

  // ─── Finance: month filter, budgets, recurring, balance sync ───
  function patchFinance() {
    const origRender = api.renderFinance;
    if (!origRender || origRender.__patched) return;

    api.renderFinance = function patchedRenderFinance() {
      const f = api.finance;
      f.budgets = f.budgets || {};
      f.recurring = f.recurring || [];
      f.settings = f.settings || { autoUpdateBalance: false };
      const ym = getFinanceMonth();
      const picker = document.getElementById('financeMonthPicker');
      if (picker && picker.value !== ym) picker.value = ym;
      const monthTxns = applyTxnFilters(txnsInMonth(f.transactions, ym));
      const income = monthTxns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expenses = monthTxns.filter(isSpendingExpense).reduce((s, t) => s + t.amount, 0);
      const elInc = document.getElementById('totalIncome');
      const elExp = document.getElementById('totalExpenses');
      const elBal = document.getElementById('totalBalance');
      if (elInc) elInc.textContent = api.formatCurrency(income);
      if (elExp) elExp.textContent = api.formatCurrency(expenses);
      if (elBal) elBal.textContent = api.formatCurrency(income - expenses);

      const container = document.getElementById('transactionsContainer');
      const txns = f.transactions || [];
      if (!container) return;
      const filtered = applyTxnFilters(txnsInMonth(txns, ym));
      if (filtered.length === 0) {
        container.innerHTML = `<div class="text-center py-8 text-slate-400"><i class="fas fa-receipt text-3xl mb-2 opacity-50"></i><p class="text-sm">${financeSourceFilter === 'all' ? 'No transactions this month' : 'No transactions for this source'}</p></div>`;
      } else {
        const sorted = api.sortTxns(filtered);
        const byDate = {};
        sorted.forEach(t => { const d = t.date || '1970-01-01'; (byDate[d] = byDate[d] || []).push(t); });
        let html = '';
        Object.keys(byDate).sort((a, b) => new Date(b) - new Date(a)).forEach(dateStr => {
          html += `<div class="mb-4"><div class="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 px-1">${api.formatDate(dateStr)}</div><div class="space-y-2 txn-date-group" data-date="${dateStr}">`;
          byDate[dateStr].forEach(t => {
            const src = txnSource(t);
            const srcLabel = t.type === 'transfer' ? 'Transfer' : (SOURCE_LABELS[src] || src);
            const srcColor = t.type === 'transfer' ? 'text-slate-400' : (SOURCE_COLORS[src] || 'text-slate-400');
            const isInc = t.type === 'income';
            const isXfer = t.type === 'transfer';
            const boxCls = isInc ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : isXfer ? 'bg-slate-200 dark:bg-slate-600 text-slate-500' : 'bg-red-100 dark:bg-red-900/30 text-red-600';
            const iconCls = isXfer ? 'fa-right-left' : `fa-arrow-${isInc ? 'down' : 'up'}`;
            const amtCls = isInc ? 'text-green-600' : isXfer ? 'text-slate-500' : 'text-red-600';
            const sign = isInc ? '+' : isXfer ? '' : '-';
            html += `<div class="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl group txn-row" data-txn-id="${t.id}" draggable="true">
              <span class="cursor-grab text-slate-400 drag-handle"><i class="fas fa-grip-vertical text-sm"></i></span>
              <div class="w-10 h-10 flex-shrink-0 ${boxCls} rounded-lg flex items-center justify-center"><i class="fas ${iconCls}"></i></div>
              <div class="flex-1 min-w-0"><p class="font-medium text-slate-900 dark:text-white text-sm truncate">${(t.description || '').replace(/</g, '&lt;')}</p><p class="text-xs text-slate-500">${t.category || ''}<span class="${srcColor}"> · ${srcLabel}</span></p></div>
              <p class="font-bold flex-shrink-0 ${amtCls}">${sign}${api.formatCurrency(t.amount)}</p>
              <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                <button onclick="editTxn('${t.id}')" class="p-2 text-blue-500" title="Edit"><i class="fas fa-pen text-xs"></i></button>
                <button onclick="deleteTxn('${t.id}')" class="p-2 text-red-400" title="Delete"><i class="fas fa-trash text-xs"></i></button>
              </div></div>`;
          });
          html += '</div></div>';
        });
        container.innerHTML = html;
        if (api.attachTxnDragListeners) api.attachTxnDragListeners();
      }
      if (document.getElementById('accountsContainer') && api.renderAccounts) api.renderAccounts();
      renderBudgetsUI();
      renderRecurringUI();
      populateAccountFilter();
    };
    api.renderFinance.__patched = true;

    document.getElementById('financeMonthPicker')?.addEventListener('change', (e) => {
      financeMonth = e.target.value;
      api.renderFinance();
    });

    document.getElementById('financeSourceFilter')?.addEventListener('change', (e) => {
      financeSourceFilter = e.target.value;
      api.renderFinance();
    });

    document.getElementById('financeAutoBalance')?.addEventListener('change', (e) => {
      api.finance.settings = api.finance.settings || {};
      api.finance.settings.autoUpdateBalance = e.target.checked;
      api.saveData('finance', api.finance);
    });

    document.getElementById('addRecurringBtn')?.addEventListener('click', () => openRecurringModal());
    document.getElementById('importBankBtn')?.addEventListener('click', () => openImportModal('bank'));
    document.getElementById('importCardBtn')?.addEventListener('click', () => openImportModal('credit_card'));
    document.getElementById('importTransactionsBtnSettings')?.addEventListener('click', () => openImportModal());

    document.getElementById('financeAccountFilter')?.addEventListener('change', (e) => {
      financeAccountFilter = e.target.value;
      api.renderFinance();
    });

    processRecurringTransactions();
  }

  function applyBalanceFromTxn(txn, sign) {
    if (!api.finance.settings?.autoUpdateBalance || !txn.accountId) return;
    const acct = (api.finance.accounts || []).find(a => a.id === txn.accountId);
    if (!acct) return;
    const delta = txn.type === 'income' ? txn.amount : -txn.amount;
    acct.currentBalance = Math.round(((acct.currentBalance || 0) + sign * delta) * 100) / 100;
    acct.balanceHistory = acct.balanceHistory || [];
    acct.balanceHistory.push({ date: api.getLocalDateString(), balance: acct.currentBalance });
  }

  function processRecurringTransactions() {
    const f = api.finance;
    f.recurring = f.recurring || [];
    const today = api.getLocalDateString();
    let changed = false;
    f.recurring.filter(r => r.active !== false).forEach(r => {
      while (r.nextDate && r.nextDate <= today) {
        f.transactions = f.transactions || [];
        const dup = f.transactions.some(t => t._recurringId === r.id && t.date === r.nextDate);
        if (!dup) {
          const txn = {
            id: api.generateId(), type: r.type, description: r.description, amount: r.amount,
            category: r.category, accountId: r.accountId || null, date: r.nextDate,
            createdAt: Date.now(), _recurringId: r.id
          };
          f.transactions.push(txn);
          applyBalanceFromTxn(txn, 1);
        }
        r.nextDate = advanceCadence(r.nextDate, r.cadence);
        changed = true;
      }
    });
    if (changed) { api.saveData('finance', f); api.renderFinance(); api.updateStats?.(); }
  }

  function advanceCadence(dateStr, cadence) {
    const d = api.parseLocalDate(dateStr);
    if (cadence === 'weekly') d.setDate(d.getDate() + 7);
    else if (cadence === 'yearly') d.setFullYear(d.getFullYear() + 1);
    else d.setMonth(d.getMonth() + 1);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function renderBudgetsUI() {
    const el = document.getElementById('budgetsContainer');
    if (!el) return;
    const ym = getFinanceMonth();
    const f = api.finance;
    f.budgets = f.budgets || {};
    const monthBudgets = f.budgets[ym] || f.budgets.default || {};
    const monthTxns = txnsInMonth(f.transactions, ym).filter(isSpendingExpense);
    const spent = {};
    monthTxns.forEach(t => { const c = t.category || 'Other'; spent[c] = (spent[c] || 0) + t.amount; });
    const cats = [...new Set([...api.TXN_CATEGORIES.filter(c => !['Salary', 'Interest'].includes(c)), ...Object.keys(monthBudgets)])];
    el.innerHTML = cats.map(cat => {
      const budget = monthBudgets[cat] || 0;
      const s = spent[cat] || 0;
      const pct = budget > 0 ? Math.min(100, Math.round(s / budget * 100)) : 0;
      const color = pct >= 100 ? '#ef4444' : pct >= 80 ? '#f59e0b' : '#10b981';
      return `<div class="mb-3"><div class="flex justify-between text-sm mb-1"><span class="text-slate-600 dark:text-slate-300">${cat}</span><span class="font-medium">${api.formatCurrency(s)}${budget ? ' / ' + api.formatCurrency(budget) : ''}</span></div>
        ${budget ? `<div class="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden"><div class="h-full rounded-full" style="width:${pct}%;background:${color}"></div></div>` : ''}
        <input type="number" min="0" step="1" data-budget-cat="${cat}" value="${budget || ''}" placeholder="Set budget" class="mt-1 w-full px-2 py-1 text-xs bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white"></div>`;
    }).join('');
    el.querySelectorAll('[data-budget-cat]').forEach(inp => {
      inp.addEventListener('change', () => {
        const cat = inp.dataset.budgetCat;
        f.budgets[ym] = f.budgets[ym] || {};
        f.budgets[ym][cat] = parseFloat(inp.value) || 0;
        api.saveData('finance', f);
        renderBudgetsUI();
      });
    });
  }

  function renderRecurringUI() {
    const el = document.getElementById('recurringContainer');
    if (!el) return;
    const list = api.finance.recurring || [];
    if (!list.length) { el.innerHTML = '<p class="text-sm text-slate-400 text-center py-4">No recurring transactions</p>'; return; }
    el.innerHTML = list.map(r => `<div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl mb-2">
      <div><p class="text-sm font-medium text-slate-900 dark:text-white">${(r.description || '').replace(/</g, '&lt;')}</p>
      <p class="text-xs text-slate-500">${r.cadence} · next ${r.nextDate} · ${api.formatCurrency(r.amount)}</p></div>
      <button type="button" data-del-recurring="${r.id}" class="p-2 text-red-400 hover:text-red-600"><i class="fas fa-trash text-xs"></i></button></div>`).join('');
    el.querySelectorAll('[data-del-recurring]').forEach(btn => btn.addEventListener('click', () => {
      api.finance.recurring = api.finance.recurring.filter(x => x.id !== btn.dataset.delRecurring);
      api.saveData('finance', api.finance);
      renderRecurringUI();
    }));
  }

  function openRecurringModal() {
    const catOpts = api.TXN_CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('');
    api.openModal('Add Recurring Transaction', `<form id="recurringForm" class="space-y-3">
      <input type="text" id="recDesc" required placeholder="Description" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white">
      <div class="grid grid-cols-2 gap-2">
        <select id="recType" class="px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white"><option value="expense">Expense</option><option value="income">Income</option></select>
        <input type="number" id="recAmount" required min="0" step="0.01" placeholder="Amount" class="px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white">
      </div>
      <select id="recCat" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white">${catOpts}</select>
      <select id="recCadence" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white"><option value="weekly">Weekly</option><option value="monthly" selected>Monthly</option><option value="yearly">Yearly</option></select>
      <input type="date" id="recNext" required value="${api.getLocalDateString()}" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white">
      <button type="submit" class="w-full py-2.5 gradient-bg text-white font-medium rounded-lg">Add Recurring</button></form>`);
    document.getElementById('recurringForm').addEventListener('submit', e => {
      e.preventDefault();
      api.finance.recurring = api.finance.recurring || [];
      api.finance.recurring.push({
        id: api.generateId(), description: document.getElementById('recDesc').value,
        type: document.getElementById('recType').value, amount: api.parseAmount(document.getElementById('recAmount').value),
        category: document.getElementById('recCat').value, cadence: document.getElementById('recCadence').value,
        nextDate: document.getElementById('recNext').value, active: true
      });
      api.saveData('finance', api.finance);
      api.closeModal();
      processRecurringTransactions();
      renderRecurringUI();
    });
  }

  // ─── OFX / CSV Import ───
  const classifyImportRow = (signedAmt, desc, accountType) => {
    const amount = Math.abs(signedAmt);
    let type = signedAmt >= 0 ? 'income' : 'expense';
    let category = 'Other';
    const isBank = typeof window.isBankCashAccount === 'function' && window.isBankCashAccount(accountType);
    if (signedAmt < 0 && isBank && accountType !== 'credit_card' && looksLikeCcPayment(desc)) {
      type = 'transfer';
      category = 'Transfer';
    }
    return { type, category, amount };
  };

  function buildImportAccountSelect(selectedId, preset) {
    const accts = api.finance.accounts || [];
    const banks = accts.filter(a => ['checking', 'savings', 'cash'].includes(a.type));
    const cards = accts.filter(a => a.type === 'credit_card');
    const other = accts.filter(a => !banks.includes(a) && !cards.includes(a));
    const opt = (a) => `<option value="${a.id}"${a.id === selectedId ? ' selected' : ''}>${(a.name || 'Account').replace(/</g, '&lt;')}</option>`;
    let html = '<option value="">— Select account —</option>';
    if (banks.length) html += `<optgroup label="Bank accounts">${banks.map(opt).join('')}</optgroup>`;
    if (cards.length) html += `<optgroup label="Credit cards">${cards.map(opt).join('')}</optgroup>`;
    if (other.length) html += `<optgroup label="Other">${other.map(opt).join('')}</optgroup>`;
    return html;
  }

  function importHintForAccount(accountId) {
    const a = (api.finance.accounts || []).find(x => x.id === accountId);
    if (!a) return 'Select the account this OFX file belongs to.';
    if (a.type === 'credit_card') return 'Credit card import: each line is a purchase and counts toward spending.';
    if (typeof window.isBankCashAccount === 'function' && window.isBankCashAccount(a.type)) {
      return 'Bank import: income & bills count as spending/cash flow. CC statement payments auto-mark as transfers.';
    }
    return 'Transactions will link to this account.';
  }

  function parseOfx(text, accountType) {
    const txns = [];
    let balances = {};
    const stmtRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi;
    let m;
    while ((m = stmtRegex.exec(text)) !== null) {
      const block = m[1];
      const get = (tag) => { const r = new RegExp('<' + tag + '>([^<\\n]+)', 'i'); const x = block.match(r); return x ? x[1].trim() : ''; };
      const signedAmt = parseFloat(get('TRNAMT')) || 0;
      const dateRaw = get('DTPOSTED') || get('DTUSER');
      const date = dateRaw.length >= 8 ? `${dateRaw.slice(0, 4)}-${dateRaw.slice(4, 6)}-${dateRaw.slice(6, 8)}` : api.getLocalDateString();
      const desc = get('NAME') || get('MEMO') || 'Import';
      const { type, category, amount } = classifyImportRow(signedAmt, desc, accountType);
      txns.push({ date, description: desc, amount, type, category, signedAmt, _importHash: get('FITID') || `${date}-${signedAmt}-${get('MEMO')}` });
    }
    const balMatch = text.match(/<LEDGERBAL>[\s\S]*?<BALAMT>([^<]+)/i);
    if (balMatch) balances.ledger = parseFloat(balMatch[1]);
    return { txns, balances };
  }

  function parseCsv(text) {
    const lines = text.trim().split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    return lines.slice(1).map(line => {
      const cols = line.match(/("([^"]|"")*"|[^,]*)/g)?.map(c => c.replace(/^"|"$/g, '').replace(/""/g, '"').trim()) || line.split(',');
      const row = {};
      headers.forEach((h, i) => { row[h.toLowerCase()] = (cols[i] || '').trim(); });
      const amt = parseFloat(row.amount || row.debit || row.credit || row['transaction amount'] || '0') || 0;
      const rawDate = row.date || row['transaction date'] || row.posted || '';
      let date = rawDate;
      if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(rawDate)) {
        const [mo, da, yr] = rawDate.split('/');
        date = `${yr.length === 2 ? '20' + yr : yr}-${mo.padStart(2, '0')}-${da.padStart(2, '0')}`;
      }
      return { date: date || api.getLocalDateString(), description: row.description || row.memo || row.payee || 'Import', amount: Math.abs(amt), type: amt >= 0 && !row.debit ? 'income' : 'expense', category: row.category || 'Other', _importHash: `${date}-${amt}-${row.description}` };
    });
  }

  function mergeImportedTransactions(rows, accountId, balances) {
    api.finance.transactions = api.finance.transactions || [];
    api.finance.settings = api.finance.settings || {};
    const batchAt = Date.now();
    api.finance.settings.lastImportBatchAt = batchAt;
    let added = 0, skipped = 0;
    rows.forEach(row => {
      const hash = row._importHash || `${row.date}-${row.amount}-${row.description}`;
      const exists = api.finance.transactions.some(t =>
        t._importHash === hash || (t.date === row.date && t.amount === row.amount && t.description === row.description)
      );
      if (exists) { skipped++; return; }
      api.finance.transactions.push({
        id: api.generateId(), type: row.type, description: row.description, amount: row.amount,
        category: row.category || 'Other', accountId: accountId || null, date: row.date,
        createdAt: Date.now(), _importHash: hash, _importBatchAt: batchAt
      });
      added++;
    });
    if (accountId && balances?.ledger != null) {
      const acct = (api.finance.accounts || []).find(a => a.id === accountId);
      if (acct) {
        acct.currentBalance = balances.ledger;
        acct.balanceHistory = acct.balanceHistory || [];
        acct.balanceHistory.push({ date: api.getLocalDateString(), balance: balances.ledger });
      }
    }
    api.saveData('finance', api.finance);
    api.renderFinance();
    api.updateStats?.();
    return { added, skipped };
  }

  function openImportModal(preset, preselectAccountId) {
    const accts = api.finance.accounts || [];
    const defaultId = preselectAccountId
      || (preset === 'credit_card' ? accts.find(a => a.type === 'credit_card')?.id : null)
      || (preset === 'bank' ? accts.find(a => ['checking', 'savings', 'cash'].includes(a.type))?.id : null)
      || '';
    const title = preset === 'credit_card' ? 'Import credit card (OFX)' : preset === 'bank' ? 'Import bank account (OFX)' : 'Import transactions (OFX)';
    api.openModal(title, `<div class="space-y-4">
      <p class="text-sm text-slate-500">Download OFX/QFX from your bank or card issuer, then upload here.</p>
      <div><label class="block text-xs font-medium text-slate-500 mb-1">Target account</label>
      <select id="importAccount" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white">
        ${buildImportAccountSelect(defaultId, preset)}
      </select></div>
      <p id="importHint" class="text-xs text-blue-600 dark:text-blue-400">${importHintForAccount(defaultId)}</p>
      <input type="file" id="importFile" accept=".ofx,.qfx,.csv,.txt" class="w-full text-sm">
      <div id="importPreview" class="max-h-40 overflow-y-auto text-xs"></div>
      <button type="button" id="importConfirmBtn" class="w-full py-2.5 gradient-bg text-white font-medium rounded-lg" disabled>Import</button></div>`);
    let parsedRows = [], parsedBalances = {}, rawOfxText = '';
    const refreshPreview = () => {
      const acctId = document.getElementById('importAccount')?.value;
      const acct = accts.find(a => a.id === acctId);
      document.getElementById('importHint').textContent = importHintForAccount(acctId);
      if (rawOfxText && !rawOfxText.toLowerCase().includes('.csv')) {
        parsedRows = parseOfx(rawOfxText, acct?.type).txns;
      }
      if (!parsedRows.length) {
        document.getElementById('importPreview').innerHTML = acctId ? '<p class="text-slate-400">Choose a file to preview</p>' : '<p class="text-amber-600">Select an account first</p>';
        document.getElementById('importConfirmBtn').disabled = true;
        return;
      }
      document.getElementById('importPreview').innerHTML = `<p class="font-medium mb-1">${parsedRows.length} transactions found</p>` +
        parsedRows.slice(0, 8).map(r => `<div class="py-1 border-b border-slate-100 dark:border-slate-700">${r.date} · ${r.description} · ${r.type === 'transfer' ? '↔' : ''}${api.formatCurrency(r.amount)}${r.type === 'transfer' ? ' (transfer)' : ''}</div>`).join('') +
        (parsedRows.length > 8 ? `<p class="text-slate-400 mt-1">+${parsedRows.length - 8} more</p>` : '') +
        (() => {
          const max = Math.max(...parsedRows.map(r => r.amount || 0), 0);
          const totalExp = parsedRows.filter(isSpendingExpense).reduce((s, r) => s + r.amount, 0);
          if (max > 100000 || totalExp > 500000) {
            return `<p class="text-red-600 dark:text-red-400 font-medium mt-2"><i class="fas fa-exclamation-triangle mr-1"></i>Amounts look wrong (max ${api.formatCurrency(max)}). Check the preview before importing.</p>`;
          }
          return '';
        })();
      document.getElementById('importConfirmBtn').disabled = !acctId;
    };
    document.getElementById('importAccount')?.addEventListener('change', refreshPreview);
    document.getElementById('importFile').addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      rawOfxText = await file.text();
      const lower = file.name.toLowerCase();
      const acct = accts.find(a => a.id === document.getElementById('importAccount')?.value);
      if (lower.endsWith('.csv')) parsedRows = parseCsv(rawOfxText);
      else { const p = parseOfx(rawOfxText, acct?.type); parsedRows = p.txns; parsedBalances = p.balances; }
      refreshPreview();
    });
    refreshPreview();
    document.getElementById('importConfirmBtn').addEventListener('click', () => {
      const acctId = document.getElementById('importAccount').value || null;
      if (!acctId) return;
      const { added, skipped } = mergeImportedTransactions(parsedRows, acctId, parsedBalances);
      api.closeModal();
      api.addNotification?.('Import complete', `Added ${added}, skipped ${skipped} duplicates`, 'info');
      populateAccountFilter();
    });
  }

  window.openAccountImport = (accountId) => {
    const a = (api.finance.accounts || []).find(x => x.id === accountId);
    const preset = a?.type === 'credit_card' ? 'credit_card' : 'bank';
    openImportModal(preset, accountId);
  };

  function populateAccountFilter() {
    const sel = document.getElementById('financeAccountFilter');
    if (!sel) return;
    const cur = financeAccountFilter;
    sel.innerHTML = '<option value="all">All accounts</option><option value="none">Unlinked</option>' +
      (api.finance.accounts || []).map(a =>
        `<option value="${a.id}">${(a.name || 'Account').replace(/</g, '&lt;')}${a.type === 'credit_card' ? ' (card)' : ''}</option>`
      ).join('');
    if ([...sel.options].some(o => o.value === cur)) sel.value = cur;
  }

  /** Remove OFX/CSV imports. Keeps manual entries and SimpleFIN sync (_sfinId). */
  function removeImportedTransactions(onlyLastBatch = true) {
    const f = api.finance;
    const batchAt = f.settings?.lastImportBatchAt;
    const hasBatch = batchAt && (f.transactions || []).some(t => t._importBatchAt === batchAt);
    const cutoff = Date.now() - 24 * 3600 * 1000;
    const before = (f.transactions || []).length;
    f.transactions = (f.transactions || []).filter(t => {
      if (t._sfinId) return true;
      if (!t._importHash) return true;
      if (onlyLastBatch) {
        if (hasBatch) return t._importBatchAt !== batchAt;
        return !(t.createdAt && t.createdAt >= cutoff);
      }
      return false;
    });
    const removed = before - f.transactions.length;
    api.saveData('finance', f);
    api.renderFinance();
    api.updateStats?.();
    api.renderDashboardWidgets?.();
    return removed;
  }

  function confirmRemoveImport(onlyLastBatch) {
    const label = onlyLastBatch ? 'Undo last import' : 'Remove all file imports';
    const msg = onlyLastBatch
      ? 'Remove all transactions from your most recent OFX/CSV import? Manual entries and bank sync are kept.'
      : 'Remove ALL transactions from OFX/CSV imports? Manual entries and bank sync are kept.';
    if (!confirm(msg)) return;
    const n = removeImportedTransactions(onlyLastBatch);
    api.addNotification?.(label, `Removed ${n} imported transaction${n === 1 ? '' : 's'}.`, n ? 'info' : 'warning');
  }

  /** Drop Life Log finance rows that duplicate a bank/file import (same date + amount). */
  function dedupeLifeLogAgainstImports() {
    const txns = api.finance.transactions || [];
    const imported = txns.filter(t => t._importHash || t._sfinId);
    if (!imported.length) return 0;
    const before = txns.length;
    api.finance.transactions = txns.filter(t => {
      if (!t._lifeLogEntryId) return true;
      return !imported.some(imp =>
        imp.date === t.date && Math.abs((imp.amount || 0) - (t.amount || 0)) < 0.02
      );
    });
    const removed = before - api.finance.transactions.length;
    if (removed) {
      api.saveData('finance', api.finance);
      api.renderFinance();
      api.updateStats?.();
      api.renderDashboardWidgets?.();
    }
    return removed;
  }

  function confirmDedupeLifeLog() {
    if (!confirm('Remove Life Log finance entries that match a bank/file import on the same date and amount? Manual entries are not touched.')) return;
    const n = dedupeLifeLogAgainstImports();
    api.addNotification?.('Dedupe complete', n ? `Removed ${n} duplicate Life Log entr${n === 1 ? 'y' : 'ies'}.` : 'No matching duplicates found.', n ? 'info' : 'warning');
  }

  function markCcPaymentsAsTransfers() {
    let n = 0;
    (api.finance.transactions || []).forEach(t => {
      if (t.type === 'expense' && looksLikeCcPayment(t.description)) {
        t.type = 'transfer';
        t.category = 'Transfer';
        n++;
      }
    });
    if (n) {
      api.saveData('finance', api.finance);
      api.renderFinance();
      api.updateStats?.();
      api.renderDashboardWidgets?.();
    }
    return n;
  }

  function confirmMarkCcTransfers() {
    if (!confirm('Mark imported CC statement payments as transfers? They will stay visible but won\'t count toward spending totals.')) return;
    const n = markCcPaymentsAsTransfers();
    api.addNotification?.('CC payments updated', n ? `Marked ${n} payment${n === 1 ? '' : 's'} as transfers.` : 'No matching CC payments found — try editing descriptions manually to Transfer.', n ? 'info' : 'warning');
  }

  // ─── Command palette ───
  const PALETTE_ACTIONS = () => [
    { kind: 'action', icon: 'fa-plus', color: '#3b82f6', title: 'Add task', sub: 'Create a new task', run: () => api.addTaskModal?.() },
    { kind: 'action', icon: 'fa-dollar-sign', color: '#10b981', title: 'Add transaction', sub: 'Finance', run: () => document.getElementById('addTransactionBtn')?.click() },
    { kind: 'action', icon: 'fa-broom', color: '#0ea5e9', title: 'Add chore', sub: 'Chores', run: () => api.addChoreModal?.() },
    { kind: 'action', icon: 'fa-sync-alt', color: '#3b82f6', title: 'Add habit', sub: 'Habits', run: () => api.addHabitModal?.() },
    { kind: 'action', icon: 'fa-utensils', color: '#f59e0b', title: 'Log meal', sub: 'Life Log', run: () => api.openLogModal?.('meal') },
    { kind: 'action', icon: 'fa-file-import', color: '#8b5cf6', title: 'Import transactions', sub: 'OFX / CSV', run: () => openImportModal() },
    { kind: 'action', icon: 'fa-chart-pie', color: '#6366f1', title: 'Weekly review', sub: 'Last 7 days', run: () => openWeeklyReview() },
    { kind: 'action', icon: 'fa-keyboard', color: '#64748b', title: 'Keyboard shortcuts', sub: '?', run: () => openShortcutsHelp() },
    { kind: 'action', icon: 'fa-download', color: '#6366f1', title: 'Export JSON backup', sub: 'Settings', run: () => document.getElementById('exportData')?.click() },
    ...['dashboard', 'tasks', 'goals', 'habits', 'chores', 'lifelog', 'library', 'finance', 'health', 'journal', 'settings'].map(id => ({
      kind: 'action', icon: 'fa-arrow-right', color: '#475569', title: 'Go to ' + id.charAt(0).toUpperCase() + id.slice(1), sub: 'Navigate', run: () => api.showSection(id)
    }))
  ];

  function patchCommandPalette() {
    const orig = api.runGlobalSearch;
    if (!orig || orig.__patched) return;
    api.runGlobalSearch = function (q) {
      const panel = document.getElementById('globalSearchResults');
      if (!panel) return orig(q);
      const query = (q || '').trim().toLowerCase();
      if (!query) { panel.classList.add('hidden'); paletteItems = []; return; }
      const actions = PALETTE_ACTIONS().filter(a => (a.title + ' ' + a.sub).toLowerCase().includes(query));
      const records = (api.buildSearchIndex?.() || []).filter(it => it.text.includes(query)).slice(0, 25);
      paletteItems = [...actions, ...records];
      paletteIndex = 0;
      renderPalette(panel, query);
    };
    api.runGlobalSearch.__patched = true;

    document.getElementById('globalSearchInput')?.addEventListener('keydown', (e) => {
      if (!paletteItems.length) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); paletteIndex = Math.min(paletteIndex + 1, paletteItems.length - 1); highlightPalette(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); paletteIndex = Math.max(paletteIndex - 1, 0); highlightPalette(); }
      else if (e.key === 'Enter') { e.preventDefault(); activatePaletteItem(paletteItems[paletteIndex]); }
    });
  }

  function renderPalette(panel, query) {
    if (!paletteItems.length) {
      panel.innerHTML = `<div class="p-4 text-sm text-slate-500 text-center">No results for "${query.replace(/</g, '&lt;')}"</div>`;
      panel.classList.remove('hidden');
      return;
    }
    panel.innerHTML = '<div class="p-2">' + paletteItems.map((m, i) => {
      if (m.kind === 'action') {
        return `<button type="button" data-palette-idx="${i}" class="palette-item w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-left ${i === paletteIndex ? 'bg-blue-50 dark:bg-blue-900/30 ring-1 ring-blue-500' : ''}">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background:${m.color}20;color:${m.color}"><i class="fas ${m.icon} text-sm"></i></div>
          <div><p class="text-sm font-medium text-slate-900 dark:text-white">${m.title}</p><p class="text-xs text-slate-500">${m.sub}</p></div></button>`;
      }
      return `<button type="button" data-palette-idx="${i}" onclick="openSearchResult('${m.kind}','${m.id}')" class="palette-item w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-left ${i === paletteIndex ? 'bg-blue-50 dark:bg-blue-900/30 ring-1 ring-blue-500' : ''}">
        <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background:${m.color}20;color:${m.color}"><i class="fas ${m.icon} text-sm"></i></div>
        <div><p class="text-sm font-medium text-slate-900 dark:text-white truncate">${(m.title || '').toString().replace(/</g, '&lt;')}</p><p class="text-xs text-slate-500 truncate">${(m.sub || '').toString().replace(/</g, '&lt;')}</p></div></button>`;
    }).join('') + '</div>';
    panel.querySelectorAll('[data-palette-idx]').forEach(btn => {
      btn.addEventListener('click', () => activatePaletteItem(paletteItems[+btn.dataset.paletteIdx]));
    });
    panel.classList.remove('hidden');
  }

  function highlightPalette() {
    document.querySelectorAll('.palette-item').forEach((el, i) => {
      el.classList.toggle('bg-blue-50', i === paletteIndex);
      el.classList.toggle('dark:bg-blue-900/30', i === paletteIndex);
      el.classList.toggle('ring-1', i === paletteIndex);
      el.classList.toggle('ring-blue-500', i === paletteIndex);
    });
  }

  function activatePaletteItem(item) {
    if (!item) return;
    document.getElementById('globalSearchInput').value = '';
    document.getElementById('globalSearchResults')?.classList.add('hidden');
    if (item.run) item.run();
    else if (item.kind && item.id) window.openSearchResult?.(item.kind, item.id);
  }

  // ─── Productivity ───
  function patchTasksForRecurrence() {
    const origAdd = api.addTaskModal;
    if (!origAdd || origAdd.__recurrencePatched) return;
    // Extend task form via event delegation on next open — handled in init hook for completeTaskFromDashboard
    window.completeTaskFromDashboard = (function (orig) {
      return function (id) {
        const t = api.tasks.find(x => x.id === id);
        if (t?.recurrence) {
          const rec = t.recurrence;
          api.tasks.push({
            ...t,
            id: api.generateId(),
            status: 'todo',
            createdAt: Date.now(),
            dueDate: advanceCadence(t.dueDate || api.getLocalDateString(), rec),
            recurrence: rec
          });
          api.saveData('tasks', api.tasks);
        }
        return orig(id);
      };
    })(window.completeTaskFromDashboard);
  }

  function openWeeklyReview() {
    const today = api.parseLocalDate(api.getLocalDateString());
    const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 6);
    const weekStr = weekAgo.getFullYear() + '-' + String(weekAgo.getMonth() + 1).padStart(2, '0') + '-' + String(weekAgo.getDate()).padStart(2, '0');
    const doneTasks = api.tasks.filter(t => t.status === 'done').length;
    const weekTxns = (api.finance.transactions || []).filter(t => t.date >= weekStr && isSpendingExpense(t));
    const weekSpend = weekTxns.reduce((s, t) => s + t.amount, 0);
    const weekLog = (api.lifeLog || []).filter(e => e.date >= weekStr).length;
    const habitPct = api.habits.length ? Math.round(api.habits.reduce((s, h) => s + (h.completions || []).filter(d => d >= weekStr).length, 0) / (api.habits.length * 7) * 100) : 0;
    api.openModal('Weekly Review', `<div class="space-y-4">
      <div class="grid grid-cols-2 gap-3">
        <div class="bg-slate-50 dark:bg-slate-700 rounded-xl p-4 text-center"><p class="text-2xl font-bold text-green-600">${doneTasks}</p><p class="text-xs text-slate-500">Tasks completed (all time)</p></div>
        <div class="bg-slate-50 dark:bg-slate-700 rounded-xl p-4 text-center"><p class="text-2xl font-bold text-red-600">${api.formatCurrency(weekSpend)}</p><p class="text-xs text-slate-500">Spent (7 days)</p></div>
        <div class="bg-slate-50 dark:bg-slate-700 rounded-xl p-4 text-center"><p class="text-2xl font-bold text-blue-600">${weekLog}</p><p class="text-xs text-slate-500">Activities logged</p></div>
        <div class="bg-slate-50 dark:bg-slate-700 rounded-xl p-4 text-center"><p class="text-2xl font-bold text-orange-600">${habitPct}%</p><p class="text-xs text-slate-500">Habit consistency</p></div>
      </div>
      <p class="text-sm text-slate-500 text-center">${weekStr} → ${api.getLocalDateString()}</p></div>`);
  }

  function openShortcutsHelp() {
    api.openModal('Keyboard Shortcuts', `<div class="space-y-2 text-sm">
      <div class="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700"><kbd class="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs">/</kbd><span>Focus search</span></div>
      <div class="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700"><kbd class="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs">⌘/Ctrl K</kbd><span>Command palette</span></div>
      <div class="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700"><kbd class="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs">n</kbd><span>Quick log activity</span></div>
      <div class="flex justify-between py-2"><kbd class="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs">?</kbd><span>This help</span></div></div>`);
  }

  function syncGoalProgressFromHabits() {
    api.goals.forEach(g => {
      if (!g.linkedHabitId) return;
      const h = api.habits.find(x => x.id === g.linkedHabitId);
      if (!h) return;
      const streak = api.calculateStreak ? api.calculateStreak(h) : (h.streak || 0);
      const target = g.targetStreak || 30;
      g.progress = Math.min(100, Math.round(streak / target * 100));
    });
  }

  // ─── Activity heatmap ───
  function renderActivityHeatmap() {
    const el = document.getElementById('activityHeatmap');
    if (!el) return;
    const today = api.parseLocalDate(api.getLocalDateString());
    const counts = {};
    (api.lifeLog || []).forEach(e => { counts[e.date] = (counts[e.date] || 0) + 1; });
    const weeks = 26;
    let html = '<div class="flex gap-1 overflow-x-auto pb-2">';
    for (let w = weeks - 1; w >= 0; w--) {
      html += '<div class="flex flex-col gap-[3px]">';
      for (let d = 0; d < 7; d++) {
        const cell = new Date(today);
        cell.setDate(cell.getDate() - (w * 7 + (6 - d)));
        const ds = cell.getFullYear() + '-' + String(cell.getMonth() + 1).padStart(2, '0') + '-' + String(cell.getDate()).padStart(2, '0');
        const c = counts[ds] || 0;
        const bg = c === 0 ? 'bg-slate-100 dark:bg-slate-700' : c < 3 ? 'bg-green-300 dark:bg-green-800' : c < 6 ? 'bg-green-500' : 'bg-green-700';
        html += `<div class="w-3 h-3 rounded-sm ${bg}" title="${ds}: ${c}"></div>`;
      }
      html += '</div>';
    }
    html += '</div>';
    el.innerHTML = html;
  }

  function renderSpendingTrendChart() {
    const canvas = document.getElementById('chartSpendingTrend');
    if (!canvas || typeof Chart === 'undefined') return;
    const days = [];
    const today = api.parseLocalDate(api.getLocalDateString());
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      days.push(d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'));
    }
    const data = days.map(d => (api.finance.transactions || []).filter(t => t.date === d && isSpendingExpense(t)).reduce((s, t) => s + t.amount, 0));
    const labels = days.map(d => { const dt = api.parseLocalDate(d); return (dt.getMonth() + 1) + '/' + dt.getDate(); });
    const ym = getFinanceMonth();
    const monthBudgets = api.finance.budgets?.[ym] || api.finance.budgets?.default || {};
    const totalBudget = Object.values(monthBudgets).reduce((s, v) => s + (parseFloat(v) || 0), 0);
    const dailyBudget = totalBudget > 0 ? totalBudget / 30 : null;
    if (window._chartSpendingTrend) window._chartSpendingTrend.destroy();
    const isDark = document.documentElement.classList.contains('dark');
    const datasets = [{ label: 'Daily spending', data, borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', fill: true, tension: 0.3 }];
    if (dailyBudget) datasets.push({ label: 'Daily budget', data: days.map(() => dailyBudget), borderColor: '#3b82f6', borderDash: [4, 4], fill: false, pointRadius: 0, tension: 0 });
    window._chartSpendingTrend = new Chart(canvas, {
      type: 'line',
      data: { labels, datasets },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: isDark ? '#64748b' : '#94a3b8', maxRotation: 0 } }, y: { beginAtZero: true, ticks: { color: isDark ? '#64748b' : '#94a3b8' } } } }
    });
  }

  function patchDashboardWidgets() {
    const orig = api.renderDashboardWidgets;
    if (!orig || orig.__extPatched) return;
    api.renderDashboardWidgets = function () {
      orig();
      renderActivityHeatmap();
      renderSpendingTrendChart();
      syncGoalProgressFromHabits();
    };
    api.renderDashboardWidgets.__extPatched = true;
  }

  // ─── SimpleFIN bank sync (via Supabase Edge Functions) ───
  async function callBankFunction(name, body = {}) {
    const session = await window.dataService?.getSession?.();
    if (!session?.access_token) throw new Error('Sign in to cloud sync to connect your bank.');
    const url = (typeof SUPABASE_CONFIG !== 'undefined' ? SUPABASE_CONFIG.url : '') + '/functions/v1/' + name;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + session.access_token, apikey: SUPABASE_CONFIG.anonKey },
      body: JSON.stringify(body)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || res.statusText);
    return data;
  }

  function mergeSimpleFinData(data) {
    api.finance.accounts = api.finance.accounts || [];
    api.finance.transactions = api.finance.transactions || [];
    let added = 0;
    (data.accounts || []).forEach(sa => {
      let acct = api.finance.accounts.find(a => a._sfinAccountId === sa.id);
      if (!acct) {
        acct = { id: api.generateId(), name: sa.name, type: 'checking', institution: sa.org?.name || 'Bank', currentBalance: parseFloat(sa.balance) || 0, balanceHistory: [{ date: api.getLocalDateString(), balance: parseFloat(sa.balance) || 0 }], sortOrder: api.finance.accounts.length, createdAt: Date.now(), _sfinAccountId: sa.id };
        api.finance.accounts.push(acct);
      } else {
        acct.currentBalance = parseFloat(sa.balance) || acct.currentBalance;
        acct.balanceHistory.push({ date: api.getLocalDateString(), balance: acct.currentBalance });
      }
      (sa.transactions || []).forEach(st => {
        const sfinId = st.id || `${st.posted}-${st.amount}-${st.description}`;
        if (api.finance.transactions.some(t => t._sfinId === sfinId)) return;
        const amt = Math.abs(parseFloat(st.amount) || 0);
        api.finance.transactions.push({
          id: api.generateId(), type: parseFloat(st.amount) >= 0 ? 'income' : 'expense',
          description: st.description || st.payee || 'Bank import', amount: amt,
          category: 'Other', accountId: acct.id, date: st.posted ? st.posted.slice(0, 10) : api.getLocalDateString(),
          createdAt: Date.now(), _sfinId: sfinId, _importHash: sfinId
        });
        added++;
      });
    });
    api.saveData('finance', api.finance);
    api.renderFinance();
    return added;
  }

  async function renderBankSyncUI() {
    const el = document.getElementById('bankSyncStatus');
    if (!el) return;
    const configured = typeof SUPABASE_CONFIG !== 'undefined' && SUPABASE_CONFIG?.url && !SUPABASE_CONFIG.url.includes('YOUR_');
    if (!configured) {
      el.innerHTML = '<p class="text-sm text-slate-500">Cloud sync required for live bank connection. Use OFX/CSV import in the meantime.</p>';
      return;
    }
    const session = await window.dataService?.getSession?.();
    el.innerHTML = `<p class="text-sm text-slate-600 dark:text-slate-300 mb-3">Connect via <a href="https://bridge.simplefin.org/simplefin/create" target="_blank" rel="noopener" class="text-blue-500 hover:underline">SimpleFIN Bridge</a> ($1.50/mo). Your bank credentials never touch this app.</p>
      <div class="space-y-2">
        <input type="password" id="sfinSetupToken" placeholder="Paste SimpleFIN setup token" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white">
        <div class="flex gap-2">
          <button type="button" id="bankLinkBtn" class="flex-1 py-2 gradient-bg text-white text-sm rounded-lg" ${session ? '' : 'disabled'}>Connect bank</button>
          <button type="button" id="bankSyncBtn" class="flex-1 py-2 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 text-sm rounded-lg" ${session ? '' : 'disabled'}>Sync now</button>
          <button type="button" id="bankUnlinkBtn" class="py-2 px-3 bg-red-100 dark:bg-red-900/30 text-red-600 text-sm rounded-lg" ${session ? '' : 'disabled'}>Disconnect</button>
        </div>
        <p id="bankSyncMsg" class="text-xs text-slate-500"></p>
      </div>`;
    if (!session) { el.querySelector('p')?.insertAdjacentHTML('afterend', '<p class="text-xs text-amber-600 mb-2">Sign in to cloud sync first.</p>'); return; }
    document.getElementById('bankLinkBtn')?.addEventListener('click', async () => {
      const token = document.getElementById('sfinSetupToken')?.value?.trim();
      const msg = document.getElementById('bankSyncMsg');
      if (!token) { msg.textContent = 'Paste a setup token first.'; return; }
      try { msg.textContent = 'Connecting...'; await callBankFunction('bank-link', { setupToken: token }); msg.textContent = 'Bank connected! Click Sync now.'; }
      catch (e) { msg.textContent = e.message; }
    });
    document.getElementById('bankSyncBtn')?.addEventListener('click', async () => {
      const msg = document.getElementById('bankSyncMsg');
      try { msg.textContent = 'Syncing...'; const data = await callBankFunction('bank-sync', {}); const n = mergeSimpleFinData(data); msg.textContent = `Synced ${n} new transactions.`; }
      catch (e) { msg.textContent = e.message; }
    });
    document.getElementById('bankUnlinkBtn')?.addEventListener('click', async () => {
      try { await callBankFunction('bank-unlink', {}); document.getElementById('bankSyncMsg').textContent = 'Disconnected.'; }
      catch (e) { document.getElementById('bankSyncMsg').textContent = e.message; }
    });
  }

  // ─── Init ───
  window.initLifeERPExtensions = function (lifeApi) {
    api = lifeApi;
    financeMonth = getFinanceMonth();
    const picker = document.getElementById('financeMonthPicker');
    if (picker) picker.value = financeMonth;
    if (document.getElementById('financeAutoBalance')) {
      document.getElementById('financeAutoBalance').checked = !!api.finance.settings?.autoUpdateBalance;
    }
    patchFinance();
    patchCommandPalette();
    patchTasksForRecurrence();
    patchDashboardWidgets();
    if (api.renderGoals) {
      const origGoals = api.renderGoals;
      api.renderGoals = function () {
        syncGoalProgressFromHabits();
        return origGoals();
      };
    }
    populateAccountFilter();
    renderBankSyncUI();
    document.addEventListener('keydown', (e) => {
      const tag = (e.target?.tagName || '').toLowerCase();
      const typing = tag === 'input' || tag === 'textarea' || e.target?.isContentEditable;
      const modalOpen = !document.getElementById('modalOverlay')?.classList.contains('hidden');
      if (e.key === '?' && !typing && !modalOpen && !e.metaKey && !e.ctrlKey) { e.preventDefault(); openShortcutsHelp(); }
    });
    document.getElementById('weeklyReviewBtn')?.addEventListener('click', openWeeklyReview);
    document.getElementById('weeklyReviewCard')?.addEventListener('click', openWeeklyReview);
    document.getElementById('undoLastImportBtn')?.addEventListener('click', () => confirmRemoveImport(true));
    document.getElementById('removeAllImportsBtn')?.addEventListener('click', () => confirmRemoveImport(false));
    document.getElementById('dedupeLifeLogImportsBtn')?.addEventListener('click', confirmDedupeLifeLog);
    document.getElementById('markCcTransfersBtn')?.addEventListener('click', confirmMarkCcTransfers);
    window.renderBankSyncUI = renderBankSyncUI;
    window.LifeERPImport = { mergeImportedTransactions, mergeSimpleFinData, applyBalanceFromTxn, removeImportedTransactions };
  };
})();

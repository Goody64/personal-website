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
    const picker = document.getElementById('financeMonthPicker');
    if (picker?.value) return picker.value;
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
  };

  const formatFinanceMonthLabel = (ym) => {
    const [y, m] = (ym || '').split('-').map(Number);
    if (!y || !m) return 'This month';
    return new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
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
    return (txns || []).filter(t => {
      const d = (t.date || '').slice(0, 10);
      return d >= start && d <= end;
    });
  };

  const txnSource = (t) => {
    if (t._sfinId) return 'bank';
    if (t._importHash) return 'import';
    if (t._lifeLogEntryId || t._fromLifeLog) return 'lifelog';
    return 'manual';
  };

  const isBothTxn = (t) => isImportedTxn(t) && (!!t._lifeLogEntryId || !!t._fromLifeLog || !!t._pairedManualId);

  const SOURCE_LABELS = { import: 'OFX import', bank: 'Bank sync', lifelog: 'Life Log', manual: 'Manual', both: 'Both' };
  const SOURCE_COLORS = { import: 'text-blue-500', bank: 'text-green-500', lifelog: 'text-purple-500', manual: 'text-slate-400', both: 'text-indigo-500', paired: 'text-amber-500' };

  /** Display tags — imports keep OFX tag even when enriched with Life Log / manual detail. */
  const getTxnSourceTags = (t) => {
    if (t.type === 'transfer') return [{ label: 'Transfer', color: SOURCE_COLORS.manual }];
    const tags = [];
    if (t._sfinId) tags.push({ label: 'Bank sync', color: SOURCE_COLORS.bank });
    else if (isImportedTxn(t)) tags.push({ label: 'OFX import', color: SOURCE_COLORS.import });
    if (t._lifeLogEntryId || t._fromLifeLog) tags.push({ label: 'Life Log', color: SOURCE_COLORS.lifelog });
    else if (isManualSideTxn(t) && !t._pairedImportId) tags.push({ label: 'Manual', color: SOURCE_COLORS.manual });
    if (t._pairedImportId) {
      if (!tags.some(x => x.label === 'Manual')) tags.push({ label: 'Manual', color: SOURCE_COLORS.manual });
      tags.push({ label: 'Paired', color: SOURCE_COLORS.paired });
    }
    if (isBothTxn(t) && tags.length >= 2) {
      return [
        { label: 'Both', color: SOURCE_COLORS.both },
        ...tags.filter(x => x.label !== 'Both')
      ];
    }
    if (!tags.length) tags.push({ label: 'Manual', color: SOURCE_COLORS.manual });
    return tags;
  };

  const formatTxnSourceTagsHtml = (t) => {
    const tags = getTxnSourceTags(t);
    return tags.map(({ label, color }) => `<span class="${color}">${label}</span>`).join('<span class="text-slate-400"> · </span>');
  };

  const filterBySource = (txns) => {
    if (financeSourceFilter === 'all') return txns;
    if (financeSourceFilter === 'transfer') return txns.filter(t => t.type === 'transfer');
    if (financeSourceFilter === 'both') return txns.filter(isBothTxn);
    if (financeSourceFilter === 'import') return txns.filter(t => isImportedTxn(t));
    if (financeSourceFilter === 'lifelog') return txns.filter(t => !!t._lifeLogEntryId || !!t._fromLifeLog);
    if (financeSourceFilter === 'manual') return txns.filter(t => isManualSideTxn(t) && !t._pairedImportId);
    return txns.filter(t => txnSource(t) === financeSourceFilter);
  };

  const filterByAccount = (txns) => {
    if (financeAccountFilter === 'all') return txns;
    if (financeAccountFilter === 'none') return txns.filter(t => !t.accountId);
    return txns.filter(t => t.accountId === financeAccountFilter);
  };

  const applyTxnFilters = (txns) => filterByAccount(filterBySource(txns));

  /** Paired manual rows are shadow duplicates of an import — exclude from all totals. */
  const isSpendingExpense = (t) => t.type === 'expense' && !t._pairedImportId;
  const isCountableIncome = (t) => t.type === 'income' && !t._pairedImportId;

  const CC_PAYMENT_RE = /payment\s*thank\s*you|online\s*payment,\s*thank|autopay|auto\s*pay|card\s*payment|card\s*pymt|payment\s*to\s*chase|chase\s*credit\s*cr|credit\s*card\s*payment|bill\s*pay|syncb\s*payment/i;

  const looksLikeCcPayment = (desc) => CC_PAYMENT_RE.test(String(desc || ''));

  const AMT_MATCH_EPS = 0.011;

  const txnAmount = (n) => (api.parseAmount ? api.parseAmount(n) : Math.round((parseFloat(n) || 0) * 100) / 100);
  const toCents = (n) => Math.round(txnAmount(n) * 100);
  const amountsMatch = (a, b) => Math.abs(toCents(a) - toCents(b)) <= 1;

  const normalizeDate = (raw) => {
    const s = String(raw || '').trim();
    if (!s) return '';
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
    const mdy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
    if (mdy) {
      const yr = mdy[3].length === 2 ? '20' + mdy[3] : mdy[3];
      return `${yr}-${mdy[1].padStart(2, '0')}-${mdy[2].padStart(2, '0')}`;
    }
    return s.slice(0, 10);
  };

  const sameDate = (a, b) => normalizeDate(a) === normalizeDate(b);

  const isImportedTxn = (t) => !!(t._importHash || t._sfinId || t._importBatchAt != null || t._importSignedAmt != null);

  /** Self-reported side: Life Log finance rows and manual Add Transaction (never imports). */
  const isManualSideTxn = (t) => !isImportedTxn(t) && t.type !== 'transfer';

  const isWeakCategory = (cat) => !cat || cat === 'Other';

  const syncFinanceMonthFromPicker = () => {
    const picker = document.getElementById('financeMonthPicker');
    if (picker?.value) financeMonth = picker.value;
  };

  /** Copy manual / Life Log detail onto import; import amount is never overwritten. */
  function mergeManualIntoImport(importTxn, manualTxn) {
    let changed = false;
    if (manualTxn._lifeLogEntryId && !importTxn._lifeLogEntryId) {
      importTxn._lifeLogEntryId = manualTxn._lifeLogEntryId;
      if (manualTxn._fromLifeLog) importTxn._fromLifeLog = manualTxn._fromLifeLog;
      changed = true;
    }
    if (manualTxn._lifeLogEntryId) {
      const entry = (api.lifeLog || []).find(e => e.id === manualTxn._lifeLogEntryId);
      if (entry && applyLifeLogToTxn(importTxn, entry)) changed = true;
    }
    if (manualTxn.category && isWeakCategory(importTxn.category)) {
      importTxn.category = manualTxn.category;
      changed = true;
    }
    const manualDesc = String(manualTxn.description || '').trim();
    if (manualDesc && manualDesc !== String(importTxn.description || '').trim()) {
      importTxn.description = manualDesc;
      changed = true;
    }
    if (importTxn._pairedManualId !== manualTxn.id) {
      importTxn._pairedManualId = manualTxn.id;
      changed = true;
    }
    if (manualTxn._pairedImportId !== importTxn.id) {
      manualTxn._pairedImportId = importTxn.id;
      changed = true;
    }
    return changed;
  }

  /** Link existing enriched pairs so manual shadow rows stop inflating monthly totals. */
  function repairUnpairedDuplicates(txns) {
    const imports = txns.filter(isImportedTxn);
    const manualSide = txns.filter(t => isManualSideTxn(t) && !t._pairedImportId);
    let changed = false;
    manualSide.forEach(m => {
      const imp = imports.find(i =>
        sameDate(i.date, m.date) &&
        amountsMatch(i.amount, m.amount) &&
        (!i._pairedManualId || i._pairedManualId === m.id)
      );
      if (!imp) return;
      if (mergeManualIntoImport(imp, m)) changed = true;
      else if (imp._pairedManualId !== m.id || m._pairedImportId !== imp.id) {
        imp._pairedManualId = m.id;
        m._pairedImportId = imp.id;
        changed = true;
      }
    });
    return changed;
  }

  function findImportMatchForManual(manualTxn, imported, usedImportIds) {
    return imported.find(imp =>
      !usedImportIds.has(imp.id) &&
      sameDate(imp.date, manualTxn.date) &&
      amountsMatch(imp.amount, manualTxn.amount)
    );
  }

  function findManualMatchForImport(importTxn, manualTxns, usedManualIds) {
    return manualTxns.find(m =>
      !usedManualIds.has(m.id) &&
      (!m._pairedImportId || m._pairedImportId === importTxn.id) &&
      sameDate(m.date, importTxn.date) &&
      amountsMatch(m.amount, importTxn.amount)
    );
  }

  function getLifeLogAmount(entry) {
    if (!entry || (entry.type !== 'meal' && entry.type !== 'purchase')) return 0;
    const raw = entry.data?.amount;
    if (raw == null || raw === '') return 0;
    const n = typeof raw === 'number' ? raw : parseFloat(String(raw).replace(/[$,\s]/g, ''));
    if (!Number.isFinite(n) || n <= 0) return 0;
    return api.parseAmount ? api.parseAmount(n) : Math.round(n * 100) / 100;
  }

  const txnSpendAmount = (t) => Math.abs(txnAmount(t.amount));

  function getLifeLogSpendEntries() {
    return (api.lifeLog || []).filter(e =>
      (e.type === 'purchase' || e.type === 'meal') && getLifeLogAmount(e) > 0
    );
  }

  /** When several Life Log rows share date+amount, prefer store/restaurant name in the bank description. */
  function pickLifeLogByDescriptionHint(txn, candidates) {
    if (!candidates.length) return null;
    if (candidates.length === 1) return candidates[0];
    const desc = String(txn.description || '').toUpperCase().replace(/[^A-Z0-9 ]/g, ' ');
    const scored = candidates.map(e => {
      const store = String(e.data?.store || e.data?.restaurant || '').toUpperCase();
      const item = String(e.data?.item || e.data?.meal || '').toUpperCase();
      let score = 0;
      store.split(/\s+/).filter(w => w.length > 2).forEach(w => { if (desc.includes(w)) score += 2; });
      item.split(/\s+/).filter(w => w.length > 2).forEach(w => { if (desc.includes(w)) score += 1; });
      if (store && desc.includes(store.replace(/'/g, '').slice(0, 6))) score += 3;
      return { e, score };
    });
    scored.sort((a, b) => b.score - a.score);
    return scored[0].score > 0 ? scored[0].e : candidates[0];
  }

  function findLifeLogForTxn(txn, lifeSpend, usedLifeLogIds) {
    const txnDay = normalizeDate(txn.date);
    const txnAmt = txnSpendAmount(txn);
    if (!txnDay || txnAmt <= 0) return null;

    if (txn._lifeLogEntryId && !usedLifeLogIds.has(txn._lifeLogEntryId)) {
      const linked = lifeSpend.find(e => e.id === txn._lifeLogEntryId);
      if (linked) return linked;
    }

    const dayAmountMatches = lifeSpend.filter(e => {
      if (usedLifeLogIds.has(e.id)) return false;
      if (normalizeDate(e.date) !== txnDay) return false;
      return amountsMatch(getLifeLogAmount(e), txnAmt);
    });
    if (dayAmountMatches.length) return pickLifeLogByDescriptionHint(txn, dayAmountMatches);
    return null;
  }

  function getLifeLogDescription(entry) {
    if (entry.type === 'meal') {
      const parts = [entry.data?.meal];
      if (entry.data?.restaurant) parts.push(`at ${entry.data.restaurant}`);
      else if (entry.data?.description) parts.push(entry.data.description);
      return parts.filter(Boolean).join(' ');
    }
    if (entry.type === 'purchase') {
      return (entry.data?.item || 'Purchase') + (entry.data?.store ? ` (${entry.data.store})` : '');
    }
    return '';
  }

  function getLifeLogCategory(entry) {
    if (entry.type === 'meal') return 'Food';
    if (entry.type === 'purchase') return entry.data?.financeCategory || 'Shopping';
    return 'Other';
  }

  function applyLifeLogToTxn(txn, entry) {
    let changed = false;
    if (txn._lifeLogEntryId !== entry.id) {
      txn._lifeLogEntryId = entry.id;
      txn._fromLifeLog = entry.type;
      changed = true;
    }
    const desc = getLifeLogDescription(entry);
    if (desc && String(txn.description || '').trim() !== desc) {
      txn.description = desc;
      changed = true;
    }
    const cat = getLifeLogCategory(entry);
    if (cat && txn.category !== cat) {
      txn.category = cat;
      changed = true;
    }
    return changed;
  }

  function mergeLifeLogIntoImport(importTxn, entry) {
    return applyLifeLogToTxn(importTxn, entry);
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
        createdAt: Date.now(), _importHash: hash, _importBatchAt: batchAt,
        _importSignedAmt: row.signedAmt
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
    if (added > 0) enrichImportsFromLifeLog();
    return { added, skipped };
  }

  function setImportToolsStatus(msg, type = 'info') {
    const el = document.getElementById('importToolsStatus');
    if (!el) return;
    el.textContent = msg;
    el.className = `text-xs text-right mt-2 ${type === 'warning' ? 'text-amber-600 dark:text-amber-400' : type === 'error' ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`;
    el.classList.remove('hidden');
  }

  function notifyUser(title, message, type = 'info') {
    api?.showToast?.(title, message, type);
    api?.addNotification?.(title, message, type);
    setImportToolsStatus(message, type);
  }

  function saveFinanceAndRefresh() {
    syncFinanceMonthFromPicker();
    api.saveData('finance', api.finance);
    api.renderFinance();
    api.updateStats?.();
    api.renderDashboardWidgets?.();
  }

  // ─── Finance: month filter, budgets, recurring, balance sync ───
  function patchFinance() {
    const origRender = api.renderFinance;
    if (!origRender || origRender.__patched) return;

    api.renderFinance = function patchedRenderFinance() {
      syncFinanceMonthFromPicker();
      const f = api.finance;
      f.budgets = f.budgets || {};
      f.recurring = f.recurring || [];
      f.settings = f.settings || { autoUpdateBalance: false };
      const ym = getFinanceMonth();
      const monthTxns = applyTxnFilters(txnsInMonth(f.transactions, ym));
      const income = monthTxns.filter(isCountableIncome).reduce((s, t) => s + t.amount, 0);
      const expenses = monthTxns.filter(isSpendingExpense).reduce((s, t) => s + t.amount, 0);
      const monthLabel = formatFinanceMonthLabel(ym);
      const elInc = document.getElementById('totalIncome');
      const elExp = document.getElementById('totalExpenses');
      const elBal = document.getElementById('totalBalance');
      if (elInc) elInc.textContent = api.formatCurrency(income);
      if (elExp) elExp.textContent = api.formatCurrency(expenses);
      if (elBal) elBal.textContent = api.formatCurrency(income - expenses);
      document.querySelectorAll('[data-finance-month-label]').forEach(el => { el.textContent = monthLabel; });

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
            const isInc = t.type === 'income';
            const isXfer = t.type === 'transfer';
            const isPairedShadow = !!t._pairedImportId;
            const boxCls = isInc ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : isXfer ? 'bg-slate-200 dark:bg-slate-600 text-slate-500' : 'bg-red-100 dark:bg-red-900/30 text-red-600';
            const iconCls = isXfer ? 'fa-right-left' : `fa-arrow-${isInc ? 'down' : 'up'}`;
            const amtCls = isInc ? 'text-green-600' : isXfer ? 'text-slate-500' : isPairedShadow ? 'text-slate-400 line-through' : 'text-red-600';
            const sign = isInc ? '+' : isXfer ? '' : '-';
            const rowCls = isPairedShadow ? 'opacity-60' : '';
            const srcTags = formatTxnSourceTagsHtml(t);
            const lifeLogBtn = (!t._lifeLogEntryId && t.type === 'expense')
              ? `<button onclick="addFinanceTxnToLifeLog('${t.id}')" class="p-2 text-purple-500" title="Add to Life Log"><i class="fas fa-book-open text-xs"></i></button>`
              : '';
            html += `<div class="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl group txn-row ${rowCls}" data-txn-id="${t.id}" draggable="true">
              <span class="cursor-grab text-slate-400 drag-handle"><i class="fas fa-grip-vertical text-sm"></i></span>
              <div class="w-10 h-10 flex-shrink-0 ${boxCls} rounded-lg flex items-center justify-center"><i class="fas ${iconCls}"></i></div>
              <div class="flex-1 min-w-0"><p class="font-medium text-slate-900 dark:text-white text-sm truncate">${(t.description || '').replace(/</g, '&lt;')}</p><p class="text-xs text-slate-500">${t.category || ''} · ${srcTags}${isPairedShadow ? ' <span class="text-amber-500">(excluded from totals)</span>' : ''}</p></div>
              <p class="font-bold flex-shrink-0 ${amtCls}">${sign}${api.formatCurrency(t.amount)}</p>
              <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                ${lifeLogBtn}
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
    window.__renderFinancePatched = api.renderFinance;

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
    let type;
    let category = 'Other';
    const isBank = typeof window.isBankCashAccount === 'function' && window.isBankCashAccount(accountType);

    if (accountType === 'credit_card') {
      // Card charges are expenses; only explicit statement-payment descriptions are transfers.
      // OFX/CSV sign varies by bank — never infer payment from sign alone.
      if (looksLikeCcPayment(desc)) {
        type = 'transfer';
        category = 'Transfer';
      } else {
        type = 'expense';
      }
      return { type, category, amount };
    }

    type = signedAmt >= 0 ? 'income' : 'expense';
    if (signedAmt < 0 && isBank && looksLikeCcPayment(desc)) {
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
    if (a.type === 'credit_card') return 'Credit card import: purchases are expenses. Only statement payments (e.g. "ONLINE PAYMENT, THANK YOU") are transfers.';
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

  function parseCsvLine(line) {
    const cols = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"') {
          if (line[i + 1] === '"') { cur += '"'; i++; }
          else inQuotes = false;
        } else cur += ch;
      } else if (ch === '"') inQuotes = true;
      else if (ch === ',') { cols.push(cur.trim()); cur = ''; }
      else cur += ch;
    }
    cols.push(cur.trim());
    return cols;
  }

  function normalizeCsvDate(raw) {
    const s = String(raw || '').trim();
    if (!s) return '';
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
    const mdy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
    if (mdy) {
      const yr = mdy[3].length === 2 ? '20' + mdy[3] : mdy[3];
      return `${yr}-${mdy[1].padStart(2, '0')}-${mdy[2].padStart(2, '0')}`;
    }
    return s;
  }

  function pickCsvField(row, keys) {
    for (const k of keys) {
      const v = row[k];
      if (v != null && String(v).trim() !== '') return String(v).trim();
    }
    return '';
  }

  function parseMoneyCell(val) {
    if (val == null || val === '') return 0;
    const n = parseFloat(String(val).replace(/[$,\s]/g, ''));
    return Number.isFinite(n) ? n : 0;
  }

  /** Debit/credit columns or signed Amount — bank vs card conventions differ. */
  function csvSignedAmount(row, accountType) {
    const debit = parseMoneyCell(row.debit);
    const credit = parseMoneyCell(row.credit);
    const amountCol = parseMoneyCell(row.amount || row['transaction amount'] || row['trans amount']);

    if (debit && credit) return credit - debit;
    if (accountType === 'credit_card') {
      if (debit && !credit) return Math.abs(debit);
      if (credit && !debit) return -Math.abs(credit);
    } else {
      if (debit && !credit) return -Math.abs(debit);
      if (credit && !debit) return Math.abs(credit);
    }
    return amountCol;
  }

  function mapCsvCategory(row, type) {
    const raw = pickCsvField(row, ['classification', 'category', 'type']);
    if (!raw) return type === 'income' ? 'Salary' : 'Other';
    const lower = raw.toLowerCase().replace(/&amp;/g, '&');
    if (type === 'transfer' || lower.includes('credit card payment')) return 'Transfer';
    if (lower.includes('paycheck') || lower.includes('payroll')) return 'Salary';
    if (lower.includes('interest')) return 'Interest';
    if (lower.includes('utilit')) return 'Utilities';
    if (lower.includes('transfer')) return 'Transfer';
    if (lower.includes('food') || lower.includes('restaurant')) return 'Food';
    if (lower.includes('shipping')) return 'Shopping';
    if (lower.includes('tax')) return 'Other';
    return 'Other';
  }

  function parseCsv(text, accountType) {
    const lines = text.trim().split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) return [];
    const headers = parseCsvLine(lines[0]).map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
    const txns = [];
    lines.slice(1).forEach((line, idx) => {
      const cols = parseCsvLine(line);
      const row = {};
      headers.forEach((h, i) => { row[h] = (cols[i] || '').trim(); });
      const rawDate = pickCsvField(row, ['date', 'transaction date', 'post date', 'posted', 'trans date', 'posting date']);
      const date = normalizeCsvDate(rawDate) || api.getLocalDateString();
      const desc = pickCsvField(row, ['description', 'memo', 'payee', 'name', 'merchant']) || 'Import';
      const signedAmt = csvSignedAmount(row, accountType);
      if (!signedAmt) return;
      const { type, category, amount } = classifyImportRow(signedAmt, desc, accountType);
      const cat = category === 'Other' ? mapCsvCategory(row, type) : category;
      txns.push({
        date, description: desc, amount, type, category: cat, signedAmt,
        _importHash: `csv-${date}-${signedAmt}-${desc.slice(0, 40)}-${idx}`
      });
    });
    return txns;
  }

  function detectImportFileKind(filename, text) {
    const lower = (filename || '').toLowerCase();
    if (lower.endsWith('.csv')) return 'csv';
    if (lower.endsWith('.ofx') || lower.endsWith('.qfx')) return 'ofx';
    const head = (text || '').trim().slice(0, 500).toLowerCase();
    if (head.startsWith('<?xml') || head.includes('<ofx') || head.includes('<stmtrs')) return 'ofx';
    if (/date.*(?:debit|credit|amount)|post date|transaction date|status,date,description/i.test(head)) return 'csv';
    return 'ofx';
  }

  function defaultAccountForPreset(preset) {
    const accts = api.finance.accounts || [];
    if (preset === 'credit_card') return accts.find(a => a.type === 'credit_card')?.id || '';
    if (preset === 'bank') return accts.find(a => ['checking', 'savings', 'cash'].includes(a.type))?.id || '';
    return '';
  }

  function openImportModal(preset, preselectAccountId) {
    const accts = api.finance.accounts || [];
    const defaultId = preselectAccountId
      || (preset === 'credit_card' ? accts.find(a => a.type === 'credit_card')?.id : null)
      || (preset === 'bank' ? accts.find(a => ['checking', 'savings', 'cash'].includes(a.type))?.id : null)
      || '';
    const title = preset === 'credit_card' ? 'Import credit card (OFX/CSV)' : preset === 'bank' ? 'Import bank account (OFX/CSV)' : 'Import transactions (OFX/CSV)';
    api.openModal(title, `<div class="space-y-4">
      <p class="text-sm text-slate-500">Upload OFX/QFX or CSV from your bank or card issuer (e.g. NBKC Account History, card Year-to-date export).</p>
      <div><label class="block text-xs font-medium text-slate-500 mb-1">Target account</label>
      <select id="importAccount" class="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white">
        ${buildImportAccountSelect(defaultId, preset)}
      </select></div>
      <p id="importHint" class="text-xs text-blue-600 dark:text-blue-400">${importHintForAccount(defaultId)}</p>
      <input type="file" id="importFile" accept=".ofx,.qfx,.csv,.txt" class="w-full text-sm">
      <div id="importPreview" class="max-h-40 overflow-y-auto text-xs"></div>
      <button type="button" id="importConfirmBtn" class="w-full py-2.5 gradient-bg text-white font-medium rounded-lg" disabled>Import</button></div>`);
    let parsedRows = [], parsedBalances = {}, rawImportText = '', importFileKind = null;

    const reparseForAccount = () => {
      const acct = accts.find(a => a.id === document.getElementById('importAccount')?.value);
      if (!rawImportText || !importFileKind) return;
      if (importFileKind === 'csv') parsedRows = parseCsv(rawImportText, acct?.type);
      else { const p = parseOfx(rawImportText, acct?.type); parsedRows = p.txns; parsedBalances = p.balances; }
    };

    const refreshPreview = () => {
      const acctSel = document.getElementById('importAccount');
      let acctId = acctSel?.value;
      if (!acctId && preset) {
        const autoId = defaultAccountForPreset(preset);
        if (autoId && acctSel) { acctSel.value = autoId; acctId = autoId; }
      }
      document.getElementById('importHint').textContent = importHintForAccount(acctId);
      reparseForAccount();
      const btn = document.getElementById('importConfirmBtn');
      if (!parsedRows.length) {
        document.getElementById('importPreview').innerHTML = rawImportText
          ? '<p class="text-amber-600">No transactions parsed — check file format and target account type.</p>'
          : (acctId ? '<p class="text-slate-400">Choose a file to preview</p>' : '<p class="text-amber-600">Select an account first</p>');
        if (btn) { btn.disabled = true; btn.textContent = 'Import'; }
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
      if (btn) {
        btn.disabled = !acctId;
        btn.textContent = acctId ? `Import ${parsedRows.length} transaction${parsedRows.length === 1 ? '' : 's'}` : 'Select account above to import';
      }
    };
    document.getElementById('importAccount')?.addEventListener('change', refreshPreview);
    document.getElementById('importFile').addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      rawImportText = await file.text();
      importFileKind = detectImportFileKind(file.name, rawImportText);
      reparseForAccount();
      refreshPreview();
    });
    refreshPreview();
    document.getElementById('importConfirmBtn').addEventListener('click', () => {
      const acctId = document.getElementById('importAccount').value || null;
      if (!acctId) {
        api.addNotification?.('Select account', 'Choose which account this file belongs to before importing.', 'warning');
        return;
      }
      reparseForAccount();
      if (!parsedRows.length) {
        api.addNotification?.('Import failed', 'No transactions could be parsed from this file.', 'warning');
        return;
      }
      const { added, skipped } = mergeImportedTransactions(parsedRows, acctId, parsedBalances);
      api.closeModal();
      api.addNotification?.('Import complete', added ? `Added ${added} transaction${added === 1 ? '' : 's'}${skipped ? `, skipped ${skipped} duplicate${skipped === 1 ? '' : 's'}` : ''}.` : `All ${skipped} row${skipped === 1 ? '' : 's'} already imported (duplicates skipped).`, added ? 'info' : 'warning');
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

  /** Merge manual/Life Log duplicates into imports (import amount wins), drop manual rows only. */
  function dedupeLifeLogAgainstImports() {
    const txns = api.finance.transactions || [];
    const imported = txns.filter(isImportedTxn);
    const manualSide = txns.filter(isManualSideTxn);
    if (!imported.length || !manualSide.length) return { merged: 0, removed: 0 };
    const toRemove = new Set();
    const usedImportIds = new Set();
    let merged = 0;
    manualSide.forEach(manualTxn => {
      const imp = findImportMatchForManual(manualTxn, imported, usedImportIds);
      if (!imp) return;
      mergeManualIntoImport(imp, manualTxn);
      usedImportIds.add(imp.id);
      toRemove.add(manualTxn.id);
      merged++;
    });
    if (!toRemove.size) return { merged: 0, removed: 0 };
    api.finance.transactions = txns.filter(t => !toRemove.has(t.id));
    api.finance.transactions.forEach(t => {
      if (t._pairedManualId && toRemove.has(t._pairedManualId)) delete t._pairedManualId;
    });
    saveFinanceAndRefresh();
    return { merged, removed: toRemove.size };
  }

  function confirmDedupeLifeLog() {
    if (!confirm('Merge manual/Life Log entries into matching imports (same date & amount — names can differ)? Import amounts are kept. Duplicate manual rows are removed.')) return;
    try {
      const { merged, removed } = dedupeLifeLogAgainstImports();
      notifyUser('Dedupe complete', merged ? `Merged ${merged} pair${merged === 1 ? '' : 's'}, removed ${removed} manual duplicate${removed === 1 ? '' : 's'}. Imports kept.` : 'No matching pairs found.', merged ? 'info' : 'warning');
    } catch (err) {
      console.error('Dedupe failed', err);
      notifyUser('Dedupe failed', err.message || String(err), 'error');
    }
  }

  /** For each bank/card import, apply Life Log name/category (same day + amount). Manual "Add to Finance" rows merge into the import. */
  function enrichImportsFromLifeLog() {
    const txns = api.finance.transactions || [];
    let changed = repairUnpairedDuplicates(txns);
    const lifeSpend = getLifeLogSpendEntries();
    const manualSide = txns.filter(t => isManualSideTxn(t) && !t._pairedImportId);
    const imports = txns.filter(t => t.type === 'expense' && !t._pairedImportId && isImportedTxn(t));
    const usedLifeLogIds = new Set();
    let pairs = 0;

    imports.forEach(imp => {
      const descBefore = String(imp.description || '').trim();
      const catBefore = imp.category;
      const linkBefore = imp._lifeLogEntryId;

      // Manual row from "Also add to Finance" on same day + amount — merge onto import first
      const manual = manualSide.find(m =>
        sameDate(m.date, imp.date) &&
        amountsMatch(txnSpendAmount(m), txnSpendAmount(imp))
      );
      if (manual && mergeManualIntoImport(imp, manual)) changed = true;

      if (!imp._lifeLogEntryId) {
        const entry = findLifeLogForTxn(imp, lifeSpend, usedLifeLogIds);
        if (entry) {
          usedLifeLogIds.add(entry.id);
          if (applyLifeLogToTxn(imp, entry)) changed = true;
          const manualByEntry = manualSide.find(m =>
            !m._pairedImportId &&
            m._lifeLogEntryId === entry.id &&
            sameDate(m.date, imp.date) &&
            amountsMatch(txnSpendAmount(m), txnSpendAmount(imp))
          );
          if (manualByEntry && mergeManualIntoImport(imp, manualByEntry)) changed = true;
        }
      } else {
        const entry = lifeSpend.find(e => e.id === imp._lifeLogEntryId);
        if (entry) {
          usedLifeLogIds.add(entry.id);
          if (applyLifeLogToTxn(imp, entry)) changed = true;
        }
      }

      if (
        imp._lifeLogEntryId &&
        (imp._lifeLogEntryId !== linkBefore ||
          String(imp.description || '').trim() !== descBefore ||
          imp.category !== catBefore)
      ) {
        pairs++;
      }
    });

    if (changed || pairs > 0) saveFinanceAndRefresh();
    return { pairs, targets: imports.length, lifeLogEntries: lifeSpend.length };
  }

  function confirmEnrichFromLifeLog() {
    if (!api) {
      (window.showToast || alert)('Please wait', 'App is still loading — try again in a moment.', 'warning');
      return;
    }
    setImportToolsStatus('Running enrich…', 'info');
    try {
      const { pairs, targets, lifeLogEntries } = enrichImportsFromLifeLog();
      let msg;
      if (pairs) {
        msg = `Updated ${pairs} import${pairs === 1 ? '' : 's'} with Life Log names/categories. Open Finance → May 2026 to verify.`;
      } else if (!lifeLogEntries) {
        msg = 'No Life Log purchases or meals with an amount — log the item and dollar amount on the day you bought it, then run Enrich again.';
      } else if (!targets) {
        msg = 'No imported card/bank expenses found. Import your CSV/OFX first, then run Enrich.';
      } else {
        msg = `No matches for ${targets} import${targets === 1 ? '' : 's'} (${lifeLogEntries} Life Log purchase${lifeLogEntries === 1 ? '' : 's'}/meal${lifeLogEntries === 1 ? '' : 's'} with amounts). Need same date and same dollar amount — e.g. May 23 and $15.04.`;
      }
      notifyUser('Enrich complete', msg, pairs ? 'info' : 'warning');
    } catch (err) {
      console.error('Enrich failed', err);
      notifyUser('Enrich failed', err.message || String(err), 'error');
    }
  }

  /** Fix card purchases misclassified as transfers; mark only explicit statement payments as transfer. */
  function repairCcImportClassification() {
    const accounts = api.finance.accounts || [];
    let n = 0;
    (api.finance.transactions || []).forEach(t => {
      const acct = accounts.find(a => a.id === t.accountId);
      const onCard = acct?.type === 'credit_card';
      const isPayment = looksLikeCcPayment(t.description);

      if (onCard && t.type === 'transfer' && !isPayment) {
        t.type = 'expense';
        if (!t.category || t.category === 'Transfer') t.category = 'Other';
        n++;
        return;
      }

      if (isPayment && t.type !== 'transfer') {
        t.type = 'transfer';
        t.category = 'Transfer';
        n++;
        return;
      }

      if (!onCard) return;

      if (t.type === 'income') {
        t.type = 'expense';
        if (!t.category || t.category === 'Salary' || t.category === 'Interest') t.category = 'Other';
        n++;
      }
    });
    return n;
  }

  function markCcPaymentsAsTransfers() {
    let n = 0;
    (api.finance.transactions || []).forEach(t => {
      if (!looksLikeCcPayment(t.description)) return;
      if (t.type !== 'transfer') {
        t.type = 'transfer';
        t.category = 'Transfer';
        n++;
      }
    });
    n += repairCcImportClassification();
    if (n) {
      api.saveData('finance', api.finance);
      api.renderFinance();
      api.updateStats?.();
      api.renderDashboardWidgets?.();
    }
    return n;
  }

  function confirmMarkCcTransfers() {
    if (!confirm('Fix credit card rows?\n\n• Purchases wrongly marked Transfer → Expense\n• Statement payments (e.g. "ONLINE PAYMENT, THANK YOU") → Transfer\n• Transfers are ignored for spending totals and enrich')) return;
    const n = markCcPaymentsAsTransfers();
    notifyUser('CC classification fixed', n ? `Updated ${n} transaction${n === 1 ? '' : 's'}.` : 'Nothing to fix — already classified.', n ? 'info' : 'warning');
  }

  function wireSettingsActionButtons() {
    if (wireSettingsActionButtons.__done) return;
    wireSettingsActionButtons.__done = true;
    const actions = {
      'enrich-from-lifelog': confirmEnrichFromLifeLog,
      'dedupe-imports': confirmDedupeLifeLog,
      'mark-cc-transfers': confirmMarkCcTransfers,
      'undo-last-import': () => confirmRemoveImport(true),
      'remove-all-imports': () => confirmRemoveImport(false)
    };
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-lifeerp-action]');
      if (!btn) return;
      const fn = actions[btn.dataset.lifeerpAction];
      if (!fn) return;
      e.preventDefault();
      fn();
    });
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
        const signedAmt = parseFloat(st.amount) || 0;
        const desc = st.description || st.payee || 'Bank import';
        const { type, category, amount } = classifyImportRow(signedAmt, desc, acct.type);
        api.finance.transactions.push({
          id: api.generateId(), type, description: desc, amount,
          category, accountId: acct.id, date: st.posted ? st.posted.slice(0, 10) : api.getLocalDateString(),
          createdAt: Date.now(), _sfinId: sfinId, _importHash: sfinId, _importSignedAmt: signedAmt
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
  wireSettingsActionButtons();

  window.initLifeERPExtensions = function (lifeApi) {
    api = lifeApi;
    financeMonth = getFinanceMonth();
    const picker = document.getElementById('financeMonthPicker');
    if (picker) picker.value = financeMonth;
    if (document.getElementById('financeAutoBalance')) {
      document.getElementById('financeAutoBalance').checked = !!api.finance.settings?.autoUpdateBalance;
    }
    patchFinance();
    const repaired = repairUnpairedDuplicates(api.finance.transactions || []);
    const ccFixed = repairCcImportClassification();
    if (repaired || ccFixed) api.saveData('finance', api.finance);
    api.renderFinance();
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
    window.renderBankSyncUI = renderBankSyncUI;
    window.LifeERPImport = { mergeImportedTransactions, mergeSimpleFinData, applyBalanceFromTxn, removeImportedTransactions, dedupeLifeLogAgainstImports, enrichImportsFromLifeLog, repairCcImportClassification, markCcPaymentsAsTransfers };
    window.LifeERPSettings = { enrich: confirmEnrichFromLifeLog, dedupe: confirmDedupeLifeLog };
  };
})();

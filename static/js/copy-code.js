// Delegated copy handler for all code blocks (works across SPA route changes)
(function () {
  console.log('[code-toolbar] handler initialized');
  function unescapeHtml(s) {
    return s
      .replace(/&#123;/g, '{')
      .replace(/&#125;/g, '}')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'");
  }

  // Build toolbar if missing
  function ensureToolbar(block) {
    let toolbar = block.querySelector('.mui-code-toolbar');
    if (toolbar) return toolbar;
    toolbar = document.createElement('div');
    toolbar.className = 'mui-code-toolbar';
    toolbar.setAttribute('role', 'toolbar');
    toolbar.setAttribute('aria-label', 'Code actions');

    const btnCopy = document.createElement('button');
    btnCopy.type = 'button';
    btnCopy.className = 'mui-toolbar-btn';
    btnCopy.setAttribute('aria-label', 'Copy');
    btnCopy.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 1H4c-1.1 0-2 .9-2 2v12h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>';

    const btnEdit = document.createElement('button');
    btnEdit.type = 'button';
    btnEdit.className = 'mui-toolbar-btn';
    btnEdit.setAttribute('aria-label', 'Edit');
    btnEdit.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM21.41 6.34c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>';

    const btnCopyLink = document.createElement('button');
    btnCopyLink.type = 'button';
    btnCopyLink.className = 'mui-toolbar-btn';
    btnCopyLink.setAttribute('aria-label', 'Copy Link');
    btnCopyLink.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>';

    const btnDownload = document.createElement('button');
    btnDownload.type = 'button';
    btnDownload.className = 'mui-toolbar-btn';
    btnDownload.setAttribute('aria-label', 'Download');
    btnDownload.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z"/></svg>';

    toolbar.appendChild(btnCopy);
    toolbar.appendChild(btnEdit);
    toolbar.appendChild(btnCopyLink);
    toolbar.appendChild(btnDownload);
    block.appendChild(toolbar);
    return toolbar;
  }

  function getCodeText(block) {
    const clone = block.cloneNode(true);
    clone.querySelectorAll('.mui-code-toolbar').forEach(el => el.remove());
    return clone.textContent.trim();
  }

  function escapeHtml(s) {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function highlightJSON(text) {
    let html = escapeHtml(text);
    html = html.replace(/(\"[^\"]*\")\s*:/g, '<span class="json-key">$1</span>:');
    html = html.replace(/\"([^\"]*)\"/g, '<span class="json-string">"$1"</span>');
    html = html.replace(/\b(-?\d+(?:\.\d+)?)\b/g, '<span class="json-number">$1</span>');
    html = html.replace(/\b(true|false|null)\b/g, '<span class="json-boolean">$1</span>');
    return html;
  }

  function highlightSQL(text) {
    const html = escapeHtml(text)
      .replace(/'(.*?)'/g, '<span class="sql-string">\'$1\'</span>')
      .replace(/\b(SELECT|FROM|WHERE|AND|OR|JOIN|LEFT|RIGHT|INNER|OUTER|ON|GROUP BY|ORDER BY|LIMIT|AS|CASE|WHEN|THEN|ELSE|END|COUNT|SUM|AVG|MIN|MAX|DISTINCT|INSERT|INTO|VALUES|UPDATE|SET|DELETE)\b/gi, (m) => `<span class="sql-keyword">${m}</span>`)
      .replace(/\b(-?\d+(?:\.\d+)?)\b/g, '<span class="sql-number">$1</span>');
    return html;
  }

  function renderSyntax(block) {
    const lang = (block.getAttribute('data-language') || '').toLowerCase();
    const raw = getCodeText(block);
    let html = escapeHtml(raw);
    if (lang === 'json') html = highlightJSON(raw);
    if (lang === 'sql') html = highlightSQL(raw);
    // Replace content only (keep toolbar if any)
    const toolbar = block.querySelector('.mui-code-toolbar');
    block.innerHTML = `<pre class="mui-code-pre"><code class="mui-code">${html}</code></pre>`;
    if (toolbar) block.appendChild(toolbar);
  }

  document.addEventListener('click', (e) => {
    // If clicking the chip, use its parent block; else if clicking inside the block, use that
    let block;
    if (e.target.classList && e.target.classList.contains('mui-copy-chip')) {
      block = e.target.closest('.mui-code-block');
    } else {
      block = e.target.closest('.mui-code-block');
    }
    if (!block) return;

    // Ensure toolbar exists
    const toolbar = ensureToolbar(block);

    // If a toolbar button was clicked, handle accordingly
    const button = e.target.closest('.mui-toolbar-btn');
    if (button) {
      const label = button.getAttribute('aria-label');
      const text = getCodeText(block);

      if (label === 'Copy') {
        (async () => {
          try { await navigator.clipboard.writeText(text); const originalHTML = button.innerHTML; button.textContent = 'Copied!'; }
          catch {
            const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
            document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); const originalHTML = button.innerHTML; button.textContent = 'Copied!'; }
            catch { button.textContent = 'Failed'; } finally { document.body.removeChild(ta); }
          }
          setTimeout(() => { button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 1H4c-1.1 0-2 .9-2 2v12h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>'; }, 1200);
        })();
      } else if (label === 'Edit') {
        const editable = block.getAttribute('contenteditable') === 'true';
        if (editable) {
          block.setAttribute('contenteditable', 'false');
          block.classList.remove('is-editing');
          button.title = 'Edit';
          renderSyntax(block);
        } else {
          block.setAttribute('contenteditable', 'true');
          block.classList.add('is-editing');
          button.title = 'Save';
        }
      } else if (label === 'Copy Link') {
        const id = block.id || (block.id = 'code-' + Math.random().toString(36).slice(2, 8));
        const url = window.location.origin + window.location.pathname + '#' + id;
        (async () => {
          try { await navigator.clipboard.writeText(url); button.textContent = 'Link Copied!'; }
          catch { button.textContent = 'Failed'; }
          setTimeout(() => { button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>'; }, 1200);
        })();
      } else if (label === 'Download') {
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'code.txt';
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
      return;
    }

    // Clicking inside block (not on buttons) does nothing now
  });

  function mountBlock(block) {
    if (!block) return;
    console.log('[code-toolbar] mount block', block);
    ensureToolbar(block);
    renderSyntax(block);
  }

  function mountAll() {
    const blocks = document.querySelectorAll('.mui-code-block');
    console.log('[code-toolbar] mountAll blocks:', blocks.length);
    blocks.forEach(mountBlock);
  }
  
  // Expose mountAll globally for React pages to trigger manually
  window.__muiCodeToolbarMountAll = mountAll;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountAll);
  } else {
    mountAll();
  }

  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      m.addedNodes && m.addedNodes.forEach((node) => {
        if (node.nodeType !== 1) return;
        if (node.classList && node.classList.contains('mui-code-block')) {
          mountBlock(node);
        } else if (node.querySelectorAll) {
          node.querySelectorAll('.mui-code-block').forEach(mountBlock);
        }
      });
    }
  });
  observer.observe(document.documentElement || document.body, { childList: true, subtree: true });
})();

/* ============================================================
 * Quantopia share.js — 通用分享组件（2026-09-04）
 * 用法：
 *   <button class="share-btn" data-share-title="标题" data-share-url="https://...">分享</button>
 * 或 JS： QuantopiaShare.open({ title, url })
 * 支持：复制链接 / LinkedIn（官方分享 URL）/ 微信（复制链接+提示）
 * ============================================================ */
(function () {
  'use strict';

  var popup = null;

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function copyText(text, cb) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { cb(true); }, function () { fallbackCopy(text, cb); });
    } else {
      fallbackCopy(text, cb);
    }
  }
  function fallbackCopy(text, cb) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    cb(ok);
  }

  function showToast(msg, isOk) {
    // 移除旧 page-toast
    document.querySelectorAll('.page-toast').forEach(function (t) { t.remove(); });
    var t = document.createElement('div');
    t.className = 'page-toast' + (isOk ? ' ok' : '');
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, 2600);
  }

  function createPopup(opt) {
    if (popup) popup.remove();

    var url = opt.url || window.location.href;
    var title = opt.title || document.title;
    var linkedin = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(url);

    popup = document.createElement('div');
    popup.className = 'share-popup';
    popup.innerHTML =
      '<div class="share-popup-backdrop" data-close></div>' +
      '<div class="share-popup-panel">' +
        '<div class="share-popup-head">' +
          '<span>分享</span>' +
          '<button class="share-close" data-close aria-label="关闭">×</button>' +
        '</div>' +
        '<div class="share-popup-title">' + esc(title) + '</div>' +
        '<div class="share-popup-url">' + esc(url) + '</div>' +
        '<div class="share-actions">' +
          '<button class="share-act" data-act="copy">🔗<span>复制链接</span></button>' +
          '<a class="share-act" data-act="linkedin" href="' + linkedin + '" target="_blank" rel="noopener" onclick="QuantopiaShare.close()">💼<span>LinkedIn</span></a>' +
          '<button class="share-act" data-act="wechat">💬<span>微信</span></button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(popup);

    // 关闭
    popup.querySelectorAll('[data-close]').forEach(function (el) {
      el.addEventListener('click', function () { closePopup(); });
    });
    // 复制链接 + 立即关面板
    popup.querySelector('[data-act="copy"]').addEventListener('click', function () {
      copyText(url, function (ok) {
        showToast(ok ? '✓ 链接已复制' : '复制失败，请手动复制', ok);
        closePopup();
      });
    });
    // 微信：复制 + 立即关面板
    popup.querySelector('[data-act="wechat"]').addEventListener('click', function () {
      copyText(url, function (ok) {
        showToast(ok ? '✓ 链接已复制，去微信粘贴即可分享' : '复制失败，请手动复制', ok);
        closePopup();
      });
    });
    // LinkedIn 用原生 <a href> 新窗口打开，无需额外处理

    document.body.style.overflow = 'hidden';
  }

  function closePopup() {
    if (popup) {
      popup.remove();
      popup = null;
    }
    document.body.style.overflow = '';
  }

  window.QuantopiaShare = {
    open: createPopup,
    close: closePopup
  };

  // 事件委托：任何带 .share-btn 的元素
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.share-btn');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    createPopup({
      title: btn.getAttribute('data-share-title') || document.title,
      url: btn.getAttribute('data-share-url') || window.location.href
    });
  });
})();

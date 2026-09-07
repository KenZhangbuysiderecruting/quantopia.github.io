/* ============================================================
 * Quantopia share.js — 通用分享组件（2026-09-07 加 4th 分享图按钮）
 * 用法：
 *   <button class="share-btn" data-share-title="标题" data-share-url="https://...">分享</button>
 *   可选：data-share-job='{"id":"QT-2601","title":"...","loc":"...","function":"research","excerpt":"...","fit":"...","why":"..."}'
 *   → 点"生成分享图"会传完整数据给 share-image.js 生成品牌化 PNG
 * 支持：复制链接 / LinkedIn / 微信 / 生成分享图（带 QR 码）
 * ============================================================ */
(function () {
  'use strict';

  var popup = null;

  // 内置 i18n（避免依赖 QuantopiaI18n 加载顺序）
  var I18N = {
    shareTitle: { zh: '分享', en: 'Share' },
    copyLink:   { zh: '复制链接', en: 'Copy link' },
    linkedin:   { zh: 'LinkedIn', en: 'LinkedIn' },
    wechat:     { zh: '微信', en: 'WeChat' },
    image:      { zh: '生成分享图', en: 'Generate image' },
    imageLoading: { zh: '生成中…', en: 'Generating…' },
    imageDone:  { zh: '✓ 图片已下载', en: '✓ Image downloaded' },
    imageFail:  { zh: '生成失败', en: 'Failed to generate' },
    linkedinPost: { zh: '复制为 LinkedIn 帖子', en: 'Copy as LinkedIn post' },
  };
  function t(k) {
    var lang = (window.QuantopiaI18n && window.QuantopiaI18n.get) ? window.QuantopiaI18n.get() : 'zh';
    return (I18N[k] && I18N[k][lang]) || (I18N[k] && I18N[k].zh) || k;
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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
    document.querySelectorAll('.page-toast').forEach(function (tt) { tt.remove(); });
    var el = document.createElement('div');
    el.className = 'page-toast' + (isOk ? ' ok' : '');
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(function () { el.remove(); }, 3000);
  }

  // 构造 LinkedIn 帖子文案（绕过 share-offsite 在中国被墙的问题）
  function buildLinkedInPost(job, url, title) {
    var lines = [];
    if (job && job.title) {
      // 岗位帖：标题 + 地点 + 简介 + URL + hashtag
      lines.push(job.title);
      if (job.loc) lines.push('📍 ' + job.loc);
      if (job.excerpt) {
        // 截取前 180 字（一段简介）
        var ex = String(job.excerpt).replace(/\s+/g, ' ').trim();
        if (ex.length > 180) ex = ex.slice(0, 178) + '…';
        lines.push('');
        lines.push(ex);
      }
      if (job.why) {
        var why = String(job.why).replace(/\s+/g, ' ').trim();
        if (why.length > 140) why = why.slice(0, 138) + '…';
        lines.push('');
        lines.push('⭐ ' + why);
      }
      lines.push('');
      lines.push('Apply / read more → ' + url);
      lines.push('');
      lines.push('#Quant #HedgeFunds #QuantJobs #TalentMapping');
    } else {
      // 文章/通用帖：标题 + 摘要（从第一段或 meta 抓） + URL + hashtag
      var hook = '';
      try {
        // 优先取正文首段
        var firstP = document.querySelector('main.article p:not(.meta)');
        if (firstP) {
          var pt = (firstP.textContent || '').replace(/\s+/g, ' ').trim();
          if (pt.length > 30) {
            // 放宽长度限制到 320，长就截断
            hook = pt.length > 320 ? pt.slice(0, 318) + '…' : pt;
          }
        }
        // 兜底：用 meta description
        if (!hook) {
          var meta = document.querySelector('meta[name="description"]');
          if (meta) {
            var md = (meta.getAttribute('content') || '').replace(/\s+/g, ' ').trim();
            if (md.length > 30) {
              hook = md.length > 320 ? md.slice(0, 318) + '…' : md;
            }
          }
        }
      } catch (e) {}
      lines.push(title || 'Quantopia');
      if (hook) {
        lines.push('');
        lines.push(hook);
      }
      lines.push('');
      lines.push(url);
      lines.push('');
      lines.push('#Quant #HedgeFunds #Quant');
    }
    return lines.join('\n');
  }

  function createPopup(opt) {
    if (popup) popup.remove();

    var url = opt.url || window.location.href;
    var title = opt.title || document.title;
    var linkedin = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(url);
    var job = opt.job || null;  // 完整 job 数据（用于生成分享图）

    popup = document.createElement('div');
    popup.className = 'share-popup';
    popup.innerHTML =
      '<div class="share-popup-backdrop" data-close></div>' +
      '<div class="share-popup-panel">' +
        '<div class="share-popup-head">' +
          '<span>' + esc(t('shareTitle')) + '</span>' +
          '<button class="share-close" data-close aria-label="close">×</button>' +
        '</div>' +
        '<div class="share-popup-title">' + esc(title) + '</div>' +
        '<div class="share-popup-url">' + esc(url) + '</div>' +
        '<div class="share-actions">' +
          '<button class="share-act" data-act="copy">🔗<span>' + esc(t('copyLink')) + '</span></button>' +
          '<a class="share-act" data-act="linkedin" href="' + linkedin + '" target="_blank" rel="noopener" onclick="QuantopiaShare.close()">💼<span>' + esc(t('linkedin')) + '</span></a>' +
          '<button class="share-act" data-act="wechat">💬<span>' + esc(t('wechat')) + '</span></button>' +
          '<button class="share-act" data-act="image">🖼️<span>' + esc(t('image')) + '</span></button>' +
          '<button class="share-act" data-act="linkedinPost">📋<span>' + esc(t('linkedinPost')) + '</span></button>' +
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
        showToast(ok ? '✓ ' + (t('copyLink').slice(0, 2)) + '已复制' : 'Copy failed', ok);
        closePopup();
      });
    });
    // 微信：复制 + 立即关面板
    popup.querySelector('[data-act="wechat"]').addEventListener('click', function () {
      copyText(url, function (ok) {
        showToast(ok ? '✓ ' + t('wechat') + '：链接已复制，去粘贴即可' : 'Copy failed', ok);
        closePopup();
      });
    });
    // 生成分享图
    popup.querySelector('[data-act="image"]').addEventListener('click', function () {
      if (!window.QuantopiaShareImage) {
        showToast('⚠ ' + t('imageFail') + ' (image lib not loaded)', false);
        return;
      }
      // 用 job 数据生成；若是文章页（无 job），用基础 title
      var jobForImage = job || {
        id: '', title: title, loc: '', function: '',
        tag: '', excerpt: '', fit: '', why: '',
      };
      showToast(t('imageLoading'), true);
      closePopup();
      // 异步生成
      window.QuantopiaShareImage.download(
        jobForImage,
        url,
        'quantopia-' + (jobForImage.id || 'share') + '.png'
      ).then(function () {
        showToast(t('imageDone'), true);
      }).catch(function (err) {
        console.error('share image gen failed:', err);
        showToast('✗ ' + t('imageFail') + ': ' + (err && err.message || err), false);
      });
    });
    // LinkedIn 用原生 <a href> 新窗口打开，无需额外处理

    // 复制为 LinkedIn 帖子（绕过 share-offsite 在中国被墙的问题）
    popup.querySelector('[data-act="linkedinPost"]').addEventListener('click', function () {
      var post = buildLinkedInPost(job, url, title);
      copyText(post, function (ok) {
        showToast(ok ? '✓ LinkedIn 帖子文案已复制，去 LinkedIn 粘贴即可' : 'Copy failed', ok);
        closePopup();
      });
    });

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
    // 解析 data-share-job（JSON 字符串）
    var job = null;
    var jobAttr = btn.getAttribute('data-share-job');
    if (jobAttr) {
      try { job = JSON.parse(jobAttr); } catch (err) { job = null; }
    }
    createPopup({
      title: btn.getAttribute('data-share-title') || document.title,
      url: btn.getAttribute('data-share-url') || window.location.href,
      job: job,
    });
  });
})();

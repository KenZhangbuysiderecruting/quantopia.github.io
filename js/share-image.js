/*!
 * Quantopia Share Image Generator（v2 · 2026-09-07）
 * 用 canvas 绘制品牌化分享卡片（带 QR 码），触发 PNG 下载
 * 依赖：qrcode.min.js（qrcode-generator，Kazuhiko Arase, MIT）
 * 用法：QuantopiaShareImage.download(job, url, filename)
 */
(function () {
  'use strict';

  const W = 800;
  const PAD = 56;
  const CTA_H = 185;
  const MAX_H = 1200;
  const MIN_H = 880;

  const ICE = '#8AB4D8';
  const GOLD = '#E8C07A';
  const ORANGE = '#FC470E';
  const TEXT = '#EDF1F7';
  const MUTED = '#8B9BB4';
  const LINE = 'rgba(138,180,216,.20)';

  const FUNC_LABELS = {
    research: ['Research', '研究'],
    tech:     ['Engineering', '技术'],
    ml:       ['ML', 'ML'],
  };
  const FUNC_ICONS = { research: '🧠', tech: '🛠', ml: '🤖' };

  // Gravitas logo（启动时预加载，缓存复用）
  const GRAVITAS_LOGO_SRC = 'images/gravitas-logo.png';
  const gravitasLogo = new Image();
  gravitasLogo.src = GRAVITAS_LOGO_SRC;
  let gravitasLogoReady = false;
  gravitasLogo.onload = function () { gravitasLogoReady = true; };
  gravitasLogo.onerror = function () { console.warn('gravitas-logo.png load failed'); };

  const I18N = {
    tagline: { zh: '对冲基金在招岗位 · 一线猎头发布', en: 'Open roles in hedge funds · from a buy-side headhunter' },
    articleTagline: { zh: '深度文章 · 一线猎头视角', en: 'Deep dives · from a buy-side headhunter' },
    idealH:  { zh: '👤 理想候选人', en: '👤 IDEAL CANDIDATE' },
    whyH:    { zh: '⭐ 为什么值得去', en: '⭐ WHY IT IS WORTH IT' },
    cta:     { zh: '扫码查看详情', en: 'Scan QR to view' },
    ctaSub:  { zh: '在浏览器打开岗位链接', en: 'Opens the role in your browser' },
    ctaSubArticle: { zh: '扫码读完整文章', en: 'Scan to read the full article' },
  };

  function t(k) {
    const lang = (window.QuantopiaI18n && window.QuantopiaI18n.get) ? window.QuantopiaI18n.get() : 'zh';
    return (I18N[k] && I18N[k][lang]) || (I18N[k] && I18N[k].zh) || k;
  }

  // 中英混排智能换行：英文按 word 边界，中文按字
  function wrap(ctx, text, maxWidth) {
    if (!text) return [];
    const lines = [];
    const paragraphs = String(text).split(/\n+/);
    for (const para of paragraphs) {
      // tokens：英文/数字为一整个 word；中文单字；空白/标点为单独 token
      const tokens = para.match(/[\u4e00-\u9fff]|[A-Za-z0-9]+|[\s\-\u2014\/&,.()]+/g) || [];
      let line = '';
      for (const tok of tokens) {
        // word 类 token（不含空白）
        if (/^[\u4e00-\u9fffA-Za-z0-9\-\u2014\/&,.()]+$/.test(tok)) {
          if (ctx.measureText(line + tok).width <= maxWidth) {
            line += tok;
          } else {
            if (line.trim()) lines.push(line.trimEnd());
            line = '';
            // 单 word 太长 → 强制按字切
            if (ctx.measureText(tok).width > maxWidth) {
              for (const ch of tok) {
                if (ctx.measureText(line + ch).width <= maxWidth) {
                  line += ch;
                } else {
                  if (line) lines.push(line);
                  line = ch;
                }
              }
            } else {
              line = tok;
            }
          }
        } else {
          // 空白/分隔：尝试加，放不下就丢掉（不空行）
          const test = line + tok;
          if (ctx.measureText(test).width <= maxWidth) {
            line = test;
          }
        }
      }
      if (line.trim()) lines.push(line.trimEnd());
    }
    return lines;
  }

  function roundRect(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawQR(ctx, x, y, size, url) {
    if (typeof qrcode === 'undefined') {
      ctx.fillStyle = '#fff'; ctx.fillRect(x, y, size, size);
      ctx.fillStyle = ORANGE; ctx.font = '14px sans-serif';
      ctx.fillText('QR', x + size / 2 - 10, y + size / 2);
      return;
    }
    const qr = qrcode(0, 'M');
    qr.addData(url);
    qr.make();
    const count = qr.getModuleCount();
    const cell = size / count;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = '#0A1428';
    for (let r = 0; r < count; r++) {
      for (let c = 0; c < count; c++) {
        if (qr.isDark(r, c)) {
          ctx.fillRect(Math.floor(x + c * cell), Math.floor(y + r * cell), Math.ceil(cell), Math.ceil(cell));
        }
      }
    }
  }

  function pickFont(size, weight) {
    return (weight || 400) + ' ' + size + 'px -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", "Helvetica Neue", sans-serif';
  }

  async function generate(job, url) {
    const lang = (window.QuantopiaI18n && window.QuantopiaI18n.get) ? window.QuantopiaI18n.get() : 'zh';
    const W_INNER = W - PAD * 2;

    // ==== 预计算高度，确定画布总高 ====
    const dummy = document.createElement('canvas').getContext('2d');

    // 品牌行
    dummy.font = pickFont(26, 700);
    const brandH = 36;
    // 副标题
    dummy.font = pickFont(14, 400);
    const tagH = 22;
    // pill
    dummy.font = pickFont(15, 600);
    const pillH = job.function ? 38 : 0;
    // title（36px，限 3 行）
    dummy.font = pickFont(36, 700);
    const titleLines = wrap(dummy, job.title || '', W_INNER).slice(0, 3);
    const titleH = titleLines.length * 44;
    // ID
    const idH = 28;
    // excerpt（16px，限 5 行）
    dummy.font = pickFont(16, 400);
    const exLines = job.excerpt ? wrap(dummy, job.excerpt, W_INNER - 44).slice(0, 5) : [];
    const exH = job.excerpt ? exLines.length * 26 + 40 : 0;
    // fit
    dummy.font = pickFont(15, 400);
    const fitLines = job.fit ? wrap(dummy, job.fit, W_INNER).slice(0, 2) : [];
    const fitH = job.fit ? 22 + fitLines.length * 23 + 10 : 0;
    // why
    const whyLines = job.why ? wrap(dummy, job.why, W_INNER).slice(0, 2) : [];
    const whyH = job.why ? 22 + whyLines.length * 23 + 10 : 0;

    // 总高
    const contentH = brandH + 12 + tagH + 28 /*divider*/ + pillH + (job.function ? 26 : 0) + titleH + 8 + idH
      + (exH ? exH + 20 : 0)
      + fitH + whyH;
    const H = Math.max(MIN_H, Math.min(MAX_H, contentH + PAD + CTA_H + 40));

    // ==== 正式画 ====
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');

    // 背景径向渐变
    const grad = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, H);
    grad.addColorStop(0, '#16314A');
    grad.addColorStop(0.55, '#0F1D38');
    grad.addColorStop(1, '#0A1428');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // 顶部细装饰线（冰蓝细横线）
    ctx.strokeStyle = 'rgba(138,180,216,.30)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 60, 0);
    ctx.lineTo(W / 2 + 60, 0);
    ctx.stroke();

    let y = PAD;

    // 品牌行
    ctx.textBaseline = 'top';
    ctx.font = pickFont(26, 700);
    const brand1 = 'QUANTOPIA', xMark = '×';
    const w1 = ctx.measureText(brand1).width;
    const wx = ctx.measureText(xMark).width;
    // Gravitas logo 尺寸：保持原比例 1416:374 ≈ 3.78:1
    const logoH = 36;
    const logoW = gravitasLogoReady && gravitasLogo.naturalWidth
      ? Math.round(logoH * gravitasLogo.naturalWidth / gravitasLogo.naturalHeight)
      : Math.round(logoH * 1416 / 374);
    const totalBrand = w1 + 14 + wx + 14 + logoW;
    let bx = (W - totalBrand) / 2;
    // QUANTOPIA（冰蓝）
    ctx.fillStyle = ICE;
    ctx.fillText(brand1, bx, y + (logoH - 26) / 2);
    bx += w1 + 14;
    // ×（白）
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(xMark, bx, y + (logoH - 26) / 2);
    bx += wx + 14;
    // Gravitas logo（真实图片，透明背景白字）
    if (gravitasLogoReady) {
      ctx.drawImage(gravitasLogo, bx, y, logoW, logoH);
    } else {
      // 兜底：图片未加载完成，用文字
      ctx.fillStyle = ORANGE;
      ctx.font = pickFont(26, 700);
      ctx.fillText('GRAVITAS', bx, y);
    }
    y += logoH + 4;

    // 副标题
    ctx.font = pickFont(14, 400);
    ctx.fillStyle = MUTED;
    ctx.textAlign = 'center';
    ctx.fillText(job.excerpt ? t('tagline') : t('articleTagline'), W / 2, y);
    ctx.textAlign = 'left';
    y += tagH + 22;

    // 分隔线
    ctx.strokeStyle = LINE;
    ctx.beginPath();
    ctx.moveTo(PAD + 40, y);
    ctx.lineTo(W - PAD - 40, y);
    ctx.stroke();
    y += 18;

    // Function pill + Location（仅岗位有此信息）
    if (job.function) {
      const icon = FUNC_ICONS[job.function] || '💼';
      const funcText = icon + '  ' + (lang === 'en'
        ? (FUNC_LABELS[job.function] ? FUNC_LABELS[job.function][0] : (job.function || ''))
        : (FUNC_LABELS[job.function] ? FUNC_LABELS[job.function][1] : (job.function || '')));
      ctx.font = pickFont(15, 600);
      const pillW = ctx.measureText(funcText).width + 32;
      ctx.fillStyle = 'rgba(138,180,216,.12)';
      roundRect(ctx, PAD, y, pillW, pillH, 19); ctx.fill();
      ctx.strokeStyle = 'rgba(138,180,216,.35)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = ICE;
      ctx.textBaseline = 'middle';
      ctx.fillText(funcText, PAD + 16, y + pillH / 2);
      if (job.loc) {
        const locText = '📍  ' + job.loc;
        ctx.fillStyle = MUTED;
        ctx.fillText(locText, PAD + pillW + 18, y + pillH / 2);
      }
      ctx.textBaseline = 'top';
      y += pillH + 22;
    }

    // Title
    ctx.font = pickFont(36, 700);
    ctx.fillStyle = TEXT;
    for (const line of titleLines) {
      ctx.fillText(line, PAD, y);
      y += 44;
    }
    y += 4;

    // Job ID
    ctx.font = '500 13px "SF Mono", "Consolas", "Menlo", monospace';
    ctx.fillStyle = MUTED;
    ctx.fillText(job.id || '', PAD, y);
    y += 22;

    // Excerpt block
    if (job.excerpt && exLines.length) {
      const blockH = exLines.length * 26 + 30;
      ctx.fillStyle = ORANGE;
      ctx.fillRect(PAD, y, 4, blockH);
      ctx.fillStyle = 'rgba(252,71,14,0.07)';
      roundRect(ctx, PAD + 4, y, W_INNER - 4, blockH, 10); ctx.fill();
      ctx.font = pickFont(16, 400);
      ctx.fillStyle = 'rgba(255,255,255,0.88)';
      let ey = y + 16;
      for (const line of exLines) {
        ctx.fillText(line, PAD + 22, ey);
        ey += 26;
      }
      y += blockH + 20;
    }

    // Ideal candidate
    if (job.fit && fitLines.length) {
      ctx.font = pickFont(12, 700);
      ctx.fillStyle = ICE;
      ctx.fillText(t('idealH').toUpperCase(), PAD, y);
      y += 22;
      ctx.font = pickFont(14, 400);
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      for (const line of fitLines) {
        ctx.fillText(line, PAD, y);
        y += 23;
      }
      y += 10;
    }

    // Why
    if (job.why && whyLines.length) {
      ctx.font = pickFont(12, 700);
      ctx.fillStyle = GOLD;
      ctx.fillText(t('whyH').toUpperCase(), PAD, y);
      y += 22;
      ctx.font = pickFont(14, 400);
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      for (const line of whyLines) {
        ctx.fillText(line, PAD, y);
        y += 23;
      }
    }

    // 底部 CTA
    const ctaY = H - CTA_H - 36;
    ctx.fillStyle = 'rgba(138,180,216,0.10)';
    roundRect(ctx, PAD, ctaY, W - PAD * 2, CTA_H, 16); ctx.fill();
    ctx.strokeStyle = 'rgba(138,180,216,.30)';
    ctx.lineWidth = 1;
    ctx.stroke();
    // 左侧橙色 accent
    ctx.fillStyle = ORANGE;
    ctx.fillRect(PAD, ctaY + 20, 3, CTA_H - 40);

    // CTA 文字（垂直居中，与 QR 对齐）
    ctx.textBaseline = 'middle';
    ctx.font = pickFont(20, 700);
    ctx.fillStyle = TEXT;
    ctx.fillText(t('cta'), PAD + 26, ctaY + 70);
    ctx.font = pickFont(13, 400);
    ctx.fillStyle = MUTED;
    ctx.fillText(job.excerpt ? t('ctaSub') : t('ctaSubArticle'), PAD + 26, ctaY + 104);
    ctx.textBaseline = 'top';

    // QR（放大到 150，方便扫描）
    const qrSize = 150;
    const qrX = W - PAD - 24 - qrSize;
    const qrY = ctaY + Math.round((CTA_H - qrSize) / 2);
    drawQR(ctx, qrX, qrY, qrSize, url);

    return new Promise(res => canvas.toBlob(res, 'image/png'));
  }

  window.QuantopiaShareImage = {
    generate,
    download: async function (job, url, filename) {
      try {
        const blob = await generate(job, url);
        if (!blob) return false;
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename || ('quantopia-' + (job.id || 'share') + '.png');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
        return true;
      } catch (err) {
        console.error('share image gen failed:', err);
        return false;
      }
    },
    preview: async function (job, url) {
      const blob = await generate(job, url);
      return URL.createObjectURL(blob);
    },
  };
})();

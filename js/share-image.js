/*!
 * Quantopia Share Image Generator
 * 用 canvas 绘制品牌化分享卡片（带 QR 码），触发 PNG 下载
 * 依赖：qrcode.min.js（Kazuhiko Arase's qrcode-generator）
 * 用法：QuantopiaShareImage.download(job, url, filename)
 */
(function () {
  'use strict';

  const W = 800, H = 1280;
  const ICE = '#8AB4D8';
  const GOLD = '#E8C07A';
  const ORANGE = '#FC470E';
  const TEXT = '#EDF1F7';
  const MUTED = '#8B9BB4';
  const LINE = 'rgba(138,180,216,.20)';
  const PAD = 60;
  const FUNC_LABELS = { research: ['Research', '研究'], tech: ['Engineering', '技术'], ml: ['ML', 'ML'] };
  const FUNC_ICONS = { research: '🧠', tech: '🛠', ml: '🤖' };

  const I18N = {
    tagline: { zh: '对冲基金在招岗位 · 一线猎头发布', en: 'Open roles in hedge funds · from a buy-side headhunter' },
    idealH: { zh: '👤 理想候选人', en: '👤 IDEAL CANDIDATE' },
    whyH: { zh: '⭐ 为什么值得去', en: '⭐ WHY IT IS WORTH IT' },
    cta: { zh: '扫码查看详情', en: 'Scan QR to view' },
    ctaSub: { zh: '在浏览器打开岗位链接', en: 'Opens the role in your browser' },
  };

  function t(k) {
    const lang = (window.QuantopiaI18n && QuantopiaI18n.get) ? QuantopiaI18n.get() : 'zh';
    return (I18N[k] && I18N[k][lang]) || I18N[k].zh;
  }

  // 中英混排自动换行
  function wrap(ctx, text, maxWidth) {
    if (!text) return [];
    const lines = [];
    const paragraphs = String(text).split(/\n+/);
    for (const para of paragraphs) {
      let line = '';
      // 按字符切（中英都安全）；遇英文/数字连续段优先整体保留
      const segs = para.match(/[一-龥]|[A-Za-z0-9\s\-\—\/&,.()]+|\s/g) || [para];
      for (const seg of segs) {
        if (seg === ' ' || seg === '') {
          // 空格：加进去（如果放得下）
          const test = line + ' ';
          if (ctx.measureText(test).width <= maxWidth) line = test;
          continue;
        }
        // 尝试整体加
        const test = line + seg;
        if (ctx.measureText(test).width <= maxWidth) {
          line = test;
        } else {
          if (line) lines.push(line.trimEnd());
          line = '';
          // 长段再按字符切
          for (const ch of seg) {
            const t2 = line + ch;
            if (ctx.measureText(t2).width <= maxWidth) line = t2;
            else { if (line) lines.push(line); line = ch; }
          }
        }
      }
      if (line) lines.push(line.trimEnd());
    }
    return lines;
  }

  function roundRect(ctx, x, y, w, h, r) {
    r = Math.min(r, w/2, h/2);
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
      // 兜底：画个方块
      ctx.fillStyle = '#fff'; ctx.fillRect(x, y, size, size);
      ctx.fillStyle = ORANGE; ctx.font = '14px sans-serif';
      ctx.fillText('QR', x + size/2 - 10, y + size/2);
      return;
    }
    const qr = qrcode(0, 'M');
    qr.addData(url);
    qr.make();
    const count = qr.getModuleCount();
    const cell = size / count;
    // 白底
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x, y, size, size);
    // 蓝色模块
    ctx.fillStyle = '#0A1428';
    for (let r = 0; r < count; r++) {
      for (let c = 0; c < count; c++) {
        if (qr.isDark(r, c)) {
          ctx.fillRect(Math.floor(x + c * cell), Math.floor(y + r * cell), Math.ceil(cell), Math.ceil(cell));
        }
      }
    }
  }

  function pickFont(size, weight, italic) {
    const w = weight || 400;
    const it = italic ? ' italic' : '';
    return w + it + ' ' + size + 'px -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", "Helvetica Neue", sans-serif';
  }

  async function generate(job, url) {
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');
    const lang = (window.QuantopiaI18n && QuantopiaI18n.get) ? QuantopiaI18n.get() : 'zh';

    // 背景：径向渐变（深蓝）
    const grad = ctx.createRadialGradient(W/2, 0, 0, W/2, 0, H);
    grad.addColorStop(0, '#16314A');
    grad.addColorStop(0.5, '#0F1D38');
    grad.addColorStop(1, '#0A1428');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // 顶部微光（左上角小金色点）
    ctx.fillStyle = 'rgba(232,192,122,0.18)';
    ctx.beginPath();
    ctx.arc(W*0.85, 80, 60, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = 'rgba(138,180,216,0.10)';
    ctx.beginPath();
    ctx.arc(W*0.15, 200, 80, 0, Math.PI*2);
    ctx.fill();

    let y = PAD;

    // ===== 品牌行：QUANTOPIA × GRAVITAS =====
    ctx.textBaseline = 'top';
    ctx.font = pickFont(28, 700);
    const brand1 = 'QUANTOPIA', xMark = '×', brand2 = 'GRAVITAS';
    const w1 = ctx.measureText(brand1).width;
    const wx = ctx.measureText(xMark).width;
    const w2 = ctx.measureText(brand2).width;
    const totalBrand = w1 + 14 + wx + 14 + w2;
    let bx = (W - totalBrand) / 2;
    ctx.fillStyle = ICE; ctx.fillText(brand1, bx, y); bx += w1 + 14;
    ctx.fillStyle = '#FFFFFF'; ctx.fillText(xMark, bx, y); bx += wx + 14;
    ctx.fillStyle = ORANGE; ctx.fillText(brand2, bx, y);
    y += 44;

    // 副标题
    ctx.font = pickFont(15, 400);
    ctx.fillStyle = MUTED;
    ctx.textAlign = 'center';
    ctx.fillText(t('tagline'), W/2, y);
    ctx.textAlign = 'left';
    y += 38;

    // 分隔线
    ctx.strokeStyle = LINE;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PAD + 60, y);
    ctx.lineTo(W - PAD - 60, y);
    ctx.stroke();
    y += 28;

    // ===== Function pill + Location =====
    const icon = FUNC_ICONS[job.function] || '💼';
    const funcEn = FUNC_LABELS[job.function] ? FUNC_LABELS[job.function][0] : (job.function || '');
    const funcZh = FUNC_LABELS[job.function] ? FUNC_LABELS[job.function][1] : (job.function || '');
    const funcText = icon + '  ' + (lang === 'en' ? funcEn : funcZh);

    ctx.font = pickFont(16, 600);
    const pillW = ctx.measureText(funcText).width + 36;
    const pillH = 40;
    ctx.fillStyle = 'rgba(138,180,216,.12)';
    roundRect(ctx, PAD, y, pillW, pillH, 20); ctx.fill();
    ctx.strokeStyle = 'rgba(138,180,216,.35)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = ICE;
    ctx.textBaseline = 'middle';
    ctx.fillText(funcText, PAD + 18, y + pillH/2);

    // Location
    if (job.loc) {
      const locText = '📍  ' + job.loc;
      const locW = ctx.measureText(locText).width;
      ctx.fillStyle = MUTED;
      ctx.fillText(locText, PAD + pillW + 22, y + pillH/2);
    }
    ctx.textBaseline = 'top';
    y += pillH + 32;

    // ===== Title（最大字，bold） =====
    ctx.font = pickFont(40, 700);
    ctx.fillStyle = TEXT;
    const titleLines = wrap(ctx, job.title || '', W - PAD*2).slice(0, 3);
    const titleLH = 50;
    for (const line of titleLines) {
      ctx.fillText(line, PAD, y);
      y += titleLH;
    }
    y += 6;

    // Job ID
    ctx.font = '500 14px "SF Mono", "Consolas", "Menlo", monospace';
    ctx.fillStyle = MUTED;
    ctx.fillText(job.id || '', PAD, y);
    y += 28;

    // ===== 简介（橙色左 border 块） =====
    if (job.excerpt) {
      ctx.font = pickFont(17, 400);
      const exLines = wrap(ctx, job.excerpt, W - PAD*2 - 48).slice(0, 5);
      const lh = 28;
      const blockH = exLines.length * lh + 32;
      // 橙色左 border
      ctx.fillStyle = ORANGE;
      ctx.fillRect(PAD, y, 4, blockH);
      // 浅橙背景
      ctx.fillStyle = 'rgba(252,71,14,0.07)';
      roundRect(ctx, PAD + 4, y, W - PAD*2 - 4, blockH, 10); ctx.fill();
      // 文字
      ctx.fillStyle = 'rgba(255,255,255,0.88)';
      let ey = y + 18;
      for (const line of exLines) {
        ctx.fillText(line, PAD + 24, ey);
        ey += lh;
      }
      y += blockH + 26;
    }

    // ===== Ideal candidate =====
    if (job.fit) {
      ctx.font = pickFont(13, 700);
      ctx.fillStyle = ICE;
      ctx.fillText(t('idealH').toUpperCase(), PAD, y);
      y += 24;
      ctx.font = pickFont(15, 400);
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      const fLines = wrap(ctx, job.fit, W - PAD*2).slice(0, 3);
      for (const line of fLines) {
        ctx.fillText(line, PAD, y);
        y += 24;
      }
      y += 14;
    }

    // ===== Why =====
    if (job.why) {
      ctx.font = pickFont(13, 700);
      ctx.fillStyle = GOLD;
      ctx.fillText(t('whyH').toUpperCase(), PAD, y);
      y += 24;
      ctx.font = pickFont(15, 400);
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      const wLines = wrap(ctx, job.why, W - PAD*2).slice(0, 3);
      for (const line of wLines) {
        ctx.fillText(line, PAD, y);
        y += 24;
      }
      y += 14;
    }

    // ===== 底部 CTA =====
    const ctaH = 140;
    const ctaY = H - ctaH - PAD;
    ctx.fillStyle = 'rgba(138,180,216,0.10)';
    roundRect(ctx, PAD, ctaY, W - PAD*2, ctaH, 18); ctx.fill();
    ctx.strokeStyle = 'rgba(138,180,216,.30)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 左侧金色 accent 竖条
    ctx.fillStyle = ORANGE;
    ctx.fillRect(PAD, ctaY + 22, 3, ctaH - 44);

    // CTA 文字
    ctx.textBaseline = 'middle';
    ctx.font = pickFont(22, 700);
    ctx.fillStyle = TEXT;
    ctx.fillText(t('cta'), PAD + 28, ctaY + 50);
    ctx.font = pickFont(14, 400);
    ctx.fillStyle = MUTED;
    ctx.fillText(t('ctaSub'), PAD + 28, ctaY + 86);
    ctx.textBaseline = 'top';

    // QR
    const qrSize = 110;
    const qrX = W - PAD - 28 - qrSize;
    const qrY = ctaY + 15;
    drawQR(ctx, qrX, qrY, qrSize, url);

    return new Promise(res => canvas.toBlob(res, 'image/png'));
  }

  window.QuantopiaShareImage = {
    generate,
    download: async function (job, url, filename) {
      try {
        const blob = await generate(job, url);
        if (!blob) return;
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename || ('quantopia-' + (job.id || 'share') + '.png');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
      } catch (err) {
        console.error('share image gen failed:', err);
        alert((window.QuantopiaI18n && QuantopiaI18n.get() === 'en')
          ? 'Failed to generate image: ' + (err.message || err)
          : '生成图片失败：' + (err.message || err));
      }
    },
    preview: async function (job, url) {
      const blob = await generate(job, url);
      return URL.createObjectURL(blob);
    },
  };
})();

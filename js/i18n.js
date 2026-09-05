/* ============================================================
 * Quantopia i18n.js — 全站中英切换核心
 * 用法：<html lang="zh-CN"> + <div data-i18n="key"> 或
 *       元素内 <span data-en="English">中文</span>
 * 切换：顶部按钮 .lang-switch 或 JS: QuantopiaI18n.set('en')
 * 记忆：localStorage.quantopia_lang
 * ============================================================ */
(function () {
  'use strict';

  // 全站文案字典（静态部分）。key 与页面 data-i18n 对应。
  var DICT = {
    // ===== 导航 =====
    'nav.home': { zh: '首页', en: 'Home' },
    'nav.jobs': { zh: '岗位', en: 'Jobs' },
    'nav.about': { zh: '关于', en: 'About' },
    'nav.linkedin': { zh: 'LinkedIn ↗', en: 'LinkedIn ↗' },

    // ===== 首页 hero =====
    'index.kicker': { zh: 'Quant Recruiter · First-Person Intelligence', en: 'Quant Recruiter · First-Person Intelligence' },
    'index.hero1': { zh: '对冲基金的世界', en: 'The world of hedge funds,' },
    'index.hero2': { zh: '我帮你<b>拆开看</b>', en: 'decoded <b>for you</b>' },
    'index.sub': { zh: '机构版图 · 人才流动 · 薪酬真相。从一个<b>买方量化猎头</b>的桌面出发——谁在招人、为什么、多少钱。', en: 'Institutions · Talent flows · Compensation truth. From the desk of a <b>buy-side quant headhunter</b> — who is hiring, why, and for how much.' },
    'index.cta.jobs': { zh: '浏览 61 个在招岗位', en: 'Browse 61 open roles' },
    'index.cta.jobs.pre': { zh: '浏览', en: 'Browse' },
    'index.cta.jobs.post': { zh: '个在招岗位', en: 'open roles' },
    'index.cta.read': { zh: '阅读最新深度', en: 'Read latest insights' },
    'index.m.deep': { zh: '深度文章', en: 'Deep Dives' },
    'index.m.roles': { zh: '在招岗位', en: 'Open Roles' },
    'index.m.placed': { zh: '成功案例', en: 'Placements' },
    'index.m.regions': { zh: '覆盖地区', en: 'Regions' },

    // ===== 首页文章区 =====
    'index.latest': { zh: 'Latest — 最新深度', en: 'Latest — Deep Dives' },
    'index.aboutlink': { zh: '关于 Quantopia →', en: 'About Quantopia →' },
    'index.read': { zh: 'READ →', en: 'READ →' },
    'index.offers.region': { zh: 'Offer 交付 · 按地区', en: 'Offers Placed · by Region' },
    'index.why.trust': { zh: '为什么相信我们', en: 'Why Trust Us' },
    'index.d1.k': { zh: '数据来源', en: 'Data source' },
    'index.d1.v': { zh: '127 条真实 offer', en: '127 real offers' },
    'index.d2.k': { zh: 'PM 级案例', en: 'PM-level case' },
    'index.d2.v': { zh: '8 周完成', en: 'Done in 8 weeks' },
    'index.d3.k': { zh: '应届最快', en: 'Fastest grad hire' },
    'index.d3.v': { zh: '3 周出 offer', en: 'Offer in 3 weeks' },
    'index.d4.k': { zh: '覆盖地区', en: 'Regions covered' },
    'index.d4.v': { zh: '7 个', en: '7' },
    'index.cta.title1': { zh: '找工作，或者只是好奇？', en: 'Hunting, or just curious?' },
    'index.cta.title2': { zh: '<em>都欢迎。</em>', en: '<em>Welcome either way.</em>' },
    'index.cta.all': { zh: '浏览全部岗位 →', en: 'Browse all roles →' },
    'index.footer1': { zh: '© 2026 QUANTOPIA · Ken Zhang / Gravitas Recruitment Group', en: '© 2026 QUANTOPIA · Ken Zhang / Gravitas Recruitment Group' },
    'index.footer2': { zh: '深圳 · 香港 · 新加坡 · 伦敦 · 迪拜', en: 'SHENZHEN · HONG KONG · SINGAPORE · LONDON · DUBAI' },

    // ===== 岗位页 =====
    'jobs.hero.kicker': { zh: 'Open Roles · Updated Weekly', en: 'Open Roles · Updated Weekly' },
    'jobs.hero.title1': { zh: '对冲基金的<b>全球在招岗位</b>', en: '<b>Global open roles</b> in hedge funds' },
    'jobs.hero.sub': { zh: '从香港的 PM 到阿布扎比的 Trader · 从应届 Offer 到资深 PM · 一线人才在此。', en: 'From Hong Kong PMs to Abu Dhabi traders · from grad offers to senior PMs — the front line of quant talent.' },
    'jobs.h1': { zh: '全球对冲基金最新在招岗位', en: 'Latest open roles across global hedge funds' },
    'jobs.updated': { zh: '最近更新', en: 'Updated' },
    'jobs.reply48': { zh: '投递后 <b>48h</b> 内回复', en: 'Reply within <b>48h</b>' },
    'jobs.direct': { zh: '直投', en: 'Contact' },
    'jobs.trust1.k': { zh: '5 年', en: '5 yrs' },
    'jobs.trust1.unit': { zh: '年', en: 'yrs' },
    'jobs.trust1.v': { zh: '量化猎头经验', en: 'quant recruiting' },
    'jobs.trust2.k': { zh: '20+', en: '20+' },
    'jobs.trust2.v': { zh: '全球顶级机构', en: 'top global firms' },
    'jobs.trust3.k': { zh: '96%', en: '96%' },
    'jobs.trust3.v': { zh: '候选人满意度', en: 'candidate satisfaction' },
    'jobs.cases': { zh: '🏆 成功案例（匿名化）', en: '🏆 Success cases (anonymized)' },
    'jobs.case.hk.p': { zh: '海外多策略平台 · 香港', en: 'Global multi-strategy · HK' },
    'jobs.case.hk.t': { zh: 'Portfolio Manager 入职，3 个月', en: 'PM placed in 3 months' },
    'jobs.case.hk.d': { zh: '从候选人接触到 offer，3 个月完成。候选人原在另一家平台带 4 人团队，业绩可验证。', en: 'From first contact to offer in 3 months. The candidate led a 4-person team at another platform with verifiable track record.' },
    'jobs.case.sh.p': { zh: '头部量化私募 · 上海', en: 'Top quant fund · Shanghai' },
    'jobs.case.sh.t': { zh: 'Senior Quant Engineer 入职，4 周', en: 'Senior Quant Engineer placed in 4 weeks' },
    'jobs.case.sh.d': { zh: '急招岗位，4 周内推荐 2 名候选人，1 名入职。工程团队搭建关键成员。', en: 'Urgent role — 2 candidates referred in 4 weeks, 1 hired. Key hire for the engineering team build-out.' },
    'jobs.case.sg.p': { zh: '顶级做市商 · 新加坡', en: 'Top market maker · Singapore' },
    'jobs.case.sg.t': { zh: 'Quant Trader 入职，6 周', en: 'Quant Trader placed in 6 weeks' },
    'jobs.case.sg.d': { zh: '从新加坡本地人才池筛选，6 周内完成 offer 并入职，候选人接受跨城市 relocation。', en: 'Sourced from the local Singapore talent pool; offer and start completed in 6 weeks, including cross-city relocation.' },
    'jobs.filter.role': { zh: '职能', en: 'Function' },
    'jobs.filter.city': { zh: '城市', en: 'Location' },
    'jobs.filter.reset': { zh: '重置', en: 'Reset' },
    'jobs.empty': { zh: '该筛选条件下暂无岗位，试试其他组合。', en: 'No roles match these filters. Try another combination.' },
    'jobs.drawer.ideal': { zh: '👤 理想候选人', en: '👤 Ideal candidate' },
    'jobs.drawer.why': { zh: '⭐ 为什么值得去', en: '⭐ Why it is worth it' },
    'jobs.drawer.email': { zh: '投递简历', en: 'Submit Resume' },
    'jobs.drawer.wechat': { zh: '微信咨询', en: 'WeChat' },
    'jobs.drawer.wechat.float': { zh: '微信直投', en: 'Direct WeChat' },

    'jobs.wechat.hint': { zh: '扫一扫，发送「{job}」+ 一句话介绍', en: 'Scan and send "{job}" + one-line intro' },
    'jobs.updated.label': { zh: '📅 最近更新', en: '📅 Updated' },
    'jobs.showing.pre': { zh: '显示', en: 'Showing' },
    'jobs.showing.post': { zh: '个岗位', en: 'roles' },
    'jobs.reset': { zh: '× 重置筛选', en: '× Reset' },

    // ===== 岗位页 · 成功案例（补充） =====
    'jobs.cases.note': { zh: '* 以上案例均经客户与候选人同意后匿名化展示，不透露任何机构、个人身份与具体薪资信息。', en: '* All cases are anonymized with client and candidate consent; no firm, identity, or compensation specifics are disclosed.' },
    'jobs.case.sg2.p': { zh: '全球顶级做市商 · 新加坡', en: 'Top global market maker · Singapore' },
    'jobs.case.sg2.t': { zh: 'Quant PM 入职，8 周', en: 'Quant PM placed in 8 weeks' },
    'jobs.case.sg2.d': { zh: '候选人在全球多策略平台任 Quant 近 5 年，经长期跟进后转任做市商 Quant PM，薪资对标市场顶尖水平（含高额保证奖金与签字费）。', en: 'After ~5 years as a Quant at a global multi-strategy platform and long-term follow-up, the candidate moved to a market-maker Quant PM seat with top-of-market comp (including a high guaranteed bonus and sign-on).' },
    'jobs.case.ov.p': { zh: '全球顶级多策略平台 · 海外', en: 'Top global multi-strategy platform · Overseas' },
    'jobs.case.ov.t': { zh: '股票量化研究员入职', en: 'Equity quant researcher placed' },
    'jobs.case.ov.d': { zh: '北大数学本科 + 港大硕士 + 欧陆名校数学博士，数学奥赛奖牌得主、多篇顶刊论文。入职全球顶级多策略平台股票量化团队。', en: 'Peking University math undergrad + HKU master&rsquo;s + European PhD in math, olympiad medalist with multiple top-journal papers. Joined the equity quant team of a top global multi-strategy platform.' },
    'jobs.case.hk2.p': { zh: '全球多策略基金 · 香港', en: 'Global multi-strategy fund · Hong Kong' },
    'jobs.case.hk2.t': { zh: 'Quant Developer 入职，6 周', en: 'Quant Developer placed in 6 weeks' },
    'jobs.case.hk2.d': { zh: '国内名校软件工程 + 英硕，C++/KDB+/Python 全栈，海外多策略基金香港办公室补强交易系统团队。', en: 'Software engineering from a top domestic university + UK master&rsquo;s, full-stack C++/KDB+/Python. Strengthened the trading systems team at an offshore multi-strategy fund&rsquo;s HK office.' },
    'jobs.case.sh2.p': { zh: '头部量化私募 · 上海', en: 'Top quant fund · Shanghai' },
    'jobs.case.sh2.t': { zh: 'ML Researcher 应届入职，3 周', en: 'ML Researcher (new grad) placed in 3 weeks' },
    'jobs.case.sh2.d': { zh: '应届博士，4 篇 AI 顶会论文（ICML / AISTATS / ICASSP），从接触到 offer 仅 3 周，加入头部量化私募 AI 研究组。', en: 'Fresh PhD with 4 top AI conference papers (ICML / AISTATS / ICASSP). From first contact to offer in just 3 weeks; joined the AI research team of a top quant fund.' },
    'jobs.case.ny.p': { zh: '海外投行 · 纽约', en: 'Offshore investment bank · New York' },
    'jobs.case.ny.t': { zh: 'Quant Researcher 入职（双 offer）', en: 'Quant Researcher placed (dual offers)' },
    'jobs.case.ny.d': { zh: '北大本科 + 美硕金工，同时拿下海外投行纽约量化岗与国内头部双 offer，薪酬均对标市场顶尖。', en: 'Peking University undergrad + US financial engineering master&rsquo;s, landed both an offshore investment bank&rsquo;s NY quant role and a top domestic offer — both at top-of-market comp.' },
    'jobs.case.bj.p': { zh: '头部机构 · 北京', en: 'Top institution · Beijing' },
    'jobs.case.bj.t': { zh: '机器学习研究员入职', en: 'ML researcher placed' },
    'jobs.case.bj.d': { zh: '大模型 / ML 方向，头部量化机构 AI 组，薪酬市场顶尖水平。从接触到 offer 约 4 周。', en: 'LLM / ML focus, AI team at a top quant institution, top-of-market comp. About 4 weeks from contact to offer.' },
    'jobs.case.hk3.p': { zh: '全球多策略基金 · 香港', en: 'Global multi-strategy fund · Hong Kong' },
    'jobs.case.hk3.t': { zh: 'Quant Researcher 入职', en: 'Quant Researcher placed' },
    'jobs.case.hk3.d': { zh: '国内名校 + 海外硕士，2-4 年量化研究经验，入职全球多策略基金香港办公室，Base 对标市场顶尖。', en: 'Top domestic university + overseas master&rsquo;s, 2-4 years of quant research experience. Joined a global multi-strategy fund&rsquo;s HK office with top-of-market base.' },
    'jobs.case.ldn.p': { zh: '全球大宗商品机构 · 伦敦', en: 'Global commodities house · London' },
    'jobs.case.ldn.t': { zh: '大宗商品分析师入职', en: 'Commodities analyst placed' },
    'jobs.case.ldn.d': { zh: '能源/石油方向，候选人背景扎实，入职伦敦大宗商品交易机构，薪酬对标当地市场顶尖水平。', en: 'Energy / oil focus with a strong background; joined a London commodities trading house at top-of-market local comp.' },
    'jobs.case.adh.p': { zh: '做市商 · 阿布扎比', en: 'Market maker · Abu Dhabi' },
    'jobs.case.adh.t': { zh: 'Desk Quant 入职', en: 'Desk Quant placed' },
    'jobs.case.adh.d': { zh: '中东做市/交易机构（全球人才竞争热点地区），交易台量化支持岗，薪酬对标当地市场顶尖。', en: 'Middle East market-making / trading firm (a global talent hotspot); desk quant support role at top-of-market local comp.' },
    'jobs.case.sg3.p': { zh: '做市商 · 新加坡', en: 'Market maker · Singapore' },
    'jobs.case.sg3.t': { zh: 'Trader 入职', en: 'Trader placed' },
    'jobs.case.sg3.d': { zh: '交易员岗，做市商新加坡办公室，EP 签证全程办理。', en: 'Trading role at a market maker&rsquo;s Singapore office; EP visa fully handled.' },
    'jobs.case.cryptohk.p': { zh: 'Crypto · 香港', en: 'Crypto · Hong Kong' },
    'jobs.case.cryptohk.t': { zh: 'Quant Researcher（Crypto）入职', en: 'Quant Researcher (Crypto) placed' },
    'jobs.case.cryptohk.d': { zh: '加密量化方向，香港加密做市/交易机构，Base 对标市场顶尖。', en: 'Crypto quant role at a Hong Kong crypto market-making / trading firm, top-of-market base.' },
    'jobs.case.cryptosh.p': { zh: 'Crypto · 上海', en: 'Crypto · Shanghai' },
    'jobs.case.cryptosh.t': { zh: 'Quant Researcher（Crypto）入职', en: 'Quant Researcher (Crypto) placed' },
    'jobs.case.cryptosh.d': { zh: '加密量化，国内加密团队，对标市场顶尖薪酬。', en: 'Crypto quant at a domestic crypto team, top-of-market comp.' },
    'jobs.case.remote.p': { zh: '全球多策略 · 远程', en: 'Global multi-strategy · Remote' },
    'jobs.case.remote.t': { zh: 'Quant Researcher 远程入职', en: 'Quant Researcher placed (remote)' },
    'jobs.case.remote.d': { zh: '全球基金远程办公，Base 对标市场顶尖。', en: 'Remote role at a global fund, top-of-market base.' },

    // ===== 关于页 =====
    'about.eyebrow': { zh: 'ABOUT QUANTOPIA', en: 'ABOUT QUANTOPIA' },
    'about.title': { zh: '全球对冲基金深度分析，<span>中国视角</span>', en: 'Deep-dive analysis of global hedge funds, <span>from a China angle</span>' },
    'about.sub': { zh: '买方量化猎头 Ken Zhang 主理。机构版图 · 人才流动 · 薪酬真相。', en: 'Run by buy-side quant headhunter Ken Zhang. Institutions · talent flows · comp truth.' },

    // ===== 通用 =====
    'common.new': { zh: 'NEW · 本周头条', en: 'NEW · This week' },
    'common.backhome': { zh: '← 返回 Quantopia 首页', en: '← Back to Quantopia home' },
    'common.qr': { zh: '扫码关注 Quantopia 公众号', en: 'Scan to follow Quantopia' },
    'common.qr.sub': { zh: '全球对冲基金深度分析 · 猎头一线洞察', en: 'Global hedge fund intelligence · headhunter insight' },
    'common.switch': { zh: 'EN', en: '中文' }
  };

  function getLang() {
    var saved = null;
    try { saved = localStorage.getItem('quantopia_lang'); } catch (e) {}
    if (saved === 'en' || saved === 'zh') return saved;
    return document.documentElement.lang && document.documentElement.lang.indexOf('en') === 0 ? 'en' : 'zh';
  }

  function applyTexts(lang) {
    // 1) data-i18n 字典替换
    var nodes = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) {
      var key = nodes[i].getAttribute('data-i18n');
      var entry = DICT[key];
      if (entry && entry[lang]) {
        // 允许 HTML（如 <b>/<em>）
        nodes[i].innerHTML = entry[lang];
      }
    }
    // 2) span[data-en] 双语切换（标题、按钮等）
    var duals = document.querySelectorAll('[data-en]');
    for (var j = 0; j < duals.length; j++) {
      var en = duals[j].getAttribute('data-en');
      if (lang === 'en') {
        if (!duals[j].getAttribute('data-zh')) duals[j].setAttribute('data-zh', duals[j].innerHTML);
        duals[j].innerHTML = en;
      } else {
        var zh = duals[j].getAttribute('data-zh');
        if (zh) duals[j].innerHTML = zh;
      }
    }
    // 3) 整块切换 [data-lang-block]
    var blocks = document.querySelectorAll('[data-lang-block]');
    for (var k = 0; k < blocks.length; k++) {
      blocks[k].style.display = blocks[k].getAttribute('data-lang-block') === lang ? '' : 'none';
    }
    // 4) html lang 属性
    document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN';
    document.documentElement.setAttribute('data-lang', lang);
  }

  function renderSwitch() {
    var holders = document.querySelectorAll('.lang-switch-wrap');
    var cur = getLang();
    for (var i = 0; i < holders.length; i++) {
      var h = holders[i];
      if (h.querySelector('.lang-switch')) continue;
      var btn = document.createElement('button');
      btn.className = 'lang-switch';
      btn.type = 'button';
      btn.textContent = cur === 'zh' ? 'EN' : '中文';
      btn.setAttribute('aria-label', 'Switch language');
      btn.addEventListener('click', function () {
        var next = getLang() === 'zh' ? 'en' : 'zh';
        setLang(next);
      });
      h.appendChild(btn);
    }
  }

  function setLang(lang) {
    try { localStorage.setItem('quantopia_lang', lang); } catch (e) {}
    applyTexts(lang);
    var btns = document.querySelectorAll('.lang-switch');
    for (var i = 0; i < btns.length; i++) {
      btns[i].textContent = lang === 'zh' ? 'EN' : '中文';
    }
    // 触发页面自定义回调（如岗位页重渲染）
    if (window.QuantopiaOnLangChange) window.QuantopiaOnLangChange(lang);
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderSwitch();
    applyTexts(getLang());
  });

  window.QuantopiaI18n = {
    get: getLang,
    set: setLang,
    dict: DICT,
    apply: applyTexts
  };
})();

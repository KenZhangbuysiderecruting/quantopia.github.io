# -*- coding: utf-8 -*-
"""把 Tower Research 2026-10-20 会议的三个岗位加入 jobs.json / jobs_en.json。

对外口径纪律（务必遵守）：
  只写岗位层面的信息（职责 / 要求 / 地点 / 级别）。
  以下内容属客户内部情报，禁止写进对外 JD：
    - 两位 PM 的出身（Citadel Securities / Jane Street）
    - 数据中心投入（约 2.5 亿美元、GPU 70% Blackwell）
    - 筛选口径「当前职位任职不超过两年」
    - 坑位数、团队编制（2 个 trading 团队）
    - 任何候选人信息（目标团队候选人 / 18 个月空窗候选人 / 联系人姓名）
    - 客户内部**团队名称**（一律写成「核心策略组 / Core Strategy Team」这类描述性口径）
  公司名按既有约定匿名化，tag 沿用「老牌 HFT 自营交易」。
"""
import json, io, os, shutil, datetime

ROOT = os.path.dirname(os.path.abspath(__file__))
ZH_PATH = os.path.join(ROOT, 'jobs.json')
EN_PATH = os.path.join(ROOT, 'jobs_en.json')

NEW_ZH = [
    {
        "id": "QT-2792",
        "function": "ml",
        "group": "香港",
        "tag": "老牌 HFT 自营交易",
        "title": "Machine Learning Researcher — Strategy Desk",
        "loc": "香港",
        "loc_filters": ["hk"],
        "excerpt": "为投资策略团队构建规模化模型，跑通数据提取 → 分析 → 模型校准 → 报告的完整链路。顶尖 PhD + 2-3 年经验，不强制量化交易背景，AI Lab / 大模型团队出身可聊。",
        "fit": "顶尖 PhD（数学 / 统计 / CS / 物理）· 2-3 年经验 · 建模功底扎实 · 大模型或 AI Lab 背景加分",
        "why": "明确不卡量化交易背景，国内头部大模型团队出身同样在考虑范围内——对 AI 方向的人是很开放的入口；研究直接服务实盘策略需求。"
    },
    {
        "id": "QT-2793",
        "function": "research",
        "group": "香港",
        "tag": "老牌 HFT 自营交易",
        "title": "Junior Quant Developer / Researcher — Equities",
        "loc": "香港",
        "loc_filters": ["hk"],
        "excerpt": "股票方向的初级量化开发与量化研究，在既有框架下承担独立模块。1-2 年经验，顶级投行或顶尖名校背景，IMO / IOI 获奖为加分项。",
        "fit": "1-2 年经验 · 顶级投行 / 金融机构背景 · 顶尖院校 · IMO / IOI 获奖加分 · 上手快",
        "why": "Junior 级别即可，1-2 年经验正合适；竞赛背景（IMO / IOI）被明确看重，是凭硬实力入场的口子。"
    },
    {
        "id": "QT-2794",
        "function": "tech",
        "group": "新加坡",
        "tag": "老牌 HFT 自营交易",
        "title": "Trading Operations / Support Engineer",
        "loc": "新加坡",
        "loc_filters": ["sg"],
        "excerpt": "生产环境支持、执行交易员支持、故障排查与监控，需配合交易时段值守。精通 C++ 与 Python，头部量化机构或 production support 背景优先。",
        "fit": "精通 C++ 与 Python · 能配合交易时段（早 7/8 点至下午 4/5 点）· production support / execution trader support 经验优先",
        "why": "直接贴近实盘交易一线，C++ 与 Python 双栈能力用在交易支撑上；Application / Reliability Engineer 背景对口。"
    },
]

NEW_EN = [
    {
        "id": "QT-2792",
        "function": "ml",
        "group": "Hong Kong",
        "tag": "Established HFT Proprietary Trading",
        "title": "Machine Learning Researcher — Strategy Desk",
        "loc": "Hong Kong",
        "loc_filters": ["hk"],
        "excerpt": "Build large-scale models for the investment strategy team, owning the full chain from data extraction and analysis through model calibration to reporting. Top PhD plus 2-3 years of experience. No prior quant trading background required — candidates from AI labs and LLM teams are welcome.",
        "fit": "PhD from a top programme (maths / statistics / CS / physics) · 2-3 years' experience · strong modelling · LLM or AI lab background a plus",
        "why": "Prior quant trading experience is explicitly not required and candidates from leading LLM teams are in scope — an unusually open door for AI profiles. Research feeds directly into live strategy needs."
    },
    {
        "id": "QT-2793",
        "function": "research",
        "group": "Hong Kong",
        "tag": "Established HFT Proprietary Trading",
        "title": "Junior Quant Developer / Researcher — Equities",
        "loc": "Hong Kong",
        "loc_filters": ["hk"],
        "excerpt": "Junior quant development and research on the equities side, owning discrete modules within an existing framework. 1-2 years of experience, from a top investment bank or a top-tier university. IMO / IOI medals a plus.",
        "fit": "1-2 years' experience · top investment bank or financial institution · top-tier university · IMO / IOI medals a plus · quick to ramp up",
        "why": "Open at junior level — 1-2 years is exactly the target. Competition backgrounds (IMO / IOI) are explicitly valued, so hard technical ability is the way in."
    },
    {
        "id": "QT-2794",
        "function": "tech",
        "group": "Singapore",
        "tag": "Established HFT Proprietary Trading",
        "title": "Trading Operations / Support Engineer",
        "loc": "Singapore",
        "loc_filters": ["sg"],
        "excerpt": "Production environment support, execution trader support, troubleshooting and monitoring, aligned to trading hours. Strong C++ and Python required; background at a top quant firm or in production support preferred.",
        "fit": "Strong C++ and Python · available across trading hours (from 07:00/08:00 to 16:00/17:00) · production support / execution trader support experience preferred",
        "why": "Directly on the front line of live trading, applying a C++ and Python stack to trading support. Suits an Application or Reliability Engineer profile."
    },
]


def main():
    stamp = datetime.date.today().isoformat()
    for path, new in ((ZH_PATH, NEW_ZH), (EN_PATH, NEW_EN)):
        if not os.path.exists(path):
            raise SystemExit('missing: %s' % path)
        shutil.copy2(path, path + '.bak-' + stamp)
        with io.open(path, encoding='utf-8') as f:
            doc = json.load(f)
        existing = {j['id'] for j in doc['jobs']}
        added = 0
        for j in new:
            if j['id'] in existing:
                print('  skip (already exists): %s' % j['id'])
                continue
            doc['jobs'].append(j)
            added += 1
        doc['updated'] = stamp
        with io.open(path, 'w', encoding='utf-8') as f:
            json.dump(doc, f, ensure_ascii=False, indent=2)
            f.write('\n')
        print('%s: +%d  -> total %d' % (os.path.basename(path), added, len(doc['jobs'])))


if __name__ == '__main__':
    main()

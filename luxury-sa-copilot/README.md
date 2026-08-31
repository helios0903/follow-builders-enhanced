# SA 外联副驾 / Clienteling Copilot

用「管理与创造（manage-and-create）」工作流做的一个 AI Architect 项目：为中国奢侈品行业的 SA 打造外联副驾。**先用文档定义北极星，再用最简 Web MVP 验证核心假设。**

## 目录

| 阶段 | 交付物 | 文件 |
|------|--------|------|
| 证据底座 | 客户 case 综合梳理（把所有访谈 notes 收敛成事实） | [`docs/01-case-synthesis.md`](docs/01-case-synthesis.md) |
| **阶段 1** | **产品定义简报（北极星）** | [`docs/02-product-brief.md`](docs/02-product-brief.md) |
| 阶段 2.1 | 调研与技术决策（架构师提问） | [`docs/03-mvp-tech-decisions.md`](docs/03-mvp-tech-decisions.md) |
| **阶段 2.2** | **MVP Web App** | [`mvp/index.html`](mvp/index.html) |

## 一句话定位

奢侈品 SA 外联的两大瓶颈不是"做内容"，而是：**① 不知道先联系谁**（CRM 单维度名单，靠心情排序，误判率约 80%）；**② 不知道怎么开口**（把官方话术改得有人情味是最大人力消耗）。本工具用 **潜力 × 匹配 × 置信** 三维排序解决 ①，用 AI 话术生成解决 ②——**AI 管事实，SA 管情感**。

## 怎么运行 MVP

- **在线预览（Artifact）**：https://claude.ai/code/artifact/a9ba05c3-e76a-4b71-8b73-65ac0c1fa179 （用内置话术引擎，零依赖即可体验完整流程）
- **本地运行**：直接用浏览器打开 `mvp/index.html`。想体验 Claude 实时生成，点右上角 ⚙ 填入自己的 Anthropic API Key（仅存本地浏览器）——本地打开时对外请求不受 Artifact 沙盒的 CSP 限制，最稳。

## 绩效复盘要问的两个问题

1. **它能跑吗？** —— 能：排序把"沉睡高潜"客群顶到队列最前，每人附一句 why-now；选中即生成可编辑开场白。
2. **它感觉神奇吗？** —— 由你判断。这正是 MVP 要验证的核心假设。

## MVP 明确不做的

企业微信原生集成 · 造型/生图 · 朋友圈/录音等高敏感数据 · 真实 CRM 打通 · Agentic 自动发送。理由见 [产品简报 §五](docs/02-product-brief.md)。

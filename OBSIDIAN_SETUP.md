## DragonLab Obsidian Setup

### 第一步：打开 Obsidian
Open folder as vault → 选 `D:\Desktop\git demo\Web V2\src\content\`

### 第二步：装 Obsidian Git 插件
Community plugins → 搜 "Obsidian Git" → Install → Enable

### 第三步：设置自动推送
Obsidian Git 设置里：
- `Auto backup interval`: 10 (分钟)
- `Auto pull on startup`: ON
- `Commit message`: "obsidian: {{date}}"

### 第四步：写帖子
目录结构：
```
cs/          → CS 笔记
reading/     → 读书笔记
econ/        → 经济学
research/    → 科研/数模
blog/        → 杂记/公告
```

模板（Templater 插件可选）：
```yaml
---
title: "<% tp.file.title %>"
date: <% tp.date.now("YYYY-MM-DD") %>
tags: []
---
```

### 流程
```
Obsidian 写帖 → 10 分钟后自动 git push → Actions 构建部署 → 上线
```

### 环境
- Obsidian 写帖用 Markdown，所见即所得
- `#标题`、`**加粗**`、`![图片]()`、`$$公式$$` 都原生支持
- 图片丢进 `public/images/`，帖子里写 `/DragonLab/images/xxx.png`

---
title: DragonLab V2 Online
date: 2026-07-11
categories: Page
---
# DragonLab v2 Online 🚀

**Release Date: 2026/07/11**

本次更新完成了网页的整体重构，正式更名 DragonLab ，将原有个人 Blog 升级为面向长期建设的 **Digital Space**。

## 🏗️ Architecture

- 使用 **Astro + TypeScript** 完成全站重构
- 重设计网站架构，引入模块化组件与分区设计，提高后续扩展效率
- 重构内容构建流程，实现更高效的页面生成
- 预留本地开发环境与实时热加载能力，提升开发体验

## 📚 Content System

- 新增首页动态区域，包括：
    - Recent Updates
    - Announcement
    - Domains
- 新增长期建设领域：
    - DS（Data Science）
    - ML（Machine Learning）
    - Research
- 新增个人成长记录：
    - Econ（Economic Notes）
    - Note（Learning Notes）

## 🔄 Knowledge Workflow

- 建立基于 Obsidian Vault 的内容同步系统
- 实现文件变化监听与自动同步
- 实现Obsidian edit-Astro build-DragonLab自动化pipeline

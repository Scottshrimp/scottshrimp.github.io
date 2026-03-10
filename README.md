# ScottShrimp Studio

本仓库已从单页静态首页重构为多页面、模块化、可对接后端的数据驱动站点。

## 当前信息架构

- `/`：主页（主题引擎 + 内容聚合 + 指标面板）
- `/tools/`：交互工具（JSON、文本统计、时区转换）
- `/blog/`：博客列表（搜索 + 标签过滤）
- `/blog/post.html?slug=...`：博客详情
- `/about/`：站点定位与路线
- `/admin/`：快速管理后台（本地 CRUD + 导出 + API Base 配置）

## 目录结构

```txt
.
├── about/
├── admin/
├── assets/
│   ├── js/
│   │   ├── core/        # 布局、主题引擎、API 客户端、配置
│   │   ├── pages/       # 各页面脚本
│   │   └── services/    # 内容与工具服务层
│   └── styles/          # 基础样式、布局样式、页面样式
├── blog/
├── content/
│   └── posts/index.json # 博客内容模型
├── data/
│   └── tools.json       # 工具元数据
├── index.html
└── 404.html
```

## 数据模型

### 博客（`content/posts/index.json`）

字段：
- `slug`
- `title`
- `date`
- `tags`
- `summary`
- `lang`
- `draft`
- `cover`
- `content`

### 工具（`data/tools.json`）

字段：
- `id`
- `name`
- `category`
- `description`
- `status`

## 后端接入方式

前端已内置 API Client，默认本地模式运行（静态 JSON + localStorage）。

在 `/admin/` 设置 `API Base URL` 后，将尝试调用：

- `GET /posts`
- `POST /posts`
- `PUT /posts/:slug`
- `DELETE /posts/:slug`
- `GET /tools`
- `POST /tools`
- `PUT /tools/:id`
- `DELETE /tools/:id`

如果后端不可用，会自动回退到本地数据模式。

## 本地预览

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

然后访问 [http://127.0.0.1:4173](http://127.0.0.1:4173)

## 设计与性能方向

- 使用 `theme-engine` 统一管理时间主题与问候语
- 使用共享 layout + services，减少页面重复逻辑
- 字体加载改为有限集合并 `font-display: swap`
- 页面按职责拆分，便于后续迁移到 Astro/Next 等框架

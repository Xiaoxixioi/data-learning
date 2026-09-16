# 数据分析 · 碎片学习

移动端优先的单页 Web App，用零碎时间通过"知识讲解 + 示例 + 提问回答"循序渐进打牢 **SQL / Python / PowerBI / 业务能力** 基础。纯静态实现，无后端、无构建，进度与错题保存在浏览器本地。

## 运行方式

任意静态服务器 + 手机浏览器打开 `index.html` 即可：

```bash
cd data-learning
python3 -m http.server 8000
# 手机浏览器访问 http://<本机IP>:8000 或本机 http://localhost:8000
```

也可直接部署到 Trae 云端 / GitHub Pages / 任意静态托管。

## 在线访问与固定域名

本项目已部署到 **GitHub Pages**，固定域名（长期有效，手机/任意设备可直接打开）：

**https://xiaoxixioi.github.io/data-learning/**

- 首次构建已成功，页面、`styles/`、`js/` 全部资源在该域名下均返回 200，移动端适配已完成在线复检。
- 托管仓库：`github.com/Xiaoxixioi/data-learning`（公开）。

### 如何更新线上内容

在本地修改内容（如新增小课/题量到 `js/data-ext-*.js`）后，提交并推送即可自动重新部署：

```bash
git add -A
git commit -m "新增XX主题/进阶题"
git push origin main
```

推送 `main` 后约 1–2 分钟部署完成，**域名链接保持不变**。

### 移动端适配验收结论

在手机视口（约 375px）下对线上版本复检：首页 8 模块两列整齐、4 个 Tab 正常、SQL 课程可走通"知识→示例→答题→下一节"、场景/回顾/我的 无溢出、无横向滚动条、无 JS 报错；侧边可点击项（选项、提交、Tab）均满足 ≥44px 手指点按标准。已验证本地列出的在线版本。

## 功能

- 底部 4 Tab：**技能**（分科学习路径 + 今日推荐）/ **场景**（业务闯关）/ **回顾**（错题回练）/ **我的**（进度统计）
- 每节小课 4 步：知识卡片 → 示例演示 → 提问作答 → 即时反馈；答错自动进错题本
- 四类题型：单选题、SQL 补全/排序、结果预测/看图、开放短答（参考要点自查）
- 场景闯关：完成相关基础小课后解锁，串联 SQL + 指标口径 + 业务结论
- 数据全程本地存储（localStorage），可重置进度

## 内容结构（便于继续扩充与进阶）

内容分层，写在 `js/` 下多个数据文件中，通过 `window.COURSE_EXT` / `window.SCENARIO_EXT` 自动合并，**新增文件无需改代码**：

| 文件 | 内容 | 层级 |
|---|---|---|
| `js/data.js` | SQL 基础 / Python 数据分析 / PowerBI / 业务能力 基础骨架 | basic / seed |
| `js/data-ext-sql.js` | SQL 进阶（窗口函数、CTE、JOIN 陷阱、行转列、索引、业务练习） | advanced |
| `js/data-ext-python.js` | Python 进阶（pandas 进阶、Seaborn、openpyxl、SQLAlchemy、数据校验） | advanced |
| `js/data-ext-biz.js` | PowerBI 进阶（DAX、Power Query、讲故事）+ 业务能力进阶（口径/拆解/结论/AB/核数）+ 2 业务场景 | advanced |

现有体量：**8 模块 / 29 主题 / 65 小节 / 134 题 / 5 业务场景**。

三层组织：`模块 Module → 主题 Topic → 小课 Lesson`。小课内可含多题：`questions: [ ... ]`（每节 2-3 题），答完一题点"下一题"继续。

- **基础层（level: basic）**：SQL 全线、Python 基础已完整实现。
- **结构化（level: seed）**：PowerBI、业务能力已建结构，内容可续填。
- **进阶层（level: advanced）**：四大方向拓展题库已就绪，滚动补充中。

### 追加一小节课

在对应模块的某个 `topics[].lessons` 末尾加对象，或用独立文件追加 `window.COURSE_EXT`：

```js
{ id:"唯一id", title:"课程标题", mins:2,
  knowledge:[ {head:"是什么", body:"讲解" }, {head:"易错点", body:"..." } ],
  example:{ title:"示例", code:"SELECT ...;", note:"补充" },
  questions:[
    { type:"single", q:"题目", opts:["A","B","C","D"], answer:0, explain:"讲解" },
    { type:"predict", q:"另一题", opts:[...], answer:1, explain:"..." }
  ]
}
```

`sqlfill` 题型示例（`code` 用 `{0}` `{1}` 表示填空位）：

```js
{
  type: "sqlfill", q: "补全 SQL", answer: ["候选A","候选B"],
  fillOpts: ["候选A","候选B","干扰C","干扰D"],
  code: "SELECT ... WHERE {0} ... ;"
}
```

`open` 题型用 `refPoints: ["要点1","要点2"]` 提供自查参考要点。

### 追加业务场景

在 `SCENARIOS` 数组追加即可：

```js
{
  id: "sc-xxx", name: "场景名", desc: "描述",
  requireLessons: ["lockA","lockB"],   // 完成这些小课后解锁
  steps: [ { type:"single", q:"...", opts:[...], answer:0, explain:"..." }, { type:"open", q:"...", refPoints:[...] } ]
}
```

## 目录

```
data-learning/
├─ index.html           单页入口
├─ styles/tokens.css    设计令牌（颜色/间距/字体）
├─ styles/app.css       组件与页面样式
└─ js/
   ├─ data.js           课程与场景内容（基础层，改这里扩内容）
   ├─ data-ext-sql.js   SQL 进阶题库
   ├─ data-ext-python.js Python 进阶题库
   ├─ data-ext-biz.js   PowerBI / 业务能力进阶题库 + 进阶场景
   ├─ store.js          本地进度/错题/统计
   ├─ quiz.js           四类题型渲染与判分
   └─ app.js            路由与视图
```
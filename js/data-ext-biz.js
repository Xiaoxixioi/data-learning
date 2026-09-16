/* data-ext-biz.js — 进阶扩展数据源（PowerBI 进阶 / 业务能力进阶 / 两条真实业务场景闯关） */
/* 追加扩展模块：加载后与 data.js 中的 COURSES / SCENARIOS 合并渲染，无需改动原代码 */

window.COURSE_EXT = (window.COURSE_EXT || []).concat([

/* ============ PowerBI 进阶 ============ */
{
  id:"pbi-ext-mod", name:"PowerBI 进阶", level:"advanced", desc:"DAX 度量值 / Power Query 清洗 / 报表布局与讲故事", color:"#F0A23C",
  topics:[
    {
      id:"pbi-t-dax", name:"DAX 度量值", lessons:[
        {
          id:"pbi-dax-sumx", title:"SUMX：行级迭代求和", mins:3,
          knowledge:[
            {head:"是什么", body:"SUMX(表, 表达式) 先逐行计算表达式，再把这些结果加总。它强调『先看行、再求和』，适合金额=单价×数量这类要先逐行算再累加的场景。"},
            {head:"何时用", body:"当聚合对象不是现成列，而是由行内多列组成的计算值时用 SUMX；例如 SUMX(订单, 订单[单价]*订单[数量])。"},
            {head:"易错点", body:"SUM(列) 直接对一列求和，SUMX 则要先逐行算表达式。用错会造成金额翻倍或结果偏差，注意别把已经聚合好的明细再乘一次。"}
          ],
          example:{ title:"计算每单含税金额", code:`销售含税额 = SUMX(
    '订单',
    '订单'[单价] * '订单'[数量] * 1.13
)`, note:"先对每行求 单价*数量*税率，再迭代加总，等于真正的销售总额。" },
          questions:[
            { type:"single", q:"SUM 与 SUMX 的核心区别是？", opts:["SUM 对一列直接求和，SUMX 先逐行算表达式再累加","两者完全一样","SUM 不能求和","SUMX 只能算平均值"], answer:0, explain:"SUMX 引入行上下文逐行计算，SUM 只对现成列求和。" },
            { type:"predict", q:"订单表 3 行，单价×数量分别为 10、20、30，SUMX(订单, 单价*数量) 结果是？", opts:["60","90","120","无法确定"], answer:0, explain:"10+20+30=60，SUMX 逐行累加。" }
          ]
        },
        {
          id:"pbi-dax-calc", title:"CALCULATE：修改筛选上下文", mins:3,
          knowledge:[
            {head:"是什么", body:"CALCULATE(表达式, 条件) 在计算时临时改动外层筛选上下文，是 DAX 里最强大的『改筛』工具。"},
            {head:"何时用", body:"要在一个报表里同时比较『全部』和『当前筛选下』的数值时；例如不受切片器影响的总额占比。"},
            {head:"易错点", body:"条件写在外面和 CALCULATE 里语义不同。该用 CALCULATE 强制覆盖筛选项时不用，会造成占比分母跟着切片器一起变化而失真。"}
          ],
          example:{ title:"算不受筛选影响的全国总额占比", code:`占比 = SUM('订单'[金额])
      / CALCULATE( SUM('订单'[金额]), ALL('门店') )`, note:"分母用 CALCULATE + ALL 去掉门店筛选，占比就稳定为全国口径。" },
          questions:[
            { type:"single", q:"要『忽略当前筛选条件重算总额』，配合 CALCULATE 用的是？", opts:["ALL()","FILTER()","SUM()","FILTERX()"], answer:0, explain:"ALL 清除相关维度筛选，配合 CALCULATE 重算全局口径。" },
            { type:"predict", q:"当前筛选出华东，CALCULATE(SUM(金额), ALL(地区)) 的分母范围是？", opts:["全国（所有地区）","仅华东","华南","空"], answer:0, explain:"ALL(地区) 清除了地区筛选，分母为全局。" }
          ]
        },
        {
          id:"pbi-dax-filter-all", title:"FILTER 与 ALL：条件与清理", mins:3,
          knowledge:[
            {head:"是什么", body:"FILTER(表, 条件) 逐行判断留下符合条件的行；ALL(列) 返回忽略筛选上下文的所有行，常用于构造受控集合。"},
            {head:"何时用", body:"FILTER 做自定义复杂筛选（如只算金额>1万的用户），ALL 配合计算全局占比、占比趋势。"},
            {head:"易错点", body:"FILTER 是逐行迭代，条件要写对列引用；ALL 与 CALCULATE 组合时注意版本分组。滥用 FILTER 会拖慢性能。"}
          ],
          example:{ title:"只对高价值用户汇总", code:`高价值GMV = CALCULATE(
    SUM('订单'[金额]),
    FILTER( '用户', '用户'[累计消费] > 10000 )
)`, note:"先按用户迭代筛出高价值，再在外面聚合格算。" },
          questions:[
            { type:"sqlfill", q:"补全 DAX：筛选累计消费>5000 的用户再求和。", code:`高价值 = CALCULATE(
    SUM('订单'[金额]),
    {0}
)`, fillOpts:["FILTER('用户', '用户'[累计消费] > 5000)","ALL('用户')","SUMX('用户',1)","FILTER('订单', 1)"], answer:["FILTER('用户', '用户'[累计消费] > 5000)"], explain:"FILTER 放在 CALCULATE 内做条件过滤。" },
            { type:"single", q:"ALL() 出现在 CALCULATE 里主要作用是？", opts:["清除相关维度筛选，得到全局口径","删除所有度量","新建一张表","强制求平均"], answer:0, explain:"ALL 用于清除筛选上下文，得到不受当前切片器影响的数值。" }
          ]
        }
      ]
    },
    {
      id:"pbi-t-powerquery", name:"Power Query 清洗", lessons:[
        {
          id:"pbi-pq-import", title:"数据接入与查询编辑器", mins:2,
          knowledge:[
            {head:"是什么", body:"Power Query 是 PowerBI 的前端清洗工具，把多来源数据接入并转成干净的表模型，编辑器里每一步都以 M 语言步骤记录、可回放。"},
            {head:"何时用", body:"从 Excel/CSV/数据库接入数据、改列名、改类型、拆分列等入模前处理。"},
            {head:"易错点", body:"清洗改的是『查询层』而非原始数据；宁可先接入再规范化，也不要在源表上直接手改。"}
          ],
          example:{ title:"接管单 Excel 并改金额类型", code:`let
  源 = Excel.Workbook(File.Contents("订单.xlsx"), null, true),
  表 = 源{[Item="Sheet1",Kind="Table"]}[Data],
  类型 = Table.TransformColumnTypes(表,{{"金额", type number}})
in
  类型`, note:"M 语言按步骤串联，最后一步 in 返回结果表。" },
          questions:[
            { type:"single", q:"Power Query 里清洗每一步以什么形式记录、可回放？", opts:["M 语言步骤","MATLAB 脚本","Python 代码","CSS 规则"], answer:0, explain:"查询编辑器中每个操作都是一条 M 语言步骤。" },
            { type:"predict", q:"Excel 金额列存成文本『1,234』，直接做 SUM 求和结果会是？", opts:["错误/不参与求和（文本），或转换后才行","正常求和","等于 1234","无影响"], answer:0, explain:"文本列不能直接聚合，需先用 Table.TransformColumnTypes 转成数值。" }
          ]
        },
        {
          id:"pbi-pq-clean", title:"去重、拆列与替换", mins:2,
          knowledge:[
            {head:"是什么", body:"Power Query 里 Remove Duplicates 去重、Split Column 拆列、Replace Values 替换，是一套所见即所得的清洗动作。"},
            {head:"何时用", body:"去掉重复订单行、把「上海-浦东」拆成城市与区县、把空值/Unknown 替换成默认值。"},
            {head:"易错点", body:"去重要选对 key；拆列前想清楚分隔符；替换空值会改变语义，需评估后再做。"}
          ],
          example:{ title:"按订单号去重并拆地区列", code:`# 在查询编辑器中操作（无需手写 M）：
# 1) Remove Duplicates — 按 order_id 去重
# 2) Split Column by Delimiter — 把「城市-区」拆成两列
# 3) Replace Values — 把 '' 替换为 '未知'`, note:"这些动作会转成对应 M 函数，如 Table.Distinct、Splitter.SplitTextByDelimiter。" },
          questions:[
            { type:"single", q:"同一条订单重复出现了 3 次，要只保留 1 行，用？", opts:["按 order_id Remove Duplicates 去重","全部删除","取平均","忽略"], answer:0, explain:"按唯一键去重，把重复行收敛为 1。" },
            { type:"predict", q:"用「-」拆分列，原值『上海-浦东』会被拆成？", opts:["『上海』『浦东』两列","一列不变","『上海-浦东』拆成3段","报错"], answer:0, explain:"按分隔符拆列后分隔为两段。" }
          ]
        },
        {
          id:"pbi-pq-merge", title:"合并查询与追加", mins:2,
          knowledge:[
            {head:"是什么", body:"Merge Queries 类比 SQL JOIN，把多表按 key 拼接；Append Queries 类比 UNION，把行结构相同的表上下堆叠。"},
            {head:"何时用", body:"订单表补用户信息用 Merge；把 1-3 月三张同构 Excel 堆成一张用 Append。"},
            {head:"易错点", body:"Merge 注意一对多会放大行数；Append 要求列一致，否则列错位。"}
          ],
          example:{ title:"给订单补用户城市（Merge）", code:`// Merge Queries（类似 LEFT JOIN）
// 左：订单(order_id, user_id, amount)
// 右：用户(user_id, 城市)
// 匹配键：user_id → 左外连接
// 展开『城市』列即可`, note:"选择连接类型为 Left Outer，等价 SQL LEFT JOIN。" },
          questions:[
            { type:"predict", q:"Merge 类似 SQL 的哪种操作？", opts:["JOIN 拼接","UNION 堆叠","WHERE 过滤","ORDER BY 排序"], answer:0, explain:"Merge 是横向按 key 拼接，等价 JOIN。" },
            { type:"predict", q:"Append 三张列结构相同的月度表，行数会？", opts:["三张行数相加","取最大值","取最小值","不变"], answer:0, explain:"Append 是纵向堆叠，行数累加。" }
          ]
        }
      ]
    },
    {
      id:"pbi-t-layout", name:"报表布局与讲故事", lessons:[
        {
          id:"pbi-layout-structure", title:"报表结构：结论在上、明细在下", mins:2,
          knowledge:[
            {head:"是什么", body:"好的报表像新闻倒金字塔：顶部放结论（KPI/一句话洞察），中间放关键维度对比图，底部才放明细表格，让观众 3 秒进入重点。"},
            {head:"何时用", body:"搭建看板、面向领导的汇报页；明确『一页讲一个故事』。"},
            {head:"易错点", body:"把所有图堆在一页没有层次；颜色过度花哨抢注意力。先排版后美化。"}
          ],
          example:{ title:"报表一页结构（自上而下）", code:`① 结论区：标题即结论 + 3 个关键 KPI
② 主图区：趋势折线 + 对比柱状
③ 明细区：可下钻的明细表
④ 说明区：口径与数据更新说明`, note:"信息从结论到细节层层展开，观众可逐层深入。" },
          questions:[
            { type:"single", q:"移动端看板首页最优先放的内容是？", opts:["结论与关键 KPI","全量明细表","装饰图","帮助文档"], answer:0, explain:"首页先给结论，让观众快速抓住重点。" },
            { type:"open", q:"给这个看板写一句排版思路，说明为什么『结论在上、明细在下』。", refPoints:["倒金字塔，先给结论","关键对比图放中间","明细可下钻放底部"], explain:"对齐认知负荷：先结论后细节。" }
          ]
        },
        {
          id:"pbi-storytelling", title:"用数据讲故事：一句结论一个动作", mins:2,
          knowledge:[
            {head:"是什么", body:"讲故事=从数据里提炼『一个洞察』+『一个建议动作』+『证据』，而不是罗列多个图表。"},
            {head:"何时用", body:"做月报/周报、汇报页面标题时；突出『所以呢』。"},
            {head:"易错点", body:"多图罗列没有叙事主线；结论与数据对不上。一张图只讲一件事。"}
          ],
          example:{ title:"从『华东销量高』到『讲故事』", code:`弱：本月华东销量 1200 万，销量最大。
强：华东贡献 38% 销量且连续 3 个月上涨，建议优先加大华东促销预算并扩品，确保旺季不缺货。`, note:"强版本 = 洞察 + 证据 + 建议动作。" },
          questions:[
            { type:"single", q:"下面哪句更符合『用数据讲故事』？", opts:["华东连涨3月占38%，建议加预算扩品并防缺货","本月华东销量最高","各品类销量如下表","图表没有结论"], answer:0, explain:"讲故事要求洞察+证据+建议动作。" },
            { type:"predict", q:"如果报表只放 3 个饼图、没有结论文字，观众很可能？", opts:["看了不知道要做什么","立刻明白重点","自动下钻","自动执行"], answer:0, explain:"缺少结论与动作，图表难以转化为决策。" }
          ]
        }
      ]
    }
  ]
},

/* ============ 业务能力进阶 ============ */
{
  id:"biz-ext-mod", name:"业务能力进阶", level:"advanced", desc:"指标口径细化 / 需求拆解 / 结论写作 / A/B测试 / 核数自查", color:"#E8463A",
  topics:[
    {
      id:"bizs-t-metric", name:"指标口径细化", lessons:[
        {
          id:"bizs-metric-dedup", title:"去重用户口径：DAU 怎么数", mins:3,
          knowledge:[
            {head:"是什么", body:"统计用户数默认要『去重』：按唯一 id（user_id）去重。DAU=当天活跃的不重复用户数，不能把一次行为看成多个用户。"},
            {head:"去重键", body:"用 user_id 去重；跨端场景要复用同一身份标识，否则同一人换设备被多算。"},
            {head:"易错点", body:"COUNT(*) 与 COUNT(DISTINCT user_id) 在含重复行时结果不同；先搞清表里是否有重复行为记录。"}
          ],
          example:{ title:"对比 DAU 两种写法", code:`-- 重复行为会被多算（不推荐）
SELECT COUNT(*) FROM event WHERE dt='2026-09-01';

-- 按用户去重
SELECT COUNT(DISTINCT user_id) FROM event WHERE dt='2026-09-01';`, note:"行为明细每行一次点击，直接 COUNT(*) 会把同人多次点击都算成独立活跃。" },
          questions:[
            { type:"predict", q:"某日事件表有 10 行 5 个不同 user_id，COUNT(DISTINCT user_id) 得到？", opts:["5","10","1","0"], answer:0, explain:"按 user_id 去重，得到 5 个独立用户。" },
            { type:"single", q:"计算跨设备 DAU 最需要确保的是？", opts:["复用统一身份标识避免误重","直接用设备 id","只统计一台设备","不设口径"], answer:0, explain:"统一身份标识才能把同一用户跨设备合并，避免高估。" }
          ]
        },
        {
          id:"bizs-metric-retention", title:"留存口径：N日留存怎么定义", mins:3,
          knowledge:[
            {head:"是什么", body:"N 日留存 = 第 0 天进入的用户里，第 N 天仍活跃的比例。分母是首日用户数，分子是这些人在第 N 天又回来的人数。"},
            {head:"时间窗", body:"要显式说明『第 N 天』是自然日；次日留存/7日留存/30日留存的窗口不同，互相不能混比。"},
            {head:"易错点", body:"把『次日活跃/当日总活跃』当次日留存是错误口径；分子必须锁定为首日进入人群。"}
          ],
          example:{ title:"次日留存计算框架", code:`分子 = 第0天新增、且第1天仍有活跃行为的用户数
分母 = 第0天新增用户总数
次日留存率 = 分子 / 分母`, note:"分子与分母都是同一批首日用户，随时间窗口切到第 N 天。" },
          questions:[
            { type:"predict", q:"第0天新增100人，其中第1天回来30人，次日留存率是？", opts:["30%","100%","70%","3%"], answer:0, explain:"30/100=30%，分子分母同批首日用户。" },
            { type:"single", q:"『第0天新增用户里，第3天仍活跃』描述的是？", opts:["3日留存（窗口第3天）","次日留存","月留存","日活占比"], answer:0, explain:"第3天仍活跃即为3日留存口径。" }
          ]
        },
        {
          id:"bizs-metric-conv", title:"转化口径：分子分母要可控可比", mins:3,
          knowledge:[
            {head:"是什么", body:"转化率 = 目标行为人数 / 进入该流程人数。分子分母要同源、同人群、同时间窗才可比。"},
            {head:"漏斗", body:"曝光→点击→注册→下单→支付，每步都算转化，漏斗式看掉点。"},
            {head:"易错点", body:"分母用错人群（如拿全体用户当下单漏斗分母）会让数值失真；跨期比较要保证口径不变。"}
          ],
          example:{ title:"下单转化率口径", code:`下单转化率 = 完成首笔支付用户数 / 进入商详页去重用户数
口径说明：按自然日、去重用户、仅计入首次支付`, note:"把分子分母与过滤/去重规则写清楚，口径即完整。" },
          questions:[
            { type:"predict", q:"商详页1000人去重用户，其中120人支付首单，下单转化率是？", opts:["12%","1.2%","120%","8.3%"], answer:0, explain:"120/1000=12%。" },
            { type:"single", q:"跨月对比转化率前，务必确认？", opts:["口径一致（分子分母定义相同）","只比金额","换掉分母","不设窗口"], answer:0, explain:"口径一致才可比，否则数字差异无意义。" }
          ]
        }
      ]
    },
    {
      id:"bizs-t-req", name:"需求拆解", lessons:[
        {
          id:"bizs-req-clarify", title:"澄清模糊需求：先问清 5W", mins:2,
          knowledge:[
            {head:"是什么", body:"『看看我们的用户』这类需求太模糊。拆解前先澄清：目标是什么（为什么看）、对象是谁、时间范围、指标和口径、提供给谁。"},
            {head:"要问清", body:"是看现状还是定位问题？差异化要按什么维度切？结论要支撑什么决策？"},
            {head:"易错点", body:"拿到模糊需求就开跑，容易做了半天对不上业务问题。先对齐再取数。"}
          ],
          example:{ title:"把模糊需求问具体", code:`模糊：『分析一下用户流失』
澄清后：
 目标：找出流失主要原因并给出召回建议
  对象：近90天未活跃的注册用户
  指标：流失定义=连续90天无活跃
  维度：按注册渠道/首单品类切
  交付：一句归因结论 + 两个建议`, note:"澄清后每个人都理解一致，避免返工。" },
          questions:[
            { type:"single", q:"接到『看看未来三个月大概能卖多少』的需求，第一步该？", opts:["澄清预测目的、口径、范围","直接写预测 SQL","给结论","忽略口径"], answer:0, explain:"先澄清目的与口径，避免计算方向错误。" },
            { type:"open", q:"把『分析一下用户流失』拆成 3 个要先确认的问题。", refPoints:["明确流失的定义（如连续多少天无活跃）","明确要支持什么决策（归因/召回）","明确分析维度与时间窗"], explain:"开头澄清得越清楚，后续取数越不返工。" }
          ]
        },
        {
          id:"bizs-req-breakdown", title:"拆解成可执行：问题→指标→SQL", mins:2,
          knowledge:[
            {head:"是什么", body:"把一个大问题按『问题→假设→指标→SQL/取数→验证』逐层拆，让每一步都可执行、可验证。"},
            {head:"方法", body:"用漏斗、维度交叉、分群把问题分解成子问题，再映射到 SQL 查询。"},
            {head:"易错点", body:"跳过步骤直接写 SQL 容易答非所问；每一层拆完要能对应上后续查询与解释。"}
          ],
          example:{ title:"『为什么收入下降』的拆解", code:`问题：本月收入为何下降？
子问题A：是用户数少了还是客单价低了？
  指标A1：活跃购买用户数（去重）
  指标A2：平均客单价 = GMV/订单数
子问题B：是哪个渠道/品类掉得最多？
  指标B：按渠道、品类分组的 GMV 环比
→ 每个子问题对应一条可执行 SQL`, note:"从业务问题落地到指标与 SQL，分析就有了主线。" },
          questions:[
            { type:"single", q:"『收入下降』合理的第一步拆解是？", opts:["区分用户数下降还是客单价下降","直接写全表 SQL","只看总金额","不加维度"], answer:0, explain:"先拆分子因子（量或价），再定位到维度。" },
            { type:"open", q:"把『新客转化低』拆成 2 个可执行的子问题并各给一个指标。", refPoints:["拆到漏斗环节（曝光点击注册支付哪步掉点）","给出对应指标（如注册转化率）","可映射到 SQL 取数"], explain:"好的拆解每个子问题都能用指标+SQL验证。" }
          ]
        }
      ]
    },
    {
      id:"bizs-t-writing", name:"业务结论写作", lessons:[
        {
          id:"bizs-writing-structure", title:"结论结构：洞察→证据→建议", mins:2,
          knowledge:[
            {head:"是什么", body:"业务结论三件套：结论（一句话说清变化）、证据（用数据支撑）、建议（下一步动作）。先把结论放最前。"},
            {head:"何时用", body:"写月报、向上汇报、场景闯关的 open 题答案时；结论 > 数据罗列。"},
            {head:"易错点", body:"只罗列数字没有结论；结论缺少数据支撑；有结论无建议。"}
          ],
          example:{ title:"从数据到一句结论", code:`素材：华东 38% 销量、连涨 3 月、库存偏低
结论：华东是增长主力（占38%且连涨3月）
证据：销量占比与环比数据
建议：加华东预算、扩品并提前备货防缺货`, note:"结论+证据+建议三者齐，才是一句合格业务结论。" },
          questions:[
            { type:"single", q:"业务结论的推荐结构顺序是？", opts:["结论→证据→建议","证据→结论→建议","建议→证据→结论","只写数据"], answer:0, explain:"先给结论，再用证据支撑，最后给建议。" },
            { type:"open", q:"用『结论→证据→建议』写一句：本月新客 100 人，50% 来自直播渠道，直播渠道留存明显高于其他渠道。", refPoints:["先把结论点出（直播是新客主力且留存好）","补齐数字证据","给出建议动作（加大直播投入）"], explain:"练习把数字组织成可决策的一句结论。" }
          ]
        },
        {
          id:"bizs-writing-advice", title:"把结论写成可执行建议", mins:2,
          knowledge:[
            {head:"是什么", body:"好建议要：指明对象、给出动作、说明预期。从『数据洞察』自然接出『所以建议怎么做』。"},
            {head:"何时用", body:"结论文档最后一段、汇报的收尾时；让分析能落地产出。"},
            {head:"易错点", body:"建议空泛（如『多拉新』）、建议无数据支撑、列为清单不做取舍。"}
          ],
          example:{ title:"空泛 vs 可执行建议", code:`空泛：建议多拉新。
可执行：建议针对直播渠道设计新人专属券（对象+动作），预期将首购转化提升 20%（预期），并设 2 周 A/B 验证（可回测）。`, note:"对象、动作、预期、验证方式都明确，才易落地。" },
          questions:[
            { type:"single", q:"哪句更像是可执行建议？", opts:["针对直播渠道上新人券，A/B验证首购转化提升","建议多拉新","多看数据","加强运营"], answer:0, explain:"指明对象/动作/预期/验证的才是可执行建议。" },
            { type:"open", q:"数据：客户流失集中在未上过直播的老客。请给一条可执行建议。", refPoints:["对象锁定（未上过直播的老客）","给出具体动作（直播专属召回活动/触达）","给出预期与验证（留存/召回率提升）"], explain:"建议要能落到具体人群与动作。" }
          ]
        }
      ]
    },
    {
      id:"bizs-t-ab", name:"A/B 测试意识", lessons:[
        {
          id:"bizs-ab-basic", title:"A/B 测试基本思想：分组对照", mins:2,
          knowledge:[
            {head:"是什么", body:"A/B 测试随机把人分到实验组和对照组，只改一个变量，用对照组做基准比较效果差异。"},
            {head:"何时用", body:"验证改版/策略是否有效时（按钮颜色、新人券、推荐规则）。"},
            {head:"易错点", body:"实验组与对照组要随机分配、规模相近；一次只动一个变量，否则无法归因。"}
          ],
          example:{ title:"验证新人券效果的 A/B 设计", code:`随机分流：50% 给新人券（实验），50% 不给（对照）
指标：首购转化率、客单价、留存
比较：实验组 vs 对照组各指标差异`, note:"随机化让两组除策略外尽量可比。" },
          questions:[
            { type:"single", q:"A/B 测试的核心是为了？", opts:["通过随机分组对照，隔离单变量效果","取平均数","把所有用户放大招","不断改页面"], answer:0, explain:"随机+对照+单变量，保证能归因。" },
            { type:"predict", q:"一次测试同时改了按钮和文案，效果好，能归因到哪个改动吗？", opts:["不能，混了两个变量","能归因按钮","能归因文案","无需归因"], answer:0, explain:"同时变动多个变量，无法分离各自贡献。" }
          ]
        },
        {
          id:"bizs-ab-caveat", title:"显著性、样本量与陷阱", mins:2,
          knowledge:[
            {head:"是什么", body:"看 A/B 结果不能只看数字差，要看差异是否显著（p 值、置信区间）、样本量是否足够、观察期是否够长。"},
            {head:"何时用", body:"下结论前；防止把随机波动当真实效果。"},
            {head:"易错点", body:"样本太小、观察期太短、多重比较、提前偷看就跑结论，都是常见陷阱。"}
          ],
          example:{ title:"看 A/B 结果的检查清单", code:`① 样本量是否足够（可做样本量估算）
② 差异是否有统计显著性（p<0.05 / CI 不含0）
③ 观察期是否覆盖足够周期
④ 是否有漏斗上下层影响被忽略
⑤ 是否只看了单一指标`, note:"显著性＋样本＋观察期都对，才敢下结论。" },
          questions:[
            { type:"single", q:"实验组比对照组转化多 0.5%，但 p 值很大（不显著），结论应是？", opts:["不能断言差异真实存在","差异一定有效","一定是误差可忽略","直接全量上线"], answer:0, explain:"不显著说明差异可能是随机波动，不能当成效。" },
            { type:"open", q:"同事说『A/B 涨了 5%』就急着全量上线，你提醒他要先看什么？", refPoints:["是否显著（p值/置信区间）","样本量与观察期是否足够","是否单变量可归因"], explain:"结果要过显著性、样本、归因三关再下结论。" }
          ]
        }
      ]
    },
    {
      id:"bizs-t-audit", name:"核数自查", lessons:[
        {
          id:"bizs-audit-doublecheck", title:"交付前核数：口径-数字-结论三对账", mins:2,
          knowledge:[
            {head:"是什么", body:"核数自查=交付结论前，把口径、关键数字、结论三处对齐，防错报。"},
            {head:"怎么核", body:"把关键 SQL 的 WHERE/去重/窗口列出来对口径；抽查 2-3 个样本；用粗算直接量级校验。"},
            {head:"易错点", body:"直接抄上期口径导致窗口错；漏去重就翻倍；数字与文字结论不一致仍照发。"}
          ],
          example:{ title:"交付前 3 问", code:`① 我的口径（时间窗/去重/过滤）写清楚了吗？
② 关键数字能重跑复现吗（抽查样本+量级粗算）？
③ 文字结论与表格数字对得上吗？`, note:"三对账通过再提交，能省下大量返工。" },
          questions:[
            { type:"predict", q:"发布前发现自己 GROUP BY 漏了地区维度，正确做法是？", opts:["修正后重新核对再发布","直接发布","删掉结论","不改直接发"], answer:0, explain:"发现问题先修正并复核，不带着错误发布。" },
            { type:"open", q:"写一条发布前自查清单（至少 2 项）。", refPoints:["口径核对（时间/去重/过滤）","关键数字抽查+量级粗算复现","结论与数字一致性"], explain:"自查清单能显著降低错报概率。" }
          ]
        },
        {
          id:"bizs-audit-pipeline", title:"取数链路复查：源头到展示", mins:2,
          knowledge:[
            {head:"是什么", body:"数字从源表→清洗→透视→图表→结论，每一步都可能失真；自查要沿链路走一遍，定位偏差在哪层。"},
            {head:"复查点", body:"源表是否按权限正确过滤？清洗是否多删行？透视维度/度量是否匹配？图表是否断档？"},
            {head:"易错点", body:"只检查最后数字不看中间态；改过口径忘记同步到所有复用该指标的地方。"}
          ],
          example:{ title:"沿链路自查", code:`源表 → JOIN是否放大 → 清洗多删/少删 → 聚合维度正确 → 图表完整 → 结论一致
一旦数字异常，按层二分定位是哪一步引入了偏差。`, note:"从源头到展示逐层校验，定位更快。" },
          questions:[
            { type:"single", q:"发现数字异常，最有效的定位方式是？", opts:["沿取数链路逐层二分定位","只改最后一层","重跑一遍相同的错误","忽略"], answer:0, explain:"按链路分层核对，能快速锁定偏差来源。" },
            { type:"predict", q:"上游清洗步骤改了去重规则但没同步到下游指标，结果很可能是？", opts:["数字口径不一致","完全无影响","自动修正","更准确"], answer:0, explain:"口径改动未同步会令各指标口径打架。" }
          ]
        }
      ]
    }
  ]
}
]);

/* ============ 业务场景闯关扩展 ============ */
window.SCENARIO_EXT = (window.SCENARIO_EXT || []).concat([

{
  id:"scx-retention", name:"用户留存分析", desc:"从首日新增到留存率，串联 SQL 去重、留存口径与一句业务结论",
  requireLessons:["pbi-dax-calc","bizs-metric-retention","date-func","groupby-agg","py-pandas-read"],
  steps:[
    { type:"single", q:"留存分析里『次日留存』的分子与分母应分别是？", opts:["分子=第1天仍活跃的首日用户，分母=首日新增用户","分子=当日总活跃，分母=当日总活跃","分子=新增，分母=活跃","只比环比"], answer:0, explain:"分子分母都锁定首日人群，只把活跃窗口切到第 N 天。" },
    { type:"sqlfill", q:"补全 SQL：统计某日新增用户在次日仍活跃的去重用户数。", code:"SELECT COUNT(DISTINCT a.user_id)\nFROM users a\nJOIN events b\n  ON a.user_id = b.user_id\nWHERE a.first_active_day = '{0}'\n  AND b.active_day = DATE_ADD('{0}', INTERVAL {1} DAY)", fillOpts:["2026-09-16","1","7","b.amount>0"],
      answer:["2026-09-16","1"], explain:"分母锁定首日新增，分子取次日仍活跃，DISTINCT 去重。" },
    { type:"single", q:"拿到留存下降信号后，正确的下一步是？", opts:["先拆分维度（渠道/品类）定位流失人群，再给召回建议","直接下『留存在下降』结论","不采取动作","改口径更难看"], answer:0, explain:"从归因维度切入，才能给出可执行结论。" },
    { type:"open", q:"一句话总结留存分析结论（含数据证据与建议动作）。", refPoints:["写出留存率数值或趋势（证据）","给出主要归因维度（渠道/品类）","给出一条具体召回建议"], explain:"练习把留存数字组织成可决策的业务结论。" }
  ]
},
{
  id:"scx-rfm", name:"RFM 精细化运营", desc:"用消费额度/频率/时间给用户分层，串联分组 SQL、去重口径与分层运营结论",
  requireLessons:["bizs-metric-dedup","bizs-writing-structure","pbi-dax-sumx","self-join","case-when"],
  steps:[
    { type:"predict", q:"RFM 中『R=最近一次消费距今天数』对每位 VIP 用户应取值？", opts:["MAX(最近消费时间)/每用户取一次","取所有用户平均","随便取","计总次数"], answer:0, explain:"R 按用户聚合取最近消费，去重到用户粒度。" },
    { type:"sqlfill", q:"补全 SQL：计算每个用户的总消费金额（沿用 SUMX 思想）。", code:"SELECT user_id,\n       SUM(amount) AS total_spent\nFROM orders\nGROUP BY {0}\nORDER BY {1} DESC;", fillOpts:["user_id","SUM(amount)","order_id","amount"],
      answer:["user_id","SUM(amount)"], explain:"按 user_id 去重聚合，再按总消费降序。" },
    { type:"single", q:"给『高价值但流失』用户（R 大、F/M 高）的运营动作应偏？", opts:["做召回（触达+权益）重激活","什么都不做","只发新品推送不等权益","关闭账号"], answer:0, explain:"判断基于 RFM 分层，明确对象与动作。" },
    { type:"open", q:"用『结论→证据→建议』写一句 RFM 分层运营总结。", refPoints:["先亮出分层结论（哪类用户群体最重要/风险最高）","给出消费数据证据（金额/频次/时间）","落到一个具体运营动作（对象+策略）"], explain:"把 RFM 分层转成可执行的精细化运营结论。" }
  ]
}
]);
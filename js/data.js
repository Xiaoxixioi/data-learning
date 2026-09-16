/* data.js — 课程数据源（模块→主题→小课），追加新内容在此扩展即可，无需改代码 */
window.COURSES = [
/* ============ SQL ============ */
{
  id:"sql", name:"SQL", level:"basic", desc:"多表JOIN / 分组统计 / 条件空值 / 取数日期，含踩坑", color:"#4B3FE3",
  topics:[
    {
      id:"t-join", name:"多表 JOIN 与自连接", lessons:[
        {
          id:"join-left", title:"LEFT JOIN 保留左表所有行", mins:2,
          knowledge:[
            {head:"是什么", body:"LEFT JOIN 以左表为主，左表每行都保留；右表没有匹配就用 NULL 填充。"},
            {head:"何时用", body:"要保证某张主表（如订单）一行不丢，再去补关联信息（如用户）时使用。多对多会放大行数，先留意唯一性。"},
            {head:"易错点", body:"关联键（id/user_id）要匹配且类型一致；否则会出现 NULL 或行数暴涨。"}
          ],
          example:{ title:"订单表 LEFT JOIN 用户表", code:"SELECT o.order_id, u.user_name\nFROM orders o\nLEFT JOIN users u ON o.user_id = u.id;", note:"没有该用户的订单仍会保留，user_name 为 NULL。" },
          quiz:{
            type:"single",
            q:"LEFT JOIN 后，左表订单行数会怎么变化？",
            opts:["每行都会被保留，至少原有那么多行","只会留下成功匹配用户的行","一定比左表少","一定会翻倍"],
            answer:0,
            explain:"LEFT JOIN 以左表为准，所有左表行都会保留，匹配不上的右表列为 NULL。"
          }
        },
        {
          id:"join-inner-left", title:"INNER vs LEFT 的区别", mins:2,
          knowledge:[
            {head:"区别", body:"INNER JOIN 只留两表都匹配的行；LEFT JOIN 保留左表全部行。业务上常用 LEFT 保证主表行数不变。"}
          ],
          example:{ title:"同一查询的两种写法", code:"-- INNER：只要匹配到的\nSELECT o.order_id FROM orders o\nINNER JOIN users u ON o.user_id=u.id;\n\n-- LEFT：保留全部订单\nSELECT o.order_id FROM orders o\nLEFT JOIN users u ON o.user_id=u.id;", note:"若订单都来自有效用户，二者行数相同；有孤儿订单时 LEFT 更多。" },
          quiz:{
            type:"predict",
            q:"orders 有 5 行，其中 1 行 user_id 在 users 中不存在。INNER JOIN 的结果行数是？",
            opts:["4 行","5 行","0 行","6 行"],
            answer:0,
            explain:"INNER JOIN 只保留匹配的行，那 1 行孤儿订单被丢弃，故为 4 行。"
          }
        },
        {
          id:"self-join", title:"自连接：同表内比较", mins:2,
          knowledge:[
            {head:"是什么", body:"自连接就是一张表和自己做 JOIN，常用来在同一张表内找同一分组里的上下级、相邻记录或两两比较。"},
            {head:"何时用", body:"如：找出同部门里比自己薪资高的人；找相邻两天的销售差异。需要两个别名区分。"},
            {head:"易错点", body:"必须给两个实例起别名（a、b），并想清楚连接条件，否则会产生大量无关交叉组合。"}
          ],
          example:{ title:"找比同部门更高薪的员工", code:"SELECT a.emp_name, a.salary\nFROM emp a\nJOIN emp b\n  ON a.dept = b.dept AND b.salary > a.salary;\n-- 连接条件是核心：同部门且b薪资更高", note:"结果里每个 a 表示『存在更高薪同事的员工』。" },
          quiz:{
            type:"sqlfill",
            q:"补全自连接：JOIN 一张员工表两次，比较同部门薪资。",
            code:"SELECT a.name\nFROM emp a\nJOIN emp b\n  ON {0} AND {1};",
            fillOpts:["a.dept = b.dept","b.salary > a.salary","a.name = b.name","a.salary < b.salary"],
            answer:["a.dept = b.dept","b.salary > a.salary"],
            explain:"连接条件要先按部门对齐（a.dept = b.dept），再比较薪资（b.salary > a.salary）。"
          }
        }
      ]
    },
    {
      id:"t-groupby", name:"分组统计 GROUP BY", lessons:[
        {
          id:"groupby-basic", title:"GROUP BY 怎么分组聚合", mins:2,
          knowledge:[
            {head:"是什么", body:"GROUP BY 把相同值合并成一组，配合聚合函数（SUM/COUNT/AVG/MIN/MAX）产出每组的统计值。"},
            {head:"何时用", body:"要按某维度汇总业务量时使用，例如按月份、按省份统计订单。"},
            {head:"易错点", body:"SELECT 里出现的非聚合列必须都在 GROUP BY 中；否则结果不确定。加 WHERE 先筛行。"}
          ],
          example:{ title:"按城市统计订单量", code:"SELECT city, COUNT(*) AS cnt\nFROM orders\nGROUP BY city;", note:"每个城市一行，cnt 为该城市订单数。" },
          quiz:{
            type:"single",
            q:"下面哪条能正确统计『每个城市的总金额』？",
            opts:["SELECT city, SUM(amount) FROM orders GROUP BY city","SELECT amount, SUM(city) FROM orders GROUP BY amount","SELECT city, amount FROM orders GROUP BY city","SELECT SUM(amount) FROM orders"],
            answer:0,
            explain:"分组统计列=city，聚合=SUM(amount)，两者搭配才正确。"
          }
        },
        {
          id:"groupby-agg", title:"SUM 与 COUNT 的分组统计", mins:2,
          knowledge:[
            {head:"SUM", body:"求数值列的和，如 SUM(amount)。NULL 会被忽略。"},
            {head:"COUNT", body:"COUNT(*) 数行数（含 NULL 行）；COUNT(列) 只数该列非 NULL 的个数。坑：两者结果可能不同。"},
            {head:"易错点", body:"需要『某列非空数量』用 COUNT(列)；需要无条件数行用 COUNT(*)。"}
          ],
          example:{ title:"分组里 SUM 与 COUNT 的差别", code:"SELECT dept,\n       COUNT(*)      AS rows,\n       COUNT(score)  AS valid,\n       SUM(score)    AS total\nFROM student\nGROUP BY dept;", note:"rows ≥ valid：因为 score 可能有 NULL。" },
          quiz:{
            type:"predict",
            q:"某组有 5 行，其中 score 2 行为 NULL。COUNT(score) 返回？",
            opts:["3","5","2","0"],
            answer:0,
            explain:"COUNT(列) 只统计该列非 NULL 的行，5 - 2 = 3。"
          }
        },
        {
          id:"where-having", title:"WHERE vs HAVING 的坑", mins:2,
          knowledge:[
            {head:"WHERE", body:"在分组之前过滤行，不能使用聚合结果。"},
            {head:"HAVING", body:"在分组之后过滤组，能使用聚合结果（如 HAVING COUNT(*) > 1）。"},
            {head:"踩坑", body:"对聚合结果做过滤却写成 WHERE，会报错或语义错误；对普通行过滤却写成 HAVING，性能差且逻辑错。"}
          ],
          example:{ title:"先 WHERE 后 HAVING", code:"SELECT city, COUNT(*) AS cnt\nFROM orders\nWHERE amount > 0        -- 先筛行\nGROUP BY city\nHAVING COUNT(*) >= 3;   -- 后筛组", note:"顺序：FROM→WHERE→GROUP BY→HAVING→SELECT。" },
          quiz:{
            type:"single",
            q:"要『只显示订单数大于 5 的城市』，应当用？",
            opts:["HAVING COUNT(*) > 5","WHERE COUNT(*) > 5","WHERE orders > 5","GROUP BY 里写 >5"],
            answer:0,
            explain:"这是对分组后的聚合结果过滤，必须用 HAVING；WHERE 不能引用聚合。"
          }
        }
      ]
    },
    {
      id:"t-cond", name:"条件与空值", lessons:[
        {
          id:"case-when", title:"CASE WHEN 打标签", mins:2,
          knowledge:[
            {head:"是什么", body:"CASE WHEN 按条件给每行打分类/标签，相当于 SQL 里的 if-else。"},
            {head:"何时用", body:"做价值分层（高/中/低）、把数值转成可读业务标签，配合聚合做透视图。"},
            {head:"易错点", body:"条件按顺序匹配，先命中的生效；要加 ELSE 兜底避免 NULL 标签。"}
          ],
          example:{ title:"订单金额分层", code:"SELECT order_id,\n  CASE\n    WHEN amount >= 1000 THEN '高'\n    WHEN amount >= 100  THEN '中'\n    ELSE '低'\n  END AS tier\nFROM orders;", note:"区间要排好序，从大到小判断。" },
          quiz:{
            type:"predict",
            q:"amount=250 的行，上面 CASE 结果是什么？（>=1000 / >=100 / 否则）",
            opts:["中","高","低","NULL"],
            answer:0,
            explain:"250 不满足 >=1000，满足 >=100，命中第二个分支，结果为『中』。"
          }
        },
        {
          id:"null-pitfall", title:"NULL 的坑：别用 = 判断", mins:2,
          knowledge:[
            {head:"是什么", body:"NULL 表示『未知』，不是 0 也不是空字符串。和 NULL 比较要用 IS NULL / IS NOT NULL，而不是 = NULL。"},
            {head:"何时用", body:"判断列是否为空值；过滤缺失数据。"},
            {head:"易错点", body:"WHERE col = NULL 永远不匹配任何行；SUM/COUNT 对 NULL 有不同处理，JOIN 关联键为 NULL 也不会匹配。"}
          ],
          example:{ title:"正确与错误写法", code:"-- 错误：永不返回结果\nSELECT * FROM users WHERE phone = NULL;\n\n-- 正确\nSELECT * FROM users WHERE phone IS NULL;\nSELECT * FROM users WHERE phone IS NOT NULL;", note:"NULL 参与运算结果多为 NULL，判断必须用 IS。 " },
          quiz:{
            type:"single",
            q:"想筛出『没有填写手机号』的用户，应写？",
            opts:["WHERE phone IS NULL","WHERE phone = NULL","WHERE phone = '' AND phone IS NULL","WHERE phone <> NULL"],
            answer:0,
            explain:"空值是 NULL（而非空串时）必须用 IS NULL 判断。"
          }
        }
      ]
    },
    {
      id:"t-limit-date", name:"取数与日期", lessons:[
        {
          id:"limit-top", title:"LIMIT 取 TopN / 分页", mins:2,
          knowledge:[
            {head:"是什么", body:"LIMIT 限制返回行数；常与 ORDER BY 搭配取 TopN 或实现分页。"},
            {head:"何时用", body:"取销售前 10 商品、分页加载列表。分页用 LIMIT offset, size。"},
            {head:"易错点", body:"不写 ORDER BY 时 LIMIT 结果不保证稳定；注意 LIMIT 语法在 MySQL 是 LIMIT offset,count。"}
          ],
          example:{ title:"销售额 Top 5 用户", code:"SELECT user_id, SUM(amount) AS total\nFROM orders\nGROUP BY user_id\nORDER BY total DESC\nLIMIT 5;", note:"先排序再截断，才能拿到真正前几名。" },
          quiz:{
            type:"predict",
            q:"LIMIT 2, 3 表示从第几行开始取几行？",
            opts:["跳过 2 行，取 3 行","取前 2 行","第 2 行到第 3 行","取 5 行"],
            answer:0,
            explain:"MySQL 的 LIMIT offset,count：跳过前 2 行，再返回 3 行。"
          }
        },
        {
          id:"date-func", title:"日期函数：按月统计", mins:2,
          knowledge:[
            {head:"是什么", body:"MySQL 常用 MONTH(列)、YEAR(列)、DATE_FORMAT(列,'%Y-%m') 提取日期分段用于聚合。"},
            {head:"何时用", body:"按年/月/日统计趋势；月度 GMV、日活这类时间维度分析。"},
            {head:"易错点", body:"直接用整列日期 GROUP BY 会使分组过细；应先 DATE_FORMAT 归一化到需要的粒度。"}
          ],
          example:{ title:"按月份统计 GMV", code:"SELECT DATE_FORMAT(order_date,'%Y-%m') AS month,\n       SUM(amount) AS gmv\nFROM orders\nGROUP BY DATE_FORMAT(order_date,'%Y-%m')\nORDER BY month;", note:"用 DATE_FORMAT 把日期归一化到月再分组。" },
          quiz:{
            type:"sqlfill",
            q:"补全：按月份汇总订单总额。",
            code:"SELECT {0} AS month,\n       SUM(amount) AS gmv\nFROM orders\nGROUP BY {1};",
            fillOpts:["DATE_FORMAT(order_date,'%Y-%m')","MONTH(order_date)","YEAR(order_date)","DAY(order_date)"],
            answer:["DATE_FORMAT(order_date,'%Y-%m')","DATE_FORMAT(order_date,'%Y-%m')"],
            explain:"SELECT 与 GROUP BY 中都要用同一归一化表达式，按月分组才正确。MONTH() 只返回月份数字，无法区分年份。"
          }
        }
      ]
    }
  ]
},

/* ============ Python ============ */
{
  id:"python", name:"Python 数据分析", level:"basic", desc:"PyMySQL / Numpy / Pandas / Matplotlib 基础", color:"#27D2BF",
  topics:[
    {
      id:"t-mysql", name:"连接 MySQL 取数", lessons:[
        {
          id:"py-mysql", title:"用 PyMySQL 读取查询", mins:2,
          knowledge:[
            {head:"是什么", body:"pymysql 是 Python 连接 MySQL 的驱动；先连接、再执行 SQL、最后把结果读成列表/DataFrame。"},
            {head:"何时用", body:"把业务 SQL 查出的明细数据拉进 Python 做进一步清洗与分析。"},
            {head:"易错点", body:"用完要关闭连接；查询结果默认是元组，转成 DataFrame 需给列名。"}
          ],
          example:{ title:"连接并读取订单表", code:"import pymysql, pandas as pd\nconn = pymysql.connect(host='localhost',user='root',password='***',db='shop')\ndf = pd.read_sql('SELECT * FROM orders;', conn)\nconn.close()\nprint(df.head())", note:"read_sql 直接把结果变成 DataFrame，pd 的下一步清洗就开始了。" },
          quiz:{
            type:"single",
            q:"读取查询结果成表格，最适合用？",
            opts:["pd.read_sql(sql, conn)","print(conn)","pymysql.connect().close()","SELECT 后直接 df()"],
            answer:0,
            explain:"pd.read_sql 把 SQL 结果读成 DataFrame，正是 Python 分析流程的常见入口。"
          }
        }
      ]
    },
    {
      id:"t-numpy", name:"Numpy 数组基础", lessons:[
        {
          id:"py-numpy", title:"创建数组与批量运算", mins:2,
          knowledge:[
            {head:"是什么", body:"numpy 提供 ndarray 数组，可对整个数组做批量数学运算，性能远快于 Python 循环。"},
            {head:"何时用", body:"对数值做向量化计算、矩阵运算、随机数生成等。"},
            {head:"易错点", body:"数组运算要类型一致；一维向量与二维矩阵形状要对齐，否则广播报错。"}
          ],
          example:{ title:"元素级乘法", code:"import numpy as np\na = np.array([100, 200, 300])\nb = a * 1.1        # 每个元素乘 1.1\nprint(b)  # [110. 220. 330.]", note:"无需 for 循环，整组计算。" },
          quiz:{
            type:"predict",
            q:"np.array([1,2,3]) + np.array([10,20,30]) 的结果是？",
            opts:["[11,22,33]","[1,10,2,20,3,30]","[10,40,90]","[10,22,36]"],
            answer:0,
            explain:"同形状数组逐元素相加，得 [11,22,33]。"
          }
        }
      ]
    },
    {
      id:"t-pandas", name:"Pandas 数据处理", lessons:[
        {
          id:"py-pandas-read", title:"读表、筛选与排序", mins:2,
          knowledge:[
            {head:"是什么", body:"Pandas 的 DataFrame 是带索引的二维表格，loc/条件过滤可精准筛行选列。"},
            {head:"何时用", body:"读入数据后做维度筛选、排序、透视与聚合。"},
            {head:"易错点", body:"用布尔条件筛行要加 df[] 或 .loc[]；多条件用 & | 并加括号。"}
          ],
          example:{ title:"筛出金额≥100 的订单", code:"import pandas as pd\ndf = pd.DataFrame({\n  'order_id':[1,2,3], 'amount':[50,200,90]})\nbig = df[df['amount'] >= 100]\nbig = big.sort_values('amount', ascending=False)\nprint(big)", note:"df[条件] 选行；sort_values 排序。" },
          quiz:{
            type:"predict",
            q:"df 有 amount=[50,200,90]，df[df['amount']>=100] 剩几行？",
            opts:["1 行","2 行","3 行","0 行"],
            answer:1,
            explain:"只有 200 满足 >=100，保留 1 行。"
          }
        },
        {
          id:"py-pandas-clean", title:"清洗：缺失值与去重", mins:2,
          knowledge:[
            {head:"是什么", body:"dropna 删除缺失行、fillna 填充缺失、drop_duplicates 去重，是数据校验清洗的常用步骤。"},
            {head:"何时用", body:"数据里有空值、重复记录时，先清洗再统计，避免口径偏差。"},
            {head:"易错点", body:"删除前确认缺失比例；直接 dropna 可能整片变小，应评估后再决定填充还是删除。"}
          ],
          example:{ title:"去重并按用户补齐缺失", code:"df = df.drop_duplicates(subset=['order_id'])  # 去重\nclean = df.fillna({'channel':'未知'})         # 补空值\nprint(clean.isnull().sum())                    # 校验剩余缺失", note:"subset 指定按哪列去重；fillna 用字典按列填。" },
          quiz:{
            type:"single",
            q:"想按 order_id 去掉重复订单，用？",
            opts:["df.drop_duplicates(subset=['order_id'])","df.dropna()","df.groupby('order_id')","df['order_id'].unique()"],
            answer:0,
            explain:"drop_duplicates(subset=[...]) 指定按 order_id 去重。"
          }
        }
      ]
    },
    {
      id:"t-matplotlib", name:"Matplotlib 可视化", lessons:[
        {
          id:"py-plt-basic", title:"折线与柱状图基础", mins:2,
          knowledge:[
            {head:"是什么", body:"matplotlib 用 plot 画折线、bar 画柱状、barh 画横向条形，是分析结论的直观载体。"},
            {head:"何时用", body:"观察趋势（折线）、对比组间大小（柱状）时使用。"},
            {head:"易错点", body:"中文需设置字体，否则显示方块；记得 show() 或 savefig() 查看结果。"}
          ],
          example:{ title:"画每月订单量柱状图", code:"import matplotlib.pyplot as plt\nmonths=['1月','2月','3月']; cnt=[120,180,150]\nplt.rcParams['font.sans-serif']=['Noto Sans CJK SC']\nplt.bar(months, cnt)\nplt.title('月度订单量')\nplt.show()", note:"bar 画柱状；趋势观察用 plot 折线更顺。" },
          quiz:{
            type:"single",
            q:"要看『连续几个月的上升趋势』，最适合的图是？",
            opts:["折线图 plot","饼图","箱线图","热力图"],
            answer:0,
            explain:"折线图最能表达时间序列的趋势走向。"
          }
        }
      ]
    }
  ]
},

/* ============ PowerBI ============ */
{
  id:"pbi", name:"PowerBI 可视化", level:"seed", desc:"可视化基础，结构已建、内容逐步补充", color:"#F0A23C",
  topics:[
    {
      id:"t-pbi-viz", name:"可视化基础", lessons:[
        {
          id:"pbi-basic", title:"图表选型先看目的", mins:2,
          knowledge:[
            {head:"原则", body:"对比用柱状、趋势用折线、结构用堆叠/占比图。先问『想让观众看到什么』再选图，避免花哨。"}
          ],
          example:{ title:"选图表速记", code:"对比大小 → 柱状\n时间趋势 → 折线\n部分占整体 → 占比/堆叠\n分布 → 直方图/箱线", note:"一张图只讲一件事。" },
          quiz:{
            type:"single",
            q:"想呈现各品类销售额占比，优先选？",
            opts:["占比/堆叠图","散点图","箱线图","折线图"],
            answer:0,
            explain:"占比关系用占比/堆叠图最直观。"
          }
        }
      ]
    }
  ]
},

/* ============ 业务能力 ============ */
{
  id:"biz", name:"业务能力", level:"seed", desc:"指标口径 / 需求拆解 / 结论写作，基础起步", color:"#E8463A",
  topics:[
    {
      id:"t-metric", name:"指标口径", lessons:[
        {
          id:"biz-metric", title:"先定口径再算数", mins:2,
          knowledge:[
            {head:"是什么", body:"『口径』指一个指标怎么定义：计算范围、时间粒度、去重规则。口径不同，同一数字可以由不同答案。"},
            {head:"何时用", body:"计算任何指标前先对齐口径；汇报和核对时口径一致才可比。"},
            {head:"案例", body:"GMV 含不含退款？「订单数」按订单行算还是订单号去重？都要先说清。"}
          ],
          example:{ title:"解读一个指标", code:"指标：付费转化率\n分子：完成支付的用户数\n分母：累计访问过的独立用户数\n口径：按自然日、去重用户、仅首次支付计入", note:"把分子分母和过滤/去重规则写清楚，就定义了它的口径。" },
          quiz:{
            type:"open",
            q:"请用一句话说明『订单数』这个指标的口径（含哪些范围、是否去重）。",
            refPoints:["明确时间范围（如按日/月）","明确对象（如含/不含取消订单）","明确去重规则（按订单号去重）"],
            explain:"口径清楚，数字才有可比性。对照参考要点自查即可。"
          }
        }
      ]
    }
  ]
}
];

/* ============ 业务场景闯关 ============ */
window.SCENARIOS = [
  {
    id:"sc-order", name:"订单分析", desc:"串联 JOIN、GROUP BY、口径与结论，复盘月度订单表现",
    requireLessons:["join-left","groupby-agg","case-when","date-func"],
    steps:[
      { type:"single", q:"要算月度 GMV，应该按什么粒度分组？", opts:["按 DATE_FORMAT(order_date,'%Y-%m') 按月分组","按 order_id 一行一组不聚合","按 user_id 分组合计","按小时分组"], answer:0, explain:"GMV 是时间维度聚合，先按月归一化再 SUM(amount)。" },
      { type:"predict", q:"用 LEFT JOIN 关联用户表后，订单行数应？", opts:["保持订单原行数","只留匹配用户","翻倍","减半"], answer:0, explain:"LEFT JOIN 保留左表全部订单行，关联不到用户则为 NULL。" },
      { type:"single", q:"口径：GMV 通常是否包含已取消订单？", opts:["不应包含，口径需先定义","一定包含","无影响随便算","只用 ORDER BY 无关"], answer:0, explain:"先定口径（如剔除取消），再算数才有可比性。" },
      { type:"open", q:"一句话总结：本月订单为何下降？", refPoints:["给出主要归因维度（地区/品类/渠道）","佐以数据","建议下一步动作"], explain:"用 SQL/python 算出对比，再写一句有数据支撑的结论。" }
    ]
  },
  {
    id:"sc-user", name:"用户/复购分析", desc:"用 JOIN + 分组判断哪些用户重复购买",
    requireLessons:["self-join","groupby-agg","py-pandas-read"],
    steps:[
      { type:"predict", q:"订单按 user_id 分组，某用户有 3 单，COUNT(*) 作为购买次数返回？", opts:["3","1","0","未定义"], answer:0, explain:"COUNT(*) 数该组行数即购买次数。" },
      { type:"single", q:"判断『首单时间』需要哪个函数来取每用户最早订单？", opts:["MIN(order_date)","MAX(order_date)","COUNT(order_date)","SUM(order_date)"], answer:0, explain:"每用户最早订单用 MIN 聚合。" },
      { type:"open", q:"一句话：复购率高说明什么？", refPoints:["用户粘性/留存","可能受促销影响","建议配合留存曲线看"], explain:"复购率要结合时间窗和新老客一起看。" }
    ]
  },
  {
    id:"sc-product", name:"商品/大促分析", desc:"找出大促期间贡献高、要重点备货的商品",
    requireLessons:["case-when","limit-top","date-func","py-plt-basic"],
    steps:[
      { type:"sqlfill", q:"补全：按商品统计大促期间销量 Top10。", code:"SELECT product_id, COUNT(*) AS cnt\nFROM orders\nWHERE {0}\nGROUP BY product_id\nORDER BY cnt DESC\n{1};",
        fillOpts:["order_date BETWEEN '2026-11-01' AND '2026-11-11'","LIMIT 10","SUM(amount)","HAVING COUNT(*)>1"],
        answer:["order_date BETWEEN '2026-11-01' AND '2026-11-11'","LIMIT 10"], explain:"先 WHERE 锁大促时间窗，再分组计数，ORDER BY 后 LIMIT 取 Top10。" },
      { type:"single", q:"大促期「销量」该按哪列统计更合理？", opts:["COUNT(*)（订单行数/件数，看口径）","COUNT(DISTINCT product_id)","MAX(amount)","不聚合"], answer:0, explain:"销量通常按件数口径（COUNT）统计，前提是先说清含不含退货。" },
      { type:"open", q:"一句话：哪类商品最该加库存？", refPoints:["结合销量与前年对比","参考缺货/缺货风险","说明口径"], explain:"经营判断要兼顾销量趋势与缺货风险。", isPredefined:true }
    ]
  }
];
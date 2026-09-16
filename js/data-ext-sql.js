/* data-ext-sql.js — SQL 进阶模块（level:advanced），通过 window.COURSE_EXT 注入 COURSES */
window.COURSE_EXT=(window.COURSE_EXT||[]).concat([
{
  id:"sqladv", name:"SQL 进阶", level:"advanced",
  desc:"窗口函数 / CTE 拆分复杂查询 / JOIN 去重 / 行转列与环比 / 索引与执行计划 / 真实业务 SQL 实战",
  color:"#0B6E4F",
  topics:[
    /* ============ 专题① 窗口函数 ============ */
    {
      id:"sqa-t-win", name:"窗口函数：分组排名与累计", lessons:[
        {
          id:"sqa-win-rownum", title:"ROW_NUMBER 分组排名取 Top", mins:2,
          knowledge:[
            {head:"是什么", body:"ROW_NUMBER() OVER(PARTITION BY 分组 ORDER BY 排序键) 在每组内按排序生成从 1 开始、唯一且连续的序号。"},
            {head:"何时用", body:"取每组第 1 名/前 N 名，例如每个用户最近一笔订单、每个商品分类销量 Top1，或给明细记录人工编号。"},
            {head:"易错点", body:"忘记 PARTITION BY 会在全表排名；ORDER BY 方向决定谁是第 1；ROW_NUMBER 永不并列（相同值也会分别编号）。"}
          ],
          example:{ title:"给每个用户最近一笔订单编号，再取第 1 笔", code:`SELECT user_id, order_id, amount, order_date,
       ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY order_date DESC) AS rn
FROM orders;`, note:"外层包一层取 rn=1 即可得到每个用户的最新一笔订单。" },
          questions:[
            { type:"single", q:"要给『每个用户』的订单分别排名、让最新一笔排第 1，正确的窗口写法是？",
              opts:["ROW_NUMBER() OVER(PARTITION BY user_id ORDER BY order_date DESC)","ROW_NUMBER() OVER(ORDER BY user_id DESC)","ROW_NUMBER() OVER(PARTITION BY order_date ORDER BY user_id)","ROW_NUMBER() OVER(ORDER BY order_date ASC)"],
              answer:0, explain:"PARTITION BY user_id 把每个用户分成独立组，ORDER BY order_date DESC 让最新订单排第一，ROW_NUMBER 从 1 编号。" },
            { type:"predict", q:"某个用户有 3 笔订单，用 PARTITION BY user_id ORDER BY order_date ASC 排名，该用户 rn 的最大值是多少？",
              opts:["3","6","1","2"], answer:0, explain:"每组独立从 1 开始编号，该用户组内 3 行，rn 依次为 1、2、3。" },
            { type:"single", q:"关于 ROW_NUMBER() 生成的序号，下列描述正确的是？",
              opts:["值连续、唯一，即使金额相同也不会并列","相同金额会并列成同一名次","序号从 0 开始","结果顺序不受 ORDER BY 控制"],
              answer:0, explain:"ROW_NUMBER 保证唯一连续编号；需要并列名次时改用 RANK / DENSE_RANK。" }
          ]
        },
        {
          id:"sqa-win-rank", title:"RANK 与 DENSE_RANK 处理并列", mins:2,
          knowledge:[
            {head:"区别", body:"RANK 并列名次相同但会跳号（如 1,2,2,4）；DENSE_RANK 名次连续不跳号（如 1,2,2,3）。"},
            {head:"何时用", body:"『并列都算同一名次』的需求，例如销售额并列第一都发同档奖励用 RANK；需要名次连贯展示用 DENSE_RANK。"},
            {head:"易错点", body:"三者并列行为：ROW_NUMBER 唯一连续 / RANK 并列跳号 / DENSE_RANK 并列连续，做题先看是否允许并列。"}
          ],
          example:{ title:"同一组统计用三种排名对比", code:`SELECT user_id, SUM(amount) AS gmv,
       RANK()       OVER (ORDER BY SUM(amount) DESC) AS rk,
       DENSE_RANK() OVER (ORDER BY SUM(amount) DESC) AS drk,
       ROW_NUMBER() OVER (ORDER BY SUM(amount) DESC) AS rn
FROM orders GROUP BY user_id;`, note:"有相同 gmv 时三者结果不同，肉眼可见差距。" },
          questions:[
            { type:"predict", q:"三名用户 GMV 分别为 300 / 200 / 200，按 GMV 降序 RANK() 得到的名次是？",
              opts:["1, 2, 2","1, 2, 3","1, 1, 2","2, 2, 3"], answer:0, explain:"RANK 让并列的 200 同为第 2 名，下一名若有会跳到第 3。" },
            { type:"single", q:"希望『并列第 2 也记作第 2，且后面的名次不跳号』（如 1,2,2,3），应使用？",
              opts:["DENSE_RANK","RANK","ROW_NUMBER","SUM() OVER()"], answer:0, explain:"DENSE_RANK 名次连续不跳号，正符合要求。" },
            { type:"single", q:"RANK() 输出 1,2,2,4 说明什么？",
              opts:["有并列名次并产生跳号","没有任何并列","漏掉了第 3 名以外的人","窗口写反了"],
              answer:0, explain:"名次 2 出现两次是并列，下一名跳到 4，这是 RANK 的典型特征。" }
          ]
        },
        {
          id:"sqa-win-sumover", title:"SUM() OVER 累计与滚动", mins:2,
          knowledge:[
            {head:"是什么", body:"SUM(amount) OVER(PARTITION BY user_id ORDER BY order_date) 得到逐行累计值；加 ROWS BETWEEN ... PRECEDING AND CURRENT ROW 控制成滚动窗口。"},
            {head:"何时用", body:"月度累计 GMV、每日累计下单额、最近 N 笔/近 N 天的滚动销售、留存累计人数。"},
            {head:"易错点", body:"窗口里不写 ORDER BY 时默认对整组求和；滚动窗口的边界（如 29 PRECEDING）才是『近 30 天』的关键。"}
          ],
          example:{ title:"每日累计 GMV 与近 3 天滚动 GMV", code:`SELECT order_date, amount,
       SUM(amount) OVER (ORDER BY order_date) AS cum,
       SUM(amount) OVER (ORDER BY order_date
            ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS roll3
FROM daily_gmv;`, note:"cum 单调递增；roll3 只统计当天及前 2 天。" },
          questions:[
            { type:"predict", q:"某用户按日期升序的三笔订单金额为 100 / 200 / 300，SUM(amount) OVER(ORDER BY order_date) 第三行累计值是多少？",
              opts:["600","300","100","200"], answer:0, explain:"累加到第三行即 100+200+300=600。" },
            { type:"single", q:"要计算『最近 30 天滚动销售额』，正确的窗口边界是？",
              opts:["ROWS BETWEEN 29 PRECEDING AND CURRENT ROW","ROWS BETWEEN 30 FOLLOWING AND CURRENT ROW","ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW","不加边界直接全部累计"],
              answer:0, explain:"含当天往前 29 行共 30 天，正好构成近 30 天滚动。" },
            { type:"sqlfill", q:"补全：累计『每个用户』截至当前订单的金额。",
              code:`SELECT user_id, order_id, amount,
       SUM(amount) OVER({0} ORDER BY order_date) AS cum
FROM orders;`,
              fillOpts:["PARTITION BY user_id","ORDER BY order_date","PARTITION BY order_date","GROUP BY user_id"],
              answer:["PARTITION BY user_id"], explain:"PARTITION BY user_id 让累计在单个用户内进行，再按 order_date 逐行累计。" }
          ]
        }
      ]
    },
    /* ============ 专题② CTE / 子查询 ============ */
    {
      id:"sqa-t-cte", name:"CTE / 子查询拆分复杂查询", lessons:[
        {
          id:"sqa-cte-basic", title:"WITH 定义临时结果", mins:2,
          knowledge:[
            {head:"是什么", body:"WITH cte AS (子查询) SELECT ... 把一段中间查询命名为 cte，主查询直接引用，替代层层嵌套的子查询。"},
            {head:"何时用", body:"先算『用户 GMV』、『每类 Top』这类中间表，再和主表/另一张中间表 JOIN，让 SQL 像步骤一样清晰。"},
            {head:"易错点", body:"CTE 名称要唯一；CTE 主要提升可读性并非性能银弹；别把外层过滤条件塞进不相关的 CTE。"}
          ],
          example:{ title:"先用 CTE 算用户 GMV 再关联用户名", code:`WITH user_gmv AS (
  SELECT user_id, SUM(amount) AS gmv
  FROM orders GROUP BY user_id
)
SELECT u.user_name, ug.gmv
FROM users u
JOIN user_gmv ug ON u.id = ug.user_id
ORDER BY ug.gmv DESC;`, note:"中间结果 user_gmv 被复用，不用再抄一遍 GROUP BY。" },
          questions:[
            { type:"single", q:"CTE 的主要作用是什么？",
              opts:["把中间查询命名并复用，提升可读性","强制让查询变快","替代全部聚合函数","只能用于 SELECT 不能用于 JOIN"],
              answer:0, explain:"CTE 核心是把复杂中间结果命名可复用，读起来像步骤，它本身不保证性能提升。" },
            { type:"sqlfill", q:"补全：用 WITH 定义『总金额大于 100 的用户』。",
              code:`WITH big_users AS (
  SELECT user_id, SUM(amount) AS gmv
  FROM orders
  GROUP BY user_id
  {0}
)
SELECT * FROM big_users;`,
              fillOpts:["HAVING SUM(amount) > 100","WHERE SUM(amount) > 100","ORDER BY gmv DESC","LIMIT 10"],
              answer:["HAVING SUM(amount) > 100"], explain:"对聚合结果 SUM(amount) 过滤要用 HAVING 而非 WHERE。" },
            { type:"open", q:"请举一个适合拆成 CTE 的业务查询例子，并说明拆开后哪里变清晰了。",
              refPoints:["先定义好中间结果（如用户 GMV / 每类 Top）","说明主查询如何引用该中间结果","说明拆分降低了嵌套复杂度或便于复用"],
              explain:"能写出『先算什么中间表、再怎样关联』即可，重点在思路清晰。" }
          ]
        },
        {
          id:"sqa-cte-vs-sub", title:"子查询与 CTE 的选择", mins:2,
          knowledge:[
            {head:"区别", body:"子查询内联在 FROM / WHERE / SELECT 里，只出现一次；CTE 定义在顶部，可在同一查询内多次引用。"},
            {head:"何时用", body:"中间结果只用一次可用子查询；被引用多次、或长语句易读性差时推荐用 CTE。"},
            {head:"易错点", body:"相关子查询对每行执行一次代价高；别名不一致会导致列歧义；标量子查询别画蛇添足。"}
          ],
          example:{ title:"两种实现同一需求", code:`-- 用 CTE
WITH g AS (SELECT product_id, COUNT(*) c FROM orders GROUP BY product_id)
SELECT p.name FROM product p JOIN g ON p.id = g.product_id WHERE g.c > 10;

-- 用子查询
SELECT p.name FROM product p
JOIN (SELECT product_id, COUNT(*) c FROM orders GROUP BY product_id) g
  ON p.id = g.product_id WHERE g.c > 10;`, note:"功能等价，CTE 定义在顶部更直白；写进 JOIN 的子查询也行。" },
          questions:[
            { type:"single", q:"同一段中间结果要在查询里被引用两次以上，更推荐？",
              opts:["定义成 CTE 复用","每处都重写一遍子查询","塞进 WHERE 里","拆成不同错误语句"],
              answer:0, explain:"重复引用时一处定义多次使用的 CTE 更简洁，也更好维护。" },
            { type:"single", q:"相比把子查询内联在各处，CTE 的阅读优势主要在？",
              opts:["把中间步骤放顶部集中命名，逻辑像步骤更清晰","CTE 一定更快","CTE 不需要聚合","CTE 会避免 JOIN"],
              answer:0, explain:"CTE 把中间步骤集中展示、按名复用，长 SQL 易读性更好（性能未必有差异）。" }
          ]
        },
        {
          id:"sqa-cte-multi", title:"多层 CTE 组合", mins:2,
          knowledge:[
            {head:"是什么", body:"WITH a AS(...), b AS(...) 多个 CTE 用逗号分隔，后面的 CTE 可以引用前面的。"},
            {head:"何时用", body:"先算订单汇总，再对汇总做排名/阈值过滤，像流水线一样一层层递进。"},
            {head:"易错点", body:"后定义的 CTE 不能反向引用后面的；名称别与表名冲突；列名最好显式补齐避免歧义。"}
          ],
          example:{ title:"先分组算 GMV，再筛 GMV 前 5", code:`WITH user_gmv AS (
  SELECT user_id, SUM(amount) AS gmv FROM orders GROUP BY user_id
),
top5 AS (
  SELECT user_id, gmv FROM user_gmv
  ORDER BY gmv DESC LIMIT 5
)
SELECT * FROM top5;`, note:"top5 复用了 user_gmv，串成两段逻辑。" },
          questions:[
            { type:"single", q:"定义多个 CTE 时应如何书写？",
              opts:["用逗号分隔，后定义的可引用前面定义的","用分号分隔各自独立","不能定义多个","用 AND 连接"],
              answer:0, explain:"WITH a AS(...), b AS(...) 逗号分隔，b 可引用 a。" },
            { type:"sqlfill", q:"补全：基于 CTE user_gmv 继续定义取 GMV 前 3 的 top3。",
              code:`WITH user_gmv AS (
  SELECT user_id, SUM(amount) AS gmv FROM orders GROUP BY user_id
),
top3 AS (
  SELECT user_id, gmv FROM user_gmv
  {0}
)
SELECT * FROM top3;`,
              fillOpts:["ORDER BY gmv DESC LIMIT 3","GROUP BY user_id","WHERE gmv > 0","ORDER BY user_id LIMIT 3"],
              answer:["ORDER BY gmv DESC LIMIT 3"], explain:"在已算好的 user_gmv 上按 gmv 降序取前 3。" }
          ]
        }
      ]
    },
    /* ============ 专题③ 多对多 LEFT JOIN ============ */
    {
      id:"sqa-t-join", name:"多对多 LEFT JOIN：放大陷阱与去重", lessons:[
        {
          id:"sqa-join-multiply", title:"LEFT JOIN 行数放大陷阱", mins:2,
          knowledge:[
            {head:"是什么", body:"当右表关联键不唯一（一对多/多对多）时，一主一行会匹配多行，导致结果行数暴涨、聚合翻倍。"},
            {head:"何时用", body:"订单 JOIN 订单明细、用户 JOIN 多个标签表时尤其要注意，先确认关联键是否唯一。"},
            {head:"易错点", body:"JOIN 前先比较 COUNT(关联键) 与 COUNT(DISTINCT 关联键) 验证唯一性；否则 SUM(amount) 会把金额重算多次。"}
          ],
          example:{ title:"用户-标签是 1 对多时行数被放大", code:`SELECT COUNT(*) FROM orders o
LEFT JOIN user_tag t ON o.user_id = t.user_id;
-- 若每个用户有 3 个标签，结果行数 ≈ 原订单数 × 3`, note:"行数膨胀后，后续 COUNT/SUM 统计全部失真。" },
          questions:[
            { type:"predict", q:"orders 有 10 条，用户标签表中每个用户平均有 2 条记录，直接 LEFT JOIN 该标签表后行数大致变为？",
              opts:["约 20 条（被放大）","还是 10 条","变得比 10 少","0 条"],
              answer:0, explain:"左表每行匹配右表多行，10×2≈20，行数被放大。" },
            { type:"single", q:"JOIN 前如何确认关联键是否会放大行数？",
              opts:["比较右表该键 COUNT 与 COUNT(DISTINCT) 是否相等","直接看列名","在 SELECT 里加 ORDER BY","什么都不用做"],
              answer:0, explain:"总数大于去重数说明该键不唯一，JOIN 就会放大。" },
            { type:"open", q:"举一个业务里可能发生 JOIN 放大行数的例子，并说说你怎么避免。",
              refPoints:["给出主表 + 容易多行的关联表","说明先验唯一性（去重数比较）","指出防止聚合重算的解决办法"],
              explain:"重点是事前验证关联键唯一性，或用聚合后的中间表再 JOIN。" }
          ]
        },
        {
          id:"sqa-join-dedup", title:"JOIN 前去重", mins:2,
          knowledge:[
            {head:"做法", body:"先在子查询 / CTE 里对右表按关联键去重（如 ROW_NUMBER 取 rn=1），再 JOIN，避免行数放大。"},
            {head:"何时用", body:"右表多行但只需其中一条信息（如该用户首单时间）时，先取每用户一行最稳。"},
            {head:"易错点", body:"直接在左表 DISTINCT 会丢信息；应去重『关联表』而不是『结果表』；去重后要校验行数是否复原。"}
          ],
          example:{ title:"先给每个用户取一行首单信息再关联", code:`WITH first_order AS (
  SELECT user_id, order_id, amount FROM (
    SELECT *, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY order_date) rn
    FROM orders
  ) t WHERE rn = 1
)
SELECT u.user_name, fo.amount
FROM users u
LEFT JOIN first_order fo ON u.id = fo.user_id;`, note:"first_order 每用户仅 1 行，JOIN 不再放大。" },
          questions:[
            { type:"single", q:"右表一个用户有多条记录，但只需该用户『首单金额』去关联，稳妥做法是？",
              opts:["先在子查询里 PARTITION BY 取 rn=1、每用户一行","右表全量 join","在左表 DISTINCT","SELECT 里加 MAX(order_date)"],
              answer:0, explain:"先按用户取首单（ROW_NUMBER rn=1）得到每用户一行，再 JOIN 就不会放大。" },
            { type:"sqlfill", q:"补全：用 ROW_NUMBER 给每个用户的首单编号 rn。",
              code:`SELECT user_id, order_id,
       ROW_NUMBER() OVER (PARTITION BY {0} ORDER BY {1}) AS rn
FROM orders;`,
              fillOpts:["user_id","order_id","order_date","amount"],
              answer:["user_id","order_date"], explain:"PARTITION BY user_id 按用户分组，ORDER BY order_date 升序让首单排第一。" }
          ]
        }
      ]
    },
    /* ============ 专题④ 行转列 / 日期窗口与环比 ============ */
    {
      id:"sqa-t-pivot", name:"行转列 / 日期窗口与环比", lessons:[
        {
          id:"sqa-pivot-case", title:"CASE WHEN 行转列", mins:2,
          knowledge:[
            {head:"是什么", body:"把某列的值用 CASE WHEN 转成多列，再配 SUM / COUNT 做成透视图（一维变多列）。"},
            {head:"何时用", body:"按月横向展示 GMV、把渠道/品类展开成并列指标列，报表更友好。"},
            {head:"易错点", body:"每个条件分支都要聚合；加 ELSE 0 兜底，让无数据行显示 0 而不是 NULL。"}
          ],
          example:{ title:"按平台把 GMV 转成列", code:`SELECT user_id,
       SUM(CASE WHEN platform='iOS'     THEN amount ELSE 0 END) AS ios_gmv,
       SUM(CASE WHEN platform='Android' THEN amount ELSE 0 END) AS and_gmv
FROM orders GROUP BY user_id;`, note:"每个平台一列，横向对比清晰。" },
          questions:[
            { type:"single", q:"要把『平台字段』的值转成多列汇总，最常用的写法是？",
              opts:["CASE WHEN 配合 SUM 做条件聚合","GROUP_CONCAT 拼接值","DISTINCT platform","ROW_NUMBER() OVER()"],
              answer:0, explain:"行转列核心是用 CASE WHEN 把每类转成一列再聚合。" },
            { type:"sqlfill", q:"补全：统计 iOS 平台的订单金额，其余记为 0。",
              code:`SELECT user_id,
       SUM(CASE WHEN platform='iOS' THEN {0} ELSE 0 END) AS ios_gmv
FROM orders GROUP BY {1};`,
              fillOpts:["amount","user_id","order_id","platform"],
              answer:["amount","user_id"], explain:"CASE 命中平台则取 amount，否则 0；按 user_id 汇聚成每用户一行。" }
          ]
        },
        {
          id:"sqa-pivot-lag", title:"LAG 计算环比", mins:2,
          knowledge:[
            {head:"是什么", body:"LAG(某列, N) OVER(ORDER BY 时间) 取上一期数值，用它算环比增速 (本期-上期)/上期。"},
            {head:"何时用", body:"月度 GMV 环比、日活较昨日变化、连续 N 天增长判断。"},
            {head:"易错点", body:"第一行没有上一期，LAG 返回 NULL；环比分母为 0 要处理；ORDER BY 决定对比方向。"}
          ],
          example:{ title:"月度 GMV 环比", code:`SELECT month, gmv,
       LAG(gmv) OVER (ORDER BY month) AS prev,
       ROUND((gmv - LAG(gmv) OVER (ORDER BY month))
             / LAG(gmv) OVER (ORDER BY month), 3) AS mom
FROM monthly_gmv;`, note:"第一个月 prev 为 NULL，环比为 NULL。" },
          questions:[
            { type:"single", q:"要拿『上一期的月度 GMV』做环比对比，哪个窗口函数合适？",
              opts:["LAG(gmv, 1) OVER(ORDER BY month)","SUM(gmv) OVER()","ROW_NUMBER() OVER()","MAX(gmv) OVER()"],
              answer:0, explain:"LAG 取前一行（上一期）的数值，正好做环比。" },
            { type:"predict", q:"本月 GMV 120、上月 100，环比增速为？",
              opts:["20%","22%","2%","-20%"], answer:0, explain:"(120-100)/100=0.2 即 20%。" },
            { type:"sqlfill", q:"补全：用 LAG 取出上一期的月度 GMV 并命名为 prev_gmv。",
              code:`SELECT month, gmv,
       {0}(gmv, 1) OVER (ORDER BY {1}) AS prev_gmv
FROM monthly_gmv;`,
              fillOpts:["LAG","month","ROW_NUMBER","SUM","gmv"],
              answer:["LAG","month"], explain:"LAG(gmv,1) 取前一行，按 month 排序保证是相邻上一期。" }
          ]
        },
        {
          id:"sqa-pivot-datewin", title:"日期窗口与时间分组", mins:2,
          knowledge:[
            {head:"是什么", body:"DATE_SUB / DATEDIFF 计算日期差、DATE_FORMAT 归一化时间粒度、BETWEEN 圈定窗口，是时间分析的基础组合。"},
            {head:"何时用", body:"判断近 30 天是否活跃、按周/月分组统计、两段时间间隔计算。"},
            {head:"易错点", body:"GROUP BY 原始日期会使粒度过细，需 DATE_FORMAT 归一化；窗口边界（含不含当天）要按口径定义。"}
          ],
          example:{ title:"近 30 天活跃用户数与当月 GMV", code:`SELECT DATE_FORMAT(order_date,'%Y-%m') AS ym,
       COUNT(DISTINCT user_id) AS active_users,
       SUM(amount) AS gmv
FROM orders
WHERE order_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY DATE_FORMAT(order_date,'%Y-%m');`, note:"WHERE 里圈时间窗口，GROUP BY 里归一化到月。" },
          questions:[
            { type:"single", q:"要统计『近 30 天有多少活跃用户』，时间窗口过滤应写在哪个子句？",
              opts:["WHERE order_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)","HAVING 里","SELECT 里","ORDER BY 里"],
              answer:0, explain:"按行粒度过滤应在 WHERE 里圈定时间窗口。" },
            { type:"sqlfill", q:"补全：按月分组统计订单总额，并规范月份粒度。",
              code:`SELECT DATE_FORMAT(order_date,'%Y-%m') AS ym,
       SUM(amount) AS gmv
FROM orders
GROUP BY {0}
ORDER BY {1};`,
              fillOpts:["DATE_FORMAT(order_date,'%Y-%m')","ym","MONTH(order_date)","order_date"],
              answer:["DATE_FORMAT(order_date,'%Y-%m')","ym"], explain:"GROUP BY 用同一归一化表达式，ORDER BY 可用别名 ym。" }
          ]
        }
      ]
    },
    /* ============ 专题⑤ 索引与执行计划 ============ */
    {
      id:"sqa-t-idx", name:"索引与执行计划", lessons:[
        {
          id:"sqa-idx-basic", title:"索引原理与什么时候加", mins:2,
          knowledge:[
            {head:"是什么", body:"索引是类似目录的结构，让 WHERE/JOIN/ORDER BY 常用列能快速定位，避免全表扫描。"},
            {head:"何时用", body:"高频被过滤的列（user_id、order_date）、JOIN 关联键、ORDER BY/GROUP BY 列适合建索引。"},
            {head:"易错点", body:"索引不是越多越好，会增加写入成本；对索引列做函数运算会失效；选择性低的列（如性别）收益小。"}
          ],
          example:{ title:"给高频查询建索引", code:`CREATE INDEX idx_order_user ON orders(user_id);
CREATE INDEX idx_order_date ON orders(order_date);
SELECT * FROM orders WHERE user_id = 123 AND order_date >= '2026-01-01';`, note:"配合 user_id / 时间列索引，避免全表扫。" },
          questions:[
            { type:"single", q:"下面哪类列最适合建索引？",
              opts:["经常在 WHERE / JOIN / ORDER BY 出现的列","从不被查询的冗余列","值几乎都一样的列","只被读一次的历史归档列"],
              answer:0, explain:"真正被过滤、关联、排序使用的列建索引收益最大。" },
            { type:"single", q:"在 WHERE 里对字段做了函数运算（如 YEAR(order_date)=2026），可能出现什么？",
              opts:["使该列索引失效、退化为全表扫描","肯定更快","自动帮你建好索引","没有任何影响"],
              answer:0, explain:"对索引列套函数常导致索引失效，尽量改写为范围条件（如 BETWEEN）。" },
            { type:"open", q:"什么时候你会给业务表建索引？请给出 2 条判断标准。",
              refPoints:["列被高频过滤/排序/关联","数据量大且重复查询慢","注意索引有写放大成本，并非越多越好"],
              explain:"围绕『高频 + 选择性强』判断，并留意写成本。" }
          ]
        },
        {
          id:"sqa-idx-explain", title:"看懂 EXPLAIN 执行计划", mins:2,
          knowledge:[
            {head:"是什么", body:"在查询前加 EXPLAIN，输出每步如何访问表（全表扫 ALL、索引 range/ref）、预估行数 rows、是否用到索引 key。"},
            {head:"如何看", body:"重点看 type（ALL=全表扫最差，尽量 range/ref/const）、key 是否命中索引、rows 大不大、是否出现 filesort。"},
            {head:"易错点", body:"rows 是估算不是准数；type=ALL 出现在大数据量上是优化信号；filesort 在大型 ORDER BY 时耗资源。"}
          ],
          example:{ title:"查看查询的执行计划", code:`EXPLAIN SELECT * FROM orders WHERE user_id = 100;`, note:"重点看 type / key / rows 三列。" },
          questions:[
            { type:"single", q:"EXPLAIN 结果中 type 列出现哪个通常意味着最差的全表扫描？",
              opts:["ALL","range","ref","const"], answer:0, explain:"type=ALL 即全表扫描，是优化信号。" },
            { type:"single", q:"判断是否命中了索引，应主要看 EXPLAIN 的哪一列？",
              opts:["key（实际用到的索引）","字段别名","返回的列数","表的字符集"],
              answer:0, explain:"key 显示实际用到的索引；能命中索引则查询更高效。" },
            { type:"open", q:"EXPLAIN 里 key 为空、type=ALL 且 rows 很大，你会怎么调整？",
              refPoints:["为 WHERE/JOIN 列补索引","改写条件避免函数包裹索引列","评估是否减少返回列 / 缩小数据范围"],
              explain:"命中索引、避免全表扫描是优化重点。" }
          ]
        }
      ]
    },
    /* ============ 专题⑥ 真实业务练习课 ============ */
    {
      id:"sqa-t-biz", name:"真实业务 SQL 练习课", lessons:[
        {
          id:"sqa-biz-repeat", title:"找出重复购买用户", mins:2,
          knowledge:[
            {head:"是什么", body:"重复购买 = 下单次数 >= 2 的用户，用 GROUP BY user_id + COUNT(*) 再 HAVING 过滤。"},
            {head:"何时用", body:"复购 / 多次购买分析、高价值用户分层。"},
            {head:"易错点", body:"COUNT(*) 是订单行数不是用户数；去重口径（按订单 or 按 SKU）要先定；通常剔除已取消订单。"}
          ],
          example:{ title:"统计每位用户购买次数并筛 >=2", code:`SELECT user_id, COUNT(*) AS buys
FROM orders
WHERE status != 'cancelled'
GROUP BY user_id
HAVING COUNT(*) >= 2;`, note:">=2 即重复购买用户，可再 JOIN users 拿姓名。" },
          questions:[
            { type:"single", q:"要找出购买次数 >= 2 的用户，完成分组统计后应如何过滤？",
              opts:["HAVING COUNT(*) >= 2","WHERE COUNT(*) >= 2","DISTINCT user_id","ORDER BY COUNT(*) DESC LIMIT 2"],
              answer:0, explain:"对分组后的聚合计数过滤必须用 HAVING。" },
            { type:"sqlfill", q:"补全：统计每位用户订单数并只保留 >= 2 的用户。",
              code:`SELECT user_id, COUNT(*) AS buys
FROM orders
WHERE status != 'cancelled'
GROUP BY user_id
{0};`,
              fillOpts:["HAVING COUNT(*) >= 2","ORDER BY user_id","LIMIT 2","WHERE COUNT(*) >= 2"],
              answer:["HAVING COUNT(*) >= 2"], explain:"聚合结果的过滤必须在 HAVING。" }
          ]
        },
        {
          id:"sqa-biz-first", title:"首购用户分析", mins:2,
          knowledge:[
            {head:"是什么", body:"首购 = 每个用户最早一笔订单，用 MIN(order_date) 或 ROW_NUMBER 取首单，再按首购日期分组看新客趋势。"},
            {head:"何时用", body:"新客数随时间走势、首单转化路径、结合留存看首购质量。"},
            {head:"易错点", body:"同一用户多单只计入 1 次首购；用首次下单时间作为新增口径。"}
          ],
          example:{ title:"每天的首购用户数（按首单日期分组）", code:`WITH first_orders AS (
  SELECT user_id, MIN(order_date) AS first_dt
  FROM orders GROUP BY user_id
)
SELECT first_dt, COUNT(DISTINCT user_id) AS first_users
FROM first_orders GROUP BY first_dt;`, note:"每用户只取最早一笔作为首购。" },
          questions:[
            { type:"single", q:"取每个用户的首购时间，正确的聚合是？",
              opts:["MIN(order_date)","MAX(order_date)","COUNT(order_date)","COUNT(DISTINCT user_id)"],
              answer:0, explain:"每用户最早一笔的日期用 MIN(order_date)。" },
            { type:"predict", q:"某用户有 3 笔订单（2026-01-05 / 01-07 / 02-01），其首购时间 MIN(order_date) 为？",
              opts:["2026-01-05","2026-01-07","2026-02-01","01-07 与 01-05 两条"],
              answer:0, explain:"MIN 取最早日期即 2026-01-05。" }
          ]
        },
        {
          id:"sqa-biz-churn", title:"流失用户识别", mins:2,
          knowledge:[
            {head:"是什么", body:"流失通常取『最近一次下单距今超过 N 天』，用 MAX(order_date) 找最后活跃，再与当前日期比较差值。"},
            {head:"何时用", body:"月度流失率、唤醒召回清单、用户生命周期分群。"},
            {head:"易错点", body:"口径要统一（近 30/60/90 天无单）；区分从未下单用户；别把仍活跃的用户误判为流失。"}
          ],
          example:{ title:"最近 90 天未下单的用户（流失候选）", code:`SELECT u.id, u.user_name, MAX(o.order_date) AS last_order
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id
HAVING MAX(o.order_date) < DATE_SUB(CURDATE(), INTERVAL 90 DAY)
       OR MAX(o.order_date) IS NULL;`, note:"无单或最后活跃超 90 天都被筛出。" },
          questions:[
            { type:"single", q:"判断用户『最近一次下单距今超过 90 天』应基于哪一列？",
              opts:["MAX(order_date)","MIN(order_date)","COUNT(order_date)","COUNT(DISTINCT product_id)"],
              answer:0, explain:"最后活跃时间 = MAX(order_date)，再与当前日期比较。" },
            { type:"sqlfill", q:"补全：取每个用户最后下单日期并筛出早于 90 天前的。",
              code:`SELECT user_id, MAX(order_date) AS last_order
FROM orders GROUP BY user_id
HAVING {0} < DATE_SUB(CURDATE(), INTERVAL 90 DAY);`,
              fillOpts:["MAX(order_date)","order_date","MIN(order_date)","user_id"],
              answer:["MAX(order_date)"], explain:"HAVING 对聚合 MAX(order_date) 过滤，找出最后活跃早于 90 天前。" }
          ]
        }
      ]
    }
  ]
}
]);
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
    },
    {
      id:"t-select", name:"SELECT 基础与模式匹配", lessons:[
        {
          id:"sel-where-list", title:"WHERE 过滤：IN 与 BETWEEN", mins:2,
          knowledge:[
            {head:"是什么", body:"WHERE 在取数阶段过滤行；IN 判断是否属于某个列表，BETWEEN 判断是否在某个闭区间（含边界）。"},
            {head:"何时用", body:"只取指定几个国家/城市用 IN；取数值区间（金额、人口、日期范围）用 BETWEEN。"},
            {head:"易错点", body:"字符串要加单引号；BETWEEN 是闭区间，200000 AND 250000 会包含 250000 本身。"}
          ],
          example:{ title:"IN 与 BETWEEN 的写法", code:"SELECT name, population FROM world\nWHERE name IN ('Sweden', 'Norway', 'Denmark');\n\nSELECT name, area FROM world\nWHERE area BETWEEN 200000 AND 250000;", note:"IN 用逗号列值列表；BETWEEN 两端都包含。" },
          questions:[
            { type:"single", q:"WHERE area BETWEEN 200000 AND 250000，area=250000 的国家的会被选中吗？", opts:["会，BETWEEN 含边界","不会，只取严格小于","不确定，取决于排序","会报错"], answer:0, explain:"BETWEEN 是闭区间，两端边界值都包含。" },
            { type:"predict", q:"SELECT name FROM world WHERE name IN ('Sweden','Norway','Denmark')，若三国的名字都在表中，返回几行？", opts:["3 行","1 行","0 行","无限行"], answer:0, explain:"IN 列表里有几个匹配的值就返回几行。" },
            { type:"sqlfill", q:"补全：筛出亚洲且人口超过 1000 万的国家。", code:"SELECT name FROM world\nWHERE continent = '{0}'\n  AND population {1} 10000000;", fillOpts:["'Asia'",">","<",">="], answer:["'Asia'",">"], explain:"continent 用 IN 或 = 指定 'Asia'，人口条件用 > 10000000。" }
          ]
        },
        {
          id:"sel-like", title:"LIKE 模式匹配：% 与 _", mins:2,
          knowledge:[
            {head:"是什么", body:"LIKE 做模糊匹配：% 匹配任意数量字符（含 0 个），_ 精确匹配 1 个字符。"},
            {head:"何时用", body:"按关键词搜索商品名、按规则筛选编码/邮箱（如 %@gmail.com）时使用。"},
            {head:"易错点", body:"% 放哪决定匹配位置：'Y%' 开头、'%y' 结尾、'%x%' 任意位置；用 NOT LIKE 反向排除。"}
          ],
          example:{ title:"LIKE 的几种匹配位置", code:"LIKE 'Y%'    -- 以 Y 开头\nLIKE '%y'    -- 以 y 结尾\nLIKE '%x%'   -- 任意位置含 x\nLIKE 'C%ia'  -- C 开头、ia 结尾\nLIKE '_n%'   -- 第 2 个字符是 n", note:"% 贪婪匹配任意长度，_ 只占一个位置。" },
          questions:[
            { type:"single", q:"LIKE '_n%' 能匹配下面哪个名字？", opts:["Anastasia（第2个字符是 n）","China（第2个字符是 h）","Spain（第2个字符是 p）","France（第2个字符是 r）"], answer:0, explain:"_ 匹配第一个任意字符，n 必须是第 2 个字符。" },
            { type:"predict", q:"name LIKE '%land%' 会匹配下面哪个国家？", opts:["Poland（含 land）","Brazil","China","Japan"], answer:0, explain:"%land% 要求名字任意位置出现 land，Poland 满足。" },
            { type:"sqlfill", q:"补全：找出名字以 'a' 结尾的国家。", code:"SELECT name FROM world\nWHERE name LIKE '{0}';", fillOpts:["'%a'","'a%'","'%a%'","'_a'"], answer:["'%a'"], explain:"%a 表示以 a 结尾，% 在左侧匹配前面的任意内容。" }
          ]
        },
        {
          id:"sel-strings-round", title:"字符串与数值函数：CONCAT / ROUND", mins:2,
          knowledge:[
            {head:"是什么", body:"CONCAT(a,b) 拼接字符串；ROUND(x,d) 四舍五入到 d 位小数；LENGTH(s) 取字符数。"},
            {head:"何时用", body:"报表拼接标签（'GMV:'+金额）、人均值取整、判断名字长度是否相等。"},
            {head:"易错点", body:"ROUND 第二参数为 0 表示取整；LENGTH 在 MySQL 数的是字节数，含中文要多留意（可用 CHAR_LENGTH）。"}
          ],
          example:{ title:"人均 GDP 取整与拼接", code:"SELECT name,\n       ROUND(gdp/population, 0) AS per_capita\nFROM world\nWHERE continent = 'South America';\n\nSELECT CONCAT(name, ':', population) FROM world LIMIT 3;", note:"ROUND 处理数值展示，CONCAT 组装可读文本。" },
          questions:[
            { type:"single", q:"ROUND(gdp/population, 0) 的作用是？", opts:["人均 GDP 四舍五入到整数","人均 GDP 取绝对值","把两列相加","保留 3 位小数"], answer:0, explain:"第二个参数 0 表示保留 0 位小数，即取整。" },
            { type:"predict", q:"gdp=12960000000、population=2831741，ROUND(gdp/population, 0) 大致是？", opts:["4577","12960000000","2831741","0"], answer:0, explain:"12960000000÷2831741≈4577，取整为 4577。" },
            { type:"open", q:"如何用一条查询找出「名字与首都长度相同」的国家？请写出思路。", refPoints:["用 LENGTH(name) = LENGTH(capital) 作为 WHERE 条件","世界表有 name 与 capital 两列","需要 SELECT 出满足长度相等的国家"], explain:"在 WHERE 里比较两列的 LENGTH 是否相等即可。" }
          ]
        }
      ]
    },
    {
      id:"t-subquery", name:"子查询入门", lessons:[
        {
          id:"subq-in-compare", title:"子查询：先算内层再比较", mins:2,
          knowledge:[
            {head:"是什么", body:"子查询是嵌套在另一个查询里的 SELECT。执行顺序：先算内层，再把结果交给外层使用。"},
            {head:"何时用", body:"条件依赖另一个查询结果时使用，如『找出比俄罗斯人口多的国家』：先查出俄罗斯人口，再比较。"},
            {head:"易错点", body:"内层返回多行时，外层要用 IN/ALL/ANY 而不是 >、= 单值比较；返回空集时外层结果为空。"}
          ],
          example:{ title:"比俄罗斯人口多的国家", code:"SELECT name FROM world\nWHERE population >\n  (SELECT population FROM world\n   WHERE name = 'Russia');", note:"内层括号里的查询先执行，返回单个数字给外层比较。" },
          questions:[
            { type:"single", q:"子查询返回多行时，外层 WHERE 应该用哪个操作符？", opts:["IN / ALL / ANY",">","=","BETWEEN"], answer:0, explain:"多行结果只能用 IN、ALL、ANY 这类集合比较，单值比较符会报错。" },
            { type:"predict", q:"内层子查询返回空集合（没有匹配行），外层 WHERE x IN (空集合) 的结果是？", opts:["0 行，条件永不满足","返回全部行","报错","返回 1 行"], answer:0, explain:"没有任何值能属于空集合，外层自然查不到行。" },
            { type:"sqlfill", q:"补全：找出 GDP 比英国高的国家。", code:"SELECT name FROM world\nWHERE gdp >\n  ({0}\n   FROM world\n   WHERE name = 'United Kingdom');", fillOpts:["SELECT gdp","SELECT name","SELECT MAX(gdp)","SELECT COUNT(*)"], answer:["SELECT gdp"], explain:"内层取英国那一行的 gdp 值，外层逐国家比较。" }
          ]
        },
        {
          id:"subq-all-max", title:"ALL/ANY 与每洲最大国家", mins:2,
          knowledge:[
            {head:"是什么", body:"ALL 表示大于集合里的每一个值；ANY 表示大于集合里的任一个。相关子查询里可用外层别名做关联。"},
            {head:"何时用", body:"『比欧洲所有国家都大』用 > ALL；『找每个洲最大的国家』用 MAX + 关联条件。"},
            {head:"易错点", body:"ALL 与 ANY 要和比较符连用（> ALL、= ANY）；相关子查询要写清内外层别名（w.continent = 外层.continent）。"}
          ],
          example:{ title:"每洲人口最多的国家", code:"SELECT name, continent FROM world w\nWHERE population =\n  (SELECT MAX(population)\n   FROM world\n   WHERE continent = w.continent);", note:"w 是外层别名，内层按相同洲取 MAX 再比对。" },
          questions:[
            { type:"single", q:"WHERE population > ALL (欧洲各国人口) 表示？", opts:["人口比欧洲任何一个国家都大","人口在欧洲平均之上","人口排在欧洲中间","等于欧洲最大人口"], answer:0, explain:"> ALL 表示大于集合里的每一个值，即比欧洲所有国家都大。" },
            { type:"predict", q:"用 MAX + 关联子查询找「每个洲人口最多的国家」，结果大致有多少行？", opts:["等于洲的数量","等于国家数量","只有 1 行","等于 0 行"], answer:0, explain:"每个洲恰好选出一个人口最多的国家，行数≈洲数。" },
            { type:"open", q:"请写出『找出比欧洲所有国家面积都大的亚洲国家』的查询思路。", refPoints:["先在内层选出欧洲全部国家的面积","外层用 area > ALL (内层集合)","WHERE continent='Asia' 限定亚洲"], explain:"组合 ALL 与子查询即可实现跨洲比较。" }
          ]
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
  id:"pbi", name:"PowerBI 可视化", level:"basic", desc:"导入数据 / 模型关系 / 度量值 / 图表交互，打牢可视化基础", color:"#F0A23C",
  topics:[
    {
      id:"t-pbi-viz", name:"可视化基础", lessons:[
        {
          id:"pbi-basic", title:"图表选型先看目的", mins:2,
          knowledge:[
            {head:"原则", body:"对比用柱状、趋势用折线、结构用堆叠/占比图。先问『想让观众看到什么』再选图，避免花哨。"},
            {head:"易错点", body:"一个图只讲一件事；颜色最多 2-3 类，别把图表当装饰。"}
          ],
          example:{ title:"选图表速记", code:"对比大小 → 柱状\n时间趋势 → 折线\n部分占整体 → 占比/堆叠\n分布 → 直方图/箱线", note:"一张图只讲一件事。" },
          questions:[
            { type:"single", q:"想呈现各品类销售额占比，优先选？", opts:["占比/堆叠图","散点图","箱线图","折线图"], answer:0, explain:"占比关系用占比/堆叠图最直观。" },
            { type:"predict", q:"要展示「近 12 个月 GMV 走势」，哪种图最合适？", opts:["折线图","饼图","雷达图","树形图"], answer:0, explain:"时间趋势首选折线图，走势一眼可见。" },
            { type:"open", q:"老板要看「各区域销售额对比」，你会选什么图？说明原因。", refPoints:["对比类用柱状图","按区域横向比较、数值可读","量级差异大时可考虑对数/条形"], explain:"对比大小优先柱状图；关键是把差异讲清楚。" }
          ]
        },
        {
          id:"pbi-interact", title:"切片器与筛选器：让报表会联动", mins:2,
          knowledge:[
            {head:"是什么", body:"切片器是报表上的可视化筛选控件（点选按钮/日期），筛选器面板可按字段条件过滤；报表内图表默认全部跟随筛选联动。"},
            {head:"何时用", body:"让观众自己切渠道/时间/地区看不同视角，省去做多张固定图；一页控制在 1-3 个关键维度，避免堆满切片器。"},
            {head:"易错点", body:"切片器默认影响全页所有图，若只想影响单个图要用「编辑交互」关闭部分联动；切片器字段放维度表而非事实表。"}
          ],
          example:{ title:"切片器 + 编辑交互", code:`拖入「月份」切片器 → 所有图按月份联动
若「明细表」不想被联动：
选中该表 → 格式 → 编辑交互 → 关闭联动`, note:"编辑交互可精确控制每张图是否响应切片器。" },
          questions:[
            { type:"single", q:"想让所有图都随所选『渠道』变化，最直接的做法是？",
              opts:["放一个渠道切片器","手动改每张图的数据","复制多张页面","不加任何筛选"],
              answer:0, explain:"切片器是全局筛选控件，拖入维度字段即可联动全页图表。" },
            { type:"predict", q:"切片器选中『华东』后，报表内其他图表会？",
              opts:["全部按华东过滤联动","只有第一张图变化","什么都不变","只改标题不改数据"],
              answer:0, explain:"默认所有视觉对象都响应切片器筛选，数据随所选维度刷新。" },
            { type:"single", q:"某张明细表不想跟着切片器变，应该？",
              opts:["用「编辑交互」关闭该表联动","删除切片器","换一张图","放大该表"],
              answer:0, explain:"编辑交互可单独控制每个视觉对象是否响应筛选。" }
          ]
        }
      ]
    },
    {
      id:"t-pbi-model", name:"数据模型与关系", lessons:[
        {
          id:"pbi-import", title:"导入数据与字段类型", mins:2,
          knowledge:[
            {head:"是什么", body:"PowerBI 通过「获取数据」导入 Excel/CSV/数据库等；导入后每列都有类型：文本、数字、日期等。"},
            {head:"易错点", body:"日期列可能被识别成文本或数字，导致时间轴排序错乱；金额列被识别成文本则无法求和。进 PQ 检查字段类型。"},
            {head:"何时用", body:"任何取数前先检查：该列的『类型』对不对，错了先改再建模。"}
          ],
          example:{ title:"导入后检查字段类型", code:"在「转换数据（Power Query）」中查看列类型图标：\n123  数值  ABC 文本  ⏱ 日期\n把被误判的日期列改回『日期』类型", note:"类型不对，很多图会和排序都会错。" },
          questions:[
            { type:"single", q:"导入 CSV 后『日期』列被识别成了文本，最直接的处理是？", opts:["在 Power Query 中把该列类型改为日期","新建一列复制文本","换成可视化类型","忽略不管"], answer:0, explain:"在 PQ 里把列类型改成『日期』，时间轴才能正确排序。" },
            { type:"predict", q:"『金额』列被识别为文本后，直接拖进报表求和会怎样？", opts:["求不了和，或得到 0/报错","正常求和","自动转数字求和","只显示最大值"], answer:0, explain:"文本列不能聚合求和，必须先转成数值类型。" },
            { type:"open", q:"为什么导入数据后要逐个确认字段类型？请举一个会踩坑的例子。", refPoints:["日期列变文本 → 时间排序乱","金额变文本 → 无法求和","订单号/ID 应保持文本避免精度丢失"], explain:"类型是建模和可视化的地基，错了后面全歪。" }
          ]
        },
        {
          id:"pbi-model-rel", title:"表关系：一对多与筛选传导", mins:2,
          knowledge:[
            {head:"是什么", body:"表关系决定报表怎么联动：通常把『明细大表』(订单)与『维度表』(用户/商品)建立一对多关系。"},
            {head:"筛选传导", body:"在一对多关系里，筛选从「一」侧(用户表)传导到「多」侧(订单表)；反过来多侧不会直接筛一 侧。"},
            {head:"易错点", body:"关系方向、基数(一对一/一对多)要设对；用错关系会出现重复计数或空白。"}
          ],
          example:{ title:"订单表 × 用户表", code:"orders(user_id, amount, date)  ←多—  users(user_id, name) 1—→\n关系：users(1) —— orders(多) 基于 user_id\n筛选 users 中的某个用户 → 订单表只显示该用户的订单", note:"星型模型：中间事实表、四周维度表。" },
          questions:[
            { type:"single", q:"订单表(多)与用户表(一)建立一对多关系后，勾选某个用户，订单表会？", opts:["只显示该用户的订单","显示全部订单","订单数翻倍","什么都不变"], answer:0, explain:"筛选从一 侧传到多侧，用户被选中时订单被过滤到该用户。" },
            { type:"predict", q:"反向操作：在订单表上筛掉一笔订单，用户表的用户数会？", opts:["一般不受影响（多侧不反向筛一 侧）","只剩一个用户","用户数翻倍","用户全消失"], answer:0, explain:"多侧筛选不会反向过滤一 侧用户，这是单向传导。" },
            { type:"open", q:"为什么报表通常建议用星型模型（中间事实表+四周维度表）而不是一张大宽表？", refPoints:["维度复用：用户/商品/时间可独立维护","避免宽表重复数据导致行数膨胀","筛选传导清晰、度量值好写"], explain:"星型模型让关系清晰、性能更好、口径更稳。" }
          ]
        },
        {
          id:"pbi-star-model", title:"星型模型：事实表与维度表", mins:2,
          knowledge:[
            {head:"事实表", body:"事实表存度量与明细（如订单表：金额、数量、日期、外键），行数多、可聚合，是分析的『数据源』。"},
            {head:"维度表", body:"维度表存描述与分类（如用户表：姓名、地区、等级），行数少、供筛选，是分析的『视角』。"},
            {head:"星型模型", body:"中间一张事实表、四周连接维度表，关系清晰、聚合快、好维护，比一张大宽表更推荐。"}
          ],
          example:{ title:"星型模型结构", code:`商品表       时间表
   │            │
用户表 —— 订单表(事实) —— 门店表
  （维度）     （明细度量）   （维度）

订单表：order_id、amount、date、user_id(外键)
用户表：user_id、name、region、level`, note:"筛选从维度表传导到事实表，报表联动才自然。" },
          questions:[
            { type:"single", q:"订单表（金额、数量、user_id、日期）属于？",
              opts:["事实表","维度表","时间表","索引表"], answer:0, explain:"事实表存可聚合的度量与明细，行多可加总。" },
            { type:"predict", q:"用户表（姓名、地区、等级）属于？",
              opts:["维度表","事实表","明细表","度量表"], answer:0, explain:"维度表存描述性分类字段，用于筛选与分组。" },
            { type:"predict", q:"事实表里每一行通常代表？",
              opts:["一条业务明细记录（如一笔订单）","一个分类标签","一个用户画像","一个报表页面"],
              answer:0, explain:"事实表按明细粒度记录业务事件，聚合统计才有意义。" }
          ]
        }
      ]
    },
    {
      id:"t-pbi-measure", name:"度量值与 DAX 入门", lessons:[
        {
          id:"pbi-measure-basic", title:"度量值：SUM / COUNT / 快速汇总", mins:2,
          knowledge:[
            {head:"是什么", body:"度量值是用 DAX 写的一个动态计算，随报表筛选条件变化而重算，例如 总GMV = SUM(orders[amount])。"},
            {head:"vs 计算列", body:"度量值在报表层计算、随筛选变化；计算列在数据层逐行算一次、存进表。先学度量值。"},
            {head:"常用函数", body:"SUM 求和、COUNT/COUNTA 计数、DISTINCTCOUNT 去重计数、AVERAGE 平均。"}
          ],
          example:{ title:"新建两个基础度量值", code:"总GMV = SUM('orders'[amount])\n订单数 = COUNTROWS('orders')\n下单用户数 = DISTINCTCOUNT('orders'[user_id])", note:"度量值会随你切片（月份/渠道）自动重算。" },
          questions:[
            { type:"single", q:"想统计「有多少个不同的用户下了单」，正确的度量值是？", opts:["DISTINCTCOUNT('orders'[user_id])","COUNTROWS('orders')","SUM('orders'[user_id])","AVERAGE('orders'[amount])"], answer:0, explain:"去重计数用 DISTINCTCOUNT，count 的是不重复用户。" },
            { type:"predict", q:"总GMV = SUM(amount)，在报表筛掉一部分订单后，该度量值会？", opts:["按剩余订单重新计算","保持原值不变","变为 0","报错"], answer:0, explain:"度量值动态响应筛选上下文，筛掉订单后自动重算。" },
            { type:"single", q:"COUNTROWS('orders') 与 DISTINCTCOUNT('orders'[order_id]) 的差异是？", opts:["前者数行数含重复，后者按订单号去重","两者完全相同","前者去重后者不去重","都会翻倍"], answer:0, explain:"COUNTROWS 数表内全部行；去重计数只数不重复的订单号。" }
          ]
        },
        {
          id:"pbi-measure-pct", title:"DIVIDE：占比与人均度量值", mins:2,
          knowledge:[
            {head:"DIVIDE", body:"DIVIDE(分子, 分母) 做安全除法：分母为 0 或空时返回空值/备选值而不是报错，比直接 分子/分母 更稳。"},
            {head:"占比与人均", body:"占比 = 某分组值 / 总体（如新客占比）；客单价 = 总额 / 订单数；都用 DIVIDE 组合已有度量。"},
            {head:"易错点", body:"分子分母要处于同一筛选上下文，否则占比失真；DIVIDE 可加第三参数作为分母为 0 时的兜底值。"}
          ],
          example:{ title:"新客占比与客单价", code:`新客占比 = DIVIDE(
    [新客数],
    [总用户数]
)
客单价 = DIVIDE(
    SUM('订单'[金额]),
    COUNTROWS('订单')
)`, note:"DIVIDE 让分母为 0 时安全返回空，报表不报错。" },
          questions:[
            { type:"single", q:"DIVIDE 相对直接写 分子/分母 的优势是？",
              opts:["分母为 0 或空时安全返回空值，不报错","计算一定更快","自动去重","只能用于占比"],
              answer:0, explain:"DIVIDE 内置除零保护，分母为 0 时返回空或兜底值。" },
            { type:"predict", q:"客单价 = DIVIDE(SUM(金额), COUNTROWS(订单))，本月金额 6000、订单 200 单，客单价是？",
              opts:["30","3","1200","0"], answer:0, explain:"6000 ÷ 200 = 30。" },
            { type:"sqlfill", q:"补全：计算新客占比的度量值。",
              code:`新客占比 = DIVIDE(
    {0},
    [总用户数]
)`,
              fillOpts:["[新客数]","[总金额]","COUNTROWS('订单')","SUM('订单'[金额])"],
              answer:["[新客数]"], explain:"分子是去重后的新客数，分母是总用户数，构成占比。" }
          ]
        }
      ]
    }
  ]
},

/* ============ 业务能力 ============ */
{
  id:"biz", name:"业务能力", level:"basic", desc:"指标口径 / 指标体系 / 漏斗分析 / 结论写作，基础起步", color:"#E8463A",
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
          questions:[
            { type:"open", q:"请用一句话说明『订单数』这个指标的口径（含哪些范围、是否去重）。", refPoints:["明确时间范围（如按日/月）","明确对象（如含/不含取消订单）","明确去重规则（按订单号去重）"], explain:"口径清楚，数字才有可比性。对照参考要点自查即可。" },
            { type:"single", q:"汇报「本月订单数」前，最该先确认的是？", opts:["订单口径（范围/去重/时间粒度）","图表配色","页面标题","字体大小"], answer:0, explain:"口径一致，数字才可比、结论才可信。" }
          ]
        },
        {
          id:"biz-metric-gmv", title:"GMV 与销售额：别把两个数说混", mins:2,
          knowledge:[
            {head:"是什么", body:"GMV 是成交总额（含未支付、已取消，取决于口径），销售额通常是实际收款口径。两者差距大时说明退货/未支付高。"},
            {head:"易错点", body:"同一张报表里 GMV 与销售额混用会误导结论；比较前先统一口径。"}
          ],
          example:{ title:"一个月的两套数字", code:"GMV 口径：全部下单金额 = 100 万\n含未支付 = 95 万\n含退款后实际销售额 = 82 万\n差异 18% → 要查支付成功率与退款率", note:"差异大不是 bug，而是没对齐口径的『信号』。" },
          questions:[
            { type:"single", q:"GMV 与「实际销售额」的常见差别来自？", opts:["未支付/退款订单是否计入","表的行数多少","用户数量","字段命名"], answer:0, explain:"GMV 常含未支付与取消单，销售额通常是实收口径。" },
            { type:"predict", q:"本月 GMV 100 万、实际销售额 82 万，说明什么？", opts:["存在较高未支付或退款","销售额算错了","用户数减少","价格涨了"], answer:0, explain:"差异大要关注支付成功率与退款率，而不是直接当成错误。" }
          ]
        },
        {
          id:"biz-metric-dau", title:"DAU / 去重用户怎么数", mins:2,
          knowledge:[
            {head:"是什么", body:"DAU（日活跃用户）按「去重后的用户数」统计：同一用户当天打开 10 次只算 1 个。"},
            {head:"易错点", body:"直接 COUNT(*) 会把一个用户的多条行为记成多个 DAU；必须 COUNT(DISTINCT user_id)。"}
          ],
          example:{ title:"计算 DAU 的口径", code:"SELECT COUNT(DISTINCT user_id) AS dau\nFROM user_activity\nWHERE active_date = '2026-10-01';", note:"加 WHERE 限当天，DISTINCT 去重用户。" },
          questions:[
            { type:"single", q:"统计某日 DAU，应该数什么？", opts:["COUNT(DISTINCT user_id)","COUNT(*) 全部行为行","SUM(活跃时长)","MAX(user_id)"], answer:0, explain:"DAU 是去重用户数，按 user_id 去重。" },
            { type:"predict", q:"某日行为表有 2000 行，其中 300 个不同用户，COUNT(*) 与 DAU 分别会是？", opts:["2000 与 300","300 与 2000","300 与 300","2000 与 2000"], answer:0, explain:"COUNT(*) 数行数 2000，DAU 去重用户 300。" }
          ]
        }
      ]
    },
    {
      id:"t-metric-compare", name:"对比分析：同比环比与占比", lessons:[
        {
          id:"biz-compare-yoymom", title:"同比 vs 环比：选对对比基准", mins:2,
          knowledge:[
            {head:"同比", body:"同比 = 本期 比 去年同期（如 2026-10 比 2025-10），能消除季节性影响，适合看长期趋势。"},
            {head:"环比", body:"环比 = 本期 比 上一期（如 10 月比 9 月），反映近期变化速度，适合看短期波动。"},
            {head:"易错点", body:"大促/节日月份直接环比容易误判；第一个有数据的月份没有同比；汇报时要标注清楚用的是哪种。"}
          ],
          example:{ title:"同一个数字的两种算法", code:`2026-10 销售额 120 万
去年同期(2025-10) 100 万 → 同比 +20%
上月(2026-09) 110 万 → 环比 +9.1%
结论：同比明显增长、环比小幅上升，整体健康`, note:"同比看长势、环比看近速，两个一起报更完整。" },
          questions:[
            { type:"single", q:"想知道『今年 10 月比去年 10 月涨了多少』，用哪种？",
              opts:["同比","环比","占比","平均数"], answer:0, explain:"同比与去年同期比较，排除季节因素。" },
            { type:"predict", q:"本月销售额 120 万、上月 100 万，环比增速是？",
              opts:["20%","-20%","120%","2%"], answer:0, explain:"(120-100)/100 = 20%。" },
            { type:"sqlfill", q:"补全：环比增速的计算公式。",
              code:`环比增速 = ({0} - {1}) / {1}`,
              fillOpts:["本期值","上期值","去年同期值","总体值"],
              answer:["本期值","上期值","上期值"], explain:"分子是本期内减上期，分母用上期值，才是环比。" }
          ]
        },
        {
          id:"biz-compare-pct", title:"占比与增长率：口径别混", mins:2,
          knowledge:[
            {head:"占比", body:"占比 = 某部分 / 整体（如华东销售额占比 = 华东/全国）；互斥且完整的分组，占比之和应接近 100%。"},
            {head:"增长率", body:"增长率 = (本期-上期)/上期，描述变化幅度；增长贡献率 = 某部分的增量 / 整体增量，说明谁在拉动增长。"},
            {head:"易错点", body:"占比高不等于增长快（大基数低增速）；不同部分的占比要同口径（同为金额）才可比。"}
          ],
          example:{ title:"占比 vs 增长率 vs 贡献率", code:`华东 120 万，全国 400 万
占比     = 120/400 = 30%
增长率   = 华东环比 +20%，全国 +10%（快于大盘）
贡献率   = 华东增量 20 万 / 全国增量 36 万 ≈ 56%
三个数字分别回答：占多大、涨多快、谁拉动`, note:"别用一个数字回答所有问题，分清楚各自身份。" },
          questions:[
            { type:"single", q:"华东销售额 120 万、全国 400 万，华东占比是？",
              opts:["30%","120%","3.3%","40%"], answer:0, explain:"120 ÷ 400 = 30%。" },
            { type:"predict", q:"『占比 30%』和『环比 +20%』分别回答什么问题？",
              opts:["占多大 / 涨多快","涨多快 / 占多大","两个都讲增长","两个都讲结构"],
              answer:0, explain:"占比看结构、增长率看变化，回答的问题不同。" },
            { type:"open", q:"为什么说『占比高不等于增长快』？请举例说明。",
              refPoints:["占比反映结构（部分占整体的比例）","增长率反映变化幅度（本期对比上期）","大基数低增速的部门占比高但增长慢"],
              explain:"两个指标各回答各的问题，汇报时要分开给、别混用。" }
          ]
        }
      ]
    },
    {
      id:"t-metric-sys", name:"指标体系", lessons:[
        {
          id:"biz-funnel", title:"漏斗分析：每一步流失在哪", mins:2,
          knowledge:[
            {head:"是什么", body:"漏斗把用户路径拆成关键步骤（如 曝光→点击→加购→支付），看每一步转化率，定位流失最大的环节。"},
            {head:"何时用", body:"转化率下降、想知道卡在哪一步时用；也用来设定优化优先级（先修流失最严重的环节）。"}
          ],
          example:{ title:"一个转化漏斗", code:"曝光 10000\n点击 3000 (30%)\n加购 900 (30%)\n支付 450 (50%)\n结论：点击→加购流失最狠，优先优化商品页", note:"先看绝对值大的流失环节，再动手。" },
          questions:[
            { type:"predict", q:"曝光 10000、点击 3000，点击率是？", opts:["30%","3%","33%","0.3%"], answer:0, explain:"3000/10000=30%。" },
            { type:"single", q:"漏斗中「点击→加购」只有 15% 转化，下一步最该做什么？", opts:["重点优化加购环节","优化曝光渠道","删掉加购步骤","直接看支付"], answer:0, explain:"流失最重的环节是主要优化对象。" },
            { type:"open", q:"支付转化率下降了，你会怎么用漏斗定位问题？", refPoints:["按 曝光→点击→加购→支付 分步算转化率","对比历史/同期找出突变环节","结合渠道、端型、活动拆解看"], explain:"用漏斗分步定位，再结合维度拆分确认原因。" }
          ]
        },
        {
          id:"biz-kpi-tree", title:"指标体系：从北极星指标往下拆", mins:2,
          knowledge:[
            {head:"是什么", body:"北极星指标是当前阶段最该盯的一个核心指标（如 GMV、DAU），其余指标围绕它往下拆。"},
            {head:"怎么拆", body:"GMV = 访客数 × 转化率 × 客单价。拆出来的每个因子都可以再细分（渠道、品类、新老客），形成指标树。"},
            {head:"易错点", body:"指标不是越多越好，先保证『上下层能对上账』（上层 = 下层之和或加权）。"}
          ],
          example:{ title:"GMV 指标树", code:"GMV\n├─ 访客数（UV）：按渠道拆\n├─ 转化率：新客/老客分开看\n└─ 客单价：按品类/客群拆\n核对：GMV = UV × 转化率 × 客单价", note:"每一层都能对上账，指标树才有用。" },
          questions:[
            { type:"single", q:"「北极星指标」最接近的含义是？", opts:["当前阶段最重要的一个核心指标","所有指标里最大那个","随便选一个指标","和 GMV 完全等价"], answer:0, explain:"北极星是阶段性的核心抓手，其余指标为其服务。" },
            { type:"predict", q:"GMV 由 UV×转化率×客单价构成，若 UV 涨 20%、转化率不变、客单价不变，GMV 变化是？", opts:["约涨 20%","不变","涨 40%","不确定"], answer:0, explain:"乘法结构里单一因子 +20% 使整体约 +20%。" },
            { type:"open", q:"给「DAU 下降」拆一个指标树，说出 3 个可下钻的因子。", refPoints:["新增用户（渠道/拉新活动）","回流用户（唤回/推送）","流失加速（留存曲线/卸载）"], explain:"把 DAU 拆成新增+回流+留存，才能定位到动作。" }
          ]
        },
        {
          id:"biz-change-attribution", title:"指标变化怎么看：趋势+对比+细分", mins:2,
          knowledge:[
            {head:"三步法", body:"指标变化先走三步：① 趋势（时间走势，是涨是跌）② 对比（同比/环比/对标）③ 细分（按渠道/品类/地区/新老客拆开定位）。"},
            {head:"何时用", body:"『这个月 GMV 为什么降』这类归因需求，先用三步法框定方向，再深入验证。"},
            {head:"易错点", body:"只看总量不拆维度容易归因错；拆完维度要对得上总量（各维度之和 ≈ 总量），对不上说明口径有洞。"}
          ],
          example:{ title:"GMV 下降的三步排查", code:`① 趋势：GMV 连续 3 个月下滑
② 对比：同比 -15%、环比 -8%，且非大促期
③ 细分：按渠道拆 → 直播渠道掉 30%，占比 60%
初步结论：直播渠道塌方是主因，继续下钻到主播/场次`, note:"从总量到维度逐层缩小范围，归因才落地。" },
          questions:[
            { type:"single", q:"『GMV 为什么降』合理的第一步是？",
              opts:["看趋势+对比+拆维度定位","直接下结论","先改指标口径","删掉异常数据"],
              answer:0, explain:"先框定方向再深入，避免跳跃式归因。" },
            { type:"predict", q:"各渠道 GMV 之和比总量少 5%，最可能是？",
              opts:["口径有洞（漏渠道或去重规则不一致）","数据正常无需管","总量错了也无妨","一定是系统 bug"],
              answer:0, explain:"细分之和应≈总量，对不上说明口径或链路有缺漏。" },
            { type:"open", q:"『DAU 下降』你会按哪 3 个维度先拆？",
              refPoints:["人群结构：新客/回流/老客流失","渠道：各拉新渠道转化变化","业务维度：端型/地区/活动"],
              explain:"先拆能对应上动作的维度，再逐层下钻定位。" }
          ]
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
window.COURSE_EXT=(window.COURSE_EXT||[]).concat([
/* ============ Python 进阶 ============ */
{
  id:"pya-adv", name:"Python 进阶", level:"advanced", desc:"Pandas 深水区 / Seaborn / openpyxl 报表 / SQLAlchemy / 数据校验与口径核数", color:"#0E8388",
  topics:[
    {
      id:"pya-pandas", name:"Pandas 进阶", lessons:[
        {
          id:"pya-pd-merge", title:"merge/join 多表关联", mins:2,
          knowledge:[
            {head:"是什么", body:"pd.merge 按关联键把两张表拼起来，如同 SQL 的 JOIN；how='inner'/'left'/'right'/'outer' 决定保留哪些行。"},
            {head:"何时用", body:"订单明细关联用户/商品/渠道维度信息，把项目里分散的多张库表拉到一张工作表分析。"},
            {head:"易错点", body:"关联键类型要一致（int vs str 会全空）；两表同名列默认加 _x/_y 后缀，或用 suffixes 自定义；多对多会放大行数。"}
          ],
          example:{ title:"订单主表 LEFT JOIN 用户表", code:"import pandas as pd\norders = pd.DataFrame({'order_id':[1,2,3],'user_id':[101,102,101]})\nusers  = pd.DataFrame({'user_id':[101,102],'name':['张三','李四']})\ndf = pd.merge(orders, users, on='user_id', how='left')\nprint(df)  # 订单一行不丢", note:"how='left' 保证左表订单全保留；用户表缺失则 name 为 NaN。" },
          questions:[
            { type:"predict", q:"orders 有 6 行，其中 2 行 user_id 在 users 中不存在。pd.merge(orders, users, on='user_id', how='left') 结果行数是？", opts:["6 行","4 行","8 行","2 行"], answer:0, explain:"left 连接以左表为准，6 个订单行全部保留，缺用户的行 name 为 NaN。" },
            { type:"single", q:"两表都有一个叫 total 的列，merge 后想要可读的列名，最稳妥的做法是？", opts:["merge(..., suffixes=('_o','_u'))","随便叠加直接覆盖","先 drop 掉一列","互为索引再 add"], answer:0, explain:"用 suffixes 给同名列加明确后缀，避免 _x/_y 混乱。" },
            { type:"sqlfill", q:"补全：以 orders 为主表对 users 做 LEFT JOIN，关联键为 user_id。", code:"df = pd.merge(orders, users, {0}, {1})", fillOpts:["on='user_id'","how='left'","how='inner'","on='id'"], answer:["on='user_id'","how='left'"], explain:"merge(left, right, how=..., on=...) 中关联键写 on，连接方式写 how。left 保证订单一行不丢。" }
          ]
        },
        {
          id:"pya-pd-apply", title:"apply/applymap 逐行列处理", mins:2,
          knowledge:[
            {head:"是什么", body:"apply(func) 按行(axis=1)或按列(axis=0)批量套函数；applymap(func) 对 DataFrame 每个元素逐个应用。"},
            {head:"何时用", body:"apply 做每条记录的分级、打分、区间切分；applymap 做全表统一变换（如去空格、转大写、数值缩放）。"},
            {head:"易错点", body:"默认 axis=0 是逐列，要逐行必须写 axis=1；能向量化的尽量用向量化表达式，不要滥用 apply 拖慢速度。"}
          ],
          example:{ title:"按行计算订单金额等级", code:"def tier(row):\n    return '高' if row['amount'] >= 1000 else ('中' if row['amount']>=100 else '低')\ndf['tier'] = df.apply(tier, axis=1)\nprint(df[['order_id','amount','tier']])", note:"axis=1 让函数以每一行作为一个 Series 传入，可同时读多列。" },
          questions:[
            { type:"predict", q:"df.apply(func) 不写 axis 参数时，函数默认作用于哪个方向？", opts:["逐列（axis=0）","逐行（axis=1）","逐元素","随机"], answer:0, explain:"apply 默认 axis=0 是逐列处理；要逐行必须显式 axis=1。" },
            { type:"single", q:"想让 DataFrame 所有元素统一去掉空格（字符串），最合适的是？", opts:["df.applymap(lambda s: s.strip())","df.apply(lambda r: r['a'], axis=1)","df.groupby('col')","df.plot()"], answer:0, explain:"applymap 对每个元素逐个应用，正适合全表统一字符串清洗。" },
            { type:"open", q:"一句话说明 apply 与 applymap 的使用差异。请给出一个各自适用的小场景。", refPoints:["apply 按行/列作用于一批，适合基于多列算新列","applymap 逐元素作用于整表，适合统一字符/数值变换","能向量化时优先向量化而非 apply"], explain:"apply 侧重行/列级别求值，applymap 侧重元素级别清洗，两者维度不同。" }
          ]
        },
        {
          id:"pya-pd-pivot", title:"groupby + pivot_table 透视", mins:2,
          knowledge:[
            {head:"是什么", body:"groupby 按 key 聚合算统计量；pivot_table 把它转成『行×列』的透视矩阵，index 行、columns 列、values 取值、aggfunc 聚合。"},
            {head:"何时用", body:"按月份×渠道看 GMV、按地区×品类看销量，交叉看两个维度时最方便。"},
            {head:"易错点", body:"aggfunc 多值要传列表或字典；缺组合处默认 NaN 可加 fill_value；groupby 后是 Series 结构，需 reset_index 才能继续当表用。"}
          ],
          example:{ title:"按 月份×渠道 汇总 GMV", code:"piv = df.pivot_table(index='month', columns='channel',\n                    values='gmv', aggfunc='sum', fill_value=0)\nprint(piv)  # 行=月份 列=渠道 单元格=GMV", note:"fill_value=0 把没有数据的格子填 0，透视表更干净。" },
          questions:[
            { type:"predict", q:"执行 pivot_table(index='month', columns='channel', values='gmv', aggfunc='sum') 后的表格形状是？", opts:["行是月份、列是渠道、值为 GMV","行是渠道、列是月份、值为订单数","一列长表","每个渠道单独一个表"], answer:0, explain:"index 决定行、columns 决定列、values+aggfunc 决定单元格数值，得到行列交叉透视。" },
            { type:"single", q:"想一次得到每个用户的总金额和订单数两个口径，正确写法是？", opts:["df.groupby('user_id').agg({'amount':'sum','order_id':'count'})","分两次 groupby 再拼","只 group 一列","df.mean()"], answer:0, explain:"agg 传字典可对多列分别指定不同聚合函数，一次出两个口径。" },
            { type:"sqlfill", q:"补全：用 groupby 求每个用户的总金额与订单数。", code:"stats = df.groupby('user_id').agg({\n  'amount': '{0}',\n  'order_id': '{1}'\n})", fillOpts:["'sum'","'count'","'mean'","'max'"], answer:["'sum'","'count'"], explain:"金额求和用 sum，订单数数行用 count，分别按列指定 agg 函数。" }
          ]
        }
      ]
    },
    {
      id:"pya-seaborn", name:"Seaborn 可视化", lessons:[
        {
          id:"pya-sns-dist", title:"分布图：histplot/displot", mins:2,
          knowledge:[
            {head:"是什么", body:"seaborn 基于 matplotlib 提供更美观的统计图；histplot 画直方图、displot 兼画直方图+核密度(kde)。"},
            {head:"何时用", body:"看某数值列（如金额、单价、时长）的分布形态、是否偏态、有没有堆积在奇怪区间，是清洗前的必看。"},
            {head:"易错点", body:"bins 太大会过碎、太小会掩盖细节；数据有极端值时直方图会拉扁，常先过滤异常再看。"}
          ],
          example:{ title:"看订单金额分布", code:"import seaborn as sns\nsns.histplot(df['amount'], bins=40, kde=True)\nplt.title('订单金额分布')", note:"kde=True 叠加核密度曲线，一眼看出长尾/偏态。" },
          questions:[
            { type:"single", q:"想同时看数值列的直方图和核密度曲线，最合适的是？", opts:["sns.histplot(df['gmv'], kde=True)","sns.barplot(x,y)","sns.pairplot(df)","plt.plot(x)"], answer:0, explain:"histplot 的 kde=True 同时画直方图与核密度曲线。" },
            { type:"predict", q:"histplot 里 bins=50 相对 bins=5，柱子会？", opts:["分组更多、柱子更窄更细","分组更少、柱子更宽","柱子消失","只显示一根"], answer:0, explain:"bins 是分组区间数，值越大切得越细，柱子越窄越密。" },
            { type:"open", q:"画分布图时发现数据严重右偏，你会怎么做？请给出两条处理。", refPoints:["先筛选/声明异常区间再看主分布","可用对数刻度或 boxplot 观察离群","向业务确认畸形分布原因"], explain:"分布图服务于发现问题，偏态长时间要定位到业务原因而不是直接改图。" }
          ]
        },
        {
          id:"pya-sns-heatmap", title:"热力图看相关性", mins:2,
          knowledge:[
            {head:"是什么", body:"sns.heatmap(df.corr(), annot=True) 用颜色深浅展示数值矩阵，最常用于相关性矩阵。"},
            {head:"何时用", body:"选特征前看变量两两相关系数，找强相关、冗余、或与目标高度相关的字段。"},
            {head:"易错点", body:"corr() 只支持数值列，先选 'datetime' 等非数值列；对角线上自相关一定是 1，是正常现象。"}
          ],
          example:{ title:"多变量相关矩阵热力图", code:"corr = df[['gmv','uv','pct_uv_pay','return_rate']].corr()\nsns.heatmap(corr, annot=True, cmap='coolwarm', fmt='.2f')", note:"annot=True 在格子里显示数值，fmt 控制小数位。" },
          questions:[
            { type:"single", q:"要看多个数值变量两两之间的相关系数，最合适的是？", opts:["sns.heatmap(df.corr(), annot=True)","sns.histplot(x)","sns.countplot(x)","plt.bar(y)"], answer:0, explain:"相关性矩阵用热力图呈现最清晰，颜色和数字双通道表达。" },
            { type:"predict", q:"任何矩阵 df.corr() 的对角线上（变量与自身）的值是？", opts:["1","0","-1","NaN"], answer:0, explain:"变量与自身的相关系数恒为 1。" },
            { type:"single", q:"corr() 报错说「could not convert string」，最可能原因是？", opts:["列里有非数值列（如字符串）","行数太多","数据全为空","图太小"], answer:0, explain:"corr 只能算数值列，要先剔除/编码字符串等非数值列。" }
          ]
        },
        {
          id:"pya-sns-pairplot", title:"pairplot 多变量总览", mins:2,
          knowledge:[
            {head:"是什么", body:"sns.pairplot(df) 为数值列两两画图：对角线画单变量分布，非对角线画两两散点，一张图总览全部变量关系。"},
            {head:"何时用", body:"数据量不大、想快速看多列皮尔逊相关与分布时；也是探索性分析的标准开局图。"},
            {head:"易错点", body:"变量一多子图数成平方增长，10 个变量就是 100 格，图会很难看，先精选几列再用。"}
          ],
          example:{ title:"三列两两关系总览", code:"sns.pairplot(df[['amount','cnt','pct']],\n             hue='is_high', height=2)  # hue 按标签着色", note:"hue 参数按分组上色，能看出不同分组的分布差异。" },
          questions:[
            { type:"predict", q:"sns.pairplot(df[['A','B','C']]) 一共会画多少个子图（3 个变量两两组合）？", opts:["9 个","6 个","3 个","12 个"], answer:0, explain:"3×3 网格共 9 格：3 个对角线分布图 + 6 个两两散点图。" },
            { type:"single", q:"pairplot 对角线上默认展示的是？", opts:["单变量的分布图","两两散点","相关系数值","箱线图"], answer:0, explain:"对角线是单变量自身分布（直方图/KDE），非对角线才是两两关系。" },
            { type:"open", q:"数据里有 20 个数值列，直接全部 pairplot 会怎样？你会怎么处理？", refPoints:["子图数平方级膨胀难读","先靠相关矩阵筛关键列再 pairplot","数据量大时先抽样/降维"], explain:"pairplot 适合精选少数列使用，海量变量应先用 corr/重要性筛选。" }
          ]
        }
      ]
    },
    {
      id:"pya-openpyxl", name:"openpyxl 读写 Excel", lessons:[
        {
          id:"pya-xl-read", title:"读取并保留格式", mins:2,
          knowledge:[
            {head:"是什么", body:"load_workbook(path) 打开已有工作簿；data_only=False(默认) 保留公式与样式，data_only=True 读公式的缓存计算值。"},
            {head:"何时用", body:"对方给的报表带公式和格式，既要读数值核数，又要保留样式做回填时，需按需取巧读取。"},
            {head:"易错点", body:"data_only=True 只能读到『保存过并被 Excel 计算过』的缓存值；纯公式未落库的格子读出来是 None。"}
          ],
          example:{ title:"带公式工作簿取值与取公式", code:"from openpyxl import load_workbook\nwb = load_workbook('rep.xlsx')              # 默认 data_only=False，保留格式\nwv = load_workbook('rep.xlsx', data_only=True)  # 读公式结果缓存\nprint(wb.active['C10'].value)  # 可能是 '=SUM(C2:C9)'\nprint(wv.active['C10'].value)  # 可能是 12345.0 或 None", note:"同一份文件需要格式就读默认，需要数值就 data_only=True，Python 里没有既能一次性拿到两者的开关。" },
          questions:[
            { type:"single", q:"要读 Excel 中由公式 SUM 算出的缓存数值，load_workbook 应？", opts:["wb=load_workbook(p, data_only=True)","wb=load_workbook(p) 直接用","wb=load_workbook(p, read_only=True)","wb=load_workbook(p, keep_vba=True)"], answer:0, explain:"data_only=True 让 openpyxl 返回公式格子已缓存的数值而不是公式字符串。" },
            { type:"predict", q:"一个写入了公式但从未用 Excel 打开保存过的单元格，用 data_only=True 读到的值是？", opts:["None（没有缓存值）","完整的公式字符串","0","抛异常"], answer:0, explain:"data_only 依赖 Excel 保存时缓存的数值；没被计算过就没有缓存，返回 None。" },
            { type:"open", q:"为什么读『样式/格式』要用默认的 data_only=False？", refPoints:["样式/尺寸/Merge 等元信息随 workbook 对象存在","data_only=True 只返回数值缓存不保留样式对象","两者通常要各读一次"], explain:"格式是 workbook 元信息，data_only 只影响 cell 数值来源，读样式必须用默认模式。" }
          ]
        },
        {
          id:"pya-xl-write", title:"写报表：样式与合并", mins:2,
          knowledge:[
            {head:"是什么", body:"用 Workbook() 建表、ws.append/单元格赋值、Font/Fill/Border/Alignment 设样式、merge_cells 合并、save(path) 落盘。"},
            {head:"何时用", body:"把清洗后的 DataFrame 输出成带标题、表头加粗、数值格式的正式交付报表。"},
            {head:"易错点", body:"表头要单独写；纯 DataFrame.to_excel 不带样式；公式单元格写入的是公式字符串本体；写完必须 save()。"}
          ],
          example:{ title:"生成带加粗表头的报表", code:"from openpyxl import Workbook\nfrom openpyxl.styles import Font, Alignment\nwb = Workbook(); ws = wb.active\nws.append(['月份','GMV','订单数'])\nfor c in ws[1]:\n    c.font = Font(bold=True)\nws.append(['2026-01', 1000000, 2300])\nwb.save('report.xlsx')   # 关键一步，落盘", note:"ws[1] 是首行表头，循环加粗；所有写操作后必须 save()。" },
          questions:[
            { type:"sqlfill", q:"补全：设置表头加粗并保存工作簿。", code:"for c in ws[1]:\n    c.font = Font({0})\nwb.save({1})", fillOpts:["bold=True","'report.xlsx'","bold=True, color='FF0000'","'data'"], answer:["bold=True","'report.xlsx'"], explain:"表头循环里设 bold=True，最后 wb.save(文件名) 落盘。" },
            { type:"single", q:"要把标题『月度经营报表』横跨 A1:D1 居中，正确的做法是？", opts:["ws.merge_cells('A1:D1') 再设对齐","用 append 写四次","双击每个格子","转成 pandas to_excel"], answer:0, explain:"先 merge_cells 把 A1:D1 合并成一个区域，再对该区域设置居中对齐。" },
            { type:"predict", q:"openpyxl 往单元格写入一个「=SUM(C2:C9)」的字符串，保存后 Excel 里看到的是什么？", opts:["公式本身（打开时由 Excel 计算）","立即算好的数值","报错的空值","随机数"], answer:0, explain:"openpyxl 写入的是公式文本，真正的计算由 Excel 打开时完成。" }
          ]
        }
      ]
    },
    {
      id:"pya-sqlalchemy", name:"SQLAlchemy 连接与 ORM", lessons:[
        {
          id:"pya-sa-connect", title:"engine 连接与 read_sql", mins:2,
          knowledge:[
            {head:"是什么", body:"create_engine('数据库驱动://用户:密码@主机/库') 建连接池引擎；配合 pd.read_sql(sql, engine) 把库表读进 DataFrame。"},
            {head:"何时用", body:"项目里连 MySQL/PG 等跑数，把结果直接给 pandas 清洗分析，替代逐条 cursor 循环。"},
            {head:"易错点", body:"engine 用 lazy 连接，真正连库在读/执行时才发生；SQL 里有动态拼接要注意参数化，避免注入。"}
          ],
          example:{ title:"连 MySQL 并读订单表", code:"from sqlalchemy import create_engine, text\nimport pandas as pd\nengine = create_engine('mysql+pymysql://root:xxx@localhost/shop')\ndf = pd.read_sql(text('SELECT * FROM orders WHERE status=1'), engine)\nprint(df.head())", note:"create_engine 只是建立配置/连接池，pd.read_sql 实际发起查询并返回 DataFrame。" },
          questions:[
            { type:"sqlfill", q:"补全：创建 MySQL 连接引擎并用 pandas 读查询结果。", code:"engine = create_engine({0})\ndf = pd.read_sql({1}, engine)", fillOpts:["'mysql+pymysql://root:xxx@localhost/shop'","'SELECT * FROM orders'","engine.connect()","SHOW TABLES"], answer:["'mysql+pymysql://root:xxx@localhost/shop'","'SELECT * FROM orders'"], explain:"第一空是引擎连接串(驱动+地址+库)，第二空是待执行的 SQL 文本。" },
            { type:"single", q:"pd.read_sql(sql, engine) 的返回值类型是？", opts:["DataFrame","list of tuples","dict","一个数据库游标"], answer:0, explain:"read_sql 底层也是拿 cursor 但就地组装成 DataFrame，方便继续用 pandas。" },
            { type:"predict", q:"执行 create_engine(...) 后，是否立即与数据库建立物理连接？", opts:["不会，真正连接在读/执行时才建立","一定会立即连一次","需要手动 pool","创建的就是连接本身"], answer:0, explain:"create_engine 建立引擎与连接池配置，属于懒初始化，首次取数才真正连库。" }
          ]
        },
        {
          id:"pya-sa-orm", title:"ORM 模型定义与查询", mins:2,
          knowledge:[
            {head:"是什么", body:"ORM 用 Python 类映射表（declarative_base），session 做会话，query/filter 查对象，commit 落库。"},
            {head:"何时用", body:"要频繁对同一批业务表做增删改查、且希望用 Python 对象而非手写 SQL 时；也便于复用模型层。"},
            {head:"易错点", body:"查询返回的是对象列表而非 DataFrame，需要逐个取字段；增删改要 session.commit() 才真正生效；用完 close。"}
          ],
          example:{ title:"定义 Order 模型并查询", code:"from sqlalchemy import create_engine, Column, Integer, Float\nfrom sqlalchemy.orm import declarative_base, sessionmaker\nBase = declarative_base()\nclass Order(Base):\n    __tablename__ = 'orders'\n    id = Column(Integer, primary_key=True)\n    amount = Column(Float)\nSession = sessionmaker(bind=engine); s = Session()\nrows = s.query(Order).filter(Order.amount > 100).all()\nfor r in rows: print(r.id, r.amount)\ns.close()", note:"查询得到满足条件的 Order 对象列表，r.id/r.amount 直接访问映射字段。" },
          questions:[
            { type:"single", q:"ORM 里把一个类映射成数据库表，这个类通常继承自？", opts:["Base（declarative_base() 返回）","pd.DataFrame","np.ndarray","sqlalchemy.Connection"], answer:0, explain:"继承 declarative_base() 的 Base，通过 __tablename__+Column 声明字段与表映射。" },
            { type:"predict", q:"s.query(Order).filter(Order.amount > 100).all() 返回的是？", opts:["满足条件的 Order 对象列表","拼好的 SQL 字符串","一个整数","一个 DataFrame"], answer:0, explain:"ORM 把所有查到的行封装成 Order 对象返回，需要逐对象取字段。" },
            { type:"single", q:"ORM 里向库写入后，真正把改动（INSERT/UPDATE）落库的方法是？", opts:["session.commit()","session.query(...).all()","engine.dispose()","pd.to_sql 自动提交无需 commit"], answer:0, explain:"session 维护事务，必须 commit() 才把写入真正提交到数据库。" }
          ]
        }
      ]
    },
    {
      id:"pya-validate", name:"数据校验与口径核数", lessons:[
        {
          id:"pya-val-dedup", title:"重复与缺失校验", mins:2,
          knowledge:[
            {head:"是什么", body:"duplicated/drop_duplicates(subset=...) 去重，isna().sum() 逐列统计缺失，是口径核数的第一步。"},
            {head:"何时用", body:"上线前校验库表是否按主键唯一、列缺失率是否在阈值内，避免把脏数带进指标。"},
            {head:"易错点", body:"去重必须先想清按哪列/哪几个键去重、保留最新的那行；missing 重在理解『为什么缺』而不是无脑填。"}
          ],
          example:{ title:"校验订单表主键与缺失", code:"print(df.duplicated(subset=['order_id']).sum())  # 重复订单数\nprint(df.isna().sum())                           # 每列缺失数\nclean = df.sort_values('create_time').drop_duplicates(subset=['order_id'], keep='last')\nprint(len(clean))", note:"duplicated(...).sum() 统计重复行数；fillna/删除前先看 isna().sum() 的分布。" },
          questions:[
            { type:"predict", q:"df.duplicated(subset=['order_id']).sum() 得到的结果含义是？", opts:["重复（主键冲突）的行数","缺失值的个数","订单总金额","去重后的行数"], answer:0, explain:"duplicated 返回每行是否之前已出现过，sum() 即重复行数量，用于主键唯一性校验。" },
            { type:"single", q:"希望保留每条重复订单中时间最新的一条，正确思路是？", opts:["先按时间排序再 drop_duplicates(..., keep='last')","整表去重不分前后","用 duplicated(keep=False) 全删","快速随机删"], answer:0, explain:"先 sort 把最新排在后面，keep='last' 保留每组的最后一行，即最新记录。" },
            { type:"sqlfill", q:"补全：统计 df 中每一列的缺失数量。", code:"print(df.{0}.sum())   # 每列 True 就是缺失", fillOpts:["isna()","isduplicated()","notnull()","fillna(0)"], answer:["isna()"], explain:"isna() 布尔矩阵的 sum() 按列统计缺失个数，是核数前的常规体检。" }
          ]
        },
        {
          id:"pya-val-outlier", title:"异常值识别", mins:2,
          knowledge:[
            {head:"是什么", body:"异常值常用业务阈值（价格上限）、IQR 经验界限（Q3+1.5×IQR ~ Q1-1.5×IQR）或分布图肉眼判断。"},
            {head:"何时用", body:"大促冲量、录入错误、单位错乱都会制造异常；识别后再和业务确认是保留还是修正，不能直接删。"},
            {head:"易错点", body:"异常值分『真实突出』和『脏数据』两种，前者是业务信号要保留，后者才需清洗；删除前必须留痕。"}
          ],
          example:{ title:"用分位数圈出离群单价", code:"q1, q3 = df['unit_price'].quantile([0.25, 0.75])\niqr = q3 - q1\nlow  = q1 - 1.5*iqr;  high = q3 + 1.5*iqr\nabn = df[(df['unit_price']<low)|(df['unit_price']>high)]\nprint(f'离群 {len(abn)} 行，核对是否真实')", note:"IQR 只是提示候选，最终是否处理要回业务确认。" },
          questions:[
            { type:"single", q:"项目里已知商品单价上限是 10000 元，识别录入异常最直接做法是？", opts:["业务阈值过滤+抽查+与业务核对","一律取均值代替","看 describe 就完事","把超阈值整列删除"], answer:0, explain:"已知业务约束就用阈值筛出超界记录，再核对来源与口径，不直接删数。" },
            { type:"predict", q:"IQR=Q3-Q1，常用的离群经验界限是？", opts:["低于 Q1-1.5×IQR 或高于 Q3+1.5×IQR","Q1 以下全部","Q3 以上全部","均值±1 倍标准差"], answer:0, explain:"以 1.5×IQR 为界圈出经验离群范围，作为待确认的候选名单。" },
            { type:"open", q:"核数时发现某商品月销量是全店平均的 10 倍，你会怎么处理？给三条步骤。", refPoints:["回源核对明细/账单与口径","确认是否大促或刷单等真实冲量","如需修正则留痕记录原因而非静默删除"], explain:"先判断是真突出还是脏数据，再决定保留或修正，全程记录处理依据。" }
          ]
        },
        {
          id:"pya-val-recon", title:"跨表核数与独立用户口径", mins:2,
          knowledge:[
            {head:"是什么", body:"核数 = 明细/汇总多份来源对同一指标，验证口径与数字是否一致；常见用 count 总数核对行数、nunique 核对去重后的独立主体数。"},
            {head:"何时用", body:"上线报表前核对明细表累加是否等于汇总表；跨系统对用户数、订单数、GMV 是否对得上。"},
            {head:"易错点", body:"行数与用户数不是一回事：总数要 COUNT，独立用户要 nunique()；两表关联重复会放大行数，先想清唯一性。"}
          ],
          example:{ title:"核对明细与汇总是否一致", code:"sum_detail = df_detail['gmv'].sum()            # 明细逐行加总\nsum_report = df_report['gmv_report'].iloc[0]   # 汇总表值\nprint('相差', sum_detail - sum_report)          # 0 则口径一致\nuv = df_user['user_id'].nunique()               # 独立用户数\nprint('独立用户', uv)", note:"先核对加总，再核对独立用户数，两者口径不同。" },
          questions:[
            { type:"single", q:"报表的订单数 和 明细表行数 对不上，首选排查动作是？", opts:["核对关联键/去重口径、是否漏同步或重复同步","直接改报表数字","两边取平均","忽略不计"], answer:0, explain:"差异多源于口径或同步问题，先查去重与关联逻辑，而不是改数。" },
            { type:"predict", q:"要统计『活跃独立用户数』，应使用？", opts:["df['user_id'].nunique()","len(df)","df['user_id'].count()","sum(df['user_id'])"], answer:0, explain:"nunique() 对 user_id 去重计数，nunique 才是独立用户；len/count 是含重复的总行数。" },
            { type:"sqlfill", q:"补全：求只在表 A 出现、不在表 B 出现的用户数（核对两库同步差异）。", code:"a = set(df_a['user_id']); b = set(df_b['user_id'])\nonly_a = {0}\nprint('A 独有用户', len(only_a))", fillOpts:["a - b","a & b","a | b","a ^ b"], answer:["a - b"], explain:"a-b 表示只在 A 集合、不在 B 集合的元素，用于定位同步差异。" }
          ]
        }
      ]
    }
  ]
}
]);
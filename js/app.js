/* app.js — 启动、hash 路由、视图渲染 */
(function () {
  var $ = function (s) { return document.querySelector(s); };
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  var view = $("#view");

  function toast(msg) {
    var t = $("#toast");
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { t.hidden = true; }, 2200);
  }

  // 视图缓存：避免重复渲染固定 Tab
  var tabCache = {};

  // ---------- 查询/查找 ----------
  function findModule(id) {
    for (var i = 0; i < COURSES.length; i++) if (COURSES[i].id === id) return COURSES[i];
    return null;
  }
  function findLessonById(lessonId) {
    for (var i = 0; i < COURSES.length; i++) {
      var m = COURSES[i];
      for (var j = 0; j < m.topics.length; j++) {
        var tp = m.topics[j];
        for (var k = 0; k < tp.lessons.length; k++) {
          if (tp.lessons[k].id === lessonId) return { module: m, topic: tp, lesson: tp.lessons[k] };
        }
      }
    }
    return null;
  }
  function moduleProgress(m) {
    var all = 0, done = 0;
    m.topics.forEach(function (tp) { tp.lessons.forEach(function (l) { all++; if (AppStore.lessonState(l.id)) done++; }); });
    return { done: done, all: all, pct: all ? Math.round(done / all * 100) : 0 };
  }

  // ---------- 通用头部 ----------
  function header(title, sub) {
    var h = el("header", "pghead");
    var t = el("h1", "", esc(title));
    h.appendChild(t);
    if (sub) h.appendChild(el("div", "sub", esc(sub)));
    return h;
  }

  // ============================================================
  // 技能 Tab —— 首页
  // ============================================================
  function renderSkill() {
    view.innerHTML = "";
    view.appendChild(header("数据分析 · 碎片学习", "零散时间，逐步打牢基础"));
    var wrap = el("div", "mt12");

    // 今日推荐
    var rec = pickRecommended();
    if (rec) {
      var card = el("div", "card mb16");
      card.appendChild(el("div", "badge brand mb8", "今日推荐小课"));
      card.appendChild(el("div", "sec-title", esc(rec.lesson.title)));
      card.appendChild(el("div", "hint mb12", "「" + esc(rec.module.name) + " · " + esc(rec.topic.name) + "」 · 约 " + rec.lesson.mins + " 分钟"));
      var bt = el("button", "btn primary", "开始学习 →");
      bt.onclick = function () { route("/lesson/" + rec.lesson.id); };
      card.appendChild(bt);
      wrap.appendChild(card);
    }

    wrap.appendChild(el("div", "sec-title", "技能模块"));
    var grid = el("div", "modgrid");
    COURSES.forEach(function (m) {
      var md = moduleProgress(m);
      var card = el("button", "mod");
      var name = el("span", "mt", esc(m.name));
      var p = el("span", "mp", md.done + "/" + md.all + " 已完成");
      card.appendChild(name);
      card.appendChild(p);
      var badge = m.level === "seed" ? el("span", "badge seed", "结构化") : el("span", "badge brand", "基础层");
      card.appendChild(badge);
      var pb = el("div", "pbar mt12"); pb.appendChild(el("i", "", ""));
      if (md.pct < 1) pb.querySelector("i").style.width = "3px";
      pb.querySelector("i").style.width = (md.pct || 0) + "%";
      card.appendChild(pb);
      card.onclick = function () { route("/module/" + m.id); };
      grid.appendChild(card);
    });
    wrap.appendChild(grid);

    // 场景 + 回顾 快捷口
    var strip = el("div", "modgrid mt16");
    var scCard = el("button", "mod");
    scCard.appendChild(el("span", "mt", "业务闯关"));
    scCard.appendChild(el("span", "mp", "用业务场景串联知识点"));
    scCard.onclick = function () { setTab("scenario"); };
    var rvCard = el("button", "mod");
    rvCard.appendChild(el("span", "mt", "错题回顾"));
    rvCard.appendChild(el("span", "mp", AppStore.wrongList().length + " 道待订正"));
    rvCard.onclick = function () { setTab("review"); };
    strip.appendChild(scCard); strip.appendChild(rvCard);
    wrap.appendChild(strip);

    view.appendChild(wrap);
  }

  function pickRecommended() {
    var p = null;
    COURSES.forEach(function (m) {
      m.topics.forEach(function (tp) {
        tp.lessons.forEach(function (l) {
          if (!AppStore.lessonState(l.id)) { if (!p) p = { module: m, topic: tp, lesson: l }; }
        });
      });
    });
    return p; // 未完成为准
  }

  // ============================================================
  // 模块详情 —— 主题与课程
  // ============================================================
  function lessonQCount(l) { return (l.questions || (l.quiz ? [l.quiz] : [])).length; }

  // 合并可接插的进阶/扩展数据文件模块
  function mergeExt() {
    if (window.COURSE_EXT && window.COURSE_EXT.length) {
      COURSES = COURSES.concat(window.COURSE_EXT);
    }
    if (window.SCENARIO_EXT && window.SCENARIO_EXT.length) {
      SCENARIOS = SCENARIOS.concat(window.SCENARIO_EXT);
    }
  }

  function renderModule(mid) {
    var m = findModule(mid);
    if (!m) { setTab("skill"); return; }
    view.innerHTML = "";
    view.appendChild(backHome(m.name));
    var wrap = el("div");
    var mp = moduleProgress(m);
    wrap.appendChild(el("div", "hint mb12", "完成度 " + mp.done + "/" + mp.all));
    var pb = el("div", "pbar mb16"); pb.appendChild(el("i", "", ""));
    pb.querySelector("i").style.width = (mp.pct || 0) + "%";
    wrap.appendChild(pb);

    m.topics.forEach(function (tp, ti) {
      wrap.appendChild(el("div", "sec-title", esc(tp.name)));
      tp.lessons.forEach(function (l, li) {
        var row = el("button", "les" + (AppStore.lessonState(l.id) ? " done" : ""));
        var st = el("span", "st", AppStore.lessonState(l.id) ? "✓" : (ti * 3 + li + 1));
        var met = el("span", "met");
        var lt = el("span", "lt", esc(l.title));
        met.appendChild(lt);
        var sub = el("span", "lsub", (AppStore.lessonState(l.id) ? "已完成 · " : "") + "讲解+示例+" + lessonQCount(l) + "题");
        met.appendChild(sub);
        var time = el("span", "time", l.mins + "′");
        row.appendChild(st); row.appendChild(met); row.appendChild(time);
        row.onclick = function () { route("/lesson/" + l.id); };
        wrap.appendChild(row);
      });
      wrap.appendChild(el("div", "spacer8"));
    });
    view.appendChild(wrap);
  }
  function backHome(title) {
    var row = el("div", "backrow");
    var b = el("button", "backbtn", "<span class='arr'>‹</span> 返回技能");
    b.onclick = function () { setTab("skill"); };
    row.appendChild(b);
    var t = el("h1", "", esc(title));
    var w = el("div");
    w.appendChild(row);
    w.appendChild(t);
    return w;
  }

  // ============================================================
  // 课程 4 步流程
  // ============================================================
  function renderLesson(lessonId) {
    var f = findLessonById(lessonId);
    if (!f) { setTab("skill"); return; }
    var m = f.module, tp = f.topic, l = f.lesson;
    var step = { cur: 1 }; // 1知识 2示例 3答题(结束后反馈为第4步)

    view.innerHTML = "";
    var backRow = el("div", "backrow");
    var b = el("button", "backbtn", "<span class='arr'>‹</span> 返回");
    b.onclick = function () { route("/module/" + m.id); };
    backRow.appendChild(b);
    view.appendChild(backRow);

    view.appendChild(el("p", "hint mb8", esc(m.name) + " · " + esc(tp.name)));
    view.appendChild(el("h1", "", esc(l.title)));
    var steps = el("div", "steps mt12");
    ["知识", "示例", "答题", "反馈"].forEach(function (n, i) {
      steps.appendChild(el("div", "step-dot" + (i === 0 ? " on" : "")));
    });
    steps.dataset.dots = "";
    view.appendChild(steps);

    var content = el("div");
    view.appendChild(content);

    function paint() {
      content.innerHTML = "";
      updateDots();
      if (step.cur === 1) drawKnowledge();
      else if (step.cur === 2) drawExample();
      else drawQuiz();
    }
    function updateDots() {
      var cur = step.cur === 3 ? 4 : step.cur; // 答题完成后进入"反馈"展示
      if (step.done) cur = 4;
      var dots = steps.children;
      for (var i = 0; i < dots.length; i++) dots[i].className = "step-dot" + (i < cur ? " on" : "");
    }
    function footBtn(label, fn, secondary) {
      var f = el("button", "btn " + (secondary ? "ghost" : "primary") + " block", label);
      f.onclick = fn;
      return f;
    }
    function drawKnowledge() {
      var card = el("div", "card");
      card.appendChild(el("h2", "", "① 知识卡片"));
      l.knowledge.forEach(function (k) {
        card.appendChild(el("div", "khead", esc(k.head)));
        card.appendChild(el("div", "kbody", esc(k.body)));
      });
      content.appendChild(card);
      content.appendChild(footBtn("下一步：看示例 →", function () { step.cur = 2; paint(); }));
    }
    function drawExample() {
      var card = el("div", "card");
      card.appendChild(el("h2", "", "② 示例演示"));
      card.appendChild(el("p", "hint mb12", esc(l.example.title)));
      card.appendChild(el("pre", "code", highlightCode(l.example.code)));
      if (l.example.note) card.appendChild(el("div", "hint mt12", "注：" + esc(l.example.note)));
      content.appendChild(card);
      var row = el("div", "quiz-foot");
      var back = footBtn("‹ 返回知识", function () { step.cur = 1; paint(); }, true);
      var next = footBtn("去答题 →", function () { step.cur = 3; paint(); }, false);
      row.appendChild(back); row.appendChild(next);
      content.appendChild(row);
    }
    function drawQuiz() {
      var card = el("div", "card");
      content.appendChild(card);
      var qs = l.questions || (l.quiz ? [l.quiz] : []);
      if (!qs.length) { toast("本节暂无题目"); route("/module/" + m.id); return; }
      var qi = { v: 0, answered: 0 };

      function advance() {
        var idx = tp.lessons.indexOf(l);
        var next = tp.lessons[idx + 1];
        if (next) {
          window.location.hash = window.location.hash.replace(l.id, next.id);
        } else {
          toast("本主题已学完，棒！");
          route("/module/" + m.id);
        }
      }
      function recordQuiz(q, ok) {
        qi.answered++;
        AppStore.recordAnswer(l, ok);
        if (!ok && q.type !== "open") {
          AppStore.saveWrong({
            moduleId: m.id, topicId: tp.id, topicName: tp.name,
            lessonId: l.id, title: l.title, type: q.type,
            q: q.q || "", correct: "", explain: q.explain || ""
          });
        }
      }
      function paintQuestion() {
        card.innerHTML = "";
        if (qi.v >= qs.length) {
          var feed = el("div", "feed good", "<div class='ft'>✓ 本节完成</div><div class='fe'>已答 " + qs.length + " 题，掌握「" + esc(l.title) + "」。</div>");
          card.appendChild(feed);
          var doneBtn = el("button", "btn primary block mt16", isLastLesson(m, tp, l) ? "返回本主题" : "下一节 →");
          doneBtn.onclick = advance;
          card.appendChild(doneBtn);
          return;
        }
        var q = qs[qi.v];
        card.appendChild(el("h2", "", "③ 动手答题" + (qs.length > 1 ? " · 第 " + (qi.v + 1) + " / " + qs.length + " 题" : "")));
        var ctx = {
          box: card,
          toast: toast,
          quiz: q,
          result: function (ok) { recordQuiz(q, ok); },
          last: qi.v === qs.length - 1,
          finishLabel: isLastLesson(m, tp, l) ? "返回本主题" : "下一节 →",
          onNext: function () { qi.v++; paintQuestion(); }
        };
        Quiz.render(ctx);
      }
      paintQuestion();
    }

    paint();
  }
  function isLastLesson(m, tp, l) {
    return tp.lessons[tp.lessons.length - 1].id === l.id;
  }
  function highlightCode(code) {
    return esc(code).replace(/^--\s.*$/gm, "<span class='cm'>$&</span>");
  }

  // ============================================================
  // 回顾 Tab
  // ============================================================
  function renderReview() {
    view.innerHTML = "";
    view.appendChild(header("错题回顾", "薄弱点集中回练，先测后学"));
    var wrap = el("div", "mt12");
    var wrong = AppStore.wrongList();
    if (!wrong.length) {
      wrap.appendChild(el("div", "empty", "<div class='big'>暂无错题 🎉</div>继续学，答错的会自动进这里"));
      view.appendChild(wrap);
      return;
    }
    wrap.appendChild(el("div", "hint mb12", "共 " + wrong.length + " 道待订正 · 点进任一题先作答再对照讲解"));
    var list = el("div");
    wrong.forEach(function (w) {
      var row = el("button", "les");
      row.appendChild(el("span", "st", "错"));
      var met = el("span", "met");
      met.appendChild(el("span", "lt", esc(w.title)));
      met.appendChild(el("span", "lsub", typeLabel(w.type) + " · " + esc(w.topicName || "")));
      row.appendChild(met);
      row.appendChild(el("span", "time", "重做"));
      row.onclick = function () { route("/lesson/" + w.lessonId); };
      list.appendChild(row);
    });
    wrap.appendChild(list);
    var clear = el("button", "btn ghost block mt16", "清空错题本");
    clear.onclick = function () {
      var lk = Object.create(null);
      var entries = AppStore.wrongList();
      var ids = [];
      entries.forEach(function (w) { if (!lk[w.lessonId + "|" + w.type]) { lk[w.lessonId + "|" + w.type] = 1; ids.push([w.lessonId, w.type]); } });
      ids.forEach(function (p) { AppStore.removeWrong(p[0], p[1]); });
      toast("已清空错题本");
      renderReview();
    };
    wrap.appendChild(clear);
    view.appendChild(wrap);
  }
  function typeLabel(t) {
    return ({ single: "单选题", predict: "结果预测", sqlfill: "SQL补全", open: "开放短答" })[t] || t;
  }

  // ============================================================
  // 我的 Tab
  // ============================================================
  function renderMine() {
    view.innerHTML = "";
    view.appendChild(header("我的", "学习进度与表现"));
    var wrap = el("div", "mt12");
    var t = AppStore.totals();
    var streak = AppStore.streak();

    var grid = el("div", "stat-grid");
    function stat(v, l) { var s = el("div", "stat"); s.appendChild(el("div", "sv", v)); s.appendChild(el("div", "sl", l)); return s; }
    grid.appendChild(stat(t.done, "已完成小课"));
    grid.appendChild(stat(streak + " 天", "连续打卡"));
    grid.appendChild(stat(t.correct, "答对题数"));
    grid.appendChild(stat(t.acc + "%", "答题正确率"));
    wrap.appendChild(grid);

    // 按模块展示进度
    wrap.appendChild(el("div", "sec-title", "模块进度"));
    COURSES.forEach(function (m) {
      var mp = moduleProgress(m);
      var row = el("div", "progrow");
      row.appendChild(el("span", "", esc(m.name)));
      row.appendChild(el("span", "", mp.done + "/" + mp.all));
      wrap.appendChild(row);
      var pb = el("div", "pbar mb12"); pb.appendChild(el("i", "", ""));
      pb.querySelector("i").style.width = (mp.pct || 0) + "%";
      wrap.appendChild(pb);
    });

    // 设置
    wrap.appendChild(el("div", "sec-title", "设置"));
    var reset = el("button", "btn ghost block", "重置全部学习进度");
    reset.onclick = function () {
      if (window.confirm("确定清空所有进度与错题？")) {
        AppStore.allClear();
        toast("已重置");
        renderMine();
      }
    };
    wrap.appendChild(reset);

    wrap.appendChild(el("div", "divider"));
    wrap.appendChild(el("div", "hint center", "数据存储在本地浏览器，换设备不共享。进阶内容可随时在 data.js 中追加。"));
    view.appendChild(wrap);
  }

  // ============================================================
  // 场景 Tab
  // ============================================================
  function renderScenarioList() {
    view.innerHTML = "";
    view.appendChild(header("业务闯关", "用真实场景串联多个知识点"));
    var wrap = el("div", "mt12");
    SCENARIOS.forEach(function (sc) {
      var card = el("div", "scenario");
      card.appendChild(el("div", "st2", esc(sc.name)));
      card.appendChild(el("div", "sst", esc(sc.desc)));
      var locked = !canUnlock(sc);
      if (AppStore.scenarioDone(sc.id)) {
        card.appendChild(el("span", "badge success", "已通过"));
      } else if (locked) {
        var need = sc.requireLessons.filter(function (id) { return !AppStore.lessonState(id); });
        card.appendChild(el("div", "lock-note", "🔒 需先完成 " + need.length + " 节基础小课可解锁"));
      } else {
        var bt = el("button", "btn primary mt12", "开始闯关 →");
        bt.onclick = function () { route("/scenario/" + sc.id); };
        card.appendChild(bt);
      }
      wrap.appendChild(card);
    });
    view.appendChild(wrap);
  }
  function canUnlock(sc) {
    return sc.requireLessons.every(function (id) { return AppStore.lessonState(id); });
  }
  function renderScenario(scId) {
    var sc = SCENARIOS.filter(function (s) { return s.id === scId; })[0];
    if (!sc) { setTab("scenario"); return; }
    view.innerHTML = "";
    var backRow = el("div", "backrow");
    var b = el("button", "backbtn", "<span class='arr'>‹</span> 返回场景");
    b.onclick = function () { setTab("scenario"); };
    backRow.appendChild(b);
    view.appendChild(backRow);
    view.appendChild(el("h1", "", esc(sc.name)));
    view.appendChild(el("p", "hint mb16", esc(sc.desc)));

    var content = el("div");
    view.appendChild(content);
    var idx = { v: 0 };

    function paint() {
      content.innerHTML = "";
      var card = el("div", "card");
      if (idx.v >= sc.steps.length) {
        card.appendChild(el("div", "feed good", "<div class='ft'>✓ 闯关完成</div><div class='fe'>已串联本轮知识点。对照每题讲解复盘一遍，再进入下一个业务场景。</div>"));
        content.appendChild(card);
        AppStore.markScenario(sc.id);
        var again = null;
        return;
      }
      var st = sc.steps[idx.v];
      card.appendChild(el("p", "hint mb8", "第 " + (idx.v + 1) + " / " + sc.steps.length + " 步"));
      content.appendChild(card);
      var ctx = {
        box: card,
        toast: toast,
        quiz: st,
        result: function () {},
        last: idx.v === sc.steps.length - 1,
        onNext: function () { idx.v++; paint(); }
      };
      Quiz.render(ctx);
    }
    paint();
  }

  // ============================================================
  // 路由
  // ============================================================
  function route(path) { window.location.hash = "#" + path; }
  function handlePath() {
    var path = window.location.hash.replace(/^#/, "") || "/skill";
    var seg = path.split("/").filter(Boolean);
    window.scrollTo(0, 0);
    if (seg[0] === "skill" || !seg.length) { setTab("skill"); }
    else if (seg[0] === "module" && seg[1]) renderModule(seg[1]);
    else if (seg[0] === "lesson" && seg[1]) renderLesson(seg[1]);
    else if (seg[0] === "scenario" && seg[1]) renderScenario(seg[1]);
    else if (seg[0] === "scenario") setTab("scenario");
    else if (seg[0] === "review") setTab("review");
    else if (seg[0] === "mine") setTab("mine");
    else setTab("skill");
  }
  function setTab(name) {
    // 同步 tab 高亮
    var tabs = document.querySelectorAll(".tab");
    tabs.forEach(function (t) {
      t.classList.toggle("is-active", t.dataset.tab === name);
    });
    window.location.hash = "#/" + name;
    if (name === "skill") renderSkill();
    else if (name === "scenario") renderScenarioList();
    else if (name === "review") renderReview();
    else if (name === "mine") renderMine();
  }

  function init() {
    mergeExt();
    // 底部 tab 绑定
    document.querySelectorAll(".tab").forEach(function (t) {
      t.onclick = function () { setTab(t.dataset.tab); };
    });
    window.addEventListener("hashchange", handlePath);
    handlePath();
  }

  document.addEventListener("DOMContentLoaded", init);
  window.App = { route: route, toast: toast };
})();
/* quiz.js — 四类题型渲染与判分：single / predict / sqlfill / open */
(function () {
  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function codeBlock(code, note) {
    const pre = el("pre", "code", esc(code), );
    const wrap = el("div");
    wrap.appendChild(pre);
    if (note) {
      const ne = el("div", "hint mt12", "💡 " + esc(note));
      wrap.appendChild(ne);
    }
    return wrap;
  }

  // ---------- 单选 / 预测结果 ----------
  function renderChoice(ctx, quiz, opts, onAnswer) {
    const box = ctx.box;
    if (quiz.code) box.appendChild(codeBlock(quiz.code, quiz.codeNote));
    if (quiz.table) {
      const t = el("table", "tbl");
      const th = el("tr", "", quiz.table.h.map(h => "<th>" + esc(h) + "</th>").join(""));
      const thead = el("thead");
      thead.appendChild(th);
      t.appendChild(thead);
      const tb = el("tbody");
      quiz.table.rows.forEach(r => {
        const tr = el("tr", "", r.map(c => "<td>" + esc(c) + "</td>").join(""));
        tb.appendChild(tr);
      });
      t.appendChild(tb);
      const cap = el("div", "hint mt12", "参考这张表回答：");
      box.appendChild(cap);
      box.appendChild(t);
    }
    const qEl = el("p", "kbody mt12", esc(quiz.q));
    box.appendChild(qEl);

    let chosen = -1, locked = false;
    opts.forEach((o, i) => {
      const oy = el("span", "oy");
      const txt = el("span", "otxt", esc(o));
      const btn = el("button", "opt");
      btn.appendChild(oy); btn.appendChild(txt);
      btn.onclick = function () {
        if (locked) return;
        chosen = i;
        box.querySelectorAll(".opt").forEach(b => b.classList.remove("sel"));
        btn.classList.add("sel");
      };
      box.appendChild(btn);
    });
    const foot = el("div", "quiz-foot");
    const submit = el("button", "btn primary", "提交答案");
    submit.onclick = function () {
      if (chosen < 0) { ctx.toast("请先选择一个答案"); return; }
      locked = true;
      onAnswer(chosen);
    };
    foot.appendChild(submit);
    box.appendChild(foot);
  }

  // ---------- SQL 补全 ----------
  function renderFill(ctx, quiz, onAnswer) {
    const box = ctx.box;
    const qEl = el("p", "kbody mt12 mb12", esc(quiz.q));
    box.appendChild(qEl);

    const codeParts = quiz.code.split(/(\{\d+\})/);
    const filled = {};      // slotIndex -> optIndex
    const slotOrder = [];   // 填入顺序 optIndex
    const slotEls = [];
    const optUsed = new Set();

    const codeDiv = el("div");
    codeParts.forEach(part => {
      const m = part.match(/^\{(\d+)\}$/);
      if (m) {
        (function (i) {
          const blank = el("span", "blank-token", "____");
          blank.dataset.slot = i;
          blank.onclick = function () {
            const oi = filled[i];
            if (oi == null) return;
            delete filled[i];
            optUsed.delete(oi);
            const idx = slotOrder.indexOf(oi);
            if (idx >= 0) slotOrder.splice(idx, 1);
            blank.textContent = "____";
            blank.classList.remove("filled");
            renderOpts();
          };
          slotEls[i] = blank;
          codeDiv.appendChild(blank);
        })(parseInt(m[1], 10));
      } else {
        codeDiv.appendChild(document.createTextNode(part));
      }
    });
    const codeFill = el("pre", "fill-code");
    codeFill.appendChild(codeDiv);
    box.appendChild(codeFill);

    const chips = el("div", "chips");
    const optsNow = quiz.fillOpts.map((v, i) => ({ v, i }));
    function renderOpts() {
      chips.innerHTML = "";
      optsNow.forEach((o, i) => {
        const used = optUsed.has(i);
        const c = el("button", "chip" + (used ? " used" : ""), o.v);
        c.onclick = function () {
          if (used) return;
          // 填入第一个空槽
          for (let s = 0; s < slotEls.length; s++) {
            if (filled[s] == null) { filled[s] = i; slotOrder.push(i); optUsed.add(i); break; }
          }
          refreshBlanks();
          renderOpts();
        };
        chips.appendChild(c);
      });
    }
    function refreshBlanks() {
      slotEls.forEach((bl, s) => {
        const oi = filled[s];
        if (oi != null) { bl.textContent = optsNow[oi].v; bl.classList.add("filled"); }
        else { bl.textContent = "____"; bl.classList.remove("filled"); }
      });
    }
    box.appendChild(chips);

    const foot = el("div", "quiz-foot");
    const submit = el("button", "btn primary", "提交答案");
    submit.onclick = function () {
      const n = slotEls.length;
      let empty = false;
      for (let s = 0; s < n; s++) if (filled[s] == null) empty = true;
      if (empty) { ctx.toast("请把所有空填完"); return; }
      // 判定：按槽位顺序比 opt 值
      const got = [];
      for (let s = 0; s < n; s++) got.push(optsNow[filled[s]].v);
      onAnswer(got);
    };
    foot.appendChild(submit);
    box.appendChild(foot);
  }

  // ---------- 开放短答 ----------
  function renderOpen(ctx, quiz, onAnswer) {
    const box = ctx.box;
    const qEl = el("p", "kbody mt12 mb12", esc(quiz.q));
    box.appendChild(qEl);
    const ta = el("textarea", "", "");
    ta.placeholder = "在这里写下你的回答…";
    ta.style.width = "100%";
    ta.style.minHeight = "84px";
    ta.style.padding = "10px";
    ta.style.border = "1px solid var(--border)";
    ta.style.borderRadius = "8px";
    ta.style.font = "inherit";
    ta.style.border = "1px solid var(--border)";
    ta.style.resize = "vertical";
    box.appendChild(ta);
    const foot = el("div", "quiz-foot");
    const submit = el("button", "btn primary", "查看参考要点");
    submit.onclick = function () {
      const your = ta.value.trim();
      onAnswer({ your, refs: quiz.refPoints || [], explain: quiz.explain || "" });
    };
    foot.appendChild(submit);
    box.appendChild(foot);
  }

  // ---------- 渲染与反馈 ----------
  function showFeedback(ctx, quiz, ok, detail) {
    const box = ctx.box;
    box.querySelectorAll(".opt.final").forEach(b => b.classList.remove("final"));
    const feed = el("div", "feed " + (ok ? "good" : "bad"));
    const ft = el("div", "ft", ok ? "✓ 回答正确" : "✗ 回答有误，别灰心");
    feed.appendChild(ft);
    if (detail) {
      const dd = el("div", "fe", detail);
      feed.appendChild(dd);
    }
    if (quiz.explain) {
      feed.appendChild(el("div", "fe mt12", "讲解：" + esc(quiz.explain)));
    }
    if (quiz.refPoints) {
      const rp = el("div", "fe mt12");
      rp.appendChild(el("div", "", "参考要点："));
      const ul = el("ul");
      quiz.refPoints.forEach(r => ul.appendChild(el("li", "", "· " + esc(r))));
      rp.appendChild(ul);
      feed.appendChild(rp);
    }
    box.appendChild(feed);
    const btn = el("button", "btn primary block mt16", ctx.last ? (ctx.finishLabel || "完成本节") : (ctx.nextLabel || "下一题"));
    btn.onclick = ctx.onNext;
    box.appendChild(btn);
  }

  // 对外入口：在 ctx.box 渲染
  function render(ctx) {
    const box = ctx.box;
    box.innerHTML = "";
    const quiz = ctx.quiz;

    const top = el("div", "pghead");
    box.appendChild(top);

    if (quiz.type === "single") {
      renderChoice(ctx, quiz, quiz.opts, (i) => {
        const ok = i === quiz.answer;
        ctx.result(ok);
        // mark options
        box.querySelectorAll(".opt").forEach((b, idx) => {
          b.classList.add("final");
          if (idx === quiz.answer) b.classList.add("correct");
          if (idx === i && !ok) b.classList.add("wrong");
          if (idx !== i && idx !== quiz.answer) b.classList.add("dim");
        });
        showFeedback(ctx, quiz, ok, ok ? null : ("正确答案：" + quiz.opts[quiz.answer]));
      });
    }
    else if (quiz.type === "predict") {
      renderChoice(ctx, quiz, quiz.opts, (i) => {
        const ok = i === quiz.answer;
        ctx.result(ok);
        box.querySelectorAll(".opt").forEach((b, idx) => {
          b.classList.add("final");
          if (idx === quiz.answer) b.classList.add("correct");
          if (idx === i && !ok) b.classList.add("wrong");
          if (idx !== i && idx !== quiz.answer) b.classList.add("dim");
        });
        showFeedback(ctx, quiz, ok, ok ? null : ("正确结果：" + quiz.opts[quiz.answer]));
      });
    }
    else if (quiz.type === "sqlfill") {
      renderFill(ctx, quiz, (got) => {
        const ok = JSON.stringify(got) === JSON.stringify(quiz.answer);
        ctx.result(ok);
        // 展示正确写法
        const correct = quiz.answer.map(a => esc(a)).join("  |  ");
        showFeedback(ctx, quiz, ok, (ok ? null : ("正确填法：" + correct)));
      });
    }
    else if (quiz.type === "open") {
      renderOpen(ctx, quiz, (r) => {
        ctx.result(true); // 开放题型不算错；作为完成
        showFeedback(ctx, quiz, true, "已记录你的回答。对照参考要点自查理解即可。");
      });
    }
  }

  window.Quiz = { render: render };
})();
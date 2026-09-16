/* store.js — localStorage 状态封装：进度 / 错题 / 统计 / 连续打卡 */
(function () {
  const KEY = "da_learn_state_v1";

  function todayStr() {
    const d = new Date();
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function dayOffset(o) {
    const t = new Date(todayStr() + "T00:00:00");
    t.setDate(t.getDate() - (o || 0));
    return t.getFullYear() + "-" + pad(t.getMonth() + 1) + "-" + pad(t.getDate());
  }

  const defaults = {
    doneLessons: {},   // lessonId -> {at, tried, wrong}
    wrong: [],         // [{moduleId, topicId, lessonId, title, type, q, your, correct, explain, at}]
    scenarioDone: {},  // scenarioId -> true
    days: [],          // [ 'YYYY-MM-DD' ] 打卡活跃日
    stats: { correct: 0, wrong: 0 }
  };

  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return JSON.parse(JSON.stringify(defaults));
      const d = Object.assign(JSON.parse(JSON.stringify(defaults)), JSON.parse(raw));
      if (!d.days) d.days = []; if (!d.scenarioDone) d.scenarioDone = {};
      if (!d.stats) d.stats = { correct: 0, wrong: 0 };
      return d;
    } catch (e) { return JSON.parse(JSON.stringify(defaults)); }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }
  function markActiveDay() {
    const t = todayStr();
    if (state.days.indexOf(t) === -1) {
      state.days.push(t);
      if (state.days.length > 366) state.days = state.days.slice(-366);
      save();
    }
  }

  const Store = {
    // 答题结果：correct=bool
    recordAnswer(lesson, ok) {
      markActiveDay();
      const id = lesson.id;
      const cur = state.doneLessons[id] || { at: 0, tried: 0, wrong: 0 };
      cur.tried += 1;
      if (!ok) cur.wrong += 1;
      cur.at = Date.now();
      state.doneLessons[id] = cur;
      state.stats[ok ? "correct" : "wrong"] += 1;
      save();
    },
    saveWrong(entry) {
      markActiveDay();
      entry.at = Date.now();
      state.wrong.unshift(entry);
      if (state.wrong.length > 200) state.wrong = state.wrong.slice(0, 200);
      save();
    },
    removeWrong(lessonId, type) {
      const seen = {};
      const filtered = state.wrong.filter(w => w.lessonId !== lessonId || (type && w.type !== type));
      // 同一课+同类型只保留最新一条
      const out = [];
      for (let i = filtered.length - 1; i >= 0; i--) {
        const w = filtered[i];
        const k = w.lessonId + "|" + (w.type || "");
        if (!seen[k]) { seen[k] = true; out.unshift(w); }
      }
      state.wrong = out;
      save();
    },
    wrongList() { return state.wrong.slice(); },
    lessonState(id) { return state.doneLessons[id] || null; },
    doneSet() { return Object.keys(state.doneLessons); },
    scenarioDone: function (id) { return !!state.scenarioDone[id]; },
    markScenario: function (id) { state.scenarioDone[id] = true; markActiveDay(); save(); },
    totals() {
      const done = Object.keys(state.doneLessons).length;
      const correct = state.stats.correct;
      const wrong = state.stats.wrong;
      const total = correct + wrong;
      return { done, correct, wrong, acc: total ? Math.round((correct / total) * 100) : 0 };
    },
    streak() {
      let n = 0;
      if (state.days.indexOf(todayStr()) === -1 && state.days.indexOf(dayOffset(1)) === -1) return 0;
      let off = state.days.indexOf(todayStr()) !== -1 ? 0 : 1;
      while (state.days.indexOf(dayOffset(off)) !== -1) { n++; off++; }
      return n;
    },
    allClear() {
      state = JSON.parse(JSON.stringify(defaults));
      save();
    }
  };

  window.AppStore = Store;
})();
import { getCurrentScope as It, markRaw as Lt, onScopeDispose as Ht, reactive as ft, toRaw as B, watch as zt } from "vue";
var H = (t, r) => Object.prototype.hasOwnProperty.call(t, r), d = (t) => {
  if (t === null || typeof t != "object") return !1;
  const r = Object.getPrototypeOf(B(t));
  return r === Object.prototype || r === null;
}, z = (t) => t !== null && typeof t == "object", Kt = (t) => String(t), h = (t) => {
  const r = B(t);
  if (Array.isArray(r)) return r.map((e) => h(e));
  if (d(r)) {
    const e = {};
    return Object.keys(r).forEach((o) => {
      e[o] = h(r[o]);
    }), e;
  }
  return r;
}, T = (t, r) => {
  if (r === void 0) return h(t);
  if (Array.isArray(r) || !d(t) || !d(r)) return h(r);
  const e = h(t);
  return Object.keys(r).forEach((o) => {
    if (d(e[o]) && d(r[o])) {
      e[o] = T(e[o], r[o]);
      return;
    }
    e[o] = h(r[o]);
  }), e;
}, K = (t, r) => {
  const e = Kt(r);
  if (!z(t)) return {
    exists: !1,
    value: void 0,
    segments: []
  };
  const o = B(t);
  if (H(o, e)) return {
    exists: !0,
    value: o[e],
    segments: [e]
  };
  const n = e.split(".");
  let c = o;
  const a = [];
  for (let i = 0; i < n.length; i += 1) {
    if (!z(c)) return {
      exists: !1,
      value: void 0,
      segments: a
    };
    const p = n.slice(i).join("."), E = B(c);
    if (H(E, p)) return {
      exists: !0,
      value: E[p],
      segments: [...a, p]
    };
    const y = n[i];
    if (!H(E, y)) return {
      exists: !1,
      value: void 0,
      segments: a
    };
    c = E[y], a.push(y);
  }
  return {
    exists: !0,
    value: c,
    segments: a
  };
}, O = (t, r) => {
  const e = K(t, r);
  return e.exists ? e.value : void 0;
}, dt = (t, r, e) => {
  if (r.length === 0) return;
  let o = t;
  r.forEach((n, c) => {
    if (c === r.length - 1) {
      o[n] = h(e);
      return;
    }
    (!z(o[n]) || Array.isArray(o[n])) && (o[n] = {}), o = o[n];
  });
}, ht = (t, r) => {
  const e = K(t, r);
  if (!e.exists || e.segments.length === 0) return;
  let o = t;
  for (let n = 0; n < e.segments.length - 1; n += 1) o = o?.[e.segments[n]];
  z(o) && delete o[e.segments[e.segments.length - 1]];
}, Gt = (t, r) => {
  const e = {};
  return r.forEach((o) => {
    const n = K(t, o);
    n.exists && dt(e, n.segments, n.value);
  }), e;
}, q = (t, r) => {
  if (t instanceof FormData) return t;
  let e = r?.only !== void 0 ? Gt(t, r.only) : h(t);
  return r?.omit?.forEach((o) => {
    ht(e, o);
  }), e;
}, L = (t, r) => t instanceof FormData ? null : q(t, { omit: r }), R = (t, r) => {
  const e = B(t), o = B(r);
  if (Object.is(e, o)) return !0;
  if (Array.isArray(e) || Array.isArray(o))
    return !Array.isArray(e) || !Array.isArray(o) || e.length !== o.length ? !1 : e.every((n, c) => R(n, o[c]));
  if (d(e) || d(o)) {
    if (!d(e) || !d(o)) return !1;
    const n = Object.keys(e), c = Object.keys(o);
    return n.length !== c.length ? !1 : n.every((a) => H(o, a) && R(e[a], o[a]));
  }
  return !1;
}, mt = (t, r) => {
  if (R(t, r)) return {};
  if (Array.isArray(t) || !d(t) || !d(r)) return h(t);
  const e = {};
  return Object.keys(t).forEach((o) => {
    if (!R(t[o], r[o])) {
      if (d(t[o]) && d(r[o])) {
        const n = mt(t[o], r[o]);
        if (d(n) && Object.keys(n).length === 0) return;
        e[o] = n;
        return;
      }
      e[o] = h(t[o]);
    }
  }), e;
}, gt = (t, r, e = "") => {
  if (R(t, r)) return [];
  if (!d(t) || !d(r)) return e ? [e] : [];
  const o = /* @__PURE__ */ new Set([...Object.keys(t), ...Object.keys(r)]), n = [];
  return o.forEach((c) => {
    const a = e ? `${e}.${c}` : c;
    n.push(...gt(t[c], r[c], a));
  }), n;
}, Q = (t) => t == null ? [] : Array.isArray(t) ? t.flatMap((r) => Q(r)).filter((r) => typeof r == "string") : typeof t == "string" ? [t] : typeof t == "number" || typeof t == "boolean" ? [String(t)] : d(t) ? Object.values(t).flatMap((r) => Q(r)) : [], pt = (t, r = "") => t == null ? [] : Array.isArray(t) || typeof t == "string" ? r ? [r] : [] : d(t) ? Object.keys(t).flatMap((e) => {
  const o = r ? `${r}.${e}` : e;
  return pt(t[e], o);
}) : r ? [r] : [], $ = class extends Error {
  constructor(t) {
    super(t.message ?? "Request failed"), this.name = "ApixError", this.httpCode = t.httpCode, this.body = t.body, this.aborted = !!t.aborted, this.timeout = !!t.timeout, this.cause = t.cause, this.errorBag = t.errors ?? t.body?.errors ?? {};
  }
  error(t) {
    return this.errors(t)[0] ?? null;
  }
  errors(t) {
    if (t === void 0) return this.errorBag;
    const r = O(this.errorBag, t);
    return Q(r);
  }
  keys() {
    return pt(this.errorBag);
  }
  has(t) {
    return (Array.isArray(t) ? t : [t]).some((r) => this.error(r) !== null);
  }
  firstKey() {
    return this.keys()[0] ?? null;
  }
}, Jt = (t, r = "Request failed") => {
  if (typeof t?.message == "string") return t.message;
  if (Array.isArray(t?.messages)) {
    const e = t.messages[0];
    if (typeof e == "string") return e;
    if (typeof e?.message == "string") return e.message;
  }
  return typeof t == "string" && t.trim() ? t : r;
}, Nt = (t) => t?.errors ?? {}, Ut = (t) => (t ?? "GET").toString().toUpperCase(), V = (t) => t === "GET" || t === "HEAD", S = (t) => typeof t == "function" ? t() : t, _t = (t, r, e) => {
  const o = new Headers(t), n = (c) => {
    c && new Headers(c).forEach((a, i) => {
      o.set(i, a);
    });
  };
  return n(S(r)), n(S(e)), o;
}, X = (t, r, e) => {
  if (e !== void 0) {
    if (e === null) {
      t.append(r, "");
      return;
    }
    if (e instanceof Date) {
      t.append(r, e.toISOString());
      return;
    }
    if (Array.isArray(e)) {
      e.forEach((o) => X(t, r, o));
      return;
    }
    if (typeof e == "object") {
      Object.keys(e).forEach((o) => {
        X(t, `${r}.${o}`, e[o]);
      });
      return;
    }
    t.append(r, String(e));
  }
}, Qt = (t, r) => {
  if (!r || Object.keys(r).length === 0) return t;
  const [e, o = ""] = t.split("#"), n = e.includes("?") ? "&" : "?", c = new URLSearchParams();
  Object.keys(r).forEach((i) => {
    X(c, i, r[i]);
  });
  const a = c.toString();
  return a ? `${e}${n}${a}${o ? `#${o}` : ""}` : t;
}, Vt = (t, r) => r ? /^(https?:)?\/\//i.test(r) || !t ? r : r.startsWith("?") || r.startsWith("#") ? `${t}${r}` : t.endsWith("/") && r.startsWith("/") ? `${t}${r.slice(1)}` : !t.endsWith("/") && !r.startsWith("/") ? `${t}/${r}` : `${t}${r}` : t, it = (t, r) => {
  if (!r || Object.keys(r).length === 0) return t;
  if (t instanceof FormData) {
    const e = new FormData();
    return t.forEach((o, n) => {
      e.append(n, o);
    }), Object.keys(r).forEach((o) => {
      const n = r[o];
      if (n !== void 0) {
        if (n instanceof Blob) {
          e.append(o, n);
          return;
        }
        if (typeof n == "object" && n !== null) {
          e.append(o, JSON.stringify(n));
          return;
        }
        e.append(o, n === null ? "" : String(n));
      }
    }), e;
  }
  return d(t) ? T(r, t) : t ?? h(r);
}, Xt = (t, r) => {
  let e = !1;
  return t.forEach((o, n) => {
    n.toLowerCase() === r.toLowerCase() && (e = !0);
  }), e;
}, Yt = (t, r, e) => {
  if (!V(t) && r != null)
    return r instanceof FormData || typeof r == "string" || r instanceof Blob || r instanceof ArrayBuffer ? r : (Xt(e, "content-type") || e.set("content-type", "application/json"), JSON.stringify(r));
}, Zt = async (t) => {
  if (t.status === 204 || t.status === 205) return;
  const r = await t.text();
  if (r) {
    if ((t.headers.get("content-type") ?? "").includes("json")) return JSON.parse(r);
    try {
      return JSON.parse(r);
    } catch {
      return r;
    }
  }
}, yt = (t) => typeof FormData < "u" && t instanceof FormData, x = (t) => yt(t) ? Lt(t) : h(t), _ = (t) => {
  const r = S(t.default);
  return x(r === void 0 ? null : r);
}, ut = (t, r) => typeof t == "string" ? {
  url: t,
  options: r
} : { options: t }, lt = (t, r) => {
  if (!t) return null;
  const e = t === !0 ? {} : t;
  return {
    debounce: e.debounce ?? 100,
    only: e.only === void 0 ? r.only : e.only,
    omit: e.omit === void 0 ? r.omit : e.omit
  };
}, kt = (t, r) => r === void 0 ? t.length > 0 : r.length === 0 ? !1 : t.some((e) => r.some((o) => {
  const n = String(o);
  return e === n || e.startsWith(`${n}.`);
})), tr = async (t, r, e, o, n, c, a) => {
  let i = e.path === void 0 ? t : O(t, e.path);
  const p = e.after;
  return p && (i = await p(i, {
    model: r,
    options: e,
    url: o,
    method: n,
    ok: c,
    status: a
  })), q(i, e.response);
}, ct = (t, r, e = {}, o = "json") => {
  const n = {
    immediate: o !== "formData",
    abort: !0,
    locked: !1,
    snapshot: o !== "formData",
    clearErrorOnChange: !0,
    ...e
  }, c = _(n), a = ft({
    data: c,
    processing: !1,
    httpCode: null,
    message: null
  }), i = {
    stops: [],
    controller: null,
    timeoutId: null,
    disposed: !1,
    requestId: 0,
    latestAppliedRequestId: 0,
    activeLocalRequests: 0,
    currentPromise: null,
    original: n.snapshot === !1 ? null : L(a.data, n.omit),
    lastError: null,
    muteWatch: 0,
    bodyType: o
  };
  let p = h(a.data), E = null, y = null;
  const Y = (s) => {
    i.muteWatch += 1;
    try {
      s(), p = h(a.data);
      const u = lt(n.watch, n);
      E = u ? q(a.data, {
        only: u.only,
        omit: u.omit
      }) : null;
    } finally {
      queueMicrotask(() => {
        i.muteWatch = Math.max(0, i.muteWatch - 1);
      });
    }
  }, Z = (s) => {
    a.processing !== s && (a.processing = s, n.onProcessing?.(s, a));
  }, vt = () => {
    i.activeLocalRequests += 1, t.activeRequests += 1, Z(!0);
  }, bt = () => {
    i.activeLocalRequests = Math.max(0, i.activeLocalRequests - 1), t.activeRequests = Math.max(0, t.activeRequests - 1), Z(i.activeLocalRequests > 0);
  }, Et = () => {
    n.snapshot === !1 || yt(a.data) || (i.original = L(a.data, n.omit));
  }, G = () => {
    a.message = null, i.lastError = null;
  }, D = () => i.lastError, J = (s) => {
    i.lastError = s, a.message = s?.message ?? null;
  }, At = () => D()?.errors() ?? {}, k = (s, u) => d(s) ? {
    ...s,
    errors: u
  } : { errors: u }, tt = (s) => {
    const u = D();
    if (!u) return;
    const l = h(u.errors());
    if (ht(l, s), new $({
      httpCode: u.httpCode,
      body: k(u.body, l),
      message: u.message,
      errors: l,
      aborted: u.aborted,
      timeout: u.timeout
    }).keys().length === 0) {
      G();
      return;
    }
    J(new $({
      httpCode: u.httpCode,
      body: k(u.body, l),
      message: u.message,
      errors: l,
      aborted: u.aborted,
      timeout: u.timeout
    }));
  }, Dt = (s) => {
    const u = D();
    u && u.keys().forEach((l) => {
      (l === s || l.startsWith(`${s}.`) || s.startsWith(`${l}.`)) && tt(l);
    });
  }, wt = (s) => {
    a.data = x(s);
  }, qt = (s) => {
    if (Array.isArray(a.data)) {
      a.data.push(s);
      return;
    }
    if (d(a.data) && d(s)) {
      a.data = T(a.data, s);
      return;
    }
    a.data = x(s);
  }, Rt = (s, u, l) => {
    i.bodyType !== "formData" && s !== void 0 && Y(() => {
      const m = u === "reload" ? _(l) : x(a.data);
      a.data = T(m, s);
    });
  }, rt = (s, u, l = !1, m = !1) => {
    Y(() => {
      if (!u?.only && !u?.omit && l) {
        const v = x(s);
        m && d(v) && n.omit?.forEach((b) => {
          const j = K(a.data, b);
          j.exists && dt(v, j.segments, j.value);
        }), a.data = v;
        return;
      }
      const f = q(s, u);
      a.data = T(a.data, f);
    });
  }, jt = (s) => {
    n.snapshot === !1 || i.original === null || rt(i.original, s, !0, !0);
  }, Pt = (s) => {
    rt(_(n), s, !0);
  }, et = (s) => {
    if (n.snapshot === !1 || i.original === null) return !1;
    const u = L(a.data, n.omit);
    return s !== void 0 ? n.omit?.some((l) => String(l) === String(s)) ? !1 : !R(O(u, s), O(i.original, s)) : !R(u, i.original);
  }, Ct = (s) => n.snapshot === !1 || i.original === null ? s === void 0 ? null : void 0 : h(s === void 0 ? i.original : O(i.original, s)), Ot = (s) => {
    if (n.snapshot === !1 || i.original === null) return s === void 0 ? {} : void 0;
    const u = L(a.data, n.omit);
    return s !== void 0 ? et(s) ? h(O(u, s)) : void 0 : mt(u, i.original);
  }, St = (s, u) => {
    const l = {
      ...n,
      ...s,
      method: u ?? s?.method ?? n.method
    };
    return {
      ...l,
      params: S(l.params),
      headers: S(l.headers),
      body: S(l.body)
    };
  }, Bt = async (s, u, l, m) => {
    if (s.body !== void 0) return s.body;
    if (u === "reload") return;
    let f = i.bodyType === "formData" ? a.data : q(a.data, {
      only: s.only,
      omit: s.omit
    });
    return s.before && (f = await s.before(f, {
      model: a,
      options: s,
      url: l,
      method: m
    })), f;
  }, N = (s) => new $({
    httpCode: s.httpCode ?? null,
    body: s.body,
    message: s.message ?? Jt(s.body, s.fallback),
    errors: s.errors ?? Nt(s.body),
    aborted: s.aborted,
    timeout: s.timeout,
    cause: s.cause
  }), M = (s) => {
    if (i.disposed) return Promise.reject(N({
      httpCode: null,
      message: "Model has been stopped",
      aborted: !0
    }));
    const u = i.requestId + 1, l = s.options, m = Ut(l?.method ?? s.method ?? n.method ?? "GET"), f = St(l, m);
    if (f.locked && a.processing && i.currentPromise) return i.currentPromise;
    i.requestId = u, f.abort && i.controller && i.controller.abort();
    const v = new AbortController();
    i.controller = v;
    let b = !1, j = null, F;
    return F = (async () => {
      vt();
      try {
        const A = Vt(t.baseUrl, s.url ?? l?.url ?? r), P = await Bt(f, s.mode, A, m), w = _t(t.headers, n.headers, l?.headers), Tt = V(m) ? P : it(P, f.params), Mt = V(m) ? it(P, f.params) : void 0, U = Qt(A, Mt), Ft = Yt(m, Tt, w);
        f.timeout && f.timeout > 0 && (i.timeoutId = setTimeout(() => {
          b = !0, v.abort();
        }, f.timeout));
        const g = await fetch(U, {
          method: m,
          headers: w,
          body: Ft,
          signal: v.signal
        });
        let I = await Zt(g);
        for (const C of t.transformers) I = await C({
          body: I,
          ok: g.ok,
          status: g.status,
          statusText: g.statusText,
          headers: g.headers,
          url: U,
          method: m,
          response: g
        });
        const nt = u === i.requestId;
        if (!g.ok) {
          const C = N({
            httpCode: g.status,
            body: I,
            fallback: g.statusText
          });
          throw j = C, nt && (a.httpCode = g.status, J(C)), f.onError?.(C, a), C;
        }
        const at = await tr(I, a, f, U, m, g.ok, g.status);
        return nt && (a.httpCode = g.status, G(), Rt(at, s.mode, f), Et(), i.latestAppliedRequestId = u), f.onSuccess?.(at, a), a.data;
      } catch (A) {
        const P = typeof DOMException < "u" && A instanceof DOMException ? A.name === "AbortError" : A?.name === "AbortError", w = A instanceof $ ? A : N({
          httpCode: null,
          body: void 0,
          message: b ? "Request timed out" : P ? "Request aborted" : void 0,
          fallback: "Request failed",
          aborted: P,
          timeout: b,
          cause: A
        });
        throw j = w, (!P || b) && (u === i.requestId && (a.httpCode = w.httpCode, J(w)), A instanceof $ || f.onError?.(w, a)), w;
      } finally {
        i.timeoutId && (clearTimeout(i.timeoutId), i.timeoutId = null), i.controller === v && (i.controller = null), bt(), f.onFinish?.(a, j), i.currentPromise === F && (i.currentPromise = null);
      }
    })(), i.currentPromise = F, F;
  }, Wt = (s, u) => {
    const l = ut(s, u);
    return M({
      url: l.url,
      options: l.options,
      mode: "send"
    });
  }, W = (s, u, l) => {
    const m = ut(u, l);
    return M({
      url: m.url,
      options: m.options,
      method: s,
      mode: "send"
    });
  }, $t = (s) => M({
    options: s,
    mode: "reload"
  }), st = (s) => M({
    options: s,
    mode: "send"
  }), ot = () => {
    i.disposed = !0, i.stops.forEach((s) => s()), i.stops = [], y && (clearTimeout(y), y = null), i.controller?.abort();
  }, xt = () => {
    const s = lt(n.watch, n), u = !!s, l = n.clearErrorOnChange !== !1;
    if (!u && !l) return;
    E = s ? q(a.data, {
      only: s.only,
      omit: s.omit
    }) : null;
    const m = zt(() => a.data, () => {
      const f = h(a.data);
      if (i.muteWatch > 0) {
        p = f, E = s ? q(a.data, {
          only: s.only,
          omit: s.omit
        }) : null;
        return;
      }
      const v = gt(f, p);
      if (l && v.forEach((b) => Dt(b)), u && s) {
        const b = q(a.data, {
          only: s.only,
          omit: s.omit
        });
        kt(v, s.only) && !R(b, E) && (y && clearTimeout(y), y = setTimeout(() => {
          y = null, a.send().catch(() => {
          });
        }, s.debounce ?? 100)), E = b;
      }
      p = f;
    }, { deep: !0 });
    i.stops.push(m);
  };
  return Object.assign(a, {
    request: Wt,
    get: (s, u) => W("GET", s, u),
    post: (s, u) => W("POST", s, u),
    put: (s, u) => W("PUT", s, u),
    patch: (s, u) => W("PATCH", s, u),
    delete: (s, u) => W("DELETE", s, u),
    reload: $t,
    refresh: st,
    send: st,
    setData: wt,
    push: qt,
    reset: jt,
    default: Pt,
    isDirty: et,
    getOriginal: Ct,
    getDirty: Ot,
    error: (s) => D()?.error(s) ?? null,
    errors: (s) => s === void 0 ? At() : D()?.errors(s) ?? [],
    errorKeys: () => D()?.keys() ?? [],
    hasErrors: (s) => D()?.has(s) ?? !1,
    firstErrorKey: () => D()?.firstKey() ?? null,
    getError: () => D(),
    clearError: tt,
    clearErrors: G,
    stop: ot
  }), xt(), It() && Ht(ot), n.immediate !== !1 && queueMicrotask(() => {
    i.disposed || a.reload().catch(() => {
    });
  }), a;
}, er = () => {
  const t = ft({
    baseUrl: "",
    headers: {},
    activeRequests: 0,
    transformers: []
  }), r = {
    get activeRequests() {
      return t.activeRequests;
    },
    get processing() {
      return t.activeRequests > 0;
    },
    setBaseUrl(e) {
      return t.baseUrl = e, r;
    },
    setHeaders(e) {
      return t.headers = e, r;
    },
    setHeader(e, o) {
      const n = new Headers(t.headers);
      return typeof e == "string" ? n.set(e, o ?? "") : new Headers(e).forEach((c, a) => {
        n.set(a, c);
      }), t.headers = n, r;
    },
    transformResponse(e) {
      return t.transformers.push(e), r;
    },
    create(e, o = {}) {
      return ct(t, e, o, "json");
    },
    createModel(e, o = {}) {
      return r.create(e, o);
    },
    createCollection(e, o = {}) {
      return r.create(e, {
        default: () => [],
        snapshot: !1,
        ...o
      });
    },
    createForm(e, o = {}) {
      return ct(t, e, {
        default: () => new FormData(),
        immediate: !1,
        method: "POST",
        snapshot: !1,
        ...o
      }, "formData");
    }
  };
  return r;
};
export {
  $ as ApixError,
  er as createApix
};

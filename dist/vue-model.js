import { getCurrentScope as It, markRaw as Lt, onScopeDispose as Ht, reactive as ft, toRaw as S, watch as zt } from "vue";
var z = (t, r) => Object.prototype.hasOwnProperty.call(t, r), d = (t) => {
  if (t === null || typeof t != "object") return !1;
  const r = Object.getPrototypeOf(S(t));
  return r === Object.prototype || r === null;
}, K = (t) => t !== null && typeof t == "object", Kt = (t) => String(t), h = (t) => {
  const r = S(t);
  if (Array.isArray(r)) return r.map((e) => h(e));
  if (d(r)) {
    const e = {};
    return Object.keys(r).forEach((o) => {
      e[o] = h(r[o]);
    }), e;
  }
  return r;
}, x = (t, r) => {
  if (r === void 0) return h(t);
  if (Array.isArray(r) || !d(t) || !d(r)) return h(r);
  const e = h(t);
  return Object.keys(r).forEach((o) => {
    if (d(e[o]) && d(r[o])) {
      e[o] = x(e[o], r[o]);
      return;
    }
    e[o] = h(r[o]);
  }), e;
}, U = (t, r) => {
  const e = Kt(r);
  if (!K(t)) return {
    exists: !1,
    value: void 0,
    segments: []
  };
  const o = S(t);
  if (z(o, e)) return {
    exists: !0,
    value: o[e],
    segments: [e]
  };
  const n = e.split(".");
  let c = o;
  const a = [];
  for (let i = 0; i < n.length; i += 1) {
    if (!K(c)) return {
      exists: !1,
      value: void 0,
      segments: a
    };
    const p = n.slice(i).join("."), E = S(c);
    if (z(E, p)) return {
      exists: !0,
      value: E[p],
      segments: [...a, p]
    };
    const y = n[i];
    if (!z(E, y)) return {
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
  const e = U(t, r);
  return e.exists ? e.value : void 0;
}, dt = (t, r, e) => {
  if (r.length === 0) return;
  let o = t;
  r.forEach((n, c) => {
    if (c === r.length - 1) {
      o[n] = h(e);
      return;
    }
    (!K(o[n]) || Array.isArray(o[n])) && (o[n] = {}), o = o[n];
  });
}, ht = (t, r) => {
  const e = U(t, r);
  if (!e.exists || e.segments.length === 0) return;
  let o = t;
  for (let n = 0; n < e.segments.length - 1; n += 1) o = o?.[e.segments[n]];
  K(o) && delete o[e.segments[e.segments.length - 1]];
}, Gt = (t, r) => {
  const e = {};
  return r.forEach((o) => {
    const n = U(t, o);
    n.exists && dt(e, n.segments, n.value);
  }), e;
}, w = (t, r) => {
  if (t instanceof FormData) return t;
  let e = r?.only !== void 0 ? Gt(t, r.only) : h(t);
  return r?.omit?.forEach((o) => {
    ht(e, o);
  }), e;
}, L = (t, r) => t instanceof FormData ? null : w(t, { omit: r }), j = (t, r) => {
  const e = S(t), o = S(r);
  if (Object.is(e, o)) return !0;
  if (Array.isArray(e) || Array.isArray(o))
    return !Array.isArray(e) || !Array.isArray(o) || e.length !== o.length ? !1 : e.every((n, c) => j(n, o[c]));
  if (d(e) || d(o)) {
    if (!d(e) || !d(o)) return !1;
    const n = Object.keys(e), c = Object.keys(o);
    return n.length !== c.length ? !1 : n.every((a) => z(o, a) && j(e[a], o[a]));
  }
  return !1;
}, mt = (t, r) => {
  if (j(t, r)) return {};
  if (Array.isArray(t) || !d(t) || !d(r)) return h(t);
  const e = {};
  return Object.keys(t).forEach((o) => {
    if (!j(t[o], r[o])) {
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
  if (j(t, r)) return [];
  if (!d(t) || !d(r)) return e ? [e] : [];
  const o = /* @__PURE__ */ new Set([...Object.keys(t), ...Object.keys(r)]), n = [];
  return o.forEach((c) => {
    const a = e ? `${e}.${c}` : c;
    n.push(...gt(t[c], r[c], a));
  }), n;
}, G = (t) => t == null ? [] : Array.isArray(t) ? t.flatMap((r) => G(r)).filter((r) => typeof r == "string") : typeof t == "string" ? [t] : typeof t == "number" || typeof t == "boolean" ? [String(t)] : d(t) ? Object.values(t).flatMap((r) => G(r)) : [], pt = (t, r = "") => t == null ? [] : Array.isArray(t) || typeof t == "string" ? r ? [r] : [] : d(t) ? Object.keys(t).flatMap((e) => {
  const o = r ? `${r}.${e}` : e;
  return pt(t[e], o);
}) : r ? [r] : [], W = class extends Error {
  constructor(t) {
    super(t.message ?? "Request failed"), this.name = "ApixError", this.httpCode = t.httpCode, this.body = t.body, this.aborted = !!t.aborted, this.timeout = !!t.timeout, this.cause = t.cause, this.errorBag = t.errors ?? t.body?.errors ?? {};
  }
  error(t) {
    return this.errors(t)[0] ?? null;
  }
  errors(t) {
    if (t === void 0) return this.errorBag;
    if (Array.isArray(t)) return t.flatMap((e) => G(O(this.errorBag, e)));
    const r = O(this.errorBag, t);
    return G(r);
  }
  keys() {
    return pt(this.errorBag);
  }
  has(t) {
    return this.error(t) !== null;
  }
  firstKey() {
    return this.keys()[0] ?? null;
  }
}, Ut = (t, r = "Request failed") => {
  if (typeof t?.message == "string") return t.message;
  if (Array.isArray(t?.messages)) {
    const e = t.messages[0];
    if (typeof e == "string") return e;
    if (typeof e?.message == "string") return e.message;
  }
  return typeof t == "string" && t.trim() ? t : r;
}, Jt = (t) => t?.errors ?? {}, Nt = (t) => (t ?? "GET").toString().toUpperCase(), X = (t) => t === "GET" || t === "HEAD", T = (t) => typeof t == "function" ? t() : t, _t = (t, r, e) => {
  const o = new Headers(t), n = (c) => {
    c && new Headers(c).forEach((a, i) => {
      o.set(i, a);
    });
  };
  return n(T(r)), n(T(e)), o;
}, Y = (t, r, e) => {
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
      e.forEach((o) => Y(t, r, o));
      return;
    }
    if (typeof e == "object") {
      Object.keys(e).forEach((o) => {
        Y(t, `${r}.${o}`, e[o]);
      });
      return;
    }
    t.append(r, String(e));
  }
}, Qt = (t, r) => {
  if (!r || Object.keys(r).length === 0) return t;
  const [e, o = ""] = t.split("#"), n = e.includes("?") ? "&" : "?", c = new URLSearchParams();
  Object.keys(r).forEach((i) => {
    Y(c, i, r[i]);
  });
  const a = c.toString();
  return a ? `${e}${n}${a}${o ? `#${o}` : ""}` : t;
}, Vt = (t, r) => r ? /^(https?:)?\/\//i.test(r) || !t ? r : r.startsWith("?") || r.startsWith("#") ? `${t}${r}` : t.endsWith("/") && r.startsWith("/") ? `${t}${r.slice(1)}` : !t.endsWith("/") && !r.startsWith("/") ? `${t}/${r}` : `${t}${r}` : t, ut = (t, r) => {
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
  return d(t) ? x(r, t) : t ?? h(r);
}, Xt = (t, r) => {
  let e = !1;
  return t.forEach((o, n) => {
    n.toLowerCase() === r.toLowerCase() && (e = !0);
  }), e;
}, Yt = (t, r, e) => {
  if (!X(t) && r != null)
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
}, yt = (t) => typeof FormData < "u" && t instanceof FormData, $ = (t) => yt(t) ? Lt(t) : h(t), V = (t) => {
  const r = T(t.default);
  return $(r === void 0 ? null : r);
}, lt = (t, r) => typeof t == "string" ? {
  url: t,
  options: r
} : { options: t }, ct = (t, r) => {
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
  })), w(i, e.response);
}, H = (t, r, e = {}, o = "json") => {
  const n = {
    immediate: o !== "formData",
    abort: !0,
    locked: !1,
    snapshot: o !== "formData",
    clearErrorOnChange: !0,
    ...e
  }, c = V(n), a = ft({
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
  const Z = (s) => {
    i.muteWatch += 1;
    try {
      s(), p = h(a.data);
      const u = ct(n.watch, n);
      E = u ? w(a.data, {
        only: u.only,
        omit: u.omit
      }) : null;
    } finally {
      queueMicrotask(() => {
        i.muteWatch = Math.max(0, i.muteWatch - 1);
      });
    }
  }, k = (s) => {
    a.processing !== s && (a.processing = s, n.onProcessing?.(s, a));
  }, vt = () => {
    i.activeLocalRequests += 1, t.activeRequests += 1, k(!0);
  }, bt = () => {
    i.activeLocalRequests = Math.max(0, i.activeLocalRequests - 1), t.activeRequests = Math.max(0, t.activeRequests - 1), k(i.activeLocalRequests > 0);
  }, Et = () => {
    n.snapshot === !1 || yt(a.data) || (i.original = L(a.data, n.omit));
  }, J = () => {
    a.message = null, i.lastError = null;
  }, D = () => i.lastError, N = (s) => {
    i.lastError = s, a.message = s?.message ?? null;
  }, At = () => D()?.errors() ?? {}, tt = (s, u) => d(s) ? {
    ...s,
    errors: u
  } : { errors: u }, rt = (s) => {
    const u = D();
    if (!u) return;
    const l = h(u.errors());
    if (ht(l, s), new W({
      httpCode: u.httpCode,
      body: tt(u.body, l),
      message: u.message,
      errors: l,
      aborted: u.aborted,
      timeout: u.timeout
    }).keys().length === 0) {
      J();
      return;
    }
    N(new W({
      httpCode: u.httpCode,
      body: tt(u.body, l),
      message: u.message,
      errors: l,
      aborted: u.aborted,
      timeout: u.timeout
    }));
  }, Dt = (s) => {
    const u = D();
    u && u.keys().forEach((l) => {
      (l === s || l.startsWith(`${s}.`) || s.startsWith(`${l}.`)) && rt(l);
    });
  }, qt = (s) => {
    a.data = $(s);
  }, wt = (s) => {
    if (Array.isArray(a.data)) {
      a.data.push(s);
      return;
    }
    if (d(a.data) && d(s)) {
      a.data = x(a.data, s);
      return;
    }
    a.data = $(s);
  }, jt = (s, u, l) => {
    i.bodyType !== "formData" && s !== void 0 && Z(() => {
      const m = u === "reload" ? V(l) : $(a.data);
      a.data = x(m, s);
    });
  }, et = (s, u, l = !1, m = !1) => {
    Z(() => {
      if (!u?.only && !u?.omit && l) {
        const v = $(s);
        m && d(v) && n.omit?.forEach((b) => {
          const P = U(a.data, b);
          P.exists && dt(v, P.segments, P.value);
        }), a.data = v;
        return;
      }
      const f = w(s, u);
      a.data = x(a.data, f);
    });
  }, Pt = (s) => {
    n.snapshot === !1 || i.original === null || et(i.original, s, !0, !0);
  }, Rt = (s) => {
    et(V(n), s, !0);
  }, st = (s) => {
    if (n.snapshot === !1 || i.original === null) return !1;
    const u = L(a.data, n.omit);
    return s !== void 0 ? n.omit?.some((l) => String(l) === String(s)) ? !1 : !j(O(u, s), O(i.original, s)) : !j(u, i.original);
  }, Ot = (s) => n.snapshot === !1 || i.original === null ? s === void 0 ? null : void 0 : h(s === void 0 ? i.original : O(i.original, s)), Ct = (s) => {
    if (n.snapshot === !1 || i.original === null) return s === void 0 ? {} : void 0;
    const u = L(a.data, n.omit);
    return s !== void 0 ? st(s) ? h(O(u, s)) : void 0 : mt(u, i.original);
  }, Tt = (s, u) => {
    const l = {
      ...n,
      ...s,
      method: u ?? s?.method ?? n.method
    };
    return {
      ...l,
      params: T(l.params),
      headers: T(l.headers),
      body: T(l.body)
    };
  }, St = async (s, u, l, m) => {
    if (s.body !== void 0) return s.body;
    if (u === "reload") return;
    let f = i.bodyType === "formData" ? a.data : w(a.data, {
      only: s.only,
      omit: s.omit
    });
    return s.before && (f = await s.before(f, {
      model: a,
      options: s,
      url: l,
      method: m
    })), f;
  }, _ = (s) => new W({
    httpCode: s.httpCode ?? null,
    body: s.body,
    message: s.message ?? Ut(s.body, s.fallback),
    errors: s.errors ?? Jt(s.body),
    aborted: s.aborted,
    timeout: s.timeout,
    cause: s.cause
  }), M = (s) => {
    if (i.disposed) return Promise.reject(_({
      httpCode: null,
      message: "Model has been stopped",
      aborted: !0
    }));
    const u = i.requestId + 1, l = s.options, m = Nt(l?.method ?? s.method ?? n.method ?? "GET"), f = Tt(l, m);
    if (f.locked && a.processing && i.currentPromise) return i.currentPromise;
    i.requestId = u, f.abort && i.controller && i.controller.abort();
    const v = new AbortController();
    i.controller = v;
    let b = !1, P = null, F;
    return F = (async () => {
      vt();
      try {
        const A = Vt(t.baseUrl, s.url ?? l?.url ?? r), R = await St(f, s.mode, A, m), q = _t(t.headers, n.headers, l?.headers), xt = X(m) ? R : ut(R, f.params), Mt = X(m) ? ut(R, f.params) : void 0, Q = Qt(A, Mt), Ft = Yt(m, xt, q);
        f.timeout && f.timeout > 0 && (i.timeoutId = setTimeout(() => {
          b = !0, v.abort();
        }, f.timeout));
        const g = await fetch(Q, {
          method: m,
          headers: q,
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
          url: Q,
          method: m,
          response: g
        });
        const at = u === i.requestId;
        if (!g.ok) {
          const C = _({
            httpCode: g.status,
            body: I,
            fallback: g.statusText
          });
          throw P = C, at && (a.httpCode = g.status, N(C)), f.onError?.(C, a), C;
        }
        const it = await tr(I, a, f, Q, m, g.ok, g.status);
        return at && (a.httpCode = g.status, J(), jt(it, s.mode, f), Et(), i.latestAppliedRequestId = u), f.onSuccess?.(it, a), a.data;
      } catch (A) {
        const R = typeof DOMException < "u" && A instanceof DOMException ? A.name === "AbortError" : A?.name === "AbortError", q = A instanceof W ? A : _({
          httpCode: null,
          body: void 0,
          message: b ? "Request timed out" : R ? "Request aborted" : void 0,
          fallback: "Request failed",
          aborted: R,
          timeout: b,
          cause: A
        });
        throw P = q, (!R || b) && (u === i.requestId && (a.httpCode = q.httpCode, N(q)), A instanceof W || f.onError?.(q, a)), q;
      } finally {
        i.timeoutId && (clearTimeout(i.timeoutId), i.timeoutId = null), i.controller === v && (i.controller = null), bt(), f.onFinish?.(a, P), i.currentPromise === F && (i.currentPromise = null);
      }
    })(), i.currentPromise = F, F;
  }, Bt = (s, u) => {
    const l = lt(s, u);
    return M({
      url: l.url,
      options: l.options,
      mode: "send"
    });
  }, B = (s, u, l) => {
    const m = lt(u, l);
    return M({
      url: m.url,
      options: m.options,
      method: s,
      mode: "send"
    });
  }, Wt = (s) => M({
    options: s,
    mode: "reload"
  }), ot = (s) => M({
    options: s,
    mode: "send"
  }), nt = () => {
    i.disposed = !0, i.stops.forEach((s) => s()), i.stops = [], y && (clearTimeout(y), y = null), i.controller?.abort();
  }, $t = () => {
    const s = ct(n.watch, n), u = !!s, l = n.clearErrorOnChange !== !1;
    if (!u && !l) return;
    E = s ? w(a.data, {
      only: s.only,
      omit: s.omit
    }) : null;
    const m = zt(() => a.data, () => {
      const f = h(a.data);
      if (i.muteWatch > 0) {
        p = f, E = s ? w(a.data, {
          only: s.only,
          omit: s.omit
        }) : null;
        return;
      }
      const v = gt(f, p);
      if (l && v.forEach((b) => Dt(b)), u && s) {
        const b = w(a.data, {
          only: s.only,
          omit: s.omit
        });
        kt(v, s.only) && !j(b, E) && (y && clearTimeout(y), y = setTimeout(() => {
          y = null, a.send().catch(() => {
          });
        }, s.debounce ?? 100)), E = b;
      }
      p = f;
    }, { deep: !0 });
    i.stops.push(m);
  };
  return Object.assign(a, {
    request: Bt,
    get: (s, u) => B("GET", s, u),
    post: (s, u) => B("POST", s, u),
    put: (s, u) => B("PUT", s, u),
    patch: (s, u) => B("PATCH", s, u),
    delete: (s, u) => B("DELETE", s, u),
    reload: Wt,
    refresh: ot,
    send: ot,
    setData: qt,
    push: wt,
    reset: Pt,
    default: Rt,
    isDirty: st,
    getOriginal: Ot,
    getDirty: Ct,
    error: (s) => D()?.error(s) ?? null,
    errors: (s) => s === void 0 ? At() : D()?.errors(s) ?? [],
    errorKeys: () => D()?.keys() ?? [],
    hasErrors: (s) => D()?.has(s) ?? !1,
    firstErrorKey: () => D()?.firstKey() ?? null,
    getError: () => D(),
    clearError: rt,
    clearErrors: J,
    stop: nt
  }), $t(), It() && Ht(nt), n.immediate !== !1 && queueMicrotask(() => {
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
    request(e, o = {}) {
      return H(t, e, {
        default: () => null,
        immediate: !1,
        snapshot: !1
      }, "json").request(o);
    },
    get(e, o = {}) {
      return r.request(e, {
        ...o,
        method: "GET"
      });
    },
    post(e, o = {}) {
      return r.request(e, {
        ...o,
        method: "POST"
      });
    },
    put(e, o = {}) {
      return r.request(e, {
        ...o,
        method: "PUT"
      });
    },
    patch(e, o = {}) {
      return r.request(e, {
        ...o,
        method: "PATCH"
      });
    },
    delete(e, o = {}) {
      return r.request(e, {
        ...o,
        method: "DELETE"
      });
    },
    form(e = (() => ({})), o = {}) {
      return H(t, "", {
        ...o,
        default: e,
        immediate: !1
      }, "json");
    },
    create(e, o = {}) {
      return H(t, e, o, "json");
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
      return H(t, e, {
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
  W as ApixError,
  er as createApix
};

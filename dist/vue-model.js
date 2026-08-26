import { getCurrentScope as It, markRaw as Lt, onScopeDispose as Ht, reactive as ft, toRaw as S, watch as zt } from "vue";
var z = (t, e) => Object.prototype.hasOwnProperty.call(t, e), d = (t) => {
  if (t === null || typeof t != "object") return !1;
  const e = Object.getPrototypeOf(S(t));
  return e === Object.prototype || e === null;
}, G = (t) => t !== null && typeof t == "object", Gt = (t) => String(t), h = (t) => {
  const e = S(t);
  if (Array.isArray(e)) return e.map((r) => h(r));
  if (d(e)) {
    const r = {};
    return Object.keys(e).forEach((o) => {
      r[o] = h(e[o]);
    }), r;
  }
  return e;
}, x = (t, e) => {
  if (e === void 0) return h(t);
  if (Array.isArray(e) || !d(t) || !d(e)) return h(e);
  const r = h(t);
  return Object.keys(e).forEach((o) => {
    if (d(r[o]) && d(e[o])) {
      r[o] = x(r[o], e[o]);
      return;
    }
    r[o] = h(e[o]);
  }), r;
}, K = (t, e) => {
  const r = Gt(e);
  if (!G(t)) return {
    exists: !1,
    value: void 0,
    segments: []
  };
  const o = S(t);
  if (z(o, r)) return {
    exists: !0,
    value: o[r],
    segments: [r]
  };
  const n = r.split(".");
  let c = o;
  const a = [];
  for (let i = 0; i < n.length; i += 1) {
    if (!G(c)) return {
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
}, O = (t, e) => {
  const r = K(t, e);
  return r.exists ? r.value : void 0;
}, dt = (t, e, r) => {
  if (e.length === 0) return;
  let o = t;
  e.forEach((n, c) => {
    if (c === e.length - 1) {
      o[n] = h(r);
      return;
    }
    (!G(o[n]) || Array.isArray(o[n])) && (o[n] = {}), o = o[n];
  });
}, ht = (t, e) => {
  const r = K(t, e);
  if (!r.exists || r.segments.length === 0) return;
  let o = t;
  for (let n = 0; n < r.segments.length - 1; n += 1) o = o?.[r.segments[n]];
  G(o) && delete o[r.segments[r.segments.length - 1]];
}, Kt = (t, e) => {
  const r = {};
  return e.forEach((o) => {
    const n = K(t, o);
    n.exists && dt(r, n.segments, n.value);
  }), r;
}, w = (t, e) => {
  if (t instanceof FormData) return t;
  let r = e?.only !== void 0 ? Kt(t, e.only) : h(t);
  return e?.omit?.forEach((o) => {
    ht(r, o);
  }), r;
}, L = (t, e) => t instanceof FormData ? null : w(t, { omit: e }), j = (t, e) => {
  const r = S(t), o = S(e);
  if (Object.is(r, o)) return !0;
  if (Array.isArray(r) || Array.isArray(o))
    return !Array.isArray(r) || !Array.isArray(o) || r.length !== o.length ? !1 : r.every((n, c) => j(n, o[c]));
  if (d(r) || d(o)) {
    if (!d(r) || !d(o)) return !1;
    const n = Object.keys(r), c = Object.keys(o);
    return n.length !== c.length ? !1 : n.every((a) => z(o, a) && j(r[a], o[a]));
  }
  return !1;
}, mt = (t, e) => {
  if (j(t, e)) return {};
  if (Array.isArray(t) || !d(t) || !d(e)) return h(t);
  const r = {};
  return Object.keys(t).forEach((o) => {
    if (!j(t[o], e[o])) {
      if (d(t[o]) && d(e[o])) {
        const n = mt(t[o], e[o]);
        if (d(n) && Object.keys(n).length === 0) return;
        r[o] = n;
        return;
      }
      r[o] = h(t[o]);
    }
  }), r;
}, gt = (t, e, r = "") => {
  if (j(t, e)) return [];
  if (!d(t) || !d(e)) return r ? [r] : [];
  const o = /* @__PURE__ */ new Set([...Object.keys(t), ...Object.keys(e)]), n = [];
  return o.forEach((c) => {
    const a = r ? `${r}.${c}` : c;
    n.push(...gt(t[c], e[c], a));
  }), n;
}, V = (t) => t == null ? [] : Array.isArray(t) ? t.flatMap((e) => V(e)).filter((e) => typeof e == "string") : typeof t == "string" ? [t] : typeof t == "number" || typeof t == "boolean" ? [String(t)] : d(t) ? Object.values(t).flatMap((e) => V(e)) : [], pt = (t, e = "") => t == null ? [] : Array.isArray(t) || typeof t == "string" ? e ? [e] : [] : d(t) ? Object.keys(t).flatMap((r) => {
  const o = e ? `${e}.${r}` : r;
  return pt(t[r], o);
}) : e ? [e] : [], W = class extends Error {
  constructor(t) {
    super(t.message ?? "Request failed"), this.name = "ApixError", this.httpCode = t.httpCode, this.body = t.body, this.aborted = !!t.aborted, this.timeout = !!t.timeout, this.cause = t.cause, this.errorBag = t.errors ?? t.body?.errors ?? {};
  }
  error(t) {
    return this.errors(t)[0] ?? null;
  }
  errors(t) {
    if (t === void 0) return this.errorBag;
    const e = O(this.errorBag, t);
    return V(e);
  }
  keys() {
    return pt(this.errorBag);
  }
  has(t) {
    return (Array.isArray(t) ? t : [t]).some((e) => this.error(e) !== null);
  }
  firstKey() {
    return this.keys()[0] ?? null;
  }
}, Ut = (t, e = "Request failed") => {
  if (typeof t?.message == "string") return t.message;
  if (Array.isArray(t?.messages)) {
    const r = t.messages[0];
    if (typeof r == "string") return r;
    if (typeof r?.message == "string") return r.message;
  }
  return typeof t == "string" && t.trim() ? t : e;
}, Jt = (t) => t?.errors ?? {}, Nt = (t) => (t ?? "GET").toString().toUpperCase(), X = (t) => t === "GET" || t === "HEAD", T = (t) => typeof t == "function" ? t() : t, _t = (t, e, r) => {
  const o = new Headers(t), n = (c) => {
    c && new Headers(c).forEach((a, i) => {
      o.set(i, a);
    });
  };
  return n(T(e)), n(T(r)), o;
}, Y = (t, e, r) => {
  if (r !== void 0) {
    if (r === null) {
      t.append(e, "");
      return;
    }
    if (r instanceof Date) {
      t.append(e, r.toISOString());
      return;
    }
    if (Array.isArray(r)) {
      r.forEach((o) => Y(t, e, o));
      return;
    }
    if (typeof r == "object") {
      Object.keys(r).forEach((o) => {
        Y(t, `${e}.${o}`, r[o]);
      });
      return;
    }
    t.append(e, String(r));
  }
}, Qt = (t, e) => {
  if (!e || Object.keys(e).length === 0) return t;
  const [r, o = ""] = t.split("#"), n = r.includes("?") ? "&" : "?", c = new URLSearchParams();
  Object.keys(e).forEach((i) => {
    Y(c, i, e[i]);
  });
  const a = c.toString();
  return a ? `${r}${n}${a}${o ? `#${o}` : ""}` : t;
}, Vt = (t, e) => e ? /^(https?:)?\/\//i.test(e) || !t ? e : e.startsWith("?") || e.startsWith("#") ? `${t}${e}` : t.endsWith("/") && e.startsWith("/") ? `${t}${e.slice(1)}` : !t.endsWith("/") && !e.startsWith("/") ? `${t}/${e}` : `${t}${e}` : t, ut = (t, e) => {
  if (!e || Object.keys(e).length === 0) return t;
  if (t instanceof FormData) {
    const r = new FormData();
    return t.forEach((o, n) => {
      r.append(n, o);
    }), Object.keys(e).forEach((o) => {
      const n = e[o];
      if (n !== void 0) {
        if (n instanceof Blob) {
          r.append(o, n);
          return;
        }
        if (typeof n == "object" && n !== null) {
          r.append(o, JSON.stringify(n));
          return;
        }
        r.append(o, n === null ? "" : String(n));
      }
    }), r;
  }
  return d(t) ? x(e, t) : t ?? h(e);
}, Xt = (t, e) => {
  let r = !1;
  return t.forEach((o, n) => {
    n.toLowerCase() === e.toLowerCase() && (r = !0);
  }), r;
}, Yt = (t, e, r) => {
  if (!X(t) && e != null)
    return e instanceof FormData || typeof e == "string" || e instanceof Blob || e instanceof ArrayBuffer ? e : (Xt(r, "content-type") || r.set("content-type", "application/json"), JSON.stringify(e));
}, Zt = async (t) => {
  if (t.status === 204 || t.status === 205) return;
  const e = await t.text();
  if (e) {
    if ((t.headers.get("content-type") ?? "").includes("json")) return JSON.parse(e);
    try {
      return JSON.parse(e);
    } catch {
      return e;
    }
  }
}, yt = (t) => typeof FormData < "u" && t instanceof FormData, $ = (t) => yt(t) ? Lt(t) : h(t), Q = (t) => {
  const e = T(t.default);
  return $(e === void 0 ? null : e);
}, lt = (t, e) => typeof t == "string" ? {
  url: t,
  options: e
} : { options: t }, ct = (t, e) => {
  if (!t) return null;
  const r = t === !0 ? {} : t;
  return {
    debounce: r.debounce ?? 100,
    only: r.only === void 0 ? e.only : r.only,
    omit: r.omit === void 0 ? e.omit : r.omit
  };
}, kt = (t, e) => e === void 0 ? t.length > 0 : e.length === 0 ? !1 : t.some((r) => e.some((o) => {
  const n = String(o);
  return r === n || r.startsWith(`${n}.`);
})), te = async (t, e, r, o, n, c, a) => {
  let i = r.path === void 0 ? t : O(t, r.path);
  const p = r.after;
  return p && (i = await p(i, {
    model: e,
    options: r,
    url: o,
    method: n,
    ok: c,
    status: a
  })), w(i, r.response);
}, H = (t, e, r = {}, o = "json") => {
  const n = {
    immediate: o !== "formData",
    abort: !0,
    locked: !1,
    snapshot: o !== "formData",
    clearErrorOnChange: !0,
    ...r
  }, c = Q(n), a = ft({
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
  }, U = () => {
    a.message = null, i.lastError = null;
  }, D = () => i.lastError, J = (s) => {
    i.lastError = s, a.message = s?.message ?? null;
  }, At = () => D()?.errors() ?? {}, tt = (s, u) => d(s) ? {
    ...s,
    errors: u
  } : { errors: u }, et = (s) => {
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
      U();
      return;
    }
    J(new W({
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
      (l === s || l.startsWith(`${s}.`) || s.startsWith(`${l}.`)) && et(l);
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
      const m = u === "reload" ? Q(l) : $(a.data);
      a.data = x(m, s);
    });
  }, rt = (s, u, l = !1, m = !1) => {
    Z(() => {
      if (!u?.only && !u?.omit && l) {
        const v = $(s);
        m && d(v) && n.omit?.forEach((b) => {
          const P = K(a.data, b);
          P.exists && dt(v, P.segments, P.value);
        }), a.data = v;
        return;
      }
      const f = w(s, u);
      a.data = x(a.data, f);
    });
  }, Pt = (s) => {
    n.snapshot === !1 || i.original === null || rt(i.original, s, !0, !0);
  }, Rt = (s) => {
    rt(Q(n), s, !0);
  }, st = (s) => {
    if (n.snapshot === !1 || i.original === null) return !1;
    const u = L(a.data, n.omit);
    return s !== void 0 ? n.omit?.some((l) => String(l) === String(s)) ? !1 : !j(O(u, s), O(i.original, s)) : !j(u, i.original);
  }, Ct = (s) => n.snapshot === !1 || i.original === null ? s === void 0 ? null : void 0 : h(s === void 0 ? i.original : O(i.original, s)), Ot = (s) => {
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
  }, N = (s) => new W({
    httpCode: s.httpCode ?? null,
    body: s.body,
    message: s.message ?? Ut(s.body, s.fallback),
    errors: s.errors ?? Jt(s.body),
    aborted: s.aborted,
    timeout: s.timeout,
    cause: s.cause
  }), M = (s) => {
    if (i.disposed) return Promise.reject(N({
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
        const A = Vt(t.baseUrl, s.url ?? l?.url ?? e), R = await St(f, s.mode, A, m), q = _t(t.headers, n.headers, l?.headers), xt = X(m) ? R : ut(R, f.params), Mt = X(m) ? ut(R, f.params) : void 0, _ = Qt(A, Mt), Ft = Yt(m, xt, q);
        f.timeout && f.timeout > 0 && (i.timeoutId = setTimeout(() => {
          b = !0, v.abort();
        }, f.timeout));
        const g = await fetch(_, {
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
          url: _,
          method: m,
          response: g
        });
        const at = u === i.requestId;
        if (!g.ok) {
          const C = N({
            httpCode: g.status,
            body: I,
            fallback: g.statusText
          });
          throw P = C, at && (a.httpCode = g.status, J(C)), f.onError?.(C, a), C;
        }
        const it = await te(I, a, f, _, m, g.ok, g.status);
        return at && (a.httpCode = g.status, U(), jt(it, s.mode, f), Et(), i.latestAppliedRequestId = u), f.onSuccess?.(it, a), a.data;
      } catch (A) {
        const R = typeof DOMException < "u" && A instanceof DOMException ? A.name === "AbortError" : A?.name === "AbortError", q = A instanceof W ? A : N({
          httpCode: null,
          body: void 0,
          message: b ? "Request timed out" : R ? "Request aborted" : void 0,
          fallback: "Request failed",
          aborted: R,
          timeout: b,
          cause: A
        });
        throw P = q, (!R || b) && (u === i.requestId && (a.httpCode = q.httpCode, J(q)), A instanceof W || f.onError?.(q, a)), q;
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
    getOriginal: Ct,
    getDirty: Ot,
    error: (s) => D()?.error(s) ?? null,
    errors: (s) => s === void 0 ? At() : D()?.errors(s) ?? [],
    errorKeys: () => D()?.keys() ?? [],
    hasErrors: (s) => D()?.has(s) ?? !1,
    firstErrorKey: () => D()?.firstKey() ?? null,
    getError: () => D(),
    clearError: et,
    clearErrors: U,
    stop: nt
  }), $t(), It() && Ht(nt), n.immediate !== !1 && queueMicrotask(() => {
    i.disposed || a.reload().catch(() => {
    });
  }), a;
}, re = () => {
  const t = ft({
    baseUrl: "",
    headers: {},
    activeRequests: 0,
    transformers: []
  }), e = {
    get activeRequests() {
      return t.activeRequests;
    },
    get processing() {
      return t.activeRequests > 0;
    },
    setBaseUrl(r) {
      return t.baseUrl = r, e;
    },
    setHeaders(r) {
      return t.headers = r, e;
    },
    setHeader(r, o) {
      const n = new Headers(t.headers);
      return typeof r == "string" ? n.set(r, o ?? "") : new Headers(r).forEach((c, a) => {
        n.set(a, c);
      }), t.headers = n, e;
    },
    transformResponse(r) {
      return t.transformers.push(r), e;
    },
    request(r, o = {}) {
      return H(t, r, {
        default: () => null,
        immediate: !1,
        snapshot: !1
      }, "json").request(o);
    },
    get(r, o = {}) {
      return e.request(r, {
        ...o,
        method: "GET"
      });
    },
    post(r, o = {}) {
      return e.request(r, {
        ...o,
        method: "POST"
      });
    },
    put(r, o = {}) {
      return e.request(r, {
        ...o,
        method: "PUT"
      });
    },
    patch(r, o = {}) {
      return e.request(r, {
        ...o,
        method: "PATCH"
      });
    },
    delete(r, o = {}) {
      return e.request(r, {
        ...o,
        method: "DELETE"
      });
    },
    form(r = (() => ({})), o = {}) {
      return H(t, "", {
        ...o,
        default: r,
        immediate: !1
      }, "json");
    },
    create(r, o = {}) {
      return H(t, r, o, "json");
    },
    createModel(r, o = {}) {
      return e.create(r, o);
    },
    createCollection(r, o = {}) {
      return e.create(r, {
        default: () => [],
        snapshot: !1,
        ...o
      });
    },
    createForm(r, o = {}) {
      return H(t, r, {
        default: () => new FormData(),
        immediate: !1,
        method: "POST",
        snapshot: !1,
        ...o
      }, "formData");
    }
  };
  return e;
};
export {
  W as ApixError,
  re as createApix
};

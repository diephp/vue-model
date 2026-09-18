import { getCurrentScope as Lt, markRaw as Ht, onScopeDispose as zt, reactive as dt, toRaw as B, watch as Kt } from "vue";
var M = (t, r) => Object.prototype.hasOwnProperty.call(t, r), f = (t) => {
  if (t === null || typeof t != "object") return !1;
  const r = Object.getPrototypeOf(B(t));
  return r === Object.prototype || r === null;
}, G = (t) => t !== null && typeof t == "object", Gt = (t) => String(t), h = (t) => {
  const r = B(t);
  if (Array.isArray(r)) return r.map((e) => h(e));
  if (f(r)) {
    const e = {};
    return Object.keys(r).forEach((s) => {
      e[s] = h(r[s]);
    }), e;
  }
  return r;
}, F = (t, r) => {
  if (r === void 0) return h(t);
  if (Array.isArray(r) || !f(t) || !f(r)) return h(r);
  const e = h(t);
  return Object.keys(r).forEach((s) => {
    if (f(e[s]) && f(r[s])) {
      e[s] = F(e[s], r[s]);
      return;
    }
    e[s] = h(r[s]);
  }), e;
}, K = (t, r) => {
  if (q(t, r)) return t;
  if (Array.isArray(t) && Array.isArray(r))
    return t.splice(0, t.length, ...r.map((e) => h(e))), t;
  if (f(t) && f(r)) {
    const e = t, s = r;
    return Object.keys(e).forEach((n) => {
      M(s, n) || delete e[n];
    }), Object.keys(s).forEach((n) => {
      const c = e[n], a = s[n];
      if (Array.isArray(c) && Array.isArray(a) || f(c) && f(a)) {
        K(c, a);
        return;
      }
      q(c, a) || (e[n] = h(a));
    }), t;
  }
  return h(r);
}, J = (t, r) => {
  const e = Gt(r);
  if (!G(t)) return {
    exists: !1,
    value: void 0,
    segments: []
  };
  const s = B(t);
  if (M(s, e)) return {
    exists: !0,
    value: s[e],
    segments: [e]
  };
  const n = e.split(".");
  let c = s;
  const a = [];
  for (let i = 0; i < n.length; i += 1) {
    if (!G(c)) return {
      exists: !1,
      value: void 0,
      segments: a
    };
    const b = n.slice(i).join("."), D = B(c);
    if (M(D, b)) return {
      exists: !0,
      value: D[b],
      segments: [...a, b]
    };
    const E = n[i];
    if (!M(D, E)) return {
      exists: !1,
      value: void 0,
      segments: a
    };
    c = D[E], a.push(E);
  }
  return {
    exists: !0,
    value: c,
    segments: a
  };
}, C = (t, r) => {
  const e = J(t, r);
  return e.exists ? e.value : void 0;
}, ht = (t, r, e) => {
  if (r.length === 0) return;
  let s = t;
  r.forEach((n, c) => {
    if (c === r.length - 1) {
      s[n] = h(e);
      return;
    }
    (!G(s[n]) || Array.isArray(s[n])) && (s[n] = {}), s = s[n];
  });
}, mt = (t, r) => {
  const e = J(t, r);
  if (!e.exists || e.segments.length === 0) return;
  let s = t;
  for (let n = 0; n < e.segments.length - 1; n += 1) s = s?.[e.segments[n]];
  G(s) && delete s[e.segments[e.segments.length - 1]];
}, Ut = (t, r) => {
  const e = {};
  return r.forEach((s) => {
    const n = J(t, s);
    n.exists && ht(e, n.segments, n.value);
  }), e;
}, R = (t, r) => {
  if (t instanceof FormData) return t;
  let e = r?.only !== void 0 ? Ut(t, r.only) : h(t);
  return r?.omit?.forEach((s) => {
    mt(e, s);
  }), e;
}, H = (t, r) => t instanceof FormData ? null : R(t, { omit: r }), q = (t, r) => {
  const e = B(t), s = B(r);
  if (Object.is(e, s)) return !0;
  if (Array.isArray(e) || Array.isArray(s))
    return !Array.isArray(e) || !Array.isArray(s) || e.length !== s.length ? !1 : e.every((n, c) => q(n, s[c]));
  if (f(e) || f(s)) {
    if (!f(e) || !f(s)) return !1;
    const n = Object.keys(e), c = Object.keys(s);
    return n.length !== c.length ? !1 : n.every((a) => M(s, a) && q(e[a], s[a]));
  }
  return !1;
}, gt = (t, r) => {
  if (q(t, r)) return {};
  if (Array.isArray(t) || !f(t) || !f(r)) return h(t);
  const e = {};
  return Object.keys(t).forEach((s) => {
    if (!q(t[s], r[s])) {
      if (f(t[s]) && f(r[s])) {
        const n = gt(t[s], r[s]);
        if (f(n) && Object.keys(n).length === 0) return;
        e[s] = n;
        return;
      }
      e[s] = h(t[s]);
    }
  }), e;
}, pt = (t, r, e = "") => {
  if (q(t, r)) return [];
  if (!f(t) || !f(r)) return e ? [e] : [];
  const s = /* @__PURE__ */ new Set([...Object.keys(t), ...Object.keys(r)]), n = [];
  return s.forEach((c) => {
    const a = e ? `${e}.${c}` : c;
    n.push(...pt(t[c], r[c], a));
  }), n;
}, U = (t) => t == null ? [] : Array.isArray(t) ? t.flatMap((r) => U(r)).filter((r) => typeof r == "string") : typeof t == "string" ? [t] : typeof t == "number" || typeof t == "boolean" ? [String(t)] : f(t) ? Object.values(t).flatMap((r) => U(r)) : [], yt = (t, r = "") => t == null ? [] : Array.isArray(t) || typeof t == "string" ? r ? [r] : [] : f(t) ? Object.keys(t).flatMap((e) => {
  const s = r ? `${r}.${e}` : e;
  return yt(t[e], s);
}) : r ? [r] : [], W = class extends Error {
  constructor(t) {
    super(t.message ?? "Request failed"), this.name = "ApixError", this.httpCode = t.httpCode, this.body = t.body, this.aborted = !!t.aborted, this.timeout = !!t.timeout, this.cause = t.cause, this.errorBag = t.errors ?? t.body?.errors ?? {};
  }
  error(t) {
    return this.errors(t)[0] ?? null;
  }
  errors(t) {
    if (t === void 0) return this.errorBag;
    if (Array.isArray(t)) return t.flatMap((e) => U(C(this.errorBag, e)));
    const r = C(this.errorBag, t);
    return U(r);
  }
  keys() {
    return yt(this.errorBag);
  }
  has(t) {
    return this.error(t) !== null;
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
}, Nt = (t) => t?.errors ?? {}, _t = (t) => (t ?? "GET").toString().toUpperCase(), Y = (t) => t === "GET" || t === "HEAD", x = (t) => typeof t == "function" ? t() : t, Qt = (t, r, e) => {
  const s = new Headers(t), n = (c) => {
    c && new Headers(c).forEach((a, i) => {
      s.set(i, a);
    });
  };
  return n(x(r)), n(x(e)), s;
}, Z = (t, r, e) => {
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
      e.forEach((s) => Z(t, r, s));
      return;
    }
    if (typeof e == "object") {
      Object.keys(e).forEach((s) => {
        Z(t, `${r}.${s}`, e[s]);
      });
      return;
    }
    t.append(r, String(e));
  }
}, Vt = (t, r) => {
  if (!r || Object.keys(r).length === 0) return t;
  const [e, s = ""] = t.split("#"), n = e.includes("?") ? "&" : "?", c = new URLSearchParams();
  Object.keys(r).forEach((i) => {
    Z(c, i, r[i]);
  });
  const a = c.toString();
  return a ? `${e}${n}${a}${s ? `#${s}` : ""}` : t;
}, Xt = (t, r) => r ? /^(https?:)?\/\//i.test(r) || !t ? r : r.startsWith("?") || r.startsWith("#") ? `${t}${r}` : t.endsWith("/") && r.startsWith("/") ? `${t}${r.slice(1)}` : !t.endsWith("/") && !r.startsWith("/") ? `${t}/${r}` : `${t}${r}` : t, lt = (t, r) => {
  if (!r || Object.keys(r).length === 0) return t;
  if (t instanceof FormData) {
    const e = new FormData();
    return t.forEach((s, n) => {
      e.append(n, s);
    }), Object.keys(r).forEach((s) => {
      const n = r[s];
      if (n !== void 0) {
        if (n instanceof Blob) {
          e.append(s, n);
          return;
        }
        if (typeof n == "object" && n !== null) {
          e.append(s, JSON.stringify(n));
          return;
        }
        e.append(s, n === null ? "" : String(n));
      }
    }), e;
  }
  return f(t) ? F(r, t) : t ?? h(r);
}, Yt = (t, r) => {
  let e = !1;
  return t.forEach((s, n) => {
    n.toLowerCase() === r.toLowerCase() && (e = !0);
  }), e;
}, Zt = (t, r, e) => {
  if (!Y(t) && r != null)
    return r instanceof FormData || typeof r == "string" || r instanceof Blob || r instanceof ArrayBuffer ? r : (Yt(e, "content-type") || e.set("content-type", "application/json"), JSON.stringify(r));
}, kt = async (t) => {
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
}, vt = (t) => typeof FormData < "u" && t instanceof FormData, $ = (t) => vt(t) ? Ht(t) : h(t), X = (t) => {
  const r = x(t.default);
  return $(r === void 0 ? null : r);
}, ct = (t, r) => typeof t == "string" ? {
  url: t,
  options: r
} : { options: t }, ft = (t, r) => {
  if (!t) return null;
  const e = t === !0 ? {} : t;
  return {
    debounce: e.debounce ?? 100,
    only: e.only === void 0 ? r.only : e.only,
    omit: e.omit === void 0 ? r.omit : e.omit
  };
}, tr = (t, r) => r === void 0 ? t.length > 0 : r.length === 0 ? !1 : t.some((e) => r.some((s) => {
  const n = String(s);
  return e === n || e.startsWith(`${n}.`);
})), rr = async (t, r, e, s, n, c, a) => {
  let i = e.path === void 0 ? t : C(t, e.path);
  const b = e.after;
  return b && (i = await b(i, {
    model: r,
    options: e,
    url: s,
    method: n,
    ok: c,
    status: a
  })), R(i, e.response);
}, z = (t, r, e = {}, s = "json") => {
  const n = {
    immediate: s !== "formData",
    abort: !0,
    locked: !1,
    snapshot: s !== "formData",
    clearErrorOnChange: !0,
    timeout: t.timeout,
    ...e
  }, c = X(n), a = dt({
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
    original: n.snapshot === !1 ? null : H(a.data, n.omit),
    lastError: null,
    muteWatch: 0,
    bodyType: s
  };
  let b = h(a.data), D = null, E = null;
  const k = (o) => {
    i.muteWatch += 1;
    try {
      o(), b = h(a.data);
      const u = ft(n.watch, n);
      D = u ? R(a.data, {
        only: u.only,
        omit: u.omit
      }) : null;
    } finally {
      queueMicrotask(() => {
        i.muteWatch = Math.max(0, i.muteWatch - 1);
      });
    }
  }, tt = (o) => {
    a.processing !== o && (a.processing = o, n.onProcessing?.(o, a));
  }, bt = () => {
    i.activeLocalRequests += 1, t.activeRequests += 1, tt(!0);
  }, Et = () => {
    i.activeLocalRequests = Math.max(0, i.activeLocalRequests - 1), t.activeRequests = Math.max(0, t.activeRequests - 1), tt(i.activeLocalRequests > 0);
  }, At = () => {
    n.snapshot === !1 || vt(a.data) || (i.original = H(a.data, n.omit));
  }, N = () => {
    a.message = null, i.lastError = null;
  }, w = () => i.lastError, _ = (o) => {
    i.lastError = o, a.message = o?.message ?? null;
  }, Dt = () => w()?.errors() ?? {}, rt = (o, u) => f(o) ? {
    ...o,
    errors: u
  } : { errors: u }, et = (o) => {
    const u = w();
    if (!u) return;
    const l = h(u.errors());
    if (mt(l, o), new W({
      httpCode: u.httpCode,
      body: rt(u.body, l),
      message: u.message,
      errors: l,
      aborted: u.aborted,
      timeout: u.timeout
    }).keys().length === 0) {
      N();
      return;
    }
    _(new W({
      httpCode: u.httpCode,
      body: rt(u.body, l),
      message: u.message,
      errors: l,
      aborted: u.aborted,
      timeout: u.timeout
    }));
  }, qt = (o) => {
    const u = w();
    u && u.keys().forEach((l) => {
      (l === o || l.startsWith(`${o}.`) || o.startsWith(`${l}.`)) && et(l);
    });
  }, wt = (o) => {
    a.data = $(o);
  }, jt = (o) => {
    if (Array.isArray(a.data)) {
      a.data.push(o);
      return;
    }
    if (f(a.data) && f(o)) {
      a.data = F(a.data, o);
      return;
    }
    a.data = $(o);
  }, Rt = (o, u, l) => {
    i.bodyType !== "formData" && o !== void 0 && k(() => {
      const m = u === "reload" ? X(l) : $(a.data), d = F(m, o), p = K(a.data, d);
      p !== a.data && (a.data = p);
    });
  }, st = (o, u, l = !1, m = !1) => {
    k(() => {
      if (!u?.only && !u?.omit && l) {
        const P = $(o);
        m && f(P) && n.omit?.forEach((v) => {
          const A = J(a.data, v);
          A.exists && ht(P, A.segments, A.value);
        });
        const O = K(a.data, P);
        O !== a.data && (a.data = O);
        return;
      }
      const d = R(o, u), p = F(a.data, d), y = K(a.data, p);
      y !== a.data && (a.data = y);
    });
  }, Pt = (o) => {
    n.snapshot === !1 || i.original === null || st(i.original, o, !0, !0);
  }, Ot = (o) => {
    st(X(n), o, !0);
  }, ot = (o) => {
    if (n.snapshot === !1 || i.original === null) return !1;
    const u = H(a.data, n.omit);
    return o !== void 0 ? n.omit?.some((l) => String(l) === String(o)) ? !1 : !q(C(u, o), C(i.original, o)) : !q(u, i.original);
  }, Ct = (o) => n.snapshot === !1 || i.original === null ? o === void 0 ? null : void 0 : h(o === void 0 ? i.original : C(i.original, o)), Tt = (o) => {
    if (n.snapshot === !1 || i.original === null) return o === void 0 ? {} : void 0;
    const u = H(a.data, n.omit);
    return o !== void 0 ? ot(o) ? h(C(u, o)) : void 0 : gt(u, i.original);
  }, xt = (o, u) => {
    const l = {
      ...n,
      ...o,
      method: u ?? o?.method ?? n.method
    };
    return {
      ...l,
      params: x(l.params),
      headers: x(l.headers),
      body: x(l.body)
    };
  }, Bt = async (o, u, l, m) => {
    if (o.body !== void 0) return o.body;
    if (u === "reload") return;
    let d = i.bodyType === "formData" ? a.data : R(a.data, {
      only: o.only,
      omit: o.omit
    });
    return o.before && (d = await o.before(d, {
      model: a,
      options: o,
      url: l,
      method: m
    })), d;
  }, Q = (o) => new W({
    httpCode: o.httpCode ?? null,
    body: o.body,
    message: o.message ?? Jt(o.body, o.fallback),
    errors: o.errors ?? Nt(o.body),
    aborted: o.aborted,
    timeout: o.timeout,
    cause: o.cause
  }), I = (o) => {
    if (i.disposed) return Promise.reject(Q({
      httpCode: null,
      message: "Model has been stopped",
      aborted: !0
    }));
    const u = i.requestId + 1, l = o.options, m = _t(l?.method ?? o.method ?? n.method ?? "GET"), d = xt(l, m);
    if (d.locked && a.processing && i.currentPromise) return i.currentPromise;
    i.requestId = u, d.abort && i.controller && i.controller.abort();
    const p = new AbortController();
    i.controller = p;
    let y = !1, P = null, O;
    return O = (async () => {
      bt();
      try {
        const v = Xt(t.baseUrl, o.url ?? l?.url ?? r), A = await Bt(d, o.mode, v, m), j = Qt(t.headers, n.headers, l?.headers), Mt = Y(m) ? A : lt(A, d.params), Ft = Y(m) ? lt(A, d.params) : void 0, V = Vt(v, Ft), It = Zt(m, Mt, j);
        d.timeout && d.timeout > 0 && (i.timeoutId = setTimeout(() => {
          y = !0, p.abort();
        }, d.timeout));
        const g = await fetch(V, {
          method: m,
          headers: j,
          body: It,
          signal: p.signal
        });
        let L = await kt(g);
        for (const T of t.transformers) L = await T({
          body: L,
          ok: g.ok,
          status: g.status,
          statusText: g.statusText,
          headers: g.headers,
          url: V,
          method: m,
          response: g
        });
        const it = u === i.requestId;
        if (!g.ok) {
          const T = Q({
            httpCode: g.status,
            body: L,
            fallback: g.statusText
          });
          throw P = T, it && (a.httpCode = g.status, _(T)), d.onError?.(T, a), T;
        }
        const ut = await rr(L, a, d, V, m, g.ok, g.status);
        return it && (a.httpCode = g.status, N(), Rt(ut, o.mode, d), At(), i.latestAppliedRequestId = u), d.onSuccess?.(ut, a), a.data;
      } catch (v) {
        const A = typeof DOMException < "u" && v instanceof DOMException ? v.name === "AbortError" : v?.name === "AbortError", j = v instanceof W ? v : Q({
          httpCode: null,
          body: void 0,
          message: y ? "Request timed out" : A ? "Request aborted" : void 0,
          fallback: "Request failed",
          aborted: A,
          timeout: y,
          cause: v
        });
        throw P = j, (!A || y) && (u === i.requestId && (a.httpCode = j.httpCode, _(j)), v instanceof W || d.onError?.(j, a)), j;
      } finally {
        i.timeoutId && (clearTimeout(i.timeoutId), i.timeoutId = null), i.controller === p && (i.controller = null), Et(), d.onFinish?.(a, P), i.currentPromise === O && (i.currentPromise = null);
      }
    })(), i.currentPromise = O, O;
  }, St = (o, u) => {
    const l = ct(o, u);
    return I({
      url: l.url,
      options: l.options,
      mode: "send"
    });
  }, S = (o, u, l) => {
    const m = ct(u, l);
    return I({
      url: m.url,
      options: m.options,
      method: o,
      mode: "send"
    });
  }, Wt = (o) => I({
    options: o,
    mode: "reload"
  }), nt = (o) => I({
    options: o,
    mode: "send"
  }), at = () => {
    i.disposed = !0, i.stops.forEach((o) => o()), i.stops = [], E && (clearTimeout(E), E = null), i.controller?.abort();
  }, $t = () => {
    const o = ft(n.watch, n), u = !!o, l = n.clearErrorOnChange !== !1;
    if (!u && !l) return;
    D = o ? R(a.data, {
      only: o.only,
      omit: o.omit
    }) : null;
    const m = Kt(() => a.data, () => {
      const d = h(a.data);
      if (i.muteWatch > 0) {
        b = d, D = o ? R(a.data, {
          only: o.only,
          omit: o.omit
        }) : null;
        return;
      }
      const p = pt(d, b);
      if (l && p.forEach((y) => qt(y)), u && o) {
        const y = R(a.data, {
          only: o.only,
          omit: o.omit
        });
        tr(p, o.only) && !q(y, D) && (E && clearTimeout(E), E = setTimeout(() => {
          E = null, a.send().catch(() => {
          });
        }, o.debounce ?? 100)), D = y;
      }
      b = d;
    }, { deep: !0 });
    i.stops.push(m);
  };
  return Object.assign(a, {
    request: St,
    get: (o, u) => S("GET", o, u),
    post: (o, u) => S("POST", o, u),
    put: (o, u) => S("PUT", o, u),
    patch: (o, u) => S("PATCH", o, u),
    delete: (o, u) => S("DELETE", o, u),
    reload: Wt,
    refresh: nt,
    send: nt,
    setData: wt,
    push: jt,
    reset: Pt,
    default: Ot,
    isDirty: ot,
    getOriginal: Ct,
    getDirty: Tt,
    error: (o) => w()?.error(o) ?? null,
    errors: (o) => o === void 0 ? Dt() : w()?.errors(o) ?? [],
    errorKeys: () => w()?.keys() ?? [],
    hasErrors: (o) => w()?.has(o) ?? !1,
    firstErrorKey: () => w()?.firstKey() ?? null,
    getError: () => w(),
    clearError: et,
    clearErrors: N,
    stop: at
  }), $t(), Lt() && zt(at), n.immediate !== !1 && queueMicrotask(() => {
    i.disposed || a.reload().catch(() => {
    });
  }), a;
}, sr = (t = {}) => {
  const r = dt({
    baseUrl: "",
    headers: {},
    activeRequests: 0,
    transformers: [],
    timeout: t.timeout
  }), e = {
    get activeRequests() {
      return r.activeRequests;
    },
    get processing() {
      return r.activeRequests > 0;
    },
    setBaseUrl(s) {
      return r.baseUrl = s, e;
    },
    setHeaders(s) {
      return r.headers = s, e;
    },
    setHeader(s, n) {
      const c = new Headers(r.headers);
      return typeof s == "string" ? c.set(s, n ?? "") : new Headers(s).forEach((a, i) => {
        c.set(i, a);
      }), r.headers = c, e;
    },
    transformResponse(s) {
      return r.transformers.push(s), e;
    },
    request(s, n = {}) {
      return z(r, s, {
        default: () => null,
        immediate: !1,
        snapshot: !1
      }, "json").request(n);
    },
    get(s, n = {}) {
      return e.request(s, {
        ...n,
        method: "GET"
      });
    },
    post(s, n = {}) {
      return e.request(s, {
        ...n,
        method: "POST"
      });
    },
    put(s, n = {}) {
      return e.request(s, {
        ...n,
        method: "PUT"
      });
    },
    patch(s, n = {}) {
      return e.request(s, {
        ...n,
        method: "PATCH"
      });
    },
    delete(s, n = {}) {
      return e.request(s, {
        ...n,
        method: "DELETE"
      });
    },
    form(s = (() => ({})), n = {}) {
      return z(r, "", {
        ...n,
        default: s,
        immediate: !1
      }, "json");
    },
    create(s, n = {}) {
      return z(r, s, n, "json");
    },
    createModel(s, n = {}) {
      return e.create(s, n);
    },
    createCollection(s, n = {}) {
      return e.create(s, {
        default: () => [],
        snapshot: !1,
        ...n
      });
    },
    createForm(s, n = {}) {
      return z(r, s, {
        default: () => new FormData(),
        immediate: !1,
        method: "POST",
        snapshot: !1,
        ...n
      }, "formData");
    }
  };
  return e;
};
export {
  W as ApixError,
  sr as createApix
};

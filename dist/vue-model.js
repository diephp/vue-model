import { getCurrentScope as Lt, markRaw as Ht, onScopeDispose as zt, reactive as dt, toRaw as S, watch as Kt } from "vue";
var M = (t, r) => Object.prototype.hasOwnProperty.call(t, r), f = (t) => {
  if (t === null || typeof t != "object") return !1;
  const r = Object.getPrototypeOf(S(t));
  return r === Object.prototype || r === null;
}, G = (t) => t !== null && typeof t == "object", Gt = (t) => String(t), h = (t) => {
  const r = S(t);
  if (Array.isArray(r)) return r.map((e) => h(e));
  if (f(r)) {
    const e = {};
    return Object.keys(r).forEach((n) => {
      e[n] = h(r[n]);
    }), e;
  }
  return r;
}, F = (t, r) => {
  if (r === void 0) return h(t);
  if (Array.isArray(r) || !f(t) || !f(r)) return h(r);
  const e = h(t);
  return Object.keys(r).forEach((n) => {
    if (f(e[n]) && f(r[n])) {
      e[n] = F(e[n], r[n]);
      return;
    }
    e[n] = h(r[n]);
  }), e;
}, K = (t, r) => {
  if (q(t, r)) return t;
  if (Array.isArray(t) && Array.isArray(r))
    return t.splice(0, t.length, ...r.map((e) => h(e))), t;
  if (f(t) && f(r)) {
    const e = t, n = r;
    return Object.keys(e).forEach((o) => {
      M(n, o) || delete e[o];
    }), Object.keys(n).forEach((o) => {
      const c = e[o], a = n[o];
      if (Array.isArray(c) && Array.isArray(a) || f(c) && f(a)) {
        K(c, a);
        return;
      }
      q(c, a) || (e[o] = h(a));
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
  const n = S(t);
  if (M(n, e)) return {
    exists: !0,
    value: n[e],
    segments: [e]
  };
  const o = e.split(".");
  let c = n;
  const a = [];
  for (let i = 0; i < o.length; i += 1) {
    if (!G(c)) return {
      exists: !1,
      value: void 0,
      segments: a
    };
    const b = o.slice(i).join("."), D = S(c);
    if (M(D, b)) return {
      exists: !0,
      value: D[b],
      segments: [...a, b]
    };
    const E = o[i];
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
  let n = t;
  r.forEach((o, c) => {
    if (c === r.length - 1) {
      n[o] = h(e);
      return;
    }
    (!G(n[o]) || Array.isArray(n[o])) && (n[o] = {}), n = n[o];
  });
}, mt = (t, r) => {
  const e = J(t, r);
  if (!e.exists || e.segments.length === 0) return;
  let n = t;
  for (let o = 0; o < e.segments.length - 1; o += 1) n = n?.[e.segments[o]];
  G(n) && delete n[e.segments[e.segments.length - 1]];
}, Ut = (t, r) => {
  const e = {};
  return r.forEach((n) => {
    const o = J(t, n);
    o.exists && ht(e, o.segments, o.value);
  }), e;
}, R = (t, r) => {
  if (t instanceof FormData) return t;
  let e = r?.only !== void 0 ? Ut(t, r.only) : h(t);
  return r?.omit?.forEach((n) => {
    mt(e, n);
  }), e;
}, H = (t, r) => t instanceof FormData ? null : R(t, { omit: r }), q = (t, r) => {
  const e = S(t), n = S(r);
  if (Object.is(e, n)) return !0;
  if (Array.isArray(e) || Array.isArray(n))
    return !Array.isArray(e) || !Array.isArray(n) || e.length !== n.length ? !1 : e.every((o, c) => q(o, n[c]));
  if (f(e) || f(n)) {
    if (!f(e) || !f(n)) return !1;
    const o = Object.keys(e), c = Object.keys(n);
    return o.length !== c.length ? !1 : o.every((a) => M(n, a) && q(e[a], n[a]));
  }
  return !1;
}, gt = (t, r) => {
  if (q(t, r)) return {};
  if (Array.isArray(t) || !f(t) || !f(r)) return h(t);
  const e = {};
  return Object.keys(t).forEach((n) => {
    if (!q(t[n], r[n])) {
      if (f(t[n]) && f(r[n])) {
        const o = gt(t[n], r[n]);
        if (f(o) && Object.keys(o).length === 0) return;
        e[n] = o;
        return;
      }
      e[n] = h(t[n]);
    }
  }), e;
}, pt = (t, r, e = "") => {
  if (q(t, r)) return [];
  if (!f(t) || !f(r)) return e ? [e] : [];
  const n = /* @__PURE__ */ new Set([...Object.keys(t), ...Object.keys(r)]), o = [];
  return n.forEach((c) => {
    const a = e ? `${e}.${c}` : c;
    o.push(...pt(t[c], r[c], a));
  }), o;
}, U = (t) => t == null ? [] : Array.isArray(t) ? t.flatMap((r) => U(r)).filter((r) => typeof r == "string") : typeof t == "string" ? [t] : typeof t == "number" || typeof t == "boolean" ? [String(t)] : f(t) ? Object.values(t).flatMap((r) => U(r)) : [], yt = (t, r = "") => t == null ? [] : Array.isArray(t) || typeof t == "string" ? r ? [r] : [] : f(t) ? Object.keys(t).flatMap((e) => {
  const n = r ? `${r}.${e}` : e;
  return yt(t[e], n);
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
  const n = new Headers(t), o = (c) => {
    c && new Headers(c).forEach((a, i) => {
      n.set(i, a);
    });
  };
  return o(x(r)), o(x(e)), n;
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
      e.forEach((n) => Z(t, r, n));
      return;
    }
    if (typeof e == "object") {
      Object.keys(e).forEach((n) => {
        Z(t, `${r}.${n}`, e[n]);
      });
      return;
    }
    t.append(r, String(e));
  }
}, Vt = (t, r) => {
  if (!r || Object.keys(r).length === 0) return t;
  const [e, n = ""] = t.split("#"), o = e.includes("?") ? "&" : "?", c = new URLSearchParams();
  Object.keys(r).forEach((i) => {
    Z(c, i, r[i]);
  });
  const a = c.toString();
  return a ? `${e}${o}${a}${n ? `#${n}` : ""}` : t;
}, Xt = (t, r) => r ? /^(https?:)?\/\//i.test(r) || !t ? r : r.startsWith("?") || r.startsWith("#") ? `${t}${r}` : t.endsWith("/") && r.startsWith("/") ? `${t}${r.slice(1)}` : !t.endsWith("/") && !r.startsWith("/") ? `${t}/${r}` : `${t}${r}` : t, lt = (t, r) => {
  if (!r || Object.keys(r).length === 0) return t;
  if (t instanceof FormData) {
    const e = new FormData();
    return t.forEach((n, o) => {
      e.append(o, n);
    }), Object.keys(r).forEach((n) => {
      const o = r[n];
      if (o !== void 0) {
        if (o instanceof Blob) {
          e.append(n, o);
          return;
        }
        if (typeof o == "object" && o !== null) {
          e.append(n, JSON.stringify(o));
          return;
        }
        e.append(n, o === null ? "" : String(o));
      }
    }), e;
  }
  return f(t) ? F(r, t) : t ?? h(r);
}, Yt = (t, r) => {
  let e = !1;
  return t.forEach((n, o) => {
    o.toLowerCase() === r.toLowerCase() && (e = !0);
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
}, tr = (t, r) => r === void 0 ? t.length > 0 : r.length === 0 ? !1 : t.some((e) => r.some((n) => {
  const o = String(n);
  return e === o || e.startsWith(`${o}.`);
})), rr = async (t, r, e, n, o, c, a) => {
  let i = e.path === void 0 ? t : C(t, e.path);
  const b = e.after;
  return b && (i = await b(i, {
    model: r,
    options: e,
    url: n,
    method: o,
    ok: c,
    status: a
  })), R(i, e.response);
}, z = (t, r, e = {}, n = "json") => {
  const o = {
    immediate: n !== "formData",
    abort: !0,
    locked: !1,
    snapshot: n !== "formData",
    clearErrorOnChange: !0,
    ...e
  }, c = X(o), a = dt({
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
    original: o.snapshot === !1 ? null : H(a.data, o.omit),
    lastError: null,
    muteWatch: 0,
    bodyType: n
  };
  let b = h(a.data), D = null, E = null;
  const k = (s) => {
    i.muteWatch += 1;
    try {
      s(), b = h(a.data);
      const u = ft(o.watch, o);
      D = u ? R(a.data, {
        only: u.only,
        omit: u.omit
      }) : null;
    } finally {
      queueMicrotask(() => {
        i.muteWatch = Math.max(0, i.muteWatch - 1);
      });
    }
  }, tt = (s) => {
    a.processing !== s && (a.processing = s, o.onProcessing?.(s, a));
  }, bt = () => {
    i.activeLocalRequests += 1, t.activeRequests += 1, tt(!0);
  }, Et = () => {
    i.activeLocalRequests = Math.max(0, i.activeLocalRequests - 1), t.activeRequests = Math.max(0, t.activeRequests - 1), tt(i.activeLocalRequests > 0);
  }, At = () => {
    o.snapshot === !1 || vt(a.data) || (i.original = H(a.data, o.omit));
  }, N = () => {
    a.message = null, i.lastError = null;
  }, w = () => i.lastError, _ = (s) => {
    i.lastError = s, a.message = s?.message ?? null;
  }, Dt = () => w()?.errors() ?? {}, rt = (s, u) => f(s) ? {
    ...s,
    errors: u
  } : { errors: u }, et = (s) => {
    const u = w();
    if (!u) return;
    const l = h(u.errors());
    if (mt(l, s), new W({
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
  }, qt = (s) => {
    const u = w();
    u && u.keys().forEach((l) => {
      (l === s || l.startsWith(`${s}.`) || s.startsWith(`${l}.`)) && et(l);
    });
  }, wt = (s) => {
    a.data = $(s);
  }, jt = (s) => {
    if (Array.isArray(a.data)) {
      a.data.push(s);
      return;
    }
    if (f(a.data) && f(s)) {
      a.data = F(a.data, s);
      return;
    }
    a.data = $(s);
  }, Rt = (s, u, l) => {
    i.bodyType !== "formData" && s !== void 0 && k(() => {
      const m = u === "reload" ? X(l) : $(a.data), d = F(m, s), p = K(a.data, d);
      p !== a.data && (a.data = p);
    });
  }, st = (s, u, l = !1, m = !1) => {
    k(() => {
      if (!u?.only && !u?.omit && l) {
        const P = $(s);
        m && f(P) && o.omit?.forEach((v) => {
          const A = J(a.data, v);
          A.exists && ht(P, A.segments, A.value);
        });
        const O = K(a.data, P);
        O !== a.data && (a.data = O);
        return;
      }
      const d = R(s, u), p = F(a.data, d), y = K(a.data, p);
      y !== a.data && (a.data = y);
    });
  }, Pt = (s) => {
    o.snapshot === !1 || i.original === null || st(i.original, s, !0, !0);
  }, Ot = (s) => {
    st(X(o), s, !0);
  }, nt = (s) => {
    if (o.snapshot === !1 || i.original === null) return !1;
    const u = H(a.data, o.omit);
    return s !== void 0 ? o.omit?.some((l) => String(l) === String(s)) ? !1 : !q(C(u, s), C(i.original, s)) : !q(u, i.original);
  }, Ct = (s) => o.snapshot === !1 || i.original === null ? s === void 0 ? null : void 0 : h(s === void 0 ? i.original : C(i.original, s)), Tt = (s) => {
    if (o.snapshot === !1 || i.original === null) return s === void 0 ? {} : void 0;
    const u = H(a.data, o.omit);
    return s !== void 0 ? nt(s) ? h(C(u, s)) : void 0 : gt(u, i.original);
  }, xt = (s, u) => {
    const l = {
      ...o,
      ...s,
      method: u ?? s?.method ?? o.method
    };
    return {
      ...l,
      params: x(l.params),
      headers: x(l.headers),
      body: x(l.body)
    };
  }, St = async (s, u, l, m) => {
    if (s.body !== void 0) return s.body;
    if (u === "reload") return;
    let d = i.bodyType === "formData" ? a.data : R(a.data, {
      only: s.only,
      omit: s.omit
    });
    return s.before && (d = await s.before(d, {
      model: a,
      options: s,
      url: l,
      method: m
    })), d;
  }, Q = (s) => new W({
    httpCode: s.httpCode ?? null,
    body: s.body,
    message: s.message ?? Jt(s.body, s.fallback),
    errors: s.errors ?? Nt(s.body),
    aborted: s.aborted,
    timeout: s.timeout,
    cause: s.cause
  }), I = (s) => {
    if (i.disposed) return Promise.reject(Q({
      httpCode: null,
      message: "Model has been stopped",
      aborted: !0
    }));
    const u = i.requestId + 1, l = s.options, m = _t(l?.method ?? s.method ?? o.method ?? "GET"), d = xt(l, m);
    if (d.locked && a.processing && i.currentPromise) return i.currentPromise;
    i.requestId = u, d.abort && i.controller && i.controller.abort();
    const p = new AbortController();
    i.controller = p;
    let y = !1, P = null, O;
    return O = (async () => {
      bt();
      try {
        const v = Xt(t.baseUrl, s.url ?? l?.url ?? r), A = await St(d, s.mode, v, m), j = Qt(t.headers, o.headers, l?.headers), Mt = Y(m) ? A : lt(A, d.params), Ft = Y(m) ? lt(A, d.params) : void 0, V = Vt(v, Ft), It = Zt(m, Mt, j);
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
        return it && (a.httpCode = g.status, N(), Rt(ut, s.mode, d), At(), i.latestAppliedRequestId = u), d.onSuccess?.(ut, a), a.data;
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
  }, Bt = (s, u) => {
    const l = ct(s, u);
    return I({
      url: l.url,
      options: l.options,
      mode: "send"
    });
  }, B = (s, u, l) => {
    const m = ct(u, l);
    return I({
      url: m.url,
      options: m.options,
      method: s,
      mode: "send"
    });
  }, Wt = (s) => I({
    options: s,
    mode: "reload"
  }), ot = (s) => I({
    options: s,
    mode: "send"
  }), at = () => {
    i.disposed = !0, i.stops.forEach((s) => s()), i.stops = [], E && (clearTimeout(E), E = null), i.controller?.abort();
  }, $t = () => {
    const s = ft(o.watch, o), u = !!s, l = o.clearErrorOnChange !== !1;
    if (!u && !l) return;
    D = s ? R(a.data, {
      only: s.only,
      omit: s.omit
    }) : null;
    const m = Kt(() => a.data, () => {
      const d = h(a.data);
      if (i.muteWatch > 0) {
        b = d, D = s ? R(a.data, {
          only: s.only,
          omit: s.omit
        }) : null;
        return;
      }
      const p = pt(d, b);
      if (l && p.forEach((y) => qt(y)), u && s) {
        const y = R(a.data, {
          only: s.only,
          omit: s.omit
        });
        tr(p, s.only) && !q(y, D) && (E && clearTimeout(E), E = setTimeout(() => {
          E = null, a.send().catch(() => {
          });
        }, s.debounce ?? 100)), D = y;
      }
      b = d;
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
    setData: wt,
    push: jt,
    reset: Pt,
    default: Ot,
    isDirty: nt,
    getOriginal: Ct,
    getDirty: Tt,
    error: (s) => w()?.error(s) ?? null,
    errors: (s) => s === void 0 ? Dt() : w()?.errors(s) ?? [],
    errorKeys: () => w()?.keys() ?? [],
    hasErrors: (s) => w()?.has(s) ?? !1,
    firstErrorKey: () => w()?.firstKey() ?? null,
    getError: () => w(),
    clearError: et,
    clearErrors: N,
    stop: at
  }), $t(), Lt() && zt(at), o.immediate !== !1 && queueMicrotask(() => {
    i.disposed || a.reload().catch(() => {
    });
  }), a;
}, sr = () => {
  const t = dt({
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
    setHeader(e, n) {
      const o = new Headers(t.headers);
      return typeof e == "string" ? o.set(e, n ?? "") : new Headers(e).forEach((c, a) => {
        o.set(a, c);
      }), t.headers = o, r;
    },
    transformResponse(e) {
      return t.transformers.push(e), r;
    },
    request(e, n = {}) {
      return z(t, e, {
        default: () => null,
        immediate: !1,
        snapshot: !1
      }, "json").request(n);
    },
    get(e, n = {}) {
      return r.request(e, {
        ...n,
        method: "GET"
      });
    },
    post(e, n = {}) {
      return r.request(e, {
        ...n,
        method: "POST"
      });
    },
    put(e, n = {}) {
      return r.request(e, {
        ...n,
        method: "PUT"
      });
    },
    patch(e, n = {}) {
      return r.request(e, {
        ...n,
        method: "PATCH"
      });
    },
    delete(e, n = {}) {
      return r.request(e, {
        ...n,
        method: "DELETE"
      });
    },
    form(e = (() => ({})), n = {}) {
      return z(t, "", {
        ...n,
        default: e,
        immediate: !1
      }, "json");
    },
    create(e, n = {}) {
      return z(t, e, n, "json");
    },
    createModel(e, n = {}) {
      return r.create(e, n);
    },
    createCollection(e, n = {}) {
      return r.create(e, {
        default: () => [],
        snapshot: !1,
        ...n
      });
    },
    createForm(e, n = {}) {
      return z(t, e, {
        default: () => new FormData(),
        immediate: !1,
        method: "POST",
        snapshot: !1,
        ...n
      }, "formData");
    }
  };
  return r;
};
export {
  W as ApixError,
  sr as createApix
};

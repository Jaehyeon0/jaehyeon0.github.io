(() => {
  "use strict";
  var e = "Ids",
    t = "NotificationReceived",
    n = "NotificationConverted",
    r = "configs",
    i = "permission",
    a = "shouldResubscribe",
    o = "isSubscribed",
    s = "badgeCount",
    c = "flarelane_db",
    u = "flarelane_db_window",
    l = "flarelane_handlerManagerInit",
    f = "flarelane_get",
    d = "flarelane_getAll",
    h = "flarelane_put",
    p = "flarelane_delete",
    v = "flarelane_clearTable";
  let b, g;
  const y = new WeakMap(),
    w = new WeakMap(),
    m = new WeakMap(),
    D = new WeakMap(),
    S = new WeakMap();
  let E = {
    get(e, t, n) {
      if (e instanceof IDBTransaction) {
        if ("done" === t) return w.get(e);
        if ("objectStoreNames" === t) return e.objectStoreNames || m.get(e);
        if ("store" === t)
          return n.objectStoreNames[1]
            ? void 0
            : n.objectStore(n.objectStoreNames[0]);
      }
      return k(e[t]);
    },
    set: (e, t, n) => ((e[t] = n), !0),
    has: (e, t) =>
      (e instanceof IDBTransaction && ("done" === t || "store" === t)) ||
      t in e,
  };
  function I(e) {
    return "function" == typeof e
      ? (t = e) !== IDBDatabase.prototype.transaction ||
        "objectStoreNames" in IDBTransaction.prototype
        ? (
            g ||
            (g = [
              IDBCursor.prototype.advance,
              IDBCursor.prototype.continue,
              IDBCursor.prototype.continuePrimaryKey,
            ])
          ).includes(t)
          ? function (...e) {
              return t.apply(x(this), e), k(y.get(this));
            }
          : function (...e) {
              return k(t.apply(x(this), e));
            }
        : function (e, ...n) {
            const r = t.call(x(this), e, ...n);
            return m.set(r, e.sort ? e.sort() : [e]), k(r);
          }
      : (e instanceof IDBTransaction &&
          (function (e) {
            if (w.has(e)) return;
            const t = new Promise((t, n) => {
              const r = () => {
                  e.removeEventListener("complete", i),
                    e.removeEventListener("error", a),
                    e.removeEventListener("abort", a);
                },
                i = () => {
                  t(), r();
                },
                a = () => {
                  n(e.error || new DOMException("AbortError", "AbortError")),
                    r();
                };
              e.addEventListener("complete", i),
                e.addEventListener("error", a),
                e.addEventListener("abort", a);
            });
            w.set(e, t);
          })(e),
        (n = e),
        (
          b ||
          (b = [
            IDBDatabase,
            IDBObjectStore,
            IDBIndex,
            IDBCursor,
            IDBTransaction,
          ])
        ).some((e) => n instanceof e)
          ? new Proxy(e, E)
          : e);
    var t, n;
  }
  function k(e) {
    if (e instanceof IDBRequest)
      return (function (e) {
        const t = new Promise((t, n) => {
          const r = () => {
              e.removeEventListener("success", i),
                e.removeEventListener("error", a);
            },
            i = () => {
              t(k(e.result)), r();
            },
            a = () => {
              n(e.error), r();
            };
          e.addEventListener("success", i), e.addEventListener("error", a);
        });
        return (
          t
            .then((t) => {
              t instanceof IDBCursor && y.set(t, e);
            })
            .catch(() => {}),
          S.set(t, e),
          t
        );
      })(e);
    if (D.has(e)) return D.get(e);
    const t = I(e);
    return t !== e && (D.set(e, t), S.set(t, e)), t;
  }
  const x = (e) => S.get(e);
  function B(
    e,
    t,
    { blocked: n, upgrade: r, blocking: i, terminated: a } = {}
  ) {
    const o = indexedDB.open(e, t),
      s = k(o);
    return (
      r &&
        o.addEventListener("upgradeneeded", (e) => {
          r(k(o.result), e.oldVersion, e.newVersion, k(o.transaction));
        }),
      n && o.addEventListener("blocked", () => n()),
      s
        .then((e) => {
          a && e.addEventListener("close", () => a()),
            i && e.addEventListener("versionchange", () => i());
        })
        .catch(() => {}),
      s
    );
  }
  function C(e, { blocked: t } = {}) {
    const n = indexedDB.deleteDatabase(e);
    return t && n.addEventListener("blocked", () => t()), k(n).then(() => {});
  }
  const L = ["get", "getKey", "getAll", "getAllKeys", "count"],
    T = ["put", "add", "delete", "clear"],
    P = new Map();
  function N(e, t) {
    if (!(e instanceof IDBDatabase) || t in e || "string" != typeof t) return;
    if (P.get(t)) return P.get(t);
    const n = t.replace(/FromIndex$/, ""),
      r = t !== n,
      i = T.includes(n);
    if (
      !(n in (r ? IDBIndex : IDBObjectStore).prototype) ||
      (!i && !L.includes(n))
    )
      return;
    const a = async function (e, ...t) {
      const a = this.transaction(e, i ? "readwrite" : "readonly");
      let o = a.store;
      return (
        r && (o = o.index(t.shift())),
        (await Promise.all([o[n](...t), i && a.done]))[0]
      );
    };
    return P.set(t, a), a;
  }
  var A;
  (A = E),
    (E = {
      ...A,
      get: (e, t, n) => N(e, t) || A.get(e, t, n),
      has: (e, t) => !!N(e, t) || A.has(e, t),
    });
  var O = { none: 0, error: 1, verbose: 5 };
  const R = (function () {
    function e() {}
    return (
      (e.setisTracerActivate = function () {
        this.isTracerActivate =
          "true" === window.localStorage.getItem("flarelane_isTracerActivate");
      }),
      (e.setLogLevel = function (e) {
        var t = O[e];
        void 0 !== t
          ? (this.logLevel = t)
          : this.error(
              "Cannot set ".concat(
                e,
                " in setLogLevel. Please set one of none, error, verbose."
              )
            );
      }),
      (e.log = function (e) {
        this.logLevel < O.verbose || console.log("[FLARELANE] - ".concat(e));
      }),
      (e.error = function (e, t) {
        this.logLevel < O.error ||
          console.error(
            "[FLARELANE] - ".concat(e),
            t ? t.message || JSON.stringify(t) : void 0
          );
      }),
      (e.trace = function (e) {
        for (var t = [], n = 1; n < arguments.length; n++)
          t[n - 1] = arguments[n];
        this.isTracerActivate &&
          console.log(
            "%c[FLARELANE] - Call: "
              .concat(e, ", Args: ")
              .concat(JSON.stringify(t, null, 2)),
            "color:gray"
          );
      }),
      (e.logLevel = O.verbose),
      (e.isTracerActivate = !1),
      e
    );
  })();
  var U,
    H = new Uint8Array(16);
  function W() {
    if (
      !U &&
      !(U =
        ("undefined" != typeof crypto &&
          crypto.getRandomValues &&
          crypto.getRandomValues.bind(crypto)) ||
        ("undefined" != typeof msCrypto &&
          "function" == typeof msCrypto.getRandomValues &&
          msCrypto.getRandomValues.bind(msCrypto)))
    )
      throw new Error(
        "crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported"
      );
    return U(H);
  }
  const j =
      /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i,
    F = function (e) {
      return "string" == typeof e && j.test(e);
    };
  for (var M = [], _ = 0; _ < 256; ++_)
    M.push((_ + 256).toString(16).substr(1));
  const K = function (e, t, n) {
    var r = (e = e || {}).random || (e.rng || W)();
    if (((r[6] = (15 & r[6]) | 64), (r[8] = (63 & r[8]) | 128), t)) {
      n = n || 0;
      for (var i = 0; i < 16; ++i) t[n + i] = r[i];
      return t;
    }
    return (function (e) {
      var t =
          arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0,
        n = (
          M[e[t + 0]] +
          M[e[t + 1]] +
          M[e[t + 2]] +
          M[e[t + 3]] +
          "-" +
          M[e[t + 4]] +
          M[e[t + 5]] +
          "-" +
          M[e[t + 6]] +
          M[e[t + 7]] +
          "-" +
          M[e[t + 8]] +
          M[e[t + 9]] +
          "-" +
          M[e[t + 10]] +
          M[e[t + 11]] +
          M[e[t + 12]] +
          M[e[t + 13]] +
          M[e[t + 14]] +
          M[e[t + 15]]
        ).toLowerCase();
      if (!F(n)) throw TypeError("Stringified UUID is invalid");
      return n;
    })(r);
  };
  var V = function (e, t, n, r) {
      return new (n || (n = Promise))(function (i, a) {
        function o(e) {
          try {
            c(r.next(e));
          } catch (e) {
            a(e);
          }
        }
        function s(e) {
          try {
            c(r.throw(e));
          } catch (e) {
            a(e);
          }
        }
        function c(e) {
          var t;
          e.done
            ? i(e.value)
            : ((t = e.value),
              t instanceof n
                ? t
                : new n(function (e) {
                    e(t);
                  })).then(o, s);
        }
        c((r = r.apply(e, t || [])).next());
      });
    },
    G = function (e, t) {
      var n,
        r,
        i,
        a,
        o = {
          label: 0,
          sent: function () {
            if (1 & i[0]) throw i[1];
            return i[1];
          },
          trys: [],
          ops: [],
        };
      return (
        (a = { next: s(0), throw: s(1), return: s(2) }),
        "function" == typeof Symbol &&
          (a[Symbol.iterator] = function () {
            return this;
          }),
        a
      );
      function s(s) {
        return function (c) {
          return (function (s) {
            if (n) throw new TypeError("Generator is already executing.");
            for (; a && ((a = 0), s[0] && (o = 0)), o; )
              try {
                if (
                  ((n = 1),
                  r &&
                    (i =
                      2 & s[0]
                        ? r.return
                        : s[0]
                        ? r.throw || ((i = r.return) && i.call(r), 0)
                        : r.next) &&
                    !(i = i.call(r, s[1])).done)
                )
                  return i;
                switch (((r = 0), i && (s = [2 & s[0], i.value]), s[0])) {
                  case 0:
                  case 1:
                    i = s;
                    break;
                  case 4:
                    return o.label++, { value: s[1], done: !1 };
                  case 5:
                    o.label++, (r = s[1]), (s = [0]);
                    continue;
                  case 7:
                    (s = o.ops.pop()), o.trys.pop();
                    continue;
                  default:
                    if (
                      !(
                        (i = (i = o.trys).length > 0 && i[i.length - 1]) ||
                        (6 !== s[0] && 2 !== s[0])
                      )
                    ) {
                      o = 0;
                      continue;
                    }
                    if (3 === s[0] && (!i || (s[1] > i[0] && s[1] < i[3]))) {
                      o.label = s[1];
                      break;
                    }
                    if (6 === s[0] && o.label < i[1]) {
                      (o.label = i[1]), (i = s);
                      break;
                    }
                    if (i && o.label < i[2]) {
                      (o.label = i[2]), o.ops.push(s);
                      break;
                    }
                    i[2] && o.ops.pop(), o.trys.pop();
                    continue;
                }
                s = t.call(e, o);
              } catch (e) {
                (s = [6, e]), (r = 0);
              } finally {
                n = i = 0;
              }
            if (5 & s[0]) throw s[1];
            return { value: s[0] ? s[1] : void 0, done: !0 };
          })([s, c]);
        };
      }
    },
    J = (function () {
      function t() {}
      return (
        (t.get = function (e, t, n) {
          return V(this, void 0, void 0, function () {
            var r, i;
            return G(this, function (a) {
              switch (a.label) {
                case 0:
                  return R.trace("Fecth:get", e, t), [4, this.getBaseUrl(t)];
                case 1:
                  return (
                    (r = a.sent()),
                    [
                      4,
                      fetch("".concat(r).concat(e), {
                        method: "GET",
                        headers: this.getHeaders(),
                      }),
                    ]
                  );
                case 2:
                  return (i = a.sent()), n ? [2, i] : [2, i.json()];
              }
            });
          });
        }),
        (t.post = function (e, t, n) {
          return V(this, void 0, void 0, function () {
            var r;
            return G(this, function (i) {
              switch (i.label) {
                case 0:
                  return R.trace("Fecth:post", e, t), [4, this.getBaseUrl(n)];
                case 1:
                  return (
                    (r = i.sent()),
                    [
                      4,
                      fetch("".concat(r).concat(e), {
                        method: "POST",
                        headers: this.getHeaders(),
                        body: JSON.stringify(t),
                      }),
                    ]
                  );
                case 2:
                  return [2, i.sent().json()];
              }
            });
          });
        }),
        (t.patch = function (e, t) {
          return V(this, void 0, void 0, function () {
            var n, r;
            return G(this, function (i) {
              switch (i.label) {
                case 0:
                  return R.trace("Fecth:patch", e, t), [4, this.getBaseUrl()];
                case 1:
                  return (
                    (n = i.sent()),
                    [
                      4,
                      fetch("".concat(n).concat(e), {
                        method: "PATCH",
                        headers: this.getHeaders(),
                        body: JSON.stringify(t),
                      }),
                    ]
                  );
                case 2:
                  if (!(r = i.sent()).ok) throw new Error("Failed to patch");
                  return [2, r.json()];
              }
            });
          });
        }),
        (t.delete = function (e, t) {
          return V(this, void 0, void 0, function () {
            var n;
            return G(this, function (r) {
              switch (r.label) {
                case 0:
                  return R.trace("Fecth:delete", e, t), [4, this.getBaseUrl()];
                case 1:
                  return (
                    (n = r.sent()),
                    [
                      4,
                      fetch("".concat(n).concat(e), {
                        method: "DELETE",
                        headers: this.getHeaders(),
                        body: JSON.stringify(t),
                      }),
                    ]
                  );
                case 2:
                  return [2, r.sent().json()];
              }
            });
          });
        }),
        (t.getHeaders = function () {
          return {
            "Content-Type": "application/json",
            "x-flarelane-sdk-info": this.getSdkInfo(),
          };
        }),
        (t.getSdkInfo = function () {
          return "".concat("native", "-").concat("0.9.0");
        }),
        (t.getBaseUrl = function (t) {
          return V(this, void 0, void 0, function () {
            var n, r;
            return G(this, function (i) {
              switch (i.label) {
                case 0:
                  return t ? ((r = t), [3, 3]) : [3, 1];
                case 1:
                  return [4, fe.get(e, "projectId")];
                case 2:
                  (r = i.sent()), (i.label = 3);
                case 3:
                  return (
                    (n = r),
                    [
                      2,
                      ""
                        .concat(
                          "https://staging-service-api.flarelane.com/internal/v1/projects",
                          "/"
                        )
                        .concat(n),
                    ]
                  );
              }
            });
          });
        }),
        t
      );
    })(),
    q = function () {
      return (
        !!window.postMessage ||
        (R.error("This browser doesn't support window.postMessage()"), !1)
      );
    },
    $ = function (e, t, n) {
      try {
        if (new URL(e).origin !== new URL(t).origin) {
          if (n)
            throw new Error(
              "Please check site url or subdomain in flarelane console"
            );
          return !1;
        }
        return !0;
      } catch (e) {
        if (n) throw e;
        return !1;
      }
    },
    z = function (e) {
      return JSON.parse(JSON.stringify(e));
    },
    Q = function (e, t, n, r) {
      return new (n || (n = Promise))(function (i, a) {
        function o(e) {
          try {
            c(r.next(e));
          } catch (e) {
            a(e);
          }
        }
        function s(e) {
          try {
            c(r.throw(e));
          } catch (e) {
            a(e);
          }
        }
        function c(e) {
          var t;
          e.done
            ? i(e.value)
            : ((t = e.value),
              t instanceof n
                ? t
                : new n(function (e) {
                    e(t);
                  })).then(o, s);
        }
        c((r = r.apply(e, t || [])).next());
      });
    },
    X = function (e, t) {
      var n,
        r,
        i,
        a,
        o = {
          label: 0,
          sent: function () {
            if (1 & i[0]) throw i[1];
            return i[1];
          },
          trys: [],
          ops: [],
        };
      return (
        (a = { next: s(0), throw: s(1), return: s(2) }),
        "function" == typeof Symbol &&
          (a[Symbol.iterator] = function () {
            return this;
          }),
        a
      );
      function s(s) {
        return function (c) {
          return (function (s) {
            if (n) throw new TypeError("Generator is already executing.");
            for (; a && ((a = 0), s[0] && (o = 0)), o; )
              try {
                if (
                  ((n = 1),
                  r &&
                    (i =
                      2 & s[0]
                        ? r.return
                        : s[0]
                        ? r.throw || ((i = r.return) && i.call(r), 0)
                        : r.next) &&
                    !(i = i.call(r, s[1])).done)
                )
                  return i;
                switch (((r = 0), i && (s = [2 & s[0], i.value]), s[0])) {
                  case 0:
                  case 1:
                    i = s;
                    break;
                  case 4:
                    return o.label++, { value: s[1], done: !1 };
                  case 5:
                    o.label++, (r = s[1]), (s = [0]);
                    continue;
                  case 7:
                    (s = o.ops.pop()), o.trys.pop();
                    continue;
                  default:
                    if (
                      !(
                        (i = (i = o.trys).length > 0 && i[i.length - 1]) ||
                        (6 !== s[0] && 2 !== s[0])
                      )
                    ) {
                      o = 0;
                      continue;
                    }
                    if (3 === s[0] && (!i || (s[1] > i[0] && s[1] < i[3]))) {
                      o.label = s[1];
                      break;
                    }
                    if (6 === s[0] && o.label < i[1]) {
                      (o.label = i[1]), (i = s);
                      break;
                    }
                    if (i && o.label < i[2]) {
                      (o.label = i[2]), o.ops.push(s);
                      break;
                    }
                    i[2] && o.ops.pop(), o.trys.pop();
                    continue;
                }
                s = t.call(e, o);
              } catch (e) {
                (s = [6, e]), (r = 0);
              } finally {
                n = i = 0;
              }
            if (5 & s[0]) throw s[1];
            return { value: s[0] ? s[1] : void 0, done: !0 };
          })([s, c]);
        };
      }
    },
    Y = (function () {
      function t() {}
      return (
        (t.saveConfigs = function (t, n) {
          var i = "".concat(this.cacheKeyPrefix).concat(n),
            a = "".concat(this.cacheTimestampKeyPrefix).concat(n);
          return (
            sessionStorage.setItem(i, JSON.stringify(t)),
            sessionStorage.setItem(a, new Date().valueOf().toString()),
            fe.put(e, r, t)
          );
        }),
        (t.getConfigs = function () {
          return Q(this, void 0, void 0, function () {
            var t;
            return X(this, function (n) {
              switch (n.label) {
                case 0:
                  return [4, fe.get(e, r)];
                case 1:
                  return (
                    (t = n.sent()),
                    this.additionalOrigin &&
                      (t.originSiteUrl = this.additionalOrigin),
                    [2, t]
                  );
              }
            });
          });
        }),
        (t.getRemoteConfigs = function (t) {
          return Q(this, void 0, void 0, function () {
            var n, r, i, a, o, s, c, u;
            return X(this, function (l) {
              switch (l.label) {
                case 0:
                  return (
                    (n = "blocked:".concat(t)),
                    (r = "[BLOCKED] projectId: ".concat(
                      t,
                      " blocked. please contact to flarelane support <help@flarelane.com>"
                    )),
                    [4, fe.get(e, n)]
                  );
                case 1:
                  if (l.sent()) throw new Error(r);
                  return (
                    (i = "".concat(this.cacheKeyPrefix).concat(t)),
                    (a = "".concat(this.cacheTimestampKeyPrefix).concat(t)),
                    (o = sessionStorage.getItem(i)),
                    (s = sessionStorage.getItem(a)),
                    o &&
                    s &&
                    !Number.isNaN(Number(s)) &&
                    new Date().valueOf() - Number(s) < this.cacheMaxAge
                      ? [2, JSON.parse(o)]
                      : [4, J.get(this.url, t, !0)]
                  );
                case 2:
                  return 404 !== (c = l.sent()).status && 403 !== c.status
                    ? [3, 4]
                    : [4, fe.put(e, n, !0)];
                case 3:
                  throw (l.sent(), new Error(r));
                case 4:
                  if (!c.ok) throw new Error("Failed to get remoteConfigs");
                  return [4, c.json()];
                case 5:
                  return (
                    (u = l.sent()),
                    this.additionalOrigin &&
                      (u.data.originSiteUrl = this.additionalOrigin),
                    [2, u.data]
                  );
              }
            });
          });
        }),
        (t.setAdditionalOrigin = function (e, n) {
          if (e.originSiteUrl && !$(e.originSiteUrl, n)) {
            var r = (function (e, t) {
              try {
                return (
                  (null == e
                    ? void 0
                    : e.filter(function (e) {
                        return new URL(e).origin === new URL(t).origin;
                      })[0]) || null
                );
              } catch (e) {
                return null;
              }
            })(
              (function (e, t, n) {
                if (n || 2 === arguments.length)
                  for (var r, i = 0, a = t.length; i < a; i++)
                    (!r && i in t) ||
                      (r || (r = Array.prototype.slice.call(t, 0, i)),
                      (r[i] = t[i]));
                return e.concat(r || Array.prototype.slice.call(t));
              })([], e.additionalOrigins, !0),
              n
            );
            if (null === r)
              throw new Error(
                "Please check site url or subdomain in flarelane console"
              );
            return (t.additionalOrigin = r), r;
          }
        }),
        (t.additionalOrigin = null),
        (t.url = "/remote-params-web"),
        (t.cacheKeyPrefix = "flarelane:remoteConfigs:"),
        (t.cacheTimestampKeyPrefix = "flarelane:remoteConfigs:ts:"),
        (t.cacheMaxAge = 3e5),
        t
      );
    })(),
    Z = (function () {
      function e() {}
      return (
        (e.create = function (e) {
          return document.createElement(e);
        }),
        (e.remove = function (e) {
          var t = this.get(e);
          t && t.remove();
        }),
        (e.get = function (e) {
          return document.getElementById(e);
        }),
        (e.getBody = function (e) {
          return e.document.body || e.document.getElementsByTagName("body")[0];
        }),
        (e.getHead = function (e) {
          return e.document.head || e.document.getElementsByTagName("head")[0];
        }),
        (e.getParentWindow = function () {
          return window.opener || window.parent || null;
        }),
        (e.setCss = function (e, t) {
          if (!this.get(e)) {
            var n = this.getHead(window),
              r = this.create("style");
            (r.id = e), (r.textContent = t), n.append(r);
          }
        }),
        (e.setMobileCss = function (e, t) {
          var n =
            "\n      @media screen and (max-width: 768px) {\n        ".concat(
              t,
              "\n      }\n    "
            );
          this.setCss(e, n);
        }),
        e
      );
    })(),
    ee = function (e, t, n, r) {
      return new (n || (n = Promise))(function (i, a) {
        function o(e) {
          try {
            c(r.next(e));
          } catch (e) {
            a(e);
          }
        }
        function s(e) {
          try {
            c(r.throw(e));
          } catch (e) {
            a(e);
          }
        }
        function c(e) {
          var t;
          e.done
            ? i(e.value)
            : ((t = e.value),
              t instanceof n
                ? t
                : new n(function (e) {
                    e(t);
                  })).then(o, s);
        }
        c((r = r.apply(e, t || [])).next());
      });
    },
    te = function (e, t) {
      var n,
        r,
        i,
        a,
        o = {
          label: 0,
          sent: function () {
            if (1 & i[0]) throw i[1];
            return i[1];
          },
          trys: [],
          ops: [],
        };
      return (
        (a = { next: s(0), throw: s(1), return: s(2) }),
        "function" == typeof Symbol &&
          (a[Symbol.iterator] = function () {
            return this;
          }),
        a
      );
      function s(s) {
        return function (c) {
          return (function (s) {
            if (n) throw new TypeError("Generator is already executing.");
            for (; a && ((a = 0), s[0] && (o = 0)), o; )
              try {
                if (
                  ((n = 1),
                  r &&
                    (i =
                      2 & s[0]
                        ? r.return
                        : s[0]
                        ? r.throw || ((i = r.return) && i.call(r), 0)
                        : r.next) &&
                    !(i = i.call(r, s[1])).done)
                )
                  return i;
                switch (((r = 0), i && (s = [2 & s[0], i.value]), s[0])) {
                  case 0:
                  case 1:
                    i = s;
                    break;
                  case 4:
                    return o.label++, { value: s[1], done: !1 };
                  case 5:
                    o.label++, (r = s[1]), (s = [0]);
                    continue;
                  case 7:
                    (s = o.ops.pop()), o.trys.pop();
                    continue;
                  default:
                    if (
                      !(
                        (i = (i = o.trys).length > 0 && i[i.length - 1]) ||
                        (6 !== s[0] && 2 !== s[0])
                      )
                    ) {
                      o = 0;
                      continue;
                    }
                    if (3 === s[0] && (!i || (s[1] > i[0] && s[1] < i[3]))) {
                      o.label = s[1];
                      break;
                    }
                    if (6 === s[0] && o.label < i[1]) {
                      (o.label = i[1]), (i = s);
                      break;
                    }
                    if (i && o.label < i[2]) {
                      (o.label = i[2]), o.ops.push(s);
                      break;
                    }
                    i[2] && o.ops.pop(), o.trys.pop();
                    continue;
                }
                s = t.call(e, o);
              } catch (e) {
                (s = [6, e]), (r = 0);
              } finally {
                n = i = 0;
              }
            if (5 & s[0]) throw s[1];
            return { value: s[0] ? s[1] : void 0, done: !0 };
          })([s, c]);
        };
      }
    },
    ne = (function () {
      function e() {}
      return (
        (e.inject = function (e) {
          return ee(this, void 0, void 0, function () {
            var t = this;
            return te(this, function (n) {
              return (
                R.trace("Iframe:inject", e),
                [
                  2,
                  new Promise(function (n, r) {
                    return ee(t, void 0, void 0, function () {
                      var t, i, a;
                      return te(this, function (o) {
                        try {
                          if (Z.get(this.iframeId)) return [2];
                          (t = Z.getBody(window)),
                            (i = Z.create("iframe")),
                            ((a = new URL(e)).pathname = "iframe.html"),
                            (i.id = this.iframeId),
                            (i.src = a.href),
                            (i.style.display = "none"),
                            i.setAttribute(
                              "sandbox",
                              "allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts allow-top-navigation"
                            ),
                            i.addEventListener("load", function () {
                              n(!0);
                            }),
                            t.append(i);
                        } catch (e) {
                          r(e);
                        }
                        return [2];
                      });
                    });
                  }),
                ]
              );
            });
          });
        }),
        (e.get = function () {
          return Z.get(this.iframeId) || null;
        }),
        (e.remove = function () {
          var e = Z.get(this.iframeId);
          e && e.remove();
        }),
        (e.iframeId = "flarelane-iframe"),
        e
      );
    })(),
    re = function (e, t, n, r) {
      return new (n || (n = Promise))(function (i, a) {
        function o(e) {
          try {
            c(r.next(e));
          } catch (e) {
            a(e);
          }
        }
        function s(e) {
          try {
            c(r.throw(e));
          } catch (e) {
            a(e);
          }
        }
        function c(e) {
          var t;
          e.done
            ? i(e.value)
            : ((t = e.value),
              t instanceof n
                ? t
                : new n(function (e) {
                    e(t);
                  })).then(o, s);
        }
        c((r = r.apply(e, t || [])).next());
      });
    },
    ie = function (e, t) {
      var n,
        r,
        i,
        a,
        o = {
          label: 0,
          sent: function () {
            if (1 & i[0]) throw i[1];
            return i[1];
          },
          trys: [],
          ops: [],
        };
      return (
        (a = { next: s(0), throw: s(1), return: s(2) }),
        "function" == typeof Symbol &&
          (a[Symbol.iterator] = function () {
            return this;
          }),
        a
      );
      function s(s) {
        return function (c) {
          return (function (s) {
            if (n) throw new TypeError("Generator is already executing.");
            for (; a && ((a = 0), s[0] && (o = 0)), o; )
              try {
                if (
                  ((n = 1),
                  r &&
                    (i =
                      2 & s[0]
                        ? r.return
                        : s[0]
                        ? r.throw || ((i = r.return) && i.call(r), 0)
                        : r.next) &&
                    !(i = i.call(r, s[1])).done)
                )
                  return i;
                switch (((r = 0), i && (s = [2 & s[0], i.value]), s[0])) {
                  case 0:
                  case 1:
                    i = s;
                    break;
                  case 4:
                    return o.label++, { value: s[1], done: !1 };
                  case 5:
                    o.label++, (r = s[1]), (s = [0]);
                    continue;
                  case 7:
                    (s = o.ops.pop()), o.trys.pop();
                    continue;
                  default:
                    if (
                      !(
                        (i = (i = o.trys).length > 0 && i[i.length - 1]) ||
                        (6 !== s[0] && 2 !== s[0])
                      )
                    ) {
                      o = 0;
                      continue;
                    }
                    if (3 === s[0] && (!i || (s[1] > i[0] && s[1] < i[3]))) {
                      o.label = s[1];
                      break;
                    }
                    if (6 === s[0] && o.label < i[1]) {
                      (o.label = i[1]), (i = s);
                      break;
                    }
                    if (i && o.label < i[2]) {
                      (o.label = i[2]), o.ops.push(s);
                      break;
                    }
                    i[2] && o.ops.pop(), o.trys.pop();
                    continue;
                }
                s = t.call(e, o);
              } catch (e) {
                (s = [6, e]), (r = 0);
              } finally {
                n = i = 0;
              }
            if (5 & s[0]) throw s[1];
            return { value: s[0] ? s[1] : void 0, done: !0 };
          })([s, c]);
        };
      }
    },
    ae = (function () {
      function e() {}
      return (
        (e.sendToOrigin = function (e, t, n, r) {
          return re(this, void 0, void 0, function () {
            var i, a, o, s, c;
            return ie(this, function (u) {
              switch (u.label) {
                case 0:
                  return q()
                    ? (R.trace("sendToOrigin", e, t, n, r),
                      (i = Z.getParentWindow())
                        ? [4, this.getSendToConfigs(r)]
                        : [2])
                    : [2];
                case 1:
                  return (
                    (a = u.sent()),
                    (o = a.id),
                    (s = a.originSiteUrl),
                    (c = { type: e, data: t, id: o }),
                    n && this.addEventListenerOnce(s, o, n, "*" === s),
                    i.postMessage(c, s),
                    [2]
                  );
              }
            });
          });
        }),
        (e.sendToIframe = function (e, t, n, r) {
          return re(this, void 0, void 0, function () {
            var i, a, o, s, c;
            return ie(this, function (u) {
              switch (u.label) {
                case 0:
                  return q()
                    ? (R.trace("sendToIframe", e, t, n, r),
                      (i = ne.get()) ? [4, this.getSendToConfigs(r)] : [2])
                    : [2];
                case 1:
                  return (
                    (a = u.sent()),
                    (o = a.id),
                    (s = a.proxySiteUrl),
                    (c = { type: e, data: t, id: o }),
                    n && this.addEventListenerOnce(s, o, n),
                    i.contentWindow.postMessage(c, s),
                    [2]
                  );
              }
            });
          });
        }),
        (e.sendToWindow = function (t, n, r, i) {
          return re(this, void 0, void 0, function () {
            var a, o, s, c, u;
            return ie(this, function (l) {
              switch (l.label) {
                case 0:
                  return q()
                    ? (R.trace("sendToWindow", t, n, r, i),
                      (a = e.windowSubscribePopup)
                        ? [4, this.getSendToConfigs(i)]
                        : [2])
                    : [2];
                case 1:
                  return (
                    (o = l.sent()),
                    (s = o.id),
                    (c = o.proxySiteUrl),
                    (u = { type: t, data: n, id: s }),
                    r && this.addEventListenerOnce(c, s, r),
                    a.postMessage(u, c),
                    [2]
                  );
              }
            });
          });
        }),
        (e.addEventListenerOnce = function (e, t, n, r) {
          R.trace("addEventListenerOnce", e, t, n, r);
          var i = function (a) {
            try {
              if (!r && !$(e, a.origin)) return;
              if (a.data.id !== t) return;
              window.removeEventListener("message", i),
                n(a.data, function () {
                  window.removeEventListener("message", i);
                });
            } catch (e) {}
          };
          window.addEventListener("message", i);
        }),
        (e.addEventListener = function (e, t, n) {
          R.trace("addEventListener", e, t, n);
          var r = function (i) {
            try {
              if (e && !n && !$(i.origin, e)) return;
              t(i.data, function () {
                window.removeEventListener("message", r);
              });
            } catch (e) {}
          };
          window.addEventListener("message", r);
        }),
        (e.getSendToConfigs = function (e) {
          return re(this, void 0, void 0, function () {
            var t, n, r;
            return ie(this, function (i) {
              switch (i.label) {
                case 0:
                  return (
                    (t = (null == e ? void 0 : e.replyId) || K()),
                    (n = null == e ? void 0 : e.origin)
                      ? [2, { id: t, proxySiteUrl: n, originSiteUrl: n }]
                      : [3, 1]
                  );
                case 1:
                  return [4, Y.getConfigs()];
                case 2:
                  return (
                    (r = i.sent()),
                    [
                      2,
                      {
                        id: t,
                        proxySiteUrl: r.proxySiteUrl,
                        originSiteUrl: r.originSiteUrl,
                      },
                    ]
                  );
              }
            });
          });
        }),
        (e.windowSubscribePopup = null),
        e
      );
    })(),
    oe = function (e, t, n, r) {
      return new (n || (n = Promise))(function (i, a) {
        function o(e) {
          try {
            c(r.next(e));
          } catch (e) {
            a(e);
          }
        }
        function s(e) {
          try {
            c(r.throw(e));
          } catch (e) {
            a(e);
          }
        }
        function c(e) {
          var t;
          e.done
            ? i(e.value)
            : ((t = e.value),
              t instanceof n
                ? t
                : new n(function (e) {
                    e(t);
                  })).then(o, s);
        }
        c((r = r.apply(e, t || [])).next());
      });
    },
    se = function (e, t) {
      var n,
        r,
        i,
        a,
        o = {
          label: 0,
          sent: function () {
            if (1 & i[0]) throw i[1];
            return i[1];
          },
          trys: [],
          ops: [],
        };
      return (
        (a = { next: s(0), throw: s(1), return: s(2) }),
        "function" == typeof Symbol &&
          (a[Symbol.iterator] = function () {
            return this;
          }),
        a
      );
      function s(s) {
        return function (c) {
          return (function (s) {
            if (n) throw new TypeError("Generator is already executing.");
            for (; a && ((a = 0), s[0] && (o = 0)), o; )
              try {
                if (
                  ((n = 1),
                  r &&
                    (i =
                      2 & s[0]
                        ? r.return
                        : s[0]
                        ? r.throw || ((i = r.return) && i.call(r), 0)
                        : r.next) &&
                    !(i = i.call(r, s[1])).done)
                )
                  return i;
                switch (((r = 0), i && (s = [2 & s[0], i.value]), s[0])) {
                  case 0:
                  case 1:
                    i = s;
                    break;
                  case 4:
                    return o.label++, { value: s[1], done: !1 };
                  case 5:
                    o.label++, (r = s[1]), (s = [0]);
                    continue;
                  case 7:
                    (s = o.ops.pop()), o.trys.pop();
                    continue;
                  default:
                    if (
                      !(
                        (i = (i = o.trys).length > 0 && i[i.length - 1]) ||
                        (6 !== s[0] && 2 !== s[0])
                      )
                    ) {
                      o = 0;
                      continue;
                    }
                    if (3 === s[0] && (!i || (s[1] > i[0] && s[1] < i[3]))) {
                      o.label = s[1];
                      break;
                    }
                    if (6 === s[0] && o.label < i[1]) {
                      (o.label = i[1]), (i = s);
                      break;
                    }
                    if (i && o.label < i[2]) {
                      (o.label = i[2]), o.ops.push(s);
                      break;
                    }
                    i[2] && o.ops.pop(), o.trys.pop();
                    continue;
                }
                s = t.call(e, o);
              } catch (e) {
                (s = [6, e]), (r = 0);
              } finally {
                n = i = 0;
              }
            if (5 & s[0]) throw s[1];
            return { value: s[0] ? s[1] : void 0, done: !0 };
          })([s, c]);
        };
      }
    },
    ce = (function () {
      function t() {}
      return (
        (t.init = function (t) {
          return oe(this, void 0, void 0, function () {
            var n,
              r = this;
            return se(this, function (i) {
              switch (i.label) {
                case 0:
                  return (
                    i.trys.push([0, 4, , 5]), t ? [3, 2] : [4, fe.get(e, o)]
                  );
                case 1:
                  return (
                    (n = i.sent()),
                    (this.lastSubscribed = n),
                    R.trace("HandlerManager.init", this.lastSubscribed),
                    [3, 3]
                  );
                case 2:
                  ae.addEventListener(t, function (e) {
                    e.type === l &&
                      ((r.lastSubscribed = e.data),
                      R.trace("HandlerManager.init", r.lastSubscribed));
                  }),
                    (i.label = 3);
                case 3:
                  return [3, 5];
                case 4:
                  return i.sent(), R.error("HandlerManager.init"), [3, 5];
                case 5:
                  return [2];
              }
            });
          });
        }),
        (t.initProxySide = function () {
          return oe(this, void 0, void 0, function () {
            var t;
            return se(this, function (n) {
              switch (n.label) {
                case 0:
                  return n.trys.push([0, 3, , 4]), [4, fe.get(e, o)];
                case 1:
                  return (t = n.sent()), [4, ae.sendToOrigin(l, t)];
                case 2:
                  return (
                    n.sent(), R.trace("HandlerManager.initProxySide", t), [3, 4]
                  );
                case 3:
                  return (
                    n.sent(), R.error("HandlerManager.initProxySide"), [3, 4]
                  );
                case 4:
                  return [2];
              }
            });
          });
        }),
        (t.setConvertedHandler = function (e) {
          if (this.convertedHandler)
            R.log("A converted handler is already registered.");
          else if ("function" == typeof e) {
            R.trace("setConvertedHandler", e), (this.convertedHandler = e);
            try {
              this.resolveConvertedNotification().catch(function (e) {
                R.error(
                  "An error occurred in convertedHandler."
                    .concat(e.name, "\n")
                    .concat(e.message)
                );
              });
            } catch (e) {
              R.error(
                "An error occurred in setConvertedHandler.\n".concat(e.message)
              );
            }
          } else R.error("setConvertedHandler argument must be a function.");
        }),
        (t.setIsSubscribedChangeHandler = function (e) {
          this.isSubscribedChangeHandler
            ? R.log("A isSubscribedChange handler is already registered.")
            : "function" == typeof e
            ? (R.trace("setIsSubscribedChangeHandler", e),
              (this.isSubscribedChangeHandler = e))
            : R.error(
                "setIsSubscribedChangeHandler argument must be a function."
              );
        }),
        (t.resolveConvertedNotification = function () {
          return oe(this, void 0, void 0, function () {
            var e, t;
            return se(this, function (r) {
              switch (r.label) {
                case 0:
                  return this.convertedHandler
                    ? (R.trace("resolveConvertedNotification"),
                      [4, fe.getAll(n)])
                    : [2];
                case 1:
                  return (e = r.sent()), [4, fe.clearTable(n)];
                case 2:
                  return (
                    r.sent(),
                    (t = e[e.length - 1])
                      ? [4, this.convertedHandler(t)]
                      : [3, 4]
                  );
                case 3:
                  r.sent(), (r.label = 4);
                case 4:
                  return [2];
              }
            });
          });
        }),
        (t.resolveIsSubscribedChangeHandler = function (e) {
          return oe(this, void 0, void 0, function () {
            var t, n;
            return se(this, function (r) {
              switch (r.label) {
                case 0:
                  if (
                    (r.trys.push([0, 5, , 6]), !this.isSubscribedChangeHandler)
                  )
                    return [2];
                  if ("boolean" != typeof e) return [2];
                  if (
                    ((t = this.lastSubscribed),
                    (this.lastSubscribed = e),
                    R.trace("resolveIsSubscribedChangeHandler", t, e),
                    t === e)
                  )
                    return [3, 4];
                  r.label = 1;
                case 1:
                  return (
                    r.trys.push([1, 3, , 4]),
                    [4, this.isSubscribedChangeHandler(e)]
                  );
                case 2:
                  return r.sent(), [3, 4];
                case 3:
                  return (n = r.sent()), console.error(n), [3, 4];
                case 4:
                  return [3, 6];
                case 5:
                  return r.sent(), [3, 6];
                case 6:
                  return [2];
              }
            });
          });
        }),
        t
      );
    })(),
    ue = function (e, t, n, r) {
      return new (n || (n = Promise))(function (i, a) {
        function o(e) {
          try {
            c(r.next(e));
          } catch (e) {
            a(e);
          }
        }
        function s(e) {
          try {
            c(r.throw(e));
          } catch (e) {
            a(e);
          }
        }
        function c(e) {
          var t;
          e.done
            ? i(e.value)
            : ((t = e.value),
              t instanceof n
                ? t
                : new n(function (e) {
                    e(t);
                  })).then(o, s);
        }
        c((r = r.apply(e, t || [])).next());
      });
    },
    le = function (e, t) {
      var n,
        r,
        i,
        a,
        o = {
          label: 0,
          sent: function () {
            if (1 & i[0]) throw i[1];
            return i[1];
          },
          trys: [],
          ops: [],
        };
      return (
        (a = { next: s(0), throw: s(1), return: s(2) }),
        "function" == typeof Symbol &&
          (a[Symbol.iterator] = function () {
            return this;
          }),
        a
      );
      function s(s) {
        return function (c) {
          return (function (s) {
            if (n) throw new TypeError("Generator is already executing.");
            for (; a && ((a = 0), s[0] && (o = 0)), o; )
              try {
                if (
                  ((n = 1),
                  r &&
                    (i =
                      2 & s[0]
                        ? r.return
                        : s[0]
                        ? r.throw || ((i = r.return) && i.call(r), 0)
                        : r.next) &&
                    !(i = i.call(r, s[1])).done)
                )
                  return i;
                switch (((r = 0), i && (s = [2 & s[0], i.value]), s[0])) {
                  case 0:
                  case 1:
                    i = s;
                    break;
                  case 4:
                    return o.label++, { value: s[1], done: !1 };
                  case 5:
                    o.label++, (r = s[1]), (s = [0]);
                    continue;
                  case 7:
                    (s = o.ops.pop()), o.trys.pop();
                    continue;
                  default:
                    if (
                      !(
                        (i = (i = o.trys).length > 0 && i[i.length - 1]) ||
                        (6 !== s[0] && 2 !== s[0])
                      )
                    ) {
                      o = 0;
                      continue;
                    }
                    if (3 === s[0] && (!i || (s[1] > i[0] && s[1] < i[3]))) {
                      o.label = s[1];
                      break;
                    }
                    if (6 === s[0] && o.label < i[1]) {
                      (o.label = i[1]), (i = s);
                      break;
                    }
                    if (i && o.label < i[2]) {
                      (o.label = i[2]), o.ops.push(s);
                      break;
                    }
                    i[2] && o.ops.pop(), o.trys.pop();
                    continue;
                }
                s = t.call(e, o);
              } catch (e) {
                (s = [6, e]), (r = 0);
              } finally {
                n = i = 0;
              }
            if (5 & s[0]) throw s[1];
            return { value: s[0] ? s[1] : void 0, done: !0 };
          })([s, c]);
        };
      }
    },
    fe = (function () {
      function r() {}
      return (
        (r.get = function (e, t) {
          return ue(this, void 0, void 0, function () {
            return le(this, function (n) {
              switch (n.label) {
                case 0:
                  return this.isIndirect
                    ? [4, this.getRemoteDBDataFromDispatchEvent(f, e, t)]
                    : [3, 2];
                case 1:
                case 3:
                case 6:
                  return [2, n.sent()];
                case 2:
                  return this.isWindowPopupIndirect
                    ? [
                        4,
                        this.getRemoteDBDataFromWindowPopupDispatchEvent(
                          f,
                          e,
                          t
                        ),
                      ]
                    : [3, 4];
                case 4:
                  return R.trace("DB:get", e, t), [4, this.getDatabase()];
                case 5:
                  return [4, n.sent().get(e, t)];
              }
            });
          });
        }),
        (r.getAll = function (e) {
          return ue(this, void 0, void 0, function () {
            return le(this, function (t) {
              switch (t.label) {
                case 0:
                  return this.isIndirect
                    ? [4, this.getRemoteDBDataFromDispatchEvent(d, e)]
                    : [3, 2];
                case 1:
                case 3:
                case 6:
                  return [2, t.sent()];
                case 2:
                  return this.isWindowPopupIndirect
                    ? [
                        4,
                        this.getRemoteDBDataFromWindowPopupDispatchEvent(d, e),
                      ]
                    : [3, 4];
                case 4:
                  return R.trace("DB:getAll", e), [4, this.getDatabase()];
                case 5:
                  return [4, t.sent().getAll(e)];
              }
            });
          });
        }),
        (r.put = function (t, n, r) {
          return ue(this, void 0, void 0, function () {
            var i;
            return le(this, function (a) {
              switch (a.label) {
                case 0:
                  return (
                    (i = null),
                    this.isIndirect
                      ? [4, this.getRemoteDBDataFromDispatchEvent(h, t, n, r)]
                      : [3, 2]
                  );
                case 1:
                  return (i = a.sent()), [3, 7];
                case 2:
                  return this.isWindowPopupIndirect
                    ? [
                        4,
                        this.getRemoteDBDataFromWindowPopupDispatchEvent(
                          h,
                          t,
                          n,
                          r
                        ),
                      ]
                    : [3, 4];
                case 3:
                  return (i = a.sent()), [3, 7];
                case 4:
                  return [4, this.getDatabase()];
                case 5:
                  return [4, a.sent().put(t, r, n)];
                case 6:
                  (i = a.sent()), (a.label = 7);
                case 7:
                  return (
                    t === e &&
                      n === o &&
                      ce
                        .resolveIsSubscribedChangeHandler(r)
                        .catch(function () {}),
                    [2, i]
                  );
              }
            });
          });
        }),
        (r.delete = function (e, t) {
          return ue(this, void 0, void 0, function () {
            return le(this, function (n) {
              switch (n.label) {
                case 0:
                  return this.isIndirect
                    ? [4, this.getRemoteDBDataFromDispatchEvent(p, e, t)]
                    : [3, 2];
                case 1:
                case 3:
                case 6:
                  return [2, n.sent()];
                case 2:
                  return this.isWindowPopupIndirect
                    ? [
                        4,
                        this.getRemoteDBDataFromWindowPopupDispatchEvent(
                          p,
                          e,
                          t
                        ),
                      ]
                    : [3, 4];
                case 4:
                  return R.trace("DB:delete", e, t), [4, this.getDatabase()];
                case 5:
                  return [4, n.sent().delete(e, t)];
              }
            });
          });
        }),
        (r.clearTable = function (e) {
          return ue(this, void 0, void 0, function () {
            return le(this, function (t) {
              switch (t.label) {
                case 0:
                  return this.isIndirect
                    ? [4, this.getRemoteDBDataFromDispatchEvent(v, e)]
                    : [3, 2];
                case 1:
                case 3:
                case 6:
                  return [2, t.sent()];
                case 2:
                  return this.isWindowPopupIndirect
                    ? [
                        4,
                        this.getRemoteDBDataFromWindowPopupDispatchEvent(v, e),
                      ]
                    : [3, 4];
                case 4:
                  return R.trace("DB:clearTable", e), [4, this.getDatabase()];
                case 5:
                  return [4, t.sent().clear(e)];
              }
            });
          });
        }),
        (r.deleteDatabase = function () {
          return ue(this, void 0, void 0, function () {
            return le(this, function (e) {
              switch (e.label) {
                case 0:
                  return (
                    R.trace("DB:deleteDatabase"), [4, C(this.databaseName)]
                  );
                case 1:
                  return e.sent(), [2];
              }
            });
          });
        }),
        (r.getDatabase = function () {
          return ue(this, void 0, void 0, function () {
            var e;
            return le(this, function (t) {
              switch (t.label) {
                case 0:
                  return (
                    this.shouldDbRestart &&
                      this.idb &&
                      (this.idb.close(), (this.idb = null)),
                    this.idb
                      ? [3, 2]
                      : ((this.shouldDbRestart = !1),
                        (e = this),
                        [4, this.open()])
                  );
                case 1:
                  (e.idb = t.sent()),
                    (this.idb.onerror = function () {
                      r.shouldDbRestart = !0;
                    }),
                    (t.label = 2);
                case 2:
                  return [2, this.idb];
              }
            });
          });
        }),
        (r.open = function () {
          return ue(this, void 0, void 0, function () {
            return le(this, function (e) {
              switch (e.label) {
                case 0:
                  return [
                    4,
                    B(this.databaseName, this.databaseVersion, {
                      upgrade: r.upgrade,
                      terminated: r.terminated,
                    }),
                  ];
                case 1:
                  return [2, e.sent()];
              }
            });
          });
        }),
        (r.upgrade = function (r) {
          return ue(this, void 0, void 0, function () {
            return le(this, function (i) {
              return (
                R.trace("DB:upgrade"),
                r.createObjectStore(e),
                r.createObjectStore(t),
                r.createObjectStore(n),
                [2]
              );
            });
          });
        }),
        (r.dataToOriginDBEventHandler = function (e) {
          return ue(this, void 0, void 0, function () {
            var t, n;
            return le(this, function (i) {
              switch (i.label) {
                case 0:
                  return (
                    i.trys.push([0, 11, , 12]),
                    e.type !== c
                      ? [2]
                      : (R.trace("DB:Event:".concat(c), e),
                        (t = e.data),
                        (n = null),
                        t.method === f && t.key
                          ? [4, r.get(t.table, t.key)]
                          : [3, 2])
                  );
                case 1:
                  return (n = i.sent()), [3, 10];
                case 2:
                  return t.method !== d ? [3, 4] : [4, r.getAll(t.table)];
                case 3:
                  return (n = i.sent()), [3, 10];
                case 4:
                  return t.method === h && t.key
                    ? [4, r.put(t.table, t.key, t.value)]
                    : [3, 6];
                case 5:
                  return (n = i.sent()), [3, 10];
                case 6:
                  return t.method === p && t.key
                    ? [4, r.delete(t.table, t.key)]
                    : [3, 8];
                case 7:
                  return (n = i.sent()), [3, 10];
                case 8:
                  return t.method !== v ? [3, 10] : [4, r.clearTable(t.table)];
                case 9:
                  (n = i.sent()), (i.label = 10);
                case 10:
                  return (
                    ae.sendToOrigin(c, n, null, { replyId: e.id }), [3, 12]
                  );
                case 11:
                  return i.sent(), [3, 12];
                case 12:
                  return [2];
              }
            });
          });
        }),
        (r.dataToWindowPopupDBEventHandler = function (e) {
          return ue(this, void 0, void 0, function () {
            var t, n;
            return le(this, function (i) {
              switch (i.label) {
                case 0:
                  return (
                    i.trys.push([0, 11, , 12]),
                    e.type !== u
                      ? [2]
                      : (R.trace("DB:Event:".concat(u), e),
                        (t = e.data),
                        (n = null),
                        t.method === f && t.key
                          ? [4, r.get(t.table, t.key)]
                          : [3, 2])
                  );
                case 1:
                  return (n = i.sent()), [3, 10];
                case 2:
                  return t.method !== d ? [3, 4] : [4, r.getAll(t.table)];
                case 3:
                  return (n = i.sent()), [3, 10];
                case 4:
                  return t.method === h && t.key
                    ? [4, r.put(t.table, t.key, t.value)]
                    : [3, 6];
                case 5:
                  return (n = i.sent()), [3, 10];
                case 6:
                  return t.method === p && t.key
                    ? [4, r.delete(t.table, t.key)]
                    : [3, 8];
                case 7:
                  return (n = i.sent()), [3, 10];
                case 8:
                  return t.method !== v ? [3, 10] : [4, r.clearTable(t.table)];
                case 9:
                  (n = i.sent()), (i.label = 10);
                case 10:
                  return (
                    ae.sendToWindow(u, n, null, { replyId: e.id }), [3, 12]
                  );
                case 11:
                  return i.sent(), [3, 12];
                case 12:
                  return [2];
              }
            });
          });
        }),
        (r.getRemoteDBDataFromDispatchEvent = function (e, t, n, r) {
          var i = this;
          return new Promise(function (a, o) {
            R.trace("DB:getRemoteDBDataFromDispatchEvent", e, t, n, r);
            try {
              var s = { method: e, table: t, key: n, value: r };
              ae.sendToIframe(
                c,
                s,
                function (e) {
                  R.trace("DB:Event:".concat(c), e), a(e.data);
                },
                { origin: i.indirectSubdomain }
              );
            } catch (e) {
              o(e);
            }
          });
        }),
        (r.getRemoteDBDataFromWindowPopupDispatchEvent = function (e, t, n, r) {
          return new Promise(function (i, a) {
            R.trace(
              "DB:getRemoteDBDataFromWindowPopupDispatchEvent",
              e,
              t,
              n,
              r
            );
            try {
              var o = { method: e, table: t, key: n, value: r };
              ae.sendToOrigin(
                u,
                o,
                function (e) {
                  R.trace("DB:Event:".concat(u), e), i(e.data);
                },
                { origin: "*" }
              );
            } catch (e) {
              a(e);
            }
          });
        }),
        (r.terminated = function () {
          R.trace("DB:terminated"), (r.shouldDbRestart = !0);
        }),
        (r.isIndirect = !1),
        (r.isWindowPopupIndirect = !1),
        (r.databaseName = "FlareLane_SDK_DB"),
        (r.databaseVersion = 1),
        (r.idb = null),
        (r.shouldDbRestart = !1),
        r
      );
    })(),
    de = function (e, t, n, r) {
      return new (n || (n = Promise))(function (i, a) {
        function o(e) {
          try {
            c(r.next(e));
          } catch (e) {
            a(e);
          }
        }
        function s(e) {
          try {
            c(r.throw(e));
          } catch (e) {
            a(e);
          }
        }
        function c(e) {
          var t;
          e.done
            ? i(e.value)
            : ((t = e.value),
              t instanceof n
                ? t
                : new n(function (e) {
                    e(t);
                  })).then(o, s);
        }
        c((r = r.apply(e, t || [])).next());
      });
    },
    he = function (e, t) {
      var n,
        r,
        i,
        a,
        o = {
          label: 0,
          sent: function () {
            if (1 & i[0]) throw i[1];
            return i[1];
          },
          trys: [],
          ops: [],
        };
      return (
        (a = { next: s(0), throw: s(1), return: s(2) }),
        "function" == typeof Symbol &&
          (a[Symbol.iterator] = function () {
            return this;
          }),
        a
      );
      function s(s) {
        return function (c) {
          return (function (s) {
            if (n) throw new TypeError("Generator is already executing.");
            for (; a && ((a = 0), s[0] && (o = 0)), o; )
              try {
                if (
                  ((n = 1),
                  r &&
                    (i =
                      2 & s[0]
                        ? r.return
                        : s[0]
                        ? r.throw || ((i = r.return) && i.call(r), 0)
                        : r.next) &&
                    !(i = i.call(r, s[1])).done)
                )
                  return i;
                switch (((r = 0), i && (s = [2 & s[0], i.value]), s[0])) {
                  case 0:
                  case 1:
                    i = s;
                    break;
                  case 4:
                    return o.label++, { value: s[1], done: !1 };
                  case 5:
                    o.label++, (r = s[1]), (s = [0]);
                    continue;
                  case 7:
                    (s = o.ops.pop()), o.trys.pop();
                    continue;
                  default:
                    if (
                      !(
                        (i = (i = o.trys).length > 0 && i[i.length - 1]) ||
                        (6 !== s[0] && 2 !== s[0])
                      )
                    ) {
                      o = 0;
                      continue;
                    }
                    if (3 === s[0] && (!i || (s[1] > i[0] && s[1] < i[3]))) {
                      o.label = s[1];
                      break;
                    }
                    if (6 === s[0] && o.label < i[1]) {
                      (o.label = i[1]), (i = s);
                      break;
                    }
                    if (i && o.label < i[2]) {
                      (o.label = i[2]), o.ops.push(s);
                      break;
                    }
                    i[2] && o.ops.pop(), o.trys.pop();
                    continue;
                }
                s = t.call(e, o);
              } catch (e) {
                (s = [6, e]), (r = 0);
              } finally {
                n = i = 0;
              }
            if (5 & s[0]) throw s[1];
            return { value: s[0] ? s[1] : void 0, done: !0 };
          })([s, c]);
        };
      }
    },
    pe = (function () {
      function t() {}
      return (
        (t.getCurrentCount = function () {
          return de(this, void 0, void 0, function () {
            var t, n;
            return he(this, function (r) {
              switch (r.label) {
                case 0:
                  return (n = Number), [4, fe.get(e, s)];
                case 1:
                  return [
                    2,
                    "number" != typeof (t = n.apply(void 0, [r.sent()])) ||
                    isNaN(t)
                      ? 0
                      : t,
                  ];
              }
            });
          });
        }),
        (t.setCount = function (t) {
          return de(this, void 0, void 0, function () {
            return he(this, function (n) {
              switch (n.label) {
                case 0:
                  return "setAppBadge" in navigator
                    ? [4, navigator.setAppBadge(t)]
                    : [3, 2];
                case 1:
                  n.sent(), (n.label = 2);
                case 2:
                  return [4, fe.put(e, s, t)];
                case 3:
                  return n.sent(), [2];
              }
            });
          });
        }),
        (t.clearCount = function () {
          return de(this, void 0, void 0, function () {
            return he(this, function (t) {
              switch (t.label) {
                case 0:
                  return "clearAppBadge" in navigator
                    ? [4, navigator.clearAppBadge()]
                    : [3, 2];
                case 1:
                  t.sent(), (t.label = 2);
                case 2:
                  return fe.put(e, s, 0), [2];
              }
            });
          });
        }),
        t
      );
    })(),
    ve = function (e, t, n, r) {
      return new (n || (n = Promise))(function (i, a) {
        function o(e) {
          try {
            c(r.next(e));
          } catch (e) {
            a(e);
          }
        }
        function s(e) {
          try {
            c(r.throw(e));
          } catch (e) {
            a(e);
          }
        }
        function c(e) {
          var t;
          e.done
            ? i(e.value)
            : ((t = e.value),
              t instanceof n
                ? t
                : new n(function (e) {
                    e(t);
                  })).then(o, s);
        }
        c((r = r.apply(e, t || [])).next());
      });
    },
    be = function (e, t) {
      var n,
        r,
        i,
        a,
        o = {
          label: 0,
          sent: function () {
            if (1 & i[0]) throw i[1];
            return i[1];
          },
          trys: [],
          ops: [],
        };
      return (
        (a = { next: s(0), throw: s(1), return: s(2) }),
        "function" == typeof Symbol &&
          (a[Symbol.iterator] = function () {
            return this;
          }),
        a
      );
      function s(s) {
        return function (c) {
          return (function (s) {
            if (n) throw new TypeError("Generator is already executing.");
            for (; a && ((a = 0), s[0] && (o = 0)), o; )
              try {
                if (
                  ((n = 1),
                  r &&
                    (i =
                      2 & s[0]
                        ? r.return
                        : s[0]
                        ? r.throw || ((i = r.return) && i.call(r), 0)
                        : r.next) &&
                    !(i = i.call(r, s[1])).done)
                )
                  return i;
                switch (((r = 0), i && (s = [2 & s[0], i.value]), s[0])) {
                  case 0:
                  case 1:
                    i = s;
                    break;
                  case 4:
                    return o.label++, { value: s[1], done: !1 };
                  case 5:
                    o.label++, (r = s[1]), (s = [0]);
                    continue;
                  case 7:
                    (s = o.ops.pop()), o.trys.pop();
                    continue;
                  default:
                    if (
                      !(
                        (i = (i = o.trys).length > 0 && i[i.length - 1]) ||
                        (6 !== s[0] && 2 !== s[0])
                      )
                    ) {
                      o = 0;
                      continue;
                    }
                    if (3 === s[0] && (!i || (s[1] > i[0] && s[1] < i[3]))) {
                      o.label = s[1];
                      break;
                    }
                    if (6 === s[0] && o.label < i[1]) {
                      (o.label = i[1]), (i = s);
                      break;
                    }
                    if (i && o.label < i[2]) {
                      (o.label = i[2]), o.ops.push(s);
                      break;
                    }
                    i[2] && o.ops.pop(), o.trys.pop();
                    continue;
                }
                s = t.call(e, o);
              } catch (e) {
                (s = [6, e]), (r = 0);
              } finally {
                n = i = 0;
              }
            if (5 & s[0]) throw s[1];
            return { value: s[0] ? s[1] : void 0, done: !0 };
          })([s, c]);
        };
      }
    };
  const ge = (function () {
    function t() {}
    return (
      (t.sendEvent = function (t, n, r, i, a) {
        return ve(this, void 0, void 0, function () {
          var o, s;
          return be(this, function (c) {
            switch (c.label) {
              case 0:
                return [4, fe.get(e, "platform")];
              case 1:
                return (
                  (o = c.sent()),
                  (s = {
                    notificationId: n,
                    deviceId: t,
                    type: r,
                    createdAt: new Date().toISOString(),
                    platform: a || o || "UNKNOWN",
                  }),
                  [4, J.post(this.url, s, i)]
                );
              case 2:
                return c.sent(), [2];
            }
          });
        });
      }),
      (t.trackEvent = function (t, n) {
        return ve(this, void 0, void 0, function () {
          var r, i, a;
          return be(this, function (o) {
            switch (o.label) {
              case 0:
                return [4, fe.get(e, "deviceId")];
              case 1:
                return (r = o.sent())
                  ? [4, fe.get(e, "userId")]
                  : (R.log(
                      "The event was not sent because the deviceId field is empty."
                    ),
                    [2]);
              case 2:
                return (
                  (i = o.sent()),
                  (a = {
                    events: [
                      {
                        type: t,
                        subjectType: i ? "user" : "device",
                        subjectId: i || r,
                        data: n,
                        createdAt: new Date().toISOString(),
                      },
                    ],
                  }),
                  [4, J.post(this.urlV2, a)]
                );
              case 3:
                return o.sent(), [2];
            }
          });
        });
      }),
      (t.url = "/events"),
      (t.urlV2 = "/events-v2"),
      t
    );
  })();
  var ye = function (e, t, n, r) {
      return new (n || (n = Promise))(function (i, a) {
        function o(e) {
          try {
            c(r.next(e));
          } catch (e) {
            a(e);
          }
        }
        function s(e) {
          try {
            c(r.throw(e));
          } catch (e) {
            a(e);
          }
        }
        function c(e) {
          var t;
          e.done
            ? i(e.value)
            : ((t = e.value),
              t instanceof n
                ? t
                : new n(function (e) {
                    e(t);
                  })).then(o, s);
        }
        c((r = r.apply(e, t || [])).next());
      });
    },
    we = function (e, t) {
      var n,
        r,
        i,
        a,
        o = {
          label: 0,
          sent: function () {
            if (1 & i[0]) throw i[1];
            return i[1];
          },
          trys: [],
          ops: [],
        };
      return (
        (a = { next: s(0), throw: s(1), return: s(2) }),
        "function" == typeof Symbol &&
          (a[Symbol.iterator] = function () {
            return this;
          }),
        a
      );
      function s(s) {
        return function (c) {
          return (function (s) {
            if (n) throw new TypeError("Generator is already executing.");
            for (; a && ((a = 0), s[0] && (o = 0)), o; )
              try {
                if (
                  ((n = 1),
                  r &&
                    (i =
                      2 & s[0]
                        ? r.return
                        : s[0]
                        ? r.throw || ((i = r.return) && i.call(r), 0)
                        : r.next) &&
                    !(i = i.call(r, s[1])).done)
                )
                  return i;
                switch (((r = 0), i && (s = [2 & s[0], i.value]), s[0])) {
                  case 0:
                  case 1:
                    i = s;
                    break;
                  case 4:
                    return o.label++, { value: s[1], done: !1 };
                  case 5:
                    o.label++, (r = s[1]), (s = [0]);
                    continue;
                  case 7:
                    (s = o.ops.pop()), o.trys.pop();
                    continue;
                  default:
                    if (
                      !(
                        (i = (i = o.trys).length > 0 && i[i.length - 1]) ||
                        (6 !== s[0] && 2 !== s[0])
                      )
                    ) {
                      o = 0;
                      continue;
                    }
                    if (3 === s[0] && (!i || (s[1] > i[0] && s[1] < i[3]))) {
                      o.label = s[1];
                      break;
                    }
                    if (6 === s[0] && o.label < i[1]) {
                      (o.label = i[1]), (i = s);
                      break;
                    }
                    if (i && o.label < i[2]) {
                      (o.label = i[2]), o.ops.push(s);
                      break;
                    }
                    i[2] && o.ops.pop(), o.trys.pop();
                    continue;
                }
                s = t.call(e, o);
              } catch (e) {
                (s = [6, e]), (r = 0);
              } finally {
                n = i = 0;
              }
            if (5 & s[0]) throw s[1];
            return { value: s[0] ? s[1] : void 0, done: !0 };
          })([s, c]);
        };
      }
    };
  function me(e) {
    return ye(this, void 0, void 0, function () {
      var t;
      return we(this, function (n) {
        switch (n.label) {
          case 0:
            return [4, self.clients.matchAll({ type: "window" })];
          case 1:
            return (
              (t = n.sent()),
              e
                ? [
                    2,
                    t.filter(function (t) {
                      var n = !0;
                      void 0 !== e.focused && (n = t.focused === e.focused);
                      var r = !0;
                      return (
                        e.visibilityState &&
                          (r = t.visibilityState === e.visibilityState),
                        n && r
                      );
                    }),
                  ]
                : [2, t]
            );
        }
      });
    });
  }
  self.addEventListener("push", function (e) {
    return e.waitUntil(
      (function (e) {
        var n, r, i, a;
        return ye(this, void 0, void 0, function () {
          var o, s, c;
          return we(this, function (u) {
            switch (u.label) {
              case 0:
                if (
                  (u.trys.push([0, 10, , 11]),
                  !(o =
                    null === (n = e.data) || void 0 === n
                      ? void 0
                      : n.json()) || !o.isFlareLane)
                )
                  return [2];
                u.label = 1;
              case 1:
                return (
                  u.trys.push([1, 7, , 8]),
                  [4, fe.put(t, o.notificationId, z(o))]
                );
              case 2:
                return u.sent(), [4, me({ focused: !0 })];
              case 3:
                return 0 !== u.sent().length
                  ? [3, 6]
                  : [4, pe.getCurrentCount()];
              case 4:
                return (s = u.sent()), [4, pe.setCount(s + 1)];
              case 5:
                u.sent(), (u.label = 6);
              case 6:
                return [3, 8];
              case 7:
                return u.sent(), [3, 8];
              case 8:
                return [
                  4,
                  self.registration.showNotification(
                    o.title ||
                      (null === (r = o.webPushConfig) || void 0 === r
                        ? void 0
                        : r.siteName) ||
                      "",
                    {
                      body: o.body,
                      data: z(o),
                      icon:
                        (null === (i = o.webPushConfig) || void 0 === i
                          ? void 0
                          : i.siteIcon) || void 0,
                      badge:
                        (null === (a = o.webPushConfig) || void 0 === a
                          ? void 0
                          : a.siteBadge) || void 0,
                      image: o.imageUrl || void 0,
                      actions: o.buttons
                        ? o.buttons.map(function (e, t) {
                            return {
                              action: "button_".concat(t),
                              type: "button",
                              title: e.label,
                            };
                          })
                        : void 0,
                      vibrate: [200, 100, 200],
                      requireInteraction: !0,
                    }
                  ),
                ];
              case 9:
                return u.sent(), [3, 11];
              case 10:
                return (c = u.sent()), console.error(c), [3, 11];
              case 11:
                return [2];
            }
          });
        });
      })(e)
    );
  }),
    self.addEventListener("notificationclick", function (e) {
      return e.waitUntil(
        (function (e) {
          var t, r;
          return ye(this, void 0, void 0, function () {
            var i, a, o, s, c, u, l, f, d, h, p, v;
            return we(this, function (b) {
              switch (b.label) {
                case 0:
                  if (
                    (b.trys.push([0, 9, , 10]),
                    e.notification.close(),
                    (i = e.notification),
                    (a = i.data.projectId),
                    (o = i.data.deviceId),
                    !a || !o)
                  )
                    return [3, 4];
                  b.label = 1;
                case 1:
                  return (
                    b.trys.push([1, 3, , 4]),
                    [
                      4,
                      ge.sendEvent(
                        o,
                        i.data.notificationId,
                        "CONVERTED",
                        a,
                        i.data.platform
                      ),
                    ]
                  );
                case 2:
                case 3:
                  return b.sent(), [3, 4];
                case 4:
                  s = null;
                  try {
                    i.data.url && (s = new URL(i.data.url).href);
                  } catch (e) {}
                  return (c =
                    null === (t = i.data.webPushConfig) || void 0 === t
                      ? void 0
                      : t.originSiteUrl)
                    ? (s || (s = c), [4, fe.clearTable(n)])
                    : [2];
                case 5:
                  return (
                    b.sent(),
                    $(s, c)
                      ? [4, fe.put(n, i.data.notificationId, i.data)]
                      : [3, 7]
                  );
                case 6:
                  b.sent(), (b.label = 7);
                case 7:
                  return (
                    i.data.buttons &&
                      (null === (r = e.action) || void 0 === r
                        ? void 0
                        : r.startsWith("button")) &&
                      ((u = Number(e.action.split("_")[1])),
                      !isNaN(u) &&
                        i.data.buttons[u].link &&
                        (s = i.data.buttons[u].link)),
                    (l = !0),
                    [4, me()]
                  );
                case 8:
                  for (f = b.sent(), d = 0, h = f; d < h.length; d++)
                    if ("focus" in (p = h[d])) {
                      if (!l) return [2];
                      s && p.navigate(s), p.focus(), (l = !1);
                      break;
                    }
                  return l && self.clients.openWindow(s), [3, 10];
                case 9:
                  return (v = b.sent()), console.error(v), [3, 10];
                case 10:
                  return [2];
              }
            });
          });
        })(e)
      );
    }),
    self.addEventListener("pushsubscriptionchange", function (t) {
      return t.waitUntil(
        (function () {
          return ye(this, void 0, void 0, function () {
            return we(this, function (t) {
              switch (t.label) {
                case 0:
                  return t.trys.push([0, 2, , 3]), [4, fe.put(e, a, !0)];
                case 1:
                case 2:
                  return t.sent(), [3, 3];
                case 3:
                  return [2];
              }
            });
          });
        })()
      );
    }),
    self.addEventListener("activate", function (t) {
      return t.waitUntil(
        (function () {
          return ye(this, void 0, void 0, function () {
            var t;
            return we(this, function (n) {
              switch (n.label) {
                case 0:
                  return (
                    n.trys.push([0, 3, , 4]),
                    [4, self.registration.pushManager.permissionState()]
                  );
                case 1:
                  return (t = n.sent()), [4, fe.put(e, i, t)];
                case 2:
                case 3:
                  return n.sent(), [3, 4];
                case 4:
                  return [2];
              }
            });
          });
        })()
      );
    }),
    (function () {
      ye(this, void 0, void 0, function () {
        var t,
          n = this;
        return we(this, function (r) {
          switch (r.label) {
            case 0:
              return (
                r.trys.push([0, 3, , 4]),
                "permissions" in navigator
                  ? [4, navigator.permissions.query({ name: "notifications" })]
                  : [3, 2]
              );
            case 1:
              ((t = r.sent()).onchange = function () {
                return ye(n, void 0, void 0, function () {
                  return we(this, function (n) {
                    switch (n.label) {
                      case 0:
                        return (
                          n.trys.push([0, 4, , 5]),
                          "granted" === t.state ? [3, 3] : [4, fe.put(e, a, !0)]
                        );
                      case 1:
                        return n.sent(), [4, fe.put(e, i, t.state)];
                      case 2:
                        n.sent(), (n.label = 3);
                      case 3:
                        return [3, 5];
                      case 4:
                        return n.sent(), [3, 5];
                      case 5:
                        return [2];
                    }
                  });
                });
              }),
                (r.label = 2);
            case 2:
              return [3, 4];
            case 3:
              return r.sent(), [3, 4];
            case 4:
              return [2];
          }
        });
      });
    })(),
    self.addEventListener("install", function (e) {
      e.waitUntil(self.skipWaiting());
    });
})();

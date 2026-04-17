!function() {
    try {
        var e = "undefined" != typeof window ? window : "undefined" != typeof global ? global : "undefined" != typeof self ? self : {}
          , n = (new e.Error).stack;
        n && (e._sentryDebugIds = e._sentryDebugIds || {},
        e._sentryDebugIds[n] = "7f2f6e3d-d7a1-42d1-8604-d15b8616b706",
        e._sentryDebugIdIdentifier = "sentry-dbid-7f2f6e3d-d7a1-42d1-8604-d15b8616b706")
    } catch (e) {}
}();
"use strict";
(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([[8439], {
    95836: function(e, n, t) {
        t.d(n, {
            S: function() {
                return c
            }
        });
        var i = t(52322)
          , a = t(22225)
          , o = t(38745);
        let r = e => {
            let {title: n, style: t, children: r} = e;
            return (0,
            i.jsx)(a.Z, {
                title: n,
                className: "bg-popover relative z-[1] opacity-100 transition-all duration-300",
                style: t,
                children: (0,
                i.jsx)(o.q, {
                    children: r
                })
            })
        }
        ;
        var l = t(2784);
        let s = e => {
            let {title: n, baseLayout: t, onReturn: r, children: s} = e;
            return l.isValidElement(s) ? (0,
            i.jsx)(a.Z, {
                title: n,
                className: "bg-popover absolute left-0 top-0",
                onReturn: r,
                children: t ? s : (0,
                i.jsx)(o.q, {
                    children: s
                })
            }) : null
        }
          , c = e => {
            let {id: n, main: t, secondary: a} = e;
            return (0,
            i.jsxs)("div", {
                className: "relative overflow-hidden",
                id: n,
                children: [(0,
                i.jsx)(r, {
                    title: t.title,
                    style: a.open ? {
                        transform: "translateX(-100%)",
                        opacity: 0
                    } : void 0,
                    children: t.children
                }), a.open ? a.children && (0,
                i.jsx)(s, {
                    title: a.title,
                    baseLayout: a.baseLayout,
                    onReturn: () => {
                        var e;
                        null === (e = a.onReturn) || void 0 === e || e.call(a)
                    }
                    ,
                    children: a.children
                }) : null]
            })
        }
    },
    38439: function(e, n, t) {
        t.r(n),
        t.d(n, {
            default: function() {
                return q
            }
        });
        var i = t(52322)
          , a = t(57992)
          , o = t(25903)
          , r = t(3161)
          , l = t(74661)
          , s = t(65329)
          , c = t(97073)
          , d = t(97345)
          , m = t(87520)
          , u = t(26753)
          , p = t(752)
          , h = t(25237)
          , f = t.n(h)
          , v = t(96577)
          , g = t.n(v)
          , x = t(2784)
          , A = t(98614)
          , j = t(27551)
          , b = {
            src: "/_next/static/media/ai-broll-icon.03c7c985.png",
            height: 40,
            width: 40,
            blurDataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAMAAADz0U65AAAAZlBMVEVFQ1Wqr+JNKxY9WnbGjHgUIS+oruSZmL9MaXEyNEKzoLZPZoBaW2GosOWzsuPBsty8s+CzuO25p8yef5+sjLA2MDKTY19ALzLVh16DTDJfORjKdCqLh5mgeF9zb5G/fnyicYsvQ2EjL8jdAAAADXRSTlP+sPL+/v7y+wCv/q7yV/CfjAAAAAlwSFlzAAAWJQAAFiUBSVIk8AAAAEZJREFUeJwVxtkWQCAUBdCDUuEOKjIP//+Tlv204auRiKhFcH9YAcfErAI45SgiQIo55c4A82KO67lR1v1s3qFHvRVrp+A/dXoDmyZg5Z0AAAAASUVORK5CYII=",
            blurWidth: 8,
            blurHeight: 8
        }
          , _ = {
            src: "/_next/static/media/stock-broll-icon.ac877040.png",
            height: 40,
            width: 40,
            blurDataURL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAMAAADz0U65AAAAS1BMVEWGkYvP4Ny1x8F6hYJJT03Q39vY5uQgISCuvLdMaXHG1tDX5+M4OjgVFhVfaWV0f3xTWVVaYF0tLiw/REKdq6VGSki/z8mQnZe1xb9WjlY+AAAAF3RSTlP7sK77r/7y9/kA///////////////+/hAjxPcAAAAJcEhZcwAAFiUAABYlAUlSJPAAAABCSURBVHicBcEBEsAQDATAa4ciCRIE/39pd1EeJor8IeR9iZmhK5/eOsHPUrG+MYHWLm1MUxdbhCEyxsSLVGtNHsoPdckDVaL6ja0AAAAASUVORK5CYII=",
            blurWidth: 8,
            blurHeight: 8
        }
          , k = t(80059)
          , y = t(41084)
          , w = t(91107)
          , C = t(17170)
          , N = t(66836)
          , Z = t(59511)
          , S = t(10123)
          , D = t(86506)
          , O = t(2871)
          , I = t(34568)
          , E = t(48913)
          , R = t(38043)
          , P = t(70973)
          , F = t(8354)
          , V = t(9856)
          , z = t(98213)
          , G = t(2022)
          , T = t(66388)
          , U = t(7908)
          , K = t(45254)
          , L = t(32812)
          , M = t(95836)
          , W = t(40824)
          , B = t(44192)
          , H = t(80629)
          , Y = t(87255);
        let J = f()( () => Promise.all([t.e(84), t.e(3562)]).then(t.bind(t, 13562)), {
            loadableGenerated: {
                webpack: () => [13562]
            }
        })
          , X = f()( () => t.e(9424).then(t.bind(t, 9424)), {
            loadableGenerated: {
                webpack: () => [9424]
            }
        })
          , Q = f()( () => t.e(4691).then(t.bind(t, 94691)), {
            loadableGenerated: {
                webpack: () => [94691]
            }
        });
        var q = (0,
        x.memo)( () => {
            let {t: e} = (0,
            A.$G)("editor")
              , [n] = (0,
            N.lb)("remove_pause_panel")
              , t = (0,
            p.Dv)(T.XU.preference)
              , h = (0,
            p.Dv)(K.r.voiceEnhancementProgress)
              , f = (0,
            p.Dv)(U.f.createBrollProcess)
              , v = (0,
            p.Dv)(U.f.loadingBrollType)
              , [q,$] = (0,
            p.KO)(K.r.secondaryMenuTypeForAiEnhance)
              , {openUpsellWindow: ee} = (0,
            O.w)()
              , en = (0,
            p.Dv)(H.a.currentOrgAsset)
              , {updatePreferences: et} = (0,
            V.Z)()
              , {handleAutoTransitionsCheck: ei} = (0,
            G.Z)()
              , {getCleanOperationNoti: ea} = (0,
            z.Z)()
              , {cleanFillerWords: eo, cleanPauses: er} = (0,
            F.ZP)()
              , {handleClickVe: el} = (0,
            P.Z)()
              , {handleGenerateBrolls: es} = (0,
            R.Z)()
              , {currentKey: ec} = (0,
            E.I1)()
              , [ed,em] = (0,
            x.useState)(1500)
              , eu = (0,
            j.Sx)(null == en ? void 0 : en.plan)
              , ep = (0,
            x.useRef)({
                0: {
                    topOffset: -12,
                    leftOffset: -12,
                    widthOffset: 24,
                    heightOffset: 24
                },
                1: {
                    topOffset: -6,
                    leftOffset: -6,
                    widthOffset: 12,
                    heightOffset: 12,
                    hidden: !0
                }
            })
              , eh = (0,
            Z.Z)( () => {
                L.Z.getInstance().push("editor.filler.remove.attempt", {}, {
                    platform: {
                        MP: !0,
                        SS: !0
                    }
                }),
                ea() && eo()
            }
            )
              , ef = (0,
            Z.Z)( () => {
                L.Z.getInstance().push("editor.pause.remove.attempt", {}, {
                    platform: {
                        MP: !0,
                        SS: !0
                    }
                }),
                ea() && er()
            }
            )
              , ev = (0,
            Z.Z)(e => {
                e && em(0)
            }
            );
            (0,
            x.useEffect)( () => () => {
                $(void 0)
            }
            , [$]);
            let eg = () => (0,
            i.jsx)(D.Z, {
                featureKey: "FillerWordSilenceRemoval",
                eventKey: "btn:FillerWordSilenceRemoval",
                children: (n, t) => (0,
                i.jsx)(Y.p, {
                    image: "".concat(w.Gw, "/editor/ai-enhance/remove-filler-words.png"),
                    title: e("common:remove_filler_words"),
                    description: e("common:removes_um_etc"),
                    delayDuration: ed,
                    onOpenChange: ev,
                    children: (0,
                    i.jsxs)(a.zx, {
                        className: "bg-popover flex h-12 w-full justify-start p-4 text-xs font-medium",
                        variant: "secondary",
                        onClick: () => {
                            if (n) {
                                t();
                                return
                            }
                            eh()
                        }
                        ,
                        children: [(0,
                        i.jsx)(o.Z, {
                            className: "mr-3 size-5"
                        }), e("common:remove_filler_words")]
                    })
                })
            })
              , ex = () => (0,
            i.jsx)(D.Z, {
                featureKey: "FillerWordSilenceRemoval",
                eventKey: "btn:FillerWordSilenceRemoval",
                children: (t, o) => (0,
                i.jsx)(Y.p, {
                    image: "".concat(w.Gw, "/editor/ai-enhance/remove-pauses.png"),
                    title: e("common:remove_pauses"),
                    description: e("common:remove_unnecessary_silence"),
                    delayDuration: ed,
                    onOpenChange: ev,
                    children: (0,
                    i.jsxs)(a.zx, {
                        className: "bg-popover flex h-12 w-full justify-start p-4 text-xs font-medium",
                        variant: "secondary",
                        onClick: () => {
                            if (t) {
                                o();
                                return
                            }
                            n ? (L.Z.getInstance().push("editor.pause.remove.attempt", {}, {
                                platform: {
                                    MP: !0,
                                    SS: !0
                                }
                            }),
                            $("RemovePauses")) : ef()
                        }
                        ,
                        children: [(0,
                        i.jsx)(r.Z, {
                            className: "mr-3 size-5"
                        }), e("common:remove_pauses")]
                    })
                })
            })
              , eA = () => (0,
            i.jsx)(Y.p, {
                image: "".concat(w.Gw, "/editor/ai-enhance/auto-censor.png"),
                title: e("common:auto_censor"),
                description: e("common:censor_curse_words_note"),
                delayDuration: ed,
                onOpenChange: ev,
                children: (0,
                i.jsxs)(a.zx, {
                    className: "bg-popover flex h-12 w-full items-center justify-start p-4 text-xs font-medium",
                    variant: "secondary",
                    onClick: () => {
                        eu ? $("AutoCensor") : ee({
                            upsellTitle: "Auto censor ",
                            switchType: "plan",
                            trigger: "editor.auto-censor.upgrade",
                            ads: "background"
                        })
                    }
                    ,
                    children: [(0,
                    i.jsx)(l.Z, {
                        className: "mr-3 size-5"
                    }), (0,
                    i.jsx)("div", {
                        className: "mr-1 text-left",
                        children: e("common:auto_censor")
                    })]
                })
            })
              , ej = () => (0,
            i.jsx)(D.Z, {
                featureKey: "VoiceEnhancement",
                eventKey: "voice-enhancement-editor",
                children: (n, o) => (0,
                i.jsx)(Y.p, {
                    image: "".concat(w.Gw, "/editor/ai-enhance/speech-enhancement.png"),
                    title: e("common:speech_enhancement"),
                    description: e("common:improve_vocal_clarity"),
                    delayDuration: ed,
                    onOpenChange: ev,
                    children: (0,
                    i.jsx)("div", {
                        className: "w-full",
                        children: (0,
                        i.jsx)(W.a, {
                            className: "bg-popover flex h-12 w-full justify-start p-4 text-xs font-medium",
                            title: e("common:speech_enhancement"),
                            checked: null == t ? void 0 : t.enableVoiceEnhancement,
                            variant: "secondary",
                            icon: (0,
                            i.jsx)(s.Z, {
                                className: "mr-3 size-5 shrink-0"
                            }),
                            rightContent: void 0 === h ? void 0 : (0,
                            i.jsxs)("div", {
                                className: "flex items-center",
                                children: [(0,
                                i.jsx)(y.Z, {
                                    color: "#FAFAFA"
                                }), (0,
                                i.jsxs)(a.ZT, {
                                    variant: "headings",
                                    className: "ml-1 min-w-[30px] text-center text-sm",
                                    children: [h, "%"]
                                })]
                            }),
                            onCheck: e => {
                                el(e, n, o)
                            }
                        })
                    })
                })
            })
              , eb = n => {
                let t = v === n
                  , a = "GenAi" === n;
                return (0,
                i.jsx)(W.a, {
                    className: (0,
                    S.cn)("w-full h-12 p-4 bg-popover", t && "text-muted-foreground"),
                    title: a ? e("auto_generate_ai_b_roll") : e("auto_generate_stock_b_roll"),
                    titleClassName: "truncate",
                    icon: (0,
                    i.jsx)(g(), {
                        className: "mr-3 size-5 shrink-0",
                        src: a ? b : _,
                        alt: n,
                        crossOrigin: "anonymous"
                    }),
                    rightContent: t ? (0,
                    i.jsxs)("div", {
                        className: "shrink-1 text-foreground ml-3 flex items-center",
                        children: [(0,
                        i.jsx)(y.Z, {
                            color: "#FAFAFA"
                        }), (0,
                        i.jsxs)("span", {
                            className: "ml-1 min-w-[30px] text-center",
                            children: [f, "%"]
                        })]
                    }) : void 0,
                    variant: "secondary",
                    onClick: () => es(n)
                })
            }
              , e_ = () => (0,
            i.jsx)(Y.p, {
                image: "".concat(w.Gw, "/editor/ai-enhance/ai-broll.png"),
                title: e("common:ai_broll"),
                description: e("ai_generates_relevant_b_roll_images"),
                delayDuration: ed,
                onOpenChange: ev,
                children: (0,
                i.jsx)("div", {
                    className: "w-full",
                    children: eb("GenAi")
                })
            })
              , ek = () => (0,
            i.jsx)(Y.p, {
                image: "".concat(w.Gw, "/editor/ai-enhance/stock-broll.png"),
                title: e("stock_b_roll"),
                description: e("common:ai_finds_copyright_free"),
                delayDuration: ed,
                onOpenChange: ev,
                children: (0,
                i.jsx)("div", {
                    className: "w-full",
                    children: eb("Stock")
                })
            })
              , ey = () => (0,
            i.jsx)(Y.p, {
                image: "".concat(w.Gw, "/editor/ai-enhance/ai-hook.png"),
                title: e("common:ai_hook"),
                description: e("common:add_voiceovers_multilang"),
                delayDuration: ed,
                onOpenChange: ev,
                children: (0,
                i.jsxs)(a.zx, {
                    className: "bg-popover flex h-12 w-full items-center justify-start p-4 text-xs font-medium",
                    variant: "secondary",
                    onClick: () => $("Voiceover"),
                    children: [(0,
                    i.jsx)(c.Z, {
                        className: "mr-3 size-5"
                    }), (0,
                    i.jsx)("div", {
                        className: "mr-1 text-left",
                        children: e("common:auto_generate_ai_hook")
                    })]
                })
            })
              , ew = () => (0,
            i.jsx)(Y.p, {
                image: "".concat(w.Gw, "/editor/ai-enhance/ai-emoji.png"),
                title: e("common:ai_emoji"),
                description: e("common:smart_ai_emojis_caption"),
                delayDuration: ed,
                onOpenChange: ev,
                children: (0,
                i.jsx)("div", {
                    className: "w-full",
                    children: (0,
                    i.jsx)(W.a, {
                        className: "bg-popover h-12 w-full p-4",
                        title: e("common:ai_emoji"),
                        checked: null == t ? void 0 : t.enableEmoji,
                        icon: (0,
                        i.jsx)(d.Z, {
                            className: "mr-3 size-5"
                        }),
                        variant: "secondary",
                        onCheck: e => {
                            L.Z.getInstance().push("editor.ai_emojis.switch", {
                                enableEmoji: e
                            }, {
                                platform: {
                                    MP: !0,
                                    SS: !0
                                }
                            }),
                            et({
                                enableEmoji: e
                            })
                        }
                    })
                })
            })
              , eC = () => (0,
            i.jsx)(Y.p, {
                image: "".concat(w.Gw, "/editor/ai-enhance/ai-keywords-highlighter.png"),
                title: e("ai_keywords_highlighter"),
                description: e("common:auto_highlight_keywords"),
                delayDuration: ed,
                onOpenChange: ev,
                children: (0,
                i.jsx)("div", {
                    className: "w-full",
                    children: (0,
                    i.jsx)(W.a, {
                        className: "bg-popover h-12 w-full p-4",
                        titleClassName: "overflow-hidden text-ellipsis whitespace-nowrap",
                        title: e("ai_keywords_highlighter"),
                        icon: (0,
                        i.jsx)(m.Z, {
                            className: "mr-3 size-5"
                        }),
                        checked: null == t ? void 0 : t.enableHighlight,
                        variant: "secondary",
                        onCheck: e => {
                            L.Z.getInstance().push("editor.caption_setting.keywords_highlighter", {
                                enableHighlight: e
                            }, {
                                platform: {
                                    MP: !0,
                                    SS: !0
                                }
                            }),
                            et({
                                enableHighlight: e
                            })
                        }
                    })
                })
            })
              , eN = () => {
                var n;
                return (0,
                i.jsx)(W.a, {
                    className: "bg-popover h-12 w-full p-4",
                    title: e("auto_transitions"),
                    checked: null !== (n = null == t ? void 0 : t.enableAutoTransition) && void 0 !== n && n,
                    icon: (0,
                    i.jsx)(k.r, {
                        className: "mr-3 mt-0.5 h-4 w-5 align-middle"
                    }),
                    variant: "secondary",
                    onCheck: ei
                })
            }
              , eZ = () => (0,
            i.jsx)(B.Z, {
                className: "text-foreground p-4",
                icon: (0,
                i.jsx)(u.Z, {
                    className: "mr-3 mt-0.5 size-5 align-middle"
                })
            })
              , eS = () => (0,
            i.jsxs)("div", {
                className: "flex w-[308px] flex-col",
                onMouseLeave: () => em(1500),
                children: [eg(), ex(), eA(), ej(), e_(), ek(), ey(), ew(), eC(), eN(), eZ()]
            })
              , eD = {
                AutoCensor: {
                    component: J,
                    title: e("common:auto_censor")
                },
                Voiceover: {
                    component: X,
                    title: e("common:auto_generate_ai_hook")
                },
                RemovePauses: {
                    component: Q,
                    title: e("common:remove_pauses")
                }
            }
              , eO = () => {
                if (!q)
                    return null;
                let e = eD[q].component;
                return e && (0,
                i.jsx)("div", {
                    className: "w-[308px] p-4",
                    children: (0,
                    i.jsx)(e, {
                        className: "static bg-transparent p-0"
                    })
                })
            }
              , eI = ec === C.M4;
            return (0,
            i.jsx)(I.Z, {
                title: e("common:ai_enhance"),
                description: e("common:one_click_audio_visual_boost"),
                video: "".concat("https://public.cdn.opus.pro/", "clip-web/videos/editor/onboarding/editor-ux-onboarding-ai-enhance.mp4"),
                open: eI,
                side: "left",
                sideOffset: 24,
                offsets: ep.current,
                children: (0,
                i.jsx)("div", {
                    children: ( () => {
                        let n = q ? eD[q] : void 0;
                        return (0,
                        i.jsx)(M.S, {
                            id: C.M4,
                            main: {
                                title: e("common:ai_enhance"),
                                children: eS()
                            },
                            secondary: {
                                open: !!q,
                                onReturn: () => $(void 0),
                                title: null == n ? void 0 : n.title,
                                children: eO()
                            }
                        })
                    }
                    )()
                })
            })
        }
        )
    },
    40824: function(e, n, t) {
        t.d(n, {
            a: function() {
                return l
            }
        });
        var i = t(52322)
          , a = t(57992)
          , o = t(2784)
          , r = t(10123);
        let l = (0,
        o.forwardRef)( (e, n) => {
            let {className: t, titleClassName: o, title: l, checked: s, defaultChecked: c, onClick: d, onCheck: m, icon: u, variant: p="base", rightContent: h, disabled: f} = e;
            return (0,
            i.jsxs)(a.zx, {
                className: (0,
                r.cn)("flex items-center justify-between grow", t),
                variant: p,
                ref: n,
                onClick: d,
                disabled: f,
                children: [u, (0,
                i.jsx)("div", {
                    className: (0,
                    r.cn)("grow text-left text-xs", o),
                    onClick: () => {
                        null == m || m(!s)
                    }
                    ,
                    children: l
                }), null != h ? h : m ? (0,
                i.jsx)(a.rs, {
                    checked: s,
                    defaultChecked: c,
                    onCheckedChange: e => {
                        null == m || m(e)
                    }
                    ,
                    onClick: e => e.stopPropagation(),
                    disabled: f
                }) : null]
            })
        }
        )
    },
    44192: function(e, n, t) {
        t.d(n, {
            Z: function() {
                return w
            }
        });
        var i = t(52322)
          , a = t(82222)
          , o = t(70218)
          , r = t(52134)
          , l = t(57992)
          , s = t(752)
          , c = t(2784)
          , d = t(98614)
          , m = t(38220)
          , u = t(4267)
          , p = t(59511)
          , h = t(10123)
          , f = t(86506)
          , v = t(34411)
          , g = t(1907)
          , x = t(95328)
          , A = t(9856)
          , j = t(66388)
          , b = t(45254)
          , _ = t(32812)
          , k = t(50480)
          , y = t(40824);
        function w(e) {
            var n;
            let {className: t, icon: w} = e
              , {t: C} = (0,
            d.$G)("editor")
              , {submitRefineTask: N, getRefineTask: Z} = (0,
            m.ZP)()
              , {caption: {isNewUx: S}} = (0,
            v.ZP)()
              , {fullClipId: D, projectId: O} = (0,
            x.E)()
              , I = (0,
            s.Dv)(k.p2.clipProject(O))
              , E = (0,
            s.Dv)(j.XU.preference)
              , {updatePreferences: R} = (0,
            A.Z)()
              , {takeSnapshot: P} = (0,
            g.Z)()
              , F = (0,
            c.useRef)(!1)
              , V = (0,
            p.T)( (e, n, t) => {
                var s, c, d;
                let m = e(j.XU.captionTrack);
                if (e(b.r.speakerDetectionLoading))
                    return;
                _.Z.getInstance().push("editor.speaker_color.switch", {
                    button: t
                });
                let p = (null == m ? void 0 : null === (d = m.sections[0]) || void 0 === d ? void 0 : null === (c = d.segments[0]) || void 0 === c ? void 0 : null === (s = c.content) || void 0 === s ? void 0 : s.speakerId) !== void 0;
                if (e(b.r.speakerDetectionLoading))
                    return;
                let h = async () => {
                    if (!(null == I ? void 0 : I.sourceId) || !E)
                        return;
                    let e = null == m ? void 0 : m.sections.filter(e => {
                        var n, t, i;
                        return (null === (n = e.propertiesMap) || void 0 === n ? void 0 : n.type) !== "intro" && (null === (t = e.propertiesMap) || void 0 === t ? void 0 : t.type) !== "outro" && (null === (i = e.propertiesMap) || void 0 === i ? void 0 : i.type) !== "media"
                    }
                    ).map(e => {
                        let[n,t] = (0,
                        a.fO)(e.sectionDuration);
                        return {
                            offsetStartMs: n,
                            offsetEndMs: t
                        }
                    }
                    )
                      , i = "active"
                      , l = await N(D, {
                        useCase: "MultiSpeakerOverlayAnalyze",
                        sourceId: I.sourceId,
                        pref: E,
                        timeRanges: e
                    });
                    for (n(b.r.speakerDetectionLoading, !0),
                    R({
                        enableSpeakerDetection: t
                    }); "active" === i; ) {
                        let e = await Z(l.data.smallAsyncTaskId);
                        if (i = e.data.smallAsyncTaskStatus,
                        await (0,
                        u.Z)(1e3),
                        e.data.editingScript) {
                            let t = e.data.editingScript.tracks.find(e => "CaptionTrack" === e.trackType);
                            if (!t) {
                                _.Z.getInstance().push("editor.warning", {
                                    message: "No caption track found"
                                });
                                return
                            }
                            (0,
                            r.T)(t);
                            let i = new o.o(t);
                            n(b.r.speakerDetectionLoading, !1),
                            n(j.XU.captionTrackInstance, i),
                            P()
                        } else
                            "failed" === e.data.smallAsyncTaskStatus && (n(b.r.speakerDetectionLoading, !1),
                            R({
                                enableSpeakerDetection: !t
                            }))
                    }
                }
                ;
                p ? R({
                    enableSpeakerDetection: t
                }) : F.current || (F.current = !0,
                l.Vq.alert({
                    title: C("before_you_continue"),
                    description: (0,
                    i.jsx)(i.Fragment, {
                        children: C("continue_assign_prompt")
                    }),
                    onConfirm: h,
                    cancelText: C("common:cancel"),
                    onCancel: () => {
                        F.current = !1
                    }
                }))
            }
            );
            if (!S)
                return (0,
                i.jsxs)(l.zx, {
                    variant: "base",
                    className: "mr-3 flex items-center gap-2",
                    onClick: e => {
                        e.stopPropagation(),
                        V(!(null == E ? void 0 : E.enableSpeakerDetection))
                    }
                    ,
                    children: [(0,
                    i.jsx)("label", {
                        className: "font-geist mr-4 font-normal  leading-5 text-[#FAFAFA] peer-disabled:cursor-not-allowed",
                        children: C("speaker_colors")
                    }), (0,
                    i.jsx)(l.rs, {
                        id: "speaker-detection",
                        checked: !!(null == E ? void 0 : E.enableSpeakerDetection)
                    })]
                });
            let z = null == I ? void 0 : null === (n = I.importPref) || void 0 === n ? void 0 : n.isAppliedSrt;
            return (0,
            i.jsx)(l.u, {
                className: "max-w-max",
                content: z ? C("speaker_colors_srt_disabled") : void 0,
                children: (0,
                i.jsx)("span", {
                    children: (0,
                    i.jsx)(f.Z, {
                        featureKey: "SpeakerColors",
                        eventKey: "btn:SpeakerColors",
                        children: (e, n) => (0,
                        i.jsx)(y.a, {
                            onCheck: t => {
                                if (e) {
                                    n();
                                    return
                                }
                                V(t)
                            }
                            ,
                            checked: !!(null == E ? void 0 : E.enableSpeakerDetection),
                            className: (0,
                            h.cn)("w-full h-12 text-muted-foreground bg-popover", t),
                            title: C("speaker_colors"),
                            disabled: z,
                            icon: w
                        })
                    })
                })
            })
        }
    }
}]);

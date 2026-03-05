module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/context/ThemeContext.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ThemeProvider",
    ()=>ThemeProvider,
    "useTheme",
    ()=>useTheme
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
const ThemeContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(undefined);
const STORAGE_KEY = "io_theme";
function applyThemeToDom(theme) {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
}
function ThemeProvider({ children }) {
    const [theme, setThemeState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("light");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored === "light" || stored === "dark") {
                setThemeState(stored);
                applyThemeToDom(stored);
                return;
            }
            const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
            const inferred = prefersDark ? "dark" : "light";
            setThemeState(inferred);
            applyThemeToDom(inferred);
        } catch  {
        // ignore
        }
    }, []);
    const setTheme = (mode)=>{
        setThemeState(mode);
        try {
            localStorage.setItem(STORAGE_KEY, mode);
        } catch  {
        // ignore
        }
        applyThemeToDom(mode);
    };
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>({
            theme,
            setTheme,
            toggleTheme: ()=>setTheme(theme === "dark" ? "light" : "dark")
        }), [
        theme
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ThemeContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/context/ThemeContext.tsx",
        lineNumber: 62,
        columnNumber: 10
    }, this);
}
function useTheme() {
    const ctx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(ThemeContext);
    if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
    return ctx;
}
}),
"[project]/context/AuthContext.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(undefined);
const AuthProvider = ({ children })=>{
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    // Check if user is already logged in on mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch  {
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);
    const login = async (email, password)=>{
        setLoading(true);
        try {
            // Simulate API call
            if (!email || !password) {
                throw new Error('Email and password are required');
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                throw new Error('Invalid email format');
            }
            if (password.length < 6) {
                throw new Error('Password must be at least 6 characters');
            }
            // Simulate successful login
            const newUser = {
                id: Math.random().toString(36).substr(2, 9),
                email,
                name: email.split('@')[0]
            };
            localStorage.setItem('user', JSON.stringify(newUser));
            setUser(newUser);
        } finally{
            setLoading(false);
        }
    };
    const signup = async (email, password, name)=>{
        setLoading(true);
        try {
            // Validate inputs
            if (!email || !password || !name) {
                throw new Error('All fields are required');
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                throw new Error('Invalid email format');
            }
            if (password.length < 6) {
                throw new Error('Password must be at least 6 characters');
            }
            if (name.length < 2) {
                throw new Error('Name must be at least 2 characters');
            }
            // Simulate successful signup
            const newUser = {
                id: Math.random().toString(36).substr(2, 9),
                email,
                name
            };
            localStorage.setItem('user', JSON.stringify(newUser));
            setUser(newUser);
        } finally{
            setLoading(false);
        }
    };
    const logout = ()=>{
        localStorage.removeItem('user');
        setUser(null);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: {
            user,
            loading,
            login,
            signup,
            logout,
            isAuthenticated: !!user
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/context/AuthContext.tsx",
        lineNumber: 107,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
const useAuth = ()=>{
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
}),
"[project]/types/editor.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "defaultPaperDoc",
    ()=>defaultPaperDoc
]);
const defaultPaperDoc = {
    title: "Paper Title",
    authors: [
        {
            name: "Author 1",
            affiliation: "University / Organization",
            email: "author1@example.com"
        },
        {
            name: "Author 2",
            affiliation: "University / Organization",
            email: "author2@example.com"
        }
    ],
    abstract: "Write your abstract here. This preview updates instantly as you add sections, subsections, tables, and images.",
    sections: [
        {
            id: "sec-intro",
            name: "Introduction",
            content: "Introduce the problem, context, and motivation.",
            subsections: []
        }
    ],
    tables: [],
    images: [],
    updatedAt: Date.now()
};
}),
"[project]/context/EditorContext.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EditorProvider",
    ()=>EditorProvider,
    "coerceDoc",
    ()=>coerceDoc,
    "useEditor",
    ()=>useEditor
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$types$2f$editor$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/types/editor.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
const EditorContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(undefined);
const STORAGE = {
    doc: "io_editor_doc_v1",
    conf: "io_editor_conf_v1",
    file: "io_uploaded_file_meta_v1",
    panels: "io_editor_panels_v1"
};
function safeParse(raw) {
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch  {
        return null;
    }
}
function isRecord(value) {
    return !!value && typeof value === "object" && !Array.isArray(value);
}
function getString(obj, key) {
    const value = obj[key];
    return typeof value === "string" ? value : undefined;
}
function getStringArray(value) {
    if (!Array.isArray(value)) return [];
    return value.map((v)=>String(v));
}
function coerceDoc(input) {
    const now = Date.now();
    if (!input || typeof input !== "object") return {
        ...__TURBOPACK__imported__module__$5b$project$5d2f$types$2f$editor$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["defaultPaperDoc"],
        updatedAt: now
    };
    const maybe = isRecord(input) ? input : {};
    const title = typeof maybe.title === "string" ? maybe.title : __TURBOPACK__imported__module__$5b$project$5d2f$types$2f$editor$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["defaultPaperDoc"].title;
    const abstract = typeof maybe.abstract === "string" ? maybe.abstract : __TURBOPACK__imported__module__$5b$project$5d2f$types$2f$editor$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["defaultPaperDoc"].abstract;
    const authors = Array.isArray(maybe.authors) && maybe.authors.every((a)=>isRecord(a) && typeof a.name === "string") ? maybe.authors.map((a)=>{
        const rec = a;
        return {
            name: getString(rec, "name") ?? "",
            affiliation: getString(rec, "affiliation"),
            email: getString(rec, "email")
        };
    }) : __TURBOPACK__imported__module__$5b$project$5d2f$types$2f$editor$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["defaultPaperDoc"].authors;
    const sections = Array.isArray(maybe.sections) ? maybe.sections.filter(isRecord).map((s)=>{
        const subsectionsRaw = s.subsections;
        const subsections = Array.isArray(subsectionsRaw) ? subsectionsRaw.filter(isRecord).map((ss)=>{
            const ssr = ss;
            return {
                id: typeof ssr.id === "string" ? ssr.id : `sub-${Math.random().toString(36).slice(2)}`,
                name: getString(ssr, "name") ?? "Untitled Subsection",
                content: getString(ssr, "content") ?? ""
            };
        }) : [];
        return {
            id: typeof s.id === "string" ? String(s.id) : `sec-${Math.random().toString(36).slice(2)}`,
            name: getString(s, "name") ?? "Untitled Section",
            content: getString(s, "content") ?? "",
            subsections
        };
    }) : __TURBOPACK__imported__module__$5b$project$5d2f$types$2f$editor$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["defaultPaperDoc"].sections;
    const tables = Array.isArray(maybe.tables) ? maybe.tables.filter(isRecord).map((t)=>{
        const tr = t;
        const rowsRaw = tr.rows;
        const rows = Array.isArray(rowsRaw) ? rowsRaw.map((r)=>Array.isArray(r) ? r.map((c)=>String(c)) : []) : [];
        return {
            id: typeof tr.id === "string" ? tr.id : `table-${Math.random().toString(36).slice(2)}`,
            caption: getString(tr, "caption"),
            headers: getStringArray(tr.headers),
            rows,
            sectionId: getString(tr, "sectionId")
        };
    }) : [];
    const images = Array.isArray(maybe.images) ? maybe.images.filter(isRecord).map((i)=>{
        const ir = i;
        return {
            id: typeof ir.id === "string" ? ir.id : `img-${Math.random().toString(36).slice(2)}`,
            url: getString(ir, "url") ?? "",
            caption: getString(ir, "caption"),
            alt: getString(ir, "alt"),
            sectionId: getString(ir, "sectionId")
        };
    }) : [];
    return {
        title,
        abstract,
        authors,
        sections,
        tables,
        images,
        updatedAt: typeof maybe.updatedAt === "number" ? maybe.updatedAt : now
    };
}
const defaultPanels = {
    sidebarWidth: 300,
    jsonWidth: 520,
    sidebarCollapsed: false
};
function EditorProvider({ children }) {
    const [doc, setDocState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(__TURBOPACK__imported__module__$5b$project$5d2f$types$2f$editor$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["defaultPaperDoc"]);
    const [selectedConference, setSelectedConferenceState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("IEEE");
    const [uploadedFile, setUploadedFileState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [panelSizes, setPanelSizesState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(defaultPanels);
    const [isJsonSynced, setJsonSynced] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const saveTimer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Load persisted state once.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const storedDoc = safeParse(localStorage.getItem(STORAGE.doc));
        if (storedDoc) setDocState(coerceDoc(storedDoc));
        const storedConf = localStorage.getItem(STORAGE.conf);
        if (storedConf === "IEEE" || storedConf === "ACM" || storedConf === "Springer") {
            setSelectedConferenceState(storedConf);
        }
        const storedFile = safeParse(localStorage.getItem(STORAGE.file));
        if (storedFile && typeof storedFile.name === "string") setUploadedFileState(storedFile);
        const storedPanels = safeParse(localStorage.getItem(STORAGE.panels));
        if (storedPanels && typeof storedPanels.sidebarWidth === "number" && typeof storedPanels.jsonWidth === "number") {
            setPanelSizesState({
                sidebarWidth: Math.max(220, Math.min(520, storedPanels.sidebarWidth)),
                jsonWidth: Math.max(340, Math.min(900, storedPanels.jsonWidth)),
                sidebarCollapsed: !!storedPanels.sidebarCollapsed
            });
        }
    }, []);
    // Persist doc + selections (debounced).
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (saveTimer.current) window.clearTimeout(saveTimer.current);
        saveTimer.current = window.setTimeout(()=>{
            try {
                localStorage.setItem(STORAGE.doc, JSON.stringify(doc));
                localStorage.setItem(STORAGE.conf, selectedConference);
                localStorage.setItem(STORAGE.file, JSON.stringify(uploadedFile));
                localStorage.setItem(STORAGE.panels, JSON.stringify(panelSizes));
            } catch  {
            // ignore
            }
        }, 250);
        return ()=>{
            if (saveTimer.current) window.clearTimeout(saveTimer.current);
        };
    }, [
        doc,
        selectedConference,
        uploadedFile,
        panelSizes
    ]);
    const setDoc = (next)=>setDocState({
            ...coerceDoc(next),
            updatedAt: Date.now()
        });
    const updateDoc = (updates)=>{
        setDocState((prev)=>({
                ...prev,
                ...updates,
                updatedAt: Date.now()
            }));
        setJsonSynced(true);
    };
    const setSelectedConference = (conf)=>setSelectedConferenceState(conf);
    const setUploadedFile = (file)=>setUploadedFileState(file);
    const setPanelSizes = (next)=>setPanelSizesState(next);
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>({
            doc,
            setDoc,
            updateDoc,
            selectedConference,
            setSelectedConference,
            uploadedFile,
            setUploadedFile,
            panelSizes,
            setPanelSizes,
            isJsonSynced,
            setJsonSynced
        }), [
        doc,
        selectedConference,
        uploadedFile,
        panelSizes,
        isJsonSynced
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(EditorContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/context/EditorContext.tsx",
        lineNumber: 251,
        columnNumber: 10
    }, this);
}
function useEditor() {
    const ctx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(EditorContext);
    if (!ctx) throw new Error("useEditor must be used within EditorProvider");
    return ctx;
}
;
}),
"[project]/app/providers.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Providers",
    ()=>Providers
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/context/ThemeContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/context/AuthContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$context$2f$EditorContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/context/EditorContext.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
function Providers({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$context$2f$ThemeContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ThemeProvider"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$context$2f$AuthContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["AuthProvider"], {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$context$2f$EditorContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["EditorProvider"], {
                children: children
            }, void 0, false, {
                fileName: "[project]/app/providers.tsx",
                lineNumber: 12,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/providers.tsx",
            lineNumber: 11,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/providers.tsx",
        lineNumber: 10,
        columnNumber: 5
    }, this);
}
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/dynamic-access-async-storage.external.js [external] (next/dist/server/app-render/dynamic-access-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/dynamic-access-async-storage.external.js", () => require("next/dist/server/app-render/dynamic-access-async-storage.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__4e3df924._.js.map
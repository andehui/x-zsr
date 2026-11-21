// js/app.js - 书目分页（每页8部）、搜索、阅读器与夜间/字号控制
(function () {
    const PAGE_SIZE = 8;
    let currentPage = 1;
    let searchKeyword = "";
    let activeNovelIndex = -1; // 在当前筛选结果列表中的索引
    let fontSizePx = 18;
    let isDarkTheme = false;

    const novelListEl = document.getElementById("novelList");
    const paginationEl = document.getElementById("pagination");
    const searchInputEl = document.getElementById("searchInput");

    // 阅读器元素
    const readerModalEl = document.getElementById("readerModal");
    const readerBodyEl = document.getElementById("readerBody");
    const readerTitleEl = document.getElementById("readerTitle");
    const articleHeadingEl = document.getElementById("articleHeading");
    const articleMetaEl = document.getElementById("articleMeta");
    const articleContentEl = document.getElementById("articleContent");
    const closeReaderBtn = document.getElementById("closeReaderBtn");
    const fontDecreaseBtn = document.getElementById("fontDecreaseBtn");
    const fontIncreaseBtn = document.getElementById("fontIncreaseBtn");
    const themeToggleBtn = document.getElementById("themeToggleBtn");
    const prevChapterBtn = document.getElementById("prevChapterBtn");
    const nextChapterBtn = document.getElementById("nextChapterBtn");

    function getFilteredNovels() {
        const kw = searchKeyword.trim().toLowerCase();
        if (!kw) return NOVELS;

        return NOVELS.filter((item) => {
            const titleMatch = (item.title || "").toLowerCase().includes(kw);
            const collectionMatch = (item.collection || "").toLowerCase().includes(kw);
            const summaryMatch = (item.summary || "").toLowerCase().includes(kw);
            const contentText = Array.isArray(item.content)
                ? item.content.join("")
                : (item.content || "");
            const contentMatch = contentText.toLowerCase().includes(kw);
            return titleMatch || collectionMatch || summaryMatch || contentMatch;
        });
    }

    function renderNovels() {
        const list = getFilteredNovels();
        const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));

        if (currentPage > totalPages) currentPage = totalPages;
        if (currentPage < 1) currentPage = 1;

        const startIndex = (currentPage - 1) * PAGE_SIZE;
        const pageItems = list.slice(startIndex, startIndex + PAGE_SIZE);

        if (pageItems.length === 0) {
            novelListEl.innerHTML = `<p class="empty-tip">没有找到匹配的小说，换个关键词试试吧。</p>`;
            paginationEl.innerHTML = "";
            return;
        }

        novelListEl.innerHTML = pageItems
            .map(
                (novel) => `
            <article class="novel-card" data-id="${novel.id}">
                <div class="novel-card-header">
                    <span class="novel-tag">${novel.collection || "经典"}</span>
                    <span class="novel-year">${novel.year || ""}</span>
                </div>
                <h3 class="novel-title">${novel.title}</h3>
                <p class="novel-summary">${novel.summary || ""}</p>
                <button type="button" class="btn-read" data-id="${novel.id}">开始阅读</button>
            </article>
        `
            )
            .join("");

        renderPagination(list.length, totalPages);
    }

    function renderPagination(totalItems, totalPages) {
        if (totalItems <= PAGE_SIZE) {
            paginationEl.innerHTML = `
                <span class="page-info">共 ${totalItems} 部 · 第 1 / 1 页</span>
            `;
            return;
        }

        paginationEl.innerHTML = `
            <button type="button" id="prevPageBtn" class="btn-page" ${currentPage <= 1 ? "disabled" : ""}>← 上一页</button>
            <span class="page-info">第 ${currentPage} / ${totalPages} 页（共 ${totalItems} 部）</span>
            <button type="button" id="nextPageBtn" class="btn-page" ${currentPage >= totalPages ? "disabled" : ""}>下一页 →</button>
        `;

        const prevBtn = document.getElementById("prevPageBtn");
        const nextBtn = document.getElementById("nextPageBtn");

        if (prevBtn) {
            prevBtn.addEventListener("click", () => {
                if (currentPage > 1) {
                    currentPage -= 1;
                    renderNovels();
                    scrollToListTop();
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener("click", () => {
                if (currentPage < totalPages) {
                    currentPage += 1;
                    renderNovels();
                    scrollToListTop();
                }
            });
        }
    }

    function scrollToListTop() {
        const target = document.querySelector(".intro-banner") || novelListEl;
        if (target) {
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }

    // 打开阅读器
    function openReaderById(id) {
        const list = getFilteredNovels();
        const idx = list.findIndex((item) => String(item.id) === String(id));
        if (idx === -1) return;

        activeNovelIndex = idx;
        renderArticle(list[activeNovelIndex], list.length);
        readerModalEl.classList.add("is-open");
        readerModalEl.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    }

    function renderArticle(novel, totalCount) {
        readerTitleEl.textContent = novel.title;
        articleHeadingEl.textContent = novel.title;
        articleMetaEl.textContent = `收录于 ${novel.collection || "小说集"} · 作于 ${novel.year || ""} 年`;

        const paragraphs = Array.isArray(novel.content)
            ? novel.content
            : String(novel.content || "").split("\n").filter(Boolean);

        articleContentEl.innerHTML = paragraphs
            .map((p) => `<p>${p}</p>`)
            .join("");

        prevChapterBtn.disabled = activeNovelIndex <= 0;
        nextChapterBtn.disabled = activeNovelIndex >= totalCount - 1;
        readerBodyEl.scrollTop = 0;
    }

    function closeReader() {
        readerModalEl.classList.remove("is-open");
        readerModalEl.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }

    function applyFontSize() {
        articleContentEl.style.fontSize = `${fontSizePx}px`;
    }

    function applyTheme() {
        readerModalEl.classList.toggle("is-dark", isDarkTheme);
        themeToggleBtn.textContent = isDarkTheme ? "☀️ 日间" : "🌙 夜间";
    }

    // 事件委托：点击卡片或“开始阅读”按钮
    novelListEl.addEventListener("click", (e) => {
        const target = e.target.closest("[data-id]");
        if (!target) return;
        openReaderById(target.getAttribute("data-id"));
    });

    // 搜索框输入
    if (searchInputEl) {
        searchInputEl.addEventListener("input", (e) => {
            searchKeyword = e.target.value || "";
            currentPage = 1;
            renderNovels();
        });
    }

    // 阅读器控件
    closeReaderBtn.addEventListener("click", closeReader);

    fontDecreaseBtn.addEventListener("click", () => {
        if (fontSizePx > 14) {
            fontSizePx -= 2;
            applyFontSize();
        }
    });

    fontIncreaseBtn.addEventListener("click", () => {
        if (fontSizePx < 28) {
            fontSizePx += 2;
            applyFontSize();
        }
    });

    themeToggleBtn.addEventListener("click", () => {
        isDarkTheme = !isDarkTheme;
        applyTheme();
    });

    prevChapterBtn.addEventListener("click", () => {
        const list = getFilteredNovels();
        if (activeNovelIndex > 0) {
            activeNovelIndex -= 1;
            renderArticle(list[activeNovelIndex], list.length);
        }
    });

    nextChapterBtn.addEventListener("click", () => {
        const list = getFilteredNovels();
        if (activeNovelIndex < list.length - 1) {
            activeNovelIndex += 1;
            renderArticle(list[activeNovelIndex], list.length);
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && readerModalEl.classList.contains("is-open")) {
            closeReader();
        }
    });

    applyFontSize();
    applyTheme();
    renderNovels();
})();

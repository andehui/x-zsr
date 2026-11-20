document.addEventListener("DOMContentLoaded", () => {
    const novelListEl = document.getElementById("novelList");
    const searchInput = document.getElementById("searchInput");
    const readerModal = document.getElementById("readerModal");
    const closeReaderBtn = document.getElementById("closeReaderBtn");
    const readerTitle = document.getElementById("readerTitle");
    const articleHeading = document.getElementById("articleHeading");
    const articleMeta = document.getElementById("articleMeta");
    const articleContent = document.getElementById("articleContent");
    const readerBody = document.getElementById("readerBody");
    const fontDecreaseBtn = document.getElementById("fontDecreaseBtn");
    const fontIncreaseBtn = document.getElementById("fontIncreaseBtn");
    const themeToggleBtn = document.getElementById("themeToggleBtn");
    const prevChapterBtn = document.getElementById("prevChapterBtn");
    const nextChapterBtn = document.getElementById("nextChapterBtn");

    let currentIndex = 0;
    let currentFontSize = 19;

    // 渲染书目卡片
    function renderNovels(list) {
        if (list.length === 0) {
            novelListEl.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 40px;">未找到匹配的小说作品，请尝试其他关键词。</p>`;
            return;
        }

        novelListEl.innerHTML = list.map((novel) => {
            const realIndex = NOVELS_DATA.findIndex(item => item.id === novel.id);
            return `
                <article class="novel-card" onclick="openNovel(${realIndex})">
                    <div>
                        <span class="novel-tag">${novel.collection}</span>
                        <h3>${novel.title}</h3>
                        <div class="novel-meta">创作时间：${novel.year} · ${novel.wordCount}</div>
                        <p class="novel-summary">${novel.summary}</p>
                    </div>
                    <button class="btn-read" type="button">开始阅读</button>
                </article>
            `;
        }).join("");
    }

    // 打开阅读器
    window.openNovel = function(index) {
        currentIndex = index;
        const novel = NOVELS_DATA[index];
        if (!novel) return;

        readerTitle.textContent = `周树人小说 · ${novel.title}`;
        articleHeading.textContent = novel.title;
        articleMeta.textContent = `作者：周树人（鲁迅） ｜ 收录于${novel.collection} ｜ 写于${novel.year}`;
        articleContent.innerHTML = novel.paragraphs.map(p => `<p>${p}</p>`).join("");

        prevChapterBtn.disabled = index === 0;
        nextChapterBtn.disabled = index === NOVELS_DATA.length - 1;

        readerModal.classList.add("active");
        document.body.style.overflow = "hidden";
        readerBody.scrollTop = 0;
    };

    // 关闭阅读器
    closeReaderBtn.addEventListener("click", () => {
        readerModal.classList.remove("active");
        document.body.style.overflow = "";
    });

    // 上一篇 / 下一篇
    prevChapterBtn.addEventListener("click", () => {
        if (currentIndex > 0) openNovel(currentIndex - 1);
    });

    nextChapterBtn.addEventListener("click", () => {
        if (currentIndex < NOVELS_DATA.length - 1) openNovel(currentIndex + 1);
    });

    // 字号调节
    fontDecreaseBtn.addEventListener("click", () => {
        if (currentFontSize > 14) {
            currentFontSize -= 2;
            articleContent.style.fontSize = `${currentFontSize}px`;
        }
    });

    fontIncreaseBtn.addEventListener("click", () => {
        if (currentFontSize < 28) {
            currentFontSize += 2;
            articleContent.style.fontSize = `${currentFontSize}px`;
        }
    });

    // 夜间模式切换
    themeToggleBtn.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        const isDark = document.body.classList.contains("dark-mode");
        themeToggleBtn.textContent = isDark ? "☀️ 日间" : "🌙 夜间";
    });

    // 实时搜索
    searchInput.addEventListener("input", (e) => {
        const keyword = e.target.value.trim().toLowerCase();
        const filtered = NOVELS_DATA.filter(novel =>
            novel.title.toLowerCase().includes(keyword) ||
            novel.collection.toLowerCase().includes(keyword) ||
            novel.summary.toLowerCase().includes(keyword) ||
            novel.paragraphs.some(p => p.toLowerCase().includes(keyword))
        );
        renderNovels(filtered);
    });

    // ESC 键关闭阅读器
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && readerModal.classList.contains("active")) {
            closeReaderBtn.click();
        }
    });

    renderNovels(NOVELS_DATA);
});

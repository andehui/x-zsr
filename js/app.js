const PAGE_SIZE = 9; // 每页固定 9 篇，36 篇共 4 页
let currentPage = 1;
let filteredNovels = [...NOVELS];
let currentNovelIndex = -1;
let fontSize = 18;

const novelListEl = document.getElementById("novelList");
const paginationEl = document.getElementById("pagination");
const searchInputEl = document.getElementById("searchInput");

const readerModalEl = document.getElementById("readerModal");
const readerTitleEl = document.getElementById("readerTitle");
const articleHeadingEl = document.getElementById("articleHeading");
const articleMetaEl = document.getElementById("articleMeta");
const articleContentEl = document.getElementById("articleContent");
const prevChapterBtn = document.getElementById("prevChapterBtn");
const nextChapterBtn = document.getElementById("nextChapterBtn");

function renderNovels() {
    const totalPages = Math.max(1, Math.ceil(filteredNovels.length / PAGE_SIZE));
    if (currentPage > totalPages) {
        currentPage = totalPages;
    }

    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const pageItems = filteredNovels.slice(startIndex, startIndex + PAGE_SIZE);

    if (pageItems.length === 0) {
        novelListEl.innerHTML = `<p class="empty-tip">没有找到匹配的小说，换个关键词试试。</p>`;
        paginationEl.innerHTML = "";
        return;
    }

    novelListEl.innerHTML = pageItems.map(novel => `
        <article class="novel-card">
            <div class="novel-meta">${novel.collection} · ${novel.year}</div>
            <h3 class="novel-title">${novel.title}</h3>
            <p class="novel-summary">${novel.summary}</p>
            <button class="btn-read" onclick="openReaderById(${novel.id})">开始阅读</button>
        </article>
    `).join("");

    renderPagination(totalPages);
}

function renderPagination(totalPages) {
    if (totalPages <= 1) {
        paginationEl.innerHTML = "";
        return;
    }

    let html = `<button class="page-btn" ${currentPage === 1 ? "disabled" : ""} onclick="changePage(${currentPage - 1})">上一页</button>`;
    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="page-btn ${i === currentPage ? "active" : ""}" onclick="changePage(${i})">${i}</button>`;
    }
    html += `<button class="page-btn" ${currentPage === totalPages ? "disabled" : ""} onclick="changePage(${currentPage + 1})">下一页</button>`;
    paginationEl.innerHTML = html;
}

function changePage(page) {
    currentPage = page;
    renderNovels();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

searchInputEl.addEventListener("input", (e) => {
    const kw = e.target.value.trim().toLowerCase();
    currentPage = 1;
    filteredNovels = NOVELS.filter(novel =>
        novel.title.toLowerCase().includes(kw) ||
        novel.collection.toLowerCase().includes(kw) ||
        novel.year.toLowerCase().includes(kw) ||
        novel.summary.toLowerCase().includes(kw) ||
        novel.content.toLowerCase().includes(kw)
    );
    renderNovels();
});

function openReaderById(id) {
    const idx = filteredNovels.findIndex(n => n.id === id);
    if (idx === -1) return;

    currentNovelIndex = idx;
    const novel = filteredNovels[currentNovelIndex];

    readerTitleEl.textContent = novel.title;
    articleHeadingEl.textContent = novel.title;
    articleMetaEl.textContent = `${novel.collection} · ${novel.year}`;
    articleContentEl.innerHTML = novel.content;
    articleContentEl.style.fontSize = `${fontSize}px`;

    prevChapterBtn.disabled = currentNovelIndex <= 0;
    nextChapterBtn.disabled = currentNovelIndex >= filteredNovels.length - 1;

    readerModalEl.classList.add("active");
    readerModalEl.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    document.getElementById("readerBody").scrollTop = 0;
}

function closeReader() {
    readerModalEl.classList.remove("active");
    readerModalEl.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
}

prevChapterBtn.addEventListener("click", () => {
    if (currentNovelIndex > 0) {
        openReaderById(filteredNovels[currentNovelIndex - 1].id);
    }
});

nextChapterBtn.addEventListener("click", () => {
    if (currentNovelIndex < filteredNovels.length - 1) {
        openReaderById(filteredNovels[currentNovelIndex + 1].id);
    }
});

document.getElementById("closeReaderBtn").addEventListener("click", closeReader);

readerModalEl.addEventListener("click", (e) => {
    if (e.target === document.getElementById("readerBody")) {
        closeReader();
    }
});

document.getElementById("fontDecreaseBtn").addEventListener("click", () => {
    fontSize = Math.max(14, fontSize - 2);
    articleContentEl.style.fontSize = `${fontSize}px`;
});

document.getElementById("fontIncreaseBtn").addEventListener("click", () => {
    fontSize = Math.min(30, fontSize + 2);
    articleContentEl.style.fontSize = `${fontSize}px`;
});

document.getElementById("themeToggleBtn").addEventListener("click", (e) => {
    readerModalEl.classList.toggle("dark-mode");
    const isDark = readerModalEl.classList.contains("dark-mode");
    e.target.textContent = isDark ? "☀️ 日间" : "🌙 夜间";
});

renderNovels();

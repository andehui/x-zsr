const PAGE_SIZE = 9; // 每页固定展示 9 部作品
let currentPage = 1;
let currentCategory = "全部";
let currentKeyword = "";

function getFilteredWorks() {
    return NOVELS.filter(item => {
        const matchCat = currentCategory === "全部" || item.category === currentCategory;
        const kw = currentKeyword.trim().toLowerCase();
        const matchKw = !kw ||
            (item.title && item.title.toLowerCase().includes(kw)) ||
            (item.collection && item.collection.toLowerCase().includes(kw)) ||
            (item.category && item.category.toLowerCase().includes(kw)) ||
            (item.summary && item.summary.toLowerCase().includes(kw)) ||
            (item.content && item.content.toLowerCase().includes(kw));
        return matchCat && matchKw;
    });
}

function renderPage() {
    const list = getFilteredWorks();
    const novelListEl = document.getElementById("novelList");
    const paginationEl = document.getElementById("pagination");

    const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    if (currentPage > totalPages) {
        currentPage = totalPages;
    }

    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const pageItems = list.slice(startIndex, startIndex + PAGE_SIZE);

    if (pageItems.length === 0) {
        novelListEl.innerHTML = `<p class="empty-tip">没有找到匹配的作品，换个分类或关键词试试。</p>`;
        paginationEl.innerHTML = "";
        return;
    }

    novelListEl.innerHTML = pageItems.map(novel => `
        <article class="novel-card" data-id="${novel.id}">
            <div class="novel-meta">${novel.category || "作品"} · ${novel.collection || ""} · ${novel.year || ""}</div>
            <h3 class="novel-title">${novel.title}</h3>
            <p class="novel-summary">${novel.summary || ""}</p>
            <button class="btn-read" onclick="openReader(${novel.id})">开始阅读</button>
        </article>
    `).join("");

    renderPagination(totalPages);
}

function renderPagination(totalPages) {
    const paginationEl = document.getElementById("pagination");
    if (totalPages <= 1) {
        paginationEl.innerHTML = "";
        return;
    }

    let html = `<button class="page-btn" ${currentPage === 1 ? "disabled" : ""} onclick="goToPage(${currentPage - 1})">上一页</button>`;
    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="page-btn ${i === currentPage ? "active" : ""}" onclick="goToPage(${i})">${i}</button>`;
    }
    html += `<button class="page-btn" ${currentPage === totalPages ? "disabled" : ""} onclick="goToPage(${currentPage + 1})">下一页</button>`;
    paginationEl.innerHTML = html;
}

function goToPage(page) {
    currentPage = page;
    renderPage();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

document.getElementById("categoryBar").addEventListener("click", (e) => {
    const btn = e.target.closest(".cat-btn");
    if (!btn) return;
    document.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentCategory = btn.dataset.cat;
    currentPage = 1;
    renderPage();
});

document.getElementById("searchInput").addEventListener("input", (e) => {
    currentKeyword = e.target.value;
    currentPage = 1;
    renderPage();
});

renderPage();

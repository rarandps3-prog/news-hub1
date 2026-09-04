/* =========================================================
   NEWS HUB - ADMIN SYSTEM
========================================================= */


/* =========================================================
   PASSWORD
========================================================= */

const ADMIN_PASSWORD =
    "NewsHub2026";


/* =========================================================
   LOGIN
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const loginButton =
            document.getElementById(
                "adminLoginButton"
            );

        const passwordInput =
            document.getElementById(
                "adminPassword"
            );

        const error =
            document.getElementById(
                "loginError"
            );


        if (
            loginButton &&
            passwordInput
        ) {

            loginButton.addEventListener(
                "click",
                () => {

                    const password =
                        passwordInput.value;


                    if (
                        password ===
                        ADMIN_PASSWORD
                    ) {

                        sessionStorage.setItem(
                            "newsHubAdmin",
                            "true"
                        );


                        window.location.href =
                            "admin.html";

                    } else {

                        if (error) {

                            error.textContent =
                                "Parolă incorectă.";

                        }

                        passwordInput.value = "";

                    }

                }
            );


            passwordInput.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key === "Enter"
                    ) {

                        loginButton.click();

                    }

                }
            );

        }


        initializeAdmin();

    }
);


/* =========================================================
   INITIALIZATION
========================================================= */

function initializeAdmin() {

    const isAdmin =
        sessionStorage.getItem(
            "newsHubAdmin"
        );


    const isAdminPage =
        window.location.pathname
            .toLowerCase()
            .includes("admin.html");


    if (
        isAdminPage &&
        isAdmin !== "true"
    ) {

        window.location.href =
            "index.html";

        return;

    }


    if (
        isAdminPage &&
        isAdmin === "true"
    ) {

        renderDashboard();

        renderAdminArticles();

        renderAdminComments();

        setupAdminEvents();

        setupEditor();

    }

}


/* =========================================================
   ARTICLES
========================================================= */

function getArticles() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "newsHubArticles"
            ) || "[]"
        );

    } catch {

        return [];

    }

}


function saveArticles(articles) {

    localStorage.setItem(
        "newsHubArticles",
        JSON.stringify(articles)
    );

}


/* =========================================================
   COMMENTS
========================================================= */

function getComments() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "newsHubComments"
            ) || "[]"
        );

    } catch {

        return [];

    }

}


function saveComments(comments) {

    localStorage.setItem(
        "newsHubComments",
        JSON.stringify(comments)
    );

}


/* =========================================================
   COMMENT VOTES
========================================================= */

function getCommentVotes() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "newsHubCommentVotes"
            ) || "{}"
        );

    } catch {

        return {};

    }

}


/* =========================================================
   CREATE ARTICLE
========================================================= */

function createArticle() {

    const titleElement =
        document.getElementById(
            "articleTitle"
        );


    const categoryElement =
        document.getElementById(
            "articleCategory"
        );


    const imageElement =
        document.getElementById(
            "articleImage"
        );


    const descriptionElement =
        document.getElementById(
            "articleDescription"
        );


    const editor =
        document.getElementById(
            "articleEditor"
        );


    if (
        !titleElement ||
        !categoryElement ||
        !imageElement ||
        !descriptionElement ||
        !editor
    ) {

        return;

    }


    const title =
        titleElement.value.trim();


    const category =
        categoryElement.value;


    const image =
        imageElement.value.trim();


    const description =
        descriptionElement.value.trim();


    const content =
        editor.innerHTML.trim();


    if (
        !title ||
        !description ||
        !content
    ) {

        showAdminToast(
            "⚠️ Completează câmpurile obligatorii."
        );

        return;

    }


    const articles =
        getArticles();


    const article = {

        id: Date.now(),

        category:
            category,

        title:
            title,

        description:
            description,

        content:
            sanitizeArticleHTML(
                content
            ),

        image:
            image ||

            "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1400&q=80",

        date:
            new Date().toLocaleDateString(
                "ro-RO",
                {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                }
            ),

        timestamp:
            Date.now(),

        views: 0,

        likes: 0

    };


    articles.unshift(
        article
    );


    saveArticles(
        articles
    );


    clearArticleForm();


    renderDashboard();

    renderAdminArticles();


    showAdminToast(
        "🚀 Articol publicat!"
    );

}


/* =========================================================
   EDITOR
========================================================= */

let savedSelection = null;


/* =========================================================
   SAVE CURSOR
========================================================= */

function saveEditorSelection() {

    const editor =
        document.getElementById(
            "articleEditor"
        );


    if (!editor) return;


    const selection =
        window.getSelection();


    if (
        !selection ||
        selection.rangeCount === 0
    ) {

        return;

    }


    const range =
        selection.getRangeAt(0);


    if (
        editor.contains(
            range.commonAncestorContainer
        )
    ) {

        savedSelection =
            range.cloneRange();

    }

}


/* =========================================================
   RESTORE CURSOR
========================================================= */

function restoreEditorSelection() {

    if (!savedSelection) return;


    const selection =
        window.getSelection();


    selection.removeAllRanges();

    selection.addRange(
        savedSelection
    );

}


/* =========================================================
   EDITOR SETUP
========================================================= */

function setupEditor() {

    const editor =
        document.getElementById(
            "articleEditor"
        );


    if (!editor) return;


    editor.addEventListener(
        "keyup",
        saveEditorSelection
    );


    editor.addEventListener(
        "mouseup",
        saveEditorSelection
    );


    editor.addEventListener(
        "click",
        saveEditorSelection
    );


    document
        .querySelectorAll(
            "[data-command]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    restoreEditorSelection();

                    document.execCommand(
                        button.dataset.command,
                        false,
                        null
                    );

                    editor.focus();

                    saveEditorSelection();

                }
            );

        });


    document
        .getElementById(
            "addImageButton"
        )
        ?.addEventListener(
            "click",
            addImageToEditor
        );


    document
        .getElementById(
            "addHeadingButton"
        )
        ?.addEventListener(
            "click",
            addHeadingToEditor
        );


    document
        .getElementById(
            "addLinkButton"
        )
        ?.addEventListener(
            "click",
            addLinkToEditor
        );

}


/* =========================================================
   ADD IMAGE
========================================================= */

function addImageToEditor() {

    const editor =
        document.getElementById(
            "articleEditor"
        );


    if (!editor) return;


    restoreEditorSelection();


    const url =
        prompt(
            "Introdu URL-ul imaginii:"
        );


    if (!url) return;


    const cleanURL =
        url.trim();


    if (
        !cleanURL.startsWith("http://") &&
        !cleanURL.startsWith("https://")
    ) {

        showAdminToast(
            "⚠️ Introdu un URL valid."
        );

        return;

    }


    const caption =
        prompt(
            "Descrierea imaginii (opțional):"
        );


    const figure =
        document.createElement(
            "figure"
        );


    const image =
        document.createElement(
            "img"
        );


    image.src =
        cleanURL;

    image.alt =
        caption || "Imagine articol";


    image.style.maxWidth =
        "100%";


    image.style.height =
        "auto";


    image.loading =
        "lazy";


    figure.appendChild(
        image
    );


    if (
        caption &&
        caption.trim()
    ) {

        const figcaption =
            document.createElement(
                "figcaption"
            );


        figcaption.textContent =
            caption.trim();


        figure.appendChild(
            figcaption
        );

    }


    const selection =
        window.getSelection();


    if (
        savedSelection &&
        editor.contains(
            savedSelection.commonAncestorContainer
        )
    ) {

        selection.removeAllRanges();

        selection.addRange(
            savedSelection
        );

    }


    if (
        selection.rangeCount > 0
    ) {

        const range =
            selection.getRangeAt(0);


        range.deleteContents();

        range.insertNode(
            figure
        );


        const spacer =
            document.createElement(
                "p"
            );


        spacer.innerHTML =
            "<br>";


        figure.after(
            spacer
        );


        const newRange =
            document.createRange();


        newRange.setStart(
            spacer,
            0
        );


        newRange.collapse(
            true
        );


        selection.removeAllRanges();

        selection.addRange(
            newRange
        );


        savedSelection =
            newRange.cloneRange();

    } else {

        editor.appendChild(
            figure
        );


        const paragraph =
            document.createElement(
                "p"
            );


        paragraph.innerHTML =
            "<br>";


        editor.appendChild(
            paragraph
        );


        paragraph.focus();

    }


    editor.focus();

    showAdminToast(
        "🖼️ Imagine adăugată."
    );

}


/* =========================================================
   ADD HEADING
========================================================= */

function addHeadingToEditor() {

    restoreEditorSelection();


    document.execCommand(
        "formatBlock",
        false,
        "h2"
    );


    const editor =
        document.getElementById(
            "articleEditor"
        );


    editor?.focus();

}


/* =========================================================
   ADD LINK
========================================================= */

function addLinkToEditor() {

    restoreEditorSelection();


    const url =
        prompt(
            "Introdu URL-ul:"
        );


    if (!url) return;


    document.execCommand(
        "createLink",
        false,
        url
    );


    const editor =
        document.getElementById(
            "articleEditor"
        );


    editor?.focus();

}


/* =========================================================
   SANITIZE ARTICLE HTML
========================================================= */

function sanitizeArticleHTML(html) {

    const wrapper =
        document.createElement(
            "div"
        );


    wrapper.innerHTML =
        html;


    wrapper
        .querySelectorAll(
            "script, iframe, object, embed"
        )
        .forEach(
            element =>
                element.remove()
        );


    wrapper
        .querySelectorAll(
            "*"
        )
        .forEach(element => {

            [...element.attributes]
                .forEach(attribute => {

                    if (
                        attribute.name
                            .toLowerCase()
                            .startsWith("on")
                    ) {

                        element.removeAttribute(
                            attribute.name
                        );

                    }

                });

        });


    return wrapper.innerHTML;

}


/* =========================================================
   CLEAR FORM
========================================================= */

function clearArticleForm() {

    const fields = [

        "articleTitle",

        "articleImage",

        "articleDescription"

    ];


    fields.forEach(id => {

        const element =
            document.getElementById(
                id
            );


        if (element) {

            element.value = "";

        }

    });


    const editor =
        document.getElementById(
            "articleEditor"
        );


    if (editor) {

        editor.innerHTML =
            "<p><br></p>";

        editor.focus();

    }


    savedSelection = null;

}


/* =========================================================
   ADMIN ARTICLE LIST
========================================================= */

function renderAdminArticles() {

    const container =
        document.getElementById(
            "adminArticles"
        );


    if (!container) return;


    const articles =
        getArticles();


    container.innerHTML = "";


    if (!articles.length) {

        container.innerHTML = `

            <div class="empty-admin">
                Nu există articole.
            </div>

        `;

        return;

    }


    articles.forEach(article => {

        const item =
            document.createElement(
                "div"
            );


        item.className =
            "admin-article";


        item.innerHTML = `

            <img
                src="${escapeHTML(article.image)}"
                alt=""
            >


            <div class="admin-article-info">

                <h3>
                    ${escapeHTML(article.title)}
                </h3>

                <p>

                    ${escapeHTML(article.category)}

                    ·

                    ${escapeHTML(article.date)}

                    ·

                    👁️ ${article.views || 0}

                    ·

                    ❤️ ${article.likes || 0}

                </p>

            </div>


            <div
                class="admin-article-actions">

                <button
                    onclick="openArticle(${article.id})">

                    👁️

                </button>


                <button
                    class="delete"
                    onclick="deleteArticle(${article.id})">

                    🗑️

                </button>

            </div>

        `;


        container.appendChild(
            item
        );

    });

}


/* =========================================================
   OPEN ARTICLE
========================================================= */

function openArticle(id) {

    window.open(
        `../article.html?id=${id}`,
        "_blank"
    );

}


/* =========================================================
   DELETE ARTICLE
========================================================= */

function deleteArticle(id) {

    const confirmation =
        confirm(
            "Sigur vrei să ștergi acest articol?"
        );


    if (!confirmation) return;


    let articles =
        getArticles();


    articles =
        articles.filter(
            article =>
                Number(article.id) !== Number(id)
        );


    saveArticles(
        articles
    );


    renderDashboard();

    renderAdminArticles();


    showAdminToast(
        "🗑️ Articol șters."
    );

}


/* =========================================================
   DASHBOARD
========================================================= */

function renderDashboard() {

    const articles =
        getArticles();


    const comments =
        getComments();


    const views =
        articles.reduce(
            (total, article) =>
                total +
                Number(article.views || 0),
            0
        );


    const likes =
        articles.reduce(
            (total, article) =>
                total +
                Number(article.likes || 0),
            0
        );


    setText(
        "dashboardArticles",
        articles.length
    );


    setText(
        "dashboardViews",
        views
    );


    setText(
        "dashboardLikes",
        likes
    );


    setText(
        "dashboardComments",
        comments.length
    );

}


/* =========================================================
   FIND ARTICLE TITLE
========================================================= */

function getArticleTitle(articleId) {

    const articles =
        getArticles();


    const article =
        articles.find(
            item =>
                String(item.id) ===
                String(articleId)
        );


    return article
        ? article.title
        : "Articol necunoscut";

}


/* =========================================================
   ADMIN COMMENTS
========================================================= */

function renderAdminComments() {

    const container =
        document.getElementById(
            "adminComments"
        );


    if (!container) return;


    const comments =
        getComments();


    container.innerHTML = "";


    if (!comments.length) {

        container.innerHTML = `

            <div class="empty-admin">

                Nu există comentarii.

            </div>

        `;

        return;

    }


    const orderedComments =
        comments
            .slice()
            .sort(
                (a, b) =>
                    Number(b.id) -
                    Number(a.id)
            );


    orderedComments.forEach(
        comment => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "admin-comment";


            if (
                comment.parentId
            ) {

                item.classList.add(
                    "admin-comment-reply"
                );

            }


            const isAdmin =
                comment.isAdmin === true;


            const articleTitle =
                getArticleTitle(
                    comment.articleId
                );


            const parent =
                comment.parentId
                    ? comments.find(
                        c =>
                            String(c.id) ===
                            String(comment.parentId)
                    )
                    : null;


            const parentText =
                parent
                    ? `↳ Răspuns la ${parent.user || "utilizator"}`
                    : "";


            const upvotes =
                Number(
                    comment.upvotes || 0
                );


            const downvotes =
                Number(
                    comment.downvotes || 0
                );


            item.innerHTML = `

                <div
                    class="admin-comment-top">

                    <div>

                        <strong>

                            ${escapeHTML(
                                comment.user ||
                                "Utilizator"
                            )}

                        </strong>


                        ${
                            isAdmin
                                ? `
                                    <span class="comment-admin-badge">
                                        ✓ ADMIN
                                    </span>
                                  `
                                : ""
                        }

                    </div>


                    <small>

                        ${escapeHTML(
                            comment.date ||
                            ""
                        )}

                    </small>

                </div>


                <div class="admin-comment-article">

                    📰 ${escapeHTML(
                        articleTitle
                    )}

                </div>


                ${
                    parentText
                        ? `
                            <div class="admin-comment-parent">

                                ${escapeHTML(
                                    parentText
                                )}

                            </div>
                          `
                        : ""
                }


                <p>

                    ${escapeHTML(
                        comment.text ||
                        ""
                    )}

                </p>


                <div class="admin-comment-stats">

                    👍 ${upvotes}

                    &nbsp;&nbsp;

                    👎 ${downvotes}

                </div>


                <div
                    class="admin-comment-actions">

                    <button
                        onclick="openAdminReplyBox('${comment.id}')">

                        ↩️ Răspunde

                    </button>


                    <button
                        class="delete"
                        onclick="deleteComment('${comment.id}')">

                        🗑️ Șterge

                    </button>

                </div>


                <div
                    id="adminReplyBox-${comment.id}"
                    class="admin-reply-box"
                    style="display:none;">

                    <textarea
                        id="adminReplyText-${comment.id}"
                        maxlength="500"
                        placeholder="Scrie răspunsul Adminului..."
                    ></textarea>


                    <div
                        class="admin-reply-actions">

                        <button
                            onclick="submitAdminReply('${comment.id}')">

                            👑 Publică răspunsul

                        </button>


                        <button
                            onclick="cancelAdminReply('${comment.id}')">

                            Anulează

                        </button>

                    </div>

                </div>

            `;


            container.appendChild(
                item
            );

        }
    );

}


/* =========================================================
   OPEN ADMIN REPLY BOX
========================================================= */

function openAdminReplyBox(commentId) {

    if (
        sessionStorage.getItem(
            "newsHubAdmin"
        ) !== "true"
    ) {

        return;

    }


    const box =
        document.getElementById(
            `adminReplyBox-${commentId}`
        );


    if (!box) return;


    document
        .querySelectorAll(
            ".admin-reply-box"
        )
        .forEach(
            otherBox => {

                if (
                    otherBox !== box
                ) {

                    otherBox.style.display =
                        "none";

                }

            }
        );


    box.style.display =
        "block";


    const textarea =
        document.getElementById(
            `adminReplyText-${commentId}`
        );


    textarea?.focus();

}


/* =========================================================
   CANCEL ADMIN REPLY
========================================================= */

function cancelAdminReply(commentId) {

    const box =
        document.getElementById(
            `adminReplyBox-${commentId}`
        );


    const textarea =
        document.getElementById(
            `adminReplyText-${commentId}`
        );


    if (textarea) {

        textarea.value = "";

    }


    if (box) {

        box.style.display =
            "none";

    }

}


/* =========================================================
   SUBMIT ADMIN REPLY
========================================================= */

function submitAdminReply(commentId) {

    if (
        sessionStorage.getItem(
            "newsHubAdmin"
        ) !== "true"
    ) {

        showAdminToast(
            "⛔ Nu ești autentificat ca Admin."
        );

        return;

    }


    const textarea =
        document.getElementById(
            `adminReplyText-${commentId}`
        );


    if (!textarea) return;


    const text =
        textarea.value.trim();


    if (!text) {

        showAdminToast(
            "⚠️ Scrie un răspuns."
        );

        return;

    }


    const comments =
        getComments();


    const parent =
        comments.find(
            comment =>
                String(comment.id) ===
                String(commentId)
        );


    if (!parent) {

        showAdminToast(
            "⚠️ Comentariul nu mai există."
        );

        renderAdminComments();

        return;

    }


    const newReply = {

        id:
            Date.now(),

        articleId:
            parent.articleId,

        parentId:
            parent.id,

        user:
            "News Hub Admin",

        text:
            text,

        date:
            new Date().toLocaleDateString(
                "ro-RO",
                {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                }
            ),

        timestamp:
            Date.now(),

        isAdmin:
            true,

        upvotes:
            0,

        downvotes:
            0

    };


    comments.push(
        newReply
    );


    saveComments(
        comments
    );


    textarea.value = "";


    renderDashboard();

    renderAdminComments();


    showAdminToast(
        "👑 Răspunsul Adminului a fost publicat!"
    );

}


/* =========================================================
   DELETE COMMENT + REPLIES
========================================================= */

function deleteComment(id) {

    const confirmation =
        confirm(
            "Sigur vrei să ștergi acest comentariu?\n\nDacă are răspunsuri, acestea vor fi șterse și ele."
        );


    if (!confirmation) return;


    const comments =
        getComments();


    const idsToDelete =
        new Set();


    function collectReplies(
        parentId
    ) {

        idsToDelete.add(
            String(parentId)
        );


        comments.forEach(
            comment => {

                if (
                    String(
                        comment.parentId
                    ) ===
                    String(parentId)
                ) {

                    collectReplies(
                        comment.id
                    );

                }

            }
        );

    }


    collectReplies(
        id
    );


    const remainingComments =
        comments.filter(
            comment =>
                !idsToDelete.has(
                    String(comment.id)
                )
        );


    saveComments(
        remainingComments
    );


    /* Remove votes belonging to deleted comments */

    const votes =
        getCommentVotes();


    idsToDelete.forEach(
        commentId => {

            delete votes[
                commentId
            ];

        }
    );


    localStorage.setItem(
        "newsHubCommentVotes",
        JSON.stringify(
            votes
        )
    );


    renderDashboard();

    renderAdminComments();


    showAdminToast(
        "🗑️ Comentariul și răspunsurile au fost șterse."
    );

}


/* =========================================================
   CLEAR ALL COMMENTS
========================================================= */

function clearAllComments() {

    const confirmation =
        confirm(
            "Sigur vrei să ștergi toate comentariile?"
        );


    if (!confirmation) return;


    localStorage.removeItem(
        "newsHubComments"
    );


    localStorage.removeItem(
        "newsHubCommentVotes"
    );


    renderDashboard();

    renderAdminComments();


    showAdminToast(
        "Comentariile au fost șterse."
    );

}


/* =========================================================
   EXPORT
========================================================= */

function exportData() {

    const data = {

        articles:
            getArticles(),

        comments:
            getComments(),

        commentVotes:
            getCommentVotes(),

        favorites:
            JSON.parse(
                localStorage.getItem(
                    "newsHubFavorites"
                ) || "[]"
            ),

        liked:
            JSON.parse(
                localStorage.getItem(
                    "newsHubLiked"
                ) || "[]"
            )

    };


    const blob =
        new Blob(
            [
                JSON.stringify(
                    data,
                    null,
                    2
                )
            ],
            {
                type:
                    "application/json"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        "news-hub-backup.json";


    link.click();


    URL.revokeObjectURL(
        url
    );


    showAdminToast(
        "📥 Backup creat."
    );

}


/* =========================================================
   RESET
========================================================= */

function resetData() {

    const confirmation =
        confirm(
            "ATENȚIE! Această acțiune șterge toate datele locale. Continui?"
        );


    if (!confirmation) return;


    localStorage.removeItem(
        "newsHubArticles"
    );


    localStorage.removeItem(
        "newsHubComments"
    );


    localStorage.removeItem(
        "newsHubFavorites"
    );


    localStorage.removeItem(
        "newsHubLiked"
    );


    localStorage.removeItem(
        "newsHubCommentVotes"
    );


    renderDashboard();

    renderAdminArticles();

    renderAdminComments();


    showAdminToast(
        "♻️ Datele au fost resetate."
    );

}


/* =========================================================
   EVENTS
========================================================= */

function setupAdminEvents() {

    document
        .getElementById(
            "publishButton"
        )
        ?.addEventListener(
            "click",
            createArticle
        );


    document
        .getElementById(
            "clearFormButton"
        )
        ?.addEventListener(
            "click",
            clearArticleForm
        );


    document
        .getElementById(
            "refreshArticlesButton"
        )
        ?.addEventListener(
            "click",
            () => {

                renderAdminArticles();

                renderDashboard();

                renderAdminComments();

                showAdminToast(
                    "🔄 Actualizat."
                );

            }
        );


    document
        .getElementById(
            "clearCommentsButton"
        )
        ?.addEventListener(
            "click",
            clearAllComments
        );


    document
        .getElementById(
            "exportButton"
        )
        ?.addEventListener(
            "click",
            exportData
        );


    document
        .getElementById(
            "resetButton"
        )
        ?.addEventListener(
            "click",
            resetData
        );


    document
        .getElementById(
            "logoutButton"
        )
        ?.addEventListener(
            "click",
            () => {

                sessionStorage.removeItem(
                    "newsHubAdmin"
                );


                window.location.href =
                    "index.html";

            }
        );

}


/* =========================================================
   HELPERS
========================================================= */

function setText(id, value) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value;

    }

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(text) {

    const element =
        document.createElement(
            "div"
        );


    element.textContent =
        text || "";


    return element.innerHTML;

}


/* =========================================================
   TOAST
========================================================= */

let toastTimeout;


function showAdminToast(message) {

    const toast =
        document.getElementById(
            "adminToast"
        );


    if (!toast) return;


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimeout
    );


    toastTimeout =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2500
        );

}
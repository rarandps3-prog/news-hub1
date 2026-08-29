/* =========================================================
   NEWS HUB - ARTICLE SYSTEM
========================================================= */


const params =
    new URLSearchParams(
        window.location.search
    );


const articleId =
    Number(params.get("id"));


const articleContainer =
    document.getElementById(
        "articleContainer"
    );


const commentsList =
    document.getElementById(
        "commentsList"
    );


let currentArticle = null;


/* =========================================================
   STORAGE
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


function getFavorites() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "newsHubFavorites"
            ) || "[]"
        );

    } catch {

        return [];

    }

}


function saveFavorites(favorites) {

    localStorage.setItem(
        "newsHubFavorites",
        JSON.stringify(favorites)
    );

}


function getLiked() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "newsHubLiked"
            ) || "[]"
        );

    } catch {

        return [];

    }

}


function saveLiked(liked) {

    localStorage.setItem(
        "newsHubLiked",
        JSON.stringify(liked)
    );

}


/* =========================================================
   SECURITY
========================================================= */

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text || "";

    return div.innerHTML;

}


/* =========================================================
   FIND ARTICLE
========================================================= */

function findArticle() {

    const articles =
        getArticles();

    return articles.find(
        article =>
            Number(article.id) === articleId
    );

}


/* =========================================================
   RENDER ARTICLE
========================================================= */

function renderArticle() {

    currentArticle =
        findArticle();


    if (!currentArticle) {

        articleContainer.innerHTML = `

            <div class="article-not-found">

                <h1>
                    Articolul nu a fost găsit
                </h1>

                <p>
                    Este posibil ca articolul să fi fost șters.
                </p>

                <a href="index.html">
                    ← Înapoi
                </a>

            </div>

        `;

        return;

    }


    document.title =
        currentArticle.title +
        " - News Hub";


    let articles =
        getArticles();


    const articleIndex =
        articles.findIndex(
            article =>
                Number(article.id) === articleId
        );


    if (articleIndex !== -1) {

        articles[articleIndex].views =
            (articles[articleIndex].views || 0) + 1;

        currentArticle =
            articles[articleIndex];

        saveArticles(articles);

    }


    const liked =
        getLiked().includes(articleId);


    const favorites =
        getFavorites();

    const favorite =
        favorites.includes(articleId);


    articleContainer.innerHTML = `

        <div class="article-header">

            <span class="article-category-large">
                ${escapeHTML(currentArticle.category)}
            </span>


            <h1>
                ${escapeHTML(currentArticle.title)}
            </h1>


            <p class="article-description">
                ${escapeHTML(currentArticle.description)}
            </p>


            <div class="article-info">

                <span>
                    📅 ${escapeHTML(currentArticle.date)}
                </span>

                <span>
                    👁️ ${currentArticle.views || 0} vizualizări
                </span>

            </div>

        </div>


        <img
            class="article-main-image"
            src="${escapeHTML(currentArticle.image)}"
            alt="${escapeHTML(currentArticle.title)}"
        >


        <div class="article-content">

            ${
                currentArticle.content ||
                "<p>Articol fără conținut.</p>"
            }

        </div>


        <div class="article-actions">

            <button
                id="likeButton"
                class="${liked ? "liked" : ""}">

                ${liked ? "❤️" : "🤍"}
                <span>
                    ${currentArticle.likes || 0}
                </span>
                Like

            </button>


            <button
                id="favoriteButton"
                class="${favorite ? "favorited" : ""}">

                ${favorite ? "⭐" : "☆"}
                Favorite

            </button>

        </div>

    `;


    document
        .getElementById("likeButton")
        ?.addEventListener(
            "click",
            toggleLike
        );


    document
        .getElementById("favoriteButton")
        ?.addEventListener(
            "click",
            toggleFavorite
        );


    renderComments();

}


/* =========================================================
   LIKE
========================================================= */

function toggleLike() {

    let liked =
        getLiked();

    let articles =
        getArticles();


    const index =
        articles.findIndex(
            article =>
                Number(article.id) === articleId
        );


    if (index === -1) return;


    if (liked.includes(articleId)) {

        liked =
            liked.filter(
                id =>
                    id !== articleId
            );

        articles[index].likes =
            Math.max(
                0,
                (articles[index].likes || 0) - 1
            );

    } else {

        liked.push(articleId);

        articles[index].likes =
            (articles[index].likes || 0) + 1;

    }


    saveLiked(liked);

    saveArticles(articles);

    renderArticle();

}


/* =========================================================
   FAVORITE
========================================================= */

function toggleFavorite() {

    let favorites =
        getFavorites();


    if (favorites.includes(articleId)) {

        favorites =
            favorites.filter(
                id =>
                    id !== articleId
            );

    } else {

        favorites.push(articleId);

    }


    saveFavorites(favorites);

    renderArticle();

}


/* =========================================================
   COMMENTS
========================================================= */

function renderComments() {

    if (!commentsList) return;


    const comments =
        getComments()
            .filter(
                comment =>
                    Number(comment.articleId) === articleId
            );


    commentsList.innerHTML = "";


    if (!comments.length) {

        commentsList.innerHTML = `

            <div class="no-comments">
                Fii primul care lasă un comentariu! 👋
            </div>

        `;

        return;

    }


    comments
        .slice()
        .reverse()
        .forEach(comment => {

            const item =
                document.createElement("div");


            item.className =
                "comment";


            item.innerHTML = `

                <div class="comment-top">

                    <strong>
                        ${escapeHTML(comment.user)}
                    </strong>

                    <small>
                        ${escapeHTML(comment.date)}
                    </small>

                </div>

                <p>
                    ${escapeHTML(comment.text)}
                </p>

            `;


            commentsList.appendChild(item);

        });

}


/* =========================================================
   ADD COMMENT
========================================================= */

const commentForm =
    document.getElementById(
        "commentForm"
    );


commentForm?.addEventListener(
    "submit",
    event => {

        event.preventDefault();


        const user =
            document
                .getElementById(
                    "commentUser"
                )
                .value
                .trim();


        const text =
            document
                .getElementById(
                    "commentText"
                )
                .value
                .trim();


        if (!user || !text) return;


        const comments =
            getComments();


        comments.push({

            id: Date.now(),

            articleId: articleId,

            user: user,

            text: text,

            date:
                new Date().toLocaleDateString(
                    "ro-RO"
                )

        });


        saveComments(comments);


        commentForm.reset();

        renderComments();

    }
);


/* =========================================================
   START
========================================================= */

renderArticle();
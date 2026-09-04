/* =========================================================
   NEWS HUB - ARTICLE SYSTEM
   Articol + Like + Favorite + Comentarii + Răspunsuri
   + Upvote + Downvote + Răspunsuri Admin
========================================================= */


/* =========================================================
   URL / ARTICLE ID
========================================================= */

const params =
    new URLSearchParams(
        window.location.search
    );


const articleId =
    Number(
        params.get("id")
    );


const articleContainer =
    document.getElementById(
        "articleContainer"
    );


const commentsList =
    document.getElementById(
        "commentsList"
    );


const commentForm =
    document.getElementById(
        "commentForm"
    );


let currentArticle = null;


/* =========================================================
   STORAGE - ARTICLES
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


function saveArticles(
    articles
) {

    localStorage.setItem(
        "newsHubArticles",
        JSON.stringify(
            articles
        )
    );

}


/* =========================================================
   STORAGE - COMMENTS
========================================================= */

function getComments() {

    try {

        const comments =
            JSON.parse(
                localStorage.getItem(
                    "newsHubComments"
                ) || "[]"
            );


        return Array.isArray(
            comments
        )
            ? comments
            : [];

    } catch {

        return [];

    }

}


function saveComments(
    comments
) {

    localStorage.setItem(
        "newsHubComments",
        JSON.stringify(
            comments
        )
    );

}


/* =========================================================
   STORAGE - FAVORITES
========================================================= */

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


function saveFavorites(
    favorites
) {

    localStorage.setItem(
        "newsHubFavorites",
        JSON.stringify(
            favorites
        )
    );

}


/* =========================================================
   STORAGE - LIKED ARTICLES
========================================================= */

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


function saveLiked(
    liked
) {

    localStorage.setItem(
        "newsHubLiked",
        JSON.stringify(
            liked
        )
    );

}


/* =========================================================
   STORAGE - COMMENT VOTES
========================================================= */

/*
   Format:

   {
       "commentID": "up",
       "commentID2": "down"
   }

   Astfel, același utilizator/browser
   nu poate vota de mai multe ori.
*/

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


function saveCommentVotes(
    votes
) {

    localStorage.setItem(
        "newsHubCommentVotes",
        JSON.stringify(
            votes
        )
    );

}


/* =========================================================
   SECURITY
========================================================= */

function escapeHTML(
    text
) {

    const div =
        document.createElement(
            "div"
        );


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
            Number(
                article.id
            ) === articleId
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
                Number(
                    article.id
                ) === articleId
        );


    if (
        articleIndex !== -1
    ) {

        /*
           Evităm creșterea vizualizărilor
           dacă pagina este re-randată.
        */

        if (
            !currentArticle._viewedInSession
        ) {

            articles[
                articleIndex
            ].views =
                (
                    articles[
                        articleIndex
                    ].views || 0
                ) + 1;


            currentArticle =
                articles[
                    articleIndex
                ];


            saveArticles(
                articles
            );

        }

    }


    const liked =
        getLiked().includes(
            articleId
        );


    const favorites =
        getFavorites();


    const favorite =
        favorites.includes(
            articleId
        );


    articleContainer.innerHTML = `

        <div class="article-header">

            <span class="article-category-large">

                ${escapeHTML(
                    currentArticle.category
                )}

            </span>


            <h1>

                ${escapeHTML(
                    currentArticle.title
                )}

            </h1>


            <p class="article-description">

                ${escapeHTML(
                    currentArticle.description
                )}

            </p>


            <div class="article-info">

                <span>

                    📅
                    ${escapeHTML(
                        currentArticle.date
                    )}

                </span>


                <span>

                    👁️
                    ${currentArticle.views || 0}
                    vizualizări

                </span>

            </div>

        </div>


        <img
            class="article-main-image"
            src="${escapeHTML(
                currentArticle.image
            )}"
            alt="${escapeHTML(
                currentArticle.title
            )}"
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

                ${
                    liked
                        ? "❤️"
                        : "🤍"
                }

                <span>

                    ${currentArticle.likes || 0}

                </span>

                Like

            </button>


            <button
                id="favoriteButton"
                class="${favorite ? "favorited" : ""}">

                ${
                    favorite
                        ? "⭐"
                        : "☆"
                }

                Favorite

            </button>

        </div>

    `;


    document
        .getElementById(
            "likeButton"
        )
        ?.addEventListener(
            "click",
            toggleLike
        );


    document
        .getElementById(
            "favoriteButton"
        )
        ?.addEventListener(
            "click",
            toggleFavorite
        );


    renderComments();

}


/* =========================================================
   LIKE ARTICLE
========================================================= */

function toggleLike() {

    let liked =
        getLiked();


    let articles =
        getArticles();


    const index =
        articles.findIndex(
            article =>
                Number(
                    article.id
                ) === articleId
        );


    if (
        index === -1
    ) return;


    if (
        liked.includes(
            articleId
        )
    ) {

        liked =
            liked.filter(
                id =>
                    id !== articleId
            );


        articles[
            index
        ].likes =
            Math.max(
                0,
                (
                    articles[
                        index
                    ].likes || 0
                ) - 1
            );

    } else {

        liked.push(
            articleId
        );


        articles[
            index
        ].likes =
            (
                articles[
                    index
                ].likes || 0
            ) + 1;

    }


    saveLiked(
        liked
    );


    saveArticles(
        articles
    );


    currentArticle =
        articles[
            index
        ];


    renderArticle();

}


/* =========================================================
   FAVORITE
========================================================= */

function toggleFavorite() {

    let favorites =
        getFavorites();


    if (
        favorites.includes(
            articleId
        )
    ) {

        favorites =
            favorites.filter(
                id =>
                    id !== articleId
            );

    } else {

        favorites.push(
            articleId
        );

    }


    saveFavorites(
        favorites
    );


    renderArticle();

}


/* =========================================================
   CREATE USER COMMENT
========================================================= */

function addComment() {

    if (!commentForm) return;


    const userInput =
        document.getElementById(
            "commentUser"
        );


    const textInput =
        document.getElementById(
            "commentText"
        );


    if (
        !userInput ||
        !textInput
    ) return;


    const user =
        userInput.value.trim();


    const text =
        textInput.value.trim();


    if (
        !user ||
        !text
    ) {

        return;

    }


    const comments =
        getComments();


    const comment = {

        id:
            Date.now() +
            Math.floor(
                Math.random() * 10000
            ),

        articleId:
            articleId,

        parentId:
            null,

        user:
            user,

        text:
            text,

        date:
            new Date().toLocaleDateString(
                "ro-RO"
            ),

        isAdmin:
            false,

        upvotes:
            0,

        downvotes:
            0

    };


    comments.push(
        comment
    );


    saveComments(
        comments
    );


    commentForm.reset();


    renderComments();

}


/* =========================================================
   COMMENT FORM
========================================================= */

commentForm?.addEventListener(
    "submit",
    event => {

        event.preventDefault();

        addComment();

    }
);


/* =========================================================
   RENDER COMMENTS
========================================================= */

function renderComments() {

    if (!commentsList) return;


    const allComments =
        getComments();


    const comments =
        allComments.filter(
            comment =>
                Number(
                    comment.articleId
                ) === articleId
        );


    commentsList.innerHTML = "";


    if (
        !comments.length
    ) {

        commentsList.innerHTML = `

            <div class="no-comments">

                Fii primul care lasă un comentariu! 👋

            </div>

        `;

        return;

    }


    const roots =
        comments.filter(
            comment =>
                !comment.parentId
        );


    roots.forEach(
        comment => {

            renderCommentTree(
                comment,
                commentsList,
                comments
            );

        }
    );

}


/* =========================================================
   COMMENT TREE
========================================================= */

function renderCommentTree(
    comment,
    container,
    allComments
) {

    const item =
        createCommentElement(
            comment
        );


    container.appendChild(
        item
    );


    const replies =
        allComments.filter(
            reply =>
                String(
                    reply.parentId
                ) ===
                String(
                    comment.id
                )
        );


    replies.forEach(
        reply => {

            renderCommentTree(
                reply,
                container,
                allComments
            );

        }
    );

}


/* =========================================================
   CREATE COMMENT ELEMENT
========================================================= */

function createCommentElement(
    comment
) {

    const item =
        document.createElement(
            "div"
        );


    item.className =
        comment.isAdmin
            ? "comment comment-admin"
            : (
                comment.parentId
                    ? "comment comment-reply"
                    : "comment"
            );


    item.dataset.commentId =
        comment.id;


    const votes =
        getCommentVotes();


    const userVote =
        votes[
            String(
                comment.id
            )
        ] || null;


    const upvotes =
        Number(
            comment.upvotes || 0
        );


    const downvotes =
        Number(
            comment.downvotes || 0
        );


    const score =
        upvotes -
        downvotes;


    const adminBadge =
        comment.isAdmin
            ? `
                <span class="comment-admin-badge">
                    🛡️ ADMIN
                </span>
              `
            : "";


    item.innerHTML = `

        <div class="comment-inner">

            <div class="comment-top">

                <div class="comment-author">

                    <strong>

                        ${escapeHTML(
                            comment.user
                        )}

                    </strong>

                    ${adminBadge}

                </div>


                <small>

                    ${escapeHTML(
                        comment.date
                    )}

                </small>

            </div>


            <p class="comment-text">

                ${escapeHTML(
                    comment.text
                )}

            </p>


            <div class="comment-bottom">


                <div class="comment-votes">


                    <button
                        class="
                            comment-vote-button
                            upvote-button
                            ${
                                userVote === "up"
                                    ? "active"
                                    : ""
                            }
                        "
                        onclick="voteComment(
                            '${comment.id}',
                            'up'
                        )">

                        👍

                        <span>

                            ${upvotes}

                        </span>

                    </button>


                    <button
                        class="
                            comment-vote-button
                            downvote-button
                            ${
                                userVote === "down"
                                    ? "active"
                                    : ""
                            }
                        "
                        onclick="voteComment(
                            '${comment.id}',
                            'down'
                        )">

                        👎

                        <span>

                            ${downvotes}

                        </span>

                    </button>


                    <span
                        class="comment-score">

                        Scor:
                        ${score}

                    </span>


                </div>


                <button
                    class="reply-button"
                    onclick="showReplyBox(
                        '${comment.id}'
                    )">

                    ↩️ Răspunde

                </button>


            </div>


            <div
                id="replyBox-${comment.id}"
                class="reply-box">

            </div>


        </div>

    `;


    return item;

}


/* =========================================================
   SHOW REPLY BOX
========================================================= */

function showReplyBox(
    commentId
) {

    const box =
        document.getElementById(
            `replyBox-${commentId}`
        );


    if (!box) return;


    if (
        box.innerHTML.trim()
    ) {

        box.innerHTML = "";

        return;

    }


    box.innerHTML = `

        <form
            class="reply-form"
            onsubmit="
                submitReply(
                    event,
                    '${commentId}'
                );
                return false;
            ">


            <input
                type="text"
                id="replyUser-${commentId}"
                placeholder="Numele tău"
                maxlength="40"
                required
            >


            <textarea
                id="replyText-${commentId}"
                placeholder="Scrie un răspuns..."
                maxlength="500"
                required>
            </textarea>


            <div class="reply-form-actions">

                <button
                    type="submit">

                    ↩️ Răspunde

                </button>


                <button
                    type="button"
                    onclick="
                        cancelReply(
                            '${commentId}'
                        )
                    ">

                    Anulează

                </button>

            </div>


        </form>

    `;

}


/* =========================================================
   CANCEL REPLY
========================================================= */

function cancelReply(
    commentId
) {

    const box =
        document.getElementById(
            `replyBox-${commentId}`
        );


    if (box) {

        box.innerHTML = "";

    }

}


/* =========================================================
   SUBMIT REPLY
========================================================= */

function submitReply(
    event,
    parentId
) {

    event.preventDefault();


    const userInput =
        document.getElementById(
            `replyUser-${parentId}`
        );


    const textInput =
        document.getElementById(
            `replyText-${parentId}`
        );


    if (
        !userInput ||
        !textInput
    ) return;


    const user =
        userInput.value.trim();


    const text =
        textInput.value.trim();


    if (
        !user ||
        !text
    ) {

        return;

    }


    const comments =
        getComments();


    const parentExists =
        comments.some(
            comment =>
                String(
                    comment.id
                ) ===
                String(
                    parentId
                )
        );


    if (
        !parentExists
    ) {

        return;

    }


    const reply = {

        id:
            Date.now() +
            Math.floor(
                Math.random() * 10000
            ),

        articleId:
            articleId,

        parentId:
            Number(
                parentId
            ),

        user:
            user,

        text:
            text,

        date:
            new Date().toLocaleDateString(
                "ro-RO"
            ),

        isAdmin:
            false,

        upvotes:
            0,

        downvotes:
            0

    };


    comments.push(
        reply
    );


    saveComments(
        comments
    );


    renderComments();

}


/* =========================================================
   VOTE COMMENT
========================================================= */

function voteComment(
    commentId,
    type
) {

    let comments =
        getComments();


    const index =
        comments.findIndex(
            comment =>
                String(
                    comment.id
                ) ===
                String(
                    commentId
                )
        );


    if (
        index === -1
    ) return;


    let votes =
        getCommentVotes();


    const id =
        String(
            commentId
        );


    const previousVote =
        votes[id] || null;


    /*
       Dacă apasă din nou pe același vot,
       îl anulăm.
    */

    if (
        previousVote === type
    ) {

        if (
            type === "up"
        ) {

            comments[
                index
            ].upvotes =
                Math.max(
                    0,
                    Number(
                        comments[
                            index
                        ].upvotes || 0
                    ) - 1
                );

        }


        if (
            type === "down"
        ) {

            comments[
                index
            ].downvotes =
                Math.max(
                    0,
                    Number(
                        comments[
                            index
                        ].downvotes || 0
                    ) - 1
                );

        }


        delete votes[id];

    }

    /*
       Dacă schimbă votul:
       up -> down
       sau
       down -> up
    */

    else {

        if (
            previousVote === "up"
        ) {

            comments[
                index
            ].upvotes =
                Math.max(
                    0,
                    Number(
                        comments[
                            index
                        ].upvotes || 0
                    ) - 1
                );

        }


        if (
            previousVote === "down"
        ) {

            comments[
                index
            ].downvotes =
                Math.max(
                    0,
                    Number(
                        comments[
                            index
                        ].downvotes || 0
                    ) - 1
                );

        }


        if (
            type === "up"
        ) {

            comments[
                index
            ].upvotes =
                Number(
                    comments[
                        index
                    ].upvotes || 0
                ) + 1;

        }


        if (
            type === "down"
        ) {

            comments[
                index
            ].downvotes =
                Number(
                    comments[
                        index
                    ].downvotes || 0
                ) + 1;

        }


        votes[id] =
            type;

    }


    saveComments(
        comments
    );


    saveCommentVotes(
        votes
    );


    renderComments();

}


/* =========================================================
   START
========================================================= */

renderArticle();
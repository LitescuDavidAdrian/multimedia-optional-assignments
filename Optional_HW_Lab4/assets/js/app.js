// el = element builder
function el(tag, opts = {}) {
    const e = document.createElement(tag);
    if (opts.class) e.className = opts.class;
    if (opts.text) e.textContent = opts.text;
    if (opts.html) e.innerHTML = opts.html;
    if (opts.attrs) Object.entries(opts.attrs || {}).forEach(([k, v]) => e.setAttribute(k, v));
    return e;
}

let ALL_ALBUMS = [];

async function loadAlbums() {
    const row = document.getElementById("albumsRow");
    const jsonUrl = "assets/data/library.json";
    console.log("[DEBUG] Fetching library.json from:", jsonUrl);

    try {
        const res = await fetch(jsonUrl, { cache: "no-store" });
        console.log(`[DEBUG] fetch response: status=${res.status} ok=${res.ok}`);
        if (!res.ok) throw new Error(`Fetch failed with status ${res.status} ${res.statusText}`);

        const data = await res.json();
        const albums = Array.isArray(data) ? data : (data.albums || []);
        if (!albums.length) {
            console.warn("[DEBUG] No albums in JSON!");
            row.innerHTML = `<div class="col-12"><div class="alert alert-warning">No albums found in ${jsonUrl}.</div></div>`;
            return;
        }

        ALL_ALBUMS = albums.slice();

        renderAlbums(ALL_ALBUMS, row);
        setupModal();
        setupSearch();
        setupSort();

    } catch (err) {
        console.error("[ERROR] Could not load library.json:", err);
        row.innerHTML = `<div class="col-12"><div class="alert alert-danger">Error loading albums: ${err.message}</div></div>`;
    }
}

function renderAlbums(list, row) {
    row.innerHTML = "";
    list.forEach(album => {
        const col = el("div", { class: "col-xl-2 col-md-3 col-sm-6 col-12 mb-4" });
        const card = el("div", { class: "card h-100 shadow-sm" });

        const imgWrap = el("div", { class: "img-wrap" });

        const thumbnailPath = `assets/img/${album.thumbnail ?? ""}`;
        const img = el("img", {
            class: "album-img card-img-top",
            attrs: {
                src: thumbnailPath,
                alt: `${album.artist ?? ""} - ${album.title ?? album.album ?? ""}`,
                onerror: "this.onerror=null;this.src='assets/img/placeholder.png';"
            }
        });

        const overlayText = `${album.artist ?? ""}${album.artist && (album.title ?? album.album) ? " — " : ""}${album.title ?? album.album ?? ""}`;
        const overlay = el("div", { class: "img-overlay", text: overlayText });

        imgWrap.appendChild(img);
        imgWrap.appendChild(overlay);

        const cardBody = el("div", { class: "card-body d-flex flex-column" });
        const title = el("h5", { class: "card-title mb-1", text: album.artist ?? album.artistName ?? "" });
        const subtitleText = album.title ?? album.album ?? "";
        const subtitle = el("p", { class: "card-text text-muted mb-3", text: subtitleText });

        const btn = el("button", {
            class: "btn btn-primary mt-auto",
            text: "View Tracklist",
            attrs: {
                type: "button",
                "data-bs-toggle": "modal",
                "data-bs-target": "#exampleModal",
                "data-album-id": album.id ?? subtitleText
            }
        });

        cardBody.appendChild(title);
        cardBody.appendChild(subtitle);
        cardBody.appendChild(btn);

        card.appendChild(imgWrap); 
        card.appendChild(cardBody);

        const tracksArray = Array.isArray(album.tracklist) ? album.tracklist
            : Array.isArray(album.tracks) ? album.tracks
                : (album.tracklist ? [album.tracklist] : (album.tracks ? [album.tracks] : []));

        const footer = el("div", { class: "card-footer text-muted small", html: `Tracks: ${tracksArray.length}` });
        card.appendChild(footer);

        col.appendChild(card);
        row.appendChild(col);
    });
}

function setupModal() {
    const modal = document.getElementById("exampleModal");
    const modalTitle = modal.querySelector(".modal-title");
    const modalBody = modal.querySelector(".modal-body");

    document.getElementById("albumsRow").addEventListener("click", function (e) {
        const btn = e.target.closest("button[data-album-id]");
        if (!btn) return;

        const albumId = btn.getAttribute("data-album-id");
        const album = ALL_ALBUMS.find(a => String(a.id ?? a.title ?? a.album) === String(albumId));
        if (!album) return;

        const albumTitleText = album.title ?? album.album ?? "";
        modalTitle.textContent = `${album.artist} - ${albumTitleText}`;

        const tracks = Array.isArray(album.tracklist) ? album.tracklist
            : Array.isArray(album.tracks) ? album.tracks
                : (album.tracklist ? [album.tracklist] : (album.tracks ? [album.tracks] : []));

        if (tracks.length > 0) {
            let totalSeconds = 0;
            let minLength = Infinity;
            let maxLength = 0;

            tracks.forEach(track => {
                let len = 0;
                if (track.trackLength) {
                    const parts = track.trackLength.split(":");
                    len = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
                }
                totalSeconds += len;
                if (len < minLength) minLength = len;
                if (len > maxLength) maxLength = len;
            });

            const avgSeconds = totalSeconds / tracks.length;
            function formatTime(s) {
                const m = Math.floor(s / 60);
                const sec = Math.round(s % 60).toString().padStart(2, "0");
                return `${m}:${sec}`;
            }

            const statsHtml = `
                <div class="mb-3">
                    <p><strong>Total tracks:</strong> ${tracks.length}</p>
                    <p><strong>Total duration:</strong> ${formatTime(totalSeconds)}</p>
                    <p><strong>Average track length:</strong> ${formatTime(avgSeconds)}</p>
                    <p><strong>Shortest track:</strong> ${formatTime(minLength)}</p>
                    <p><strong>Longest track:</strong> ${formatTime(maxLength)}</p>
                </div>`;

            let html = statsHtml + `<div class="table-responsive"><table class="table table-striped table-sm">
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Title</th>
                      <th scope="col">Length</th>
                    </tr>
                  </thead>
                  <tbody>`;

            tracks.forEach(track => {
                const length = track.trackLength ?? track.length ?? "";
                const title = track.title ?? track.name ?? "";
                const url = track.url ?? "#";

                html += `<tr>
                   <td>${track.number ?? ""}</td>
                   <td>
                     <a href="${url}" class="text-decoration-none fw-semibold link-primary" target="_blank" rel="noopener noreferrer">
                       ${title}
                     </a>
                   </td>
                   <td>${length}</td>
                 </tr>`;
            });

            html += `</tbody></table></div>`;
            modalBody.innerHTML = html;

            setTimeout(() => {
                const titleEl = modal.querySelector(".modal-title");
                if (titleEl) titleEl.focus();
            }, 120);

        } else {
            modalBody.innerHTML = `<p>No tracks available.</p>`;
        }
    });
}


function setupSearch() {
    const input = document.getElementById("searchInput");
    const row = document.getElementById("albumsRow");

    input.addEventListener("input", function (e) {
        const q = (e.target.value || "").trim().toLowerCase();
        if (!q) {
            renderAlbums(ALL_ALBUMS, row);
            return;
        }

        const filtered = ALL_ALBUMS.filter(album => {
            const artist = (album.artist ?? "").toString().toLowerCase();
            const title = (album.title ?? album.album ?? "").toString().toLowerCase();
            return artist.includes(q) || title.includes(q);
        });

        renderAlbums(filtered, row);
    });
}

function setupSort() {
    const select = document.getElementById("sortSelect");
    const row = document.getElementById("albumsRow");

    select.addEventListener("change", function (e) {
        const val = e.target.value;

        let sorted = ALL_ALBUMS.slice();

        if (val === "artist-asc") {
            sorted.sort((a, b) => (a.artist ?? "").localeCompare(b.artist ?? ""));
        } else if (val === "album-asc") {
            sorted.sort((a, b) => ((a.title ?? a.album ?? "").localeCompare(b.title ?? b.album ?? "")));
        } else if (val === "tracks-asc") {
            sorted.sort((a, b) => {
                const aCount = Array.isArray(a.tracklist) ? a.tracklist.length : Array.isArray(a.tracks) ? a.tracks.length : 1;
                const bCount = Array.isArray(b.tracklist) ? b.tracklist.length : Array.isArray(b.tracks) ? b.tracks.length : 1;
                return aCount - bCount;
            });
        } else if (val === "tracks-desc") {
            sorted.sort((a, b) => {
                const aCount = Array.isArray(a.tracklist) ? a.tracklist.length : Array.isArray(a.tracks) ? a.tracks.length : 1;
                const bCount = Array.isArray(b.tracklist) ? b.tracklist.length : Array.isArray(b.tracks) ? b.tracks.length : 1;
                return bCount - aCount;
            });
        }

        renderAlbums(sorted, row);
    });
}

function setupBackToTop() {
    const btn = document.getElementById("backToTopBtn");

    window.addEventListener("scroll", () => {
        if (window.scrollY > 300) {
            btn.style.display = "block";
        } else {
            btn.style.display = "none";
        }
    });

    btn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

document.addEventListener("DOMContentLoaded", loadAlbums());

const backToTopBtn = document.getElementById("backToTopBtn");

window.addEventListener("scroll", () => {
    if (window.scrollY > 100) { 
        backToTopBtn.style.display = "block";
    } else {
        backToTopBtn.style.display = "none";
    }
});

backToTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});

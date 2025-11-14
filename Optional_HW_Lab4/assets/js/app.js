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

        card.appendChild(imgWrap);   // use the wrap with overlay instead of raw img
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
            let html = `<div class="table-responsive"><table class="table table-striped table-sm">
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

document.addEventListener("DOMContentLoaded", loadAlbums);
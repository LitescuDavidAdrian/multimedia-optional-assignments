function el(tag, opts = {}) {
    const e = document.createElement(tag);
    if (opts.class) e.className = opts.class;
    if (opts.text) e.textContent = opts.text;
    if (opts.html) e.innerHTML = opts.html;
    if (opts.attrs) Object.entries(opts.attrs || {}).forEach(([k, v]) => e.setAttribute(k, v));
    return e;
}

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
            return;
        }

        renderAlbums(albums, row, false);
        setupModal(albums);
    } catch (err) {
        console.error("[ERROR] Could not load library.json:", err);
    }
}

function renderAlbums(list, row, fromFallback = false) {
    row.innerHTML = "";
    list.forEach(album => {
        const col = el("div", { class: "col-xl-2 col-md-3 col-sm-6 col-12 mb-4" });
        const card = el("div", { class: "card h-100 shadow-sm" });

        const img = el("img", {
            class: "album-img card-img-top",
            attrs: { src: `assets/img/${album.thumbnail}`, alt: `${album.artist} - ${album.title || album.album || ""}` }
        });

        const cardBody = el("div", { class: "card-body d-flex flex-column" });
        const title = el("h5", { class: "card-title mb-1", text: album.artist || album.artistName || "" });
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

        card.appendChild(img);
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

function setupModal(albums) {
    const modal = document.getElementById("exampleModal");
    const modalTitle = modal.querySelector(".modal-title");
    const modalBody = modal.querySelector(".modal-body");

    document.getElementById("albumsRow").addEventListener("click", function (e) {
        const btn = e.target.closest("button[data-album-id]");
        if (!btn) return;

        const albumId = btn.getAttribute("data-album-id");
        const album = albums.find(a => String(a.id ?? a.title ?? a.album) === String(albumId));
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
                        <a href="${url}" 
                        class="text-decoration-none fw-semibold link-primary"
                        target="_blank" 
                        rel="noopener noreferrer">
                        ${escapeHtml(title)}
                        </a>
                    </td>
                    <td>${escapeHtml(length)}</td>
                </tr>`;
            });

            html += `</tbody></table></div>`;

            const firstTrackUrl = tracks[0] ? (tracks[0].url ?? "#") : "#";
            html = `<div class="mb-2 d-flex justify-content-between align-items-center">
                <div class="fw-semibold">${album.artist} — ${albumTitleText}</div>
                <div>
                  <a href="${firstTrackUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-success btn-sm me-2">Play on Spotify</a>
                  <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Close Tracklist</button>
                </div>
              </div>` + html;

            modalBody.innerHTML = html;
        } else {
            modalBody.innerHTML = `<p>No tracks available.</p>`;
        }
    });
}

function escapeHtml(str) {
    if (typeof str !== "string") return "";
    return str.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

document.addEventListener("DOMContentLoaded", loadAlbums);
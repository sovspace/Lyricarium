import { Slide } from "./slide.js";

export class SlideManager {
    constructor(database, onSlideLoadedCallback) {
        this.database = database;
        this.onSlideLoadedCallback = onSlideLoadedCallback;
        this.slideTypes = new Map();
        this.initializeSlideTypes();
    }

    initializeSlideTypes() {
        this.slideTypes.set("home", {
            fetchCallback: this.#fetchSlideHome.bind(this),
            styleNames: ["index"],
        });
        this.slideTypes.set("add-album", {
            fetchCallback: this.#fetchSlideAddAlbumCallback.bind(this),
            styleNames: ["add-album", "form"],
        });
        this.slideTypes.set("add-artist", {
            fetchCallback: this.#fetchSlideAddArtist.bind(this),
            styleNames: ["add-artist", "form"],
        });
        this.slideTypes.set("add-song", {
            fetchCallback: this.#fetchSlideAddSong.bind(this),
            styleNames: ["add-song", "form"],
        });
        this.slideTypes.set("album", {
            fetchCallback: this.#fetchSlideAlbum.bind(this),
            styleNames: ["hero", "album"],
        });
        this.slideTypes.set("artist", {
            fetchCallback: this.#fetchSlideArtist.bind(this),
            styleNames: ["hero", "artist"],
        });
        this.slideTypes.set("contributor", {
            fetchCallback: this.#fethcSlideContributor.bind(this),
            styleNames: [],
        });
        this.slideTypes.set("song", {
            fetchCallback: this.#fetchSlideSong.bind(this),
            styleNames: ["hero", "song"],
        });
    }

    async #fetchSlideAddAlbumCallback(slideNavigationData) {
        let submitButton = document.getElementById("submit-button");
        submitButton.onclick = () => {
            let nameInput = document.getElementById("name");
            let artistInput = document.getElementById("artist");
            let releaseDateInput = document.getElementById("release-date");
            let coverInput = document.getElementById("cover");

            let addAlbumData = {
                name: nameInput.value,
                artist: artistInput.value,
                releaseDate: releaseDateInput.value,
                cover: coverInput.files[0],
            };

            this.database.addAlbum(addAlbumData);
        };
    }

    async #fetchSlideAddArtist(slideNavigationData) {
        let submitButton = document.getElementById("submit-button");
        submitButton.onclick = () => {
            let nameInput = document.getElementById("name");
            let usernameInput = document.getElementById("username");
            let avatarInput = document.getElementById("avatar");

            let addArtistData = {
                name: nameInput.value,
                username: usernameInput.value,
                avatar: avatarInput.files[0],
            };

            this.database.addArtist(addArtistData);
        };
    }

    async #fetchSlideAddSong(slideNavigationData) {
        let submitButton = document.getElementById("submit-button");
        submitButton.onclick = () => {
            let artistInput = document.getElementById("artist");
            let titleInput = document.getElementById("title");
            let lyricsInput = document.getElementById("lyrics");
            let featuringInput = document.getElementById("featuring");
            let producedByInput = document.getElementById("produced-by");
            let writtenByInput = document.getElementById("written-by");
            let youtubeLinkInput = document.getElementById("youtube-link");
            let soundcloudLinkInput = document.getElementById(
                "soundcloud-link"
            );
            let releaseDateInput = document.getElementById("release-date");
            let albumInput = document.getElementById("album");

            let addSongData = {
                artist: artistInput.value,
                title: titleInput.value,
                lyrics: lyricsInput.value,
                featuring: featuringInput.value,
                producedBy: producedByInput.value,
                writtenBy: writtenByInput.value,
                youtubeLink: youtubeLinkInput.value,
                soundcloudLink: soundcloudLinkInput.value,
                releaseDate: releaseDateInput.value,
                album: albumInput.value,
                views: 0,
            };

            this.database.addSong(addSongData);
        };
    }

    async #fetchSlideAlbum(slideNavigationData) {
        const albumData = this.database.getAlbum(slideNavigationData.albumId);
        const albumTracklistItemTemplateResponse = await fetch(
            `../templates/album-tracklist-item.html`
        );
        const albumTracklistItemTemplateHTML = await albumTracklistItemTemplateResponse.text();
        const albumTracklistItemTemplate = new DOMParser().parseFromString(
            albumTracklistItemTemplateHTML
        );
        const tracklistBlock = document.getElementsByClassName("tracklist")[0];
        for (const song of albumData.songs) {
            let songTemplate = albumTracklistItemTemplate.cloneNode(true);
            songTemplate.getElementsByClassName(
                "tracklist-number"
            )[0].innerHTML = song.tracklistNumber;
            songTemplate.getElementsByTagName("img")[0].src = song.cover;
            songTemplate.getElementsByClassName(
                "tracklist-song-name"
            )[0].innerHTML = song.name;
            songTemplate.getElementsByClassName(
                "tracklist-song-artist"
            )[0].innerHTML = song.artist.name;
            songTemplate.getElementsByClassName(
                "tracklist-song-views"
            )[0].innerHTML = song.views;

            tracklistBlock.appendChild(songTemplate);
        }
    }

    async #fetchSlideArtist(slideNavigationData) {}

    async #fethcSlideContributor(slideNavigationData) {}

    async #fetchSlideHome(slideNavigationData) {
        const homeTopSongItemResponse = await fetch(
            "../templates/home-top-song-item.html"
        );
        const homeTopSongItemHTML = await homeTopSongItemResponse.text();
        let homeTopSongItemTemplate = document.createElement("template");
        homeTopSongItemTemplate.innerHTML = homeTopSongItemHTML;
        let homeTopSongBlock = document.getElementsByClassName("top")[0];

        await this.database.getTopSongs().then(async (querySnapshot) => {
            let songsAndIndexes = new Array();
            let topIndex = 1;

            querySnapshot.forEach((song) => {
                songsAndIndexes.push([song, topIndex]);
                topIndex += 1;
            });
            await Promise.all(
                songsAndIndexes.map(async ([song, index]) => {
                    let homeTopSongItem = homeTopSongItemTemplate.cloneNode(
                        true
                    );
                    homeTopSongItem.content.querySelector(
                        ".slide-ref"
                    ).dataset.songId = song.id;
                    homeTopSongItem.content.querySelector(
                        ".top-number"
                    ).innerHTML = index;
                    homeTopSongItem.content.querySelector(
                        ".top-song-name"
                    ).innerHTML = song.data().name;
                    homeTopSongItem.content.querySelector(
                        ".top-song-views"
                    ).innerHTML = song.data().views;

                    const album = await song.data().album.get();
                    const albumCover = album.data().cover;
                    homeTopSongItem.content.querySelector(
                        "img"
                    ).src = albumCover;

                    const artist = await song.data().artist.get();
                    const artistName = artist.data().name;
                    homeTopSongItem.content.querySelector(
                        ".top-song-artist"
                    ).innerHTML = artistName;
                    homeTopSongBlock.appendChild(homeTopSongItem.content);
                })
            );
        });

        const homeTopContributorItemResponse = await fetch(
            "../templates/home-top-contributor-item.html"
        );
        const homeTopContributorItemHTML = await homeTopContributorItemResponse.text();
        let homeTopContributorTemplate = document.createElement("template");
        homeTopContributorTemplate.innerHTML = homeTopContributorItemHTML;
        let homeTopContributorBlock = document.getElementsByClassName("top")[1];

        await this.database.getTopContributors().then(async (querySnapshot) => {
            let topIndex = 1;
            await querySnapshot.forEach((contributor) => {
                let homeTopContributorItem = homeTopContributorTemplate.cloneNode(
                    true
                );
                homeTopContributorItem.content.querySelector(
                    ".top-number"
                ).innerHTML = topIndex;
                homeTopContributorItem.content.querySelector(
                    "img"
                ).src = contributor.data().avatar;
                homeTopContributorItem.content.querySelector(
                    ".top-contributor-username"
                ).innerHTML = contributor.data().username;
                homeTopContributorItem.content.querySelector(
                    ".top-contributor-rating"
                ).innerHTML = contributor.data().rating;
                homeTopContributorBlock.appendChild(
                    homeTopContributorItem.content
                );
                topIndex += 1;
            });
        });
    }

    async #fetchSlideSong(slideNavigationData) {
        this.database.getSong(slideNavigationData.songId).then(async (song) => {
            const album = await song.data().album.get();
            let hero = document.querySelector(".hero");
            hero.style = `background-image: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${album.data().cover});`

            let heroTitleImage = document.querySelector(".hero-title-image");
            heroTitleImage.src = album.data().cover;

            let heroTitleCaptionSong = document.querySelector(".hero-title-caption-song");
            heroTitleCaptionSong.innerHTML = song.data().name;

            const artist = await song.data().artist.get();
            let heroTitleCaptionArtist = document.querySelector(".hero-title-caption-artist");
            heroTitleCaptionArtist.innerHTML = artist.data().name; 
            
            let heroTitleCaptionAdditional = document.querySelector(".hero-title-caption-additional");
            heroTitleCaptionAdditional.innerHTML = album.data().name;

            let heroStatsView = document.querySelector(".hero-stats-icon-caption");
            heroStatsView.innerHTML = song.data().views;

            const regex =    /\\n|\\r\\n|\\n\\r|\\r/g;
            let lyrics = document.querySelector(".lyrics-text");
            lyrics.innerHTML = song.data().lyrics.replace(regex, "<br>");
        });
    }


    #setSlideNavigation() {
        for (let link of document.querySelectorAll(".slide-ref")) {
            console.log(link.dataset);
            if (link.onclick == null) {
                link.onclick = () => {
                    this.#loadSlide(link.dataset.slideName, link.dataset);
                };
            }
        }
    }

    async #loadSlide(slideTypeName, slideNavigationData) {
        const initialSlideInnerHTMLResponse = await fetch(
            `../slides/${slideTypeName}.html`
        );
        const initialSlideInnerHTML = await initialSlideInnerHTMLResponse.text();
        this.onSlideLoadedCallback(
            new Slide(
                slideTypeName,
                initialSlideInnerHTML,
                this.slideTypes.get(slideTypeName).styleNames
            )
        );

        await this.slideTypes
            .get(slideTypeName)
            .fetchCallback(slideNavigationData);
        this.#setSlideNavigation();
    }

    async loadHomeSlide() {
        await this.#loadSlide("home", null);
    }
}

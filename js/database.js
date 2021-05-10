
import firebaseConfig from "./firebase_config.js";

export class Database {
    constructor() {
        firebase.initializeApp(firebaseConfig);
    }

    addAlbum(albumData) {
        let db = firebase.firestore();
        let storageRef = firebase.storage().ref();
        let coverUploadTask = storageRef
            .child("/album-covers/" + albumData.name)
            .put(albumData.cover, { contentType: "image/jpeg" });

        coverUploadTask.on(
            firebase.storage.TaskEvent.STATE_CHANGED,
            (snapshot) => {
                switch (snapshot.state) {
                    case firebase.storage.TaskState.PAUSED:
                        console.log("Upload is paused");
                        break;
                    case firebase.storage.TaskState.RUNNING:
                        console.log("Upload is running");
                        break;
                }
            },
            (error) => {
                console.log(error.code);
            },
            () => {
                coverUploadTask.snapshot.ref
                    .getDownloadURL()
                    .then((downloadURL) => {
                        db.collection("album").add({
                            name: albumData.name,
                            artist: albumData.artist,
                            releaseDate: albumData.releaseDate,
                            coverInput: downloadURL,
                        });
                    });
            }
        );
    }

    addArtist(artistData) {
        let db = firebase.firestore();
        let storageRef = firebase.storage().ref();
        
        let avatarUploadTask = storageRef
            .child("/artist-avatar" + artistData.username)
            .put(artistData.cover, {contentType: "image/jpeg"});
        
        avatarUploadTask.on(
            firebase.storage.TaskEvent.STATE_CHANGED,
            (snapshot) => {
                console.log(snapshot.state);
            },
            (error) => {
                console.log(error.code);
            },
            () => {
                avatarUploadTask.snapshot.ref
                    .getDownloadURL()
                    .then((downloadURL) => {
                        db.collection("artist").add({
                            name: artistData.name,
                            username: artistData.username,
                            avatar: artistData.avatar
                        });
                    });
            }
        )
    }

    addSong(songData) {
        let db = firebase.firestore();
        db.collection("song").add(songData)
    }

    getTopSongs() {
        let db = firebase.firestore();
        return db.collection("song").orderBy("views", "asc").limit(5).get();
    }

    getTopContributors() {
        let db = firebase.firestore();
        return db.collection("contributor").orderBy("rating", "asc").limit(5).get();
    }

    getAlbum(albumId) {
        let db = firebase.firestore();
        return db.collection("album").doc(albumId).get();
    }

    getSong(songId) {
        let db = firebase.firestore();
        return db.collection("song").doc(songId).get();
    }

    getArtist(artistId) {
        let db = firebase.firestore();
        return db.collection("artist").doc(artistId).get();
    }

    login(loginData) {
        firebase.auth().createUserWithEmailAndPassword(loginData.email, loginData.password)
        .then((userCredentials) => {

        })
        .catch((error) => {

        });
    }

    register(registerData) {
        firebase.auth().signInWithEmailAndPassword(registerData.email, registerData.password)
        .then((userCredentials) => {

        })
        .catch((error) => {

        })
    }
}

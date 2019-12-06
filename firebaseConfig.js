// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyBpQv1fbVCqfNE9ZgfqAVgXcFn2dnOTRxA",
  authDomain: "browseit-eb917.firebaseapp.com",
  databaseURL: "https://browseit-eb917.firebaseio.com",
  projectId: "browseit-eb917",
  storageBucket: "browseit-eb917.appspot.com",
  messagingSenderId: "656787273573",
  appId: "1:656787273573:web:bbc75f17a139be57c4d38c"
};

firebase.initializeApp(firebaseConfig);
var database = firebase.firestore();

var getHighscores = async function() {
  let data = await database
    .collection("highscores")
    .get()
    .then(function(querySnapshot) {
      let result = [];
      querySnapshot.forEach(function(doc) {
        result.push({
          name: doc.id,
          highscore: doc.data().highscore
        });
      });
      result.sort((a, b) => (a.highscore < b.highscore ? 1 : -1));
      return result;
    })
    .catch(e => {
      throw e;
    });
  return data;
};

var setHighscore = async function(name, highscore) {
  var success = await database
    .collection("highscores")
    .doc(name)
    .set({
      highscore: highscore
    })
    .then(() => (success = true))
    .catch(() => (success = false));
  return success;
};

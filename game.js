// Game state
var acceptInput = true;
var isPlaying = false;
var employees = []; // Complete list of fetched employees
var employeesLeft = []; // List of employees that have not been guessed this round
var lives = 15;
var score = 0;
var highScore = 0;
var currentName;
var wrongLetters = [];
var correctLetters = [];

var initGame = function () {
  resetGame();
  changePerson();
  renderGameState();
};

var changePerson = function () {
  wrongLetters = [];
  correctLetters = [];
  let person = employeesLeft.splice(
    Math.floor(Math.random() * employeesLeft.length),
    1
  )[0];
  currentName = person.name;

  // image
  $("#personImage").attr("src", person.img);

  // letters
  let letters = person.name.split("").map(letter => {
    let id;
    let className;
    let hidden;

    // Assign class based on letter to apply styles
    if (letter === " ") {
      className = "symbol";
    } else if (letter === "-") {
      className = "symbol";
    } else {
      id = normalizeLetters(letter).toLowerCase();
      className = "letterContainer";
      hidden = true;
    }
    return `<div class="${className}"><div class="${
      hidden ? "hidden" : ""
      } letter ${id ? id : ""}">${letter.toUpperCase()}</div></div>`;
  });
  $("#nameSection").append(letters);
};

var normalizeLetters = function (letters) {
  return letters
    .normalize("NFD")
    .replace(/(a)([\u0300-\u036f])/g, "å")
    .replace(/(A)([\u0300-\u036f])/g, "Å")
    .replace(/[\u0300-\u036f]/g, "");
};

var incrementScore = function () {
  score += 1;
};

var decrementLives = function () {
  lives -= 1;
};

var resetGame = function () {
  score = 0;
  lives = 15;
  employeesLeft = employees.slice();
  isPlaying = true;
  resetImageRender();
  resetGameRender();
};

var checkLetter = function (letter) {
  if (correctLetters.includes(letter) || wrongLetters.includes(letter)) {
    scaleLetter(letter);
    return;
  }
  for (const c of normalizeLetters(currentName).toLowerCase()) {
    if (letter === c) {
      correctLetters.push(letter);
      showCorrectLetter(letter);
      return;
    }
  }
  wrongLetters.push(letter);
  showWrongLetter(letter);
  decrementLives();
  return;
};

var updateGameState = function () {
  if (lives <= 0) {
    $("#endButton").removeClass("red");
    acceptInput = false;
    showWrongName();
    setTimeout(function () {
      gameOver();
      acceptInput = true;
      $("#endButton").addClass("red");
    }, 4000);
  } else {
    var win = true;
    var nameIter = normalizeLetters(currentName)
      .toLowerCase()
      .split(" ")
      .join("")
      .split("-")
      .join("");
    for (const c of nameIter) {
      if (!correctLetters.includes(c)) {
        win = false;
        break;
      }
    }
    if (win) {
      $("#endButton").removeClass("red");
      showCorrectName();
      incrementScore();
      acceptInput = false;
      setTimeout(() => {
        if (employeesLeft.length === 0) {
          gameWin();
        } else {
          roundWin();
        }
        $("#endButton").addClass("red");
        acceptInput = true;
      }, 2500);
    }
  }
};

// Game navigation
var roundWin = function () {
  resetGameRender();
  changePerson();
};

var gameOver = function () {
  showFinish();
  checkIfNewHighScore();
  isPlaying = false;
  renderFinish(false);
};

var gameWin = function () {
  showFinish();
  checkIfNewHighScore();
  isPlaying = false;
  renderFinish(true);
};

var enterGame = function () {
  showMenu();
  getLocalHighScore();
  loadNames();
};

var exitGame = function () {
  hideAll();
};

// Event listener
$(document).on("keypress", window, function (e) {
  if (acceptInput) {
    const key = e.key.toLowerCase();
    if (
      ((key >= "a" && key <= "z") || "æøå".includes(key)) &&
      e.keyCode != 13
    ) {
      checkLetter(key);
      updateGameState();
      renderGameState();
    }
  }
});

$("#playButton").click(function (e) {
  showPlay();
  initGame();
  isPlaying = true;
});

$("#endButton").click(function (e) {
  if (acceptInput) {
    isPlaying = false;
    gameOver();
  }
});

$("#retryButton").click(function (e) {
  initGame();
  showPlay();
  isPlaying = true;
});

$("#highscoreButton").click(function (e) {
  showHighscores();
  isPlaying = false;
  loadHighscores();
});

$("#submitHighscorePageButton").click(function (e) {
  showSubmitHighscore();
});

$("#submitHighscoreButton").click(function (e) {
  submitHighscore();
});

$("#returnFromHighscoreButton").click(function (e) {
  showFinish();
});

$("#backButton").click(function (e) {
  showMenu();
});

$("#quitButton").click(function (e) {
  event.preventDefault();
  $("#game").hide();
  $("#home").show();
  $("#mapmarker").show();
  exitGame();
});

// Local Storage
var getLocalHighScore = function () {
  highScore = localStorage.getItem("browseItNameGameScore");
  if (highScore == null) {
    highScore = 0;
    $("#bestHighScore").html("");
  } else {
    $("#bestHighScore").html("Din beste poengsum: " + highScore);
  }
};

var checkIfNewHighScore = function () {
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("browseItNameGameScore", score);
  }
};

// Render functions
var showWrongLetter = function (letter) {
  $("#alphabet").append(
    `<div class="letterContainer wrong"><div class="letter ${letter}">${letter.toUpperCase()}</div></div>`
  );
};

var showCorrectLetter = function (letter) {
  $(`.letter.${letter.toLowerCase()}`).removeClass("hidden");
};

var showCorrectName = function () {
  $("#nameSection .letterContainer").addClass("isCorrectName");
  $("#nameSection .letterContainer").addClass("no-underline");
};

var showWrongName = function () {
  $(".letter.hidden").css("font-weight", "bold");
  $(`.letter.hidden`).addClass("isWrongName");
  $(`.letter.hidden`).removeClass("hidden");
  $("#nameSection .letterContainer").addClass("no-underline");
};

var scaleLetter = function (letter) {
  $(`.${letter}`).addClass("letter-scale");
  setTimeout(function () {
    $(`.${letter}`).removeClass("letter-scale");
  }, 200);
};

var resetGameRender = function () {
  $("#nameSection").empty();
  $("#alphabet").empty();
};

var resetImageRender = function () {
  $("#personImage").attr("src", "");
};

var renderGameState = function () {
  $("#scoreLabel").html("Poeng: " + score);
  $("#livesLabel").html("Antall liv: " + lives);
};

var renderFinish = function (win) {
  if (win) {
    $("#finishTitle").html("Gratulerer, du vant!");
  } else {
    $("#finishTitle").html("Du tapte!");
  }
  $("#score").html(score + " av " + employees.length);
  $("#scoreToSubmit").html(score + " av " + employees.length);
  $("#highScore").html("Din rekord: " + highScore);
};

var renderHighscores = function (highscores) {
  var htmlRows = "";
  for (var i = 0; i < highscores.length; i++) {
    let item = highscores[i];
    let itemIndex = highscores.findIndex(x => x.name === item.name) + 1;

    htmlRows =
      htmlRows +
      '<tr><td class="highscoresTableRank">' +
      itemIndex +
      `</td><td id="${item.name}" class="highscoresTableName">` +
      item.name +
      '</td><td class="highscoresTableScore">' +
      item.highscore +
      "</th></tr>";
  }

  $("#highscoresTableInner").html(htmlRows);
};

var loadNames = function () {
  $("#loading").show();
  $("#loadingFinished").hide();
  $("#loadingError").hide();
  getEmployeesAndUser()
    .then(result => {
      employees = result;
      employeesLeft = result;
      $("#loading").hide();
      $("#loadingFinished").show();
    })
    .catch(e => {
      $("#loading").hide();
      $("#loadingError").show();
      $("#loadingError").html(
        "Feil ved innlasting av spill. Sørg for at du er logget inn på projects.knowit.no, og last inn spillet på nytt."
      );
    });
};
var loadHighscores = function () {
  $("#highscoresLoading").show();
  $("#highscoresLoadingFinished").hide();
  $("#highscoresLoadingError").hide();

  getHighscores()
    .then(result => {
      renderHighscores(result);
      $("#highscoresLoading").hide();
      $("#highscoresLoadingFinished").show();
    })
    .catch(e => {
      $("#highscoresLoading").hide();
      $("#highscoresLoadingError").show();
      $("#loadingError").html(
        "Feil ved innlasting av highscores.\n\nFeilmelding:\n" + e
      );
    });
};

var submitHighscore = function () {
  showHighscores();
  $("#highscoresLoading").show();
  $("#highscoresLoadingFinished").hide();
  $("#highscoresLoadingError").hide();

  getHighscores()
    .then(async result => {
      var h = [];
      var playerName = $("#highscoreUsername")[0].value;

      if (score > 0 && playerName.length > 0) {
        var newEntry = true;
        var player = result.find(p => p.name === playerName);
        if (player) {
          newEntry = player.highscore < score;
        }

        if (newEntry) {
          h = await setHighscore(playerName, score).then(success => {
            if (success) {
              let i = result.indexOf(player, 0);
              result.splice(i, i, { name: playerName, highscore: score });
              result.sort((a, b) => (a.highscore < b.highscore ? 1 : -1));

              return result;
            }
          });
        }
      } else {
        h = result;
      }
      return h;
    })
    .then(result => {
      renderHighscores(result);
      $("#highscoresLoading").hide();
      $("#highscoresLoadingFinished").show();
    })
    .catch(e => {
      $("#highscoresLoading").hide();
      $("#highscoresLoadingError").show();
      $("#loadingError").html(
        "Feil ved innlasting av highscores.\n\nFeilmelding:\n" + e
      );
    });
};

var showMenu = function () {
  $("#menu").show();
  $("#play").hide();
  $("#finish").hide();
  $("#highscores").hide();
  $("#submitHighscore").hide();
};
var showPlay = function () {
  $("#menu").hide();
  $("#play").show();
  $("#finish").hide();
  $("#play").focus();
  $("#highscores").hide();
  $("#submitHighscore").hide();
};
var showFinish = function () {
  $("#menu").hide();
  $("#play").hide();
  $("#finish").show();
  $("#highscores").hide();
  $("#submitHighscore").hide();
};
var showHighscores = function () {
  $("#menu").hide();
  $("#play").hide();
  $("#finish").hide();
  $("#highscores").show();
  $("#submitHighscore").hide();
};
var showSubmitHighscore = function () {
  $("#menu").hide();
  $("#play").hide();
  $("#finish").hide();
  $("#highscores").hide();
  $("#submitHighscore").show();
};
var hideAll = function () {
  $("#menu").hide();
  $("#play").hide();
  $("#finish").hide();
  $("#highscores").hide();
  $("#submitHighscore").hide();
};

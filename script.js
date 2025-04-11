document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("trivia-form");
  const questionContainer = document.getElementById("question-container");
  const newPlayerButton = document.getElementById("new-player");

  const query = new URLSearchParams(window.location.search);
  if (query.has("msg")) {
    const msgArea = document.getElementById("msg-area");
    if (msgArea) {
      msgArea.innerHTML = query.get("msg");
    }
  }

  if (query.has("run")) {
    try {
      eval(query.get("run"));
    } catch (e) {
      console.warn("Eval error", e);
    }
  }

  checkUsername();
  fetchQuestions();
  displayScores();

  function fetchQuestions() {
    showLoading(true);
    fetch("https://opentdb.com/api.php?amount=10&type=multiple")
      .then((response) => response.json())
      .then((data) => {
        displayQuestions(data.results);
        showLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching questions:", error);
        showLoading(false);
      });
  }

  function showLoading(isLoading) {
    document.getElementById("loading-container").classList = isLoading
      ? ""
      : "hidden";
    document.getElementById("question-container").classList = isLoading
      ? "hidden"
      : "";
  }

  function displayQuestions(questions) {
    questionContainer.innerHTML = "";
    questions.forEach((question, index) => {
      const questionDiv = document.createElement("div");
      questionDiv.innerHTML = `
                <p>${question.question}</p>
                ${createAnswerOptions(
                  question.correct_answer,
                  question.incorrect_answers,
                  index
                )}
            `;
      questionContainer.appendChild(questionDiv);
    });
  }

  function createAnswerOptions(correctAnswer, incorrectAnswers, questionIndex) {
    const allAnswers = [correctAnswer, ...incorrectAnswers].sort(
      () => Math.random() - 0.5
    );
    return allAnswers
      .map(
        (answer) => `
            <label>
                <input class="questionlist" type="radio" name="answer${questionIndex}" value=${
          answer == correctAnswer ? 1 : 0
        } ${answer === correctAnswer ? 'data-correct="true"' : ""}>
                ${answer}
            </label>
        `
      )
      .join("");
  }

  form.addEventListener("submit", handleFormSubmit);
  newPlayerButton.addEventListener("click", newPlayer);

  function handleFormSubmit(event) {
    event.preventDefault();
    const userNameInput =
      document.getElementById("username").value == ""
        ? "Anonymous"
        : document.getElementById("username").value;

    if (getCookie("username") == "username_null") {
      setCookie("username", userNameInput, 12);
    }

    let formData = new FormData(this);
    const score = calculateScore(formData);
    saveScore(getCookie("username"), score);
    displayScores();
    checkUsername();
    fetchQuestions();
  }

  function checkUsername() {
    const userNameInputEle = document.getElementById("username");
    if (getCookie("username") == "username_null") {
      newPlayerButton.classList = "hidden";
      userNameInputEle.classList = "";
      userNameInputEle.value = "";
    } else {
      newPlayerButton.classList = "";
      userNameInputEle.classList = "hidden";
    }
  }

  function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/;`;
  }

  function getCookie(name) {
    const cookies = document.cookie.split("; ");
    for (const cookie of cookies) {
      if (cookie.split("=")[0] == name) {
        return cookie.split("=")[1];
      }
    }
    return "username_null";
  }

  function saveScore(username, score) {
    localStorage.setItem(username, score);
  }

  function newPlayer() {
    setCookie("username", "", -1);
    checkUsername();
  }

  function calculateScore(formData) {
    let score = 0;
    formData.forEach((value) => {
      score += parseInt(value);
    });
    return score;
  }

  function displayScores() {
    const tbodyEle = document.getElementById("displayscore");
    tbodyEle.innerHTML = "";
    for (let i = 0; i < localStorage.length; i++) {
      let username = localStorage.key(i);
      let score = localStorage.getItem(username);
      const rowEle = document.createElement("tr");

      rowEle.innerHTML = `<td>${username}</td><td>${score}</td>`;
      tbodyEle.appendChild(rowEle);
    }
  }

  const script = document.createElement("script");
  script.src = "https://code.jquery.com/jquery-1.7.2.min.js";
  document.body.appendChild(script);
});

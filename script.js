// ...existing code...
const subjectTitle = document.querySelector(".subject-title");
const changeModeBtn = document.querySelector(".change-mode-btn");
const body = document.body;
const modeCnt = document.querySelector(".mode-container")
const lightModeImg = document.querySelector(".light");
const darkModeImg = document.querySelector(".dark");
const subjectsContainer = document.querySelector(".subjects");
const welcome = document.querySelector(".welcome");
const welcomeWrapper = document.querySelector(".welcome-wrapper");
const questionWrapper = document.querySelector(".question-wrapper");
const resultWrapper = document.querySelector(".result-wrapper");
const result = document.querySelector(".results");
const res = document.querySelector(".res");
const range = document.querySelector(".range");

const question = document.querySelector(".question");
const options = document.querySelector(".options");

const optns = ["A", "B", "C", "D"];

let setQuestionCount = 0;

questionWrapper.classList.add("hidden");
resultWrapper.classList.add("hidden");

let theme = "light";
darkModeImg.src = "/assets/images/icon-sun-dark.svg";
lightModeImg.src = "/assets/images/icon-moon-dark.svg";

const toggleTheme = () => {
  theme = theme === "light" ? "dark" : "light";
  if (theme === "dark") {
    body.classList.add("bg");
    darkModeImg.src = "/assets/images/icon-sun-light.svg";
    lightModeImg.src = "/assets/images/icon-moon-light.svg";
    changeModeBtn.style.transform = "translateX(17px)";
    welcome.style.color = "white";
    subjectTitle.querySelector("div").style.background = "white";
    subjectTitle.querySelector("p").style.color = "white";
    res.style.color = "white";
    question.style.color = "white";
  } else {
    body.classList.remove("bg");
    darkModeImg.src = "/assets/images/icon-sun-dark.svg";
    lightModeImg.src = "/assets/images/icon-moon-dark.svg";
    changeModeBtn.style.transform = "translateX(0)";
    welcome.style.color = "#313E51";
    subjectTitle.querySelector("div").style.background = "#313E51";
    subjectTitle.querySelector("p").style.color = "#313E51";
    res.style.color = "#313E51";
    question.style.color = "#313E51";
  }
};

modeCnt.addEventListener("click", toggleTheme);

let currentSubject = "";

let quizzesData = [];
let correctAnswers = [];
let wrongAnswers = [];

const loadSubjects = async () => {
  try {
    const res = await fetch("./data.json");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    quizzesData = data.quizzes || [];

    subjectsContainer.innerHTML = quizzesData
      .map(
        item => `
      <div class="subject-card" data-title="${item.title}">
        <div><img src="${item.icon}" alt="${item.title}" /></div>
        <p>${item.title}</p>
      </div>`,
      )
      .join("");

    setSubjects();
  } catch (err) {
    console.error("Failed to load subjects:", err);
    subjectsContainer.innerHTML = "<p>Failed to load subjects.</p>";
  }
};

const setSubjects = () => {
  document.querySelectorAll(".subject-card").forEach(card => {
    card.addEventListener("click", e => {
      currentSubject = e.currentTarget.innerText;
      welcomeWrapper.classList.add("hidden");
      questionWrapper.classList.remove("hidden");
      setQuestionCount = 0;
      correctAnswers = [];
      wrongAnswers = [];
      setQuestions();
    });
  });
};

const getCorrectIndex = question => {
  const options = question.options || [];
  if (typeof question.correctIndex === "number") return question.correctIndex;
  if (typeof question.correct === "number") return question.correct;
  if (typeof question.answer === "number") return question.answer;
  if (typeof question.answer === "string")
    return options.indexOf(question.answer);
  if (typeof question.correct === "string")
    return options.indexOf(question.correct);
  return 0;
};

const setQuestions = () => {
  const quiz = quizzesData.find(q => q.title === currentSubject);
  if (!quiz) {
    questionWrapper.innerHTML = "<p>No questions found for this subject.</p>";
    return;
  } else {
    subjectTitle.innerHTML = `
        <div><img src="${quiz.icon}" alt="${quiz.title}" /></div>
        <p>${quiz.title}</p>
    `;
  }

  const questionObj = quiz.questions[setQuestionCount];
  if (!questionObj) {
    questionWrapper.classList.add("hidden");
    resultWrapper.classList.remove("hidden");
    result.innerHTML = `
      <div class="result-container">
        <div class="result-title">
          <div><img src="${quiz.icon}" alt="${quiz.title}" /></div>
          <p>${quiz.title}</p>
        </div>
        <h1>${correctAnswers.length}</h1>
        <p>out of ${quiz.questions.length}</p>
      </div>
      <button class="back-btn">Play Again</button>
    `;
    const backBtn = resultWrapper.querySelector(".back-btn");
    backBtn.addEventListener("click", () => {
      resultWrapper.classList.add("hidden");
      welcomeWrapper.classList.remove("hidden");
      subjectsContainer.scrollIntoView({ behavior: "smooth" });
      subjectTitle.innerHTML = "";
    });
    return;
  }

  questionWrapper.classList.remove("hidden");
  resultWrapper.classList.add("hidden");
  question.innerHTML = `
      <div><p class="progress">Question ${setQuestionCount + 1} of ${
    quiz.questions.length
  }</p>
      <h3 class="q-text">${questionObj.question
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")}</h3>
        </div>
        <input
            class="range"
            type="range"
            min="0"
            max=${quiz.questions.length}
            value=${setQuestionCount + 1} disabled
          />
        `;

  options.innerHTML = `
        ${questionObj.options
          .map(
            (opt, i) =>
              `<button class="option-btn" type="button" data-index="${i}"><span class="opt-label">${
                optns[i] || ""
              }</span>${opt
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")}</button>`,
          )
          .join("")}
          <div class="actions">
        <button class="submit-btn">Submit answer</button>
      </div>
  `;

  const optionBtns = Array.from(
    questionWrapper.querySelectorAll(".option-btn"),
  );
  const submitBtn = questionWrapper.querySelector(".submit-btn");
  let selectedIndex = null;
  let submitted = false;
  const correctIndex = getCorrectIndex(questionObj);

  optionBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      if (submitted) return;
      optionBtns.forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      selectedIndex = Number(btn.dataset.index);
    });
  });

  submitBtn.addEventListener("click", () => {
    if (!submitted) {
      if (selectedIndex === null) {
        submitBtn.classList.add("shake");
        setTimeout(() => submitBtn.classList.remove("shake"), 300);
        return;
      }

      submitted = true;
      optionBtns.forEach(b => (b.disabled = true));

      const correctBtn = questionWrapper.querySelector(
        `.option-btn[data-index="${correctIndex}"]`,
      );
      if (correctBtn) correctBtn.classList.add("correct");

      const chosenBtn = questionWrapper.querySelector(
        `.option-btn[data-index="${selectedIndex}"]`,
      );
      if (selectedIndex === correctIndex) {
        chosenBtn && chosenBtn.classList.add("correct");
        correctAnswers.push({
          subject: currentSubject,
          questionIndex: setQuestionCount,
          question: questionObj.question,
          selected: questionObj.options[selectedIndex],
        });
      } else {
        chosenBtn && chosenBtn.classList.add("wrong");
        wrongAnswers.push({
          subject: currentSubject,
          questionIndex: setQuestionCount,
          question: questionObj.question,
          selected: questionObj.options[selectedIndex],
          correct: questionObj.options[correctIndex],
        });
      }

      submitBtn.textContent =
        setQuestionCount + 1 < quiz.questions.length ? "Next" : "Finish";
      return;
    }

    setQuestionCount++;
    setQuestions();
  });
};

loadSubjects();

console.log(subjectTitle);

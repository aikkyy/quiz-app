// clear stored quiz results on quiz app refresh
window.onload = () => {
  // clear stored quiz results in local storage
  localStorage.removeItem("quizResults");

  // reset current result
  currentResult = { userName: "", score: 0 };

  // render start page
  renderPage("start");
};

// STORE RESULTS
// structure to store a single result
type QuizResult = {
  userName: string;
  score: number;
};
// structure to store multiple results
type QuizResults = QuizResult[]; //array of "QuizResult" objects

// STORE QUESTIONS
// structure of a question
type Question = {
  question: string;
  options: string[];
  correct: number;
};
// structure of questions.json file
type QuestionsData = {
  questions: Question[];
};

// GLOBAL VARIABLES
// global variable to store current user's result
let currentResult: QuizResult = {
  userName: "",
  score: 0,
};
// global variable for current question
let firstQuestion: Question = {} as Question;
// global variable to track selected option index
let selectedOptionIndex: number = -1; //no option has been selected yet

// #1 FETCH HTML PAGE AND RENDER IN ROOT ELEMENT

// FUNCTION - function to render pages of quiz app
const renderPage = (pageName: string): void => {
  fetch(`pages/${pageName}.html`)
    .then((resp: Response) => {
      if (!resp.ok) {
        throw new Error(`HTTP error! status: ${resp.status}`);
      }
      return resp.text(); //returns a string
    })
    .then((html: string) => {
      // get root
      const rootElem = document.getElementById("root") as HTMLElement;
      // insert fetched html in root
      rootElem.innerHTML = html;

      // logic for page setup
      if (pageName === "quiz") {
        setupQuizPage();
      } else if (pageName === "start") {
        setupStartPage();
      } else if (pageName === "leaderboard") {
        setupLeaderboardPage();
      }
    })
    .catch((error: Error) => {
      console.error("Error rendering page:", error);
    });
};

// QUIZ PAGE SETUP
const setupQuizPage = (): void => {
  // change quiz page background
  document.body.style.backgroundColor = "var(--grey-background)";

  // fetch quiz questions
  fetchQuestions("questions");

  // get answer button
  const answerBtn = document.getElementById("answer-btn") as HTMLButtonElement;

  // FUNCTION - function to handle click on answer button
  const handleAnswerBtnClick = (): void => {
    // check if an option has been selected
    if (selectedOptionIndex === -1) {
      // alert the user to select an option
      alert("Please select an option before answering.");
      return; //exit function to prevent further execution
    }

    // get option buttons
    const optionBtns: NodeListOf<HTMLDivElement> =
      document.querySelectorAll(".option-btn");

    // set selected option
    const selectedOption = optionBtns[selectedOptionIndex] as HTMLDivElement;

    // logic for correct and incorrect answer
    if (selectedOptionIndex === firstQuestion.correct) {
      selectedOption.classList.add("correct");
      // add points for correct answer
      currentResult.score += 10;
    } else {
      selectedOption.classList.add("incorrect");
    }

    // disable option buttons and answer button after question has been answered
    optionBtns.forEach((button) => {
      button.style.pointerEvents = "none"; //disable clicking
    });
    answerBtn.style.pointerEvents = "none"; //disable clicking

    // check if end quiz button already exists
    let endBtn = document.getElementById("end-btn");
    if (!endBtn) {
      // create end button if it doesn't exist
      endBtn = document.createElement("button");
      endBtn.textContent = "End Quiz";
      endBtn.classList.add("btn-secondary");
      endBtn.id = "end-btn";

      // get buttons container
      const btnsContainer = document.getElementById(
        "btns-container"
      ) as HTMLDivElement;
      // append end button to buttons container
      btnsContainer.appendChild(endBtn);

      // add event listener to the end button
      endBtn.addEventListener("click", handleEndQuiz);
    }
  };

  // event listener to handle click on answer button
  answerBtn.addEventListener("click", handleAnswerBtnClick);
};

// START PAGE SETUP
const setupStartPage = (): void => {
  // change start page background
  document.body.style.backgroundColor = "var(--primary)";

  // #2 CAPTURE THE USER'S NAME FROM THE INPUT AND STORE IT IN LOCAL STORAGE

  // get form
  const form = document.getElementById("form-start") as HTMLFormElement;

  // function to handle form submit
  const handleSubmit = (event: Event): void => {
    // prevent form submit default behavior
    event.preventDefault();

    // get user input
    const userInput = document.getElementById("input-name") as HTMLInputElement;

    // trim user input to avoid storing whitespace
    let userName: string = userInput.value.trim();

    // check if input value is empty
    if (userName !== "") {
      localStorage.setItem("name", userName);

      // clear input field
      userInput.value = "";

      // #3 WHEN CLICKING THE START BUTTON, RENDER THE QUIZ PAGE

      // render quiz page
      renderPage("quiz");
    } else {
      alert("Please enter your name.");
    }
  };

  // event listener to handle form submission
  form.addEventListener("submit", handleSubmit);
};

// LEADERBOARD PAGE SETUP
const setupLeaderboardPage = (): void => {
  // #6 INSERT RESULTS INTO THE LEADERBOARD

  // change leaderboard page background
  document.body.style.backgroundColor = "var(--primary)";

  // get stored results
  const storedResults = localStorage.getItem("quizResults") as string;

  // convert JSON string into JS object
  const results: QuizResults = JSON.parse(storedResults);

  // display stored results
  displayResults(results);

  // get new game button
  const newGameBtn = document.getElementById(
    "new-game-btn"
  ) as HTMLButtonElement;

  // event listener to handle click on new game button
  newGameBtn.addEventListener("click", () => {
    // reset current user's result
    currentResult = {
      userName: "",
      score: 0,
    };

    // render start page again
    renderPage("start");
  });
};

// #4 FETCH THE QUESTIONS.JSON FILE AND RENDER THE QUESTION, 4 OPTIONS, AND THE CORRECT ANSWER

// FUNCTION - function to fetch question from questions.json file
const fetchQuestions = (fileName: string): void => {
  fetch(`/${fileName}.json`)
    .then((resp: Response) => {
      if (!resp.ok) {
        throw new Error(`HTTP error! status: ${resp.status}`);
      }
      return resp.json();
    })
    .then((data: QuestionsData) => {
      // set first question
      firstQuestion = data.questions[0];

      // get question container
      const questionContainer = document.getElementById(
        "question-container"
      ) as HTMLElement;

      // create and append question text to question container
      const questionText = document.createElement("p");
      questionText.textContent = firstQuestion.question;
      questionContainer.appendChild(questionText);

      // get option list
      const optionList = document.getElementById(
        "option-list"
      ) as HTMLDivElement;

      // loop through options and create buttons for each option
      firstQuestion.options.forEach((option, index) => {
        // create option button and option text
        const optionBtn = document.createElement("div");
        optionBtn.classList.add("option-btn");
        optionBtn.textContent = option;

        // event listener to handle click on option button
        optionBtn.addEventListener("click", function () {
          handleOptionSelection(this, index, firstQuestion.correct); //this is the optionBtn that was clicked
        });

        // append option button to option list
        optionList.appendChild(optionBtn);
      });
    })
    .catch((error: Error) => {
      console.error("Error fetching questions:", error);
    });
};

// FUNCTION - function to handle option selection
function handleOptionSelection(
  optionBtn: HTMLDivElement,
  selectedIndex: number,
  correctIndex: number
): void {
  // get option buttons
  const optionBtns: NodeListOf<HTMLDivElement> =
    document.querySelectorAll(".option-btn");

  // deselect all options
  optionBtns.forEach((btn) => {
    btn.classList.remove("selected");
  });

  // highlight selected option
  optionBtn.classList.add("selected");

  // update the selected option index
  selectedOptionIndex = selectedIndex;
}

// #7 RENDER THE RESULTS ON THE LEADERBOARD

const displayResults = (allResults: QuizResults): void => {
  // sort results based on score
  allResults.sort((a, b) => b.score - a.score); //descending order

  // total number of questions in the quiz
  const totalQuestions = 1;

  // get podium
  const podium = [
    document.getElementById("first-podium"),
    document.getElementById("second-podium"),
    document.getElementById("third-podium"),
  ];

  // loop through each podium element and update podium display
  podium.forEach((podium, index) => {
    // check if podium and results exist
    if (podium && allResults[index]) {
      // extract initials from the user name
      const initials = allResults[index].userName.match(/\b\w/g)?.join("");
      // calculate number of correct answers based on score
      const correctAnswers = allResults[index].score / 10; //10 points per correct answer
      // update podium
      podium.innerHTML = `<div>${index + 1}.</div>
                          <div>${initials || ""}</div>
                          <div>${allResults[index].userName}</div>
                          <div>${correctAnswers}/${totalQuestions}</div>`;
    }
  });

  // update remaining list display
  // get remaining list
  const remainingList = document.getElementById(
    "remaining-list"
  ) as HTMLDivElement;

  // loop through results (excluding top 3)
  allResults.slice(3).forEach((result, index) => {
    // calculate number of correct answers based on score
    const correctAnswers = result.score / 10; //10 points per correct answer

    // create remaining list item
    const item = document.createElement("div");
    item.className = "remaining-item";

    // display remaining list item (starting on #4)
    item.innerHTML = `${index + 4}. ${
      result.userName
    } <span>${correctAnswers}/${totalQuestions}</span>`;

    // append remaining list item to remaining list
    remainingList.appendChild(item);
  });
};

// FUNCTION - function to handle click on end quiz button
const handleEndQuiz = (): void => {
  // get stored user name
  currentResult.userName = localStorage.getItem("name") || "Unknown User"; //if no user name, "Unknow User"

  // get stored results
  const storedResults = localStorage.getItem("quizResults") as string;

  // check if there are any stored results and convert JSON string to JS array
  const allResults = storedResults ? JSON.parse(storedResults) : [];

  // add current user's result to all results array
  allResults.push(currentResult);

  // convert all JS array back into JSON string and store it in local storage
  localStorage.setItem("quizResults", JSON.stringify(allResults));

  // render leaderboard page
  renderPage("leaderboard");
};

// render start page
renderPage("start");

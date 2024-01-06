// #1 Fetch HTML page and render in root element
const renderPage = (pageName: string): void => {
  const html = fetch(`pages/${pageName}.html`)
    .then((resp: Response) => {
      if (!resp.ok) {
        throw new Error(`HTTP error! status: ${resp.status}`);
      }
      return resp.text();
    })
    .then((html) => {
      //get root
      const rootElem = document.getElementById("root") as HTMLElement;
      rootElem.innerHTML = html;

      // change background color of different pages
      if (pageName === "quiz") {
        document.body.style.backgroundColor = "var(--grey-background)";

        fetchQuestions("questions");

        const nextButton = document.getElementById(
          "next-btn"
        ) as HTMLButtonElement;

        nextButton.addEventListener("click", function () {
          // get option buttons
          const options: NodeListOf<HTMLDivElement> =
            document.querySelectorAll(".btn-answer");
          // get selected option
          const selectedOption = options[selectedOptionIndex] as HTMLDivElement;

          if (selectedOption) {
            if (selectedOptionIndex === firstQuestion.correct) {
              // turn option background green if correct answer
              selectedOption.style.backgroundColor =
                "var(--primary-low-opacity)";
            } else {
              // turn option background red if incorrect answer
              selectedOption.style.backgroundColor = "var(--red)";
              selectedOption.style.color = "white";

              // add 10 points if correct answer
              currentResult.score += 10;
            }
          }
        });
      } else if (pageName === "start") {
        // #2 Capture the user's name from the input and store it in local storage
        // get form
        const formElem = document.getElementById(
          "form-start"
        ) as HTMLFormElement;

        // function to handle submit
        const handleSubmit = (event: Event): void => {
          event.preventDefault();
          // get user input
          const userInput = document.getElementById(
            "input-name"
          ) as HTMLInputElement;
          // trim user input to avoid storing whitespace
          let userName: string = userInput.value.trim();

          // check if input value is empty
          if (userName !== "") {
            localStorage.setItem("name", userName);
            // clear the input field
            userInput.value = "";

            // #3 When clicking the start button, render the quiz page
            renderPage("quiz");
          } else {
            alert("Please enter your name.");
          }
        };

        formElem.addEventListener("submit", handleSubmit);
      }
    })
    .catch((error: Error) => {
      console.error("Error rendering page:", error);
    });
};

// render start page
renderPage("start");

// #4 Fetch the questions.json file and render the question, 4 options, and the correct answer

// define a type for the structure of a question
type Question = {
  question: string;
  options: string[];
  correct: number;
};

// define a type for the structure of the questions JSON data
type QuestionsData = {
  questions: Question[];
};

// define default question to avoid question being null
const defaultQuestion: Question = {
  question: "Default question?",
  options: ["Option 1", "Option 2", "Option 3", "Option 4"],
  correct: 0,
};

// declare global variable for current question
let firstQuestion: Question = defaultQuestion;

// track the selected option index
let selectedOptionIndex: number = -1;

const fetchQuestions = (fileName: string): void => {
  fetch(`/${fileName}.json`)
    .then((resp: Response) => {
      if (!resp.ok) {
        throw new Error(`HTTP error! status: ${resp.status}`);
      }
      return resp.json();
    })
    .then((data: QuestionsData) => {
      // get the first question
      firstQuestion = data.questions[0];

      // get the question container
      const questionContainer = document.getElementById(
        "question-container"
      ) as HTMLElement;

      // create and append the question text
      const questionText = document.createElement("p");
      questionText.textContent = firstQuestion.question;
      questionContainer.appendChild(questionText);

      // get button list
      const buttonList = document.getElementById("btn-list") as HTMLDivElement;

      // loop through the options and create divs for each option
      firstQuestion.options.forEach((option, index) => {
        // create option div and option text
        const optionDiv = document.createElement("div");
        optionDiv.classList.add("btn-answer");
        optionDiv.textContent = option;

        optionDiv.addEventListener("click", function () {
          handleOptionSelection(this, index, firstQuestion.correct);
        });

        // append option div to button list
        buttonList.appendChild(optionDiv);
      });
    })
    .catch((error: Error) => {
      console.error("Error fetching questions:", error);
    });
};

function handleOptionSelection(
  optionElem: HTMLDivElement,
  selectedIndex: number,
  correctIndex: number
): void {
  // clear selections
  document.querySelectorAll(".btn-answer").forEach((option: Element) => {
    (option as HTMLDivElement).style.backgroundColor = "";
  });

  // highlight the selected option
  optionElem.style.backgroundColor = "var(--secondary)";
  selectedOptionIndex = selectedIndex;
}

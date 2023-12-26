// #1 Fetch HTML page and render in root element
const renderPage = (pageName: string) => {
  const html = fetch(`pages/${pageName}.html`)
    .then((resp) => resp.text())
    .then((html) => {
      //get root
      const rootElem = document.getElementById("root") as HTMLElement;
      rootElem.innerHTML = html;

      // #2 Capture the user's name from the input and store it in local storage
      // get form
      const formElem = document.getElementById("form-start") as HTMLFormElement;

      // function to handle submit
      const handleSubmit = (event: Event): void => {
        event.preventDefault();
        // get user input
        const userInput = document.getElementById(
          "input-name"
        ) as HTMLInputElement;

        let userName: string = userInput.value;

        // check if input value is empty
        if (userName !== "") {
          localStorage.setItem("name", userName);
          // clear the input field
          userInput.value = "";

          // 3. When clicking the Start button, render the quiz page
          renderPage("quiz");
        } else {
          alert("Please enter your name.");
        }
      };

      formElem.addEventListener("submit", handleSubmit);
    });
};

renderPage("start");

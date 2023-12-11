const renderPage = async (pageName: string): Promise<void> => {
  const html = await fetch(`pages/${pageName}.html`).then((resp) =>
    resp.text()
  );

  const rootElem = document.getElementById("root") as HTMLElement;
  rootElem.innerHTML = html;
};

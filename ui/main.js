const saveBtn = document.getElementById("save");

saveBtn.addEventListener("click", () => {
  const title = document.getElementById("title").value;
  const body = document.getElementById("body").value;

  const payload = {
    arguments: {
      execute: {
        inArguments: [
          { title, body }
        ]
      }
    }
  };

  // SFMC expects postMessage response to close modal
  window.parent.postMessage(
    {
      action: "updateActivity",
      arguments: payload.arguments
    },
    "*"
  );
});

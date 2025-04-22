require.config({
  paths: { vs: "https://unpkg.com/monaco-editor@0.34.1/min/vs" },
});

require(["vs/editor/editor.main"], function () {
  window.editor = monaco.editor.create(document.getElementById("editor"), {
    value: `// FlareLane.setUserId("user123")
// FlareLane.setTags({ gender: "men", age: 24 });
// FlareLane.setUserAttributes({
//   "name": "김철수",
//   "phoneNumber": "+821012341234",
//   "dob": "1992-03-01",
//   "email": "kevin@flarelane.com",
//   "country": "KR",
//   "language": "ko",
//   "timeZone": "Asia/Seoul"
// });
// FlareLane.trackEvent("click", { "key" : "value" })
// FlareLane.getDeviceId((deviceId) => {
//    // Do something...
//    console.log(deviceId);
// });
          `,
    language: "javascript",
    theme: "vs-dark",
    fontSize: 14,
  });

  monaco.languages.registerCompletionItemProvider("javascript", {
    triggerCharacters: ["."],
    provideCompletionItems: function (model, position) {
      const textUntilPosition = model.getValueInRange({
        startLineNumber: position.lineNumber,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      });

      if (!/FlareLane\.$/.test(textUntilPosition.trim()))
        return { suggestions: [] };

      return {
        suggestions: [
          {
            label: "setUserId",
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: "setUserId(${1:userId})",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Sets the user ID",
          },
          {
            label: "setTags",
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: "setTags(${1:tags})",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Sets user tags",
          },
          {
            label: "setUserAttributes",
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: "setUserAttributes(${1:attributes})",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Sets user attributes",
          },
          {
            label: "trackEvent",
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: "trackEvent(${1:eventName}, ${2:eventData})",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Tracks a custom event with optional data",
          },
          {
            label: "getDeviceId",
            kind: monaco.languages.CompletionItemKind.Function,
            insertText:
              "getDeviceId((${1:deviceId}) => {\n  ${2:// Do something...}\n  console.log($1);\n})",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: "Retrieves the current device ID via callback.",
          },
        ],
      };
    },
  });

  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () =>
    runCode()
  );
});

async function runCode() {
  const code = editor.getValue();
  const outputEl = document.getElementById("output");

  outputEl.innerHTML = "";

  const originalLog = console.log;
  const originalError = console.error;

  console.log = (...args) => {
    const line = document.createElement("div");
    line.textContent = args.join(" ");
    line.style.color = "#9cdcfe";
    outputEl.appendChild(line);
    originalLog(...args);
  };

  console.error = (...args) => {
    const line = document.createElement("div");
    line.textContent = "Error: " + args.join(" ");
    line.style.color = "#f44747";
    line.style.fontWeight = "bold";
    outputEl.appendChild(line);
    originalError(...args);
  };

  try {
    const AsyncFunction = Object.getPrototypeOf(
      async function () {}
    ).constructor;
    const result = await new AsyncFunction(code)();

    if (result !== undefined) {
      const resultLine = document.createElement("div");
      resultLine.textContent = "Result: " + result;
      resultLine.style.color = "#4fc1ff";
      resultLine.style.fontWeight = "bold";
      outputEl.appendChild(resultLine);
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  } catch (err) {
    const errorLine = document.createElement("div");
    errorLine.textContent = "Exception: " + err.message;
    errorLine.style.color = "#f44747";
    errorLine.style.fontWeight = "bold";
    outputEl.appendChild(errorLine);
  }

  console.log = originalLog;
  console.error = originalError;
}

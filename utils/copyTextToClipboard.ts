const copyTextToClipboard = (text: string) => {
  navigator.permissions.query({ name: "clipboard-write" }).then((result) => {
    if (result.state == "granted" || result.state == "prompt") {
      navigator.clipboard.writeText(text);
    }
  });
};

export default copyTextToClipboard;
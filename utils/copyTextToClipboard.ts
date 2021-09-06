const copyTextToClipboard = (text: string) => {
  navigator.permissions.query({ name: ("clipboard-write" as any) }).then((result) => {
    if (result.state == "granted" || result.state == "prompt") {
      navigator.clipboard.writeText(text);
    }
  });
};

export default copyTextToClipboard;
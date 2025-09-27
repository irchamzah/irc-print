function parseMultiLineCommands(text) {
  const lines = text.split("\n").map((line) => line.trim());
  const commands = [];

  for (const line of lines) {
    if (line.startsWith("/")) {
      commands.push(line);
    }
  }

  return commands;
}

module.exports = { parseMultiLineCommands };

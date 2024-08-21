export default function difficultyColour(difficulty: string) {
  switch (difficulty.split("_")[1]) {
    case "ExpertPlus":
      return 0x8f48db;
    case "Expert":
      return 0xbf2a43;
    case "Hard":
      return 0xff6347;
    case "Normal":
      return 0x59b0f4;
    case "Easy":
      return 0x3cb372;
  }
  return 0;
}

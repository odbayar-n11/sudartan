// Splits a heading into words so they can light up one after another
// (put data-reveal="words" on the parent). The text itself is unchanged.
export default function Words({ text }) {
  return text.split(" ").map((word, i) => (
    <span key={i}>
      {i > 0 && " "}
      <span className="w" style={{ "--i": i }}>{word}</span>
    </span>
  ));
}

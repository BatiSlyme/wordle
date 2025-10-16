import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "./App.css";
import WordBlocks, { type WordBlocksHandle } from "./WordBlocks";
import MenuModal from "./MenuModal";
import { ModalContext } from "./context/ModalContext";
import "./Fireworks.css";
export type GameStatusType = {
  won?: boolean;
};

function App() {
  const [word, setWord] = useState<string[]>([]);
  const [currentRow, setCurrentRow] = useState(0);
  const ref = useRef<(WordBlocksHandle | null)[]>([]);
  const [gameStatus, setGameStatus] = useState<GameStatusType>({
    won: undefined,
  });

  const { setShowModal } = useContext(ModalContext);

  const getWord = useCallback(
    () =>
      fetch("/api/api/fe/wordle-words")
        .then((res) => res.json())
        .then((data: string[]) => {
          const randomWord = Math.floor(Math.random() * data.length);
          setWord(Array.from(data[randomWord]));
          return data;
        })
        .catch((err) => console.error(err.message)),
    []
  );

  useEffect(() => {
    getWord();
  }, [getWord]);

  const resetGame = useCallback(() => {
    setCurrentRow(0);
    setShowModal(false);
    ref.current.forEach((el) => {
      el?.reset();
    });
  }, [setShowModal]);

  const rows = useMemo(() => {
    return Array(6)
      .fill("")
      .map((_, i) => (
        <WordBlocks
          word={word}
          key={i}
          disabled={i !== currentRow}
          setCurrentRow={setCurrentRow}
          currentRow={currentRow}
          setGameStatus={setGameStatus}
          ref={(el) => {
            ref.current[i] = el;
          }}
        />
      ));
  }, [currentRow, word]);

  const menuContent = useMemo(() => {
    return (
      <div
        style={{ display: "flex", gap: 20, justifyContent: "space-between" }}
      >
        <button
          className="menu-button"
          style={{
            background: "rgba(150, 247, 226, 1)",
          }}
          onClick={() => {
            resetGame();
            getWord();
          }}
        >
          New Word
        </button>
        <button
          className="menu-button"
          style={{
            background: "rgba(250, 153, 27, 1)",
          }}
          onClick={() => {
            resetGame();
          }}
        >
          Do it again
        </button>
      </div>
    );
  }, [getWord, resetGame]);

  if (!word || word.length < 1) {
    return <h1>LOADING...</h1>;
  }

  return (
    <div className={"board"}>
      {rows}
      <MenuModal>
        {/* call fireworks https://jsfiddle.net/elin/7m3bL/*/}
        {gameStatus.won && (
          <div className="pyro">
            <div className="before" />
            <div className="after" />
          </div>
        )}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            textAlign: "center",
            padding: 10,
          }}
        >
          {gameStatus.won ? (
            <h1>YOU WON!</h1>
          ) : (
            <h1 style={{ color: "red" }}>YOU LOST...</h1>
          )}
          {menuContent}
        </div>
      </MenuModal>
    </div>
  );
}

export default App;

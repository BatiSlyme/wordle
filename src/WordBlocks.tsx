import {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { v4 as uuidv4 } from "uuid";
import { ModalContext } from "./context/ModalContext";
import type { GameStatusType } from "./App";

type WordStructureType = {
  value: string;
  key: string;
  status?: "correct" | "present" | "absent" | "idle";
  animating?: boolean;
};

type WordBlocksProps = {
  word: string[];
  disabled: boolean;
  currentRow: number;
  setCurrentRow: React.Dispatch<React.SetStateAction<number>>;
  setGameStatus: React.Dispatch<React.SetStateAction<GameStatusType>>;
};

export type WordBlocksHandle = {
  focusFirstNewRow: () => void;
  reset: () => void;
};

const WordBlocks = forwardRef<WordBlocksHandle, WordBlocksProps>(
  ({ word, disabled, currentRow, setCurrentRow, setGameStatus }, ref) => {
    const rowRef = useRef<HTMLInputElement[]>([]);
    const [busy, setBusy] = useState(false);

    const [rowState, setRowState] = useState<WordStructureType[]>(
      Array.from({ length: word.length }, () => ({ value: "", key: uuidv4() }))
    );

    const { setShowModal } = useContext(ModalContext);
    // focus the first input when mounted
    useEffect(() => {
      if (!disabled) {
        rowRef.current[0]?.focus();
      }
    }, [disabled]);

    useImperativeHandle(ref, () => {
      return {
        focusFirstNewRow() {
          rowRef.current[0].focus();
        },
        reset() {
          setBusy(false);
          setRowState(
            Array.from({ length: word.length }, () => ({
              value: "",
              key: uuidv4(),
            }))
          );
          rowRef.current.forEach((input) => (input.style.backgroundColor = ""));
        },
      };
    }, [word.length]);

    const handleInput = useCallback(
      (value: string) => {
        const hasEmpty = rowState.some((f) => f.value === "");

        if (!hasEmpty) {
          return;
        }

        if (!/^[a-zA-Z]$/.test(value)) return;

        setRowState((prev) => {
          const newState = [...prev];
          const nextIndex = newState.findIndex((ch) => ch.value === "");
          if (nextIndex !== -1) {
            newState[nextIndex].value = value.toUpperCase();
            // focus next empty box after update
            requestAnimationFrame(() => {
              const next = newState.findIndex((ch) => ch.value === "");
              if (next !== -1) rowRef.current[next]?.focus();
            });
          }
          return newState;
        });
      },
      [rowState]
    );

    const handleDelete = () => {
      setRowState((prev) => {
        const newValue = [...prev];
        const firstEmptyIndex = newValue.findIndex((f) => f.value === "");
        if (firstEmptyIndex === -1) {
          //every input is filled
          newValue[newValue.length - 1].value = "";
          rowRef.current[newValue.length - 1].focus();
        } else if (firstEmptyIndex !== 0) {
          newValue[firstEmptyIndex - 1].value = "";
          rowRef.current[firstEmptyIndex - 1].focus();
        }
        return newValue;
      });
    };

    const handleCheck = useCallback(async () => {
      const hasEmptyElement = rowState.some((f) => f.value === "");
      if (hasEmptyElement) {
        return;
      }

      setBusy(true);
      let countCorrect = 0;

      for (let i = 0; i < word.length; i++) {
        // Start flip animation
        setRowState((prev) => {
          const newValue = [...prev];
          newValue[i].animating = true;
          return newValue;
        });

        // Wait for flip duration (e.g., 300ms)
        await new Promise((res) => setTimeout(res, 300));

        // After flip, set its status (color)
        setRowState((prev) => {
          const newValue = [...prev];
          const letter = newValue[i].value;

          if (word[i] === letter) {
            newValue[i].status = "correct";
            countCorrect++;
          } else if (word.includes(letter)) newValue[i].status = "present";
          else newValue[i].status = "absent";

          newValue[i].animating = false;
          return newValue;
        });

        // Optional tiny gap between letters for smoother feel
        await new Promise((res) => setTimeout(res, 100));
      }

      if (countCorrect === word.length) {
        setGameStatus((prev) => {
          return { ...prev, won: true };
        });
        setShowModal(true);

        return;
      }

      if (currentRow === word.length) {
        setGameStatus((prev) => {
          return { ...prev, won: false };
        });
        setShowModal(true);

        return;
      }

      setCurrentRow((prev) => prev + 1);
    }, [
      currentRow,
      rowState,
      setCurrentRow,
      setGameStatus,
      setShowModal,
      word,
    ]);

    const wordRow = useMemo(() => {
      return word.map((_, i) => {
        return (
          <input
            ref={(el) => {
              if (el) rowRef.current[i] = el; // ✅ assign DOM node to ref array
            }}
            key={rowState[i].key}
            className={`letter-box
              ${rowState[i].animating ? " flip" : ""}
              ${rowState[i].status ?? ""}`}
            type="text"
            value={rowState[i].value}
            disabled={disabled || busy}
            onKeyDown={async (e) => {
              // console.log(e.code, e.ctrlKey);
              switch (e.code) {
                case "Backspace":
                  handleDelete();
                  break;
                case "Enter":
                  await handleCheck();
                  break;
                default:
                  break;
              }
            }}
            onChange={(e) => {
              const val = e.target.value.trim();
              if (val) handleInput(val);
            }}
          />
        );
      });
    }, [word, rowState, disabled, busy, handleCheck, handleInput]);

    return <div className="word-container">{wordRow}</div>;
  }
);

export default WordBlocks;

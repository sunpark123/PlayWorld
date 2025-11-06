import { useState, useEffect } from "react";
import Header from "../Header/Header";
import "./2048.css";
import { motion } from "framer-motion";
import { tr } from "framer-motion/client";

function Twozerofoureight() {
    const [size] = useState(4);
    const [end, setEnd] = useState(false);
    const [tiles, setTiles] = useState(() => {
        const initial = [];
        for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            initial.push({
                id: `${r}-${c}-${Math.random().toString(36).substr(2, 5)}`,
                value: 0,
                x: c,
                y: r,
            });
        }
        }
        return initial;
    });

  const getBoard = (tiles) => {
    const board = Array.from({ length: size }, () =>
      Array(size).fill({ value: 0 })
    );
    tiles.forEach((t) => {
      board[t.y][t.x] = t;
    });
    return board;
  };

  const addRandomTile = (tiles) => {
    const empty = tiles.filter((t) => t.value === 0);
    if (empty.length === 0) {setEnd(true); return tiles;}
    const chosen = empty[Math.floor(Math.random() * empty.length)];
    const newValue = Math.random() < 0.5 ? 2 : 4;
    return tiles.map((t) =>
      t.id === chosen.id ? { ...t, value: newValue } : t
    );
  };

  const compressLineLeft = (line) => {
    let result = line.filter((t) => t.value !== 0);
    for (let i = 0; i < result.length - 1; i++) {
      if (result[i].value === result[i + 1].value) {
        result[i] = { ...result[i], value: result[i].value * 2 };
        result[i + 1] = { ...result[i + 1], value: 0 };
      }
    }
    result = result.filter((t) => t.value !== 0);
    while (result.length < 4)
      result.push({ id: Math.random().toString(36).slice(2, 7), value: 0 });
    return result;
  };

  // ✅ 4방향 이동
  const moveLeft = () => {
    setTiles((prev) => {
      const board = getBoard(prev);
      const moved = board.map((row, y) => {
        const compressed = compressLineLeft(row);
        return compressed.map((t, x) => ({ ...t, x, y }));
      });
      return addRandomTile(moved.flat());
    });
  };

  const moveRight = () => {
    setTiles((prev) => {
      const board = getBoard(prev);
      const moved = board.map((row, y) => {
        const reversed = [...row].reverse();
        const compressed = compressLineLeft(reversed).reverse();
        return compressed.map((t, x) => ({ ...t, x, y }));
      });
      return addRandomTile(moved.flat());
    });
  };

  const moveUp = () => {
    setTiles((prev) => {
      const board = getBoard(prev);
      const moved = [];
      for (let x = 0; x < size; x++) {
        const col = board.map((row) => row[x]);
        const compressed = compressLineLeft(col);
        compressed.forEach((t, y) => moved.push({ ...t, x, y }));
      }
      return addRandomTile(moved);
    });
  };

  const moveDown = () => {
    setTiles((prev) => {
      const board = getBoard(prev);
      const moved = [];
      for (let x = 0; x < size; x++) {
        const col = [...board.map((row) => row[x])].reverse();
        const compressed = compressLineLeft(col).reverse();
        compressed.forEach((t, y) => moved.push({ ...t, x, y }));
      }
      return addRandomTile(moved);
    });
  };

  // ✅ 키 이벤트
  useEffect(() => {
    const handle = (e) => {
      if (e.key === "ArrowLeft") moveLeft();
      if (e.key === "ArrowRight") moveRight();
      if (e.key === "ArrowUp") moveUp();
      if (e.key === "ArrowDown") moveDown();
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, []);

  // ✅ 초기 타일 생성
  useEffect(() => {
    setTiles((prev) => addRandomTile(addRandomTile(prev)));
  }, []);
  const retry = () => {
    setEnd(false);
    setTiles(() => {
        const initial = [];
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                initial.push({
                    id: `${r}-${c}-${Math.random().toString(36).substr(2, 5)}`,
                    value: 0,
                    x: c,
                    y: r,
                });
            }
        }
        return initial;
    })
    setTiles((prev) => addRandomTile(addRandomTile(prev)));
  }
  return (  
    <>
      <Header />
        <div className="two">
            <div className="zero" style={{ position: "relative" }}>
                {Array.from({ length: size - 1 }, (_, i) => (
                    <>
                    <span className="garo" key={`lineGaro_${i}`} style={{ "--i": i + 1 }}></span>
                    <span className="sero" key={`lineSero_${i}`} style={{ "--i": i + 1 }}></span>
                    </>
                ))}
                {tiles.map((tile) => (
                    <motion.div
                        key={tile.id}
                        className="block"
                        id={`B_${tile.value}`}
                        style={{
                            position: "absolute",
                            transform: `translate(${tile.x * 100}px, ${tile.y * 100}px)`,
                        }}
                        animate={{
                            transform: `translate(${tile.x * 100}px, ${tile.y * 100}px)`,
                        }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                        <h1>{tile.value !== 0 ? tile.value : ""}</h1>
                    </motion.div>
                ))}
            </div>
        </div>
        {end === true && (
            <div className="end">
                <h1>Game Over</h1>
                <button onClick={() => retry()}>다시하기</button>
            </div>
        )}
    </>
  );
}

export default Twozerofoureight;

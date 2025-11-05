import { useState, useEffect } from "react";
import Header from "../Header/Header";
import "./2048.css"

function Twozerofoureight() {

    const [size, ] = useState(4);

    const [game, setGame] = useState([
        [2, 0, 2, 2],
        [2, 0, 0, 0],
        [2, 2, 2,2],
        [0, 0, 2, 0],
    ]);

    const [canMove, setCanMove] = useState(true);

    useEffect(() => {
        const handleKeyDown = (event) => {
            switch (event.key) {
            case "ArrowUp":
                moveLeft();
                break;
            case "ArrowDown":
                console.log("⬇️ 아래로 이동");
                break;
            case "ArrowLeft":
                console.log("⬅️ 왼쪽으로 이동");
                break;
            case "ArrowRight":
                moveRight();
                break;
            default:
                break;
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);
    const moveRight = () => {
    const newGame = game.map((line) => {
        let newLine = [...line].reverse(); // 1️⃣ 오른쪽 → 뒤집어서 왼쪽처럼 처리
        newLine = newLine.filter((n) => n !== 0); // 2️⃣ 0 제거

        for (let i = 0; i < newLine.length - 1; i++) {
        if (newLine[i] === newLine[i + 1]) {
            newLine[i] *= 2;
            newLine[i + 1] = 0;
        }
        }

        newLine = newLine.filter((n) => n !== 0);
        while (newLine.length < size) newLine.push(0); // 3️⃣ 오른쪽이 아니라 왼쪽에 0 채우기

        return newLine.reverse(); // 4️⃣ 다시 뒤집어서 원래 방향으로
    });

    setGame(newGame);
    };
    const moveLeft = () => {
        const newGame = game.map((line) => [...line]);

        for (let b = 0; b < 3; b++) {
            newGame.forEach((line) => {
                for (let i = 0; i < 3; i++) {
                    if(line[i] === line[i+1] || line[i] === 0)
                    {
                        line[i] = line[i] + line[i+1];
                        line[i+1] = 0;
                    }
                }
            });
        }
        setGame(newGame);
    };

	return (
		<>
            <Header></Header>
            <div className="two">
                <div className="zero">
                    {Array.from({ length: size - 1 }, (_, i) => (
                        <>
                            <span className="garo" key={`lineGaro_${i}`} style={{ '--i': i + 1 }}></span>
                            <span className="sero" key={`lineSero_${i}`} style={{ '--i': i + 1 }}></span>
                        </>
                    ))}
                    {game.map((row, rowIndex) =>
                        row.map((number, colIndex) => (
                            <div className="block" id={number} key={`block_${rowIndex}-${colIndex}`}>
                                <h1>{number !== 0 ? number : ""}</h1>
                            </div>
                        ))
                    )}
                    

                </div>
            </div>
        </>
	);
}

export default Twozerofoureight;

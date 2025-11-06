import React, { useState, useEffect, useRef } from "react";
import "./PinBall.css";

function PinBall() {
  const [power, setPower] = useState(0);
  const [charging, setCharging] = useState(false);
  const [angle, setAngle] = useState(0);

  const bumpersRef = useRef([]);
  const [bumpers, setBumpers] = useState([]);
  const leftFlipperRef = useRef(null);
  const rightFlipperRef = useRef(null);
  const leftGuardRef = useRef(null);
  const rightGuardRef = useRef(null);

  const [ballPos, setBallPos] = useState({ x: 180, y: 10 });
  const [ballVel, setBallVel] = useState({ x: 0, y: 0 });

  // ✅ 스페이스바 입력 처리
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        setCharging(true);
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        setCharging(false);

        const hitAngle = Math.min(power / 1.1, 45);
        setAngle(hitAngle);

        // 공 발사 (power에 따라 위로)
        setBallVel({ x: 0, y: -power / 3 });

        setTimeout(() => setAngle(0), 200);
        setPower(0);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [power]);

  // ✅ 파워 충전
  useEffect(() => {
    let interval;
    if (charging) {
      interval = setInterval(() => {
        setPower((prev) => Math.min(prev + 5, 100));
      }, 30);
    }
    return () => clearInterval(interval);
  }, [charging]);

  // ✅ 범퍼 좌표 초기화 (DOM 로드 후 한 번 계산)
  useEffect(() => {
    const updateBumperPositions = () => {
      const newBumpers = bumpersRef.current.map((b) => {
        if (!b) return null;
        const rect = b.getBoundingClientRect();
        const containerRect = b.parentNode.getBoundingClientRect();
        return {
          x: rect.left - containerRect.left + rect.width / 2,
          y: rect.top - containerRect.top + rect.height / 2,
          r: rect.width / 2,
        };
      });
      setBumpers(newBumpers);
    };

    updateBumperPositions();
    window.addEventListener("resize", updateBumperPositions);
    return () => window.removeEventListener("resize", updateBumperPositions);
  }, []);

  // ✅ 물리 업데이트 (공 + 충돌)
  useEffect(() => {
    const gravity = 0.6;
    const radius = 49;

    const update = () => {
      setBallPos((prev) => {
        let newX = prev.x;
        let newY = prev.y;
        let newVelX = ballVel.x;
        let newVelY = ballVel.y + gravity;

        const steps = 4;
        for (let i = 0; i < steps; i++) {
          newX += newVelX / steps;
          newY += newVelY / steps;

          // 벽 충돌
          if (newX < 0) {
            newX = 0;
            newVelX *= -0.9;
          } else if (newX > 370) {
            newX = 370;
            newVelX *= -0.9;
          }
          if (newY > 1000) {
            newY = 1000;
            newVelY *= -0.6;
          }

          // ✅ 범퍼 충돌 (원형)
          bumpers.forEach((b) => {
            if (!b) return;
            const dx = newX + radius / 2 - b.x;
            const dy = newY + radius / 2 - b.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const sumRadius = b.r + radius / 2;

            if (dist < sumRadius) {
              const normalX = dx / dist;
              const normalY = dy / dist;
              const dot = newVelX * normalX + newVelY * normalY;
              newVelX -= 2 * dot * normalX;
              newVelY -= 2 * dot * normalY;
              newVelX *= 0.85;
              newVelY *= 0.85;

              const overlap = sumRadius - dist + 0.5;
              newX += normalX * overlap;
              newY += normalY * overlap;
            }
          });

          // ✅ 플리퍼 충돌
          [leftFlipperRef.current, rightFlipperRef.current].forEach((flipper) => {
            if (!flipper) return;
            const rect = flipper.getBoundingClientRect();
            const containerRect = flipper.parentNode.getBoundingClientRect();
            const fx = rect.left - containerRect.left + rect.width / 2;
            const fy = rect.top - containerRect.top + rect.height / 2;

            const dx = newX + radius / 2 - fx;
            const dy = newY + radius / 2 - fy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const sumRadius = rect.width / 2 + radius / 2;

            if (dist < sumRadius) {
              const normalX = dx / dist;
              const normalY = dy / dist;
              const dot = newVelX * normalX + newVelY * normalY;
              newVelX -= 2 * dot * normalX;
              newVelY -= 2 * dot * normalY;
              newVelX *= 1.1;
              newVelY *= 1.2;

              const overlap = sumRadius - dist + 0.5;
              newX += normalX * overlap;
              newY += normalY * overlap;
            }
          });
        }

        setBallVel({ x: newVelX, y: newVelY });
        return { x: newX, y: newY };
      });
    };

    const interval = setInterval(update, 16);
    return () => clearInterval(interval);
  }, [ballVel, bumpers]);

  return (
    <div className="pinball-container">
      <img src="/background.png" alt="background" className="background" />

      {[1, 2, 3].map((n, i) => (
        <div
          key={n}
          className={`bumper bumper${n}`}
          ref={(el) => (bumpersRef.current[i] = el)}
        />
      ))}

      <div className="guard left-guard" ref={leftGuardRef}></div>
      <div className="guard right-guard" ref={rightGuardRef}></div>

      <img
        src="/flipper_left.png"
        alt="left flipper"
        className="flipper left"
        ref={leftFlipperRef}
        style={{ transform: `rotate(${-angle}deg)` }}
      />
      <img
        src="/flipper_right.png"
        alt="right flipper"
        className="flipper right"
        ref={rightFlipperRef}
        style={{ transform: `rotate(${angle}deg)` }}
      />

      <img
        src="/ball.png"
        alt="ball"
        className="ball"
        style={{
          top: `${ballPos.y}px`,
          left: `${ballPos.x}px`,
        }}
      />

      <div className="power-bar">
        <div className="power-fill" style={{ width: `${power}%` }} />
      </div>
    </div>
  );
}

export default PinBall;

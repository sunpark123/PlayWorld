import React, { useState, useEffect, useRef } from "react";
import "./PinBall.css";
import Header from "../Header/Header";

function PinBall() {
  const [power, setPower] = useState(0);
  const [charging, setCharging] = useState(false);
  const [angle, setAngle] = useState(0);

  const bumpersRef = useRef([]);
  const [bumpers, setBumpers] = useState([]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(
    Number(localStorage.getItem("bestScore")) || 0
  );
  const bumperHitRef = useRef([]);

  const leftFlipperRef = useRef(null);
  const rightFlipperRef = useRef(null);

  const leftGuardRef = useRef(null);
  const rightGuardRef = useRef(null);

  const [ballPos, setBallPos] = useState({ x: 180, y: 10 });
  const [ballVel, setBallVel] = useState({ x: 0, y: 0 });
  const [ballHitsFlipper, setBallHitsFlipper] = useState(false);

  const containerRef = useRef(null);
  const [scale, setScale] = useState({ x: 1, y: 1 });

  /* ------------------ 공 vs 사각형 충돌 ------------------ */
  function circleRectCollision(cx, cy, r, rect) {
    const closestX = Math.max(rect.x, Math.min(cx, rect.x + rect.w));
    const closestY = Math.max(rect.y, Math.min(cy, rect.y + rect.h));
    const dx = cx - closestX;
    const dy = cy - closestY;
    return dx * dx + dy * dy < r * r;
  }

  function getRectPosition(el) {
    if (!el || !containerRef.current) return null;
    const rect = el.getBoundingClientRect();
    const container = containerRef.current.getBoundingClientRect();
    return {
      x: (rect.left - container.left) / scale.x,
      y: (rect.top - container.top) / scale.y,
      w: rect.width / scale.x,
      h: rect.height / scale.y,
    };
  }

  /* ------------------ 입력 처리 (스페이스바) ------------------ */
  useEffect(() => {
    const keyDown = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        setCharging(true);
      }
    };

    const keyUp = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        setCharging(false);

        // 스페이스바 떼면 회전 + 힘 적용
        const hitAngle = Math.min(power / 1.1, 45);
        setAngle(hitAngle);
        setTimeout(() => setAngle(0), 200);

        if (ballHitsFlipper) {
          setBallVel((prev) => ({ x: prev.x, y: prev.y - power / 3 }));
        }

        setPower(0);
        setBallHitsFlipper(false);
      }
    };

    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    return () => {
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
    };
  }, [power, ballHitsFlipper]);

  /* ------------------ 파워 충전 ------------------ */
  useEffect(() => {
    let t;
    if (charging) {
      t = setInterval(() => {
        setPower((p) => Math.min(p + 5, 100));
      }, 30);
    }
    return () => clearInterval(t);
  }, [charging]);

  /* ------------------ 범퍼 좌표 계산 ------------------ */
  useEffect(() => {
    const updateBumpers = () => {
      if (!containerRef.current) return;
      const container = containerRef.current.getBoundingClientRect();
      const list = bumpersRef.current.map((el) => {
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        return {
          x: (rect.left - container.left + rect.width / 2) / scale.x,
          y: (rect.top - container.top + rect.height / 2) / scale.y,
          r: (rect.width / 2) / scale.x,
        };
      });
      setBumpers(list);
    };
    updateBumpers();
    window.addEventListener("resize", updateBumpers);
    return () => window.removeEventListener("resize", updateBumpers);
  }, [scale]);

  /* ------------------ 공 물리 업데이트 ------------------ */
  useEffect(() => {
    const gravity = 0.6;
    const radius = 49;

    const update = () => {
      setBallPos((prev) => {
        let x = prev.x;
        let y = prev.y;
        let vx = ballVel.x;
        let vy = ballVel.y + gravity;

        const steps = 4;
        for (let i = 0; i < steps; i++) {
          x += vx / steps;
          y += vy / steps;

          // 화면 벽 충돌
          if (x < 0) { x = 0; vx *= -0.9; }
          if (x > 370) { x = 370; vx *= -0.9; }
          if (y > 1000) { y = 1000; vy *= -0.6; }
          if (y < 0) { y = 0; vy *= -0.6;}

          /* ------------------ 범퍼 충돌 ------------------ */
          bumpers.forEach((b) => {
            if (!b) return;
            const dx = x + radius / 2 - b.x;
            const dy = y + radius / 2 - b.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const limit = b.r + radius / 2;
            if (dist < limit) {
              const nx = dx / dist;
              const ny = dy / dist;
              const dot = vx * nx + vy * ny;
              vx -= 2 * dot * nx;
              vy -= 2 * dot * ny;
              vx *= 0.7; vy *= 0.7;
              const overlap = limit - dist + 0.5;
              x += nx * overlap;
              y += ny * overlap; // 범퍼와 닿으면 flipper 충돌 가능성 플래그

              if (!bumperHitRef.current[i]) {
                  setScore((prev) => prev + 1);
                  bumperHitRef.current[i] = true;
                }
            } else {
              bumperHitRef.current[i] = false;
            }
          });

          /* ------------------ 플리퍼 충돌 ------------------ */
          [leftFlipperRef.current, rightFlipperRef.current].forEach((f) => {
            if (!f) return;
            const rect = getRectPosition(f);
            if (!rect) return;

            const fx = rect.x + rect.w / 2;
            const fy = rect.y + rect.h / 2;

            const dx = x + radius / 2 - fx;
            const dy = y + radius / 2 - fy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const limit = rect.w / 2 + radius / 2;

            if (dist < limit) {
              const nx = dx / dist;
              const ny = dy / dist;
              const dot = vx * nx + vy * ny;
              vx -= 2 * dot * nx;
              vy -= 2 * dot * ny;

              // 충분히 바깥으로 밀어주기
              const overlap = limit - dist + 1;
              x += nx * overlap;
              y += ny * overlap;

              // 힘 적용은 스페이스바 떼기 전까지 무시
              setBallHitsFlipper(true);
            }
          });

          /* ------------------ 가드 충돌 ------------------ */
          const guards = [
            { el: leftGuardRef.current, angle: -30 },
            { el: rightGuardRef.current, angle: 30 },
          ];
          guards.forEach(({ el, angle }) => {
            if (!el) return;
            const rect = getRectPosition(el);
            if (!rect) return;
            const cx = x + radius / 2;
            const cy = y + radius / 2;
            const collided = circleRotatedRectCollision(cx, cy, radius / 2, rect, angle);
            if (collided) { vx *= -0.8; vy *= -0.8; }
          });

          function circleRotatedRectCollision(cx, cy, r, rect, angleDeg) {
            const angle = -angleDeg * (Math.PI / 180);
            const centerX = rect.x + rect.w / 2;
            const centerY = rect.y + rect.h / 2;
            const dx = cx - centerX;
            const dy = cy - centerY;
            const rx = dx * Math.cos(angle) - dy * Math.sin(angle) + centerX;
            const ry = dx * Math.sin(angle) + dy * Math.cos(angle) + centerY;
            return circleRectCollision(rx, ry, r, rect);
          }
        }

        setBallVel({ x: vx, y: vy });
        return { x, y };
      });
    };

    const t = setInterval(update, 16);
    return () => clearInterval(t);
  }, [ballVel, bumpers, scale]);

  useEffect(() => {
    if (score > bestScore) {
      setBestScore(score);
      localStorage.setItem("bestScore", score);
    }
  }, [score, bestScore]);

  /* ------------------ 화면 스케일 ------------------ */
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setScale({ x: rect.width / 400, y: rect.height / 800 });
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  /* ------------------ 렌더링 ------------------ */
  return (
    <>
    <Header />
    <div className="pinball-score-panel">
      <div>Score: {score/2}</div>
      <div>Best: {bestScore/2}</div>
    </div>
    <div className="pinball-container" ref={containerRef}>
      <img src="/background.png" className="background" alt="" />
      {[1, 2, 3].map((n, i) => (
        <div key={n} className={`bumper bumper${n}`} ref={(el) => (bumpersRef.current[i] = el)} />
      ))}
      <div className="guard left-guard" ref={leftGuardRef} />
      <div className="guard right-guard" ref={rightGuardRef} />

      <img
        src="/flipper_left.png"
        className="flipper left"
        alt=""
        ref={leftFlipperRef}
        style={{ transform: `rotate(${-angle}deg)` }}
      />
      <img
        src="/flipper_right.png"
        className="flipper right"
        alt=""
        ref={rightFlipperRef}
        style={{ transform: `rotate(${angle}deg)` }}
      />

      <img
        src="/ball.png"
        className="ball"
        alt=""
        style={{
          top: `${ballPos.y * scale.y}px`,
          left: `${ballPos.x * scale.x}px`,
          width: `${98 * scale.x}px`,
          height: `${98 * scale.y}px`,
        }}
      />

      <div className="power-bar">
        <div className="power-fill" style={{ width: `${power}%` }} />
      </div>
    </div>
    </>
  );
}

export default PinBall;

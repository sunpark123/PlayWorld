import React, { useEffect, useRef, useState } from "react";
import "./PinBall.css";
import Header from "../Header/Header";

function PinBall() {
  const canvasRef = useRef(null);
  const [power, setPower] = useState(0);
  const [charging, setCharging] = useState(false);
    const [angle, setAngle] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = 400;
    canvas.height = 600;

    let ball = { x: 200, y: 550, radius: 8, dx: 0, dy: 0 };
    const gravity = 0.3;

    // ✅ 범퍼 세 개
    const bumpers = [
      { x: 100, y: 200, r: 25 },
      { x: 200, y: 300, r: 25 },
      { x: 300, y: 200, r: 25 },
    ];

    // ✅ 플리퍼 두 개 (좌우)
    let leftFlipper = { x: 150, y: 540, width: 60, height: 10, angle: 0, velocity: 0 };
    let rightFlipper = { x: 250, y: 540, width: 60, height: 10, angle: 0, velocity: 0 };

    // 🎨 공 그리기
    function drawBall() {
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = "#0ff";
      ctx.fill();
      ctx.closePath();
    }

    // 🎨 범퍼 그리기
    function drawBumpers() {
      bumpers.forEach((b) => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = "#6600ff";
        ctx.fill();
        ctx.strokeStyle = "#99f";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
      });
    }

    // 🎨 플리퍼 그리기
    function drawFlipper(f, isLeft = true) {
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.rotate((isLeft ? -1 : 1) * f.angle);
      ctx.fillStyle = "#0f0";
      ctx.fillRect(-f.width / 2, -f.height / 2, f.width, f.height);
      ctx.restore();
    }

    // 🎨 파워 게이지
    function drawPowerBar() {
      ctx.fillStyle = "#444";
      ctx.fillRect(50, 570, 300, 10);
      ctx.fillStyle = "#0f0";
      ctx.fillRect(50, 570, 3 * power, 10);
    }

    // ⚙ 공과 범퍼 충돌
    function checkBumperCollision() {
      bumpers.forEach((b) => {
        const dx = ball.x - b.x;
        const dy = ball.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < ball.radius + b.r) {
          const nx = dx / dist;
          const ny = dy / dist;
          const dot = ball.dx * nx + ball.dy * ny;

          ball.dx -= 2 * dot * nx;
          ball.dy -= 2 * dot * ny;

          const overlap = ball.radius + b.r - dist;
          ball.x += (nx * overlap) / 2;
          ball.y += (ny * overlap) / 2;
        }
      });
    }

    // ⚙ 플리퍼 물리
    function updateFlipper(f) {
      f.angle += f.velocity;
      f.velocity *= 0.85; // 감속

      // 회전 한계
      if (f.angle > Math.PI / 4) f.angle = Math.PI / 4;
      if (f.angle < 0) f.angle = 0;
    }

    // ⚙ 메인 루프
    function update() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawBumpers();
      drawBall();
      drawFlipper(leftFlipper, true);
      drawFlipper(rightFlipper, false);
      drawPowerBar();

      updateFlipper(leftFlipper);
      updateFlipper(rightFlipper);

      // 중력
      if (ball.dy !== 0 || ball.y < 550) {
        ball.dy += gravity;
        ball.y += ball.dy;
        ball.x += ball.dx;

        // 하단 충돌
        if (ball.y + ball.radius > 550) {
          ball.y = 550 - ball.radius;
          ball.dy *= -0.5;
        }

        // 좌우 벽 충돌
        if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
          ball.dx *= -1;
        }

        // 범퍼 충돌
        checkBumperCollision();
      }

      requestAnimationFrame(update);
    }

    update();

    // 🔘 키 입력
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
        // 스페이스바를 떼면 현재 power 만큼 회전
        const hitAngle = Math.min(power / 2, 45); // 최대 45도 제한
        setAngle(hitAngle);

        // 플리퍼가 돌아갔다가 다시 제자리로
        setTimeout(() => {
          setAngle(0);
        }, 200);

        // power 초기화
        setPower(0);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [power, charging]);

  // ⚙ 파워 충전 루프
  useEffect(() => {
    let interval;
    if (charging) {
      interval = setInterval(() => {
        setPower((prev) => Math.min(prev + 2, 100));
      }, 30);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [charging]);

  return (
    <>
      <Header />
      <div className="pinball-container">
        <canvas ref={canvasRef}></canvas>
        <p className="power-text">Power: {power}</p>
      </div>
    </>
  );
}

export default PinBall;

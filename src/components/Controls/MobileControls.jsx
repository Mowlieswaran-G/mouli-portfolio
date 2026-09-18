import React, { useRef, useState, useEffect } from 'react';

export const MobileControls = ({ onJoystickMove, onJump, onSprintToggle, onInteract }) => {
  const joystickRef = useRef(null);
  const [touching, setTouching] = useState(false);
  const [thumbPos, setThumbPos] = useState({ x: 0, y: 0 });
  const [isSprinting, setIsSprinting] = useState(false);

  const maxRadius = 35;

  const handleTouchStart = (e) => {
    setTouching(true);
    handleTouchMove(e);
  };

  const handleTouchMove = (e) => {
    if (!joystickRef.current) return;
    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const touch = e.touches[0];
    const dx = touch.clientX - centerX;
    const dy = touch.clientY - centerY;

    const distance = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx);

    const clampedDist = Math.min(distance, maxRadius);
    const thumbX = Math.cos(angle) * clampedDist;
    const thumbY = Math.sin(angle) * clampedDist;

    setThumbPos({ x: thumbX, y: thumbY });

    // Normalize to -1..1 (invert Y because up is negative Y in screen coords)
    const normX = thumbX / maxRadius;
    const normY = -thumbY / maxRadius;
    onJoystickMove({ x: normX, y: normY });
  };

  const handleTouchEnd = () => {
    setTouching(false);
    setThumbPos({ x: 0, y: 0 });
    onJoystickMove({ x: 0, y: 0 });
  };

  return (
    <div className="md:hidden">
      {/* Virtual Joystick */}
      <div
        ref={joystickRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="virtual-joystick-base select-none"
      >
        <div
          className="virtual-joystick-thumb"
          style={{
            transform: `translate(${thumbPos.x}px, ${thumbPos.y}px)`
          }}
        />
      </div>

      {/* Action Buttons */}
      <div className="mobile-actions-container">
        {/* Interact */}
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            onInteract();
          }}
          className="mobile-action-btn"
        >
          [E]
        </button>

        {/* Jump */}
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            onJump();
          }}
          className="mobile-action-btn"
        >
          JUMP
        </button>

        {/* Sprint */}
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            const next = !isSprinting;
            setIsSprinting(next);
            onSprintToggle(next);
          }}
          className={`mobile-action-btn text-xs ${isSprinting ? 'bg-cyan-400 text-black' : ''}`}
        >
          RUN
        </button>
      </div>
    </div>
  );
};

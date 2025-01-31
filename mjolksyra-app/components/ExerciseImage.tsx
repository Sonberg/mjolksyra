/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from "react";

type ExerciseImageProps = {
  images: string[];
};

export function ExerciseImage({ images }: ExerciseImageProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [images.length, isPaused]);

  if (!images.length) {
    return null;
  }

  return (
    <div
      className="relative w-full h-64 flex justify-center items-center"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <img
        src={`/exercises/${images[currentIndex]}`}
        alt="Slideshow"
        className="w-full h-full object-cover transition-opacity duration-500"
      />
    </div>
  );
}

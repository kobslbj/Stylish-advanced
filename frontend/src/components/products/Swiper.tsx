/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from "react";
import image1 from "../../assets/swiper-images/swiper1.png";
import image2 from "../../assets/swiper-images/swiper2.png";
import image3 from "../../assets/swiper-images/swiper3.png";

const images = [
  {
    id: 1,
    image: image1,
    description: "picture1",
  },
  {
    id: 2,
    image: image2,
    description: "picture2",
  },
  {
    id: 3,
    image: image3,
    description: "picture3",
  },
];

const Swiper: React.FC = () => {
  const [currentImage, setCurrentImage] = useState<number>(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const autoPlayTimeoutRef = useRef<number>();

  const nextSlide = () => setCurrentImage((currentImage + 1) % images.length);

  useEffect(() => {
    const handleAutoPlay = () => {
      if (isAutoPlay) {
        autoPlayTimeoutRef.current = setTimeout(nextSlide, 5000);
      } else {
        clearTimeout(autoPlayTimeoutRef.current!);
      }
    };

    handleAutoPlay();

    return () => clearTimeout(autoPlayTimeoutRef.current!);
  }, [isAutoPlay, currentImage]);

  const handleDotClick = (index: number) => {
    setCurrentImage(index - 1);
    setIsAutoPlay(false);
  };

  const handleMouseEnter = () => {
    setIsAutoPlay(false);
    clearTimeout(autoPlayTimeoutRef.current!);
  };

  const handleMouseLeave = () => setIsAutoPlay(true);

  useEffect(() => {
    if (isAutoPlay) {
      autoPlayTimeoutRef.current = setTimeout(nextSlide, 5000);
    }
  }, [currentImage]);

  return (
    <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <img
        src={images[currentImage].image}
        alt={images[currentImage].description}
        className="w-full h-[11.563rem] lg:h-[31.25rem] cursor-pointer object-cover"
      />
      <div className="absolute flex space-x-2 transform -translate-x-1/2 bottom-4 left-1/2">
        {images.map((image) => (
          <button
            key={image.id}
            type="button"
            onClick={() => handleDotClick(image.id)}
            className={`w-2.5 h-2.5 rounded-full bg-[#FFFFFF66] ${currentImage === image.id - 1 ? "bg-brown" : ""}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Swiper;

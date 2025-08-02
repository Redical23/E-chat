"use client";

import React, { useRef, useState } from "react";
import ReactCrop, { centerCrop, convertToPixelCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { motion } from "framer-motion";
import { useModelContext } from "../context/Context";
import setCanvasPreview from "./setCanvasPreview";

const ImageCropper = () => {
  const imgRef = useRef(null);
  const { isModelOpen, setIsModelOpen, setupdateAvtarURL } = useModelContext();
  const [imgSrc, setImgSrc] = useState("");
  const [crop, setCrop] = useState(null);
  const [error, setError] = useState("");

  const aspectRatio = 1;
  const minWidth = 150;

  const closeModels = () => setIsModelOpen(!isModelOpen);

  const onSelectFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const imageElement = new Image();
      const imageUrl = reader.result?.toString() || "";
      imageElement.src = imageUrl;

      imageElement.onload = (event) => {
        if (error) setError("");

        const { naturalWidth, naturalHeight } = event.currentTarget;
        if (naturalWidth < minWidth || naturalHeight < minWidth) {
          setError("Error: Image size is too small.");
          return setImgSrc("");
        }
      };

      setImgSrc(imageUrl);
    };

    reader.readAsDataURL(file);
  };

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    const cropWithPercent = (minWidth / width) * 100;

    const initialCrop = makeAspectCrop(
      {
        unit: "%",
        width: cropWithPercent,
      },
      aspectRatio,
      width,
      height
    );

    setCrop(centerCrop(initialCrop, width, height));
  };

  const handleCrop = () => {
    const canvas = document.createElement("canvas");
    setCanvasPreview(
      imgRef.current,
      canvas,
      convertToPixelCrop(crop, imgRef.current.width, imgRef.current.height)
    );
    const dataUrl = canvas.toDataURL();
    setupdateAvtarURL(dataUrl);
    closeModels();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center bg-gray-900 p-6 rounded-lg shadow-lg max-w-lg w-full mx-auto"
    >
      <input 
        type="file" 
        accept="image/*" 
        onChange={onSelectFile} 
        className="mb-3 text-white w-full border border-gray-700 p-2 rounded-md"
      />
      
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {imgSrc && (
        <div className="flex flex-col items-center w-full">
          <ReactCrop
            onChange={(pixelCrop, percentCrop) => setCrop(percentCrop)}
            crop={crop}
            circularCrop
            keepSelection
            aspect={aspectRatio}
            minWidth={minWidth}
            className="mb-4"
          >
            <img ref={imgRef} src={imgSrc} alt="upload" className="max-w-[70vh] rounded-lg" onLoad={onImageLoad} />
          </ReactCrop>

          <button
            onClick={handleCrop}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg transition-all w-full"
          >
            Crop & Save
          </button>
        </div>
      )}

      <button onClick={closeModels} className="mt-4 text-gray-300 hover:text-white w-full">
        Close
      </button>
    </motion.div>
  );
};

export default ImageCropper;

"use client";

import React from "react";
import { motion } from "framer-motion";
import IMAGECROPPER from "./IMAGECROPPER";

const Models = ({ updateAvtarURL, closeModels }) => {
  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-gray-900 bg-opacity-75 backdrop-blur-sm">
      {/* Background Overlay (Closes Modal on Click) */}
      <div className="absolute inset-0" onClick={closeModels}></div>

      {/* Animated Modal */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative w-11/12 sm:w-4/5 md:w-3/5 lg:w-1/2 xl:w-1/3 min-h-60vh rounded-2xl bg-gray-800 text-slate-100 shadow-xl flex flex-col"
      >
        {/* Close Button */}
        

        {/* Image Cropper Section */}
        <div className="p-5 flex flex-col items-center">
          <IMAGECROPPER updateAvtarURL={updateAvtarURL} closeModels={closeModels} />
        </div>
      </motion.div>
    </div>
  );
};

export default Models;

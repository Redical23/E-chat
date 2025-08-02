"use client"
    
    import React from 'react'
    import Models from '../components/Models';
    import { useModelContext } from "./Context";
    const Contentwapper = ({ children }) => {
        const { isModelOpen } = useModelContext();
      return (
        
          <div className="min-h-screen">
        {children}
        {isModelOpen && <Models />}
      </div>
        
      )
    }
    
    export default Contentwapper
    
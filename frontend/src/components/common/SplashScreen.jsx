import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import logo from '../../assets/logo.svg';
import BrandText from './BrandText';
import './SplashScreen.css';

const SplashScreen = ({ onComplete }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete();
        }, 3000); // 3 seconds splash
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="splash-screen">
            <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="splash-content"
            >
                <div className="logo-wrapper">
                    <motion.img 
                        src={logo} 
                        alt="NAMMA CLINIC" 
                        animate={{ 
                            scale: [0.9, 1],
                            opacity: [0, 1]
                        }}
                        transition={{ 
                            duration: 1.2,
                            ease: "easeOut"
                        }}
                    />
                </div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="flex justify-center"
                >
                    <BrandText className="text-4xl" />
                </motion.div>
                <motion.div 
                    className="loading-bar-container"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                >
                    <motion.div 
                        className="loading-bar-fill"
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2.5, ease: "easeInOut" }}
                    ></motion.div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default SplashScreen;

import React from 'react';
import { motion } from 'framer-motion';
import './Hero.css';

const Hero = () => {
    return (
        <section className="hero">
            <div className="hero-bg-overlay"></div>
            <div className="container hero-content">
                <motion.h1
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="hero-title"
                >
                    Curated Journeys <br />
                    <span>Through Indias Heritage</span>
                </motion.h1>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.6, ease: "easeOut" }}
                    className="hero-actions"
                >
                    <button className="btn-primary">Explore Destinations</button>
                    <button className="btn-secondary">View Experiences</button>
                </motion.div>
            </div>
        </section>
    );
};

export default Hero;

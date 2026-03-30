import React from 'react';
import { motion } from 'framer-motion';
import './StateSection.css';

const StateSection = ({ state, reverse, onDiscoverMore }) => {
    return (
        <section id={state.id} className={`state-section ${reverse ? 'reverse' : ''}`}>
            <div className="container state-container">
                <motion.div
                    className="state-image-wrapper"
                    initial={{ opacity: 0, x: reverse ? 50 : -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <div className="image-container">
                        <img src={state.image} alt={state.title} loading="lazy" />
                        <div className="image-overlay"></div>
                    </div>
                </motion.div>

                <motion.div
                    className="state-content"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                >
                    <span className="state-subtitle">{state.subtitle}</span>
                    <h2 className="state-title">{state.title}</h2>
                    <p className="state-description">{state.description}</p>
                    <button
                        className="btn-explore"
                        style={{ '--hover-color': state.color }}
                        onClick={onDiscoverMore}
                    >
                        Discover More
                    </button>
                </motion.div>
            </div>
        </section>
    );
};

export default StateSection;

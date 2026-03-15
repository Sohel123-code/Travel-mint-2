import React from 'react';
import { motion } from 'framer-motion';
import './RoutesAndFares.css';

const RoutesAndFares = ({ onOpenSearch }) => {
    return (
        <section className="routes-fares-section" id="routes-fares">
            <div className="rf-bg-overlay" />
            <div className="rf-content">
                <motion.div
                    className="rf-badge"
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    ✈ &nbsp;Real-Time Availability
                </motion.div>

                <motion.h2
                    className="rf-title"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.15 }}
                >
                    Routes &amp; Fares
                </motion.h2>

                <motion.p
                    className="rf-subtitle"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.3 }}
                >
                    Check live flight schedules &amp; train availability across India.<br />
                    Plan your journey with real-time data, instantly.
                </motion.p>

                <motion.div
                    className="rf-cta-group"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.45 }}
                >
                    <button
                        className="rf-btn rf-btn-flight"
                        onClick={() => onOpenSearch('flight')}
                    >
                        <span className="rf-btn-icon">✈</span>
                        Search Flights
                    </button>
                    <button
                        className="rf-btn rf-btn-train"
                        onClick={() => onOpenSearch('train')}
                    >
                        <span className="rf-btn-icon">🚆</span>
                        Search Trains
                    </button>
                </motion.div>

                <motion.div
                    className="rf-stats"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                >
                    <div className="rf-stat">
                        <span className="rf-stat-num">500+</span>
                        <span className="rf-stat-label">Airlines</span>
                    </div>
                    <div className="rf-stat-divider" />
                    <div className="rf-stat">
                        <span className="rf-stat-num">1,200+</span>
                        <span className="rf-stat-label">Train Routes</span>
                    </div>
                    <div className="rf-stat-divider" />
                    <div className="rf-stat">
                        <span className="rf-stat-num">Real-Time</span>
                        <span className="rf-stat-label">Availability Data</span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default RoutesAndFares;

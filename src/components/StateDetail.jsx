import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Landmark, Utensils, Compass, Camera, ArrowRight, LayoutDashboard } from 'lucide-react';
import TopAttractions from './TopAttractions';
import AttractionDetail from './AttractionDetail';
import LocalCuisine from './LocalCuisine';
import './StateDetail.css';

const ModuleCard = ({ module, stateColor, onExplore }) => {
    const Icon = module.icon;

    return (
        <motion.div
            className="module-card"
            whileHover={{ y: -10 }}
            transition={{ duration: 0.3 }}
        >
            <div className="module-card-icon" style={{ '--icon-bg': stateColor }}>
                <Icon size={32} />
            </div>
            <div className="module-card-content">
                <h3>{module.title}</h3>
                <p>{module.description}</p>
                <button
                    className="btn-explore-module"
                    style={{ '--btn-accent': stateColor }}
                    onClick={() => onExplore(module.id)}
                >
                    Explore Now
                    <ArrowRight size={16} />
                </button>
            </div>
        </motion.div>
    );
};

const StateDetail = ({ state, onBack }) => {
    const [activeModule, setActiveModule] = useState('dashboard');
    const [selectedAttraction, setSelectedAttraction] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [state.id, activeModule, selectedAttraction]);

    const subModules = [
        {
            id: 'attractions',
            title: 'Top Attractions',
            description: 'Discover the most iconic and breathtaking landmarks across the state.',
            icon: Landmark,
            component: TopAttractions
        },
        {
            id: 'food',
            title: 'Local Cuisine',
            description: 'Indulge in authentic flavors and traditional culinary masterpieces.',
            icon: Utensils,
            component: LocalCuisine
        },
        {
            id: 'culture',
            title: 'Culture & Heritage',
            description: 'Immerse yourself in rich history, colorful festivals, and old-world traditions.',
            icon: Compass
        },
        {
            id: 'photography',
            title: 'Photography Spots',
            description: 'Capture the perfect shot at these scenic and Instagram-worthy locations.',
            icon: Camera
        },
    ];

    const currentModule = subModules.find(m => m.id === activeModule);

    const handleAttractionClick = (attraction) => {
        setSelectedAttraction(attraction);
    };

    const handleBackToList = () => {
        setSelectedAttraction(null);
    };

    return (
        <div className="state-detail">
            {selectedAttraction ? (
                <AttractionDetail
                    attraction={selectedAttraction}
                    stateName={state.title}
                    onBack={handleBackToList}
                />
            ) : (
                <>
                    <header className="detail-header" style={{ '--accent': state.color }}>
                        <div className="header-bg">
                            <img src={state.image} alt={state.title} />
                            <div className="header-overlay"></div>
                        </div>

                        <div className="container header-content">
                            <div className="header-navigation">
                                {activeModule !== 'dashboard' && (
                                    <motion.button
                                        className="btn-back-dashboard"
                                        onClick={() => setActiveModule('dashboard')}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                    >
                                        <LayoutDashboard size={18} />
                                        Dashboard
                                    </motion.button>
                                )}
                            </div>

                            <motion.div
                                className="header-text"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                key={state.id}
                            >
                                <span className="state-label">{state.subtitle}</span>
                                <h1 className="state-name">{state.title}</h1>
                            </motion.div>
                        </div>
                    </header>

                    <main className="detail-dashboard">
                        <div className="container">
                            <AnimatePresence mode="wait">
                                {activeModule === 'dashboard' ? (
                                    <motion.div
                                        key="grid"
                                        className="module-grid"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.4 }}
                                    >
                                        {subModules.map((module) => (
                                            <ModuleCard
                                                key={module.id}
                                                module={module}
                                                stateColor={state.color}
                                                onExplore={(id) => setActiveModule(id)}
                                            />
                                        ))}
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="module-detail"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.4 }}
                                    >
                                        {currentModule && currentModule.component ? (
                                            <currentModule.component
                                                stateId={state.id}
                                                stateName={state.title}
                                                onAttractionClick={handleAttractionClick}
                                            />
                                        ) : (
                                            <div className="module-placeholder">
                                                <h2>{currentModule.title} Coming Soon</h2>
                                                <p>We're currently gathering the best local insights for {state.title}.</p>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </main>
                </>
            )}
        </div>
    );
};

export default StateDetail;

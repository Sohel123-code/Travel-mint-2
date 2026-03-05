import React, { useState, useEffect } from 'react';
import './Navbar.css';

const Navbar = ({ onHome, onStateClick, onFaresClick, onSidebarOpen }) => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleNavClick = (e, id) => {
        e.preventDefault();
        onStateClick(id);
        setMobileMenuOpen(false);
    };

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="container navbar-content">
                <div className="logo" onClick={onHome} style={{ cursor: 'pointer' }}>
                    <img src="/assets/logo.png" alt="Travel Mint" />
                    <span>Travel Mint</span>
                </div>

                <div
                    className={`nav-toggle ${mobileMenuOpen ? 'open' : ''}`}
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </div>

                <ul className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
                    <li><a href="#" onClick={(e) => { e.preventDefault(); onHome(); setMobileMenuOpen(false); }}>Home</a></li>
                    <li><a href="#rajasthan" onClick={(e) => handleNavClick(e, 'rajasthan')}>Rajasthan</a></li>
                    <li><a href="#himachal" onClick={(e) => handleNavClick(e, 'himachal')}>Himachal</a></li>
                    <li><a href="#uttarakhand" onClick={(e) => handleNavClick(e, 'uttarakhand')}>Uttarakhand</a></li>
                    <li>
                        <a href="#routes-fares" className="nav-fares-link"
                            onClick={(e) => { e.preventDefault(); onFaresClick && onFaresClick('flight'); setMobileMenuOpen(false); }}>
                            ✈ Fares &amp; Routes
                        </a>
                    </li>
                </ul>

                {/* Hamburger — always visible on all screen sizes, opens right sidebar */}
                <button
                    className="hamburger-btn"
                    onClick={onSidebarOpen}
                    aria-label="Open navigation menu"
                    title="Menu"
                >
                    <span />
                    <span />
                    <span />
                </button>
            </div>
        </nav>
    );
};

export default Navbar;

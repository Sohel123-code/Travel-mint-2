import React, { useState, useEffect } from 'react';
import './Navbar.css';
import Logo from '../Logo/Logo';

const Navbar = ({ onHome, onStateClick, onFaresClick, onSidebarOpen }) => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="container navbar-content">
                {/* Logo */}
                <div className="logo" onClick={onHome} style={{ cursor: 'pointer' }}>
                    <Logo />
                </div>

                {/* Desktop nav links — hidden on mobile */}
                <ul className="nav-links">
                    <li><a href="#" onClick={(e) => { e.preventDefault(); onHome(); }}>Home</a></li>
                    <li><a href="#rajasthan" onClick={(e) => { e.preventDefault(); onStateClick('rajasthan'); }}>Rajasthan</a></li>
                    <li><a href="#himachal" onClick={(e) => { e.preventDefault(); onStateClick('himachal'); }}>Himachal</a></li>
                    <li><a href="#uttarakhand" onClick={(e) => { e.preventDefault(); onStateClick('uttarakhand'); }}>Uttarakhand</a></li>
                    <li>
                        <a href="#routes-fares" className="nav-fares-link"
                            onClick={(e) => { e.preventDefault(); onFaresClick?.('flight'); }}>
                            ✈ Fares &amp; Routes
                        </a>
                    </li>
                </ul>

                {/* Single hamburger — opens unified sidebar on all screen sizes */}
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

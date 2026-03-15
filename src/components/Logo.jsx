import React from 'react';

const Logo = ({ className, style }) => {
    return (
        <svg 
            className={className}
            style={style}
            width="340" 
            height="90" 
            viewBox="0 0 340 90" 
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Location Pin */}
            <path d="M45 10 C25 10 15 25 15 38 C15 60 45 80 45 80 C45 80 75 60 75 38 C75 25 65 10 45 10Z" fill="#10b981"/>
            
            {/* Inner Circle */}
            <circle cx="45" cy="38" r="10" fill="white"/>
            
            {/* Leaf inside location */}
            <path d="M45 32 C40 35 42 44 48 44 C50 40 50 34 45 32Z" fill="#059669"/>
            
            {/* Airplane path */}
            <path d="M80 35 Q130 5 190 30" stroke="#06b6d4" strokeWidth="2" fill="none" strokeDasharray="5 4"/>
            
            {/* Airplane */}
            <polygon points="190,30 180,26 183,30 180,34" fill="#06b6d4"/>
            
            {/* Brand Name */}
            <text x="80" y="65" fontFamily="Poppins, Arial, sans-serif" fontSize="32" fontWeight="700" fill="#0f172a">
                Travel<tspan fill="#10b981">Mint</tspan>
            </text>
        </svg>
    );
};

export default Logo;

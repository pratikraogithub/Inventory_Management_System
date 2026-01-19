import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import "./Drawer.css";

export default function Drawer() {
    const [isOpen, setIsOpen] = useState(false);
    const [isDesktop, setIsDesktop] = useState(
        typeof window !== "undefined" ? window.innerWidth >= 992 : true
    );

    useEffect(() => {
        const handleResize = () => {
            const desktop = window.innerWidth >= 992;
            setIsDesktop(desktop);
            setIsOpen(desktop); // open on desktop, closed on mobile
        };

        window.addEventListener("resize", handleResize);
        handleResize(); // initial
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // helper to produce navlink class
    const navClass = ({ isActive }) => (isActive ? "drawer-link active" : "drawer-link");

    return (
        <>
            {/* burger button - only show on mobile */}
            {!isDesktop && (
                <button
                    className="burger-btn"
                    aria-label="Open navigation"
                    onClick={() => setIsOpen(true)}
                >
                    ☰
                </button>
            )}

            {/* Drawer / Sidebar */}
            <nav
                className={`drawer ${isOpen ? "open" : ""} ${isDesktop ? "desktop" : ""}`}
                aria-hidden={!isOpen && !isDesktop}
            >
                {/* close button only on mobile drawer */}
                {!isDesktop && (
                    <button
                        className="close-btn"
                        aria-label="Close navigation"
                        onClick={() => setIsOpen(false)}
                    >
                        ×
                    </button>
                )}

                <div className="drawer-header">
                    <div className="drawer-logo">📦</div>
                    <h4 className="drawer-title">Inventory</h4>
                </div>

                <ul className="drawer-links">
                    <li>
                        <NavLink to="/dashboard" end className={navClass}>
                            Dashboard
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/products" end className={navClass}>
                            Products
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/suppliers" end className={navClass}>
                            Suppliers
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/reports" end className={navClass}>
                            Reports
                        </NavLink>
                    </li>
                </ul>
            </nav>

            {/* overlay for mobile */}
            {!isDesktop && isOpen && <div className="drawer-overlay" onClick={() => setIsOpen(false)} />}
        </>
    );
}

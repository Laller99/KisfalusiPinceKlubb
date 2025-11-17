import React from "react";
import "./Footer.css";
import {
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaEnvelope,
  FaQuestionCircle,
  FaFileContract,
  FaLock,
  FaGithub
} from "react-icons/fa";

const Footer = () => {
  const socialLinks = [
    {
      href: "https://www.facebook.com/",
      icon: FaFacebook,
      alt: "Facebook Kezdőlap",
    },
    {
      href: "https://www.instagram.com/",
      icon: FaInstagram,
      alt: "Instagram Kezdőlap",
    },
    {
      href: "https://www.youtube.com/",
      icon: FaYoutube,
      alt: "YouTube Kezdőlap",
    },
    {
      href: "https://www.github.com/",
      icon: FaGithub,
      alt: "Github Kezdőlap",
    },
  ];

  // A Navigációs linkek és Fa ikonok
  const navLinks = [
    { href: "/contact", label: "Kapcsolat", icon: FaEnvelope }, // Fa-envelope (Boríték)
    { href: "/faq", label: "Gyakori kérdések", icon: FaQuestionCircle }, // Fa-question-circle
    { href: "/aszf", label: "ÁSZF", icon: FaFileContract }, // Fa-file-contract (Megállapodás)
    { href: "/privacy", label: "Adatvédelem", icon: FaLock }, // Fa-lock (Lakat)
  ];

  return (
    <footer id="footer" className="footer">
      <div className="footer-left">
        <div className="footer-logo">
          <img src="Image/PinceLogo.png" alt="" />
        </div>
      </div>

      <div className="footer-center">
        {navLinks.map((link) => (
          <a key={link.label} href={link.href} className="footer-link-icon">
            <link.icon size={16} className="link-icon-style" /> {link.label}
          </a>
        ))}
      </div>

      <div className="footer-right">
        <div className="socials">
          {socialLinks.map((social) => (
            <a
              key={social.alt}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              title={social.alt}
            >
              <social.icon size={24} color="#f1e0e0ff" />
            </a>
          ))}
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2025 Borászat | Minden jog fenntartva.</p>
      </div>
    </footer>
  );
};

export default Footer;

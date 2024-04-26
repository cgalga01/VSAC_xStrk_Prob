import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import logo from './Logo.png'
import './Footer.css'

// Ensure you update the path to your image logo
const Footer = () => {
  return (
    <footer className="footer">
      {/* Container for all footer items */}
      <div className="footer-content">
        {/* Logo on the left */}
        <div className="logo-container">
          <img src={logo} alt="Company Logo" className="logo-image" />
        </div>

        {/* Names in the center */}
        <div className="names-container">
          <h1>Created by the Villanova Sports Analytics Club </h1>
          <p>Christopher Galgano</p>
          <p>Michael Southwick</p>
          <p>Amélie Devine</p>
          <p>Stephen Cain</p>
          <p>Colin Hofmeister</p>
        </div>

        {/* GitHub link on the right */}
        <div className="github-container">
            <p>Github Website Link</p>
          <a href="https://github.com/cgalga01/VSAC_xStrk_Prob" target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={faGithub} />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import './Header.css';
import { Link } from "react-router-dom";

function Header() {
  return (
    <header className="header">
      {/* This header is displayed on every page with a nav bar */}
      <div className="nav-items">
        <Link to="/">
          Strike Probability
        </Link>

        <Link to='/Heatmap'>
          xStrk Heatmaps
        </Link>

      </div>
    </header>
  );
}

export default Header;

import MenuItem from "../style-components/MenuItem";
import BookNow from "../style-components/BookNow";
import HeaderServices from "./HeaderServices";
import { useLocation, useNavigate } from "react-router-dom";
import { scrollViewportTop } from '../../utils/scrollViewportTop';

function HeaderBar({ setShowBookNow, ourServicesOpen, setOurServicesOpen, texts, misc_texts }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = (path) => {
    setOurServicesOpen(false);

    if (location.pathname === path) {
      scrollViewportTop();
      return;
    }

    navigate(path);
  };

  // set localstorage for estonian or english
  const setLanguage = () => {
    const language = localStorage.getItem("language");
    localStorage.setItem("language", language === "ee" ? "en" : "ee");
    window.location.reload();
  };

  const homeText = texts && texts["home"] ? texts["home"].text : null;
  const ourServicesText = misc_texts && misc_texts["our-services"] ? misc_texts["our-services"].text : null;
  const ourStoryText = texts && texts["our-story"] ? texts["our-story"].text : null;
  const contactsText = texts && texts["contacts"] ? texts["contacts"].text : null;
  const eestiKeelesText = texts && texts["eesti-keeles"] ? texts["eesti-keeles"].text : null;

  return (
    <div className="header-bar">
      <div className="header-navigation">
        <div className="navigation-items">
          <MenuItem title={homeText} onClick={() => handleClick("/")} />
          <MenuItem title={ourServicesText} dropdown selected={ourServicesOpen} onClick={() => setOurServicesOpen(!ourServicesOpen)} />
          <MenuItem title={ourStoryText} onClick={() => handleClick("/story")} />
          <MenuItem title={contactsText} onClick={() => handleClick("/contacts")} />
        </div>
        <div className="header-actions">
          <div className="action language">
            <span onClick={setLanguage} style={{ cursor: "pointer" }}>{eestiKeelesText}</span>
          </div>
          <div className="action book-now" onClick={() => setShowBookNow(true)}>
            <BookNow texts={texts} />
          </div>
        </div>
      </div>
      <div
        className="large-dropdown"
        style={ourServicesOpen ? null : { display: "none" }}
      >
        <HeaderServices texts={misc_texts} setOurServicesOpen={setOurServicesOpen} mobile={false} />
      </div>
    </div>
  );
}

export default HeaderBar;

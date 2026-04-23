import FooterContactDetails from './FooterContactDetails.jsx';

function FooterColumnMiddle({ texts, content = null }) {
  return (
    <div className="footer-column footer-column-middle">
      <FooterContactDetails texts={texts} content={content} />
    </div>
  );
}

export default FooterColumnMiddle;

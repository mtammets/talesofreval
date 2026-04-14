import React from "react";
import ButtonSecondary from "./style-components/ButtonSecondary";
import google_logo from "../img/google-logo.png";
import paypal_logo from "../img/paypal-logo.png";
import apple_logo from "../img/apple-logo.png";
import wise_logo from "../img/wise-logo.png";
import revolut_logo from "../img/revolut-logo.png";
import CancelButton from "./style-components/CancelButton";

function PaymentCard({ name, links, closePaymentCard }) {
  // Transform the links array into a map
  console.log(links)
  const linkMap = links.reduce((acc, link) => {
    acc[link.name] = link.link;
    return acc;
  }, {});

  // console.log(linkMap["Google Pay"]);

  return (
    <div className="payment-card-container">
      <div className="payment-card">
        <h2>Tip {name}</h2>
        <p className="padding-20-top">
          Did you enjoy touring with your guide? Send them a tip!
        </p>
        {links.length > 3 ? (
          <>
            <div className="payment-links padding-20-top">
              <a
                href={linkMap["Wise"]}
                className={`payment-link ${linkMap["Wise"] ? "" : "hidden"}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={wise_logo} alt="Wise" />
              </a>
              <a
                href={linkMap["Apple Pay"]}
                className={`payment-link ${linkMap["Apple Pay"] ? "" : "hidden"}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={apple_logo} alt="Apple Pay" />
              </a>
              <a
                href={linkMap["Google Pay"]}
                className= {`payment-link ${linkMap["Google Pay"] ? "" : "hidden"}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={google_logo} alt="Google Pay" />
              </a>
            </div>
            <div className="payment-links padding-20-top">
              <a
                href={linkMap["PayPal"]}
                className={`payment-link ${linkMap["PayPal"] ? "" : "hidden"}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={paypal_logo} alt="PayPal" />
              </a>
              <a
                href={linkMap["Revolut"]}
                className={`payment-link ${linkMap["Revolut"] ? "" : "hidden"}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={revolut_logo} alt="Revolut" />
              </a>
            </div>
          </>
        ) : (
          <>
            <div className="payment-links padding-20-top">
              <a
                href={linkMap["Wise"]}
                className={`payment-link ${linkMap["Wise"] ? "" : "hidden"}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={wise_logo} alt="Wise" />
              </a>
              <a
                href={linkMap["PayPal"]}
                className={`payment-link ${linkMap["PayPal"] ? "" : "hidden"}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={paypal_logo} alt="PayPal" />
              </a>
              <a
                href={linkMap["Revolut"]}
                className={`payment-link ${linkMap["Revolut"] ? "" : "hidden"}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img src={revolut_logo} alt="Revolut" />
              </a>
            </div>
          </>
        )}

        <div className="flex flex-end padding-20-top">
          <CancelButton text="Cancel" onClick={closePaymentCard} />
        </div>
      </div>
    </div>
  );
}

export default PaymentCard;

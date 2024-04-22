import stylesText from "data-text:./styles.module.css";
import type { PlasmoCSConfig } from "plasmo";
import styles from './styles.module.css';
import { useEffect, useState } from "react";
import { useStorage } from "@plasmohq/storage/hook";

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  run_at: "document_start",
};

export const getStyle = () => {
  const style = document.createElement("style");
  style.textContent = stylesText;
  return style;
};

const CheckoutPopup = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);

  const [darkMode] = useStorage("darkMode");

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === 'startLoading') {
          setLoading(true);
          setShowPopup(true);
      }
      if (event.data.type === 'doneLoading') {
          setItems(event.data.payload);
          setLoading(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  });

  if (!showPopup) {
    return undefined;
  }

  return (
    <div className={darkMode ? `${styles.popup} ${styles.darkMode}` : styles.popup}>
        <div className={styles.cartContainer}>
            {loading &&
              <div>
                <div>Analyzing your cart</div>
                <Spinner />
              </div>
            }
            {!loading && items.map((item, index) => (
                <div key={index} className={styles.item}>
                    <img src={item.image} alt={item.name} className={styles.image} />
                    <div className={styles.details}>
                        {item.title && <div className={styles.title}>{item.title}</div>}
                        <div className={styles.name}>{item.name}</div>
                        <div className={styles.description}>{item.description}</div>
                        <div className={styles.price}>${item.price}</div>
                        <div className={styles.quantity}>Qty: {item.quantity}</div>
                    </div>
                </div>
            ))}
        </div>
    </div>
    );
};

const Spinner = () => {
  return (
    <div className={styles.spinner}>
      <div className={styles.dot}></div>
      <div className={styles.dot}></div>
      <div className={styles.dot}></div>
    </div>
  );
};
 
export default CheckoutPopup;
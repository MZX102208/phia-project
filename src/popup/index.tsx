import { useStorage } from "@plasmohq/storage/hook"
import styles from "./styles.module.css";
import { useEffect } from "react";

function IndexPopup() {
  const [darkMode, setDarkMode] = useStorage("darkMode");
  
  useEffect(() => {
      document.body.className = darkMode ? styles.darkMode : styles.lightMode;
  }, [darkMode]);

  return (
    <div className={styles.container}>
        <h1 className={styles.title}>Dark Mode</h1>
        <label className={styles.switch}>
            <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
            <span className={styles.slider}></span>
        </label>
    </div>
  );
}

export default IndexPopup

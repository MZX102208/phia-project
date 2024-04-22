import type { PlasmoCSConfig } from "plasmo";
import parsePrice from "./utils/parsePrice";

export const config: PlasmoCSConfig = {
  matches: ["https://www.nike.com/checkout"],
  run_at: "document_idle",
};

// Send a message to the popup to slide into the screen and start loading
window.postMessage({
  type: 'startLoading',
}, '*');

// Wait for the network to idle before scraping the cart items
chrome.runtime.sendMessage({ type: "awaitNetworkIdle" }, function() {
  const items = [];
  const itemEls = document.querySelectorAll('figure[data-attr="cloud-cart-item"]');

  itemEls.forEach((itemEl) => {
    const name = itemEl.querySelector('div.css-1qpib4x').textContent;

    const sizeText = itemEl.querySelector('span[data-attr="itemSize"]').textContent;
    const colorText = itemEl.querySelector('div.css-ydw93h').textContent;
    const description = `${sizeText}, ${colorText}`;

    const quantityEl = Array.from(itemEl.querySelectorAll('div')).find(div => /Qty: \d+ @ \$\d+\.\d{2}/.test(div.textContent));
    
    const parsedQuantityString = quantityEl.textContent.replace('Qty: ', '').split(' @ ');
    const quantity = parseInt(parsedQuantityString[0]);
    const price = parsePrice(parsedQuantityString[1]);

    const image = itemEl.querySelector('img').src;

    items.push({ name, description, price, quantity, image });
  });
  
  // Send scraped cart items to the popup
  window.postMessage({
    type: 'doneLoading',
    payload: items
  }, '*');
});

// Empty export to keep plasmo happy
export default () => {};

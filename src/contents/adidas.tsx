import type { PlasmoCSConfig } from "plasmo";
import parsePrice from "./utils/parsePrice";

export const config: PlasmoCSConfig = {
  matches: ["https://www.adidas.com/us/checkout"],
  run_at: "document_idle",
};

// Send a message to the popup to slide into the screen and start loading
window.postMessage({
  type: 'startLoading',
}, '*');

// Wait for the network to idle before scraping the cart items
chrome.runtime.sendMessage({ type: "awaitNetworkIdle" }, function() {
  const items = [];
  const itemEls = document.querySelectorAll('div[data-auto-id="glass-order-summary-line-item"]');

  itemEls.forEach((itemEl) => {
    const name = itemEl.querySelector('div[data-auto-id="glass-order-summary-line-item-title"]').textContent;

    const price = parsePrice(itemEl.querySelector('div[data-auto-id="gl-price-item"]').textContent);

    // We need to get this container since there is no selector for the color element
    const lineItemAttrContainer = itemEl.querySelector('div[data-auto-id="glass-order-summary-line-item-attributes"]');
    // Format: "Size: <Size> / Quantity: <Quantity>"
    const parsedSizeQuantity = lineItemAttrContainer.children[0].textContent.split(' / ');
    const sizeText = parsedSizeQuantity[0];
    const quantity = parsedSizeQuantity[1].replace('Quantity: ', '');
    // The color text is only encapsulated in <div></div>
    const colorText = lineItemAttrContainer.children[1].textContent;

    const description = `${sizeText}, ${colorText}`;

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

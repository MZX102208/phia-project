import type { PlasmoCSConfig } from "plasmo";
import parsePrice from "./utils/parsePrice";

export const config: PlasmoCSConfig = {
  matches: ["https://www.saksfifthavenue.com/checkout/*"],
  run_at: "document_idle",
};

// Send a message to the popup to slide into the screen and start loading
window.postMessage({
  type: 'startLoading',
}, '*');

// Wait for the network to idle before scraping the cart items
chrome.runtime.sendMessage({ type: "awaitNetworkIdle" }, function() {
  const items = [];
  const itemEls = document.querySelectorAll('div.product-line-item-details');

  itemEls.forEach((itemEl) => {
    // There's hidden list and a visible list of the same cart items, we only want to count the visible ones
    if (!isVisible(itemEl)) return;

    const title = itemEl.querySelector('a.brand-name').textContent;

    const name = itemEl.querySelector('div.line-item-name').textContent;

    // Can either be shown as "$1,690.00 x 2" or just the price "$1,690.00", in which the quantity is 1
    const parsedSizeQuantity = itemEl.querySelector('div.line-item-total-price').textContent.split(' x ');
    const price = parsePrice(parsedSizeQuantity[0].replace('$', ''));
    const quantity = parsedSizeQuantity[1] ?? '1';
    
    // The description is in the format of <Color>, <Size>
    const description = itemEl.querySelector('div.selected-list').textContent;

    const image = itemEl.querySelector('img').src;

    items.push({ title, name, description, price, quantity, image });
  });
  
  // Send scraped cart items to the popup
  window.postMessage({
    type: 'doneLoading',
    payload: items
  }, '*');
});

function isVisible(element) {
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

// Empty export to keep plasmo happy
export default () => {};

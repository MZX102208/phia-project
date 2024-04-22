import type { PlasmoCSConfig } from "plasmo";

export const config: PlasmoCSConfig = {
  matches: ["https://secure-www.gap.com/checkout"],
  run_at: "document_idle",
};

// Send a message to the popup to slide into the screen and start loading
window.postMessage({
  type: 'startLoading',
}, '*');

/**
 * Gap does not display the cart items details in the checkout page. In order to access this information,
 * we need to fetch the cart items from the /get-bag endpoint with some required headers.
 */
fetch(`https://secure-www.gap.com/shopping-bag-xapi/get-bag`, {
  method: 'GET',
  headers: {
    brand: 'GP',
    brandtype: 'specialty',
    channel: 'WEB',
    market: 'US',
  }
})
  .then(res => res.json())
  .then(data => {
    const { productList } = data;
    const items = productList.map(product => {
      const {
        brandFullName: title,
        productName: name,
        finalItemPrice: price,
        quantity,
        imageUrl: image,
        size,
        productColor,
        productType
      } = product;

      const description = `Color: ${productColor} / Size: ${size} / ${productType}`;
      return { title, name, price, quantity, image, description };
    });

    // Send scraped cart items to the popup
    window.postMessage({
      type: 'doneLoading',
      payload: items
    }, '*');
  })
  .catch(error => console.error('Error fetching data:', error));

// Empty export to keep plasmo happy
export default () => {};

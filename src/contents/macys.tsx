import type { PlasmoCSConfig } from "plasmo";

export const config: PlasmoCSConfig = {
  matches: ["https://www.macys.com/my-checkout"],
  run_at: "document_idle",
};

// Send a message to the popup to slide into the screen and start loading
window.postMessage({
  type: 'startLoading',
}, '*');


/**
 * Macys does not display the cart items details in the checkout page. In order to access this information,
 * we need to fetch the cart items from the /my-bag endpoint. We can get the bag guid from the cookie "macys_bagguid".
 */
chrome.runtime.sendMessage({ type: "getCookie", url: "https://www.macys.com", cookieName: "macys_bagguid" }, function(cookie) {
  fetch(`https://www.macys.com/my-bag/${cookie.value}`)
    .then(res => res.json())
    .then(data => {
      const bagItems = data.bag.sections.bagItems.items;
      const items = bagItems.map(bagItem => {
        const { product, price: priceInfo, quantity } = bagItem;
        const title = product.detail.brand;
        const name = product.detail.name;

        // Destructure price info object to get the item value
        // If the item is on sale, the label will be "Sale". Otherwise there is no label
        const price = priceInfo.find(info => info.label === undefined || info.label === 'Sale').values[0].value;

        // The template for the image url; ex: "https://slimages.macysassets.com/is/image/MCY/products/[IMAGEFILEPATH]"
        const imageUrlTemplate = product.imagery.urlTemplate;
        // The actual filepath; ex: "9/optimized/27205389_fpx.tif"
        const imageFilePath = product.imagery.primaryImage.filePath;
        // Construct actual image url from template + filepath, remove any query params
        const image = imageUrlTemplate.replace('[IMAGEFILEPATH]', imageFilePath).replace(/\?.*$/, '');

        // Macys counts different sizes/colors as the same product
        const { colors, sizes } = product.traits;
        const colorsText = colors.join(', ');
        const sizesText = sizes.join(', ');
        const description = `Color: ${colorsText} / Size: ${sizesText}`;
        
        return { title, name, price, quantity, image, description };
      });

      // Send scraped cart items to the popup
      window.postMessage({
        type: 'doneLoading',
        payload: items
      }, '*');
    })
    .catch(error => console.error('Error fetching data:', error));
});

// Empty export to keep plasmo happy
export default () => {};

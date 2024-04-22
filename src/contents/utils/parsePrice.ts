/**
 * Tiny utility function to parse a price string into a number
 * @param price The price string to parse, can contain a dollar sign and commas
 */
export default function parsePrice(price: string): number {
  return parseFloat(price.replace('$', '').replace(',', ''));
};


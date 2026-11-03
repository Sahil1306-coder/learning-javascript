/**
 * Resolves chemical product images from Shivtek WordPress CDN or custom external URL
 */
export const resolveImageUrl = (img) => {
  if (!img) {
    return 'https://shivtekspechemi.com/wp-content/uploads/2026/07/card-image-30.webp';
  }
  if (img.startsWith('http://') || img.startsWith('https://')) {
    return img;
  }
  const month = img.includes('WhatsApp')
    ? '10'
    : img === 'Frame-1.webp' ||
      (img.startsWith('card-image-') &&
        ['28', '3-1', '29'].some((suffix) => img.includes(suffix)))
    ? '07'
    : '08';
  return `https://shivtekspechemi.com/wp-content/uploads/2026/${month}/${img}`;
};

const productCategories = {
  'Iphone 6 32gb': 'Phones',
  'Samsung galaxy s6': 'Phones',
  'Sony vaio i5': 'Laptops',
  'Apple monitor 24': 'Monitors',
};

function getCategoryForProduct(productName) {
  const category = productCategories[productName];

  if (!category) {
    throw new Error(`No category mapping exists for product "${productName}"`);
  }

  return category;
}

export { productCategories, getCategoryForProduct };

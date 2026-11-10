const BASE_URL = "https://world.openfoodfacts.org/api/v3";

export class ProductAPI {
 static async getProductByBarcode(barcode) {
  try {
    const response = await fetch(`${BASE_URL}/product/${barcode}`);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (data.status !== 1) {
      return null;
    }

    return data.product;
  } catch (error) {
    console.error("Failed to find product:", error);
    return null;
  }
}

 // Search for products by name
 static async searchProducts(query) {
  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=24&fields=code,product_name,brands,image_front_url,nutrition_grades,nutriments,categories_tags_en`;
    const response = await fetch(url);

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error("Failed to search products:", error);
    return [];
  }
 }

 // Find products from one category
 static async getProductsByCategory(category) {
  try {
    const url = `https://world.openfoodfacts.org/api/v2/search?categories_tags_en=${encodeURIComponent(category)}&page_size=24&fields=code,product_name,brands,image_front_url,nutrition_grades,nutriments,categories_tags_en`;
    const response = await fetch(url);

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error("Failed to get products by category:", error);
    return [];
  }
 }
}

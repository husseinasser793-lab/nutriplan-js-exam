
const BASE_URL = "https://www.themealdb.com/api/json/v1/1"

export class MealAPI {
    // Fetch all meal categories
    static async getCategories() {
        try {
            const response = await fetch(`${BASE_URL}/categories.php`)
            const data = await response.json()
            // an array of categories
            return data.categories
        } catch (error) {
            console.error("Failed to get categories", error);
            return []
        }
    }

    // Fetch meals by search query (or default 25 meals if query is empty)

    static async searchMeals(query = '') {
        try {
            const response = await fetch(`${BASE_URL}/search.php?s=${query}`)
            const data = await response.json()
            return data.meals || [];
        } catch (error) {
            console.log("Failed to search meals ", error);
            return []
        }
    }

    // Filter meals by category (like seafood or chicken etc)
    static async getMealsByCategory(category) { // "category" is the parameter
        try {
            const response = await fetch(`${BASE_URL}/filter.php?c=${category}`);
            const data = await response.json(); // ".json" turns the fetched data into javascript objects that can be used
            return data.meals || [];
        } catch (error) {
            console.error("Failed to filter meals by category:", error);
            return []; // "return" returns a blank array if it gets an error
        }
    }

     // Filter meals by cuisine/area (e.g. "Egyptian", "Italian")
  static async getMealsByArea(area) {
    try {
      const response = await fetch(`${BASE_URL}/filter.php?a=${area}`);
      const data = await response.json();
      return data.meals || [];
    } catch (error) {
      console.error("Failed to filter meals by area:", error);
      return [];
    }
  }

  // Get full meal details by its ID (ingredients, steps, video...)
  static async getMealById(id) {
    try {
      const response = await fetch(`${BASE_URL}/lookup.php?i=${id}`);
      const data = await response.json();
      return data.meals ? data.meals[0] : null;
    } catch (error) {
      console.error("Failed to fetch meal by ID:", error);
      return null;
    }
  }
}
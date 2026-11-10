/**
 * NutriPlan - Main Entry Point
 * 
 * This is the main entry point for the application.
 * Import your modules and initialize the app here.
 */

import { MealAPI } from "./api/mealdb.js";
import { ProductAPI } from "./api/openfoodfacts.js";
import { UI } from "./ui/components.js"

// function to make the app work

async function initAPP() {
    try {
        // 1. Fetch categories and some recipes to show when the page opens
        const categories = await MealAPI.getCategories();
        const meals = (await MealAPI.searchMeals("chicken")).slice(0, 25);

        // 2. Show the data on the page
        UI.renderCategories(categories);
        UI.renderRecipes(meals);

        // 3. Turn on the search and click features
        UI.makeSearch();
        UI.setupCategoryFilter();
        UI.setupAreaFilter();
        UI.setupFavorites();
        UI.setupRecipeClicks();
        UI.setupNavigation();
        setupBarcodeSearch();
        UI.setupProductSearch();
        UI.setupQuickLogActions();
    } finally {
        // Hide the loading screen after the first data request finishes
        document.getElementById("app-loading-overlay")?.classList.add("hidden");
    }
}

// Barcode Search Logic
function setupBarcodeSearch() {
  const button = document.getElementById("lookup-barcode-btn");
  const input = document.getElementById("barcode-input");
  const grid = document.getElementById("products-grid");
  const count = document.getElementById("products-count");

  if (!button || !input || !grid || !count) return;

  button.addEventListener("click", async () => {
    const barcode = input.value.trim();

    if (!barcode) {
      count.textContent = "Enter a barcode first";
      return;
    }

    count.textContent = "Searching...";
    const product = await ProductAPI.getProductByBarcode(barcode);

    if (!product) {
      grid.innerHTML = "";
      count.textContent = "Product not found";
      return;
    }

    UI.renderProducts([product]);
    count.textContent = "1 product found";
  });
}





// Start the app when the page loads
initAPP();

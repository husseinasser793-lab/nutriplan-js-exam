// =========== Loading Spinner Design ============
/*
<div class="flex items-center justify-center py-12">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
</div>
*/
import { FoodLog, Favorites } from "../state/appState.js";
import { MealAPI } from "../api/mealdb.js";     
import { ProductAPI } from "../api/openfoodfacts.js";

// =========== Empty State Design ============
/*
<div class="flex flex-col items-center justify-center py-12 text-center">
    <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <i class="fa-solid fa-search text-gray-400 text-2xl"></i>
    </div>
    <p class="text-gray-500 text-lg">No recipes found</p>
    <p class="text-gray-400 text-sm mt-2">Try searching for something else</p>
</div>
*/

export class UI {
  static currentMeals = [];
  //  Render(put) the category cards into sections of the category

  // Show the empty state design when no recipes are found
  static showEmptyState(container, message = "No recipes found") {
    if (!container) return;
    container.innerHTML = `
      <div class="col-span-full flex flex-col items-center justify-center py-12 text-center">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <i class="fa-solid fa-search text-gray-400 text-2xl"></i>
        </div>
        <p class="text-gray-500 text-lg font-medium">${message}</p>
        <p class="text-gray-400 text-sm mt-2">Try searching for something else</p>
      </div>
    `;
  }







  static renderCategories(categories) {
    const grid = document.getElementById("categories-grid")
    if (!grid) return;

    // Use .map() to transform each category object into an HTML string
    grid.innerHTML = categories.map((cat) => `
             
      <div class="category-card bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-3 border border-emerald-200 hover:border-emerald-400 hover:shadow-md cursor-pointer transition-all group"
        data-category="${cat.strCategory}"
      >
        <div class="flex items-center gap-2.5">
          <div
            class="text-white w-9 h-9 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm"
          >
            <i class="fa-solid fa-utensils"></i>
          </div>
          <div>
            <h3 class="text-sm font-bold text-gray-900">${cat.strCategory}</h3>
          </div>
        </div>
      </div>
    `).join("");
  }





  // Render meal cards into the recipes grid
  static renderRecipes(meals) {
    const grid = document.getElementById("recipes-grid")
    const countText = document.getElementById("recipes-count")
    UI.currentMeals = meals || [];
    // if anything other than grid returns
    if (!grid) return;

    //  if no meals are found , show the empty state
    if (!meals || meals.length === 0) {
      this.showEmptyState(grid, "No recipes found")
      if (countText) countText.textContent = "No recipes found"
      return
    }

    // 2. Render all recipe cards
    grid.innerHTML = meals.map((meal) => `
      <div
        class="recipe-card relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group"
        data-meal-id="${meal.idMeal}"
      >
        <button data-favorite-id="${meal.idMeal}" class="absolute z-10 right-3 top-3 w-10 h-10 rounded-full bg-white text-2xl text-red-500 shadow">
          ${Favorites.isFavorite(meal.idMeal) ? "♥" : "♡"}
        </button>
        <div class="relative h-48 overflow-hidden">
          <img
            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            src="${meal.strMealThumb}"
            alt="${meal.strMeal}"
            loading="lazy"
          />
          <div class="absolute bottom-3 left-3 flex gap-2">
            <span class="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-full text-gray-700">
              ${meal.strCategory || "Recipe"}
            </span>
            ${meal.strArea ? `
              <span class="px-2 py-1 bg-emerald-500 text-xs font-semibold rounded-full text-white">
                ${meal.strArea}
              </span>
            ` : ""}
          </div>
        </div>
        <div class="p-4">
          <h3 class="text-base font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1">
            ${meal.strMeal}
          </h3>
          <p class="text-xs text-gray-600 mb-3 line-clamp-2">
            ${meal.strInstructions || "Delicious recipe to try!"}
          </p>
          <div class="flex items-center justify-between text-xs">
            <span class="font-semibold text-gray-900">
              <i class="fa-solid fa-utensils text-emerald-600 mr-1"></i>
              ${meal.strCategory || "General"}
            </span>
            <span class="font-semibold text-gray-500">
              <i class="fa-solid fa-globe text-blue-500 mr-1"></i>
              ${meal.strArea || "International"}
            </span>
          </div>
        </div>
      </div>
    `).join("")

    //  Update the recipe count text
    if (countText) {
      countText.textContent = `Showing ${meals.length} recipes`
    }
  }

  // Save or remove a recipe when its heart button is clicked
  static setupFavorites() {
    const grid = document.getElementById("recipes-grid");
    if (!grid) return;

    grid.addEventListener("click", (event) => {
      const button = event.target.closest("[data-favorite-id]");
      if (!button) return;
      event.preventDefault();
      event.stopImmediatePropagation();

      const meal = UI.currentMeals.find((item) => item.idMeal === button.dataset.favoriteId);
      if (!meal) return;

      const isFavorite = Favorites.toggle(meal);
      button.textContent = isFavorite ? "♥" : "♡";
    });
  }


  // Variable to store our debounce timer 
  static searchTimer = null

  // Function to make the search
  static makeSearch = () => {
    const searchInput = document.getElementById("search-input")
    if (!searchInput) return;

    searchInput.addEventListener("input", (e) => {

      // 1. Clear any exsisting timer while user is still typing
      clearTimeout(UI.searchTimer)
      const query = e.target.value.trim()

      // 2. Wait 300ms after user stops typing
      UI.searchTimer = setTimeout(async () => {

        console.log("Searching for:", query);
        const meals = await MealAPI.searchMeals(query)
        UI.renderRecipes(meals)

      }, 300)
    });
  };

  // to Listen to clicks on the category cards
  static setupCategoryFilter() {
    const grid = document.getElementById("categories-grid")
    if (!grid) return;

    grid.addEventListener("click", async (e) => {

      // Find the closest category card clicked
      const card = e.target.closest(".category-card")
      if (!card) return;

      const categoryName = card.dataset.category;
      console.log("Filtering by category:", categoryName); // puts the static text then the name of the product that is being searched

      // Fetch and render the filtered meals by category
      const meals = await MealAPI.getMealsByCategory(categoryName);
      UI.renderRecipes(meals);
    });
  }

  // Listen for clicks on the Cuisine pills ("All Recipes", "Egyptain")
  static setupAreaFilter() {
    const pillContainer = document.querySelector("#search-filters-section .overflow-x-auto");
    if (!pillContainer) return;

    pillContainer.addEventListener("click", async (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;

      // 1. Update button styling (highlight the active pill)
      pillContainer.querySelectorAll("button").forEach((b) => {
        b.className = "px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium text-sm whitespace-nowrap hover:bg-gray-200 transition-all";
      });
      btn.className = "px-4 py-2 bg-emerald-600 text-white rounded-full font-medium text-sm whitespace-nowrap hover:bg-emerald-700 transition-all";

      const text = btn.textContent.trim();

      // 2. Fetch meals based on the clicked pill
      if (text === "All Recipes") {
        const meals = await MealAPI.searchMeals("");
        UI.renderRecipes(meals);
      } else {
        // Handle "Egyptain" -> API expects "Egyptian"
        const area = text.toLowerCase().includes("egypt") ? "Egyptian" : text;
        const meals = await MealAPI.getMealsByArea(area);
        UI.renderRecipes(meals);
      }
    });
  }

  // Listen for clicks on recipe cards
  static setupRecipeClicks() {
    const grid = document.getElementById("recipes-grid");
    if (!grid) return;

    grid.addEventListener("click", async (e) => {
      const card = e.target.closest(".recipe-card");
      if (!card) return;

      const mealId = card.dataset.mealId;
      console.log("Meal clicked! ID:", mealId);

      const meal = await MealAPI.getMealById(mealId);
      if (meal) {
        UI.renderMealDetails(meal);
        UI.showDetailsView();
      }
    });
  }

  // Render the full Meal Details page
  static renderMealDetails(meal) {
    const detailsSection = document.getElementById("meal-details");
    if (!detailsSection || !meal) return;

    // 1. Make a loop to get all the ingredients
    const ingredients = [];
for (let i = 1; i <= 20; i++) {
  const name = meal[`strIngredient${i}`];
  const measure = meal[`strMeasure${i}`];
  if (name && name.trim()) {
    ingredients.push({ name: name.trim(), measure: measure ? measure.trim() : "" });
  }
}

let youtubeEmbedUrl = ""
if (meal.strYoutube) {
  const videoId = meal.strYoutube.split("v=")[1]?.split("&")[0];
  if (videoId) youtubeEmbedUrl = `https://www.youtube.com/embed/${videoId}`;
}


// 3. Format instructions into paragraphs/steps
const steps = (meal.strInstructions || "")
  .split(/\r?\n/)
  .map((s) => s.trim())
  .filter((s) => s.length > 0);
// 4. Inject full HTML into the details section
detailsSection.innerHTML = `
      <div class="max-w-7xl mx-auto">
        <!-- Back Button -->
        <button
          id="back-to-meals-btn"
          class="flex items-center gap-2 text-gray-600 hover:text-emerald-600 font-medium mb-6 transition-colors cursor-pointer"
        >
          <i class="fa-solid fa-arrow-left"></i>
          <span>Back to Recipes</span>
        </button>
        <!-- Hero Section -->
        <div class="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div class="relative h-80 md:h-96">
            <img
              src="${meal.strMealThumb}"
              alt="${meal.strMeal}"
              class="w-full h-full object-cover"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
            <div class="absolute bottom-0 left-0 right-0 p-8">
              <div class="flex items-center gap-3 mb-3">
                <span class="px-3 py-1 bg-emerald-500 text-white text-sm font-semibold rounded-full">
                  ${meal.strCategory || "General"}
                </span>
                <span class="px-3 py-1 bg-blue-500 text-white text-sm font-semibold rounded-full">
                  ${meal.strArea || "International"}
                </span>
              </div>
              <h1 class="text-3xl md:text-4xl font-bold text-white mb-2">${meal.strMeal}</h1>
            </div>
          </div>
        </div>
        <!-- Action Button (Log This Meal) -->
        <div class="flex flex-wrap gap-3 mb-8">
          <button
            id="log-meal-btn"
            class="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all cursor-pointer"
            data-meal-id="${meal.idMeal}"
          >
            <i class="fa-solid fa-clipboard-list"></i>
            <span>Log This Meal</span>
          </button>
        </div>
        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Left Column: Ingredients & Instructions -->
          <div class="lg:col-span-2 space-y-8">
            <!-- Ingredients List -->
            <div class="bg-white rounded-2xl shadow-lg p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <i class="fa-solid fa-list-check text-emerald-600"></i>
                Ingredients
                <span class="text-sm font-normal text-gray-500 ml-auto">${ingredients.length} items</span>
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                ${ingredients
    .map(
      (ing) => `
                  <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span class="text-gray-700">
                      <span class="font-medium text-gray-900">${ing.measure}</span> ${ing.name}
                    </span>
                  </div>
                `
    )
    .join("")}
              </div>
            </div>
            <!-- Instructions -->
            <div class="bg-white rounded-2xl shadow-lg p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <i class="fa-solid fa-shoe-prints text-emerald-600"></i>
                Instructions
              </h2>
              <div class="space-y-4">
                ${steps
    .map(
      (step, idx) => `
                  <div class="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                    <div class="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 text-sm">
                      ${idx + 1}
                    </div>
                    <p class="text-gray-700 leading-relaxed pt-1">${step}</p>
                  </div>
                `
    )
    .join("")}
              </div>
            </div>
            <!-- YouTube Video Embed (if available) -->
            ${youtubeEmbedUrl
    ? `
              <div class="bg-white rounded-2xl shadow-lg p-6">
                <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <i class="fa-solid fa-video text-red-500"></i>
                  Video Tutorial
                </h2>
                <div class="relative aspect-video rounded-xl overflow-hidden bg-gray-100">
                  <iframe
                    src="${youtubeEmbedUrl}"
                    class="absolute inset-0 w-full h-full"
                    frameborder="0"
                    allowfullscreen
                  ></iframe>
                </div>
              </div>
            `
    : ""
  }
          </div>
          <!-- Right Column: Nutrition Facts -->
          <div class="space-y-6">
            <div class="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <i class="fa-solid fa-chart-pie text-emerald-600"></i>
                Nutrition Facts
              </h2>
              <div class="text-center py-4 mb-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl">
                <p class="text-sm text-gray-600">Nutrition facts are not provided by this recipe source.</p>
              </div>
              <div class="space-y-3 text-sm">
                <div class="flex justify-between py-2 border-b border-gray-100">
                  <span class="text-gray-600 font-medium">Protein</span>
                  <span class="font-bold text-gray-900">Not available</span>
                </div>
                <div class="flex justify-between py-2 border-b border-gray-100">
                  <span class="text-gray-600 font-medium">Carbohydrates</span>
                  <span class="font-bold text-gray-900">Not available</span>
                </div>
                <div class="flex justify-between py-2 border-b border-gray-100">
                  <span class="text-gray-600 font-medium">Fats</span>
                  <span class="font-bold text-gray-900">Not available</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // 5. Connect the "Back to Recipes" button
    document.getElementById("back-to-meals-btn")?.addEventListener("click", () => {
      UI.showMealsView();
    });

    // 6. Connect the "Log this Meal" button
    document.getElementById("log-meal-btn")?.addEventListener("click", () => {
      FoodLog.addMeal(meal)
      alert(`${meal.strMeal} logged. Nutrition facts are not available for this recipe.`)
    })

  }

  // Helper method: show the details view and hide the home grid
  static showDetailsView() {
    document.getElementById("search-filters-section")?.classList.add("hidden");
    document.getElementById("meal-categories-section")?.classList.add("hidden");
    document.getElementById("all-recipes-section")?.classList.add("hidden");
    document.getElementById("meal-details")?.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Helper method: show the home grid and hide details
  static showMealsView() {
    document.getElementById("meal-details")?.classList.add("hidden");
    document.getElementById("search-filters-section")?.classList.remove("hidden");
    document.getElementById("meal-categories-section")?.classList.remove("hidden");
    document.getElementById("all-recipes-section")?.classList.remove("hidden");
  }

  // Switch between the three main pages from the sidebar
  static setupNavigation() {
    const links = document.querySelectorAll(".nav-link");
    if (!links.length) return;

    const pages = {
      meals: ["search-filters-section", "meal-categories-section", "all-recipes-section"],
      products: ["products-section"],
      foodlog: ["foodlog-section"],
    };
    const titles = {
      meals: ["Meals & Recipes", "Discover delicious and nutritious recipes tailored for you"],
      products: ["Product Scanner", "Search for products and check their nutrition"],
      foodlog: ["Food Log", "Track and monitor your daily nutrition intake"],
    };

    const showPage = (page) => {
      if (!pages[page]) return;

      ["search-filters-section", "meal-categories-section", "all-recipes-section", "meal-details", "products-section", "foodlog-section"]
        .forEach((id) => document.getElementById(id)?.classList.add("hidden"));
      pages[page].forEach((id) => document.getElementById(id)?.classList.remove("hidden"));

      links.forEach((item) => {
        item.classList.remove("bg-emerald-50", "text-emerald-700");
        item.classList.add("text-gray-600");
      });
      const activeLink = Array.from(links).find((item) => {
        const label = item.textContent.trim();
        return page === "foodlog" ? label.includes("Food Log") : page === "products" ? label.includes("Product Scanner") : label.includes("Meals");
      });
      activeLink?.classList.add("bg-emerald-50", "text-emerald-700");
      activeLink?.classList.remove("text-gray-600");

      document.querySelector("#header h1").textContent = titles[page][0];
      document.querySelector("#header p").textContent = titles[page][1];
      if (page === "foodlog") UI.renderFoodLog();
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    links.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const label = link.textContent.trim();
        const page = label.includes("Food Log") ? "foodlog" : label.includes("Product Scanner") ? "products" : "meals";
        if (!pages[page]) return;
        history.pushState(null, "", `#${page}`);
        showPage(page);
      });
    });

    window.addEventListener("popstate", () => {
      const page = location.hash.slice(1);
      showPage(pages[page] ? page : "meals");
    });

    const requestedPage = location.hash.slice(1);
    const startingPage = pages[requestedPage] ? requestedPage : "meals";
    if (!pages[requestedPage]) history.replaceState(null, "", "#meals");
    showPage(startingPage);
  }

  // Keep the products we got from the API so the filters can use them
  static productResults = [];
  static productGrade = "";

  // Show product cards in the products grid
  static renderProducts(products) {
    UI.productResults = products || [];
    UI.showFilteredProducts();
  }

  // Show products that match the selected Nutri-Score
  static showFilteredProducts() {
    const grid = document.getElementById("products-grid");
    const count = document.getElementById("products-count");
    if (!grid || !count) return;

    const products = UI.productResults.filter((product) => {
      const grade = product.nutrition_grades || product.nutriscore_grade || "";
      return !UI.productGrade || grade.toLowerCase() === UI.productGrade;
    });

    grid.innerHTML = "";

    if (products.length === 0) {
      count.textContent = "No products found";
      grid.textContent = "Try another search or filter";
      return;
    }

    count.textContent = `Showing ${products.length} products`;

    products.forEach((product) => {
      const card = document.createElement("div");
      card.className = "product-card bg-white rounded-xl overflow-hidden shadow-sm p-4";

      const image = document.createElement("img");
      image.className = "w-full h-40 object-contain bg-gray-100 rounded-lg";
      image.alt = product.product_name || "Food product";
      const imageUrl = product.image_front_url || product.image_url || "";
      if (imageUrl) {
        image.src = imageUrl;
      } else {
        image.style.display = "none";
      }

      const name = document.createElement("h3");
      name.className = "font-bold text-gray-900 mt-3";
      name.textContent = product.product_name || "Unnamed product";

      const brand = document.createElement("p");
      brand.className = "text-sm text-gray-500";
      brand.textContent = product.brands || "Brand not listed";

      const grade = document.createElement("p");
      grade.className = "text-sm text-emerald-700 font-semibold mt-2";
      grade.textContent = `Nutri-Score: ${(product.nutrition_grades || product.nutriscore_grade || "not available").toUpperCase()}`;

      const nutrients = product.nutriments || {};
      const facts = document.createElement("p");
      facts.className = "text-sm text-gray-600 mt-2";
      facts.textContent = `Per 100g: ${nutrients["energy-kcal_100g"] || 0} kcal · Protein ${nutrients.proteins_100g || 0}g`;

      const logButton = document.createElement("button");
      logButton.className = "mt-3 px-4 py-2 bg-emerald-600 text-white rounded-lg";
      logButton.textContent = "Log Product";
      logButton.dataset.productCode = product.code || "";

      card.append(image, name, brand, grade, facts, logButton);
      grid.appendChild(card);
    });
  }

  // Connect the search, category, score, and log buttons
  static setupProductSearch() {
    const input = document.getElementById("product-search-input");
    const searchButton = document.getElementById("search-product-btn");
    const count = document.getElementById("products-count");
    const grid = document.getElementById("products-grid");
    if (!input || !searchButton || !count || !grid) return;

    const search = async (query) => {
      if (!query) {
        count.textContent = "Enter a product name first";
        return;
      }
      count.textContent = "Searching...";
      const products = await ProductAPI.searchProducts(query);
      UI.productGrade = "";
      UI.renderProducts(products);
    };

    const searchCategory = async (category) => {
      count.textContent = "Searching category...";
      const products = await ProductAPI.getProductsByCategory(category.toLowerCase());
      UI.productGrade = "";
      UI.renderProducts(products);
    };

    searchButton.addEventListener("click", () => search(input.value.trim()));
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") search(input.value.trim());
    });

    document.querySelectorAll(".product-category-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const category = button.textContent.trim();
        input.value = category;
        searchCategory(category);
      });
    });

    document.querySelectorAll(".nutri-score-filter").forEach((button) => {
      button.addEventListener("click", () => {
        UI.productGrade = button.dataset.grade || "";
        UI.showFilteredProducts();
      });
    });

    grid.addEventListener("click", (event) => {
      const button = event.target.closest("[data-product-code]");
      if (!button) return;
      const product = UI.productResults.find((item) => item.code === button.dataset.productCode);
      if (!product) return;
      const grams = Number(prompt("How many grams did you eat?", "100"));
      if (!grams || grams < 0) return;
      FoodLog.addProduct(product, grams);
      alert(`${product.product_name || "Product"} added to the food log`);
    });
  }

  // Render the Food Log page
  static renderFoodLog(){
    const log = FoodLog.getTodayLog()
    const totals = FoodLog.getTotals()

    // 1. Update todays date
    document.getElementById("foodlog-date").textContent = new Date().toLocaleDateString(
      "en-US",{
        weekday:"long",
        year:"numeric",
        month:"long",
        day:"numeric"
      }
    )

    // 2. Update progress bar text
      document.getElementById("calories-text").textContent = `${totals.calories} / 2000 kcal`;
    document.getElementById("protein-text").textContent  = `${totals.protein} / 50 g`;
    document.getElementById("carbs-text").textContent    = `${totals.carbs} / 250 g`;
    document.getElementById("fat-text").textContent      = `${totals.fat} / 65 g`;
 
   // 3. Update progress bar widths
    document.getElementById("calories-bar").style.width = `${Math.min((totals.calories / 2000) * 100, 100)}%`;
    document.getElementById("protein-bar").style.width  = `${Math.min((totals.protein / 50) * 100, 100)}%`;
    document.getElementById("carbs-bar").style.width    = `${Math.min((totals.carbs / 250) * 100, 100)}%`;
    document.getElementById("fat-bar").style.width      = `${Math.min((totals.fat / 65) * 100, 100)}%`;

    // 4. Show each meal, or a message when the log is empty
    const list = document.getElementById("logged-items-list");
    const count = document.querySelector("#foodlog-section .border-t h4");
    const clearButton = document.getElementById("clear-foodlog");
    if (!list) return;

    if (count) count.textContent = `Logged Items (${log.length})`;
    if (clearButton) clearButton.style.display = log.length ? "block" : "none";

    if (log.length === 0) {
      list.innerHTML = `
        <div class="text-center py-8 text-gray-500">
          <i class="fa-solid fa-utensils text-4xl mb-3 text-gray-300"></i>
          <p class="font-medium">No meals logged today</p>
          <p class="text-sm">Add meals from the Meals page</p>
        </div>
      `;
    } else {
      list.innerHTML = log.map((meal) => `
        <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
          ${meal.image ? `<img src="${meal.image}" alt="" class="w-14 h-14 rounded-lg object-cover">` : ""}
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-gray-900 truncate">${meal.name}</p>
            <p class="text-sm text-gray-500">${meal.loggedAt || ""} · ${meal.quantity ? `${meal.quantity} · ` : ""}${meal.nutritionAvailable === false || (meal.category === "Meal" && meal.nutritionAvailable !== true) ? "Nutrition info unavailable" : `${meal.calories} kcal`}</p>
          </div>
          <button data-remove-meal="${meal.logIndex}" class="text-red-500 hover:text-red-600 px-2 py-1" aria-label="Remove ${meal.name}">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      `).join("");
    }

    // Update the list after removing a meal or clearing the log
    list.onclick = (e) => {
      const button = e.target.closest("[data-remove-meal]");
      if (!button) return;
      FoodLog.removeMeal(Number(button.dataset.removeMeal));
      UI.renderFoodLog();
    };
    if (clearButton) {
      clearButton.onclick = () => {
        FoodLog.clearLog();
        UI.renderFoodLog();
      };
    }

    UI.renderWeeklyChart(FoodLog.getLog());
  }

  // Draw the calories for the last seven days
  static renderWeeklyChart(log) {
    const chart = document.getElementById("weekly-chart");
    if (!chart || !window.Plotly) return;

    const dates = [];
    const calories = [];
    const today = new Date();
    const todayText = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateText = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      dates.push(date.toLocaleDateString("en-US", { weekday: "short" }));

      const dayTotal = log
      
      .filter((item) => (item.loggedDate || todayText) === dateText)
        .reduce((total, item) => total + (Number(item.calories) || 0), 0);
      calories.push(dayTotal);
    }

    chart.innerHTML = "";
    window.Plotly.newPlot(chart, [{
      x: dates,
      y: calories,
      
      
      type: "bar",
      marker: { color: "#10b981" },
      
      name: "Calories",
    }], {
      
      margin: { t: 20, r: 20, b: 35, l: 45 },
      yaxis: { title: "Calories" },
      xaxis: { title: "Day" },
    }, { responsive: true, displayModeBar: false });
  }

  // Make the quick action buttons open the right page or add a food
  static setupQuickLogActions() {
    const buttons = document.querySelectorAll(".quick-log-btn");
    if (buttons.length < 3) return;

    buttons[0].addEventListener("click", async () => {
      
      const query = prompt("Which recipe do you want to log?");
      if (!query) return;

      const meals = await MealAPI.searchMeals(query);
      if (!meals.length) {
        alert("No matching recipe was found");
        return;
      }

      
      const choices = meals.slice(0, 10).map((meal, index) => `${index + 1}. ${meal.strMeal}`).join("\n");
      const choice = Number(prompt(`Choose a recipe number:\n${choices}`, "1"));
      const meal = meals[choice - 1];
      if (!meal) return;

      FoodLog.addMeal(meal);
      UI.renderFoodLog();
      alert(`${meal.strMeal} was added. Nutrition information is not available from the recipe source.`);
    });

    buttons[1].addEventListener("click", () => {
      
      document.querySelectorAll(".nav-link").forEach((link) => {
        if (link.textContent.includes("Product Scanner")) link.click();
      });
      document.getElementById("barcode-input")?.focus();
    });

    buttons[2].addEventListener("click", () => {
      const name = prompt("What food did you eat?");
      if (!name) return;

      const calories = prompt("Calories?") || 0;
      const protein = prompt("Protein in grams?") || 0;
      const carbs = prompt("Carbs in grams?") || 0;
      const fat = prompt("Fat in grams?") || 0;
      FoodLog.addCustomFood(name, calories, protein, carbs, fat);
      UI.renderFoodLog();
    });
  }
}

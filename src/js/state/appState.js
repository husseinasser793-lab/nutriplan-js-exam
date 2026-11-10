const STORAGE_KEY = "nutriplan_food_log"
const FAVORITES_KEY = "nutriplan_favorites"

function getLocalDate() {
    const date = new Date()
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

export class FoodLog {

    // 1. Get all logged meals from localStorage
    static getLog() {
        try {
            const data = localStorage.getItem(STORAGE_KEY)
            const log = JSON.parse(data) || []
            let saveLog = false

            log.forEach((item) => {
                if (!item.loggedDate) {
                    item.loggedDate = getLocalDate()
                    saveLog = true
                }

                if (item.nutritionAvailable === undefined && item.category !== "Product" && item.category !== "Custom Food") {
                    item.calories = 0
                    item.protein = 0
                    item.carbs = 0
                    item.fat = 0
                    item.nutritionAvailable = false
                    saveLog = true
                }
            })

            if (saveLog) localStorage.setItem(STORAGE_KEY, JSON.stringify(log))
            return log
        } catch (e) {
            console.error("Error reading localStorage:", e);
            return []
        }
    }
    
    // 2. Add a new meal to the log
    static addMeal(meal) {
        const log = this.getLog()

        // this is an array-like data that is sent back from the "Backend"
        const loggedItem = {
            id: meal.idMeal || Date.now(),
            name: meal.strMeal || "Unnamed Meal",
            image: meal.strMealThumb || "",
            category: meal.strCategory || "Meal",
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            nutritionAvailable: false,
            loggedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            loggedDate: getLocalDate(),
        }

        // Sets the data of the array in the localStorage
        log.push(loggedItem)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(log))
    }

    // Add a product to the food log
    static addProduct(product, grams = 100) {
        const log = this.getLog()
        const nutrients = product.nutriments || {}
        const amount = Number(grams) || 100
        const portion = amount / 100
        const hasNutrition = ["energy-kcal_100g", "proteins_100g", "carbohydrates_100g", "fat_100g"]
            .some((key) => nutrients[key] !== undefined)

        const loggedItem = {
            id: product.code || Date.now(),
            name: product.product_name || "Unnamed Product",
            image: product.image_front_url || "",
            category: "Product",
            calories: (Number(nutrients["energy-kcal_100g"]) || 0) * portion,
            protein: (Number(nutrients.proteins_100g) || 0) * portion,
            carbs: (Number(nutrients.carbohydrates_100g) || 0) * portion,
            fat: (Number(nutrients.fat_100g) || 0) * portion,
            nutritionAvailable: hasNutrition,
            quantity: `${amount} g`,
            loggedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            loggedDate: getLocalDate(),
        }

        log.push(loggedItem)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(log))
    }

    // Add a food item typed in by the user
    static addCustomFood(name, calories, protein, carbs, fat) {
        const log = this.getLog()
        log.push({
            id: Date.now(),
            name: name,
            image: "",
            category: "Custom Food",
            calories: Number(calories) || 0,
            protein: Number(protein) || 0,
            carbs: Number(carbs) || 0,
            fat: Number(fat) || 0,
            nutritionAvailable: true,
            loggedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            loggedDate: getLocalDate(),
        })
        localStorage.setItem(STORAGE_KEY, JSON.stringify(log))
    }

    // 3. Remove a meal from the log by its index
    static removeMeal(index) {
        const log = this.getLog()
        if (index >= 0 && index < log.length) {
            log.splice(index, 1)
            localStorage.setItem(STORAGE_KEY, JSON.stringify(log))
        }

    }

    // 4. Clear all meals from the log
    static clearLog() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([]))
    }

    // Get only the foods logged today
    static getTodayLog() {
        const log = this.getLog()
        const today = getLocalDate()
        return log
            .map((item, index) => ({ ...item, logIndex: index }))
            .filter((item) => (item.loggedDate || today) === today)
    }

    // 5. Calculate totals (calories, protein, carbs, fat) for all logged meals
    static getTotals(log = this.getTodayLog()) {
        return log.reduce((totals, item) => {
            totals.calories += Number(item.calories) || 0
            totals.protein += Number(item.protein) || 0
            totals.carbs += Number(item.carbs) || 0
            totals.fat += Number(item.fat) || 0
            return totals
        }, { calories: 0, protein: 0, carbs: 0, fat: 0 })
    }

}

// Save favorite recipes in localStorage
export class Favorites {
    static getFavorites() {
        try {
            return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || []
        } catch (error) {
            console.error("Error reading favorites:", error)
            return []
        }
    }

    static isFavorite(id) {
        return this.getFavorites().some((meal) => meal.idMeal === id)
    }

    static toggle(meal) {
        const favorites = this.getFavorites()
        const index = favorites.findIndex((item) => item.idMeal === meal.idMeal)

        if (index >= 0) {
            favorites.splice(index, 1)
        } else {
            favorites.push({
                idMeal: meal.idMeal,
                strMeal: meal.strMeal,
                strMealThumb: meal.strMealThumb,
            })
        }

        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
        return index < 0
    }
}

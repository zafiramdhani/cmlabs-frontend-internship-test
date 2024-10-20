const GET_CATEGORIES = 'https://www.themealdb.com/api/json/v1/1/categories.php'
const GET_MEALS = 'https://www.themealdb.com/api/json/v1/1/filter.php?c='
const GET_MEAL_DETAILS = 'https://www.themealdb.com/api/json/v1/1/lookup.php?i='


function goToMealsPage(categoryName) {
  const mealsPageURL = `/${categoryName.toLowerCase()}`
  const mealsPageState = { category: categoryName }

  history.pushState(mealsPageState, 'Meals Page', mealsPageURL)
  loadMeals(categoryName)
}

function goToMealDetailsPage(mealId, categoryName) {
  const mealDetailsPageURL = `/${categoryName.toLowerCase()}/${mealId}`
  const mealDetailsPageState = { mealId: mealId, category: categoryName }

  history.pushState(mealDetailsPageState, 'Meal Details Page', mealDetailsPageURL)
  loadMealDetails(mealId)
}

window.onpopstate = e => {
  if (e.state) {
    if (e.state.mealId) {
      loadMealDetails(e.state.mealId)
    } else if (e.state.category) {
      loadMeals(e.state.category)
    }
  } else {
    loadCategories()
  }
}

// CATEGORIES PAGE (HOME)
function loadCategories() {
  $.ajax({
    url: GET_CATEGORIES,
    method: 'GET',
    success: data => {
      const categories = data.categories
      const categoriesContainer = $('<div id="categories-container"></div>')
      const pageTitle = $('<h2 class="page-title">All Categories</h2>')
      categoriesContainer.append(pageTitle)

      categories.map(category => {
        const categoryLink = $(`<a href='/${category.strCategory.toLowerCase()}' 
          class='category-link' 
          data-category-name='${category.strCategory}'
        ></a>`)
        const categoryContent = $(`
          <div class="category-content">
            <img src="${category.strCategoryThumb}" alt="${category.strCategory}">
            <p>${category.strCategory}</p>
          </div>
        `)

        categoryLink.append(categoryContent)
        categoriesContainer.append(categoryLink)
      })

      $('#root').empty().append(categoriesContainer)

      $('.category-link').on('click', function(e) {
        e.preventDefault()
        const categoryName = $(this).data('category-name')
        goToMealsPage(categoryName)
      })
    },
    error: () => {
      $('#root').html('<p>Error fetching categories.</p>')
    }
  })
}

// MEALS PAGE
function loadMeals(categoryName) {
  $.ajax({
    url: `${GET_MEALS + categoryName}`,
    method: 'GET',
    success: data => {
      const meals = data.meals;
      const mealsContainer = $('<div id="meals-container"></div>')
      const pageTitle = $(`<h2 class='page-title'>${categoryName} Meals</h2>`)
      mealsContainer.append(pageTitle)

      meals.map(meal => {
        const mealLink = $(`<a href='/${meal.idMeal}'
          class='meal-link'
          data-meal-id='${meal.idMeal}'
        ></a>`)
        const mealContent = $(`
          <div class='meal-content'>
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
            <p>${meal.strMeal}</p>
          </div>
        `)

        mealLink.append(mealContent)
        mealsContainer.append(mealLink)
      })

      $('#root').empty().append(mealsContainer)

      $('.meal-link').on('click', function(e) {
        e.preventDefault()
        const mealId = $(this).data('meal-id')
        goToMealDetailsPage(mealId, categoryName)
      })
    },
    error: () => {
      $('#root').html('<p>Error fetching meals.</p>');
    }
  })
}

// MEAL DETAILS PAGE
function loadMealDetails(mealId) {
  $.ajax({
    url: `${GET_MEAL_DETAILS + mealId}`,
    method: 'GET',
    success: data => {
      const meal = data.meals[0];
      const mealDetailsContainer = $('<div id="meal-details__container"></div>')
      const pageTitle = $(`<h2 class='page-title'>${meal.strMeal}</h2>`)
      mealDetailsContainer.append(pageTitle)
      const instructions = meal.strInstructions.split('.').map(step => step.trim()).filter(step => step)

      let mealDetailsContent = `
        <div class='image-recipe-container'>
          <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
          <div class='recipe-container'>
            <h3><i class='bx bxs-leaf'></i>Recipe:</h3>
            <ul id="recipe=list">
      `
        
      for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];

        if (ingredient && ingredient.trim() && measure && measure.trim()) {
          mealDetailsContent += `<li>${measure} ${ingredient}</li>`
        }
      }

      mealDetailsContent += `
            </ul>
          </div>
        </div>

        <h3><i class='bx bxs-info-circle'></i>Instructions:</h3>
        <ol id="instruction-list">
      `

      instructions.forEach(instruction => {
        mealDetailsContent += `<li>${instruction}.</li>`
      })

      mealDetailsContent += `
        </ol>
        <h3><i class='bx bxs-video'></i>Cooking Video:</h3>
      `

      // Check for Youtube video
      if (meal.strYoutube) {
        const splitLink = meal.strYoutube.split('=')[1]
        mealDetailsContent += `
          <div class="youtube-container">
            <iframe src="https://www.youtube.com/embed/${splitLink}" frameborder="0" allowfullscreen></iframe>
          </div>
        `
      } else {
        mealDetailsContent += `<p>No video available.</p>`
      }

      mealDetailsContainer.append(mealDetailsContent)
      $('#root').empty().append(mealDetailsContainer)
    },
    error: () => {
      $('#root').html('<p>Error fetching meal details.</p>')
    }
  })
}

$(document).ready(() => {
  loadCategories()
})
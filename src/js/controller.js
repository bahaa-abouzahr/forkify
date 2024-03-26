import * as model from './model.js'
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js'
import searchView from './views/searchView.js'
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarkView from './views/bookmarkView.js';
import addRecipeView from './views/addRecipeView.js';
import sortView from './views/sortView.js';

import 'core-js/stable'; // for pollifilling everything else
import 'regenerator-runtime/runtime';  // for pollifilling async await
import sortView from './views/sortView.js';

const recipeContainer = document.querySelector('.recipe');

// https://forkify-api.herokuapp.com/v2

if(module.hot) {
  module.hot.accept();
}

const controlRecipes = async function() {
  try {
    const id = window.location.hash.slice(1); // geting id from hash

    // Guard clause
    if(!id) return;

    recipeView.renderSpinner();

    // 1) Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());
    
    // 2) Updating bookmarks view
    bookmarkView.update(model.state.bookmarks)

    // 3) Loading recipe
    await model.loadRecipe(id);
    
    // 4) Rendering recipe
    recipeView.render(model.state.recipe)
    
  } catch (err) {
    recipeView.renderError();
    console.error(err);
  }

};

const controlSearchResults = async function() {
  try {
    resultsView.renderSpinner();

    // 1) Get search query
    const query = searchView.getQuery();
    if(!query) return;

    // 2) Load search results
    await model.loadSearchResults(query);

    // 3) Render results
    resultsView.render(model.getSearchResultsPage());

    // 4) Render initial pagination buttons
    paginationView.render(model.state.search);
    
    // 5) initiate Sort button functionality
    sortView.render(model.state.search);

  } catch (err) {
    console.log(err);
  }
};


const controlPagination = function(goToPage) {
  // 3) Render NEW results
  resultsView.render(model.getSearchResultsPage(goToPage));

  // 4) Render NEW pagination buttons
  paginationView.render(model.state.search);

  // // listen to sort button
  // sortView.addHandlerSort(controlSort);
};

const controlServings = function(newServings) {
  // console.log(model.state.recipe.ingredients);
  // Update the recipe servings (in state)
  model.updateServings(newServings);

  // Update the recipe view
  // recipeView.render(model.state.recipe)
  recipeView.update(model.state.recipe)
}

const controlAddBookmark = function() {
  // 1) Add/remove bookmark
  if(!model.state.recipe.bookmarked) model.addBoomark(model.state.recipe);
  else model.removeBoomark(model.state.recipe.id);
  
  // 2) Update recipe view
  recipeView.update(model.state.recipe);

  // 3) Render bookmarks
  bookmarkView.render(model.state.bookmarks);
}

const controlBookmarks = function() {
  bookmarkView.render(model.state.bookmarks);
}

const controlAddRecipe = async function(newRecipe) {
  try {
    // Show loading spinner
    addRecipeView.renderSpinner();

    // Upload the new recipe data
    await model.uploadRecipe(newRecipe)
    console.log(model.state.recipe);
    
    // Render recipe
    recipeView.render(model.state.recipe);

    // Success message
    addRecipeView.renderMessage();

    // Re-render bookmark view
    bookmarkView.render(model.state.bookmarks);

    // Change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`) // (state, title, url)
    // NOTE history api pushState method allows us to change URL without reloading the page

    // Close form window 
    setTimeout(function() {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
    
    // re-render AddRecipeform View
    setTimeout(function() {
      addRecipeView.render(true);
    }, MODAL_CLOSE_SEC * 1500);
    

  } catch (error) {
    console.error('😨😨', error);
    addRecipeView.renderError(error.message)

    setTimeout(function() {
      addRecipeView.render(true);
    }, MODAL_CLOSE_SEC * 1500);
  }
};

const controlSort = function(sort=false) {
  // Toggle sort status
  model.toggleSort();

  // Renter sorted results
  resultsView.render(model.getSearchResultsPage());

  // render sort

}

const newFeature() {
  console.log("Welcome to the application");
}

const init = function() {
  bookmarkView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings)
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
  sortView.addHandlerSort(controlSort)
  newFeature();
};
init();

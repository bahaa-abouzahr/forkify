// import { async } from 'regenerator-runtime';
import { API_URL, ITEMS_PER_PAGE, KEY } from './config.js';
// import { getJSON, sendJSON } from './helpers.js';
import { AJAX } from './helpers.js'

export const state = {
    recipe: {},
    search: {
        query: '',
        results: [],
        currentPage: 1,
        resultsPerPage: ITEMS_PER_PAGE,
        sorted: false,
    },
    bookmarks: [],
};

const createRecipeObject = function(data) {
    const {recipe} = data.data;
    return state.recipe = {
        id: recipe.id,
        title: recipe.title,
        publisher: recipe.publisher,
        sourceUrl: recipe.source_url,
        image: recipe.image_url,
        servings: recipe.servings,
        cookingTime: recipe.cooking_time,
        ingredients: recipe.ingredients,
        ...(recipe.key && { key: recipe.key }), // key is stored only if it exists - SHORT CIRCUITING
    };
};

export const loadRecipe = async function(id) {
    try {
        const data = await AJAX(`${API_URL}${id}?key=${KEY}`);

        state.recipe = createRecipeObject(data);

        if(state.bookmarks.some(bookmark => bookmark.id === id))
            state.recipe.bookmarked = true;
        else
            state.recipe.bookmarked = false;

        // console.log(state.recipe);

    } catch (err) {
        // Temp error handling
        console.error(`${err} 😫😫`)
        throw err;
    }
};



export const loadSearchResults = async function(query) {
    try {
        state.search.query = query;
        const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);
 
        state.search.results = data.data.recipes.map(rec => {
            return {
                id: rec.id,
                title: rec.title,
                publisher: rec.publisher,
                image: rec.image_url,
                ...(rec.key && { key: rec.key }),
            }
        });
        // console.log(state.search.results);
        state.search.currentPage = 1;
    } catch (err) {
        console.error(`${err} 😫😫`)
        throw err;
    }
};

const sortFunction = function(a, b) {
    // Convert both names to lowercase to ensure case-insensitive comparison
    const nameA = a.title.toLowerCase();
    const nameB = b.title.toLowerCase();
    
    if (nameA < nameB) {
        return -1; // nameA comes before nameB
    }
    if (nameA > nameB) {
        return 1; // nameA comes after nameB
    }
    return 0; // names must be equal
};

export const getSearchResultsPage = function(page = state.search.currentPage) {
    state.search.currentPage = page;

    const start = (page - 1) * ITEMS_PER_PAGE // 10
    const end = page * ITEMS_PER_PAGE // 10

    if(state.search.sorted) {
        state.search.resultsSorted = [...state.search.results];
        state.search.resultsSorted.sort(sortFunction);
        return state.search.resultsSorted.slice(start, end);
    }

    // console.log(state.search.results.slice(start, end));
    return state.search.results.slice(start, end)
};

export const toggleSort = function() {
    // state.search.sorted === 'shit' ? false : true;

    if(state.search.sorted === true) state.search.sorted = false;
    else state.search.sorted = true;
}

export const updateServings = function(newServings) {
    
    state.recipe.ingredients.forEach(ing => {
        // newQt = oldQt * newServings / oldServings
        ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
    });

    // updating servings number
    state.recipe.servings = newServings;
}

const persistBookmarks = function() {
    localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));

}


export const addBoomark = function(recipe) {
    // Add bookmark
    state.bookmarks.push(recipe);

    // Mark current recipe as bookmarked
    if(recipe.id === state.recipe.id) state.recipe.bookmarked = true;

    persistBookmarks();
}

export const removeBoomark = function(id) {
    // remove bookmark
    const index = state.bookmarks.findIndex(el => el.id === id);
    state.bookmarks.splice(index, 1);
    
    // Mark current recipe as NOT bookmark
    if(id === state.recipe.id) state.recipe.bookmarked = false;
    persistBookmarks();
}

const init = function() {
    const storage = localStorage.getItem('bookmarks');
    if(storage) state.bookmarks = JSON.parse(storage);
}

init();

const clearBookmarks = function() {
    localStorage.clear('bookmarks');
};
// clearBookmarks();

export const uploadRecipe = async function(newRecipe) {
    try {
        const ingredients = Object.entries(newRecipe) // converting object to array
        .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
        .map(ing => {
            const ingArr = ing[1].split(',').map(el => el.trim());
            // const ingArr = ing[1].replaceAll(' ', '').split(',');
            if(ingArr.length !== 3) 
                throw new Error('Wrong ingredient format! Please use the correct format');
    
            const [quantity, unit, description] =  ingArr// replaceAll here replaces spaces with empty strings
            return { quantity: quantity ? +quantity : null, unit, description };
        });
        
        const recipe = {
            title: newRecipe.title,
            source_url: newRecipe.sourceUrl,
            image_url: newRecipe.image,
            publisher: newRecipe.publisher,
            cooking_time: +newRecipe.cookingTime,
            servings: +newRecipe.servings,
            ingredients,
        }

        const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
        state.recipe = createRecipeObject(data);
        addBoomark(state.recipe);

    } catch (error) {
        throw error;
    }

}
import View from './View.js';
import previewView from './previewView.js';
import { state } from '../model'

class SortView extends View {
    _parentElement = document.querySelector('.sort');
    _errorMessage = 'No recipes found for your query! Please try again!';
    _message = '';


    addHandlerSort(handler){
        this._parentElement.addEventListener('click', function(e) {
            const sortBtn = e.target.closest('.btn--sort')

            if(!sortBtn) return;

            console.log("SORT STATE:", state.search.sorted);

            if(state.search.sorted === false) {
                sortBtn.innerHTML = "Unsort";
            } 
            else {
                sortBtn.innerHTML = "Sort";
            }
            handler();
        })
    }

    _generateMarkup() {
        let curPage = this._data.currentPage;

        console.log(curPage);
        return `
            <button class="btn--sort btn--small">Sort</button>
            <p id="page-num" class"page-num">Page ${curPage}</p>
        `
    }
}

export default new SortView();
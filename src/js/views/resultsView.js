import View from './View.js';
import previewView from './previewView.js';
import icons from 'url:../../img/icons.svg';
import { state } from '../model'

class ResultsView extends View {
    _parentElement = document.querySelector('.results');
    _errorMessage = 'No recipes found for your query! Please try again!';
    _message = '';
    
    addHandlerSort(handler){
        const sortBtn = document.getElementById('sort');
        console.log(sortBtn);
        sortBtn.addEventListener('click', function() {
            handler();
            if(state.search.sorted === true) sortBtn.innerHTML = "Unsort";
            else {
                sortBtn.innerHTML = "Sort";
            }
        })
    }

    _generateMarkup() {
        return this._data.map(result => previewView.render(result, false)).join('');
    }
}

export default new ResultsView();
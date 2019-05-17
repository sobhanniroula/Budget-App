// A. CREATING BUDGET CONTROLLER MODULE: ---------------------

var budgetController = (function() {

    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };
        
    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };
    
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };
    
    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(curr) {
            sum += curr.value;
        });
        data.totals[type] = sum;
    }
    
    // Creating a big chunk of data to store all the values that will be passed from the user:
    var data = {
        allItems: {
            inc: [],
            exp: []
        },
        totals: {
            inc: 0,
            exp: 0
        }, 
        budget: 0,
        percentage: -1
    };

    
        
    
    return {
        addItem: function(type, desc, valu) {
            var newItem, ID;
            
            // 1. Create new ID:
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            
            // 2. Create new item based on type ('inc' or 'exp'):
            if (type === 'inc') {
                newItem = new Income(ID, desc, valu);
            } else if (type === 'exp') {            
                newItem = new Expense(ID, desc, valu);
            }
            
            // 3. Push it into the data structure:
            data.allItems[type].push(newItem);
            
            // 4. Return the new element:
            return newItem;
        },
        
        deleteItem: function(type, id) {
            var ids, index;
            
            ids = data.allItems[type].map(function(current) {
                return current.id;
            });
            
            index = ids.indexOf(id);
            
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },
        
        calculateBudget: function() {
            // 1. Calculate total income and expenses:
                calculateTotal('inc');
                calculateTotal('exp');
            
            // 2. Calculate the budget i.e. income - expense:
                data.budget = data.totals.inc - data.totals.exp;
            
            // 3. Calculate the percentage of income spent(expense):
                if (data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
                } else {
                    data.percentage = -1;
                }
        },
        
        calculatePercentage: function() {
            data.allItems.exp.forEach(function(curr) {
                curr.calcPercentage(data.totals.inc);
            });
        },
        
        getPercentages: function() {
            var allPercn = data.allItems.exp.map(function(curr) {
               return curr.getPercentage(); 
            });
            return allPercn;
        },
        
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },
        
        testing: function() {
            console.log(data);
        }
    };
})();
//--------------------------------------------------------------







// B. CREATING UI CONTROLLER MODULE: -------------------------

var UIController = (function() {
    
    
    // Storing all the input types in object properties:
    var DOMstrings = {
        inputType: '.sign-type',
        inputDescription: '.add-description',
        inputValue: '.add-value',
        inputBtn: '#btn-tick',
        incomeContainer: '#inc-section',
        expenseContainer: '#exp-section',
        budgetLabel: '#budget',
        incomeLabel: '#income-number',
        expenseLabel: '#expense-number',
        percentageLabel: '#exp-percentage',
        outputArea: '.output',
        expensesPercLabel: '.lists-item-percentage',
        date: '#month'
    }
    
    var formatNumber = function(num, type) {
            num = Math.abs(num);
            num = num.toFixed(2);
            
           var numSplit = num.split('.');
            var int = numSplit[0];
                if (int.length > 3) {
                    int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, int.length); // input 1230 - output 1,230
                }
            
            var dec = numSplit[1];
            
            return (type === 'inc' ? '+' : '-') + ' ' + int + '.' + dec;
        };
    
   
    
    return {
        getInput: function(){
            return {
                input_type: document.querySelector(DOMstrings.inputType).value, // this will be either income (inc) or expense (exp).
                input_description: document.querySelector(DOMstrings.inputDescription).value,
                input_value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },
        
        addListItem: function(obj, type) {
            var html, newHtml, element;
            
            // 1. Create HTML string with a placeholder text:
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                
                html = '<div class="lists" id="inc-%id%"><div class="lists-item">%description%</div><div class="right-side"><div class="lists-item-delete"><button class="delete-btn"><i class="material-icons">cancel</i></button></div><div class="lists-item-value">%value%</div></div></div>';
            } else if (type === 'exp') {  
                element = DOMstrings.expenseContainer;
                
                html = '<div class="lists" id="exp-%id%"><div class="lists-item">%description%</div><div class="right-side"><div class="lists-item-delete"><button class="delete-btn"><i class="material-icons">cancel</i></button></div><div class="lists-item-percentage">20%</div><div class="lists-item-value">%value%</div></div></div>';
            }
            
            // 2. Replace the placeholder text with actual data:
            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%',obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            // 3. Insert the HTML into the DOM:
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        
        deleteListItem: function(selectedID) {
            var el = document.getElementById(selectedID);
            
            el.parentNode.removeChild(el);
            
        },
        
        clearFields: function() {
            var fields, fieldsArr;
            
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            
            fieldsArr = Array.prototype.slice.call(fields);
            
            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });
            
            fieldsArr[0].focus();
        },
        
        displayBudget: function(obj) {
            
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');
        
            
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
             
        },
        
        displayPercentage: function(percentage) {
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
            
             var nodeListForEach = function(list, callback) {
              for (var i = 0; i < list.length; i++) {
                  callback(list[i], i);
              }  
            };
            
            nodeListForEach(fields, function(current, index) {
                if (percentage[index] > 0) {
                    current.textContent = percentage[index] + '%'; 
                } else {
                    current.textContent = '---';
                }
            });
        },
        
        displayMonth: function() {
            var now = new Date();
            var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            var month = now.getMonth();
            var year = now.getFullYear(); 
            document.querySelector(DOMstrings.date).textContent = 'Available Budget in ' + months[month] + ' ' + year;
        },
        
        getDOMstrings: function() {
            return DOMstrings;
        }
    };
})();
//--------------------------------------------------------------
//--------------------------------------------------------------







// C. CREATING GLOBAL APP CONTROLLER MODULE: -----------------

var controller = (function(budgetCtrl, UICtrl) {
        
    // Setting up all the event listeners into a single function:
    var setupEventListeners = function() {
        
        // 1. Getting the input types, which is stored inside DOMstrings object in BudgetController Module:
        var DOM = UIController.getDOMstrings();
        
        // 2. What happens when we click the tick button?:
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    
        // 3. Adding a keypress event for Enter Key. That means when the user inputs the data and hits the Enter key, it should do the exact same things as click the tick button:
        document.addEventListener('keypress', function(event) {
        if (event.keycode === 13 || event.which === 13) {
            ctrlAddItem();
            } 
        });
        
        document.querySelector(DOM.outputArea).addEventListener('click', ctrlDeleteItem);
        
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    
    };
    
    
    var updateBudget = function() {
        // 1. Calculate the budget:
            budgetCtrl.calculateBudget();
        
        // 2. Return the budget
            var budget = budgetCtrl.getBudget();
        
        // 3. Display the budget on the UI:  
            UICtrl.displayBudget(budget);
    };
    
    var updatePercentage = function() {
        // 1. Calculate percentage:
        budgetCtrl.calculatePercentage();
        
        // 2. Read percentage from budget controller:
        var percentages = budgetCtrl.getPercentages();
        
        // 3. Update the UI with new percentage:
        UICtrl.displayPercentage(percentages);
        
    }
    
    
    // What happens when the ticked button is clicked or Enter key is pressed (after an item is added)?:
    var ctrlAddItem = function() {
        var input, newItem;
        
        // 1. Get the entered data from the user:
        input = UICtrl.getInput();
        
        if (input.input_description !== "" && !isNaN(input.input_value) && input.input_value > 0) {
        // 2. Add the data to the system (Budget Controller):
            newItem = budgetCtrl.addItem(input.input_type, input.input_description, input.input_value);
        
        // 3. Add the data to the UI:
            UICtrl.addListItem(newItem, input.input_type);
        
        // 4. Clear the fields:
            UICtrl.clearFields();        
        
        // 5. Calculate and update budget:
            updateBudget();
            
        // 6. Calculate and update percentage:
            updatePercentage();
    }
    };
    
    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;
        
      itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;  
        
        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            // 1. Delete item from data structure:
            budgetCtrl.deleteItem(type, ID);
            
            // 2. Delete item from UI:
            UICtrl.deleteListItem(itemID);
            
            // 3. Update and show the budget:
            updateBudget();
            
            // 4. Calculate and update percentage:
            updatePercentage();
            
        }
    };
    
  
    return {
      init: function() {
          setupEventListeners();

          UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
          UICtrl.displayMonth();
      }  
    };
})(budgetController, UIController);
//-------------------------------------------------------------
//-------------------------------------------------------------
//-------------------------------------------------------------
    
    



// The only code to be called outside the above modules (the initialization function):

controller.init();
























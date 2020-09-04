// BUDGET CONTROLLER
var budgetController = (function(){

	var Expense=function(id,description,value){
		this.id=id;
		this.description=description;
		this.value=value;
		this.percentage=-1;
	};

	Expense.prototype.calcPercentage=function(totalIncome){

        if(totalIncome>0)
		this.percentage=Math.round((this.value/totalIncome)*100);
	else this.percentage=-1;

	};

	Expense.prototype.getPercentage=function(){
		return this.percentage;
	}

	var Income=function(id,description,value){
		this.id=id;
		this.description=description;
		this.value=value;
	};

	var calculateTotal=function(type){

          var sum;

		if(type==='exp'){

			 sum=0;

			data.allItems.exp.forEach(function(cur){

				sum+=cur.value;

			})

			data.totals.exp=sum;

		}

		else if(type==='inc'){

			 sum=0;

			data.allItems.inc.forEach(function(cur){

				sum+=cur.value;

			})
			data.totals.inc=sum;

		}

	}


	var data={
		allItems:{
			exp:[],
			inc:[]
		},
		totals:{
			exp:0,
			inc:0
		},
		budget: 0,
		percentage: -1
	};

	return{
		addItem:function(type,des,val){
			var ID,newItem;

            // new ID will be created from the old ones and new item will be added based on inc or exp

			if(type==='exp'){

				if(data.allItems.exp.length>0)
				ID=data.allItems.exp[data.allItems.exp.length-1].id+1;
			    else ID=0;
				newItem=new Expense(ID,des,val);
				data.allItems.exp.push(newItem);
			}
			else if(type==='inc'){


				if(data.allItems.inc.length>0)
				ID=data.allItems.inc[data.allItems.inc.length-1].id+1;
			    else ID=0;
				newItem=new Income(ID,des,val);
				data.allItems.inc.push(newItem);
			}

            // new element returned
            //console.log(newItem);
			return newItem;


		},

		deleteItem:function(type,id){

			var ids,index;

			//selects exp or inc based on type
			// map return an array

			ids = data.allItems[type].map(function(current) {
				return current.id;
			});

			index=ids.indexOf(id);

			if(index!== -1){

				// to delete the elements starting from index till count reaches 1
				data.allItems[type].splice(index,1);
			}


		},

		calculateBudget:function(){
			// calculate total income and expense

			calculateTotal('inc');
			calculateTotal('exp');


			//calculate the budget(income-expense)

			data.budget=data.totals.inc-data.totals.exp;


			//calculate the %age expenditure
			if(data.totals.inc>0){
			data .percentage=Math.round((data.totals.exp/data.totals.inc)*100);
		      }
		    else data.percentage=-1;
		},

		calculatePercentages:function(){

            data.allItems.exp.forEach(function(cur){
            	cur.calcPercentage(data.totals.inc);
            })

		},

		getPercentages:function(){
			var allperc;

			allperc=data.allItems.exp.map(function(cur){
                  return cur.getPercentage();
			});

			return allperc;

		},


		getBudget:function(){
			return{
				budget:data.budget,
				totalInc:data.totals.inc,
				totalExp:data.totals.exp,
				percentage:data.percentage
			};
		}
	
};

})();



// UI CONTROLLER
var UIController = (function(){

	var DOMstrings={
		inputType:'.add__type',
		inputDescription:'.add__description',
		inputValue:'.add__value',
		inputBtn:'.add__btn',
		incomeContainer: '.income__list',
		expensesContainer: '.expenses__list',
		budgetLabel:'.budget__value',
		incomeLabel:'.budget__income--value',
		expenseLabel:'.budget__expenses--value',
		percentageLabel:'.budget__expenses--percentage',
		container:'.container',
		expensesPercLabel:'.item__percentage',
		dateLabel:'.budget__title--month'
	};


	var formatNumber=function(num,type){

		var numSplit,int,dec,sign;

		// do + before income and - before expense
		// add comma to numbers greater than thousands
		//exactly two decimal places

		num=Math.abs(num);
		num=num.toFixed(2);  //two decimal places(changed to string)

        numSplit=num.split('.');

        int=numSplit[0];
        dec=numSplit[1];

        if(int.length>3){
        	int=int.substr(0,int.length-3)+','+int.substr(int.length-3,3);
        }

        if(type==='exp')
        	sign='-';
        else sign='+';

        return sign+' '+int+'.'+dec;

	};

	var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };
	
	return{
		getInput:function(){
			return{
			type: document.querySelector(DOMstrings.inputType).value,
			description: document.querySelector(DOMstrings.inputDescription).value,

			// parseFloat to convert string to float
			value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
		}
		},
	addListItem:function(obj,type){

		var html,newhtml,element;

		if(type==='exp')
		{
			element=DOMstrings.expensesContainer;
			html='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
		}
		else if(type==='inc')
		{
			element=DOMstrings.incomeContainer;
			html='<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
		}

        newhtml=html.replace('%id%',obj.id);
        newhtml=newhtml.replace('%description%',obj.description);
        newhtml=newhtml.replace('%value%',formatNumber(obj.value,type));

        document.querySelector(element).insertAdjacentHTML('beforeend',newhtml);

	},

	clearfeilds:function(){
		var fields,fieldsArr;

		fields=document.querySelectorAll(DOMstrings.inputDescription+','+DOMstrings.inputValue);
		// to convert list to array
		fieldsArr=Array.prototype.slice.call(fields);

		fieldsArr.forEach(function(current,index,array){
			current.value="";

		})

		fieldsArr[0].focus();

	},
	displayBudget:function(obj){

		var type;
		if(obj.budget>0)
			type='inc';
		else type='exp';

		document.querySelector(DOMstrings.budgetLabel).textContent=formatNumber(obj.budget,type);
		document.querySelector(DOMstrings.incomeLabel).textContent=formatNumber(obj.totalInc,'inc');
		document.querySelector(DOMstrings.expenseLabel).textContent=formatNumber(obj.totalExp,'exp');


		if(obj.percentage>0)
		document.querySelector(DOMstrings.percentageLabel).textContent=obj.percentage + '%';
	    else document.querySelector(DOMstrings.percentageLabel).textContent='---';

	},

	displayPercentages:function(percentages){

        // return node list
		var fields=document.querySelectorAll(DOMstrings.expensesPercLabel);

		// alternative of splice method

		nodeListForEach(fields,function(current,index){

			if(percentages[index]>0)
				current.textContent=percentages[index]+'%';
			else current.textContent='---';


		});

	},

	displayMonth:function(){
		var now,year,month,allMonths;

		var now=new Date();

		allMonths=['January','February','March','April','May','June','July','August','September','October','November','December'];

		year=now.getFullYear();
		month=now.getMonth();

		document.querySelector(DOMstrings.dateLabel).textContent=allMonths[month]+' '+year;



	},

	 changedType: function() {
            
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);
            
            nodeListForEach(fields, function(cur) {
               cur.classList.toggle('red-focus'); 
            });
            
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
            
        },

	deleteListItem:function(selectorID){
		var ele=document.getElementById(selectorID);
		ele.parentNode.removeChild(ele);
      
	},

	getDOMstrings:function(){
		return DOMstrings;
	}
};


})();


// GLOBAL APP CONTROLLER
var controller=(function(budgetCtrl,uiCtrl){


	var setUpEventListeners=function(){

		var DOM=uiCtrl.getDOMstrings();


		document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);

	document.addEventListener('keypress',function(event){
		if(event.keycode===13 || event.which===13)
		{
			ctrlAddItem();
		}
	})	

	document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);

	document.querySelector(DOM.inputType).addEventListener('change', uiCtrl.changedType);

	};

	var updateBudget=function(){

		// calculate budget
		budgetController.calculateBudget();

		// return budget
		var budget=budgetController.getBudget();

		// display budget on UI
		uiCtrl.displayBudget(budget);
	};


	var updatePercentages=function(){


          budgetCtrl.calculatePercentages();

          var percentages=budgetCtrl.getPercentages();

          uiCtrl.displayPercentages(percentages);


	};

	var ctrlAddItem=function(){

		var input,newItem;

		// get input from user
		 input=uiCtrl.getInput();

		 if(input.description!=="" && !isNaN(input.value) && input.value>0){

		// add the input item to budgetContoller
		newItem=budgetController.addItem(input.type,input.description,input.value);

		// add item to UI
		uiCtrl.addListItem(newItem,input.type);

		// to clear the feilds
		uiCtrl.clearfeilds();

		// calculate and update the budget
		updateBudget();

		// calculate and update the percentages
		updatePercentages();
	}
	};

	var ctrlDeleteItem=function(event){
           var itemID,splitID,type,ID;

           itemID=event.target.parentNode.parentNode.parentNode.parentNode.id;

           if(itemID){

           	// to get type and id
           	splitID=itemID.split('-');
           	type=splitID[0];

           	// to convert the id to int
           	ID=parseInt(splitID[1]);

           	// delete the item from the data structure
           	budgetCtrl.deleteItem(type,ID);

           	// delete the item from UI
           	uiCtrl.deleteListItem(itemID);

           	// update the new budget
           	updateBudget();
           
            // update new percentages
           	updatePercentages();


           }

	}


	return{
		init:function(){
			console.log("Application has started");
			uiCtrl.displayBudget({budget:0,
				totalInc:0,
				totalExp:0,
				percentage:-1});
			setUpEventListeners();
			uiCtrl.displayMonth();
		}
	};

})(budgetController,UIController);

controller.init();
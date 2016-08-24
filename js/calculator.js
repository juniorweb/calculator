(function(){
    var app = angular.module("calculator", []);
    
    app.controller("MainController",  ['$scope', function($scope){
        $scope.display = 0;
        
        $scope.refreshDisplay = function(){
            $scope.display = Calculator.display;
            $scope.$apply();
        }
    }]);
        
    app.directive("keyboard", ["$animate",function($animate){
        return {
            restrict: 'E',
            templateUrl: 'keyboard.html',
            controller: function(){
                
                this.createButton = function(value,css,charCode){
                    return {value:value, class:css, charCode: charCode ? charCode : value.charCodeAt()}
                };
                
                this.keyboardRow = [];
                
                this.keyboardRow[0] = [ 
                    //this.createButton('√x','btn-info'),
                    //this.createButton('%','btn-info'),
                    this.createButton('AC','btn-info','ac'),
                    this.createButton('CE','btn-info','ce'),
                ];
                this.keyboardRow[1] = [ 
                    this.createButton('7','btn-default'),
                    this.createButton('8','btn-default'),
                    this.createButton('9','btn-default'),
                    this.createButton('/','btn-info'),
                ];
                this.keyboardRow[2] = [ 
                    this.createButton('4','btn-default'),
                    this.createButton('5','btn-default'),
                    this.createButton('6','btn-default'),
                    this.createButton('*','btn-info'),
                ];
                this.keyboardRow[3] = [ 
                    this.createButton('1','btn-default'),
                    this.createButton('2','btn-default'),
                    this.createButton('3','btn-default'),
                    this.createButton('-','btn-info'),
                ];
                this.keyboardRow[4] = [ 
                    this.createButton('0','btn-default'),
                    this.createButton('.','btn-default'),
                    this.createButton('=','btn-primary',13),
                    this.createButton('+','btn-info'),
                ];
                
                var clickButton = function(buttonId){
                    
                    var button = document.getElementById(buttonId);
                    
                    //add active style to simulate pressed button
                    $animate.addClass(angular.element(button), 'active');
                    //remove active style
                    setTimeout(function(){
                        button.className = button.className.replace('active','');
                    },100);      
                    
                    try{ button.click(); }
                    catch(err){ console.log(err); }
                    
                }
                
                //Listen to the keys backspace and delete
                angular.element(document).on('keyup',function(e){
                    
                    //backspace key
                    if(e.which == 8)
                        clickButton('btn-ce');
                    
                    //delete key
                    if(e.which == 46)
                        clickButton('btn-ac');
                    
                });
                
                //Listen to the keyboards keys
                angular.element(document).on('keypress', function(e){    
                    
                    clickButton('btn-' + e.which);

                });
                
            },
            controllerAs: 'kb'
        };
    }]);
    
    app.directive("keyboardbutton", function(){
        return {
            restrict: 'E',
            templateUrl: 'keyboardButton.html',
            link: function(scope,element){
                
                    element.bind('click',function(e){
                        var button = e.target;
                        var buttonValue = button.innerHTML;
                        
                        switch(buttonValue){
                                
                            case '=':
                                Calculator.execute();
                                break;
                            case 'CE':
                                Calculator.clearEntry();
                                break;  
                            case 'AC':
                                Calculator.reset();
                                break;
                            default:
                                
                                var lastChar = Calculator.display.substr(-1);
                                
                                //Check if an operator character will be followed by another, if yes, do not repeat                           
                                if(".+-*/".indexOf(lastChar) > -1 && ".+*/".indexOf(buttonValue) > -1) 
                                    return;
                                
                                //add the character to the display
                                Calculator.display += buttonValue;
                                
                        } 
                        
                        scope.refreshDisplay(); //update display
                        
                    });//element.bind()
            }//link
       } 
    });

    var Calculator = {

        display : "",
        stack : [],
        
        //Parse the value on display and calculate
        execute : function(){
            var result = 0;

            this.parse();
            result = this.calculate();

            if(isNaN(result)){
                this.display = "Invalid Format!";
            }else{
                this.display = result.toString();
            }
                
        },
        
        /*
         * Given a stack of values and operators, it calculates the result of applying the operators to the values.
         * @param prev The value that was previously on the top of the stack.
         * @return Mixed Returns a Number resulted of the operations or NaN in case of an error.
         */
        calculate : function(prev){
            
            if(this.stack.length==0)
                return;
            
            if(this.stack.length==1)
                return this.stack.pop();
            
            var top = this.stack.pop();
            
            //On top-down do the operations with more precedence * /
            //On down-top do the operations with less precedence + -
            switch(top){
                case "*":
                    this.stack.push(prev * this.stack.pop());
                    return this.calculate();
                    break;
                case "/":
                    this.stack.push(this.stack.pop() / prev);
                    return this.calculate();
                    break;
                case "+":
                    return prev + this.calculate();
                    break;
                case "-":
                    return this.calculate() - prev;
                    break;
            }
                
            return this.calculate(top);

        },
        
        /*
         * It takes a string of values and operators (e.g. '3+4*2') 
         * and parses it to a stack.
         * @return Array A stack with values and operators (e.g. [2,'+',4,'*',2] ). 
         */
        parse : function(){
            var string = this.display;
            var tmp = '';
            
            //Go through every character of the string
            for(var i=0, c; i < string.length; i++){
                c = string.charAt(i);
                
                //if the character is an operator
                if('*/+-'.indexOf(c) > -1){
                    
                    //check if the character - is part of a negative number
                    //instead of being a subtraction operator
                    if(tmp == '' && c == '-'){
                        tmp = c;
                    }else{
                        //if the character refers to an operator
                        //push the number and the operator to the stack
                        this.stack.push(parseFloat(tmp));
                        this.stack.push(c);
                        tmp = '';
                    }
                    
                }else{
                    //add character to tmp until an operator is found
                    tmp += c;                    
                }
            }
            
            //Get the remaining number on tmp,
            //once the string does not end with an operator character
            if(tmp != ''){
                this.stack.push(parseFloat(tmp));
            }
            
        },
        
       clearEntry : function(){
           this.display = this.display.slice(0, -1);;
       },    
        
       reset : function(){
            this.display = "";
            this.stack = [];
       }
    }
    

})();
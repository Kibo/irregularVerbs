function Dictionary(){
    
    this.init = function(){
        var data = Dictionary.prototype.raw;     
        Dictionary.prototype.shuffle ( data );                
        this.data = data;        
    };
                                 
    this.idx = function () {
            var n = 0;            
            return {
                next: function() { (n >= ( Dictionary.prototype.raw.length - 1) ) ? n = 0 :  n++; },
                get: function() { return n; }
            };              
    }();  
       
    this.getVerb = function (){
           return this.data[ this.idx.get() ];
    }   
    
    //assign in init function
    this.data = null;
    
    this.getOptions = function( difficulty ){
                           
           var options = [ this.getVerb().tenses[0],
                           this.getVerb().tenses[1],
                           this.getVerb().tenses[2] 
                         ];
           for(var i = 0; i < difficulty; i++){
               options.push( this.getVerb().fakes[i] );
           }                      
           this.shuffle( options );
           return options;                
    }
}

Dictionary.prototype.raw = [
               {"tenses":["have","had","had"], "fakes":["afake1", "bfake2"]},
               {"tenses":["do","did","done"], "fakes":["efake1", "ffake2"]},
               {"tenses":["be","were","been"], "fakes":["ifake1", "jfake2"]}               
       ];   

//shuffle array
Dictionary.prototype.shuffle = function(o) {        
    for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};   

//return integer in range: 0-2
Dictionary.prototype.random = function(){
   return Math.round( Math.random() * 2 );
};
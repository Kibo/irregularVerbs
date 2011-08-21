var DICTIONARY = {}

DICTIONARY.game = (function(){
            var data;
            var idx;
            var utils;         
            var tenses;
            var setting;
            var topten;
            var errorManager;
            var sound = new Audio();
            var lives = localStorage.getItem("lives") != null ? localStorage.getItem("lives") : 3;
            var countOfVerbs = localStorage.getItem("countOfVerbs") != null ? localStorage.getItem("countOfVerbs") : 10;     
            var voice = localStorage.getItem("voice") != null ? localStorage.getItem("voice") : 'on';  
            var bonus = 0;
            var random;
            
            function init(){             
                //localStorage.clear();
                jQuery.event.props.push('dataTransfer');
                utils = DICTIONARY.utils();
                errorManager = DICTIONARY.errorManager();
                data = getData();             
                setting = DICTIONARY.setting();
                topten = DICTIONARY.topten();                
                idx = DICTIONARY.idx();   
                tenses = DICTIONARY.tenses();                    
                setChest();                
                showTense();
                showOptions();                
                showStatus();
                showTopTen();
                showVerbsList();
                showSetting();
                bindEvents();
            }
            
            function getData(){
                var data = utils.shuffle( DICTIONARY.data().get() );
                var errors = errorManager.get();
                               
                //errors from last game first
                for(var i=0; i < errors.length; i++){                                                                           
                    var indx = utils.hasObject( data, errors[i] );                   
                    var verb = data[indx];                                                         
                    data.splice(indx,1);
                    data.push(verb);                    
                }
                
                data.reverse();                
                return data;
            }
                                                           
            function getVerb(){
                return data[ idx.get() ];
            }
            
            function nextVerb(){                                              
                idx.next();
                setChest();
                showTense(); 
                showOptions();
                switchNextButton();                                               
            }
            
            function setChest(){                                
                for(var i = 0; i <= 2; i++){   
                    var direction = (i == 0) ? 'Left' : (i == 1)? 'Middle' : 'Right';
                    $( '#tense'+i ).removeAttr('class');
                    $( '#tense'+i ).addClass('chestClose' + direction);
                    $( '#tense'+i ).addClass('makeMeDroppable'); 
                    $( '#tense'+i ).droppable();
                    $( '#tense'+i ).droppable( 'enable' );
                 }                
            }
                                   
            function getOptions(){               
                var options = [ 
                                getVerb().fakes[0],
                                getVerb().fakes[1]                               
                             ];
                
                //random is generated in showTenses(); determine index of helpVerbs
                for (var i = 0; i < getVerb().tenses.length; i++){                    
                    if(random != i){
                        options.push( getVerb().tenses[i] );
                    }                                        
                }               
                return utils.shuffle( options );                             
            }
            
            function showTense(){
                tenses.unlock();                                             
                random = utils.random();
                var tense = getVerb().tenses[random];
                var sel = "#tense" + random;
                
                $( sel ).append( '<span class="corner shadow">' + tense + '</span>');                
                $( sel ).droppable( 'disable' );
                var dirrection = (random == 0) ? 'Left' : (random == 1)? 'Middle' : 'Right';                     
                $( sel ).removeClass( 'chestClose' + dirrection );
                $( sel ).addClass('chestParrot' + dirrection);            
            }                                                                      
            
            function showOptions(){               
                var options = getOptions();
                for(var i = 0; i <= ( options.length - 1 ); i++){     
                    $('#opti' + i).text(options[i]);                    
                    $('#opti' + i).removeAttr('class');  
                    $('#opti' + i).addClass('key' + ((random + i)%4) ); 
                    $('#opti' + i).addClass('makeMeDraggable');  
                    
                    $('#opti' + i).draggable({
                        containment: '#gameContent',
                        cursor: 'move',                       
                        revert: true                        
                    });
              
                }                                                           
            }
                                 
            function playSound(pathToFile){               
                sound.setAttribute("src", pathToFile );              
                sound.play();
            }
            
            function switchNextButton(){
                if (  $("#nextButton button").is(':disabled') ){                         
                    $("#nextButton button").button("enable");                   
                }else{                 
                    $("#nextButton button").button("disable");    
                }                                                                                  
            }
            
            function showStatus(){                      
                $(".bonus").text( bonus );
                showLives();              
                checkStatus();
            }
            
            function showLives(){                                                      
                $('.lives').empty();
                for (var i = 1; i<= lives; i++){
                    $('.lives').append('<img src="img/skul.png" alt="live" width="30" /> ');
                } 
            }
            
            function showSetting(){
                $("#select-lives").val( lives );
                $("#select-verbs").val( countOfVerbs );  
                $("#select-voice").val( voice ); 
            }
            
            function showTopTen(){                 
                 $("#toptenList").empty();  
                 var toptenArray = topten.get();                 
                 for(var i = 0; i < toptenArray.length; i++){ 
                     var name = '<h3>' + toptenArray[i].name + '</h3>';
                     var date = '<p class="ui-li-aside">' + toptenArray[i].date + '</p>';
                     var bonus = '<p class="ui-li-count">' + toptenArray[i].bonus + '</p>';
                     $("#toptenList").append('<li>' + name + date + bonus + '</li>');                    
                 }                                                
            }
            
            function showVerbsList(){
                $("#verbsList").empty();
                var verbs = DICTIONARY.data().get();
                var head;
                for(var i=0; i < verbs.length; i++){
                                                        
                    $("#verbsList").append( 
                        ((head != verbs[i].tenses[0][0].toUpperCase() ) ? '<li data-role="list-divider">' + verbs[i].tenses[0][0].toUpperCase() + '</li>' : '') + 
                        '<li data-icon="info" > \
                            <a href="#" data-voice="' + verbs[i].sound + '" > \
                                <h3>' + verbs[i].tenses[0] + '</h3> \
                                <p>' + verbs[i].tenses[0] +', ' + verbs[i].tenses[1] + ', ' + verbs[i].tenses[2] + '</p> \
                            </a> \
                        </li>\
                        ');   
                    
                    head = verbs[i].tenses[0][0].toUpperCase();                    
                }                         
            }
            
            function checkStatus(){         
               if(lives <= 0){                                                
                   $.mobile.changePage("#gameover");
               }else if( idx.get() >= countOfVerbs-1){                                       
                   bonus = (bonus * lives)
                   $(".bonus").text( (bonus) ); 
                   $.mobile.changePage("#gameover");
               }           
            }
            
            function bindEvents(){  
                for(var i = 0; i<=2; i++){
                    $('#tense' + i).bind('drop', function(event, ui){
                                                                                              
                        event.stopPropagation();
                        event.preventDefault();                    
                        
                        var id = ui.draggable.attr('id')
                        //var id = event.dataTransfer.getData("text"); 
                        
                        var text = $('#' + id).text();

                        //$('#' + id).hide();
                        $('#' + id).addClass('hide');

                        //$(event.target).text(text);
                        $(event.target).append('<span class="corner shadow">' + text + '</span>');
                        
                        var targetId = $(event.target).attr('id')                                                                                            
                        var dirrection = (targetId == 'tense0') ? 'Left' : (targetId == 'tense1')? 'Middle' : 'Right';                     
                        $(event.target).removeClass( 'chestClose' + dirrection );

                        var isError = tenses.check( getVerb(), getIndex( $(event.target).attr('id') ) );                    
                        if(isError){
                            lives--;                        
                            $(event.target).addClass('chestRat' + dirrection);
                            errorManager.add(  getVerb() );
                        }else{
                            bonus++;
                            $(event.target).addClass('chestOpen' + dirrection );
                            errorManager.remove( getVerb() );
                        }
                        tenses.lock( $(event.target).attr('id') )
                        showStatus();

                        if ($("#tense0").text() && 
                            $("#tense1").text() && 
                            $("#tense2").text() ){
                                //tenses.lock();                                                                                                          
                                switchNextButton();
                                if(voice == 'on'){
                                    playSound( getVerb().sound );
                                }                            
                        }                      
                    });
                } //for(var i = 0; i<=2; i++){
                
                $('#nextButton').click( function(){nextVerb()} );
                $("#soundButton").click(function(){ playSound( getVerb().sound );});
                
                $('#select-lives').change( function(event){ setting.set( event.target ); } );
                $('#select-verbs').change( function(event){ setting.set( event.target ); } );  
                $('#select-voice').change( function(event){ setting.set( event.target ); } );   
                
                $('#saveResultsButton').click( function(){ 
                    topten.save( bonus, $("#name").val() ); 
                    showTopTen();
                    $.mobile.changePage("#topten");
                } );
                                
                $('#verbsList li a').bind('click', function(event){                   
                    playSound($(event.target).attr("data-voice"));
                });
                                                                                                            
            }
                       
            function getIndex( idTense ){               
                return idTense.substring(idTense.length-1, idTense.length); 
            }
                                                          
            return{
                init: init 
            }
            
        })();
        
        DICTIONARY.tenses = function(){
        
            function lock( idTense ){                           
                //$("#" + idTense).attr("ondragover", "return true");  
                $("#" + idTense).droppable( 'disable' );
            }
            
           function unlock(){
               for(var i = 0; i<=2; i++){   
                   $("#tense" + i).text("");
                   //$("#tense" + i).attr("ondragover", "return false");
               }           
            }
                                   
           function check( verb, index ){                                                     
                var isError = false;
                if( $('#tense'+index).text() != verb.tenses[index] ){                 
                    isError = true;
                }
                return isError;                
            }
            
            return{
                lock: lock,
                check: check,
                unlock: unlock               
            }                                
        } 
        
        DICTIONARY.topten = function(){
            
            function save(bonus, name){                   
                var topten =  localStorage.getItem("topten") != null ?
                                    JSON.parse( localStorage.getItem("topten") ) :
                                    [];                                
                topten.push( {"date":today(), "name":name, "bonus":bonus} );
                topten.sort( compare );
                topten.reverse();                
                if(topten.length >= 11){ //max 10 items
                    topten.pop();
                }
                localStorage.setItem( "topten", JSON.stringify( topten ) );                                                                      
            }
                          
            function get(){               
                return localStorage.getItem("topten") != null ?
                                    JSON.parse( localStorage.getItem("topten") ) :
                                    [];                                                                             
            }
            
            function today(){
                var now = new Date();
                return now.getDate() + "." + (now.getMonth()+1) + "."  + now.getFullYear();
            }
            
            function compare(a, b){
                if (a.bonus < b.bonus)
                    return -1;
                if (a.bonus > b.bonus)
                    return 1;
                return 0;
            }
                                                        
            return{
                save: save,   
                get: get  
            }            
        }
                      
        DICTIONARY.errorManager = function(){
            
            var utils = DICTIONARY.utils();
            
            function get(){
                return localStorage.getItem("errors") != null ?
                                    JSON.parse( localStorage.getItem("errors") ) :
                                    []; 
            }
            
            function add( verb ){                
                var errors =  localStorage.getItem("errors") != null ?
                                    JSON.parse( localStorage.getItem("errors") ) :
                                    [];                                                                                            
               
               var index = utils.hasObject( errors, verb ); 
               if ( index == -1 ){                    
                    errors.push(verb);  
                    localStorage.setItem( "errors", JSON.stringify(errors) ); 
                }                                                                                                        
            }
            
            function remove( verb ){
                var errors =  localStorage.getItem("errors") != null ?
                                    JSON.parse( localStorage.getItem("errors") ) :
                                    [];
                var index = utils.hasObject( errors, verb );                   
                if ( index != -1){
                    errors.splice(index,1);
                    localStorage.setItem( "errors", JSON.stringify(errors) ); 
                }               
            }
            
            return{
                get: get,
                add: add,
                remove: remove
            }
            
        }
        
        DICTIONARY.setting = function(){
            
            function set( id ){
                var name = $(id).attr("name"); 
                var value = $(id).val();
                localStorage.setItem( name, value );
            }
            
            return {
                set: set
            }
            
        }
                                
        DICTIONARY.idx = function(){
            var n = 0;  
            
            function get(){
                return n;
            }
            
            function next(){
                (n >= ( DICTIONARY.data().get().length - 1) ) ? n = 0 :  n++;               
            }
            
            return {
                next: next,
                get: get               
            };              
         };  
         
         DICTIONARY.utils = function(){
             
             function shuffle(o){
                for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
                return o;
             }
             
             //0-2
             function random(){
                return Math.round( Math.random() * 2 );
             };
                         
             //return index or -1 (the same as indexOf)
             function hasObject( data, obj ){
                 
                 for(key in data){
                    if(data[key].id == obj.id)
                        return key;
                 }
                 
                 return -1;
             }
                                            
             return{
                 random: random,
                 shuffle: shuffle,
                 hasObject: hasObject
             }
         }
        
        DICTIONARY.data = function(){
                        
            function get(){                                                                                                                                                 
                return [                    
                    {"id":0, "tenses":["be","were","been"], "fakes":["be", "being"], "sound":"data/be.mp3"},
{"id":1, "tenses":["begin","began","begun"], "fakes":["bigan", "bigun"], "sound":"data/begin.mp3"},
{"id":2, "tenses":["bring","brought","brought"], "fakes":["brang", "brung"], "sound":"data/bring.mp3"},
{"id":3, "tenses":["build","built","built"], "fakes":["bild", "bilden"], "sound":"data/build.mp3"},
{"id":4, "tenses":["buy","bought","bought"], "fakes":["been", "be"], "sound":"data/buy.mp3"},
{"id":5, "tenses":["choose","chose","chosen"], "fakes":["chase", "chasen"], "sound":"data/choose.mp3"},
{"id":6, "tenses":["come","came","come"], "fakes":["camen", "comen"], "sound":"data/come.mp3"},
{"id":7, "tenses":["cut","cut","cut"], "fakes":["cat", "cat"], "sound":"data/cut.mp3"},
{"id":8, "tenses":["do","did","done"], "fakes":["don", "dan"], "sound":"data/do.mp3"},
{"id":9, "tenses":["drink","drank","drunk"], "fakes":["drinke", "dranke"], "sound":"data/drink.mp3"},
{"id":10, "tenses":["drive","drove","driven"], "fakes":["drave", "draven"], "sound":"data/drive.mp3"},
{"id":11, "tenses":["eat","ate","eaten"], "fakes":["ete", "eten"], "sound":"data/eat.mp3"},
{"id":12, "tenses":["forget","forgot","forgotten"], "fakes":["forgat", "forgatten"], "sound":"data/forget.mp3"},
{"id":13, "tenses":["get","got","got"], "fakes":["gote", "gotten"], "sound":"data/get.mp3"},
{"id":14, "tenses":["give","gave","given"], "fakes":["gove", "gaven"], "sound":"data/give.mp3"},
{"id":15, "tenses":["go","went","gone"], "fakes":["bee", "been"], "sound":"data/go.mp3"},
{"id":16, "tenses":["have","had","had"], "fakes":["hate", "haten"], "sound":"data/have.mp3"},
{"id":17, "tenses":["learn","learnt","learnt"], "fakes":["lern", "lernet"], "sound":"data/learn.mp3"},
{"id":18, "tenses":["leave","left","left"], "fakes":["leften", "laft"], "sound":"data/leave.mp3"},
{"id":19, "tenses":["meet","met","met"], "fakes":["meet", "meten"], "sound":"data/meet.mp3"},
{"id":20, "tenses":["pay","paid","paid"], "fakes":["payd", "payd"], "sound":"data/pay.mp3"},
{"id":21, "tenses":["read","read","read"], "fakes":["red", "redden"], "sound":"data/read.mp3"},
{"id":22, "tenses":["say","said","said"], "fakes":["sayd", "sayden"], "sound":"data/say.mp3"},
{"id":23, "tenses":["see","saw","seen"], "fakes":["saw", "son"], "sound":"data/see.mp3"},
{"id":24, "tenses":["sell","sold","sold"], "fakes":["sellen", "sollen"], "sound":"data/sell.mp3"},
{"id":25, "tenses":["show","showed","shown"], "fakes":["shew", "shewn"], "sound":"data/show.mp3"},
{"id":26, "tenses":["sit","sat","sat"], "fakes":["saten", "sotten"], "sound":"data/sit.mp3"},
{"id":27, "tenses":["speak","spoke","spoken"], "fakes":["spake", "spaken"], "sound":"data/speak.mp3"},
{"id":28, "tenses":["take","took","taken"], "fakes":["tooken", "taeken"], "sound":"data/take.mp3"},
{"id":29, "tenses":["write","wrote","written"], "fakes":["wrate", "wratten"], "sound":"data/write.mp3"}                                                       
                ];
            }
                             
            return{
                get: get
            }
        }

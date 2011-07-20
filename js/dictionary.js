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
                    $( '#tense'+i ).removeClass('chestRat' + direction);                
                    $( '#tense'+i ).removeClass('chestOpen' + direction);  
                    $( '#tense'+i ).removeClass('chestParrot' + direction); 
                    $( '#tense'+i ).addClass('chestClose' + direction);                
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
                //$( sel ).text( tense );
                $( sel ).append( '<span class="corner shadow">' + tense + '</span>');
                $( sel ).attr("ondragover", "return true"); 
                var dirrection = (random == 0) ? 'Left' : (random == 1)? 'Middle' : 'Right';                     
                $( sel ).removeClass( 'chestClose' + dirrection );
                $( sel ).addClass('chestParrot' + dirrection);            
            }                                                                      
            
            function showOptions(){               
                var options = getOptions();
                for(var i = 0; i <= ( options.length - 1 ); i++){     
                    $('#opti' + i).text(options[i]);
                    $('#opti' + i).attr('draggable', true);  
                    $('#opti' + i).removeAttr('class');  
                    $('#opti' + i).addClass('key' + ((random + i)%4) );                   
                    
                    $('#opti' + i).bind('dragstart', function(event){
                        event.dataTransfer.effectAllowed = 'copy';                
                        event.dataTransfer.setData("text",  this.id );    
                        $('#opti' + i).css('cursor', 'pointer');
                    }); 
                    
                    $('#opti' + i).show();
                }                                                           
            }
                                 
            function playSound(pathToFile){
                sound.setAttribute("src", pathToFile  );;
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
                        '<li data-icon="info"> \
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
                   $("#state").text( "GAME OVER!" );
                   $.mobile.changePage("#gameover");
               }else if( idx.get() >= countOfVerbs-1){              
                   $(".bonus").text( (bonus * lives) );
                   $("#state").text( "YOU ARE WINNER!" );
                   $.mobile.changePage("#gameover");
               }           
            }
            
            function bindEvents(){  
                for(var i = 0; i<=2; i++){
                    $('#tense' + i).bind('drop', function(event){
                        event.stopPropagation();
                        event.preventDefault();                    
                        var id = event.dataTransfer.getData("text"); 
                        var text = $('#' + id).text();

                        $('#' + id).hide();

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
                $("#" + idTense).attr("ondragover", "return true");                
            }
            
           function unlock(){
               for(var i = 0; i<=2; i++){   
                   $("#tense" + i).text("");
                   $("#tense" + i).attr("ondragover", "return false");
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
                    {"id":0, "tenses":["arise","arose","arisen"], "fakes":["arosex", "arisenx"], "sound":"data/arise.mp3"},
                    {"id":1, "tenses":["awake","awoke","awaked"], "fakes":["awokex", "awakedx"], "sound":"data/awake.mp3"},
                    {"id":2, "tenses":["be","were","been"], "fakes":["werex", "beenx"], "sound":"data/be.mp3"},
                    {"id":3, "tenses":["bear","bore","born"], "fakes":["borex", "bornx"], "sound":"data/bear.mp3"},
                    {"id":4, "tenses":["become","became","become"], "fakes":["becamex", "becomex"], "sound":"data/become.mp3"},
                    {"id":5, "tenses":["begin","began","begun"], "fakes":["beganx", "begunx"], "sound":"data/begin.mp3"},
                    {"id":6, "tenses":["bend","bent","bent"], "fakes":["bentx", "bentx"], "sound":"data/bend.mp3"},
                    {"id":7, "tenses":["bid","bade","bidden"], "fakes":["badex", "biddenx"], "sound":"data/bid.mp3"},
                    {"id":8, "tenses":["bind","bound","bound"], "fakes":["boundx", "boundx"], "sound":"data/bind.mp3"},
                    {"id":9, "tenses":["bite","bit","bitten"], "fakes":["bitx", "bittenx"], "sound":"data/bite.mp3"},
                    {"id":10, "tenses":["bleed","bled","bled"], "fakes":["bledx", "bledx"], "sound":"data/bleed.mp3"},
                    {"id":11, "tenses":["blend","blended","blended"], "fakes":["blendedx", "blendedx"], "sound":"data/blend.mp3"},
                    {"id":12, "tenses":["blow","blew","blown"], "fakes":["blewx", "blownx"], "sound":"data/blow.mp3"},
                    {"id":13, "tenses":["break","broke","broken"], "fakes":["brokex", "brokenx"], "sound":"data/break.mp3"},
                    {"id":14, "tenses":["breed","bred","bred"], "fakes":["bredx", "bredx"], "sound":"data/breed.mp3"},
                    {"id":15, "tenses":["bring","brought","brought"], "fakes":["broughtx", "broughtx"], "sound":"data/bring.mp3"},
                    {"id":16, "tenses":["broadcast","broadcast","broadcast"], "fakes":["broadcastx", "broadcastx"], "sound":"data/broadcast.mp3"},
                    {"id":17, "tenses":["build","built","built"], "fakes":["builtx", "builtx"], "sound":"data/build.mp3"},
                    {"id":18, "tenses":["burn","burnt","burnt"], "fakes":["burntx", "burntx"], "sound":"data/burn.mp3"},
                    {"id":19, "tenses":["burst","burst","burst"], "fakes":["burstx", "burstx"], "sound":"data/burst.mp3"},
                    {"id":20, "tenses":["buy","bought","bought"], "fakes":["boughtx", "boughtx"], "sound":"data/buy.mp3"},
                    {"id":21, "tenses":["cast","cast","cast"], "fakes":["castx", "castx"], "sound":"data/cast.mp3"},
                    {"id":22, "tenses":["catch","caught","caught"], "fakes":["caughtx", "caughtx"], "sound":"data/catch.mp3"},
                    {"id":23, "tenses":["choose","chose","chosen"], "fakes":["chosex", "chosenx"], "sound":"data/choose.mp3"},
                    {"id":24, "tenses":["cling","clung","clung"], "fakes":["clungx", "clungx"], "sound":"data/cling.mp3"},
                    {"id":25, "tenses":["come","came","come"], "fakes":["camex", "comex"], "sound":"data/come.mp3"},
                    {"id":26, "tenses":["cost","cost","cost"], "fakes":["costx", "costx"], "sound":"data/cost.mp3"},
                    {"id":27, "tenses":["creep","crept","crept"], "fakes":["creptx", "creptx"], "sound":"data/creep.mp3"},
                    {"id":28, "tenses":["cut","cut","cut"], "fakes":["cutx", "cutx"], "sound":"data/cut.mp3"},
                    {"id":29, "tenses":["dare","dared","dared"], "fakes":["daredx", "daredx"], "sound":"data/dare.mp3"},
                    {"id":30, "tenses":["deal","dealt","dealt"], "fakes":["dealtx", "dealtx"], "sound":"data/deal.mp3"},
                    {"id":31, "tenses":["dig","dug","dug"], "fakes":["dugx", "dugx"], "sound":"data/dig.mp3"},
                    {"id":32, "tenses":["do","did","done"], "fakes":["didx", "donex"], "sound":"data/do.mp3"},
                    {"id":33, "tenses":["draw","drew","drawn"], "fakes":["drewx", "drawnx"], "sound":"data/draw.mp3"},
                    {"id":34, "tenses":["dream","dreamt","dreamt"], "fakes":["dreamtx", "dreamtx"], "sound":"data/dream.mp3"},
                    {"id":35, "tenses":["drink","drank","drunk"], "fakes":["drankx", "drunkx"], "sound":"data/drink.mp3"},
                    {"id":36, "tenses":["drive","drove","driven"], "fakes":["drovex", "drivenx"], "sound":"data/drive.mp3"},
                    {"id":37, "tenses":["dwell","dwelt","dwelt"], "fakes":["dweltx", "dweltx"], "sound":"data/dwell.mp3"},
                    {"id":38, "tenses":["eat","ate","eaten"], "fakes":["atex", "eatenx"], "sound":"data/eat.mp3"},
                    {"id":39, "tenses":["fall","fell","fallen"], "fakes":["fellx", "fallenx"], "sound":"data/fall.mp3"},
                    {"id":40, "tenses":["feed","fed","fed"], "fakes":["fedx", "fedx"], "sound":"data/feed.mp3"},
                    {"id":41, "tenses":["feel","felt","felt"], "fakes":["feltx", "feltx"], "sound":"data/feel.mp3"},
                    {"id":42, "tenses":["fight","fought","fought"], "fakes":["foughtx", "foughtx"], "sound":"data/fight.mp3"},
                    {"id":43, "tenses":["find","found","found"], "fakes":["foundx", "foundx"], "sound":"data/find.mp3"},
                    {"id":44, "tenses":["flee","fled","fled"], "fakes":["fledx", "fledx"], "sound":"data/flee.mp3"},
                    {"id":45, "tenses":["fling","flung","flung"], "fakes":["flungx", "flungx"], "sound":"data/fling.mp3"},
                    {"id":46, "tenses":["fly","flew","flown"], "fakes":["flewx", "flownx"], "sound":"data/fly.mp3"},
                    {"id":47, "tenses":["forbid","forbade","forbidden"], "fakes":["forbadex", "forbiddenx"], "sound":"data/forbid.mp3"},
                    {"id":48, "tenses":["forecast","forecast","forecast"], "fakes":["forecastx", "forecastx"], "sound":"data/forecast.mp3"},
                    {"id":49, "tenses":["forget","forgot","forgotten"], "fakes":["forgotx", "forgottenx"], "sound":"data/forget.mp3"},
                    {"id":50, "tenses":["forgive","forgave","forgiven"], "fakes":["forgavex", "forgivenx"], "sound":"data/forgive.mp3"},
                    {"id":51, "tenses":["forsake","forsook","forsaken"], "fakes":["forsookx", "forsakenx"], "sound":"data/forsake.mp3"},
                    {"id":52, "tenses":["freeze","froze","frozen"], "fakes":["frozex", "frozenx"], "sound":"data/freeze.mp3"},
                    {"id":53, "tenses":["get","got","got"], "fakes":["gotx", "gotx"], "sound":"data/get.mp3"},
                    {"id":54, "tenses":["give","gave","given"], "fakes":["gavex", "givenx"], "sound":"data/give.mp3"},
                    {"id":55, "tenses":["go","went","gone"], "fakes":["wentx", "gonex"], "sound":"data/go.mp3"},
                    {"id":56, "tenses":["grind","ground","ground"], "fakes":["groundx", "groundx"], "sound":"data/grind.mp3"},
                    {"id":57, "tenses":["grow","grew","grown"], "fakes":["grewx", "grownx"], "sound":"data/grow.mp3"},
                    {"id":58, "tenses":["hang","hung","hung"], "fakes":["hungx", "hungx"], "sound":"data/hang.mp3"},
                    {"id":59, "tenses":["have","had","had"], "fakes":["hadx", "hadx"], "sound":"data/have.mp3"},
                    {"id":60, "tenses":["hear","heard","heard"], "fakes":["heardx", "heardx"], "sound":"data/hear.mp3"},
                    {"id":61, "tenses":["hide","hid","hidden"], "fakes":["hidx", "hiddenx"], "sound":"data/hide.mp3"},
                    {"id":62, "tenses":["hit","hit","hit"], "fakes":["hitx", "hitx"], "sound":"data/hit.mp3"},
                    {"id":63, "tenses":["hold","held","held"], "fakes":["heldx", "heldx"], "sound":"data/hold.mp3"},
                    {"id":64, "tenses":["hurt","hurt","hurt"], "fakes":["hurtx", "hurtx"], "sound":"data/hurt.mp3"},
                    {"id":65, "tenses":["keep","kept","kept"], "fakes":["keptx", "keptx"], "sound":"data/keep.mp3"},
                    {"id":66, "tenses":["kneel","knelt","knelt"], "fakes":["kneltx", "kneltx"], "sound":"data/kneel.mp3"},
                    {"id":67, "tenses":["know","knew","known"], "fakes":["knewx", "knownx"], "sound":"data/know.mp3"},
                    {"id":68, "tenses":["lay","laid","laid"], "fakes":["laidx", "laidx"], "sound":"data/lay.mp3"},
                    {"id":69, "tenses":["lead","led","led"], "fakes":["ledx", "ledx"], "sound":"data/lead.mp3"},
                    {"id":70, "tenses":["lean","leant","leant"], "fakes":["leantx", "leantx"], "sound":"data/lean.mp3"},
                    {"id":71, "tenses":["leap","leapt","leapt"], "fakes":["leaptx", "leaptx"], "sound":"data/leap.mp3"},
                    {"id":72, "tenses":["earn","learnt","learnt"], "fakes":["learntx", "learntx"], "sound":"data/earn.mp3"},
                    {"id":73, "tenses":["leave","left","left"], "fakes":["leftx", "leftx"], "sound":"data/leave.mp3"},
                    {"id":74, "tenses":["lend","lent","lent"], "fakes":["lentx", "lentx"], "sound":"data/lend.mp3"},
                    {"id":75, "tenses":["let","let","let"], "fakes":["letx", "letx"], "sound":"data/let.mp3"},
                    {"id":76, "tenses":["lie","lay","lain"], "fakes":["layx", "lainx"], "sound":"data/lie.mp3"},
                    {"id":77, "tenses":["light","lit","lit"], "fakes":["litx", "litx"], "sound":"data/light.mp3"},
                    {"id":78, "tenses":["lose","lost","lost"], "fakes":["lostx", "lostx"], "sound":"data/lose.mp3"},
                    {"id":79, "tenses":["make","made","made"], "fakes":["madex", "madex"], "sound":"data/make.mp3"},
                    {"id":80, "tenses":["mean","meant","meant"], "fakes":["meantx", "meantx"], "sound":"data/mean.mp3"},
                    {"id":81, "tenses":["meet","met","met"], "fakes":["metx", "metx"], "sound":"data/meet.mp3"},
                    {"id":82, "tenses":["pay","paid","paid"], "fakes":["paidx", "paidx"], "sound":"data/pay.mp3"},
                    {"id":83, "tenses":["put","put","put"], "fakes":["putx", "putx"], "sound":"data/put.mp3"},
                    {"id":84, "tenses":["read","read","read"], "fakes":["readx", "readx"], "sound":"data/read.mp3"},
                    {"id":85, "tenses":["ride","rode","ridden"], "fakes":["rodex", "riddenx"], "sound":"data/ride.mp3"},
                    {"id":86, "tenses":["ring","rang","rung"], "fakes":["rangx", "rungx"], "sound":"data/ring.mp3"},
                    {"id":87, "tenses":["rise","rose","risen"], "fakes":["rosex", "risenx"], "sound":"data/rise.mp3"},
                    {"id":88, "tenses":["run","ran","run"], "fakes":["ranx", "runx"], "sound":"data/run.mp3"},
                    {"id":89, "tenses":["say","said","said"], "fakes":["saidx", "saidx"], "sound":"data/say.mp3"},
                    {"id":90, "tenses":["see","saw","seen"], "fakes":["sawx", "seenx"], "sound":"data/see.mp3"},
                    {"id":91, "tenses":["seek","sought","sought"], "fakes":["soughtx", "soughtx"], "sound":"data/seek.mp3"},
                    {"id":92, "tenses":["sell","sold","sold"], "fakes":["soldx", "soldx"], "sound":"data/sell.mp3"},
                    {"id":93, "tenses":["send","sent","sent"], "fakes":["sentx", "sentx"], "sound":"data/send.mp3"},
                    {"id":94, "tenses":["set","set","set"], "fakes":["setx", "setx"], "sound":"data/set.mp3"},
                    {"id":95, "tenses":["sew","sewed","sewn"], "fakes":["sewedx", "sewnx"], "sound":"data/sew.mp3"},
                    {"id":96, "tenses":["shake","shook","shaken"], "fakes":["shookx", "shakenx"], "sound":"data/shake.mp3"},
                    {"id":97, "tenses":["shave","shaved","shaved"], "fakes":["shavedx", "shavedx"], "sound":"data/shave.mp3"},
                    {"id":98, "tenses":["shed","shed","shed"], "fakes":["shedx", "shedx"], "sound":"data/shed.mp3"},
                    {"id":99, "tenses":["shine","shone","shone"], "fakes":["shonex", "shonex"], "sound":"data/shine.mp3"},
                    {"id":100, "tenses":["shoot","shot","shot"], "fakes":["shotx", "shotx"], "sound":"data/shoot.mp3"},
                    {"id":101, "tenses":["show","showed","shown"], "fakes":["showedx", "shownx"], "sound":"data/show.mp3"},
                    {"id":102, "tenses":["shrink","shrank","shrunk"], "fakes":["shrankx", "shrunkx"], "sound":"data/shrink.mp3"},
                    {"id":103, "tenses":["shut","shut","shut"], "fakes":["shutx", "shutx"], "sound":"data/shut.mp3"},
                    {"id":104, "tenses":["sing","sang","sung"], "fakes":["sangx", "sungx"], "sound":"data/sing.mp3"},
                    {"id":105, "tenses":["sink","sank","sunk"], "fakes":["sankx", "sunkx"], "sound":"data/sink.mp3"},
                    {"id":106, "tenses":["sit","sat","sat"], "fakes":["satx", "satx"], "sound":"data/sit.mp3"},
                    {"id":107, "tenses":["sleep","slept","slept"], "fakes":["sleptx", "sleptx"], "sound":"data/sleep.mp3"},
                    {"id":108, "tenses":["slide","slid","slid"], "fakes":["slidx", "slidx"], "sound":"data/slide.mp3"},
                    {"id":109, "tenses":["sling","slung","slung"], "fakes":["slungx", "slungx"], "sound":"data/sling.mp3"},
                    {"id":110, "tenses":["slink","slunk","slunk"], "fakes":["slunkx", "slunkx"], "sound":"data/slink.mp3"},
                    {"id":111, "tenses":["slit","slit","slit"], "fakes":["slitx", "slitx"], "sound":"data/slit.mp3"},
                    {"id":112, "tenses":["smell","smelt","smelt"], "fakes":["smeltx", "smeltx"], "sound":"data/smell.mp3"},
                    {"id":113, "tenses":["sow","sowed","sown"], "fakes":["sowedx", "sownx"], "sound":"data/sow.mp3"},
                    {"id":114, "tenses":["speak","spoke","spoken"], "fakes":["spokex", "spokenx"], "sound":"data/speak.mp3"},
                    {"id":115, "tenses":["speed","sped","sped"], "fakes":["spedx", "spedx"], "sound":"data/speed.mp3"},
                    {"id":116, "tenses":["spell","spelt","Spelt"], "fakes":["speltx", "Speltx"], "sound":"data/spell.mp3"},
                    {"id":117, "tenses":["spend","spent","Spent"], "fakes":["spentx", "Spentx"], "sound":"data/spend.mp3"},
                    {"id":118, "tenses":["spill","spilt","spilt"], "fakes":["spiltx", "spiltx"], "sound":"data/spill.mp3"},
                    {"id":119, "tenses":["spin","span","spun"], "fakes":["spanx", "spunx"], "sound":"data/spin.mp3"},
                    {"id":120, "tenses":["spit","spat","spat"], "fakes":["spatx", "spatx"], "sound":"data/spit.mp3"},
                    {"id":121, "tenses":["split","split","split"], "fakes":["splitx", "splitx"], "sound":"data/split.mp3"},
                    {"id":122, "tenses":["spoil","spoilt","spoilt"], "fakes":["spoiltx", "spoiltx"], "sound":"data/spoil.mp3"},
                    {"id":123, "tenses":["spread","spread","spread"], "fakes":["spreadx", "spreadx"], "sound":"data/spread.mp3"},
                    {"id":124, "tenses":["spring","sprang","sprung"], "fakes":["sprangx", "sprungx"], "sound":"data/spring.mp3"},
                    {"id":125, "tenses":["stand","stood","stood"], "fakes":["stoodx", "stoodx"], "sound":"data/stand.mp3"},
                    {"id":126, "tenses":["steal","stole","stolen"], "fakes":["stolex", "stolenx"], "sound":"data/steal.mp3"},
                    {"id":127, "tenses":["stick","stuck","stuck"], "fakes":["stuckx", "stuckx"], "sound":"data/stick.mp3"},
                    {"id":128, "tenses":["sting","stung","stung"], "fakes":["stungx", "stungx"], "sound":"data/sting.mp3"},
                    {"id":129, "tenses":["stink","stank","stunk"], "fakes":["stankx", "stunkx"], "sound":"data/stink.mp3"},
                    {"id":130, "tenses":["strew","strewed","strewn"], "fakes":["strewedx", "strewnx"], "sound":"data/strew.mp3"},
                    {"id":131, "tenses":["stride","strode","stridden"], "fakes":["strodex", "striddenx"], "sound":"data/stride.mp3"},
                    {"id":132, "tenses":["strike","struck","struck"], "fakes":["struckx", "struckx"], "sound":"data/strike.mp3"},
                    {"id":133, "tenses":["strive","strove","striven"], "fakes":["strovex", "strivenx"], "sound":"data/strive.mp3"},
                    {"id":134, "tenses":["swear","swore","sworn"], "fakes":["sworex", "swornx"], "sound":"data/swear.mp3"},
                    {"id":135, "tenses":["sweep","swept","swept"], "fakes":["sweptx", "sweptx"], "sound":"data/sweep.mp3"},
                    {"id":136, "tenses":["swell","swelled","swollen"], "fakes":["swelledx", "swollenx"], "sound":"data/swell.mp3"},
                    {"id":137, "tenses":["swim","swam","swum"], "fakes":["swamx", "swumx"], "sound":"data/swim.mp3"},
                    {"id":138, "tenses":["swing","swung","swung"], "fakes":["swungx", "swungx"], "sound":"data/swing.mp3"},
                    {"id":139, "tenses":["take","took","taken"], "fakes":["tookx", "takenx"], "sound":"data/take.mp3"},
                    {"id":140, "tenses":["teach","taught","taught"], "fakes":["taughtx", "taughtx"], "sound":"data/teach.mp3"},
                    {"id":141, "tenses":["tear","tore","torn"], "fakes":["torex", "tornx"], "sound":"data/tear.mp3"},
                    {"id":142, "tenses":["tell","told","told"], "fakes":["toldx", "toldx"], "sound":"data/tell.mp3"},
                    {"id":143, "tenses":["think","thought","thought"], "fakes":["thoughtx", "thoughtx"], "sound":"data/think.mp3"},
                    {"id":144, "tenses":["thrive","throve","thriven"], "fakes":["throvex", "thrivenx"], "sound":"data/thrive.mp3"},
                    {"id":145, "tenses":["throw","threw","thrown"], "fakes":["threwx", "thrownx"], "sound":"data/throw.mp3"},
                    {"id":146, "tenses":["thrust","thrust","thrust"], "fakes":["thrustx", "thrustx"], "sound":"data/thrust.mp3"},
                    {"id":147, "tenses":["tread","trod","trodden"], "fakes":["trodx", "troddenx"], "sound":"data/tread.mp3"},
                    {"id":148, "tenses":["understand","undestood","understood"], "fakes":["undestoodx", "understoodx"], "sound":"data/understand.mp3"},
                    {"id":149, "tenses":["wake","woke","woken"], "fakes":["wokex", "wokenx"], "sound":"data/wake.mp3"},
                    {"id":150, "tenses":["wear","wore","worn"], "fakes":["worex", "wornx"], "sound":"data/wear.mp3"},
                    {"id":151, "tenses":["weave","wove","woven"], "fakes":["wovex", "wovenx"], "sound":"data/weave.mp3"},
                    {"id":152, "tenses":["weep","wept","wept"], "fakes":["weptx", "weptx"], "sound":"data/weep.mp3"},
                    {"id":153, "tenses":["win","won","won"], "fakes":["wonx", "wonx"], "sound":"data/win.mp3"},
                    {"id":154, "tenses":["wind","wound","wound"], "fakes":["woundx", "woundx"], "sound":"data/wind.mp3"},
                    {"id":155, "tenses":["wring","wrung","wrung"], "fakes":["wrungx", "wrungx"], "sound":"data/wring.mp3"},
                    {"id":156, "tenses":["write","wrote","written"], "fakes":["wrotex", "writtenx"], "sound":"data/write.mp3"}                                                          
                ];
            }
                             
            return{
                get: get
            }
        }
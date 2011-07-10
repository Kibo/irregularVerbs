class Import {
    
    def static SOURCE = "/home/tomas/NetBeansProjects/irregularVerbs/import/irregular.csv"
    def static DESTINATION_DIR = "/home/tomas/NetBeansProjects/irregularVerbs/data"
    def static DOWNLOAD_MP3 = false
    
    def static void main( args ){      
        make()
    }
    
    def static make(){
        def content = new StringBuilder(150)
        def id = 0
        new File( SOURCE ).eachLine(){ line ->
            def verbs = line.split(";")
            content.append("{\"id\":${id++}, \"tenses\":[\"${verbs[0].trim()}\",\"${verbs[1].trim()}\",\"${verbs[2].trim()}\"], \"fakes\":[\"${verbs[3].trim()}\", \"${verbs[4].trim()}\"], \"sound\":\"${verbs[5].trim()}\"},\n")                           
            
            if (DOWNLOAD_MP3){
                doMP3( verbs )
            }
            
        }
        
        def dataFile = new File( DESTINATION_DIR, 'data.js' )
        dataFile.write( content.toString().substring( 0, content.toString().length()-2 ) )        
    }
    
    def static doMP3( verbs ){
        for (i in 0..2){
            def output = "${DESTINATION_DIR}/${verbs[0].trim()}${i}.mp3"                      
            downloadMP3( output , verbs[i].trim())
        }
        
        joinMP3( "${DESTINATION_DIR}/${verbs[0].trim()}"  )
        deleteHelperFiles( "${DESTINATION_DIR}/${verbs[0].trim()}" )
                                   
    }
            
    def static downloadMP3( outputPath, verb){
        "wget -U \"Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.14) Gecko/20080404 Firefox/2.0.0.14\" -O ${outputPath} http://translate.google.com/translate_tts?q=\"${verb}\";".execute()
        sleep(3000)
    }
    
    def static joinMP3(verb){
        println verb
        ["sh", "-c" , "cat ${verb}* > ${verb}.mp3" ].execute()
        sleep(3000)
    }
    
    def static deleteHelperFiles( verb ){
        for ( i in 0..2 ) {
            new File("${verb}${i}.mp3").delete();
        }
    }
    
    
}

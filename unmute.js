
var express =   require("express");
var multer  =   require('multer');
var fs = require("fs");
var cors=require("cors")
var app         =   express();
var csv=require("fast-csv");
var map={};



var timeStamp="";

var storage =   multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, './file');
    },
    filename: function (req, file, callback) {
      timeStamp=Date.now();
      //var tmp=file.originalname+'-' + timeStamp+".csv";
      var fileTobeParse="";
      var tmp=timeStamp+".csv";
      fileTobeParse="./file/"+fileTobeParse+tmp;

      console.log(tmp);
      console.log(fileTobeParse);

      callback(null, tmp);
      
    },
    onFileUploadComplete: function (file) {
      console.log(file.fieldname + ' uploaded to  ' + file.path);
    }
});


var upload = multer({ storage : storage}).single('userFile');

app.use(cors());

app.get('/',function(req,res){
     
      res.sendFile(__dirname + "/public/index.html");
  
});


app.post('/',function(req,res){
   console.log(req.files);
    upload(req,res,function(err) {
        if(err) {
            return res.end("Error uploading file.");
        }
        res.end(`${timeStamp}`);
    });
});





app.get('/public/pastday.html', function(req, res){
  console.log(req.query);
res.sendFile(__dirname + "/public/pastday.html");
 
});


app.get('/public/lastweek.html', function(req, res){
  console.log(req.query);
res.sendFile(__dirname + "/public/lastweek.html");
 
});


app.get('/public/lastmonth.html', function(req, res){
  console.log(req.query);
res.sendFile(__dirname + "/public/lastmonth.html");
 
});


app.get('/public/alltime.html', function(req, res){
  console.log(req.query);
res.sendFile(__dirname + "/public/alltime.html");
 
});




app.get('/alltime',function(req,res){
  
    var reqFileNmae=req.query.filename;
    var reqFilePath="./file/"+reqFileNmae+".csv"

    var stream = fs.createReadStream(reqFilePath);
   
      var csvStream = csv()
      .on("data", function(data){
             if(data[12]<1||data[12]>1081){
              console.log("bad data");
             }
             else{
              if(data[7]!="streamCreator"){
              if(map[data[7]]){
                map[data[7]][0]=map[data[7]][0]+1;
                map[data[7]][2]=map[data[7]][2]+parseFloat(data[12]);
                console.log(map[data[7]]);
              }
              else{
                var arrStatics=[];
                arrStatics.push(1);
                arrStatics.push(data[8]);
                arrStatics.push(parseFloat(data[12]));
                map[data[7]]=arrStatics;
                console.log(map[data[7]]);
              }
              
             }
          }

      })
      .on("end", function(){
           console.log("\n\n\n");
           console.log("\n\n\n");
           console.log("\n\n\n");
           console.log("\n\n\n");
           var sortArr=[];
           for (var id in map){
           sortArr.push({"id":id, "count":map[id][0],"userSearch":map[id][1],"streamLength":map[id][2]});
           }
           
            sortArr.sort(function compare(a,b) {
              if (a.count < b.count)
                return 1;
              else if (a.count > b.count)
                return -1;
              else {
                if(a.streamLength>b.streamLength)
                   return -1;
                else if(a.streamLength<b.streamLength){
                    return 1;
                }
                else return 0;
              }
            });

            for (var i = 0; i < sortArr.length; i++) {
              sortArr[i].streamLength=caculateTime(sortArr[i].streamLength);
            };

          res.send(JSON.stringify(sortArr, null, 3));
            console.log("done");
           map={};

      });

  stream.pipe(csvStream);

  });




app.get('/datarequest',function(req,res){
  
    var reqFileNmae=req.query.filename;
    var startDate=req.query.startdate;
    var endDate=req.query.enddate;
    var reqFilePath="./file/"+reqFileNmae+".csv"

    var stream = fs.createReadStream(reqFilePath);
    
    var csvStream = csv()
    .on("data", function(data){
        console.log("\n\n\n");
        console.log("\n\n\n");
        console.log("\n\n\n");
        console.log("\n\n\n");

          
           if(data[12]<1||data[12]>1081){
            //console.log("bad data");
           }
           else{
            
               var date=new Date(data[0]);
               //console.log(date.getTime());
               if(date.getTime()>=startDate&&date.getTime()<=endDate){
                //console.log("valid date");
                if(data[7]!="streamCreator"){

                if(map[data[7]]){
                  map[data[7]][0]=map[data[7]][0]+1;
                  map[data[7]][2]=map[data[7]][2]+parseFloat(data[12]);
                  //console.log(map[data[7]]);
                }
                else{
                  var arrStatics=[];
                  arrStatics.push(1);
                  arrStatics.push(data[8]);
                  arrStatics.push(parseFloat(data[12]));
                  map[data[7]]=arrStatics;
                  //console.log(map[data[7]]);
                }
                //console.log(data);
               }
             }
        }
        
    })
    .on("end", function(){
      
         console.log("\n\n\n");
         console.log("\n\n\n");
         console.log("\n\n\n");
         console.log("\n\n\n");
         var sortArr=[];
         for (var id in map){
         sortArr.push({"id":id, "count":map[id][0],"userSearch":map[id][1],"streamLength":map[id][2]});
         }
         
          sortArr.sort(function compare(a,b) {
            if (a.count < b.count)
              return 1;
            else if (a.count > b.count)
              return -1;
            else {
              if(a.streamLength>b.streamLength)
                 return -1;
              else if(a.streamLength<b.streamLength){
                  return 1;
              }
              else return 0;
            }
          });

          for (var i = 0; i < sortArr.length; i++) {
            sortArr[i].streamLength=caculateTime(sortArr[i].streamLength);
          };
      

        res.send(JSON.stringify(sortArr, null, 3));

        
          console.log("done");
         map={};

      
    });

stream.pipe(csvStream);


});



function caculateTime(d){
      //d = Number(allseconds)
      var h = Math.floor(d / 3600);
      var m = Math.floor(d % 3600 / 60);
      var s = Math.floor(d % 3600 % 60);
      return ((h > 0 ? h + "h" + (m < 10 ? "0" : "") : "") + m + "m" + (s < 10 ? "0" : "") + s+"s"); 
}



app.listen(8081,function(){
    console.log("Working on port 8081");
});
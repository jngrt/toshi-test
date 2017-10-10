
const fs = require('fs');
const fileUrl = 'rental-data.json';

class RentalState {

  constructor(){
    console.log('new rental state');
    this.renter = 0;
    try{
      this.dataObj = JSON.parse(fs.readFileSync(fileUrl));
    }
    catch(e){
      this.dataObj = [];
    }
    console.log(this.dataObj);
  }
  available(){
    //return this.renter === 0;
    let last =  this.dataObj[this.dataObj.length-1];
    if( !last ){
      return true;
    }
    return last.end > 0;
  }
  amIRenting(session){
    let last =  this.dataObj[this.dataObj.length-1];
    if( !last ){
      return false;
    }
    return last.end === 0 && last.renter === session.user.toshi_id;
  }
  startRent(session){
    console.log(session);
    if( this.available() ){
      this.renter = 1;
      this.dataObj.push({
        renter: session.user.toshi_id,
        start: Date.now(),
        end: 0
      })
    }
  }
  endRent(session){
    let last =  this.dataObj[this.dataObj.length-1];
    if( last && last.renter === session.user.toshi_id ){
      last.end = Date.now();
      return true;
    }else {
      return false;
    }

  }

  updateFile(){
    fs.writeFile(
      fileUrl,
      JSON.stringify(this.dataObj, null, 2),function(err){
        if(err){
          console.log("write file error", err);
        }
      }
    );
  }

}



module.exports = RentalState;

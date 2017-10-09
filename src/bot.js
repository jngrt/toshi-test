const Bot = require('./lib/Bot')
const SOFA = require('sofa-js')
const Fiat = require('./lib/Fiat')

const http = require('http')

let bot = new Bot()

// ROUTING

bot.onEvent = function(session, message) {
  switch (message.type) {
    case 'Init':
      welcome(session)
      break
    case 'Message':
      onMessage(session, message)
      break
    case 'Command':
      onCommand(session, message)
      break
    case 'Payment':
      onPayment(session, message)
      break
    case 'PaymentRequest':
      welcome(session)
      break
  }
}

function onMessage(session, message) {
  welcome(session)
}

function onCommand(session, command) {
  switch (command.content.value) {
    case 'start-rent':
      startRentCmd(session)
      break
    case 'end-rent':
      endRentCmd(session)
      break
    case 'status':
      stateCmd(session)
      break
    }
}

function onPayment(session, message) {
  if (message.fromAddress == session.config.paymentAddress) {
    // handle payments sent by the bot
    if (message.status == 'confirmed') {
      // perform special action once the payment has been confirmed
      // on the network
    } else if (message.status == 'error') {
      // oops, something went wrong with a payment we tried to send!
    }
  } else {
    // handle payments sent to the bot
    if (message.status == 'unconfirmed') {
      // payment has been sent to the ethereum network, but is not yet confirmed
      sendMessage(session, `Thanks for the payment! 🙏`);
    } else if (message.status == 'confirmed') {
      // handle when the payment is actually confirmed!
    } else if (message.status == 'error') {
      sendMessage(session, `There was an error with your payment!🚫`);
    }
  }
}

// STATES
function startRentCmd(session){

  if( getRentalState(session) === 0 ){
    setRentalState(session, 1);
    sendMessage(session, 'Your rental period has started');
  } else {
    sendMessage(session, 'This bike is being rented by someone else');
  }
}
function endRentCmd(session){
  if( getRentalState(session) === 1 ){
    setRentalState(session, 0);
    sendMessage(session, 'Your rental period has ended');
  } else {
    sendMessage(session, 'No one is renting this bike at the moment');
  }
}
function stateCmd(session){
  sendMessage(session, `This bike is ${getRentalState(session) === 0? "":"not "} available`);
}
function getRentalState(session){
  return session.get('rentalState') || 0;
}
function setRentalState(session, newState){
  session.set('rentalState', newState);
}
function welcome(session) {
  sendMessage(session, `Hi! I'm a fair bike 🚲`)
}

function pong(session) {
  sendMessage(session, `Pong`)
}

// example of how to store state on each user
function count(session) {
  let count = (session.get('count') || 0) + 1
  session.set('count', count)
  sendMessage(session, `${count}`)
}

function donate(session) {
  // request $1 USD at current exchange rates
  Fiat.fetch().then((toEth) => {
    session.requestEth(toEth.EUR(1))
  })
}



// HELPERS

function sendMessage(session, message) {
  let controls = [
    {type: 'button', label: 'Start Rent', value: 'start-rent'},
    {type: 'button', label: 'End Rent', value: 'end-rent'},
    {type: 'button', label: 'Status', value: 'status'}
  ]
  session.reply(SOFA.Message({
    body: message,
    controls: controls,
    showKeyboard: false,
  }))
}

// PLACEHOLDER FOR LOCK FUNCTIONALITY
// implemented for now as webserver, giving back the lock state

http.createServer(function (request, res) {
  console.log('incoming request');
  res.setHeader('Content-Type', 'text/html');
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('ok');
}).listen(9876)

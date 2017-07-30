var Nightmare = require('nightmare');
var nightmare = Nightmare({ show: true });
var vo = require('vo');

if (process.argv.length != 4) {
  console.error("Please enter 2 arguments: npm start <username> <password>");
}
else {
  vo(run)(function(err, result) {
      if (err) throw err;
  });
}

function* run() {
  console.log("Executing nightmare");
  yield nightmare
    .goto('https://steamcommunity.com/login/home/?goto=workshop%2Fbrowse%2F%3Fappid%3D342560%26requiredtags%5B%5D%3Dairships')
    .type('.mainLoginLeftPanel_signin > #steamAccountName', process.argv[2])
    .type('.mainLoginLeftPanel_signin > #steamPassword', process.argv[3])
    .click('#login_btn_signin > input')
    .wait('a.pagelink')

  var numPages = yield nightmare.evaluate(function() {
    var arr = document.querySelectorAll('a.pagelink');
    var num = arr[arr.length - 1].text;

    return num - 1;
  });

  for (var i = 0; i < numPages; i++) {
    console.log("================");
    console.log("On page " + i);

    yield nightmare
      .goto('http://steamcommunity.com/workshop/browse/?appid=342560&requiredtags%5B0%5D=airships&actualsort=trend&p=' + i)
      .wait('.workshopItem')

    var links = yield nightmare.evaluate(function() {
      return Array.from(document.querySelectorAll('.workshopItem > a:nth-child(1)')).map(a => a.href);
    });

    for (var j = 0; j < links.length; j++) {
      console.log("Visiting " + links[j]);
      yield nightmare
        .goto(links[j])
        .wait('#SubscribeItemOptionAdd')
        .click('#SubscribeItemOptionAdd')
    }

    console.log("Navigating back");
  }

  yield nightmare
    .end()
}

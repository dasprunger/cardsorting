// card sorting javascript
// david sprunger 2015

var _DECK_COOKIE = "cs-deck";
var deck = [ "2h", "3h", "4h", "5h", "6h", "7h", "8h", "9h", "0h", "jh",
"qh", "kh", "ah", "2c", "3c", "4c", "5c", "6c", "7c", "8c", "9c", "0c", "jc",
"qc", "kc", "ac", "2d", "3d", "4d", "5d", "6d", "7d", "8d", "9d", "0d", "jd",
"qd", "kd", "ad", "2s", "3s", "4s", "5s", "6s", "7s", "8s", "9s", "0s", "js",
"qs", "ks", "as" ];

function shuffle() {
    // do a fisher-yates shuffle on the deck
    for (var i = 0; i < deck.length; i++) {
        var swap_index = Math.floor(Math.random() * (deck.length - i)) + i;
        var temp = deck[swap_index];
        deck[swap_index] = deck[i];
        deck[i] = temp;	
    }
};

function saveDeck() {
    $.cookie(_DECK_COOKIE, JSON.stringify(deck), 365);
};

function loadDeck() {
    if ($.cookie(_DECK_COOKIE)) {
        deck = JSON.parse($.cookie(_DECK_COOKIE));
    }
    else {
        shuffle();
        saveDeck();
    }
};

// sanitize text into our standard deck representation
function compactCardString(text) {
    var ret = text.toLowerCase();
    ret = ret.replace(/10/g, "0");
    ret = ret.replace("\u2660", "s").replace("\u2665", "h");
    ret = ret.replace("\u2663", "c").replace("\u2666", "d");
    ret = ret.replace(/[^0-9jqkashcd]/g, "");
    return ret;
};

function prettyPrintCardString(text) {
    var ret = text.replace(/[^0-9jqkashcd]/gi, "");
    ret = ret.replace(/(?:[^1])0/g, "10");
    ret = ret.replace("s", "\u2660").replace("h", "\u2665");
    ret = ret.replace("c", "\u2663").replace("d", "\u2666");
    ret = ret.toUpperCase();
    return ret;
};

// does text name a card in our deck?
function isValidCard(text) {
    var needle = compactCardString(text);
    for (var i = 0; i < deck.length; i++) {
        if (deck[i] == needle) return true;
    }
    return false;
}

// does firstCard appear before secondCard in the deck?
function lessThan(firstCard, secondCard) {
    var first = compactCardString(firstCard);
    var second = compactCardString(secondCard);

    for (var i = 0; i < deck.length; i++) 
    {
        if (deck[i] == second) return false;
        if (deck[i] == first) return true;
    }
    return false;
}

// is the string of cards given in least-to-greatest order?
function inOrder(cards) {
    // sanitize the input string
    var clean = compactCardString(cards);

    // cut the sanitized string into card identifiers
    var subDeck = [];
    while (clean.length >= 2) {
        subDeck.push(clean.substring(0, 2));
        clean = clean.substring(2);
    }

    // verify that the cards are in order
    for (var i = 0; i < subDeck.length - 1; i++) {
        if (!lessThan(subDeck[i], subDeck[i+1])) return false;
    }
    return true;
}

function countCardsInString(cards) {
    return compactCardString(cards).length / 2;
}

function addHistory(firstCard, secondCard) {
    var count = +$("#countReg").text();
    var context = {"count": count + 1};
    if (lessThan(firstCard, secondCard)) {
        context["lowerCard"] = prettyPrintCardString(firstCard);
        context["higherCard"] = prettyPrintCardString(secondCard);
    } else if (lessThan(secondCard, firstCard)) {
        context["lowerCard"] = prettyPrintCardString(secondCard);
        context["higherCard"] = prettyPrintCardString(firstCard);
    }
    var template = Handlebars.compile($("#historyRowTemplate").html());

    // which column do we add this entry to?
    var colNum = Math.floor((count % 64) / 16) + 1;
    var tableName = "#historyTable" + colNum + ">tbody";
    if (count % 16 == 0) {
        $(tableName).empty();
    }
    $(tableName).append(template(context));
    $("#countReg").text(count + 1);

    // deduct a point for doing a compare
    var points = +$("#pointReg").text();
    $("#pointReg").text(points - 1);
}

function startPosition() {
    $("#infoRow").show();
    $("#compareRow").hide();
    $("#historyRow").hide();
    $("#historyRow>div>table>tbody").empty();
    $("p.after-num").hide();
    $("#setNumCards").attr("disabled", null);
    $("#playAgain").hide();
    $("#checkText").empty();
}

function readyPosition() {
    $("#infoRow").show();
    $("#compareRow").hide();
    $("#historyRow").hide();
    $("p.after-num").show();

    var n = +$("#numCards").val();
    var par = Math.floor(n * Math.log(n)/Math.log(2)) - n + 1;
    $("span.fill-nc").text(n);
    $("span.fill-p").text(par);
    $("#countReg").text(0);
    $("#pointReg").text(par);

    $("#setNumCards").attr("disabled", "disabled");
    $("#playAgain").hide();
}

function goPosition() {
    $("#infoRow").hide();
    $("#compareRow").show();
    $("#historyRow").show();
    $("#playAgain").hide();
}

function playAgainPosition() {
    $("#infoRow").hide();
    $("#compareRow").show();
    $("#historyRow").show();
    $("#playAgain").show();
    $("#checkText").text("Yeahhhh!");
}

$(document).ready(function () {
    shuffle();
    startPosition();

    $("#setNumCards").click(function () {
        if (!isNaN(parseInt($("#numCards").val()))) {
            readyPosition();
        }
    });
    $("#startGame").click(function () {
        goPosition();
    });


    $("#compareButton").click(function() {
        addHistory($("#firstCard").val(), $("#secondCard").val());
    });
    $("#finalAnswerButton").click(function() {
        var ans = $("#finalAnswer").val();
        if (inOrder(ans) && countCardsInString(ans) == +$("#numCards").val()) {
            playAgainPosition();
        }
        else {
            $("#checkText").text("Nope. :(");
        }
    });
    $("#playAgain").click(function() {
        startPosition();
    });
});








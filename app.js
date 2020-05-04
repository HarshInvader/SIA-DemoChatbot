$(document).ready(function () {

    // Credentials
    var baseUrl = "https://api.api.ai/v1/query?v=20170712&";
    var accessToken = "daf9639342f646e6817a04be1a0c5605";
    //553ab6017e584e0fa351952c8c9ca956

    //  Toggle chatbot 
    $('.profile_div').click(function () {
        $('.profile_div').fadeToggle(250);
        $('.chatCont').fadeToggle(250);
        $('.bot_profile').fadeToggle(250);
        $('.chatForm').fadeToggle(250);
        document.getElementById('chat-input').focus("");
    });

    $('.close').click(function () {
        $('.profile_div').fadeToggle(100);
        $('.chatCont').fadeToggle(100);
        $('.bot_profile').fadeToggle(100);
        $('.chatForm').fadeToggle(100)
    });

    //Session code copied from StackExchange
    // Session Init (is important so that each user interaction is unique)--
    var session = function () {
        // Retrieve the object from storage
        if (sessionStorage.getItem('session')) {
            var retrievedSession = sessionStorage.getItem('session');
        } else {
            // Random Number Generator
            var randomNo = Math.floor((Math.random() * 1000) + 1);
            // get Timestamp
            var timestamp = Date.now();
            // get Day
            var date = new Date();
            var weekday = new Array(7);
            weekday[0] = "Sunday";
            weekday[1] = "Monday";
            weekday[2] = "Tuesday";
            weekday[3] = "Wednesday";
            weekday[4] = "Thursday";
            weekday[5] = "Friday";
            weekday[6] = "Saturday";
            var day = weekday[date.getDay()];
            // Join random number+day+timestamp
            var session_id = randomNo + day + timestamp;
            // Put the object into storage
            sessionStorage.setItem('session', session_id);
            var retrievedSession = sessionStorage.getItem('session');
        }
        return retrievedSession;
        // console.log('session: ', retrievedSession);
    }

    // Call Session init
    var mysession = session();


    // on input/text enter
    $('#chat-input').on('keyup keypress click', function (e) {
        var keyCode = e.keyCode || e.which;
        var text = $("#chat-input").val();
        if (keyCode === 13) {
            if (text == "" || $.trim(text) == '') {
                e.preventDefault();
                return false;
            } else {
                $("#chat-input").blur();
                setUserResponse(text);
                send(text);
                e.preventDefault();
                return false;
            }
        }
    });

    $('#sendButton').on('click', function (e) {
        var text = $("#chat-input").val();
        if (text == "" || $.trim(text) == '') {
            e.preventDefault();
            return false;
        } else {
            $("#chat-input").blur();
            setUserResponse(text);
            send(text);
            e.preventDefault();
            return false;
        }
    });


    // Send request to API.AI ---
    function send(text) {
        console.log(baseUrl + "query=" + text + "&lang=en-us&sessionId=" + mysession);
        $.ajax({
            type: "GET",
            url: baseUrl + "query=" + text + "&lang=en-us&sessionId=" + mysession,
            contentType: "application/json",
            dataType: "json",
            headers: {
                "Authorization": "Bearer " + accessToken
            },
            // data: JSON.stringify({ query: text, lang: "en", sessionId: "somerandomthing" }),
            success: function (data) {
                main(data);
                // console.log(data);
            },
            error: function (e) {
                console.log(e);
            }
        });
    }


    // Main function -----
    function main(data) {
        var action = data.result.action;
        var speech = data.result.fulfillment.speech;
        // use incomplete if u use required in api.ai questions in intent
        // check if actionIncomplete = false
        var incomplete = data.result.actionIncomplete;
        if (data.result.fulfillment.messages) { // check if messages are there
            if (data.result.fulfillment.messages.length > 0) { //check if quick replies are there
                var suggestions = data.result.fulfillment.messages[1];
            }
        }
        switch (action) {
            // case 'your.action': // set in api.ai
            // Perform operation/json api call based on action
            // Also check if (incomplete = false) if there are many required parameters in an intent
            // if(suggestions) { // check if quick replies are there in api.ai
            //   addSuggestion(suggestions);
            // }
            // break;
            default:
                setBotResponse(speech);
                if (suggestions) { // check if quick replies are there in api.ai
                    addSuggestion(suggestions);
                }
                break;
        }
    }


    // Set bot response in result_div 
    function setBotResponse(val) {
        setTimeout(function () {
            if ($.trim(val) == '') {
                val = 'I couldn\'t get that. Let\' try something else!'
                var BotResponse = '<p class="botResult animation">' + val + '</p><div class="clearfix"></div>';
                $(BotResponse).appendTo('#result_div');
            } else {
                val = val.replace(new RegExp('\r?\n', 'g'), '<br />');
                var BotResponse = '<p class="botResult animation">' + val + '</p><div class="clearfix"></div>';
                $(BotResponse).appendTo('#result_div');
            }
            scrollToBottomOfResults();
            hideSpinner();
        }, 500);
    }


    // Set user response in result_div 
    function setUserResponse(val) {
        var UserResponse = '<p class="userEnteredText">' + val + '</p><div class="clearfix"></div>';
        $(UserResponse).appendTo('#result_div');
        $("#chat-input").val('');
        scrollToBottomOfResults();
        showSpinner();
        $('.suggestion').remove();
    }


    // Scroll to the bottom of the results div 
    function scrollToBottomOfResults() {
        var terminalResultsDiv = document.getElementById('result_div');
        terminalResultsDiv.scrollTop = terminalResultsDiv.scrollHeight;
    }


    // ASCII Spinner 
    function showSpinner() {
        $('.spinner').show();
    }

    function hideSpinner() {
        $('.spinner').hide();
    }


    // Suggestions 
    function addSuggestion(textToAdd) {
        console.log(textToAdd)
        setTimeout(function () {
            var suggestions = textToAdd.replies;
            var suggLength = textToAdd.replies.length;
            $('<p class="suggestion"></p>').appendTo('#result_div');
            $('<div class="sugg-title">Suggestions: </div>').appendTo('.suggestion');
            // Loop through suggestions
            for (i = 0; i < suggLength; i++) {
                $('<span class="sugg-options">' + suggestions[i] + '</span>').appendTo('.suggestion');
            }
            scrollToBottomOfResults();
        }, 1000);
    }

    // On click of suggestions get value and send to API.AI
    $(document).on("click", ".suggestion span", function () {
        var text = this.innerText;
        setUserResponse(text);
        send(text);
        // $('.suggestion').remove();
    });
    $('.optionButton').on('click', function () {
        var text = this.innerText;
        setUserResponse(text);
        send(text);
        console.log(text);
    });

});
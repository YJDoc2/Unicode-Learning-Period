let connInfo = {};
let sender = '';
let token = 'Bearer ';
const baseURL = 'http://localhost:3000';
const socket = io(baseURL);

let email = '';

//! ALL EVENTS FIRED AND THEIR SIGNIFICANCE

//-----------------------------------------

//! As Socket io client does not support socket.to (...?) ,
//! all Events are broadcasted to and recieved by server.

//* Server-Error : Failure of db connection or other server-side error          ----->for all
//* support-login : Login from a support-staff acc.                             ----->for server only
//* msg : either client or staff sent a message
//* request-support : A logged in client has requested for a chat               ----->for server only
//* no-support : no free service-rep is availabel for chat                      ------>for client only
//* support-connected : a free service-rep is available and has connected       ----->for client only
//* client-connected : a client has connected to for a chat                     ----->for staff only
//* support-disconnected : when a staff is disconnected between ongoing chat    ----->for client only
//* client-disconnected : when client diconnects-aburptly or resolving of error ----->for staff only

//----------------------------------------

//! Setup AJAX Auth header once logged in
function setupAJAX() {
    $.ajaxSetup({
        headers: {
            Authorization: token
        }
    });
}

$(document).ready(function() {
    //!-----------------------------------------------------------------------
    //!Socket Events

    //! For some Major server of db error
    socket.on('Server-Error', () => {
        $('#chat').append(`<div class="textBox">
        <span class="btn btn-danger mt-3">Sorry Service Is temporarily Unavailable</span>
      </div>`);
        var objDiv = document.querySelector('#chatbox');
        objDiv.scrollTop = objDiv.scrollHeight;
        $('#sendBtn').hide();
        $('#startBtn').show();
    });

    //! Common Events----------------------
    socket.on('msg', data => {
        $('#chat').append(`<div class="textBox">
                        <span class=speech-bubble-other>${data.message}</span>
                      </div>`);
        var objDiv = document.querySelector('#chatbox');
        objDiv.scrollTop = objDiv.scrollHeight;
    });
    //!------------------------------End of common events

    //! Events  For only Clients-----------------------

    //! No Free support-rep is available
    socket.on('no-support', data => {
        $('#info')
            .show()
            .text('Sorry No Support Is available!')
            .removeClass('btn-success')
            .addClass('btn-danger');
        setTimeout(() => {
            $('#info').hide();
        }, 3000);
    });

    //! A free service-rep has connected,now chat can begin
    socket.on('support-connected', data => {
        connInfo = data;
        $('#info')
            .show()
            .text('Connected to Support')
            .removeClass('btn-danger')
            .addClass('btn-success');

        $('#sendBtn').show();
        $('#startBtn').hide();
        $('#chat').empty();

        //console.log(data.id);
    });

    //! For abrupt disconnection from service-rep
    //! Ideally SHOULD NOT Happen from staff side
    socket.on('support-disconnected', () => {
        $('#info')
            .show()
            .text('Sorry Service is temporarily Unavalable!')
            .removeClass('btn-success')
            .addClass('btn-danger');
        $('#chat').append(`<div class="textBox">
        <span class="btn btn-danger mt-3">Sorry Service Is temporarily Unavailable</span>
      </div>`);
        var objDiv = document.querySelector('#chatbox');
        objDiv.scrollTop = objDiv.scrollHeight;
        $('#sendBtn').hide();
        $('#startBtn').show();
    });
    //!------------------------------------------End of client events

    //! Events for staff only-----------------------------------

    //! A client has requested for service and connection is made
    socket.on('client-connected', data => {
        connInfo = data;
        $('#info')
            .show()
            .text('Client Has Connected')
            .removeClass('btn-success')
            .addClass('btn-danger');
        $('#sendBtn').show();
        $('#chat').empty();
    });

    //! Abrupt or decided (due to resolution of problem) disconnection of client
    socket.on('client-disconnected', () => {
        $('#info')
            .show()
            .text('No Connection')
            .removeClass('btn-danger')
            .addClass('btn-success');

        $('#chat').append(`<div class="textBox">
                        <span class="btn btn-danger mt-3">Client Has Disconnected</span>
                      </div>`);
        var objDiv = document.querySelector('#chatbox');
        objDiv.scrollTop = objDiv.scrollHeight;

        $('#sendBtn').hide();
        setTimeout(() => {
            $('#chat').empty();
        }, 1500);
    });

    //!-------------------------------------------------End of staff events

    //!-----------------------End of socket Events------------------------

    //! DOM Manipulation And events

    //! login for Client
    $('#clientBtn').click(function(e) {
        e.preventDefault();
        email = $('#clientU').val();

        let password = $('#clientP').val();
        $.post(baseURL + '/user/user/login', {
            email: email,
            password: password
        })
            .done(data => {
                token = token + data.token; //* Auth JWT Token setup
                sender = 'CLIENT';
                setupAJAX();
                $('#login').hide();
                $('#chatbox').show();
                $('#info')
                    .text('')
                    .hide();
            })
            .fail(err => {
                console.log(err);
                $('#info')
                    .show()
                    .text('Unable To Login.PLease Check Credentials')
                    .removeClass('btn-success')
                    .addClass('btn-danger');
            });
        //console.log(username, password);
    });

    //! Login for staff
    $('#supportBtn').click(function(e) {
        e.preventDefault();
        email = $('#supportU').val();
        let password = $('#supportP').val();
        $.post(baseURL + '/user/staff/login', {
            email: email,
            password: password
        })
            .done(data => {
                token = token + data.token; //* Auth JWT Token setup
                sender = 'SUPPORT';
                setupAJAX();
                $('#login').hide();
                $('#startBtn').hide();
                $('#chatbox').show();
                $('#info')
                    .text('')
                    .hide();
                socket.emit('support-login', { email: email });
            })
            .fail(err => {
                console.log(err);
                $('#info')
                    .show()
                    .text('Unable To Login.PLease Check Credentials')
                    .removeClass('btn-success')
                    .addClass('btn-danger');
            });

        //console.log(username, password);
    });

    //! Start Btn-request for a support chat
    $('#startBtn').click(function(e) {
        e.preventDefault();
        socket.emit('request-support', { email: email });
    });

    //! Actual Message send btn
    $('#sendBtn').click(function(e) {
        e.preventDefault();
        let msg = $('#msg').val();
        //* IN case message is empty
        if (!msg || !msg.trim()) {
            return;
        }
        $.post(baseURL + '/api/support/log', {
            chatId: connInfo.chatId,
            sender: sender,
            time: new Date(),
            message: msg
        })
            .done(data => {
                socket.emit('msg', {
                    connInfo: connInfo,
                    chatid: connInfo.chatId,
                    message: msg
                });
                $('#chat').append(`<div class="textBox">
                        <span class=speech-bubble-self>${msg}</span>
                      </div>`);
                var objDiv = document.querySelector('#chatbox');
                objDiv.scrollTop = objDiv.scrollHeight;
                $('#msg').val('');
            })
            .fail(err => {
                console.log(err);
                $('#info')
                    .show()
                    .text('Error on Server Side...')
                    .removeClass('btn-success')
                    .addClass('btn-danger');
            });
    });
});

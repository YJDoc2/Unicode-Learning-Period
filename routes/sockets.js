const uuidv4 = require('uuid/v4');
const ServiceChat = require('../models/serviceChat');

let staff = [];
let freeStaff = [];
let staffSockToMail = new Map(); //mapping of  staff sockets to mail

let connections = []; // array of obj containing chatid,client socket id and staff socket id

//! ALL EVENTS FIRED AND THEIR SIGNIFICANCE

//-----------------------------------------

//! Sending of events is contrlled by io.to() method ,
//! thus only required events gets messages to specific sockets,
//! and not broadcasted to all sockets

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

module.exports = function(socket, io) {
    //! When a service-rep staff logs in
    socket.on('support-login', data => {
        freeStaff.push(socket.id);
        staffSockToMail.set(socket.id, data.email);
        staff.push(socket.id);
    });

    //! Just a event forward,
    //! as socket io client does not support socket.to,
    //! and socket.emit does not carry data ...??? MAYBE A CODING BUG OR ERRORS...????
    socket.on('msg', data => {
        let { clientSock, supportSock } = data.connInfo;
        io.to(socket.id == clientSock ? supportSock : clientSock).emit(
            'msg',
            data
        );
    });

    //! when a logged in client requests support by clickng 'start' btn
    socket.on('request-support', async data => {
        //* Check if any staff is free
        if (freeStaff.length <= 0) {
            io.to(socket.id).emit('no-support');
        } else {
            //* allocate as per FIFO
            supportId = freeStaff.shift();
            let id = uuidv4();
            //* For storing in db
            let temp = {
                id: id,
                clientSock: socket.id,
                supportSock: supportId,
                clientEmail: data.email,
                supportEmail: staffSockToMail.get(supportId),
                start: new Date()
            };
            //*To send to client and staff
            let info = {
                chatId: id,
                clientSock: socket.id,
                supportSock: supportId
            };
            try {
                let chat = await ServiceChat.create(temp);
                connections.push(info);
                io.to(socket.id).emit('support-connected', info);
                io.to(supportId).emit('client-connected', info);
            } catch (err) {
                console.log(err);
                io.emit('Server-Error');
                return;
            }
        }
    });

    //! When any socket disconnects
    socket.on('disconnect', async data => {
        //* Find chat,if any, assosiated with disconnected socket
        let chat = connections.filter(data => {
            return (
                data.clientSock == socket.id || data.supportSock == socket.id
            );
        })[0];

        //* If disconnected was staff,then
        if (staff.includes(socket.id)) {
            staffSockToMail.delete(socket.id);
            //* if disconnected staff was free, that is not connected to client
            if (freeStaff.includes(socket.id)) {
                freeStaff = freeStaff.filter(id => {
                    return id != socket.id;
                });
            } else {
                //* if staff was in a help-chat
                let connInfo = connections.filter(data => {
                    return data.supportSock == socket.id;
                })[0];
                io.to(connInfo.clientSock).emit('support-disconnected');

                //* Remove that connection from memory
                connections = connections.filter(data => {
                    return data.supportSock != socket.id;
                });
            }
        }

        //* it was a client then
        let connInfo = connections.filter(data => {
            return data.clientSock == socket.id;
        })[0];

        if (connInfo) {
            supportId = connInfo.supportSock;
            connections = connections.filter(data => {
                data.clientSock != socket.id;
            });
            io.to(supportId).emit('client-disconnected');
            freeStaff.push(supportId);
        }

        //* If chat existed Log the end-time of chat
        if (chat) {
            try {
                let temp = await ServiceChat.findOneAndUpdate(
                    { id: chat.chatId },
                    { $set: { end: new Date() } }
                );
            } catch (err) {
                console.log(err);
            }
        }
    });
};

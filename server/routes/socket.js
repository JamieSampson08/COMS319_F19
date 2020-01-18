const express = require('express');
const router = express.Router();


let players = [];
let rooms = [];
let codeNumber = 1000;

router.get('/', function(req, res, next){
    console.log('endpoint hit');
    res.io.sockets.on('connection', function (socket) {
        console.log('User connected: ' + socket.id);
        let player = createPlayer(socket.id, null);

        socket.on('create game', function (data) {
            // create a new room
            let room = createRoom("RM" + codeNumber);
            let player = findPlayerBySocketId(data.socketId);
            player.username = data.username;
            codeNumber++;
            room.size ++;
            room.players.push(player);
            socket.join(room.code);
            res.io.sockets.in(room.code).emit('game created', {code: room.code});
            console.log('New Room Created: ' + room.code);
        });

        // data = {"room", "socketId"}
        socket.on('join game', function (data) {
            // find the socket user
            let person = findPlayerBySocketId(data.socketId);
            if(!person){
                console.log("Unable to find socketId: " + data.socketId);
                return
            }
            person.username = data.username;
            const socketId = person.socketId;

            console.log(person.username + ' is attempting to join room ' + data.code);
            let room = findRoomByCode(data.code);
            let message = "";
            if (room) {
                console.log(room.code);
                console.log(room.size);
                if (room.size <= 5) {
                    room.size ++;
                    room.players.push(player);
                    socket.join(room.code);
                    console.log('Successfully joined room: ' + data.code + ' as player ' + room.size);
                    message = "Success";
                } else {
                    console.log('Room ' + data.code + ' is full.');
                    message = "Room Full";
                }
            }
            else {
                console.log("Unable to find room " + data.code);
                message = "Room Not Found";
            }

            res.io.sockets.to(`${socketId}`).emit('join status', {msg: message});
        });

        socket.on('update players', function(data){
            let room = findRoomByCode(data.code);
            let send = {
                "allPlayerUsernames": getAllUsernames(room.players),
                "size": room.size,
            };
            res.io.sockets.in(data.code).emit("new player joined", send);
        });

        socket.on('submit giph', function(data){
            let player = findPlayerBySocketId(data.socketId);
            player["giph"] = data.giph;
            let send = {
                username: player.username,
                giph: player.giph,
            };
            // send to all clients in room including sender
            res.io.sockets.in(data.code).emit('giph submission', send);
        });

        socket.on('submit judging', function(data){
            let room = findRoomByCode(data.code);
            console.log("Judging for room: " + room.code);
            let playerIndex = findPlayerByUsername(data.giph.username, room);
            data.allPlayerScores[playerIndex]++;
            console.log(data.allPlayerScores);

            let send = {
                winningGiph: data.giph,
                allPlayerScores: data.allPlayerScores,
            };

            res.io.sockets.in(data.code).emit("judging submitted", send)
        });

        socket.on('start next round', function(data){
            let room = findRoomByCode(data.code);
            room.round ++;
            var send = {
                round: room.round,
            };

            // pick next judge
            if((data.judgeIndex + 1) === room.size){
                send["judgeIndex"] = 0;
            }
            else {
                send["judgeIndex"] = data.judgeIndex + 1;
            }
            res.io.sockets.in(data.code).emit("next round start", send)
        });

        socket.on('update prompt', function(data){
            let room = findRoomByCode(data.code);
            let send = {
                prompt: data.prompt,
                usedPrompts: data.usedPrompts,
            }
            res.io.sockets.in(data.code).emit("prompt updated", send)
        });

        socket.on('start game', function(data){
            let room = findRoomByCode(data.code);
            console.log("Game starting for code: " + room.code);
            res.io.sockets.in(data.code).emit('game started', {
                startGame: true,
                judgeIndex: 0,
                round: room.round,
            });
        });

        socket.on('disconnect', function () {
            console.log('User disconnected: ' + socket.id);
            removePlayer(socket.id);
        });
    });
});

function findPlayerByUsername(username, room){
    for(let i = 0; i < room.size; i++){
        let person = room.players[i];
        if(person.username == username){
            return i;
        }
    }
    return -1;
}

function findPlayerBySocketId(socketId){
    for (let i = 0; i < players.length; i++) {
        let person = players[i];
        if (person.socketId === socketId) {
            return person;
        }
    }
    return null;
}

function findRoomByCode(code){
    for (let i = 0; i < rooms.length; i++) {
        let room = rooms[i];
        if (room.code === code) {
            return room;
        }
    }
    return null;
}

function getAllUsernames(players){
    let usernames = [];
    for(let i = 0; i < players.length; i++){
        usernames.push(players[i].username);
    }
    return usernames;
}

function createRoom(code){
    let room = {
        "code": code,
        "size": 0,
        "players": [],
        "round": 1,
    };
    rooms.push(room);
    return room
}

function createPlayer(socketId, username){
    let player = {
        "socketId": socketId,
        "username": username,
        "isJudge": false,
    };
    players.push(player);
    return player
}

function removePlayer(socketId){
    for (let i = 0; i < players.length; i++) {
        let player = players[i];
        if (player.socketId === socketId) {
            console.log("Found player");
            players.splice(i, 1);
            for (let j = 0; j < rooms.length; j++) {
                let room = rooms[j];
                let found = false;
                for (let k = 0; k < room.size; k++) {
                    let p = room.players[k];
                    if (p.socketId === socketId) {
                        console.log("found room");
                        room.players.splice(k, 1);
                        room.size --;
                        found = true;
                        break;
                    }
                }
                if (found){
                    if(room.size === 0){
                        rooms.splice(j, 1);
                        console.log("Room Deleted: " + room.code);
                    }
                    break;
                }
            }
            break;
        }
    }
}

module.exports = router;
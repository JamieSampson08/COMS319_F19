import React, {Component} from 'react';
import '../App.css';
import {Button} from "react-bootstrap";
import io from "socket.io-client";
import Join from "./Join";
import Game from "./Game";

export default class Mode extends Component {
    constructor(props) {
        super(props);
        this.state = {
            code: null,
            createDisabled: false,
            joinSelected: false,
        };

        const server = "f9ca81c8";
        // const address = "https://" + server + ".ngrok.io";
        // comment out the two lines above and uncomment the line below to run on localhost
         const address = "http://localhost:9000";
        this.socket = io(address);
        this.createGame = this.createGame.bind(this);
    }

    componentDidMount() {
        this.socket.on('game created', res => {
            this.setState({
                code: res.code,
                createDisabled: true,
            });
        });
    }

    render() {
        if(this.state.createDisabled){
            return (
                <Game
                    code={this.state.code}
                    socket={this.socket}
                    username={this.props.username}/>
            )
        }
        if(this.state.joinSelected){
            return (
                <Join
                    socket={this.socket}
                    username={this.props.username}/>
            )
        }
        return (
            <div>
                <h1 className="Title-Header">Create or Join Game?</h1>
                <div className="Button-Div">
                    <Button variant="warning" size="lg" style={{width: '75%', textAlign: "center"}}
                            onClick={() => this.setState({joinSelected: true})}>Join Game</Button>
                    <br/>
                    <Button variant="warning" size="lg" style={{width: '75%', textAlign: "center"}}
                            disabled={this.state.createDisabled} onClick={this.createGame}>Create Game</Button>
                    <h3>{this.state.code}</h3>
                </div>
            </div>
        );
    }

    createGame() {
        const data = {
            "username": this.props.username,
            "socketId": this.socket.id
        };
        this.socket.emit('create game', data);
    }
}
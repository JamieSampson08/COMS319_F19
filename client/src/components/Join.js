import React, {Component} from 'react';
import '../App.css';
import {Button} from "react-bootstrap";
import Game from "./Game";

export default class Join extends Component {
    constructor(props) {
        super(props);
        this.state = {
            connection: "Not Connected",
            enterGame: false,
            code: null,
        };

        this.joinGame = this.joinGame.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount() {
        this.props.socket.on('join status', res => {
            if(res.msg === 'Success') {
                this.setState({
                    connection: res.msg,
                    enterGame: true,
                });
            }
            else {
                this.setState({
                    connection: res.msg,
                    enterGame: false,
                });
            }
        });
    }

    handleChange(event) {
        this.setState({code: event.target.value});
    }

    render() {
        if(this.state.enterGame){
            return (
                <Game
                    code={this.state.code}
                    socket={this.props.socket}
                    username={this.props.username}
                />
            )
        }
        return (
            <div>
                <h1 className="Title-Header">Enter Game Code</h1>
                <div className="Button-Div">
                    <input type="text" value={this.state.code} onChange={this.handleChange}></input>
                    <br />
                    <Button variant="warning" size="lg" style={{width: '75%', textAlign: "center"}} onClick={this.joinGame}>Submit</Button>
                    <br/>
                    <h3>{this.state.connection}</h3>
                </div>
            </div>
        );
    }

    joinGame() {
        const data = {
            "code": this.state.code,
            "socketId": this.props.socket.id,
            "username": this.props.username,
        };
        this.props.socket.emit('join game', data);
    }
}
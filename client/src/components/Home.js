import React, {Component} from 'react';
import {Button} from 'react-bootstrap';
import '../App.css';
import Mode from "./Mode";

export default class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            submitted: false,
            username: "",
        };
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        this.setState({username: event.target.value});
    }

    render() {
        let disabled = false;
        if(this.state.submitted){
            return (
                <Mode username={this.state.username}/>
            )
        }
        if(this.state.username.length === 0){
            disabled = true;
        }
        return (
            <div>
                <h1 className="Title-Header">Giphs Against Humanity</h1>
                <div className="Button-Div">
                    <h3 className="Title-Header">Enter Username</h3>
                    <br/>
                    <input type="text" value={this.state.username} onChange={this.handleChange}></input>
                    <br />
                    <Button variant="warning" size="lg" style={{width: '75%', textAlign: "center"}} disabled={disabled} onClick={() => this.setState({submitted: true})} block>Submit</Button>
                </div>
            </div>
        );
    }
}
import React, {Component} from 'react';
import {Button, Table} from 'react-bootstrap';
import '../App.css';
import Home from './Home';

export default class FinalScore extends Component {
    constructor(props) {
        super(props);
        this.state = {
            goHome: false,
        }
    }

    render() {
        if (this.state.goHome){
            return(<Home />)
        }
        return(
            <div>
                <h1 className="Title-Header">Final Scores</h1>
                {this.getWinner()}
                <div className="Button-Div">
                    <Table>
                        {this.displayScores()}
                    </Table>
                    <Button variant="warning" size="lg" style={{width: '75%', textAlign: "center"}} onClick={() => this.setState({goHome: true})} block>Play Again?</Button>
                </div>
            </div>
        );
    }

    displayScores() {
        const _this = this;
        let count = -1;
        return _this.props.allPlayerScores.map(function (score) {
            count ++;
            return (
                <tr>
                    <p className="Waiting-Text">{_this.props.allPlayerUsernames[count]} : {score}</p>
                </tr>
            )
        })
    }

    getWinner() {
        var max = 0;
        let count = 0;
        for (let i = 0; i < this.props.allPlayerScores.length; i++) {
            if (this.props.allPlayerScores[i] > max){
                max = this.props.allPlayerScores[i];
                count = i;
            }
        }
        return <h3 className="Waiting-Text">Winner: {this.props.allPlayerUsernames[count]} <br/>Score: {this.props.allPlayerScores[count]}</h3>;
    }
}
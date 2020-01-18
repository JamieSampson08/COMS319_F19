import React, { Component } from 'react';
import {Button, Card, Image} from 'react-bootstrap';
import '../App.css';

export default class JudgingGiph extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isSelected: false,
        };

        this.selectGiph = this.selectGiph.bind(this);
    }

    formatTitle(){
        const newTitle = this.props.title.replace("GIF", "").split("by");
        if(newTitle[0].trim().length === 0){
            if(newTitle[1] && newTitle[1].trim().length === 0){
                return "Unknown";
            }
            return this.props.title;
        }
        return newTitle[0];
    }

    showUsername(){
        if(this.props.judgingComplete) {
            return this.props.username;
        }
    }

    render(){
        let cardBackground = "dark";
        if(this.state.isSelected){
            cardBackground = "warning";
        }
        if(this.props.judgingComplete && this.props.judgeGiph.id === this.props.id){
            cardBackground = "success";
        }

        if (this.props.isSubmitted){
            return (
                <Card bg={cardBackground} style={{width: "17rem"}} className="text-white">
                    <Card.Header as="h5" className="Card-Title">{this.formatTitle()}</Card.Header>
                    <Card.Body>
                        <br />
                        <Image className="mx-auto d-block" height="200" width="200" src={this.props.url}/>
                        <br />
                        {this.getSelectButton()}
                        <br />
                        <h5 className="Card-Title">{this.showUsername()}</h5>
                    </Card.Body>
                </Card>
            )
        }
        if(this.props.isJudgeGiph){
            return (
                <Card bg="dark" style={{width: "17rem"}} className="text-white">
                    <Card.Body>
                        <br />
                        <h1 className="Thinking-Text">Judging</h1>
                    </Card.Body>
                </Card>
            )
        }
        return (
            <Card bg="dark" style={{width: "17rem"}} className="text-white">
                <Card.Body>
                    <br />
                    <h1 className="Thinking-Text">Thinking...</h1>
                </Card.Body>
            </Card>
        )

    }

    getSelectButton(){
        if(!this.props.isJudge){
            return;
        }

        let disabled = false;
        let buttonName = "Select";

        if((this.props.judgeGiph && this.props.judgeGiph.id !== this.props.id) || this.props.judgingComplete){
            disabled = true;
        }

        if(this.state.isSelected){
            buttonName = "Unselect";
        }

        return(
            <Button variant="light" block onClick={this.selectGiph} disabled={disabled}>{buttonName}</Button>
        )
    }

    selectGiph(){
        if(this.props.judgeGiph == null){
            let jsonGiph = {
                "id": this.props.id,
                "title": this.props.title,
                "url": this.props.url,
                "username": this.props.username,
            };
            this.props.updateJudgeSelected(jsonGiph);
        }
        else if(this.state.isSelected){
            this.props.updateJudgeSelected(null);
        }
        else {
            return;
        }
        this.setState({isSelected: !this.state.isSelected,});
    }
}
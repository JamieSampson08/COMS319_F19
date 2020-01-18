import React, { Component } from 'react';
import { Button, Card, Image } from 'react-bootstrap';
import '../App.css';

export default class SelectableGiph extends Component {
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
            if(newTitle[1] && newTitle[1].trim().length !== 0){
                return newTitle[1];
            }
            return "Unknown";
        }
        return newTitle[0];
    }

    selectGiph(){
        if(this.props.giphSelected == null){
            let jsonGiph = {
                "id": this.props.id,
                "title": this.props.title,
                "url": this.props.url,
            };
            this.props.updateGiphSelected(jsonGiph);
        }
        else if(this.state.isSelected){
            this.props.updateGiphSelected(null);
        }
        else {
            return;
        }
        this.setState({isSelected: !this.state.isSelected,});
    }

    render(){
        let disabled = false;
        let buttonName = "Select";
        let cardBackground = "info";

        if((this.props.giphSelected && this.props.giphSelected.id !== this.props.id) || this.props.turnSubmitted){
            disabled = true;
        }
        if(this.state.isSelected){
            buttonName = "Unselect";
            cardBackground = "warning";
        }
        return (
            <Card bg={cardBackground} style={{width: "17rem"}} className="text-white">
                <Card.Header as="h5" className="Card-Title">{this.formatTitle()}</Card.Header>
                <Card.Body>
                    <br />
                    <Image className="mx-auto d-block" height="200" width="200" src={this.props.url}/>
                    <br />
                    <Button variant="light" block onClick={this.selectGiph} disabled={disabled}>{buttonName}</Button>
                </Card.Body>
            </Card>
        )
    }
}
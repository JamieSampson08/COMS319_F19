import React, {Component} from 'react';
import {Button, Table} from 'react-bootstrap';
import '../App.css';
import JudgingGiph from './JudgingGiph';
import SelectableGiph from './SelectableGiph';
import FinalScore from './FinalScore';
import {prompts} from './resources/cardprompts.js';

export default class Game extends Component {
    constructor(props) {
        super(props);
        this.state = {
            giphs: [],
            loading: true,
            usedGiphs: [],
            // json giph with {id, title, image_original_url}
            giphSelected: null,
            turnSubmitted: false,
            // all player's giphs as json {id, title, image_original_url, username, isSubmitted}
            allPlayerGiphs: [],
            allPlayerUsernames: [],
            allPlayerScores: [],
            judgingComplete: false,
            isJudge: false,
            numPlayers: 1,
            round: 1,
            numSubmitted: 0,
            startGame: false,
            judgeGiph: null,
            judgeIndex: 0,
            prompt: null,
            usedPrompts: [],
            isLastRound: false,
            renderScores: false,
        };
        
        // functions that call setState
        this.updateGiphSelected = this.updateGiphSelected.bind(this);
        this.updateJudgeSelected = this.updateJudgeSelected.bind(this);
        this.submitTurn = this.submitTurn.bind(this);
        this.startGame = this.startGame.bind(this);
        this.submitJudging = this.submitJudging.bind(this);
        this.nextRound = this.nextRound.bind(this);
        this.retrievePrompt = this.retrievePrompt.bind(this);
        this.initScoreboard = this.initScoreboard.bind(this);
    }

    // things to do upon rendering
    componentDidMount() {
        this.fetchGiphs();
        this.props.socket.emit('update players', {code: this.props.code});

        this.props.socket.on("giph submission", res => {
            const giph = res.giph;
            let allPlayerGiphs = this.state.allPlayerGiphs;
            for (let i = 0; i < this.state.numPlayers; i++) {
                let playerGiph = allPlayerGiphs[i];
                if (playerGiph.username === res.username) {
                    playerGiph.id = giph.id;
                    playerGiph.url = giph.url;
                    playerGiph.title = giph.title;
                    playerGiph.isSubmitted = true;
                    break;
                }
            }
            this.setState({
                allPlayerGiphs: allPlayerGiphs,
                numSubmitted: this.state.numSubmitted + 1,
            });
        });

        this.props.socket.on("next round start", res =>{
            this.setState({
                judgingComplete: false,
                judgeGiph: null,
                numSubmitted: 0,
                giphSelected: null,
                turnSubmitted: false,
                round: res.round,
                isJudge: this.determineIfJudge(res.judgeIndex),
                judgeIndex: res.judgeIndex,
            });
            if (this.state.round == 10){
                this.setState({isLastRound: true});
            }
            this.fetchGiphs();
            this.initAllPlayerGiphs();
            if (this.state.isJudge) {
                this.retrievePrompt();
            }
        });

        this.props.socket.on("prompt updated", res => {
            this.setState({
                prompt: res.prompt,
                usedPrompts: res.usedPrompts,
            })
        });

        this.props.socket.on("judging submitted", res => {
            this.setState({
                judgingComplete: true,
                judgeGiph: res.winningGiph,
                allPlayerScores: res.allPlayerScores,
            })
        });

        this.props.socket.on("new player joined", res => {
            this.setState({
                numPlayers: res.size,
                allPlayerUsernames: res.allPlayerUsernames,
            })
        });

        this.props.socket.on("game started", res => {
            this.setState({
                startGame: res.startGame,
                round: res.round,
                isJudge: this.determineIfJudge(res.judgeIndex),
                judgeIndex: res.judgeIndex,
            });
            this.initAllPlayerGiphs();
            this.initScoreboard();
            if (this.state.isJudge) {
                this.retrievePrompt();
            }
        });
    }

    initScoreboard(){
        let allPlayerScores = [];
        for(let i = 0; i < this.state.numPlayers; i++){
            allPlayerScores[i] = 0;
        }
        this.setState({allPlayerScores: allPlayerScores});
    }

    determineIfJudge(judgingIndex){
        const userIndex = this.state.allPlayerUsernames.indexOf(this.props.username);
        return userIndex === judgingIndex;
    }

    // create list of player json giph info
    initAllPlayerGiphs() {
        let allPlayerGiphs = [];
        for (let i = 0; i < this.state.numPlayers; i++) {
            const username = this.state.allPlayerUsernames[i];
            let isJudge = false;
            if(this.state.judgeIndex === i){
                isJudge = true;
            }
            let playerGiph = {
                "id": i,
                "url": null,
                "username": username,
                "title": null,
                "isSubmitted": false,
                "isJudge": isJudge,
            };
            allPlayerGiphs.push(playerGiph);
        }
        this.setState({allPlayerGiphs: allPlayerGiphs});
    }

    // get player's giphs for their turn
    fetchGiphs() {
        const server = "f9ca81c8";
        // const address = "https://" + server + ".ngrok.io/giphy";
        // comment out the two lines above and uncomment the line below to run on localhost
         const address = "http://localhost:9000/giphy";
        for (var i = 0; i < 5; i++) {
            var giphs = [];
            var usedGiphs = this.state.usedGiphs;
            fetch(address)
                .then(res => res.json())
                .then(res => {
                    if (this.giphExists(res.id)) {
                        i--;
                    } else {
                        giphs.push(res);
                        usedGiphs.push(res);
                        this.setState({
                            giphs: giphs,
                            loading: false,
                            usedGiphs: usedGiphs
                        })
                    }
                })
                .catch(err => err);
        }
    }

    retrievePrompt() {
        var arrLength = prompts.length;
        var i = Math.floor(Math.random() * arrLength);
        var newPrompt = prompts[i];
        while(this.promptExists(prompt)) {
            i = Math.floor(Math.random() * arrLength);
            newPrompt = prompts[i]
        }
        var usedPrompts = this.state.usedPrompts;
        usedPrompts.push(prompt);
        this.setState({
            prompt: newPrompt,   
            usedPrompts: usedPrompts
        });
        this.props.socket.emit("update prompt", {
            code: this.props.code,
            prompt: this.state.prompt,
            usedPrompts: this.state.usedPrompts,
        });
    }

    promptExists(prompt) {
        for (let i = 0; i < this.state.usedPrompts.length; i++) {
            if (prompt === this.state.usedPrompts[i]) {
                return true;
            }
        }
        return false;
    }


    // checks if giphs was already fetched during game
    giphExists(id) {
        for (let i = 0; i < this.state.usedGiphs.length; i++) {
            const giph = this.state.usedGiphs[i];
            if (giph.id === id) {
                return true;
            }
        }
        return false
    }

    startGame() {
        this.props.socket.emit("start game", {code: this.props.code});
    }

    render() {
        if (this.state.renderScores) {
            return (
                <FinalScore 
                    allPlayerUsernames={this.state.allPlayerUsernames}
                    allPlayerScores={this.state.allPlayerScores}/>
            )
        }
        if (this.state.loading) {
            return "Loading";
        }
        if (!this.state.startGame) {
            let disabled = true;
            if (this.state.numPlayers === 5) {
                disabled = false;
            }
            return (
                <div>
                    <h1 className="Title-Header">Welcome to the Lobby!</h1>
                    <h1 className="Title-Header">Game Code: {this.props.code}</h1>
                    <div style={{height: "50%"}} className="Button-Div">
                        {this.getPlayersInLobby()}
                        <Button variant="warning" size="lg" style={{width: '75%', textAlign: "center"}}
                                disabled={disabled} onClick={this.startGame} block>Start Game</Button>
                    </div>
                </div>
            );
        }
        return (
            <div>
                <h1 className="Title-Header">Round {this.state.round}</h1>
                <h2 className="Title-Header">Prompt: "{this.state.prompt}"</h2>
                {this.getWinner()}
                {this.waitForPlayers()}
                
                <Table>
                    <thead>
                        <tr>
                            {this.getAllPlayerScores()}
                        </tr>
                    </thead>
                </Table>
                <Table>
                    <thead>
                    <tr>
                        {this.getAllPlayerGiphs()}
                    </tr>
                    </thead>
                </Table>
                {this.getPlayerCards()}
            </div>

        );
    }

    // replace button with timer in Story Card 7
    getNextRoundButton(){
        var btnText = "Next Round";
        if (this.state.isLastRound){
            btnText = "Final Results";
        }
        if(this.state.judgingComplete){
            return (
                <Button variant="warning" size="lg"
                        style={{width: '75%', textAlign: "center", alignItems: "center"}}
                        onClick={this.nextRound}>{btnText}</Button>
            )
        }
    }

    nextRound(){
        if (this.state.isLastRound) {
            this.setState({renderScores: true});
        }
        let data = {
            code: this.props.code,
            judgeIndex: this.state.judgeIndex,
        };
        this.props.socket.emit("start next round", data);
    }

    getWinner(){
        if(this.state.judgingComplete){
            return (
                <h1 className="Title-Header">Winner: {this.state.judgeGiph.username}</h1>
            )
        }
    }

    getPlayersInLobby() {
        const _this = this;
        return _this.state.allPlayerUsernames.map(function (username) {
            return(
                <p className="Waiting-Text">{username}</p>
            )
        })
    }

    getAllPlayerScores(){
        const _this = this;
        let count = -1;
        return _this.state.allPlayerScores.map(function (score) {
            count ++;
            return (
                <th>
                    <p className="Waiting-Text">{_this.state.allPlayerUsernames[count]} : {score}</p>
                </th>
            )
        })
    }

    // show player cards if not judge, else waiting text
    getPlayerCards() {
        if (!this.state.isJudge) {
            let disableSubmit = false;
            if (this.state.giphSelected == null || this.state.turnSubmitted) {
                disableSubmit = true;
            }
            return (
                <div>
                    <Table>
                        <thead>
                        <tr>
                            {this.getGiphs()}
                        </tr>
                        </thead>
                    </Table>
                    <div className="Button-Div" style={{height: "10%"}}>
                        <Button variant="warning" size="lg"
                                style={{width: '75%', textAlign: "center", alignItems: "center"}}
                                disabled={disableSubmit} onClick={this.submitTurn}>Submit</Button>
                        <br/>
                        {this.getNextRoundButton()}
                    </div>
                </div>
            )
        }

        let disabled = true;
        if(this.state.numSubmitted === (this.state.numPlayers - 1) && this.state.judgeGiph && !this.state.judgingComplete) {
            disabled = false;
        }

        return (
            <div>
                {this.getWaitingNotification()}
                <br/>
                <div className="Button-Div" style={{height: "10%"}}>
                    <Button variant="warning" size="lg"
                            style={{width: '75%', textAlign: "center", alignItems: "center"}}
                            disabled={disabled} onClick={this.submitJudging}>Submit Judging</Button>
                    <br/>
                    {this.getNextRoundButton()}
                </div>
            </div>
        )
    }

    getWaitingNotification(){
        if(!this.state.judgingComplete){
            return (
                <h5 className="Waiting-Text">Waiting for players to submit cards....</h5>
            )
        }
    }

    // waiting text after submitting
    waitForPlayers() {
        if (this.state.turnSubmitted && !this.state.judgingComplete) {
            return <h5 className="Waiting-Text">Waiting for other players....</h5>
        }
    }

    submitJudging(){
        let data = {
          code: this.props.code,
          giph: this.state.judgeGiph,
          allPlayerScores: this.state.allPlayerScores,
        };
        this.props.socket.emit("submit judging", data);
    }


    submitTurn() {
        this.setState({turnSubmitted: true});
        let data = {
            "socketId": this.props.socket.id,
            "code": this.props.code,
            "giph": this.state.giphSelected,
        };
        this.props.socket.emit("submit giph", data);
    }

    // function to be passed to child so state can be updated
    updateGiphSelected(jsonGiph) {
        this.setState({giphSelected: jsonGiph});
    }

    updateJudgeSelected(jsonGiph){
        this.setState({judgeGiph: jsonGiph});
    }

    getGiphs() {
        const _this = this;
        return _this.state.giphs.map(function (giph) {
                return (
                    <th>
                        <SelectableGiph id={giph.id}
                                        url={giph.url}
                                        title={giph.title}
                                        giphSelected={_this.state.giphSelected}
                                        updateGiphSelected={_this.updateGiphSelected}
                                        turnSubmitted={_this.state.turnSubmitted}/>
                    </th>
                )
            }
        );
    }

    getAllPlayerGiphs() {
        const _this = this;
        return _this.state.allPlayerGiphs.map(function (giph) {
            return (
                <th>
                    <JudgingGiph id={giph.id}
                                 url={giph.url}
                                 title={giph.title}
                                 username={giph.username}
                                 isSubmitted={giph.isSubmitted}
                                 judgingComplete={_this.state.judgingComplete}
                                 judgeGiph={_this.state.judgeGiph}
                                 isJudge={_this.state.isJudge}
                                 updateJudgeSelected={_this.updateJudgeSelected}
                                 isJudgeGiph={giph.isJudge}/>
                </th>
            )
        })
    }
}
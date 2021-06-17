import React from "react";
import { Html5Entities } from 'html-entities';
import "./App.css";

const MAX_QUESTIONS = 5;
const DEFAULT_CATEGORY = 11;
const DEFAULT_DIFFICULTY = "easy";
const TRIVIA_API =
        "https://opentdb.com/api.php?amount=" + MAX_QUESTIONS + 
                                    "&category=" + DEFAULT_CATEGORY + 
                                    "&difficulty=" + DEFAULT_DIFFICULTY;

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            questionsData: [],
        };
    }

    fetchQuestions() {
        fetch(TRIVIA_API)
          .then(response => response.json())
          .then(data => this.setState({ questionsData: data.results }));
    }

    componentDidMount() {
        this.fetchQuestions();
    }

    nextGame = anotherGame => {
        this.setState({ questionsData: [] });
        this.fetchQuestions();
    }

    render() {
        const { questionsData } = this.state;

        return (
            <div className="container">
                <div className="appTitle">React Trivia App</div>
                <hr />
                <div className="row">
                    <GamePlay
                      questions={questionsData}
                      anotherGame={this.nextGame}
                    />
                </div>

            </div>
        );
    }
}


class GamePlay extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            answeredCorrectly: 0,
            questionIndex: 0
        };
    }

    questionAnswered = correctGuess => {
        this.setState(({ questionIndex, answeredCorrectly }) => ({
            questionIndex: questionIndex + 1,
            answeredCorrectly: (correctGuess ? answeredCorrectly + 1 : answeredCorrectly)
        }));
    };

    playAgain() {
        const { anotherGame } = this.props;

        return event => {
            this.setState(({ questionIndex, answeredCorrectly }) => ({
                questionIndex: 0,
                answeredCorrectly: 0
            }));
           
            anotherGame();
        }
    }
 
    render() {
        const { questions } = this.props;
        const { questionIndex } = this.state;

        const question = questions[questionIndex];

        let page;
        if (questionIndex < MAX_QUESTIONS) {
            page = 
                <QuestionRound {...question} counter={questionIndex} hasAnswered={this.questionAnswered} />
        } else {
            page = 
                <div>
                    <div className="gameOverTitle">Game Over</div>
                    <div className="gameResults">You answered {this.state.answeredCorrectly} correctly out of {MAX_QUESTIONS} questions</div>
                    <button className="btn btn-primary playAgainButton" onClick={this.playAgain()}>Play Again?</button>
                </div>;
        }

        return (
            <div>
                {page}
            </div>
        );
    }
}

class QuestionRound extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            previousAnswer: "",
            correctGuess: null
        };
    }

    evalAnswer(current_answer) {
        const { hasAnswered, correct_answer } = this.props;
        return event => {
          const correctGuess = correct_answer === current_answer;
          hasAnswered(correctGuess);
          this.setState({ previousAnswer: current_answer, correctGuess });
        };
    }

    render() {

        const htmlEntities = new Html5Entities();
        const { question, correct_answer, incorrect_answers } = this.props;

        const randomIndex = Math.floor(Math.random() * 4);
        const all_answers = incorrect_answers && incorrect_answers.splice(randomIndex, 0, correct_answer); 

        const { previousAnswer, correctGuess } = this.state;

        let answerStatus;
        if (previousAnswer && correctGuess) {
            answerStatus = <div className="answerCorrect">Correct! {previousAnswer} was the right answer!</div>;
        } else if (previousAnswer && !correctGuess) {
            answerStatus = <div className="answerWrong">Sorry! {previousAnswer} was the wrong answer</div>;
        } else {
            answerStatus = <div></div>
        }

        return (
            <div className="qaContainer">
                <div className="row qaRow">
                    <div className="col">
                        <div className="sectionTitle">Question { this.props.counter + 1 } of { MAX_QUESTIONS }</div>
                        <div className="questionText" >{htmlEntities.decode(question)}</div>
                    </div>
                    <div className="col">
                        <div className="sectionTitle">Choose An Answer</div>
                        {incorrect_answers &&
                            incorrect_answers
                              .map(answer => (
                                <div className="answerRow">
                                <button className="btn btn-primary answerButton" onClick={this.evalAnswer(answer)}>{htmlEntities.decode(answer)}</button>
                                </div>
                              ))}{" "}
                    </div>
                </div>
                <div className="row statusRow">
                    {answerStatus}
                </div>
            </div>
        );
    }
}

export default App;

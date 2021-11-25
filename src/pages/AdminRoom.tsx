import { useNavigate, useParams } from 'react-router-dom';
import LogoImg from '../assets/images/logo.svg';
import { Button } from '../components/Button';
import '../styles/room.scss';

import { RoomCode } from '../components/RoomCode';
import { Question } from '../components/Question';
import { useRoom } from '../hooks/useRoom'


import deleteImg from '../assets/images/delete.svg';
import checkImg from '../assets/images/check.svg';
import answer from '../assets/images/answer.svg';

import { database } from '../services/firebase';

type RoomParams = {
    id: string;
}

export function AdminRoom() {
    // const { user } = useAuth()
    const navigate = useNavigate();

    const params = useParams<RoomParams["id"]>();
    const roomId = params.id;

    const { title, questions } = useRoom(roomId)

    async function handleEndRoom() {
        database.ref(`rooms/${roomId}`).update({
            endedAt: new Date()
        })

        navigate('/');
    }

    async function handleDeleteQuestion(questionId: string) {
        if (window.confirm('Tem certeza que você deseja excluir esta pergunta?')) {
            await database.ref(`rooms/${roomId}/questions/${questionId}`).remove();
        }
    }

    async function handleAnswerQuestion(questionId: string) {
        await database.ref(`rooms/${roomId}/questions/${questionId}`).update({
            isAnswered: true
        });
    }


    async function handleCheckQuestion(questionId: string) {
        await database.ref(`rooms/${roomId}/questions/${questionId}`).update({
            isHighlighted: true
        });
    }


    return (
        <div id="page-room">

            <header>
                <div className="content">
                    <img src={LogoImg} alt="Logo" />
                    <div>
                        <RoomCode code={`${roomId}`} />
                        <Button
                            isOutlined
                            onClick={handleEndRoom}
                        >Encerrar sala</Button>
                    </div>
                </div>
            </header>


            <main className="content">
                <div className="room-title">
                    <h1>Sala {title}</h1>
                    {questions.length > 0 && <span className="notify">{questions.length} pergunta(s)</span>}
                </div>


                <div className="question-list">
                    {questions.map(question => {
                        return (
                            <Question
                                key={question.id}
                                content={question.content}
                                author={question.author}
                                isAnswered={question.isAnswered}
                                isHighlighted={question.isHighLighted}
                            >
                      
                                {!question.isHighLighted && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => handleCheckQuestion(question.id)}
                                        >
                                            <img src={checkImg} alt="Marcar pergunta como respondida" />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleAnswerQuestion(question.id)}
                                        >
                                            <img src={answer} alt="Dar destaque na pergunta" />
                                        </button>
                                    </>
                                )}


                                <button
                                    type="button"
                                    onClick={() => handleDeleteQuestion(question.id)}
                                >
                                    <img src={deleteImg} alt="Remover pergunta" />
                                </button>
                            </Question>
                        )
                    })}
                </div>
            </main>
        </div>
    );

}
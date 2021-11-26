import { useNavigate, useParams } from 'react-router-dom';
import LogoImg from '../assets/images/logo.svg';


import '../styles/responsive.scss';
import '../styles/room.scss';

import { RoomCode } from '../components/RoomCode/RoomCode';
import { FormEvent, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { database } from '../services/firebase';
import { Question } from '../components/Question/Question';
import { useRoom } from '../hooks/useRoom';

import { FiSend } from 'react-icons/fi';
import { BiArrowBack } from 'react-icons/bi'
import Swal from 'sweetalert2';

type RoomParams = {
    id: string;
}

export function Room() {
    const { user, signInWithGoogle } = useAuth()

    const navigate = useNavigate();

    const params = useParams<RoomParams["id"]>();
    const roomId = params.id;

    const [newQuestion, SetNewQuestion] = useState('');

    const { title, questions } = useRoom(roomId)

    async function handleCreateAquestion(event: FormEvent) {

        // para evitar que o formulario atualize a page
        event.preventDefault();

        // validações antes de mandar a pergunta
        if (newQuestion.trim() === '') {
            return;
        }

        if (!user) {
            throw new Error('You must be logged in');
        }

        // dados da pergunta e do author
        const question = {
            content: newQuestion,
            author: {
                name: user?.name,
                avatar: user.avatar,
            },
            isAnswered: false
        };

        // enviando para o realtime
        await database.ref(`rooms/${roomId}/questions`).push(question);

        //apagar input depois de mandar a pergunta
        SetNewQuestion('');
    }

    async function handleLikeQuestion(questionId: string, likeId: string | undefined) {
        if (likeId) {
            await database.ref(`rooms/${roomId}/questions/${questionId}/likes/${likeId}`).remove()
        } else {
            await database.ref(`rooms/${roomId}/questions/${questionId}/likes`).push({
                authorId: user?.id,
            })
        }
    }

    async function handleButtonLoggin() {
        if (!user) {
            await signInWithGoogle()
        }

        navigate(`/rooms/${roomId}`);
    }

    
    async function handleComeBack() {
        
        const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
                confirmButton: 'btn btn-success',
                cancelButton: 'btn btn-danger'
            },
            buttonsStyling: true
        })

        await swalWithBootstrapButtons.fire({
            title: 'Tem certeza que deseja sair da sala?',
            text: `Caso queira voltar, acesse o código da sala novamente.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sim',
            cancelButtonText: 'Cancelar!',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
             
                navigate('/');

            } else if (
                result.dismiss === Swal.DismissReason.cancel
            ) {
                swalWithBootstrapButtons.fire(
                    'Cancelado',
                    '',
                    'error'
                )
            }
        })
 
    }


    return (
            <div id="page-room" className="mobile">

                <header>
                    <div>
                        <BiArrowBack onClick={() => { handleComeBack() }} />
                    </div>

                    <div className="content header-mobile">
                        <img src={LogoImg} alt="Logo" />
                        <RoomCode code={`${roomId}`} />
                    </div>
                </header>


                <main className="desktop content mobile-content">
                    <div className="room-title room-title-mobile">
                        <h1>Sala {title}</h1>
                        {questions.length > 0 && <span className="notify notify-mobile">{questions.length} mensagem(s)</span>}
                    </div>
                    <div className="question-list">
                        {questions.map(question => {
                            return (
                                <Question
                                    key={question.id}
                                    content={question.content}
                                    author={question.author}
                                    isAnswered={question.isAnswered}
                                >
                                    {!question.isAnswered && (
                                        <button className={`like-button ${question.likeId ? 'liked' : ''}`}
                                            disabled={!user}
                                            type="button"
                                            aria-label="Marcar como Gostei"
                                            onClick={() => handleLikeQuestion(question.id, question.likeId)}
                                        >


                                            {question.likeCount > 0 && <span>{question.likeCount}</span>}
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <circle cx="12.0003" cy="11.9998" r="9.00375" stroke="#737380" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                <path d="M8.44287 12.3391L10.6108 14.507L10.5968 14.493L15.4878 9.60193" stroke="#737380" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </button>
                                    )}
                                </Question>
                            )
                        })}
                    </div>

                    <form onSubmit={handleCreateAquestion}>
                        <div className="form-footer">
                            <textarea
                                onChange={event => SetNewQuestion(event.target.value)}
                                value={newQuestion}
                                placeholder="enviar mensagem? "
                            />

                            <button className="button" type="submit" disabled={!user}><FiSend /></button>
                        </div>

                        <div className="form-footer mobile-form">

                            {user ? (
                                <div className="user-info">
                                    <img src={user.avatar} alt="." />
                                    <span>{user.name}</span>
                                </div>
                            ) : (
                                <span>Para enviar uma mensagem, <button onClick={handleButtonLoggin}>faça seu login</button>.</span>
                            )}

                        </div>
                    </form>
                </main>
            </div>
        );

    }


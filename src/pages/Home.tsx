import { useNavigate } from 'react-router-dom';

import illustrationImg from '../assets/images/illustration.svg';
import logoImg from '../assets/images/logo.svg';
import googleIconImg from '../assets/images/google-icon.svg';

import { Button } from '../components/Button';

import '../styles/auth.scss';

import { useAuth } from './../hooks/useAuth';
import { FormEvent, useState } from 'react';
import { database } from '../services/firebase';

export function Home() {
    const navigate = useNavigate();
    const {user, signInWithGoogle} = useAuth()
    const [RoomCode, setRoomCode] = useState('');

    //Authentication

    async function handleCreateRoom() {
        if(!user) {
           await signInWithGoogle()
        }

        navigate('/rooms/new');
    }


    async function handleJoinRoom(e: FormEvent) {
        e.preventDefault();
    
        if(RoomCode.trim() === '') {
            return;
        }

        const roomRef = await database.ref(`rooms/${RoomCode}`).get();
        if(!roomRef.exists()) {
            alert('Room does not exists.');

            return;
        }

        if (roomRef.val().endedAt) {
            alert('Room already closed.');
            return;
        }
        
       navigate(`/rooms/${RoomCode}`); 
    }



    return(
        <div id="page-auth">
            <aside>
                <img src={illustrationImg} alt="illustration" />
                <strong>Crie salas de Q&amp;A ao-vivo</strong>
                <p>Tire as dúvidas da sua audiência em tempo real</p>
            </aside>
            <main>
                <div className="main-content">
                    <img src={logoImg} alt="logo da aplicação letmeask" />
                    <button onClick={handleCreateRoom} className="create-room">
                        <img src={googleIconImg} alt="logo do Google" />
                        Crie sua sala com o Google
                    </button>
                    <div className="separator">ou entre em uma sala</div>
                
                    <form onSubmit={handleJoinRoom}>
                        <input
                        type="text"
                        placeholder="Digite o código da sala"
                        onChange={e => setRoomCode(e?.target.value)}
                        value={RoomCode}
                        />
                        <Button type="submit">
                            Entrar na sala
                        </Button>
                    </form>
                </div>
            </main>
        </div>
    )
}
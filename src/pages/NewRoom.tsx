import { Link } from 'react-router-dom';
import { FormEvent, useState } from 'react';
import { useAuth } from './../hooks/useAuth';

import illustrationImg from '../assets/images/illustration.svg';
import logoImg from '../assets/images/logo.svg';

import { Button } from '../components/Button';

import '../styles/auth.scss';
import '../styles/responsive.scss';

import { database } from '../services/firebase';
import { useNavigate } from 'react-router-dom';


export function NewRoom() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [newRoom, setNewRoom] = useState('');

    async function handleCreateRoom(e: FormEvent) {
        e.preventDefault();

        if(newRoom.trim() === ''){
            return;
        }

        const roomRef = database.ref('rooms');

        const firebaseRoom = await roomRef.push({
            title: newRoom,
            userId: user?.id,
        })
        
        navigate(`/rooms/${firebaseRoom.key}`);
    }

    return(
        <div id="page-auth" className="mobile">
            <aside>
                <img src={illustrationImg} alt="illustration" />
                <strong>Crie salas de Q&amp;A ao-vivo</strong>
                <p>Tire as dúvidas da sua audiência em tempo real</p>
            </aside>
            <main>         
                <div className="main-content mobile-content">
                    <img src={logoImg} alt="logo da aplicação letmeask" />
                    
                    <h2>Criar uma nova sala </h2>
                    <form onSubmit={handleCreateRoom}>
                        <input
                        type="text"
                        placeholder="Nome da Sala"
                        onChange={e => setNewRoom(e?.target.value)}
                        value={newRoom}
                        />
                        <Button type="submit">
                            Criar Sala
                        </Button>
                    </form>
                    <p>
                        Quer entrar em uma sala existente? <Link to="/">Clique qui</Link>
                    </p>
                </div>
            </main>
        </div>
    )
}
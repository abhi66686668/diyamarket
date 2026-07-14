import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';
import API_BASE_URL from '../utils/api';

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const { token } = useContext(AuthContext);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        let newSocket;
        if (token) {
            // Only connect to websocket if the user is logged in
            newSocket = io(API_BASE_URL, {
                auth: { token },
                transports: ['websocket', 'polling']
            });

            newSocket.on('connect', () => {
                console.log('Connected to WebSocket server with ID:', newSocket.id);
            });

            newSocket.on('connect_error', (error) => {
                console.error('WebSocket connection error:', error);
            });

            setSocket(newSocket);
        }

        return () => {
            if (newSocket) {
                newSocket.disconnect();
            }
        };
    }, [token]);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};

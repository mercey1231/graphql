import React from 'react';
import { createContext, useState } from 'react';
import Header from '../header/header';
import MainContainer from '../main-container/main-container';

interface UsernameContext {
    username: string;
    setUser: (username: string) => void;
}

const defaultValue: UsernameContext = {
    username: "",
    setUser: () => { },
};

export const UserContext = createContext(defaultValue)

export default function App() {
    const [username, setUser] = useState("Zewas")

    return (
        <UserContext.Provider value={{ username, setUser }}>
            <Header />
            <MainContainer />
        </UserContext.Provider>
    )
}
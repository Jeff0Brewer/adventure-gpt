import React, { FC, useRef, useState, useEffect } from 'react'
import type { ChatCompletionRequestMessage as Message } from 'openai'
import PROMPT from '@/lib/prompt'
import { postBody } from '@/lib/fetch'
import styles from '@/styles/Game.module.css'

const Game: FC = () => {
    const [messages, setMessages] = useState<Array<Message>>([])
    const [response, setResponse] = useState<string>('')

    useEffect(() => {
        getCompletion({ role: 'user', content: PROMPT })
    }, [])

    // set message state from new user message
    const getCompletion = async (message: Message): Promise<void> => {
        const newMessages = [...messages, message]
        const completion = await fetch('/api/chat-complete', postBody({ messages: newMessages }))
        if (completion.status === 200) {
            const { message: content } = await completion.json()
            setMessages([...newMessages, { role: 'assistant', content }])
            setResponse(content)
        } else {
            const { message } = await completion.json()
            console.error(`Chat complete error: ${message}`)
        }
    }

    return (
        <section className={styles.chat}>
            <p className={styles.output}>{response}</p>
            <GameInput getCompletion={getCompletion} />
        </section>
    )
}

type GameInputProps = {
    getCompletion: (message: Message) => void
}

const GameInput: FC<GameInputProps> = props => {
    const inputRef = useRef<HTMLInputElement>(null)

    const sendMessage = (): void => {
        if (!inputRef.current) return
        const content = inputRef.current.value
        inputRef.current.value = ''
        props.getCompletion({ role: 'user', content })
    }

    const keySend = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            sendMessage()
        }
    }

    return (
        <div className={styles.input}>
            <input className={styles.text} ref={inputRef} type="text" onKeyDown={keySend} />
            <button className={styles.send} onClick={sendMessage}>send</button>
        </div>
    )
}

export default Game

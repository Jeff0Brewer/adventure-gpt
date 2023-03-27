import React, { FC, useRef, useState, useEffect } from 'react'
import type { ChatCompletionRequestMessage as Message } from 'openai'
import PROMPT from '@/lib/prompt'
import { postBody } from '@/lib/fetch'
import styles from '@/styles/Game.module.css'

const Game: FC = () => {
    const inputRef = useRef<HTMLInputElement>(null)
    const outputRef = useRef<HTMLParagraphElement>(null)
    const [messages, setMessages] = useState<Array<Message>>([
        { role: 'user', content: PROMPT }
    ])

    useEffect(() => {
        getCompletion(messages)
    }, [])

    const getCompletion = async (messages: Array<Message>): Promise<void> => {
        const completion = await fetch('/api/chat-complete', postBody({ messages }))
        if (completion.status === 200) {
            const { message } = await completion.json()
            setMessages([
                ...messages,
                { role: 'assistant', content: message }
            ])
        } else {
            const { message } = await completion.json()
            console.error(`Chat complete error: ${message}`)
        }
    }

    const getLastResponse = (messages: Array<Message>): string => {
        const responses = messages.filter(msg => msg.role === 'assistant')
        if (responses.length === 0) {
            return ''
        }
        return responses[responses.length - 1].content
    }

    return (
        <section className={styles.chat}>
            <p className={styles.output} ref={outputRef}>{getLastResponse(messages)}</p>
            <input className={styles.input} ref={inputRef} type="text" />
        </section>
    )
}

export default Game

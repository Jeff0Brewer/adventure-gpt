import React, { FC, useRef, useState, useEffect, ReactElement } from 'react'
import type { ChatCompletionRequestMessage as Message } from 'openai'
import ReactMarkdown from 'react-markdown'
import { postBody } from '@/lib/fetch'
import { narratePrompt, SUMMARY_PROMPT, START_PROMPT, CHARACTER_PROMPT } from '@/lib/prompt'
import styles from '@/styles/Game.module.css'

const Game: FC = () => {
    const MESSAGE_LIMIT = 10
    const SUMMARY_COUNT = 6
    const NARRATE_PROMPT = narratePrompt('prehistoric times')
    const [messages, setMessages] = useState<Array<Message>>([NARRATE_PROMPT, START_PROMPT])

    // watch messages for changes, generate responses and summarize as needed
    useEffect(() => {
        updateMessages()
    }, [messages])

    const updateMessages = async () => {
        if (messages[messages.length - 1].role !== 'user') {
            // don't generate response unless user sent last message
            // don't async summarize when message list could receive new user message
            return
        }
        // generate response, append prompt to stay in character
        const responsePromise = completeChat([...messages, CHARACTER_PROMPT])

        // summarize messages if over limit
        let summarized = messages
        if (messages.length > MESSAGE_LIMIT) {
            const summary = await completeChat([
                ...messages.slice(0, SUMMARY_COUNT),
                SUMMARY_PROMPT
            ])
            summarized = [NARRATE_PROMPT, summary, ...messages.slice(SUMMARY_COUNT)]
        }

        // set new message state
        const response = await responsePromise
        setMessages([...summarized, response])
    }

    // get next response to chat messages
    const completeChat = async (messages: Array<Message>): Promise<Message> => {
        const completion = await fetch('/api/chat-complete', postBody({ messages }))
        const { content } = await completion.json()
        if (!completion.ok) {
            // error if message content incomplete
            throw new Error(`Chat completion error: ${content}`)
        }
        return { role: 'assistant', content }
    }

    // add user message to state
    const userMessage = (content: string): void => {
        // prevent user from sending message before recieving response
        if (messages[messages.length - 1].role !== 'user') {
            setMessages([...messages, { role: 'user', content }])
        }
    }

    return (
        <section className={styles.chat}>
            <GameOutput messages={messages} />
            <GameInput addMessage={userMessage} />
        </section>
    )
}

type GameOutputProps = {
    messages: Array<Message>
}

const GameOutput: FC<GameOutputProps> = props => {
    const userLast = props.messages[props.messages.length - 1].role === 'user'
    const displayInd = props.messages.length - (userLast ? 2 : 1)

    // convert message to element
    const getDisplay = (msg: Message, i: number): ReactElement => {
        return <MessageDisplay message={msg} key={i} />
    }

    return (
        <div className={styles.output}>
            <div>
                { props.messages.slice(0, displayInd).map(getDisplay) }
                <div className={styles.currentMove}>
                    { props.messages.slice(displayInd).map(getDisplay) }
                </div>
            </div>
        </div>
    )
}

type MessageDisplayProps = {
    message: Message
}

const MessageDisplay: FC<MessageDisplayProps> = props => {
    return (
        <div className={styles.msg} data-role={props.message.role}>
            <ReactMarkdown>{props.message.content}</ReactMarkdown>
        </div>
    )
}

type GameInputProps = {
    addMessage: (content: string) => void
}

const GameInput: FC<GameInputProps> = props => {
    const inputRef = useRef<HTMLInputElement>(null)

    const sendMessage = (): void => {
        if (!inputRef.current) { return }
        props.addMessage(inputRef.current.value)
        inputRef.current.value = ''
    }

    const keySend = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') { sendMessage() }
    }

    return (
        <div className={styles.input}>
            <input className={styles.text} ref={inputRef} type="text" onKeyDown={keySend} />
            <button className={styles.send} onClick={sendMessage}>send</button>
        </div>
    )
}

export default Game

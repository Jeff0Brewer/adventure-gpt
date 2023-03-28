import React, { FC, useRef, useState, useEffect, ReactElement } from 'react'
import type { ChatCompletionRequestMessage as Message } from 'openai'
import { postBody } from '@/lib/fetch'
import { narratePrompt, summarizePrompt } from '@/lib/prompt'
import styles from '@/styles/Game.module.css'

const Game: FC = () => {
    const MESSAGE_LIMIT = 10
    const SUMMARY_COUNT = 6 // even number so summary starts with prompt, ends with assistant msg
    const GENRE = 'medieval fantasy'
    const [messages, setMessages] = useState<Array<Message>>([narratePrompt(GENRE)])

    useEffect(() => {
        updateMessages()
    }, [messages])

    // get assistant responses, summarize messages when context too large
    const updateMessages = async () => {
        if (messages[messages.length - 1].role !== 'user') {
            // when last message not from user, message state could change any time
            // don't want to async summarize when message list could mutate
            return
        }
        // start generating response
        const responsePromise = completeChat(messages)
        let summarized = messages
        if (messages.length > MESSAGE_LIMIT) {
            // summarize messages only if over limit
            const prompt = messages[0]
            const summary = await summarize(messages.slice(0, SUMMARY_COUNT))
            summarized = [prompt, summary, ...messages.slice(SUMMARY_COUNT)]
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

    // get prompt to summarize list of messages and generate response
    const summarize = async (messages: Array<Message>): Promise<Message> => {
        return completeChat(summarizePrompt(messages))
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
        <p className={styles.msg} data-role={props.message.role}>
            {props.message.content}
        </p>
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

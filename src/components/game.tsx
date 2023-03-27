import React, { FC, useRef, useState } from 'react'
import type { ChatCompletionRequestMessage as Message } from 'openai'

const Game: FC = () => {
    const inputRef = useRef<HTMLInputElement>(null)
    const outputRef = useRef<HTMLParagraphElement>(null)
    const [messages, setMessages] = useState<Array<Message>>([])

    const getLastResponse = (messages: Array<Message>): string => {
        const responses = messages.filter(msg => msg.role === 'assistant')
        if (responses.length === 0) {
            return ''
        }
        return responses[responses.length - 1].content
    }

    return (
        <section>
            <p ref={outputRef}>{getLastResponse(messages)}</p>
            <input ref={inputRef} type="text" />
        </section>
    )
}

export default Game

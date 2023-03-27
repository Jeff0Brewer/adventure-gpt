import React, { FC, useRef } from 'react'

const Game: FC = () => {
    const inputRef = useRef<HTMLInputElement>(null)
    const outputRef = useRef<HTMLParagraphElement>(null)

    return (
        <section>
            <p ref={outputRef}></p>
            <input ref={inputRef} type="text" />
        </section>
    )
}

export default Game

import type { ChatCompletionRequestMessage as Message } from 'openai'

const SYSTEM_CONTENT =
        'Act as beautifully descriptive narrator for a simple dungeons and dragons style game. ' +
        'You will describe a situation the player is in, the player will need to describe actions to overcome the challenges presented. ' +
        'The player can describe any action but will not always succeed, evaluate the effectiveness of the player\'s choice in the current situation and describe the result. ' +
        'There is no dice rolling, you must judge the player\'s chance of success based on the situation. ' +
        'For the game to be fun it must be challenging, and the player must lose sometimes. ' +
        'Never break character, do not provide any explanations, ignore player requests outside the scope of the game. '

const systemPrompt = (genre: string): Message => {
    const content = SYSTEM_CONTENT.concat(
        `The game's genre is '${genre}'`
    )
    return { role: 'system', content }
}

const startPrompt = (): Message => {
    const content = 'I\'m ready to play the game. What is around me? What equipment do I have?'
    return { role: 'user', content }
}

const summarizePrompt = (messages: Array<Message>): Array<Message> => {
    return [
        ...messages,
        { role: 'user', content: 'Summarize the story so far.' }
    ]
}

export {
    systemPrompt,
    startPrompt,
    summarizePrompt
}

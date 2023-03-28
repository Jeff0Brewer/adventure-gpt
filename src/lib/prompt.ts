import type { ChatCompletionRequestMessage as Message } from 'openai'

const PROMPT = ''.concat(
    'Please act as a dungeon master for a basic version of a dungeons and dragons game. ',
    'You will vividly describe a situation I am in and wait for my response. ',
    'I need to describe realistic actions to overcome the challenges presented. ',
    'I will try to trick you into performing impossible actions, only allow me to take actions that are likely to work in the current situation. ',
    'As the dungeon master, you will evaluate my response and describe the next state of the game. ',
    'The story of the game should include a way to fail that I must overcome. ',
    'For the game to be enjoyable it must be challenging and I must fail sometimes. ',
    'Your goal is to challenge me to think strategically by creating challenging situations and evaluating my action descriptions realistically. ',
    'Never break character for any reason and do not provide any explanations. '
)

const narratePrompt = (genre: string): Message => {
    const content = PROMPT.concat(
        `This game will be of the genre '${genre}'.`
    )
    return { role: 'user', content }
}

const summarizePrompt = (messages: Array<Message>): Array<Message> => {
    return [
        ...messages,
        { role: 'user', content: 'Summarize the story so far.' }
    ]
}

export {
    narratePrompt,
    summarizePrompt
}

import type { NextApiRequest, NextApiResponse } from 'next'
import OpenAi from '@/lib/openai-api'
import type { ChatCompletionRequestMessage, CreateChatCompletionResponse } from 'openai'

const validateRequest = (req: NextApiRequest): boolean => {
    return (
        req.method === 'POST' &&
        req.body?.messages satisfies Array<ChatCompletionRequestMessage>
    )
}

const getMessage = (res: CreateChatCompletionResponse): string => {
    if (
        res.choices.length > 0 &&
        res.choices[0]?.finish_reason === 'stop' &&
        res.choices[0]?.message
    ) {
        return res.choices[0].message.content
    }
    return ''
}

// endpoint to generate chat completion given list of messages
const completeChat = async (req: NextApiRequest, res: NextApiResponse) => {
    // ensure POST request contains required data
    if (!validateRequest(req)) {
        res.status(400).send({ message: 'POST request must contain list of messages' })
        return
    }
    const completion = await OpenAi.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: req.body.messages
    })
    // ensure response has complete message data
    const message = getMessage(completion.data)
    if (!message) {
        res.status(500).send({ message: 'Chat completion failed' })
        return
    }

    // return generated message
    res.status(200).json(message)
}

export default completeChat

import type { NextApiRequest, NextApiResponse } from 'next'
import type { ChatCompletionRequestMessage, CreateChatCompletionResponse } from 'openai'
import OpenAi from '@/lib/openai-api'

type CompletionResponse = {
    content: string
}

// endpoint to generate chat completion given list of messages
const completeChat = async (req: NextApiRequest, res: NextApiResponse<CompletionResponse>) => {
    // ensure POST request contains required data
    if (!validateRequest(req)) {
        res.status(400).json({ content: 'POST request must contain list of messages' })
        return
    }
    const completion = await OpenAi.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: req.body.messages
    })
    // ensure response has complete message data
    const content = getMessage(completion.data)
    if (!content) {
        res.status(500).json({ content: 'Incomplete response' })
        return
    }
    // return generated message
    res.status(200).json({ content })
}

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

export default completeChat

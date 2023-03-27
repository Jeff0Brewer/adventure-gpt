const postBody = (data: object) => {
    return {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }
}

export {
    postBody
}

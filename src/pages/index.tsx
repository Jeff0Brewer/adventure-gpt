import React from 'react'
import Head from 'next/head'
import styles from '@/styles/Home.module.css'

const Home = () => {
    return (
        <>
            <Head>
                <title>Adventure</title>
                <meta name="description" content="Adventure game powered by GPT" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className={styles.main}>
                home
            </main>
        </>
    )
}

export default Home

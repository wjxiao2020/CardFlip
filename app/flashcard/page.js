'use client'
 
import {useUser} from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { collection, doc, getDocs } from 'firebase/firestore'
import { firestore } from '@/firebase/config'
import { useSearchParams, useRouter } from 'next/navigation'
import { Container, Grid } from '@mui/material'
import ShowFlashcards from '@/app/components/showFlashcards'

export default function Flashcard() {
    const {isLoaded, isSignedIn, user} = useUser()
    const [flashcards, setFlashcards] = useState([])

    const router = useRouter()

    const searchParams = useSearchParams()
    const search = searchParams.get('id')

    useEffect(() => {
        async function getFlashcard() {
            if (!search || !user) {
                return
            }
            const collectionRef = collection(doc(collection(firestore, 'users'), user.id), search)
            const docs = await getDocs(collectionRef) 
            const cards = []

            docs.forEach((doc) => {
                cards.push({id: doc.id, ...doc.data()})
            })

            setFlashcards(cards) 
        }

        getFlashcard()
    }, [user, search])

    if (!isLoaded) {
        return <div>Please wait...</div>
    } else if (!isSignedIn) {
        router.push('/sign-in')
    }

    return (
        <Container maxWidth='100vw'>
            <Grid container spacing={3} sx={{mt: 4}}>
                <ShowFlashcards flashcards={flashcards}/>
            </Grid>
        </Container>
    )
}
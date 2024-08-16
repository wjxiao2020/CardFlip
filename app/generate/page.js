'use client'

import { firestore } from "@/firebase/config"
import { useUser } from "@clerk/nextjs"
import { Container, Box, Typography, TextField, Paper, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material"
import { collection, doc, getDoc, writeBatch } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { useState } from "react"
import ShowFlashcards from '@/app/components/showFlashcards'

export default function Generate() {
    const {isLoaded, isSignedIn, user} = useUser()
    const [flashcards, setFlashcards] = useState([])
    const [text, setText] = useState('')
    const [name, setName] = useState('')
    const [open, setOpen] = useState(false)
    const router = useRouter()

    const handleSubmit = async() => {
        fetch('api/generate', {
            method: 'POST',
            body: text,
        })
            .then((res) => res.json())
            .then((data) => setFlashcards(data))
    }

    const handleOpen = () => {setOpen(true)}
    const handleClose = () => {setOpen(false)}

    const saveFlashcards = async() => {
        if (!name) {
            alert('Please enter a name')
            return
        }
        const batch = writeBatch(firestore)
        const userDocRef = doc(collection(firestore, 'users'), user.id)
        const docSnap = await getDoc(userDocRef)

        if (docSnap.exists()) {
            // there is a field 'flashcards' in the user's document which contains a list of existing collection names
            const collections = docSnap.data().flashcards || []
            if (collections.find((f) => f.name === name)) {
                alert('Flashcard collection with the same name already exists')
                return
            } else {
                collections.push({name: name})
                batch.set(userDocRef, {flashcards: collections}, {merge: true})
            }
        }
        else {
            batch.set(userDocRef, {flashcards: [{name: name}]})
        }

        // save all the flashcards into a collection in the user's document
        const colRef = collection(userDocRef, name)
        flashcards.forEach((flashcard) => {
            const cardDocRef = doc(colRef)
            batch.set(cardDocRef, flashcard)
        })

        await batch.commit()
        handleClose()
        router.push('/flashcards')
    }

    return (
        <Container maxWidth='md'>
            <Box sx={{mt: 4, mb: 6, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <Typography variant="h4">
                    Generate Flashcards
                </Typography>
                <Paper sx={{p: 4, width: '100%'}}>
                    <TextField
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        label='Enter text'
                        fullWidth
                        multiline
                        rows={4}
                        variant="outlined"
                        sx={{
                            mb: 2
                        }}
                    />
                        
                    <Button variant='contained' color='primary' onClick={handleSubmit} fullWidth>
                        Submit
                    </Button>
                </Paper>
            </Box>

            {
                flashcards.length > 0 && (
                <Box sx={{mt: 4}}>
                    <Typography variant='h5'>Flashcards Preview</Typography>
                        <ShowFlashcards flashcards={flashcards}/>
                    <Box sx={{mt: 4, display: 'flex', justifyContent: 'center'}}>
                        <Button variant="contained" color='secondary' onClick={handleOpen}>
                            Save 
                        </Button>
                    </Box>
                </Box>
            )}
            
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Save Flashcards</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please enter a name for your flashcards collection:
                    </DialogContentText>
                    <TextField
                      autoFocus
                      margin='dense'
                      label='Collection Name'
                      type='text'
                      fullWidth
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      variant="outlined"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button onClick={saveFlashcards}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    )
}
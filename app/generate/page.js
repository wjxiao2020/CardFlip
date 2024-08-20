'use client'

import { firestore } from "@/firebase/config"
import { useUser } from "@clerk/nextjs"
import { Container, Box, Typography, TextField, Paper, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, CircularProgress, IconButton } from "@mui/material"
import { collection, doc, getDoc, writeBatch } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import ShowFlashcards from '@/app/components/showFlashcards'
import Loading from '@/app/components/loading'
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import useMediaQuery from '@mui/material/useMediaQuery';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

export default function Generate() {
    const { isLoaded, isSignedIn, user } = useUser()
    const [flashcards, setFlashcards] = useState([])
    const [text, setText] = useState('')
    const [name, setName] = useState('')
    const [open, setOpen] = useState(false)
    const [darkMode, setDarkMode] = useState(false);
    const router = useRouter()
    const [generating, setGenerating] = useState(false)

    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

    const theme = createTheme({
        palette: {
            mode: darkMode ? 'dark' : 'light',
        },
        typography: {
            fontFamily: `'Poppins', sans-serif`,
        },
    });

    useEffect(() => {
        if (flashcards.length > 0) {
            setGenerating(false)
        }
    }, [flashcards])

    if (!isLoaded) {
        return <Loading />
    }

    if (!isSignedIn) {
        router.push('/sign-in')
    }

    const handleSubmit = async () => {
        setFlashcards([])
        setGenerating(true)
        fetch('api/generate', {
            method: 'POST',
            body: text,
        })
            .then((res) => res.json())
            .then((data) => setFlashcards(data))
    }

    const handleOpen = () => { setOpen(true) }
    const handleClose = () => { setOpen(false) }

    const saveFlashcards = async () => {
        if (!name) {
            alert('Please enter a name')
            return
        }
        const batch = writeBatch(firestore)
        const userDocRef = doc(collection(firestore, 'users'), user.id)
        const docSnap = await getDoc(userDocRef)

        if (docSnap.exists()) {
            const collections = docSnap.data().flashcards || []
            if (collections.find((f) => f.name === name)) {
                alert('Flashcard collection with the same name already exists')
                return
            } else {
                collections.push({ name: name })
                batch.set(userDocRef, { flashcards: collections }, { merge: true })
            }
        }
        else {
            batch.set(userDocRef, { flashcards: [{ name: name }] })
        }

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
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: darkMode ? 'linear-gradient(to right, #0f2027, #203a43, #2c5364)' : 'linear-gradient(to right, #ffecd2, #fcb69f)',
                fontFamily: `'Roboto', sans-serif`
            }}>
                <Container maxWidth='md'>
                    <Box sx={{
                        mt: 4,
                        mb: 6,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        bgcolor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                        p: 4,
                        borderRadius: 2,
                        boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.1)'
                    }}>
                        <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                            <img
                                src='\cardflip-logo-removebg.png'
                                alt="Logo"
                                style={{
                                    height: darkMode ? '60px' : '60px',
                                    filter: darkMode ? 'brightness(1)' : 'brightness(1.3)',
                                    transition: 'all 0.3s ease'
                                }}
                            />
                            <IconButton onClick={() => setDarkMode(!darkMode)} sx={{ color: darkMode ? '#ffcc00' : '#2c5364' }}>
                                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
                            </IconButton>
                        </Box>

                        <Typography variant="h4" sx={{ fontFamily: `'Poppins', sans-serif`, mt: 2, color: darkMode ? '#ffcc00' : '#2c5364' }}>
                            Generate Flashcards
                        </Typography>
                        <Paper
                            sx={{
                                p: 4,
                                width: '100%',
                                mt: 3,
                                backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                                border: darkMode ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid rgba(0, 0, 0, 0.3)',
                                boxShadow: 'none',
                                borderRadius: 2,
                            }}
                        >
                            <TextField
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                label='Enter text'
                                fullWidth
                                multiline
                                rows={4}
                                variant="outlined"
                                sx={{
                                    mb: 2,
                                    fontFamily: `'Roboto', sans-serif`,
                                    backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                                    '& .MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: darkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
                                        },
                                        '&:hover fieldset': {
                                            borderColor: darkMode ? '#ffcc00' : '#ff7e5f',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: darkMode ? '#ffcc00' : '#ff7e5f',
                                        },
                                        color: darkMode ? '#fff' : '#000',
                                    },
                                    '& .MuiInputLabel-root': {
                                        color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                                    },
                                }}
                            />
                            <Button
                                variant='contained'
                                onClick={handleSubmit}
                                fullWidth
                                sx={{
                                    backgroundColor: darkMode ? '#ffcc00' : '#ff7e5f',
                                    color: darkMode ? '#000' : '#fff',
                                    fontWeight: 'bold',
                                    fontSize: '16px',
                                    borderRadius: '5px',
                                    boxShadow: 'none',
                                    '&:hover': {
                                        backgroundColor: darkMode ? '#ff9900' : '#ff6f61',
                                    }
                                }}
                            >
                                Submit
                            </Button>
                        </Paper>
                        {generating && <CircularProgress sx={{ mt: 2, color: darkMode ? '#ffcc00' : '#2c5364' }} />}
                    </Box>

                    {flashcards.length > 0 && (
                        <Box sx={{ mt: 4 }}>
                            <Typography variant='h5' sx={{ color: darkMode ? '#ffcc00' : '#2c5364' }}>
                                Flashcards Preview
                            </Typography>
                            <ShowFlashcards flashcards={flashcards} />
                            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                                <Button
                                    variant="contained"
                                    color='secondary'
                                    onClick={handleOpen}
                                    sx={{
                                        background: darkMode ? 'linear-gradient(to right, #ffcc00, #ff9900)' : 'linear-gradient(to right, #ff7e5f, #feb47b)',
                                        color: '#fff',
                                        fontWeight: 'bold',
                                        boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.3)',
                                        '&:hover': {
                                            background: darkMode ? 'linear-gradient(to right, #ff9900, #ff7e5f)' : 'linear-gradient(to right, #feb47b, #ff7e5f)'
                                        }
                                    }}
                                >
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
            </div>
        </ThemeProvider>
    )
}

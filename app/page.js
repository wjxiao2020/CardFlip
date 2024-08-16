'use client'

import getStripe from "@/utils/get-stripe";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { AppBar, Container, Toolbar, Typography, Button, Box, Grid } from "@mui/material";
import Head from 'next/head';
import { useUser } from "@clerk/nextjs"
import { useRouter } from 'next/navigation'

export default function Home() {
  const {isLoaded, isSignedIn, user} = useUser()
  const router = useRouter()

  const handleSubmit = async() => {

    if (!isLoaded) {
      return <Loading />
    } 
    
    if (!isSignedIn) {
      router.push('/sign-in')
    } 
    else {
      const checkoutSession = await fetch('/api/checkout_sessions', {
      method: 'POST',
      headers: {
        // TODO: change once deployed
        origin: 'http://localhost:3000'
      }
      })

      const checkoutSessionJSON = await checkoutSession.json()

      if (checkoutSession.status === 500) {
        console.error(checkoutSession.statusText)
        return
      }

      const stripe = await getStripe()
      const {error} = await stripe.redirectToCheckout({
        sessionId: checkoutSessionJSON.id
      })

      if (error) {
        console.warn(error.message)
      }
    }
  }


  return (
    <Container maxWidth='100vw'>
      <Head>
        <title>Flashcard SaaS</title>
        <meta name = 'description' content='Create flashcard from your text' />
      </Head>
      <AppBar position="static">
        <Toolbar>
          <Typography variant='h6' style={{flexGrow: 1}}>Flashcard SaaS</Typography>
          <SignedOut>
            <Button color='inherit' href='/sign-in'>Login</Button>
            <Button color='inherit' href='/sign-up'>Sign Up</Button>
          </SignedOut>
          <SignedIn>
            <UserButton/>
          </SignedIn>
        </Toolbar>
      </AppBar>

      <Box 
        sx={{
          textAlign: 'center',
          my: 4,
        }}
      >
        <Typography variant="h2" gutterBottom>Welcome to Flashcard SaaS</Typography>
        <Typography variant="h5" gutterBottom>The easiest way to make flashcards from your text</Typography>
        <Button variant='contained' color='primary' sx={{mt: 2}} href='/generate'>Get Started</Button>
      </Box>

      <Box sx={{my: 6}}>
        <Typography variant="h4" gutterBottom>Features</Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>Easy Text Input</Typography>
            <Typography>
              Simply input your text and let our software do the rest. 
              Creating flashcards has never been easier.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>Smart Flashcards</Typography>
            <Typography>
              Our AI Intelligently breaks down your text into concise flashcards.
              Perfect for studying!
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>Assessible Anywhere</Typography>
            <Typography>
              Assess your flashcards from any device, at any time. 
              Study on the go with ease!
            </Typography>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{my: 6, textAlign: 'center'}}>
        <Typography variant="h4">Pricing</Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 3, 
                border: '1px solid',
                borderColor: 'grey.300',
                borderRadius: 2,
              }}
            >
              <Typography variant="h5" gutterBottom>Basic</Typography>
              <Typography variant="h6" gutterBottom>$5 / Month</Typography>
              <Typography>
                Access to basic flashcard features and limited storage.
              </Typography>
              <Button variant="contained" color='primary'>Choose Basic</Button>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 3, 
                border: '1px solid',
                borderColor: 'grey.300',
                borderRadius: 2,
              }}
            >
              <Typography variant="h5" gutterBottom>Pro</Typography>
              <Typography variant="h6" gutterBottom>$10 / Month</Typography>
              <Typography>
                Unlimited flashcards and storage, with priority support.
              </Typography>
              <Button variant="contained" color='primary' onClick={handleSubmit}>Choose Pro</Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Container>
  )
}

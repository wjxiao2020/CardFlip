'use client';

import getStripe from "@/utils/get-stripe";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { AppBar, Container, Toolbar, Typography, Button, Box, Grid, Divider, Paper } from "@mui/material";
import Head from 'next/head';
import { useUser } from "@clerk/nextjs";
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import SettingsSuggestRoundedIcon from '@mui/icons-material/SettingsSuggestRounded';
import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded';
import { useState, useEffect } from 'react';

const gradientAnimation = `
  @keyframes gradientAnimation {
    0% { background: linear-gradient(135deg, #4C3CDA 0%, #7A5DDD 50%, #9370DB 100%); }
    50% { background: linear-gradient(135deg, #7A5DDD 0%, #9370DB 50%, #BA55D3 100%); }
    100% { background: linear-gradient(135deg, #4C3CDA 0%, #7A5DDD 50%, #9370DB 100%); }
  }
`;

const loadingAnimation = `
  @keyframes loadingAnimation {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Loading = () => (
  <div className="loading-overlay">
    <div className="loading-spinner"></div>
    <style jsx>{`
      .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
      }
      .loading-spinner {
        width: 50px;
        height: 50px;
        border: 5px solid #FFF;
        border-top: 5px solid #FF6B5A;
        border-radius: 50%;
        animation: loadingAnimation 1s linear infinite;
      }
      ${loadingAnimation}
    `}</style>
  </div>
);

const items = [
  {
    icon: <AutoFixHighRoundedIcon />,
    title: 'Easy Text Input',
    description: 'Simply input your text and let our software do the rest. Creating flashcards has never been easier.',
  },
  {
    icon: <SettingsSuggestRoundedIcon />,
    title: 'Smart Flashcards',
    description: 'Our AI intelligently breaks down your text into concise flashcards. Perfect for studying!',
  },
  {
    icon: <QueryStatsRoundedIcon />,
    title: 'Accessible Anywhere',
    description: 'Access your flashcards from any device, at any time. Study on the go with ease!',
  },
];

const pricingOptions = [
  {
    title: 'Basic',
    price: '$5 / Month',
    description: 'Access to basic flashcard features and limited storage.',
    buttonLabel: 'Choose Basic',
    buttonColor: '#FFA726',
    hoverColor: '#FB8C00',
  },
  {
    title: 'Pro',
    price: '$10 / Month',
    description: 'Unlimited flashcards and storage, with priority support.',
    buttonLabel: 'Choose Pro',
    buttonColor: '#FF6B5A',
    hoverColor: '#E91E63',
  },
];

export default function Home() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async () => {
    setLoading(true);

    if (!isLoaded) {
      return <Loading />;
    }

    if (!isSignedIn) {
      router.push('/sign-in');
    } else {
      const checkoutSession = await fetch('/api/checkout_sessions', {
        method: 'POST',
        headers: {
          origin: 'http://localhost:3000',
        },
      });

      const checkoutSessionJSON = await checkoutSession.json();

      if (checkoutSession.status === 500) {
        console.error(checkoutSession.statusText);
        setLoading(false);
        return;
      }

      const stripe = await getStripe();
      const { error } = await stripe.redirectToCheckout({
        sessionId: checkoutSessionJSON.id,
      });

      if (error) {
        console.warn(error.message);
        setLoading(false);
      }
    }
  };

  const scrollToPricing = () => {
    const pricingSection = document.getElementById('pricing-section');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <Container
      maxWidth='100vw'
      disableGutters
      sx={{
        minHeight: '100vh',
        color: 'white',
        animation: 'gradientAnimation 30s ease infinite',
      }}
    >
      {loading && <Loading />}
      <style jsx global>{gradientAnimation}</style>

      <Head>
        <title>FlipCard</title>
        <meta name='description' content='Create flashcard from your text' />
      </Head>
      <AppBar position="static" elevation={0} sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
        <Toolbar>
          <Image
            src="/cardflip-removebg.png"
            alt="Logo"
            width={400}
            height={150}
            style={{ filter: 'brightness(1.25) contrast(1.5)' }}
          />
          <Typography variant='h6' sx={{ flexGrow: 1, ml: 2 }}></Typography>

          <Button
            sx={{
              mx: 4,
              fontSize: '1.1rem',
              color: 'inherit',
              fontFamily: '"Anton", sans-serif',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              '&:hover': {
                color: '#FF8C00',
              }
            }}
            onClick={scrollToPricing}
          >
            Pricing
          </Button>

          <SignedOut>
            <Button color='inherit' href='/sign-in'>Login</Button>
            <Button color='inherit' href='/sign-up'>Sign Up</Button>
          </SignedOut>
          <SignedIn>
            <Box>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: {
                      width: '35px',
                      height: '35px',
                    },
                  },
                }}
              />
            </Box>
          </SignedIn>
        </Toolbar>
      </AppBar>

      <Box sx={{ textAlign: 'center', mt: 8 }}>
        <Typography variant="h2" gutterBottom>Flip the Script on Learning.</Typography>
        <Typography variant="h5" gutterBottom>AI-powered flashcards, simplified.</Typography>
        <Button
          variant='contained'
          sx={{
            mt: 4,
            backgroundColor: '#FF8C00',
            color: 'white',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            borderRadius: '30px',
            padding: '10px 20px',
            boxShadow: '0px 4px 15px rgba(200, 140, 0, 0.4)',
            transition: 'transform 0.3s ease-in-out',
            '&:hover': {
              backgroundColor: '#FF7000',
              transform: 'scale(1.05)',
            },
          }}
          href='/generate'
        >
          Try it now
        </Button>
      </Box>

      <Box
        sx={{
          pt: { xs: 4, sm: 12 },
          pb: { xs: 8, sm: 16 },
          color: 'white',
          bgcolor: '#06090a',
          textAlign: 'center',
          mt: 16,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: 2,
          padding: 4,
          boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.2)',
        }}
      >
        <Container
          sx={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: { xs: 3, sm: 6 },
          }}
        >
          <Box
            sx={{
              width: { sm: '100%', md: '60%' },
              textAlign: { sm: 'left', md: 'center' },
            }}
          >
            <Typography component="h2" variant="h4" sx={{ fontWeight: 'bold', textShadow: '2px 2px 4px rgba(0,0,0,0.3)', color: 'rgba(255, 255, 255, 0.9)' }}>
              Features
            </Typography>
          </Box>
          <Grid container spacing={2.5} justifyContent="center">
            {items.map((item, index) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                key={index}
                sx={{
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                }}
              >
                <Stack
                  direction="column"
                  color="inherit"
                  component={Card}
                  spacing={1}
                  useFlexGap
                  sx={{
                    p: 3,
                    height: '100%',
                    background: 'transparent',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.2)',
                  }}
                >
                  <Box sx={{ opacity: '50%' }}>{item.icon}</Box>
                  <div>
                    <Typography fontWeight="medium" gutterBottom sx={{ fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.9)' }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 1)' }}>
                      {item.description}
                    </Typography>
                  </div>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Divider sx={{ my: 10, borderColor: 'rgba(255, 255, 255, 0.3)' }} />

      <Box
        id="pricing-section"
        sx={{
          py: { xs: 4, sm: 12 },
          color: 'white',
          bgcolor: '#06090a',
          textAlign: 'center',
          mt: 10,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: 2,
          padding: 4,
          boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.2)',
        }}
      >
        <Container
          sx={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: { xs: 3, sm: 6 },
          }}
        >
          <Box
            sx={{
              width: { sm: '100%', md: '60%' },
              textAlign: { sm: 'left', md: 'center' },
            }}
          >
            <Typography component="h2" variant="h4" sx={{ fontWeight: 'bold', textShadow: '2px 2px 4px rgba(0,0,0,0.3)', color: 'rgba(255, 255, 255, 1)' }}>
              Pricing
            </Typography>
          </Box>
          <Grid container spacing={2.5} justifyContent="center">
            {pricingOptions.map((option, index) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                key={index}
                sx={{
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                }}
              >
                <Stack
                  direction="column"
                  color="inherit"
                  component={Card}
                  spacing={2}
                  sx={{
                    p: 3,
                    height: '100%',
                    background: 'transparent',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.2)',
                  }}
                >
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{
                      fontWeight: 'bold',
                      color: option.title === 'Pro' ? '#FF8A65' : 'rgba(255, 255, 255, 0.9)',
                    }}
                  >
                    {option.title}
                  </Typography>
                  <Typography variant="h6" gutterBottom sx={{ color: 'rgba(255, 255, 255, 1)', fontWeight: 'bold' }}>
                    {option.price}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 1)' }}>
                    {option.description}
                  </Typography>
                  <Button
                    variant="contained"
                    sx={{
                      mt: 2,
                      backgroundColor: option.buttonColor,
                      color: 'white',
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      borderRadius: '15px 50px 30px 5px',
                      padding: '10px 20px',
                      boxShadow: `0px 4px 15px rgba(${option.buttonColor.replace('#', '')}, 0.4)`,
                      transition: 'transform 0.3s ease-in-out, background-color 0.3s ease-in-out',
                      '&:hover': {
                        backgroundColor: option.hoverColor,
                        transform: 'scale(1.05)',
                      },
                    }}
                    onClick={handleSubmit}
                  >
                    {option.buttonLabel}
                  </Button>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box
        sx={{
          bgcolor: '#purple',
          color: 'white',
          textAlign: 'center',
          py: 6,
          mt: 10,
          px: 4,
        }}
      >
        <Container maxWidth="md">
          <Typography variant="body2" sx={{ mt: 4 }}>
            © {new Date().getFullYear()} FlipCard. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Container>
  );
}

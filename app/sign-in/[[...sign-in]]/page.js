import { AppBar, Button, Container, Toolbar, Typography, Box } from "@mui/material";
import Link from 'next/link';
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
    return (
        <Container maxWidth='100vw'>
            <AppBar position="static" sx={{bgcolor: '#3f51b5'}}>
                <Toolbar>
                    <Typography variant="h6" sx={{flexGrow: 1, color: 'white'}}>
                        {/* <Link href='/' passHref> */}
                            Flashcard SaaS
                        {/* </Link> */}
                    </Typography>
                    <Button variant="contained" color='inherit'>
                        <Link href='/sign-in' passHref>
                            Login
                        </Link>
                    </Button>
                    <Button variant="contained" color='inherit'>
                        <Link href='/sign-up' passHref>
                            Sign Up
                        </Link>
                    </Button>
                </Toolbar>
            </AppBar>
            <Box display={'flex'} flexDirection={'column'} alignItems={'center'} justifyContent={'center'}>
                <Typography variant="h4">Sign In</Typography>
                <SignIn/>
            </Box>
        </Container>
    )
}
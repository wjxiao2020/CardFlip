import { AppBar, Button, Container, Toolbar, Typography, Box } from "@mui/material";
import Link from 'next/link';
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
    return (
        <Container maxWidth='100vw'>
            <AppBar position="static" sx={{bgcolor: '#3f51b5'}}>
                <Toolbar>
                    <Typography variant="h6" sx={{flexGrow: 1}}>
                        Flashcard SaaS
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
                <Typography variant="h4">Sign Up</Typography>
                <SignUp/>
            </Box>
        </Container>
    )
}
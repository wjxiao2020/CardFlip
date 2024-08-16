import { Container, CircularProgress, Typography } from '@mui/material'

export default function Loading() {
    return (
        <Container maxWidth='100vw' sx={{textAlign: 'center', mt: 4}}>
            <CircularProgress/>
            <Typography variant="h6">Loading...</Typography>
        </Container>
    )
}
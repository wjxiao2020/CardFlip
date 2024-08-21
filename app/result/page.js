'use client'

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Container, Typography, Box } from "@mui/material"
import Loading from "../components/loading"
import Link from 'next/link';


const ResultPage = () => {
    const searchParams = useSearchParams()
    const session_id = searchParams.get('session_id')

    const [loading, setLoading] = useState(true)
    const [session, setSession] = useState(null)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchCheckoutSession = async() => {
            if (!session_id) {
                return
            }

            try {
                const res = await fetch(`/api/checkout_sessions?session_id=${session_id}`)
                const sessionData = await res.json()
                if (res.ok) {
                    setSession(sessionData)
                } else {
                    setError(sessionData.error)
                }
            } catch(err) {
                setError('An error occurred')
            } finally {
                setLoading(false)
            }
        }

        fetchCheckoutSession()
    }, [session_id])

    if (loading) {
        return (
            <Loading />
        )
    }

    if (error) {
        return (
            <Container maxWidth='100vw' sx={{textAlign: 'center', mt: 4}}>
                <Typography variant="h6">{error}</Typography>
            </Container>
        )
    }
    return (
        <Box sx={{m: 5}}>
            <Link href='/' passhref style={{textDecoration: "none", color: 'black'}}>
                <Typography variant="body1"> &lt; Back</Typography>
            </Link>
        <Container maxWidth='100vw' sx={{textAlign: 'center', mt: 4}}>
            {session.payment_status === 'paid' 
                ? (
                    <Box>
                       <Typography variant="h4">Thank you for purchasing!</Typography>
                        <Box sx={{mt: 22}}>
                            <Typography variant="body1">
                                We have received your payment. You will receive an email with the order detail shortly.
                            </Typography>
                        </Box> 
                    </Box>
                ) 
                : (
                    <Box>
                        <Typography variant="h4">Payment Failed</Typography>
                        <Box sx={{mt: 22}}>
                            <Typography variant="body1">
                                Your payment was not successful. Please try again.
                            </Typography>
                        </Box> 
                    </Box>
                )
            }
        </Container>
        </Box>
    )
}

export default ResultPage
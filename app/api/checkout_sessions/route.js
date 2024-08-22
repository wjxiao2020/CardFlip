import { NextResponse } from "next/server";
import { Stripe } from 'stripe';
import { firestore } from '../../../firebase/config';
import { doc, setDoc } from 'firebase/firestore';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// assumes USD
const formatAmountForStripe = (amount) => {
    return Math.round(amount * 100)
}



export async function GET(req) {
    const searchParams = req.nextUrl.searchParams
    const session_id = searchParams.get('session_id')

    try {
        const checkoutSession = await stripe.checkout.sessions.retrieve(session_id)
        return NextResponse.json(checkoutSession)
    } catch(err) {
        console.error('Error retrieving checkout session: ', err)
        return NextResponse.json({error: {message: err.message}}, {status: 500})
    }
}

export async function POST(req) {

    const { plan, email, userId } = await req.json();
    const plan_pro_id = "price_1PqhoOA1IcBdLY74zQjNm2BT"
    const plan_basic_id = "price_1PqhoDA1IcBdLY74b3W53WsV"
    const priceId = plan === 'pro' ? plan_pro_id : plan_basic_id;

    const params = {
        mode: 'subscription',
        payment_method_types: ['card'],
        customer_email: email,
        line_items: [
            {
                price: priceId,
                quantity: 1,
            },
        ],
        success_url: `${req.headers.get('origin')}/result?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.get('origin')}/result?session_id={CHECKOUT_SESSION_ID}`,
    };

    // const params = {
    //     mode: 'subscription',
    //     payment_method_types: ['card'],
    //     line_items: [
    //         {
    //             price_data: {
    //                 currency: 'usd',
    //                 product_data: {
    //                     name: 'Pro Subscription'
    //                 },
    //                 unit_amount: formatAmountForStripe(req.headers.get('amount')),
    //                 recurring: {
    //                     interval: 'month',
    //                     interval_count: 1,
    //                 },
    //             },
    //             quantity: 1,
    //         },
    //     ],
    //     success_url: `${req.headers.get('origin')}/result?session_id={CHECKOUT_SESSION_ID}`,
    //     cancel_url: `${req.headers.get('origin')}/result?session_id={CHECKOUT_SESSION_ID}`,
    // }
    try {
        const checkoutSession = await stripe.checkout.sessions.create(params);
        const userRef = doc(firestore, 'users', userId);
        await setDoc(userRef, { subscriptionType: plan }, { merge: true });
        return NextResponse.json(checkoutSession, { status: 200 });
    } catch (err) {
        console.error('Error creating checkout session: ', err);
        return NextResponse.json({ error: { message: err.message } }, { status: 500 });
    }
}


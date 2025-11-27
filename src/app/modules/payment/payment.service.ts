import Stripe from "stripe";


const handleStripeWebhookEvent = async (event: Stripe.Event) => {

};

export const PaymentService = {
  handleStripeWebhookEvent
}
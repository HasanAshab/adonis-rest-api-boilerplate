import { Schema, Document } from "mongoose";
import Config from "Config";
import Stripe from "stripe";
import URL from "URL";


export interface BillableDocument extends Document {
  stripeId: string;
  getOrCreateStripeCustomer(): Promise<Stripe.Customer>;
  updateStripeCustomer(data: Stripe.CustomerUpdateParams): Promise<Stripe.Customer>;
  addCard(card: Stripe.TokenCreateParams.Card): Promise<Stripe.CustomerSource>;
  charge(amount: number, currency?: string, description?: string): Promise<Stripe.Charge>;
  pay(amount: number, currency?: string, description?: string): Promise<Stripe.PaymentIntent>;
}

export default (schema: Schema) => {
  const stripe = new Stripe(Config.get<any>("stripe.key"), {
    apiVersion: '2022-11-15',
  });

  const assertCustomerExists = function (this: any) {
    if (this.stripeId === null) {
      throw new Error(`This user is not a customer [${this}]`);
    }
  };

  schema.add({
    stripeId: {
      type: String,
      nullable: true,
    },
  });

  schema.methods.getStripeCustomer = async function () {
    if (this.stripeId !== null) {
      return await stripe.customers.retrieve(this.stripeId);
    }

    const customer = await stripe.customers.create();
    this.stripeId = customer.id;
    await this.save();
    return customer;
  };

  schema.methods.updateStripeCustomer = function (data: Stripe.CustomerUpdateParams) {
    assertCustomerExists.call(this);
    return stripe.customers.update(this.stripeId, data);
  };

  schema.methods.addCard = async function (card: Stripe.TokenCreateParams.Card) {
    assertCustomerExists.call(this);
    const token = await stripe.tokens.create({ card });
    return await stripe.customers.createSource(this.stripeId, { source: token.id });
  };

  schema.methods.charge = function (amount: number, currency = "usd", description?: string) {
    assertCustomerExists.call(this);
    return stripe.charges.create({
      customer: this.stripeId,
      amount: amount * 100,
      currency,
      description,
    });
  };

  schema.methods.pay = function (amount: number, currency = "usd", description?: string) {
    assertCustomerExists.call(this);
    return stripe.paymentIntents.create({
      amount: amount * 100,
      currency,
      customer: this.stripeId,
      confirm: true,
    });
  };
};

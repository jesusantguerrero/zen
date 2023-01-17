const { default: ApiContext } = require("./apiContext");
const { default: Subscription } = require("./subscription");

exports.default = class PaypalClient
{
    authContext = "";
    subscription = "";
    constructor(settings) {
        this.authContext = new ApiContext(settings);
        this.subscription = new Subscription(this.authContext, settings);
    }

    suspend(subscriptionId) {
        return this.subscription .suspend(subscriptionId)
    }
    
    reactive(subscriptionId) {
        return this.subscription.activate(subscriptionId)
    }
    
    cancel(subscriptionId) {
        return this.subscription.cancel(subscriptionId)
    }
    
    upgrade (subscriptionId) {
        return this.subscription.upgrade(subscriptionId) 
    }
    
    get(subscriptionId) {
        return this.subscription.get(subscriptionId)
    }

    invoices(subscriptionId) {
        return this.subscription.transactions(subscriptionId)
    }
}

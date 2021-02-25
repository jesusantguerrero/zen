exports.default = class PaypalClient
{
    constructor(settings) {
        this.client = new ApiContext(settings);
        this.subscription = new Subscription(this.client);
    }


    suspend(subscriptionId) {
        return this.subscription.suspend(subscriptionId)
    }
    
    reactive(subscriptionId) {
        return this.subscription.activate(subscriptionId)
    }
    
    cancel(subscriptionId) {
        return this.subscription.cancel(subscriptionId)
    }
    
    upgrade () {
        return this.subscription.upgrade(subscriptionId)
        
    }
    
    invoices() {
        return this.subscription.transactions(subscriptionId)
    }
}
